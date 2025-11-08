import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import PageShell from "./components/PageShell";
import HomeEmpty from "./pages/HomeEmpty";
import HomeWithPlans from "./pages/HomeWithPlans";
import CreatePlan from "./pages/CreatePlan";
import PlanPage from "./pages/PlanPage";

function AppInner() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);

  const handleLogout = () => {
    alert("로그아웃");
  };

  const handleCreate = (payload) => {
    const id = Date.now();
    const newPlan = {
      id,
      title: payload.title || "새 여행",
      startDate: payload.startDate || "2025-11-06",
      endDate: payload.endDate || "2025-11-07",
      description: payload.description || "",
      today: [
        {
          todayNo: 1,
          placeName: "서울숲",
          placeType: "공원",
          startAt: "10:00",
          endAt: "12:00",
        },
        {
          todayNo: 2,
          placeName: "성수 카페",
          placeType: "카페",
          startAt: "12:30",
          endAt: "14:00",
        },
      ],
    };

    setPlans((prev) => [newPlan, ...prev]);
    navigate(`/plan/${id}`);
  };

  return (
    <PageShell onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={plans.length === 0 ? <HomeEmpty /> : <HomeWithPlans plans={plans} />} />
        <Route path="/plan/:id" element={<PlanPage plans={plans} />} />
        <Route path="/createplan" element={<CreatePlan onCreate={handleCreate} onCancel={() => navigate(-1)} />} />
        <Route path="*" element={<div className="p-10 text-center text-gray-500">페이지를 찾을 수 없습니다.</div>} />
      </Routes>
    </PageShell>
  );
}

function App() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
