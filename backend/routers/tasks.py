from fastapi import APIRouter, Depends, HTTPException, Query
from models.schemas import TaskCreate, TaskUpdate, TaskResponse
from auth_helper import get_current_user
from services import tasks_service
from typing import Optional

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    scheduled_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    status: Optional[str] = Query(None),
    task_type: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    return tasks_service.list_tasks(
        current_user["id"],
        scheduled_date=scheduled_date,
        status=status,
        task_type=task_type,
    )


@router.post("", response_model=TaskResponse, status_code=201)
def create_task(
    body: TaskCreate,
    current_user: dict = Depends(get_current_user),
):
    try:
        return tasks_service.create_task(
            current_user["id"], body.model_dump(exclude_none=True)
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    body: TaskUpdate,
    current_user: dict = Depends(get_current_user),
):
    try:
        return tasks_service.update_task(
            current_user["id"], task_id, body.model_dump(exclude_none=True)
        )
    except ValueError as e:
        detail = str(e)
        status_code = 404 if detail == "Tarefa não encontrada" else 400
        raise HTTPException(status_code=status_code, detail=detail)


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        tasks_service.delete_task(current_user["id"], task_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/carry-forward", response_model=list[TaskResponse])
def carry_forward(current_user: dict = Depends(get_current_user)):
    return tasks_service.carry_forward_tasks(current_user["id"])


@router.get("/{task_id}/subtasks", response_model=list[TaskResponse])
def list_subtasks(
    task_id: str,
    current_user: dict = Depends(get_current_user),
):
    return tasks_service.list_subtasks(current_user["id"], task_id)
