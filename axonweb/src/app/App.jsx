import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import QuestionnaireIntro from "../pages/QuestionnaireIntro";
import Questionnaire from "../pages/Questionnaire";
import Analyzing from "../pages/Analyzing";
import Result from "../pages/Result";  
import Dashboard from "../pages/Dashboard";
import Chat from "../pages/Chat";


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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />

      </Routes>
    </BrowserRouter>
  );
}