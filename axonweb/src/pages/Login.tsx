import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
} from "lucide-react";

import AuthLogo from "../components/auth/AuthLogo";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";
import * as api from "../lib/api";
import AuthBackground from "../components/layout/AuthBackground";

// ===========================================================================
// CAMPOS DO FORMULÁRIO
// ===========================================================================

type InputFieldProps = {
  icon: React.ElementType;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

// Campo genérico usado para entradas simples, como e-mail.
function InputField({
  icon: Icon,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: InputFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/55">
        {label}
      </span>

      <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 backdrop-blur-2xl transition focus-within:border-purple-300/35 focus-within:bg-white/[0.075]">
        <Icon className="h-5 w-5 text-purple-200/80" />

        <input
          type={type}
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

type PasswordFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

// Campo de senha com alternância visual entre senha oculta e visível.
function PasswordField({
  label,
  placeholder,
  value,
  onChange,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

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
          onClick={() => setShowPassword((prev) => !prev)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/38 transition hover:bg-white/10 hover:text-white/70 active:scale-[0.96]"
          aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
    </label>
  );
}

// ===========================================================================
// PÁGINA DE LOGIN
// ===========================================================================

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // ---------------------------------------------------------------------------
  // Estado do formulário
  // ---------------------------------------------------------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ---------------------------------------------------------------------------
  // Estado de sessão, erro e preferências de entrada
  // ---------------------------------------------------------------------------
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Captura erros enviados por redirecionamentos, como falha no Google OAuth.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlError = params.get("error");

    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
  }, [location.search]);

  // ---------------------------------------------------------------------------
  // Envio do login tradicional
  // ---------------------------------------------------------------------------
  // Após autenticar, o fluxo segue para o loading recorrente ou para o questionário.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.login(email, password);
      api.saveSession(res);

      if (res.has_chronotype) {
        navigate("/app-loading");
      } else {
        navigate("/questionnaire-intro");
      }
    } catch (err: unknown) {
      setError(
        (err as Error).message ?? "Erro ao entrar. Verifique suas credenciais."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05050b] px-4 py-8 text-white">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-[420px]">
        <AuthLogo />

        <motion.section
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55 }}
          className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-6"
        >
          {/* Cabeçalho da tela: contextualiza o retorno do usuário. */}
          <div className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-100">
              <Sparkles className="h-3.5 w-3.5" />
              Bem-vindo de volta
            </div>

            <h1 className="text-[2rem] font-semibold leading-[1.05] tracking-[-0.045em] text-white">
              Entre no seu segundo cérebro.
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/48">
              Acesse seu ambiente inteligente de rotina, foco e produtividade.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Credenciais principais. */}
            <InputField
              icon={Mail}
              label="E-mail"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordField
              label="Senha"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Preferências e recuperação de acesso. */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer sr-only"
                />

                <span className="flex h-5 w-5 items-center justify-center rounded-md border border-white/10 bg-white/[0.055] transition peer-checked:border-purple-300/30 peer-checked:bg-purple-500" />

                <span className="text-xs font-medium text-white/45">
                  Manter-me conectado
                </span>
              </label>

              <Link
                to="/forgotpassword"
                className="text-xs font-medium transition"
                style={{ color: "#a855f7" }}
              >
                Esqueci minha senha
              </Link>
            </div>

            {/* Erros de login tradicional ou redirecionamento externo. */}
            {error && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-300" />
                <p className="text-xs text-red-200">{error}</p>
              </div>
            )}

            {/* Login social fica antes do divisor para manter o padrão das telas auth. */}
            <div className="pt-4">
              <GoogleAuthButton label="Entrar com o Google" />

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs font-medium text-white/42">ou</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/40 transition hover:bg-purple-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </button>
          </form>

          {/* Link para o fluxo de cadastro. */}
          <p className="mt-6 text-center text-xs text-white/40">
            Ainda não tem conta?{" "}
            <Link
              to="/signup"
              className="font-medium"
              style={{ color: "#a855f7" }}
            >
              Criar conta
            </Link>
          </p>
        </motion.section>
      </div>
    </main>
  );
}
