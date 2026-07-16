import {
  CalendarDays,
  Circle,
  Globe2,
  Heart,
  Mail,
  Sparkles,
} from "lucide-react";

// ===========================================================================
// SEÇÃO — EXPERIÊNCIA CONSTRUÍDA AO REDOR DO USUÁRIO
// ===========================================================================
// Seção clara para reforçar que o AXON aprende com o uso e, no futuro,
// poderá se conectar a outras ferramentas do dia a dia.

const orbitItems = [
  {
    label: "E-mail",
    icon: Mail,
    className:
      "left-[8%] top-[23%] bg-white text-[#ea4335] shadow-[0_16px_38px_rgba(45,8,80,0.12)] dark:bg-white/10 dark:text-white",
  },
  {
    label: "Favoritos",
    icon: Heart,
    className:
      "right-[10%] top-[19%] bg-white text-rose-500 shadow-[0_16px_38px_rgba(45,8,80,0.12)] dark:bg-white/10 dark:text-white",
  },
  {
    label: "Rotina",
    icon: Globe2,
    className:
      "left-[2%] bottom-[27%] bg-white text-emerald-500 shadow-[0_16px_38px_rgba(45,8,80,0.12)] dark:bg-white/10 dark:text-white",
  },
  {
    label: "Agenda",
    icon: CalendarDays,
    className:
      "right-[3%] bottom-[24%] bg-white text-blue-500 shadow-[0_16px_38px_rgba(45,8,80,0.12)] dark:bg-white/10 dark:text-white",
  },
  {
    label: "Foco",
    icon: Circle,
    className:
      "left-1/2 bottom-[9%] -translate-x-1/2 bg-white text-orange-500 shadow-[0_16px_38px_rgba(45,8,80,0.12)] dark:bg-white/10 dark:text-white",
  },
];

export default function LandingPersonalExperience() {
  return (
    <section className="relative overflow-hidden bg-[#fbf8ff] px-4 py-14 text-[#2d0850] sm:px-6 sm:py-18 lg:px-10 lg:py-24 xl:px-14 dark:bg-[#12001f] dark:text-white">
      <ExperienceBackground />

      <div className="relative z-10 mx-auto max-w-[1120px]">
        <header className="mx-auto max-w-[42rem] text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-[#7b2cbf]/18 bg-[#7b2cbf]/10 text-[#7b2cbf] shadow-[0_18px_42px_rgba(45,8,80,0.08)] dark:border-white/10 dark:bg-white/10 dark:text-white">
            <Sparkles className="h-4.5 w-4.5" />
          </div>

          <h2 className="landing-section-title-md mx-auto max-w-[42rem] text-[#2d0850] dark:text-white">
            Um assistente que aprende junto com você
          </h2>

          <p className="mx-auto mt-4 max-w-[21rem] text-sm font-medium leading-6 text-[#2d0850]/64 sm:max-w-[36rem] sm:text-base sm:leading-7 dark:text-white/64">
            Quanto mais você utiliza o AXON, mais ele entende seus hábitos, sua
            rotina e a forma como você trabalha. Assim, as recomendações deixam
            de ser genéricas e passam a fazer sentido para a sua realidade.
          </p>
        </header>

        <ExperienceOrbit />

        <p className="mx-auto mt-7 max-w-[20rem] text-center text-xs font-semibold text-[#2d0850]/48 dark:text-white/46">
          Mais conexões em breve
        </p>
      </div>
    </section>
  );
}

// ===========================================================================
// COMPOSIÇÃO CENTRAL
// ===========================================================================

function ExperienceOrbit() {
  return (
    <div className="relative mx-auto mt-8 h-[360px] max-w-[23rem] sm:h-[430px] sm:max-w-[35rem] lg:mt-12 lg:h-[520px] lg:max-w-[760px]">
      <div className="absolute left-1/2 top-1/2 h-[17rem] w-[17rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7b2cbf]/8 blur-3xl sm:h-[25rem] sm:w-[25rem] dark:bg-[#7b2cbf]/18" />

      <div className="absolute left-1/2 top-1/2 h-[16rem] w-[16rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7b2cbf]/10 bg-white/35 sm:h-[22rem] sm:w-[22rem] dark:border-white/10 dark:bg-white/[0.035]" />

      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
        <p className="mx-auto max-w-[17rem] text-[2rem] font-black uppercase leading-[0.86] tracking-[-0.065em] text-[#2d0850] sm:max-w-[26rem] sm:text-[3.25rem] lg:max-w-[34rem] lg:text-[4rem] dark:text-white">
          É uma experiência construída ao redor de você
        </p>
      </div>

      {orbitItems.map((item) => (
        <OrbitItem key={item.label} item={item} />
      ))}
    </div>
  );
}

function OrbitItem({ item }) {
  const Icon = item.icon;

  return (
    <div
      className={`absolute flex h-13 w-13 items-center justify-center rounded-2xl border border-[#2d0850]/8 backdrop-blur-xl transition sm:h-16 sm:w-16 sm:rounded-[1.4rem] dark:border-white/10 ${item.className}`}
      aria-label={item.label}
    >
      <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
    </div>
  );
}

// ===========================================================================
// FUNDO
// ===========================================================================

function ExperienceBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[18%] h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-[#7b2cbf]/7 blur-3xl dark:bg-[#7b2cbf]/18" />
      <div className="absolute -left-24 bottom-[8rem] h-52 w-52 rounded-full bg-[#7b2cbf]/8 blur-3xl dark:bg-[#7b2cbf]/14" />
      <div className="absolute -right-24 top-[8rem] h-52 w-52 rounded-full bg-[#7b2cbf]/8 blur-3xl dark:bg-[#7b2cbf]/14" />
    </div>
  );
}