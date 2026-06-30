from fastapi import APIRouter, HTTPException, Request, status
from models.schemas import RegisterRequest, LoginRequest, RefreshRequest, AuthResponse
from database import supabase, supabase_auth
from limiter import limiter
from services import account_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register(request: Request, body: RegisterRequest):
    blocked = account_service.check_email_blocked(body.email)
    if blocked:
        from datetime import datetime, timezone
        can_reuse = datetime.fromisoformat(blocked["can_reuse_at"])
        days_left = (can_reuse - datetime.now(timezone.utc)).days + 1
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Este e-mail poderá ser utilizado novamente apenas após {days_left} dias. "
                   f"Data disponível: {can_reuse.strftime('%d/%m/%Y')}.",
        )

    try:
        res = supabase_auth.auth.sign_up({"email": body.email, "password": body.password})
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Não foi possível criar a conta")

    if res.user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Não foi possível criar a conta")

    user_id = res.user.id

    supabase.table("profiles").upsert({
        "id": user_id,
        "name": body.name,
        "email": body.email,
    }).execute()

    return AuthResponse(
        access_token=res.session.access_token,
        refresh_token=res.session.refresh_token,
        user_id=user_id,
        email=body.email,
        name=body.name,
        has_chronotype=False,
    )


@router.post("/login", response_model=AuthResponse)
@limiter.limit("10/minute")
def login(request: Request, body: LoginRequest):
    try:
        res = supabase_auth.auth.sign_in_with_password({"email": body.email, "password": body.password})
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-mail ou senha incorretos")

    if res.user is None or res.session is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-mail ou senha incorretos")

    user_id = res.user.id

    profile = supabase.table("profiles").select("name, chronotype").eq("id", user_id).single().execute()
    profile_data = profile.data or {}

    return AuthResponse(
        access_token=res.session.access_token,
        refresh_token=res.session.refresh_token,
        user_id=user_id,
        email=body.email,
        name=profile_data.get("name"),
        has_chronotype=bool(profile_data.get("chronotype")),
    )


@router.post("/refresh", response_model=AuthResponse)
@limiter.limit("20/minute")
def refresh_session(request: Request, body: RefreshRequest):
    try:
        res = supabase_auth.auth.refresh_session(body.refresh_token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão expirada")

    if res.user is None or res.session is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão expirada")

    user_id = res.user.id
    profile = supabase.table("profiles").select("name, chronotype, email").eq("id", user_id).single().execute()
    profile_data = profile.data or {}

    return AuthResponse(
        access_token=res.session.access_token,
        refresh_token=res.session.refresh_token,
        user_id=user_id,
        email=profile_data.get("email") or res.user.email or "",
        name=profile_data.get("name"),
        has_chronotype=bool(profile_data.get("chronotype")),
    )
