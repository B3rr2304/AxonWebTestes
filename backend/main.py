import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from routers import classify, chat, conversations, auth, profile, google_auth, tasks, dashboard, notifications
from limiter import limiter

_env = os.getenv("ENV", "production")
app = FastAPI(
    title="Axon API",
    docs_url="/docs" if _env == "development" else None,
    redoc_url="/redoc" if _env == "development" else None,
    openapi_url="/openapi.json" if _env == "development" else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Em Codespaces, o domínio muda a cada reinício — permite tudo em dev
_is_codespace = "app.github.dev" in FRONTEND_URL
_origins = ["*"] if _is_codespace else [FRONTEND_URL, "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=not _is_codespace,  # credentials=True é incompatível com origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(classify.router)
app.include_router(conversations.router)
app.include_router(chat.router)
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(google_auth.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)
app.include_router(notifications.router)


@app.get("/")
def root():
    return {"status": "ok"}
