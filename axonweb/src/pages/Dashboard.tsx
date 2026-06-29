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
  Menu,
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
import type { DashboardData, FocusBlock, BlockTask, Task } from "../lib/api";

type MetricCardProps = {
  icon: ElementType;
  label: string;
  value: string;
  helper: string;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // ---------------------------------------------------------------------------
  // ESTADOS GERAIS DA TELA
  // ---------------------------------------------------------------------------
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyTask, setKeyTask] = useState<Task | null>(null);
  const [showNextBlock, setShowNextBlock] = useState(false);
  const [todayLog, setTodayLog] = useState<api.DailyLog | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  // ---------------------------------------------------------------------------
  // NOTIFICAÇÕES
  // ---------------------------------------------------------------------------
  const refreshUnreadCount = useCallback(() => {
    api
      .getUnreadCount()
      .then((res) => setUnreadCount(res.unread))
      .catch(() => null);
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

  // ---------------------------------------------------------------------------
  // CARREGAMENTO PRINCIPAL DO DASHBOARD
  // - Valida login
  // - Busca dados do dashboard
  // - Busca revisão diária
  // - Atualiza notificações
  // - Dá auto-refresh a cada 30 minutos e ao voltar para a aba
  // ---------------------------------------------------------------------------
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

    let delayedNotificationRefresh: number | undefined;

    const analyzeNotificationsAndRefreshLater = () => {
      api
        .analyzeNotifications()
        .then(() => {
          delayedNotificationRefresh = window.setTimeout(
            refreshUnreadCount,
            10000
          );
        })
        .catch(() => null);
    };

    loadDashboard();
    loadDailyLog();
    loadKeyTask();
    refreshUnreadCount();
    analyzeNotificationsAndRefreshLater();

    const interval = window.setInterval(() => {
      loadDashboard();
      loadKeyTask();
    }, 30 * 60 * 1000);

    // Polling periódico para capturar notificações geradas pelo scheduler
    // enquanto o usuário já está com o app aberto
    const notifInterval = window.setInterval(refreshUnreadCount, 2 * 60 * 1000);

    const handleVisibility = () => {
      if (document.hidden) return;

      loadDashboard();
      refreshUnreadCount();
      analyzeNotificationsAndRefreshLater();
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(interval);
      window.clearInterval(notifInterval);
      document.removeEventListener("visibilitychange", handleVisibility);

      if (delayedNotificationRefresh) {
        window.clearTimeout(delayedNotificationRefresh);
      }
    };
  }, [navigate, refreshUnreadCount]);

  // ---------------------------------------------------------------------------
  // ABERTURA AUTOMÁTICA DA REVISÃO DIÁRIA
  // Usado quando outra tela navega para o dashboard pedindo para abrir o DayReview.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (location.state?.openDayReview) {
      setReviewOpen(true);
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location.state, location.pathname]);

  // ---------------------------------------------------------------------------
  // ABERTURA AUTOMÁTICA DAS NOTIFICAÇÕES VIA URL
  // O toast global navega para /dashboard?notifications=open.
  // Este efeito abre o modal e limpa o parâmetro da URL.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (searchParams.get("notifications") !== "open") return;

    setIsNotificationsOpen(true);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("notifications");
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // ---------------------------------------------------------------------------
  // DADOS DERIVADOS
  // Valores calculados a partir da resposta do backend.
  // Mantemos fallbacks para evitar tela quebrada enquanto carrega.
  // ---------------------------------------------------------------------------
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
    <main className="relative min-h-screen overflow-hidden bg-[#11111a] text-white">
      <Background />

      <div className="relative z-10 min-h-screen px-4 pb-6 pt-5">
        {/* Header: logo, sino de notificações e menu lateral */}
        <header className="mb-5 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 text-left active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200 shadow-lg shadow-purple-950/30">
              <img
                src="/axon-logo.svg"
                alt="Axon"
                className="h-8 w-8 object-contain"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Dashboard</p>
              <p className="text-xs text-white/40">Seu dia agora</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/65 backdrop-blur-2xl active:scale-[0.96]"
              aria-label="Abrir notificações"
            >
              <Bell className="h-5 w-5" />

              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-[#11111a] bg-purple-300" />
              )}
            </button>

            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/65 backdrop-blur-2xl active:scale-[0.96]"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Hero principal: mostra o estado atual do dia e o bloco de foco */}
        <section className="mb-4">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#1b1b27]/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.22),transparent_48%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),transparent_42%)]" />

            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                <Sparkles className="h-3.5 w-3.5" />
                Ajustado ao seu ritmo
              </div>

              <h1 className="text-[1.95rem] font-semibold leading-[1.03] tracking-[-0.06em] text-white">
                {greeting}. Vamos focar no que move seu dia.
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/50">
                {mainAction}
              </p>

              <div className="mt-5 rounded-[1.55rem] border border-purple-300/15 bg-black/18 p-3.5 shadow-inner shadow-black/20">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-500/12 text-purple-200">
                      <Focus className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-purple-100/70">
                        Agora
                      </p>
                      <p className="mt-0.5 text-xs text-white/38">
                        Ritmo atual do seu dia
                      </p>
                    </div>
                  </div>

                  {currentBlock && (
                    <p className="shrink-0 text-xs font-medium text-white/38">
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
                  className="mt-3 inline-flex items-center gap-2 rounded-full px-1 text-xs font-semibold text-purple-200/80 active:scale-[0.98]"
                >
                  Ajustar com o Axon
                  <MessageCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Tarefa chave do dia */}
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
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/38">
                    Tarefa chave de hoje
                  </p>
                  <p className={`mt-0.5 truncate text-sm font-semibold ${
                    keyTask.status === "done" ? "text-emerald-100 line-through opacity-60" : "text-white"
                  }`}>
                    {keyTask.title}
                  </p>
                </div>

                <span className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  keyTask.status === "done"
                    ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                    : "border-amber-300/20 bg-amber-400/10 text-amber-100"
                }`}>
                  {keyTask.status === "done" ? "Concluída" : "Pendente"}
                </span>
              </div>
            </button>
          </section>
        )}

        {/* Card de revisão diária: aparece à noite se o usuário ainda não registrou */}
        {showReviewCard && (
          <section className="mb-4">
            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              className="group w-full overflow-hidden rounded-[2rem] border border-purple-300/20 bg-purple-500/10 p-4 text-left shadow-xl shadow-purple-950/20 backdrop-blur-2xl active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200">
                  <Moon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">Como foi o seu dia?</p>
                  <p className="mt-0.5 text-xs text-white/45">
                    Leva menos de 1 minuto · Alimenta seus Insights
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-purple-300/20 bg-purple-500/20 px-3 py-1.5 text-xs font-semibold text-purple-100">
                  Registrar
                </span>
              </div>
            </button>
          </section>
        )}

        {/* Métricas rápidas do dia */}
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

        {/* Lista resumida de tarefas/blocos do dia */}
        <section className="rounded-[2rem] border border-white/10 bg-[#1b1b27]/75 p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Hoje</p>
              <p className="mt-1 text-xs text-white/38">
                Plano enxuto do dia
              </p>
            </div>

            <CalendarDays className="h-5 w-5 text-purple-200" />
          </div>

          {(() => {
            const flatTasks = dayBlocks.flatMap((b) => b.tasks);
            const typeLabel: Record<string, string> = {
              task: "Tarefa", event: "Evento", routine: "Rotina",
            };

            if (flatTasks.length === 0) {
              return (
                <div className="flex flex-col items-center rounded-[1.6rem] border border-dashed border-white/12 bg-black/15 px-5 py-8 text-center">
                  <p className="text-sm font-semibold text-white">
                    Nenhuma tarefa para hoje
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/42">
                    Converse com o Axon para organizar seu dia ou adicione
                    tarefas no Planejamento.
                  </p>
                  <button
                    onClick={() => navigate("/planning")}
                    className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-purple-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-950/30 active:scale-[0.97]"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar tarefa
                  </button>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {flatTasks.slice(0, 5).map((task) => {
                  const isActive = task.status === "progress";
                  const isKey = task.is_key_task;
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 rounded-[1.45rem] border p-3 ${
                        isKey
                          ? "border-amber-300/25 bg-amber-400/[0.07]"
                          : isActive
                          ? "border-purple-300/25 bg-purple-500/10"
                          : "border-white/10 bg-black/20"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-xs font-semibold ${
                          isKey
                            ? "border-amber-300/25 bg-amber-400/15 text-amber-200"
                            : isActive
                            ? "border-purple-300/25 bg-purple-500/20 text-purple-100"
                            : "border-white/10 bg-white/[0.05] text-white/45"
                        }`}
                      >
                        {task.start_time ?? "—"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-semibold ${isKey ? "text-amber-100" : "text-white"}`}>
                          {task.title}
                        </p>
                        <p className="mt-0.5 text-xs text-white/38">
                          {task.objective_title
                            ? <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-purple-300/60" />{task.objective_title}</span>
                            : typeLabel[task.task_type] ?? "Tarefa"
                          }
                        </p>
                      </div>

                      {isKey && <Star className="h-4 w-4 shrink-0 fill-amber-300 text-amber-300" />}
                      {!isKey && isActive && <CheckCircle2 className="h-5 w-5 shrink-0 text-purple-200" />}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          <button
            onClick={() => navigate("/planning")}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-sm font-semibold text-white/62 backdrop-blur-2xl active:scale-[0.98]"
          >
            Ver planejamento
            <CalendarDays className="ml-2 h-4 w-4" />
          </button>
        </section>
      </div>

      {/* Modais e overlays globais da página */}
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
        onUnreadCountChange={setUnreadCount}
      />
    </main>
  );
}

// ===========================================================================
// COMPONENTES DE UI DO DASHBOARD
// ===========================================================================

function MetricCard({ icon: Icon, label, value, helper }: MetricCardProps) {
  return (
    <div className="rounded-[1.55rem] border border-white/10 bg-[#1b1b27]/75 p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-500/10 text-purple-200">
        <Icon className="h-4 w-4" />
      </div>

      <p className="text-xs text-white/38">{label}</p>

      <p className="mt-1 text-xl font-semibold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-white/35">{helper}</p>
    </div>
  );
}

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
      <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-3.5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Target className="h-4 w-4 shrink-0 text-purple-200" />

            <p className="truncate text-sm font-semibold text-white">
              Bloco de foco
            </p>
          </div>

          <p className="shrink-0 text-xs text-white/40">
            {fallbackStart ?? "10:40"}
          </p>
        </div>

        <p className="text-sm leading-5 text-white/55">
          {fallbackLabel ?? "Comece pela tarefa que mais impacta seu dia."}
        </p>

        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between text-[0.68rem] text-white/32">
            <span>Progresso</span>
            <span>{fallbackProgressSafe}%</span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
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
    <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-purple-100">
            {currentBlock.level_label}
          </p>
        </div>

        <div className="shrink-0 rounded-full border border-purple-300/15 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-100/80">
          {progress}%
        </div>
      </div>

      <p className="mt-3 text-sm leading-5 text-white/54">
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
        <div className="mb-2 flex items-center justify-between text-[0.68rem] text-white/32">
          <span>Progresso</span>
          <span>{progress}%</span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
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
            className="flex min-h-10 w-full items-center rounded-2xl border border-white/10 bg-black/14 px-3.5 text-xs font-semibold text-white/48 active:scale-[0.98]"
          >
            <span>
              {showNextBlock ? "Ocultar próximo" : "Próximo bloco"}
            </span>

            <span className="ml-auto mr-2 text-[0.68rem] font-medium text-white/28">
              {nextBlock.start} – {nextBlock.end}
            </span>

            {showNextBlock ? (
              <ChevronUp className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0" />
            )}
          </button>

          {showNextBlock && (
            <div className="mt-2.5 rounded-[1.15rem] border border-white/10 bg-black/16 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="truncate text-xs font-semibold text-white/60">
                  {nextBlock.level_label}
                </p>

                <p className="shrink-0 text-[0.68rem] font-medium text-white/30">
                  {nextBlock.start} – {nextBlock.end}
                </p>
              </div>

              <p className="text-xs leading-5 text-white/42">
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

function BlockTaskRow({ task, compact = false }: { task: BlockTask; compact?: boolean }) {
  const isProgress = task.status === "progress";

  return (
    <div className={`flex items-center gap-2.5 ${compact ? "px-0 py-1" : "px-3 py-2.5"}`}>
      {task.is_key_task ? (
        <Star className="h-3.5 w-3.5 shrink-0 fill-amber-300 text-amber-300" />
      ) : (
        <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          isProgress ? "bg-purple-300" : "bg-white/25"
        }`} />
      )}

      <p className={`min-w-0 flex-1 truncate text-xs font-semibold ${
        task.is_key_task ? "text-amber-100" : "text-white/80"
      }`}>
        {task.title}
      </p>

      {task.start_time && (
        <p className="shrink-0 text-[0.65rem] text-white/30">
          {task.start_time}{task.end_time ? `–${task.end_time}` : ""}
        </p>
      )}
    </div>
  );
}

// ===========================================================================
// HELPERS DE CÁLCULO E FORMATAÇÃO
// ===========================================================================

function getCurrentBlockProgress(block: FocusBlock) {
  const now = new Date();

  const [startHour, startMinute] = block.start.split(":").map(Number);
  const [endHour, endMinute] = block.end.split(":").map(Number);

  const start = new Date(now);
  start.setHours(startHour, startMinute, 0, 0);

  const end = new Date(now);
  end.setHours(endHour, endMinute, 0, 0);

  // Exemplo: 23:30 – 00:00
  // Mesmo não atravessando a madrugada com atividade,
  // o horário final 00:00 pertence ao próximo dia.
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

// ===========================================================================
// BACKGROUND VISUAL DA PÁGINA
// ===========================================================================

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


// ===========================================================================
// NOTIFICAÇÕES
// Modal aberto pelo sino do header e pelo toast global (/dashboard?notifications=open)
// ===========================================================================

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
            ? "border-white/10 bg-white/[0.035] opacity-55"
            : "border-purple-300/24 bg-purple-500/12"
          : isUnread
          ? "border-purple-300/18 bg-purple-500/8"
          : "border-white/10 bg-white/[0.035] opacity-50"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border ${
              isImprovement
                ? "border-purple-300/25 bg-purple-500/16 text-purple-100"
                : isChange
                ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                : "border-white/10 bg-white/[0.055] text-white/50"
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
                    ? "border-purple-300/20 bg-purple-500/12 text-purple-100"
                    : isChange
                    ? "border-emerald-300/15 bg-emerald-400/10 text-emerald-100/75"
                    : "border-white/10 bg-white/[0.045] text-white/38"
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

            <p className="text-sm font-semibold leading-5 text-white">
              {notification.title}
            </p>

            <p className="mt-1 text-xs leading-5 text-white/44">
              {notification.body}
            </p>
          </div>
        </div>

        <span className="shrink-0 text-[0.65rem] font-medium text-white/28">
          {formatNotificationTime(notification.created_at)}
        </span>
      </div>

      {isImprovement && action && !isHandled && (
        <div className="mb-3 rounded-[1.15rem] border border-white/10 bg-black/18 p-3">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/28">
            Ajuste sugerido
          </p>

          {(action.new_date || action.new_start_time || action.new_end_time) && (
            <p className="mt-2 text-xs font-semibold text-white/70">
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
            <p className="mt-1 text-xs leading-5 text-white/38">
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
            className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-xs font-semibold text-white/55 active:scale-[0.98]"
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
          className="mt-3 inline-flex min-h-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] px-3 text-[0.68rem] font-semibold text-white/45 active:scale-[0.98]"
        >
          Marcar como lida
        </button>
      )}

      {isAccepted && (
        <p className="mt-3 text-[0.68rem] font-semibold text-purple-200/70">
          Sugestão aceita
        </p>
      )}

      {isRejected && (
        <p className="mt-3 text-[0.68rem] font-semibold text-white/30">
          Sugestão recusada
        </p>
      )}
    </div>
  );
}

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
  const [notifications, setNotifications] = useState<api.NotificationData[]>([]);
  const [notificationView, setNotificationView] = useState<"unread" | "read">(
    "unread"
  );
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const NOTIFICATIONS_PAGE_SIZE = 10;

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

  useEffect(() => {
    onUnreadCountChange(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  function loadNotifications() {
    setLoading(true);

    api
      .getNotifications(NOTIFICATIONS_PAGE_SIZE + 1, 0)
      .then((data) => {
        const visibleNotifications = data.slice(0, NOTIFICATIONS_PAGE_SIZE);

        setNotifications(visibleNotifications);
        setHasMore(data.length > NOTIFICATIONS_PAGE_SIZE);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!isOpen) return;

    loadNotifications();

    const handleNotificationsUpdated = () => {
      loadNotifications();
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
      // ignore
    }
  }

  async function handleRead(id: string) {
    const currentNotification = notifications.find(
      (notification) => notification.id === id
    );

    if (!currentNotification || currentNotification.status !== "unread") {
      return;
    }

    await api.markNotificationRead(id).catch(() => null);

    setNotifications((prev) => {
      const next = prev.map((notification) =>
        notification.id === id
          ? { ...notification, status: "read" as const }
          : notification
      );

      return next;
    }
      );
    window.dispatchEvent(new Event("axon:notifications-updated"));
  }

  async function handleAccept(id: string) {
    await api.acceptNotification(id).catch(() => null);

    setNotifications((prev) => {
      const next = prev.map((notification) =>
        notification.id === id
          ? { ...notification, status: "accepted" as const }
          : notification
      );

      return next;
    });

    window.dispatchEvent(new Event("axon:notifications-updated"));
    loadNotifications();
    setNotificationView("read");
  }

  async function handleReject(id: string) {
    await api.rejectNotification(id).catch(() => null);

    setNotifications((prev) => {
      const next = prev.map((notification) =>
        notification.id === id
          ? { ...notification, status: "rejected" as const }
          : notification
      );

      return next;
    });

    window.dispatchEvent(new Event("axon:notifications-updated"));
    loadNotifications();
    setNotificationView("read");
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="relative flex max-h-[82vh] w-full max-w-[430px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#171720]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.22),transparent_48%)]" />

        <div className="relative border-b border-white/10 px-5 pb-4 pt-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                <Bell className="h-3.5 w-3.5" />
                Central do Axon
              </div>

              <h2 className="text-[1.65rem] font-semibold leading-[1.05] tracking-[-0.055em] text-white">
                Notificações
              </h2>

              <p className="mt-2 text-xs leading-5 text-white/45">
                Avisos importantes, lembretes inteligentes e sugestões para
                melhorar seu planejamento.
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/45 active:scale-[0.96]"
              aria-label="Fechar notificações"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex rounded-2xl border border-white/10 bg-white/[0.045] p-1">
            <button
              type="button"
              onClick={() => setNotificationView("unread")}
              className={`min-h-10 flex-1 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                notificationView === "unread"
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-950/25"
                  : "text-white/42"
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
                  : "text-white/42"
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

        <div className="relative flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="py-8 text-center text-sm text-white/35">
              Carregando...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="mx-auto mb-3 h-6 w-6 text-purple-200/40" />

              <p className="text-sm font-semibold text-white/55">
                {notificationView === "unread"
                  ? "Nenhuma notificação não lida"
                  : "Nenhuma notificação lida"}
              </p>

              <p className="mt-1 text-xs leading-5 text-white/30">
                {notificationView === "unread"
                  ? "Quando houver novos avisos ou sugestões, eles aparecerão aqui."
                  : "Notificações já lidas, aceitas ou recusadas aparecerão nesta aba."}
              </p>
            </div>
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
                  className="mt-1 inline-flex min-h-10 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] px-4 text-xs font-semibold text-white/50 active:scale-[0.98]"
                >
                  Ver mais
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}