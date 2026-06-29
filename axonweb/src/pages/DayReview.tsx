import { useEffect, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dumbbell, Moon, Smile, Target, X, Zap } from "lucide-react";

import * as api from "../lib/api";
import type { DailyLog, TagItem } from "../lib/api";
import {
  MOOD_TAGS,
  PRODUCTIVITY_TAGS,
  SLEEP_TAGS,
  TIME_OPTIONS,
} from "../data/dayReviewTags";

const DEFAULT_SLEEP_TAGS: TagItem[]        = SLEEP_TAGS.map((t) => ({ slug: t.slug, label: t.label }));
const DEFAULT_MOOD_TAGS: TagItem[]         = MOOD_TAGS.map((t) => ({ slug: t.slug, label: t.label }));
const DEFAULT_PRODUCTIVITY_TAGS: TagItem[] = PRODUCTIVITY_TAGS.map((t) => ({ slug: t.slug, label: t.label }));

type Props = {
  isOpen: boolean;
  onClose: () => void;
  existing?: DailyLog | null;
  onSaved?: (log: DailyLog) => void;
};

export default function DayReview({ isOpen, onClose, existing, onSaved }: Props) {
  const [sleepTime, setSleepTime] = useState(existing?.sleep_time ?? "23:30");
  const [wakeTime, setWakeTime] = useState(existing?.wake_time ?? "07:00");
  const [sleepRating, setSleepRating] = useState<number | null>(existing?.sleep_rating ?? null);
  const [sleepTags, setSleepTags] = useState<string[]>(existing?.sleep_tags ?? []);
  const [moodRating, setMoodRating] = useState<number | null>(existing?.mood_rating ?? null);
  const [moodTags, setMoodTags] = useState<string[]>(existing?.mood_tags ?? []);
  const [prodRating, setProdRating] = useState<number | null>(existing?.productivity_rating ?? null);
  const [prodTags, setProdTags] = useState<string[]>(existing?.productivity_tags ?? []);
  const [exercised, setExercised] = useState<boolean>(existing?.exercised ?? false);
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [availableSleepTags, setAvailableSleepTags]    = useState<TagItem[]>(DEFAULT_SLEEP_TAGS);
  const [availableMoodTags, setAvailableMoodTags]      = useState<TagItem[]>(DEFAULT_MOOD_TAGS);
  const [availableProdTags, setAvailableProdTags]      = useState<TagItem[]>(DEFAULT_PRODUCTIVITY_TAGS);

  // O sheet fica sempre montado, então o estado inicial é lido antes de
  // `existing` carregar. Re-sincroniza os campos toda vez que o sheet abre.
  useEffect(() => {
    if (!isOpen) return;
    setSleepTime(existing?.sleep_time ?? "23:30");
    setWakeTime(existing?.wake_time ?? "07:00");
    setSleepRating(existing?.sleep_rating ?? null);
    setSleepTags(existing?.sleep_tags ?? []);
    setMoodRating(existing?.mood_rating ?? null);
    setMoodTags(existing?.mood_tags ?? []);
    setProdRating(existing?.productivity_rating ?? null);
    setProdTags(existing?.productivity_tags ?? []);
    setExercised(existing?.exercised ?? false);
    setNotes(existing?.notes ?? "");
    setError(null);

    // Carrega as tags personalizadas do usuário (sem bloquear o sheet)
    api.getTagPreferences().then((prefs) => {
      setAvailableSleepTags(prefs.sleep);
      setAvailableMoodTags(prefs.mood);
      setAvailableProdTags(prefs.productivity);
    }).catch(() => {});
  }, [isOpen, existing]);

  // Data do registro: do dia já registrado (edição) ou de hoje (novo).
  const reviewDate = formatReviewDate(existing?.date);

  const canSave =
    sleepRating !== null && moodRating !== null && prodRating !== null && !saving;

  function toggleTag(list: string[], set: (v: string[]) => void, slug: string) {
    if (list.includes(slug)) {
      set(list.filter((t) => t !== slug));
    } else if (list.length < 3) {
      set([...list, slug]);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const log = await api.saveDailyLog({
        sleep_time: sleepTime,
        wake_time: wakeTime,
        sleep_rating: sleepRating ?? undefined,
        sleep_tags: sleepTags,
        mood_rating: moodRating ?? undefined,
        mood_tags: moodTags,
        productivity_rating: prodRating ?? undefined,
        productivity_tags: prodTags,
        exercised,
        notes: notes.trim() || undefined,
      });
      onSaved?.(log);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-[110] max-h-[90vh] overflow-y-auto rounded-t-[2rem] border-t border-white/10 bg-[#15141f]/95 p-5 pb-10 backdrop-blur-2xl"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/15" />

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Como foi o seu dia?
                </h2>
                <p className="mt-1 text-xs font-medium capitalize text-purple-200/70">
                  {reviewDate}
                </p>
                <p className="mt-0.5 text-xs text-white/40">
                  Leva menos de 1 minuto
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/55 active:scale-[0.96]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <Section icon={Moon} title="Como você dormiu?">
              <div className="mb-3 grid grid-cols-2 gap-3">
                <TimeSelect label="Dormiu às" value={sleepTime} onChange={setSleepTime} />
                <TimeSelect label="Acordou às" value={wakeTime} onChange={setWakeTime} />
              </div>
              <RatingDots value={sleepRating} onChange={setSleepRating} />
              <TagRow
                tags={availableSleepTags}
                selected={sleepTags}
                onToggle={(s) => toggleTag(sleepTags, setSleepTags, s)}
              />
            </Section>

            <Section icon={Smile} title="Como você se sentiu?">
              <RatingDots value={moodRating} onChange={setMoodRating} />
              <TagRow
                tags={availableMoodTags}
                selected={moodTags}
                onToggle={(s) => toggleTag(moodTags, setMoodTags, s)}
              />
            </Section>

            <Section icon={Target} title="Como avalia sua produtividade?">
              <RatingDots value={prodRating} onChange={setProdRating} />
              <TagRow
                tags={availableProdTags}
                selected={prodTags}
                onToggle={(s) => toggleTag(prodTags, setProdTags, s)}
              />
            </Section>

            <Section icon={Dumbbell} title="Você se exercitou hoje?">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setExercised(true)}
                  className={`flex-1 rounded-2xl border py-3 text-sm font-semibold transition active:scale-[0.98] ${
                    exercised
                      ? "border-purple-300/30 bg-purple-500/20 text-purple-100"
                      : "border-white/10 bg-white/[0.05] text-white/50"
                  }`}
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => setExercised(false)}
                  className={`flex-1 rounded-2xl border py-3 text-sm font-semibold transition active:scale-[0.98] ${
                    !exercised
                      ? "border-purple-300/30 bg-purple-500/20 text-purple-100"
                      : "border-white/10 bg-white/[0.05] text-white/50"
                  }`}
                >
                  Não
                </button>
              </div>
            </Section>

            <Section icon={Zap} title="Algo que queira registrar? (opcional)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Ex: reunião pesada drenou minha energia..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-purple-500/40"
              />
              <p className="mt-1 text-right text-xs text-white/25">{notes.length}/500</p>
            </Section>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-300/20 bg-red-500/10 p-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="min-h-12 w-full rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-5 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Salvando..." : existing ? "Atualizar registro" : "Salvar registro"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// --- Helpers ---

// Formata a data do registro (ex.: "segunda-feira, 23 de junho").
// `iso` ("YYYY-MM-DD") vem do registro em edição; sem ela, usa hoje.
function formatReviewDate(iso?: string | null) {
  const date = iso ? new Date(`${iso}T00:00:00`) : new Date();
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// --- Subcomponents ---

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: ElementType;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4 rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl border border-purple-300/15 bg-purple-500/10 text-purple-200">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <p className="text-sm font-semibold text-white">{title}</p>
      </div>
      {children}
    </div>
  );
}

const RATING_LABELS = ["Péssimo", "Ruim", "Regular", "Bom", "Ótimo"];

function RatingDots({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-3">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`h-11 flex-1 rounded-2xl border text-sm font-semibold transition active:scale-[0.96] ${
              value !== null && n <= value
                ? "border-purple-300/30 bg-purple-500/20 text-purple-100"
                : "border-white/10 bg-white/[0.05] text-white/40"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="mt-2 h-4 text-center text-xs text-white/40">
        {value !== null ? RATING_LABELS[value - 1] : ""}
      </p>
    </div>
  );
}

function TagRow({
  tags,
  selected,
  onToggle,
}: {
  tags: { slug: string; label: string }[];
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  const atLimit = selected.length >= 3;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selected.includes(tag.slug);
          const isDisabled = !isSelected && atLimit;
          return (
            <button
              key={tag.slug}
              type="button"
              onClick={() => onToggle(tag.slug)}
              disabled={isDisabled}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition active:scale-[0.96] ${
                isSelected
                  ? "border-purple-300/30 bg-purple-500/20 text-purple-100"
                  : isDisabled
                  ? "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/20"
                  : "border-white/10 bg-white/[0.05] text-white/55"
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>
      {atLimit && (
        <p className="mt-2 text-xs text-white/30">Máximo de 3 tags selecionado</p>
      )}
    </div>
  );
}

function TimeSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs text-white/40">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-2xl border border-white/10 bg-black/20 px-3 py-2.5 text-center text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/40"
      >
        {TIME_OPTIONS.map((t) => (
          <option key={t} value={t} className="bg-[#15141f]">
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}
