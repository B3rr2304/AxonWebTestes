import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Clock3,
  Moon,
  Sparkles,
  Sun,
  Target,
  Zap,
} from "lucide-react";

import {
  results,
  type ChronotypeResultKey,
} from "../data/results";

const validKeys: ChronotypeResultKey[] = [
  "morning",
  "intermediate",
  "evening",
  "night",
];

export default function Result() {
  const navigate = useNavigate();

  const resultKey = useMemo<ChronotypeResultKey>(() => {
    const stored = localStorage.getItem("axon_chronotype");

    if (stored && validKeys.includes(stored as ChronotypeResultKey)) {
      return stored as ChronotypeResultKey;
    }

    return "intermediate";
  }, []);

  const result = results[resultKey];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05050b] text-white">
      <Background />

      <div className="relative z-10 flex min-h-screen flex-col px-4 pb-5 pt-5">
        <header className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200">
            <Brain className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Axon</p>
            <p className="text-xs text-white/40">Resultado inicial</p>
          </div>
        </header>

        <section className="flex flex-1 flex-col py-6">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/35 backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/14 via-transparent to-fuchsia-400/10" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:26px_26px] opacity-20" />

            <div className="relative">
              <div className="mb-6 flex h-[210px] items-center justify-center overflow-hidden rounded-[1.7rem] border border-white/10 bg-black/25">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 34,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute h-44 w-44 rounded-full border border-purple-300/15"
                />

                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 44,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute h-32 w-32 rounded-full border border-fuchsia-300/10"
                />

                <div className="absolute h-24 w-24 rounded-[1.8rem] border border-purple-300/25 bg-purple-500/15 shadow-[0_0_70px_rgba(168,85,247,0.38)] backdrop-blur-2xl" />

                <motion.div
                  animate={{ y: [-4, 4, -4] }}
                  transition={{
                    duration: 3.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-white/10 bg-black/35"
                >
                  {resultKey === "morning" && (
                    <Sun className="h-10 w-10 text-purple-100" />
                  )}

                  {resultKey === "intermediate" && (
                    <BarChart3 className="h-10 w-10 text-purple-100" />
                  )}

                  {resultKey === "evening" && (
                    <Sparkles className="h-10 w-10 text-purple-100" />
                  )}

                  {resultKey === "night" && (
                    <Moon className="h-10 w-10 text-purple-100" />
                  )}
                </motion.div>
              </div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                <Sparkles className="h-3.5 w-3.5" />
                {result.label}
              </div>

              <h1 className="text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-white">
                {result.title}
              </h1>

              <p className="mt-4 text-sm leading-6 text-white/58">
                {result.subtitle}
              </p>

              <p className="mt-4 text-sm leading-7 text-white/45">
                {result.description}
              </p>
            </div>
          </motion.div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoCard
              icon={Zap}
              label="Pico de energia"
              value={result.energyPeak}
            />

            <InfoCard
              icon={Target}
              label="Melhor foco"
              value={result.focusWindow}
            />

            <InfoCard
              icon={Clock3}
              label="Baixa energia"
              value={result.lowEnergy}
            />

            <InfoCard
              icon={Brain}
              label="Perfil"
              value={result.label.replace("Perfil ", "")}
            />
          </div>

          <div className="mt-4 rounded-[1.7rem] border border-purple-300/20 bg-purple-500/10 p-4 shadow-xl shadow-purple-950/20 backdrop-blur-2xl">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-200" />
              <p className="text-sm font-semibold text-purple-100">
                Recomendação inicial do Axon
              </p>
            </div>

            <p className="text-sm leading-6 text-white/58">
              {result.recommendation}
            </p>
          </div>

          <div className="mt-4 rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
            <p className="mb-4 text-sm font-semibold text-white">
              Como começar melhor
            </p>

            <div className="space-y-3">
              {result.routineTips.map((tip, index) => (
                <div key={tip} className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-purple-300/20 bg-purple-500/15 text-xs font-semibold text-purple-100">
                    {index + 1}
                  </div>

                  <p className="text-sm leading-6 text-white/48">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="shrink-0 space-y-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/40 transition active:scale-[0.98]"
          >
            Montar meu Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>

          <button
            onClick={() => navigate("/questionnaire")}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] px-6 text-sm font-semibold text-white/55 backdrop-blur-2xl transition active:scale-[0.98]"
          >
            Refazer questionário
          </button>
        </footer>
      </div>
    </main>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-500/10 text-purple-200">
        <Icon className="h-4 w-4" />
      </div>

      <p className="text-xs leading-5 text-white/38">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-white">
        {value}
      </p>
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