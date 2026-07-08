import { useEffect, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dumbbell, Moon, Smile, Target, X, Zap } from "lucide-react";

import * as api from "../lib/api";
import type { DailyLog, TagItem } from "../lib/api";
import { PEAK_PERIODS } from "../lib/api";
import {
  MOOD_TAGS,
  PRODUCTIVITY_TAGS,
  SLEEP_TAGS,
  TIME_OPTIONS,
} from "../data/dayReviewTags";

// Fallbacks locais usados até as preferências personalizadas do usuário carregarem.
const DEFAULT_SLEEP_TAGS: TagItem[] = SLEEP_TAGS.map((t) => ({
  slug: t.slug,
  label: t.label,
}));

const DEFAULT_MOOD_TAGS: TagItem[] = MOOD_TAGS.map((t) => ({
  slug: t.slug,
  label: t.label,
}));

const DEFAULT_PRODUCTIVITY_TAGS: TagItem[] = PRODUCTIVITY_TAGS.map((t) => ({
  slug: t.slug,
  label: t.label,
}));

type Props = {
  isOpen: boolean;
  onClose: () => void;
  existing?: DailyLog | null;
  onSaved?: (log: DailyLog) => void;
};

export default function DayReview({
  isOpen,
  onClose,
  existing,
  onSaved,
}: Props) {
  // ---------------------------------------------------------------------------
  // Campos do registro diário
  // ---------------------------------------------------------------------------
  const [sleepTime, setSleepTime] = useState(existing?.sleep_time ?? "23:30");
  const [wakeTime, setWakeTime] = useState(existing?.wake_time ?? "07:00");
  const [sleepRating, setSleepRating] = useState<number | null>(
    existing?.sleep_rating ?? null
  );
  const [sleepTags, setSleepTags] = useState<string[]>(existing?.sleep_tags ?? []);
  const [moodRating, setMoodRating] = useState<number | null>(
    existing?.mood_rating ?? null
  );
  const [moodTags, setMoodTags] = useState<string[]>(existing?.mood_tags ?? []);
  const [prodRating, setProdRating] = useState<number | null>(
    existing?.productivity_rating ?? null
  );
  const [prodTags, setProdTags] = useState<string[]>(existing?.productivity_tags ?? []);
  const [peakPeriods, setPeakPeriods] = useState<string[]>(existing?.peak_periods ?? []);
  const [exercised, setExercised] = useState<boolean>(existing?.exercised ?? false);
  const [notes, setNotes] = useState(existing?.notes ?? "");
  // ---------------------------------------------------------------------------
  // Estado de envio e mensagens de erro
  // ---------------------------------------------------------------------------
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Tags disponíveis
  // ---------------------------------------------------------------------------
  // Começa com tags locais e troca pelas preferências salvas quando o sheet abre.
  const [availableSleepTags, setAvailableSleepTags] = useState<TagItem[]>(
    DEFAULT_SLEEP_TAGS
  );
  const [availableMoodTags, setAvailableMoodTags] = useState<TagItem[]>(
    DEFAULT_MOOD_TAGS
  );
  const [availableProdTags, setAvailableProdTags] = useState<TagItem[]>(
    DEFAULT_PRODUCTIVITY_TAGS
  );

  // ---------------------------------------------------------------------------
  // Sincronização ao abrir o sheet
  // ---------------------------------------------------------------------------
  // O componente pode continuar montado entre aberturas; por isso os campos são
  // reidratados a partir de `existing` sempre que o usuário abre a revisão.
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
    setPeakPeriods(existing?.peak_periods ?? []);
    setExercised(existing?.exercised ?? false);
    setNotes(existing?.notes ?? "");
    setError(null);

    // Carrega preferências personalizadas sem bloquear a abertura do formulário.
    api
      .getTagPreferences()
      .then((prefs) => {
        setAvailableSleepTags(prefs.sleep);
        setAvailableMoodTags(prefs.mood);
        setAvailableProdTags(prefs.productivity);
      })
      .catch(() => {});
  }, [isOpen, existing]);

  // ---------------------------------------------------------------------------
  // Validações e dados derivados
  // ---------------------------------------------------------------------------
  // Data do registro: do dia já registrado (edição) ou de hoje (novo).
  const reviewDate = formatReviewDate(existing?.date);

  const canSave =
    sleepRating !== null && moodRating !== null && prodRating !== null && !saving;

  // ---------------------------------------------------------------------------
  // Seleções do formulário
  // ---------------------------------------------------------------------------
  // Limita cada grupo a 3 tags para manter o registro rápido e comparável.
  function toggleTag(list: string[], set: (v: string[]) => void, slug: string) {
    if (list.includes(slug)) {
      set(list.filter((t) => t !== slug));
    } else if (list.length < 3) {
      set([...list, slug]);
    }
  }

  // Limita os períodos de pico a 2 para destacar os momentos mais relevantes.
  function togglePeakPeriod(slug: string) {
    if (peakPeriods.includes(slug)) {
      setPeakPeriods(peakPeriods.filter((p) => p !== slug));
    } else if (peakPeriods.length < 2) {
      setPeakPeriods([...peakPeriods, slug]);
    }
  }

  // ---------------------------------------------------------------------------
  // Salvamento
  // ---------------------------------------------------------------------------
  // Envia apenas o resumo do dia; os Insights usam esse histórico depois.
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
        peak_periods: peakPeriods,
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
      {/* Sheet mobile-first de revisão diária. */}
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
            className="fixed inset-x-0 bottom-0 z-[110] max-h-[90vh] overflow-y-auto rounded-t-[2rem] border-t border-soft bg-surface-elevated p-5 pb-10 text-primary shadow-soft backdrop-blur-2xl"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[var(--border-medium)]" />

            {/* Cabeçalho do registro: data e ação de fechar. */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-primary">
                  Como foi o seu dia?
                </h2>
                <p className="mt-1 text-xs font-medium capitalize text-accent">
                  {reviewDate}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  Leva menos de 1 minuto
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-2xl border border-soft bg-surface-muted text-muted transition active:scale-[0.96]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sono: horários, avaliação e até 3 tags. */}
            <Section icon={Moon} title="Como você dormiu?">
              <div className="mb-3 grid grid-cols-2 gap-3">
                <TimeSelect
                  label="Dormiu às"
                  value={sleepTime}
                  onChange={setSleepTime}
                />
                <TimeSelect
                  label="Acordou às"
                  value={wakeTime}
                  onChange={setWakeTime}
                />
              </div>
              <RatingDots value={sleepRating} onChange={setSleepRating} />
              <TagRow
                tags={availableSleepTags}
                selected={sleepTags}
                onToggle={(s) => toggleTag(sleepTags, setSleepTags, s)}
              />
            </Section>

            {/* Humor: percepção geral do dia e fatores associados. */}
            <Section icon={Smile} title="Como você se sentiu?">
              <RatingDots value={moodRating} onChange={setMoodRating} />
              <TagRow
                tags={availableMoodTags}
                selected={moodTags}
                onToggle={(s) => toggleTag(moodTags, setMoodTags, s)}
              />
            </Section>

            {/* Produtividade: base para cruzar energia, foco e execução. */}
            <Section icon={Target} title="Como avalia sua produtividade?">
              <RatingDots value={prodRating} onChange={setProdRating} />
              <TagRow
                tags={availableProdTags}
                selected={prodTags}
                onToggle={(s) => toggleTag(prodTags, setProdTags, s)}
              />
            </Section>

            {/* Pico produtivo: até 2 janelas para alimentar padrões futuros. */}
            <Section icon={Zap} title="Quando você foi mais produtivo? (opcional)">
              <div className="flex flex-wrap gap-2">
                {PEAK_PERIODS.map((p) => {
                  const isSelected = peakPeriods.includes(p.slug);
                  const atLimit = !isSelected && peakPeriods.length >= 2;
                  return (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => togglePeakPeriod(p.slug)}
                      disabled={atLimit}
                      className={`flex flex-col items-start rounded-2xl border px-3.5 py-2.5 text-left transition active:scale-[0.96] ${
                        isSelected
                          ? "border-accent-soft bg-accent-soft text-accent"
                          : atLimit
                          ? "cursor-not-allowed border-soft bg-surface-muted text-soft opacity-55"
                          : "border-soft bg-surface-muted text-secondary"
                      }`}
                    >
                      <span className="text-xs font-semibold">{p.label}</span>
                      <span
                        className={`text-[0.62rem] ${
                          isSelected ? "text-accent" : "text-soft"
                        }`}
                      >
                        {p.hours}
                      </span>
                    </button>
                  );
                })}
              </div>
              {peakPeriods.length >= 2 && (
                <p className="mt-2 text-xs text-soft">
                  Máximo de 2 períodos selecionado
                </p>
              )}
            </Section>

            {/* Exercício: sinal simples para comparar energia e humor. */}
            <Section icon={Dumbbell} title="Você se exercitou hoje?">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setExercised(true)}
                  className={`flex-1 rounded-2xl border py-3 text-sm font-semibold transition active:scale-[0.98] ${
                    exercised
                      ? "border-accent-soft bg-accent-soft text-accent"
                      : "border-soft bg-surface-muted text-muted"
                  }`}
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => setExercised(false)}
                  className={`flex-1 rounded-2xl border py-3 text-sm font-semibold transition active:scale-[0.98] ${
                    !exercised
                      ? "border-accent-soft bg-accent-soft text-accent"
                      : "border-soft bg-surface-muted text-muted"
                  }`}
                >
                  Não
                </button>
              </div>
            </Section>

            {/* Notas livres: contexto qualitativo para o usuário lembrar do dia. */}
            <Section icon={Zap} title="Algo que queira registrar? (opcional)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Ex: reunião pesada drenou minha energia..."
                className="w-full resize-none rounded-2xl border border-soft bg-surface-muted p-3.5 text-sm text-primary placeholder:text-soft focus:outline-none focus:ring-1 focus:ring-[var(--accent-soft)]"
              />
              <p className="mt-1 text-right text-xs text-soft">
                {notes.length}/500
              </p>
            </Section>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-300/25 bg-red-500/10 p-3">
                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="min-h-12 w-full rounded-2xl bg-[var(--accent-strong)] px-5 text-sm font-semibold text-white shadow-card transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving
                ? "Salvando..."
                : existing
                ? "Atualizar registro"
                : "Salvar registro"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ===========================================================================
// HELPERS DE FORMATAÇÃO
// ===========================================================================

// Formata a data do registro exibida no topo do sheet.
// `iso` ("YYYY-MM-DD") vem do registro em edição; sem ela, usa hoje.
function formatReviewDate(iso?: string | null) {
  const date = iso ? new Date(`${iso}T00:00:00`) : new Date();
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// ===========================================================================
// SUBCOMPONENTES DO FORMULÁRIO
// ===========================================================================

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
    <div className="mb-4 rounded-[1.6rem] border border-soft bg-surface-muted p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl border border-accent-soft bg-accent-soft text-accent">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <p className="text-sm font-semibold text-primary">{title}</p>
      </div>
      {children}
    </div>
  );
}

// Labels exibidas abaixo da nota selecionada.
const RATING_LABELS = ["Péssimo", "Ruim", "Regular", "Bom", "Ótimo"];

// Escala compacta de 1 a 5 usada em sono, humor e produtividade.
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
                ? "border-accent-soft bg-accent-soft text-accent"
                : "border-soft bg-surface-muted text-muted"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="mt-2 h-4 text-center text-xs text-muted">
        {value !== null ? RATING_LABELS[value - 1] : ""}
      </p>
    </div>
  );
}

// Chips reutilizáveis com limite de seleção controlado pelo componente pai.
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
                  ? "border-accent-soft bg-accent-soft text-accent"
                  : isDisabled
                  ? "cursor-not-allowed border-soft bg-surface-muted text-soft opacity-55"
                  : "border-soft bg-surface-muted text-secondary"
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>
      {atLimit && (
        <p className="mt-2 text-xs text-soft">
          Máximo de 3 tags selecionado
        </p>
      )}
    </div>
  );
}

// Select padronizado para horários de dormir/acordar.
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
      <p className="mb-1.5 text-xs text-muted">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-2xl border border-soft bg-surface-muted px-3 py-2.5 text-center text-sm text-primary focus:outline-none focus:ring-1 focus:ring-[var(--accent-soft)]"
      >
        {TIME_OPTIONS.map((t) => (
          <option key={t} value={t} className="bg-surface-elevated">
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}
