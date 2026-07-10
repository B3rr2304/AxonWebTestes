"""
Relatórios narrativos periódicos (semanal/mensal).

Coleta métricas já calculadas do período (daily_task_stats, consistência de
rotinas, tarefas chave) e pede ao Claude só a tradução em uma narrativa em
texto — mesma filosofia do correlations_service: o backend faz a
matemática, o Claude só escreve. Salva em `weekly_reports` (Migration 19),
com no máximo um relatório por usuário/tipo/período (índice único + upsert
idempotente).

Disparado pelo planning_scheduler: todo domingo 20h local (semanal, cobre a
própria semana que está terminando, segunda a domingo) e todo último dia do
mês 20h local (mensal, cobre o próprio mês que está terminando, dia 1 até o
último dia). Em ambos os casos o ÚLTIMO dia do período é o dia da geração —
ainda não tem snapshot congelado (isso só acontece à meia-noite), então é
calculado ao vivo (ver `daily_stats_service.live_day_stats`).

Cada relatório só fica visível (`GET /dashboard/reports`) numa janela: do
horário de geração (20h do último dia do período) até meio-dia do dia
seguinte — ver `is_within_visibility_window`.
"""

import json
from datetime import date, datetime, time, timedelta

from database import supabase
from services import claude_service, daily_stats_service, routines_service
from services import user_tz as user_tz_service

# Horário local em que o relatório é gerado e passa a ficar visível.
VISIBILITY_START_HOUR = 20
# Horário local (do dia seguinte ao fim do período) em que o relatório deixa
# de ficar visível.
VISIBILITY_END_HOUR = 12

_NARRATOR_SYSTEM_PROMPT = """Você é o Axon, assistente pessoal de produtividade. Você recebe um resumo \
JÁ CALCULADO (o backend fez a matemática) do desempenho do usuário num período encerrado (semana ou mês).

Sua ÚNICA tarefa é escrever UM parágrafo corrido (3 a 5 frases), em português do Brasil, tom de parceiro \
próximo e direto, primeira pessoa do Axon falando com o usuário — resumindo o período e destacando o que \
mais se destacou (positivo ou a melhorar). Regras estritas:
- NUNCA invente ou altere números; use exatamente os valores fornecidos.
- NÃO liste os dados como lista/bullets — escreva em prosa, um parágrafo só.
- NÃO use jargão técnico (não diga "score", "rate", "array", "json" etc.).
- Se algum dado vier vazio, nulo ou zerado (ex.: sem rotinas ativas, sem tarefa chave definida), \
simplesmente não mencione esse ponto — não force um comentário sobre ele.

Responda APENAS com o parágrafo, sem título, sem aspas, sem markdown."""


def _period_summary_message(data: dict) -> str:
    return (
        "Aqui está o resumo do período (já calculado, não altere os números). "
        "Escreva a narrativa a partir dele.\n\n"
        + json.dumps(data, ensure_ascii=False, indent=2)
    )


def _most_productive_day(snapshots: list[dict]) -> dict | None:
    if not snapshots:
        return None
    top = max(snapshots, key=lambda s: (s["completion_rate"], s["completed_tasks"]))
    return {"date": top["date"], "completion_rate": top["completion_rate"]}


def _key_task_stats(user_id: str, start: date, end: date) -> dict:
    res = (
        supabase.table("tasks")
        .select("status")
        .eq("user_id", user_id)
        .eq("is_key_task", True)
        .gte("scheduled_date", str(start))
        .lte("scheduled_date", str(end))
        .execute()
    )
    rows = res.data or []
    done = sum(1 for row in rows if row.get("status") == "done")
    return {"defined": len(rows), "done": done}


def _collect_period_data(user_id: str, start: date, end: date, tz_name: str) -> dict:
    # `end` é sempre o dia da geração (ver docstring do módulo): ainda sem
    # snapshot congelado. Os dias anteriores vêm do snapshot; `end` é
    # calculado ao vivo e só entra na média se tiver algo agendado (mesma
    # regra que snapshot_days usa para não congelar dias vazios).
    frozen_end = end - timedelta(days=1)
    snapshots = (
        daily_stats_service.get_range(user_id, str(start), str(frozen_end))
        if frozen_end >= start else []
    )

    live_today = daily_stats_service.live_day_stats(user_id, end, tz_name)
    if live_today["total"] > 0:
        snapshots = snapshots + [live_today]

    avg_completion_rate = (
        round(sum(s["completion_rate"] for s in snapshots) / len(snapshots))
        if snapshots else 0
    )

    return {
        "period_start": str(start),
        "period_end": str(end),
        "avg_completion_rate": avg_completion_rate,
        "most_productive_day": _most_productive_day(snapshots),
        "routine_consistency": routines_service.consistency_for_range(user_id, start, end),
        "key_tasks": _key_task_stats(user_id, start, end),
    }


def _generate_report(user_id: str, period_type: str, start: date, end: date, tz_name: str) -> dict:
    data = _collect_period_data(user_id, start, end, tz_name)

    narrative = claude_service.call_chat(
        messages=[{"role": "user", "content": _period_summary_message(data)}],
        system_prompt=_NARRATOR_SYSTEM_PROMPT,
    ).strip()

    payload = {
        "user_id": user_id,
        "period_type": period_type,
        "period_start": str(start),
        "period_end": str(end),
        "data": data,
        "narrative": narrative,
    }

    res = (
        supabase.table("weekly_reports")
        .upsert(payload, on_conflict="user_id,period_type,period_start")
        .execute()
    )
    return (res.data or [payload])[0]


def generate_weekly_report(user_id: str, tz_name: str) -> dict:
    """Gera o relatório da própria semana que está terminando hoje (segunda a domingo)."""
    today = datetime.now(user_tz_service.zone(tz_name)).date()
    period_start = today - timedelta(days=today.weekday())
    period_end = today
    return _generate_report(user_id, "weekly", period_start, period_end, tz_name)


def generate_monthly_report(user_id: str, tz_name: str) -> dict:
    """Gera o relatório do próprio mês calendário que está terminando hoje."""
    today = datetime.now(user_tz_service.zone(tz_name)).date()
    period_start = today.replace(day=1)
    period_end = today
    return _generate_report(user_id, "monthly", period_start, period_end, tz_name)


def is_within_visibility_window(period_end: date, tz_name: str) -> bool:
    """
    True enquanto o relatório cujo período termina em `period_end` deve ficar
    visível: de VISIBILITY_START_HOUR do próprio period_end (quando é gerado)
    até VISIBILITY_END_HOUR do dia seguinte.
    """
    tz = user_tz_service.zone(tz_name)
    now = datetime.now(tz)
    window_start = datetime.combine(period_end, time(hour=VISIBILITY_START_HOUR), tzinfo=tz)
    window_end = datetime.combine(
        period_end + timedelta(days=1), time(hour=VISIBILITY_END_HOUR), tzinfo=tz
    )
    return window_start <= now <= window_end
