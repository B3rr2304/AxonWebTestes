from datetime import datetime, date
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends
from auth_helper import get_current_user
from database import supabase
from services import chronotype as chronotype_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# Fuso usado para calcular saudação e curva de energia do usuário.
_TZ = ZoneInfo("America/Sao_Paulo")

# Cronotipos em português (vindos do questionário) -> chave das curvas de energia.
_CURVE_KEY = {
    "Matutino": "morning",
    "Vespertino": "evening",
    "Noturno": "night",
    "Misto": "misto",
    "Bimodal": "bimodal",
    "morning": "morning",
    "evening": "evening",
    "night": "night",
    "intermediate": "intermediate",
    "bimodal": "bimodal",
    "misto": "misto",
}

# Chave de ritmo que o frontend usa (night/morning/evening senão "Estável").
_RHYTHM_KEY = {
    "Matutino": "morning",
    "Vespertino": "evening",
    "Noturno": "night",
    "morning": "morning",
    "evening": "evening",
    "night": "night",
}


def _greeting(hour: int) -> str:
    if hour < 12:
        return "Bom dia"
    if hour < 18:
        return "Boa tarde"
    return "Boa noite"


@router.get("/")
def get_dashboard(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]

    profile = (
        supabase.table("profiles")
        .select("name, chronotype")
        .eq("id", user_id)
        .single()
        .execute()
    )
    data = profile.data or {}
    chronotype = data.get("chronotype")

    meta = chronotype_service.CHRONOTYPE_META.get(
        chronotype or "intermediate",
        chronotype_service.CHRONOTYPE_META["intermediate"],
    )
    curve_key = _CURVE_KEY.get(chronotype or "intermediate", "intermediate")

    now = datetime.now(_TZ)
    hour = now.hour
    ctx = chronotype_service.get_chronotype_context(curve_key, hour)

    return {
        "greeting": f"{_greeting(hour)}, {data['name']}" if data.get("name") else _greeting(hour),
        "chronotype_label": meta["label"],
        "chronotype_key": _RHYTHM_KEY.get(chronotype or "", "intermediate"),
        "energy_percent": ctx["energy"],
        "focus_percent": ctx["focus"],
        "energy_peak": meta["energy_peak"],
        "focus_window": meta["focus_window"],
        "low_energy": meta["low_energy"],
        "recommendation": (
            "Aproveite sua janela de foco para a tarefa mais importante do dia."
        ),
        "next_focus": None,
        "day_blocks": _today_blocks(user_id, now),
    }


_TYPE_LABEL = {"task": "Tarefa", "event": "Evento", "routine": "Rotina"}


def _today_blocks(user_id: str, now: datetime) -> list[dict]:
    today = str(date.today())
    result = (
        supabase.table("tasks")
        .select("title, task_type, status, start_time")
        .eq("user_id", user_id)
        .eq("scheduled_date", today)
        .neq("status", "done")
        .order("start_time", desc=False)
        .limit(5)
        .execute()
    )
    blocks = []
    for row in (result.data or []):
        start = row.get("start_time")
        time_label = start[:5] if start else "—"
        is_active = row.get("status") == "progress"
        blocks.append({
            "time": time_label,
            "title": row["title"],
            "type": _TYPE_LABEL.get(row.get("task_type", "task"), "Tarefa"),
            "active": is_active,
        })
    return blocks
