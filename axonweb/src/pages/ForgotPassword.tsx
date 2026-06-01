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

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Digite seu e-mail para continuar.");
      return;
    }

    setLoading(true);

    try {
      // Aqui depois conectamos com a API real de recuperação de senha.
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#11111a] px-4 py-6 text-white">
      <Background />

      <div className="relative z-10 w-full max-w-[430px]">
        <AuthLogo />

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#1b1b27]/82 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.24),transparent_48%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_40%)]" />

          <div className="relative">
            {!sent ? (
              <>
                <div className="mb-7">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                    <Sparkles className="h-3.5 w-3.5" />
                    Esqueci minha senha
                  </div>

                  <h1 className="text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-white">
                    Vamos recuperar seu acesso.
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-white/50">
                    Digite o e-mail cadastrado na sua conta. Enviaremos um link
                    para você redefinir sua senha.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <EmailField
                    label="E-mail"
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />

                  {error && (
                    <div className="flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-300" />
                      <p className="text-xs leading-5 text-red-200">
                        {error}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/40 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Enviando..." : "Enviar link de recuperação"}
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
            ) : (
              <>
                <div className="mb-7">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-100">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>

                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                    <Sparkles className="h-3.5 w-3.5" />
                    Link enviado
                  </div>

                  <h1 className="text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-white">
                    Confira sua caixa de entrada.
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-white/50">
                    Se o e-mail estiver cadastrado no Axon, você receberá um
                    link para redefinir sua senha em alguns instantes.
                  </p>

                  <div className="mt-5 rounded-2xl border border-purple-300/15 bg-purple-500/10 p-4">
                    <p className="text-xs leading-5 text-white/55">
                      Enviamos as instruções para{" "}
                      <span className="font-medium text-purple-100">
                        {email}
                      </span>
                      . Verifique também sua caixa de spam ou promoções.
                    </p>
                  </div>
                </div>

                <Link
                  to="/login"
                  className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/40 active:scale-[0.98]"
                >
                  Voltar para login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setError("");
                  }}
                  className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-6 text-sm font-semibold text-white/55 backdrop-blur-2xl active:scale-[0.98]"
                >
                  Usar outro e-mail
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

type EmailFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function EmailField({ label, placeholder, value, onChange }: EmailFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/55">
        {label}
      </span>

      <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 backdrop-blur-2xl transition focus-within:border-purple-300/35 focus-within:bg-white/[0.075]">
        <Mail className="h-5 w-5 text-purple-200/80" />

        <input
          type="email"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/28"
        />
      </div>
    </label>
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