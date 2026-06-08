import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as api from "../lib/api";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");

    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    const sessionCode = params.get("session_code");
    if (!sessionCode) {
      navigate("/login?error=Falha+na+autenticação+com+Google");
      return;
    }

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05050b]">
      <p className="text-sm text-white/50">Autenticando com Google...</p>
    </div>
  );
}
