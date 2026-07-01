"""
Snapshot diário congelado de conclusão de tarefas.

Problema que resolve
--------------------
O carry-forward move as tarefas pendentes de ontem para hoje reescrevendo o
`scheduled_date`. Isso apagava o histórico: um dia passado ficava só com as
tarefas concluídas + eventos (auto-concluídos após o término), gerando um
falso 100% de conclusão em TODO dia anterior — tanto no Planning quanto no
Insights (que recalculavam a % ao vivo a partir de linhas mutáveis).

Correção
--------
No fim de cada dia local do usuário, congelamos os números REAIS daquele dia
(incluindo as pendentes que estão prestes a ser carregadas) numa linha de
`daily_task_stats`. Dias passados leem o snapshot; só "hoje" é calculado ao
vivo. O gancho é o fim do dia por fuso: o scheduler dispara `reconcile()`
logo após a meia-noite local (ver planning_scheduler). `reconcile` é
idempotente e gap-aware: uma única execução recupera dias perdidos (servidor
fora do ar numa virada), congelando cada dia faltante antes de carregar.

A definição de "concluído" é idêntica à do frontend (Planning.tsx):
  - evento  → status 'done' OU horário de término já passou;
  - tarefa com subtarefas → fração concluída (3/5 = 0.6);
  - tarefa sem subtarefas → 1 se status 'done', senão 0.
"""

import math
from collections import defaultdict
from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from database import supabase
from services import tasks_service
from services import user_tz as user_tz_service

# Não faz backfill ilimitado quando o usuário fica dias sem abrir o app ou o
# servidor fica fora do ar numa virada de dia. Cobre a janela de "mês" do
# Insights (30 dias) com folga.
MAX_BACKFILL_DAYS = 35


# ── Definição de "concluído" (espelha Planning.tsx) ─────────────────────────

def _end_datetime(task: dict, tz: ZoneInfo) -> datetime | None:
    """Momento de término do evento (end_date/scheduled_date + end/start/23:59)."""
    end_iso = task.get("end_date") or task.get("scheduled_date")
    if not end_iso:
        return None
    hhmm = (task.get("end_time") or task.get("start_time") or "23:59")[:5]
    try:
        hh, mm = map(int, hhmm.split(":"))
        base = datetime.fromisoformat(str(end_iso))
        return base.replace(hour=hh, minute=mm, second=0, microsecond=0, tzinfo=tz)
    except Exception:
        return None


def _event_completed(task: dict, ref_now: datetime, tz: ZoneInfo) -> bool:
    if task.get("status") == "done":
        return True
    end_dt = _end_datetime(task, tz)
    return end_dt is not None and ref_now >= end_dt


def _task_on_date(task: dict, day: date) -> bool:
    """Réplica de isTaskOnDate: evento multi-dia cobre o intervalo; resto = dia exato."""
    sched = task.get("scheduled_date")
    if not sched:
        return False
    start = str(sched)
    iso = str(day)
    if task.get("task_type") == "event" and task.get("end_date"):
        return start <= iso <= str(task["end_date"])
    return iso == start


def _day_stats(
    day: date,
    tasks: list[dict],
    subs_by_task: dict[str, list[dict]],
    ref_now: datetime,
    tz: ZoneInfo,
) -> dict:
    """Estatística congelada de um dia. `ref_now` = fim do dia (início do dia+1)."""
    actionable = [t for t in tasks if _task_on_date(t, day)]
    total = len(actionable)
    completed_score = 0.0
    completed_items = 0
    carried_forward = 0
    # Tarefas concluídas por ESFORÇO (status 'done'): exclui eventos que só
    # auto-concluem ao passar do horário. É a métrica de produtividade do
    # Insights ("dia mais produtivo"), diferente de completed_items — que
    # inclui eventos e alimenta o anel de adesão do Planning.
    completed_tasks = 0

    for t in actionable:
        if (t.get("carry_count") or 0) > 0:
            carried_forward += 1
        if t.get("status") == "done":
            completed_tasks += 1

        if t.get("task_type") == "event":
            if _event_completed(t, ref_now, tz):
                completed_score += 1
                completed_items += 1
            continue

        subs = subs_by_task.get(t["id"])
        if subs:
            done = sum(1 for s in subs if s.get("done"))
            completed_score += done / len(subs)
            if done == len(subs):
                completed_items += 1
            continue

        if t.get("status") == "done":
            completed_score += 1
            completed_items += 1

    # Math.floor(x + 0.5) reproduz o Math.round do frontend (arredonda .5 para
    # cima). O round() do Python usa banker's rounding e faria a % pular 1
    # ponto quando o dia deixa de ser "hoje" (ao vivo) e vira snapshot.
    rate = math.floor(completed_score / total * 100 + 0.5) if total else 0
    return {
        "date": str(day),
        "total": total,
        "completed_items": completed_items,
        "completed_tasks": completed_tasks,
        "completed_score": round(completed_score, 4),
        "completion_rate": rate,
        "carried_forward": carried_forward,
    }


# ── Persistência ────────────────────────────────────────────────────────────

def _fetch(user_id: str) -> tuple[list[dict], dict[str, list[dict]]]:
    tasks = (
        supabase.table("tasks")
        .select(
            "id, task_type, status, scheduled_date, end_date, "
            "start_time, end_time, carry_count"
        )
        .eq("user_id", user_id)
        .execute()
    ).data or []
    subs = (
        supabase.table("subtasks")
        .select("task_id, done")
        .eq("user_id", user_id)
        .execute()
    ).data or []
    by_task: dict[str, list[dict]] = defaultdict(list)
    for s in subs:
        by_task[s["task_id"]].append(s)
    return tasks, by_task


def _last_snapshot_date(user_id: str) -> date | None:
    res = (
        supabase.table("daily_task_stats")
        .select("date")
        .eq("user_id", user_id)
        .order("date", desc=True)
        .limit(1)
        .execute()
    )
    if res.data:
        return date.fromisoformat(str(res.data[0]["date"]))
    return None


def snapshot_days(user_id: str, days: list[date], tz_name: str) -> None:
    """Congela cada dia da lista. Dias sem tarefas não geram linha."""
    if not days:
        return
    tz = user_tz_service.zone(tz_name)
    tasks, subs_by_task = _fetch(user_id)

    rows = []
    for d in days:
        # Referência = fim do dia local = início do dia seguinte.
        ref_now = datetime.combine(d + timedelta(days=1), time.min, tzinfo=tz)
        stats = _day_stats(d, tasks, subs_by_task, ref_now, tz)
        if stats["total"] == 0:
            continue  # nada agendado — nada a congelar
        rows.append({"user_id": user_id, **stats})

    if rows:
        supabase.table("daily_task_stats").upsert(
            rows, on_conflict="user_id,date"
        ).execute()


def reconcile(user_id: str, tz_name: str, local_today: date) -> list[dict]:
    """
    Congela os dias passados ainda não snapshotados e carrega as pendentes.
    Idempotente e gap-aware. Retorna as tarefas efetivamente carregadas.
    """
    yesterday = local_today - timedelta(days=1)
    last = _last_snapshot_date(user_id)

    if last is None:
        # Primeira execução: NÃO reconstruir dias passados. As pendentes deles
        # já foram carregadas historicamente (scheduled_date destruído), então
        # um snapshot agora congelaria o falso 100%. Começamos a congelar a
        # partir da próxima virada — cada dia é snapshotado enquanto ainda
        # tem suas pendentes. Aqui só carregamos as pendentes.
        start = local_today
    else:
        # Recuperação de gap (downtime numa virada): o carry também não rodou,
        # então as pendentes ainda estão em seus dias → snapshot é fiel.
        # Cap evita loop gigante se o último snapshot for muito antigo.
        start = max(
            last + timedelta(days=1),
            yesterday - timedelta(days=MAX_BACKFILL_DAYS),
        )

    if start <= yesterday:
        days = [start + timedelta(days=i) for i in range((yesterday - start).days + 1)]
        snapshot_days(user_id, days, tz_name)

    # Só depois de congelar o histórico movemos as pendentes para hoje.
    return tasks_service.carry_forward_tasks(user_id, today=local_today)


def get_range(user_id: str, start_iso: str, end_iso: str) -> list[dict]:
    """Snapshots congelados no intervalo [start, end] (inclusivo), ordenados."""
    res = (
        supabase.table("daily_task_stats")
        .select(
            "date, total, completed_items, completed_tasks, "
            "completion_rate, carried_forward"
        )
        .eq("user_id", user_id)
        .gte("date", start_iso)
        .lte("date", end_iso)
        .order("date", desc=False)
        .execute()
    )
    out = []
    for r in res.data or []:
        r["date"] = str(r["date"])
        out.append(r)
    return out
