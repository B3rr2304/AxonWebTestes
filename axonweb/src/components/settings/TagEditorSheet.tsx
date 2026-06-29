import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Plus, RefreshCcw, X } from "lucide-react";

import * as api from "../../lib/api";
import type { TagItem, TagPreferences } from "../../lib/api";
import {
  MOOD_TAGS,
  PRODUCTIVITY_TAGS,
  SLEEP_TAGS,
} from "../../data/dayReviewTags";

type Category = "sleep" | "mood" | "productivity";

const CATEGORY_CONFIG: { key: Category; label: string }[] = [
  { key: "sleep",        label: "Sono" },
  { key: "mood",         label: "Humor" },
  { key: "productivity", label: "Produtividade" },
];

const DEFAULT_PREFS: TagPreferences = {
  sleep:        SLEEP_TAGS.map((t) => ({ slug: t.slug, label: t.label })),
  mood:         MOOD_TAGS.map((t) => ({ slug: t.slug, label: t.label })),
  productivity: PRODUCTIVITY_TAGS.map((t) => ({ slug: t.slug, label: t.label })),
};

function slugify(label: string): string {
  return "custom_" + label.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

type Props = { isOpen: boolean; onClose: () => void };

export default function TagEditorSheet({ isOpen, onClose }: Props) {
  const [prefs, setPrefs]         = useState<TagPreferences>(DEFAULT_PREFS);
  const [activeTab, setActiveTab] = useState<Category>("sleep");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab("sleep");
    setInputValue("");
    setError(null);
    setLoading(true);
    api.getTagPreferences()
      .then(setPrefs)
      .catch(() => setPrefs(DEFAULT_PREFS))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const currentTags = prefs[activeTab];

  function removeTag(slug: string) {
    setPrefs((p) => ({ ...p, [activeTab]: p[activeTab].filter((t) => t.slug !== slug) }));
  }

  function addTag() {
    const label = inputValue.trim();
    if (!label) return;
    if (label.length > 40) { setError("Máximo de 40 caracteres."); return; }

    const slug = slugify(label);
    if (currentTags.some((t) => t.slug === slug || t.label.toLowerCase() === label.toLowerCase())) {
      setError("Essa tag já existe nesta categoria.");
      return;
    }

    setPrefs((p) => ({ ...p, [activeTab]: [...p[activeTab], { slug, label }] }));
    setInputValue("");
    setError(null);
  }

  function resetCategory() {
    setPrefs((p) => ({ ...p, [activeTab]: DEFAULT_PREFS[activeTab] }));
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateTagPreferences(prefs);
      setPrefs(updated);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
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
            className="fixed inset-x-0 bottom-0 z-[110] max-h-[88vh] overflow-y-auto rounded-t-[2rem] border-t border-white/10 bg-[#15141f]/97 pb-10 backdrop-blur-2xl"
          >
            {/* Handle */}
            <div className="sticky top-0 z-10 bg-[#15141f]/97 px-5 pt-4 pb-3 backdrop-blur-xl">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/15" />

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-white">
                    Tags da análise diária
                  </h2>
                  <p className="mt-0.5 text-xs text-white/40">
                    Personalize as opções que aparecem ao registrar seu dia
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

              {/* Category tabs */}
              <div className="flex gap-2">
                {CATEGORY_CONFIG.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setActiveTab(key); setInputValue(""); setError(null); }}
                    className={`flex-1 rounded-2xl border py-2.5 text-xs font-semibold transition active:scale-[0.97] ${
                      activeTab === key
                        ? "border-purple-300/30 bg-purple-500/20 text-purple-100"
                        : "border-white/10 bg-white/[0.04] text-white/45"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 pt-2">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-300" />
                </div>
              ) : (
                <>
                  {/* Tag chips */}
                  <div className="mb-4 min-h-[80px]">
                    {currentTags.length === 0 ? (
                      <p className="py-6 text-center text-sm text-white/30">
                        Nenhuma tag nesta categoria. Adicione uma abaixo.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2 py-2">
                        {currentTags.map((tag) => (
                          <motion.div
                            key={tag.slug}
                            layout
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] pl-3.5 pr-2 py-1.5"
                          >
                            <span className="text-xs font-medium text-white/75">
                              {tag.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeTag(tag.slug)}
                              className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/40 hover:bg-red-500/20 hover:text-red-400 transition active:scale-[0.9]"
                              aria-label={`Remover ${tag.label}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add new tag */}
                  <div className="mb-2">
                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => { setInputValue(e.target.value); setError(null); }}
                        onKeyDown={(e) => e.key === "Enter" && addTag()}
                        maxLength={40}
                        placeholder="Nova tag..."
                        className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/25 outline-none ring-purple-500/40 transition focus:border-purple-400/40 focus:ring-2"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        disabled={!inputValue.trim()}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/80 text-white shadow-lg shadow-purple-950/20 active:scale-[0.96] disabled:opacity-30"
                        aria-label="Adicionar tag"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                    {error && (
                      <p className="mt-2 px-1 text-xs text-red-400">{error}</p>
                    )}
                  </div>

                  {/* Reset category */}
                  <button
                    type="button"
                    onClick={resetCategory}
                    className="mb-6 flex items-center gap-1.5 px-1 text-xs text-white/30 hover:text-white/55 transition active:scale-[0.97]"
                  >
                    <RefreshCcw className="h-3 w-3" />
                    Restaurar padrões de {CATEGORY_CONFIG.find((c) => c.key === activeTab)?.label.toLowerCase()}
                  </button>

                  {/* Save */}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-purple-500 px-5 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 active:scale-[0.98] disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Salvar alterações
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
