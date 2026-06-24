import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ListChecks,
  Menu,
  Pause,
  Play,
  Plus,
  Repeat,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import NewRoutineSheet from "../components/rotinas/NewRoutineSheet";
import * as api from "../lib/api";
import type { Routine } from "../lib/api";

export default function Rotinas() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [routines, setRoutines] = useState<Routine[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api
      .getRoutines()
      .then((data) => {
        setRoutines(data);
        setError(null);
      })
      .catch((e: Error) => {
        setError(e.message || "Não foi possível carregar suas rotinas.");
        setRoutines([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleStatus(routine: Routine) {
    if (actioningId) return;
    setActioningId(routine.id);
    try {
      if (routine.status === "active") {
        await api.pauseRoutine(routine.id);
      } else {
        await api.resumeRoutine(routine.id);
      }
      // Recarrega para refletir streak/contagens recalculados no backend.
      const fresh = await api.getRoutines();
      setRoutines(fresh);
      setError(null);
    } catch (e) {
      setError(
        (e as Error).message || "Não foi possível atualizar a rotina."
      );
    } finally {
      setActioningId(null);
    }
  }

  function goCreate() {
    setIsCreateOpen(true);
  }

  const isEmpty = !loading && routines !== null && routines.length === 0;

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
              <img
                src="/axon-logo.svg"
                alt="Axon"
                className="h-8 w-8 object-contain"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Rotinas</p>
              <p className="text-xs text-white/40">Hábitos recorrentes</p>
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

        <section className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-[1.7rem] font-semibold leading-tight tracking-[-0.04em] text-white">
              Minhas Rotinas
            </h1>
            <p className="mt-1 text-sm text-white/45">
              Hábitos que o Axon agenda por você.
            </p>
          </div>

          <button
            onClick={goCreate}
            className="flex shrink-0 items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/20 px-4 py-2.5 text-sm font-semibold text-purple-100 shadow-lg shadow-purple-950/20 active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            Nova Rotina
          </button>
        </section>

        {error && (
          <div className="mb-4 rounded-[1.4rem] border border-red-300/20 bg-red-500/10 p-4 text-sm leading-6 text-red-100/80">
            {error}
          </div>
        )}

        {loading ? (
          <RoutinesSkeleton />
        ) : isEmpty ? (
          <EmptyState onCreate={goCreate} />
        ) : (
          <div className="space-y-3">
            {routines!.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                busy={actioningId === routine.id}
                disabled={actioningId !== null && actioningId !== routine.id}
                onToggle={() => toggleStatus(routine)}
                onOpen={() => navigate(`/rotinas/${routine.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <NewRoutineSheet
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={load}
      />
    </main>
  );
}

function RoutineCard({
  routine,
  busy,
  disabled,
  onToggle,
  onOpen,
}: {
  routine: Routine;
  busy: boolean;
  disabled: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const isActive = routine.status === "active";
  const itemLabel = `${routine.item_count} ${
    routine.item_count === 1 ? "item" : "itens"
  }`;

  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="cursor-pointer rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl transition active:scale-[0.99] hover:border-white/15"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-500/10 text-purple-200">
            <Repeat className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-white">
              {routine.name}
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <StatusBadge status={routine.status} />

              {routine.status === "paused" && routine.paused_until && (
                <span className="text-[0.7rem] text-white/35">
                  até {formatDate(routine.paused_until)}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          disabled={busy || disabled}
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-[0.97] ${
            isActive
              ? "border-white/10 bg-white/[0.05] text-white/60"
              : "border-emerald-300/20 bg-emerald-500/15 text-emerald-100"
          } ${busy || disabled ? "opacity-40" : ""}`}
        >
          {busy ? (
            "..."
          ) : isActive ? (
            <>
              <Pause className="h-3.5 w-3.5" />
              Pausar
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              Retomar
            </>
          )}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-3 text-xs text-white/45">
        <span className="flex items-center gap-1.5">
          <ListChecks className="h-3.5 w-3.5 text-white/35" />
          {itemLabel}
        </span>

        <span className="text-white/15">•</span>

        {routine.streak > 0 ? (
          <span className="font-medium text-amber-100/90">
            🔥 {routine.streak}{" "}
            {routine.streak === 1 ? "dia seguido" : "dias seguidos"}
          </span>
        ) : (
          <span className="text-white/35">Comece sua sequência hoje</span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Routine["status"] }) {
  const active = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium ${
        active
          ? "border-emerald-300/20 bg-emerald-500/10 text-emerald-200"
          : "border-amber-300/20 bg-amber-500/10 text-amber-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-400" : "bg-amber-400"
        }`}
      />
      {active ? "Ativa" : "Pausada"}
    </span>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-[2rem] border border-dashed border-white/12 bg-white/[0.03] px-6 py-12 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-purple-300/20 bg-purple-500/10 text-purple-200">
        <Repeat className="h-7 w-7" />
      </div>

      <h2 className="text-lg font-semibold text-white">
        Nenhuma rotina por aqui ainda
      </h2>

      <p className="mt-2 max-w-[18rem] text-sm leading-6 text-white/45">
        Crie sua primeira rotina e deixe o Axon encaixar os hábitos nos seus
        melhores horários de energia.
      </p>

      <button
        onClick={onCreate}
        className="mt-6 flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/20 px-5 py-3 text-sm font-semibold text-purple-100 shadow-lg shadow-purple-950/20 active:scale-[0.97]"
      >
        <Plus className="h-4 w-4" />
        Criar primeira rotina
      </button>
    </div>
  );
}

function RoutinesSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-4"
        >
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-2xl bg-white/[0.06]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/5 animate-pulse rounded-full bg-white/[0.06]" />
              <div className="h-3 w-1/4 animate-pulse rounded-full bg-white/[0.05]" />
            </div>
            <div className="h-7 w-20 animate-pulse rounded-full bg-white/[0.05]" />
          </div>
          <div className="mt-4 h-3 w-1/2 animate-pulse rounded-full bg-white/[0.05]" />
        </div>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
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
