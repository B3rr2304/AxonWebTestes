import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import AuthLogo from "../components/auth/AuthLogo";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Focus,
  MessageCircle,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

const pains = [
  "Você começa o dia sem saber o que priorizar.",
  "Sua rotina muda, mas suas ferramentas continuam rígidas.",
  "Você acumula tarefas, lembretes e ideias em lugares diferentes.",
  "Você tenta se organizar, mas depende demais de força de vontade.",
];

const solutionSteps = [
  {
    icon: Brain,
    title: "Entende seu ritmo",
    description:
      "O Axon identifica seus horários de energia, foco e queda de disposição.",
  },
  {
    icon: Target,
    title: "Define prioridades",
    description:
      "Ele ajuda você a separar o que importa agora do que pode esperar.",
  },
  {
    icon: CalendarDays,
    title: "Monta um plano",
    description:
      "Sua rotina vira blocos claros de execução, foco, pausa e revisão.",
  },
  {
    icon: BarChart3,
    title: "Aprende com padrões",
    description:
      "Com o uso, o Axon mostra insights sobre foco, energia e produtividade.",
  },
];

const features = [
  {
    icon: Brain,
    title: "Dashboard inteligente",
    description:
      "Veja energia, foco, próximas tarefas e sugestões em uma visão simples.",
  },
  {
    icon: MessageCircle,
    title: "Chat com contexto",
    description:
      "Converse com o Axon para reorganizar seu dia e clarear decisões.",
  },
  {
    icon: CalendarDays,
    title: "Planejamento adaptativo",
    description:
      "Monte sua rotina considerando energia, foco e prioridades reais.",
  },
  {
    icon: Focus,
    title: "Modo Focus",
    description:
      "Execute uma tarefa principal em um ambiente limpo e sem distrações.",
  },
];

const onboardingSteps = [
  {
    number: "01",
    title: "Mapeie seu ritmo",
    description:
      "Responda perguntas rápidas sobre sono, energia, foco e rotina.",
  },
  {
    number: "02",
    title: "Receba seu perfil",
    description:
      "O Axon identifica seu ritmo inicial e seus melhores horários.",
  },
  {
    number: "03",
    title: "Entre no Dashboard",
    description:
      "Seu painel começa com sugestões alinhadas ao seu funcionamento.",
  },
];

function PrimaryButton({ children, className = "", to, href }) {
  const cls = `inline-flex min-h-14 items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-[0_0_34px_rgba(168,85,247,0.42)] transition duration-300 hover:bg-purple-400 active:scale-[0.98] ${className}`;

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

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[-18rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-purple-700/25 blur-[120px]" />
      <div className="absolute left-1/2 top-[24rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[120px]" />
      <div className="absolute right-[-14rem] top-[48rem] h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/10 blur-[120px]" />
      <div className="absolute bottom-[16rem] left-[-14rem] h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:28px_28px] opacity-20" />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,5,11,0.08),#05050b_76%)]" />
    </div>
  );
}

function GlassPanel({ children, className = "" }) {
  return (
    <div
      className={`rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/25 backdrop-blur-2xl ${className}`}
    >
      {children}
    </div>
  );
}

function SectionShell({ children, className = "" }) {
  return (
    <section className={`px-4 py-20 sm:px-8 sm:py-24 ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, description, centered = false }) {
  return (
    <div
      className={`mb-9 sm:mb-12 ${
        centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"
      }`}
    >
      <p className="mb-3 text-sm font-medium text-purple-200/80">{eyebrow}</p>

      <h2 className="text-[2.15rem] font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-5xl">
        {title}
      </h2>

      {description && (
        <p
          className={`mt-4 text-sm leading-7 text-white/50 sm:text-base ${
            centered ? "mx-auto max-w-2xl" : "max-w-2xl"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

function FloatingCard({ icon: Icon, title, children, className = "", delay = 0 }) {
  return (
    <motion.div
      animate={{ y: [-5, 5, -5] }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className={`absolute rounded-[1.25rem] border border-white/10 bg-[#11101a]/78 p-3 shadow-2xl shadow-black/35 backdrop-blur-2xl ${className}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl border border-purple-300/20 bg-purple-500/15 text-purple-200">
          <Icon className="h-3.5 w-3.5" />
        </div>

        <p className="text-[0.68rem] font-semibold text-white/78">{title}</p>
      </div>

      {children}
    </motion.div>
  );
}

function ProductOrbit() {
  return (
    <div className="relative mx-auto mt-12 h-[460px] w-full max-w-[380px] overflow-visible sm:mt-16 sm:h-[570px] sm:max-w-5xl">
      <div className="absolute left-1/2 top-[48%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/25 blur-[90px] sm:h-96 sm:w-96" />

      <svg
        className="absolute left-1/2 top-[48%] h-[345px] w-[345px] -translate-x-1/2 -translate-y-1/2 opacity-75 sm:h-[520px] sm:w-[520px]"
        viewBox="0 0 520 520"
        fill="none"
      >
        <path
          d="M82 162C150 94 222 132 260 260C298 388 384 420 440 328"
          stroke="url(#line-1)"
          strokeWidth="1.2"
        />

        <path
          d="M78 356C154 294 214 374 260 260C306 146 380 164 444 210"
          stroke="url(#line-2)"
          strokeWidth="1.2"
        />

        <path
          d="M160 102C228 172 304 140 260 260C216 380 296 418 360 448"
          stroke="url(#line-3)"
          strokeWidth="1.2"
        />

        <circle cx="82" cy="162" r="4" fill="#c084fc" />
        <circle cx="440" cy="328" r="4" fill="#e879f9" />
        <circle cx="78" cy="356" r="4" fill="#a855f7" />
        <circle cx="444" cy="210" r="4" fill="#c084fc" />
        <circle cx="160" cy="102" r="4" fill="#e879f9" />
        <circle cx="360" cy="448" r="4" fill="#a855f7" />

        <defs>
          <linearGradient id="line-1" x1="82" y1="162" x2="440" y2="328">
            <stop stopColor="#7c3aed" stopOpacity="0" />
            <stop offset="0.5" stopColor="#c084fc" />
            <stop offset="1" stopColor="#ec4899" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="line-2" x1="78" y1="356" x2="444" y2="210">
            <stop stopColor="#7c3aed" stopOpacity="0" />
            <stop offset="0.5" stopColor="#e879f9" />
            <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="line-3" x1="160" y1="102" x2="360" y2="448">
            <stop stopColor="#ec4899" stopOpacity="0" />
            <stop offset="0.5" stopColor="#c084fc" />
            <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute left-1/2 top-[48%] flex h-48 w-48 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-purple-300/15 bg-purple-500/5 sm:h-64 sm:w-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute h-full w-full rounded-full border border-purple-300/10"
        />

        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
          className="absolute h-[78%] w-[78%] rounded-full border border-fuchsia-300/10"
        />

        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.86, 1, 0.86] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex h-28 w-28 items-center justify-center rounded-full border border-purple-200/25 bg-purple-500/15 shadow-[0_0_90px_rgba(168,85,247,0.65)] backdrop-blur-2xl sm:h-36 sm:w-36"
        >
          <div className="absolute inset-3 rounded-full border border-white/10 bg-black/20" />
          <Brain className="relative h-12 w-12 text-purple-100 sm:h-16 sm:w-16" />
        </motion.div>
      </div>

      <FloatingCard
        icon={CheckCircle2}
        title="Prioridades"
        delay={0.1}
        className="left-0 top-4 w-[150px] sm:left-16 sm:top-20 sm:w-[220px]"
      >
        <div className="space-y-2">
          <div className="h-2 w-24 rounded-full bg-white/12" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-300" />
            <div className="h-2 w-20 rounded-full bg-white/10" />
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-fuchsia-300" />
            <div className="h-2 w-16 rounded-full bg-white/10" />
          </div>
        </div>
      </FloatingCard>

      <FloatingCard
        icon={BarChart3}
        title="Energia"
        delay={0.35}
        className="right-0 top-8 w-[150px] sm:right-16 sm:top-24 sm:w-[220px]"
      >
        <div className="flex h-14 items-end gap-1.5">
          {[34, 56, 42, 72, 60].map((height, index) => (
            <div
              key={index}
              className="flex-1 rounded-t-lg bg-gradient-to-t from-purple-500/45 to-fuchsia-300"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </FloatingCard>

      <FloatingCard
        icon={Sparkles}
        title="Sugestão"
        delay={0.65}
        className="bottom-16 left-1 w-[162px] sm:bottom-24 sm:left-20 sm:w-[240px]"
      >
        <p className="text-[0.68rem] leading-4 text-white/45 sm:text-xs sm:leading-5">
          Proteja 90 min para a tarefa que mais importa.
        </p>
      </FloatingCard>

      <FloatingCard
        icon={Focus}
        title="Focus"
        delay={0.9}
        className="bottom-8 right-1 w-[162px] sm:bottom-28 sm:right-20 sm:w-[240px]"
      >
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-white">10:40</p>
          <div className="rounded-full border border-purple-300/20 bg-purple-500/10 px-2 py-1 text-[0.62rem] text-purple-100">
            ideal
          </div>
        </div>
      </FloatingCard>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05050b] pb-28 text-white sm:pb-0">
      <Background />

      <div className="relative z-10">
        <header className="relative mx-auto flex max-w-7xl items-center justify-center px-4 py-5 sm:px-8 sm:py-6">
          <Link to="/" className="flex flex-col items-center justify-center text-center">
            <AuthLogo variant="header" className="mb-2 [transform:scale(1.15)]" />

            <p className="text-base font-semibold tracking-tight text-white sm:text-lg">
              Axon
            </p>

            <p className="mt-0.5 hidden text-xs text-white/40 sm:block">
              Personal operating system
            </p>
          </Link>

          <Link
            to="/login"
            className="absolute right-8 hidden min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] px-5 text-sm font-semibold text-white/65 backdrop-blur-2xl transition hover:bg-white/[0.08] hover:text-white active:scale-[0.98] sm:inline-flex"
          >
            Entrar
          </Link>
        </header>


        <section className="px-4 pb-12 pt-8 sm:px-8 sm:pb-24 sm:pt-20">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs text-white/55 backdrop-blur-xl sm:text-sm"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-purple-300 shadow-[0_0_18px_rgba(216,180,254,0.9)]" />
              <span className="truncate">
                Produtividade guiada pelo seu ritmo
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mx-auto max-w-[23rem] text-[2.85rem] font-semibold leading-[0.9] tracking-[-0.075em] text-white sm:max-w-4xl sm:text-6xl lg:text-7xl"
            >
              Sua rotina organizada pelo seu próprio ritmo.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-7 text-white/52 sm:mt-6 sm:text-lg"
            >
              O Axon entende seus horários de energia, organiza suas prioridades
              e transforma tarefas soltas em um plano claro para o seu dia.
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
                <Sparkles className="ml-2 h-4 w-4" />
              </SecondaryButton>
            </motion.div>
          </div>

          <ProductOrbit />

          <div className="mx-auto mt-2 grid max-w-4xl grid-cols-3 gap-2 px-1 sm:mt-8 sm:gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-center backdrop-blur-2xl sm:p-4">
              <p className="text-lg font-semibold text-white sm:text-2xl">3min</p>
              <p className="mt-1 text-[0.68rem] leading-4 text-white/38 sm:text-xs">
                para configurar
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-center backdrop-blur-2xl sm:p-4">
              <p className="text-lg font-semibold text-white sm:text-2xl">1</p>
              <p className="mt-1 text-[0.68rem] leading-4 text-white/38 sm:text-xs">
                plano diário
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-center backdrop-blur-2xl sm:p-4">
              <p className="text-lg font-semibold text-white sm:text-2xl">24h</p>
              <p className="mt-1 text-[0.68rem] leading-4 text-white/38 sm:text-xs">
                de contexto
              </p>
            </div>
          </div>
        </section>

        <SectionShell id="problema">
          <SectionHeader
            eyebrow="O problema"
            title="Você sabe o que precisa fazer. O difícil é saber por onde começar."
            description="A rotina moderna não falha por falta de ferramentas. Ela falha porque tarefas, energia, foco e prioridades ficam desconectados."
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {pains.map((pain, index) => (
              <motion.div
                key={pain}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-4 backdrop-blur-2xl"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-500/10 text-purple-200">
                  <CheckCircle2 className="h-4 w-4" />
                </div>

                <p className="text-sm leading-6 text-white/58">{pain}</p>
              </motion.div>
            ))}
          </div>
        </SectionShell>

        <section id="solucao" className="px-4 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <SectionHeader
                eyebrow="A solução"
                title="O Axon não guarda tarefas. Ele ajuda você a organizar a mente."
                description="A proposta é simples: entender seu ritmo, reduzir ruído e transformar o seu dia em uma sequência clara de decisões e ações."
              />

              <PrimaryButton to="/signup" className="hidden w-fit sm:inline-flex">
                Começar agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </PrimaryButton>
            </div>

            <GlassPanel className="p-4 sm:p-6">
              <div className="space-y-3">
                {solutionSteps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.title}
                      className="flex gap-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-500/10 text-purple-200">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xs font-semibold text-purple-100">
                            0{index + 1}
                          </span>
                          <h3 className="text-sm font-semibold text-white">
                            {step.title}
                          </h3>
                        </div>

                        <p className="text-xs leading-5 text-white/42">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassPanel>
          </div>
        </section>

        <SectionShell id="recursos">
          <SectionHeader
            centered
            eyebrow="Dentro do Axon"
            title="Um ambiente único para clarear, planejar, executar e melhorar."
            description="Cada parte do app foi pensada para ajudar você a sair da confusão e entrar em um fluxo mais claro de produtividade."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                >
                  <GlassPanel className="h-full p-5">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-500/10 text-purple-200">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="text-lg font-semibold tracking-tight text-white">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-white/46">
                      {feature.description}
                    </p>
                  </GlassPanel>
                </motion.div>
              );
            })}
          </div>
        </SectionShell>

        <SectionShell id="como-funciona">
          <SectionHeader
            centered
            eyebrow="Como funciona"
            title="Personalizado antes mesmo do primeiro Dashboard."
            description="O Axon começa entendendo você. Só depois ele libera uma experiência alinhada ao seu ritmo."
          />

          <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-3">
            {onboardingSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <GlassPanel className="h-full p-5">
                  <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/10 text-sm font-semibold text-purple-100">
                    {step.number}
                  </div>

                  <h3 className="text-xl font-semibold tracking-tight text-white">
                    {step.title}
                  </h3>

                  <p className="mt-4 text-sm leading-6 text-white/48">
                    {step.description}
                  </p>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </SectionShell>

        <section className="px-4 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-purple-300/20 bg-purple-500/10 p-6 text-center shadow-[0_0_80px_rgba(88,28,135,0.28)] backdrop-blur-2xl sm:rounded-[2.5rem] sm:p-12">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200">
              <Sparkles className="h-6 w-6" />
            </div>

            <h2 className="mx-auto max-w-3xl text-[2.1rem] font-semibold leading-[1.03] tracking-[-0.055em] text-white sm:text-5xl">
              Comece com clareza. Depois deixe o Axon organizar o resto.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
              Crie sua conta, responda o mapeamento inicial e entre em um
              ambiente pensado para transformar rotina em execução.
            </p>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <PrimaryButton to="/signup" className="w-full sm:w-auto">
                Criar minha conta
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

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#05050b]/85 p-4 backdrop-blur-2xl sm:hidden">
        <PrimaryButton to="/login" className="w-full">
          Entrar
          <ArrowRight className="ml-2 h-4 w-4" />
        </PrimaryButton>
      </div>
    </main>
  );
}