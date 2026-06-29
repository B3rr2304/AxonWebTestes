import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  Camera,
  Check,
  ChevronRight,
  Edit3,
  Loader2,
  Mail,
  Menu,
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

export default function Profile() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (!api.isLoggedIn()) {
      navigate("/login");
      return;
    }
    api.getProfile().then(setProfile).catch(() => setProfile(null));
  }, [navigate]);

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
  const userName = profile?.name || "Usuário";
  const userEmail = profile?.email || "";

  const scheduleLabel =
    profile?.schedule_type
      ? SCHEDULE_TYPE_LABEL[profile.schedule_type] ?? profile.schedule_type
      : "—";

  const profileDetails = [
    { label: "Estilo de rotina", value: scheduleLabel },
    { label: "Modo de trabalho", value: "Blocos de foco" },
    { label: "Tom do Axon", value: "Direto e estratégico" },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#11111a] text-white">
      <Background />

      <div className="relative z-10 min-h-screen px-4 pb-6 pt-5">
        <header className="mb-5 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 text-left active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200 shadow-lg shadow-purple-950/30">
              <img src="/axon-logo.svg" alt="Axon" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Perfil</p>
              <p className="text-xs text-white/40">Identidade e preferências</p>
            </div>
          </button>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/65 backdrop-blur-2xl active:scale-[0.96]"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <section className="mb-4">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#1b1b27]/82 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.24),transparent_48%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_40%)]" />

            <div className="relative">
              <div className="mb-5 flex items-center gap-4">
                <AvatarUpload
                  avatarUrl={profile?.avatar_url}
                  onUpdate={(updated) => setProfile(updated)}
                />

                <div className="min-w-0 flex-1">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1 text-[0.68rem] font-medium text-purple-100">
                    <Sparkles className="h-3.5 w-3.5" />
                    Perfil ativo
                  </div>

                  <h1 className="truncate text-2xl font-semibold tracking-[-0.045em] text-white">
                    {userName}
                  </h1>

                  <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{userEmail}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsEditOpen(true)}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-sm font-semibold text-white/62 backdrop-blur-2xl active:scale-[0.98]"
              >
                Editar perfil
                <Edit3 className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-[2rem] border border-purple-300/20 bg-purple-500/10 p-4 shadow-xl shadow-purple-950/20 backdrop-blur-2xl">
          <div className="mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-200" />
            <p className="text-sm font-semibold text-purple-100">Perfil produtivo</p>
          </div>

          <h2 className="text-[1.75rem] font-semibold leading-[1.05] tracking-[-0.055em] text-white">
            {hasChronotype ? result.label : "Cronotipo não definido"}
          </h2>

          <p className="mt-3 text-sm leading-6 text-white/55">
            {hasChronotype
              ? result.subtitle
              : "Você ainda não respondeu o questionário nesta conta. Responda para o Axon conhecer seu ritmo."}
          </p>

          <button
            onClick={() => navigate(`/result?from=profile&chronotype=${resultKey}`)}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/10 px-5 text-sm font-semibold text-purple-100 active:scale-[0.98]"
          >
            Ver resultado completo
            <ChevronRight className="ml-2 h-4 w-4" />
          </button>
        </section>

        <section className="mb-4 rounded-[2rem] border border-white/10 bg-[#1b1b27]/76 p-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
          <div className="mb-4 flex items-center gap-2">
            <Workflow className="h-4 w-4 text-purple-200" />
            <p className="text-sm font-semibold text-white">Preferências principais</p>
          </div>

          <div className="space-y-3">
            {profileDetails.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-3"
              >
                <p className="text-xs text-white/38">{item.label}</p>
                <p className="text-xs font-semibold text-white/70">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <button
            onClick={() => navigate("/questionnaire-intro")}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/40 active:scale-[0.98]"
          >
            Refazer questionário
            <RefreshCcw className="ml-2 h-4 w-4" />
          </button>

          <button
            onClick={() => navigate("/settings")}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-6 text-sm font-semibold text-white/58 backdrop-blur-2xl active:scale-[0.98]"
          >
            Configurações da conta
            <Settings className="ml-2 h-4 w-4" />
          </button>
        </section>
      </div>

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

// ---------------------------------------------------------------------------
// Avatar upload component
// ---------------------------------------------------------------------------

function AvatarUpload({
  avatarUrl,
  onUpdate,
}: {
  avatarUrl?: string;
  onUpdate: (profile: ProfileData) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

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
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

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
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Avatar circle */}
      <button
        type="button"
        onClick={() => (avatarUrl ? setShowMenu((v) => !v) : fileInputRef.current?.click())}
        disabled={loading}
        className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.7rem] border border-purple-300/25 bg-purple-500/15 text-purple-100 shadow-xl shadow-purple-950/30 active:scale-[0.97] disabled:opacity-60"
        aria-label="Foto de perfil"
      >
        {loading ? (
          <Loader2 className="h-7 w-7 animate-spin text-purple-200" />
        ) : avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <User className="h-9 w-9" />
        )}

        {/* Camera badge */}
        {!loading && (
          <span className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-purple-300/30 bg-purple-600/80 backdrop-blur-sm">
            <Camera className="h-3 w-3 text-white" />
          </span>
        )}

        {/* Online indicator */}
        {!loading && !avatarUrl && (
          <span className="absolute bottom-2 right-2 h-3.5 w-3.5 rounded-full border-2 border-[#201527] bg-emerald-400" />
        )}
      </button>

      {/* Context menu (when photo exists) */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 top-[calc(100%+8px)] z-50 min-w-[180px] overflow-hidden rounded-2xl border border-white/10 bg-[#1c1b2a]/95 py-1 shadow-2xl shadow-black/40 backdrop-blur-2xl"
          >
            <button
              onClick={() => { setShowMenu(false); fileInputRef.current?.click(); }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/[0.06] active:bg-white/10"
            >
              <Camera className="h-4 w-4 text-purple-300" />
              Trocar foto
            </button>
            <button
              onClick={handleDelete}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-white/[0.06] active:bg-white/10"
            >
              <Trash2 className="h-4 w-4" />
              Remover foto
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error tooltip */}
      {error && (
        <p className="absolute left-0 top-[calc(100%+36px)] z-50 w-52 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-[0.7rem] leading-5 text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edit name modal
// ---------------------------------------------------------------------------

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
  const [value, setValue] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(currentName);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen, currentName]);

  async function handleSave() {
    const trimmed = value.trim();
    if (!trimmed) { setError("O nome não pode ser vazio."); return; }
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
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 px-4 pb-6 backdrop-blur-sm sm:items-center sm:pb-0"
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
            className="w-full max-w-[400px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#15141f]/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/10 text-purple-200">
                  <Edit3 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Editar nome</p>
                  <p className="text-xs text-white/40">Visível no seu perfil</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/40 active:scale-[0.96]"
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
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm font-medium text-white placeholder-white/25 outline-none ring-purple-500/50 transition focus:border-purple-400/40 focus:ring-2"
              />
              {error && <p className="mt-2 px-1 text-xs text-red-400">{error}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-semibold text-white/60 active:scale-[0.98] disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !value.trim()}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-purple-500 px-4 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Salvar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#151520_0%,#101018_48%,#13131d_100%)]" />
      <div className="absolute left-1/2 top-[-14rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-purple-700/22 blur-[120px]" />
      <div className="absolute right-[-12rem] top-[18rem] h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/10 blur-[110px]" />
      <div className="absolute bottom-[-12rem] left-[-12rem] h-[26rem] w-[26rem] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:30px_30px] opacity-[0.12]" />
    </div>
  );
}
