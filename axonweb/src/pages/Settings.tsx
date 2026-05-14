import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Brain,
  CalendarDays,
  ChevronRight,
  Clock3,
  Link2,
  Lock,
  LogOut,
  Mail,
  Menu,
  Moon,
  Palette,
  RefreshCcw,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  User,
  Zap,
  X,
} from "lucide-react";

import { results, type ChronotypeResultKey } from "../data/results";
import Sidebar from "../components/layout/Sidebar";

type SettingItemProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  value?: string;
  onClick?: () => void;
};

type ToggleItemProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
};

const validKeys: ChronotypeResultKey[] = [
  "morning",
  "intermediate",
  "evening",
  "night",
];

export default function Settings() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [smartNotifications, setSmartNotifications] = useState(true);
  const [focusReminders, setFocusReminders] = useState(true);
  const [weeklyInsights, setWeeklyInsights] = useState(false);

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
              <p className="text-sm font-semibold text-white">Configurações</p>
              <p className="text-xs text-white/40">Preferências do Axon</p>
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
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                <SettingsIcon className="h-3.5 w-3.5" />
                Central de controle
              </div>

              <h1 className="text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-white">
                Ajuste o Axon ao seu jeito de funcionar.
              </h1>

              <p className="mt-4 text-sm leading-6 text-white/50">
                Configure sua rotina, notificações, preferências de foco e o
                modo como o Axon deve acompanhar seu dia.
              </p>

              <div className="mt-6 flex items-center gap-3 rounded-[1.5rem] border border-purple-300/20 bg-purple-500/10 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-100">
                  <User className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {userName}
                  </p>
                  <p className="mt-1 truncate text-xs text-white/38">
                    {userEmail}
                  </p>
                </div>

                <button
                  onClick={() => navigate("/profile")}
                  className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-semibold text-white/55 active:scale-[0.98]"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        </section>

        <Section title="Conta">
          <SettingItem
            icon={User}
            title="Perfil"
            description="Nome, foto, e-mail e dados pessoais."
            value={userName}
            onClick={() => navigate("/profile")}
          />

          <SettingItem
            icon={Mail}
            title="E-mail"
            description="Gerencie seu e-mail de acesso."
            value={userEmail}
          />

          <SettingItem
            icon={Lock}
            title="Senha e segurança"
            description="Altere sua senha e proteja sua conta."
            value="Protegido"
          />
        </Section>

        <Section title="Rotina e personalização">
          <SettingItem
            icon={Brain}
            title="Cronotipo"
            description="Perfil usado para adaptar sua rotina."
            value={result.label}
            onClick={() => navigate("/profile")}
          />

          <SettingItem
            icon={Zap}
            title="Pico de energia"
            description="Janela usada para sugerir tarefas importantes."
            value={result.energyPeak}
          />

          <SettingItem
            icon={Clock3}
            title="Janela de foco"
            description="Melhor período para atividades profundas."
            value={result.focusWindow}
          />

          <SettingItem
            icon={RefreshCcw}
            title="Refazer questionário"
            description="Atualize seu perfil cronobiológico inicial."
            onClick={() => navigate("/questionnaire-intro")}
          />
        </Section>

        <Section title="Experiência do Axon">
          <SettingItem
            icon={Sparkles}
            title="Tom do assistente"
            description="Como o Axon deve conversar com você."
            value="Direto e estratégico"
          />

          <SettingItem
            icon={CalendarDays}
            title="Estilo de planejamento"
            description="Como o Axon deve organizar seu dia."
            value="Flexível"
          />

          <SettingItem
            icon={Palette}
            title="Aparência"
            description="Tema visual da interface."
            value="Escuro premium"
          />

          <SettingItem
            icon={Moon}
            title="Modo silencioso"
            description="Reduza estímulos visuais durante foco."
            value="Automático"
          />
        </Section>

        <Section title="Notificações">
          <ToggleItem
            icon={Bell}
            title="Notificações inteligentes"
            description="Receba lembretes com base na sua rotina."
            enabled={smartNotifications}
            onToggle={() => setSmartNotifications((prev) => !prev)}
          />

          <ToggleItem
            icon={Zap}
            title="Lembretes de foco"
            description="Avisos antes das melhores janelas de energia."
            enabled={focusReminders}
            onToggle={() => setFocusReminders((prev) => !prev)}
          />

          <ToggleItem
            icon={Sparkles}
            title="Resumo semanal"
            description="Receba insights sobre seus padrões da semana."
            enabled={weeklyInsights}
            onToggle={() => setWeeklyInsights((prev) => !prev)}
          />
        </Section>

        <Section title="Integrações e dados">
          <SettingItem
            icon={Link2}
            title="Integrações"
            description="Conecte calendário, tarefas e ferramentas externas."
            value="Em breve"
          />

          <SettingItem
            icon={Shield}
            title="Privacidade"
            description="Controle dados usados para personalização."
            value="Gerenciar"
          />
        </Section>

        <section className="space-y-3">
            <button
                onClick={() => setShowLogoutModal(true)}
                className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-red-300/15 bg-red-500/10 px-6 text-sm font-semibold text-red-100 shadow-xl shadow-black/20 active:scale-[0.98]"
                >
                Sair da conta
                <LogOut className="ml-2 h-4 w-4" />
            </button>

          <p className="text-center text-xs leading-5 text-white/28">
            Axon Web · versão inicial de desenvolvimento
          </p>
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

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
            setShowLogoutModal(false);
            navigate("/");
        }}
      />
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5">
      <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/28">
        {title}
      </p>

      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SettingItem({
  icon: Icon,
  title,
  description,
  value,
  onClick,
}: SettingItemProps) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-4 text-left shadow-xl shadow-black/20 backdrop-blur-2xl active:scale-[0.99]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-500/10 text-purple-200">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-xs leading-5 text-white/38">{description}</p>

        {value && (
          <p className="mt-2 truncate text-xs font-medium text-purple-100">
            {value}
          </p>
        )}
      </div>

      {onClick && <ChevronRight className="h-5 w-5 shrink-0 text-white/28" />}
    </Wrapper>
  );
}

function ToggleItem({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
}: ToggleItemProps) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-3 rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-4 text-left shadow-xl shadow-black/20 backdrop-blur-2xl active:scale-[0.99]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-500/10 text-purple-200">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-xs leading-5 text-white/38">{description}</p>
      </div>

      <div
        className={`flex h-7 w-12 shrink-0 items-center rounded-full border p-1 transition ${
          enabled
            ? "justify-end border-purple-300/25 bg-purple-500/30"
            : "justify-start border-white/10 bg-white/10"
        }`}
      >
        <div
          className={`h-5 w-5 rounded-full transition ${
            enabled ? "bg-purple-100" : "bg-white/35"
          }`}
        />
      </div>
    </button>
  );
}

function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 px-4 pb-5 backdrop-blur-sm">
      <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#11101a]/90 p-5 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-purple-500/10" />

        <div className="relative">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-300/15 bg-red-500/10 text-red-100">
              <LogOut className="h-5 w-5" />
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-white/45 active:scale-[0.96]"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <h2 className="text-[1.7rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
            Tem certeza que deseja sair?
          </h2>

          <p className="mt-3 text-sm leading-6 text-white/48">
            Você será redirecionado para a página inicial e precisará entrar
            novamente para acessar seu Axon.
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={onConfirm}
              className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-red-500/90 px-6 text-sm font-semibold text-white shadow-xl shadow-red-950/30 active:scale-[0.98]"
            >
              Sim, sair da conta
              <LogOut className="ml-2 h-4 w-4" />
            </button>

            <button
              onClick={onClose}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] px-6 text-sm font-semibold text-white/60 backdrop-blur-2xl active:scale-[0.98]"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
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

