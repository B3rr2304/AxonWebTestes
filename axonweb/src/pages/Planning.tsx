import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Edit3,
  ListTodo,
  Loader2,
  Menu,
  Plus,
  Repeat,
  Sparkles,
  Star,
  Target,
  Trash2,
  X,
} from "lucide-react";

import { results, type ChronotypeResultKey } from "../data/results";
import Sidebar from "../components/layout/Sidebar";
import * as api from "../lib/api";
import type { Task, TaskType, TaskStatus } from "../lib/api";

type ViewMode = "month" | "week";
type DisplayStatus = "todo" | "progress" | "done" | "scheduled";

const validKeys: ChronotypeResultKey[] = [
  "Matutino",
  "Vespertino",
  "Noturno",
  "Misto",
  "Bimodal",
];

const typeLabels: Record<TaskType, string> = {
  task: "Tarefa",
  event: "Evento",
  routine: "Rotina",
};

const statusLabels: Record<TaskStatus, string> = {
  todo: "A fazer",
  progress: "Em andamento",
  done: "Concluída",
  scheduled: "Agendado",
};

const recurrenceLabels: Record<string, string> = {
  daily: "Todos os dias",
  weekly: "Toda semana",
  monthly: "Todo mês",
};

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const weekdayShort = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const CALENDAR_SETUP_STORAGE_KEY = "axon_calendar_setup_choice";
type CalendarSetupChoice = "google" | "independent";

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getTaskEndDate(task: Task): string | undefined {
  return (task as Task & { end_date?: string | null }).end_date || undefined;
}

function getDisplayStatus(task: Task, selectedIso: string): DisplayStatus {
  const isDone = task.status === "done";

  if (isDone) {
    return "done";
  }

  const endDate = getTaskEndDate(task);
  const isMultiDayEvent =
    task.task_type === "event" &&
    task.scheduled_date &&
    endDate &&
    endDate !== task.scheduled_date;

  if (isMultiDayEvent && task.scheduled_date && endDate) {
    if (selectedIso > task.scheduled_date && selectedIso < endDate) {
      return "progress";
    }

    if (selectedIso === endDate) {
      return "progress";
    }

    return "scheduled";
  }

  if (task.task_type === "event") {
    return "scheduled";
  }

  return task.status as DisplayStatus;
}

function isEventCompleted(task: Task, now: Date): boolean {
  // evento multi-dia marcado manualmente já conta como concluído
  if (task.status === "done") return true;

  const endIso = getTaskEndDate(task) || task.scheduled_date;
  if (!endIso) return false;

  // usa o fim do evento; se não houver, o início; se não houver horário, fim do dia
  const time = hhmm(task.end_time) || hhmm(task.start_time) || "23:59";
  const endDateTime = new Date(`${endIso}T${time}:00`);

  return now >= endDateTime;
}

function isTaskOnDate(task: Task, isoDate: string): boolean {
  if (!task.scheduled_date) return false;

  const startDate = task.scheduled_date;
  const endDate = getTaskEndDate(task);

  if (task.task_type === "event" && endDate) {
    return isoDate >= startDate && isoDate <= endDate;
  }

  return isoDate === startDate;
}

function daysBetweenInclusive(startIso: string, endIso: string): number {
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);

  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(diffDays + 1, 1);
}

function getDayIndexInRange(startIso: string, currentIso: string): number {
  const start = new Date(`${startIso}T00:00:00`);
  const current = new Date(`${currentIso}T00:00:00`);

  const diffMs = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(diffDays + 1, 1);
}

function getMultiDayEventProgress(task: Task, selectedIso: string) {
  const endDate = getTaskEndDate(task);

  if (!task.scheduled_date || !endDate || endDate === task.scheduled_date) {
    return null;
  }

  const totalDays = daysBetweenInclusive(task.scheduled_date, endDate);
  const currentDay = Math.min(
    getDayIndexInRange(task.scheduled_date, selectedIso),
    totalDays
  );

  const progress = Math.round((currentDay / totalDays) * 100);
  const isLastDay = selectedIso === endDate;

  return {
    totalDays,
    currentDay,
    progress,
    isLastDay,
  };
}

function hhmm(value?: string | null): string | undefined {
  return value ? value.slice(0, 5) : undefined;
}

function weekDaysOf(selected: Date): Date[] {
  const dow = selected.getDay(); // 0 Dom .. 6 Sáb
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(selected);
  monday.setDate(selected.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function Planning({ embedded = false }: { embedded?: boolean } = {}) {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [carriedCount, setCarriedCount] = useState(0);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [calendarSetupChoice, setCalendarSetupChoice] =
    useState<CalendarSetupChoice | null>(() => {
      const stored = localStorage.getItem(CALENDAR_SETUP_STORAGE_KEY);

      if (stored === "google" || stored === "independent") {
        return stored;
      }

      return null;
    });
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);
  const [calendarConnectError, setCalendarConnectError] = useState<string | null>(null);

  const resultKey = useMemo<ChronotypeResultKey>(() => {
    const stored = localStorage.getItem("axon_chronotype");
    if (stored && validKeys.includes(stored as ChronotypeResultKey)) {
      return stored as ChronotypeResultKey;
    }
    return "Misto";
  }, []);

  const result = results[resultKey];

  const loadTasks = useCallback(async () => {
    setError(null);
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar tarefas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Primeiro arrasta pendentes de ontem, depois carrega a lista atualizada
    api.carryForwardTasks()
      .then((moved) => {
        if (moved.length > 0) setCarriedCount(moved.length);
      })
      .catch(() => null)
      .finally(() => loadTasks());
  }, [loadTasks]);

  const taskDates = useMemo(() => {
    const dates = new Set<string>();

    tasks.forEach((task) => {
      if (!task.scheduled_date) return;

      const endDate = getTaskEndDate(task);

      if (task.task_type === "event" && endDate) {
        const current = new Date(`${task.scheduled_date}T00:00:00`);
        const last = new Date(`${endDate}T00:00:00`);

        while (current <= last) {
          dates.add(toISODate(current));
          current.setDate(current.getDate() + 1);
        }

        return;
      }

      dates.add(task.scheduled_date);
    });

    return dates;
  }, [tasks]);

  const selectedIso = toISODate(selectedDate);
  const dayTasks = useMemo(
    () =>
      tasks
        .filter((task) => isTaskOnDate(task, selectedIso))
        .sort((a, b) => {
          // Tarefa chave sempre no topo, independente do horário.
          if (!!a.is_key_task !== !!b.is_key_task) return a.is_key_task ? -1 : 1;
          return (a.start_time ?? "").localeCompare(b.start_time ?? "");
        }),
    [tasks, selectedIso]
  );
  const undatedTasks = useMemo(() => {
    const W: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return tasks
      .filter((t) => !t.scheduled_date)
      .sort((a, b) => (W[a.priority ?? "medium"] ?? 1) - (W[b.priority ?? "medium"] ?? 1));
  }, [tasks]);

  const now = new Date();
  // base = itens do dia selecionado (dayTasks já filtra por isTaskOnDate); agora inclui eventos
  const actionable = dayTasks;
  const completedItems = actionable.filter((t) =>
    t.task_type === "event" ? isEventCompleted(t, now) : t.status === "done"
  ).length;
  const progress =
    actionable.length === 0
      ? 0
      : Math.round((completedItems / actionable.length) * 100);

  async function handleToggleDone(task: Task) {
    const next =
      task.status === "done"
        ? { status: "todo" as TaskStatus, progress: 0 }
        : { status: "done" as TaskStatus, progress: 100 };
    try {
      await api.updateTask(task.id, next);
      await loadTasks();
    } catch {
      // mantém o estado atual em caso de erro
    }
  }

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  async function handleToggleKey(task: Task) {
    const marking = !task.is_key_task;
    // Troca: já existe outra tarefa chave no mesmo dia? (o backend desmarca-a)
    const hadOtherKey =
      marking && dayTasks.some((t) => t.is_key_task && t.id !== task.id);
    try {
      await api.updateTask(task.id, { is_key_task: marking });
      // O backend desmarca a anterior automaticamente, então recarregamos o dia
      // inteiro em vez de atualizar só o card clicado.
      await loadTasks();
      if (marking) {
        showToast(
          hadOtherKey ? "Tarefa chave atualizada" : "Tarefa chave definida"
        );
      } else {
        showToast("Tarefa chave removida");
      }
    } catch {
      // mantém o estado atual em caso de erro
    }
  }

  function handleDelete(task: Task) {
    setTaskToDelete(task);
  }

  function handleEdit(task: Task) {
    setTaskToEdit(task);
  }

  async function confirmDeleteTask() {
    if (!taskToDelete) return;

    setIsDeletingTask(true);

    try {
      await api.deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      await loadTasks();
    } catch {
      // depois podemos colocar um toast/erro visual aqui
    } finally {
      setIsDeletingTask(false);
    }
  }

  function cancelDeleteTask() {
    if (isDeletingTask) return;
    setTaskToDelete(null);
  }

  async function handleConnectGoogleCalendar() {
    if (isConnectingCalendar) return;

    setIsConnectingCalendar(true);
    setCalendarConnectError(null);

    try {
      const { auth_url } = await api.connectGoogleCalendar();

      localStorage.setItem(CALENDAR_SETUP_STORAGE_KEY, "google");
      setCalendarSetupChoice("google");
      window.location.href = auth_url;
    } catch (e) {
      setCalendarConnectError(
        e instanceof Error
          ? e.message
          : "Não foi possível iniciar a conexão com o Google Calendar."
      );
      setIsConnectingCalendar(false);
    }
  }

  function handleUseIndependentCalendar() {
    localStorage.setItem(CALENDAR_SETUP_STORAGE_KEY, "independent");
    setCalendarSetupChoice("independent");
    setCalendarConnectError(null);
  }

  const inner = (
    <>
      {carriedCount > 0 && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3">
            <p className="text-xs leading-5 text-amber-100">
              <span className="font-semibold">{carriedCount} {carriedCount === 1 ? "tarefa pendente" : "tarefas pendentes"}</span> de ontem {carriedCount === 1 ? "foi movida" : "foram movidas"} para hoje.
            </p>
            <button
              onClick={() => setCarriedCount(0)}
              className="shrink-0 text-amber-200/60 active:scale-95"
              aria-label="Fechar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <section className="mb-4">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#1b1b27]/82 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.24),transparent_48%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_40%)]" />

            <div className="relative">
              <div className="mb-4">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Hoje
                </div>

                <h1 className="text-[1.8rem] font-semibold leading-[1.02] tracking-[-0.055em] text-white">
                  {actionable.length === 0
                    ? "Seu plano começa aqui."
                    : "Seu plano está em movimento."}
                </h1>

                <p className="mt-2 text-sm leading-6 text-white/46">
                  {actionable.length === 0
                    ? "Nenhuma tarefa ainda — crie pela conversa com o Axon ou no botão +."
                    : `${completedItems} de ${actionable.length} itens concluídos.`}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <CircularProgress value={progress} />

                <div className="mt-4 grid w-full grid-cols-3 gap-2 rounded-[1.4rem] border border-white/10 bg-black/20 p-2">
                  <LegendItem color="bg-white/30" label="A fazer" />
                  <LegendItem color="bg-purple-300" label="Em andamento" />
                  <LegendItem color="bg-emerald-300" label="Concluído" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-[2rem] border border-white/10 bg-[#1b1b27]/82 p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">
                {calendarSetupChoice ? "Calendário" : "Configurar calendário"}
              </p>
              <p className="mt-1 text-xs text-white/38">
                {calendarSetupChoice
                  ? "Mês, semana e blocos do dia"
                  : "Escolha como deseja usar sua agenda no Axon"}
              </p>
            </div>

            {calendarSetupChoice && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-xl shadow-purple-950/35 active:scale-[0.96]"
                aria-label="Criar novo item"
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
          </div>

          {!calendarSetupChoice ? (
            <CalendarSetupCard
              isConnecting={isConnectingCalendar}
              error={calendarConnectError}
              onConnect={handleConnectGoogleCalendar}
              onUseIndependent={handleUseIndependentCalendar}
            />
          ) : (
            <>
              {calendarSetupChoice === "independent" && (
                <div className="mb-4 rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-xs leading-5 text-white/42">
                    Você está usando o calendário independente do Axon. Depois será
                    possível conectar o Google Calendar pelas configurações.
                  </p>
                </div>
              )}

              {calendarSetupChoice === "google" && (
                <div className="mb-4 rounded-[1.4rem] border border-purple-300/15 bg-purple-500/10 p-3">
                  <p className="text-xs leading-5 text-purple-100/65">
                    Google Calendar selecionado. Se a autorização ainda não foi
                    concluída, o Axon terminará a conexão após o retorno do Google.
                  </p>
                </div>
              )}

              <div className="mb-4 flex rounded-2xl border border-white/10 bg-black/20 p-1">
                <button
                  onClick={() => setViewMode("month")}
                  className={`min-h-10 flex-1 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                    viewMode === "month"
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-950/25"
                      : "text-white/42"
                  }`}
                >
                  Mês
                </button>

                <button
                  onClick={() => setViewMode("week")}
                  className={`min-h-10 flex-1 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                    viewMode === "week"
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-950/25"
                      : "text-white/42"
                  }`}
                >
                  Dia/Semana
                </button>
              </div>

              {viewMode === "month" ? (
                <MonthCalendar
                  selectedDate={selectedDate}
                  onSelect={setSelectedDate}
                  tasks={tasks}
                />
              ) : (
                <>
                  <WeekCalendar
                    selectedDate={selectedDate}
                    onSelect={setSelectedDate}
                    taskDates={taskDates}
                  />

                  <div className="mt-5">
                    {/* Chip da fila — sempre visível quando há tarefas sem data */}
                    {undatedTasks.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsQueueOpen(true)}
                        className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-indigo-300/20 bg-indigo-500/10 px-4 py-3 text-left transition active:scale-[0.98]"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-200">
                          <ListTodo className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-indigo-100">Fila de tarefas</p>
                          <p className="text-xs text-indigo-200/55">
                            {undatedTasks.length} {undatedTasks.length === 1 ? "tarefa sem data definida" : "tarefas sem data definida"}
                          </p>
                        </div>
                        <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-indigo-500 px-1.5 text-xs font-bold text-white">
                          {undatedTasks.length}
                        </span>
                      </button>
                    )}

                    {loading ? (
                      <div className="flex items-center justify-center gap-2 py-10 text-sm text-white/45">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando tarefas…
                      </div>
                    ) : error ? (
                      <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                        {error}
                      </div>
                    ) : dayTasks.length === 0 && undatedTasks.length === 0 ? (
                      <EmptyState onCreate={() => setIsCreateModalOpen(true)} />
                    ) : dayTasks.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center">
                        <p className="text-sm text-white/38">Nenhuma tarefa neste dia.</p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {dayTasks.map((task) => (
                          <TimelineItem
                            key={task.id}
                            task={task}
                            selectedIso={selectedIso}
                            onToggle={handleToggleDone}
                            onToggleKey={handleToggleKey}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </section>

        {viewMode === "month" && (
          <section className="rounded-[2rem] border border-purple-300/20 bg-purple-500/10 p-4 shadow-xl shadow-purple-950/20 backdrop-blur-2xl">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-200" />
              <p className="text-sm font-semibold text-purple-100">
                Visão do mês
              </p>
            </div>

            <p className="text-sm leading-6 text-white/58">
              Os pontos indicam dias com tarefas agendadas. Toque em um dia e volte
              para a visão de semana para ver os detalhes.
            </p>
          </section>
        )}
    </>
  );

  const modals = (
    <>
      <CreatePlanningItemModal
        isOpen={isCreateModalOpen}
        defaultDate={selectedIso}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={async () => {
          setIsCreateModalOpen(false);
          await loadTasks();
        }}
      />

      <EditPlanningItemModal
        task={taskToEdit}
        onClose={() => setTaskToEdit(null)}
        onUpdated={async () => {
          setTaskToEdit(null);
          await loadTasks();
        }}
      />

      <DeletePlanningItemModal
        task={taskToDelete}
        isDeleting={isDeletingTask}
        onClose={cancelDeleteTask}
        onConfirm={confirmDeleteTask}
      />

      {isQueueOpen && (
        <UndatedTasksSheet
          tasks={undatedTasks}
          onClose={() => setIsQueueOpen(false)}
          onEdit={(t) => { setIsQueueOpen(false); handleEdit(t); }}
          onDelete={(t) => { setIsQueueOpen(false); handleDelete(t); }}
          onToggle={handleToggleDone}
        />
      )}

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[120] flex justify-center px-4">
          <div className="flex items-center gap-2 rounded-full border border-amber-300/25 bg-[#1b1b27]/95 px-4 py-2.5 text-sm font-medium text-amber-100 shadow-xl shadow-black/40 backdrop-blur-xl">
            <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
            {toast}
          </div>
        </div>
      )}
    </>
  );

  // No hub (embedded), a moldura — main, header, Sidebar — vem do Planejamento.
  if (embedded) {
    return (
      <>
        {inner}
        {modals}
      </>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#11111a] text-white">
      <Background />

      <div className="relative z-10 min-h-screen px-4 pb-6 pt-5">
        <header className="mb-5 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 text-left active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200 shadow-lg shadow-purple-950/30">
              <img src="/axon-logo.svg" alt="Axon" className="h-8 w-8 object-contain" />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Planejamento</p>
              <p className="text-xs text-white/40">Rotina e tarefas</p>
            </div>
          </button>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/65 backdrop-blur-2xl active:scale-[0.96]"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {inner}
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chronotypeLabel={result.label}
        energyPeak={result.energyPeak}
      />

      {modals}
    </main>
  );
}

function CalendarSetupCard({
  isConnecting,
  error,
  onConnect,
  onUseIndependent,
}: {
  isConnecting: boolean;
  error: string | null;
  onConnect: () => void;
  onUseIndependent: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.7rem] border border-purple-300/20 bg-purple-500/10 p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,180,254,0.22),transparent_48%)]" />
      <div className="relative">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-100">
          <CalendarDays className="h-5 w-5" />
        </div>

        <h2 className="text-[1.45rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
          Como você quer usar sua agenda?
        </h2>

        <p className="mt-3 text-sm leading-6 text-white/50">
          Conecte o Google Calendar para sincronizar seus compromissos ou use o
          calendário independente do Axon por enquanto.
        </p>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={onConnect}
            disabled={isConnecting}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-5 text-sm font-semibold text-white shadow-xl shadow-purple-950/35 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Conectando…
              </>
            ) : (
              <>
                <CalendarDays className="mr-2 h-4 w-4" />
                Vincular Google Calendar
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onUseIndependent}
            disabled={isConnecting}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-5 text-sm font-semibold text-white/58 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continuar sem vincular
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-500/10 p-3 text-xs leading-5 text-rose-100">
            {error}
          </p>
        )}

        <p className="mt-4 text-xs leading-5 text-white/34">
          Você poderá conectar o Google Calendar depois em Configurações.
        </p>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-[1.6rem] border border-dashed border-white/12 bg-black/15 px-6 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/12 text-purple-200">
        <ListTodo className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-white">Nenhuma tarefa neste dia</p>
      <p className="mt-1 max-w-[18rem] text-xs leading-5 text-white/42">
        Converse com o Axon para ele organizar sua rotina, ou crie manualmente.
      </p>
      <button
        onClick={onCreate}
        className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-purple-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-950/30 active:scale-[0.97]"
      >
        <Plus className="h-4 w-4" />
        Criar tarefa
      </button>
    </div>
  );
}

function CircularProgress({ value }: { value: number }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * value) / 100;

  return (
    <div className="relative flex h-48 w-48 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.24),transparent_62%)] blur-xl" />

      <svg className="relative h-44 w-44 -rotate-90" viewBox="0 0 150 150">
        <circle
          cx="75"
          cy="75"
          r={radius}
          stroke="rgba(255,255,255,0.11)"
          strokeWidth="14"
          fill="none"
        />

        <circle
          cx="75"
          cy="75"
          r={radius}
          stroke="url(#progress-gradient)"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />

        <defs>
          <linearGradient
            id="progress-gradient"
            x1="20"
            y1="20"
            x2="130"
            y2="130"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#f0abfc" />
            <stop offset="0.52" stopColor="#a855f7" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute text-center">
        <p className="text-4xl font-semibold tracking-[-0.06em] text-white">
          {value}%
        </p>
        <p className="mt-1 text-xs font-medium text-white/42">concluído</p>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex min-h-9 items-center justify-center gap-2 rounded-xl bg-white/[0.035] px-2">
      <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} />
      <p className="text-[0.62rem] font-medium text-white/48">{label}</p>
    </div>
  );
}

function MonthCalendar({
  selectedDate,
  onSelect,
  tasks,
}: {
  selectedDate: Date;
  onSelect: (d: Date) => void;
  tasks: Task[];
}) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayIso = toISODate(new Date());

  function shiftMonth(delta: number) {
    onSelect(new Date(year, month + delta, 1));
  }

  function getItemsForDay(date: Date) {
    const iso = toISODate(date);

    return tasks.filter((task) => {
      if (!task.scheduled_date) return false;

      const startDate = task.scheduled_date;

      /**
       * Preparado para eventos de vários dias.
       * Quando o backend tiver end_date, ele já funciona.
       */
      const endDate = (task as Task & { end_date?: string }).end_date;

      if (endDate) {
        return iso >= startDate && iso <= endDate;
      }

      return iso === startDate;
    });
  }

  function isMultiDayEventOnDate(task: Task, date: Date) {
    const iso = toISODate(date);
    const endDate = (task as Task & { end_date?: string }).end_date;

    return Boolean(
      task.task_type === "event" &&
        task.scheduled_date &&
        endDate &&
        iso >= task.scheduled_date &&
        iso <= endDate
    );
  }

  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() => shiftMonth(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/45 active:scale-[0.96]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-white">
            {monthNames[month]} {year}
          </p>
          <p className="mt-1 text-xs text-white/35">Planejamento mensal</p>
        </div>

        <button
          onClick={() => shiftMonth(1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/45 active:scale-[0.96]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-3 grid grid-cols-7 gap-2 text-center">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
          <p key={`${day}-${index}`} className="text-[0.68rem] text-white/35">
            {day}
          </p>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const date = new Date(year, month, day);
          const iso = toISODate(date);

          const isSelected = iso === toISODate(selectedDate);
          const isToday = iso === todayIso;

          const items = getItemsForDay(date);
          const visibleItems = items.slice(0, 3);
          const extraCount = items.length - visibleItems.length;

          const hasMultiDayEvent = items.some((item) =>
            isMultiDayEventOnDate(item, date)
          );

          return (
            <button
              key={day}
              onClick={() => onSelect(date)}
              className={`relative flex min-h-[4.4rem] flex-col items-center justify-start rounded-xl border px-1.5 py-2 text-xs font-medium transition active:scale-[0.96] ${
                isSelected
                  ? "border-purple-300/30 bg-purple-500 text-white shadow-lg shadow-purple-950/30"
                  : isToday
                  ? "border-purple-300/30 bg-white/[0.08] text-white"
                  : "border-white/10 bg-white/[0.035] text-white/50"
              }`}
            >
              <span className="text-sm font-semibold">{day}</span>

              {hasMultiDayEvent && (
                <span
                  className={`mt-1 h-1.5 w-full rounded-full ${
                    isSelected ? "bg-white/75" : "bg-cyan-300/70"
                  }`}
                />
              )}

              {items.length > 0 && (
                <div className="mt-auto flex w-full flex-col items-center gap-1 pt-1">
                  <div className="flex max-w-full justify-center gap-1">
                    {visibleItems.map((item) => (
                      <span
                        key={item.id}
                        className={`h-1.5 w-1.5 rounded-full ${getMonthItemColor(
                          item.task_type,
                          isSelected
                        )}`}
                      />
                    ))}
                  </div>

                  {extraCount > 0 && (
                    <span
                      className={`text-[0.58rem] font-semibold leading-none ${
                        isSelected ? "text-white/80" : "text-white/35"
                      }`}
                    >
                      +{extraCount}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-2">
        <MonthLegendDot color="bg-purple-300" label="Tarefa" />
        <MonthLegendDot color="bg-cyan-300" label="Evento" />
        <MonthLegendDot color="bg-fuchsia-300" label="Rotina" />
      </div>
    </div>
  );
}

function getMonthItemColor(taskType: TaskType, isSelected: boolean) {
  if (isSelected) return "bg-white";

  if (taskType === "event") return "bg-cyan-300";
  if (taskType === "routine") return "bg-fuchsia-300";

  return "bg-purple-300";
}

function MonthLegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5 rounded-xl bg-black/15 px-2 py-2">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      <span className="text-[0.62rem] font-medium text-white/42">{label}</span>
    </div>
  );
}

function WeekCalendar({
  selectedDate,
  onSelect,
  taskDates,
}: {
  selectedDate: Date;
  onSelect: (d: Date) => void;
  taskDates: Set<string>;
}) {
  const days = weekDaysOf(selectedDate);
  const todayIso = toISODate(new Date());
  const monthLabel = `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  function shiftWeek(delta: number) {
    const d = new Date(selectedDate);
    d.setDate(selectedDate.getDate() + delta * 7);
    onSelect(d);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => shiftWeek(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/45 active:scale-[0.96]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-white">{monthLabel}</p>
          <p className="mt-1 text-xs text-white/35">Semana atual</p>
        </div>

        <button
          onClick={() => shiftWeek(1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/45 active:scale-[0.96]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-7 sm:overflow-visible sm:pb-0">
        {days.map((date) => {
          const iso = toISODate(date);
          const isSelected = iso === toISODate(selectedDate);
          const isToday = iso === todayIso;
          const hasTask = taskDates.has(iso);

          return (
            <button
              key={iso}
              onClick={() => onSelect(date)}
              className={`relative flex min-h-[82px] min-w-[62px] flex-col items-center justify-center rounded-[1.4rem] border transition active:scale-[0.98] sm:min-w-0 sm:w-full ${
                isSelected
                  ? "border-purple-300/25 bg-purple-300 text-[#161622]"
                  : isToday
                  ? "border-purple-300/30 bg-black/20 text-white"
                  : "border-white/10 bg-black/20 text-white/45"
              }`}
            >
              <p className="text-xl font-semibold">{date.getDate()}</p>
              <p className="mt-1 text-xs">{weekdayShort[date.getDay()]}</p>

              {hasTask && (
                <span
                  className={`absolute bottom-2 h-1 w-1 rounded-full ${
                    isSelected ? "bg-[#161622]" : "bg-purple-300"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimelineItem({
  task,
  selectedIso,
  onToggle,
  onToggleKey,
  onEdit,
  onDelete,
}: {
  task: Task;
  selectedIso: string;
  onToggle: (t: Task) => void;
  onToggleKey?: (t: Task) => void;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
}) {
  const isKey = !!task.is_key_task;
  const Icon =
    task.task_type === "task"
      ? ListTodo
      : task.task_type === "event"
      ? CalendarDays
      : Repeat;

  const start = hhmm(task.start_time);
  const end = hhmm(task.end_time);
  const subtitle = task.description || typeLabels[task.task_type];

  const isDone = task.status === "done";
  const isProgress = task.status === "progress";
  const isEvent = task.task_type === "event";
  const isRoutine = task.task_type === "routine";

  const displayStatus = getDisplayStatus(task, selectedIso);
const isDisplayDone = displayStatus === "done";
const isDisplayProgress = displayStatus === "progress";
const isDisplayScheduled = displayStatus === "scheduled";

  const multiDayProgress = isEvent
    ? getMultiDayEventProgress(task, selectedIso)
    : null;

  const isMultiDayEvent = Boolean(multiDayProgress);
  const canCompleteMultiDayEvent = multiDayProgress?.isLastDay;

  const taskEndDate = getTaskEndDate(task);

  const detailLabel =
    isRoutine && task.recurrence
      ? recurrenceLabels[task.recurrence] ?? task.recurrence
      : isMultiDayEvent && task.scheduled_date && taskEndDate
      ? `${task.scheduled_date} até ${taskEndDate}`
      : isEvent
      ? `${start ?? "—"}${end ? ` - ${end}` : ""}`
      : start && end
      ? `${start} - ${end}`
      : start ?? "Sem horário";

  return (
    <div className="grid grid-cols-[3.4rem_1fr] gap-3">
      <div className="relative pt-1">
        <p className="text-xs font-semibold text-white/55">{start ?? "—"}</p>

        <div
          className={`mx-auto mt-3 h-16 w-px border-l ${
            isRoutine
              ? "border-dashed border-purple-300/35"
              : "border-dashed border-white/15"
          }`}
        />

        <p className="mt-3 text-xs font-semibold text-white/35">{end ?? "—"}</p>
      </div>

      <div
        className={`rounded-[1.55rem] border p-4 shadow-xl shadow-black/20 ${
          isKey ? "ring-1 ring-amber-300/45 " : ""
        }${
          isKey
            ? "border-amber-300/30 bg-amber-400/[0.08]"
            : isDone
            ? "border-emerald-300/20 bg-emerald-400/10"
            : isEvent
            ? "border-cyan-300/20 bg-cyan-400/10"
            : isRoutine
            ? "border-fuchsia-300/20 bg-fuchsia-400/10"
            : isProgress
            ? "border-purple-300/25 bg-purple-500/12"
            : "border-white/10 bg-white/[0.055]"
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {isKey && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-[0.65rem] font-semibold text-amber-100">
                <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                Tarefa chave
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.65rem] font-semibold ${
                isEvent
                  ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-100"
                  : isRoutine
                  ? "border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-100"
                  : isDisplayDone
                  ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                  : isProgress
                  ? "border-purple-300/25 bg-purple-500/15 text-purple-100"
                  : "border-white/10 bg-white/[0.055] text-white/52"
              }`}
            >
              <Icon className="h-3 w-3" />
              {typeLabels[task.task_type]}
            </span>

            <span
              className={`rounded-full border px-3 py-1 text-[0.65rem] font-semibold ${
                isDisplayDone
                  ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                  : isDisplayProgress
                  ? "border-purple-300/25 bg-purple-500/15 text-purple-100"
                  : isDisplayScheduled
                  ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-100"
                  : "border-white/10 bg-white/[0.055] text-white/52"
              }`}
            >
              {statusLabels[displayStatus]}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleKey && (
              <button
                onClick={() => onToggleKey(task)}
                className={`flex h-8 w-8 items-center justify-center rounded-xl active:scale-[0.94] ${
                  isKey
                    ? "bg-amber-400/15 text-amber-200"
                    : "bg-white/[0.055] text-white/45"
                }`}
                aria-label={
                  isKey ? "Desmarcar tarefa chave" : "Marcar como tarefa chave"
                }
                title={
                  isKey ? "Desmarcar tarefa chave" : "Marcar como tarefa chave"
                }
              >
                <Star
                  className={`h-4 w-4 ${isKey ? "fill-amber-300 text-amber-300" : ""}`}
                />
              </button>
            )}

            <button
              onClick={() => onEdit(task)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.055] text-white/45 active:scale-[0.94]"
              aria-label="Editar item"
            >
              <Edit3 className="h-4 w-4" />
            </button>

            <button
              onClick={() => onDelete(task)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.055] text-white/45 active:scale-[0.94]"
              aria-label="Remover item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div
            className={`rounded-[1.55rem] border p-4 shadow-xl shadow-black/20 ${
              isDisplayDone
                ? "border-emerald-300/20 bg-emerald-400/10"
                : isEvent && isDisplayProgress
                ? "border-purple-300/25 bg-purple-500/12"
                : isEvent
                ? "border-cyan-300/20 bg-cyan-400/10"
                : isRoutine
                ? "border-fuchsia-300/20 bg-fuchsia-400/10"
                : isDisplayProgress
                ? "border-purple-300/25 bg-purple-500/12"
                : "border-white/10 bg-white/[0.055]"
            }`}
          >
            {isDisplayDone ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Icon className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-white">
              {task.title}
            </p>
            <p className="mt-1 truncate text-xs text-white/42">{subtitle}</p>
            {task.objective_title && (
              <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-purple-300/20 bg-purple-500/10 px-2.5 py-0.5 text-[0.65rem] font-medium text-purple-200/80">
                <Target className="h-2.5 w-2.5" />
                {task.objective_title}
              </div>
            )}
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="truncate text-xs text-white/38">{detailLabel}</p>

          {isMultiDayEvent ? (
            <button
              onClick={() => {
                if (canCompleteMultiDayEvent) {
                  onToggle(task);
                }
              }}
              disabled={!canCompleteMultiDayEvent}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold active:scale-[0.97] disabled:cursor-not-allowed ${
                isDone
                  ? "text-emerald-200"
                  : canCompleteMultiDayEvent
                  ? "text-purple-200"
                  : "text-white/28"
              }`}
            >
              {isDone ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Concluído
                </>
              ) : canCompleteMultiDayEvent ? (
                <>
                  <Circle className="h-3.5 w-3.5" />
                  Marcar
                </>
              ) : (
                <>
                  <Circle className="h-3.5 w-3.5" />
                  Em andamento
                </>
              )}
            </button>
          ) : !isEvent ? (
            <button
              onClick={() => onToggle(task)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 active:scale-[0.97]"
            >
              {isDone ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Feita
                </>
              ) : (
                <>
                  <Circle className="h-3.5 w-3.5" />
                  Marcar
                </>
              )}
            </button>
          ) : null}
        </div>

        {isMultiDayEvent ? (
          <div>
            <div className="mb-2 flex items-center justify-between text-[0.68rem] text-white/35">
              <span>
                Dia {multiDayProgress?.currentDay} de {multiDayProgress?.totalDays}
              </span>

              <span>{isDone ? "100" : multiDayProgress?.progress}%</span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${
                  isDone
                    ? "bg-emerald-300"
                    : "bg-gradient-to-r from-cyan-300 to-purple-300"
                }`}
                style={{
                  width: `${isDone ? 100 : multiDayProgress?.progress ?? 0}%`,
                }}
              />
            </div>
          </div>
        ) : !isEvent ? (
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${
                isDone
                  ? "bg-emerald-300"
                  : isRoutine
                  ? "bg-gradient-to-r from-fuchsia-300 to-purple-300"
                  : isProgress
                  ? "bg-gradient-to-r from-purple-400 to-fuchsia-300"
                  : "bg-white/30"
              }`}
              style={{ width: `${Math.max(task.progress ?? 0, 6)}%` }}
            />
          </div>
        ) : null}
        </div>

        {!isEvent && (
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${
                isDone
                  ? "bg-emerald-300"
                  : isRoutine
                  ? "bg-gradient-to-r from-fuchsia-300 to-purple-300"
                  : isProgress
                  ? "bg-gradient-to-r from-purple-400 to-fuchsia-300"
                  : "bg-white/30"
              }`}
              style={{ width: `${Math.max(task.progress ?? 0, 6)}%` }}
            />
          </div>
        )}
      </div>
  );
}

function CreatePlanningItemModal({
  isOpen,
  defaultDate,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  defaultDate: string;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
}) {
  const [selectedType, setSelectedType] = useState<TaskType>("task");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [endDate, setEndDate] = useState(defaultDate);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [location, setLocation] = useState("");
  const [recurrence, setRecurrence] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [axonPickTime, setAxonPickTime] = useState(false);
  const [duration, setDuration] = useState("");
  const [isKeyTask, setIsKeyTask] = useState(false);

  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedType("task");
      setTitle("");
      setDate(defaultDate);
      setStartTime("");
      setEndTime("");
      setPriority("medium");
      setLocation("");
      setRecurrence("daily");
      setDescription("");
      setFormError(null);
      setEndDate(defaultDate);
      setAxonPickTime(false);
      setDuration("");
      setIsKeyTask(false);
    }
  }, [isOpen, defaultDate]);

  if (!isOpen) return null;

  const titlePlaceholder =
    selectedType === "task"
      ? "Ex: Estender as roupas"
      : selectedType === "event"
      ? "Ex: Reunião com cliente"
      : "Ex: Pilates";

  const description_text =
    selectedType === "task"
      ? "Tarefas são ações pontuais que você pode marcar como concluídas."
      : selectedType === "event"
      ? "Eventos ocupam um horário fixo, com início e fim definidos."
      : "Rotinas são compromissos recorrentes que se repetem automaticamente.";

  async function handleSubmit() {
    if (!title.trim()) {
      setFormError("Dê um nome para o item.");
      return;
    }
    if (selectedType === "event" && endDate && date && endDate < date) {
      setFormError("A data final do evento não pode ser anterior à data inicial.");
      return;
    }
    if (!axonPickTime && startTime && endTime && endTime <= startTime) {
      setFormError("O horário de término precisa ser depois do horário de início.");
      return;
    }
    if (axonPickTime && selectedType !== "routine") {
      const d = Number(duration);
      if (!duration || !Number.isFinite(d) || d <= 0) {
        setFormError("Informe a duração em minutos para o Axon escolher o horário.");
        return;
      }
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const useAxon = axonPickTime && selectedType !== "routine";
      await api.createTask({
        title: title.trim(),
        task_type: selectedType,
        scheduled_date: date || undefined,
        end_date: selectedType === "event" ? endDate || date : undefined,
        start_time: useAxon ? undefined : startTime || undefined,
        end_time: useAxon ? undefined : endTime || undefined,
        priority: selectedType === "task" ? priority : undefined,
        location: selectedType === "event" ? location || undefined : undefined,
        recurrence: selectedType === "routine" ? recurrence : undefined,
        description: description || undefined,
        axon_pick_time: useAxon || undefined,
        duration_minutes: useAxon ? Number(duration) : undefined,
        is_key_task: selectedType === "task" && isKeyTask ? true : undefined,
      } as any);
      await onCreated();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erro ao criar item");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm">
      <div className="relative flex max-h-[88vh] w-full max-w-[430px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#171720]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.22),transparent_48%)]" />

        <div className="relative border-b border-white/10 px-5 pb-4 pt-4">
          <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-white/18" />

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                <Plus className="h-3.5 w-3.5" />
                Novo item
              </div>

              <h2 className="text-[1.55rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
                Adicionar ao planejamento
              </h2>

              <p className="mt-2 text-xs leading-5 text-white/45">
                {description_text}
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/45 active:scale-[0.96]"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 grid grid-cols-3 gap-2">
            <TypeButton
              active={selectedType === "task"}
              icon={ListTodo}
              label="Tarefa"
              onClick={() => setSelectedType("task")}
            />

            <TypeButton
              active={selectedType === "event"}
              icon={CalendarDays}
              label="Evento"
              onClick={() => setSelectedType("event")}
            />

            <TypeButton
              active={selectedType === "routine"}
              icon={Repeat}
              label="Rotina"
              onClick={() => setSelectedType("routine")}
            />
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-white/42">
                Nome
              </span>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={titlePlaceholder}
                className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none placeholder:text-white/28 focus:border-purple-300/35"
              />
            </label>

            {selectedType === "event" ? (
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-white/42">
                    Data inicial
                  </span>

                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);

                      if (!endDate || endDate < e.target.value) {
                        setEndDate(e.target.value);
                      }
                    }}
                    className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none focus:border-purple-300/35"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-white/42">
                    Data final
                  </span>

                  <input
                    type="date"
                    value={endDate}
                    min={date}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none focus:border-purple-300/35"
                  />
                </label>
              </div>
            ) : (
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-white/42">
                  Data
                </span>

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none focus:border-purple-300/35"
                />
              </label>
            )}

            {selectedType !== "routine" && (
              <div>
                <span className="mb-2 block text-xs font-medium text-white/42">
                  Horário
                </span>
                <div className="mb-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAxonPickTime(false)}
                    className={`flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 text-xs font-semibold transition active:scale-[0.97] ${
                      !axonPickTime
                        ? "border-purple-300/30 bg-purple-500/20 text-purple-100"
                        : "border-white/10 bg-white/[0.045] text-white/42"
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Horário fixo
                  </button>
                  <button
                    type="button"
                    onClick={() => setAxonPickTime(true)}
                    className={`flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 text-xs font-semibold transition active:scale-[0.97] ${
                      axonPickTime
                        ? "border-purple-300/30 bg-purple-500/20 text-purple-100"
                        : "border-white/10 bg-white/[0.045] text-white/42"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Axon decide
                  </button>
                </div>

                {axonPickTime ? (
                  <div>
                    <label className="block">
                      <span className="mb-2 block text-xs font-medium text-white/42">
                        Duração (minutos)
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="Ex: 45"
                        className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none placeholder:text-white/28 focus:border-purple-300/35"
                      />
                    </label>
                    <p className="mt-2 text-[0.7rem] leading-4 text-white/38">
                      O Axon escolhe o melhor horário com base no seu cronotipo e no que já está agendado no dia.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-2 block text-xs font-medium text-white/42">
                        Início
                      </span>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none focus:border-purple-300/35"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-medium text-white/42">
                        Fim
                      </span>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none focus:border-purple-300/35"
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            {selectedType === "task" && (
              <button
                type="button"
                onClick={() => {
                  const next = !isKeyTask;
                  setIsKeyTask(next);
                  if (next) setPriority("high");
                }}
                className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition active:scale-[0.98] ${
                  isKeyTask
                    ? "border-amber-300/30 bg-amber-400/[0.08]"
                    : "border-white/10 bg-white/[0.045]"
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                  isKeyTask
                    ? "border-amber-300/30 bg-amber-400/15 text-amber-200"
                    : "border-white/10 bg-white/[0.06] text-white/35"
                }`}>
                  <Star className={`h-4.5 w-4.5 ${isKeyTask ? "fill-amber-300 text-amber-300" : ""}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${isKeyTask ? "text-amber-100" : "text-white/70"}`}>
                    Tarefa chave do dia
                  </p>
                  <p className="mt-0.5 text-xs leading-4 text-white/38">
                    A única que, se feita, torna o dia bem-sucedido.
                  </p>
                </div>
                <div className={`h-5 w-5 shrink-0 rounded-full border-2 transition ${
                  isKeyTask ? "border-amber-400 bg-amber-400" : "border-white/20 bg-transparent"
                }`} />
              </button>
            )}

            {selectedType === "task" && (
              <label className="block">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-white/42">
                    Prioridade
                  </span>
                  {isKeyTask && (
                    <span className="text-[0.68rem] font-semibold text-amber-300/80">
                      Travada em Alta pela tarefa chave
                    </span>
                  )}
                </div>

                <select
                  value={priority}
                  disabled={isKeyTask}
                  onChange={(e) =>
                    setPriority(e.target.value as "low" | "medium" | "high")
                  }
                  className={`min-h-[52px] w-full rounded-2xl border px-4 text-sm text-white outline-none transition ${
                    isKeyTask
                      ? "cursor-not-allowed border-amber-300/20 bg-amber-400/[0.06] opacity-70"
                      : "border-white/10 bg-[#222230] focus:border-purple-300/35"
                  }`}
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </label>
            )}

            {selectedType === "event" && (
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-white/42">
                  Local ou link
                </span>

                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Google Meet, sala 203..."
                  className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none placeholder:text-white/28 focus:border-purple-300/35"
                />
              </label>
            )}

            {selectedType === "routine" && (
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-white/42">
                  Repetição
                </span>

                <select
                  value={recurrence}
                  onChange={(e) =>
                    setRecurrence(e.target.value as "daily" | "weekly" | "monthly")
                  }
                  className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-[#222230] px-4 text-sm text-white outline-none focus:border-purple-300/35"
                >
                  <option value="daily">Todos os dias</option>
                  <option value="weekly">Toda semana</option>
                  <option value="monthly">Todo mês</option>
                </select>
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-white/42">
                Observação
              </span>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Adicione detalhes, contexto ou instruções..."
                rows={3}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/28 focus:border-purple-300/35"
              />
            </label>

            {formError && (
              <p className="text-xs font-medium text-rose-300">{formError}</p>
            )}
          </div>
        </div>

        <div className="relative border-t border-white/10 bg-[#171720]/95 px-5 py-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/35 active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando…
              </>
            ) : (
              <>
                Criar {typeLabels[selectedType].toLowerCase()}
                <Plus className="ml-2 h-4 w-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-6 text-sm font-semibold text-white/55 active:scale-[0.98]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function TypeButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[4.4rem] flex-col items-center justify-center gap-2 rounded-2xl border text-[0.68rem] font-semibold transition active:scale-[0.98] ${
        active
          ? "border-purple-300/30 bg-purple-500/20 text-purple-100 shadow-lg shadow-purple-950/20"
          : "border-white/10 bg-white/[0.045] text-white/42"
      }`}
    >
      <Icon className="h-4.5 w-4.5" />
      {label}
    </button>
  );
}


function DeletePlanningItemModal({
  task,
  isDeleting,
  onClose,
  onConfirm,
}: {
  task: Task | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!task) return null;

  const itemLabel = typeLabels[task.task_type].toLowerCase();

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-[360px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#15141f]/95 p-5 text-center shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-300/20 bg-red-500/10 text-red-200">
          <Trash2 className="h-6 w-6" />
        </div>

        <h2 className="text-xl font-semibold tracking-[-0.035em] text-white">
          Remover {itemLabel}?
        </h2>

        <p className="mt-3 text-sm leading-6 text-white/45">
          Essa ação vai excluir{" "}
          <span className="font-semibold text-white/75">"{task.title}"</span>{" "}
          do seu planejamento.
        </p>

        <div className="mt-5 rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-3 text-left">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/28">
            Item selecionado
          </p>

          <p className="mt-2 truncate text-sm font-semibold text-white">
            {task.title}
          </p>

          <p className="mt-1 text-xs text-white/38">
            {typeLabels[task.task_type]} · {statusLabels[task.status]}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-semibold text-white/60 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-red-500/90 px-4 text-sm font-semibold text-white shadow-lg shadow-red-950/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo
              </>
            ) : (
              <>
                Excluir
                <Trash2 className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditPlanningItemModal({
  task,
  onClose,
  onUpdated,
}: {
  task: Task | null;
  onClose: () => void;
  onUpdated: () => void | Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [location, setLocation] = useState("");
  const [recurrence, setRecurrence] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [description, setDescription] = useState("");
  const [isKeyTask, setIsKeyTask] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!task) return;

    setTitle(task.title ?? "");
    setDate(task.scheduled_date ?? "");
    setEndDate((task as Task & { end_date?: string | null }).end_date ?? task.scheduled_date ?? "");
    setStartTime(hhmm(task.start_time) ?? "");
    setEndTime(hhmm(task.end_time) ?? "");
    setPriority((task.priority as "low" | "medium" | "high") ?? "medium");
    setLocation(task.location ?? "");
    setRecurrence((task.recurrence as "daily" | "weekly" | "monthly") ?? "daily");
    setDescription(task.description ?? "");
    setIsKeyTask(!!task.is_key_task);
    setFormError(null);
  }, [task]);

  if (!task) return null;

  const isEvent = task.task_type === "event";
  const isTask = task.task_type === "task";
  const isRoutine = task.task_type === "routine";

  const descriptionText = isTask
    ? "Atualize os detalhes dessa tarefa pontual."
    : isEvent
    ? "Atualize data, horário e informações desse evento."
    : "Atualize os detalhes dessa rotina recorrente.";

  async function handleSubmit() {
    if (!title.trim()) {
      setFormError("Dê um nome para o item.");
      return;
    }

    if (isEvent && endDate && date && endDate < date) {
      setFormError("A data final do evento não pode ser anterior à data inicial.");
      return;
    }

    if (startTime && endTime && endTime <= startTime) {
      setFormError("O horário de término precisa ser depois do horário de início.");
      return;
    }

    if (!task) return;

    setSubmitting(true);
    setFormError(null);

    try {
      await api.updateTask(
        task.id,
        {
          title: title.trim(),
          scheduled_date: date || undefined,
          end_date: isEvent ? endDate || date : undefined,
          start_time: startTime || undefined,
          end_time: endTime || undefined,
          priority: isTask ? priority : undefined,
          location: isEvent ? location || undefined : undefined,
          recurrence: isRoutine ? recurrence : undefined,
          description: description || undefined,
          is_key_task: isTask ? isKeyTask : undefined,
        } as any
      );

      await onUpdated();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erro ao atualizar item");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm">
      <div className="relative flex max-h-[88vh] w-full max-w-[430px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#171720]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.22),transparent_48%)]" />

        <div className="relative border-b border-white/10 px-5 pb-4 pt-4">
          <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-white/18" />

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                <Edit3 className="h-3.5 w-3.5" />
                Editar {typeLabels[task.task_type].toLowerCase()}
              </div>

              <h2 className="text-[1.55rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
                Ajustar planejamento
              </h2>

              <p className="mt-2 text-xs leading-5 text-white/45">
                {descriptionText}
              </p>
            </div>

            <button
              onClick={onClose}
              disabled={submitting}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/45 active:scale-[0.96] disabled:opacity-50"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/28">
              Tipo de item
            </p>

            <p className="mt-1 text-sm font-semibold text-white">
              {typeLabels[task.task_type]}
            </p>

            <p className="mt-1 text-xs leading-5 text-white/35">
              O tipo não pode ser alterado depois da criação. Para trocar de tipo,
              exclua este item e crie um novo.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-white/42">
                Nome
              </span>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none placeholder:text-white/28 focus:border-purple-300/35"
              />
            </label>

            {isEvent ? (
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-white/42">
                    Data inicial
                  </span>

                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);

                      if (!endDate || endDate < e.target.value) {
                        setEndDate(e.target.value);
                      }
                    }}
                    className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none focus:border-purple-300/35"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-white/42">
                    Data final
                  </span>

                  <input
                    type="date"
                    value={endDate}
                    min={date}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none focus:border-purple-300/35"
                  />
                </label>
              </div>
            ) : (
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-white/42">
                  Data
                </span>

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none focus:border-purple-300/35"
                />
              </label>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-white/42">
                  Início
                </span>

                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none focus:border-purple-300/35"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium text-white/42">
                  Fim
                </span>

                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none focus:border-purple-300/35"
                />
              </label>
            </div>

            {isTask && (
              <button
                type="button"
                onClick={() => {
                  const next = !isKeyTask;
                  setIsKeyTask(next);
                  if (next) setPriority("high");
                }}
                className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition active:scale-[0.98] ${
                  isKeyTask
                    ? "border-amber-300/30 bg-amber-400/[0.08]"
                    : "border-white/10 bg-white/[0.045]"
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                  isKeyTask
                    ? "border-amber-300/30 bg-amber-400/15 text-amber-200"
                    : "border-white/10 bg-white/[0.06] text-white/35"
                }`}>
                  <Star className={`h-4.5 w-4.5 ${isKeyTask ? "fill-amber-300 text-amber-300" : ""}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${isKeyTask ? "text-amber-100" : "text-white/70"}`}>
                    Tarefa chave do dia
                  </p>
                  <p className="mt-0.5 text-xs leading-4 text-white/38">
                    A única que, se feita, torna o dia bem-sucedido.
                  </p>
                </div>
                <div className={`h-5 w-5 shrink-0 rounded-full border-2 transition ${
                  isKeyTask ? "border-amber-400 bg-amber-400" : "border-white/20 bg-transparent"
                }`} />
              </button>
            )}

            {isTask && (
              <label className="block">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-white/42">
                    Prioridade
                  </span>
                  {isKeyTask && (
                    <span className="text-[0.68rem] font-semibold text-amber-300/80">
                      Travada em Alta pela tarefa chave
                    </span>
                  )}
                </div>

                <select
                  value={priority}
                  disabled={isKeyTask}
                  onChange={(e) =>
                    setPriority(e.target.value as "low" | "medium" | "high")
                  }
                  className={`min-h-[52px] w-full rounded-2xl border px-4 text-sm text-white outline-none transition ${
                    isKeyTask
                      ? "cursor-not-allowed border-amber-300/20 bg-amber-400/[0.06] opacity-70"
                      : "border-white/10 bg-[#222230] focus:border-purple-300/35"
                  }`}
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </label>
            )}

            {isEvent && (
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-white/42">
                  Local ou link
                </span>

                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Google Meet, sala 203..."
                  className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none placeholder:text-white/28 focus:border-purple-300/35"
                />
              </label>
            )}

            {isRoutine && (
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-white/42">
                  Repetição
                </span>

                <select
                  value={recurrence}
                  onChange={(e) =>
                    setRecurrence(e.target.value as "daily" | "weekly" | "monthly")
                  }
                  className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-[#222230] px-4 text-sm text-white outline-none focus:border-purple-300/35"
                >
                  <option value="daily">Todos os dias</option>
                  <option value="weekly">Toda semana</option>
                  <option value="monthly">Todo mês</option>
                </select>
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-white/42">
                Observação
              </span>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Adicione detalhes, contexto ou instruções..."
                rows={3}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/28 focus:border-purple-300/35"
              />
            </label>

            {formError && (
              <p className="text-xs font-medium text-rose-300">{formError}</p>
            )}
          </div>
        </div>

        <div className="relative border-t border-white/10 bg-[#171720]/95 px-5 py-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/35 active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando…
              </>
            ) : (
              <>
                Salvar alterações
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-6 text-sm font-semibold text-white/55 active:scale-[0.98] disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

const PRIORITY_META_QUEUE = {
  high: { label: "Alta", dot: "bg-rose-400", badge: "border-rose-300/25 bg-rose-500/10 text-rose-200" },
  medium: { label: "Média", dot: "bg-amber-400", badge: "border-amber-300/25 bg-amber-500/10 text-amber-200" },
  low: { label: "Baixa", dot: "bg-sky-400", badge: "border-sky-300/25 bg-sky-500/10 text-sky-200" },
};

const QUEUE_PAGE_SIZE = 10;

function UndatedTasksSheet({
  tasks,
  onClose,
  onEdit,
  onDelete,
  onToggle,
}: {
  tasks: Task[];
  onClose: () => void;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onToggle: (t: Task) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? tasks : tasks.slice(0, QUEUE_PAGE_SIZE);
  const hidden = tasks.length - QUEUE_PAGE_SIZE;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm">
      {/* Backdrop clicável */}
      <button
        type="button"
        aria-label="Fechar fila"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="relative flex max-h-[82vh] w-full max-w-[430px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#171720]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        {/* Handle */}
        <div className="shrink-0 pt-4 px-5">
          <div className="mx-auto h-1.5 w-11 rounded-full bg-white/18" />
        </div>

        {/* Cabeçalho */}
        <div className="shrink-0 border-b border-white/10 px-5 pb-4 pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-100">
                <ListTodo className="h-3.5 w-3.5" />
                Fila · {tasks.length} {tasks.length === 1 ? "tarefa" : "tarefas"}
              </div>
              <h2 className="text-[1.35rem] font-semibold leading-tight tracking-[-0.04em] text-white">
                Tarefas sem data
              </h2>
              <p className="mt-1 text-xs text-white/38">
                Ordenadas por prioridade. Toque no lápis para atribuir uma data.
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/45 active:scale-[0.96]"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/38">Fila vazia.</p>
          ) : (
            <div className="space-y-2">
              {visible.map((task) => {
                const priority = (task.priority as "low" | "medium" | "high") ?? "medium";
                const meta = PRIORITY_META_QUEUE[priority];
                const isDone = task.status === "done";
                const Icon =
                  task.task_type === "task"
                    ? ListTodo
                    : task.task_type === "event"
                    ? CalendarDays
                    : Repeat;

                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 rounded-2xl border p-3 ${
                      isDone
                        ? "border-emerald-300/15 bg-emerald-400/[0.05]"
                        : "border-white/10 bg-white/[0.04]"
                    }`}
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />

                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-semibold ${isDone ? "text-white/38 line-through" : "text-white/85"}`}>
                        {task.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold ${meta.badge}`}>
                          {meta.label}
                        </span>
                        <span className="flex items-center gap-1 text-[0.6rem] text-white/28">
                          <Icon className="h-2.5 w-2.5" />
                          {typeLabels[task.task_type]}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => onToggle(task)}
                        className={`flex h-7 w-7 items-center justify-center rounded-xl active:scale-[0.94] ${
                          isDone ? "bg-emerald-400/15 text-emerald-300" : "bg-white/[0.055] text-white/40"
                        }`}
                        aria-label={isDone ? "Desmarcar" : "Marcar como feita"}
                      >
                        {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => onEdit(task)}
                        className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.055] text-white/40 active:scale-[0.94]"
                        aria-label="Editar"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(task)}
                        className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.055] text-white/40 active:scale-[0.94]"
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {!showAll && hidden > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-xs font-semibold text-white/50 active:scale-[0.98]"
                >
                  Mostrar mais {hidden} {hidden === 1 ? "tarefa" : "tarefas"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#151520_0%,#101018_48%,#13131d_100%)]" />
      <div className="absolute left-1/2 top-[-14rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-purple-700/22 blur-[120px]" />
      <div className="absolute right-[-12rem] top-[18rem] h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/10 blur-[110px]" />
      <div className="absolute bottom-[-12rem] left-[-12rem] h-[26rem] w-[26rem] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:30px_30px] opacity-[0.12]" />
    </div>
  );
}
