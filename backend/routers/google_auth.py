import os
from urllib.parse import urlencode

from fastapi import APIRouter
from fastapi.responses import RedirectResponse

from database import supabase
from services import google_service

router = APIRouter(prefix="/auth/google", tags=["google-auth"])


@router.get("")
def google_login():
    return RedirectResponse(google_service.build_auth_url())


@router.get("/callback")
def google_callback(code: str = None, error: str = None, state: str = None):
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

    if error or not code:
        return RedirectResponse(f"{frontend_url}/login?error=google_denied")

    try:
        tokens = google_service.exchange_code(code)
        access_token = tokens["access_token"]
        refresh_token = tokens.get("refresh_token")
        id_token = tokens.get("id_token")

        user_info = google_service.get_user_info(access_token)
        email = user_info["email"]
        name = user_info.get("name", "")

        supabase_session = supabase.auth.sign_in_with_id_token({
            "provider": "google",
            "token": id_token,
        })

        user_id = supabase_session.user.id
        supabase_access = supabase_session.session.access_token
        supabase_refresh = supabase_session.session.refresh_token

        update = {"id": user_id, "name": name, "email": email}
        if refresh_token:
            update["google_refresh_token"] = refresh_token
        update["google_access_token"] = access_token

        supabase.table("profiles").upsert(update).execute()

        profile = supabase.table("profiles").select("chronotype").eq("id", user_id).single().execute()
        has_chronotype = bool((profile.data or {}).get("chronotype"))

        params = urlencode({
            "access_token": supabase_access,
            "refresh_token": supabase_refresh,
            "user_id": user_id,
            "email": email,
            "name": name,
            "has_chronotype": "true" if has_chronotype else "false",
        })
        return RedirectResponse(f"{frontend_url}/auth/callback?{params}")

    except Exception as exc:
        params = urlencode({"error": str(exc)})
        return RedirectResponse(f"{frontend_url}/login?{params}")
