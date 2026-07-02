import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as api from "../lib/api";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  // Fluxo de retorno do Google: valida a URL, cria sessão local e decide a próxima tela.
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Erros vindos do backend/OAuth voltam para o login com a mensagem preservada.
    const error = params.get("error");
    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    // O backend envia um código temporário usado para buscar os tokens reais da sessão.
    const sessionCode = params.get("session_code");
    if (!sessionCode) {
      navigate("/login?error=Falha+na+autenticação+com+Google");
      return;
    }

    // Após salvar a sessão, usuários novos seguem para o questionário de cronotipo.
    api
      .exchangeGoogleSession(sessionCode)
      .then((session) => {
        api.saveSession(session);

        if (session.has_chronotype) {
          navigate("/app-loading");
        } else {
          navigate("/questionnaire-intro");
        }
      })
      .catch(() => {
        navigate("/login?error=Falha+na+autenticação+com+Google");
      });
  }, []);

  // Feedback mínimo enquanto o código do Google é convertido em sessão do Axon.
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05050b]">
      <p className="text-sm text-white/50">Autenticando com Google...</p>
    </div>
  );
}
