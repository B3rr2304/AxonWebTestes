"""
Persistência de memórias do agente Axon por usuário.

Memórias são frases curtas em terceira pessoa que o agente salva quando aprende
algo relevante sobre o usuário durante o chat. Elas são carregadas no system
prompt de cada conversa, tornando o agente progressivamente mais personalizado.
"""

from database import supabase


def save_memory(user_id: str, content: str) -> dict:
    """Salva uma nova memória. Retorna a linha criada."""
    result = (
        supabase.table("user_memories")
        .insert({"user_id": user_id, "content": content.strip()})
        .execute()
    )
    return result.data[0] if result.data else {}


def load_memories(user_id: str) -> list[str]:
    """
    Retorna as memórias do usuário em ordem cronológica (mais antigas primeiro),
    limitado a 60 entradas para não inflar o system prompt.
    """
    result = (
        supabase.table("user_memories")
        .select("content")
        .eq("user_id", user_id)
        .order("created_at", desc=False)
        .limit(60)
        .execute()
    )
    return [row["content"] for row in (result.data or [])]


def list_memories_with_ids(user_id: str) -> list[dict]:
    """Retorna memórias com id e content para o agente poder atualizar/deletar."""
    result = (
        supabase.table("user_memories")
        .select("id, content, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=False)
        .limit(60)
        .execute()
    )
    return result.data or []


def update_memory(user_id: str, memory_id: str, new_content: str) -> dict:
    """Atualiza o conteúdo de uma memória existente."""
    existing = (
        supabase.table("user_memories")
        .select("id")
        .eq("id", memory_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not existing.data:
        raise ValueError("Memória não encontrada")

    result = (
        supabase.table("user_memories")
        .update({"content": new_content.strip(), "updated_at": "now()"})
        .eq("id", memory_id)
        .eq("user_id", user_id)
        .execute()
    )
    return result.data[0] if result.data else {}


def sync_dated_memory(user_id: str, prefix: str, content: str | None) -> None:
    """
    Mantém no máximo UMA memória identificada por `prefix` (ex: a nota do
    registro diário de um dia). Usado por eventos que o usuário pode editar
    várias vezes — garante que editar atualiza, e apagar a nota remove a
    memória, sem nunca duplicar.

    - content preenchido  -> cria a memória, ou atualiza a existente do prefixo
    - content vazio/None  -> remove a memória existente do prefixo (se houver)
    """
    existing = (
        supabase.table("user_memories")
        .select("id")
        .eq("user_id", user_id)
        .ilike("content", f"{prefix}%")
        .limit(1)
        .execute()
    )
    found = existing.data[0]["id"] if existing.data else None

    if content and content.strip():
        if found:
            supabase.table("user_memories").update(
                {"content": content.strip(), "updated_at": "now()"}
            ).eq("id", found).eq("user_id", user_id).execute()
        else:
            save_memory(user_id, content)
    elif found:
        supabase.table("user_memories").delete().eq("id", found).eq(
            "user_id", user_id
        ).execute()


def delete_memory(user_id: str, memory_id: str) -> None:
    """Remove uma memória específica."""
    existing = (
        supabase.table("user_memories")
        .select("id")
        .eq("id", memory_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not existing.data:
        raise ValueError("Memória não encontrada")
    supabase.table("user_memories").delete().eq("id", memory_id).eq("user_id", user_id).execute()
