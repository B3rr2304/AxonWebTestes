import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  CalendarDays,
  Clock3,
  Edit3,
  Mail,
  Menu,
  RefreshCcw,
  Settings,
  Sparkles,
  Target,
  User,
  Zap,
} from "lucide-react";

import { results, type ChronotypeResultKey } from "../data/results";
import Sidebar from "../components/layout/Sidebar";

const validKeys: ChronotypeResultKey[] = [
  "morning",
  "intermediate",
  "evening",
  "night",
];

const preferences = [
  {
    label: "Estilo de rotina",
    value: "Flexível",
    icon: CalendarDays,
  },
  {
    label: "Modo de trabalho",
    value: "Blocos de foco",
    icon: Target,
  },
  {
    label: "Tom do Axon",
    value: "Direto e estratégico",
    icon: Sparkles,
  },
];

export default function Profile() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const resultKey = useMemo<ChronotypeResultKey>(() => {
    const stored = localStorage.getItem("axon_chronotype");

    if (stored && validKeys.includes(stored as ChronotypeResultKey)) {
      return stored as ChronotypeResultKey;
    }

    return "intermediate";
  }, []);

  const result = results[resultKey];

  const userName = "Bernardo";
  const userEmail = "bernardo@axon.app";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05050b] text-white">
      <Background />

      <div className="relative z-10 min-h-screen px-4 pb-6 pt-5">
        <header className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 text-left active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200 shadow-lg shadow-purple-950/30">
              <Brain className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Perfil</p>
              <p className="text-xs text-white/40">Identidade e ritmo</p>
            </div>
          </button>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-white/60 backdrop-blur-2xl active:scale-[0.96]"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <section className="mb-5">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/14 via-transparent to-fuchsia-400/10" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:26px_26px] opacity-20" />

            <div className="relative">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.7rem] border border-purple-300/25 bg-purple-500/15 text-purple-100 shadow-xl shadow-purple-950/30">
                    <User className="h-9 w-9" />
                    <span className="absolute bottom-2 right-2 h-3.5 w-3.5 rounded-full border-2 border-[#201527] bg-emerald-400" />
                  </div>

                  <div className="min-w-0">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1 text-[0.68rem] font-medium text-purple-100">
                      <Sparkles className="h-3.5 w-3.5" />
                      Perfil ativo
                    </div>

                    <h1 className="truncate text-2xl font-semibold tracking-[-0.045em] text-white">
                      {userName}
                    </h1>

                    <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{userEmail}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-5 text-sm font-semibold text-white/60 backdrop-blur-2xl active:scale-[0.98]">
                Editar perfil
                <Edit3 className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-[2rem] border border-purple-300/20 bg-purple-500/10 p-4 shadow-xl shadow-purple-950/20 backdrop-blur-2xl">
          <div className="mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-200" />
            <p className="text-sm font-semibold text-purple-100">
              Seu perfil cronobiológico
            </p>
          </div>

          <h2 className="text-[1.65rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
            {result.label}
          </h2>

          <p className="mt-3 text-sm leading-6 text-white/55">
            {result.subtitle}
          </p>

          <p className="mt-3 text-sm leading-6 text-white/42">
            {result.description}
          </p>
        </section>

        <section className="mb-5 grid grid-cols-2 gap-3">
          <ProfileMetric
            icon={Zap}
            label="Pico de energia"
            value={result.energyPeak}
          />

          <ProfileMetric
            icon={Target}
            label="Melhor foco"
            value={result.focusWindow}
          />

          <ProfileMetric
            icon={Clock3}
            label="Baixa energia"
            value={result.lowEnergy}
          />

          <ProfileMetric
            icon={Brain}
            label="Cronotipo"
            value={result.label.replace("Perfil ", "")}
          />
        </section>

        <section className="mb-5 rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Preferências do Axon
              </p>
              <p className="mt-1 text-xs text-white/38">
                Ajustes iniciais da sua experiência
              </p>
            </div>

            <Settings className="h-5 w-5 text-purple-200" />
          </div>

          <div className="space-y-3">
            {preferences.map((preference) => {
              const Icon = preference.icon;

              return (
                <div
                  key={preference.label}
                  className="flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-500/10 text-purple-200">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">
                      {preference.label}
                    </p>
                    <p className="mt-1 text-xs text-white/38">
                      {preference.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-5 rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-200" />
            <p className="text-sm font-semibold text-white">
              Como o Axon usa seu perfil
            </p>
          </div>

          <p className="text-sm leading-6 text-white/48">
            Seu cronotipo ajuda o Axon a sugerir melhores horários para foco,
            pausas, tarefas leves e tarefas complexas. Com o uso diário, esse
            perfil pode ser ajustado com base nos seus padrões reais.
          </p>
        </section>

        <section className="space-y-3">
          <button
            onClick={() => navigate("/questionnaire-intro")}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/40 active:scale-[0.98]"
          >
            Refazer questionário
            <RefreshCcw className="ml-2 h-4 w-4" />
          </button>

          <button
            onClick={() => navigate("/settings")}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] px-6 text-sm font-semibold text-white/55 backdrop-blur-2xl active:scale-[0.98]"
          >
            Abrir configurações
            <Settings className="ml-2 h-4 w-4" />
          </button>
        </section>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chronotypeLabel={result.label}
        energyPeak={result.energyPeak}
        userName={userName}
        userEmail={userEmail}
      />
    </main>
  );
}

function ProfileMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-500/10 text-purple-200">
        <Icon className="h-4 w-4" />
      </div>

      <p className="text-xs text-white/38">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-white">
        {value}
      </p>
    </div>
  );
}

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[-16rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-purple-700/25 blur-[120px]" />
      <div className="absolute right-[-14rem] top-[14rem] h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/10 blur-[110px]" />
      <div className="absolute bottom-[-12rem] left-[-12rem] h-[26rem] w-[26rem] rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:28px_28px] opacity-20" />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,5,11,0.05),#05050b_88%)]" />
    </div>
  );
}