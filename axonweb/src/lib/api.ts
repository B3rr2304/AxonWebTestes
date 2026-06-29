const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const token = localStorage.getItem("axon_token");

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
} 

export default apiFetch;

function getToken(): string | null {
  return localStorage.getItem("axon_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...authHeaders(),
      ...(options.headers as Record<string, string> | undefined),
    },
  });
  } catch {
    throw new Error(
      "⚠️ DEV: Backend inacessível. Abra a porta 8000 como Pública no painel de Portas do VS Code e certifique-se de que o servidor está rodando (uvicorn main:app --reload)."
    );
  }

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("axon_token");
      localStorage.removeItem("axon_refresh_token");
      localStorage.removeItem("axon_user");
      localStorage.removeItem("axon_last_active");
      window.location.href = "/login";
      throw new Error("Sessão expirada");
    }
    const error = await res.json().catch(() => ({ detail: "Erro desconhecido" }));
    throw new Error(error.detail ?? "Erro na requisição");
  }

  if (localStorage.getItem("axon_token")) {
    localStorage.setItem("axon_last_active", String(Date.now()));
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// --- Auth ---

export interface ChatProjectData {
  id: string;
  name: string;
  description?: string | null;
  conversation_count?: number;
  created_at?: string;
  updated_at?: string;
}

export async function updateChatProject(
  projectId: string,
  payload: {
    name: string;
    description?: string;
  }
) {
  return request<ChatProjectData>(`/chat/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteChatProject(projectId: string) {
  return request<void>(`/chat/projects/${projectId}`, {
    method: "DELETE",
  });
}

export async function getChatProjects() {
  return request<ChatProjectData[]>("/chat/projects");
}

export async function createChatProject(payload: {
  name: string;
  description?: string;
}) {
  return request<ChatProjectData>("/chat/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
  name?: string;
  has_chronotype: boolean;
}

export function register(name: string, email: string, password: string) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function exchangeGoogleSession(code: string) {
  return request<AuthResponse>(`/auth/google/session?code=${encodeURIComponent(code)}`);
}

export function connectGoogleCalendar() {
  return request<{ auth_url: string }>("/auth/google/connect");
}

export function logout() {
  localStorage.removeItem("axon_token");
  localStorage.removeItem("axon_refresh_token");
  localStorage.removeItem("axon_user");
  localStorage.removeItem("axon_last_active");
}

export function saveSession(res: AuthResponse) {
  localStorage.setItem("axon_token", res.access_token);
  localStorage.setItem("axon_refresh_token", res.refresh_token);
  localStorage.setItem("axon_user", JSON.stringify({ id: res.user_id, email: res.email, name: res.name }));
  localStorage.setItem("axon_last_active", String(Date.now()));
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function refreshSession(refreshToken: string) {
  return request<AuthResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

// --- Profile ---

export interface ProfileData {
  name?: string;
  email: string;
  chronotype?: string;
  chronotype_label?: string;
  energy_peak?: string;
  focus_window?: string;
  schedule_type?: string;
  avatar_url?: string;
  has_chronotype: boolean;
}

export function getProfile() {
  return request<ProfileData>("/profile");
}

export function updateProfile(payload: { name?: string }) {
  return request<ProfileData>("/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function uploadAvatar(file: File): Promise<ProfileData> {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE_URL}/profile/avatar`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Erro ao enviar imagem" }));
    throw new Error(error.detail ?? "Erro ao enviar imagem");
  }

  return res.json();
}

export function deleteAvatar(): Promise<ProfileData> {
  return request<ProfileData>("/profile/avatar", { method: "DELETE" });
}

// --- Tag preferences ---

export interface TagItem {
  slug: string;
  label: string;
}

export interface TagPreferences {
  sleep: TagItem[];
  mood: TagItem[];
  productivity: TagItem[];
}

export function getTagPreferences(): Promise<TagPreferences> {
  return request<TagPreferences>("/profile/tags");
}

export function updateTagPreferences(prefs: TagPreferences): Promise<TagPreferences> {
  return request<TagPreferences>("/profile/tags", {
    method: "PUT",
    body: JSON.stringify(prefs),
  });
}

// --- Users ---

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  chronotype?: string;
  chronotype_scores?: Record<string, number>;
}

export function getMe() {
  return request<UserProfile>("/users/me");
}

export function saveChronotype(
  chronotype: string,
  scores: Record<string, number>,
  answers: Record<string, string>
) {
  return request("/users/me/chronotype", {
    method: "PUT",
    body: JSON.stringify({ chronotype, scores, answers }),
  });
}

// --- Classify ---

export interface ClassifyResponse {
  cronotipo: string;
  pontos: Record<string, number>;
}

export function classify(
  respostas: Record<string, string>,
  qualidade_sono: string,
  schedule_type?: string
) {
  return request<ClassifyResponse>("/classify/", {
    method: "POST",
    body: JSON.stringify({ respostas, qualidade_sono, schedule_type }),
  });
}

export function classifyAndSave(
  respostas: Record<string, string>,
  qualidade_sono: string,
  schedule_type?: string
) {
  return request<ClassifyResponse>("/classify/save", {
    method: "POST",
    body: JSON.stringify({ respostas, qualidade_sono, schedule_type }),
  });
}

// --- Dashboard ---

export interface NextFocusBlock {
  start: string;
  end: string;
  label: string;
  status: "upcoming" | "active" | "tomorrow";
  hours_until: number;
}

export interface BlockTask {
  id: string;
  title: string;
  status: string;
  task_type: string;
  start_time?: string | null;
  end_time?: string | null;
  is_key_task: boolean;
  priority?: string | null;
  objective_title?: string | null;
}

export interface DayBlock {
  start: string;
  end: string;
  level: string;
  level_label: string;
  tasks: BlockTask[];
}

export interface FocusBlock {
  index: number;
  start: string;
  end: string;
  level:
    | "sono"
    | "recuperacao"
    | "foco_leve"
    | "foco_moderado"
    | "foco_profundo"
    | "pico";
  level_label: string;
  description: string;
  tasks: BlockTask[];
}

export interface DashboardData {
  greeting: string;
  chronotype_label: string;
  chronotype_key: string;
  energy_percent: number;
  focus_percent: number;
  energy_peak: string;
  focus_window: string;
  low_energy: string;
  recommendation: string;
  next_focus: NextFocusBlock;
  current_block: FocusBlock;
  next_block: FocusBlock;
  day_blocks: DayBlock[];
}

export function getDashboard() {
  return request<DashboardData>("/dashboard/");
}

// --- Tasks ---

export type TaskType = "task" | "event" | "routine";
export type TaskStatus = "todo" | "progress" | "done" | "scheduled";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  task_type: TaskType;
  status: TaskStatus;
  priority?: TaskPriority | null;
  scheduled_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  progress: number;
  recurrence?: "daily" | "weekly" | "monthly" | null;
  location?: string | null;
  parent_task_id?: string | null;
  group_name?: string | null;
  deadline?: string | null;
  is_key_task: boolean;
  objective_id?: string | null;
  objective_title?: string | null;
  created_by: "user" | "agent";
  created_at: string;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  task_type?: TaskType;
  priority?: TaskPriority;
  scheduled_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  recurrence?: "daily" | "weekly" | "monthly";
  location?: string;
  deadline?: string;
  axon_pick_time?: boolean;
  duration_minutes?: number;
  objective_id?: string;
}

export type TaskUpdateInput = Partial<TaskCreateInput> & {
  status?: TaskStatus;
  progress?: number;
  is_key_task?: boolean;
};

export function getTasks(params?: {
  scheduled_date?: string;
  status?: TaskStatus;
  task_type?: TaskType;
}) {
  const query = new URLSearchParams();
  if (params?.scheduled_date) query.set("scheduled_date", params.scheduled_date);
  if (params?.status) query.set("status", params.status);
  if (params?.task_type) query.set("task_type", params.task_type);
  const qs = query.toString();
  return request<Task[]>(`/tasks${qs ? `?${qs}` : ""}`);
}

export function createTask(body: TaskCreateInput) {
  return request<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateTask(id: string, body: TaskUpdateInput) {
  return request<Task>(`/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteTask(id: string) {
  return request<void>(`/tasks/${id}`, { method: "DELETE" });
}

export function carryForwardTasks() {
  return request<Task[]>("/tasks/carry-forward", { method: "POST" });
}

// --- Conversations ---

export interface ConversationData {
  id: string;
  title: string;
  type: "general" | "planning" | "focus" | "project";
  archived: boolean;
  created_at: string;
  last_message?: string;
  message_count: number;
  project_id?: string | null;
}

export function getConversations() {
  return request<ConversationData[]>("/chat/conversations");
}

export async function createConversation(
  title: string,
  type: string,
  projectId?: string | null
) {
  const payload = {
    title,
    type,
    ...(projectId !== undefined ? { project_id: projectId } : {}),
  };

  return request<ConversationData>("/chat/conversations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateConversationProject(
  conversationId: string,
  projectId: string | null
) {
  return request<ConversationData>(`/chat/conversations/${conversationId}`, {
    method: "PATCH",
    body: JSON.stringify({
      project_id: projectId,
    }),
  });
}

export function updateConversation(
  id: string,
  updates: { title?: string; archived?: boolean; project_id?: string | null }
) {
  return request<ConversationData>(`/chat/conversations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export function deleteConversation(id: string) {
  return request<void>(`/chat/conversations/${id}`, { method: "DELETE" });
}

export function clearConversationMessages(id: string) {
  return request<void>(`/chat/conversations/${id}/messages`, { method: "DELETE" });
}

export interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export function getConversationMessages(id: string) {
  return request<StoredMessage[]>(`/chat/conversations/${id}/messages`);
}

// --- Chat ---

export interface ChatApiResponse {
  response: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function chat(message: string, history: ChatMessage[], conversationId?: string) {
  return request<ChatApiResponse>("/chat", {
    method: "POST",
    body: JSON.stringify({ message, history, conversation_id: conversationId ?? null }),
  });
}

export interface ToolEvent {
  tool: string;
  status: "running" | "done";
  label?: string;
  ok?: boolean;
  mutating?: boolean;
  input?: Record<string, unknown>;
  summary?: string;
}

// --- Notifications ---

export interface NotificationAction {
  task_id: string;
  new_date?: string | null;
  new_start_time?: string | null;
  new_end_time?: string | null;
  reason?: string | null;
}

export interface NotificationData {
  id: string;
  type: "simple" | "improvement" | "change";
  title: string;
  body: string;
  status: "unread" | "read" | "accepted" | "rejected";
  action?: NotificationAction | null;
  created_at: string;
}

export function getNotifications(limit = 10, offset = 0) {
  return request<NotificationData[]>(
    `/notifications?limit=${limit}&offset=${offset}`
  );
}

export function getUnreadCount() {
  return request<{ unread: number }>("/notifications/unread-count");
}

export function analyzeNotifications() {
  return request<{ analyzed: boolean; notification?: NotificationData }>(
    "/notifications/analyze",
    { method: "POST" }
  );
}

export function markNotificationRead(id: string) {
  return request<NotificationData>(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export function acceptNotification(id: string) {
  return request<{ analyzed: boolean; notification?: NotificationData }>(
    `/notifications/${id}/accept`,
    { method: "POST" }
  );
}

export function rejectNotification(id: string) {
  return request<NotificationData>(`/notifications/${id}/reject`, {
    method: "POST",
  });
}

// --- Planning Preferences ---

export interface PlanningPreferences {
  daily_planning_enabled: boolean;
  daily_planning_time: string | null;   // "HH:MM"
  weekly_planning_enabled: boolean;
  weekly_planning_day: number | null;   // 0=Seg…6=Dom
  planning_use_chronotype: boolean;
}

export function getPlanningPreferences() {
  return request<PlanningPreferences>("/profile/planning");
}

export function updatePlanningPreferences(prefs: PlanningPreferences) {
  return request<PlanningPreferences>("/profile/planning", {
    method: "PUT",
    body: JSON.stringify(prefs),
  });
}

// --- Daily Log ---

export interface DailyLog {
  id: string;
  date: string;
  sleep_time: string | null;
  wake_time: string | null;
  hours_slept: number | null;
  sleep_rating: number | null;
  sleep_tags: string[];
  mood_rating: number | null;
  mood_tags: string[];
  productivity_rating: number | null;
  productivity_tags: string[];
  exercised: boolean | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyLogInput {
  sleep_time?: string;
  wake_time?: string;
  sleep_rating?: number;
  sleep_tags?: string[];
  mood_rating?: number;
  mood_tags?: string[];
  productivity_rating?: number;
  productivity_tags?: string[];
  exercised?: boolean;
  notes?: string;
}

export function getDailyLogToday() {
  return request<DailyLog | null>("/daily-log/today");
}

export function getDailyLogHistory(days = 30) {
  return request<DailyLog[]>(`/daily-log/history?days=${days}`);
}

export function saveDailyLog(body: DailyLogInput) {
  return request<DailyLog>("/daily-log/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// --- Task Insights ---

export interface TaskInsightDay {
  date: string;
  weekday: string; // "Seg", "Ter", ...
  completed: number;
  total: number;
  completion_rate: number; // 0–100
  carried_forward: number;
}

export interface TaskInsightSummary {
  total_completed: number;
  avg_completion_rate: number;
  best_weekday: string | null;
  carry_forward_total: number;
}

export interface TaskInsights {
  period: "week" | "month";
  days: TaskInsightDay[];
  summary: TaskInsightSummary;
}

export function getTaskInsights(period: "week" | "month" = "week") {
  return request<TaskInsights>(`/insights/tasks?period=${period}`);
}

// --- Pattern Insights (IA) ---

export interface PatternInsight {
  title: string;
  detail: string;
  type: "sleep" | "productivity" | "mood" | "habit" | "general";
}

export interface PatternInsightsResponse {
  status: "collecting" | "ready";
  // quando "collecting":
  data_points?: number;
  days_needed?: number;
  message?: string;
  // quando "ready":
  insights?: PatternInsight[];
  generated_at?: string;
  cached?: boolean;
}

export function getPatternInsights(refresh = false) {
  return request<PatternInsightsResponse>(
    `/insights/patterns${refresh ? "?refresh=true" : ""}`
  );
}

// --- Routines ---

export type RoutineStatus = "active" | "paused";

// Espelha RoutineItemResponse (backend/models/schemas.py)
export interface RoutineItem {
  id: string;
  routine_id: string;
  title: string;
  days_of_week: number[]; // 0=Seg, 1=Ter, ..., 6=Dom
  start_time?: string | null; // "HH:MM" (item fixo)
  end_time?: string | null; // "HH:MM" (item fixo)
  duration_minutes?: number | null; // item flexível
  created_at: string;
  updated_at: string;
}

// Espelha RoutineListItem (GET /routines)
export interface Routine {
  id: string;
  name: string;
  status: RoutineStatus;
  start_date: string; // "YYYY-MM-DD"
  end_date?: string | null;
  paused_until?: string | null;
  generated_until: string;
  created_at: string;
  updated_at: string;
  streak: number;
  streak_unit: string; // sempre "dias"
  item_count: number;
}

// Espelha RoutineResponse (GET /routines/{id}) — inclui os itens
export interface RoutineDetail extends Omit<Routine, "item_count"> {
  items: RoutineItem[];
}

// Espelha RoutineItemCreate — item fixo (start_time+end_time) OU flexível (duration_minutes)
export interface RoutineItemCreateInput {
  title: string;
  days_of_week: number[]; // 0=Seg, ..., 6=Dom
  start_time?: string; // "HH:MM"
  end_time?: string; // "HH:MM"
  duration_minutes?: number;
}

// Espelha RoutineCreate
export interface RoutineCreateInput {
  name: string;
  start_date?: string; // "YYYY-MM-DD" (default: hoje, no backend)
  end_date?: string | null;
  items: RoutineItemCreateInput[];
}

export function createRoutine(body: RoutineCreateInput) {
  return request<RoutineDetail>("/routines", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getRoutines() {
  return request<Routine[]>("/routines");
}

export function getRoutine(id: string) {
  return request<RoutineDetail>(`/routines/${id}`);
}

export function pauseRoutine(id: string, pausedUntil?: string | null) {
  return request<RoutineDetail>(`/routines/${id}/pause`, {
    method: "POST",
    body: JSON.stringify({ paused_until: pausedUntil ?? null }),
  });
}

export function resumeRoutine(id: string) {
  return request<RoutineDetail>(`/routines/${id}/resume`, {
    method: "POST",
  });
}

export function updateRoutine(
  id: string,
  body: { name?: string; end_date?: string | null; status?: RoutineStatus }
) {
  return request<RoutineDetail>(`/routines/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteRoutine(id: string) {
  return request<void>(`/routines/${id}`, { method: "DELETE" });
}

// Espelha RoutineItemUpdate. Atenção: o backend NÃO revalida fixo-vs-flexível
// no PATCH, então ao trocar de modo envie null no lado não usado para limpá-lo.
export interface RoutineItemUpdateInput {
  title?: string;
  days_of_week?: number[];
  start_time?: string | null;
  end_time?: string | null;
  duration_minutes?: number | null;
}

export function updateRoutineItem(
  routineId: string,
  itemId: string,
  body: RoutineItemUpdateInput
) {
  return request<RoutineItem>(`/routines/${routineId}/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function addRoutineItem(routineId: string, body: RoutineItemCreateInput) {
  return request<RoutineItem>(`/routines/${routineId}/items`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function deleteRoutineItem(routineId: string, itemId: string) {
  return request<void>(`/routines/${routineId}/items/${itemId}`, {
    method: "DELETE",
  });
}

export function streamChat(
  message: string,
  history: ChatMessage[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
  conversationId?: string,
  onTool?: (event: ToolEvent) => void
): void {
  const token = getToken();
  fetch(`${BASE_URL}/chat/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, history, conversation_id: conversationId ?? null }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Erro no chat" }));
        throw new Error(error.detail ?? "Erro no chat");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      const pump = async () => {
        const { done, value } = await reader.read();
        if (done) {
          onDone();
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(payload);
            if (parsed.text) {
              onChunk(parsed.text);
            } else if (parsed.tool) {
              onTool?.(parsed as ToolEvent);
            }
          } catch {
            // ignore malformed SSE lines
          }
        }

        pump();
      };

      pump();
    })
    .catch(onError);

}

// --- Objectives ---

export interface Objective {
  id: string;
  title: string;
  description?: string | null;
  deadline?: string | null;
  status: "active" | "done";
  priority?: "low" | "medium" | "high" | null;
  progress: number;
  subtask_count: number;
  done_count: number;
  created_at: string;
  updated_at: string;
  subtasks?: Task[];
}

export function getObjectives() {
  return request<Objective[]>("/objectives");
}

export function getObjective(id: string) {
  return request<Objective & { subtasks: Task[] }>(`/objectives/${id}`);
}

export function createObjective(payload: {
  title: string;
  description?: string;
  deadline?: string;
  priority?: "low" | "medium" | "high";
}) {
  return request<Objective>("/objectives", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateObjective(
  id: string,
  payload: {
    title?: string;
    description?: string;
    deadline?: string | null;
    priority?: "low" | "medium" | "high";
  }
) {
  return request<Objective>(`/objectives/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteObjective(id: string) {
  return request<void>(`/objectives/${id}`, { method: "DELETE" });
}


