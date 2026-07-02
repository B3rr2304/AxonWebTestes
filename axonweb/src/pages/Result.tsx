import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coffee,
  Moon,
  RefreshCcw,
  Sparkles,
  Sun,
  Target,
  Zap,
} from "lucide-react";

import { results, type ChronotypeResultKey } from "../data/results";
import AppBackground from "../components/layout/AppBackground";

// ===========================================================================
// CHAVES VÁLIDAS DE CRONOTIPO
// ===========================================================================
// Mantém a leitura do resultado limitada às chaves existentes em data/results.ts.
const validKeys: ChronotypeResultKey[] = [
  "Matutino",
  "Vespertino",
  "Noturno",
  "Misto",
  "Bimodal",
];

// ===========================================================================
// PÁGINA DE RESULTADO DO CRONOTIPO
// ===========================================================================

export default function Result() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ---------------------------------------------------------------------------
  // Origem da navegação
  // ---------------------------------------------------------------------------
  // Quando vem do perfil, a página funciona como leitura completa do resultado.
  const fromProfile = searchParams.get("from") === "profile";
  const chronotypeFromUrl = searchParams.get("chronotype");

  // ---------------------------------------------------------------------------
  // Resolução do cronotipo
  // ---------------------------------------------------------------------------
  // Prioriza a URL, depois o localStorage e, por fim, usa "Misto" como fallback.
  const resultKey = useMemo<ChronotypeResultKey>(() => {
    if (
      chronotypeFromUrl &&
      validKeys.includes(chronotypeFromUrl as ChronotypeResultKey)
    ) {
      return chronotypeFromUrl as ChronotypeResultKey;
    }

    const stored = localStorage.getItem("axon_chronotype");

    if (stored && validKeys.includes(stored as ChronotypeResultKey)) {
      return stored as ChronotypeResultKey;
    }

    return "Misto";
  }, [chronotypeFromUrl]);

  // ---------------------------------------------------------------------------
  // Dados derivados do resultado
  // ---------------------------------------------------------------------------
  const result = results[resultKey];
  const ResultIcon = getResultIcon(resultKey);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#11111a] text-white">
      <AppBackground />

      <div className="relative z-10 flex min-h-screen flex-col px-4 pb-5 pt-5">
        {/* Header: identifica o contexto do resultado. */}
        <header className="mb-5 flex shrink-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200 shadow-lg shadow-purple-950/30">
            <Brain className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Axon</p>
            <p className="text-xs text-white/40">
              {fromProfile ? "Resultado completo" : "Resultado inicial"}
            </p>
          </div>
        </header>

        <section className="flex-1 space-y-4">
          {/* Hero do resultado: ícone, rótulo, título e descrição do perfil. */}
          <motion.section
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#1b1b27]/82 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.26),transparent_48%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_40%)]" />

            <div className="relative">
              <div className="mb-6 flex h-[215px] items-center justify-center overflow-hidden rounded-[1.7rem] border border-white/10 bg-black/25">
                <div className="absolute h-44 w-44 rounded-full bg-purple-500/20 blur-[70px]" />

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

                <motion.div
                  animate={{ y: [-4, 4, -4] }}
                  transition={{
                    duration: 3.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative flex h-24 w-24 items-center justify-center rounded-[1.7rem] border border-purple-300/25 bg-purple-500/15 shadow-[0_0_80px_rgba(168,85,247,0.42)] backdrop-blur-2xl"
                >
                  <ResultIcon className="h-11 w-11 text-purple-100" />
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

              <div className="mt-5 flex flex-wrap gap-2">
                {result.profileTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-xs font-medium text-white/55"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Métricas principais do cronotipo calculado. */}
          <section className="grid grid-cols-2 gap-3">
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
              icon={Moon}
              label="Sono ideal"
              value={`${result.idealStart} / ${result.idealEnd}`}
            />
          </section>

          {/* Leitura resumida do Axon sobre o perfil produtivo. */}
          <section className="rounded-[1.8rem] border border-purple-300/20 bg-purple-500/10 p-4 shadow-xl shadow-purple-950/20 backdrop-blur-2xl">
            <div className="mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-200" />
              <p className="text-sm font-semibold text-purple-100">
                Leitura do Axon
              </p>
            </div>

            <p className="text-sm leading-6 text-white/58">{result.summary}</p>
          </section>

          {/* Janelas sugeridas para orientar o planejamento inicial. */}
          <section className="rounded-[1.8rem] border border-white/10 bg-[#1b1b27]/76 p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-purple-200" />
              <p className="text-sm font-semibold text-white">
                Janelas sugeridas
              </p>
            </div>

            <div className="space-y-3">
              {result.focusBlocks.map((block) => (
                <div
                  key={`${block.period}-${block.title}`}
                  className="rounded-[1.45rem] border border-white/10 bg-black/20 p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">
                      {block.title}
                    </p>

                    <span className="shrink-0 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1 text-[0.68rem] font-semibold text-purple-100">
                      {block.period}
                    </span>
                  </div>

                  <p className="text-xs leading-5 text-white/44">
                    {block.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Atividades que tendem a combinar melhor com esse ritmo. */}
          <section className="rounded-[1.8rem] border border-white/10 bg-[#1b1b27]/76 p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-purple-200" />
              <p className="text-sm font-semibold text-white">
                O que funciona melhor para você
              </p>
            </div>

            <div className="space-y-3">
              {result.bestActivities.map((item) => (
                <ListItem key={item} icon={CheckCircle2} text={item} />
              ))}
            </div>
          </section>

          {/* Alertas para evitar atrito entre energia e tipo de tarefa. */}
          <section className="rounded-[1.8rem] border border-white/10 bg-[#1b1b27]/76 p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
            <div className="mb-4 flex items-center gap-2">
              <Coffee className="h-4 w-4 text-purple-200" />
              <p className="text-sm font-semibold text-white">
                Pontos de atenção
              </p>
            </div>

            <div className="space-y-3">
              {result.avoid.map((item) => (
                <ListItem key={item} icon={Coffee} text={item} muted />
              ))}
            </div>
          </section>

          {/* Como o app usará o resultado para personalizar a experiência. */}
          <section className="rounded-[1.8rem] border border-purple-300/20 bg-purple-500/10 p-4 shadow-xl shadow-purple-950/20 backdrop-blur-2xl">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-200" />
              <p className="text-sm font-semibold text-purple-100">
                Como o Axon vai se adaptar
              </p>
            </div>

            <div className="space-y-3">
              {result.axonSetup.map((item, index) => (
                <div key={item} className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-purple-300/20 bg-purple-500/15 text-xs font-semibold text-purple-100">
                    {index + 1}
                  </div>

                  <p className="text-sm leading-6 text-white/56">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Recomendações práticas para os primeiros ajustes de rotina. */}
          <section className="rounded-[1.8rem] border border-white/10 bg-[#1b1b27]/76 p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
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
          </section>
        </section>

        {/* Ações finais mudam conforme a origem: perfil ou onboarding. */}
        <footer className="mt-5 shrink-0 space-y-3">
          {fromProfile ? (
            <>
              <button
                onClick={() => navigate("/profile")}
                className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/40 transition active:scale-[0.98]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o perfil
              </button>

              <button
                onClick={() => navigate("/questionnaire")}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-6 text-sm font-semibold text-white/55 backdrop-blur-2xl transition active:scale-[0.98]"
              >
                Refazer questionário
                <RefreshCcw className="ml-2 h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/dashboard-loading")}
                className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/40 transition active:scale-[0.98]"
              >
                Montar meu Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>

              <button
                onClick={() => navigate("/questionnaire")}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-6 text-sm font-semibold text-white/55 backdrop-blur-2xl transition active:scale-[0.98]"
              >
                Refazer questionário
                <RefreshCcw className="ml-2 h-4 w-4" />
              </button>
            </>
          )}
        </footer>
      </div>
    </main>
  );
}

// ===========================================================================
// HELPERS DO RESULTADO
// ===========================================================================

// Seleciona um ícone visual coerente com o cronotipo exibido.
function getResultIcon(resultKey: ChronotypeResultKey) {
  if (resultKey === "Matutino") return Sun;
  if (resultKey === "Vespertino") return Sparkles;
  if (resultKey === "Noturno") return Moon;
  if (resultKey === "Bimodal") return Zap;
  return BarChart3;
}

// ===========================================================================
// COMPONENTES INTERNOS
// ===========================================================================

// Card compacto usado para energia, foco, baixa energia e sono ideal.
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
    <div className="rounded-[1.5rem] border border-white/10 bg-[#1b1b27]/76 p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
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

// Item reutilizável para listas de atividades e pontos de atenção.
function ListItem({
  icon: Icon,
  text,
  muted = false,
}: {
  icon: React.ElementType;
  text: string;
  muted?: boolean;
}) {
  return (
    <div className="flex gap-3 rounded-[1.35rem] border border-white/10 bg-black/20 p-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border ${
          muted
            ? "border-white/10 bg-white/[0.04] text-white/38"
            : "border-purple-300/20 bg-purple-500/10 text-purple-200"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="text-sm leading-6 text-white/50">{text}</p>
    </div>
  );
}
