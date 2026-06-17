import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse

from database import supabase, supabase_auth
from services import google_service

router = APIRouter(prefix="/auth/google", tags=["google-auth"])


@router.get("")
def google_login():
    state = google_service.generate_and_store_state()
    return RedirectResponse(google_service.build_auth_url(state))


@router.get("/callback")
def google_callback(code: str = None, error: str = None, state: str = None):
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

    if error or not code:
        return RedirectResponse(f"{frontend_url}/login?error=google_denied")

    if not state or not google_service.verify_and_consume_state(state):
        return RedirectResponse(f"{frontend_url}/login?error=invalid_state")

    try:
        tokens = google_service.exchange_code(code)
        access_token = tokens["access_token"]
        refresh_token = tokens.get("refresh_token")
        id_token = tokens.get("id_token")

        user_info = google_service.get_user_info(access_token)
        email = user_info["email"]
        name = user_info.get("name", "")

        supabase_session = supabase_auth.auth.sign_in_with_id_token({
            "provider": "google",
            "token": id_token,
        })

        user_id = supabase_session.user.id
        supabase_access = supabase_session.session.access_token
        supabase_refresh = supabase_session.session.refresh_token

        update = {"id": user_id, "name": name, "email": email}
        if refresh_token:
            update["google_refresh_token"] = refresh_token

        supabase.table("profiles").upsert(update).execute()

        profile = supabase.table("profiles").select("chronotype").eq("id", user_id).single().execute()
        has_chronotype = bool((profile.data or {}).get("chronotype"))

        # Armazena a sessão temporariamente e redireciona com código de uso único
        session_code = google_service.store_session({
            "access_token": supabase_access,
            "refresh_token": supabase_refresh,
            "user_id": user_id,
            "email": email,
            "name": name,
            "has_chronotype": has_chronotype,
        })

        return RedirectResponse(f"{frontend_url}/auth/callback?session_code={session_code}")

    except Exception:
        return RedirectResponse(f"{frontend_url}/login?error=authentication_failed")


@router.get("/session")
def exchange_session_code(code: str):
    data = google_service.consume_session(code)
    if data is None:
        raise HTTPException(status_code=400, detail="Código inválido ou expirado")
    return data
