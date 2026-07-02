import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Loader2,
  Menu,
  Plus,
  Target,
  Trash2,
  X,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import * as api from "../lib/api";
import type { Objective } from "../lib/api";
import { results, type ChronotypeResultKey } from "../data/results";

const validKeys: ChronotypeResultKey[] = ["Matutino", "Vespertino", "Noturno", "Misto", "Bimodal"];

const STATUS_TASK: Record<string, string> = {
  todo: "A fazer", progress: "Em andamento", done: "Concluída", scheduled: "Agendada",
};

const INPUT_CLS = "min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none placeholder:text-white/28 focus:border-purple-300/35";


// ──────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ──────────────────────────────────────────────────────────────────────────────

export default function Objetivos({ embedded = false }: { embedded?: boolean } = {}) {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<Record<string, api.Task[]>>({});
  const [loadingSubtasks, setLoadingSubtasks] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [addingStepTo, setAddingStepTo] = useState<Objective | null>(null);
  const [editingStep, setEditingStep] = useState<{ task: api.Task; objectiveId: string } | null>(null);
  const [togglingStepId, setTogglingStepId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resultKey: ChronotypeResultKey = (() => {
    const s = localStorage.getItem("axon_chronotype");
    return s && validKeys.includes(s as ChronotypeResultKey) ? (s as ChronotypeResultKey) : "Misto";
  })();
  const result = results[resultKey];

  async function loadObjectives() {
    try {
      const data = await api.getObjectives();
      setObjectives(data);
    } catch { /* silencioso */ }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (!api.isLoggedIn()) { navigate("/login"); return; }
    loadObjectives();
  }, [navigate]);

  async function toggleExpand(id: string) {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!subtasks[id]) {
      setLoadingSubtasks(id);
      try {
        const obj = await api.getObjective(id);
        setSubtasks((prev) => ({ ...prev, [id]: obj.subtasks ?? [] }));
      } catch { /* silent */ }
      finally { setLoadingSubtasks(null); }
    }
  }

  async function refreshSubtasks(objectiveId: string) {
    try {
      const obj = await api.getObjective(objectiveId);
      setSubtasks((prev) => ({ ...prev, [objectiveId]: obj.subtasks ?? [] }));
      setObjectives((prev) =>
        prev.map((o) => o.id === objectiveId ? { ...o, subtask_count: obj.subtask_count, done_count: obj.done_count, progress: obj.progress, status: obj.status } : o)
      );
    } catch { /* silent */ }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await api.deleteObjective(id);
      setObjectives((prev) => prev.filter((o) => o.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch { /* silent */ }
    finally { setDeletingId(null); }
  }

  async function handleToggleStep(objectiveId: string, task: api.Task) {
    setTogglingStepId(task.id);
    const next = task.status === "done"
      ? { status: "todo" as api.TaskStatus, progress: 0 }
      : { status: "done" as api.TaskStatus, progress: 100 };
    try {
      await api.updateTask(task.id, next);
      await refreshSubtasks(objectiveId);
    } catch { /* silent */ }
    finally { setTogglingStepId(null); }
  }

  const inner = (
    <>
      {embedded && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-[1.7rem] font-semibold leading-tight tracking-[-0.04em] text-white">
              Meus Objetivos
            </h1>
            <p className="mt-1 text-sm text-white/45">
              Metas que o Axon ajuda a alcançar.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/20 px-4 py-2.5 text-sm font-semibold text-purple-100 shadow-lg shadow-purple-950/20 active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            Novo
          </button>
        </div>
      )}

      {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-white/45">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando objetivos…
          </div>
        ) : objectives.length === 0 ? (
          <div className="flex flex-col items-center rounded-[2rem] border border-dashed border-white/12 bg-black/15 px-6 py-14 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/10 text-purple-200">
              <Target className="h-6 w-6" />
            </div>
            <p className="text-base font-semibold text-white">Nenhum objetivo ainda</p>
            <p className="mt-2 max-w-[260px] text-sm leading-6 text-white/42">
              Crie seu primeiro objetivo e adicione as etapas que vão te levar até ele.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 active:scale-[0.97]"
            >
              <Plus className="h-4 w-4" />
              Criar objetivo
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {objectives.map((obj) => (
              <ObjectiveCard
                key={obj.id}
                objective={obj}
                isExpanded={expandedId === obj.id}
                isLoadingSubtasks={loadingSubtasks === obj.id}
                subtasks={subtasks[obj.id] ?? []}
                isDeleting={deletingId === obj.id}
                togglingStepId={togglingStepId}
                onToggle={() => toggleExpand(obj.id)}
                onEdit={() => setEditingObjective(obj)}
                onAddStep={() => setAddingStepTo(obj)}
                onToggleStep={(task) => handleToggleStep(obj.id, task)}
                onEditStep={(task) => setEditingStep({ task, objectiveId: obj.id })}
                onDelete={() => handleDelete(obj.id)}
              />
            ))}
          </div>
        )}
    </>
  );

  const modals = (
    <>
      {isCreateOpen && (
        <CreateObjectiveModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={async (newId) => {
            setIsCreateOpen(false);
            await loadObjectives();
            // Expande o novo objetivo para mostrar as etapas criadas
            if (newId) {
              setExpandedId(newId);
              const obj = await api.getObjective(newId).catch(() => null);
              if (obj) setSubtasks((prev) => ({ ...prev, [newId]: obj.subtasks ?? [] }));
            }
          }}
        />
      )}

      {editingObjective && (
        <EditObjectiveModal
          objective={editingObjective}
          onClose={() => setEditingObjective(null)}
          onUpdated={async (updated) => {
            setObjectives((prev) => prev.map((o) => o.id === updated.id ? { ...o, ...updated } : o));
            setEditingObjective(null);
          }}
        />
      )}

      {addingStepTo && (
        <AddStepModal
          objective={addingStepTo}
          onClose={() => setAddingStepTo(null)}
          onCreated={async () => {
            setAddingStepTo(null);
            await refreshSubtasks(addingStepTo.id);
          }}
        />
      )}

      {editingStep && (
        <EditStepModal
          task={editingStep.task}
          onClose={() => setEditingStep(null)}
          onUpdated={async () => {
            const objId = editingStep.objectiveId;
            setEditingStep(null);
            await refreshSubtasks(objId);
          }}
        />
      )}
    </>
  );

  if (embedded) {
    return (
      <>
        {inner}
        {modals}
      </>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#11111a] text-white">
      <Background />

      <div className="relative z-10 min-h-screen px-4 pb-6 pt-5">
        <header className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Objetivos</p>
              <p className="text-xs text-white/40">Suas metas de longo prazo</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200 active:scale-[0.96]"
              aria-label="Criar objetivo"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/65 active:scale-[0.96]"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        {inner}
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chronotypeLabel={result.label}
        energyPeak={result.energyPeak}
      />

      {modals}
    </main>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// CARD DE OBJETIVO
// ──────────────────────────────────────────────────────────────────────────────

function ObjectiveCard({
  objective,
  isExpanded,
  isLoadingSubtasks,
  subtasks,
  isDeleting,
  togglingStepId,
  onToggle,
  onEdit,
  onAddStep,
  onToggleStep,
  onEditStep,
  onDelete,
}: {
  objective: Objective;
  isExpanded: boolean;
  isLoadingSubtasks: boolean;
  subtasks: api.Task[];
  isDeleting: boolean;
  togglingStepId: string | null;
  onToggle: () => void;
  onEdit: () => void;
  onAddStep: () => void;
  onToggleStep: (task: api.Task) => void;
  onEditStep: (task: api.Task) => void;
  onDelete: () => void;
}) {
  const isDone = objective.status === "done";

  return (
    <div className={`overflow-hidden rounded-[1.7rem] border shadow-xl shadow-black/20 backdrop-blur-2xl ${
      isDone ? "border-emerald-300/20 bg-emerald-400/[0.06]" : "border-white/10 bg-[#1b1b27]/82"
    }`}>
      <div className="p-4">
        {/* Cabeçalho: título + ações */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              {isDone && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />}
              <p className={`truncate text-sm font-semibold ${isDone ? "text-emerald-100 line-through opacity-70" : "text-white"}`}>
                {objective.title}
              </p>
            </div>
            {objective.deadline && (
              <div className="flex items-center gap-1.5 text-[0.68rem] text-white/38">
                <CalendarDays className="h-3 w-3" />
                Prazo: {objective.deadline}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={onEdit}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.055] text-white/45 active:scale-[0.94]"
              aria-label="Editar objetivo"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.055] text-white/35 active:scale-[0.94] disabled:opacity-40"
              aria-label="Excluir objetivo"
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mb-3">
          <div className="mb-1.5 flex items-center justify-between text-[0.68rem] text-white/35">
            <span>{objective.done_count} de {objective.subtask_count} etapas</span>
            <span>{objective.progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all ${isDone ? "bg-emerald-400" : "bg-gradient-to-r from-purple-400 to-fuchsia-300"}`}
              style={{ width: `${objective.progress}%` }}
            />
          </div>
        </div>

        {/* Botão expandir */}
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/14 px-3 py-2 text-xs font-semibold text-white/45 active:scale-[0.98]"
        >
          <span>{isExpanded ? "Ocultar etapas" : `Ver etapas (${objective.subtask_count})`}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Etapas expandidas */}
      {isExpanded && (
        <div className="border-t border-white/8 px-4 pb-4 pt-3">
          {isLoadingSubtasks ? (
            <div className="flex items-center gap-2 py-4 text-xs text-white/38">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Carregando etapas…
            </div>
          ) : (
            <>
              {subtasks.length === 0 ? (
                <p className="pb-3 pt-1 text-xs text-white/38">Nenhuma etapa adicionada ainda.</p>
              ) : (
                <div className="mb-3 space-y-2">
                  {subtasks.map((task) => {
                    const done = task.status === "done";
                    const toggling = togglingStepId === task.id;
                    return (
                      <div key={task.id} className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
                        <button
                          type="button"
                          onClick={() => onToggleStep(task)}
                          disabled={toggling}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition active:scale-[0.9] ${
                            done
                              ? "border-emerald-400 bg-emerald-400 text-[#11111a]"
                              : "border-white/25 bg-transparent text-transparent hover:border-purple-300/60"
                          }`}
                          aria-label={done ? "Desmarcar etapa" : "Marcar etapa como concluída"}
                        >
                          {toggling
                            ? <Loader2 className="h-3 w-3 animate-spin text-white/60" />
                            : <CheckCircle2 className="h-3.5 w-3.5" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-xs font-semibold ${done ? "text-white/40 line-through" : "text-white/80"}`}>
                            {task.title}
                          </p>
                          {(task.scheduled_date || task.start_time) && (
                            <p className="mt-0.5 text-[0.65rem] text-white/30">
                              {task.scheduled_date}
                              {task.start_time ? ` · ${task.start_time.slice(0, 5)}` : ""}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => onEditStep(task)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.055] text-white/40 active:scale-[0.94]"
                          aria-label="Editar etapa"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={onAddStep}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-purple-300/25 bg-purple-500/[0.06] py-2.5 text-xs font-semibold text-purple-200/70 active:scale-[0.98]"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar etapa
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MODAL DE CRIAÇÃO — 2 passos
// ──────────────────────────────────────────────────────────────────────────────

type DraftStep = { key: string; title: string; date: string; time: string };

function CreateObjectiveModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (newId?: string) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);

  // Passo 1
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Passo 2
  const [steps, setSteps] = useState<DraftStep[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function addStep() {
    setSteps((prev) => [...prev, { key: Math.random().toString(36).slice(2), title: "", date: "", time: "" }]);
  }
  function updateStep(key: string, patch: Partial<DraftStep>) {
    setSteps((prev) => prev.map((s) => s.key === key ? { ...s, ...patch } : s));
  }
  function removeStep(key: string) {
    setSteps((prev) => prev.filter((s) => s.key !== key));
  }

  function handleNextStep() {
    if (!title.trim()) { setStep1Error("Dê um nome ao objetivo."); return; }
    setStep1Error(null);
    setStep(2);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const obj = await api.createObjective({
        title: title.trim(),
        description: description.trim() || undefined,
        deadline: deadline || undefined,
      });

      const validSteps = steps.filter((s) => s.title.trim());
      if (validSteps.length > 0) {
        await Promise.all(
          validSteps.map((s) =>
            api.createTask({
              title: s.title.trim(),
              objective_id: obj.id,
              scheduled_date: s.date || undefined,
              start_time: s.time || undefined,
            } as any)
          )
        );
      }

      onCreated(obj.id);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Erro ao criar objetivo");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-[430px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#171720]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">

        {/* Cabeçalho com indicador de passo */}
        <div className="relative border-b border-white/10 px-5 pb-4 pt-4">
          <div className="mx-auto mb-3 h-1.5 w-11 rounded-full bg-white/18" />

          {/* Stepper visual */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.65rem] font-bold ${step === 1 ? "bg-purple-500 text-white" : "bg-purple-500/30 text-purple-200"}`}>1</div>
              <span className={`text-[0.65rem] font-semibold ${step === 1 ? "text-white/70" : "text-white/35"}`}>Objetivo</span>
            </div>
            <div className="h-px w-6 bg-white/15" />
            <div className="flex items-center gap-1.5">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.65rem] font-bold ${step === 2 ? "bg-purple-500 text-white" : "bg-white/10 text-white/28"}`}>2</div>
              <span className={`text-[0.65rem] font-semibold ${step === 2 ? "text-white/70" : "text-white/28"}`}>Etapas</span>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                <Target className="h-3.5 w-3.5" />
                {step === 1 ? "Novo objetivo" : title}
              </div>
              <h2 className="text-[1.35rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
                {step === 1 ? "Sobre o objetivo" : "Adicionar etapas"}
              </h2>
              <p className="mt-1 text-xs text-white/38">
                {step === 1 ? "Nome, prazo e descrição." : "Quais são os passos para chegar lá?"}
              </p>
            </div>
            <button onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/45 active:scale-[0.96]">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo do passo */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 1 ? (
            <div className="space-y-3">
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-white/42">Nome do objetivo</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Fazer o TCC da faculdade"
                  className={INPUT_CLS}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium text-white/42">Descrição (opcional)</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contexto, meta ou critério de sucesso…"
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/28 focus:border-purple-300/35"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium text-white/42">Prazo (opcional)</span>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={INPUT_CLS}
                />
              </label>

              {step1Error && <p className="text-xs font-medium text-rose-300">{step1Error}</p>}
            </div>
          ) : (
            <div>
              {steps.length > 0 && (
                <div className="mb-3 space-y-3">
                  {steps.map((s, idx) => (
                    <StepInput
                      key={s.key}
                      step={s}
                      index={idx}
                      autoFocus={idx === steps.length - 1}
                      onChange={(patch) => updateStep(s.key, patch)}
                      onRemove={() => removeStep(s.key)}
                    />
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={addStep}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-purple-300/20 bg-purple-500/[0.05] py-2.5 text-xs font-semibold text-purple-200/60 active:scale-[0.98]"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar etapa
              </button>

              {submitError && <p className="mt-3 text-xs font-medium text-rose-300">{submitError}</p>}
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="border-t border-white/10 px-5 py-4">
          {step === 1 ? (
            <>
              <button
                onClick={handleNextStep}
                className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/35 active:scale-[0.98]"
              >
                Próximo — Adicionar etapas →
              </button>
              <button onClick={onClose} className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-6 text-sm font-semibold text-white/55 active:scale-[0.98]">
                Cancelar
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                disabled={submitting}
                className="inline-flex min-h-14 w-[44%] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-semibold text-white/55 active:scale-[0.98] disabled:opacity-50"
              >
                ← Voltar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex min-h-14 flex-1 items-center justify-center rounded-2xl bg-purple-500 px-4 text-sm font-semibold text-white shadow-xl shadow-purple-950/35 active:scale-[0.98] disabled:opacity-60"
              >
                {submitting
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Criando…</>
                  : "Criar objetivo"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MODAL DE EDIÇÃO (com etapas existentes + adicionar novas)
// ──────────────────────────────────────────────────────────────────────────────

function EditObjectiveModal({
  objective,
  onClose,
  onUpdated,
}: {
  objective: Objective;
  onClose: () => void;
  onUpdated: (updated: Objective) => void;
}) {
  const [title, setTitle] = useState(objective.title);
  const [description, setDescription] = useState(objective.description ?? "");
  const [deadline, setDeadline] = useState(objective.deadline ?? "");
  // Etapas existentes (carregadas da API)
  const [existingSteps, setExistingSteps] = useState<api.Task[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(true);

  // Novas etapas digitadas nesta sessão (ainda não salvas)
  const [newSteps, setNewSteps] = useState<DraftStep[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega as etapas ao abrir
  useEffect(() => {
    api.getObjective(objective.id)
      .then((obj) => setExistingSteps(obj.subtasks ?? []))
      .catch(() => setExistingSteps([]))
      .finally(() => setLoadingSteps(false));
  }, [objective.id]);

  function addNewStep() {
    setNewSteps((prev) => [...prev, { key: Math.random().toString(36).slice(2), title: "", date: "", time: "" }]);
  }
  function updateNewStep(key: string, patch: Partial<DraftStep>) {
    setNewSteps((prev) => prev.map((s) => s.key === key ? { ...s, ...patch } : s));
  }
  function removeNewStep(key: string) {
    setNewSteps((prev) => prev.filter((s) => s.key !== key));
  }

  async function handleSubmit() {
    if (!title.trim()) { setError("O nome não pode ser vazio."); return; }
    setSubmitting(true);
    setError(null);
    try {
      // Atualiza o objetivo
      const updated = await api.updateObjective(objective.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        deadline: deadline || null,
      });

      // Cria as novas etapas
      const validNew = newSteps.filter((s) => s.title.trim());
      if (validNew.length > 0) {
        await Promise.all(
          validNew.map((s) =>
            api.createTask({
              title: s.title.trim(),
              objective_id: objective.id,
              scheduled_date: s.date || undefined,
              start_time: s.time || undefined,
            } as any)
          )
        );
      }

      onUpdated(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-[430px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#171720]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">

        <div className="relative border-b border-white/10 px-5 pb-4 pt-4">
          <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-white/18" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                <Edit3 className="h-3.5 w-3.5" />
                Editar objetivo
              </div>
              <h2 className="text-[1.35rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
                Editar objetivo
              </h2>
            </div>
            <button onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/45 active:scale-[0.96]">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-3">
            {/* Campos do objetivo */}
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-white/42">Nome do objetivo</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={INPUT_CLS} />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-white/42">Descrição (opcional)</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contexto, meta ou critério de sucesso…"
                rows={2}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/28 focus:border-purple-300/35"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-white/42">Prazo (opcional)</span>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className={INPUT_CLS}
              />
            </label>

            {/* Divisor */}
            <div className="!mt-5 border-t border-white/8 pt-4">
              <p className="mb-3 text-xs font-semibold text-white/42">Etapas</p>

              {loadingSteps ? (
                <div className="flex items-center gap-2 py-3 text-xs text-white/35">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Carregando etapas…
                </div>
              ) : (
                <>
                  {/* Etapas existentes */}
                  {existingSteps.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {existingSteps.map((task) => (
                        <div key={task.id} className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
                          <div className={`h-2 w-2 shrink-0 rounded-full ${
                            task.status === "done" ? "bg-emerald-400" :
                            task.status === "progress" ? "bg-purple-300" : "bg-white/25"
                          }`} />
                          <p className={`flex-1 truncate text-xs font-semibold ${task.status === "done" ? "text-white/40 line-through" : "text-white/75"}`}>
                            {task.title}
                          </p>
                          <span className="shrink-0 text-[0.65rem] text-white/28">
                            {STATUS_TASK[task.status] ?? task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Novas etapas (inputs) */}
                  {newSteps.length > 0 && (
                    <div className="mb-3 space-y-3">
                      {newSteps.map((s, idx) => (
                        <StepInput
                          key={s.key}
                          step={s}
                          index={existingSteps.length + idx}
                          autoFocus={idx === newSteps.length - 1}
                          onChange={(patch) => updateNewStep(s.key, patch)}
                          onRemove={() => removeNewStep(s.key)}
                        />
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addNewStep}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-purple-300/20 bg-purple-500/[0.05] py-2.5 text-xs font-semibold text-purple-200/60 active:scale-[0.98]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar etapa
                  </button>
                </>
              )}
            </div>

            {error && <p className="text-xs font-medium text-rose-300">{error}</p>}
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-4">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/35 active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando…</> : "Salvar alterações"}
          </button>
          <button onClick={onClose} className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-6 text-sm font-semibold text-white/55 active:scale-[0.98]">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MODAL DE ADICIONAR ETAPA
// ──────────────────────────────────────────────────────────────────────────────

function AddStepModal({
  objective,
  onClose,
  onCreated,
}: {
  objective: Objective;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim()) { setError("Dê um nome à etapa."); return; }
    setSubmitting(true);
    setError(null);
    try {
      await api.createTask({
        title: title.trim(),
        scheduled_date: date || undefined,
        priority,
        objective_id: objective.id,
      } as any);
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar etapa");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm">
      <div className="w-full max-w-[430px] rounded-[2rem] border border-white/10 bg-[#171720]/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-white/18" />

        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
              <Plus className="h-3.5 w-3.5" />
              Nova etapa
            </div>
            <h2 className="text-[1.45rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
              Adicionar etapa
            </h2>
            <p className="mt-1.5 text-xs text-white/38">
              em <span className="font-semibold text-white/60">{objective.title}</span>
            </p>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/45 active:scale-[0.96]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-white/42">Nome da etapa</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Pesquisar referências bibliográficas"
              className={INPUT_CLS}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-white/42">Data (opcional)</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={INPUT_CLS}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-white/42">Prioridade</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
              className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-[#222230] px-4 text-sm text-white outline-none focus:border-purple-300/35"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </label>

          {error && <p className="text-xs font-medium text-rose-300">{error}</p>}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/35 active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Criando…</> : <>Criar etapa <Plus className="ml-2 h-4 w-4" /></>}
        </button>

        <button onClick={onClose} className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-6 text-sm font-semibold text-white/55 active:scale-[0.98]">
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MODAL DE EDITAR ETAPA (título, data, hora, prioridade)
// ──────────────────────────────────────────────────────────────────────────────

function EditStepModal({
  task,
  onClose,
  onUpdated,
}: {
  task: api.Task;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [date, setDate] = useState(task.scheduled_date ?? "");
  const [time, setTime] = useState(task.start_time ? task.start_time.slice(0, 5) : "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    (task.priority as "low" | "medium" | "high") ?? "medium"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim()) { setError("Dê um nome à etapa."); return; }
    setSubmitting(true);
    setError(null);
    try {
      await api.updateTask(task.id, {
        title: title.trim(),
        scheduled_date: date || undefined,
        start_time: time || undefined,
        priority,
      } as any);
      onUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar etapa");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm">
      <div className="w-full max-w-[430px] rounded-[2rem] border border-white/10 bg-[#171720]/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-white/18" />

        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
              <Edit3 className="h-3.5 w-3.5" />
              Editar etapa
            </div>
            <h2 className="text-[1.45rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
              Editar etapa
            </h2>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/45 active:scale-[0.96]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-white/42">Nome da etapa</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={INPUT_CLS}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-white/42">Data</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${INPUT_CLS} [color-scheme:dark]`}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-white/42">Hora</span>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`${INPUT_CLS} [color-scheme:dark]`}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-white/42">Prioridade</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
              className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-[#222230] px-4 text-sm text-white outline-none focus:border-purple-300/35"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </label>

          {error && <p className="text-xs font-medium text-rose-300">{error}</p>}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/35 active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando…</> : "Salvar alterações"}
        </button>

        <button onClick={onClose} className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-6 text-sm font-semibold text-white/55 active:scale-[0.98]">
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// INPUT DE ETAPA (título + data opcional + hora opcional)
// ──────────────────────────────────────────────────────────────────────────────

function StepInput({
  step,
  index,
  autoFocus,
  onChange,
  onRemove,
}: {
  step: DraftStep;
  index: number;
  autoFocus?: boolean;
  onChange: (patch: Partial<DraftStep>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[0.6rem] font-bold text-white/40">
          {index + 1}
        </span>
        <input
          value={step.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={`Etapa ${index + 1}`}
          autoFocus={autoFocus}
          className="min-h-[38px] flex-1 rounded-xl border border-white/10 bg-white/[0.055] px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-300/35"
        />
        <button
          type="button"
          onClick={onRemove}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.055] text-white/35 active:scale-[0.94]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 pl-7">
        <div>
          <label className="mb-1 block text-[0.65rem] text-white/30">Data (opcional)</label>
          <input
            type="date"
            value={step.date}
            onChange={(e) => onChange({ date: e.target.value })}
            className="h-9 w-full rounded-xl border border-white/10 bg-white/[0.04] px-2.5 text-xs text-white/70 outline-none focus:border-purple-300/30 [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="mb-1 block text-[0.65rem] text-white/30">Hora (opcional)</label>
          <input
            type="time"
            value={step.time}
            onChange={(e) => onChange({ time: e.target.value })}
            className="h-9 w-full rounded-xl border border-white/10 bg-white/[0.04] px-2.5 text-xs text-white/70 outline-none focus:border-purple-300/30 [color-scheme:dark]"
          />
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// BACKGROUND
// ──────────────────────────────────────────────────────────────────────────────

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#151520_0%,#101018_48%,#13131d_100%)]" />
      <div className="absolute left-1/2 top-[-14rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-purple-700/22 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:30px_30px] opacity-[0.12]" />
    </div>
  );
}
