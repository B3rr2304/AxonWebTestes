import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
import AppBackground from "../components/layout/AppBackground";

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
    <main className="relative min-h-screen overflow-hidden bg-app text-primary">
      <AppBackground />

      <div className="relative z-10 flex min-h-screen flex-col px-4 pb-5 pt-5">
        <header className="mb-4 flex shrink-0 items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 text-left active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent-soft bg-accent-soft text-accent shadow-card">
              <img src="/axon-logo.svg" alt="Axon" className="h-8 w-8 object-contain" />
            </div>

            <div>
              <p className="text-sm font-semibold text-primary">Focus</p>
              <p className="text-xs text-muted">Modo silencioso</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-soft bg-surface-muted text-secondary backdrop-blur-2xl transition active:scale-[0.96]"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <section className="flex flex-1 flex-col justify-center">
          <div className="relative overflow-hidden rounded-[2.4rem] border border-soft bg-surface-elevated px-5 pb-6 pt-5 text-primary shadow-soft backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,var(--accent-soft),transparent_52%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.18),transparent_36%)] opacity-60 dark:opacity-30" />

            <div className="relative">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-accent-soft bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
                  <Sparkles className="h-3.5 w-3.5" />
                  Uma coisa por vez
                </div>

                <div
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    isRunning
                      ? "border-accent-soft bg-accent-soft text-accent"
                      : "border-soft bg-surface-muted text-muted"
                  }`}
                >
                  {statusLabel}
                </div>
              </div>

              <div className="mb-6 rounded-[1.6rem] border border-soft bg-surface-muted p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-accent" />
                  <p className="text-sm font-semibold text-primary">
                    Tarefa atual
                  </p>
                </div>

                <p className="text-sm leading-6 text-muted">
                  Trabalhar na proposta comercial
                </p>
              </div>

              <div className="relative mx-auto flex h-[285px] max-w-[330px] items-center justify-center overflow-hidden rounded-[2.2rem] border border-soft bg-surface-muted shadow-inner">
                <div className="absolute h-64 w-64 rounded-full bg-accent-soft blur-[70px]" />

                <BreathingRings isRunning={isRunning} />

                <svg
                  className="absolute h-[235px] w-[235px] -rotate-90"
                  viewBox="0 0 120 120"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke="var(--border-soft)"
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
                  <p className="text-[4.2rem] font-semibold leading-none tracking-[-0.08em] text-primary">
                    {selectedMinutes}:00
                  </p>

                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.22em] text-soft">
                    {isRunning ? "respire e execute" : "preparar bloco"}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {durations.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => setSelectedMinutes(minutes)}
                    className={`min-h-11 rounded-2xl border text-sm font-semibold transition active:scale-[0.98] ${
                      selectedMinutes === minutes
                        ? "border-accent-soft bg-accent-soft text-accent shadow-card"
                        : "border-soft bg-surface-muted text-muted"
                    }`}
                  >
                    {minutes}min
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-[1fr_3.5rem] gap-3">
                <button
                  type="button"
                  onClick={handleStartPause}
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[var(--accent-strong)] px-6 text-sm font-semibold text-white shadow-card transition active:scale-[0.98]"
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
                  type="button"
                  onClick={handleReset}
                  className="flex min-h-14 items-center justify-center rounded-2xl border border-soft bg-surface-muted text-muted backdrop-blur-2xl transition active:scale-[0.98]"
                  aria-label="Resetar foco"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <section className="mt-4 rounded-[1.8rem] border border-accent-soft bg-accent-soft p-4 text-primary shadow-card backdrop-blur-2xl">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <p className="text-sm font-semibold text-accent">
                Sugestão do Axon
              </p>
            </div>

            <p className="text-sm leading-6 text-muted">
              Mantenha este bloco livre de mensagens até o timer terminar.
              Depois, revise o que avançou.
            </p>
          </section>

          <button
            type="button"
            onClick={() => setShowEndModal(true)}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-soft bg-surface-muted px-6 text-sm font-semibold text-secondary backdrop-blur-2xl transition active:scale-[0.98]"
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

      <div className="absolute h-32 w-32 rounded-full border border-soft bg-accent-muted" />
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
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 px-3 pb-3 backdrop-blur-sm">
      <div className="relative w-full max-w-[430px] overflow-hidden rounded-[2rem] border border-soft bg-surface-elevated p-5 text-primary shadow-soft backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--accent-soft),transparent_48%)]" />

        <div className="relative">
          <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-[var(--border-medium)]" />

          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/10 text-purple-100">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-soft bg-surface-muted text-muted transition active:scale-[0.96]"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <h2 className="text-[1.65rem] font-semibold leading-[1.05] tracking-[-0.05em] text-primary">
            Finalizar sessão de foco?
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted">
            O Axon pode registrar este bloco como concluído e liberar você para
            revisar o próximo movimento.
          </p>

          <button
            type="button"
            onClick={onConfirm}
            className="mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[var(--accent-strong)] px-6 text-sm font-semibold text-white shadow-card transition active:scale-[0.98]"
          >
            Sim, finalizar
            <CheckCircle2 className="ml-2 h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-soft bg-surface-muted px-6 text-sm font-semibold text-secondary transition active:scale-[0.98]"
          >
            Continuar focando
          </button>
        </div>
      </div>
    </div>
  );
}
