from fastapi import APIRouter, Depends, HTTPException
from models.schemas import ObjectiveCreate, ObjectiveUpdate, ObjectiveResponse
from auth_helper import get_current_user
from services import objectives_service

router = APIRouter(prefix="/objectives", tags=["objectives"])


@router.get("", response_model=list[ObjectiveResponse])
def list_objectives(current_user: dict = Depends(get_current_user)):
    return objectives_service.list_objectives(current_user["id"])


@router.post("", response_model=ObjectiveResponse, status_code=201)
def create_objective(
    body: ObjectiveCreate,
    current_user: dict = Depends(get_current_user),
):
    try:
        return objectives_service.create_objective(
            current_user["id"], body.model_dump(exclude_none=True)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{objective_id}")
def get_objective(
    objective_id: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        return objectives_service.get_objective(current_user["id"], objective_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/{objective_id}", response_model=ObjectiveResponse)
def update_objective(
    objective_id: str,
    body: ObjectiveUpdate,
    current_user: dict = Depends(get_current_user),
):
    try:
        return objectives_service.update_objective(
            current_user["id"], objective_id, body.model_dump(exclude_unset=True)
        )
    except ValueError as e:
        detail = str(e)
        code = 404 if "não encontrado" in detail else 400
        raise HTTPException(status_code=code, detail=detail)


@router.delete("/{objective_id}", status_code=204)
def delete_objective(
    objective_id: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        objectives_service.delete_objective(current_user["id"], objective_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
