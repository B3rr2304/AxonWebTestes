import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import AuthLogo from "../components/auth/AuthLogo";
import AuthBackground from "../components/layout/AuthBackground";

export default function ForgotPassword() {
  // ---------------------------------------------------------------------------
  // Estado do formulário
  // ---------------------------------------------------------------------------
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------------------------------------------------------
  // Envio da solicitação de recuperação
  // ---------------------------------------------------------------------------
  // Fluxo visual temporário até conectar a API real de recuperação de senha.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Digite seu e-mail para continuar.");
      return;
    }

    setLoading(true);

    try {
      // Exemplo futuro: await api.forgotPassword(email);
      await new Promise((resolve) => setTimeout(resolve, 900));

      setSent(true);
    } catch {
      setError("Não foi possível enviar o link. Tente novamente.");
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
            {!sent ? (
              <RecoveryFormState
                email={email}
                loading={loading}
                error={error}
                onEmailChange={setEmail}
                onSubmit={handleSubmit}
              />
            ) : (
              <SentConfirmationState
                email={email}
                onUseAnotherEmail={() => {
                  setSent(false);
                  setError("");
                }}
              />
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

function RecoveryFormState({
  email,
  loading,
  error,
  onEmailChange,
  onSubmit,
}: {
  email: string;
  loading: boolean;
  error: string;
  onEmailChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <>
      {/* Estado inicial: coleta o e-mail da conta que receberá o link. */}
      <div className="mb-7">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-soft bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          Esqueci minha senha
        </div>

        <h1 className="text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-primary">
          Vamos recuperar seu acesso.
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted">
          Digite o e-mail cadastrado na sua conta. Enviaremos um link para você
          redefinir sua senha.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <EmailField
          label="E-mail"
          placeholder="seuemail@exemplo.com"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
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
          {loading ? "Enviando..." : "Enviar link de recuperação"}
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

function SentConfirmationState({
  email,
  onUseAnotherEmail,
}: {
  email: string;
  onUseAnotherEmail: () => void;
}) {
  return (
    <>
      {/* Estado de sucesso: confirma o envio sem revelar se a conta existe. */}
      <div className="mb-7">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-soft bg-accent-soft text-accent">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-soft bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          Link enviado
        </div>

        <h1 className="text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-primary">
          Confira sua caixa de entrada.
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted">
          Se o e-mail estiver cadastrado no Axon, você receberá um link para
          redefinir sua senha em alguns instantes.
        </p>

        <div className="mt-5 rounded-2xl border border-accent-soft bg-accent-soft p-4">
          <p className="text-xs leading-5 text-muted">
            Enviamos as instruções para{" "}
            <span className="font-medium text-accent">{email}</span>.
            Verifique também sua caixa de spam ou promoções.
          </p>
        </div>
      </div>

      <Link
        to="/login"
        className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[var(--accent-strong)] px-6 text-sm font-semibold text-white shadow-card transition active:scale-[0.98]"
      >
        Voltar para login
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>

      <button
        type="button"
        onClick={onUseAnotherEmail}
        className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-soft bg-surface-muted px-6 text-sm font-semibold text-secondary backdrop-blur-2xl transition active:scale-[0.98]"
      >
        Usar outro e-mail
      </button>
    </>
  );
}

// ===========================================================================
// COMPONENTES INTERNOS
// ===========================================================================

type EmailFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

// Campo de e-mail reutilizado no fluxo de recuperação.
function EmailField({ label, placeholder, value, onChange }: EmailFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-muted">
        {label}
      </span>

      <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-soft bg-surface-muted px-4 backdrop-blur-2xl transition focus-within:border-accent-soft focus-within:bg-accent-muted">
        <Mail className="h-5 w-5 text-accent" />

        <input
          type="email"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-soft"
        />
      </div>
    </label>
  );
}
