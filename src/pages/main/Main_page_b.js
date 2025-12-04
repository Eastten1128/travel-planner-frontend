// 메인 페이지(비로그인) - 기본 레이아웃과 검색/지도 프리뷰 제공
import { useState } from "react";
import Navbar from "../../components/Navbar/beforeLogin/Navbar_b";
import Footer from "../../components/Footer/Footer";
import PlannerSidebar from "../../components/PlannerSidebar/PlannerSidebar";
import SearchComponent from "../../components/Search/SearchComponent";
import GoogleMap from "../../components/Map/GoogleMap";
import TodayPlanDetailComponent from "./components/TodayPlanDetailComponent";

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

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col bg-gray-100">
        <div className="flex flex-1 flex-col gap-4 px-4 py-6 lg:px-8">
          <div className="flex flex-1 flex-col gap-4 lg:flex-row">
            <div className="flex flex-col gap-4 lg:basis-[30%] lg:max-w-[32%]">
              <div className="flex-1">
                <PlannerSidebar
                  plannerTitle="나의 여행 플래너"
                  todayPlans={todayPlans}
                  onTitleChange={() => {}}
                  plannerNo={null}
                  onSelectPlan={(plan) => setSelectedPlan(plan)}
                  selectedPlanId={selectedPlan?.id}
                  onRemove={(planId) =>
                    setTodayPlans((prev) => prev.filter((plan) => plan.id !== planId))
                  }
                  onSave={handleSavePlan}
                />
              </div>

              <div className="flex-1">
                <SearchComponent onAddPlan={handleAddPlan} />
              </div>
            </div>

            <div className="relative flex flex-1 basis-[70%] overflow-hidden rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100 lg:p-6 lg:min-h-[520px]">
              <div className="flex w-full flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">지도</h2>
                </div>
                <div className="relative flex-1 overflow-hidden rounded-2xl bg-gray-50 shadow-inner">
                  <GoogleMap query={selectedPlan?.title || "Seoul"} height="100%" />
                </div>
              </div>

              <div className="absolute right-4 top-4 z-20 w-full max-w-md">
                {selectedPlan ? (
                  <TodayPlanDetailComponent
                    place={selectedPlan}
                    onSave={handleSavePlan}
                    onCancel={() => setSelectedPlan(null)}
                    plannerStartday={null}
                    plannerEndday={null}
                  />
                ) : (
                  <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/90 p-4 text-sm shadow-sm">
                    <p className="text-base font-semibold text-amber-900">일정 상세 정보</p>
                    <p className="mt-1 text-amber-700">
                      검색을 통해 추가한 일정을 여기에서 확인하고 수정할 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default MainB;
