"""
Lógica de CRUD de objetivos e recálculo de progresso.

Um objetivo é um container de tarefas relacionadas (etapas) que juntas formam
uma meta maior. O progresso é calculado automaticamente a partir das subtarefas:
  - progress = (done / total) * 100
  - status = 'done' quando todas as etapas estiverem concluídas
  - status = 'active' e progress recalculado se nova etapa for adicionada

Cascade de exclusão: ao deletar um objetivo, todas as suas subtarefas são
removidas automaticamente pela FK ON DELETE CASCADE do banco.
"""

from database import supabase

_DATE_FIELDS = ("deadline", "created_at", "updated_at")

_PRIORITY_WEIGHT = {"high": 0, "medium": 1, "low": 2}


def _serialize(row: dict) -> dict:
    for field in _DATE_FIELDS:
        if row.get(field) is not None:
            row[field] = str(row[field])
    return row


def _counts(objective_id: str) -> tuple[int, int]:
    """Retorna (total, done) de subtarefas do objetivo."""
    res = (
        supabase.table("tasks")
        .select("status")
        .eq("objective_id", objective_id)
        .execute()
    )
    rows = res.data or []
    total = len(rows)
    done = sum(1 for r in rows if r.get("status") == "done")
    return total, done


def recalculate_progress(objective_id: str) -> None:
    """
    Recalcula e persiste o progresso de um objetivo.
    Chamado sempre que uma subtarefa é criada, atualizada ou deletada.
    Nunca levanta exceção — falha silenciosa para não quebrar a operação da tarefa.
    """
    try:
        total, done = _counts(objective_id)
        if total == 0:
            progress = 0
            status = "active"
        else:
            progress = round((done / total) * 100)
            status = "done" if done == total else "active"

        supabase.table("objectives").update(
            {"progress": progress, "status": status}
        ).eq("id", objective_id).execute()
    except Exception:
        pass


def _get_owned(user_id: str, objective_id: str) -> dict:
    res = (
        supabase.table("objectives")
        .select("*")
        .eq("id", objective_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not res.data:
        raise ValueError("Objetivo não encontrado")
    return res.data[0]


def _to_response(row: dict) -> dict:
    total, done = _counts(row["id"])
    row = _serialize(row)
    row["subtask_count"] = total
    row["done_count"] = done
    return row


def list_objectives(user_id: str) -> list[dict]:
    res = (
        supabase.table("objectives")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    rows = res.data or []
    # Ordena por prioridade (alta → média → baixa); como o sort é estável,
    # objetivos de mesma prioridade mantêm a ordem por mais recente primeiro.
    rows.sort(key=lambda r: _PRIORITY_WEIGHT.get(r.get("priority") or "medium", 1))
    return [_to_response(r) for r in rows]


def get_objective(user_id: str, objective_id: str) -> dict:
    row = _get_owned(user_id, objective_id)
    result = _to_response(row)

    subtasks_res = (
        supabase.table("tasks")
        .select("id, title, status, priority, scheduled_date, start_time, end_time, is_key_task")
        .eq("objective_id", objective_id)
        .eq("user_id", user_id)
        .order("scheduled_date", desc=False)
        .execute()
    )
    result["subtasks"] = subtasks_res.data or []
    return result


def create_objective(user_id: str, data: dict) -> dict:
    title = (data.get("title") or "").strip()
    if not title:
        raise ValueError("O título do objetivo é obrigatório")

    priority = data.get("priority")
    if priority not in ("low", "medium", "high"):
        priority = "medium"

    payload = {
        "user_id": user_id,
        "title": title,
        "description": data.get("description"),
        "deadline": str(data["deadline"]) if data.get("deadline") else None,
        "priority": priority,
    }
    res = supabase.table("objectives").insert(payload).execute()
    if not res.data:
        raise ValueError("Erro ao criar objetivo")
    return _to_response(res.data[0])


def update_objective(user_id: str, objective_id: str, data: dict) -> dict:
    _get_owned(user_id, objective_id)

    payload = {}
    if "title" in data:
        title = (data["title"] or "").strip()
        if not title:
            raise ValueError("O título do objetivo não pode ser vazio")
        payload["title"] = title
    if "description" in data:
        payload["description"] = data["description"]
    if "deadline" in data:
        payload["deadline"] = str(data["deadline"]) if data["deadline"] else None
    if "status" in data:
        payload["status"] = data["status"]
    if "priority" in data and data["priority"] in ("low", "medium", "high"):
        payload["priority"] = data["priority"]

    if not payload:
        raise ValueError("Nenhum campo para atualizar")

    res = (
        supabase.table("objectives")
        .update(payload)
        .eq("id", objective_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not res.data:
        raise ValueError("Erro ao atualizar objetivo")
    return _to_response(res.data[0])


def delete_objective(user_id: str, objective_id: str) -> None:
    _get_owned(user_id, objective_id)
    # Cascade ON DELETE apaga as subtarefas automaticamente.
    supabase.table("objectives").delete().eq("id", objective_id).eq("user_id", user_id).execute()
