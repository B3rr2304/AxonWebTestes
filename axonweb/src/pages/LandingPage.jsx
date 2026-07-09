import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";

import { refreshSession, saveSession } from "../lib/api";
import LandingPurpleBackground from "../components/landing/LandingPurpleBackground";

import axonHappy from "../assets/axon/axon-happy.png";
import brainDecoration from "../assets/decorations/brain.svg";
import starDecoration from "../assets/decorations/star.svg";

// ===========================================================================
// LANDING PAGE — REDESIGN
// ===========================================================================
// Hero mobile-first inspirado no novo Figma, já preparado para reaproveitar
// o fundo roxo e padrões visuais nas próximas seções.

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const heroMetrics = [
  {
    value: "15 minutos",
    label: "para configurar",
  },
  {
    value: "100%",
    label: "personalizado para você",
  },
  {
    value: "24 horas",
    label: "com você",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  // Mantém o comportamento atual: usuários logados não ficam presos na landing.
  useEffect(() => {
    const refreshToken = localStorage.getItem("axon_refresh_token");
    const lastActive = Number(localStorage.getItem("axon_last_active") ?? "0");

    if (!refreshToken) return;

    if (Date.now() - lastActive > SEVEN_DAYS_MS) {
      localStorage.removeItem("axon_token");
      localStorage.removeItem("axon_refresh_token");
      localStorage.removeItem("axon_user");
      localStorage.removeItem("axon_last_active");
      return;
    }

    refreshSession(refreshToken)
      .then((res) => {
        saveSession(res);
        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("axon_token");
        localStorage.removeItem("axon_refresh_token");
        localStorage.removeItem("axon_user");
        localStorage.removeItem("axon_last_active");
      });
  }, [navigate]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#2d0850] text-white">
      <LandingHero />
    </main>
  );
}

// ===========================================================================
// HERO
// ===========================================================================

function LandingHero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden rounded-b-[1.7rem] border-b border-white/10 bg-[#2d0850] px-4 pb-0 pt-7 shadow-[0_14px_0_rgba(255,255,255,0.16)] sm:px-6 lg:flex lg:min-h-screen lg:items-center lg:rounded-b-[2.2rem] lg:px-10 lg:py-8 xl:px-14">
      <LandingPurpleBackground intensity="strong" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1180px] flex-col lg:grid lg:grid-cols-[minmax(0,0.82fr)_minmax(420px,0.82fr)] lg:items-center lg:gap-10">
        <HeroTopBar />

        <HeroContent />

        <HeroRobotStage />
      </div>
    </section>
  );
}

function HeroTopBar() {
  return (
    <header className="relative z-30 mb-7 flex items-center justify-center lg:absolute lg:left-0 lg:top-0 lg:mb-0 lg:w-full lg:justify-between">
      <HeroLogo />

      <nav className="hidden items-center gap-2 lg:flex">
        <HeroTopButton to="/signup" variant="outline">
          Criar
        </HeroTopButton>

        <HeroTopButton to="/login" variant="filled">
          Entrar
        </HeroTopButton>
      </nav>
    </header>
  );
}

function HeroContent() {
  return (<div className="relative z-20 mx-auto flex w-full max-w-[23rem] flex-col items-center text-center sm:max-w-[30rem] lg:mx-0 lg:max-w-[34rem] lg:items-start lg:text-left">
      <HeroStars />

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, delay: 0.04 }}
        className="mt-3 max-w-[20rem] text-[2.05rem] font-black leading-[0.9] tracking-[-0.055em] text-white sm:max-w-[30rem] sm:text-[3.25rem] lg:mt-4 lg:max-w-[31rem] lg:text-[3.65rem] xl:text-[4.25rem]"
      >
        Seu assistente inteligente de produtividade
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, delay: 0.1 }}
        className="mt-4 max-w-[20.5rem] sm:max-w-[29rem] lg:max-w-[33rem] lg:border-l lg:border-white/35 lg:pl-4"
      >
        <p className="text-[0.73rem] font-medium leading-5 text-white/72 sm:text-[0.95rem] sm:leading-7 lg:text-base">
          O AXON aprende sua rotina, entende seus padrões de produtividade e
          ajuda você a organizar tarefas, hábitos e compromissos de forma
          personalizada, para que você tenha mais foco, clareza e equilíbrio
          todos os dias.
        </p>
      </motion.div>

      <HeroMobileActions />

      <HeroInfoStack />
    </div>
  );
}

function HeroLogo() {
  return (
    <Link
      to="/"
      className="inline-flex items-center justify-center gap-2 text-white"
      aria-label="Axon"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#2d0850] shadow-[0_0_24px_rgba(255,255,255,0.24)] sm:h-8 sm:w-8 lg:h-9 lg:w-9">
        <img
          src="/axon-logo.svg"
          alt=""
          className="h-5 w-5 object-contain sm:h-6 sm:w-6 lg:h-7 lg:w-7"
        />
      </span>

      <span className="text-[0.78rem] font-black uppercase tracking-[0.16em] text-white sm:text-sm lg:text-base">
        Axon
      </span>
    </Link>
  );
}

function HeroStars() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: 0.03 }}
      className="flex items-center justify-center gap-1 lg:justify-start"
      aria-label="Avaliação cinco estrelas"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className="h-3.5 w-3.5 fill-[#f7d84a] text-[#f7d84a] drop-shadow-[0_0_8px_rgba(247,216,74,0.38)] sm:h-4 sm:w-4"
        />
      ))}
    </motion.div>
  );
}

function HeroMobileActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, delay: 0.16 }}
      className="mt-5 grid w-full max-w-[12.4rem] gap-2.5 sm:mt-6 sm:max-w-[20rem] sm:grid-cols-2 lg:hidden"
    >
      <HeroButton to="/login" variant="primary">
        Entrar
        <ArrowRight className="h-4 w-4" />
      </HeroButton>

      <HeroButton to="/signup" variant="secondary">
        Criar conta
      </HeroButton>
    </motion.div>
  );
}

function HeroInfoStack() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, delay: 0.22 }}
      className="mt-7 flex w-full max-w-[20rem] flex-col items-center sm:max-w-[26rem] lg:max-w-[25rem] lg:items-start"
    >
      <div className="order-1 lg:order-2">
        <HeroMetrics />
      </div>

      <div className="order-2 mt-5 lg:order-1 lg:mb-5 lg:mt-0">
        <PlayStoreSoon />
      </div>
    </motion.div>
  );
}

function HeroMetrics() {
  return (
    <div className="grid w-full grid-cols-3 divide-x divide-white/35">
      {heroMetrics.map((metric) => (
        <div key={metric.label} className="px-2 text-center first:pl-0 last:pr-0 lg:text-left">
          <p className="text-[0.72rem] font-black leading-none text-white sm:text-base">
            {metric.value}
          </p>

          <p className="mx-auto mt-1 max-w-[5.4rem] text-[0.56rem] font-medium leading-3 text-white/62 sm:text-[0.68rem] sm:leading-4 lg:mx-0">
            {metric.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function PlayStoreSoon() {
  return (
    <div className="w-full max-w-[13.2rem] sm:max-w-[16rem] lg:max-w-[12.5rem]">
      <p className="mb-2 text-center text-[0.64rem] font-black text-white sm:text-xs lg:text-left">
        Em breve na
      </p>

      <div className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 text-[#2d0850] shadow-card">
        <PlayStoreIcon />
        <span className="text-[0.7rem] font-black sm:text-xs">
          Google Play
        </span>
      </div>
    </div>
  );
}

function HeroRobotStage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.22, ease: "easeOut" }}
      className="pointer-events-none relative mx-auto mt-8 h-[315px] w-full max-w-[23rem] sm:h-[440px] sm:max-w-[30rem] lg:mt-0 lg:h-[640px] lg:max-w-none"
    >
      {/* Glow principal atrás do robô */}
      <div className="absolute left-1/2 top-[61%] h-[15rem] w-[15rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7b2cbf]/60 blur-[80px] sm:h-[24rem] sm:w-[24rem] lg:top-[52%] lg:h-[30rem] lg:w-[30rem] lg:blur-[110px] xl:h-[33rem] xl:w-[33rem]" />

      {/* Círculo roxo */}
      <div className="absolute left-1/2 top-[64%] h-[13.5rem] w-[13.5rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7b2cbf]/55 sm:h-[22rem] sm:w-[22rem] lg:top-[55%] lg:h-[25rem] lg:w-[25rem] xl:h-[28rem] xl:w-[28rem]" />

      {/* Borda sutil do círculo */}
      <div className="absolute left-1/2 top-[64%] h-[13.5rem] w-[13.5rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 sm:h-[22rem] sm:w-[22rem] lg:top-[55%] lg:h-[25rem] lg:w-[25rem] xl:h-[28rem] xl:w-[28rem]" />

      {/* Pontos decorativos */}
      <span className="absolute left-1/2 top-[18%] h-3 w-3 -translate-x-1/2 rounded-full bg-white sm:top-[13%] sm:h-4 sm:w-4 lg:top-[18%]" />

      <span className="absolute bottom-[16%] right-[20%] h-3 w-3 rounded-full bg-white sm:h-4 sm:w-4 lg:bottom-[21%] lg:right-[18%]" />

      {/* Decorations próximas ao robô */}
      <img
        src={brainDecoration}
        alt=""
        aria-hidden="true"
        className="absolute left-[17%] top-[25%] h-7 w-7 -rotate-12 opacity-80 sm:left-[15%] sm:top-[22%] sm:h-10 sm:w-10 lg:left-[13%] lg:top-[30%] lg:h-11 lg:w-11 xl:left-[14%]"
      />

      <img
        src={starDecoration}
        alt=""
        aria-hidden="true"
        className="absolute right-[16%] top-[24%] h-8 w-8 rotate-12 opacity-90 sm:right-[15%] sm:top-[20%] sm:h-12 sm:w-12 lg:right-[14%] lg:top-[28%] lg:h-13 lg:w-13 xl:right-[15%]"
      />

      <img
        src={starDecoration}
        alt=""
        aria-hidden="true"
        className="absolute bottom-[25%] left-[12%] h-7 w-7 -rotate-12 opacity-75 sm:bottom-[24%] sm:left-[12%] sm:h-10 sm:w-10 lg:bottom-[24%] lg:left-[10%] lg:h-11 lg:w-11"
      />

      <img
        src={brainDecoration}
        alt=""
        aria-hidden="true"
        className="absolute bottom-[30%] right-[7%] h-6 w-6 rotate-12 opacity-40 sm:right-[8%] sm:h-9 sm:w-9 lg:bottom-[30%] lg:right-[8%] lg:h-9 lg:w-9"
      />

      {/* Mascote */}
      <div className="relative z-10 top-14 mx-auto mb-[-1.6rem] w-fit sm:top-14 lg:top-2">
        <motion.img
          src={axonHappy}
          alt="Mascote Axon feliz"
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          className="block h-[260px] w-auto object-contain drop-shadow-[0_34px_70px_rgba(0,0,0,0.38)] sm:h-[410px] lg:h-[500px] xl:h-[560px]"
        />
      </div>
    </motion.div>
  );
}

// ===========================================================================
// COMPONENTES MENORES
// ===========================================================================

function HeroButton({ children, to, variant = "primary" }) {
  const isPrimary = variant === "primary";

  return (
    <Link
      to={to}
      className={`relative z-30 inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl px-5 text-[0.72rem] font-black transition active:scale-[0.98] sm:min-h-11 sm:text-sm ${
        isPrimary
          ? "bg-[#8d31dd] text-white shadow-[0_14px_30px_rgba(0,0,0,0.2)] hover:bg-[#9b3bee]"
          : "border border-white/80 bg-transparent text-white hover:bg-white/10"
      }`}
    >
      {children}
    </Link>
  );
}

function HeroTopButton({ children, to, variant = "outline" }) {
  const isFilled = variant === "filled";

  return (
    <Link
      to={to}
      className={`relative z-30 inline-flex min-h-9 items-center justify-center rounded-2xl px-5 text-sm font-black transition active:scale-[0.98] ${
        isFilled
          ? "bg-[#8d31dd] text-white shadow-[0_14px_30px_rgba(0,0,0,0.2)] hover:bg-[#9b3bee]"
          : "border border-white/80 bg-transparent text-white hover:bg-white/10"
      }`}
    >
      {children}
    </Link>
  );
}

function PlayStoreIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#34A853"
        d="M4.4 3.2c-.2.3-.4.7-.4 1.2v15.2c0 .5.1.9.4 1.2l8.4-8.8-8.4-8.8Z"
      />
      <path
        fill="#4285F4"
        d="m13.7 11.1 2.7-2.8L6.2 2.5c-.7-.4-1.3-.3-1.8.1l9.3 8.5Z"
      />
      <path
        fill="#FBBC04"
        d="m13.7 12.9-9.3 8.5c.5.4 1.1.5 1.8.1l10.2-5.8-2.7-2.8Z"
      />
      <path
        fill="#EA4335"
        d="m20.2 10.6-3.8-2.2-2.9 3 2.9 3 3.8-2.2c.9-.5.9-1.1 0-1.6Z"
      />
    </svg>
  );
}
