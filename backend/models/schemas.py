from pydantic import BaseModel, EmailStr
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
