import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Focus,
  ListTodo,
  Menu,
  MoreVertical,
  Plus,
  Repeat,
  Sparkles,
  Target,
  X,
} from "lucide-react";

import { results, type ChronotypeResultKey } from "../data/results";
import Sidebar from "../components/layout/Sidebar";

type ViewMode = "month" | "week";
type PlanningItemType = "task" | "event" | "routine";
type PlanningItemStatus = "todo" | "progress" | "done" | "scheduled";

type RecurrenceRule = {
  frequency: "daily" | "weekly" | "monthly";
  label: string;
};

type PlanningItem = {
  id: number;
  itemType: PlanningItemType;
  title: string;
  subtitle: string;
  start: string;
  end?: string;
  status: PlanningItemStatus;
  progress?: number;
  recurrence?: RecurrenceRule;
};

const validKeys: ChronotypeResultKey[] = [
  "Matutino",
  "Vespertino",
  "Noturno",
  "Misto",
  "Bimodal",
];

const monthDays = Array.from({ length: 30 }, (_, index) => index + 1);

const weekDays = [
  { day: "10", label: "Seg" },
  { day: "11", label: "Ter" },
  { day: "12", label: "Qua", active: true },
  { day: "13", label: "Qui" },
  { day: "14", label: "Sex" },
];

const planningItems: PlanningItem[] = [
  {
    id: 1,
    itemType: "task",
    title: "Estender as roupas",
    subtitle: "Tarefa doméstica",
    start: "09:30",
    status: "todo",
    progress: 0,
  },
  {
    id: 2,
    itemType: "event",
    title: "Reunião com cliente",
    subtitle: "Compromisso fixo",
    start: "13:30",
    end: "15:00",
    status: "scheduled",
  },
  {
    id: 3,
    itemType: "routine",
    title: "Pilates",
    subtitle: "Rotina de saúde",
    start: "07:00",
    end: "08:00",
    status: "scheduled",
    recurrence: {
      frequency: "weekly",
      label: "Toda quarta",
    },
  },
  {
    id: 4,
    itemType: "routine",
    title: "Academia",
    subtitle: "Rotina diária",
    start: "16:00",
    end: "17:00",
    status: "progress",
    progress: 40,
    recurrence: {
      frequency: "daily",
      label: "Todos os dias",
    },
  },
];

const typeLabels = {
  task: "Tarefa",
  event: "Evento",
  routine: "Rotina",
};

const statusLabels = {
  todo: "A fazer",
  progress: "Em andamento",
  done: "Concluída",
  scheduled: "Agendado",
};

export default function Planning() {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const resultKey = useMemo<ChronotypeResultKey>(() => {
    const stored = localStorage.getItem("axon_chronotype");

    if (stored && validKeys.includes(stored as ChronotypeResultKey)) {
      return stored as ChronotypeResultKey;
    }

    return "Misto";
  }, []);

  const result = results[resultKey];

  const totalActionableItems = planningItems.filter(
    (item) => item.itemType === "task" || item.itemType === "routine"
  ).length;

  const completedItems = planningItems.filter(
    (item) => item.status === "done"
  ).length;

  const progress = Math.round((completedItems / totalActionableItems) * 100);

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
              <Brain className="h-5 w-5" />
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
                  Seu plano está em movimento.
                </h1>

                <p className="mt-2 text-sm leading-6 text-white/46">
                  {completedItems} de {totalActionableItems} itens concluídos.
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
              <p className="text-sm font-semibold text-white">Calendário</p>
              <p className="mt-1 text-xs text-white/38">
                Mês, semana e blocos do dia
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-xl shadow-purple-950/35 active:scale-[0.96]"
              aria-label="Criar novo item"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

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
            <MonthCalendar />
          ) : (
            <>
              <WeekCalendar />

              <div className="mt-5 space-y-5">
                {planningItems.map((item) => (
                  <TimelineItem key={item.id} item={item} />
                ))}
              </div>
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
              Use a visualização mensal para identificar dias mais carregados,
              eventos fixos e rotinas recorrentes.
            </p>
          </section>
        )}
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chronotypeLabel={result.label}
        energyPeak={result.energyPeak}
      />

      <CreatePlanningItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </main>
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

function MonthCalendar() {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
      <div className="mb-5 flex items-center justify-between">
        <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/45 active:scale-[0.96]">
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-white">Maio 2026</p>
          <p className="mt-1 text-xs text-white/35">Planejamento mensal</p>
        </div>

        <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/45 active:scale-[0.96]">
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
        {monthDays.map((day) => {
          const isActive = day === 12;
          const hasTask = [3, 8, 12, 18, 22, 27].includes(day);

          return (
            <button
              key={day}
              className={`relative flex h-9 items-center justify-center rounded-xl text-xs font-medium transition active:scale-[0.96] ${
                isActive
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-950/30"
                  : "bg-white/[0.035] text-white/50"
              }`}
            >
              {day}

              {hasTask && !isActive && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-purple-300" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekCalendar() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/45 active:scale-[0.96]">
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-white">Janeiro 2026</p>
          <p className="mt-1 text-xs text-white/35">Semana atual</p>
        </div>

        <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/45 active:scale-[0.96]">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {weekDays.map((item) => (
          <button
            key={item.day}
            className={`flex min-h-[82px] min-w-[62px] flex-col items-center justify-center rounded-[1.4rem] border transition active:scale-[0.98] ${
              item.active
                ? "border-purple-300/25 bg-purple-300 text-[#161622]"
                : "border-white/10 bg-black/20 text-white/45"
            }`}
          >
            <p className="text-xl font-semibold">{item.day}</p>
            <p className="mt-1 text-xs">{item.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function TimelineItem({ item }: { item: PlanningItem }) {
  const Icon =
    item.itemType === "task"
      ? ListTodo
      : item.itemType === "event"
      ? CalendarDays
      : Repeat;

  const timeLabel =
    item.itemType === "task"
      ? item.start
      : `${item.start}${item.end ? ` - ${item.end}` : ""}`;

  const isDone = item.status === "done";
  const isProgress = item.status === "progress";
  const isEvent = item.itemType === "event";
  const isRoutine = item.itemType === "routine";

  return (
    <div className="grid grid-cols-[3.4rem_1fr] gap-3">
      <div className="relative pt-1">
        <p className="text-xs font-semibold text-white/55">{item.start}</p>

        <div
          className={`mx-auto mt-3 h-16 w-px border-l ${
            isRoutine
              ? "border-dashed border-purple-300/35"
              : "border-dashed border-white/15"
          }`}
        />

        <p className="mt-3 text-xs font-semibold text-white/35">
          {item.end ?? "—"}
        </p>
      </div>

      <div
        className={`rounded-[1.55rem] border p-4 shadow-xl shadow-black/20 ${
          isDone
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
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.65rem] font-semibold ${
                isEvent
                  ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-100"
                  : isRoutine
                  ? "border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-100"
                  : isDone
                  ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                  : isProgress
                  ? "border-purple-300/25 bg-purple-500/15 text-purple-100"
                  : "border-white/10 bg-white/[0.055] text-white/52"
              }`}
            >
              <Icon className="h-3 w-3" />
              {typeLabels[item.itemType]}
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.65rem] font-semibold text-white/45">
              {statusLabels[item.status]}
            </span>
          </div>

          <button className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.055] text-white/45">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
              isEvent
                ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-100"
                : isRoutine
                ? "border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-100"
                : isDone
                ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                : isProgress
                ? "border-purple-300/20 bg-purple-500/15 text-purple-100"
                : "border-white/10 bg-white/[0.055] text-white/50"
            }`}
          >
            {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
          </div>

          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-white">
              {item.title}
            </p>
            <p className="mt-1 truncate text-xs text-white/42">
              {item.subtitle}
            </p>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="truncate text-xs text-white/38">
            {isRoutine && item.recurrence
              ? item.recurrence.label
              : timeLabel}
          </p>

          {item.itemType === "task" ? (
            <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200">
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

        {item.itemType !== "event" && (
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
              style={{ width: `${Math.max(item.progress ?? 0, 6)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function CreatePlanningItemModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selectedType, setSelectedType] = useState<PlanningItemType>("task");

  if (!isOpen) return null;

  const titlePlaceholder =
    selectedType === "task"
      ? "Ex: Estender as roupas"
      : selectedType === "event"
      ? "Ex: Reunião com cliente"
      : "Ex: Pilates";

  const description =
    selectedType === "task"
      ? "Tarefas são ações pontuais que você pode marcar como concluídas."
      : selectedType === "event"
      ? "Eventos ocupam um horário fixo, com início e fim definidos."
      : "Rotinas são compromissos recorrentes que se repetem automaticamente.";

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
                {description}
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

          <form className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-white/42">
                Nome
              </span>

              <input
                type="text"
                placeholder={titlePlaceholder}
                className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none placeholder:text-white/28 focus:border-purple-300/35"
              />
            </label>

            <div
              className={
                selectedType === "task" ? "grid grid-cols-1" : "grid grid-cols-2 gap-3"
              }
            >
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-white/42">
                  {selectedType === "task" ? "Horário" : "Início"}
                </span>

                <input
                  type="time"
                  className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none focus:border-purple-300/35"
                />
              </label>

              {selectedType !== "task" && (
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-white/42">
                    Fim
                  </span>

                  <input
                    type="time"
                    className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none focus:border-purple-300/35"
                  />
                </label>
              )}
            </div>

            {selectedType === "task" && (
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-white/42">
                  Prioridade
                </span>

                <select className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-[#222230] px-4 text-sm text-white outline-none focus:border-purple-300/35">
                  <option>Baixa</option>
                  <option>Média</option>
                  <option>Alta</option>
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

                <select className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-[#222230] px-4 text-sm text-white outline-none focus:border-purple-300/35">
                  <option>Todos os dias</option>
                  <option>Toda semana</option>
                  <option>Todo mês</option>
                </select>
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-white/42">
                Observação
              </span>

              <textarea
                placeholder="Adicione detalhes, contexto ou instruções..."
                rows={3}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/28 focus:border-purple-300/35"
              />
            </label>
          </form>
        </div>

        <div className="relative border-t border-white/10 bg-[#171720]/95 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/35 active:scale-[0.98]"
          >
            Criar {typeLabels[selectedType].toLowerCase()}
            <Plus className="ml-2 h-4 w-4" />
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