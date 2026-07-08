import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Clock3,
  Sparkles,
  ShieldCheck,
  Target,
} from "lucide-react";

import OnboardingBackground from "../components/layout/OnboardingBackground";

// ===========================================================================
// CONTEÚDO DOS SLIDES
// ===========================================================================
// Introdução curta antes do questionário cronobiológico inicial.
const slides = [
  {
    icon: Brain,
    eyebrow: "Bem-vindo ao Axon",
    title: "Antes de montar seu painel, precisamos entender você.",
    description:
      "O Axon não organiza sua rotina de forma genérica. Ele usa seu ritmo, seus horários e suas preferências para criar uma experiência mais personalizada.",
  },
  {
    icon: Clock3,
    eyebrow: "Seu ritmo importa",
    title: "Cada pessoa tem horários diferentes de energia e foco.",
    description:
      "Algumas pessoas rendem melhor pela manhã. Outras funcionam melhor à tarde ou à noite. O questionário ajuda o Axon a identificar esses padrões.",
  },
  {
    icon: Target,
    eyebrow: "Personalização real",
    title: "Suas respostas ajudam o Axon a organizar melhor seu dia.",
    description:
      "Com base nas suas respostas, o Axon poderá sugerir blocos de foco, pausas, horários melhores para tarefas importantes e uma rotina mais alinhada com você.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Responda com sinceridade",
    title: "Não existem respostas certas ou erradas.",
    description:
      "Quanto mais reais forem suas respostas, melhor será sua configuração inicial. Leva poucos minutos e você poderá ajustar suas preferências depois.",
  },
];

// ===========================================================================
// PÁGINA DE INTRODUÇÃO DO QUESTIONÁRIO
// ===========================================================================

export default function QuestionnaireIntro() {
  const navigate = useNavigate();

  // Slide atual exibido no carrossel de onboarding.
  const [currentSlide, setCurrentSlide] = useState(0);

  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];

  // Avança entre os slides e inicia o questionário no último passo.
  function nextSlide() {
    if (isLastSlide) {
      navigate("/questionnaire");
      return;
    }

    setCurrentSlide((prev) => prev + 1);
  }

  // Volta um slide, sem permitir índice negativo.
  function previousSlide() {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-app px-4 py-5 text-primary">
      <OnboardingBackground />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-[430px] flex-col">
        <Header onSkip={() => navigate("/questionnaire")} />

        <section className="flex flex-1 flex-col justify-center py-8">
          <SlideDots
            total={slides.length}
            currentSlide={currentSlide}
            onSelect={setCurrentSlide}
          />

          <SlideCard slide={slide} currentSlide={currentSlide} />
        </section>

        <FooterActions
          currentSlide={currentSlide}
          isLastSlide={isLastSlide}
          onNext={nextSlide}
          onBack={previousSlide}
        />
      </div>
    </main>
  );
}

// ===========================================================================
// COMPONENTES DA INTRODUÇÃO
// ===========================================================================

function Header({ onSkip }) {
  return (
    <header className="flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent-soft bg-accent-soft text-accent">
          <Brain className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-semibold text-primary">Axon</p>
          <p className="text-xs text-muted">Configuração inicial</p>
        </div>
      </Link>

      <button
        type="button"
        onClick={onSkip}
        className="rounded-2xl px-4 py-2 text-sm font-medium text-muted transition hover:bg-surface-muted hover:text-primary"
      >
        Pular
      </button>
    </header>
  );
}

function SlideDots({
  total,
  currentSlide,
  onSelect,
}) {
  return (
    <div className="mb-8 flex justify-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(index)}
          className={`h-2 rounded-full transition-all duration-300 ${
            index === currentSlide
              ? "w-8 bg-[var(--accent)] shadow-[0_0_16px_var(--accent-soft)]"
              : "w-2 bg-[var(--border-medium)]"
          }`}
          aria-label={`Ir para slide ${index + 1}`}
        />
      ))}
    </div>
  );
}

function SlideCard({
  slide,
  currentSlide,
}) {
  const Icon = slide.icon;

  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-[2.2rem] border border-soft bg-surface-elevated p-5 text-primary shadow-soft backdrop-blur-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--accent-soft),transparent_52%)]" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28 }}
          className="relative flex min-h-[390px] flex-col"
        >
          {/* Ícone grande do slide atual. */}
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[1.7rem] border border-accent-soft bg-accent-soft text-accent shadow-card">
            <Icon className="h-9 w-9" />
          </div>

          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-accent-soft bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            {slide.eyebrow}
          </div>

          <h1 className="text-[2.15rem] font-semibold leading-[1.02] tracking-[-0.055em] text-primary">
            {slide.title}
          </h1>

          <p className="mt-5 text-sm leading-7 text-muted">
            {slide.description}
          </p>

          {/* Reforço de tempo para reduzir atrito antes do questionário. */}
          <div className="mt-auto rounded-3xl border border-soft bg-surface-muted p-4">
            <p className="text-xs leading-5 text-muted">
              Tempo estimado:{" "}
              <span className="text-secondary">3 a 5 minutos</span>
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FooterActions({
  currentSlide,
  isLastSlide,
  onNext,
  onBack,
}) {
  return (
    <footer className="space-y-3 pb-2">
      <button
        type="button"
        onClick={onNext}
        className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[var(--accent-strong)] px-6 text-sm font-semibold text-white shadow-card transition hover:brightness-105 active:scale-[0.98]"
      >
        {isLastSlide ? "Começar configuração" : "Continuar"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </button>

      {currentSlide > 0 && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-soft bg-surface-muted px-6 text-sm font-semibold text-secondary backdrop-blur-2xl transition hover:text-primary active:scale-[0.98]"
        >
          Voltar
        </button>
      )}
    </footer>
  );
}
