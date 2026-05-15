import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import QuestionnaireIntro from "../pages/QuestionnaireIntro";
import Questionnaire from "../pages/Questionnaire";
import Analyzing from "../pages/Analyzing";
import Result from "../pages/Result";  
import DashboardLoading from "../pages/DashboardLoading";
import Dashboard from "../pages/Dashboard";
import Chat from "../pages/Chat";
import ChatConversation from "../pages/ChatConversation";
import Planning from "../pages/Planning";
import Insights from "../pages/Insights";
import Focus from "../pages/Focus";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/questionnaire-intro" element={<QuestionnaireIntro />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/analyzing" element={<Analyzing />} />
        <Route path="/result" element={<Result />} />
        <Route path="/dashboard-loading" element={<DashboardLoading />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:conversationId" element={<ChatConversation />} />
        <Route path="/planning" element={<Planning />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/focus" element={<Focus />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}