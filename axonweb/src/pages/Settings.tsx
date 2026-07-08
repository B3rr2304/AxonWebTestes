import { useEffect, useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronRight,
  Download,
  Link2,
  LogOut,
  Mail,
  Moon,
  Palette,
  Settings as SettingsIcon,
  Shield,
  Tag,
  Trash2,
} from "lucide-react";

import { results, type ChronotypeResultKey } from "../data/results";
import Sidebar from "../components/layout/Sidebar";
import TagEditorSheet from "../components/settings/TagEditorSheet";
import NotificationSettingsSheet from "../components/settings/NotificationSettingsSheet";
import * as api from "../lib/api";
import { AppBackground } from "../components/layout/AppBackground";
import PageHeader from "../components/layout/PageHeader";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { ThemeToggle } from "../components/theme/ThemeToggle";

// ===========================================================================
// TIPOS DA TELA
// ===========================================================================

type SettingItemProps = {
  icon: ElementType;
  title: string;
  description: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
};

type ToggleItemProps = {
  icon: ElementType;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
};

// ===========================================================================
// CRONOTIPO USADO NA SIDEBAR
// ===========================================================================
// A tela de configurações usa o cronotipo apenas para contextualizar a sidebar.
const validKeys: ChronotypeResultKey[] = [
  "Matutino",
  "Vespertino",
  "Noturno",
  "Misto",
  "Bimodal",
];

// ===========================================================================
// PÁGINA DE CONFIGURAÇÕES
// ===========================================================================

export default function Settings() {
  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // Estados gerais da tela
  // ---------------------------------------------------------------------------
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tagEditorOpen, setTagEditorOpen] = useState(false);
  const [notifSettingsOpen, setNotifSettingsOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Dados básicos da conta
  // ---------------------------------------------------------------------------
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // ---------------------------------------------------------------------------
  // Modais de ações sensíveis
  // ---------------------------------------------------------------------------
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteFirstModal, setShowDeleteFirstModal] = useState(false);
  const [showDeleteFinalModal, setShowDeleteFinalModal] = useState(false);

  // ---------------------------------------------------------------------------
  // Preferências visuais/locais
  // ---------------------------------------------------------------------------
  const [silentMode, setSilentMode] = useState(true);

  // ---------------------------------------------------------------------------
  // Carregamento do perfil
  // ---------------------------------------------------------------------------
  // Alimenta a sidebar e a confirmação de exclusão com dados atuais da conta.
  useEffect(() => {
    api
      .getProfile()
      .then((profile) => {
        setUserName(profile.name || "Usuário");
        setUserEmail(profile.email);
      })
      .catch(() => {});
  }, []);

  // ---------------------------------------------------------------------------
  // Dados derivados para sidebar
  // ---------------------------------------------------------------------------
  // Usa o cronotipo salvo localmente para manter a sidebar consistente.
  const resultKey = useMemo<ChronotypeResultKey>(() => {
    const stored = localStorage.getItem("axon_chronotype");

    if (stored && validKeys.includes(stored as ChronotypeResultKey)) {
      return stored as ChronotypeResultKey;
    }

    return "Misto";
  }, []);

  const result = results[resultKey];

  // ---------------------------------------------------------------------------
  // Ações de conta
  // ---------------------------------------------------------------------------
  function handleLogout() {
    api.logout();
    setShowLogoutModal(false);
    navigate("/");
  }

  async function handleDeleteAccount() {
    try {
      await api.deleteAccount();
      api.logout();
      setShowDeleteFinalModal(false);
      navigate("/");
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-app text-primary">
      <AppBackground />

      <div className="relative z-10 min-h-screen px-4 pb-6 pt-5">
        {/* Header: volta ao Dashboard e abre o menu lateral global. */}
        <PageHeader
          title="Configurações"
          subtitle="Conta e preferências"
          onBack={() => navigate("/dashboard")}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Hero: explica o objetivo da central de configurações. */}
        <section className="mb-4">
          <div className="relative overflow-hidden rounded-[2rem] border border-soft bg-surface-elevated p-5 text-primary shadow-soft backdrop-blur-2xl">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at top right, var(--accent-soft), transparent 48%)",
              }}
            />

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_40%)] opacity-60 dark:opacity-30" />

            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-soft bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
                <SettingsIcon className="h-3.5 w-3.5" />
                Central do app
              </div>

              <h1 className="text-[1.95rem] font-semibold leading-[1.03] tracking-[-0.055em] text-primary">
                Ajuste o Axon sem poluir sua rotina.
              </h1>

              <p className="mt-3 text-sm leading-6 text-muted">
                Gerencie conta, notificações, aparência, privacidade e
                integrações em um só lugar.
              </p>
            </div>
          </div>
        </section>

        {/* Experiência visual e comportamento geral. */}
        <Section title="Experiência">
          <SettingItem
            icon={Moon}
            title="Modo Focus"
            description="Reduz estímulos visuais durante blocos de foco."
            value={silentMode ? "Silencioso" : "Padrão"}
          />

          <AppearanceCard />
        </Section>

        {/* Configurações usadas pela revisão diária e pelos Insights. */}
        <Section title="Análise diária">
          <SettingItem
            icon={Tag}
            title="Tags personalizadas"
            description="Edite as tags que aparecem ao registrar seu dia."
            onClick={() => setTagEditorOpen(true)}
          />
        </Section>

        {/* Notificações e alertas inteligentes. */}
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

        {/* Dados, privacidade e integrações futuras. */}
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

        {/* Versão e ações sensíveis da conta. */}
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

        <p className="pt-1 text-center text-xs leading-5 text-soft">
          Axon Web · versão inicial de desenvolvimento
        </p>
      </div>

      {/* Sidebar global com contexto do usuário. */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chronotypeLabel={result.label}
        energyPeak={result.energyPeak}
        userName={userName}
        userEmail={userEmail}
      />

      {/* Confirmação simples de logout. */}
      <ConfirmDialog
        isOpen={showLogoutModal}
        title="Deseja sair da sua conta?"
        description="Você será desconectado do Axon e precisará fazer login novamente para acessar seu ambiente."
        confirmLabel="Sair"
        variant="danger"
        icon={LogOut}
        onConfirm={handleLogout}
        onClose={() => setShowLogoutModal(false)}
      />

      {/* Fluxo em duas etapas para reduzir exclusão acidental da conta. */}
      <ConfirmDialog
        isOpen={showDeleteFirstModal}
        title="Excluir sua conta?"
        description="Essa ação é permanente e removerá seu acesso ao Axon."
        confirmLabel="Continuar"
        variant="danger"
        icon={Trash2}
        onConfirm={() => {
          setShowDeleteFirstModal(false);
          setShowDeleteFinalModal(true);
        }}
        onClose={() => setShowDeleteFirstModal(false)}
      />

      <ConfirmDialog
        isOpen={showDeleteFinalModal}
        title="Confirmação final"
        description={
          <>
            <p>
              O e-mail abaixo não poderá ser usado para criar outra conta no
              Axon pelos próximos{" "}
              <span className="font-semibold text-primary">60 dias</span>.
            </p>

            <div className="mt-5 flex items-center gap-3 rounded-[1.35rem] border border-soft bg-surface-muted p-3 text-left">
              <Mail className="h-4 w-4 shrink-0 text-red-600 dark:text-red-200" />
              <p className="min-w-0 truncate text-sm font-semibold text-secondary">
                {userEmail || "E-mail da conta"}
              </p>
            </div>
          </>
        }
        confirmLabel="Sim, excluir"
        variant="danger"
        onConfirm={handleDeleteAccount}
        onClose={() => setShowDeleteFinalModal(false)}
      />

      {/* Sheets de configuração específicos. */}
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

// ===========================================================================
// SEÇÕES E ITENS DE CONFIGURAÇÃO
// ===========================================================================

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-5">
      <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-soft">
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
      className={`flex w-full items-center gap-3 rounded-[1.7rem] border p-4 text-left shadow-card backdrop-blur-2xl transition active:scale-[0.99] ${
        danger
          ? "border-red-300/20 bg-red-500/10"
          : "border-soft bg-surface-elevated"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
          danger
            ? "border-red-300/25 bg-red-500/10 text-red-600 dark:text-red-100"
            : "border-accent-soft bg-accent-soft text-accent"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold ${
            danger ? "text-red-600 dark:text-red-100" : "text-primary"
          }`}
        >
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-muted">{description}</p>

        {value && (
          <p
            className={`mt-2 truncate text-xs font-medium ${
              danger ? "text-red-600/75 dark:text-red-100/70" : "text-accent"
            }`}
          >
            {value}
          </p>
        )}
      </div>

      {onClick && (
        <ChevronRight
          className={`h-5 w-5 shrink-0 ${
            danger ? "text-red-500/40 dark:text-red-100/35" : "text-soft"
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
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-3 rounded-[1.7rem] border border-soft bg-surface-elevated p-4 text-left shadow-card backdrop-blur-2xl transition active:scale-[0.99]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent-soft bg-accent-soft text-accent">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-primary">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
      </div>

      <div
        className={`flex h-7 w-12 shrink-0 items-center rounded-full border p-1 transition ${
          enabled
            ? "justify-end border-accent-soft bg-accent-soft"
            : "justify-start border-soft bg-surface-muted"
        }`}
      >
        <div
          className={`h-5 w-5 rounded-full shadow-card transition ${
            enabled ? "bg-[var(--accent)]" : "bg-[var(--text-soft)]"
          }`}
        />
      </div>
    </button>
  );
}

function AppearanceCard() {
  return (
    <div className="rounded-[1.7rem] border border-soft bg-surface-elevated p-4 shadow-card backdrop-blur-2xl">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent-soft bg-accent-soft text-accent">
          <Palette className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-primary">Aparência</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Escolha o tema visual da interface.
          </p>
        </div>
      </div>

      <ThemeToggle showHeader={false} />
    </div>
  );
}
