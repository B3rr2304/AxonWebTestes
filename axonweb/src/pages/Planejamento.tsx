import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Menu, Repeat, Target } from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import { results, type ChronotypeResultKey } from "../data/results";
import Planning from "./Planning";
import Rotinas from "./Rotinas";
import Objetivos from "./Objetivos";

type View = "agenda" | "rotinas" | "objetivos";

const validKeys: ChronotypeResultKey[] = [
  "Matutino",
  "Vespertino",
  "Noturno",
  "Misto",
  "Bimodal",
];

const TABS: { key: View; label: string; icon: typeof CalendarDays }[] = [
  { key: "agenda", label: "Agenda", icon: CalendarDays },
  { key: "rotinas", label: "Rotinas", icon: Repeat },
  { key: "objetivos", label: "Objetivos", icon: Target },
];

export default function Planejamento({
  initialView = "agenda",
}: {
  initialView?: View;
}) {
  const navigate = useNavigate();
  const [view, setView] = useState<View>(initialView);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const resultKey: ChronotypeResultKey = (() => {
    const s = localStorage.getItem("axon_chronotype");
    return s && validKeys.includes(s as ChronotypeResultKey)
      ? (s as ChronotypeResultKey)
      : "Misto";
  })();
  const result = results[resultKey];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05050b] text-white">
      <Background />

      <div className="relative z-10 min-h-screen px-4 pb-6 pt-5">
        <header className="mb-5 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 text-left active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200 shadow-lg shadow-purple-950/30">
              <img src="/axon-logo.svg" alt="Axon" className="h-8 w-8 object-contain" />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Planejamento</p>
              <p className="text-xs text-white/40">Agenda, rotinas e objetivos</p>
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

        {/* Seletor de visão */}
        <div className="mb-5 flex rounded-2xl border border-white/10 bg-black/20 p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = view === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setView(tab.key)}
                className={`flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                  active
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-950/25"
                    : "text-white/42"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Conteúdo da visão ativa (sem moldura própria) */}
        {view === "agenda" && <Planning embedded />}
        {view === "rotinas" && <Rotinas embedded />}
        {view === "objetivos" && <Objetivos embedded />}
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chronotypeLabel={result.label}
        energyPeak={result.energyPeak}
      />
    </main>
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
