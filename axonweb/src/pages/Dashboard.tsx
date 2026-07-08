import { useCallback, useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Focus,
  MessageCircle,
  Moon,
  Plus,
  Sparkles,
  Star,
  Target,
  Zap,
  Bell,
  X,
} from "lucide-react";

import DayReview from "./DayReview";
import Sidebar from "../components/layout/Sidebar";
import * as api from "../lib/api";
import type { DashboardData, FocusBlock, BlockTask, Task, Subtask } from "../lib/api";
import { AppBackground } from "../components/layout/AppBackground";
import PageHeader from "../components/layout/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { ScrollArea } from "../components/ui/ScrollArea";

// ============================================================================
// Tipos locais
// Props e aliases usados apenas na montagem visual do Dashboard.
// ============================================================================

type MetricCardProps = {
  icon: ElementType;
  label: string;
  value: string;
  helper: string;
};

// ============================================================================
// Página Dashboard
// Tela inicial pós-login: ritmo atual, tarefa-chave, plano do dia e notificações.
// ============================================================================

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // --------------------------------------------------------------------------
  // Estados da página
  // Controlam menu lateral, carregamento inicial, plano do dia e modais locais.
  // --------------------------------------------------------------------------
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyTask, setKeyTask] = useState<Task | null>(null);
  const [subtasksMap, setSubtasksMap] = useState<Record<string, Subtask[]>>({});
  const [showNextBlock, setShowNextBlock] = useState(false);
  const [todayLog, setTodayLog] = useState<api.DailyLog | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  // --------------------------------------------------------------------------
  // Notificações
  // Mantém o contador do sino sincronizado com o toast global e o modal.
  // --------------------------------------------------------------------------
  const refreshUnreadCount = useCallback(() => {
    api
      .getNotifications(50, 0)
      .then((notifications) => {
        const nextUnreadCount = notifications.filter(
          (notification) => notification.status === "unread"
        ).length;

        setUnreadCount(nextUnreadCount);
      })
      .catch(() => setUnreadCount(0));
  }, []);

  useEffect(() => {
    const handleNotificationsUpdated = () => {
      refreshUnreadCount();
    };

    window.addEventListener(
      "axon:notifications-updated",
      handleNotificationsUpdated
    );

    return () => {
      window.removeEventListener(
        "axon:notifications-updated",
        handleNotificationsUpdated
      );
    };
  }, [refreshUnreadCount]);

  // --------------------------------------------------------------------------
  // Subtarefas do plano enxuto
  // Agrupa por task_id para mostrar progresso compacto dentro da seção “Hoje”.
  // --------------------------------------------------------------------------
  const loadSubtasks = useCallback(async () => {
    try {
      const all = await api.getSubtasks();

      const map: Record<string, Subtask[]> = {};

      for (const subtask of all) {
        if (!map[subtask.task_id]) {
          map[subtask.task_id] = [];
        }

        map[subtask.task_id].push(subtask);
      }

      Object.values(map).forEach((items) => {
        items.sort((a, b) => a.position - b.position);
      });

      setSubtasksMap(map);
    } catch {
      setSubtasksMap({});
    }
  }, []);

  // --------------------------------------------------------------------------
  // Carregamento principal
  // Busca dashboard, tarefa-chave, revisão diária, subtarefas e notificações.
  // Também atualiza dados ao retornar para a aba e a cada 30 minutos.
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!api.isLoggedIn()) {
      navigate("/login");
      return;
    }

    const todayISO = new Date().toISOString().slice(0, 10);

    const loadDashboard = () => {
      api
        .getDashboard()
        .then(setData)
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    };

    const loadKeyTask = () => {
      api
        .getTasks({ scheduled_date: todayISO })
        .then((tasks) => setKeyTask(tasks.find((t) => t.is_key_task) ?? null))
        .catch(() => null);
    };

    const loadDailyLog = () => {
      api
        .getDailyLogToday()
        .then(setTodayLog)
        .catch(() => setTodayLog(null));
    };

    const analyzeNotificationsAndRefresh = () => {
      api
        .analyzeNotifications()
        .catch(() => null)
        .finally(() => {
          refreshUnreadCount();
        });
    };

    loadDashboard();
    loadDailyLog();
    loadKeyTask();
    loadSubtasks();
    refreshUnreadCount();
    analyzeNotificationsAndRefresh();

    const interval = window.setInterval(() => {
      loadDashboard();
      loadKeyTask();
      loadSubtasks();
    }, 30 * 60 * 1000);

    // Captura notificações geradas pelo scheduler enquanto o app permanece aberto.
    const notifInterval = window.setInterval(refreshUnreadCount, 2 * 60 * 1000);

    const handleVisibility = () => {
      if (document.hidden) return;

      loadDashboard();
      loadSubtasks();
      refreshUnreadCount();
      analyzeNotificationsAndRefresh();
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(interval);
      window.clearInterval(notifInterval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [navigate, refreshUnreadCount, loadSubtasks]);

  // --------------------------------------------------------------------------
  // Abertura automática da revisão diária
  // Permite que outra tela navegue para cá já abrindo o DayReview.
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (location.state?.openDayReview) {
      setReviewOpen(true);
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location.state, location.pathname]);

  // --------------------------------------------------------------------------
  // Abertura automática das notificações
  // O toast global usa /dashboard?notifications=open para abrir o modal do sino.
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (searchParams.get("notifications") !== "open") return;

    setIsNotificationsOpen(true);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("notifications");
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // --------------------------------------------------------------------------
  // Dados derivados do dashboard
  // Centraliza fallbacks e rótulos calculados para simplificar o JSX.
  // --------------------------------------------------------------------------
  const showReviewCard = new Date().getHours() >= 18 && todayLog === null;

  const chronotypeKey =
    data?.chronotype_key ??
    localStorage.getItem("axon_chronotype") ??
    "intermediate";

  const chronotypeLabel = data?.chronotype_label ?? "Perfil Intermediário";
  const energyPeak = data?.energy_peak ?? "Entre 9h e 15h";
  const focusWindow = data?.focus_window ?? "Meio do dia";
  const greeting = data?.greeting ?? "Bom dia";

  const energyPercent = data?.energy_percent ?? 78;
  const focusPercent = data?.focus_percent ?? 64;

  const nextFocus = data?.next_focus;
  const dayBlocks = data?.day_blocks ?? [];

  const currentBlock = data?.current_block;
  const nextBlock = data?.next_block;

  const rhythmLabel = useMemo(() => {
    if (chronotypeKey === "night") return "Noturno";
    if (chronotypeKey === "morning") return "Matutino";
    if (chronotypeKey === "evening") return "Vespertino";
    return "Estável";
  }, [chronotypeKey]);

  const nextPeakValue = nextFocus?.start ?? energyPeak;

  const mainAction =
    nextFocus?.status === "active"
      ? "Sua melhor janela de foco está ativa agora."
      : "Sua próxima janela produtiva está chegando.";

  return (
    <main className="relative min-h-screen overflow-hidden bg-app text-primary">
      <AppBackground />

      <div className="relative z-10 min-h-screen px-4 pb-6 pt-5">
        {/* Header fixo: acesso ao dashboard, central de notificações e sidebar. */}
        <PageHeader
          title="Dashboard"
          subtitle="Seu dia agora"
          onBack={() => navigate("/dashboard")}
          onMenuClick={() => setIsSidebarOpen(true)}
          rightSlot={
            <button
            type="button"
            onClick={() => setIsNotificationsOpen(true)}
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-soft bg-surface-muted text-secondary backdrop-blur-2xl transition active:scale-[0.96]"
            aria-label="Abrir notificações"
          >
            <Bell className="h-5 w-5" />

            {Number(unreadCount) > 0 && (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-[var(--app-bg)] bg-purple-400" />
            )}
          </button>
          }
        />

        {/* Bloco “Agora”: resume a janela de foco atual e o próximo bloco do dia. */}
        <section className="mb-4">
          <div className="relative overflow-hidden rounded-[2rem] border border-soft bg-surface-elevated p-5 shadow-card backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.22),transparent_48%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),transparent_42%)]" />

            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-soft bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                Ajustado ao seu ritmo
              </div>

              <h1 className="text-[1.95rem] font-semibold leading-[1.03] tracking-[-0.06em] text-primary">
                {greeting}. Vamos focar no que move seu dia.
              </h1>

              <p className="mt-3 text-sm leading-6 text-muted">
                {mainAction}
              </p>

              <div className="mt-5 rounded-[1.55rem] border border-accent-soft bg-surface-muted p-3.5 shadow-inner">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-accent-soft bg-accent-soft text-accent">
                      <Focus className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-accent">
                        Agora
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        Ritmo atual do seu dia
                      </p>
                    </div>
                  </div>

                  {currentBlock && (
                    <p className="shrink-0 text-xs font-medium text-muted">
                      {currentBlock.start} – {currentBlock.end}
                    </p>
                  )}
                </div>

                <CurrentFocusBlockCard
                  currentBlock={currentBlock}
                  nextBlock={nextBlock}
                  fallbackLabel={nextFocus?.label}
                  fallbackStart={nextFocus?.start}
                  fallbackProgress={energyPercent}
                  showNextBlock={showNextBlock}
                  onToggleNext={() => setShowNextBlock((current) => !current)}
                />

                <button
                  onClick={() => navigate("/chat")}
                  className="mt-3 inline-flex items-center gap-2 rounded-full px-1 text-xs font-semibold text-accent active:scale-[0.98]"
                >
                  Ajustar com o Axon
                  <MessageCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Tarefa-chave: destaque rápido para a prioridade principal do dia. */}
        {keyTask && (
          <section className="mb-4">
            <button
              type="button"
              onClick={() => navigate("/planning")}
              className={`group w-full overflow-hidden rounded-[2rem] border p-4 text-left shadow-xl backdrop-blur-2xl active:scale-[0.98] transition ${
                keyTask.status === "done"
                  ? "border-emerald-300/20 bg-emerald-400/[0.07] shadow-emerald-950/10"
                  : "border-amber-300/25 bg-amber-400/[0.07] shadow-amber-950/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                  keyTask.status === "done"
                    ? "border-emerald-300/25 bg-emerald-400/15 text-emerald-200"
                    : "border-amber-300/25 bg-amber-400/15 text-amber-200"
                }`}>
                  <Star className={`h-5 w-5 ${keyTask.status !== "done" ? "fill-amber-300 text-amber-300" : ""}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-soft">
                    Tarefa chave de hoje
                  </p>
                  <p className={`mt-0.5 truncate text-sm font-semibold ${
                    keyTask.status === "done" ? "text-emerald-600 line-through opacity-70" : "text-primary"
                  }`}>
                    {keyTask.title}
                  </p>
                </div>

                <span className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  keyTask.status === "done"
                    ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-600 dark:text-emerald-100"
                    : "border-amber-300/20 bg-amber-400/10 text-amber-100"
                }`}>
                  {keyTask.status === "done" ? "Concluída" : "Pendente"}
                </span>
              </div>
            </button>
          </section>
        )}

        {/* Revisão diária: aparece à noite quando ainda não existe registro de hoje. */}
        {showReviewCard && (
          <section className="mb-4">
            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              className="group w-full overflow-hidden rounded-[2rem] border border-accent-soft bg-accent-soft p-4 text-left shadow-card backdrop-blur-2xl active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent-soft bg-accent-soft text-accent">
                  <Moon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-primary">Como foi o seu dia?</p>
                  <p className="mt-0.5 text-xs text-muted">
                    Leva menos de 1 minuto · Alimenta seus Insights
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-accent-soft bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent">
                  Registrar
                </span>
              </div>
            </button>
          </section>
        )}

        {/* Métricas rápidas: energia, foco, próximo pico e ritmo predominante. */}
        <section className="mb-4 grid grid-cols-2 gap-3">
          <MetricCard
            icon={Zap}
            label="Energia"
            value={loading ? "..." : `${energyPercent}%`}
            helper="nível atual"
          />

          <MetricCard
            icon={Focus}
            label="Foco"
            value={loading ? "..." : `${focusPercent}%`}
            helper="clareza mental"
          />

          <MetricCard
            icon={Clock3}
            label="Pico"
            value={nextPeakValue}
            helper="produtividade"
          />

          <MetricCard
            icon={Moon}
            label="Ritmo"
            value={rhythmLabel}
            helper={focusWindow}
          />
        </section>

        {/* Plano enxuto: mostra até cinco itens dos blocos do dia, com subtarefas. */}
        <section className="rounded-[2rem] border border-soft bg-surface-elevated p-4 shadow-card backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Hoje</p>
              <p className="mt-1 text-xs text-muted">
                Plano enxuto do dia
              </p>
            </div>

            <CalendarDays className="h-5 w-5 text-accent" />
          </div>

          {(() => {
            const flatTasks = dayBlocks.flatMap((b) => b.tasks);
            const typeLabel: Record<string, string> = {
              task: "Tarefa", event: "Evento", routine: "Rotina",
            };

            if (flatTasks.length === 0) {
              return (
                <EmptyState
                  icon={CalendarDays}
                  title="Nenhuma tarefa para hoje"
                  description="Converse com o Axon para organizar seu dia ou adicione tarefas no Planejamento."
                  actionLabel="Adicionar tarefa"
                  onAction={() => navigate("/planning")}
                />
              );
            }

            return (
              <div className="space-y-3">
                {flatTasks.slice(0, 5).map((task) => {
                  const isActive = task.status === "progress";
                  const isKey = task.is_key_task;

                  const subtasks = subtasksMap[task.id] ?? [];
                  const completedSubtasks = subtasks.filter(
                    (subtask) => subtask.done
                  ).length;
                  const hasSubtasks = subtasks.length > 0;

                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 rounded-[1.45rem] border p-3 ${
                        isKey
                          ? "border-amber-300/25 bg-amber-400/[0.07]"
                          : isActive
                          ? "border-purple-300/25 bg-purple-500/10"
                          : "border-soft bg-surface-muted"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-xs font-semibold ${
                          isKey
                            ? "border-amber-300/25 bg-amber-400/15 text-amber-200"
                            : isActive
                            ? "border-accent-soft bg-accent-soft text-accent"
                            : "border-soft bg-surface-muted text-muted"
                        }`}
                      >
                        {task.start_time ?? "—"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-semibold ${
                            isKey ? "text-amber-700 dark:text-amber-100" : "text-primary"
                          }`}
                        >
                          {task.title}
                        </p>

                        <p className="mt-0.5 text-xs text-muted">
                          {task.objective_title ? (
                            <span className="inline-flex items-center gap-1">
                              <Star className="h-3 w-3 text-purple-300/60" />
                              {task.objective_title}
                            </span>
                          ) : (
                            typeLabel[task.task_type] ?? "Tarefa"
                          )}
                        </p>

                        {hasSubtasks && (
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-accent-soft bg-accent-soft px-2.5 py-1 text-[0.65rem] font-semibold text-accent">
                            <CheckCircle2 className="h-3 w-3" />
                            {completedSubtasks}/{subtasks.length} subtarefas
                          </div>
                        )}
                      </div>

                      {isKey && (
                        <Star className="h-4 w-4 shrink-0 fill-amber-300 text-amber-300" />
                      )}

                      {!isKey && isActive && (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          <button
            onClick={() => navigate("/planning")}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-soft bg-surface-muted px-5 text-sm font-semibold text-secondary backdrop-blur-2xl active:scale-[0.98]"
          >
            Ver planejamento
            <CalendarDays className="ml-2 h-4 w-4" />
          </button>
        </section>
      </div>

      {/* Overlays globais: sidebar, revisão diária e central de notificações. */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chronotypeLabel={chronotypeLabel}
        energyPeak={energyPeak}
      />

      <DayReview
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        existing={todayLog}
        onSaved={(log) => setTodayLog(log)}
      />

      <NotificationsSheet
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onUnreadCountChange={(count) => setUnreadCount(Number(count) || 0)}
      />
    </main>
  );
}

// ============================================================================
// Componentes internos do Dashboard
// Cards visuais usados apenas nesta página.
// ============================================================================

// Card compacto usado na grade de métricas rápidas do topo.
function MetricCard({ icon: Icon, label, value, helper }: MetricCardProps) {
  return (
    <div className="rounded-[1.55rem] border border-soft bg-surface-elevated p-4 shadow-card backdrop-blur-2xl">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-accent-soft bg-accent-soft text-accent">
        <Icon className="h-4 w-4" />
      </div>

      <p className="text-xs text-muted">{label}</p>

      <p className="mt-1 text-xl font-semibold tracking-tight text-primary">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-soft">{helper}</p>
    </div>
  );
}

// Exibe o bloco cronobiológico atual; usa fallback enquanto o backend carrega.
function CurrentFocusBlockCard({
  currentBlock,
  nextBlock,
  fallbackLabel,
  fallbackStart,
  fallbackProgress,
  showNextBlock,
  onToggleNext,
}: {
  currentBlock?: FocusBlock;
  nextBlock?: FocusBlock;
  fallbackLabel?: string;
  fallbackStart?: string;
  fallbackProgress: number;
  showNextBlock: boolean;
  onToggleNext: () => void;
}) {
  if (!currentBlock) {
    const fallbackProgressSafe = clampPercent(fallbackProgress);

    return (
      <div className="rounded-[1.25rem] border border-soft bg-surface-muted p-3.5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Target className="h-4 w-4 shrink-0 text-accent" />

            <p className="truncate text-sm font-semibold text-primary">
              Bloco de foco
            </p>
          </div>

          <p className="shrink-0 text-xs text-muted">
            {fallbackStart ?? "10:40"}
          </p>
        </div>

        <p className="text-sm leading-5 text-secondary">
          {fallbackLabel ?? "Comece pela tarefa que mais impacta seu dia."}
        </p>

        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between text-[0.68rem] text-soft">
            <span>Progresso</span>
            <span>{fallbackProgressSafe}%</span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-300 shadow-[0_0_16px_rgba(192,132,252,0.45)]"
              style={{
                width: `${fallbackProgressSafe}%`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  const progress = getCurrentBlockProgress(currentBlock);

  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-soft bg-surface-muted p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-accent">
            {currentBlock.level_label}
          </p>
        </div>

        <div className="shrink-0 rounded-full border border-accent-soft bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
          {progress}%
        </div>
      </div>

      <p className="mt-3 text-sm leading-5 text-secondary">
        {currentBlock.description}
      </p>

      {currentBlock.tasks.length > 0 && (
        <div className="mt-3 space-y-2">
          {currentBlock.tasks.map((task) => (
            <BlockTaskRow key={task.id} task={task} />
          ))}
        </div>
      )}

      <div className="mt-3">
        <div className="mb-2 flex items-center justify-between text-[0.68rem] text-soft">
          <span>Progresso</span>
          <span>{progress}%</span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-300 shadow-[0_0_16px_rgba(192,132,252,0.42)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {nextBlock && (
        <div className="mt-3">
          <button
            type="button"
            onClick={onToggleNext}
            className="flex min-h-10 w-full items-center rounded-2xl border border-soft bg-surface-muted px-3.5 text-xs font-semibold text-muted active:scale-[0.98]"
          >
            <span>
              {showNextBlock ? "Ocultar próximo" : "Próximo bloco"}
            </span>

            <span className="ml-auto mr-2 text-[0.68rem] font-medium text-soft">
              {nextBlock.start} – {nextBlock.end}
            </span>

            {showNextBlock ? (
              <ChevronUp className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0" />
            )}
          </button>

          {showNextBlock && (
            <div className="mt-2.5 rounded-[1.15rem] border border-soft bg-surface-muted p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="truncate text-xs font-semibold text-secondary">
                  {nextBlock.level_label}
                </p>

                <p className="shrink-0 text-[0.68rem] font-medium text-soft">
                  {nextBlock.start} – {nextBlock.end}
                </p>
              </div>

              <p className="text-xs leading-5 text-muted">
                {nextBlock.description}
              </p>

              {nextBlock.tasks.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                  {nextBlock.tasks.map((task) => (
                    <BlockTaskRow key={task.id} task={task} compact />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Linha curta de tarefa dentro dos blocos de foco atual/próximo.
function BlockTaskRow({ task, compact = false }: { task: BlockTask; compact?: boolean }) {
  const isProgress = task.status === "progress";

  return (
    <div className={`flex items-center gap-2.5 ${compact ? "px-0 py-1" : "px-3 py-2.5"}`}>
      {task.is_key_task ? (
        <Star className="h-3.5 w-3.5 shrink-0 fill-amber-300 text-amber-300" />
      ) : (
        <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          isProgress ? "bg-purple-300" : "bg-[var(--text-soft)]"
        }`} />
      )}

      <p className={`min-w-0 flex-1 truncate text-xs font-semibold ${
        task.is_key_task ? "text-amber-700 dark:text-amber-100" : "text-secondary"
      }`}>
        {task.title}
      </p>

      {task.start_time && (
        <p className="shrink-0 text-[0.65rem] text-soft">
          {task.start_time}{task.end_time ? `–${task.end_time}` : ""}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Helpers de cálculo
// Mantêm regras de progresso fora do JSX principal.
// ============================================================================

// Calcula o avanço temporal do bloco atual com base no horário local do usuário.
function getCurrentBlockProgress(block: FocusBlock) {
  const now = new Date();

  const [startHour, startMinute] = block.start.split(":").map(Number);
  const [endHour, endMinute] = block.end.split(":").map(Number);

  const start = new Date(now);
  start.setHours(startHour, startMinute, 0, 0);

  const end = new Date(now);
  end.setHours(endHour, endMinute, 0, 0);

  // Blocos que terminam em 00:00 precisam ser tratados como fim no dia seguinte.
  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }

  const total = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();

  if (elapsed <= 0) return 0;
  if (elapsed >= total) return 100;

  return clampPercent(Math.round((elapsed / total) * 100));
}

function clampPercent(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

// ============================================================================
// Central de notificações
// Modal aberto pelo sino do header e pelo toast global via query param.
// ============================================================================

type NotificationAction = {
  task_id?: string;
  new_date?: string | null;
  new_start_time?: string | null;
  new_end_time?: string | null;
  reason?: string | null;
};

type NotificationWithAction = api.NotificationData & {
  action?: NotificationAction | null;
};

// Item individual do modal: leitura simples, alteração aplicada ou sugestão acionável.
function NotificationItem({
  notification,
  onRead,
  onAccept,
  onReject,
}: {
  notification: api.NotificationData;
  onRead: (id: string) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const typedNotification = notification as NotificationWithAction;

  const isUnread = notification.status === "unread";
  const isImprovement = notification.type === "improvement";
  const isChange = notification.type === "change";
  const isAccepted = notification.status === "accepted";
  const isRejected = notification.status === "rejected";
  const isHandled = isAccepted || isRejected;

  const canAct = isImprovement && !isHandled;
  const action = typedNotification.action;

  function handleCardClick() {
    if (isUnread) {
      onRead(notification.id);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          handleCardClick();
        }
      }}
      className={`rounded-[1.55rem] border p-4 text-left transition active:scale-[0.99] ${
        isImprovement
          ? isHandled
            ? "border-soft bg-surface-muted opacity-60"
            : "border-purple-300/24 bg-purple-500/12"
          : isUnread
          ? "border-purple-300/18 bg-purple-500/8"
          : "border-soft bg-surface-muted opacity-55"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border ${
              isImprovement
                ? "border-accent-soft bg-accent-soft text-accent"
                : isChange
                ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-600 dark:text-emerald-100"
                : "border-soft bg-surface-muted text-muted"
            }`}
          >
            {isImprovement ? (
              <Sparkles className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] ${
                  isImprovement
                    ? "border-accent-soft bg-accent-soft text-accent"
                    : isChange
                    ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-600 dark:text-emerald-100"
                    : "border-soft bg-surface-muted text-muted"
                }`}
              >
                {isImprovement
                  ? "Sugestão"
                  : isChange
                  ? "Alteração"
                  : "Aviso"}
              </span>

              {isUnread && (
                <span className="h-1.5 w-1.5 rounded-full bg-purple-300" />
              )}
            </div>

            <p className="text-sm font-semibold leading-5 text-primary">
              {notification.title}
            </p>

            <p className="mt-1 text-xs leading-5 text-muted">
              {notification.body}
            </p>
          </div>
        </div>

        <span className="shrink-0 text-[0.65rem] font-medium text-soft">
          {formatNotificationTime(notification.created_at)}
        </span>
      </div>

      {isImprovement && action && !isHandled && (
        <div className="mb-3 rounded-[1.15rem] border border-soft bg-surface-muted p-3">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-soft">
            Ajuste sugerido
          </p>

          {(action.new_date || action.new_start_time || action.new_end_time) && (
            <p className="mt-2 text-xs font-semibold text-secondary">
              {action.new_date && <>Data: {action.new_date}</>}
              {action.new_start_time && (
                <>
                  {action.new_date ? " · " : ""}
                  {action.new_start_time}
                  {action.new_end_time ? ` – ${action.new_end_time}` : ""}
                </>
              )}
            </p>
          )}

          {action.reason && (
            <p className="mt-1 text-xs leading-5 text-muted">
              {action.reason}
            </p>
          )}
        </div>
      )}

      {canAct && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAccept(notification.id);
            }}
            className="inline-flex min-h-10 items-center justify-center rounded-2xl bg-purple-500 px-4 text-xs font-semibold text-white shadow-lg shadow-purple-950/25 active:scale-[0.98]"
          >
            Aceitar
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onReject(notification.id);
            }}
            className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-soft bg-surface-muted px-4 text-xs font-semibold text-muted active:scale-[0.98]"
          >
            Recusar
          </button>
        </div>
      )}

      {!isImprovement && isUnread && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRead(notification.id);
          }}
          className="mt-3 inline-flex min-h-8 items-center justify-center rounded-xl border border-soft bg-surface-muted px-3 text-[0.68rem] font-semibold text-muted active:scale-[0.98]"
        >
          Marcar como lida
        </button>
      )}

      {isAccepted && (
        <p className="mt-3 text-[0.68rem] font-semibold text-accent">
          Sugestão aceita
        </p>
      )}

      {isRejected && (
        <p className="mt-3 text-[0.68rem] font-semibold text-soft">
          Sugestão recusada
        </p>
      )}
    </div>
  );
}

// Formata datas recentes em linguagem curta para caber no card mobile.
function formatNotificationTime(createdAt: string) {
  const date = new Date(createdAt);
  const now = new Date();

  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffMin < 1) return "Agora";
  if (diffMin < 60) return `Há ${diffMin} min`;

  const diffH = Math.floor(diffMin / 60);

  if (diffH < 24) return `Há ${diffH}h`;

  const diffDays = Math.floor(diffH / 24);

  if (diffDays === 1) return "Ontem";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function NotificationsSheet({
  isOpen,
  onClose,
  onUnreadCountChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange: (count: number) => void;
}) {
  // Estados do modal: lista local, aba ativa, paginação e carregamento.
  const [notifications, setNotifications] = useState<api.NotificationData[]>([]);
  const [notificationView, setNotificationView] = useState<"unread" | "read">(
    "unread"
  );
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const NOTIFICATIONS_PAGE_SIZE = 10;

  // Listas derivadas para separar rapidamente o que está pendente do que já foi tratado.
  const unreadNotifications = notifications.filter(
    (notification) => notification.status === "unread"
  );

  const readNotifications = notifications.filter(
    (notification) => notification.status !== "unread"
  );

  const filteredNotifications =
    notificationView === "unread" ? unreadNotifications : readNotifications;
  const shouldShowLoadMore =
    hasMore && filteredNotifications.length >= NOTIFICATIONS_PAGE_SIZE;

  const unreadCount = unreadNotifications.length;
  const readCount = readNotifications.length;

  // Carrega uma página extra para descobrir se ainda existe “Ver mais”.
  function loadNotifications({ showLoading = true } = {}) {
    if (showLoading) {
      setLoading(true);
    }

    api
      .getNotifications(NOTIFICATIONS_PAGE_SIZE + 1, 0)
      .then((data) => {
        const visibleNotifications = data.slice(0, NOTIFICATIONS_PAGE_SIZE);

        setNotifications(visibleNotifications);
        setHasMore(data.length > NOTIFICATIONS_PAGE_SIZE);

        const nextUnreadCount = data.filter(
          (notification) => notification.status === "unread"
        ).length;

        onUnreadCountChange(nextUnreadCount);
      })
      .catch(() => null)
      .finally(() => {
        if (showLoading) {
          setLoading(false);
        }
      });
  }

  useEffect(() => {
    if (!isOpen) return;

    loadNotifications({ showLoading: true });

    const handleNotificationsUpdated = () => {
      loadNotifications({ showLoading: false });
    };

    window.addEventListener(
      "axon:notifications-updated",
      handleNotificationsUpdated
    );

    return () => {
      window.removeEventListener(
        "axon:notifications-updated",
        handleNotificationsUpdated
      );
    };
  }, [isOpen]);

  async function loadMore() {
    try {
      const more = await api.getNotifications(
        NOTIFICATIONS_PAGE_SIZE + 1,
        notifications.length
      );

      const visibleMore = more.slice(0, NOTIFICATIONS_PAGE_SIZE);

      setNotifications((prev) => {
        const next = [...prev, ...visibleMore];

        return next;
      });

      setHasMore(more.length > NOTIFICATIONS_PAGE_SIZE);
    } catch {
      // Falha silenciosa para não travar a central de notificações.
    }
  }

  function syncUnreadCount(nextNotifications: api.NotificationData[]) {
    const nextUnreadCount = nextNotifications.filter(
      (notification) => notification.status === "unread"
    ).length;

    onUnreadCountChange(nextUnreadCount);
  }

  // Marca como lida de forma otimista, sem recarregar a central inteira.
  async function handleRead(id: string) {
    const currentNotification = notifications.find(
      (notification) => notification.id === id
    );

    if (!currentNotification || currentNotification.status !== "unread") {
      return;
    }

    const nextNotifications = notifications.map((notification) =>
      notification.id === id
        ? { ...notification, status: "read" as const }
        : notification
    );

    setNotifications(nextNotifications);
    syncUnreadCount(nextNotifications);

    await api.markNotificationRead(id).catch(() => {
      loadNotifications({ showLoading: false });
    });
  }

  // Aceita sugestões de melhoria e move o item para a aba de lidas/tratadas.
  async function handleAccept(id: string) {
    const nextNotifications = notifications.map((notification) =>
      notification.id === id
        ? { ...notification, status: "accepted" as const }
        : notification
    );

    setNotifications(nextNotifications);
    syncUnreadCount(nextNotifications);
    setNotificationView("read");

    await api.acceptNotification(id).catch(() => {
      loadNotifications({ showLoading: false });
    });
  }

  // Recusa sugestões mantendo o histórico visível na aba de lidas/tratadas.
  async function handleReject(id: string) {
    const nextNotifications = notifications.map((notification) =>
      notification.id === id
        ? { ...notification, status: "rejected" as const }
        : notification
    );

    setNotifications(nextNotifications);
    syncUnreadCount(nextNotifications);
    setNotificationView("read");

    await api.rejectNotification(id).catch(() => {
      loadNotifications({ showLoading: false });
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="relative flex h-[82dvh] max-h-[720px] w-full max-w-[430px] flex-col overflow-hidden rounded-[2rem] border border-soft bg-surface-elevated shadow-soft backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.22),transparent_48%)]" />

        <div className="relative border-b border-soft px-5 pb-4 pt-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent-soft bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
                <Bell className="h-3.5 w-3.5" />
                Central do Axon
              </div>

              <h2 className="text-[1.65rem] font-semibold leading-[1.05] tracking-[-0.055em] text-primary">
                Notificações
              </h2>

              <p className="mt-2 text-xs leading-5 text-muted">
                Avisos importantes, lembretes inteligentes e sugestões para
                melhorar seu planejamento.
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-soft bg-surface-muted text-muted active:scale-[0.96]"
              aria-label="Fechar notificações"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex rounded-2xl border border-soft bg-surface-muted p-1">
            <button
              type="button"
              onClick={() => setNotificationView("unread")}
              className={`min-h-10 flex-1 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                notificationView === "unread"
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-950/25"
                  : "text-muted"
              }`}
            >
              Não lidas
              {unreadCount > 0 && (
                <span className="ml-1 text-[0.65rem] opacity-75">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setNotificationView("read")}
              className={`min-h-10 flex-1 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                notificationView === "read"
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-950/25"
                  : "text-muted"
              }`}
            >
              Lidas
              {readCount > 0 && (
                <span className="ml-1 text-[0.65rem] opacity-75">
                  {readCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <ScrollArea
          className="min-h-0 flex-1 overflow-hidden"
          contentClassName="relative px-5 py-4"
        >
          {loading && notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted">
              Carregando...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title={
                notificationView === "unread"
                  ? "Nenhuma notificação não lida"
                  : "Nenhuma notificação lida"
              }
              description={
                notificationView === "unread"
                  ? "Quando houver novos avisos ou sugestões, eles aparecerão aqui."
                  : "Notificações já lidas, aceitas ou recusadas aparecerão nesta aba."
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleRead}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              ))}

              {shouldShowLoadMore && (
                <button
                  type="button"
                  onClick={loadMore}
                  className="mt-1 inline-flex min-h-10 w-full items-center justify-center rounded-2xl border border-soft bg-surface-muted px-4 text-xs font-semibold text-muted active:scale-[0.98]"
                >
                  Ver mais
                </button>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}