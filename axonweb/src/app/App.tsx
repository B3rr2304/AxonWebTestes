import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ScrollToTop from "../components/layout/ScrollToTop";
import NotificationToastProvider from "../components/notifications/NotificationToastProvider";

// ===========================================================================
// PÁGINAS PÚBLICAS
// ===========================================================================

import LandingPage from "../pages/LandingPage";

// ===========================================================================
// AUTENTICAÇÃO
// ===========================================================================

import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import AuthCallback from "../pages/AuthCallback";

// ===========================================================================
// ONBOARDING E CARREGAMENTOS
// ===========================================================================

import QuestionnaireIntro from "../pages/QuestionnaireIntro";
import Questionnaire from "../pages/Questionnaire";
import Analyzing from "../pages/Analyzing";
import Result from "../pages/Result";
import DashboardLoading from "../pages/DashboardLoading";
import AppLoading from "../pages/AppLoading";

// ===========================================================================
// APP INTERNO
// ===========================================================================

import Dashboard from "../pages/Dashboard";
import Chat from "../pages/Chat";
import ChatConversation from "../pages/ChatConversation";
import Planejamento from "../pages/Planejamento";
import Insights from "../pages/Insights";
import Focus from "../pages/Focus";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";

// ===========================================================================
// MAPA PRINCIPAL DE ROTAS
// ===========================================================================

export default function App() {
  return (
    <BrowserRouter>
      {/* Mantém cada navegação iniciando no topo da página. */}
      <ScrollToTop />

      {/* Toasts globais de notificação, disponíveis em rotas públicas e internas. */}
      <NotificationToastProvider />

      <Routes>
        {/* ------------------------------------------------------------------ */}
        {/* Público */}
        {/* ------------------------------------------------------------------ */}
        <Route path="/" element={<LandingPage />} />

        {/* ------------------------------------------------------------------ */}
        {/* Autenticação */}
        {/* ------------------------------------------------------------------ */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Compatibilidade com links antigos sem hífen. */}
        <Route
          path="/forgotpassword"
          element={<Navigate to="/forgot-password" replace />}
        />
        <Route
          path="/resetpassword"
          element={<Navigate to="/reset-password" replace />}
        />

        {/* ------------------------------------------------------------------ */}
        {/* Onboarding */}
        {/* ------------------------------------------------------------------ */}
        <Route path="/questionnaire-intro" element={<QuestionnaireIntro />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/analyzing" element={<Analyzing />} />
        <Route path="/result" element={<Result />} />
        <Route path="/app-loading" element={<AppLoading />} />
        <Route path="/dashboard-loading" element={<DashboardLoading />} />

        {/* ------------------------------------------------------------------ */}
        {/* App interno */}
        {/* ------------------------------------------------------------------ */}
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:chatId" element={<ChatConversation />} />

        {/* Planejamento reutiliza a mesma página com visões iniciais diferentes. */}
        <Route
          path="/planning"
          element={<Planejamento initialView="agenda" />}
        />
        <Route
          path="/rotinas"
          element={<Planejamento initialView="rotinas" />}
        />
        <Route
          path="/objetivos"
          element={<Planejamento initialView="objetivos" />}
        />

        <Route path="/insights" element={<Insights />} />
        <Route path="/focus" element={<Focus />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />

        {/* ------------------------------------------------------------------ */}
        {/* Fallback */}
        {/* ------------------------------------------------------------------ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
