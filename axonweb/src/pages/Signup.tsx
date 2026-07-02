import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  User,
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

// Campo genérico usado para nome e e-mail.
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
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

// Campo de senha com alternância de visibilidade.
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
// PÁGINA DE CADASTRO
// ===========================================================================

export default function Signup() {
  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // Estado do formulário
  // ---------------------------------------------------------------------------
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ---------------------------------------------------------------------------
  // Estado de envio, erro e aceite legal
  // ---------------------------------------------------------------------------
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // ---------------------------------------------------------------------------
  // Validação e criação da conta
  // ---------------------------------------------------------------------------
  // Depois do cadastro, a sessão é salva e o usuário entra no onboarding.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (!acceptedTerms) {
      setError(
        "Você precisa aceitar os Termos de Uso e a Política de Privacidade."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await api.register(name, email, password);
      api.saveSession(res);
      navigate("/questionnaire-intro");
    } catch (err: unknown) {
      setError(
        (err as Error).message ?? "Erro ao criar conta. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05050b] px-4 py-8 text-white">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-[440px]">
        <AuthLogo />

        <motion.section
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55 }}
          className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-6"
        >
          {/* Cabeçalho: prepara o usuário para o cadastro e o questionário. */}
          <div className="mb-4">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-100">
              <Sparkles className="h-3.5 w-3.5" />
              Primeiro acesso
            </div>

            <h1 className="text-[2rem] font-semibold leading-[1.05] tracking-[-0.045em] text-white">
              Crie seu Axon pessoal.
            </h1>

            <div className="flex items-start gap-3 py-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-purple-200" />

              <p className="text-sm leading-6 text-white/48">
                Depois do cadastro, você responderá um questionário rápido para
                personalizar sua experiência.
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Dados básicos da nova conta. */}
            <InputField
              icon={User}
              label="Nome"
              type="text"
              placeholder="Como devemos te chamar?"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <InputField
              icon={Mail}
              label="E-mail"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Senha e confirmação antes de criar a conta no backend. */}
            <PasswordField
              label="Senha"
              placeholder="Crie uma senha segura"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
            />

            <PasswordField
              label="Confirmar senha"
              placeholder="Repita sua senha"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setConfirmPassword(e.target.value)
              }
            />

            {error && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-300" />
                <p className="text-xs text-red-200">{error}</p>
              </div>
            )}

            {/* Aceite obrigatório antes do cadastro tradicional. */}
            <label className="flex cursor-pointer items-start gap-3 pt-1">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAcceptedTerms(e.target.checked)
                }
                className="peer sr-only"
              />

              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.055] transition peer-checked:border-purple-300/30 peer-checked:bg-purple-500" />

              <span className="text-xs leading-5 text-white/45">
                Li e concordo com os{" "}
                <a href="#" className="font-medium text-purple-200">
                  Termos de Uso
                </a>{" "}
                e a{" "}
                <a href="#" className="font-medium text-purple-200">
                  Política de Privacidade
                </a>
                .
              </span>
            </label>

            {/* Cadastro social e divisor visual. */}
            <div className="pt-4">
              <GoogleAuthButton label="Cadastrar com o Google" />

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
              {loading ? "Criando conta..." : "Criar minha conta"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </button>
          </form>

          {/* Link para quem já possui uma conta. */}
          <p className="mt-6 text-center text-xs text-white/40">
            Já tem conta?{" "}
            <Link
              to="/login"
              className="font-medium"
              style={{ color: "#a855f7" }}
            >
              Entrar
            </Link>
          </p>
        </motion.section>
      </div>
    </main>
  );
}
