import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  RefreshCcw,
  TrendingUp,
} from "lucide-react";

import axonHappyWave from "../../assets/axon/axon-happy-wave.png";

// ===========================================================================
// SEÇÃO — O QUE O AXON FAZ
// ===========================================================================
// Mobile-first:
// - No mobile, o AXON fica como elemento principal.
// - Os recursos viram cards scrolláveis para não poluir a tela.
// - No desktop, mantemos a composição com recursos ao redor do mascote.

const capabilities = [
  {
    icon: ClipboardList,
    title: "Gestão inteligente de tarefas",
    description: "Organize o que precisa ser feito com mais clareza e contexto.",
  },
  {
    icon: Bot,
    title: "Assistente com IA",
    description: "Converse com o Axon para reorganizar seu dia e tirar dúvidas.",
  },
  {
    icon: CalendarDays,
    title: "Agenda integrada",
    description: "Visualize compromissos, tarefas e blocos importantes juntos.",
  },
  {
    icon: CheckCircle2,
    title: "Organização de hábitos",
    description: "Acompanhe hábitos e rotinas de forma simples e consistente.",
  },
  {
    icon: BarChart3,
    title: "Dashboard completo",
    description: "Veja seu dia, progresso, foco e próximas ações em um só lugar.",
  },
  {
    icon: Lightbulb,
    title: "Insights personalizados",
    description: "Entenda padrões da sua rotina e descubra melhores horários.",
  },
  {
    icon: RefreshCcw,
    title: "Planejamento diário",
    description: "Transforme tarefas soltas em um plano prático para o dia.",
  },
  {
    icon: TrendingUp,
    title: "Acompanhamento da evolução",
    description: "Perceba sua melhora ao longo do tempo com dados simples.",
  },
];

const leftCapabilities = capabilities.slice(0, 4);
const rightCapabilities = capabilities.slice(4);

// ===========================================================================
// COMPONENTE PRINCIPAL
// ===========================================================================

export default function LandingAxonCapabilities() {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-14 text-[#2d0850] sm:px-6 sm:py-18 lg:px-10 lg:py-24 xl:px-14 dark:bg-[#12001f] dark:text-white">
      <CapabilitiesBackground />

      <div className="relative z-10 mx-auto max-w-[1120px]">
        <SectionHeader />

        <MobileCapabilities />

        <DesktopCapabilities />

        <div className="mx-auto mt-9 flex max-w-[22rem] justify-center">
            <Link
                to="/signup"
                className="relative z-10 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#2d0850] px-6 text-sm font-black text-white shadow-[0_18px_42px_rgba(45,8,80,0.18)] transition hover:bg-[#3d0b6d] active:scale-[0.98] sm:w-auto sm:min-w-[14rem] dark:bg-[#7b2cbf] dark:text-white dark:hover:bg-[#8d31dd]"
                style={{ color: "#ffffff" }}
                >
                <span className="relative z-10 text-white" style={{ color: "#ffffff" }}>
                    Criar conta
                </span>

                <ArrowRight className="relative z-10 h-4 w-4 text-white" />
            </Link>
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// CABEÇALHO
// ===========================================================================

function SectionHeader() {
  return (
    <header className="mx-auto max-w-[46rem] text-center">
      <h2 className="landing-section-title-md mx-auto max-w-[42rem] text-[#2d0850] dark:text-white">
        Descubra tudo que você pode fazer com AXON
      </h2>

      <p className="mx-auto mt-4 max-w-[20rem] text-sm font-medium leading-6 text-[#2d0850]/62 sm:max-w-[34rem] sm:text-base sm:leading-7 lg:hidden dark:text-white/62">
        Um assistente para organizar tarefas, rotina, hábitos e prioridades em
        um só lugar.
      </p>
    </header>
  );
}

// ===========================================================================
// MOBILE
// ===========================================================================

function MobileCapabilities() {
  return (
    <div className="mt-8 lg:hidden">
      <div className="relative mx-auto flex h-[310px] max-w-[23rem] items-center justify-center overflow-hidden">
        <div className="absolute left-1/2 top-[52%] h-[14rem] w-[14rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7b2cbf]/10 blur-2xl dark:bg-[#7b2cbf]/22" />

        <div className="absolute left-1/2 top-[58%] h-[14rem] w-[9rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2d0850]/12 blur-[28px] dark:bg-black/28" />

        <div className="absolute left-1/2 top-[58%] h-[13rem] w-[13rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7b2cbf]/10 bg-[#7b2cbf]/6 dark:border-white/10 dark:bg-white/[0.035]" />

        <img
          src={axonHappyWave}
          alt="Mascote Axon acenando"
          className="relative z-10 h-[285px] w-auto object-contain drop-shadow-[0_30px_48px_rgba(45,8,80,0.22)] dark:drop-shadow-[0_34px_56px_rgba(0,0,0,0.34)]"
        />
      </div>

      <MobileCardsRail />
    </div>
  );
}

function MobileCardsRail() {
  return (
    <div className="relative mt-2 -mx-4">
      <div className="flex snap-x gap-3 overflow-x-auto px-4 pb-4 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {capabilities.map((item) => (
          <MobileCapabilityCard key={item.title} item={item} />
        ))}
      </div>
    </div>
  );
}

function MobileCapabilityCard({ item }) {
  const Icon = item.icon;

  return (
    <article className="min-w-[76%] snap-center rounded-[1.45rem] border border-[#2d0850]/10 bg-white p-4 shadow-[0_18px_42px_rgba(45,8,80,0.1)] dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_42px_rgba(0,0,0,0.22)]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-[#7b2cbf]/18 bg-[#7b2cbf]/10 text-[#7b2cbf] dark:border-white/10 dark:bg-white/10 dark:text-white">
        <Icon className="h-4.5 w-4.5" />
      </div>

      <h3 className="max-w-[12rem] text-base font-black leading-[1.05] tracking-[-0.025em] text-[#2d0850] dark:text-white">
        {item.title}
      </h3>

      <p className="mt-3 text-xs font-medium leading-5 text-[#2d0850]/64 dark:text-white/62">
        {item.description}
      </p>
    </article>
  );
}

// ===========================================================================
// DESKTOP
// ===========================================================================

function DesktopCapabilities() {
  return (
    <div className="relative mx-auto mt-12 hidden max-w-[900px] grid-cols-[minmax(0,1fr)_minmax(260px,360px)_minmax(0,1fr)] items-center gap-8 lg:grid">
      <DesktopPattern />

      <div className="relative z-20 flex flex-col items-end gap-6 text-right">
        {leftCapabilities.map((item) => (
          <DesktopCapabilityLine key={item.title} item={item} align="right" />
        ))}
      </div>

      <DesktopAxon />

      <div className="relative z-20 flex flex-col items-start gap-6 text-left">
        {rightCapabilities.map((item) => (
          <DesktopCapabilityLine key={item.title} item={item} align="left" />
        ))}
      </div>
    </div>
  );
}

function DesktopAxon() {
  return (
    <div className="relative z-10 flex min-h-[31rem] items-end justify-center">
      <div className="absolute bottom-6 left-1/2 h-[18rem] w-[18rem] -translate-x-1/2 rounded-full bg-[#7b2cbf]/10 blur-2xl dark:bg-[#7b2cbf]/24" />

      <div className="absolute bottom-0 left-1/2 h-[20rem] w-[13rem] -translate-x-1/2 rounded-full bg-[#2d0850]/12 blur-[28px] dark:bg-black/30" />

      <img
        src={axonHappyWave}
        alt="Mascote Axon acenando"
        className="relative z-10 h-[460px] w-auto object-contain drop-shadow-[0_32px_55px_rgba(45,8,80,0.18)] dark:drop-shadow-[0_36px_68px_rgba(0,0,0,0.32)]"
      />
    </div>
  );
}

function DesktopCapabilityLine({ item, align }) {
  const isRightAligned = align === "right";

  return (
    <div
      className={`relative max-w-[14rem] ${
        isRightAligned ? "text-right" : "text-left"
      }`}
    >
      <p className="text-base font-black leading-[1.08] tracking-[-0.025em] text-[#2d0850] dark:text-white">
        {item.title}
      </p>

      <div
        className={`mt-2 h-[2px] w-[11rem] rounded-full bg-[#2d0850]/78 dark:bg-white/75 ${
          isRightAligned ? "ml-auto" : "mr-auto"
        }`}
      />
    </div>
  );
}

// ===========================================================================
// FUNDO
// ===========================================================================

function CapabilitiesBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute left-1/2 top-[24%] h-[18rem] w-[18rem] -translate-x-1/2 rounded-full bg-[#7b2cbf]/7 blur-3xl sm:h-[22rem] sm:w-[22rem] dark:bg-[#7b2cbf]/18" />
    </div>
  );
}

function DesktopPattern() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-[-4rem] bottom-0 top-[2rem] overflow-hidden opacity-[0.055] dark:opacity-[0.04]"
    >
      <div className="grid grid-cols-8 gap-x-2 gap-y-1 text-center text-[2.6rem] font-black leading-none tracking-[-0.08em] text-[#2d0850] dark:text-white">
        {Array.from({ length: 96 }).map((_, index) => (
          <span key={index}>AXON</span>
        ))}
      </div>
    </div>
  );
}