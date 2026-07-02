import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import favicon from "../assets/favicon.svg";

// Mensagens exibidas durante a preparação inicial do Dashboard.
const loadingTexts = [
  "Lendo seu perfil produtivo...",
  "Organizando suas prioridades...",
  "Preparando seu Dashboard...",
];

export default function DashboardLoading() {
  const navigate = useNavigate();

  // Controla qual mensagem curta aparece durante a transição.
  const [textIndex, setTextIndex] = useState(0);

  // Alterna os textos de carregamento e redireciona após a animação inicial.
  useEffect(() => {
    const textInterval = window.setInterval(() => {
      setTextIndex((current) => (current + 1) % loadingTexts.length);
    }, 950);

    const redirectTimeout = window.setTimeout(() => {
      navigate("/dashboard");
    }, 3200);

    return () => {
      window.clearInterval(textInterval);
      window.clearTimeout(redirectTimeout);
    };
  }, [navigate]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0f1018] px-4 text-white">
      <Background />

      <section className="relative z-10 flex w-full max-w-[360px] flex-col items-center text-center">
        {/* Marca central: reforça a transição entre resultado e Dashboard. */}
        <div className="relative flex h-52 w-52 items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.12, 1],
              opacity: [0.45, 0.85, 0.45],
            }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute h-52 w-52 rounded-full border border-purple-300/10"
          />

          <motion.div
            animate={{
              scale: [1, 1.22, 1],
              opacity: [0.25, 0.55, 0.25],
            }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2,
            }}
            className="absolute h-40 w-40 rounded-full border border-fuchsia-300/10"
          />

          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute h-44 w-44 rounded-full border border-transparent border-t-purple-300/40"
          />

          <motion.div
            animate={{
              y: [-5, 5, -5],
              scale: [1, 1.04, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-purple-300/25 bg-purple-500/10 shadow-[0_0_90px_rgba(168,85,247,0.42)] backdrop-blur-2xl"
          >
            <img
              src={favicon}
              alt="Axon"
              className="h-16 w-16 object-contain"
            />
          </motion.div>
        </div>

        {/* Texto dinâmico: comunica o que o app está preparando. */}
        <motion.div
          key={textIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="mt-6"
        >
          <p className="text-sm font-semibold text-purple-100">
            {loadingTexts[textIndex]}
          </p>

          <p className="mt-3 text-xs leading-5 text-white/42">
            O Axon está montando uma visão inicial baseada no seu ritmo,
            energia e prioridades.
          </p>
        </motion.div>

        {/* Progresso visual sincronizado com o redirecionamento. */}
        <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.1, ease: "easeInOut" }}
            className="h-full rounded-full bg-gradient-to-r from-purple-400 via-fuchsia-300 to-purple-500 shadow-[0_0_18px_rgba(192,132,252,0.7)]"
          />
        </div>
      </section>
    </main>
  );
}

// Background premium usado apenas para profundidade visual da tela de loading.
function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#151520_0%,#0f1018_48%,#12121c_100%)]" />

      <div className="absolute left-1/2 top-[18%] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-purple-700/24 blur-[120px]" />
      <div className="absolute right-[-12rem] top-[18rem] h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/10 blur-[110px]" />
      <div className="absolute bottom-[-12rem] left-[-12rem] h-[26rem] w-[26rem] rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.08]" />
    </div>
  );
}
