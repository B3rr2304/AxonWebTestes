from datetime import datetime, date, timedelta

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from auth_helper import get_current_user
from database import supabase
from models.schemas import DailyLogCreate, DailyLogResponse
from services import memory_service, user_tz, calibration_service

router = APIRouter(prefix="/daily-log", tags=["daily-log"])


def _calc_hours_slept(sleep_time: str, wake_time: str) -> float | None:
    """Calcula horas dormidas a partir dos horários no formato HH:MM.
    Se wake_time <= sleep_time, assume que acordou no dia seguinte."""
    try:
        sh, sm = map(int, sleep_time.split(":"))
        wh, wm = map(int, wake_time.split(":"))
        sleep_min = sh * 60 + sm
        wake_min  = wh * 60 + wm
        if wake_min <= sleep_min:
            wake_min += 24 * 60
        return round((wake_min - sleep_min) / 60, 1)
    except Exception:
        return None


def _serialize(row: dict) -> dict:
    """Garante que campos array/jsonb viram listas e não None."""
    for field in ("sleep_tags", "mood_tags", "productivity_tags", "peak_periods"):
        row[field] = row.get(field) or []
    return row


@router.post("/", response_model=DailyLogResponse)
def upsert_daily_log(
    body: DailyLogCreate,
    x_timezone: str | None = Header(default=None),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    tz_name = user_tz.resolve(user_id, x_timezone)
    now_date = datetime.now(user_tz.zone(tz_name)).date()

    # Registro retroativo: só ontem é aceito. A checagem mora aqui (e não no
    # schema) porque "ontem" depende do fuso do usuário — ver DailyLogCreate.
    if body.date:
        target = date.fromisoformat(body.date)
        if target != now_date - timedelta(days=1):
            raise HTTPException(
                status_code=400, detail="só é permitido registrar ontem"
            )
        today = body.date
    else:
        today = str(now_date)

    hours_slept = None
    if body.sleep_time and body.wake_time:
        hours_slept = _calc_hours_slept(body.sleep_time, body.wake_time)

    payload = {
        "user_id":             user_id,
        "date":                today,
        "sleep_time":          body.sleep_time,
        "wake_time":           body.wake_time,
        "hours_slept":         hours_slept,
        "sleep_rating":        body.sleep_rating,
        "sleep_tags":          body.sleep_tags,
        "mood_rating":         body.mood_rating,
        "mood_tags":           body.mood_tags,
        "productivity_rating": body.productivity_rating,
        "productivity_tags":   body.productivity_tags,
        "peak_periods":        body.peak_periods,
        "exercised":           body.exercised,
        "notes":               body.notes,
    }

    result = (
        supabase.table("daily_logs")
        .upsert(payload, on_conflict="user_id,date")
        .execute()
    )

    # Sincroniza a nota como memória do agente: editar atualiza a mesma
    # memória, apagar a nota a remove — uma única memória por dia.
    prefix = f"Registro do dia {today}:"
    note = body.notes.strip() if body.notes else None
    memory_service.sync_dated_memory(
        user_id, prefix, f"{prefix} {note}" if note else None
    )

    # Calibra o perfil de energia personalizado do usuário (falha silenciosa).
    profile_res = supabase.table("profiles").select("chronotype").eq("id", user_id).single().execute()
    chronotype = (profile_res.data or {}).get("chronotype") or "Misto"
    calibration_service.calibrate_from_log(user_id, chronotype, result.data[0])

    return _serialize(result.data[0])


@router.get("/today", response_model=DailyLogResponse | None)
def get_today(
    x_timezone: str | None = Header(default=None),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    tz_name = user_tz.resolve(user_id, x_timezone)
    today   = str(datetime.now(user_tz.zone(tz_name)).date())

    result = (
        supabase.table("daily_logs")
        .select("*")
        .eq("user_id", user_id)
        .eq("date", today)
        .limit(1)
        .execute()
    )

    if not result.data:
        return None

    return _serialize(result.data[0])


@router.get("/yesterday", response_model=DailyLogResponse | None)
def get_yesterday(
    x_timezone: str | None = Header(default=None),
    current_user: dict = Depends(get_current_user),
):
    """Registro de ontem (no fuso do usuário) ou None se ainda não preenchido."""
    user_id   = current_user["id"]
    tz_name   = user_tz.resolve(user_id, x_timezone)
    yesterday = str(datetime.now(user_tz.zone(tz_name)).date() - timedelta(days=1))

    result = (
        supabase.table("daily_logs")
        .select("*")
        .eq("user_id", user_id)
        .eq("date", yesterday)
        .limit(1)
        .execute()
    )

    if not result.data:
        return None

    return _serialize(result.data[0])


@router.get("/history", response_model=list[DailyLogResponse])
def get_history(
    days: int = Query(default=30, ge=7, le=90),
    x_timezone: str | None = Header(default=None),
    current_user: dict = Depends(get_current_user),
):
    user_id  = current_user["id"]
    tz_name  = user_tz.resolve(user_id, x_timezone)
    today    = datetime.now(user_tz.zone(tz_name)).date()
    since    = str(today - timedelta(days=days - 1))

    result = (
        supabase.table("daily_logs")
        .select("*")
        .eq("user_id", user_id)
        .gte("date", since)
        .order("date", desc=False)
        .execute()
    )

    return [_serialize(row) for row in (result.data or [])]
