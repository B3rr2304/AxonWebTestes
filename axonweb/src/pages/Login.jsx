import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Mail, Lock, Sparkles } from "lucide-react";

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

function InputField(props) {
  const { icon: Icon, label, type = "text", placeholder } = props;

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
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/28"
        />
      </div>
    </label>
  );
}

export default function Login() {
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    navigate("/questionnaire-intro");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05050b] px-4 py-8 text-white">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-[420px]">
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
            <InputField
              icon={Mail}
              label="E-mail"
              type="email"
              placeholder="seuemail@exemplo.com"
            />

            <InputField
              icon={Lock}
              label="Senha"
              type="password"
              placeholder="Digite sua senha"
            />

            <div className="flex items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs text-white/45">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/10 bg-white/10 accent-purple-500"
                />
                Lembrar de mim
              </label>

              <a href="#" className="text-xs font-medium text-purple-200">
                Esqueci minha senha
              </a>
            </div>

            <button
              type="submit"
              className="mt-3 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/40 transition hover:bg-purple-400 active:scale-[0.98]"
            >
              Entrar
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/45">
            Ainda não tem conta?{" "}
            <Link to="/signup" className="font-medium text-purple-200">
              Criar conta
            </Link>
          </p>
        </motion.section>
      </div>
    </main>
  );
}