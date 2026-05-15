import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Archive,
  ArrowLeft,
  Brain,
  Edit3,
  Info,
  Menu,
  MoreVertical,
  Send,
  Sparkles,
  Trash2,
  X,
  Eraser,
} from "lucide-react";

import { results, type ChronotypeResultKey } from "../data/results";
import Sidebar from "../components/layout/Sidebar";

type Message = {
  id: number;
  sender: "user" | "axon";
  text: string;
};

type ConfirmAction = "clear" | "archive" | "delete" | null;

const validKeys: ChronotypeResultKey[] = [
  "Matutino",
  "Vespertino",
  "Noturno",
  "Misto",
  "Bimodal",
];

const initialMessages: Message[] = [
  {
    id: 1,
    sender: "axon",
    text: "Essa conversa está separada para manter o contexto mais limpo. Me diga o que você quer organizar por aqui.",
  },
  {
    id: 2,
    sender: "user",
    text: "Quero organizar melhor minhas prioridades de hoje.",
  },
  {
    id: 3,
    sender: "axon",
    text: "Perfeito. Podemos começar separando o que é urgente, importante e o que pode ficar para depois.",
  },
];

export default function ChatConversation() {
  const navigate = useNavigate();
  const { chatId } = useParams();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const [chatTitle, setChatTitle] = useState(formatChatTitle(chatId));
  const [draftTitle, setDraftTitle] = useState(formatChatTitle(chatId));

  const resultKey = useMemo<ChronotypeResultKey>(() => {
    const stored = localStorage.getItem("axon_chronotype");

    if (stored && validKeys.includes(stored as ChronotypeResultKey)) {
      return stored as ChronotypeResultKey;
    }

    return "Misto";
  }, []);

  const result = results[resultKey];

  function handleSend() {
    if (!message.trim()) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        sender: "user",
        text: message.trim(),
      },
    ]);

    setMessage("");
  }

  function handleRename() {
    if (!draftTitle.trim()) return;

    setChatTitle(draftTitle.trim());
    setIsRenameOpen(false);
  }

  function handleConfirmAction() {
    if (confirmAction === "clear") {
      setMessages([]);
      setConfirmAction(null);
      return;
    }

    if (confirmAction === "archive") {
      setConfirmAction(null);
      navigate("/chat");
      return;
    }

    if (confirmAction === "delete") {
      setConfirmAction(null);
      navigate("/chat");
      return;
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#11111a] text-white">
      <Background />

      <div className="relative z-10 flex min-h-screen flex-col px-4 pb-4 pt-5">
        <header className="mb-4 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <button
              onClick={() => navigate("/chat")}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/65 backdrop-blur-2xl active:scale-[0.96]"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {chatTitle}
              </p>
              <p className="truncate text-xs text-white/40">
                Conversa com contexto próprio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOptionsOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/65 backdrop-blur-2xl active:scale-[0.96]"
              aria-label="Mais opções"
            >
              <MoreVertical className="h-5 w-5" />
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

        <section className="mb-4 rounded-[1.7rem] border border-purple-300/20 bg-purple-500/10 p-4 shadow-xl shadow-purple-950/20 backdrop-blur-2xl">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-200" />
            <p className="text-sm font-semibold text-purple-100">
              Contexto ativo
            </p>
          </div>

          <p className="text-xs leading-5 text-white/52">
            O Axon vai manter esta conversa focada em{" "}
            <span className="font-semibold text-purple-100">{chatTitle}</span>.
          </p>
        </section>

        <section className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-4">
          {messages.length > 0 ? (
            messages.map((item) => (
              <MessageBubble key={item.id} message={item} />
            ))
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-[18rem] rounded-[1.7rem] border border-white/10 bg-[#1b1b27]/82 p-5 text-center shadow-xl shadow-black/20 backdrop-blur-2xl">
                <Brain className="mx-auto mb-3 h-6 w-6 text-purple-200" />
                <p className="text-sm font-semibold text-white">
                  Conversa limpa
                </p>
                <p className="mt-2 text-xs leading-5 text-white/42">
                  As mensagens foram removidas. Você pode começar um novo
                  assunto por aqui.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-[1.7rem] border border-white/10 bg-[#1b1b27]/90 p-2 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="flex items-end gap-2">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={1}
              placeholder="Digite sua mensagem..."
              className="max-h-32 min-h-12 flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/30"
            />

            <button
              onClick={handleSend}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-xl shadow-purple-950/35 active:scale-[0.96]"
              aria-label="Enviar"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </section>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chronotypeLabel={result.label}
        energyPeak={result.energyPeak}
      />

      <ChatOptionsSheet
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        onRename={() => {
          setDraftTitle(chatTitle);
          setIsOptionsOpen(false);
          setIsRenameOpen(true);
        }}
        onContext={() => {
          setIsOptionsOpen(false);
          setIsContextOpen(true);
        }}
        onClear={() => {
          setIsOptionsOpen(false);
          setConfirmAction("clear");
        }}
        onArchive={() => {
          setIsOptionsOpen(false);
          setConfirmAction("archive");
        }}
        onDelete={() => {
          setIsOptionsOpen(false);
          setConfirmAction("delete");
        }}
      />

      <RenameConversationModal
        isOpen={isRenameOpen}
        value={draftTitle}
        onChange={setDraftTitle}
        onClose={() => setIsRenameOpen(false)}
        onConfirm={handleRename}
      />

      <ConversationContextModal
        isOpen={isContextOpen}
        onClose={() => setIsContextOpen(false)}
        chatTitle={chatTitle}
        messageCount={messages.length}
        chronotypeLabel={result.label}
      />

      <ConfirmActionModal
        action={confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
      />
    </main>
  );
}

function ChatOptionsSheet({
  isOpen,
  onClose,
  onRename,
  onContext,
  onClear,
  onArchive,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onRename: () => void;
  onContext: () => void;
  onClear: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm">
      <div className="relative w-full max-w-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#171720]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.2),transparent_48%)]" />

        <div className="relative px-5 pb-4 pt-4">
          <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-white/18" />

          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[1.45rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
                Opções da conversa
              </p>
              <p className="mt-2 text-xs leading-5 text-white/45">
                Gerencie esta aba sem alterar as outras conversas.
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

          <div className="space-y-2">
            <OptionButton
              icon={Edit3}
              title="Renomear conversa"
              description="Altere o nome desta aba."
              onClick={onRename}
            />

            <OptionButton
              icon={Info}
              title="Ver contexto"
              description="Veja o foco e os dados dessa conversa."
              onClick={onContext}
            />

            <OptionButton
              icon={Eraser}
              title="Limpar mensagens"
              description="Remove as mensagens, mas mantém a aba."
              onClick={onClear}
            />

            <OptionButton
              icon={Archive}
              title="Arquivar conversa"
              description="Remove da lista principal."
              onClick={onArchive}
            />

            <OptionButton
              icon={Trash2}
              title="Excluir conversa"
              description="Apaga esta aba de conversa."
              danger
              onClick={onDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionButton({
  icon: Icon,
  title,
  description,
  danger = false,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left active:scale-[0.99] ${
        danger
          ? "border-red-300/15 bg-red-500/10"
          : "border-white/10 bg-white/[0.045]"
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
      </div>
    </button>
  );
}

function RenameConversationModal({
  isOpen,
  value,
  onChange,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm">
      <div className="w-full max-w-[430px] rounded-[2rem] border border-white/10 bg-[#171720]/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-white/18" />

        <h2 className="text-[1.55rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
          Renomear conversa
        </h2>

        <p className="mt-2 text-xs leading-5 text-white/45">
          Escolha um nome claro para encontrar esta aba depois.
        </p>

        <label className="mt-5 block">
          <span className="mb-2 block text-xs font-medium text-white/42">
            Nome da conversa
          </span>

          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none placeholder:text-white/28 focus:border-purple-300/35"
          />
        </label>

        <button
          onClick={onConfirm}
          className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/35 active:scale-[0.98]"
        >
          Salvar nome
        </button>

        <button
          onClick={onClose}
          className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-6 text-sm font-semibold text-white/55 active:scale-[0.98]"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function ConversationContextModal({
  isOpen,
  onClose,
  chatTitle,
  messageCount,
  chronotypeLabel,
}: {
  isOpen: boolean;
  onClose: () => void;
  chatTitle: string;
  messageCount: number;
  chronotypeLabel: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm">
      <div className="w-full max-w-[430px] rounded-[2rem] border border-white/10 bg-[#171720]/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-white/18" />

        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-200" />
          <p className="text-sm font-semibold text-purple-100">
            Contexto da conversa
          </p>
        </div>

        <h2 className="text-[1.55rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
          {chatTitle}
        </h2>

        <div className="mt-5 space-y-3">
          <ContextRow label="Foco da aba" value={chatTitle} />
          <ContextRow label="Mensagens" value={`${messageCount}`} />
          <ContextRow label="Perfil ativo" value={chronotypeLabel} />
          <ContextRow label="Memória" value="Contexto separado por conversa" />
        </div>

        <button
          onClick={onClose}
          className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/35 active:scale-[0.98]"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <p className="text-xs text-white/35">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white/75">{value}</p>
    </div>
  );
}

function ConfirmActionModal({
  action,
  onClose,
  onConfirm,
}: {
  action: ConfirmAction;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!action) return null;

  const config = {
    clear: {
      title: "Limpar mensagens?",
      description:
        "As mensagens desta conversa serão removidas, mas a aba continuará existindo.",
      button: "Sim, limpar mensagens",
      icon: Eraser,
      danger: false,
    },
    archive: {
      title: "Arquivar conversa?",
      description:
        "Esta conversa sairá da lista principal. Você poderá recuperá-la futuramente.",
      button: "Sim, arquivar",
      icon: Archive,
      danger: false,
    },
    delete: {
      title: "Excluir conversa?",
      description:
        "Esta ação remove a aba inteira. Depois, essa conversa não poderá ser acessada.",
      button: "Sim, excluir conversa",
      icon: Trash2,
      danger: true,
    },
  }[action];

  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[140] flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm">
      <div className="w-full max-w-[430px] rounded-[2rem] border border-white/10 bg-[#171720]/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-white/18" />

        <div
          className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border ${
            config.danger
              ? "border-red-300/20 bg-red-500/10 text-red-100"
              : "border-purple-300/20 bg-purple-500/10 text-purple-100"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <h2 className="text-[1.55rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
          {config.title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-white/48">
          {config.description}
        </p>

        <button
          onClick={onConfirm}
          className={`mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-2xl px-6 text-sm font-semibold text-white shadow-xl active:scale-[0.98] ${
            config.danger
              ? "bg-red-500 shadow-red-950/30"
              : "bg-purple-500 shadow-purple-950/35"
          }`}
        >
          {config.button}
        </button>

        <button
          onClick={onClose}
          className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-6 text-sm font-semibold text-white/55 active:scale-[0.98]"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 shadow-xl ${
          isUser
            ? "rounded-br-md bg-purple-500 text-white shadow-purple-950/25"
            : "rounded-bl-md border border-white/10 bg-[#1b1b27]/82 text-white/62 shadow-black/20 backdrop-blur-2xl"
        }`}
      >
        {!isUser && (
          <div className="mb-2 flex items-center gap-2">
            <Brain className="h-3.5 w-3.5 text-purple-200" />
            <p className="text-xs font-semibold text-purple-100">Axon</p>
          </div>
        )}

        {message.text}
      </div>
    </div>
  );
}

function formatChatTitle(chatId?: string) {
  if (!chatId) return "Conversa";

  return chatId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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