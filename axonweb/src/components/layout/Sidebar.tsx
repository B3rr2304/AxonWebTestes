import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Brain,
  CalendarDays,
  Focus,
  Home,
  LogOut,
  MessageCircle,
  Moon,
  Settings,
  Sparkles,
  User,
  X,
  Zap,
} from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  chronotypeLabel?: string;
  energyPeak?: string;
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
    path: "/result",
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
  chronotypeLabel = "Perfil Intermediário",
  energyPeak = "Entre 9h e 15h",
}: SidebarProps) {
  const navigate = useNavigate();

  function goTo(path: string) {
    navigate(path);
    onClose();
  }

  return (
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
              <header className="mb-5 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200 shadow-lg shadow-purple-950/30">
                    <Brain className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">Axon</p>
                    <p className="text-xs text-white/40">Personal OS</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-white/55 active:scale-[0.96]"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              <section className="mb-5 rounded-[1.6rem] border border-purple-300/20 bg-purple-500/10 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-200" />
                  <p className="text-xs font-semibold text-purple-100">
                    Contexto ativo
                  </p>
                </div>

                <p className="text-sm font-semibold text-white">
                  {chronotypeLabel}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <Zap className="mb-2 h-4 w-4 text-purple-200" />
                    <p className="text-[0.68rem] text-white/35">Pico</p>
                    <p className="mt-1 text-xs font-medium leading-4 text-white/70">
                      {energyPeak}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <Moon className="mb-2 h-4 w-4 text-purple-200" />
                    <p className="text-[0.68rem] text-white/35">Ritmo</p>
                    <p className="mt-1 text-xs font-medium leading-4 text-white/70">
                      Personalizado
                    </p>
                  </div>
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
                        className="flex w-full items-center gap-3 rounded-[1.35rem] px-3 py-3 text-left transition active:scale-[0.98] hover:bg-white/[0.055]"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/45">
                          <Icon className="h-4 w-4" />
                        </div>

                        <p className="text-sm font-semibold text-white/72">
                          {item.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <footer className="mt-4">
                <button
                  onClick={() => goTo("/")}
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
  );
}