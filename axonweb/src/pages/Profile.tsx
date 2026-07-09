import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Edit3,
  Loader2,
  Mail,
  RefreshCcw,
  Settings,
  Sparkles,
  Trash2,
  User,
  Workflow,
  X,
} from "lucide-react";

import { results, type ChronotypeResultKey } from "../data/results";
import Sidebar from "../components/layout/Sidebar";
import * as api from "../lib/api";
import type { ProfileData } from "../lib/api";
import AppBackground from "../components/layout/AppBackground";
import PageHeader from "../components/layout/PageHeader";

// ===========================================================================
// MAPEAMENTOS DO PERFIL
// ===========================================================================
// Normaliza nomes vindos do backend para as chaves usadas em data/results.ts.
const CHRONOTYPE_TO_KEY: Record<string, ChronotypeResultKey> = {
  Matutino: "Matutino",
  Vespertino: "Vespertino",
  Noturno: "Noturno",
  Misto: "Misto",
  Bimodal: "Bimodal",
  morning: "Matutino",
  evening: "Vespertino",
  night: "Noturno",
  intermediate: "Misto",
};

const validKeys: ChronotypeResultKey[] = [
  "Matutino",
  "Vespertino",
  "Noturno",
  "Misto",
  "Bimodal",
];

const SCHEDULE_TYPE_LABEL: Record<string, string> = {
  flexible: "Flexível",
  fixed: "Fixo",
};

// ===========================================================================
// PÁGINA DE PERFIL
// ===========================================================================

export default function Profile() {
  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // Estados principais
  // ---------------------------------------------------------------------------
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Dados do usuário
  // ---------------------------------------------------------------------------
  // Garante sessão ativa e carrega os dados exibidos no perfil.
  useEffect(() => {
    if (!api.isLoggedIn()) {
      navigate("/login");
      return;
    }

    api
      .getProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [navigate]);

  // ---------------------------------------------------------------------------
  // Cronotipo
  // ---------------------------------------------------------------------------
  // Prioriza o valor do backend; usa localStorage apenas como fallback visual.
  const resultKey = useMemo<ChronotypeResultKey>(() => {
    const fromBackend = profile?.chronotype
      ? CHRONOTYPE_TO_KEY[profile.chronotype]
      : undefined;

    if (fromBackend) return fromBackend;

    const stored = localStorage.getItem("axon_chronotype");

    if (stored && validKeys.includes(stored as ChronotypeResultKey)) {
      return stored as ChronotypeResultKey;
    }

    return "Misto";
  }, [profile]);

  const result = results[resultKey];
  const hasChronotype = Boolean(profile?.chronotype);

  // ---------------------------------------------------------------------------
  // Dados derivados para UI
  // ---------------------------------------------------------------------------
  const userName = profile?.name || "Usuário";
  const userEmail = profile?.email || "";

  const scheduleLabel = profile?.schedule_type
    ? SCHEDULE_TYPE_LABEL[profile.schedule_type] ?? profile.schedule_type
    : "—";

  const profileDetails = [
    { label: "Estilo de rotina", value: scheduleLabel },
    { label: "Modo de trabalho", value: "Blocos de foco" },
    { label: "Tom do Axon", value: "Direto e estratégico" },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-app text-primary">
      <AppBackground />

      <div className="relative z-10 min-h-screen px-4 pb-6 pt-5">
        {/* Header: acesso ao Dashboard e abertura da sidebar global. */}
        <PageHeader
          title="Perfil"
          subtitle="Identidade e preferências"
          onBack={() => navigate("/dashboard")}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Card principal: avatar, nome, e-mail e ação de edição. */}
        <section className="mb-4">
          <div className="relative overflow-hidden rounded-[2rem] border border-soft bg-surface-elevated p-5 text-primary shadow-soft backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--accent-soft),transparent_48%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_40%)] opacity-60 dark:opacity-30" />

            <div className="relative">
              <div className="mb-5 flex items-center gap-4">
                <AvatarUpload
                  avatarUrl={profile?.avatar_url}
                  onUpdate={(updated) => setProfile(updated)}
                />

                <div className="min-w-0 flex-1">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent-soft bg-accent-soft px-3 py-1 text-[0.68rem] font-medium text-accent">
                    <Sparkles className="h-3.5 w-3.5" />
                    Perfil ativo
                  </div>

                  <h1 className="truncate text-2xl font-semibold tracking-[-0.045em] text-primary">
                    {userName}
                  </h1>

                  <div className="mt-1 flex items-center gap-2 text-muted">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{userEmail}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-soft bg-surface-muted px-5 text-sm font-semibold text-secondary backdrop-blur-2xl transition active:scale-[0.98]"
              >
                Editar perfil
                <Edit3 className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Cronotipo: resumo do perfil produtivo e link para o resultado completo. */}
        <section className="mb-4 rounded-[2rem] border border-accent-soft bg-accent-soft p-4 text-primary shadow-card backdrop-blur-2xl">
          <div className="mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-accent" />
            <p className="text-sm font-semibold text-accent">
              Perfil produtivo
            </p>
          </div>

          <h2 className="text-[1.75rem] font-semibold leading-[1.05] tracking-[-0.055em] text-primary">
            {hasChronotype ? result.label : "Cronotipo não definido"}
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted">
            {hasChronotype
              ? result.subtitle
              : "Você ainda não respondeu o questionário nesta conta. Responda para o Axon conhecer seu ritmo."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(`/result?from=profile&chronotype=${resultKey}`)
            }
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-accent-soft bg-surface-elevated px-5 text-sm font-semibold text-accent transition active:scale-[0.98]"
          >
            Ver resultado completo
            <ChevronRight className="ml-2 h-4 w-4" />
          </button>
        </section>

        {/* Preferências principais: leitura rápida do estilo de uso atual. */}
        <section className="mb-4 rounded-[2rem] border border-soft bg-surface-elevated p-4 text-primary shadow-card backdrop-blur-2xl">
          <div className="mb-4 flex items-center gap-2">
            <Workflow className="h-4 w-4 text-accent" />
            <p className="text-sm font-semibold text-primary">
              Preferências principais
            </p>
          </div>

          <div className="space-y-3">
            {profileDetails.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 rounded-[1.4rem] border border-soft bg-surface-muted px-4 py-3"
              >
                <p className="text-xs text-muted">{item.label}</p>
                <p className="text-xs font-semibold text-secondary">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* O que o Axon aprendeu sobre o usuário. */}
        <AxonMemories />

        {/* Ações de conta relacionadas ao perfil. */}
        <section className="space-y-3">
          <button
            type="button"
            onClick={() => navigate("/questionnaire-intro")}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[var(--accent-strong)] px-6 text-sm font-semibold text-white shadow-card transition active:scale-[0.98]"
          >
            Refazer questionário
            <RefreshCcw className="ml-2 h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-soft bg-surface-muted px-6 text-sm font-semibold text-secondary backdrop-blur-2xl transition active:scale-[0.98]"
          >
            Configurações da conta
            <Settings className="ml-2 h-4 w-4" />
          </button>
        </section>
      </div>

      {/* Overlays e componentes globais da página. */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chronotypeLabel={result.label}
        energyPeak={result.energyPeak}
        userName={userName}
        userEmail={userEmail}
      />

      <EditNameModal
        isOpen={isEditOpen}
        currentName={userName}
        onClose={() => setIsEditOpen(false)}
        onSave={(newName) => {
          setProfile((prev) => (prev ? { ...prev, name: newName } : prev));
          setIsEditOpen(false);
        }}
      />
    </main>
  );
}

// ===========================================================================
// MEMÓRIAS DO AXON
// ===========================================================================

function AxonMemories() {
  const [memories, setMemories] = useState<api.UserMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const visibleMemories = expanded ? memories : memories.slice(0, 3);
  const hiddenCount = memories.length - visibleMemories.length;
  const canExpand = memories.length > 3;

  useEffect(() => {
    api.getMemories()
      .then(setMemories)
      .catch(() => setMemories([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await api.deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
      setConfirmingId(null);
    } catch {
      // Mantém a memória na lista em caso de erro.
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mb-4 rounded-[2rem] border border-white/10 bg-[#1b1b27]/76 p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
      <div className="mb-4 flex items-center gap-2">
        <Brain className="h-4 w-4 text-purple-200" />
        <p className="text-sm font-semibold text-white">
          O que o Axon sabe sobre você
        </p>
      </div>

      {/* Aviso fixo: como adicionar/corrigir memórias. */}
      <div className="mb-4 flex items-start gap-2.5 rounded-[1.4rem] border border-purple-300/20 bg-purple-500/10 px-4 py-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-purple-200" />
        <p className="text-xs leading-5 text-purple-100/80">
          Quer adicionar ou corrigir uma informação? Converse diretamente com o
          Axon no chat e conte o que quer mudar — ele aprende com o que você
          compartilha.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-3 text-xs text-white/35">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Carregando…
        </div>
      ) : memories.length === 0 ? (
        <p className="rounded-[1.4rem] border border-dashed border-white/12 bg-black/15 px-4 py-5 text-center text-xs leading-5 text-white/42">
          O Axon ainda não anotou nada sobre você. Converse com ele para que ele
          possa te conhecer melhor.
        </p>
      ) : (
        <div className="space-y-2">
          {visibleMemories.map((memory) => (
            <div
              key={memory.id}
              className="rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-3"
            >
              <div className="flex items-start gap-3">
                <p className="min-w-0 flex-1 break-words text-xs leading-5 text-white/70">
                  {memory.content}
                </p>

                {confirmingId !== memory.id && (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(memory.id)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/[0.055] text-white/35 active:scale-[0.94]"
                    aria-label="Remover memória"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {confirmingId === memory.id && (
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/8 pt-3">
                  <p className="text-[0.7rem] leading-4 text-white/50">
                    Tem certeza? Esta memória será removida permanentemente.
                  </p>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      disabled={deletingId === memory.id}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.055] text-white/40 active:scale-[0.94] disabled:opacity-50"
                      aria-label="Cancelar"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(memory.id)}
                      disabled={deletingId === memory.id}
                      className="flex h-8 items-center gap-1.5 rounded-xl bg-rose-500/90 px-3 text-xs font-semibold text-white active:scale-[0.96] disabled:opacity-60"
                    >
                      {deletingId === memory.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Remover
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {canExpand && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex w-full items-center justify-center gap-1.5 rounded-[1.4rem] border border-white/10 bg-white/[0.03] py-2.5 text-xs font-semibold text-purple-100/70 active:scale-[0.98]"
            >
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  expanded ? "rotate-180" : ""
                }`}
              />
              {expanded ? "Ver menos" : `Ver mais (${hiddenCount})`}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

// ===========================================================================
// AVATAR DO PERFIL
// ===========================================================================

function AvatarUpload({
  avatarUrl,
  onUpdate,
}: {
  avatarUrl?: string;
  onUpdate: (profile: ProfileData) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Estado local do upload, menu e erro visual.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  // Fecha o menu de avatar ao clicar fora dele.
  useEffect(() => {
    if (!showMenu) return;

    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [showMenu]);

  // Envia a nova imagem e atualiza o perfil retornado pelo backend.
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setShowMenu(false);
    setError(null);
    setLoading(true);

    try {
      const updated = await api.uploadAvatar(file);
      onUpdate(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar imagem.");
    } finally {
      setLoading(false);

      // Permite selecionar o mesmo arquivo novamente depois de um envio.
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  // Remove a foto atual e sincroniza o card com o perfil atualizado.
  async function handleDelete() {
    setShowMenu(false);
    setLoading(true);
    setError(null);

    try {
      const updated = await api.deleteAvatar();
      onUpdate(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao remover imagem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative shrink-0" ref={menuRef}>
      {/* Input fica oculto; o clique acontece pelo avatar. */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={() =>
          avatarUrl ? setShowMenu((v) => !v) : fileInputRef.current?.click()
        }
        disabled={loading}
        className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.7rem] border border-accent-soft bg-accent-soft text-accent shadow-card transition active:scale-[0.97] disabled:opacity-60"
        aria-label="Foto de perfil"
      >
        {loading ? (
          <Loader2 className="h-7 w-7 animate-spin text-accent" />
        ) : avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="h-9 w-9" />
        )}

        {!loading && (
          <span className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-accent-soft bg-[var(--accent-strong)] backdrop-blur-sm">
            <Camera className="h-3 w-3 text-white" />
          </span>
        )}

        {!loading && !avatarUrl && (
          <span className="absolute bottom-2 right-2 h-3.5 w-3.5 rounded-full border-2 border-[var(--surface-elevated)] bg-emerald-400" />
        )}
      </button>

      {/* Menu aparece apenas quando já existe uma foto cadastrada. */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 top-[calc(100%+8px)] z-50 min-w-[180px] overflow-hidden rounded-2xl border border-soft bg-surface-elevated py-1 text-primary shadow-soft backdrop-blur-2xl"
          >
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                fileInputRef.current?.click();
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-secondary transition hover:bg-surface-muted active:bg-surface-muted"
            >
              <Camera className="h-4 w-4 text-accent" />
              Trocar foto
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition hover:bg-red-500/10 active:bg-red-500/10 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
              Remover foto
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="absolute left-0 top-[calc(100%+36px)] z-50 w-52 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-[0.7rem] leading-5 text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

// ===========================================================================
// MODAL DE EDIÇÃO DE NOME
// ===========================================================================

function EditNameModal({
  isOpen,
  currentName,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Estado local do modal para não alterar o perfil antes de salvar.
  const [value, setValue] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ao abrir, reidrata o nome atual e posiciona o foco no input.
  useEffect(() => {
    if (isOpen) {
      setValue(currentName);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen, currentName]);

  // Persiste o nome no backend e atualiza o card principal após sucesso.
  async function handleSave() {
    const trimmed = value.trim();

    if (!trimmed) {
      setError("O nome não pode ser vazio.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await api.updateProfile({ name: trimmed });
      onSave(trimmed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 px-4 pb-6 backdrop-blur-sm sm:items-center sm:pb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-full max-w-[400px] overflow-hidden rounded-[2rem] border border-soft bg-surface-elevated p-5 text-primary shadow-soft backdrop-blur-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent-soft bg-accent-soft text-accent">
                  <Edit3 className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-primary">
                    Editar nome
                  </p>
                  <p className="text-xs text-muted">
                    Visível no seu perfil
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-soft bg-surface-muted text-muted transition active:scale-[0.96]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4">
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                maxLength={60}
                placeholder="Seu nome"
                className="w-full rounded-2xl border border-soft bg-surface-muted px-4 py-3.5 text-sm font-medium text-primary outline-none ring-[var(--accent-soft)] transition placeholder:text-soft focus:border-accent-soft focus:ring-2"
              />

              {error && (
                <p className="mt-2 px-1 text-xs text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="min-h-12 rounded-2xl border border-soft bg-surface-muted px-4 text-sm font-semibold text-secondary transition active:scale-[0.98] disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !value.trim()}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--accent-strong)] px-4 text-sm font-semibold text-white shadow-card transition active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Salvar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
