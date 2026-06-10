import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Archive,
  Bell,
  Briefcase,
  CalendarDays,
  ChevronRight,
  Focus,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { results, type ChronotypeResultKey } from "../data/results";
import Sidebar from "../components/layout/Sidebar";
import * as api from "../lib/api";
import type { ConversationData } from "../lib/api";

type ConversationType = "general" | "planning" | "focus" | "project";

const validKeys: ChronotypeResultKey[] = [
  "Matutino",
  "Vespertino",
  "Noturno",
  "Misto",
  "Bimodal",
];

const notificationsConversation = {
  id: "axon-notifications",
  title: "Notificações do Axon",
  type: "general",
  archived: false,
  created_at: new Date().toISOString(),
  last_message:
    "Avisos importantes, lembretes e atualizações do seu ambiente aparecem aqui.",
} as ConversationData;

export default function Chat() {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"all" | "archived">("all");
  const [visibleCount, setVisibleCount] = useState(8);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  useEffect(() => {
    api
      .getConversations()
      .then(setConversations)
      .catch(() => setConversations([]))
      .finally(() => setLoadingConversations(false));
  }, []);

  const resultKey = useMemo<ChronotypeResultKey>(() => {
    const stored = localStorage.getItem("axon_chronotype");

    if (stored && validKeys.includes(stored as ChronotypeResultKey)) {
      return stored as ChronotypeResultKey;
    }

    return "Misto";
  }, []);

  const result = results[resultKey];

  const orderedConversations = useMemo(() => {
    if (view === "archived") {
      return conversations.filter((conversation) => conversation.archived);
    }

    return conversations.filter((conversation) => !conversation.archived);
  }, [conversations, view]);

    const userConversations = conversations.filter(
      (conversation) => conversation.id !== notificationsConversation.id
    );

  const filteredConversations = orderedConversations.filter((conversation) => {
    const query = search.toLowerCase();

    const matchesSearch =
      conversation.title.toLowerCase().includes(query) ||
      (conversation.last_message ?? "").toLowerCase().includes(query);

    return matchesSearch;
  });

  const visibleConversations = filteredConversations.slice(0, visibleCount);

  const hasMoreConversations = filteredConversations.length > visibleCount;

  useEffect(() => {
    setVisibleCount(8);
  }, [search, view]);

  return (
    <main className="relative h-[100dvh] overflow-hidden bg-[#11111a] text-white">
      <Background />

      <div className="relative z-10 flex h-full flex-col px-4 pb-4 pt-5">
        <header className="mb-4 flex shrink-0 items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 text-left active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200 shadow-lg shadow-purple-950/30">
              <img
                src="/axon-logo.svg"
                alt="Axon"
                className="h-8 w-8 object-contain"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Chat</p>
              <p className="text-xs text-white/40">Conversas com o Axon</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-xl shadow-purple-950/35 active:scale-[0.96]"
              aria-label="Nova conversa"
            >
              <Plus className="h-5 w-5" />
            </button>

            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/65 backdrop-blur-2xl active:scale-[0.96]"
              aria-label="Abrir notificações"
            >
              <Bell className="h-5 w-5" />

              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-[#11111a] bg-purple-300" />
            </button>

            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/65 backdrop-blur-2xl active:scale-[0.96]"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="mb-4">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#1b1b27]/82 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.24),transparent_48%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_40%)]" />

              <div className="relative">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Memória e contexto
                </div>

                <h1 className="text-[2.05rem] font-semibold leading-[1.02] tracking-[-0.06em] text-white">
                  Organize suas conversas por assunto.
                </h1>

                <p className="mt-3 text-sm leading-6 text-white/50">
                  Crie chats separados para rotina, foco, projetos, estudos ou
                  qualquer área que precise de acompanhamento.
                </p>
              </div>
            </div>
          </div>

          <div className="sticky top-0 z-30 -mx-1 mb-4 space-y-3 bg-transparent px-1 py-3">
            <label className="flex min-h-13 items-center gap-3 rounded-2xl border border-white/10 bg-[#1b1b27]/90 px-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
              <Search className="h-4 w-4 text-white/35" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar conversa..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              />
            </label>

            <div className="flex rounded-2xl border border-white/10 bg-[#1b1b27]/90 p-1 shadow-xl shadow-black/20 backdrop-blur-2xl">
              <button
                onClick={() => setView("all")}
                className={`min-h-10 flex-1 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                  view === "all"
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-950/25"
                    : "text-white/42"
                }`}
              >
                Todas
              </button>

              <button
                onClick={() => setView("archived")}
                className={`min-h-10 flex-1 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                  view === "archived"
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-950/25"
                    : "text-white/42"
                }`}
              >
                Arquivadas
              </button>
            </div>
          </div>

          <section className="space-y-3 pb-4">
            {loadingConversations ? (
              <div className="rounded-[2rem] border border-white/10 bg-[#1b1b27]/76 p-5 text-center shadow-xl shadow-black/20 backdrop-blur-2xl">
                <p className="text-sm text-white/35">
                  Carregando conversas...
                </p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="rounded-[2rem] border border-white/10 bg-[#1b1b27]/76 p-5 text-center shadow-xl shadow-black/20 backdrop-blur-2xl">
                <MessageCircle className="mx-auto mb-3 h-6 w-6 text-purple-200" />

                <p className="text-sm font-semibold text-white">
                  {view === "archived"
                    ? "Nenhuma conversa arquivada"
                    : "Nenhuma conversa encontrada"}
                </p>

                <p className="mt-2 text-xs leading-5 text-white/42">
                  {view === "archived"
                    ? "Quando você arquivar uma conversa, ela aparecerá aqui."
                    : "Tente buscar por outro termo ou crie uma nova conversa."}
                </p>
              </div>
            ) : (
              <>
                {visibleConversations.map((conversation) => (
                  <ConversationCard
                    key={conversation.id}
                    conversation={conversation}
                    onClick={() => navigate(`/chat/${conversation.id}`)}
                  />
                ))}

                {hasMoreConversations && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((current) => current + 8)}
                    className="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-5 text-sm font-semibold text-white/55 backdrop-blur-2xl transition active:scale-[0.98]"
                  >
                    Ver mais conversas
                  </button>
                )}
              </>
            )}
          </section>
        </section>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chronotypeLabel={result.label}
        energyPeak={result.energyPeak}
      />

      <CreateConversationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(conv) => {
          setConversations((prev) => [conv, ...prev]);
          navigate(`/chat/${conv.id}`);
        }}
      />

      <NotificationsSheet
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </main>
  );
}

function ConversationCard({
  conversation,
  isFixed = false,
  onClick,
}: {
  conversation: ConversationData;
  isFixed?: boolean;
  onClick: () => void;
}) {

  const Icon = isFixed
    ? Bell
    : getConversationIcon(conversation.type as ConversationType);

  const formattedDate = useMemo(() => {
    const date = new Date(conversation.created_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays === 0) return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return date.toLocaleDateString("pt-BR", { weekday: "short" });
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }, [conversation.created_at]);

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-[1.7rem] border p-4 text-left shadow-xl shadow-black/20 backdrop-blur-2xl active:scale-[0.99] ${
        isFixed
          ? "border-purple-300/20 bg-purple-500/10"
          : conversation.archived
            ? "border-white/10 bg-white/[0.04]"
            : "border-white/10 bg-[#1b1b27]/76"
      }`}
    >
      <div
        className={`relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border ${
          isFixed
            ? "border-purple-300/25 bg-purple-500/20 text-purple-100"
            : "border-purple-300/15 bg-purple-500/10 text-purple-200"
        }`}
      >
        <Icon className="h-5 w-5" />

        {isFixed && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-[#1b1b27] bg-purple-400 px-1 text-[0.58rem] font-bold text-white">
            1
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-semibold text-white">
              {conversation.title}
            </p>

            {isFixed && (
              <span className="shrink-0 rounded-full border border-purple-300/20 bg-purple-500/15 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-purple-100">
                Fixo
              </span>
            )}
          </div>

          <p className="shrink-0 text-[0.68rem] text-white/32">
            {formattedDate}
          </p>
        </div>

        <div className="mb-2 flex items-center gap-2">
          <p className="truncate text-xs text-white/38 capitalize">
            {conversation.type === "general" ? "Geral" :
             conversation.type === "planning" ? "Planejamento" :
             conversation.type === "focus" ? "Foco" : "Projeto"}
          </p>

          {conversation.archived && (
            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.045] px-2 py-0.5 text-[0.6rem] font-semibold text-white/38">
              Arquivada
            </span>
          )}
        </div>

        {conversation.last_message && (
          <p className="line-clamp-1 text-xs leading-5 text-white/50">
            {conversation.last_message}
          </p>
        )}
      </div>

      <ChevronRight className="h-5 w-5 shrink-0 text-white/22" />
    </button>
  );
}

function getConversationIcon(type: ConversationType) {
  if (type === "planning") return CalendarDays;
  if (type === "focus") return Focus;
  if (type === "project") return Briefcase;
  return MessageCircle;
}

function CreateConversationModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (conv: ConversationData) => void;
}) {
  const [selectedType, setSelectedType] =
    useState<ConversationType>("general");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  async function handleCreate() {
    const finalTitle = title.trim() || "Nova conversa";
    setIsLoading(true);
    try {
      const conv = await api.createConversation(finalTitle, selectedType);
      setTitle("");
      onClose();
      onCreated(conv);
    } catch {
      // mantém o modal aberto se falhar
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm">
      <div className="relative flex max-h-[88vh] w-full max-w-[430px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#171720]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.22),transparent_48%)]" />

        <div className="relative border-b border-white/10 px-5 pb-4 pt-4">
          <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-white/18" />

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                <Plus className="h-3.5 w-3.5" />
                Nova conversa
              </div>

              <h2 className="text-[1.55rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
                Criar aba de conversa
              </h2>

              <p className="mt-2 text-xs leading-5 text-white/45">
                Separe assuntos para o Axon acompanhar cada contexto com mais
                clareza.
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/45 active:scale-[0.96]"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 grid grid-cols-2 gap-2">
            <ConversationTypeButton
              active={selectedType === "general"}
              icon={MessageCircle}
              label="Geral"
              onClick={() => setSelectedType("general")}
            />

            <ConversationTypeButton
              active={selectedType === "planning"}
              icon={CalendarDays}
              label="Planejamento"
              onClick={() => setSelectedType("planning")}
            />

            <ConversationTypeButton
              active={selectedType === "focus"}
              icon={Focus}
              label="Foco"
              onClick={() => setSelectedType("focus")}
            />

            <ConversationTypeButton
              active={selectedType === "project"}
              icon={Briefcase}
              label="Projeto"
              onClick={() => setSelectedType("project")}
            />
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-white/42">
              Nome da conversa
            </span>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              type="text"
              placeholder="Ex: Estudos, Trabalho, Rotina..."
              className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none placeholder:text-white/28 focus:border-purple-300/35"
            />
          </label>

          <div className="mt-4 rounded-2xl border border-purple-300/15 bg-purple-500/10 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-200" />
              <p className="text-sm font-semibold text-purple-100">
                Como o Axon usa isso
              </p>
            </div>

            <p className="text-xs leading-5 text-white/50">
              Cada conversa pode manter um contexto específico. Isso evita
              misturar decisões de trabalho, rotina pessoal e foco profundo no
              mesmo chat.
            </p>
          </div>
        </div>

        <div className="relative border-t border-white/10 bg-[#171720]/95 px-5 py-4">
          <button
            type="button"
            onClick={handleCreate}
            disabled={isLoading}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/35 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Criando..." : "Criar conversa"}
            {!isLoading && <Plus className="ml-2 h-4 w-4" />}
          </button>

          <button
            type="button"
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

function ConversationTypeButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[4.6rem] flex-col items-center justify-center gap-2 rounded-2xl border text-xs font-semibold transition active:scale-[0.98] ${
        active
          ? "border-purple-300/30 bg-purple-500/20 text-purple-100 shadow-lg shadow-purple-950/20"
          : "border-white/10 bg-white/[0.045] text-white/42"
      }`}
    >
      <Icon className="h-[18px] w-[18px]" />
      {label}
    </button>
  );
}

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#151520_0%,#101018_48%,#13131d_100%)]" />

      <div className="absolute left-1/2 top-[-14rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-purple-700/22 blur-[120px]" />
      <div className="absolute right-[-12rem] top-[18rem] h-[24rem] rounded-full bg-fuchsia-500/10 blur-[110px]" />
      <div className="absolute bottom-[-12rem] left-[-12rem] h-[26rem] w-[26rem] rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:30px_30px] opacity-[0.12]" />
    </div>
  );
}

function NotificationsSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Seu planejamento de hoje está pronto",
      description:
        "O Axon organizou uma sugestão inicial com base no seu ritmo e prioridades.",
      time: "Agora",
      unread: true,
    },
    {
      id: 2,
      title: "Bom momento para foco profundo",
      description:
        "Sua janela de energia indica um bom momento para executar uma tarefa importante.",
      time: "Há 12 min",
      unread: true,
    },
    {
      id: 3,
      title: "Novo insight disponível",
      description:
        "Identificamos um padrão inicial entre seus horários de energia e suas tarefas.",
      time: "Hoje",
      unread: false,
    },
  ]);

  if (!isOpen) return null;

  function markAsRead(notificationId: number) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, unread: false }
          : notification
      )
    );
  }

  function markAllAsRead() {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  }

  const hasUnreadNotifications = notifications.some(
    (notification) => notification.unread
  );

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="relative flex max-h-[82vh] w-full max-w-[430px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#171720]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.22),transparent_48%)]" />

        <div className="relative border-b border-white/10 px-5 pb-4 pt-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                <Bell className="h-3.5 w-3.5" />
                Central do Axon
              </div>

              <h2 className="text-[1.65rem] font-semibold leading-[1.05] tracking-[-0.055em] text-white">
                Notificações
              </h2>

              <p className="mt-2 text-xs leading-5 text-white/45">
                Avisos importantes, lembretes inteligentes e atualizações do seu
                ambiente.
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/45 active:scale-[0.96]"
              aria-label="Fechar notificações"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {hasUnreadNotifications && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex min-h-10 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] px-4 text-xs font-semibold text-white/50 active:scale-[0.98]"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>

        <div className="relative flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-[1.45rem] border p-4 transition ${
                  notification.unread
                    ? "border-purple-300/20 bg-purple-500/10"
                    : "border-white/10 bg-white/[0.035] opacity-45"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        notification.unread
                          ? "bg-purple-300 shadow-[0_0_14px_rgba(216,180,254,0.9)]"
                          : "bg-white/18"
                      }`}
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold leading-5 text-white">
                          {notification.title}
                        </p>
                      </div>

                      <p className="mt-1 text-xs leading-5 text-white/42">
                        {notification.description}
                      </p>

                      {notification.unread && (
                        <button
                          type="button"
                          onClick={() => markAsRead(notification.id)}
                          className="mt-3 inline-flex min-h-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] px-3 text-[0.68rem] font-semibold text-purple-100 active:scale-[0.98]"
                        >
                          Marcar como lida
                        </button>
                      )}
                    </div>
                  </div>

                  <span className="shrink-0 text-[0.65rem] font-medium text-white/30">
                    {notification.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative border-t border-white/10 bg-[#171720]/95 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-5 text-sm font-semibold text-white/55 active:scale-[0.98]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}