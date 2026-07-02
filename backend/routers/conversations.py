from fastapi import APIRouter, Depends, HTTPException, Query
from models.schemas import ConversationCreate, ConversationUpdate, ConversationResponse
from auth_helper import get_current_user
from database import supabase
from services import axon_direct_service

router = APIRouter(prefix="/chat/conversations", tags=["conversations"])


def _assert_project_owned(user_id: str, project_id: str) -> None:
    """Garante que o projeto existe e pertence ao usuário (evita vazamento entre contas)."""
    res = (
        supabase.table("chat_projects")
        .select("id")
        .eq("id", project_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")


def _to_response(conv: dict, last_message: str | None, message_count: int) -> ConversationResponse:
    return ConversationResponse(
        id=conv["id"],
        title=conv["title"],
        type=conv["type"],
        archived=conv["archived"],
        project_id=conv.get("project_id"),
        created_at=conv["created_at"],
        last_message=last_message,
        message_count=message_count,
        conversation_type=conv.get("conversation_type", "regular"),
    )


def _load_last_message_and_count(conversation_id: str) -> tuple[str | None, int]:
    msgs_res = (
        supabase.table("messages")
        .select("content, role, created_at")
        .eq("conversation_id", conversation_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    msgs = msgs_res.data or []
    last_message = msgs[0]["content"] if msgs else None

    count_res = (
        supabase.table("messages")
        .select("id", count="exact")
        .eq("conversation_id", conversation_id)
        .execute()
    )

    return last_message, count_res.count or 0


@router.get("", response_model=list[ConversationResponse])
def list_conversations(
    limit: int = Query(8, ge=1, le=50),
    offset: int = Query(0, ge=0),
    project_id: str | None = Query(None),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]

    # O Canal do Axon é fixo (independente de projeto/recência) e sempre
    # aparece primeiro. Garantimos que ele existe (cria + mensagem de
    # abertura na primeira vez) de forma transparente aqui.
    axon_direct_conv = axon_direct_service.get_axon_direct_conversation(user_id)

    query = (
        supabase.table("conversations")
        .select("*")
        .eq("user_id", user_id)
        .neq("conversation_type", axon_direct_service.CONVERSATION_TYPE)
        .order("updated_at", desc=True)
        .limit(limit)
        .offset(offset)
    )

    if project_id == "null":
        # Conversas sem projeto (aba "Todas")
        query = query.is_("project_id", "null")
    elif project_id is not None:
        # Conversas de um projeto específico
        query = query.eq("project_id", project_id)
    # Sem filtro: retorna todas (comportamento anterior)

    res = query.execute()
    conversations = res.data or []

    result = []

    # O Canal do Axon só entra na 1ª página e apenas quando não há filtro por
    # projeto específico (ele nunca pertence a um projeto).
    if offset == 0 and project_id is None:
        last_message, message_count = _load_last_message_and_count(axon_direct_conv["id"])
        result.append(_to_response(axon_direct_conv, last_message, message_count))

    for conv in conversations:
        last_message, message_count = _load_last_message_and_count(conv["id"])
        result.append(_to_response(conv, last_message, message_count))

    return result


@router.post("", response_model=ConversationResponse, status_code=201)
def create_conversation(
    body: ConversationCreate,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]

    if body.project_id is not None:
        _assert_project_owned(user_id, body.project_id)

    res = (
        supabase.table("conversations")
        .insert({
            "user_id": user_id,
            "title": body.title,
            "type": body.type,
            "project_id": body.project_id,
        })
        .execute()
    )

    conv = res.data[0]
    return ConversationResponse(
        id=conv["id"],
        title=conv["title"],
        type=conv["type"],
        archived=conv["archived"],
        project_id=conv.get("project_id"),
        created_at=conv["created_at"],
    )


@router.patch("/{conversation_id}", response_model=ConversationResponse)
def update_conversation(
    conversation_id: str,
    body: ConversationUpdate,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]

    existing = (
        supabase.table("conversations")
        .select("id")
        .eq("id", conversation_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Conversa não encontrada")

    # exclude_unset: distingue "campo não enviado" de "enviado como null". Isso
    # permite project_id=null (remover do projeto) sem apagar os outros campos.
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    # Mover para um projeto exige que o projeto seja do próprio usuário.
    if updates.get("project_id") is not None:
        _assert_project_owned(user_id, updates["project_id"])

    res = (
        supabase.table("conversations")
        .update(updates)
        .eq("id", conversation_id)
        .eq("user_id", user_id)
        .execute()
    )

    conv = res.data[0]
    return ConversationResponse(
        id=conv["id"],
        title=conv["title"],
        type=conv["type"],
        archived=conv["archived"],
        project_id=conv.get("project_id"),
        created_at=conv["created_at"],
    )


@router.delete("/{conversation_id}", status_code=204)
def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]

    existing = (
        supabase.table("conversations")
        .select("id, conversation_type")
        .eq("id", conversation_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Conversa não encontrada")

    if existing.data[0].get("conversation_type") == axon_direct_service.CONVERSATION_TYPE:
        raise HTTPException(status_code=403, detail="O Canal do Axon não pode ser excluído")

    supabase.table("conversations").delete().eq("id", conversation_id).eq("user_id", user_id).execute()


@router.get("/{conversation_id}/messages")
def get_messages(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]

    existing = (
        supabase.table("conversations")
        .select("id")
        .eq("id", conversation_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Conversa não encontrada")

    res = (
        supabase.table("messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", conversation_id)
        .order("created_at", desc=False)
        .execute()
    )
    return res.data or []


@router.delete("/{conversation_id}/messages", status_code=204)
def clear_messages(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]

    existing = (
        supabase.table("conversations")
        .select("id")
        .eq("id", conversation_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Conversa não encontrada")

    supabase.table("messages").delete().eq("conversation_id", conversation_id).execute()
