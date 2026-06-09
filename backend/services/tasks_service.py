"""
Lógica de CRUD de tarefas (tabela `tasks`) isolada do router HTTP.

Tanto os endpoints de routers/tasks.py quanto o agente Axon (tool use) usam
estas funções, para que haja uma única fonte da verdade. Todas recebem o
`user_id` explicitamente e garantem a posse das linhas (`.eq("user_id", …)`).

Erros de validação/posse levantam ValueError com mensagem amigável:
- o router converte para HTTPException;
- o agente converte para um tool_result de erro.
"""

from database import supabase

# Campos de data que o Supabase devolve como date/datetime e precisam virar str.
_DATE_FIELDS = ("scheduled_date", "end_date", "deadline", "start_time", "end_time", "created_at")
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


def create_task(user_id: str, data: dict) -> dict:
    payload = _stringify_dates({**data})
    payload["user_id"] = user_id

    result = supabase.table("tasks").insert(payload).execute()
    if not result.data:
        raise ValueError("Erro ao criar tarefa")

    return serialize(result.data[0])


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

    _ensure_owned(user_id, task_id)

    result = (
        supabase.table("tasks")
        .update(payload)
        .eq("id", task_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise ValueError("Erro ao atualizar tarefa")

    return serialize(result.data[0])


def delete_task(user_id: str, task_id: str) -> None:
    _ensure_owned(user_id, task_id)
    supabase.table("tasks").delete().eq("id", task_id).eq("user_id", user_id).execute()


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
        .select("id")
        .eq("user_id", user_id)
        .eq("task_type", "task")
        .eq("scheduled_date", yesterday)
        .in_("status", ["todo", "progress"])
        .execute()
    )

    ids = [row["id"] for row in (result.data or [])]
    if not ids:
        return []

    updated = (
        supabase.table("tasks")
        .update({"scheduled_date": today})
        .eq("user_id", user_id)
        .in_("id", ids)
        .execute()
    )
    return [serialize(row) for row in (updated.data or [])]


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
