import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  CheckCircle2,
  Clock3,
  Menu,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  X,
} from "lucide-react";

import { results, type ChronotypeResultKey } from "../data/results";
import Sidebar from "../components/layout/Sidebar";

type FocusStatus = "ready" | "running" | "paused";

const validKeys: ChronotypeResultKey[] = [
  "Matutino",
  "Vespertino",
  "Noturno",
  "Misto",
  "Bimodal",
];

const durations = [25, 45, 90];

export default function Focus() {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [status, setStatus] = useState<FocusStatus>("ready");
  const [selectedMinutes, setSelectedMinutes] = useState(45);
  const [showEndModal, setShowEndModal] = useState(false);

  const resultKey = useMemo<ChronotypeResultKey>(() => {
    const stored = localStorage.getItem("axon_chronotype");

    if (stored && validKeys.includes(stored as ChronotypeResultKey)) {
      return stored as ChronotypeResultKey;
    }

    return "Misto";
  }, []);

  const result = results[resultKey];

  const isRunning = status === "running";
  const progress = isRunning ? 34 : status === "paused" ? 34 : 0;

  const statusLabel =
    status === "running"
      ? "em foco"
      : status === "paused"
      ? "pausado"
      : "pronto";

  function handleStartPause() {
    if (status === "running") {
      setStatus("paused");
      return;
    }

    setStatus("running");
  }

  function handleReset() {
    setStatus("ready");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0f1018] text-white">
      <Background isRunning={isRunning} />

      <div className="relative z-10 flex min-h-screen flex-col px-4 pb-5 pt-5">
        <header className="mb-4 flex shrink-0 items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 text-left active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200 shadow-lg shadow-purple-950/30">
              <Brain className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Focus</p>
              <p className="text-xs text-white/40">Modo silencioso</p>
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

        <section className="flex flex-1 flex-col justify-center">
          <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[#171722]/78 px-5 pb-6 pt-5 shadow-2xl shadow-black/35 backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.24),transparent_52%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.07),transparent_36%)]" />

            <div className="relative">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Uma coisa por vez
                </div>

                <div
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    isRunning
                      ? "border-purple-300/25 bg-purple-500/15 text-purple-100"
                      : "border-white/10 bg-white/[0.055] text-white/42"
                  }`}
                >
                  {statusLabel}
                </div>
              </div>

              <div className="mb-6 rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-200" />
                  <p className="text-sm font-semibold text-white">
                    Tarefa atual
                  </p>
                </div>

                <p className="text-sm leading-6 text-white/58">
                  Trabalhar na proposta comercial
                </p>
              </div>

              <div className="relative mx-auto flex h-[285px] max-w-[330px] items-center justify-center overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#101018]/72 shadow-inner shadow-black/40">
                <div className="absolute h-64 w-64 rounded-full bg-purple-500/20 blur-[70px]" />

                <BreathingRings isRunning={isRunning} />

                <svg
                  className="absolute h-[235px] w-[235px] -rotate-90"
                  viewBox="0 0 120 120"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="7"
                    fill="none"
                  />

                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke="url(#focus-progress)"
                    strokeWidth="7"
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
                      <stop stopColor="#f0abfc" />
                      <stop offset="0.55" stopColor="#a855f7" />
                      <stop offset="1" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="relative text-center">
                  <p className="text-[4.2rem] font-semibold leading-none tracking-[-0.08em] text-white">
                    {selectedMinutes}:00
                  </p>

                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.22em] text-white/34">
                    {isRunning ? "respire e execute" : "preparar bloco"}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {durations.map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => setSelectedMinutes(minutes)}
                    className={`min-h-11 rounded-2xl border text-sm font-semibold transition active:scale-[0.98] ${
                      selectedMinutes === minutes
                        ? "border-purple-300/30 bg-purple-500/18 text-purple-100 shadow-lg shadow-purple-950/20"
                        : "border-white/10 bg-white/[0.05] text-white/42"
                    }`}
                  >
                    {minutes}min
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-[1fr_3.5rem] gap-3">
                <button
                  onClick={handleStartPause}
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
                  onClick={handleReset}
                  className="flex min-h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/50 backdrop-blur-2xl active:scale-[0.98]"
                  aria-label="Resetar foco"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <section className="mt-4 rounded-[1.8rem] border border-purple-300/20 bg-purple-500/10 p-4 shadow-xl shadow-purple-950/20 backdrop-blur-2xl">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-200" />
              <p className="text-sm font-semibold text-purple-100">
                Sugestão do Axon
              </p>
            </div>

            <p className="text-sm leading-6 text-white/56">
              Mantenha este bloco livre de mensagens até o timer terminar.
              Depois, revise o que avançou.
            </p>
          </section>

          <button
            onClick={() => setShowEndModal(true)}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-6 text-sm font-semibold text-white/55 backdrop-blur-2xl active:scale-[0.98]"
          >
            Finalizar sessão
            <CheckCircle2 className="ml-2 h-4 w-4" />
          </button>
        </section>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chronotypeLabel={result.label}
        energyPeak={result.energyPeak}
      />

      <EndFocusModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        onConfirm={() => {
          setStatus("ready");
          setShowEndModal(false);
        }}
      />
    </main>
  );
}

function BreathingRings({ isRunning }: { isRunning: boolean }) {
  return (
    <>
      <div
        className={`absolute h-56 w-56 rounded-full border border-purple-300/10 ${
          isRunning ? "animate-[pulse_4s_ease-in-out_infinite]" : ""
        }`}
      />

      <div
        className={`absolute h-44 w-44 rounded-full border border-fuchsia-300/10 ${
          isRunning ? "animate-[pulse_5.5s_ease-in-out_infinite]" : ""
        }`}
      />

      <div className="absolute h-32 w-32 rounded-full border border-white/10 bg-purple-500/5" />
    </>
  );
}

function EndFocusModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm">
      <div className="relative w-full max-w-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#171720]/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.22),transparent_48%)]" />

        <div className="relative">
          <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-white/18" />

          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/10 text-purple-100">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/45 active:scale-[0.96]"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <h2 className="text-[1.65rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
            Finalizar sessão de foco?
          </h2>

          <p className="mt-3 text-sm leading-6 text-white/48">
            O Axon pode registrar este bloco como concluído e liberar você para
            revisar o próximo movimento.
          </p>

          <button
            onClick={onConfirm}
            className="mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/35 active:scale-[0.98]"
          >
            Sim, finalizar
            <CheckCircle2 className="ml-2 h-4 w-4" />
          </button>

          <button
            onClick={onClose}
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-6 text-sm font-semibold text-white/55 active:scale-[0.98]"
          >
            Continuar focando
          </button>
        </div>
      </div>
    </div>
  );
}

function Background({ isRunning }: { isRunning: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#151520_0%,#0f1018_48%,#12121c_100%)]" />

      <div
        className={`absolute left-1/2 top-[14rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-purple-700/20 blur-[120px] transition duration-700 ${
          isRunning ? "scale-110 opacity-100" : "scale-100 opacity-70"
        }`}
      />

      <div className="absolute right-[-12rem] top-[18rem] h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/10 blur-[110px]" />
      <div className="absolute bottom-[-12rem] left-[-12rem] h-[26rem] w-[26rem] rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.08]" />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(15,16,24,0.72)_86%)]" />
    </div>
  );
}