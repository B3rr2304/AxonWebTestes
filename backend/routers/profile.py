from fastapi import APIRouter, Depends
from models.schemas import ProfileResponse
from auth_helper import get_current_user
from database import supabase
from services import chronotype as chronotype_service

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=ProfileResponse)
def get_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]

    profile = supabase.table("profiles").select("name, email, chronotype").eq("id", user_id).single().execute()
    data = profile.data or {}

    chronotype_key = data.get("chronotype")
    meta = chronotype_service.CHRONOTYPE_META.get(chronotype_key or "intermediate", chronotype_service.CHRONOTYPE_META["intermediate"])

    return ProfileResponse(
        name=data.get("name"),
        email=data.get("email") or current_user["email"],
        chronotype=chronotype_key,
        chronotype_label=meta["label"] if chronotype_key else None,
        energy_peak=meta["energy_peak"] if chronotype_key else None,
        focus_window=meta["focus_window"] if chronotype_key else None,
        has_chronotype=bool(chronotype_key),
    )
