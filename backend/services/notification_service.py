"""
CRUD e regras de negócio para notificações do Axon.

Gerencia a tabela `notifications` e a coluna `last_notif_analyzed_at`
em `profiles`. Aplica os cooldowns por tipo antes de criar notificações.
"""

from datetime import datetime, timezone, timedelta
from database import supabase


# ---------------------------------------------------------------------------
# Leitura
# ---------------------------------------------------------------------------

def get_notifications(user_id: str, limit: int = 10, offset: int = 0) -> list[dict]:
    res = (
        supabase.table("notifications")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
        .offset(offset)
        .execute()
    )
    return res.data or []


def get_unread_count(user_id: str) -> int:
    res = (
        supabase.table("notifications")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .eq("status", "unread")
        .execute()
    )
    return res.count or 0


def get_recent_notifications(user_id: str, hours: int = 72) -> list[dict]:
    """Retorna notificações recentes para contexto do Claude e verificação de cooldowns."""
    since = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
    res = (
        supabase.table("notifications")
        .select("id, type, title, status, created_at")
        .eq("user_id", user_id)
        .gte("created_at", since)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data or []


def count_today(user_id: str, notif_type: str) -> int:
    """Conta notificações do tipo informado criadas hoje (UTC)."""
    today = datetime.now(timezone.utc).date().isoformat()
    res = (
        supabase.table("notifications")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .eq("type", notif_type)
        .gte("created_at", f"{today}T00:00:00+00:00")
        .execute()
    )
    return res.count or 0


def count_consecutive_rejections(user_id: str) -> int:
    """
    Conta quantas notificações de melhoria consecutivas foram rejeitadas
    (da mais recente para trás, para até encontrar uma aceita ou lida).
    """
    res = (
        supabase.table("notifications")
        .select("status")
        .eq("user_id", user_id)
        .eq("type", "improvement")
        .order("created_at", desc=True)
        .limit(10)
        .execute()
    )
    count = 0
    for row in (res.data or []):
        if row["status"] == "rejected":
            count += 1
        else:
            break
    return count


# ---------------------------------------------------------------------------
# Cooldown de análise
# ---------------------------------------------------------------------------

def should_analyze(user_id: str) -> bool:
    """Retorna True se já passaram 6h desde a última análise."""
    res = (
        supabase.table("profiles")
        .select("last_notif_analyzed_at")
        .eq("id", user_id)
        .single()
        .execute()
    )
    data = res.data or {}
    last = data.get("last_notif_analyzed_at")
    if not last:
        return True
    last_dt = datetime.fromisoformat(last.replace("Z", "+00:00"))
    return datetime.now(timezone.utc) - last_dt >= timedelta(hours=6)


def update_analyzed_at(user_id: str) -> None:
    supabase.table("profiles").update(
        {"last_notif_analyzed_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", user_id).execute()


# ---------------------------------------------------------------------------
# Escrita
# ---------------------------------------------------------------------------

def create_notification(
    user_id: str,
    notif_type: str,
    title: str,
    body: str,
    action: dict | None = None,
) -> dict:
    payload: dict = {
        "user_id": user_id,
        "type": notif_type,
        "title": title,
        "body": body,
        "status": "unread",
    }
    if action:
        payload["action"] = action

    res = supabase.table("notifications").insert(payload).execute()
    return res.data[0] if res.data else {}


def mark_read(user_id: str, notif_id: str) -> dict:
    res = (
        supabase.table("notifications")
        .update({"status": "read", "read_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", notif_id)
        .eq("user_id", user_id)
        .execute()
    )
    return res.data[0] if res.data else {}


def mark_accepted(user_id: str, notif_id: str) -> dict:
    res = (
        supabase.table("notifications")
        .update({"status": "accepted"})
        .eq("id", notif_id)
        .eq("user_id", user_id)
        .eq("type", "improvement")
        .execute()
    )
    return res.data[0] if res.data else {}


def mark_rejected(user_id: str, notif_id: str) -> dict:
    res = (
        supabase.table("notifications")
        .update({"status": "rejected"})
        .eq("id", notif_id)
        .eq("user_id", user_id)
        .eq("type", "improvement")
        .execute()
    )
    return res.data[0] if res.data else {}


def get_notification(user_id: str, notif_id: str) -> dict | None:
    res = (
        supabase.table("notifications")
        .select("*")
        .eq("id", notif_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    return res.data
