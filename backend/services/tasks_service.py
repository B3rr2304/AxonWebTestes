"""
Lógica de CRUD de tarefas (tabela `tasks`) isolada do router HTTP.

Tanto os endpoints de routers/tasks.py quanto o agente Axon (tool use) usam
estas funções, para que haja uma única fonte da verdade. Todas recebem o
`user_id` explicitamente e garantem a posse das linhas (`.eq("user_id", …)`).

Erros de validação/posse levantam ValueError com mensagem amigável:
- o router converte para HTTPException;
- o agente converte para um tool_result de erro.
"""

from datetime import datetime, timezone

from database import supabase
from services import calendar_sync

# Campos de data que o Supabase devolve como date/datetime e precisam virar str.
_DATE_FIELDS = ("scheduled_date", "end_date", "deadline", "start_time", "end_time", "created_at", "completed_at")
# Campos de data que enviamos ao Supabase e precisam ser serializados antes.
_WRITE_DATE_FIELDS = ("scheduled_date", "end_date", "deadline")


def serialize(row: dict) -> dict:
    """Converte campos de data/hora para string antes de retornar."""
    for field in _DATE_FIELDS:
        if row.get(field) is not None:
            row[field] = str(row[field])
    return row


def _stringify_dates(payload: dict) -> dict:
    for field in _WRITE_DATE_FIELDS:
        if payload.get(field) is not None:
            payload[field] = str(payload[field])
    return payload


def list_tasks(
    user_id: str,
    *,
    scheduled_date: str | None = None,
    status: str | None = None,
    task_type: str | None = None,
) -> list[dict]:
    query = (
        supabase.table("tasks")
        .select("*")
        .eq("user_id", user_id)
        .order("start_time", desc=False)
    )

    if scheduled_date:
        query = query.eq("scheduled_date", scheduled_date)
    if status:
        query = query.eq("status", status)
    if task_type:
        query = query.eq("task_type", task_type)

    result = query.execute()
    return [serialize(row) for row in (result.data or [])]


def _unset_key_task(user_id: str, scheduled_date: str, exclude_id: str | None = None) -> None:
    """Garante unicidade de tarefa chave por dia: zera a anterior antes de setar a nova."""
    q = (
        supabase.table("tasks")
        .update({"is_key_task": False})
        .eq("user_id", user_id)
        .eq("scheduled_date", scheduled_date)
        .eq("is_key_task", True)
    )
    if exclude_id:
        q = q.neq("id", exclude_id)
    q.execute()


def create_task(user_id: str, data: dict) -> dict:
    payload = _stringify_dates({**data})
    payload["user_id"] = user_id

    if payload.get("is_key_task") and payload.get("scheduled_date"):
        _unset_key_task(user_id, payload["scheduled_date"])

    result = supabase.table("tasks").insert(payload).execute()
    if not result.data:
        raise ValueError("Erro ao criar tarefa")

    task = serialize(result.data[0])
    calendar_sync.sync_task_async(user_id, task, "create")
    return task


def _ensure_owned(user_id: str, task_id: str) -> None:
    existing = (
        supabase.table("tasks")
        .select("id")
        .eq("id", task_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not existing.data:
        raise ValueError("Tarefa não encontrada")


def update_task(user_id: str, task_id: str, data: dict) -> dict:
    payload = _stringify_dates({**data})
    if not payload:
        raise ValueError("Nenhum campo para atualizar")

    # Confirma posse e lê estado atual (status para completed_at; scheduled_date
    # e is_key_task para a lógica de unicidade de tarefa chave).
    existing = (
        supabase.table("tasks")
        .select("status, scheduled_date, is_key_task")
        .eq("id", task_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not existing.data:
        raise ValueError("Tarefa não encontrada")
    current_status = existing.data[0].get("status")
    current_scheduled_date = existing.data[0].get("scheduled_date")

    if payload.get("is_key_task"):
        effective_date = str(payload.get("scheduled_date") or current_scheduled_date or "")
        if effective_date:
            _unset_key_task(user_id, effective_date, exclude_id=task_id)

    if "status" in payload:
        if payload["status"] == "done" and current_status != "done":
            payload["completed_at"] = datetime.now(timezone.utc).isoformat()
        elif payload["status"] != "done":
            payload["completed_at"] = None  # reabriu a tarefa

    result = (
        supabase.table("tasks")
        .update(payload)
        .eq("id", task_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise ValueError("Erro ao atualizar tarefa")

    task = serialize(result.data[0])
    calendar_sync.sync_task_async(user_id, task, "update")
    return task


def delete_task(user_id: str, task_id: str) -> None:
    # Busca a tarefa (com google_event_id) antes de deletar, para remover do Google
    existing = (
        supabase.table("tasks")
        .select("*")
        .eq("id", task_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not existing.data:
        raise ValueError("Tarefa não encontrada")

    task = existing.data[0]
    supabase.table("tasks").delete().eq("id", task_id).eq("user_id", user_id).execute()
    calendar_sync.sync_task_async(user_id, task, "delete")


def carry_forward_tasks(user_id: str) -> list[dict]:
    """
    Move para hoje as tarefas do tipo 'task' de ontem que ainda estão
    pendentes (status 'todo' ou 'progress').

    Idempotente: se chamada mais de uma vez no mesmo dia, não encontra
    nada para mover (as datas já foram atualizadas para hoje).
    """
    from datetime import date, timedelta

    yesterday = str(date.today() - timedelta(days=1))
    today = str(date.today())

    result = (
        supabase.table("tasks")
        .select("id, carry_count")
        .eq("user_id", user_id)
        .eq("task_type", "task")
        .eq("scheduled_date", yesterday)
        .in_("status", ["todo", "progress"])
        .execute()
    )

    rows = result.data or []
    if not rows:
        return []

    # Atualiza linha a linha para incrementar carry_count (PostgREST não
    # permite expressões SQL como coluna = coluna + 1 em update em lote).
    updated = []
    for row in rows:
        res = (
            supabase.table("tasks")
            .update(
                {
                    "scheduled_date": today,
                    "carry_count": (row.get("carry_count") or 0) + 1,
                }
            )
            .eq("user_id", user_id)
            .eq("id", row["id"])
            .execute()
        )
        if res.data:
            updated.append(serialize(res.data[0]))
    return updated


def list_subtasks(user_id: str, task_id: str) -> list[dict]:
    result = (
        supabase.table("tasks")
        .select("*")
        .eq("parent_task_id", task_id)
        .eq("user_id", user_id)
        .order("scheduled_date")
        .execute()
    )
    return [serialize(row) for row in (result.data or [])]
