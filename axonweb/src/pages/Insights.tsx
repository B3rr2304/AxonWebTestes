import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Focus,
  Menu,
  Moon,
  RefreshCw,
  Smile,
  Sparkles,
  Target,
} from "lucide-react";

import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { results, type ChronotypeResultKey } from "../data/results";
import Sidebar from "../components/layout/Sidebar";
import DayReview from "./DayReview";
import * as api from "../lib/api";
import type { TaskInsights, FocusBlockItem } from "../lib/api";

type SeriesKey = "tarefas" | "sono" | "qualidade" | "humor" | "prod";

const SERIES: { key: SeriesKey; label: string; color: string }[] = [
  { key: "tarefas", label: "Tarefas %", color: "#c084fc" },
  { key: "sono", label: "Sono", color: "#60a5fa" },
  { key: "qualidade", label: "Qualidade do sono", color: "#f472b6" },
  { key: "humor", label: "Humor", color: "#34d399" },
  { key: "prod", label: "Produtividade", color: "#fbbf24" },
];

const TYPE_STYLE: Record<
  api.PatternInsight["type"],
  { icon: React.ElementType; color: string }
> = {
  sleep: { icon: Moon, color: "#60a5fa" },
  productivity: { icon: Target, color: "#c084fc" },
  mood: { icon: Smile, color: "#34d399" },
  habit: { icon: Activity, color: "#fbbf24" },
  general: { icon: Sparkles, color: "#c084fc" },
};

type PatternCardProps = {
  title: string;
  description: string;
  value: string;
  icon: React.ElementType;
};

const LEVEL_COLOR: Record<string, { bar: string; text: string }> = {
  sono:          { bar: "#1e293b", text: "#475569" },
  recuperacao:   { bar: "#1e3a5f", text: "#60a5fa" },
  foco_leve:     { bar: "#713f12", text: "#fde68a" },
  foco_moderado: { bar: "#4c1d95", text: "#c084fc" },
  foco_profundo: { bar: "#6d28d9", text: "#a78bfa" },
  pico:          { bar: "#7c3aed", text: "#f0abfc" },
};

const LEVEL_ORDER: { level: string; label: string }[] = [
  { level: "pico", label: "Pico" },
  { level: "foco_profundo", label: "Foco profundo" },
  { level: "foco_moderado", label: "Foco moderado" },
  { level: "foco_leve", label: "Foco leve" },
  { level: "recuperacao", label: "Recuperação" },
  { level: "sono", label: "Sono" },
];

const validKeys: ChronotypeResultKey[] = [
  "Matutino",
  "Vespertino",
  "Noturno",
  "Misto",
  "Bimodal",
];

const SLEEP_TARGET_BY_CHRONOTYPE: Record<string, number> = {
  Matutino: 7.5,
  Vespertino: 7.5,
  Noturno: 7.5,
  Misto: 7.5,
  Bimodal: 7.5,
};
const DEFAULT_SLEEP_TARGET = 7.5;
const CHART_MAX = 12; // escala do eixo (12h)

export default function Insights() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Períodos independentes: cada gráfico tem seu próprio toggle
  // semana/mês — alterar um não deve afetar o outro.
  const [taskPeriod, setTaskPeriod] = useState<"week" | "month">("week");
  const [comparePeriod, setComparePeriod] = useState<"week" | "month">("week");
  const [taskInsights, setTaskInsights] = useState<TaskInsights | null>(null);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [compareTaskInsights, setCompareTaskInsights] =
    useState<TaskInsights | null>(null);
  const [sleepHistory, setSleepHistory] = useState<api.DailyLog[]>([]);
  const [loadingSleep, setLoadingSleep] = useState(true);
  const [compareLogs, setCompareLogs] = useState<api.DailyLog[]>([]);
  const [active, setActive] = useState<SeriesKey[]>(["tarefas", "sono"]);
  const [patterns, setPatterns] = useState<api.PatternInsightsResponse | null>(
    null
  );
  const [loadingPatterns, setLoadingPatterns] = useState(true);
  const [todayLog, setTodayLog] = useState<api.DailyLog | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [focusBlocks, setFocusBlocks] = useState<FocusBlockItem[]>([]);
  const [blocksCalibrated, setBlocksCalibrated] = useState(false);
  const [blocksDataPoints, setBlocksDataPoints] = useState(0);
  const [blocksMinPoints, setBlocksMinPoints] = useState(14);
  const [expandedBlockIdx, setExpandedBlockIdx] = useState<number | null>(null);
  const [blocksListExpanded, setBlocksListExpanded] = useState(false);

  useEffect(() => {
    api.getDailyLogToday().then(setTodayLog).catch(() => setTodayLog(null));
  }, []);

  useEffect(() => {
    api.getFocusBlocks()
      .then((res) => {
        setFocusBlocks(res.blocks);
        setBlocksCalibrated(res.calibrated);
        setBlocksDataPoints(res.data_points);
        setBlocksMinPoints(res.min_data_points);
      })
      .catch(() => setFocusBlocks([]));
  }, []);

  useEffect(() => {
    api
      .getPatternInsights()
      .then(setPatterns)
      .catch(() => setPatterns(null))
      .finally(() => setLoadingPatterns(false));
  }, []);

  useEffect(() => {
    setLoadingTasks(true);
    api
      .getTaskInsights(taskPeriod)
      .then(setTaskInsights)
      .catch(() => setTaskInsights(null))
      .finally(() => setLoadingTasks(false));
  }, [taskPeriod]);

  useEffect(() => {
    api
      .getDailyLogHistory(7)
      .then((logs) => setSleepHistory(logs.filter((l) => l.hours_slept != null)))
      .catch(() => setSleepHistory([]))
      .finally(() => setLoadingSleep(false));
  }, []);

  // O gráfico de comparação usa sua PRÓPRIA busca de tarefas (série "tarefas %"),
  // independente de taskInsights do card "Tarefas concluídas" — senão os dois
  // ficariam acoplados ao mesmo período.
  useEffect(() => {
    api
      .getTaskInsights(comparePeriod)
      .then(setCompareTaskInsights)
      .catch(() => setCompareTaskInsights(null));
  }, [comparePeriod]);

  useEffect(() => {
    const days = comparePeriod === "week" ? 7 : 30;
    api
      .getDailyLogHistory(days)
      .then(setCompareLogs)
      .catch(() => setCompareLogs([]));
  }, [comparePeriod]);

  function toggleSeries(key: SeriesKey) {
    setActive((cur) =>
      cur.includes(key)
        ? cur.filter((k) => k !== key)
        : cur.length < 2
        ? [...cur, key]
        : cur
    );
  }

  // Une por data. days do insights/tasks é a espinha (sempre 7 ou 30 dias).
  // Usa compareTaskInsights (período próprio do card de comparação), não
  // taskInsights (período do card "Tarefas concluídas") — mantém os dois
  // gráficos independentes.
  const chartData = useMemo(() => {
    const byDate = new Map(compareLogs.map((l) => [l.date, l]));
    return (compareTaskInsights?.days ?? []).map((d) => {
      const log = byDate.get(d.date);
      const humor = log?.mood_rating ?? null;
      const prod = log?.productivity_rating ?? null;
      const qualidade = log?.sleep_rating ?? null;
      const [, mm, dd] = d.date.split("-");
      return {
        date: d.date,
        label: d.weekday,
        // dia + data completa: no modo mês há vários "Seg" na mesma janela,
        // então o weekday sozinho é ambíguo no tooltip (a data ISO é única).
        tooltipLabel: `${d.weekday}, ${dd}/${mm}`,
        // valores reais (para o tooltip)
        tarefas: d.completion_rate,
        sono: log?.hours_slept ?? null,
        qualidade,
        humor,
        prod,
        // valores escalados p/ o eixo esquerdo 0–100 (notas ×20)
        qualidade_plot: qualidade != null ? qualidade * 20 : null,
        humor_plot: humor != null ? humor * 20 : null,
        prod_plot: prod != null ? prod * 20 : null,
      };
    });
  }, [taskInsights, compareLogs]);

  // Maior volume de tarefas no período — escala as barras por volume real.
  const maxTaskTotal = Math.max(
    1,
    ...(taskInsights?.days ?? []).map((d) => d.total)
  );
  // Largura fixa das barras: garante arredondamento uniforme (raio = largura/2).
  const taskBarWidth = taskPeriod === "week" ? "1.5rem" : "0.5rem";

  const resultKey = useMemo<ChronotypeResultKey>(() => {
    const stored = localStorage.getItem("axon_chronotype");

    if (stored && validKeys.includes(stored as ChronotypeResultKey)) {
      return stored as ChronotypeResultKey;
    }

    return "Misto";
  }, []);

  const result = results[resultKey];

  const sleepTarget =
    SLEEP_TARGET_BY_CHRONOTYPE[resultKey] ?? DEFAULT_SLEEP_TARGET;
  const sleptValues = sleepHistory.map((l) => l.hours_slept as number);
  const avgSleep = sleptValues.length
    ? sleptValues.reduce((a, b) => a + b, 0) / sleptValues.length
    : 0;
  const deficit = Math.max(0, sleepTarget - avgSleep);

  const bestFocusLabel =
    resultKey === "Matutino"
      ? "manhã"
      : resultKey === "Bimodal"
      ? "manhã e noite"
      : resultKey === "Vespertino"
      ? "tarde"
      : resultKey === "Noturno"
      ? "noite"
      : "variação ao longo do dia";

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
              <img src="/axon-logo.svg" alt="Axon" className="h-8 w-8 object-contain" />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Insights</p>
              <p className="text-xs text-white/40">Padrões do seu ritmo</p>
            </div>
          </button>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-white/60 backdrop-blur-2xl active:scale-[0.96]"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <section className="mb-5">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/14 via-transparent to-fuchsia-400/10" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:26px_26px] opacity-20" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                <Sparkles className="h-3.5 w-3.5" />
                Análise personalizada
              </div>

              <h1 className="text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-white">
                Seu melhor desempenho aparece mais na {bestFocusLabel}.
              </h1>

              <p className="mt-4 text-sm leading-6 text-white/50">
                O Axon usa seus dados iniciais para identificar padrões de
                energia, foco e queda de rendimento ao longo do dia.
              </p>

              <div className="mt-6 rounded-[1.5rem] border border-purple-300/20 bg-purple-500/10 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <img src="/axon-logo.svg" alt="Axon" className="h-6 w-6 object-contain" />
                  <p className="text-sm font-semibold text-purple-100">
                    {result.label}
                  </p>
                </div>

                <p className="text-sm leading-6 text-white/55">
                  {result.recommendation}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Registro diário — alimenta toda a análise abaixo */}
        <section className="mb-5">
          <button
            type="button"
            onClick={() => setReviewOpen(true)}
            className={`group w-full overflow-hidden rounded-[2rem] border p-4 text-left shadow-xl backdrop-blur-2xl active:scale-[0.98] ${
              todayLog
                ? "border-emerald-300/20 bg-emerald-400/[0.07] shadow-emerald-950/10"
                : "border-purple-300/20 bg-purple-500/10 shadow-purple-950/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                  todayLog
                    ? "border-emerald-300/25 bg-emerald-400/15 text-emerald-200"
                    : "border-purple-300/20 bg-purple-500/15 text-purple-200"
                }`}
              >
                {todayLog ? <CheckCircle2 className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  {todayLog ? "Dia registrado" : "Como foi o seu dia?"}
                </p>
                <p className="mt-0.5 text-xs text-white/45">
                  {todayLog
                    ? "Toque para revisar ou ajustar o registro de hoje."
                    : "Leva menos de 1 minuto · Alimenta os insights abaixo."}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  todayLog
                    ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                    : "border-purple-300/20 bg-purple-500/20 text-purple-100"
                }`}
              >
                {todayLog ? "Editar" : "Registrar"}
              </span>
            </div>
          </button>
        </section>

        <section className="mb-5 rounded-[2rem] border border-purple-300/20 bg-purple-500/10 p-5 shadow-xl shadow-purple-950/20 backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/axon-logo.svg"
                alt="Axon"
                className="h-5 w-5 object-contain"
              />
              <p className="text-sm font-semibold text-purple-100">
                O que o Axon descobriu
              </p>
            </div>

            {patterns?.status === "ready" &&
              formatUpdatedBadge(patterns.generated_at) && (
                <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[0.65rem] font-medium text-white/45">
                  {formatUpdatedBadge(patterns.generated_at)}
                </span>
              )}
          </div>

          {loadingPatterns ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-[1.4rem] border border-white/10 bg-white/[0.04]"
                />
              ))}
            </div>
          ) : patterns?.status === "collecting" ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 text-center">
              <Sparkles className="mx-auto mb-3 h-6 w-6 text-purple-200" />
              <p className="text-sm leading-6 text-white/65">
                {patterns.message}
              </p>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-[0.68rem] text-white/40">
                  <span>Progresso</span>
                  <span>
                    {patterns.data_points ?? 0}/{patterns.days_needed ?? 7} dias
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-300"
                    style={{
                      width: `${Math.min(
                        100,
                        ((patterns.data_points ?? 0) /
                          (patterns.days_needed ?? 7)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : patterns?.status === "ready" &&
            (patterns.insights?.length ?? 0) > 0 ? (
            <div className="space-y-3">
              {patterns.insights!.map((it, i) => {
                const style = TYPE_STYLE[it.type] ?? TYPE_STYLE.general;
                const Icon = style.icon;
                return (
                  <div
                    key={i}
                    className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4"
                  >
                    <div className="mb-2 flex items-start gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10"
                        style={{
                          backgroundColor: `${style.color}1a`,
                          color: style.color,
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="pt-1 text-sm font-semibold leading-5 text-white">
                        {it.title}
                      </p>
                    </div>
                    <p className="text-xs leading-6 text-white/55">
                      {it.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 text-center">
              <p className="text-sm leading-6 text-white/55">
                {patterns?.message ??
                  "Os insights do Axon aparecerão aqui conforme você registra seus dias."}
              </p>
            </div>
          )}

          {patterns?.status === "ready" && (
            <button
              onClick={() => {
                setLoadingPatterns(true);
                api
                  .getPatternInsights(true)
                  .then(setPatterns)
                  .catch(() => {})
                  .finally(() => setLoadingPatterns(false));
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-full px-1 text-xs font-semibold text-purple-200/80 active:scale-[0.98]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Atualizar insights
            </button>
          )}
        </section>

        {/* Blocos de foco — sempre visível: barra + legenda; lista expandível */}
        {focusBlocks.length > 0 && (
          <section className="mb-5 rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
            {/* Cabeçalho com toggle */}
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">Blocos de foco</p>
                <p className="mt-1 text-xs text-white/38">
                  Seu mapa de energia nas 24h
                </p>

                {/* Status de calibração */}
                {blocksCalibrated ? (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[0.65rem] font-medium text-emerald-300/80">
                      Perfil personalizado · {blocksDataPoints} dias de dados
                    </span>
                  </div>
                ) : (
                  <div className="mt-2">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      <span className="text-[0.65rem] font-medium text-white/40">
                        Perfil base · {blocksDataPoints}/{blocksMinPoints} dias para personalização
                      </span>
                    </div>
                    <div className="h-1 w-28 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-purple-400 transition-all"
                        style={{ width: `${Math.min(100, (blocksDataPoints / blocksMinPoints) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <Focus className="h-5 w-5 shrink-0 text-purple-200" />
            </div>

            {/* Barra visual 24h — sempre visível */}
            <div className="mb-2 flex h-8 w-full overflow-hidden rounded-2xl border border-white/10">
              {focusBlocks.map((block) => (
                <div
                  key={block.idx}
                  className="h-full flex-1"
                  style={{ backgroundColor: LEVEL_COLOR[block.level].bar }}
                  title={`${block.start_time} ${block.label}`}
                />
              ))}
            </div>

            {/* Labels de hora — sempre visível */}
            <div className="mb-4 flex justify-between px-0.5 text-[0.6rem] text-white/30">
              <span>00h</span>
              <span>06h</span>
              <span>12h</span>
              <span>18h</span>
              <span>24h</span>
            </div>

            {/* Legenda — sempre visível */}
            <div className="mb-4 flex flex-wrap gap-2">
              {LEVEL_ORDER.map(({ level, label }) => (
                <span
                  key={level}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[0.65rem] font-medium text-white/55"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: LEVEL_COLOR[level].bar }}
                  />
                  {label}
                </span>
              ))}
            </div>

            {/* Botão expandir/recolher */}
            <button
              type="button"
              onClick={() => {
                setBlocksListExpanded((v) => !v);
                if (blocksListExpanded) setExpandedBlockIdx(null);
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/14 px-4 py-2.5 text-xs font-semibold text-white/45 active:scale-[0.98]"
            >
              <span>{blocksListExpanded ? "Recolher blocos" : "Ver todos os blocos"}</span>
              <span>{blocksListExpanded ? "▲" : "▼"}</span>
            </button>

            {/* Lista detalhada — apenas quando expandido */}
            {blocksListExpanded && (
              <div className="mt-3 space-y-1.5">
                {focusBlocks.map((block) => {
                  const color = LEVEL_COLOR[block.level];
                  const isExpanded = expandedBlockIdx === block.idx;
                  const now = new Date();
                  const currentMinutes = now.getHours() * 60 + now.getMinutes();
                  const blockStart = block.idx * 90;
                  const blockEnd = blockStart + 90;
                  const isCurrent = currentMinutes >= blockStart && currentMinutes < blockEnd;

                  return (
                    <div key={block.idx}>
                      <button
                        type="button"
                        onClick={() => setExpandedBlockIdx(isExpanded ? null : block.idx)}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition active:scale-[0.98] ${
                          isCurrent
                            ? "border-purple-300/30 bg-purple-500/12"
                            : "border-white/8 bg-white/[0.03]"
                        }`}
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: color.bar }}
                        />
                        <span className="w-[4.5rem] shrink-0 text-xs font-semibold text-white/45">
                          {block.start_time}
                        </span>
                        <span
                          className="flex-1 truncate text-xs font-semibold"
                          style={{ color: color.text }}
                        >
                          {block.label}
                          {isCurrent && (
                            <span className="ml-2 text-[0.6rem] font-medium text-purple-300/70">
                              agora
                            </span>
                          )}
                        </span>
                        <span className="text-[0.6rem] text-white/25">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="mx-1 rounded-b-2xl border border-t-0 border-white/8 bg-white/[0.02] px-4 py-3">
                          <p className="text-xs leading-5 text-white/55">
                            {block.description}
                          </p>
                          <div className="mt-2 flex gap-3 text-[0.65rem] text-white/35">
                            <span>Energia: {block.energy}%</span>
                            <span>Foco: {block.focus}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <section className="mb-5 rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">
                Tarefas concluídas
              </p>
              <p className="mt-1 text-xs text-white/38">
                {taskPeriod === "week" ? "Últimos 7 dias" : "Últimos 30 dias"}
              </p>
            </div>

            <div className="flex shrink-0 rounded-full border border-white/10 bg-black/20 p-1 text-xs">
              <button
                onClick={() => setTaskPeriod("week")}
                className={`rounded-full px-3 py-1 font-medium transition active:scale-[0.97] ${
                  taskPeriod === "week"
                    ? "bg-purple-500/30 text-purple-100"
                    : "text-white/40"
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setTaskPeriod("month")}
                className={`rounded-full px-3 py-1 font-medium transition active:scale-[0.97] ${
                  taskPeriod === "month"
                    ? "bg-purple-500/30 text-purple-100"
                    : "text-white/40"
                }`}
              >
                Mês
              </button>
            </div>
          </div>

          <div className="flex h-44 items-end gap-1.5 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            {loadingTasks ? (
              <div className="flex h-full w-full items-center justify-center">
                <p className="text-xs text-white/35">Carregando...</p>
              </div>
            ) : (
              (taskInsights?.days ?? []).map((d, i) => {
                const totalH = (d.total / maxTaskTotal) * 100;
                const completedFill = d.total
                  ? (d.completed / d.total) * 100
                  : 0;
                return (
                  <div
                    key={d.date}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div className="flex h-28 w-full items-end justify-center">
                      {/* Cápsula cinza = total; roxo preenche de baixo = concluídas */}
                      <div
                        className="relative overflow-hidden rounded-full bg-white/[0.07]"
                        style={{
                          width: taskBarWidth,
                          height: `${totalH}%`,
                          minHeight: taskBarWidth,
                        }}
                        title={`${d.completed}/${d.total} concluídas`}
                      >
                        <div
                          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-purple-500 to-fuchsia-400"
                          style={{ height: `${completedFill}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-[0.6rem] text-white/35">
                      {taskPeriod === "week" || i % 5 === 0 ? d.weekday : ""}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {taskInsights && !loadingTasks && (
            <div className="mt-4 rounded-[1.4rem] border border-purple-300/20 bg-purple-500/10 p-4">
              <p className="text-sm leading-6 text-white/58">
                {taskInsights.summary.best_weekday ? (
                  <>
                    Seu dia mais produtivo costuma ser {taskInsights.summary.best_weekday}
                    <span className="font-semibold text-purple-100">
                      {taskInsights.summary.best_weekday}
                    </span>
                    . Você concluiu{" "}
                    <span className="font-semibold text-purple-100">
                      {taskInsights.summary.best_weekday_completed}
                    </span>{" "}
                    tarefas nesse dia.
                  </>
                ) : (
                  "Conclua tarefas no Planejamento para ver seus padrões de produtividade aqui."
                )}
              </p>
            </div>
          )}
        </section>

        <section className="mb-5 rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Horas de sono</p>
              <p className="mt-1 text-xs text-white/38">
                Últimos dias registrados
              </p>
            </div>
            <Moon className="h-5 w-5 text-purple-200" />
          </div>

          {loadingSleep ? (
            <div className="h-44 rounded-[1.5rem] border border-white/10 bg-black/20" />
          ) : sleepHistory.length === 0 ? (
            <div className="flex flex-col items-center rounded-[1.6rem] border border-dashed border-white/12 bg-black/15 px-5 py-8 text-center">
              <Moon className="mb-3 h-6 w-6 text-purple-200/70" />
              <p className="text-sm font-semibold text-white">
                Sem dados de sono ainda
              </p>
              <p className="mt-1 text-xs leading-5 text-white/42">
                Preencha o registro diário por alguns dias para ver seu padrão de
                sono aqui.
              </p>
            </div>
          ) : (
            <>
              <div className="relative flex h-44 items-end gap-2 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div
                  className="pointer-events-none absolute inset-x-4 border-t border-dashed border-fuchsia-300/60"
                  style={{
                    bottom: `calc(1rem + ${(sleepTarget / CHART_MAX) * 100}% * 0.72)`,
                  }}
                  title={`Meta: ${sleepTarget}h`}
                />
                {sleepHistory.map((l) => {
                  const h = l.hours_slept as number;
                  const reachedTarget = h >= sleepTarget;
                  return (
                    <div
                      key={l.date}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <div className="flex h-28 w-full items-end">
                        <div
                          className={`w-full rounded-t-xl ${
                            reachedTarget
                              ? "bg-gradient-to-t from-purple-500/35 to-fuchsia-300"
                              : "bg-gradient-to-t from-amber-500/30 to-amber-300/80"
                          }`}
                          style={{
                            height: `${Math.min(100, (h / CHART_MAX) * 100)}%`,
                          }}
                          title={`~${h}h`}
                        />
                      </div>
                      <p className="text-[0.6rem] text-white/35">
                        {formatDayLabel(l.date)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-[1.4rem] border border-purple-300/20 bg-purple-500/10 p-4 text-center">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-wide text-white/40">
                    Média
                  </p>
                  <p className="mt-1 text-sm font-semibold text-purple-100">
                    ~{avgSleep.toFixed(1)}h
                  </p>
                </div>
                <div>
                  <p className="text-[0.65rem] uppercase tracking-wide text-white/40">
                    Meta
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {sleepTarget}h
                  </p>
                </div>
                <div>
                  <p className="text-[0.65rem] uppercase tracking-wide text-white/40">
                    Déficit
                  </p>
                  <p className="mt-1 text-sm font-semibold text-amber-200">
                    {deficit > 0 ? `~${deficit.toFixed(1)}h` : "—"}
                  </p>
                </div>
              </div>
            </>
          )}
        </section>

        <section className="mb-5 rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">
                Comparar métricas
              </p>
              <p className="mt-1 text-xs text-white/38">Compare 2 indicadores</p>
            </div>

            <div className="flex shrink-0 rounded-full border border-white/10 bg-black/20 p-1 text-xs">
              <button
                onClick={() => setComparePeriod("week")}
                className={`rounded-full px-3 py-1 font-medium transition active:scale-[0.97] ${
                  comparePeriod === "week"
                    ? "bg-purple-500/30 text-purple-100"
                    : "text-white/40"
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setComparePeriod("month")}
                className={`rounded-full px-3 py-1 font-medium transition active:scale-[0.97] ${
                  comparePeriod === "month"
                    ? "bg-purple-500/30 text-purple-100"
                    : "text-white/40"
                }`}
              >
                Mês
              </button>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {SERIES.map((s) => {
              const on = active.includes(s.key);
              const blocked = !on && active.length >= 2;
              return (
                <button
                  key={s.key}
                  onClick={() => toggleSeries(s.key)}
                  disabled={blocked}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    on
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-white/10 bg-black/20 text-white/40"
                  } ${blocked ? "opacity-30" : "active:scale-[0.97]"}`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: on ? s.color : "#555" }}
                  />
                  {s.label}
                </button>
              );
            })}
          </div>

          {chartData.length === 0 ? (
            <div className="flex flex-col items-center rounded-[1.6rem] border border-dashed border-white/12 bg-black/15 px-5 py-8 text-center">
              <p className="text-sm font-semibold text-white">
                Ainda sem dados para comparar
              </p>
              <p className="mt-1 text-xs leading-5 text-white/42">
                Use o registro diário e conclua tarefas por alguns dias para
                liberar as comparações.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date: string) =>
                      chartData.find((d) => d.date === date)?.label ?? date
                    }
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="pct"
                    domain={[0, 100]}
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                  />
                  <YAxis
                    yAxisId="hours"
                    orientation="right"
                    domain={[0, 12]}
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  {active.includes("tarefas") && (
                    <Line
                      yAxisId="pct"
                      dataKey="tarefas"
                      name="Tarefas %"
                      stroke="#c084fc"
                      strokeWidth={2}
                      dot={false}
                      connectNulls={false}
                    />
                  )}
                  {active.includes("qualidade") && (
                    <Line
                      yAxisId="pct"
                      dataKey="qualidade_plot"
                      name="Qualidade do sono"
                      stroke="#f472b6"
                      strokeWidth={2}
                      dot={false}
                      connectNulls={false}
                    />
                  )}
                  {active.includes("humor") && (
                    <Line
                      yAxisId="pct"
                      dataKey="humor_plot"
                      name="Humor"
                      stroke="#34d399"
                      strokeWidth={2}
                      dot={false}
                      connectNulls={false}
                    />
                  )}
                  {active.includes("prod") && (
                    <Line
                      yAxisId="pct"
                      dataKey="prod_plot"
                      name="Produtividade"
                      stroke="#fbbf24"
                      strokeWidth={2}
                      dot={false}
                      connectNulls={false}
                    />
                  )}
                  {active.includes("sono") && (
                    <Line
                      yAxisId="hours"
                      dataKey="sono"
                      name="Sono"
                      stroke="#60a5fa"
                      strokeWidth={2}
                      dot={false}
                      connectNulls={false}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="mb-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-white">
              Padrões percebidos
            </p>
            <p className="mt-1 text-xs text-white/38">
              Leituras iniciais do seu comportamento
            </p>
          </div>

          <div className="space-y-3">
            <PatternCard
              icon={Moon}
              title="Ritmo de sono"
              value={result.label}
              description="Seu perfil sugere que a organização do dia deve respeitar suas janelas naturais de disposição."
            />

            <PatternCard
              icon={Focus}
              title="Execução profunda"
              value={result.focusWindow}
              description="Tarefas complexas tendem a funcionar melhor quando encaixadas no seu período de maior foco."
            />

            <PatternCard
              icon={CalendarDays}
              title="Distribuição de tarefas"
              value="Blocos separados"
              description="Agrupar demandas leves evita alternância de contexto e preserva energia para o que importa."
            />
          </div>
        </section>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chronotypeLabel={result.label}
        energyPeak={result.energyPeak}
      />

      <DayReview
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        existing={todayLog}
        onSaved={(log) => setTodayLog(log)}
      />
    </main>
  );
}

function PatternCard({
  title,
  description,
  value,
  icon: Icon,
}: PatternCardProps) {
  return (
    <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-500/10 text-purple-200">
            <Icon className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="mt-1 text-xs leading-5 text-white/40">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
        <p className="text-xs font-medium text-purple-100">{value}</p>
      </div>
    </div>
  );
}

function formatDayLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d.getDay()];
}

function formatUpdatedBadge(iso?: string): string | null {
  if (!iso) return null;
  const gen = new Date(iso);
  gen.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - gen.getTime()) / 86400000);
  if (diff <= 0) return "Atualizado hoje";
  if (diff === 1) return "Atualizado ontem";
  return `Atualizado há ${diff} dias`;
}

type TooltipRow = {
  tooltipLabel: string;
  tarefas: number | null;
  sono: number | null;
  qualidade: number | null;
  humor: number | null;
  prod: number | null;
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: TooltipRow }[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/10 bg-[#15141f]/95 px-3 py-2 text-xs shadow-lg backdrop-blur-xl">
      <p className="mb-1 font-semibold text-white/70">{row.tooltipLabel}</p>
      {row.tarefas != null && (
        <Row color="#c084fc" text={`Tarefas: ${row.tarefas}%`} />
      )}
      {row.sono != null && <Row color="#60a5fa" text={`Sono: ~${row.sono}h`} />}
      {row.qualidade != null && (
        <Row color="#f472b6" text={`Qualidade do sono: ${row.qualidade}/5`} />
      )}
      {row.humor != null && <Row color="#34d399" text={`Humor: ${row.humor}/5`} />}
      {row.prod != null && (
        <Row color="#fbbf24" text={`Produtividade: ${row.prod}/5`} />
      )}
    </div>
  );
}

function Row({ color, text }: { color: string; text: string }) {
  return (
    <p className="flex items-center gap-2 text-white/80">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {text}
    </p>
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