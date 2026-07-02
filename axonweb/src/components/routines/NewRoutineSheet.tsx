import { useEffect, useState } from "react";
import { Plus, Sparkles } from "lucide-react";

import BottomSheet from "../ui/BottomSheet";
import ConfirmDialog from "../ui/ConfirmDialog";
import * as api from "../../lib/api";
import {
  blankItem,
  draftToCreateInput,
  itemValid,
  RoutineItemEditor,
  type DraftItem,
} from "./RoutineItem";

// ===========================================================================
// TIPOS DO COMPONENTE
// ===========================================================================

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
};

// ===========================================================================
// HELPERS DE DATA
// ===========================================================================

// Retorna a data local no formato aceito pelo input date: YYYY-MM-DD.
function todayISO() {
  return new Date().toLocaleDateString("en-CA");
}

// ===========================================================================
// SHEET DE CRIAÇÃO DE ROTINA
// ===========================================================================

export default function NewRoutineSheet({ isOpen, onClose, onCreated }: Props) {
  // ---------------------------------------------------------------------------
  // Estado do fluxo em etapas
  // ---------------------------------------------------------------------------
  const [step, setStep] = useState(1);

  // ---------------------------------------------------------------------------
  // Campos principais da rotina
  // ---------------------------------------------------------------------------
  const [name, setName] = useState("");
  const [items, setItems] = useState<DraftItem[]>([blankItem()]);
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState("");

  // ---------------------------------------------------------------------------
  // Estados de confirmação, envio e erro
  // ---------------------------------------------------------------------------
  const [showNoEndConfirm, setShowNoEndConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Reset ao abrir
  // ---------------------------------------------------------------------------
  // Garante que uma nova abertura sempre comece limpa no passo 1.
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setName("");
      setItems([blankItem()]);
      setStartDate(todayISO());
      setEndDate("");
      setShowNoEndConfirm(false);
      setSubmitting(false);
      setError(null);
    }
  }, [isOpen]);

  // ---------------------------------------------------------------------------
  // Validações por etapa
  // ---------------------------------------------------------------------------
  const nameValid = name.trim().length > 0;
  const itemsValid = items.length > 0 && items.every(itemValid);

  const stepTitle =
    step === 1 ? "Nome da rotina" : step === 2 ? "Itens da rotina" : "Período";

  // ---------------------------------------------------------------------------
  // Edição dos itens da rotina
  // ---------------------------------------------------------------------------
  function updateItem(key: string, patch: Partial<DraftItem>) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.key === key ? { ...item, ...patch } : item
      )
    );
  }

  function toggleDay(key: string, day: number) {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.key !== key) return item;

        const days = item.days.includes(day)
          ? item.days.filter((currentDay) => currentDay !== day)
          : [...item.days, day].sort((a, b) => a - b);

        return { ...item, days };
      })
    );
  }

  function addItem() {
    setItems((currentItems) => [...currentItems, blankItem()]);
  }

  function removeItem(key: string) {
    setItems((currentItems) =>
      currentItems.length > 1
        ? currentItems.filter((item) => item.key !== key)
        : currentItems
    );
  }

  // ---------------------------------------------------------------------------
  // Criação da rotina
  // ---------------------------------------------------------------------------
  // Se não houver data final, pede confirmação antes de criar uma rotina contínua.
  function handleCreateClick() {
    setError(null);

    if (!endDate) {
      setShowNoEndConfirm(true);
      return;
    }

    submit();
  }

  async function submit() {
    setShowNoEndConfirm(false);
    setSubmitting(true);
    setError(null);

    try {
      const payload: api.RoutineCreateInput = {
        name: name.trim(),
        start_date: startDate || undefined,
        end_date: endDate || null,
        items: items.map(draftToCreateInput),
      };

      await api.createRoutine(payload);

      onCreated();
      onClose();
    } catch (e) {
      setError((e as Error).message || "Não foi possível criar a rotina.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        dismissDisabled={submitting}
        title={stepTitle}
        subtitle={`Passo ${step} de 3`}
        ariaLabel="Criar nova rotina"
        maxHeightClassName="max-h-[92vh]"
        footer={
          <SheetFooter
            step={step}
            submitting={submitting}
            nameValid={nameValid}
            itemsValid={itemsValid}
            onBack={() => setStep((currentStep) => currentStep - 1)}
            onNext={() => setStep((currentStep) => currentStep + 1)}
            onCreate={handleCreateClick}
          />
        }
      >
        <StepProgress step={step} />

        {step === 1 && <RoutineNameStep name={name} onNameChange={setName} />}

        {step === 2 && (
          <RoutineItemsStep
            items={items}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onToggleDay={toggleDay}
            onRemoveItem={removeItem}
          />
        )}

        {step === 3 && (
          <RoutinePeriodStep
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        )}

        {error && <ErrorMessage message={error} />}
      </BottomSheet>

      {/* Cobre o painel durante a criação; fica acima da sheet. */}
      {submitting && <SubmittingOverlay />}

      <NoEndDateConfirmModal
        isOpen={showNoEndConfirm}
        onCancel={() => setShowNoEndConfirm(false)}
        onConfirm={submit}
      />
    </>
  );
}

// ===========================================================================
// PROGRESSO DA SHEET
// ===========================================================================

function StepProgress({ step }: { step: number }) {
  return (
    <div className="mb-4 flex gap-1.5">
      {[1, 2, 3].map((currentStep) => (
        <div
          key={currentStep}
          className={`h-1 flex-1 rounded-full ${
            currentStep <= step ? "bg-purple-400" : "bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}

// ===========================================================================
// ETAPAS DO FORMULÁRIO
// ===========================================================================

function RoutineNameStep({
  name,
  onNameChange,
}: {
  name: string;
  onNameChange: (value: string) => void;
}) {
  return (
    <div className="py-2">
      <label className="text-sm font-medium text-white/70">
        Como você quer chamar essa rotina?
      </label>

      <input
        autoFocus
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Ex.: Treino, Estudos, Skincare..."
        className="mt-3 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-300/40"
      />
    </div>
  );
}

function RoutineItemsStep({
  items,
  onAddItem,
  onUpdateItem,
  onToggleDay,
  onRemoveItem,
}: {
  items: DraftItem[];
  onAddItem: () => void;
  onUpdateItem: (key: string, patch: Partial<DraftItem>) => void;
  onToggleDay: (key: string, day: number) => void;
  onRemoveItem: (key: string) => void;
}) {
  return (
    <div className="space-y-3 py-2">
      {items.map((item, index) => (
        <RoutineItemEditor
          key={item.key}
          item={item}
          index={index}
          canRemove={items.length > 1}
          onChange={(patch) => onUpdateItem(item.key, patch)}
          onToggleDay={(day) => onToggleDay(item.key, day)}
          onRemove={() => onRemoveItem(item.key)}
        />
      ))}

      <button
        onClick={onAddItem}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] py-3 text-sm font-medium text-white/55 active:scale-[0.98]"
      >
        <Plus className="h-4 w-4" />
        Adicionar item
      </button>
    </div>
  );
}

function RoutinePeriodStep({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}) {
  return (
    <div className="space-y-4 py-2">
      <div>
        <label className="text-sm font-medium text-white/70">
          Data de início
        </label>

        <input
          type="date"
          value={startDate}
          min={todayISO()}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-purple-300/40 [color-scheme:dark]"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-white/70">
          Data de término <span className="text-white/35">(opcional)</span>
        </label>

        <input
          type="date"
          value={endDate}
          min={startDate || todayISO()}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-purple-300/40 [color-scheme:dark]"
        />

        {!endDate && (
          <p className="mt-2 text-xs leading-5 text-white/40">
            Sem data de término, o Axon continua gerando tarefas
            indefinidamente.
          </p>
        )}
      </div>
    </div>
  );
}

// ===========================================================================
// FOOTER E FEEDBACKS
// ===========================================================================

function SheetFooter({
  step,
  submitting,
  nameValid,
  itemsValid,
  onBack,
  onNext,
  onCreate,
}: {
  step: number;
  submitting: boolean;
  nameValid: boolean;
  itemsValid: boolean;
  onBack: () => void;
  onNext: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      {step > 1 && (
        <button
          onClick={onBack}
          disabled={submitting}
          className="rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white/60 active:scale-[0.97] disabled:opacity-40"
        >
          Voltar
        </button>
      )}

      {step < 3 ? (
        <button
          onClick={onNext}
          disabled={step === 1 ? !nameValid : !itemsValid}
          className="flex-1 rounded-full bg-purple-500/90 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 active:scale-[0.98] disabled:opacity-35"
        >
          Próximo
        </button>
      ) : (
        <button
          onClick={onCreate}
          disabled={submitting}
          className="flex-1 rounded-full bg-purple-500/90 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? "Criando rotina..." : "Criar rotina"}
        </button>
      )}
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="mt-2 rounded-2xl border border-red-300/20 bg-red-500/10 p-3 text-sm leading-6 text-red-100/80">
      {message}
    </div>
  );
}

function SubmittingOverlay() {
  return (
    <div className="fixed inset-0 z-[140] flex flex-col items-center justify-center gap-3 bg-[#11101a]/85 backdrop-blur-sm">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-purple-300" />

      <p className="text-sm font-medium text-white/70">
        O Axon está montando sua rotina...
      </p>

      <p className="text-xs text-white/40">
        Encaixando os itens nos seus melhores horários.
      </p>
    </div>
  );
}

// ===========================================================================
// CONFIRMAÇÃO DE ROTINA SEM DATA FINAL
// ===========================================================================

function NoEndDateConfirmModal({
  isOpen,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title="Rotina sem data de término"
      description="Você está criando uma rotina sem data de término. O Axon vai continuar gerando tarefas indefinidamente. Deseja continuar?"
      confirmLabel="Confirmar"
      icon={Sparkles}
      onConfirm={onConfirm}
      onClose={onCancel}
    />
  );
}
