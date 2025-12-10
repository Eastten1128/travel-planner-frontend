import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import Navbar from "../../components/Navbar/afterLogin/Navbar_a";
import Footer from "../../components/Footer/Footer";
import CreatePlan from "../../components/CreatePlan";
import client from "../../api/client";
import { deletePlanner, getMyPlanners } from "../../api/planner";

const MainPlan = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [tokenReady, setTokenReady] = useState(false);
  const [planners, setPlanners] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    

    if (token) {
      localStorage.setItem("accessToken", token);
      navigate("/main/plan", { replace: true });
      return;
    }

    const savedToken = localStorage.getItem("accessToken");
    if (!savedToken) {
      alert("로그인이 필요합니다.");
      navigate("/main_b");
      return;
    }

    setTokenReady(true);
  }, [location.search, navigate]);

  useEffect(() => {
    if (!tokenReady) return;

    const fetchUser = async () => {
      try {
        const response = await client.get("/user/additionalInfo/check");
        const user = response?.data || {};
        if (!user?.name) {
          setShowAdditionalInfo(true);
        }
        const resolvedUserId =
          user?.userId ?? user?.id ?? user?.userid ?? user?.userNo ?? null;
        if (resolvedUserId !== null && resolvedUserId !== undefined) {
          setUserId(resolvedUserId);
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
          navigate("/main_b");
          return;
        }
        console.error("사용자 정보 조회 실패:", err);
      }
    };

    fetchUser();
  }, [tokenReady, navigate]);

  const refreshPlanners = useCallback(
    async (options) => {
      if (!tokenReady) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getMyPlanners(options);
        setPlanners(Array.isArray(data) ? data : []);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
          navigate("/main_b");
          return;
        }
        console.error("플래너 목록 조회 실패:", err);
        setError("플래너 목록을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    },
    [navigate, tokenReady]
  );

  useEffect(() => {
    if (!tokenReady) return;
    refreshPlanners(userId ? { userId }: undefined);
  }, [tokenReady, userId, refreshPlanners]);

  const handleCreateSuccess = useCallback(
    (createdPlanner) => {
      setShowCreate(false);
      if (createdPlanner && createdPlanner.plannerNo) {
        setPlanners((prev) => {
          const filtered = prev.filter((item) => item.plannerNo !== createdPlanner.plannerNo);
          return [createdPlanner, ...filtered];
        });
      } else {
         refreshPlanners(userId ? { userId } : undefined);
      }
    },
    [refreshPlanners, userId]
  );

  //PlannerNo
  const handleGoToDetail = useCallback( 
    (plannerNo) => {
      navigate(`/main/plan/detail/${plannerNo}`);
    },
    [navigate]
  );

  const highlightedPlanner = useMemo(() => planners[0] || null, [planners]);
  const remainingPlanners = useMemo(() => planners.slice(1), [planners]);

   // 현재 선택된 플래너를 백엔드에 삭제 요청하고,
  // 삭제 후 플래너 목록과 선택 상태를 초기화하는 핸들러
  const handleDeletePlanner = useCallback(async () => {
    const currentPlanner = highlightedPlanner;

    if (!currentPlanner || !currentPlanner.plannerNo) {
      alert("삭제할 플래너가 선택되지 않았습니다.");
      return;
    }

    const plannerNo = currentPlanner.plannerNo;

    const confirmed = window.confirm("현재 플래너를 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await deletePlanner(plannerNo);

      setPlanners((prev) =>
        prev.filter((planner) => planner.plannerNo !== plannerNo)
      );

      alert("플래너가 삭제되었습니다.");
    } catch (error) {
      console.error("플래너 삭제 실패:", error);
      alert("플래너 삭제 중 오류가 발생했습니다.");
    }
  }, [highlightedPlanner]);


  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 pb-16">
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">나의 여행 플래너</h1>
            <button
              type="button"
              className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              onClick={() => setShowCreate(true)}
            >
              새 여행 추가
            </button>
          </div>

          {loading ? (
            <div className="mt-12 flex justify-center">
              <span className="text-sm text-gray-500">플래너 정보를 불러오는 중입니다...</span>
            </div>
          ) : error ? (
            <div className="mt-12 rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-600">
              {error}
            </div>
          ) : planners.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-dashed border-gray-300 bg-white px-8 py-16 text-center">
              <p className="text-lg font-semibold text-gray-900">등록된 여행이 없습니다.</p>
              <p className="mt-2 text-sm text-gray-500">새 여행을 추가하여 여행 계획을 시작해보세요!</p>
              <button
                type="button"
                className="mt-6 rounded-full border border-gray-200 px-6 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                onClick={() => setShowCreate(true)}
              >
                새 여행 추가
              </button>
            </div>
          ) : (
            <div className="mt-10 space-y-8">
              {highlightedPlanner && (
                <section className="rounded-3xl bg-white p-8 shadow-sm">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-emerald-600">예정된 여행</p>
                      <h2 className="mt-2 text-3xl font-bold text-gray-900">{highlightedPlanner.plannerTitle}</h2>
                      <p className="mt-3 text-sm text-gray-600">
                        {highlightedPlanner.plannerStartDate} ~ {highlightedPlanner.plannerEndDate}
                      </p>
                      
                    </div>
                    <div className="flex flex-col gap-3 md:w-56">
                      <button
                        type="button"
                        className="rounded-full bg-gray-900 px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                        onClick={() => handleGoToDetail(highlightedPlanner.plannerNo)}
                      >
                        여행 정보 수정
                      </button>
                      <button
                        type="button"
                        onClick={handleDeletePlanner}
                        className="mt-2 rounded-2xl bg-red-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-600"
                      >
                        플래너 삭제
                      </button>
                    </div>
                  </div>
                </section>
              )}

              <section className="rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-500 p-10 text-center shadow-sm">
                <h3 className="text-2xl font-semibold text-white">AI 추천</h3>
                <p className="mt-3 text-base text-indigo-100">맞춤 여행지 추천을 제공해드립니다.</p>
                <button
                  type="button"
                  className="mt-6 rounded-full bg-white/90 px-6 py-2 text-sm font-semibold text-indigo-700 shadow"
                  title="준비 중인 기능입니다."
                  onClick={() => navigate("/chat")}
                >
                  AI 추천 플래너 생성하기
                </button>
              </section>

              {remainingPlanners.length > 0 && (
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">다른 여행 계획</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {remainingPlanners.map((planner) => (
                      <article key={planner.plannerNo} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4">
                          <div>
                            <h4 className="text-xl font-semibold text-gray-900">{planner.plannerTitle}</h4>
                            <p className="mt-2 text-sm text-gray-600">
                              {planner.plannerStartDate} ~ {planner.plannerEndDate}
                            </p>
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              className="rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                              onClick={() => handleGoToDetail(planner.plannerNo)}
                            >
                              여행 정보 수정
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-2xl">
            <CreatePlan
              userId={userId}
              onSuccess={handleCreateSuccess}
              onClose={() => setShowCreate(false)}
            />
          </div>
        </div>
      )}

      <Footer />

      <Dialog open={showAdditionalInfo} onClose={() => setShowAdditionalInfo(false)}>
        <DialogTitle>추가 정보 입력 필요</DialogTitle>
        <DialogContent>
          <DialogContentText>
            처음 로그인하신 것 같아요! 닉네임 등 추가 정보를 입력해주세요.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAdditionalInfo(false)}>닫기</Button>
          <Button onClick={() => navigate("/additional-info")} variant="contained" color="primary">
            정보 입력하러 가기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MainPlan;
