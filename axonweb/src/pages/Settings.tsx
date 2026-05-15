import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Brain,
  CalendarDays,
  ChevronRight,
  Download,
  Link2,
  Lock,
  LogOut,
  Mail,
  Menu,
  Moon,
  Palette,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  User,
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
  danger?: boolean;
};

type ToggleItemProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
};

const validKeys: ChronotypeResultKey[] = [
  "Matutino",
  "Vespertino",
  "Noturno",
  "Misto",
  "Bimodal",
];

export default function Settings() {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [smartNotifications, setSmartNotifications] = useState(true);
  const [focusReminders, setFocusReminders] = useState(true);
  const [weeklyInsights, setWeeklyInsights] = useState(false);
  const [silentMode, setSilentMode] = useState(true);

  const resultKey = useMemo<ChronotypeResultKey>(() => {
    const stored = localStorage.getItem("axon_chronotype");

    if (stored && validKeys.includes(stored as ChronotypeResultKey)) {
      return stored as ChronotypeResultKey;
    }

    return "Misto";
  }, []);

  const result = results[resultKey];

  const userName = "Bernardo";
  const userEmail = "bernardo@axon.app";

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
              <p className="text-sm font-semibold text-white">Configurações</p>
              <p className="text-xs text-white/40">Conta e preferências</p>
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
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                <SettingsIcon className="h-3.5 w-3.5" />
                Central do app
              </div>

              <h1 className="text-[1.95rem] font-semibold leading-[1.03] tracking-[-0.055em] text-white">
                Ajuste o Axon sem poluir sua rotina.
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/50">
                Gerencie conta, notificações, aparência, privacidade e
                integrações em um só lugar.
              </p>
            </div>
          </div>
        </section>

        <Section title="Conta">
          <SettingItem
            icon={User}
            title="Perfil"
            description="Nome, foto, e-mail e perfil produtivo."
            value={userName}
            onClick={() => navigate("/profile")}
          />

          <SettingItem
            icon={Mail}
            title="E-mail"
            description="E-mail usado para acessar sua conta."
            value={userEmail}
          />

          <SettingItem
            icon={Lock}
            title="Senha e segurança"
            description="Altere sua senha e proteja o acesso."
            value="Protegido"
          />
        </Section>

        <Section title="Experiência">
          <SettingItem
            icon={Sparkles}
            title="Tom do Axon"
            description="Como o assistente deve conversar com você."
            value="Direto e estratégico"
          />

          <SettingItem
            icon={CalendarDays}
            title="Planejamento"
            description="Forma como o Axon organiza sua rotina."
            value="Flexível"
          />

          <SettingItem
            icon={Moon}
            title="Modo Focus"
            description="Reduz estímulos visuais durante blocos de foco."
            value={silentMode ? "Silencioso" : "Padrão"}
          />

          <SettingItem
            icon={Palette}
            title="Aparência"
            description="Tema visual da interface."
            value="Escuro premium"
          />
        </Section>

        <Section title="Notificações">
          <ToggleItem
            icon={Bell}
            title="Notificações inteligentes"
            description="Lembretes com base na sua rotina."
            enabled={smartNotifications}
            onToggle={() => setSmartNotifications((prev) => !prev)}
          />

          <ToggleItem
            icon={Moon}
            title="Modo silencioso automático"
            description="Diminui alertas durante foco ou descanso."
            enabled={silentMode}
            onToggle={() => setSilentMode((prev) => !prev)}
          />

          <ToggleItem
            icon={Sparkles}
            title="Resumo semanal"
            description="Receba um panorama dos seus padrões."
            enabled={weeklyInsights}
            onToggle={() => setWeeklyInsights((prev) => !prev)}
          />

          <ToggleItem
            icon={Bell}
            title="Lembretes de foco"
            description="Avisos antes dos blocos importantes."
            enabled={focusReminders}
            onToggle={() => setFocusReminders((prev) => !prev)}
          />
        </Section>

        <Section title="Dados e integrações">
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

          <SettingItem
            icon={Download}
            title="Exportar dados"
            description="Baixe suas conversas, rotinas e preferências."
            value="Em breve"
          />
        </Section>

        <Section title="Sistema">
          <SettingItem
            icon={SettingsIcon}
            title="Versão"
            description="Versão atual do Axon Web."
            value="MVP 0.1"
          />

          <SettingItem
            icon={LogOut}
            title="Sair da conta"
            description="Encerrar sua sessão neste dispositivo."
            danger
            onClick={() => setShowLogoutModal(true)}
          />
        </Section>

        <p className="pt-1 text-center text-xs leading-5 text-white/28">
          Axon Web · versão inicial de desenvolvimento
        </p>
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
  danger = false,
}: SettingItemProps) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-[1.7rem] border p-4 text-left shadow-xl shadow-black/20 backdrop-blur-2xl active:scale-[0.99] ${
        danger
          ? "border-red-300/15 bg-red-500/10"
          : "border-white/10 bg-[#1b1b27]/76"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
          danger
            ? "border-red-300/20 bg-red-500/10 text-red-100"
            : "border-purple-300/15 bg-purple-500/10 text-purple-200"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold ${
            danger ? "text-red-100" : "text-white"
          }`}
        >
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-white/38">{description}</p>

        {value && (
          <p
            className={`mt-2 truncate text-xs font-medium ${
              danger ? "text-red-100/70" : "text-purple-100"
            }`}
          >
            {value}
          </p>
        )}
      </div>

      {onClick && (
        <ChevronRight
          className={`h-5 w-5 shrink-0 ${
            danger ? "text-red-100/35" : "text-white/24"
          }`}
        />
      )}
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
      className="flex w-full items-center gap-3 rounded-[1.7rem] border border-white/10 bg-[#1b1b27]/76 p-4 text-left shadow-xl shadow-black/20 backdrop-blur-2xl active:scale-[0.99]"
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
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm">
      <div className="relative w-full max-w-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#171720]/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.16),transparent_48%)]" />

        <div className="relative">
          <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-white/18" />

          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-300/15 bg-red-500/10 text-red-100">
              <LogOut className="h-5 w-5" />
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/45 active:scale-[0.96]"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <h2 className="text-[1.65rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
            Tem certeza que deseja sair?
          </h2>

          <p className="mt-3 text-sm leading-6 text-white/48">
            Você será redirecionado para a página inicial e precisará entrar
            novamente para acessar seu Axon.
          </p>

          <button
            onClick={onConfirm}
            className="mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-red-500 px-6 text-sm font-semibold text-white shadow-xl shadow-red-950/30 active:scale-[0.98]"
          >
            Sim, sair da conta
            <LogOut className="ml-2 h-4 w-4" />
          </button>

          <button
            onClick={onClose}
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-6 text-sm font-semibold text-white/55 active:scale-[0.98]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
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