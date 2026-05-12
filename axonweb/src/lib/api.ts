const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

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
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers as Record<string, string> | undefined),
    },
    ...options,
  });

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

export function classify(respostas: Record<string, string>, qualidade_sono: string) {
  return request<ClassifyResponse>("/classify/", {
    method: "POST",
    body: JSON.stringify({ respostas, qualidade_sono }),
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

// --- Chat ---

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function streamChat(
  message: string,
  history: ChatMessage[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
): void {
  const token = getToken();
  fetch(`${BASE_URL}/chat/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, history }),
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
