from datetime import datetime
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
    "Misto": "intermediate",
    "Bimodal": "intermediate",
    # chaves em inglês mapeiam para elas mesmas
    "morning": "morning",
    "evening": "evening",
    "night": "night",
    "intermediate": "intermediate",
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
        "greeting": _greeting(hour),
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
        "day_blocks": [],
    }
