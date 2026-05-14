import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Mail,
  Lock,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import * as api from "../lib/api";

function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[-16rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-purple-700/25 blur-[120px]" />
      <div className="absolute right-[-14rem] top-[16rem] h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/10 blur-[110px]" />
      <div className="absolute bottom-[-12rem] left-[-10rem] h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:30px_30px] opacity-20" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,5,11,0.08),#05050b_88%)]" />
    </div>
  );
}

type InputFieldProps = {
  icon: React.ElementType;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function InputField({ icon: Icon, label, type = "text", placeholder, value, onChange }: InputFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/55">{label}</span>
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

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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
      setError("Você precisa aceitar os Termos de Uso e a Política de Privacidade.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.register(name, email, password);
      api.saveSession(res);
      navigate("/questionnaire-intro");
    } catch (err: unknown) {
      setError((err as Error).message ?? "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05050b] px-4 py-8 text-white">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-[440px]">
        <Link
          to="/"
          className="mx-auto mb-8 flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 backdrop-blur-2xl transition hover:bg-white/[0.07]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-200">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Axon</p>
            <p className="text-xs text-white/40">Personal OS</p>
          </div>
        </Link>

        <motion.section
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55 }}
          className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-6"
        >
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
                Depois do cadastro, você responderá um questionário rápido para personalizar sua experiência.
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <InputField icon={User} label="Nome" type="text" placeholder="Como devemos te chamar?" value={name} onChange={(e) => setName(e.target.value)} />
            <InputField icon={Mail} label="E-mail" type="email" placeholder="seuemail@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
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

            <label className="flex cursor-pointer items-start gap-3 pt-1">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAcceptedTerms(e.target.checked)
                }
                className="peer sr-only"
              />

              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.055] transition peer-checked:border-purple-300/30 peer-checked:bg-purple-500">
                {acceptedTerms && (
                  <span className="h-2.5 w-2.5 rounded-sm bg-white" />
                )}
              </span>

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

            <button
              type="submit"
              disabled={loading || !acceptedTerms}
               className="mt-3 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/40 transition hover:bg-purple-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none"
            >
              {loading ? "Criando conta..." : "Criar minha conta"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/45">
            Já tem conta?{" "}
            <Link to="/login" className="font-medium text-purple-200">
              Entrar
            </Link>
          </p>
        </motion.section>
      </div>
    </main>
  );
}
