import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  CheckCircle2,
  Clock3,
  Focus as FocusIcon,
  Menu,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import { results, type ChronotypeResultKey } from "../data/results";
import Sidebar from "../components/layout/Sidebar";

const validKeys: ChronotypeResultKey[] = [
  "morning",
  "intermediate",
  "evening",
  "night",
];

export default function Focus() {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState(45);

  const resultKey = useMemo<ChronotypeResultKey>(() => {
    const stored = localStorage.getItem("axon_chronotype");

    if (stored && validKeys.includes(stored as ChronotypeResultKey)) {
      return stored as ChronotypeResultKey;
    }

    return "intermediate";
  }, []);

  const result = results[resultKey];

  const progress = isRunning ? 38 : 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05050b] text-white">
      <Background />

      <div className="relative z-10 flex min-h-screen flex-col px-4 pb-6 pt-5">
        <header className="mb-6 flex shrink-0 items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 text-left active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200 shadow-lg shadow-purple-950/30">
              <Brain className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Focus</p>
              <p className="text-xs text-white/40">Execução profunda</p>
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

        <section className="flex flex-1 flex-col justify-center">
          <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/14 via-transparent to-fuchsia-400/10" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:26px_26px] opacity-20" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                <FocusIcon className="h-3.5 w-3.5" />
                Modo sem distrações
              </div>

              <h1 className="text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-white">
                Uma tarefa. Um bloco. Sem alternar contexto.
              </h1>

              <p className="mt-4 text-sm leading-6 text-white/48">
                O Axon recomenda manter este bloco focado na sua prioridade
                principal, sem abrir novas demandas até o timer terminar.
              </p>

              <div className="mt-6 rounded-[1.7rem] border border-purple-300/20 bg-purple-500/10 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-200" />
                    <p className="text-sm font-semibold text-purple-100">
                      Tarefa principal
                    </p>
                  </div>

                  <span className="rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1 text-[0.68rem] font-medium text-purple-100">
                    Alta prioridade
                  </span>
                </div>

                <p className="text-sm font-semibold leading-6 text-white">
                  Trabalhar na proposta comercial
                </p>

                <p className="mt-2 text-xs leading-5 text-white/42">
                  Objetivo: avançar na estrutura principal sem interrupções.
                </p>
              </div>
            </div>
          </div>

          <div className="my-5 rounded-[2.2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/25 backdrop-blur-2xl">
            <div className="relative mx-auto mb-6 flex h-[250px] max-w-[320px] items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-black/25">
              <div className="absolute h-48 w-48 rounded-full border border-white/10" />
              <div className="absolute h-36 w-36 rounded-full border border-purple-300/15" />

              <svg
                className="absolute h-[210px] w-[210px] -rotate-90"
                viewBox="0 0 120 120"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="8"
                  fill="none"
                />

                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  stroke="url(#focus-progress)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray="326.7"
                  strokeDashoffset={326.7 - (326.7 * progress) / 100}
                />

                <defs>
                  <linearGradient
                    id="focus-progress"
                    x1="20"
                    y1="20"
                    x2="100"
                    y2="100"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#c084fc" />
                    <stop offset="1" stopColor="#f0abfc" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="relative text-center">
                <p className="text-[3.6rem] font-semibold tracking-[-0.07em] text-white">
                  {selectedMinutes}:00
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.22em] text-white/35">
                  {isRunning ? "em foco" : "pronto"}
                </p>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-2">
              {[25, 45, 90].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => setSelectedMinutes(minutes)}
                  className={`min-h-11 rounded-2xl border text-sm font-semibold transition active:scale-[0.98] ${
                    selectedMinutes === minutes
                      ? "border-purple-300/30 bg-purple-500/15 text-purple-100"
                      : "border-white/10 bg-white/[0.045] text-white/45"
                  }`}
                >
                  {minutes}min
                </button>
              ))}
            </div>

            <div className="grid grid-cols-[1fr_3.5rem] gap-3">
              <button
                onClick={() => setIsRunning((prev) => !prev)}
                className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/40 transition active:scale-[0.98]"
              >
                {isRunning ? (
                  <>
                    Pausar
                    <Pause className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Iniciar foco
                    <Play className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>

              <button
                onClick={() => setIsRunning(false)}
                className="flex min-h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-white/50 backdrop-blur-2xl active:scale-[0.98]"
                aria-label="Resetar foco"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-purple-300/20 bg-purple-500/10 p-4 shadow-xl shadow-purple-950/20 backdrop-blur-2xl">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-200" />
              <p className="text-sm font-semibold text-purple-100">
                Sugestão do Axon
              </p>
            </div>

            <p className="text-sm leading-6 text-white/58">
              Como seu perfil é {result.label.toLowerCase()}, tente usar sua
              janela de maior energia, {result.energyPeak}, para tarefas que
              exigem raciocínio e evite alternar entre mensagens e execução.
            </p>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3">
          <FocusMetric
            icon={Zap}
            label="Energia"
            value="Boa"
            helper={result.energyPeak}
          />

          <FocusMetric
            icon={Clock3}
            label="Bloco"
            value={`${selectedMinutes}min`}
            helper="Duração atual"
          />

          <FocusMetric
            icon={CheckCircle2}
            label="Status"
            value={isRunning ? "Ativo" : "Pausado"}
            helper="Sessão atual"
          />

          <FocusMetric
            icon={Target}
            label="Meta"
            value="1 tarefa"
            helper="Sem alternar"
          />
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

function FocusMetric({
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
      <p className="mt-1 text-lg font-semibold leading-5 text-white">
        {value}
      </p>
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