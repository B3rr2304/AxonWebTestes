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
_pending_connects: dict[str, tuple[str, float]] = {}   # state -> (user_id, timestamp)

_CALENDAR_BASE = "https://www.googleapis.com/calendar/v3/calendars/primary/events"


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


def store_connect_state(user_id: str) -> str:
    """Gera um state amarrado ao user_id logado, para o fluxo 'conectar agenda'."""
    _cleanup(_pending_connects, _STATE_TTL)
    state = "connect_" + secrets.token_urlsafe(16)
    _pending_connects[state] = (user_id, time.time())
    return state


def consume_connect_state(state: str) -> str | None:
    """Valida o state de connect e devolve o user_id associado (ou None)."""
    entry = _pending_connects.pop(state, None)
    if entry is None:
        return None
    user_id, ts = entry
    if (time.time() - ts) > _STATE_TTL:
        return None
    return user_id


def store_session(data: dict) -> str:
    _cleanup(_pending_sessions, _SESSION_TTL)
    code = secrets.token_urlsafe(32)
    _pending_sessions[code] = (data, time.time())
    return code


# Janela de "graça" após o primeiro consumo: o React em modo dev (StrictMode)
# dispara o efeito 2x, então o código é trocado duas vezes em sequência. Permitir
# reler por alguns segundos evita o falso "código inválido" sem deixar o código
# reutilizável de verdade (após a graça, ele é descartado).
_SESSION_GRACE = 20

_consumed_sessions: dict[str, tuple[dict, float]] = {}  # code -> (dados, consumed_ts)


def consume_session(code: str) -> dict | None:
    _cleanup(_consumed_sessions, _SESSION_GRACE)

    # Já consumido recentemente? Devolve de novo dentro da janela de graça.
    consumed = _consumed_sessions.get(code)
    if consumed is not None:
        data, consumed_ts = consumed
        if (time.time() - consumed_ts) <= _SESSION_GRACE:
            return data
        _consumed_sessions.pop(code, None)
        return None

    entry = _pending_sessions.pop(code, None)
    if entry is None:
        return None
    data, ts = entry
    if (time.time() - ts) > _SESSION_TTL:
        return None

    # Marca como consumido e mantém disponível pela janela de graça.
    _consumed_sessions[code] = (data, time.time())
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


# ---------------------------------------------------------------------------
# Google Calendar API
# ---------------------------------------------------------------------------

def refresh_access_token(refresh_token: str) -> str:
    """Troca o refresh_token por um access_token novo (válido ~1h)."""
    with httpx.Client() as client:
        resp = client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": _client_id(),
                "client_secret": _client_secret(),
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            },
        )
    resp.raise_for_status()
    return resp.json()["access_token"]


def create_calendar_event(access_token: str, event_body: dict) -> str:
    """Cria um evento na agenda primária e retorna o id do evento."""
    with httpx.Client() as client:
        resp = client.post(
            _CALENDAR_BASE,
            headers={"Authorization": f"Bearer {access_token}"},
            json=event_body,
        )
    resp.raise_for_status()
    return resp.json()["id"]


def update_calendar_event(access_token: str, event_id: str, event_body: dict) -> None:
    with httpx.Client() as client:
        resp = client.patch(
            f"{_CALENDAR_BASE}/{event_id}",
            headers={"Authorization": f"Bearer {access_token}"},
            json=event_body,
        )
    resp.raise_for_status()


def delete_calendar_event(access_token: str, event_id: str) -> None:
    with httpx.Client() as client:
        resp = client.delete(
            f"{_CALENDAR_BASE}/{event_id}",
            headers={"Authorization": f"Bearer {access_token}"},
        )
    # 410 = já removido; tratamos como sucesso
    if resp.status_code not in (200, 204, 410):
        resp.raise_for_status()
