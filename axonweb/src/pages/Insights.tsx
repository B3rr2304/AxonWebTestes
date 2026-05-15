import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Brain,
  CalendarDays,
  Clock3,
  Focus,
  Menu,
  Moon,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

import { results, type ChronotypeResultKey } from "../data/results";
import Sidebar from "../components/layout/Sidebar";

type MetricCardProps = {
  icon: React.ElementType;
  label: string;
  value: string;
  helper: string;
};

type PatternCardProps = {
  title: string;
  description: string;
  value: string;
  icon: React.ElementType;
};

const validKeys: ChronotypeResultKey[] = [
  "Matutino",
  "Vespertino",
  "Noturno",
  "Misto",
  "Bimodal",
];

const energyData = [
  { label: "06h", value: 32 },
  { label: "09h", value: 68 },
  { label: "12h", value: 76 },
  { label: "15h", value: 58 },
  { label: "18h", value: 64 },
  { label: "21h", value: 47 },
];

const focusData = [
  { day: "S", value: 52 },
  { day: "T", value: 68 },
  { day: "Q", value: 61 },
  { day: "Q", value: 74 },
  { day: "S", value: 66 },
  { day: "S", value: 42 },
  { day: "D", value: 38 },
];

export default function Insights() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const resultKey = useMemo<ChronotypeResultKey>(() => {
    const stored = localStorage.getItem("axon_chronotype");

    if (stored && validKeys.includes(stored as ChronotypeResultKey)) {
      return stored as ChronotypeResultKey;
    }

    return "Misto";
  }, []);

  const result = results[resultKey];

  const bestFocusLabel =
    resultKey === "Matutino"
      ? "manhã"
      : resultKey === "Bimodal"
      ? "manhã e noite"
      : resultKey === "Vespertino"
      ? "tarde"
      : resultKey === "Noturno"
      ? "noite"
      : "variação ao longo do dia";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05050b] text-white">
      <Background />

      <div className="relative z-10 min-h-screen px-4 pb-6 pt-5">
        <header className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 text-left active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200 shadow-lg shadow-purple-950/30">
              <Brain className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Insights</p>
              <p className="text-xs text-white/40">Padrões do seu ritmo</p>
            </div>
          </button>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-white/60 backdrop-blur-2xl active:scale-[0.96]"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <section className="mb-5">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/14 via-transparent to-fuchsia-400/10" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:26px_26px] opacity-20" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                <Sparkles className="h-3.5 w-3.5" />
                Análise personalizada
              </div>

              <h1 className="text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-white">
                Seu melhor desempenho aparece mais na {bestFocusLabel}.
              </h1>

              <p className="mt-4 text-sm leading-6 text-white/50">
                O Axon usa seus dados iniciais para identificar padrões de
                energia, foco e queda de rendimento ao longo do dia.
              </p>

              <div className="mt-6 rounded-[1.5rem] border border-purple-300/20 bg-purple-500/10 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-200" />
                  <p className="text-sm font-semibold text-purple-100">
                    {result.label}
                  </p>
                </div>

                <p className="text-sm leading-6 text-white/55">
                  {result.recommendation}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-5 grid grid-cols-2 gap-3">
          <MetricCard
            icon={Zap}
            label="Energia"
            value={result.energyPeak}
            helper="Pico estimado"
          />

          <MetricCard
            icon={Target}
            label="Foco"
            value={result.focusWindow}
            helper="Melhor janela"
          />

          <MetricCard
            icon={Clock3}
            label="Queda"
            value={result.lowEnergy}
            helper="Baixa energia"
          />

          <MetricCard
            icon={TrendingUp}
            label="Consistência"
            value="68%"
            helper="Últimos dias"
          />
        </section>

        <section className="mb-5 rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Curva de energia
              </p>
              <p className="mt-1 text-xs text-white/38">
                Estimativa ao longo do dia
              </p>
            </div>

            <Activity className="h-5 w-5 text-purple-200" />
          </div>

          <div className="flex h-44 items-end gap-2 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            {energyData.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-28 w-full items-end">
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-purple-500/35 to-fuchsia-300 shadow-[0_0_16px_rgba(168,85,247,0.22)]"
                    style={{ height: `${item.value}%` }}
                  />
                </div>

                <p className="text-[0.65rem] text-white/35">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[1.4rem] border border-purple-300/20 bg-purple-500/10 p-4">
            <p className="text-sm leading-6 text-white/58">
              O Axon recomenda reservar tarefas importantes para{" "}
              <span className="font-semibold text-purple-100">
                {result.energyPeak}
              </span>{" "}
              sempre que possível.
            </p>
          </div>
        </section>

        <section className="mb-5 rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Foco na semana
              </p>
              <p className="mt-1 text-xs text-white/38">
                Tendência de execução
              </p>
            </div>

            <BarChart3 className="h-5 w-5 text-purple-200" />
          </div>

          <div className="space-y-3">
            {focusData.map((item, index) => (
              <div key={`${item.day}-${index}`} className="flex items-center gap-3">
                <p className="w-5 text-xs font-medium text-white/40">
                  {item.day}
                </p>

                <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-300 shadow-[0_0_14px_rgba(192,132,252,0.45)]"
                    style={{ width: `${item.value}%` }}
                  />
                </div>

                <p className="w-8 text-right text-xs text-white/38">
                  {item.value}%
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-white">
              Padrões percebidos
            </p>
            <p className="mt-1 text-xs text-white/38">
              Leituras iniciais do seu comportamento
            </p>
          </div>

          <div className="space-y-3">
            <PatternCard
              icon={Moon}
              title="Ritmo de sono"
              value={result.label}
              description="Seu perfil sugere que a organização do dia deve respeitar suas janelas naturais de disposição."
            />

            <PatternCard
              icon={Focus}
              title="Execução profunda"
              value={result.focusWindow}
              description="Tarefas complexas tendem a funcionar melhor quando encaixadas no seu período de maior foco."
            />

            <PatternCard
              icon={CalendarDays}
              title="Distribuição de tarefas"
              value="Blocos separados"
              description="Agrupar demandas leves evita alternância de contexto e preserva energia para o que importa."
            />
          </div>
        </section>

        <section className="rounded-[2rem] border border-purple-300/20 bg-purple-500/10 p-4 shadow-xl shadow-purple-950/20 backdrop-blur-2xl">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-200" />
            <p className="text-sm font-semibold text-purple-100">
              Recomendação do Axon
            </p>
          </div>

          <p className="text-sm leading-6 text-white/58">
            {result.recommendation}
          </p>

          <button
            onClick={() => navigate("/planning")}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/20 px-5 text-sm font-semibold text-purple-100 active:scale-[0.98]"
          >
            Aplicar no planejamento
            <CalendarDays className="ml-2 h-4 w-4" />
          </button>
        </section>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chronotypeLabel={result.label}
        energyPeak={result.energyPeak}
      />
    </main>
  );
}

function MetricCard({ icon: Icon, label, value, helper }: MetricCardProps) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-500/10 text-purple-200">
        <Icon className="h-4 w-4" />
      </div>

      <p className="text-xs text-white/38">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-white">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-white/35">{helper}</p>
    </div>
  );
}

function PatternCard({
  title,
  description,
  value,
  icon: Icon,
}: PatternCardProps) {
  return (
    <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-500/10 text-purple-200">
            <Icon className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="mt-1 text-xs leading-5 text-white/40">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
        <p className="text-xs font-medium text-purple-100">{value}</p>
      </div>
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