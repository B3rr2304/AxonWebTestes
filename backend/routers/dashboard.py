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
    "Misto": "intermediate",
    "Bimodal": "bimodal",
    "morning": "morning",
    "evening": "evening",
    "night": "night",
    "intermediate": "intermediate",
    "bimodal": "bimodal",
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
        "next_focus": _next_focus_block(curve_key, hour),
        "current_block": _get_block(curve_key, hour, offset=0),
        "next_block": _get_block(curve_key, hour, offset=1),
        "day_blocks": _today_blocks(user_id, now),
    }


# Níveis que qualificam como "janela de foco recomendada" no card do dashboard.
_FOCUS_LEVELS = {"foco_moderado", "foco_profundo", "pico"}


def _get_block(curve_key: str, current_hour: int, offset: int = 0) -> dict:
    """Retorna o bloco atual (offset=0) ou o próximo (offset=1)."""
    blocks = chronotype_service.CHRONOTYPE_BLOCKS.get(
        curve_key, chronotype_service.CHRONOTYPE_BLOCKS["intermediate"]
    )
    idx = ((current_hour * 60) // 90 + offset) % 16
    level, description = blocks[idx]
    start, end = _block_times(idx)
    return {
        "index": idx,
        "start": start,
        "end": end,
        "level": level,
        "level_label": chronotype_service.BLOCK_LEVELS[level]["label"],
        "description": description,
    }


def _block_times(idx: int) -> tuple[str, str]:
    start_min = idx * 90
    end_min = (idx + 1) * 90
    start = f"{start_min // 60:02d}:{start_min % 60:02d}"
    end = f"{(end_min % 1440) // 60:02d}:{end_min % 60:02d}"
    return start, end


def _next_focus_block(curve_key: str, current_hour: int) -> dict | None:
    """
    Retorna a janela de foco ativa ou a próxima, com base nos 16 blocos de 90 min
    do cronotipo do usuário. O bloco atual é ativo se seu nível for foco_moderado,
    foco_profundo ou pico; caso contrário, avança para encontrar o próximo.
    """
    blocks = chronotype_service.CHRONOTYPE_BLOCKS.get(
        curve_key, chronotype_service.CHRONOTYPE_BLOCKS["intermediate"]
    )
    current_idx = (current_hour * 60) // 90

    # Bloco atual é uma janela de foco?
    level, desc = blocks[current_idx]
    if level in _FOCUS_LEVELS:
        start, end = _block_times(current_idx)
        return {"start": start, "end": end, "label": desc, "status": "active", "hours_until": 0}

    # Próximo bloco de foco ainda hoje.
    for i in range(current_idx + 1, 16):
        level, desc = blocks[i]
        if level in _FOCUS_LEVELS:
            start, end = _block_times(i)
            hours_until = max(1, round((i * 90 - current_hour * 60) / 60))
            return {"start": start, "end": end, "label": desc, "status": "upcoming", "hours_until": hours_until}

    # Nenhum hoje — primeiro bloco de foco de amanhã.
    for i in range(0, 16):
        level, desc = blocks[i]
        if level in _FOCUS_LEVELS:
            start, end = _block_times(i)
            hours_until = round(((16 - current_idx) * 90 + i * 90) / 60)
            return {"start": start, "end": end, "label": desc, "status": "tomorrow", "hours_until": hours_until}

    return None


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
