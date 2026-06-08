const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const token = localStorage.getItem("axon_token");
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...(options.headers as Record<string, string> | undefined),
      },
      ...options,
    });
  } catch {
    throw new Error(
      "⚠️ DEV: Backend inacessível. Abra a porta 8000 como Pública no painel de Portas do VS Code e certifique-se de que o servidor está rodando (uvicorn main:app --reload)."
    );
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Erro desconhecido" }));
    throw new Error(error.detail ?? "Erro na requisição");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// --- Auth ---

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

export function logout() {
  localStorage.removeItem("axon_token");
  localStorage.removeItem("axon_refresh_token");
  localStorage.removeItem("axon_user");
}

export function saveSession(res: AuthResponse) {
  localStorage.setItem("axon_token", res.access_token);
  localStorage.setItem("axon_refresh_token", res.refresh_token);
  localStorage.setItem("axon_user", JSON.stringify({ id: res.user_id, email: res.email, name: res.name }));
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// --- Profile ---

export interface ProfileData {
  name?: string;
  email: string;
  chronotype?: string;
  chronotype_label?: string;
  energy_peak?: string;
  focus_window?: string;
  has_chronotype: boolean;
}

export function getProfile() {
  return request<ProfileData>("/profile");
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

export interface DayBlock {
  time: string;
  title: string;
  type: string;
  active: boolean;
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
  day_blocks: DayBlock[];
}

export function getDashboard() {
  return request<DashboardData>("/dashboard/");
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
}

export function getConversations() {
  return request<ConversationData[]>("/chat/conversations");
}

export function createConversation(title: string, type: ConversationData["type"]) {
  return request<ConversationData>("/chat/conversations", {
    method: "POST",
    body: JSON.stringify({ title, type }),
  });
}

export function updateConversation(id: string, updates: { title?: string; archived?: boolean }) {
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

export function streamChat(
  message: string,
  history: ChatMessage[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
  conversationId?: string
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
            if (parsed.text) onChunk(parsed.text);
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
