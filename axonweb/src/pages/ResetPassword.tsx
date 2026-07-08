import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
} from "lucide-react";

import AuthLogo from "../components/auth/AuthLogo";
import AuthBackground from "../components/layout/AuthBackground";

// ===========================================================================
// PÁGINA DE REDEFINIÇÃO DE SENHA
// ===========================================================================

export default function ResetPassword() {
  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // Campos do formulário
  // ---------------------------------------------------------------------------
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ---------------------------------------------------------------------------
  // Visibilidade dos campos de senha
  // ---------------------------------------------------------------------------
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ---------------------------------------------------------------------------
  // Estado de envio e feedback
  // ---------------------------------------------------------------------------
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------------------------------------------------------
  // Validação e envio da nova senha
  // ---------------------------------------------------------------------------
  // Fluxo visual temporário até conectar a API real de reset de senha.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Preencha os dois campos para continuar.");
      return;
    }

    if (password.length < 6) {
      setError("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      // Exemplo futuro: await api.resetPassword({ token, password });
      await new Promise((resolve) => setTimeout(resolve, 900));

      setSuccess(true);
    } catch {
      setError("Não foi possível alterar sua senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app px-4 py-6 text-primary">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-[430px]">
        <AuthLogo />

        <section className="relative overflow-hidden rounded-[2rem] border border-soft bg-surface-elevated p-5 text-primary shadow-soft backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--accent-soft),transparent_48%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_40%)] opacity-60 dark:opacity-30" />

          <div className="relative">
            {!success ? (
              <ResetPasswordForm
                password={password}
                confirmPassword={confirmPassword}
                showPassword={showPassword}
                showConfirmPassword={showConfirmPassword}
                loading={loading}
                error={error}
                onSubmit={handleSubmit}
                onPasswordChange={setPassword}
                onConfirmPasswordChange={setConfirmPassword}
                onTogglePassword={() => setShowPassword((prev) => !prev)}
                onToggleConfirmPassword={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
              />
            ) : (
              <ResetPasswordSuccess onGoToLogin={() => navigate("/login")} />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

// ===========================================================================
// ESTADOS VISUAIS DA TELA
// ===========================================================================

function ResetPasswordForm({
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  loading,
  error,
  onSubmit,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirmPassword,
}: {
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  loading: boolean;
  error: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
}) {
  return (
    <>
      {/* Estado inicial: coleta e confirma a nova senha. */}
      <div className="mb-7">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-soft bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          Redefinir senha
        </div>

        <h1 className="text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-primary">
          Crie uma nova senha.
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted">
          Escolha uma senha segura para recuperar seu acesso ao Axon.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <PasswordField
          label="Nova senha"
          placeholder="Digite sua nova senha"
          value={password}
          showPassword={showPassword}
          onToggleVisibility={onTogglePassword}
          onChange={(event) => onPasswordChange(event.target.value)}
        />

        <PasswordField
          label="Confirmar nova senha"
          placeholder="Repita sua nova senha"
          value={confirmPassword}
          showPassword={showConfirmPassword}
          onToggleVisibility={onToggleConfirmPassword}
          onChange={(event) => onConfirmPasswordChange(event.target.value)}
        />

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-300" />

            <p className="text-xs leading-5 text-red-600 dark:text-red-200">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[var(--accent-strong)] px-6 text-sm font-semibold text-white shadow-card transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar nova senha"}
          {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
        </button>
      </form>

      <Link
        to="/login"
        className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-soft bg-surface-muted px-6 text-sm font-semibold text-secondary backdrop-blur-2xl transition active:scale-[0.98]"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para login
      </Link>
    </>
  );
}

function ResetPasswordSuccess({
  onGoToLogin,
}: {
  onGoToLogin: () => void;
}) {
  return (
    <>
      {/* Estado de sucesso: confirma que a senha foi redefinida. */}
      <div className="mb-7">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-soft bg-accent-soft text-accent">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-soft bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          Senha alterada
        </div>

        <h1 className="text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-primary">
          Seu acesso foi recuperado.
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted">
          Sua senha foi redefinida com sucesso. Agora você já pode entrar
          novamente no Axon.
        </p>
      </div>

      <button
        type="button"
        onClick={onGoToLogin}
        className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[var(--accent-strong)] px-6 text-sm font-semibold text-white shadow-card transition active:scale-[0.98]"
      >
        Ir para login
        <ArrowRight className="ml-2 h-4 w-4" />
      </button>
    </>
  );
}

// ===========================================================================
// COMPONENTES INTERNOS
// ===========================================================================

type PasswordFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  showPassword: boolean;
  onToggleVisibility: () => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

// Campo de senha reutilizado para nova senha e confirmação.
function PasswordField({
  label,
  placeholder,
  value,
  showPassword,
  onToggleVisibility,
  onChange,
}: PasswordFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-muted">
        {label}
      </span>

      <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-soft bg-surface-muted px-4 backdrop-blur-2xl transition focus-within:border-accent-soft focus-within:bg-accent-muted">
        <Lock className="h-5 w-5 text-accent" />

        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-soft"
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted transition hover:bg-surface-muted hover:text-secondary active:scale-[0.96]"
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          {showPassword ? (
            <EyeOff className="h-4.5 w-4.5" />
          ) : (
            <Eye className="h-4.5 w-4.5" />
          )}
        </button>
      </div>
    </label>
  );
}