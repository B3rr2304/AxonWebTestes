"""
Análise inteligente de rotina para geração de notificações.

Fluxo:
  1. Verifica cooldown de 6h (should_analyze)
  2. Carrega contexto do usuário (tarefas, blocos, memórias, histórico)
  3. Filtro de regras baratas para decidir se vale chamar o Claude
  4. Claude analisa e decide se envia notificação + gera conteúdo
  5. Persiste e retorna a notificação criada (ou None)
"""

import os
import json
from datetime import date, datetime, timezone

import anthropic

from database import supabase
from services import notification_service, tasks_service, memory_service
from services import chronotype as chronotype_service

_MODEL = "claude-sonnet-4-6"


def _parse_json(raw: str) -> dict:
    """
    Extrai JSON da resposta do Claude, tolerando markdown fences (```json ... ```)
    e qualquer texto antes/depois. Pega do primeiro { ao último }.
    """
    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise ValueError("Nenhum JSON encontrado na resposta")
    return json.loads(raw[start : end + 1])

_CURVE_KEY = {
    "Matutino": "morning", "Vespertino": "evening", "Noturno": "night",
    "Misto": "intermediate", "Bimodal": "bimodal",
    "morning": "morning", "evening": "evening",
    "night": "night", "intermediate": "intermediate", "bimodal": "bimodal",
}

# Blocos que indicam horário ruim para atividades cognitivas ou físicas intensas
_BAD_BLOCKS = {"sono", "recuperacao"}
# Blocos adequados para sugerir como alternativa
_GOOD_BLOCKS = {"foco_moderado", "foco_profundo", "pico"}

# Máximo de simples por dia na fase de testes
_MAX_SIMPLE_PER_DAY = 3


def _load_user_context(user_id: str) -> dict:
    """Carrega dados necessários para a análise."""
    profile_res = (
        supabase.table("profiles")
        .select("name, chronotype")
        .eq("id", user_id)
        .single()
        .execute()
    )
    profile = profile_res.data or {}
    chronotype = profile.get("chronotype", "intermediate")
    curve_key = _CURVE_KEY.get(chronotype, "intermediate")

    hour = datetime.now(timezone.utc).hour
    block_idx = (hour * 60) // 90
    blocks = chronotype_service.CHRONOTYPE_BLOCKS.get(
        curve_key, chronotype_service.CHRONOTYPE_BLOCKS["intermediate"]
    )

    today = str(date.today())
    tasks = tasks_service.list_tasks(user_id, scheduled_date=today)
    tomorrow_tasks = tasks_service.list_tasks(
        user_id, scheduled_date=str(date.fromordinal(date.today().toordinal() + 1))
    )
    memories = memory_service.load_memories(user_id)
    recent_notifs = notification_service.get_recent_notifications(user_id, hours=72)

    return {
        "user_name": profile.get("name", "usuário"),
        "chronotype": chronotype,
        "curve_key": curve_key,
        "blocks": blocks,
        "current_block_idx": block_idx,
        "tasks_today": tasks,
        "tasks_tomorrow": tomorrow_tasks,
        "memories": memories,
        "recent_notifications": recent_notifs,
        "today": today,
    }


def _find_good_slot(blocks: list, busy_times: set[str]) -> tuple[int, str] | None:
    """
    Encontra o próximo bloco de foco adequado que não conflita com tarefas existentes.
    Retorna (block_idx, start_time) ou None.
    """
    for i, (level, _) in enumerate(blocks):
        if level not in _GOOD_BLOCKS:
            continue
        start_min = i * 90
        start_time = f"{start_min // 60:02d}:{start_min % 60:02d}"
        if start_time not in busy_times:
            return i, start_time
    return None


def _has_tasks_in_bad_blocks(tasks: list, blocks: list) -> list[dict]:
    """Retorna tarefas agendadas em blocos de sono ou recuperação."""
    bad = []
    for task in tasks:
        if not task.get("start_time"):
            continue
        t = task["start_time"][:5]
        h, m = int(t[:2]), int(t[3:])
        block_idx = (h * 60 + m) // 90
        if block_idx < len(blocks):
            level, _ = blocks[block_idx]
            if level in _BAD_BLOCKS:
                bad.append({**task, "_block_level": level})
    return bad


def _apply_rule_filter(ctx: dict) -> dict:
    """
    Aplica regras baratas para identificar candidatos de notificação.
    Retorna dict com flags do que foi detectado.
    """
    tasks_today = ctx["tasks_today"]
    blocks = ctx["blocks"]

    done = [t for t in tasks_today if t.get("status") == "done"]
    todo = [t for t in tasks_today if t.get("status") in ("todo", "progress")]
    bad_block_tasks = _has_tasks_in_bad_blocks(
        ctx["tasks_today"] + ctx["tasks_tomorrow"], blocks
    )

    return {
        "has_tasks_today": len(tasks_today) > 0,
        "all_done": len(tasks_today) > 0 and len(todo) == 0,
        "none_started": len(tasks_today) > 0 and len(done) == 0,
        "no_tasks_today": len(tasks_today) == 0,
        "bad_block_tasks": bad_block_tasks,
        "has_improvement_candidate": len(bad_block_tasks) > 0,
        # consecutive_rejections é preenchido no caller (analyze_and_notify)
        "consecutive_rejections": 0,
    }


def _build_analysis_prompt(ctx: dict, flags: dict) -> str:
    blocks_summary = []
    for i, (level, desc) in enumerate(ctx["blocks"]):
        start_min = i * 90
        start = f"{start_min // 60:02d}:{start_min % 60:02d}"
        end_min = (i + 1) * 90
        end = f"{(end_min % 1440) // 60:02d}:{end_min % 60:02d}"
        blocks_summary.append(f"  {start}-{end}: {level} — {desc[:60]}")

    busy_times = {
        t["start_time"][:5]
        for t in (ctx["tasks_today"] + ctx["tasks_tomorrow"])
        if t.get("start_time")
    }

    good_slot = _find_good_slot(ctx["blocks"], busy_times)
    good_slot_str = (
        f"{good_slot[1]}" if good_slot else "nenhum horário livre disponível hoje"
    )

    return f"""Você é o Axon, assistente de produtividade pessoal. Analise a situação do usuário e decida se deve enviar uma notificação.

USUÁRIO: {ctx['user_name']}
CRONOTIPO: {ctx['chronotype']}
HORA ATUAL: {datetime.now(timezone.utc).strftime('%H:%M')} UTC
DATA: {ctx['today']}

TAREFAS DE HOJE ({len(ctx['tasks_today'])} total):
{json.dumps([{'id': t['id'], 'title': t['title'], 'status': t['status'], 'start_time': t.get('start_time'), 'task_type': t['task_type']} for t in ctx['tasks_today']], ensure_ascii=False, indent=2)}

TAREFAS DE AMANHÃ ({len(ctx['tasks_tomorrow'])} total):
{json.dumps([{'id': t['id'], 'title': t['title'], 'start_time': t.get('start_time'), 'task_type': t['task_type']} for t in ctx['tasks_tomorrow']], ensure_ascii=False, indent=2)}

BLOCOS DE FOCO DO DIA (cronotipo {ctx['chronotype']}):
{chr(10).join(blocks_summary)}

MELHOR HORÁRIO LIVRE DISPONÍVEL: {good_slot_str}

TAREFAS EM HORÁRIOS INADEQUADOS: {json.dumps([{'title': t['title'], 'start_time': t.get('start_time'), 'block': t['_block_level']} for t in flags['bad_block_tasks']], ensure_ascii=False)}

NOTIFICAÇÕES RECENTES (evite repetir):
{json.dumps([{'type': n['type'], 'title': n['title'], 'status': n['status']} for n in ctx['recent_notifications']], ensure_ascii=False, indent=2)}

MEMÓRIAS DO USUÁRIO:
{json.dumps(ctx['memories'], ensure_ascii=False)}

SITUAÇÃO DETECTADA:
- Todas as tarefas concluídas hoje: {flags['all_done']}
- Nenhuma tarefa iniciada hoje: {flags['none_started']}
- Sem tarefas para hoje: {flags['no_tasks_today']}
- Tarefas em horários inadequados: {len(flags['bad_block_tasks'])}
- Rejeições consecutivas de melhorias: {flags['consecutive_rejections']}

INSTRUÇÕES:
1. Decida se alguma notificação é genuinamente útil agora. Prefira NÃO notificar se não houver algo relevante.
2. Para 'simple': use quando houver algo concreto a celebrar ou incentivar (max 3/dia já considera o histórico).
3. Para 'improvement': sugira APENAS se houver tarefa em bloco inadequado E houver horário melhor disponível. Explique claramente o porquê e o benefício.
4. Para 'change': use apenas após uma alteração ter sido feita (não se aplica aqui).
5. Se rejeições consecutivas > 5, seja muito mais seletivo com 'improvement'.

RETORNE APENAS JSON VÁLIDO (sem markdown, sem texto extra):
{{
  "should_notify": true ou false,
  "type": "simple" ou "improvement",
  "title": "título curto da notificação",
  "body": "texto personalizado da notificação (2-3 frases)",
  "action": {{
    "task_id": "uuid da tarefa a ser alterada",
    "new_date": "YYYY-MM-DD ou null",
    "new_start_time": "HH:MM ou null",
    "new_end_time": "HH:MM ou null",
    "reason": "explicação breve do motivo"
  }}
}}

O campo "action" só é necessário para type="improvement". Para type="simple", omita-o ou envie null.
Se should_notify=false, os outros campos podem ser strings vazias."""


def analyze_and_notify(user_id: str) -> dict | None:
    """
    Analisa a rotina do usuário e cria uma notificação se necessário.

    Dois caminhos com gatilhos independentes:
    - improvement: REAGE a tarefas em blocos ruins mesmo dentro do cooldown de 6h,
      mas só se não houver outra melhoria ainda não resolvida (evita spam).
    - simple: respeita o cooldown de 6h (análise periódica de incentivo/celebração).

    Retorna a notificação criada ou None.
    """
    ctx = _load_user_context(user_id)
    flags = _apply_rule_filter(ctx)
    flags["consecutive_rejections"] = notification_service.count_consecutive_rejections(user_id)

    cooldown_elapsed = notification_service.should_analyze(user_id)
    simple_today = notification_service.count_today(user_id, "simple")

    # Já existe uma melhoria pendente (não resolvida)? Não cria outra.
    has_pending_improvement = any(
        n["type"] == "improvement" and n["status"] in ("unread", "read")
        for n in ctx["recent_notifications"]
    )

    improvement_eligible = flags["has_improvement_candidate"] and not has_pending_improvement
    simple_candidate = flags["all_done"] or flags["none_started"] or flags["no_tasks_today"]
    simple_eligible = cooldown_elapsed and simple_candidate and simple_today < _MAX_SIMPLE_PER_DAY

    # Nada elegível → registra o cooldown apenas se era uma checagem periódica
    if not improvement_eligible and not simple_eligible:
        if cooldown_elapsed:
            notification_service.update_analyzed_at(user_id)
        return None

    # Chama Claude para análise
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    prompt = _build_analysis_prompt(ctx, flags)

    try:
        response = client.messages.create(
            model=_MODEL,
            max_tokens=512,
            messages=[{"role": "user", "content": prompt}],
        )
        result = _parse_json(response.content[0].text)
    except Exception:
        if cooldown_elapsed:
            notification_service.update_analyzed_at(user_id)
        return None

    # Registra o cooldown sempre que fizemos uma análise periódica
    if cooldown_elapsed:
        notification_service.update_analyzed_at(user_id)

    if not result.get("should_notify"):
        return None

    notif_type = result.get("type")

    # Respeita as restrições por tipo
    if notif_type == "simple" and not simple_eligible:
        return None
    if notif_type == "improvement" and not improvement_eligible:
        return None

    action = result.get("action") if notif_type == "improvement" else None
    if action and not action.get("task_id"):
        action = None
    # Melhoria sem ação executável não faz sentido (não dá para aceitar)
    if notif_type == "improvement" and not action:
        return None

    notif = notification_service.create_notification(
        user_id=user_id,
        notif_type=notif_type,
        title=result.get("title", "Axon"),
        body=result.get("body", ""),
        action=action,
    )
    return notif


def generate_change_notification(
    user_id: str,
    task_title: str,
    old_time: str | None,
    new_time: str | None,
    reason: str | None,
) -> dict:
    """
    Gera e persiste uma notificação de alteração após uma melhoria aceita.
    Claude escreve o texto explicando o que mudou e por quê.
    """
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    prompt = f"""Gere uma notificação curta e amigável informando que o Axon alterou um horário de tarefa com autorização do usuário.

Tarefa: {task_title}
Horário anterior: {old_time or 'não definido'}
Novo horário: {new_time or 'não definido'}
Motivo: {reason or 'melhor adequação ao cronotipo do usuário'}

Retorne APENAS JSON válido:
{{"title": "título curto", "body": "2 frases explicando o que mudou e por quê"}}"""

    try:
        response = client.messages.create(
            model=_MODEL,
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}],
        )
        data = _parse_json(response.content[0].text)
        title = data.get("title", "Axon atualizou sua agenda")
        body = data.get("body", f"O horário de '{task_title}' foi ajustado.")
    except Exception:
        title = "Axon atualizou sua agenda"
        body = f"O horário de '{task_title}' foi ajustado para {new_time} conforme sugerido."

    return notification_service.create_notification(
        user_id=user_id,
        notif_type="change",
        title=title,
        body=body,
    )
