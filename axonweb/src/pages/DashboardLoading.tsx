import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import favicon from "../assets/favicon.svg";

import OnboardingBackground from "../components/layout/OnboardingBackground";

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app px-4 text-primary">
      <OnboardingBackground />

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
            className="absolute h-52 w-52 rounded-full border border-accent-soft"
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
            className="absolute h-40 w-40 rounded-full border border-accent-soft"
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
            className="absolute h-44 w-44 rounded-full border border-transparent border-t-[var(--accent)]"
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
            className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-accent-soft bg-accent-soft shadow-soft backdrop-blur-2xl"
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
          <p className="text-sm font-semibold text-accent">
            {loadingTexts[textIndex]}
          </p>

          <p className="mt-3 text-xs leading-5 text-muted">
            O Axon está montando uma visão inicial baseada no seu ritmo,
            energia e prioridades.
          </p>
        </motion.div>

        {/* Progresso visual sincronizado com o redirecionamento. */}
        <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-soft)]">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.1, ease: "easeInOut" }}
            className="h-full rounded-full bg-[var(--accent)] shadow-[0_0_18px_var(--accent-soft)]"
          />
        </div>
      </section>
    </main>
  );
}
