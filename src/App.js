import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';

import MainA from "./pages/main/Main_page_a";
import MainPlan from "./pages/main/MainPlan";
import MainB from "./pages/main/Main_page_b";
import AdditionalInfo from "./pages/exception/AdditionalInfo";
import LoginError from "./pages/exception/LoginError";
import TravelChatPage from "./pages/TravelChatPage";

import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <Routes>
          <Route path="/" element={<MainB />} />
          <Route path="/main_b" element={<MainB />} />
          <Route path="/main_a" element={<MainPlan />} />
          <Route path="/main/plan" element={<MainPlan />} />
          <Route path="/main/plan/detail/:plannerNo" element={<MainA />} />
          <Route path="/additional-info" element={<AdditionalInfo />} />
          <Route path="/loginError" element={<LoginError />} />
          <Route path="/chat" element={<TravelChatPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
