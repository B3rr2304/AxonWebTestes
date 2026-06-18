from fastapi import APIRouter, Depends, HTTPException
from models.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from auth_helper import get_current_user
from database import supabase

router = APIRouter(prefix="/chat/projects", tags=["chat-projects"])


def _conversation_count(project_id: str) -> int:
    """Conta conversas NÃO arquivadas vinculadas a um projeto."""
    res = (
        supabase.table("conversations")
        .select("id", count="exact")
        .eq("project_id", project_id)
        .eq("archived", False)
        .execute()
    )
    return res.count or 0


def _to_response(project: dict, count: int) -> ProjectResponse:
    return ProjectResponse(
        id=project["id"],
        name=project["name"],
        description=project.get("description"),
        conversation_count=count,
        created_at=project["created_at"],
        updated_at=project["updated_at"],
    )


@router.get("", response_model=list[ProjectResponse])
def list_projects(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]

    res = (
        supabase.table("chat_projects")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    projects = res.data or []

    return [_to_response(p, _conversation_count(p["id"])) for p in projects]


@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(
    body: ProjectCreate,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]

    name = (body.name or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="O nome do projeto é obrigatório")

    res = (
        supabase.table("chat_projects")
        .insert({"user_id": user_id, "name": name, "description": body.description})
        .execute()
    )

    project = res.data[0]
    return _to_response(project, 0)


@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: str,
    body: ProjectUpdate,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]

    existing = (
        supabase.table("chat_projects")
        .select("id")
        .eq("id", project_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    if "name" in updates and not (updates["name"] or "").strip():
        raise HTTPException(status_code=400, detail="O nome do projeto não pode ser vazio")

    res = (
        supabase.table("chat_projects")
        .update(updates)
        .eq("id", project_id)
        .eq("user_id", user_id)
        .execute()
    )

    project = res.data[0]
    return _to_response(project, _conversation_count(project_id))


@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]

    existing = (
        supabase.table("chat_projects")
        .select("id")
        .eq("id", project_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    # As conversas ficam intactas — project_id delas vira null automaticamente
    # pelo ON DELETE SET NULL definido na FK da tabela conversations.
    supabase.table("chat_projects").delete().eq("id", project_id).eq("user_id", user_id).execute()
