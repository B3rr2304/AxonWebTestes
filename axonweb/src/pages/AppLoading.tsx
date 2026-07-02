import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import OnboardingBackground from "../components/layout/OnboardingBackground";

export default function AppLoading() {
  const navigate = useNavigate();

  // Redireciona usuários recorrentes direto para o Dashboard após a vinheta inicial.
  useEffect(() => {
    const redirectTimeout = window.setTimeout(() => {
      navigate("/dashboard");
    }, 3000);

    return () => {
      window.clearTimeout(redirectTimeout);
    };
  }, [navigate]);

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#0f1018] text-white">
      <OnboardingBackground />

      {/* Vinheta central da marca exibida entre login e dashboard. */}
      <section className="relative z-10 flex h-full w-full items-center justify-center px-4">
        <div className="relative flex h-72 w-72 items-center justify-center">
          {/* Glow pulsante por trás do logo. */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.28, 0.48, 0.28],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute h-56 w-56 rounded-full bg-purple-500/10 blur-2xl"
          />

          {/* Anel orbital que dá sensação de processamento sem adicionar textos. */}
          <motion.svg
            viewBox="0 0 260 260"
            className="absolute h-72 w-72"
            animate={{ rotate: 360 }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <circle
              cx="130"
              cy="130"
              r="104"
              fill="none"
              stroke="rgba(216,180,254,0.10)"
              strokeWidth="1"
            />

            <circle
              cx="130"
              cy="130"
              r="104"
              fill="none"
              stroke="rgba(216,180,254,0.72)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray="100 560"
            />
          </motion.svg>

          {/* Logo em losango: mantém a tela minimalista e reconhecível. */}
          <motion.div
            animate={{
              scale: [1, 1.035, 1],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative flex h-32 w-32 rotate-45 items-center justify-center rounded-[2.15rem] border border-purple-300/25 bg-white/[0.045] shadow-[0_0_110px_rgba(168,85,247,0.48)] backdrop-blur-2xl"
          >
            <div className="absolute inset-0 rounded-[2.15rem] bg-gradient-to-br from-white/[0.08] to-transparent" />

            <img
              src="/axon-logo.svg"
              alt="Axon"
              className="relative h-28 w-28 -rotate-45 object-contain"
            />
          </motion.div>
        </div>
      </section>
    </main>
  );
}