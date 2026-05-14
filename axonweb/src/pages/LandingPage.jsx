import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Focus,
  Layers3,
  Menu,
  MessageCircle,
  Moon,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Clareza para o seu dia",
    description:
      "Entenda rapidamente suas prioridades, compromissos e próximos passos.",
  },
  {
    icon: CalendarDays,
    title: "Planejamento inteligente",
    description:
      "Organize tarefas e blocos de foco com base na sua rotina e energia.",
  },
  {
    icon: MessageCircle,
    title: "Copiloto pessoal",
    description:
      "Converse com o Axon para reorganizar seu dia, ideias e decisões.",
  },
  {
    icon: Focus,
    title: "Modo Focus",
    description:
      "Execute uma tarefa principal em um ambiente limpo e sem distrações.",
  },
  {
    icon: BarChart3,
    title: "Insights reais",
    description:
      "Veja padrões de foco, energia, procrastinação, sono e produtividade.",
  },
  {
    icon: Sparkles,
    title: "Sugestões personalizadas",
    description:
      "Receba recomendações práticas para melhorar sua rotina com menos esforço.",
  },
];

const steps = [
  {
    number: "01",
    title: "Responda o questionário",
    description:
      "O Axon entende sua rotina, horários, energia, dificuldades e objetivos.",
  },
  {
    number: "02",
    title: "Receba seu painel inicial",
    description:
      "Seu dashboard começa personalizado com base no seu perfil produtivo.",
  },
  {
    number: "03",
    title: "Execute e evolua",
    description:
      "Planeje, converse com o Axon, foque melhor e acompanhe seus padrões.",
  },
];

const pains = [
  "Você tem tarefas demais e pouca clareza sobre o que fazer primeiro.",
  "Sua agenda não considera sua energia real ao longo do dia.",
  "Você tenta se organizar, mas acaba dependendo de força de vontade.",
  "Você usa várias ferramentas, mas ainda sente a rotina confusa.",
];

function PrimaryButton({ children, className = "", to, href }) {
  const cls = `inline-flex min-h-14 items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/40 transition duration-300 hover:bg-purple-400 active:scale-[0.98] ${className}`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  if (href) return <a href={href} className={cls}>{children}</a>;
  return <button className={cls}>{children}</button>;
}

function SecondaryButton({ children, className = "", to, href }) {
  const cls = `inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] px-6 text-sm font-semibold text-white/75 backdrop-blur-2xl transition duration-300 hover:bg-white/[0.08] hover:text-white active:scale-[0.98] ${className}`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  if (href) return <a href={href} className={cls}>{children}</a>;
  return <button className={cls}>{children}</button>;
}

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-[1.75rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/25 backdrop-blur-2xl ${className}`}
    >
      {children}
    </div>
  );
}

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[-18rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-purple-700/25 blur-[120px]" />
      <div className="absolute right-[-15rem] top-[22rem] h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/10 blur-[120px]" />
      <div className="absolute bottom-[18rem] left-[-14rem] h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:30px_30px] opacity-20" />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,5,11,0.12),#05050b_88%)]" />
    </div>
  );
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.25 }}
      className="relative mx-auto mt-10 flex w-full max-w-[360px] justify-center px-3 sm:mt-14 sm:max-w-5xl"
    >
      <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-500/25 blur-[90px] sm:h-96 sm:w-96" />
      <div className="absolute left-1/2 top-28 h-44 w-44 -translate-x-1/2 rounded-full bg-fuchsia-400/10 blur-[70px] sm:h-72 sm:w-72" />

      {/* MOBILE VISUAL */}
      <div className="relative w-full overflow-hidden rounded-[2.1rem] border border-white/10 bg-white/[0.045] p-3 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/14 via-transparent to-fuchsia-400/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:26px_26px] opacity-20" />

        <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-black/35 p-4">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15">
                <Brain className="h-5 w-5 text-purple-100" />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">Axon</p>
                <p className="text-xs text-white/40">Seu dia em ordem</p>
              </div>
            </div>

            <div className="rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-100">
              78%
            </div>
          </div>

          <div className="relative mb-5 flex h-36 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
              className="absolute h-28 w-28 rounded-full border border-purple-300/15"
            />

            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
              className="absolute h-20 w-20 rounded-full border border-fuchsia-300/10"
            />

            <svg
              className="absolute h-44 w-44 opacity-45"
              viewBox="0 0 180 180"
              fill="none"
            >
              <path
                d="M28 58C55 22 88 43 90 90C92 137 135 145 154 112"
                stroke="url(#mobile-line-1)"
                strokeWidth="1"
              />
              <path
                d="M26 122C55 98 75 132 90 90C105 48 132 58 156 74"
                stroke="url(#mobile-line-2)"
                strokeWidth="1"
              />

              <circle cx="28" cy="58" r="2.5" fill="#c084fc" />
              <circle cx="154" cy="112" r="2.5" fill="#e879f9" />
              <circle cx="26" cy="122" r="2.5" fill="#a855f7" />
              <circle cx="156" cy="74" r="2.5" fill="#c084fc" />

              <defs>
                <linearGradient
                  id="mobile-line-1"
                  x1="28"
                  y1="58"
                  x2="154"
                  y2="112"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#7c3aed" stopOpacity="0" />
                  <stop offset="0.5" stopColor="#c084fc" />
                  <stop offset="1" stopColor="#ec4899" stopOpacity="0" />
                </linearGradient>

                <linearGradient
                  id="mobile-line-2"
                  x1="26"
                  y1="122"
                  x2="156"
                  y2="74"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#7c3aed" stopOpacity="0" />
                  <stop offset="0.5" stopColor="#e879f9" />
                  <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            <motion.div
              animate={{ scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-purple-300/25 bg-purple-500/15 shadow-[0_0_55px_rgba(168,85,247,0.35)] backdrop-blur-2xl"
            >
              <Brain className="h-9 w-9 text-purple-100" />
            </motion.div>
          </div>

          <div className="space-y-3">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-200" />
                  <p className="text-xs font-medium text-white/55">Energia</p>
                </div>

                <p className="text-xs text-purple-100">Alta</p>
              </div>

              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold text-white">78%</p>
                <p className="text-xs text-white/40">boa janela</p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-300 shadow-[0_0_18px_rgba(192,132,252,0.55)]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4">
                <Clock3 className="mb-3 h-4 w-4 text-purple-200" />
                <p className="text-xs text-white/40">Próximo foco</p>
                <p className="mt-1 text-lg font-semibold text-white">10:40</p>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4">
                <Target className="mb-3 h-4 w-4 text-purple-200" />
                <p className="text-xs text-white/40">Prioridade</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  1 tarefa
                </p>
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-purple-300/20 bg-purple-500/10 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-200" />
                <p className="text-xs font-medium text-purple-100">
                  Sugestão do Axon
                </p>
              </div>

              <p className="text-sm leading-6 text-white/58">
                Proteja 90 minutos para sua tarefa principal e mova respostas
                rápidas para a tarde.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP / TABLET VISUAL */}
      <div className="relative hidden w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:block">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/12 via-transparent to-fuchsia-400/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:32px_32px] opacity-20" />

        <div className="relative grid min-h-[500px] gap-4 lg:grid-cols-[280px_1fr_300px]">
          <div className="rounded-[2rem] border border-white/10 bg-black/30 p-5">
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-200">
                <Brain className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">Axon</p>
                <p className="text-xs text-white/40">Personal OS</p>
              </div>
            </div>

            <div className="space-y-2">
              {["Dashboard", "Chat", "Planejamento", "Insights", "Focus"].map(
                (item, index) => (
                  <div
                    key={item}
                    className={`rounded-2xl px-4 py-3 text-sm ${index === 0
                        ? "border border-purple-300/20 bg-purple-500/15 text-white"
                        : "text-white/45"
                      }`}
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="relative flex items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-black/25">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
              className="absolute h-[360px] w-[360px] rounded-full border border-purple-300/15"
            />

            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
              className="absolute h-[270px] w-[270px] rounded-full border border-fuchsia-300/10"
            />

            <svg
              className="absolute h-[520px] w-[520px] opacity-40"
              viewBox="0 0 520 520"
              fill="none"
            >
              <path
                d="M95 160C165 80 255 130 260 260C265 390 380 420 430 330"
                stroke="url(#desktop-line-1)"
                strokeWidth="1"
              />
              <path
                d="M88 350C168 290 210 372 260 260C310 148 378 168 440 210"
                stroke="url(#desktop-line-2)"
                strokeWidth="1"
              />

              <circle cx="95" cy="160" r="4" fill="#c084fc" />
              <circle cx="430" cy="330" r="4" fill="#e879f9" />
              <circle cx="88" cy="350" r="4" fill="#a855f7" />
              <circle cx="440" cy="210" r="4" fill="#c084fc" />

              <defs>
                <linearGradient
                  id="desktop-line-1"
                  x1="95"
                  y1="160"
                  x2="430"
                  y2="330"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#7c3aed" stopOpacity="0" />
                  <stop offset="0.5" stopColor="#c084fc" />
                  <stop offset="1" stopColor="#ec4899" stopOpacity="0" />
                </linearGradient>

                <linearGradient
                  id="desktop-line-2"
                  x1="88"
                  y1="350"
                  x2="440"
                  y2="210"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#7c3aed" stopOpacity="0" />
                  <stop offset="0.5" stopColor="#e879f9" />
                  <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative flex h-40 w-40 items-center justify-center rounded-[2rem] border border-purple-300/25 bg-purple-500/15 shadow-[0_0_90px_rgba(168,85,247,0.35)] backdrop-blur-2xl"
            >
              <Brain className="h-14 w-14 text-purple-100" />
            </motion.div>
          </div>

          <div className="space-y-4 rounded-[2rem] border border-white/10 bg-black/30 p-5">
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-200" />
                  <p className="text-sm text-white/50">Energia</p>
                </div>
                <p className="text-sm text-purple-100">Alta</p>
              </div>

              <p className="text-3xl font-semibold text-white">78%</p>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-300" />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-purple-200" />
                <p className="text-sm text-white/50">Próximo bloco</p>
              </div>

              <p className="text-xl font-semibold text-white">10:40</p>
              <p className="mt-1 text-sm text-white/40">Foco profundo</p>
            </div>

            <div className="rounded-3xl border border-purple-300/20 bg-purple-500/10 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-200" />
                <p className="text-sm text-purple-100">Sugestão do Axon</p>
              </div>

              <p className="text-sm leading-6 text-white/55">
                Reorganize sua tarde e proteja 90 minutos para sua prioridade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
      <p className="mb-3 text-sm font-medium text-purple-200/80">{eyebrow}</p>

      <h2 className="text-[2rem] font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-5xl">
        {title}
      </h2>

      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
        {description}
      </p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05050b] pb-28 text-white sm:pb-0">
      <Background />

      <div className="relative z-10">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-8 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 shadow-lg shadow-purple-950/40 sm:h-11 sm:w-11">
              <Brain className="h-5 w-5 text-purple-200" />
            </div>

            <div>
              <p className="text-base font-semibold tracking-tight text-white sm:text-lg">
                Axon
              </p>
              <p className="hidden text-xs text-white/40 sm:block">
                Personal operating system
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-white/50 md:flex">
            <a href="#problema" className="transition hover:text-white">
              O problema
            </a>
            <a href="#recursos" className="transition hover:text-white">
              Recursos
            </a>
            <a href="#como-funciona" className="transition hover:text-white">
              Como funciona
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden rounded-2xl px-4 py-3 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              Entrar
            </Link>

            <Link
              to="/signup"
              className="hidden rounded-2xl bg-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 transition hover:bg-purple-400 sm:inline-flex"
            >
              Começar
            </Link>

            <button className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-white/70 backdrop-blur-xl md:hidden">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        <section className="px-4 pb-20 pt-8 sm:px-8 sm:pb-24 sm:pt-24">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs text-white/55 backdrop-blur-xl sm:text-sm"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-purple-300 shadow-[0_0_18px_rgba(216,180,254,0.9)]" />
              <span className="truncate">
                Um sistema inteligente para organizar seu dia
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mx-auto max-w-[22rem] text-[2.55rem] font-semibold leading-[0.95] tracking-[-0.065em] text-white sm:max-w-4xl sm:text-6xl lg:text-7xl"
            >
              Organize sua rotina com um segundo cérebro.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-7 text-white/52 sm:mt-6 sm:text-lg"
            >
              O Axon entende seu ritmo, identifica prioridades e ajuda você a
              transformar tarefas soltas em um plano claro, inteligente e
              executável.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
            >
              <PrimaryButton to="/signup" className="w-full sm:w-auto">
                Criar minha conta
                <ArrowRight className="ml-2 h-4 w-4" />
              </PrimaryButton>

              <SecondaryButton href="#como-funciona" className="w-full sm:w-auto">
                Ver como funciona
              </SecondaryButton>
            </motion.div>
          </div>

          <HeroVisual />
        </section>

        <section id="problema" className="px-4 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-medium text-purple-200/80">
                O problema
              </p>

              <h2 className="max-w-2xl text-[2rem] font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-5xl">
                Você não precisa de mais tarefas. Precisa de clareza.
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
                A maioria das pessoas tenta ser produtiva acumulando listas,
                calendários e lembretes. O problema é que isso aumenta a
                organização manual, mas não necessariamente melhora a execução.
              </p>
            </div>

            <GlassCard className="p-4 sm:p-6">
              <div className="space-y-3">
                {pains.map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-3xl border border-white/10 bg-black/20 p-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-purple-200" />
                    <p className="text-sm leading-6 text-white/58">{item}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </section>

        <section id="recursos" className="px-4 py-20 sm:px-8 sm:py-24">
          <SectionHeader
            eyebrow="O que é o Axon"
            title="Um sistema operacional pessoal de produtividade."
            description="Planejamento, foco, conversa inteligente e análise de padrões em um único ambiente criado para organizar o usuário, não apenas armazenar tarefas."
          />

          <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                >
                  <GlassCard className="group h-full p-5 transition duration-300 hover:border-purple-300/20 hover:bg-white/[0.075] sm:p-6">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-500/10 text-purple-200 transition group-hover:bg-purple-500/15">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="text-lg font-semibold tracking-tight text-white">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-white/48">
                      {feature.description}
                    </p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section id="como-funciona" className="px-4 py-20 sm:px-8 sm:py-24">
          <SectionHeader
            eyebrow="Como funciona"
            title="Personalizado desde o primeiro acesso."
            description="Antes de liberar o app, o Axon entende quem você é, como sua rotina funciona e qual tipo de organização faz sentido para o seu momento."
          />

          <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <GlassCard className="h-full p-5 sm:p-6">
                  <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/10 text-sm font-semibold text-purple-100">
                    {step.number}
                  </div>

                  <h3 className="text-xl font-semibold tracking-tight text-white">
                    {step.title}
                  </h3>

                  <p className="mt-4 text-sm leading-6 text-white/48">
                    {step.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="px-4 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 text-center shadow-2xl shadow-black/30 backdrop-blur-2xl sm:rounded-[2.5rem] sm:p-12">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200">
              <Layers3 className="h-6 w-6" />
            </div>

            <h2 className="mx-auto max-w-3xl text-[2rem] font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-5xl">
              Organize sua rotina com mais inteligência e menos esforço manual.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
              Crie sua conta, responda o questionário inicial e entre em um
              ambiente pensado para transformar clareza em execução.
            </p>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <PrimaryButton to="/signup" className="w-full sm:w-auto">
                Começar agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </PrimaryButton>

              <SecondaryButton to="/login" className="w-full sm:w-auto">
                Já tenho conta
              </SecondaryButton>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 px-4 py-8 sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-white/40 sm:flex-row sm:items-center">
            <p>© 2026 Axon. Todos os direitos reservados.</p>

            <div className="flex flex-wrap gap-5">
              <a href="#" className="transition hover:text-white">
                Privacidade
              </a>
              <a href="#" className="transition hover:text-white">
                Termos
              </a>
              <a href="#" className="transition hover:text-white">
                Contato
              </a>
            </div>
          </div>
        </footer>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#05050b]/80 p-4 backdrop-blur-2xl sm:hidden">
        <PrimaryButton to="/signup" className="w-full">
          Começar agora
          <ArrowRight className="ml-2 h-4 w-4" />
        </PrimaryButton>
      </div>
    </main>
  );
}