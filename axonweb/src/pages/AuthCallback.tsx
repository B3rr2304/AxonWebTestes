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

    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token") ?? "";
    const user_id = params.get("user_id");
    const email = params.get("email") ?? "";
    const name = params.get("name") ?? undefined;
    const has_chronotype = params.get("has_chronotype") === "true";

    if (!access_token || !user_id) {
      navigate("/login?error=Falha+na+autenticação+com+Google");
      return;
    }

    api.saveSession({ access_token, refresh_token, user_id, email, name, has_chronotype });

    if (has_chronotype) {
      navigate("/app-loading");
    } else {
      navigate("/questionnaire-intro");
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05050b]">
      <p className="text-sm text-white/50">Autenticando com Google...</p>
    </div>
  );
}
