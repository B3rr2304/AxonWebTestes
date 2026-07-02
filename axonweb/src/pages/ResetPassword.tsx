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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#11111a] px-4 py-6 text-white">
      <Background />

      <div className="relative z-10 w-full max-w-[430px]">
        <AuthLogo />

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#1b1b27]/82 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.24),transparent_48%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_40%)]" />

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
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
          <Sparkles className="h-3.5 w-3.5" />
          Redefinir senha
        </div>

        <h1 className="text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-white">
          Crie uma nova senha.
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/50">
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
            <AlertCircle className="h-4 w-4 shrink-0 text-red-300" />

            <p className="text-xs leading-5 text-red-200">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/40 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar nova senha"}
          {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
        </button>
      </form>

      <Link
        to="/login"
        className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-6 text-sm font-semibold text-white/55 backdrop-blur-2xl active:scale-[0.98]"
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
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-100">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
          <Sparkles className="h-3.5 w-3.5" />
          Senha alterada
        </div>

        <h1 className="text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-white">
          Seu acesso foi recuperado.
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/50">
          Sua senha foi redefinida com sucesso. Agora você já pode entrar
          novamente no Axon.
        </p>
      </div>

      <button
        type="button"
        onClick={onGoToLogin}
        className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/40 active:scale-[0.98]"
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
      <span className="mb-2 block text-sm font-medium text-white/55">
        {label}
      </span>

      <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 backdrop-blur-2xl transition focus-within:border-purple-300/35 focus-within:bg-white/[0.075]">
        <Lock className="h-5 w-5 text-purple-200/80" />

        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/28"
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/38 transition active:scale-[0.96]"
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

// ===========================================================================
// BACKGROUND VISUAL
// ===========================================================================

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
