from fastapi import APIRouter, Depends, HTTPException, Query
from models.schemas import TaskCreate, TaskUpdate, TaskResponse
from auth_helper import get_current_user
from database import supabase
from typing import Optional

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _serialize(row: dict) -> dict:
    """Converte campos de data/hora para string antes de retornar."""
    for field in ("scheduled_date", "deadline", "start_time", "end_time", "created_at"):
        if row.get(field) is not None:
            row[field] = str(row[field])
    return row


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    scheduled_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    status: Optional[str] = Query(None),
    task_type: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    query = (
        supabase.table("tasks")
        .select("*")
        .eq("user_id", current_user["id"])
        .order("start_time", desc=False)
    )

    if scheduled_date:
        query = query.eq("scheduled_date", scheduled_date)
    if status:
        query = query.eq("status", status)
    if task_type:
        query = query.eq("task_type", task_type)

    result = query.execute()
    return [_serialize(row) for row in (result.data or [])]


@router.post("", response_model=TaskResponse, status_code=201)
def create_task(
    body: TaskCreate,
    current_user: dict = Depends(get_current_user),
):
    payload = body.model_dump(exclude_none=True)
    payload["user_id"] = current_user["id"]

    for field in ("scheduled_date", "deadline"):
        if field in payload and payload[field] is not None:
            payload[field] = str(payload[field])

    result = supabase.table("tasks").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Erro ao criar tarefa")

    return _serialize(result.data[0])


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    body: TaskUpdate,
    current_user: dict = Depends(get_current_user),
):
    existing = (
        supabase.table("tasks")
        .select("id")
        .eq("id", task_id)
        .eq("user_id", current_user["id"])
        .single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")

    payload = body.model_dump(exclude_none=True)
    if not payload:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    for field in ("scheduled_date", "deadline"):
        if field in payload and payload[field] is not None:
            payload[field] = str(payload[field])

    result = (
        supabase.table("tasks")
        .update(payload)
        .eq("id", task_id)
        .eq("user_id", current_user["id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=500, detail="Erro ao atualizar tarefa")

    return _serialize(result.data[0])


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
):
    existing = (
        supabase.table("tasks")
        .select("id")
        .eq("id", task_id)
        .eq("user_id", current_user["id"])
        .single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")

    supabase.table("tasks").delete().eq("id", task_id).eq("user_id", current_user["id"]).execute()


@router.get("/{task_id}/subtasks", response_model=list[TaskResponse])
def list_subtasks(
    task_id: str,
    current_user: dict = Depends(get_current_user),
):
    result = (
        supabase.table("tasks")
        .select("*")
        .eq("parent_task_id", task_id)
        .eq("user_id", current_user["id"])
        .order("scheduled_date")
        .execute()
    )
    return [_serialize(row) for row in (result.data or [])]
