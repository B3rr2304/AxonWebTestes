import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Focus,
  Menu,
  MessageCircle,
  Moon,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import * as api from "../lib/api";
import type { DashboardData } from "../lib/api";

type MetricCardProps = {
  icon: React.ElementType;
  label: string;
  value: string;
  helper: string;
};

type DayBlock = {
  time: string;
  title: string;
  type: string;
  active?: boolean;
};

const fallbackBlocks: DayBlock[] = [
  {
    time: "09:30",
    title: "Organizar prioridades",
    type: "Clareza",
    active: false,
  },
  {
    time: "10:40",
    title: "Foco profundo",
    type: "Prioridade",
    active: true,
  },
  {
    time: "14:00",
    title: "Demandas leves",
    type: "Operação",
    active: false,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api.isLoggedIn()) {
      navigate("/login");
      return;
    }

    api
      .getDashboard()
      .then(setData)
      .catch(() => {
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

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
  const dayBlocks = data?.day_blocks?.length ? data.day_blocks : fallbackBlocks;

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

  const mainTask =
    nextFocus?.label ?? "Comece pela tarefa que mais impacta seu dia.";

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
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#1b1b27]/82 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.24),transparent_48%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_40%)]" />

            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                <Sparkles className="h-3.5 w-3.5" />
                Ajustado ao seu ritmo
              </div>

              <h1 className="text-[2.05rem] font-semibold leading-[1.02] tracking-[-0.06em] text-white">
                {greeting}. Vamos focar no que move seu dia.
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/50">
                {mainAction}
              </p>

              <div className="mt-5 rounded-[1.6rem] border border-purple-300/20 bg-purple-500/10 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <Focus className="h-4 w-4 text-purple-200" />
                      <p className="text-sm font-semibold text-purple-100">
                        Agora
                      </p>
                    </div>

                    <p className="text-xs text-white/42">
                      Próximo movimento recomendado
                    </p>
                  </div>

                  <div className="rounded-2xl border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                    {nextFocus?.status === "active" ? "ativo" : "próximo"}
                  </div>
                </div>

                <div className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-200" />
                      <p className="text-sm font-semibold text-white">
                        Bloco de foco
                      </p>
                    </div>

                    <p className="text-xs text-white/42">
                      {nextFocus?.start ?? "10:40"}
                    </p>
                  </div>

                  <p className="text-sm leading-6 text-white/58">{mainTask}</p>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-300 shadow-[0_0_18px_rgba(192,132,252,0.55)]"
                      style={{
                        width: `${Math.min(
                          Math.max(energyPercent, 10),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => navigate("/chat")}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-purple-200 active:scale-[0.98]"
                >
                  Ajustar com o Axon
                  <MessageCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

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

        <section className="rounded-[2rem] border border-white/10 bg-[#1b1b27]/76 p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Hoje</p>
              <p className="mt-1 text-xs text-white/38">
                Plano enxuto do dia
              </p>
            </div>

            <CalendarDays className="h-5 w-5 text-purple-200" />
          </div>

          <div className="space-y-3">
            {dayBlocks.slice(0, 3).map((block) => (
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
                  <p className="mt-1 text-xs text-white/38">{block.type}</p>
                </div>

                {block.active && (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-purple-200" />
                )}
              </div>
            ))}
          </div>

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
    </main>
  );
}

function MetricCard({ icon: Icon, label, value, helper }: MetricCardProps) {
  return (
    <div className="rounded-[1.55rem] border border-white/10 bg-[#1b1b27]/76 p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
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