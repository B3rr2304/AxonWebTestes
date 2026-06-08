import os
import time
import secrets
from urllib.parse import urlencode
import httpx

SCOPES = " ".join([
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/calendar.events",
])

_STATE_TTL = 600    # 10 min para o usuário completar o login no Google
_SESSION_TTL = 300  # 5 min para o frontend trocar o código pelos tokens

_pending_states: dict[str, float] = {}           # state -> timestamp
_pending_sessions: dict[str, tuple[dict, float]] = {}  # code -> (dados, timestamp)


def _cleanup(store: dict, ttl: float) -> None:
    now = time.time()
    expired = [k for k, v in list(store.items()) if now - (v[1] if isinstance(v, tuple) else v) > ttl]
    for k in expired:
        del store[k]


def generate_and_store_state() -> str:
    _cleanup(_pending_states, _STATE_TTL)
    state = secrets.token_urlsafe(16)
    _pending_states[state] = time.time()
    return state


def verify_and_consume_state(state: str) -> bool:
    ts = _pending_states.pop(state, None)
    if ts is None:
        return False
    return (time.time() - ts) <= _STATE_TTL


def store_session(data: dict) -> str:
    _cleanup(_pending_sessions, _SESSION_TTL)
    code = secrets.token_urlsafe(32)
    _pending_sessions[code] = (data, time.time())
    return code


def consume_session(code: str) -> dict | None:
    entry = _pending_sessions.pop(code, None)
    if entry is None:
        return None
    data, ts = entry
    if (time.time() - ts) > _SESSION_TTL:
        return None
    return data


def _client_id() -> str:
    return os.getenv("GOOGLE_CLIENT_ID", "")


def _client_secret() -> str:
    return os.getenv("GOOGLE_CLIENT_SECRET", "")


def _redirect_uri() -> str:
    return os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")


def build_auth_url(state: str) -> str:
    params = {
        "client_id": _client_id(),
        "redirect_uri": _redirect_uri(),
        "response_type": "code",
        "scope": SCOPES,
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
    }
    return "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)


def exchange_code(code: str) -> dict:
    with httpx.Client() as client:
        resp = client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": _client_id(),
                "client_secret": _client_secret(),
                "redirect_uri": _redirect_uri(),
                "grant_type": "authorization_code",
            },
        )
    resp.raise_for_status()
    return resp.json()


def get_user_info(access_token: str) -> dict:
    with httpx.Client() as client:
        resp = client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
    resp.raise_for_status()
    return resp.json()
