from fastapi import APIRouter, Depends, HTTPException
from models.schemas import ConversationCreate, ConversationUpdate, ConversationResponse
from auth_helper import get_current_user
from database import supabase

router = APIRouter(prefix="/chat/conversations", tags=["conversations"])


@router.get("", response_model=list[ConversationResponse])
def list_conversations(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]

    res = (
        supabase.table("conversations")
        .select("*")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .execute()
    )

    conversations = res.data or []
    result = []

    for conv in conversations:
        msgs_res = (
            supabase.table("messages")
            .select("content, role, created_at")
            .eq("conversation_id", conv["id"])
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        msgs = msgs_res.data or []
        last_message = msgs[0]["content"] if msgs else None

        count_res = (
            supabase.table("messages")
            .select("id", count="exact")
            .eq("conversation_id", conv["id"])
            .execute()
        )

        result.append(
            ConversationResponse(
                id=conv["id"],
                title=conv["title"],
                type=conv["type"],
                archived=conv["archived"],
                created_at=conv["created_at"],
                last_message=last_message,
                message_count=count_res.count or 0,
            )
        )

    return result


@router.post("", response_model=ConversationResponse, status_code=201)
def create_conversation(
    body: ConversationCreate,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]

    res = (
        supabase.table("conversations")
        .insert({"user_id": user_id, "title": body.title, "type": body.type})
        .execute()
    )

    conv = res.data[0]
    return ConversationResponse(
        id=conv["id"],
        title=conv["title"],
        type=conv["type"],
        archived=conv["archived"],
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

    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

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
        .select("id")
        .eq("id", conversation_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Conversa não encontrada")

    supabase.table("conversations").delete().eq("id", conversation_id).eq("user_id", user_id).execute()


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
