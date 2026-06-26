import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ScrollToTop from "../components/layout/ScrollToTop";

import LandingPage from "../pages/LandingPage";

// Auth
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import AuthCallback from "../pages/AuthCallback";

// Onboarding
import QuestionnaireIntro from "../pages/QuestionnaireIntro";
import Questionnaire from "../pages/Questionnaire";
import Analyzing from "../pages/Analyzing";
import Result from "../pages/Result";
import DashboardLoading from "../pages/DashboardLoading";
import AppLoading from "../pages/AppLoading";
import NotificationToastProvider from "../components/notifications/NotificationToastProvider";

// App
import Dashboard from "../pages/Dashboard";
import Chat from "../pages/Chat";
import ChatConversation from "../pages/ChatConversation";
import Planejamento from "../pages/Planejamento";
import Insights from "../pages/Insights";
import RotinaDetalhe from "../pages/RotinaDetalhe";
import Focus from "../pages/Focus";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <NotificationToastProvider />

      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Redirects para evitar erro caso algum link antigo ainda exista */}
        <Route
          path="/forgotpassword"
          element={<Navigate to="/forgot-password" replace />}
        />
        <Route
          path="/resetpassword"
          element={<Navigate to="/reset-password" replace />}
        />

        {/* Onboarding */}
        <Route path="/questionnaire-intro" element={<QuestionnaireIntro />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/analyzing" element={<Analyzing />} />
        <Route path="/result" element={<Result />} />
        <Route path="/app-loading" element={<AppLoading />} />
        <Route path="/dashboard-loading" element={<DashboardLoading />} />

        {/* App interno */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:chatId" element={<ChatConversation />} />
        <Route path="/planning" element={<Planejamento initialView="agenda" />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/rotinas" element={<Planejamento initialView="rotinas" />} />
        <Route path="/rotinas/:id" element={<RotinaDetalhe />} />
        <Route path="/objetivos" element={<Planejamento initialView="objetivos" />} />
        <Route path="/focus" element={<Focus />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}