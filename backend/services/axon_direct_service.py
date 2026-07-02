"""
Canal do Axon — conversa permanente e dedicada entre o usuário e o Axon.

Criada automaticamente (sem endpoint próprio) na primeira vez que o usuário
lista suas conversas. Começa com uma mensagem de abertura fixa (não gerada
pelo LLM, para garantir consistência) e um onboarding conversacional guiado
pelo system prompt (ver services/prompts.py) até o usuário concluir.
"""

from database import supabase

CONVERSATION_TYPE = "axon_direct"

# Texto fixo, pré-escrito — não gerado pelo LLM. Explica o propósito do canal,
# tranquiliza sobre privacidade e opcionalidade, e já faz a primeira pergunta
# do onboarding (ver AXON_DIRECT_ONBOARDING_QUESTIONS em services/prompts.py —
# a pergunta 1 de lá é sempre esta mesma, "quem é você?").
_OPENING_MESSAGE_TEMPLATE = (
    "Olá, {primeiro_nome}! Eu sou o Axon — seu assistente pessoal de produtividade.\n\n"
    "Fui criado para te ajudar a organizar melhor o seu tempo, entender sua "
    "energia ao longo do dia e conquistar o que é mais importante para você. "
    "Mas para fazer isso do jeito certo, preciso te conhecer de verdade.\n\n"
    "Vou te fazer algumas perguntas sobre quem você é, o que busca e como é a "
    "sua rotina hoje. Quanto mais você me contar, mais útil eu consigo ser "
    "para você.\n\n"
    "Fique tranquilo: você não é obrigado a responder nada. Se alguma "
    "pergunta não fizer sentido agora ou você preferir pular, é só me dizer "
    "— sem problema nenhum. E se quiser responder depois, esse canal fica "
    "sempre aberto para você voltar quando quiser.\n\n"
    "Tudo que você compartilhar aqui é completamente privado e protegido. "
    "Suas informações são usadas exclusivamente para eu aprender quem você é "
    "e te ajudar melhor. Nada é compartilhado com ninguém, nunca.\n\n"
    "Pronto para começar? Me conta: quem é você?"
)


def _first_name(full_name: str | None) -> str:
    if not full_name or not full_name.strip():
        return "tudo bem"
    return full_name.strip().split()[0]


def _build_opening_message(user_name: str | None) -> str:
    return _OPENING_MESSAGE_TEMPLATE.format(primeiro_nome=_first_name(user_name))


def get_axon_direct_conversation(user_id: str) -> dict:
    """
    Busca a conversa axon_direct do usuário. Se não existir, cria e insere a
    mensagem de abertura como role='assistant'. Idempotente e transparente —
    chamada a cada GET /chat/conversations.
    """
    res = (
        supabase.table("conversations")
        .select("*")
        .eq("user_id", user_id)
        .eq("conversation_type", CONVERSATION_TYPE)
        .limit(1)
        .execute()
    )
    if res.data:
        return res.data[0]

    created = (
        supabase.table("conversations")
        .insert({
            "user_id": user_id,
            "title": "Canal do Axon",
            "type": "general",
            "conversation_type": CONVERSATION_TYPE,
        })
        .execute()
    )
    conv = created.data[0]

    profile_res = (
        supabase.table("profiles").select("name").eq("id", user_id).single().execute()
    )
    user_name = (profile_res.data or {}).get("name")

    supabase.table("messages").insert({
        "user_id": user_id,
        "conversation_id": conv["id"],
        "role": "assistant",
        "content": _build_opening_message(user_name),
    }).execute()

    return conv
