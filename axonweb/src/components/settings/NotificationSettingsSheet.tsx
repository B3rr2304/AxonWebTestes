import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CalendarDays, Clock, X, Zap } from "lucide-react";

import * as api from "../../lib/api";

type Props = { isOpen: boolean; onClose: () => void };

const WEEK_DAYS = [
  { value: 0, label: "Segunda-feira" },
  { value: 1, label: "Terça-feira" },
  { value: 2, label: "Quarta-feira" },
  { value: 3, label: "Quinta-feira" },
  { value: 4, label: "Sexta-feira" },
  { value: 5, label: "Sábado" },
  { value: 6, label: "Domingo" },
];

const DEFAULT_PREFS: api.PlanningPreferences = {
  daily_planning_enabled: true,
  daily_planning_time: null,
  daily_use_chronotype: true,
  weekly_planning_enabled: true,
  weekly_planning_day: null,
  weekly_use_chronotype: true,
};

export default function NotificationSettingsSheet({ isOpen, onClose }: Props) {
  const [prefs, setPrefs] = useState<api.PlanningPreferences>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.getPlanningPreferences()
      .then(setPrefs)
      .catch(() => setPrefs(DEFAULT_PREFS))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const save = useCallback((updated: api.PlanningPreferences) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      api.updatePlanningPreferences(updated).catch(() => {});
    }, 500);
  }, []);

  const update = useCallback(
    (patch: Partial<api.PlanningPreferences>) => {
      setPrefs((prev) => {
        const next = { ...prev, ...patch };
        save(next);
        return next;
      });
    },
    [save]
  );

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
            className="fixed inset-x-0 bottom-0 z-[110] max-h-[90vh] overflow-y-auto rounded-t-[2rem] border-t border-white/10 bg-[#15141f]/97 pb-12 backdrop-blur-2xl"
          >
            {/* Handle + header */}
            <div className="sticky top-0 z-10 bg-[#15141f]/97 px-5 pt-4 pb-3 backdrop-blur-xl">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/15" />
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-white">
                    Notificações
                  </h2>
                  <p className="mt-0.5 text-xs text-white/40">
                    Configure seus lembretes de planejamento
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/55 active:scale-[0.96]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
              </div>
            ) : (
              <div className="px-5 pt-2 space-y-6">

                {/* ── Diário ── */}
                <div>
                  <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/28">
                    Diário
                  </p>
                  <div className="space-y-3">
                    <ToggleRow
                      icon={Bell}
                      title="Lembrete diário"
                      description="Receba um lembrete para planejar seu dia."
                      enabled={prefs.daily_planning_enabled}
                      onToggle={() => update({ daily_planning_enabled: !prefs.daily_planning_enabled })}
                    />

                    {prefs.daily_planning_enabled && (
                      <>
                        <ToggleRow
                          icon={Zap}
                          title="Horário pelo cronótipo"
                          description="O Axon define o melhor horário com base no seu perfil."
                          enabled={prefs.daily_use_chronotype}
                          onToggle={() => update({ daily_use_chronotype: !prefs.daily_use_chronotype })}
                        />

                        {!prefs.daily_use_chronotype && (
                          <PickerRow icon={Clock} label="Horário">
                            <input
                              type="time"
                              value={prefs.daily_planning_time ?? "08:30"}
                              onChange={(e) => update({ daily_planning_time: e.target.value })}
                              className="rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2 text-sm font-medium text-white outline-none focus:border-purple-400/40"
                              style={{ colorScheme: "dark" }}
                            />
                          </PickerRow>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* ── Semanal ── */}
                <div>
                  <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/28">
                    Semanal
                  </p>
                  <div className="space-y-3">
                    <ToggleRow
                      icon={CalendarDays}
                      title="Lembrete semanal"
                      description="Receba um lembrete para planejar sua semana."
                      enabled={prefs.weekly_planning_enabled}
                      onToggle={() => update({ weekly_planning_enabled: !prefs.weekly_planning_enabled })}
                    />

                    {prefs.weekly_planning_enabled && (
                      <>
                        <ToggleRow
                          icon={Zap}
                          title="Horário pelo cronótipo"
                          description="O Axon define o melhor horário com base no seu perfil."
                          enabled={prefs.weekly_use_chronotype}
                          onToggle={() => update({ weekly_use_chronotype: !prefs.weekly_use_chronotype })}
                        />

                        {!prefs.weekly_use_chronotype && (
                          <PickerRow icon={CalendarDays} label="Dia da semana">
                            <select
                              value={prefs.weekly_planning_day ?? 0}
                              onChange={(e) => update({ weekly_planning_day: Number(e.target.value) })}
                              className="rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2 text-sm font-medium text-white outline-none focus:border-purple-400/40"
                              style={{ colorScheme: "dark" }}
                            >
                              {WEEK_DAYS.map((d) => (
                                <option key={d.value} value={d.value} className="bg-[#1b1b27]">
                                  {d.label}
                                </option>
                              ))}
                            </select>
                          </PickerRow>
                        )}
                      </>
                    )}
                  </div>
                </div>

              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-3 rounded-[1.7rem] border border-white/10 bg-[#1b1b27]/76 p-4 text-left shadow-xl shadow-black/20 backdrop-blur-2xl active:scale-[0.99]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-500/10 text-purple-200">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-xs leading-5 text-white/38">{description}</p>
      </div>
      <div
        className={`flex h-7 w-12 shrink-0 items-center rounded-full border p-1 transition ${
          enabled
            ? "justify-end border-purple-300/25 bg-purple-500/30"
            : "justify-start border-white/10 bg-white/10"
        }`}
      >
        <div className={`h-5 w-5 rounded-full transition ${enabled ? "bg-purple-100" : "bg-white/35"}`} />
      </div>
    </button>
  );
}

function PickerRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[1.7rem] border border-white/10 bg-[#1b1b27]/76 p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-500/10 text-purple-200">
        <Icon className="h-5 w-5" />
      </div>
      <p className="flex-1 text-sm font-semibold text-white">{label}</p>
      {children}
    </div>
  );
}
