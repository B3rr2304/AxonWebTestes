import os

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse

from database import supabase, supabase_auth
from auth_helper import get_current_user
from models.schemas import GoogleConnectResponse
from services import google_service

router = APIRouter(prefix="/auth/google", tags=["google-auth"])


@router.get("")
def google_login():
    state = google_service.generate_and_store_state()
    return RedirectResponse(google_service.build_auth_url(state))


@router.get("/connect", response_model=GoogleConnectResponse)
def google_connect(current_user: dict = Depends(get_current_user)):
    """
    Inicia o fluxo de conexão do Google Agenda para um usuário JÁ logado
    (ex.: quem entrou com email/senha). Amarra o state ao user_id.
    """
    state = google_service.store_connect_state(current_user["id"])
    return GoogleConnectResponse(auth_url=google_service.build_auth_url(state))


def _handle_connect_callback(code: str, state: str, frontend_url: str) -> RedirectResponse:
    """Fluxo 'conectar agenda' (usuário já logado). Reusa o redirect_uri do login."""
    user_id = google_service.consume_connect_state(state)
    if user_id is None:
        return RedirectResponse(f"{frontend_url}/planning?google=error")
    try:
        tokens = google_service.exchange_code(code)
        refresh_token = tokens.get("refresh_token")
        if not refresh_token:
            return RedirectResponse(f"{frontend_url}/planning?google=error")
        supabase.table("profiles").update(
            {"google_refresh_token": refresh_token}
        ).eq("id", user_id).execute()
        return RedirectResponse(f"{frontend_url}/planning?google=connected")
    except Exception:
        return RedirectResponse(f"{frontend_url}/planning?google=error")


@router.get("/callback")
def google_callback(code: str = None, error: str = None, state: str = None):
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

    if error or not code:
        return RedirectResponse(f"{frontend_url}/login?error=google_denied")

    # Fluxo "conectar agenda" (usuário já logado) — state com prefixo connect_
    if state and state.startswith("connect_"):
        return _handle_connect_callback(code, state, frontend_url)

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
