import time
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from models.schemas import ProfileResponse, ProfileUpdate, TagItem, TagPreferences, PlanningPreferences
from auth_helper import get_current_user
from database import supabase
from services import chronotype as chronotype_service

router = APIRouter(prefix="/profile", tags=["profile"])

AVATAR_BUCKET = "avatars"

# Tags padrão — espelham dayReviewTags.ts do frontend
_DEFAULT_TAGS = TagPreferences(
    sleep=[
        TagItem(slug="revigorante",       label="Revigorante"),
        TagItem(slug="bom",               label="Bom"),
        TagItem(slug="normal",            label="Normal"),
        TagItem(slug="agitado",           label="Agitado"),
        TagItem(slug="acordei_cansado",   label="Acordei cansado"),
        TagItem(slug="interrompido",      label="Interrompido"),
        TagItem(slug="quase_nao_dormi",   label="Quase não dormi"),
        TagItem(slug="acordei_cedo",      label="Acordei cedo demais"),
    ],
    mood=[
        TagItem(slug="animado",      label="Animado"),
        TagItem(slug="tranquilo",    label="Tranquilo"),
        TagItem(slug="motivado",     label="Motivado"),
        TagItem(slug="ansioso",      label="Ansioso"),
        TagItem(slug="estressado",   label="Estressado"),
        TagItem(slug="desmotivado",  label="Desmotivado"),
        TagItem(slug="irritado",     label="Irritado"),
    ],
    productivity=[
        TagItem(slug="em_flow",              label="Em flow"),
        TagItem(slug="foco_bom",             label="Foco bom"),
        TagItem(slug="distraido",            label="Muitas distrações"),
        TagItem(slug="interrompido",         label="Interrompido"),
        TagItem(slug="tarefas_leves",        label="Só tarefas leves"),
        TagItem(slug="reunioes_demais",      label="Reuniões demais"),
        TagItem(slug="produtivo_esgotante",  label="Produtivo mas esgotante"),
    ],
)
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def _build_profile_response(data: dict, current_user: dict) -> ProfileResponse:
    chronotype_key = data.get("chronotype")
    meta = chronotype_service.CHRONOTYPE_META.get(
        chronotype_key or "intermediate",
        chronotype_service.CHRONOTYPE_META["intermediate"],
    )
    return ProfileResponse(
        name=data.get("name"),
        email=data.get("email") or current_user["email"],
        chronotype=chronotype_key,
        chronotype_label=meta["label"] if chronotype_key else None,
        energy_peak=meta["energy_peak"] if chronotype_key else None,
        focus_window=meta["focus_window"] if chronotype_key else None,
        schedule_type=data.get("schedule_type"),
        avatar_url=data.get("avatar_url"),
        has_chronotype=bool(chronotype_key),
    )


def _fetch_profile_data(user_id: str) -> dict:
    result = (
        supabase.table("profiles")
        .select("name, email, chronotype, schedule_type, avatar_url")
        .eq("id", user_id)
        .single()
        .execute()
    )
    return result.data or {}


@router.get("", response_model=ProfileResponse)
def get_profile(current_user: dict = Depends(get_current_user)):
    data = _fetch_profile_data(current_user["id"])
    return _build_profile_response(data, current_user)


@router.patch("", response_model=ProfileResponse)
def update_profile(body: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]

    updates: dict = {}
    if body.name is not None:
        name = body.name.strip()
        if not name:
            raise HTTPException(status_code=422, detail="Nome não pode ser vazio.")
        updates["name"] = name

    if updates:
        supabase.table("profiles").update(updates).eq("id", user_id).execute()

    data = _fetch_profile_data(user_id)
    return _build_profile_response(data, current_user)


@router.post("/avatar", response_model=ProfileResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=422,
            detail="Formato inválido. Use JPEG, PNG ou WebP.",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=422, detail="Imagem muito grande. Máximo 5 MB.")

    ext = file.content_type.split("/")[1]  # jpeg | png | webp
    storage_path = f"{user_id}/avatar.{ext}"

    try:
        # Remove versões antigas (outros formatos) antes de fazer upload
        for old_ext in ALLOWED_CONTENT_TYPES:
            old_path = f"{user_id}/avatar.{old_ext.split('/')[1]}"
            if old_path != storage_path:
                try:
                    supabase.storage.from_(AVATAR_BUCKET).remove([old_path])
                except Exception:
                    pass

        supabase.storage.from_(AVATAR_BUCKET).upload(
            path=storage_path,
            file=contents,
            file_options={"content-type": file.content_type, "upsert": "true"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar imagem: {str(e)}")

    public_url = supabase.storage.from_(AVATAR_BUCKET).get_public_url(storage_path)
    # Cache-bust com timestamp para garantir que o browser recarregue
    avatar_url = f"{public_url}?t={int(time.time())}"

    supabase.table("profiles").update({"avatar_url": avatar_url}).eq("id", user_id).execute()

    data = _fetch_profile_data(user_id)
    return _build_profile_response(data, current_user)


@router.delete("/avatar", response_model=ProfileResponse)
def delete_avatar(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]

    # Tenta remover todos os formatos possíveis do bucket
    paths = [f"{user_id}/avatar.{ext}" for ext in ("jpeg", "png", "webp")]
    try:
        supabase.storage.from_(AVATAR_BUCKET).remove(paths)
    except Exception:
        pass

    supabase.table("profiles").update({"avatar_url": None}).eq("id", user_id).execute()

    data = _fetch_profile_data(user_id)
    return _build_profile_response(data, current_user)


# --- Planning preferences ---

@router.get("/planning", response_model=PlanningPreferences)
def get_planning_preferences(current_user: dict = Depends(get_current_user)):
    res = (
        supabase.table("profiles")
        .select("daily_planning_enabled, daily_planning_time, weekly_planning_enabled, weekly_planning_day, planning_use_chronotype")
        .eq("id", current_user["id"])
        .single()
        .execute()
    )
    d = res.data or {}
    return PlanningPreferences(
        daily_planning_enabled=d["daily_planning_enabled"]  if d.get("daily_planning_enabled")  is not None else True,
        daily_planning_time=d.get("daily_planning_time"),
        weekly_planning_enabled=d["weekly_planning_enabled"] if d.get("weekly_planning_enabled") is not None else True,
        weekly_planning_day=d.get("weekly_planning_day"),
        planning_use_chronotype=d["planning_use_chronotype"] if d.get("planning_use_chronotype") is not None else True,
    )


@router.put("/planning", response_model=PlanningPreferences)
def update_planning_preferences(body: PlanningPreferences, current_user: dict = Depends(get_current_user)):
    supabase.table("profiles").update({
        "daily_planning_enabled":  body.daily_planning_enabled,
        "daily_planning_time":     body.daily_planning_time,
        "weekly_planning_enabled": body.weekly_planning_enabled,
        "weekly_planning_day":     body.weekly_planning_day,
        "planning_use_chronotype": body.planning_use_chronotype,
    }).eq("id", current_user["id"]).execute()
    return body


# --- Tag preferences ---

@router.get("/tags", response_model=TagPreferences)
def get_tags(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    result = (
        supabase.table("profiles")
        .select("custom_tags")
        .eq("id", user_id)
        .single()
        .execute()
    )
    custom = (result.data or {}).get("custom_tags")
    if not custom:
        return _DEFAULT_TAGS

    return TagPreferences(
        sleep=[TagItem(**t) for t in custom.get("sleep", [])],
        mood=[TagItem(**t) for t in custom.get("mood", [])],
        productivity=[TagItem(**t) for t in custom.get("productivity", [])],
    )


@router.put("/tags", response_model=TagPreferences)
def update_tags(body: TagPreferences, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]

    for category, items in [("sleep", body.sleep), ("mood", body.mood), ("productivity", body.productivity)]:
        for item in items:
            if not item.label.strip():
                raise HTTPException(status_code=422, detail=f"Tag em '{category}' não pode ter label vazio.")
            if len(item.label) > 40:
                raise HTTPException(status_code=422, detail=f"Label de tag muito longo (máx 40 caracteres).")

    payload = {
        "sleep":        [t.model_dump() for t in body.sleep],
        "mood":         [t.model_dump() for t in body.mood],
        "productivity": [t.model_dump() for t in body.productivity],
    }
    supabase.table("profiles").update({"custom_tags": payload}).eq("id", user_id).execute()
    return body
