import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  Focus,
  Home,
  LogOut,
  MessageCircle,
  Settings,
  Sparkles,
  User,
  X,
} from "lucide-react";

import * as api from "../../lib/api";
import type { ProfileData } from "../../lib/api";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  chronotypeLabel?: string;
  energyPeak?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
};

const mainItems = [
  {
    label: "Dashboard",
    description: "Resumo inteligente do dia",
    icon: Home,
    path: "/dashboard",
  },
  {
    label: "Chat",
    description: "Converse com o Axon",
    icon: MessageCircle,
    path: "/chat",
  },
  {
    label: "Planejamento",
    description: "Rotina, tarefas e agenda",
    icon: CalendarDays,
    path: "/planning",
  },
  {
    label: "Insights",
    description: "Padrões e produtividade",
    icon: BarChart3,
    path: "/insights",
  },
  {
    label: "Focus",
    description: "Execução profunda",
    icon: Focus,
    path: "/focus",
  },
];

const secondaryItems = [
  {
    label: "Perfil",
    icon: User,
    path: "/profile",
  },
  {
    label: "Configurações",
    icon: Settings,
    path: "/settings",
  },
];

export default function Sidebar({
  isOpen,
  onClose,
  chronotypeLabel,
  userName,
  userEmail,
  userAvatar,
}: SidebarProps) {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && api.isLoggedIn() && !profile) {
      api.getProfile().then(setProfile).catch(() => {});
    }
  }, [isOpen, profile]);

  const displayName = profile?.name || userName || "Usuário";
  const displayEmail = profile?.email || userEmail || "";
  const displayChronotype =
    profile?.chronotype_label || chronotypeLabel || "Cronotipo não definido";

  const chronotypeDescription = getChronotypeDescription(displayChronotype);

  const displayInitial = useMemo(() => {
    return displayName.trim().charAt(0).toUpperCase() || "A";
  }, [displayName]);

  function goTo(path: string) {
    navigate(path);
    onClose();
  }

  function handleLogout() {
    setShowLogoutConfirm(true);
  }

  function confirmLogout() {
    api.logout();
    setShowLogoutConfirm(false);
    onClose();
    navigate("/");
  }

  function cancelLogout() {
    setShowLogoutConfirm(false);
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Fechar menu"
              onClick={onClose}
              className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.aside
              initial={{ x: "105%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "105%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="fixed bottom-3 right-3 top-3 z-[90] w-[84vw] max-w-[340px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#11101a]/72 shadow-2xl shadow-black/50 backdrop-blur-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/14 via-transparent to-fuchsia-400/8" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:28px_28px] opacity-20" />

              <div className="relative flex h-full flex-col p-4">
                <header className="mb-5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => goTo("/profile")}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left active:scale-[0.98]"
                  >
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-purple-300/25 bg-purple-500/15 text-sm font-semibold text-purple-100 shadow-lg shadow-purple-950/30">
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{displayInitial}</span>
                      )}

                      <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-[#181020] bg-emerald-400" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {displayName}
                      </p>

                      {displayEmail && (
                        <p className="mt-1 truncate text-xs text-white/40">
                          {displayEmail}
                        </p>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={onClose}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-white/55 active:scale-[0.96]"
                    aria-label="Fechar menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </header>

                <section className="mb-5 overflow-hidden rounded-[1.6rem] border border-purple-300/20 bg-purple-500/10 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-purple-200" />

                    <p className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-purple-100/80">
                      Contexto ativo
                    </p>
                  </div>

                  <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-white/28">
                      Cronotipo
                    </p>

                    <p className="mt-2 text-base font-semibold text-white">
                      {displayChronotype}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/38">
                      {chronotypeDescription}
                    </p>
                  </div>
                </section>

                <section className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <p className="mb-2 px-2 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white/28">
                    Navegação
                  </p>

                  <div className="space-y-2">
                    {mainItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.label}
                          onClick={() => goTo(item.path)}
                          className="group flex w-full items-center gap-3 rounded-[1.35rem] border border-white/0 px-3 py-3 text-left transition active:scale-[0.98] hover:border-white/10 hover:bg-white/[0.055]"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/45 group-hover:border-purple-300/20 group-hover:bg-purple-500/10 group-hover:text-purple-200">
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white/82">
                              {item.label}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-white/32">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="my-4 h-px bg-white/10" />

                  <p className="mb-2 px-2 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white/28">
                    Conta
                  </p>

                  <div className="space-y-2">
                    {secondaryItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.label}
                          onClick={() => goTo(item.path)}
                          className="group flex w-full items-center gap-3 rounded-[1.35rem] border border-white/0 px-3 py-3 text-left transition active:scale-[0.98] hover:border-white/10 hover:bg-white/[0.055]"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/45 group-hover:border-purple-300/20 group-hover:bg-purple-500/10 group-hover:text-purple-200">
                            <Icon className="h-4 w-4" />
                          </div>

                          <p className="text-sm font-semibold text-white/82">
                            {item.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <footer className="mt-4">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-[1.35rem] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-white/45 active:scale-[0.98]"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </footer>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full max-w-[360px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#15141f]/95 p-5 text-center shadow-2xl shadow-black/50 backdrop-blur-2xl"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-300/20 bg-red-500/10 text-red-200">
                <LogOut className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-semibold tracking-[-0.035em] text-white">
                Deseja sair da sua conta?
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/45">
                Você será desconectado do Axon e precisará fazer login
                novamente para acessar seu ambiente.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={cancelLogout}
                  className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-semibold text-white/60 active:scale-[0.98]"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={confirmLogout}
                  className="min-h-12 rounded-2xl bg-red-500/90 px-4 text-sm font-semibold text-white shadow-lg shadow-red-950/30 active:scale-[0.98]"
                >
                  Sair
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function getChronotypeDescription(chronotypeLabel: string) {
  const normalized = chronotypeLabel.toLowerCase();

  if (normalized.includes("bimodal")) {
    return "Ritmo com dois picos de energia";
  }

  if (normalized.includes("matutino")) {
    return "Maior clareza nas primeiras horas do dia";
  }

  if (normalized.includes("vespertino")) {
    return "Melhor desempenho na parte final do dia";
  }

  if (normalized.includes("noturno")) {
    return "Energia mais ativa durante a noite";
  }

  if (normalized.includes("misto") || normalized.includes("intermediário")) {
    return "Ritmo flexível ao longo do dia";
  }

  return "Seu padrão atual de produtividade";
}