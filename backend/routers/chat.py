from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from models.schemas import ChatRequest, ChatResponse
from auth_helper import get_current_user
from database import supabase
from services import chronotype as chronotype_service
from services import claude_service
from limiter import chat_limiter

router = APIRouter(prefix="/chat", tags=["chat"])

_MAX_MESSAGE_LEN = 4_000
_MAX_HISTORY = 50


def _build_system_prompt(chronotype: str) -> str:
    ctx = chronotype_service.CHRONOTYPE_META.get(chronotype, chronotype_service.CHRONOTYPE_META["intermediate"])
    return (
        f"Você é o Axon, um assistente de produtividade pessoal baseado em cronobiologia. "
        f"Você conhece o perfil cronobiológico do usuário: {ctx['label']}. "
        f"Pico de energia: {ctx['energy_peak']}. "
        f"Melhor janela de foco: {ctx['focus_window']}. "
        f"Período de baixa energia: {ctx['low_energy']}.\n\n"
        f"Ajude o usuário a organizar seu dia, priorizar tarefas e criar blocos de foco "
        f"respeitando seu ritmo natural. Seja conciso, prático e empático. "
        f"Quando sugerir horários ou blocos, leve em conta o perfil cronobiológico acima. "
        f"Responda sempre em português brasileiro. "
        f"Limite suas respostas a no máximo 3 parágrafos curtos."
    )


@router.post("/message")
@chat_limiter.limit("30/minute")
def chat_message(
    request: Request,
    body: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    if len(body.message) > _MAX_MESSAGE_LEN:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Mensagem muito longa (máximo 4000 caracteres)")

    user_id = current_user["id"]

    profile = supabase.table("profiles").select("chronotype").eq("id", user_id).single().execute()
    chronotype = (profile.data or {}).get("chronotype", "intermediate")

    system_prompt = _build_system_prompt(chronotype)

    history = [{"role": m.role, "content": m.content} for m in body.history[-_MAX_HISTORY:]]
    history.append({"role": "user", "content": body.message})

    return StreamingResponse(
        claude_service.stream_chat(history, system_prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


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

    profile_res = supabase.table("profiles").select("name, chronotype, qualidade_sono").eq("id", user_id).single().execute()
    profile_data = profile_res.data or {}

    relevant = ["P10", "P11", "P13", "P14", "P17", "P18"]
    answers_res = supabase.table("respostas").select("pergunta, alternativa").eq("user_id", user_id).in_("pergunta", relevant).execute()
    respostas = {row["pergunta"]: row["alternativa"] for row in (answers_res.data or [])}

    perfil = {
        "nome": profile_data.get("name"),
        "cronotipo": profile_data.get("chronotype", "intermediate"),
        "qualidade_sono": profile_data.get("qualidade_sono"),
        "respostas": respostas,
    }

    system_prompt = claude_service.build_system_prompt(perfil)

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
