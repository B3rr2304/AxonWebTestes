import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronRight,
  Download,
  Link2,
  LogOut,
  Menu,
  Moon,
  Palette,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  Trash2,
  AlertTriangle,
  Mail,
  Tag,
} from "lucide-react";

import { results, type ChronotypeResultKey } from "../data/results";
import Sidebar from "../components/layout/Sidebar";
import TagEditorSheet from "../components/settings/TagEditorSheet";
import NotificationSettingsSheet from "../components/settings/NotificationSettingsSheet";
import * as api from "../lib/api";

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
  const [tagEditorOpen, setTagEditorOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showDeleteFirstModal, setShowDeleteFirstModal] = useState(false);
  const [showDeleteFinalModal, setShowDeleteFinalModal] = useState(false);

  const [silentMode, setSilentMode] = useState(true);
  const [notifSettingsOpen, setNotifSettingsOpen] = useState(false);

  useEffect(() => {
    api.getProfile().then((p) => {
      setUserName(p.name || "Usuário");
      setUserEmail(p.email);
    }).catch(() => {});
  }, []);

  const resultKey = useMemo<ChronotypeResultKey>(() => {
    const stored = localStorage.getItem("axon_chronotype");

    if (stored && validKeys.includes(stored as ChronotypeResultKey)) {
      return stored as ChronotypeResultKey;
    }

    return "Misto";
  }, []);

  const result = results[resultKey];

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
              <img src="/axon-logo.svg" alt="Axon" className="h-8 w-8 object-contain" />
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

        <Section title="Experiência">
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

        <Section title="Análise diária">
          <SettingItem
            icon={Tag}
            title="Tags personalizadas"
            description="Edite as tags que aparecem ao registrar seu dia."
            onClick={() => setTagEditorOpen(true)}
          />
        </Section>

        <Section title="Notificações">
          <SettingItem
            icon={Bell}
            title="Notificações"
            description="Configure lembretes de planejamento diário e semanal."
            value="Configurar"
            onClick={() => setNotifSettingsOpen(true)}
          />

          <ToggleItem
            icon={Moon}
            title="Modo silencioso automático"
            description="Diminui alertas durante foco ou descanso."
            enabled={silentMode}
            onToggle={() => setSilentMode((prev) => !prev)}
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

          <SettingItem
            icon={Trash2}
            title="Excluir conta"
            description="Excluir permanentemente sua conta e seus dados do Axon."
            danger
            onClick={() => setShowDeleteFirstModal(true)}
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
          api.logout();
          setShowLogoutModal(false);
          navigate("/");
        }}
      />

      <DeleteAccountFirstModal
        isOpen={showDeleteFirstModal}
        onClose={() => setShowDeleteFirstModal(false)}
        onConfirm={() => {
          setShowDeleteFirstModal(false);
          setShowDeleteFinalModal(true);
        }}
      />

      <DeleteAccountFinalModal
        isOpen={showDeleteFinalModal}
        email={userEmail}
        onClose={() => setShowDeleteFinalModal(false)}
        onConfirm={async () => {
          try {
            await api.deleteAccount();
            api.logout();
            setShowDeleteFinalModal(false);
            navigate("/");
          } catch (error) {
            console.error("Erro ao excluir conta:", error);
          }
        }}
      />

      <TagEditorSheet
        isOpen={tagEditorOpen}
        onClose={() => setTagEditorOpen(false)}
      />

      <NotificationSettingsSheet
        isOpen={notifSettingsOpen}
        onClose={() => setNotifSettingsOpen(false)}
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
  return (
    <AnimatePresence>
      {isOpen && (
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
              Você será desconectado do Axon e precisará fazer login novamente
              para acessar seu ambiente.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-semibold text-white/60 active:scale-[0.98]"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={onConfirm}
                className="min-h-12 rounded-2xl bg-red-500/90 px-4 text-sm font-semibold text-white shadow-lg shadow-red-950/30 active:scale-[0.98]"
              >
                Sair
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DeleteAccountFirstModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
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
              <Trash2 className="h-6 w-6" />
            </div>

            <h2 className="text-xl font-semibold tracking-[-0.035em] text-white">
              Excluir sua conta?
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/45">
              Essa ação é permanente e removerá seu acesso ao Axon.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-semibold text-white/60 active:scale-[0.98]"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={onConfirm}
                className="min-h-12 rounded-2xl bg-red-500/90 px-4 text-sm font-semibold text-white shadow-lg shadow-red-950/30 active:scale-[0.98]"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DeleteAccountFinalModal({
  isOpen,
  email,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-full max-w-[380px] overflow-hidden rounded-[2rem] border border-red-300/15 bg-[#15141f]/95 p-5 text-center shadow-2xl shadow-black/50 backdrop-blur-2xl"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-300/20 bg-red-500/10 text-red-200">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h2 className="text-xl font-semibold tracking-[-0.035em] text-white">
              Confirmação final
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/45">
              O e-mail abaixo não poderá ser usado para criar outra conta no Axon
              pelos próximos <span className="font-semibold text-white">60 dias</span>.
            </p>

            <div className="mt-5 flex items-center gap-3 rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-3 text-left">
              <Mail className="h-4 w-4 shrink-0 text-red-200" />
              <p className="min-w-0 truncate text-sm font-semibold text-white/75">
                {email || "E-mail da conta"}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-semibold text-white/60 active:scale-[0.98]"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={onConfirm}
                className="min-h-12 rounded-2xl bg-red-500/90 px-4 text-sm font-semibold text-white shadow-lg shadow-red-950/30 active:scale-[0.98]"
              >
                Sim, excluir
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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