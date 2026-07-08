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
    <main className="relative min-h-screen overflow-hidden bg-app text-primary">
      <AppBackground />

      <div className="relative z-10 flex min-h-screen flex-col px-4 pb-5 pt-5">
        {/* Header: identifica o contexto do resultado. */}
        <header className="mb-5 flex shrink-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent-soft bg-accent-soft text-accent shadow-card">
            <Brain className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-primary">Axon</p>
            <p className="text-xs text-muted">
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
            className="relative overflow-hidden rounded-[2rem] border border-soft bg-surface-elevated p-5 text-primary shadow-soft backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--accent-soft),transparent_48%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_40%)] opacity-60 dark:opacity-30" />

            <div className="relative">
              <div className="mb-6 flex h-[215px] items-center justify-center overflow-hidden rounded-[1.7rem] border border-soft bg-surface-muted">
                <div className="absolute h-44 w-44 rounded-full bg-accent-soft blur-[70px]" />

                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 34,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute h-44 w-44 rounded-full border border-accent-soft"
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
                  className="relative flex h-24 w-24 items-center justify-center rounded-[1.7rem] border border-accent-soft bg-accent-soft shadow-card backdrop-blur-2xl"
                >
                  <ResultIcon className="h-11 w-11 text-accent" />
                </motion.div>
              </div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-soft bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                {result.label}
              </div>

              <h1 className="text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-primary">
                {result.title}
              </h1>

              <p className="mt-4 text-sm leading-6 text-muted">
                {result.subtitle}
              </p>

              <p className="mt-4 text-sm leading-7 text-muted">
                {result.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {result.profileTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-soft bg-surface-muted px-3 py-1.5 text-xs font-medium text-secondary"
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
          <section className="rounded-[1.8rem] border border-accent-soft bg-accent-soft p-4 text-primary shadow-card backdrop-blur-2xl">
            <div className="mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-accent" />
              <p className="text-sm font-semibold text-accent">
                Leitura do Axon
              </p>
            </div>

            <p className="text-sm leading-6 text-muted">{result.summary}</p>
          </section>

          {/* Janelas sugeridas para orientar o planejamento inicial. */}
          <section className="rounded-[1.8rem] border border-soft bg-surface-elevated p-4 text-primary shadow-card backdrop-blur-2xl">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-accent" />
              <p className="text-sm font-semibold text-primary">
                Janelas sugeridas
              </p>
            </div>

            <div className="space-y-3">
              {result.focusBlocks.map((block) => (
                <div
                  key={`${block.period}-${block.title}`}
                  className="rounded-[1.45rem] border border-soft bg-surface-muted p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-primary">
                      {block.title}
                    </p>

                    <span className="shrink-0 rounded-full border border-accent-soft bg-surface-elevated px-3 py-1 text-[0.68rem] font-semibold text-accent">
                      {block.period}
                    </span>
                  </div>

                  <p className="text-xs leading-5 text-muted">
                    {block.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Atividades que tendem a combinar melhor com esse ritmo. */}
          <section className="rounded-[1.8rem] border border-soft bg-surface-elevated p-4 text-primary shadow-card backdrop-blur-2xl">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <p className="text-sm font-semibold text-primary">
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
          <section className="rounded-[1.8rem] border border-soft bg-surface-elevated p-4 text-primary shadow-card backdrop-blur-2xl">
            <div className="mb-4 flex items-center gap-2">
              <Coffee className="h-4 w-4 text-accent" />
              <p className="text-sm font-semibold text-primary">
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
          <section className="rounded-[1.8rem] border border-accent-soft bg-accent-soft p-4 text-primary shadow-card backdrop-blur-2xl">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <p className="text-sm font-semibold text-accent">
                Como o Axon vai se adaptar
              </p>
            </div>

            <div className="space-y-3">
              {result.axonSetup.map((item, index) => (
                <div key={item} className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-soft bg-surface-elevated text-xs font-semibold text-accent">
                    {index + 1}
                  </div>

                  <p className="text-sm leading-6 text-muted">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Recomendações práticas para os primeiros ajustes de rotina. */}
          <section className="rounded-[1.8rem] border border-soft bg-surface-elevated p-4 text-primary shadow-card backdrop-blur-2xl">
            <p className="mb-4 text-sm font-semibold text-white">
              Como começar melhor
            </p>

            <div className="space-y-3">
              {result.routineTips.map((tip, index) => (
                <div key={tip} className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-soft bg-surface-elevated text-xs font-semibold text-accent">
                    {index + 1}
                  </div>

                  <p className="text-sm leading-6 text-muted">{tip}</p>
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
                type="button"
                onClick={() => navigate("/profile")}
                className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[var(--accent-strong)] px-6 text-sm font-semibold text-white shadow-card transition active:scale-[0.98]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o perfil
              </button>

              <button
                type="button"
                onClick={() => navigate("/questionnaire")}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-soft bg-surface-muted px-6 text-sm font-semibold text-secondary backdrop-blur-2xl transition active:scale-[0.98]"
              >
                Refazer questionário
                <RefreshCcw className="ml-2 h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate("/dashboard-loading")}
                className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[var(--accent-strong)] px-6 text-sm font-semibold text-white shadow-card transition active:scale-[0.98]"
              >
                Montar meu Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/questionnaire")}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-soft bg-surface-muted px-6 text-sm font-semibold text-secondary backdrop-blur-2xl transition active:scale-[0.98]"
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
    <div className="rounded-[1.5rem] border border-soft bg-surface-elevated p-4 text-primary shadow-card backdrop-blur-2xl">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl border border-accent-soft bg-accent-soft text-accent">
        <Icon className="h-4 w-4" />
      </div>

      <p className="text-xs leading-5 text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-primary">
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
    <div className="flex gap-3 rounded-[1.35rem] border border-soft bg-surface-muted p-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border ${
          muted
            ? "border-soft bg-surface-elevated text-muted"
            : "border-accent-soft bg-surface-elevated text-accent"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="text-sm leading-6 text-muted">{text}</p>
    </div>
  );
}
