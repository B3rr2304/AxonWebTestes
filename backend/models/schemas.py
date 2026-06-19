from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import date, time


# --- Auth ---

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: str
    email: str
    name: Optional[str] = None
    has_chronotype: bool = False


# --- Classify ---

class ClassifyRequest(BaseModel):
    respostas: dict[str, str]
    qualidade_sono: str
    schedule_type: Optional[str] = None  # 'flexible' | 'fixed'


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
    schedule_type: Optional[str] = None
    has_chronotype: bool = False


# --- Tasks ---

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    task_type: str = "task"          # 'task' | 'event' | 'routine'
    priority: Optional[str] = "medium"  # 'low' | 'medium' | 'high'
    scheduled_date: Optional[date] = None
    end_date: Optional[date] = None
    start_time: Optional[str] = None   # "HH:MM"
    end_time: Optional[str] = None     # "HH:MM"
    recurrence: Optional[str] = None   # 'daily' | 'weekly' | 'monthly'
    location: Optional[str] = None
    parent_task_id: Optional[str] = None
    group_name: Optional[str] = None
    deadline: Optional[date] = None
    created_by: str = "user"           # 'user' | 'agent'


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    task_type: Optional[str] = None
    status: Optional[str] = None       # 'todo' | 'progress' | 'done' | 'scheduled'
    priority: Optional[str] = None
    scheduled_date: Optional[date] = None
    end_date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    progress: Optional[int] = None
    recurrence: Optional[str] = None
    location: Optional[str] = None
    group_name: Optional[str] = None
    deadline: Optional[date] = None


class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    task_type: str
    status: str
    priority: Optional[str] = None
    scheduled_date: Optional[str] = None
    end_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    progress: int = 0
    recurrence: Optional[str] = None
    location: Optional[str] = None
    parent_task_id: Optional[str] = None
    group_name: Optional[str] = None
    deadline: Optional[str] = None
    created_by: str
    created_at: str


# --- Conversations ---

class ConversationCreate(BaseModel):
    title: str
    type: str = "general"  # general | planning | focus | project
    project_id: Optional[str] = None


class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    archived: Optional[bool] = None
    type: Optional[str] = None
    project_id: Optional[str] = None


class ConversationResponse(BaseModel):
    id: str
    title: str
    type: str
    archived: bool
    project_id: Optional[str] = None
    created_at: str
    last_message: Optional[str] = None
    message_count: int = 0


# --- Chat Projects ---

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    conversation_count: int = 0
    created_at: str
    updated_at: str


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


# --- Notifications ---

class NotificationAction(BaseModel):
    task_id: str
    new_date: Optional[str] = None
    new_start_time: Optional[str] = None
    new_end_time: Optional[str] = None
    reason: Optional[str] = None


class NotificationResponse(BaseModel):
    id: str
    type: str       # 'simple' | 'improvement' | 'change'
    title: str
    body: str
    status: str     # 'unread' | 'read' | 'accepted' | 'rejected'
    action: Optional[dict] = None
    created_at: str


class NotificationCountResponse(BaseModel):
    unread: int


class NotificationAnalyzeResponse(BaseModel):
    analyzed: bool
    notification: Optional[NotificationResponse] = None


# --- Google Calendar ---

class GoogleConnectResponse(BaseModel):
    auth_url: str


# --- Daily Log ---

class DailyLogCreate(BaseModel):
    sleep_time:          Optional[str] = None   # "23:30"
    wake_time:           Optional[str] = None   # "07:00"
    sleep_rating:        Optional[int] = None   # 1–5
    sleep_tags:          list[str]     = []     # ["agitado", "interrompido"]
    mood_rating:         Optional[int] = None   # 1–5
    mood_tags:           list[str]     = []     # ["ansioso", "tranquilo"]
    productivity_rating: Optional[int] = None   # 1–5
    productivity_tags:   list[str]     = []     # ["em_flow"]
    exercised:           Optional[bool] = None
    notes:               Optional[str]  = None

    @field_validator("sleep_rating", "mood_rating", "productivity_rating")
    @classmethod
    def _rating_entre_1_e_5(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (1 <= v <= 5):
            raise ValueError("rating deve estar entre 1 e 5")
        return v

    @field_validator("sleep_tags", "mood_tags", "productivity_tags")
    @classmethod
    def _no_maximo_3_tags(cls, v: list[str]) -> list[str]:
        if len(v) > 3:
            raise ValueError("máximo de 3 tags por campo")
        return v


class DailyLogResponse(BaseModel):
    id:                  str
    date:                str
    sleep_time:          Optional[str]  = None
    wake_time:           Optional[str]  = None
    hours_slept:         Optional[float] = None
    sleep_rating:        Optional[int]  = None
    sleep_tags:          list[str]      = []
    mood_rating:         Optional[int]  = None
    mood_tags:           list[str]      = []
    productivity_rating: Optional[int]  = None
    productivity_tags:   list[str]      = []
    exercised:           Optional[bool] = None
    notes:               Optional[str]  = None
    created_at:          str
    updated_at:          str
