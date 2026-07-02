import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
      <Background />

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

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base escura premium usada nas telas de transição do app. */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#151520_0%,#0f1018_50%,#11111a_100%)]" />

      {/* Luz principal centralizada atrás da marca. */}
      <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-700/22 blur-[130px]" />

      {/* Luzes secundárias para profundidade sem competir com o logo. */}
      <div className="absolute right-[-10rem] top-[18%] h-[22rem] w-[22rem] rounded-full bg-fuchsia-500/8 blur-[110px]" />

      <div className="absolute bottom-[-12rem] left-[-12rem] h-[24rem] w-[24rem] rounded-full bg-indigo-500/8 blur-[120px]" />

      {/* Textura sutil para evitar um fundo chapado. */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:34px_34px] opacity-[0.055]" />

      {/* Vinheta final que concentra a atenção no centro da tela. */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,16,24,0.45)_68%,rgba(15,16,24,0.92)_100%)]" />
    </div>
  );
}
