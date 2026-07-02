// ===========================================================================
// CONFIGURAÇÃO DA API
// ===========================================================================
// URL base usada para iniciar o fluxo OAuth com o backend.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// ===========================================================================
// TIPOS DO COMPONENTE
// ===========================================================================

type GoogleAuthButtonProps = {
  label: string;
};

// ===========================================================================
// BOTÃO DE AUTENTICAÇÃO COM GOOGLE
// ===========================================================================

export default function GoogleAuthButton({ label }: GoogleAuthButtonProps) {
  // Redireciona para o endpoint do backend responsável pelo OAuth do Google.
  function handleClick() {
    window.location.href = `${API_URL}/auth/google`;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-6 text-sm font-semibold text-white/72 shadow-xl shadow-black/20 backdrop-blur-2xl transition hover:bg-white/[0.08] active:scale-[0.98]"
    >
      <GoogleIcon />
      <span>{label}</span>
    </button>
  );
}

// ===========================================================================
// ÍCONE DO GOOGLE
// ===========================================================================
// SVG local para evitar depender de imagem externa no botão de login/cadastro.
function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.8 9.1-9.2 0-.6-.1-1.1-.2-1.6H12Z"
      />
      <path
        fill="#34A853"
        d="M3.5 7.4 6.7 9.8C7.5 7.9 9.5 6.5 12 6.5c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.6 2.5 12 2.5c-3.7 0-6.9 2-8.5 4.9Z"
      />
      <path
        fill="#4A90E2"
        d="M12 21.5c2.6 0 4.8-.9 6.4-2.4l-3-2.3c-.8.6-1.9 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1l-3.1 2.4c1.6 3.2 4.9 5.4 8.7 5.4Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.7c-.2-.6-.3-1.1-.3-1.7s.1-1.2.3-1.7L3.3 7.9C2.8 9.1 2.5 10.5 2.5 12s.3 2.9.8 4.1l3.1-2.4Z"
      />
    </svg>
  );
}
