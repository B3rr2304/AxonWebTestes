import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Loader2,
  Plus,
  Target,
  Trash2,
  X,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import * as api from "../lib/api";
import type { Objective } from "../lib/api";
import { results, type ChronotypeResultKey } from "../data/results";
import AppBackground from "../components/layout/AppBackground";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import PageHeader from "../components/layout/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { ScrollArea } from "../components/ui/ScrollArea";

// ===========================================================================
// TIPOS E CONSTANTES GERAIS
// ===========================================================================

const validKeys: ChronotypeResultKey[] = [
  "Matutino",
  "Vespertino",
  "Noturno",
  "Misto",
  "Bimodal",
];

const STATUS_TASK: Record<string, string> = {
  todo: "A fazer",
  progress: "Em andamento",
  done: "Concluída",
  scheduled: "Agendada",
};

const INPUT_CLS =
  "min-h-[52px] w-full rounded-2xl border border-soft bg-surface-muted px-4 text-sm text-primary outline-none placeholder:text-soft focus:border-accent-soft";


// ===========================================================================
// PÁGINA DE OBJETIVOS
// ===========================================================================
// Lista objetivos de longo prazo, permite expandir etapas e abre modais de edição.
export default function Goals({ embedded = false }: { embedded?: boolean } = {}) {
  const navigate = useNavigate();

  // Estado principal da página e da sidebar.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<Record<string, api.Task[]>>({});
  const [loadingSubtasks, setLoadingSubtasks] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [addingStepTo, setAddingStepTo] = useState<Objective | null>(null);
  const [editingStep, setEditingStep] = useState<{
    task: api.Task;
    objectiveId: string;
  } | null>(null);
  const [togglingStepId, setTogglingStepId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [objectiveToDelete, setObjectiveToDelete] = useState<Objective | null>(
    null
  );

  // Cronotipo usado para alimentar a sidebar quando a página não está embutida.
  const resultKey: ChronotypeResultKey = (() => {
    const stored = localStorage.getItem("axon_chronotype");

    return stored && validKeys.includes(stored as ChronotypeResultKey)
      ? (stored as ChronotypeResultKey)
      : "Misto";
  })();
  const result = results[resultKey];

  // Carrega objetivos do usuário.
  async function loadObjectives() {
    try {
      const data = await api.getObjectives();
      setObjectives(data);
    } catch {
      // Mantém a página vazia em caso de erro inicial.
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!api.isLoggedIn()) {
      navigate("/login");
      return;
    }

    loadObjectives();
  }, [navigate]);

  // Expande o objetivo e carrega suas etapas sob demanda.
  async function toggleExpand(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);

    if (!subtasks[id]) {
      setLoadingSubtasks(id);
      try {
        const obj = await api.getObjective(id);
        setSubtasks((prev) => ({ ...prev, [id]: obj.subtasks ?? [] }));
      } catch {
        // Se falhar, mantém o objetivo aberto sem etapas.
      } finally {
        setLoadingSubtasks(null);
      }
    }
  }

  // Atualiza etapas e progresso do objetivo depois de criar/editar/concluir etapas.
  async function refreshSubtasks(objectiveId: string) {
    try {
      const obj = await api.getObjective(objectiveId);
      setSubtasks((prev) => ({ ...prev, [objectiveId]: obj.subtasks ?? [] }));
      setObjectives((prev) =>
        prev.map((objective) =>
          objective.id === objectiveId
            ? {
                ...objective,
                subtask_count: obj.subtask_count,
                done_count: obj.done_count,
                progress: obj.progress,
                status: obj.status,
              }
            : objective
        )
      );
    } catch {
      // Mantém os dados atuais em caso de erro.
    }
  }

  // Remove o objetivo e limpa a expansão local caso ele estivesse aberto.
  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await api.deleteObjective(id);
      setObjectives((prev) => prev.filter((o) => o.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch {
      // Mantém o objetivo na lista em caso de erro.
    } finally {
      setDeletingId(null);
      setObjectiveToDelete(null);
    }
  }

  // Marca/desmarca uma etapa e recalcula o progresso do objetivo.
  async function handleToggleStep(objectiveId: string, task: api.Task) {
    setTogglingStepId(task.id);
    const next =
      task.status === "done"
        ? { status: "todo" as api.TaskStatus, progress: 0 }
        : { status: "done" as api.TaskStatus, progress: 100 };
    try {
      await api.updateTask(task.id, next);
      await refreshSubtasks(objectiveId);
    } catch {
      // Mantém a etapa no estado atual em caso de erro.
    } finally {
      setTogglingStepId(null);
    }
  }

  // Conteúdo compartilhado entre a página própria e o modo embedded no Planning.
  const inner = (
    <>
      {embedded && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-[1.7rem] font-semibold leading-tight tracking-[-0.04em] text-primary">
              Meus Objetivos
            </h1>
            <p className="mt-1 text-sm text-muted">
              Metas que o Axon ajuda a alcançar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-full border border-accent-soft bg-accent-soft px-4 py-2.5 text-sm font-semibold text-accent shadow-card transition active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            Novo
          </button>
        </div>
      )}

      {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando objetivos…
          </div>
        ) : objectives.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Nenhum objetivo ainda"
            description="Crie seu primeiro objetivo e adicione as etapas que vão te levar até ele."
            actionLabel="Criar objetivo"
            onAction={() => setIsCreateOpen(true)}
          />
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
                onDelete={() => setObjectiveToDelete(obj)}
              />
            ))}
          </div>
        )}
    </>
  );

  // Modais ficam fora do conteúdo para preservar o empilhamento visual.
  const modals = (
    <>
      <ConfirmDialog
        isOpen={!!objectiveToDelete}
        title="Remover objetivo?"
        description={
          objectiveToDelete
            ? `Isso vai excluir "${objectiveToDelete.title}" e todas as suas etapas. Esta ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Excluir"
        variant="danger"
        icon={Trash2}
        loading={!!objectiveToDelete && deletingId === objectiveToDelete.id}
        onConfirm={() =>
          objectiveToDelete && handleDelete(objectiveToDelete.id)
        }
        onClose={() => setObjectiveToDelete(null)}
      />
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
    <main className="relative min-h-screen overflow-hidden bg-app text-primary">
      <AppBackground />

      <div className="relative z-10 min-h-screen px-4 pb-6 pt-5">
        <PageHeader
          leadingVariant="icon"
          leadingIcon={Target}
          title="Objetivos"
          subtitle="Suas metas de longo prazo"
          onMenuClick={() => setIsSidebarOpen(true)}
          rightSlot={
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent-soft bg-accent-soft text-accent transition active:scale-[0.96]"
              aria-label="Criar objetivo"
            >
              <Plus className="h-5 w-5" />
            </button>
          }
        />

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

// ===========================================================================
// CARD DE OBJETIVO
// ===========================================================================
// Exibe progresso, prazo, ações rápidas e etapas vinculadas ao objetivo.
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
    <div className={`overflow-hidden rounded-[1.7rem] border shadow-card backdrop-blur-2xl ${
      isDone ? "border-emerald-300/25 bg-emerald-400/[0.08]" : "border-soft bg-surface-elevated"
    }`}>
      <div className="p-4">
        {/* Cabeçalho: título + ações */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              {isDone && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />}
              <p className={`truncate text-sm font-semibold ${isDone ? "text-emerald-700 line-through opacity-70 dark:text-emerald-100" : "text-primary"}`}>
                {objective.title}
              </p>
            </div>
            {objective.deadline && (
              <div className="flex items-center gap-1.5 text-[0.68rem] text-muted">
                <CalendarDays className="h-3 w-3" />
                Prazo: {objective.deadline}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={onEdit}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-muted text-muted transition active:scale-[0.94]"
              aria-label="Editar objetivo"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-muted text-muted transition active:scale-[0.94] disabled:opacity-40"
              aria-label="Excluir objetivo"
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mb-3">
          <div className="mb-1.5 flex items-center justify-between text-[0.68rem] text-muted">
            <span>{objective.done_count} de {objective.subtask_count} etapas</span>
            <span>{objective.progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
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
          className="flex w-full items-center justify-between rounded-2xl border border-soft bg-surface-muted px-3 py-2 text-xs font-semibold text-muted transition active:scale-[0.98]"
        >
          <span>{isExpanded ? "Ocultar etapas" : `Ver etapas (${objective.subtask_count})`}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Etapas expandidas */}
      {isExpanded && (
        <div className="border-t border-[var(--border-soft)] px-4 pb-4 pt-3">
          {isLoadingSubtasks ? (
            <div className="flex items-center gap-2 py-4 text-xs text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Carregando etapas…
            </div>
          ) : (
            <>
              {subtasks.length === 0 ? (
                <p className="pb-3 pt-1 text-xs text-muted">Nenhuma etapa adicionada ainda.</p>
              ) : (
                <div className="mb-3 space-y-2">
                  {subtasks.map((task) => {
                    const done = task.status === "done";
                    const toggling = togglingStepId === task.id;
                    return (
                      <div key={task.id} className="flex items-center gap-2.5 rounded-xl border border-[var(--border-soft)] bg-surface-muted px-3 py-2">
                        <button
                          type="button"
                          onClick={() => onToggleStep(task)}
                          disabled={toggling}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition active:scale-[0.9] ${
                            done
                              ? "border-emerald-400 bg-emerald-400 text-[#11111a]"
                              : "border-soft bg-transparent text-transparent hover:border-accent-soft"
                          }`}
                          aria-label={done ? "Desmarcar etapa" : "Marcar etapa como concluída"}
                        >
                          {toggling
                            ? <Loader2 className="h-3 w-3 animate-spin text-secondary" />
                            : <CheckCircle2 className="h-3.5 w-3.5" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-xs font-semibold ${done ? "text-soft line-through" : "text-primary"}`}>
                            {task.title}
                          </p>
                          {(task.scheduled_date || task.start_time) && (
                            <p className="mt-0.5 text-[0.65rem] text-soft">
                              {task.scheduled_date}
                              {task.start_time ? ` · ${task.start_time.slice(0, 5)}` : ""}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => onEditStep(task)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-muted transition active:scale-[0.94]"
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
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-accent-soft bg-accent-soft py-2.5 text-xs font-semibold text-accent transition active:scale-[0.98]"
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

// ===========================================================================
// MODAL DE CRIAÇÃO DE OBJETIVO
// ===========================================================================
// Passo 1 cria o objetivo; passo 2 permite adicionar etapas iniciais.
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
    setSteps((prev) => [
      ...prev,
      { key: Math.random().toString(36).slice(2), title: "", date: "", time: "" },
    ]);
  }

  function updateStep(key: string, patch: Partial<DraftStep>) {
    setSteps((prev) =>
      prev.map((stepItem) =>
        stepItem.key === key ? { ...stepItem, ...patch } : stepItem
      )
    );
  }
  function removeStep(key: string) {
    setSteps((prev) => prev.filter((s) => s.key !== key));
  }

  function handleNextStep() {
    if (!title.trim()) {
      setStep1Error("Dê um nome ao objetivo.");
      return;
    }

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
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 px-3 pb-3 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-[430px] flex-col overflow-hidden rounded-[2rem] border border-soft bg-surface-elevated text-primary shadow-soft backdrop-blur-2xl">

        {/* Cabeçalho com indicador de passo */}
        <div className="relative border-b border-[var(--border-soft)] px-5 pb-4 pt-4">
          <div className="mx-auto mb-3 h-1.5 w-11 rounded-full bg-[var(--border-medium)]" />

          {/* Stepper visual */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.65rem] font-bold ${step === 1 ? "bg-[var(--accent-strong)] text-white" : "bg-accent-soft text-accent"}`}>1</div>
              <span className={`text-[0.65rem] font-semibold ${step === 1 ? "text-secondary" : "text-muted"}`}>Objetivo</span>
            </div>
            <div className="h-px w-6 bg-[var(--border-soft)]" />
            <div className="flex items-center gap-1.5">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.65rem] font-bold ${step === 2 ? "bg-purple-500 text-white" : "bg-surface-muted text-soft"}`}>2</div>
              <span className={`text-[0.65rem] font-semibold ${step === 2 ? "text-secondary" : "text-soft"}`}>Etapas</span>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-accent-soft bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
                <Target className="h-3.5 w-3.5" />
                {step === 1 ? "Novo objetivo" : title}
              </div>
              <h2 className="text-[1.35rem] font-semibold leading-[1.05] tracking-[-0.05em] text-primary">
                {step === 1 ? "Sobre o objetivo" : "Adicionar etapas"}
              </h2>
              <p className="mt-1 text-xs text-muted">
                {step === 1 ? "Nome, prazo e descrição." : "Quais são os passos para chegar lá?"}
              </p>
            </div>
            <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-soft bg-surface-muted text-muted transition active:scale-[0.96]">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo do passo */}
        <ScrollArea className="flex-1" contentClassName="px-5 py-4">
          {step === 1 ? (
            <div className="space-y-3">
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-muted">Nome do objetivo</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Fazer o TCC da faculdade"
                  className={INPUT_CLS}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium text-muted">Descrição (opcional)</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contexto, meta ou critério de sucesso…"
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-soft bg-surface-muted px-4 py-3 text-sm leading-6 text-primary outline-none placeholder:text-soft focus:border-accent-soft"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium text-muted">Prazo (opcional)</span>
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
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-accent-soft bg-accent-soft py-2.5 text-xs font-semibold text-accent transition active:scale-[0.98]"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar etapa
              </button>

              {submitError && <p className="mt-3 text-xs font-medium text-rose-300">{submitError}</p>}
            </div>
          )}
        </ScrollArea>

        {/* Botões de ação */}
        <div className="border-t border-[var(--border-soft)] px-5 py-4">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[var(--accent-strong)] px-6 text-sm font-semibold text-white shadow-card transition active:scale-[0.98]"
              >
                Próximo — Adicionar etapas →
              </button>
              <button type="button" onClick={onClose} className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-soft bg-surface-muted px-6 text-sm font-semibold text-secondary transition active:scale-[0.98]">
                Cancelar
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={submitting}
                className="inline-flex min-h-14 w-[44%] items-center justify-center rounded-2xl border border-soft bg-surface-muted px-4 text-sm font-semibold text-secondary transition active:scale-[0.98] disabled:opacity-50"
              >
                ← Voltar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex min-h-14 flex-1 items-center justify-center rounded-2xl bg-[var(--accent-strong)] px-4 text-sm font-semibold text-white shadow-card transition active:scale-[0.98] disabled:opacity-60"
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

// ===========================================================================
// MODAL DE EDIÇÃO DE OBJETIVO
// ===========================================================================
// Edita dados principais e permite revisar/criar etapas do objetivo.
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
  // Etapas existentes carregadas da API.
  const [existingSteps, setExistingSteps] = useState<api.Task[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(true);

  // Novas etapas digitadas nesta sessão, ainda não salvas.
  const [newSteps, setNewSteps] = useState<DraftStep[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega as etapas ao abrir o modal.
  useEffect(() => {
    api.getObjective(objective.id)
      .then((obj) => setExistingSteps(obj.subtasks ?? []))
      .catch(() => setExistingSteps([]))
      .finally(() => setLoadingSteps(false));
  }, [objective.id]);

  function addNewStep() {
    setNewSteps((prev) => [
      ...prev,
      { key: Math.random().toString(36).slice(2), title: "", date: "", time: "" },
    ]);
  }

  function updateNewStep(key: string, patch: Partial<DraftStep>) {
    setNewSteps((prev) =>
      prev.map((stepItem) =>
        stepItem.key === key ? { ...stepItem, ...patch } : stepItem
      )
    );
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
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 px-3 pb-3 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-[430px] flex-col overflow-hidden rounded-[2rem] border border-soft bg-surface-elevated text-primary shadow-soft backdrop-blur-2xl">

        <div className="relative border-b border-[var(--border-soft)] px-5 pb-4 pt-4">
          <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-[var(--border-medium)]" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent-soft bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
                <Edit3 className="h-3.5 w-3.5" />
                Editar objetivo
              </div>
              <h2 className="text-[1.35rem] font-semibold leading-[1.05] tracking-[-0.05em] text-primary">
                Editar objetivo
              </h2>
            </div>
            <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-soft bg-surface-muted text-muted transition active:scale-[0.96]">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <ScrollArea className="flex-1" contentClassName="px-5 py-4">
          <div className="space-y-3">
            {/* Campos do objetivo */}
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-muted">Nome do objetivo</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={INPUT_CLS} />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-muted">Descrição (opcional)</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contexto, meta ou critério de sucesso…"
                rows={2}
                className="w-full resize-none rounded-2xl border border-soft bg-surface-muted px-4 py-3 text-sm leading-6 text-primary outline-none placeholder:text-soft focus:border-accent-soft"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-muted">Prazo (opcional)</span>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className={INPUT_CLS}
              />
            </label>

            {/* Divisor */}
            <div className="!mt-5 border-t border-[var(--border-soft)] pt-4">
              <p className="mb-3 text-xs font-semibold text-muted">Etapas</p>

              {loadingSteps ? (
                <div className="flex items-center gap-2 py-3 text-xs text-muted">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Carregando etapas…
                </div>
              ) : (
                <>
                  {/* Etapas existentes */}
                  {existingSteps.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {existingSteps.map((task) => (
                        <div key={task.id} className="flex items-center gap-2.5 rounded-xl border border-[var(--border-soft)] bg-surface-muted px-3 py-2">
                          <div className={`h-2 w-2 shrink-0 rounded-full ${
                            task.status === "done" ? "bg-emerald-400" :
                            task.status === "progress" ? "bg-[var(--accent)]" : "bg-[var(--text-soft)]"
                          }`} />
                          <p className={`flex-1 truncate text-xs font-semibold ${task.status === "done" ? "text-soft line-through" : "text-primary"}`}>
                            {task.title}
                          </p>
                          <span className="shrink-0 text-[0.65rem] text-soft">
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
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-accent-soft bg-accent-soft py-2.5 text-xs font-semibold text-accent transition active:scale-[0.98]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar etapa
                  </button>
                </>
              )}
            </div>

            {error && <p className="text-xs font-medium text-rose-300">{error}</p>}
          </div>
        </ScrollArea>

        <div className="border-t border-[var(--border-soft)] px-5 py-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-card active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando…</> : "Salvar alterações"}
          </button>
          <button type="button" onClick={onClose} className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-soft bg-surface-muted px-6 text-sm font-semibold text-secondary transition active:scale-[0.98]">
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

// ===========================================================================
// MODAL DE NOVA ETAPA
// ===========================================================================

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
  const [priority, setPriority] =
    useState<"low" | "medium" | "high">("medium");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Dê um nome à etapa.");
      return;
    }
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
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 px-3 pb-3 backdrop-blur-sm">
      <div className="w-full max-w-[430px] rounded-[2rem] border border-soft bg-surface-elevated p-5 text-primary shadow-soft backdrop-blur-2xl">
        <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-[var(--border-medium)]" />

        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent-soft bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
              <Plus className="h-3.5 w-3.5" />
              Nova etapa
            </div>
            <h2 className="text-[1.45rem] font-semibold leading-[1.05] tracking-[-0.05em] text-primary">
              Adicionar etapa
            </h2>
            <p className="mt-1.5 text-xs text-muted">
              em <span className="font-semibold text-secondary">{objective.title}</span>
            </p>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-soft bg-surface-muted text-muted transition active:scale-[0.96]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-muted">Nome da etapa</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Pesquisar referências bibliográficas"
              className={INPUT_CLS}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-muted">Data (opcional)</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={INPUT_CLS}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-muted">Prioridade</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
              className="min-h-[52px] w-full rounded-2xl border border-soft bg-surface-muted px-4 text-sm text-primary outline-none focus:border-accent-soft"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </label>

          {error && <p className="text-xs font-medium text-rose-300">{error}</p>}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[var(--accent-strong)] px-6 text-sm font-semibold text-white shadow-card transition active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Criando…</> : <>Criar etapa <Plus className="ml-2 h-4 w-4" /></>}
        </button>

        <button type="button" onClick={onClose} className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-soft bg-surface-muted px-6 text-sm font-semibold text-secondary transition active:scale-[0.98]">
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MODAL DE EDITAR ETAPA (título, data, hora, prioridade)
// ──────────────────────────────────────────────────────────────────────────────

// ===========================================================================
// MODAL DE EDIÇÃO DE ETAPA
// ===========================================================================

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
  const [time, setTime] = useState(
    task.start_time ? task.start_time.slice(0, 5) : ""
  );
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    (task.priority as "low" | "medium" | "high") ?? "medium"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Dê um nome à etapa.");
      return;
    }
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
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 px-3 pb-3 backdrop-blur-sm">
      <div className="w-full max-w-[430px] rounded-[2rem] border border-soft bg-surface-elevated p-5 text-primary shadow-soft backdrop-blur-2xl">
        <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-[var(--border-medium)]" />

        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent-soft bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
              <Edit3 className="h-3.5 w-3.5" />
              Editar etapa
            </div>
            <h2 className="text-[1.45rem] font-semibold leading-[1.05] tracking-[-0.05em] text-primary">
              Editar etapa
            </h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-soft bg-surface-muted text-muted transition active:scale-[0.96]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-muted">Nome da etapa</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={INPUT_CLS}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-muted">Data</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${INPUT_CLS} [color-scheme:dark]`}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-muted">Hora</span>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`${INPUT_CLS} [color-scheme:dark]`}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-muted">Prioridade</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
              className="min-h-[52px] w-full rounded-2xl border border-soft bg-surface-muted px-4 text-sm text-primary outline-none focus:border-accent-soft"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </label>

          {error && <p className="text-xs font-medium text-rose-300">{error}</p>}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[var(--accent-strong)] px-6 text-sm font-semibold text-white shadow-card transition active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando…</> : "Salvar alterações"}
        </button>

        <button type="button" onClick={onClose} className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-soft bg-surface-muted px-6 text-sm font-semibold text-secondary transition active:scale-[0.98]">
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// INPUT DE ETAPA (título + data opcional + hora opcional)
// ──────────────────────────────────────────────────────────────────────────────

// ===========================================================================
// INPUT REUTILIZÁVEL DE ETAPA
// ===========================================================================

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
    <div className="rounded-2xl border border-soft bg-surface-muted p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[0.6rem] font-bold text-muted">
          {index + 1}
        </span>
        <input
          value={step.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={`Etapa ${index + 1}`}
          autoFocus={autoFocus}
          className="min-h-[38px] flex-1 rounded-xl border border-soft bg-surface-muted px-3 text-sm text-primary outline-none placeholder:text-soft focus:border-accent-soft"
        />
        <button
          type="button"
          onClick={onRemove}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-muted transition active:scale-[0.94]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 pl-7">
        <div>
          <label className="mb-1 block text-[0.65rem] text-soft">Data (opcional)</label>
          <input
            type="date"
            value={step.date}
            onChange={(e) => onChange({ date: e.target.value })}
            className="h-9 w-full rounded-xl border border-soft bg-surface-muted px-2.5 text-xs text-primary outline-none focus:border-accent-soft"
          />
        </div>
        <div>
          <label className="mb-1 block text-[0.65rem] text-soft">Hora (opcional)</label>
          <input
            type="time"
            value={step.time}
            onChange={(e) => onChange({ time: e.target.value })}
            className="h-9 w-full rounded-xl border border-soft bg-surface-muted px-2.5 text-xs text-primary outline-none focus:border-accent-soft"
          />
        </div>
      </div>
    </div>
  );
}

