import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  ChevronRight,
  Edit3,
  Mail,
  Menu,
  RefreshCcw,
  Settings,
  Sparkles,
  User,
  Workflow,
} from "lucide-react";

import { results, type ChronotypeResultKey } from "../data/results";
import Sidebar from "../components/layout/Sidebar";
import * as api from "../lib/api";
import type { ProfileData } from "../lib/api";

// Cronotipo vindo do backend (pt ou en legado) -> chave dos resultados locais
const CHRONOTYPE_TO_KEY: Record<string, ChronotypeResultKey> = {
  Matutino: "Matutino",
  Vespertino: "Vespertino",
  Noturno: "Noturno",
  Misto: "Misto",
  Bimodal: "Bimodal",
  morning: "Matutino",
  evening: "Vespertino",
  night: "Noturno",
  intermediate: "Misto",
};

const validKeys: ChronotypeResultKey[] = [
  "Matutino",
  "Vespertino",
  "Noturno",
  "Misto",
  "Bimodal",
];

const profileDetails = [
  {
    label: "Estilo de rotina",
    value: "Flexível",
  },
  {
    label: "Modo de trabalho",
    value: "Blocos de foco",
  },
  {
    label: "Tom do Axon",
    value: "Direto e estratégico",
  },
];

export default function Profile() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (!api.isLoggedIn()) {
      navigate("/login");
      return;
    }

    api
      .getProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [navigate]);

  const resultKey = useMemo<ChronotypeResultKey>(() => {
    // Fonte da verdade: cronotipo do banco (conta logada).
    const fromBackend = profile?.chronotype
      ? CHRONOTYPE_TO_KEY[profile.chronotype]
      : undefined;
    if (fromBackend) return fromBackend;

    // Fallback legado: cache do navegador.
    const stored = localStorage.getItem("axon_chronotype");
    if (stored && validKeys.includes(stored as ChronotypeResultKey)) {
      return stored as ChronotypeResultKey;
    }

    return "Misto";
  }, [profile]);

  const result = results[resultKey];
  const hasChronotype = Boolean(profile?.chronotype);

  const userName = profile?.name || "Usuário";
  const userEmail = profile?.email || "";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#11111a] text-white">
      <Background />

      <div className="relative z-10 min-h-screen px-4 pb-6 pt-5">
        <header className="mb-5 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 text-left active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200 shadow-lg shadow-purple-950/30">
              <Brain className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Perfil</p>
              <p className="text-xs text-white/40">Identidade e preferências</p>
            </div>
          </button>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/65 backdrop-blur-2xl active:scale-[0.96]"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <section className="mb-4">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#1b1b27]/82 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.24),transparent_48%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_40%)]" />

            <div className="relative">
              <div className="mb-5 flex items-center gap-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.7rem] border border-purple-300/25 bg-purple-500/15 text-purple-100 shadow-xl shadow-purple-950/30">
                  <User className="h-9 w-9" />
                  <span className="absolute bottom-2 right-2 h-3.5 w-3.5 rounded-full border-2 border-[#201527] bg-emerald-400" />
                </div>

                <div className="min-w-0 flex-1">
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

              <button className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-sm font-semibold text-white/62 backdrop-blur-2xl active:scale-[0.98]">
                Editar perfil
                <Edit3 className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-[2rem] border border-purple-300/20 bg-purple-500/10 p-4 shadow-xl shadow-purple-950/20 backdrop-blur-2xl">
          <div className="mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-200" />
            <p className="text-sm font-semibold text-purple-100">
              Perfil produtivo
            </p>
          </div>

          <h2 className="text-[1.75rem] font-semibold leading-[1.05] tracking-[-0.055em] text-white">
            {hasChronotype ? result.label : "Cronotipo não definido"}
          </h2>

          <p className="mt-3 text-sm leading-6 text-white/55">
            {hasChronotype
              ? result.subtitle
              : "Você ainda não respondeu o questionário nesta conta. Responda para o Axon conhecer seu ritmo."}
          </p>

          <button
            onClick={() => navigate("/result")}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/10 px-5 text-sm font-semibold text-purple-100 active:scale-[0.98]"
          >
            Ver resultado completo
            <ChevronRight className="ml-2 h-4 w-4" />
          </button>
        </section>

        <section className="mb-4 rounded-[2rem] border border-white/10 bg-[#1b1b27]/76 p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
          <div className="mb-4 flex items-center gap-2">
            <Workflow className="h-4 w-4 text-purple-200" />
            <p className="text-sm font-semibold text-white">
              Preferências principais
            </p>
          </div>

          <div className="space-y-3">
            {profileDetails.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-3"
              >
                <p className="text-xs text-white/38">{item.label}</p>
                <p className="text-xs font-semibold text-white/70">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
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
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-6 text-sm font-semibold text-white/58 backdrop-blur-2xl active:scale-[0.98]"
          >
            Configurações da conta
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

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#151520_0%,#101018_48%,#13131d_100%)]" />

      <div className="absolute left-1/2 top-[-14rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-purple-700/22 blur-[120px]" />
      <div className="absolute right-[-12rem] top-[18rem] h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/10 blur-[110px]" />
      <div className="absolute bottom-[-12rem] left-[-12rem] h-[26rem] w-[26rem] rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:30px_30px] opacity-[0.12]" />
    </div>
  );
}