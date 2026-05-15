from pydantic import BaseModel, EmailStr
from typing import Optional


# --- Auth ---

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: str
    email: str
    name: Optional[str] = None
    has_chronotype: bool = False


# --- Chronotype ---

# --- Classify ---

class ClassifyRequest(BaseModel):
    respostas: dict[str, str]
    qualidade_sono: str


class ClassifyResponse(BaseModel):
    cronotipo: str
    pontos: dict[str, int]


# --- Profile ---

class ProfileResponse(BaseModel):
    name: Optional[str] = None
    email: str
    chronotype: Optional[str] = None
    chronotype_label: Optional[str] = None
    energy_peak: Optional[str] = None
    focus_window: Optional[str] = None
    has_chronotype: bool = False


# --- Conversations ---

class ConversationCreate(BaseModel):
    title: str
    type: str = "general"  # general | planning | focus | project


class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    archived: Optional[bool] = None


class ConversationResponse(BaseModel):
    id: str
    title: str
    type: str
    archived: bool
    created_at: str
    last_message: Optional[str] = None
    message_count: int = 0


# --- Chat ---

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
