import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Focus,
  MessageCircle,
  Moon,
  Sparkles,
  Target,
  Zap,
  Menu,
} from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import * as api from "../lib/api";
import type { DashboardData } from "../lib/api";

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

    api.getDashboard()
      .then(setData)
      .catch(() => {
        // Fallback: use localStorage chronotype to build minimal data
        const stored = localStorage.getItem("axon_chronotype") ?? "intermediate";
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // Fallback values when API is unavailable
  const chronotypeKey = data?.chronotype_key ?? (localStorage.getItem("axon_chronotype") ?? "intermediate");
  const chronotypeLabel = data?.chronotype_label ?? "Perfil Intermediário";
  const energyPeak = data?.energy_peak ?? "Entre 9h e 15h";
  const focusWindow = data?.focus_window ?? "Meio do dia";
  const greeting = data?.greeting ?? "Olá";
  const recommendation = data?.recommendation ?? "Distribua tarefas importantes ao longo do dia.";
  const energyPercent = data?.energy_percent ?? 70;
  const focusPercent = data?.focus_percent ?? 56;
  const nextFocus = data?.next_focus;
  const dayBlocks = data?.day_blocks ?? [];

  const rhythmLabel =
    chronotypeKey === "night" ? "Noturno" :
    chronotypeKey === "morning" ? "Cedo" :
    chronotypeKey === "evening" ? "Vespertino" :
    "Estável";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05050b] text-white">
      <Background />

      <div className="relative z-10 min-h-screen px-4 pb-6 pt-5">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200 shadow-lg shadow-purple-950/30">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Axon</p>
              <p className="text-xs text-white/40">Dashboard inteligente</p>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-white/60 backdrop-blur-2xl active:scale-[0.96]"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <section className="mb-5">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/14 via-transparent to-fuchsia-400/10" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:26px_26px] opacity-20" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                <Sparkles className="h-3.5 w-3.5" />
                Seu dia foi ajustado ao seu ritmo
              </div>

              <h1 className="text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-white">
                {greeting}. Seu foco principal começa em breve.
              </h1>

              <p className="mt-4 text-sm leading-6 text-white/50">
                Com base no seu perfil, o Axon recomenda proteger sua melhor janela de energia para a tarefa mais importante do dia.
              </p>

              <div className="mt-6 rounded-[1.5rem] border border-purple-300/20 bg-purple-500/10 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-200" />
                  <p className="text-sm font-semibold text-purple-100">{chronotypeLabel}</p>
                </div>
                <p className="text-sm leading-6 text-white/55">{recommendation}</p>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mb-5 grid grid-cols-2 gap-3">
          <MetricCard
            icon={Zap}
            label="Energia"
            value={loading ? "..." : `${energyPercent}%`}
            helper="Nível atual"
          />
          <MetricCard
            icon={Target}
            label="Foco"
            value={loading ? "..." : `${focusPercent}%`}
            helper="Evite alternar"
          />
          <MetricCard
            icon={Clock3}
            label="Próximo foco"
            value={nextFocus?.start ?? focusWindow}
            helper={
              nextFocus?.status === "active" ? "Janela ativa agora" :
              nextFocus?.status === "tomorrow" ? "Amanhã" :
              focusWindow
            }
          />
          <MetricCard
            icon={Moon}
            label="Ritmo"
            value={rhythmLabel}
            helper={energyPeak}
          />
        </section>

        {nextFocus && (
          <section className="mb-5 rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Próximo bloco</p>
                <p className="mt-1 text-xs text-white/38">Recomendado pelo Axon</p>
              </div>
              <div className="rounded-2xl border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                {nextFocus.status === "active" ? "Ativo agora" : nextFocus.label}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-purple-300/20 bg-purple-500/10 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Focus className="h-4 w-4 text-purple-200" />
                  <p className="text-sm font-semibold text-white">Foco profundo</p>
                </div>
                <p className="text-xs text-white/42">{nextFocus.start}</p>
              </div>
              <p className="text-sm leading-6 text-white/55">
                Trabalhar na sua tarefa principal antes de abrir demandas operacionais.
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-300 shadow-[0_0_18px_rgba(192,132,252,0.6)]"
                  style={{ width: `${energyPercent}%` }}
                />
              </div>
            </div>
          </section>
        )}

        {dayBlocks.length > 0 && (
          <section className="mb-5 rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Plano de hoje</p>
                <p className="mt-1 text-xs text-white/38">Organizado por prioridade e energia</p>
              </div>
              <CalendarDays className="h-5 w-5 text-purple-200" />
            </div>

            <div className="space-y-3">
              {dayBlocks.map((block) => (
                <div
                  key={block.title}
                  className={`flex items-center gap-3 rounded-[1.5rem] border p-4 ${
                    block.active ? "border-purple-300/25 bg-purple-500/10" : "border-white/10 bg-black/20"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-xs font-semibold ${
                      block.active
                        ? "border-purple-300/25 bg-purple-500/20 text-purple-100"
                        : "border-white/10 bg-white/[0.045] text-white/45"
                    }`}
                  >
                    {block.time}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{block.title}</p>
                    <p className="mt-1 text-xs text-white/38">{block.type}</p>
                  </div>
                  {block.active && <CheckCircle2 className="h-5 w-5 shrink-0 text-purple-200" />}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-5 rounded-[2rem] border border-purple-300/20 bg-purple-500/10 p-4 shadow-xl shadow-purple-950/20 backdrop-blur-2xl">
          <div className="mb-4 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-purple-200" />
            <p className="text-sm font-semibold text-purple-100">Conversar com o Axon</p>
          </div>
          <p className="text-sm leading-6 text-white/58">
            "Posso reorganizar seu dia se aparecer um imprevisto ou transformar suas ideias em tarefas claras."
          </p>
          <button
            onClick={() => navigate("/chat")}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-purple-500 px-5 text-sm font-semibold text-white shadow-xl shadow-purple-950/35 active:scale-[0.98]"
          >
            Abrir chat
            <MessageCircle className="ml-2 h-4 w-4" />
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

function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-500/10 text-purple-200">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs text-white/38">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-white/35">{helper}</p>
    </div>
  );
}

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[-16rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-purple-700/25 blur-[120px]" />
      <div className="absolute right-[-14rem] top-[14rem] h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/10 blur-[110px]" />
      <div className="absolute bottom-[-12rem] left-[-12rem] h-[26rem] w-[26rem] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:28px_28px] opacity-20" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,5,11,0.05),#05050b_88%)]" />
    </div>
  );
}
