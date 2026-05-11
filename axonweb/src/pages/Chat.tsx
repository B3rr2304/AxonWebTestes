import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUp,
  Brain,
  CalendarDays,
  Focus,
  Home,
  Menu,
  MessageCircle,
  Plus,
  Settings,
  Sparkles,
  Zap,
} from "lucide-react";

import { results, type ChronotypeResultKey } from "../data/results";
import Sidebar from "../components/layout/Sidebar";

type Message = {
  id: number;
  role: "axon" | "user";
  text: string;
};

const validKeys: ChronotypeResultKey[] = [
  "morning",
  "intermediate",
  "evening",
  "night",
];

const quickPrompts = [
  "Organizar meu dia",
  "Qual tarefa fazer agora?",
  "Criar bloco de foco",
  "Replanejar minha rotina",
];

export default function Chat() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const resultKey = useMemo<ChronotypeResultKey>(() => {
    const stored = localStorage.getItem("axon_chronotype");

    if (stored && validKeys.includes(stored as ChronotypeResultKey)) {
      return stored as ChronotypeResultKey;
    }

    return "intermediate";
  }, []);

  const result = results[resultKey];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "axon",
      text: `Eu já estou considerando seu ${result.label.toLowerCase()} para adaptar minhas sugestões ao seu ritmo.`,
    },
    {
      id: 2,
      role: "axon",
      text: "Me diga o que você quer organizar agora: seu dia, uma tarefa, sua semana ou um momento de foco.",
    },
  ]);

  function sendMessage(text?: string) {
    const messageText = (text ?? input).trim();

    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: messageText,
    };

    const axonResponse: Message = {
      id: Date.now() + 1,
      role: "axon",
      text:
        "Entendi. Vou transformar isso em uma ação clara considerando seu ritmo, sua energia atual e suas prioridades.",
    };

    setMessages((prev) => [...prev, userMessage, axonResponse]);
    setInput("");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05050b] text-white">
      <Background />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="shrink-0 border-b border-white/10 bg-[#05050b]/88 px-4 pb-3 pt-4 backdrop-blur-2xl">
            <div className="flex items-center justify-between">
                <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-3 text-left active:scale-[0.98]"
                >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200">
                    <Brain className="h-5 w-5" />
                </div>

                <div>
                    <p className="text-sm font-semibold text-white">Axon Chat</p>
                    <p className="text-xs text-white/38">Copiloto pessoal</p>
                </div>
                </button>

                <div className="flex items-center gap-2">
                <button
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-white/55 backdrop-blur-2xl active:scale-[0.96]"
                    aria-label="Nova conversa"
                >
                    <Plus className="h-5 w-5" />
                </button>

                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-white/60 backdrop-blur-2xl active:scale-[0.96]"
                    aria-label="Abrir menu"
                >
                    <Menu className="h-5 w-5" />
                </button>
                </div>
            </div>

            <div className="mt-3 flex items-center gap-2 overflow-hidden rounded-2xl border border-purple-300/15 bg-purple-500/10 px-3 py-2">
                <Sparkles className="h-4 w-4 shrink-0 text-purple-200" />
                <p className="truncate text-xs text-white/55">
                Contexto ativo:{" "}
                <span className="text-purple-100">{result.label}</span> · pico{" "}
                {result.energyPeak}
                </p>
            </div>
            </header>

        <section className="flex-1 overflow-y-auto px-4 pb-32 pt-4">
          <div className="mb-4 rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
            <div className="mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-200" />
              <p className="text-sm font-semibold text-white">
                O que vamos organizar?
              </p>
            </div>

            <p className="text-sm leading-6 text-white/45">
              Peça ajuda para priorizar, replanejar, criar blocos de foco ou
              transformar ideias soltas em próximas ações.
            </p>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="min-h-[54px] rounded-[1.25rem] border border-white/10 bg-white/[0.05] px-3 py-3 text-left text-xs font-medium leading-5 text-white/62 backdrop-blur-2xl active:scale-[0.98]"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        </section>

        <ChatInput
          input={input}
          setInput={setInput}
          sendMessage={() => sendMessage()}
        />

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

function ChatInput({
  input,
  setInput,
  sendMessage,
}: {
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
}) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#05050b]/88 px-4 pb-4 pt-3 backdrop-blur-2xl">
      <div className="flex items-end gap-2 rounded-[1.55rem] border border-white/10 bg-white/[0.055] p-2 shadow-2xl shadow-black/30 backdrop-blur-2xl">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Digite o que quer organizar..."
          rows={1}
          className="max-h-24 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-5 text-white outline-none placeholder:text-white/28"
        />

        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-xl shadow-purple-950/40 transition active:scale-[0.96] disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>
    </footer>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[84%] rounded-[1.45rem] px-4 py-3 shadow-xl ${
          isUser
            ? "rounded-br-md bg-purple-500 text-white shadow-purple-950/30"
            : "rounded-bl-md border border-white/10 bg-white/[0.055] text-white/58 shadow-black/20 backdrop-blur-2xl"
        }`}
      >
        {!isUser && (
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-xl bg-purple-500/15 text-purple-200">
              <Brain className="h-3.5 w-3.5" />
            </div>

            <p className="text-xs font-semibold text-purple-100">Axon</p>
          </div>
        )}

        <p className="text-sm leading-6">{message.text}</p>
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