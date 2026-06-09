from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from models.schemas import ChatRequest, ChatResponse
from auth_helper import get_current_user
from database import supabase
from services import claude_service
from limiter import chat_limiter

router = APIRouter(prefix="/chat", tags=["chat"])

_MAX_MESSAGE_LEN = 4_000
_MAX_HISTORY = 50

# Respostas do questionário que o agente realmente usa para personalizar sugestões
_RELEVANT_ANSWERS = ["P10", "P11", "P13", "P14", "P17", "P18"]


def _stream_and_save(user_id: str, conversation_id: str, user_message: str, history: list, system_prompt: str):
    """Faz o streaming da resposta da Claude e salva as mensagens no banco."""
    import json as json_module
    response_text = ""
    try:
        for chunk in claude_service.stream_chat_with_tools(history, system_prompt, user_id):
            # chunk é no formato: "data: {\"text\": \"...\"}\n\n" ou "data: [DONE]\n\n"
            yield chunk

            # Extrai o texto para salvar depois
            if chunk.startswith("data: "):
                payload = chunk[6:-2]  # Remove "data: " e "\n\n"
                if payload == "[DONE]":
                    break
                try:
                    data = json_module.loads(payload)
                    response_text += data.get("text", "")
                except:
                    pass

        # Salva as mensagens após o streaming terminar
        supabase.table("messages").insert([
            {"user_id": user_id, "conversation_id": conversation_id, "role": "user", "content": user_message},
            {"user_id": user_id, "conversation_id": conversation_id, "role": "assistant", "content": response_text},
        ]).execute()
    except Exception as e:
        import traceback
        traceback.print_exc()  # aparece no log do servidor para debug
        yield f"data: {json_module.dumps({'text': f'\\n\\n⚠️ Erro interno: {e}'})}\n\n"
        yield "data: [DONE]\n\n"


def _load_perfil(user_id: str) -> dict:
    """Carrega o perfil completo do usuário para montar o prompt do agente."""
    profile_res = (
        supabase.table("profiles")
        .select("name, chronotype, qualidade_sono, schedule_type")
        .eq("id", user_id)
        .single()
        .execute()
    )
    profile_data = profile_res.data or {}

    answers_res = (
        supabase.table("respostas")
        .select("pergunta, alternativa")
        .eq("user_id", user_id)
        .in_("pergunta", _RELEVANT_ANSWERS)
        .execute()
    )
    respostas = {row["pergunta"]: row["alternativa"] for row in (answers_res.data or [])}

    memories_res = (
        supabase.table("user_memories")
        .select("content")
        .eq("user_id", user_id)
        .order("created_at", desc=False)
        .limit(60)
        .execute()
    )
    memories = [row["content"] for row in (memories_res.data or [])]

    return {
        "nome": profile_data.get("name"),
        "cronotipo": profile_data.get("chronotype", "intermediate"),
        "schedule_type": profile_data.get("schedule_type"),
        "qualidade_sono": profile_data.get("qualidade_sono"),
        "respostas": respostas,
        "memories": memories,
    }


@router.post("/message")
@chat_limiter.limit("30/minute")
def chat_message(
    request: Request,
    body: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    from fastapi import HTTPException

    if not body.conversation_id:
        raise HTTPException(status_code=400, detail="conversation_id é obrigatório")

    if len(body.message) > _MAX_MESSAGE_LEN:
        raise HTTPException(status_code=400, detail="Mensagem muito longa (máximo 4000 caracteres)")

    user_id = current_user["id"]

    perfil = _load_perfil(user_id)
    system_prompt = claude_service.build_agent_prompt(perfil, perfil.get("memories", []))

    history = [{"role": m.role, "content": m.content} for m in body.history[-_MAX_HISTORY:]]
    history.append({"role": "user", "content": body.message})

    return StreamingResponse(
        _stream_and_save(user_id, body.conversation_id, body.message, history, system_prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/debug/test")
def debug_test():
    """Endpoint público de teste."""
    return {"status": "ok", "message": "Backend está funcionando"}


@router.get("/debug/perfil")
def debug_perfil(current_user: dict = Depends(get_current_user)):
    """Endpoint de debug para ver o que está sendo carregado do perfil."""
    user_id = current_user["id"]

    profile_res = (
        supabase.table("profiles")
        .select("*")
        .eq("id", user_id)
        .single()
        .execute()
    )
    profile_data = profile_res.data or {}

    answers_res = (
        supabase.table("respostas")
        .select("pergunta, alternativa")
        .eq("user_id", user_id)
        .execute()
    )
    respostas = answers_res.data or []

    perfil = _load_perfil(user_id)

    return {
        "profile_data": profile_data,
        "respostas": respostas,
        "perfil_carregado": perfil,
    }


@router.post("", response_model=ChatResponse)
@chat_limiter.limit("30/minute")
def chat(
    request: Request,
    body: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    if len(body.message) > _MAX_MESSAGE_LEN:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Mensagem muito longa (máximo 4000 caracteres)")

    user_id = current_user["id"]

    perfil = _load_perfil(user_id)
    system_prompt = claude_service.build_agent_prompt(perfil, perfil.get("memories", []))

    history = [{"role": m.role, "content": m.content} for m in body.history[-_MAX_HISTORY:]]
    history.append({"role": "user", "content": body.message})

    response_text = claude_service.call_chat(history, system_prompt)

    base_row = {"user_id": user_id}
    if body.conversation_id:
        base_row["conversation_id"] = body.conversation_id

    supabase.table("messages").insert([
        {**base_row, "role": "user", "content": body.message},
        {**base_row, "role": "assistant", "content": response_text},
    ]).execute()

    return ChatResponse(response=response_text)
