import { useRef, useState } from "react";
import {
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Sparkles,
  TrendingUp,
} from "lucide-react";

// ===========================================================================
// SEÇÃO — AXON EVOLUI JUNTO COM VOCÊ
// ===========================================================================
// Seção em fundo roxo, com cards scrolláveis no mobile e grid no desktop.
// Mostra como a experiência melhora conforme o usuário usa o AXON.

const evolutionSteps = [
  {
    icon: Sparkles,
    eyebrow: "Primeiro passo",
    title: "Responda nosso questionário de identificação de cronotipo",
    description:
      "De acordo com suas respostas, o AXON consegue identificar seu cronotipo e adaptar a experiência ao seu ritmo.",
  },
  {
    icon: CalendarDays,
    eyebrow: "Dia 01",
    title: "Você começa organizando sua rotina",
    description:
      "Cadastre tarefas, hábitos, objetivos e compromissos. O AXON começa a conhecer sua forma de trabalhar.",
  },
  {
    icon: CheckCircle2,
    eyebrow: "Em uma semana",
    title: "Sua organização já fica mais natural",
    description:
      "Com tudo centralizado, fica mais fácil visualizar prioridades e manter uma rotina consistente.",
  },
  {
    icon: Clock3,
    eyebrow: "Em duas semanas",
    title: "Os primeiros padrões começam a aparecer",
    description:
      "O AXON identifica horários em que você produz melhor, momentos de foco e hábitos que precisam de consistência.",
  },
  {
    icon: BarChart3,
    eyebrow: "Em um mês",
    title: "Sua rotina começa a ganhar ritmo",
    description:
      "Você passa a entender melhor como distribui energia, tarefas e compromissos ao longo da semana.",
  },
  {
    icon: Brain,
    eyebrow: "Em três meses",
    title: "Você passa a entender melhor como funciona",
    description:
      "Os insights acumulados mostram sua evolução, hábitos consistentes e seus melhores momentos de desempenho.",
  },
  {
    icon: TrendingUp,
    eyebrow: "O futuro",
    title: "Quanto mais você usa, mais inteligente o AXON se torna",
    description:
      "Diferente de aplicativos tradicionais, o AXON evolui junto com você e deixa a experiência cada vez mais personalizada.",
  },
];

export default function LandingAxonEvolution() {
  return (
    <section className="relative overflow-hidden bg-[#2d0850] px-4 py-14 text-white sm:px-6 sm:py-18 lg:px-10 lg:py-24 xl:px-14">
      <EvolutionBackground />

      <div className="relative z-10 mx-auto max-w-[1120px]">
        <header className="mx-auto max-w-[42rem] text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-[0_18px_42px_rgba(0,0,0,0.16)]">
            <Sparkles className="h-4.5 w-4.5" />
          </div>

          <h2 className="landing-section-title-md mx-auto max-w-[42rem] text-[#2d0850] dark:text-white">
            AXON evolui junto com você
          </h2>

          <p className="mx-auto mt-4 max-w-[22rem] text-sm font-medium leading-6 text-white/64 sm:max-w-[34rem] sm:text-base sm:leading-7">
            Quanto mais você usa, mais o AXON entende seu ritmo, seus padrões e
            a melhor forma de ajudar você a se organizar.
          </p>
        </header>

        <MobileEvolutionRail />

        <DesktopEvolutionGrid />
      </div>
    </section>
  );
}

// ===========================================================================
// MOBILE
// ===========================================================================

function MobileEvolutionRail() {
  const railRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  function handleScroll() {
    const rail = railRef.current;
    if (!rail) return;

    const firstCard = rail.querySelector("[data-evolution-card]");
    if (!firstCard) return;

    const cardWidth = firstCard.getBoundingClientRect().width;
    const gap = 16;
    const nextIndex = Math.round(rail.scrollLeft / (cardWidth + gap));
    const safeIndex = Math.max(0, Math.min(evolutionSteps.length - 1, nextIndex));

    setActiveStep(safeIndex);
  }

  function handleSelectStep(index) {
    const rail = railRef.current;
    if (!rail) return;

    const firstCard = rail.querySelector("[data-evolution-card]");
    if (!firstCard) return;

    const cardWidth = firstCard.getBoundingClientRect().width;
    const gap = 16;

    rail.scrollTo({
      left: index * (cardWidth + gap),
      behavior: "smooth",
    });

    setActiveStep(index);
  }

  return (
    <div className="mt-9 lg:hidden">
      <MobileTimeline
        activeStep={activeStep}
        onSelectStep={handleSelectStep}
      />

      <div
        ref={railRef}
        onScroll={handleScroll}
        className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-5 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {evolutionSteps.map((step, index) => (
          <EvolutionCard key={step.title} step={step} index={index} />
        ))}
      </div>
    </div>
  );
}

function MobileTimeline({ activeStep, onSelectStep }) {
  const progress =
    evolutionSteps.length > 1
      ? (activeStep / (evolutionSteps.length - 1)) * 100
      : 0;

  return (
    <div className="mx-auto max-w-[18rem] px-2">
      <div className="relative h-6">
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/20" />

        <div
          className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-white/80 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />

        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between">
          {evolutionSteps.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;

            return (
              <button
                key={step.eyebrow}
                type="button"
                onClick={() => onSelectStep(index)}
                aria-label={`Ir para ${step.eyebrow}`}
                className={`flex items-center justify-center rounded-full transition active:scale-[0.9] ${
                  isActive
                    ? "h-4 w-4 bg-white shadow-[0_0_0_5px_rgba(255,255,255,0.12)]"
                    : isCompleted
                    ? "h-2.5 w-2.5 bg-white/90"
                    : "h-2.5 w-2.5 bg-white/28"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// DESKTOP
// ===========================================================================

function DesktopEvolutionGrid() {
  return (
    <div className="relative mx-auto mt-14 hidden max-w-[860px] grid-cols-2 gap-5 lg:grid">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7b2cbf]/22 blur-[90px]" />

      {evolutionSteps.map((step, index) => (
        <div
          key={step.title}
          className={
            index === evolutionSteps.length - 1
              ? "col-span-2 mx-auto w-full max-w-[420px]"
              : ""
          }
        >
          <EvolutionCard step={step} index={index} desktop />
        </div>
      ))}
    </div>
  );
}

// ===========================================================================
// CARD
// ===========================================================================

function EvolutionCard({ step, index, desktop = false }) {
  const Icon = step.icon;

  return (
    <article
      data-evolution-card
      className={`relative snap-center overflow-hidden rounded-[1.45rem] border border-white/10 bg-white p-5 text-center text-[#2d0850] shadow-[0_24px_54px_rgba(0,0,0,0.20)] ${
        desktop ? "min-h-[15rem]" : "min-h-[15.2rem] min-w-[78%]"
      }`}
    >
      <CornerAccents />

      <div className="relative z-10 mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-[#7b2cbf]/18 bg-[#7b2cbf]/10 text-[#7b2cbf]">
        <Icon className="h-4.5 w-4.5" />
      </div>

      <div className="relative z-10">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.12em] text-[#7b2cbf]">
          {step.eyebrow}
        </p>

        <h3 className="mx-auto mt-2 max-w-[13rem] text-[0.98rem] font-black leading-[1.05] tracking-[-0.03em] text-[#2d0850]">
          {step.title}
        </h3>

        <p className="mx-auto mt-3 max-w-[14.5rem] text-xs font-medium leading-5 text-[#2d0850]/64">
          {step.description}
        </p>
      </div>
    </article>
  );
}

function CornerAccents() {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-px -top-px h-14 w-14 rounded-tr-[1.45rem] border-r-[4px] border-t-[4px] border-[#7b2cbf]"
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-px -left-px h-14 w-14 rounded-bl-[1.45rem] border-b-[4px] border-l-[4px] border-[#7b2cbf]"
      />
    </>
  );
}

// ===========================================================================
// FUNDO
// ===========================================================================

function EvolutionBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[-14rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#7b2cbf]/45 blur-[120px]" />
      <div className="absolute bottom-[-16rem] left-[-10rem] h-[28rem] w-[28rem] rounded-full bg-[#7b2cbf]/30 blur-[120px]" />
      <div className="absolute bottom-[10%] right-[-14rem] h-[30rem] w-[30rem] rounded-full bg-[#7b2cbf]/20 blur-[120px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:22px_22px] opacity-[0.1]" />
    </div>
  );
}