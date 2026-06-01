import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function AppLoading() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectTimeout = window.setTimeout(() => {
      navigate("/dashboard");
    }, 1800);

    return () => {
      window.clearTimeout(redirectTimeout);
    };
  }, [navigate]);

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#0f1018] text-white">
      <Background />

      <section className="relative z-10 flex h-full w-full items-center justify-center px-4">
        <div className="relative flex h-56 w-56 items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.18, 1],
              opacity: [0.18, 0.48, 0.18],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute h-52 w-52 rounded-full border border-purple-300/10"
          />

          <motion.div
            animate={{
              scale: [1, 1.34, 1],
              opacity: [0.08, 0.24, 0.08],
            }}
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.15,
            }}
            className="absolute h-40 w-40 rounded-full border border-fuchsia-300/10"
          />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute h-44 w-44 rounded-full border border-transparent border-t-purple-200/35"
          />

          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute h-32 w-32 rounded-full border border-transparent border-b-fuchsia-200/20"
          />

          <motion.div
            animate={{
              y: [-4, 4, -4],
              scale: [1, 1.035, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative flex h-24 w-24 rotate-45 items-center justify-center rounded-[1.9rem] border border-purple-300/25 bg-white/[0.045] shadow-[0_0_90px_rgba(168,85,247,0.38)] backdrop-blur-2xl"
          >
            <img
              src="/axon-logo.svg"
              alt="Axon"
              className="h-20 w-20 -rotate-45 object-contain"
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
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#151520_0%,#0f1018_50%,#11111a_100%)]" />

      <div className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-700/20 blur-[120px]" />

      <div className="absolute right-[-10rem] top-[20%] h-[22rem] w-[22rem] rounded-full bg-fuchsia-500/8 blur-[110px]" />

      <div className="absolute bottom-[-12rem] left-[-12rem] h-[24rem] w-[24rem] rounded-full bg-indigo-500/8 blur-[120px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:34px_34px] opacity-[0.06]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,16,24,0.55)_72%,rgba(15,16,24,0.9)_100%)]" />
    </div>
  );
}