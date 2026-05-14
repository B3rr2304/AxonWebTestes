import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Focus,
  Menu,
  MessageCircle,
  Plus,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import { results, type ChronotypeResultKey } from "../data/results";
import Sidebar from "../components/layout/Sidebar";

type Task = {
  id: number;
  title: string;
  description: string;
  time: string;
  tag: string;
  priority: "Alta" | "Média" | "Baixa";
  done: boolean;
};

type FocusBlock = {
  id: number;
  title: string;
  time: string;
  duration: string;
  description: string;
  recommended: boolean;
};

const validKeys: ChronotypeResultKey[] = [
  "morning",
  "intermediate",
  "evening",
  "night",
];

const tasks: Task[] = [
  {
    id: 1,
    title: "Revisar prioridades do dia",
    description: "Organizar o que realmente precisa ser feito hoje.",
    time: "09:30",
    tag: "Clareza",
    priority: "Média",
    done: true,
  },
  {
    id: 2,
    title: "Trabalhar na tarefa principal",
    description: "Executar o bloco mais importante antes das demandas leves.",
    time: "10:40",
    tag: "Foco",
    priority: "Alta",
    done: false,
  },
  {
    id: 3,
    title: "Responder mensagens pendentes",
    description: "Agrupar respostas para reduzir alternância de contexto.",
    time: "14:00",
    tag: "Operação",
    priority: "Baixa",
    done: false,
  },
  {
    id: 4,
    title: "Revisar andamento do dia",
    description: "Ajustar tarefas restantes e preparar o próximo bloco.",
    time: "17:30",
    tag: "Revisão",
    priority: "Média",
    done: false,
  },
];

const focusBlocks: FocusBlock[] = [
  {
    id: 1,
    title: "Foco profundo",
    time: "10:40",
    duration: "1h30",
    description: "Melhor janela para tarefa de alta complexidade.",
    recommended: true,
  },
  {
    id: 2,
    title: "Execução leve",
    time: "14:00",
    duration: "45min",
    description: "Ideal para tarefas operacionais e respostas rápidas.",
    recommended: false,
  },
];

const agenda = [
  {
    time: "09:30",
    title: "Planejamento rápido",
    status: "Concluído",
  },
  {
    time: "10:40",
    title: "Foco profundo",
    status: "Próximo",
  },
  {
    time: "14:00",
    title: "Demandas operacionais",
    status: "Pendente",
  },
  {
    time: "17:30",
    title: "Revisão do dia",
    status: "Pendente",
  },
];

export default function Planning() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const resultKey = useMemo<ChronotypeResultKey>(() => {
    const stored = localStorage.getItem("axon_chronotype");

    if (stored && validKeys.includes(stored as ChronotypeResultKey)) {
      return stored as ChronotypeResultKey;
    }

    return "intermediate";
  }, []);

  const result = results[resultKey];

  const completedTasks = tasks.filter((task) => task.done).length;
  const progress = Math.round((completedTasks / tasks.length) * 100);

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
              <p className="text-sm font-semibold text-white">Planejamento</p>
              <p className="text-xs text-white/40">Rotina inteligente</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-white/55 backdrop-blur-2xl active:scale-[0.96]"
              aria-label="Adicionar tarefa"
            >
              <Plus className="h-5 w-5" />
            </button>

            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-white/60 backdrop-blur-2xl active:scale-[0.96]"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        <section className="mb-5">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/14 via-transparent to-fuchsia-400/10" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:26px_26px] opacity-20" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                <Sparkles className="h-3.5 w-3.5" />
                Dia organizado pelo Axon
              </div>

              <h1 className="text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-white">
                Seu planejamento está focado em uma prioridade principal.
              </h1>

              <p className="mt-4 text-sm leading-6 text-white/50">
                O Axon distribuiu tarefas de acordo com seu ritmo, sua energia
                e seus melhores horários de foco.
              </p>

              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Progresso do dia
                    </p>
                    <p className="mt-1 text-xs text-white/35">
                      {completedTasks} de {tasks.length} tarefas concluídas
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-purple-100">
                    {progress}%
                  </p>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-300 shadow-[0_0_18px_rgba(192,132,252,0.6)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-[2rem] border border-purple-300/20 bg-purple-500/10 p-4 shadow-xl shadow-purple-950/20 backdrop-blur-2xl">
          <div className="mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-200" />
            <p className="text-sm font-semibold text-purple-100">
              Sugestão do Axon
            </p>
          </div>

          <p className="text-sm leading-6 text-white/58">
            Com base no seu {result.label.toLowerCase()}, preserve sua melhor
            janela de energia para a tarefa mais importante e agrupe demandas
            menores em blocos separados.
          </p>

          <button
            onClick={() => navigate("/chat")}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/20 px-5 text-sm font-semibold text-purple-100 active:scale-[0.98]"
          >
            Ajustar com o Axon
            <MessageCircle className="ml-2 h-4 w-4" />
          </button>
        </section>

        <section className="mb-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Tarefas de hoje</p>
              <p className="mt-1 text-xs text-white/38">
                Ordenadas por prioridade e energia
              </p>
            </div>

            <button className="text-xs font-medium text-purple-200">
              Ver todas
            </button>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>

        <section className="mb-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Blocos de foco
              </p>
              <p className="mt-1 text-xs text-white/38">
                Criados para reduzir distrações
              </p>
            </div>

            <Focus className="h-5 w-5 text-purple-200" />
          </div>

          <div className="space-y-3">
            {focusBlocks.map((block) => (
              <FocusBlockCard key={block.id} block={block} />
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Linha do tempo
              </p>
              <p className="mt-1 text-xs text-white/38">
                Visão rápida do seu dia
              </p>
            </div>

            <CalendarDays className="h-5 w-5 text-purple-200" />
          </div>

          <div className="space-y-4">
            {agenda.map((item, index) => (
              <div key={item.time} className="relative flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-xs font-semibold ${
                      item.status === "Próximo"
                        ? "border-purple-300/30 bg-purple-500/20 text-purple-100"
                        : item.status === "Concluído"
                        ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200"
                        : "border-white/10 bg-white/[0.045] text-white/42"
                    }`}
                  >
                    {item.time}
                  </div>

                  {index !== agenda.length - 1 && (
                    <div className="mt-2 h-8 w-px bg-white/10" />
                  )}
                </div>

                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-sm font-semibold text-white">
                    {item.title}
                  </p>
                  <p
                    className={`mt-1 text-xs ${
                      item.status === "Próximo"
                        ? "text-purple-100"
                        : "text-white/38"
                    }`}
                  >
                    {item.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
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

function TaskCard({ task }: { task: Task }) {
  return (
    <div
      className={`rounded-[1.7rem] border p-4 shadow-xl backdrop-blur-2xl ${
        task.done
          ? "border-emerald-300/15 bg-emerald-400/[0.055] shadow-black/10"
          : task.priority === "Alta"
          ? "border-purple-300/25 bg-purple-500/10 shadow-purple-950/20"
          : "border-white/10 bg-white/[0.055] shadow-black/20"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border ${
              task.done
                ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200"
                : "border-purple-300/15 bg-purple-500/10 text-purple-200"
            }`}
          >
            {task.done ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Target className="h-4 w-4" />
            )}
          </div>

          <div className="min-w-0">
            <p
              className={`text-sm font-semibold ${
                task.done ? "text-white/55 line-through" : "text-white"
              }`}
            >
              {task.title}
            </p>

            <p className="mt-1 text-xs leading-5 text-white/40">
              {task.description}
            </p>
          </div>
        </div>

        <p className="shrink-0 text-xs text-white/38">{task.time}</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[0.68rem] font-medium text-white/45">
          {task.tag}
        </span>

        <span
          className={`rounded-full px-3 py-1 text-[0.68rem] font-medium ${
            task.priority === "Alta"
              ? "border border-purple-300/20 bg-purple-500/10 text-purple-100"
              : "border border-white/10 bg-white/[0.045] text-white/42"
          }`}
        >
          {task.priority}
        </span>
      </div>
    </div>
  );
}

function FocusBlockCard({ block }: { block: FocusBlock }) {
  return (
    <div
      className={`rounded-[1.7rem] border p-4 shadow-xl backdrop-blur-2xl ${
        block.recommended
          ? "border-purple-300/25 bg-purple-500/10 shadow-purple-950/20"
          : "border-white/10 bg-white/[0.055] shadow-black/20"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Focus className="h-4 w-4 text-purple-200" />
          <p className="text-sm font-semibold text-white">{block.title}</p>
        </div>

        {block.recommended && (
          <span className="rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1 text-[0.68rem] font-medium text-purple-100">
            Recomendado
          </span>
        )}
      </div>

      <p className="text-sm leading-6 text-white/48">{block.description}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <Clock3 className="mb-2 h-4 w-4 text-purple-200" />
          <p className="text-[0.68rem] text-white/35">Início</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {block.time}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <Zap className="mb-2 h-4 w-4 text-purple-200" />
          <p className="text-[0.68rem] text-white/35">Duração</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {block.duration}
          </p>
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