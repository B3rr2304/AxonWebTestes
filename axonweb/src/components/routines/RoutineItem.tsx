import { Clock, Sparkles, Trash2 } from "lucide-react";

import type {
  RoutineItem,
  RoutineItemCreateInput,
  RoutineItemUpdateInput,
} from "../../lib/api";

// ===========================================================================
// TIPOS DO ITEM DE ROTINA
// ===========================================================================

export type ItemMode = "fixed" | "axon";

export type DraftItem = {
  key: string;
  title: string;

  // 0 = Seg ... 6 = Dom, no padrão usado pela tela de rotinas.
  days: number[];

  mode: ItemMode;

  // Campos usados quando o item tem horário fixo.
  startTime: string;
  endTime: string;

  // Duração em minutos, mantida como string para controlar o input.
  duration: string;
};

// ===========================================================================
// CONSTANTES
// ===========================================================================

export const WEEKDAYS = [
  { idx: 0, label: "Seg" },
  { idx: 1, label: "Ter" },
  { idx: 2, label: "Qua" },
  { idx: 3, label: "Qui" },
  { idx: 4, label: "Sex" },
  { idx: 5, label: "Sáb" },
  { idx: 6, label: "Dom" },
];

// ===========================================================================
// CONVERSÕES ENTRE DRAFT E API
// ===========================================================================

// Cria um item vazio para o fluxo de nova rotina.
export function blankItem(): DraftItem {
  return {
    key: Math.random().toString(36).slice(2),
    title: "",
    days: [],
    mode: "fixed",
    startTime: "",
    endTime: "",
    duration: "",
  };
}

// Converte o item salvo no backend para o formato editável da interface.
export function itemToDraft(item: RoutineItem): DraftItem {
  const isFlexible = item.duration_minutes != null;

  return {
    key: item.id,
    title: item.title,
    days: item.days_of_week,
    mode: isFlexible ? "axon" : "fixed",
    startTime: item.start_time ?? "",
    endTime: item.end_time ?? "",
    duration: isFlexible ? String(item.duration_minutes) : "",
  };
}

// Valida se o item tem dados suficientes para criação/edição.
export function itemValid(item: DraftItem): boolean {
  if (!item.title.trim()) return false;
  if (item.days.length === 0) return false;

  if (item.mode === "fixed") {
    return !!item.startTime && !!item.endTime && item.startTime < item.endTime;
  }

  const duration = Number(item.duration);

  return Number.isFinite(duration) && duration > 0;
}

// Monta o payload de criação esperado pelo backend.
export function draftToCreateInput(
  item: DraftItem
): RoutineItemCreateInput {
  return item.mode === "fixed"
    ? {
        title: item.title.trim(),
        days_of_week: item.days,
        start_time: item.startTime,
        end_time: item.endTime,
      }
    : {
        title: item.title.trim(),
        days_of_week: item.days,
        duration_minutes: Number(item.duration),
      };
}

// Para PATCH: envia null no modo que não está em uso.
// Isso evita deixar o item salvo com horário fixo e duração preenchidos ao mesmo tempo.
export function draftToUpdateInput(
  item: DraftItem
): RoutineItemUpdateInput {
  const base = {
    title: item.title.trim(),
    days_of_week: item.days,
  };

  return item.mode === "fixed"
    ? {
        ...base,
        start_time: item.startTime,
        end_time: item.endTime,
        duration_minutes: null,
      }
    : {
        ...base,
        start_time: null,
        end_time: null,
        duration_minutes: Number(item.duration),
      };
}

// ===========================================================================
// EDITOR VISUAL DO ITEM
// ===========================================================================

export function RoutineItemEditor({
  item,
  index,
  canRemove,
  onChange,
  onToggleDay,
  onRemove,
}: {
  item: DraftItem;
  index?: number;
  canRemove: boolean;
  onChange: (patch: Partial<DraftItem>) => void;
  onToggleDay: (day: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
      <RoutineItemHeader
        index={index}
        canRemove={canRemove}
        onRemove={onRemove}
      />

      <RoutineTitleInput
        title={item.title}
        onChange={(title) => onChange({ title })}
      />

      <WeekdaySelector selectedDays={item.days} onToggleDay={onToggleDay} />

      <RoutineModeSelector
        mode={item.mode}
        onChange={(mode) => onChange({ mode })}
      />

      {item.mode === "fixed" ? (
        <FixedTimeFields
          startTime={item.startTime}
          endTime={item.endTime}
          onStartTimeChange={(startTime) => onChange({ startTime })}
          onEndTimeChange={(endTime) => onChange({ endTime })}
        />
      ) : (
        <FlexibleDurationField
          duration={item.duration}
          onChange={(duration) => onChange({ duration })}
        />
      )}
    </div>
  );
}

// ===========================================================================
// SUBCOMPONENTES DO EDITOR
// ===========================================================================

function RoutineItemHeader({
  index,
  canRemove,
  onRemove,
}: {
  index?: number;
  canRemove: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35">
        {index != null ? `Item ${index + 1}` : "Editar item"}
      </p>

      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="flex h-7 w-7 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/45 active:scale-[0.95]"
          aria-label="Remover item"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function RoutineTitleInput({
  title,
  onChange,
}: {
  title: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      value={title}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Título do item (ex.: Correr 5km)"
      className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-300/40"
    />
  );
}

function WeekdaySelector({
  selectedDays,
  onToggleDay,
}: {
  selectedDays: number[];
  onToggleDay: (day: number) => void;
}) {
  return (
    <>
      <p className="mb-2 mt-4 text-xs font-medium text-white/45">
        Dias da semana
      </p>

      <div className="flex flex-wrap gap-1.5">
        {WEEKDAYS.map((day) => {
          const isSelected = selectedDays.includes(day.idx);

          return (
            <button
              key={day.idx}
              type="button"
              onClick={() => onToggleDay(day.idx)}
              className={`h-9 w-10 rounded-xl border text-xs font-semibold transition active:scale-[0.95] ${
                isSelected
                  ? "border-purple-300/30 bg-purple-500/25 text-purple-100"
                  : "border-white/10 bg-black/20 text-white/40"
              }`}
            >
              {day.label}
            </button>
          );
        })}
      </div>
    </>
  );
}

function RoutineModeSelector({
  mode,
  onChange,
}: {
  mode: ItemMode;
  onChange: (mode: ItemMode) => void;
}) {
  return (
    <>
      <p className="mb-2 mt-4 text-xs font-medium text-white/45">Horário</p>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange("fixed")}
          className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition active:scale-[0.97] ${
            mode === "fixed"
              ? "border-purple-300/30 bg-purple-500/20 text-purple-100"
              : "border-white/10 bg-black/20 text-white/40"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Horário fixo
        </button>

        <button
          type="button"
          onClick={() => onChange("axon")}
          className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition active:scale-[0.97] ${
            mode === "axon"
              ? "border-purple-300/30 bg-purple-500/20 text-purple-100"
              : "border-white/10 bg-black/20 text-white/40"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Axon decide
        </button>
      </div>
    </>
  );
}

function FixedTimeFields({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}: {
  startTime: string;
  endTime: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="text-[0.68rem] text-white/40">Início</label>

        <input
          type="time"
          value={startTime}
          onChange={(e) => onStartTimeChange(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-purple-300/40 [color-scheme:dark]"
        />
      </div>

      <div>
        <label className="text-[0.68rem] text-white/40">Fim</label>

        <input
          type="time"
          value={endTime}
          onChange={(e) => onEndTimeChange(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-purple-300/40 [color-scheme:dark]"
        />
      </div>
    </div>
  );
}

function FlexibleDurationField({
  duration,
  onChange,
}: {
  duration: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-[0.68rem] text-white/40">
        Duração (minutos)
      </label>

      <input
        type="number"
        min={1}
        value={duration}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex.: 30"
        className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-300/40"
      />

      <p className="mt-1.5 text-[0.68rem] leading-4 text-white/35">
        O Axon escolhe o melhor horário com base no seu cronotipo.
      </p>
    </div>
  );
}
