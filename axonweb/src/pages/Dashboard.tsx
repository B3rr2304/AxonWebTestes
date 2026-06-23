import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  Target,
  Zap,
} from "lucide-react";

import DayReview from "../components/DayReview";
import Sidebar from "../components/layout/Sidebar";
import * as api from "../lib/api";
import type { DashboardData, FocusBlock } from "../lib/api";

type MetricCardProps = {
  icon: ElementType;
  label: string;
  value: string;
  helper: string;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNextBlock, setShowNextBlock] = useState(false);
  const [todayLog, setTodayLog] = useState<api.DailyLog | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    if (!api.isLoggedIn()) {
      navigate("/login");
      return;
    }

    const load = () => {
      api
        .getDashboard()
        .then(setData)
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    };

    load();
    api.getDailyLogToday().then(setTodayLog).catch(() => setTodayLog(null));
    api.analyzeNotifications().catch(() => null);

    const interval = window.setInterval(load, 30 * 60 * 1000);

    const handleVisibility = () => {
      if (!document.hidden) {
        load();
        api.analyzeNotifications().catch(() => null);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [navigate]);

  useEffect(() => {
    if (location.state?.openDayReview) {
      setReviewOpen(true);
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location.state, location.pathname]);

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

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/65 backdrop-blur-2xl active:scale-[0.96]"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

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

          {dayBlocks.length === 0 ? (
            <div className="flex flex-col items-center rounded-[1.6rem] border border-dashed border-white/12 bg-black/15 px-5 py-8 text-center">
              <p className="text-sm font-semibold text-white">
                Nenhuma tarefa para hoje
              </p>

              <p className="mt-1 text-xs leading-5 text-white/42">
                Converse com o Axon para organizar seu dia ou adicione tarefas
                no Planejamento.
              </p>

              <button
                onClick={() => navigate("/planning")}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-purple-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-950/30 active:scale-[0.97]"
              >
                <Plus className="h-4 w-4" />
                Adicionar tarefa
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {dayBlocks.slice(0, 5).map((block) => (
                <div
                  key={`${block.time}-${block.title}`}
                  className={`flex items-center gap-3 rounded-[1.45rem] border p-3 ${
                    block.active
                      ? "border-purple-300/25 bg-purple-500/10"
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-xs font-semibold ${
                      block.active
                        ? "border-purple-300/25 bg-purple-500/20 text-purple-100"
                        : "border-white/10 bg-white/[0.05] text-white/45"
                    }`}
                  >
                    {block.time}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {block.title}
                    </p>

                    <p className="mt-1 text-xs text-white/38">
                      {block.type}
                    </p>
                  </div>

                  {block.active && (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-purple-200" />
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => navigate("/planning")}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-sm font-semibold text-white/62 backdrop-blur-2xl active:scale-[0.98]"
          >
            Ver planejamento
            <CalendarDays className="ml-2 h-4 w-4" />
          </button>
        </section>
      </div>

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
    </main>
  );
}

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
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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