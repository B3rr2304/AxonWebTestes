import { Clock, Sparkles, Trash2 } from "lucide-react";

import type {
  RoutineItem,
  RoutineItemCreateInput,
  RoutineItemUpdateInput,
} from "../../lib/api";

export type ItemMode = "fixed" | "axon";

export type DraftItem = {
  key: string;
  title: string;
  days: number[]; // 0=Seg ... 6=Dom
  mode: ItemMode;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  duration: string; // minutos, como string do input
};

export const WEEKDAYS = [
  { idx: 0, label: "Seg" },
  { idx: 1, label: "Ter" },
  { idx: 2, label: "Qua" },
  { idx: 3, label: "Qui" },
  { idx: 4, label: "Sex" },
  { idx: 5, label: "Sáb" },
  { idx: 6, label: "Dom" },
];

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

export function itemToDraft(it: RoutineItem): DraftItem {
  const isFlexible = it.duration_minutes != null;
  return {
    key: it.id,
    title: it.title,
    days: it.days_of_week,
    mode: isFlexible ? "axon" : "fixed",
    startTime: it.start_time ?? "",
    endTime: it.end_time ?? "",
    duration: isFlexible ? String(it.duration_minutes) : "",
  };
}

export function itemValid(it: DraftItem): boolean {
  if (!it.title.trim()) return false;
  if (it.days.length === 0) return false;
  if (it.mode === "fixed") {
    return !!it.startTime && !!it.endTime && it.startTime < it.endTime;
  }
  const d = Number(it.duration);
  return Number.isFinite(d) && d > 0;
}

export function draftToCreateInput(it: DraftItem): RoutineItemCreateInput {
  return it.mode === "fixed"
    ? {
        title: it.title.trim(),
        days_of_week: it.days,
        start_time: it.startTime,
        end_time: it.endTime,
      }
    : {
        title: it.title.trim(),
        days_of_week: it.days,
        duration_minutes: Number(it.duration),
      };
}

// Para PATCH: envia null no lado não usado, já que o backend não revalida
// fixo-vs-flexível e poderia deixar o item com os dois conjuntos preenchidos.
export function draftToUpdateInput(it: DraftItem): RoutineItemUpdateInput {
  const base = { title: it.title.trim(), days_of_week: it.days };
  return it.mode === "fixed"
    ? { ...base, start_time: it.startTime, end_time: it.endTime, duration_minutes: null }
    : { ...base, start_time: null, end_time: null, duration_minutes: Number(it.duration) };
}

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
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35">
          {index != null ? `Item ${index + 1}` : "Editar item"}
        </p>
        {canRemove && (
          <button
            onClick={onRemove}
            className="flex h-7 w-7 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/45 active:scale-[0.95]"
            aria-label="Remover item"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <input
        value={item.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Título do item (ex.: Correr 5km)"
        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-300/40"
      />

      <p className="mb-2 mt-4 text-xs font-medium text-white/45">
        Dias da semana
      </p>
      <div className="flex flex-wrap gap-1.5">
        {WEEKDAYS.map((d) => {
          const on = item.days.includes(d.idx);
          return (
            <button
              key={d.idx}
              onClick={() => onToggleDay(d.idx)}
              className={`h-9 w-10 rounded-xl border text-xs font-semibold transition active:scale-[0.95] ${
                on
                  ? "border-purple-300/30 bg-purple-500/25 text-purple-100"
                  : "border-white/10 bg-black/20 text-white/40"
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      <p className="mb-2 mt-4 text-xs font-medium text-white/45">Horário</p>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => onChange({ mode: "fixed" })}
          className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition active:scale-[0.97] ${
            item.mode === "fixed"
              ? "border-purple-300/30 bg-purple-500/20 text-purple-100"
              : "border-white/10 bg-black/20 text-white/40"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Horário fixo
        </button>
        <button
          onClick={() => onChange({ mode: "axon" })}
          className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition active:scale-[0.97] ${
            item.mode === "axon"
              ? "border-purple-300/30 bg-purple-500/20 text-purple-100"
              : "border-white/10 bg-black/20 text-white/40"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Axon decide
        </button>
      </div>

      {item.mode === "fixed" ? (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[0.68rem] text-white/40">Início</label>
            <input
              type="time"
              value={item.startTime}
              onChange={(e) => onChange({ startTime: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-purple-300/40 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="text-[0.68rem] text-white/40">Fim</label>
            <input
              type="time"
              value={item.endTime}
              onChange={(e) => onChange({ endTime: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-purple-300/40 [color-scheme:dark]"
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="text-[0.68rem] text-white/40">
            Duração (minutos)
          </label>
          <input
            type="number"
            min={1}
            value={item.duration}
            onChange={(e) => onChange({ duration: e.target.value })}
            placeholder="Ex.: 30"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-300/40"
          />
          <p className="mt-1.5 text-[0.68rem] leading-4 text-white/35">
            O Axon escolhe o melhor horário com base no seu cronotipo.
          </p>
        </div>
      )}
    </div>
  );
}
