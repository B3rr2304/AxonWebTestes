import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Brain,
  Clock3,
  Moon,
  Sparkles,
  Zap,
} from "lucide-react";

// Etapas exibidas durante a análise antes de liberar o resultado do cronotipo.
const steps = [
  {
    icon: Clock3,
    title: "Lendo seus horários",
    text: "Analisando seus padrões de sono e despertar.",
  },
  {
    icon: Zap,
    title: "Mapeando energia",
    text: "Identificando seus melhores momentos de disposição.",
  },
  {
    icon: Brain,
    title: "Entendendo seu foco",
    text: "Cruzando suas respostas sobre clareza e produtividade.",
  },
  {
    icon: Moon,
    title: "Comparando ritmos",
    text: "Relacionando suas respostas com perfis cronobiológicos.",
  },
  {
    icon: Sparkles,
    title: "Preparando resultado",
    text: "Montando sua configuração inicial no Axon.",
  },
];

export default function Analyzing() {
  // Navegação e estado da etapa ativa da animação.
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  // Dados derivados usados para trocar ícone, texto e progresso visual.
  const currentStep = steps[activeStep];
  const CurrentIcon = currentStep.icon;
  const progress = ((activeStep + 1) / steps.length) * 100;

  useEffect(() => {
    // Avança as mensagens da análise enquanto mantém a última etapa fixa até o redirect.
    const stepTimer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev === steps.length - 1) return prev;
        return prev + 1;
      });
    }, 950);

    // Fluxo automático após o questionário: análise visual -> tela de resultado.
    const redirectTimer = setTimeout(() => {
      navigate("/result");
    }, 5600);

    return () => {
      clearInterval(stepTimer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05050b] text-white">
      <Background />

      <div className="relative z-10 flex min-h-screen flex-col px-4 pb-5 pt-5">
        {/* Header compacto mantém a identidade do Axon durante a transição. */}
        <header className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200">
            <Brain className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Axon</p>
            <p className="text-xs text-white/40">Análise do seu ritmo</p>
          </div>
        </header>

        <section className="flex flex-1 flex-col justify-center py-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/35 backdrop-blur-2xl">
            {/* Camadas internas dão profundidade glassmorphism ao card principal. */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/14 via-transparent to-fuchsia-400/10" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:26px_26px] opacity-20" />

            <div className="relative">
              {/* Ilustração neural central: órbitas, linhas e pulso visual do Axon. */}
              <div className="mb-6 flex h-[230px] items-center justify-center overflow-hidden rounded-[1.7rem] border border-white/10 bg-black/25">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 28,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute h-44 w-44 rounded-full border border-purple-300/15"
                />

                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 38,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute h-32 w-32 rounded-full border border-fuchsia-300/10"
                />

                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 52,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute h-24 w-24 rounded-full border border-white/10"
                />

                <svg
                  className="absolute h-[230px] w-[230px] opacity-45"
                  viewBox="0 0 230 230"
                  fill="none"
                >
                  <motion.path
                    d="M38 78C74 34 112 58 115 115C118 172 174 182 198 136"
                    stroke="url(#line-one)"
                    strokeWidth="1.2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      duration: 2.3,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    }}
                  />

                  <motion.path
                    d="M34 154C74 126 96 166 115 115C134 64 170 72 200 96"
                    stroke="url(#line-two)"
                    strokeWidth="1.2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                      delay: 0.25,
                    }}
                  />

                  <motion.circle
                    cx="38"
                    cy="78"
                    r="3.5"
                    fill="#c084fc"
                    animate={{ opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />

                  <motion.circle
                    cx="198"
                    cy="136"
                    r="3.5"
                    fill="#e879f9"
                    animate={{ opacity: [1, 0.35, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />

                  <motion.circle
                    cx="34"
                    cy="154"
                    r="3.5"
                    fill="#a855f7"
                    animate={{ opacity: [0.45, 1, 0.45] }}
                    transition={{ duration: 2.1, repeat: Infinity }}
                  />

                  <motion.circle
                    cx="200"
                    cy="96"
                    r="3.5"
                    fill="#c084fc"
                    animate={{ opacity: [1, 0.45, 1] }}
                    transition={{ duration: 2.1, repeat: Infinity }}
                  />

                  <defs>
                    <linearGradient
                      id="line-one"
                      x1="38"
                      y1="78"
                      x2="198"
                      y2="136"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#7c3aed" stopOpacity="0" />
                      <stop offset="0.5" stopColor="#c084fc" />
                      <stop offset="1" stopColor="#ec4899" stopOpacity="0" />
                    </linearGradient>

                    <linearGradient
                      id="line-two"
                      x1="34"
                      y1="154"
                      x2="200"
                      y2="96"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#7c3aed" stopOpacity="0" />
                      <stop offset="0.5" stopColor="#e879f9" />
                      <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>

                <motion.div
                  animate={{
                    scale: [1, 1.08, 1],
                    opacity: [0.88, 1, 0.88],
                  }}
                  transition={{
                    duration: 3.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute h-24 w-24 rounded-[1.8rem] border border-purple-300/25 bg-purple-500/15 shadow-[0_0_70px_rgba(168,85,247,0.38)] backdrop-blur-2xl"
                />

                <motion.div
                  animate={{ y: [-4, 4, -4] }}
                  transition={{
                    duration: 3.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-white/10 bg-black/35"
                >
                  <Brain className="h-10 w-10 text-purple-100" />
                </motion.div>
              </div>

              {/* Texto principal explica a espera sem expor detalhes técnicos do cálculo. */}
              <div className="text-center">
                <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                  <Activity className="h-3.5 w-3.5" />
                  Processando respostas
                </div>

                <h1 className="mx-auto max-w-[19rem] text-[1.9rem] font-semibold leading-[1.04] tracking-[-0.055em] text-white">
                  Estamos montando seu perfil inicial.
                </h1>

                <p className="mx-auto mt-3 max-w-[18.5rem] text-sm leading-6 text-white/50">
                  O Axon está analisando seu ritmo para criar uma experiência
                  mais alinhada com você.
                </p>
              </div>

              {/* Card dinâmico mostra qual parte da análise está em destaque. */}
              <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-black/25 p-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-500/10 text-purple-200">
                      <CurrentIcon className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        {currentStep.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-white/42">
                        {currentStep.text}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progresso calculado pela etapa ativa; não depende de resposta do backend. */}
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs text-white/35">Análise em andamento</p>
                  <p className="text-xs text-purple-100">
                    {Math.round(progress)}%
                  </p>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-300 shadow-[0_0_18px_rgba(192,132,252,0.6)]"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Atalho manual evita prender o usuário caso ele queira pular a animação. */}
        <footer className="shrink-0">
          <button
            onClick={() => navigate("/result")}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] px-6 text-sm font-semibold text-white/55 backdrop-blur-2xl transition active:scale-[0.98]"
          >
            Ver resultado agora
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </footer>
      </div>
    </main>
  );
}

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Gradientes amplos criam o brilho de fundo sem interferir nos cliques. */}
      <div className="absolute left-1/2 top-[-16rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-purple-700/25 blur-[120px]" />
      <div className="absolute right-[-14rem] top-[14rem] h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/10 blur-[110px]" />
      <div className="absolute bottom-[-12rem] left-[-12rem] h-[26rem] w-[26rem] rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:28px_28px] opacity-20" />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,5,11,0.05),#05050b_88%)]" />
    </div>
  );
}
