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

export default function QuestionnaireIntro() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];
  const Icon = slide.icon;

  function nextSlide() {
    if (isLastSlide) {
      navigate("/questionnaire");
      return;
    }

    setCurrentSlide((prev) => prev + 1);
  }

  function previousSlide() {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#05050b] px-4 py-5 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-16rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-purple-700/25 blur-[120px]" />
        <div className="absolute right-[-14rem] top-[16rem] h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/10 blur-[110px]" />
        <div className="absolute bottom-[-12rem] left-[-10rem] h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:30px_30px] opacity-20" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,5,11,0.08),#05050b_88%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-[430px] flex-col">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200">
              <Brain className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Axon</p>
              <p className="text-xs text-white/40">Configuração inicial</p>
            </div>
          </Link>

          <button
            onClick={() => navigate("/questionnaire")}
            className="rounded-2xl px-4 py-2 text-sm font-medium text-white/45 transition hover:bg-white/10 hover:text-white"
          >
            Pular
          </button>
        </header>

        <section className="flex flex-1 flex-col justify-center py-8">
          <div className="mb-8 flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 bg-purple-300 shadow-[0_0_16px_rgba(216,180,254,0.65)]"
                    : "w-2 bg-white/18"
                }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="relative min-h-[430px] overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/12 via-transparent to-fuchsia-400/8" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28 }}
                className="relative flex min-h-[390px] flex-col"
              >
                <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[1.7rem] border border-purple-300/20 bg-purple-500/15 text-purple-100 shadow-[0_0_60px_rgba(168,85,247,0.25)]">
                  <Icon className="h-9 w-9" />
                </div>

                <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  {slide.eyebrow}
                </div>

                <h1 className="text-[2.15rem] font-semibold leading-[1.02] tracking-[-0.055em] text-white">
                  {slide.title}
                </h1>

                <p className="mt-5 text-sm leading-7 text-white/52">
                  {slide.description}
                </p>

                <div className="mt-auto rounded-3xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs leading-5 text-white/42">
                    Tempo estimado:{" "}
                    <span className="text-white/70">3 a 5 minutos</span>
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        <footer className="space-y-3 pb-2">
          <button
            onClick={nextSlide}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/40 transition hover:bg-purple-400 active:scale-[0.98]"
          >
            {isLastSlide ? "Começar configuração" : "Continuar"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>

          {currentSlide > 0 && (
            <button
              onClick={previousSlide}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] px-6 text-sm font-semibold text-white/60 backdrop-blur-2xl transition hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
            >
              Voltar
            </button>
          )}
        </footer>
      </div>
    </main>
  );
}