// 메인 페이지(비로그인) - 기본 레이아웃과 검색/지도 프리뷰 제공
import { useState } from "react";
import Navbar from "../../components/Navbar/beforeLogin/Navbar_b";
import Footer from "../../components/Footer/Footer";
import PlannerSidebar from "../../components/PlannerSidebar/PlannerSidebar";
import SearchComponent from "../../components/Search/SearchComponent";
import GoogleMap from "../../components/Map/GoogleMap";
import TodayPlanDetailComponent from "./components/TodayPlanDetailComponent";
//import handleLoginClick from "../../utils/handleLoginClick";

const MainB = () => {
  const [todayPlans, setTodayPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleAddPlan = (plan) => {
    setTodayPlans((prev) => [...prev, plan]);
    setSelectedPlan(plan);
  };

  const handleSavePlan = async () => {
    alert("로그인 후 일정을 저장할 수 있습니다.");
  };

  const dologinClick = () => {
    // Spring Security가 제공하는 Google OAuth2 로그인 URL
    window.location.href = "https://sw6885travelplannerfin.uk/oauth2/authorization/google";
  }

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col bg-gray-100">
        <div className="min-h-screen flex items-center bg-white">
  <div className="mx-auto px-10">
    {/* 메인 타이틀 */}
    <h1 className="text-5xl md:text-6xl font-extrabold leading-snug text-black">
      기존에 경험하지 못한
      <br />
      새로운 여행 플래너
    </h1>

    {/* 서브 문구 */}
    <p className="mt-6 text-sm md:text-base text-gray-500">
      고민만 하던 여행 계획을 <span className="font-semibold">플래너</span>를 통해 몇 분 만에 스케줄링 해보세요.
    </p>

    {/* 버튼 */}
    <button className="mt-10 inline-block bg-black text-white px-8 py-3 text-sm md:text-base font-semibold"
    onClick={dologinClick}
    >
      플래너 시작하기
    </button>
  </div>
</div>
        
      </main>
      <Footer />
    </>
  );
};

export default MainB;
