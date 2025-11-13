// src/pages/MainA.js (또는 MainA.js 파일 경로)

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Paper,
} from "@mui/material";
import Navbar from "../../components/Navbar/afterLogin/Navbar_a";
import Footer from "../../components/Footer/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import SearchComponent from "../../components/Search/SearchComponent";
import PlannerSidebar from "../../components/PlannerSidebar/PlannerSidebar";
import TodayPlanDetailComponent from "./components/TodayPlanDetailComponent";
import client from "../../api/client";
import { createPlanner, getMyPlanners } from "../../api/planner";
import {
  createTodayPlan,
  updateTodayPlan,
  deleteTodayPlan,
} from "../../api/todayPlan";

const generateClientId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const extractPlannerList = (data) => {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (data?.planner) {
    return [data.planner];
  }

  if (typeof data === "object") {
    return [data];
  }

  return [];
};

const ensurePlanId = (plan) => {
  const candidate =
    plan?.todayPlanNo ??
    plan?.todayPlanId ??
    plan?.id ??
    plan?.contentId ??
    plan?.contentid ??
    plan?.placeId ??
    plan?.placeNo ??
    plan?.clientGeneratedId ??
    null;

  return candidate !== undefined && candidate !== null ? candidate : null;
};

const normalizePlan = (plan, fallbackPlannerNo) => {
  if (!plan) {
    return null;
  }

  const existingId = ensurePlanId(plan);
  const resolvedId = existingId ?? generateClientId();
  const titleText = plan.placeName || plan.title || plan.name || "";
  const addressText = plan.addr || plan.address || plan.location || "";
  const imageUrl =
    plan.imageUrl ||
    plan.image ||
    plan.thumbnail ||
    plan.firstImage ||
    plan.firstimage ||
    null;

  return {
    ...plan,
    id: resolvedId,
    clientGeneratedId: existingId ? plan.clientGeneratedId : resolvedId,
    todayPlanNo: plan.todayPlanNo ?? plan.todayPlanId ?? null,
    plannerNo: plan.plannerNo ?? fallbackPlannerNo ?? null,
    placeName: titleText || plan.placeName || plan.title || "",
    title: titleText || plan.title || plan.placeName || "",
    addr: addressText,
    address: addressText,
    imageUrl: imageUrl,
    image: imageUrl ?? plan.image ?? null,
  };
};

const normalizePlannerPlans = (planner) => {
  const plans =
    planner?.todayPlanResponseList ??
    planner?.todayPlans ??
    planner?.todayPlanList ??
    planner?.todayPlanDtoList ??
    [];

  if (!Array.isArray(plans)) {
    return [];
  }

  return plans
    .map((plan) =>
      normalizePlan(
        {
          ...plan,
          plannerNo: plan?.plannerNo ?? planner?.plannerNo ?? planner?.id ?? null,
        },
        planner?.plannerNo ?? planner?.id ?? null
      )
    )
    .filter(Boolean);
};

const resolvePlannerTitle = (planner) => planner?.plannerTitle ?? planner?.title ?? "";

const getPlanIdentifier = (plan) => {
  const candidate = ensurePlanId(plan);
  if (candidate !== null) {
    return candidate;
  }
  if (plan?.id !== undefined && plan?.id !== null) {
    return plan.id;
  }
  if (plan?.clientGeneratedId !== undefined && plan?.clientGeneratedId !== null) {
    return plan.clientGeneratedId;
  }
  return null;
};

const isSameIdentifier = (plan, identifier) => {
  if (!plan) {
    return false;
  }
  const planId = getPlanIdentifier(plan);
  if (planId === identifier) {
    return true;
  }
  if (planId === null || identifier === null) {
    return false;
  }
  return String(planId) === String(identifier);
};

const MainA = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [plannerTitle, setPlannerTitle] = useState("");
  const [todayPlans, setTodayPlans] = useState([]);
  const [currentPlanner, setCurrentPlanner] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const loadPlannerData = useCallback(
    async (userId) => {
      try {
        const plannerResponse = await getMyPlanners(
          userId !== undefined && userId !== null ? { userId } : undefined
        );
        const planners = extractPlannerList(plannerResponse);

        if (!planners.length) {
          setCurrentPlanner(null);
          setPlannerTitle("");
          setTodayPlans([]);
          setSelectedPlan(null);
          setDetailOpen(false);
          return;
        }

        const firstPlanner = planners[0];
        setCurrentPlanner(firstPlanner);
        const resolvedTitle = resolvePlannerTitle(firstPlanner);
        setPlannerTitle(resolvedTitle);
        const normalizedPlans = normalizePlannerPlans(firstPlanner);
        setTodayPlans(normalizedPlans);
        if (normalizedPlans.length > 0) {
          setSelectedPlan(normalizedPlans[0]);
          setDetailOpen(true);
        } else {
          setSelectedPlan(null);
          setDetailOpen(false);
        }
      } catch (error) {
        console.error("플래너 정보를 불러오지 못했습니다:", error);
      }
    },
    []
  );

  useEffect(() => {
    const initialize = async () => {
      const query = new URLSearchParams(location.search);
      const token = query.get("token");

      if (token) {
        localStorage.setItem("accessToken", token);
        navigate("/main_a", { replace: true });
        return;
      }

      const savedToken = localStorage.getItem("accessToken");
      if (!savedToken) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      try {
        const userResponse = await client.get("/user/additionalInfo/check");
        const user = userResponse?.data ?? {};
        const resolvedUserId =
          user?.userId ?? user?.id ?? user?.userid ?? user?.userNo ?? null;
        setCurrentUserId(resolvedUserId);
        if (!user.name) {
          setOpenModal(true);
        }

        await loadPlannerData(resolvedUserId ?? undefined);
      } catch (error) {
        console.log("요청 시 보낸 토큰:", savedToken);
        console.error("유저 정보 요청 실패:", error);
        alert("로그인 정보가 유효하지 않습니다.");
        navigate("/login");
      }
    };

    initialize();
  }, [location, navigate, loadPlannerData]);

  const handleGoToAdditionalInfo = () => {
    setOpenModal(false);
    navigate("/additional-info");
  };

  const handleAddPlan = (plan) => {
    const enrichedPlan = normalizePlan(
      {
        ...plan,
        placeName: plan.placeName ?? plan.title ?? "",
        title: plan.title ?? plan.placeName ?? "",
        addr: plan.addr ?? plan.address ?? "",
        address: plan.address ?? plan.addr ?? "",
        plannerNo: plan.plannerNo ?? currentPlanner?.plannerNo ?? null,
      },
      currentPlanner?.plannerNo ?? null
    );

    if (!enrichedPlan) {
      return;
    }

    setTodayPlans((prev) => {
      const planId = getPlanIdentifier(enrichedPlan);
      if (planId !== null && prev.some((item) => isSameIdentifier(item, planId))) {
        return prev;
      }
      return [...prev, enrichedPlan];
    });
    setSelectedPlan(enrichedPlan);
    setDetailOpen(true);
  };

  const handleSelectSidebarItem = (plan) => {
    const identifier = getPlanIdentifier(plan);
    const resolvedPlan =
      todayPlans.find((item) => isSameIdentifier(item, identifier)) ??
      normalizePlan(plan, currentPlanner?.plannerNo ?? null);
    setSelectedPlan(resolvedPlan);
    setDetailOpen(true);
  };

  const handleRemovePlan = async (planId, plan) => {
    const targetPlan =
      plan ?? todayPlans.find((item) => isSameIdentifier(item, planId));
    if (!targetPlan) {
      setTodayPlans((prev) => prev.filter((item) => !isSameIdentifier(item, planId)));
      return;
    }

    try {
      if (targetPlan.todayPlanNo) {
        await deleteTodayPlan(targetPlan.todayPlanNo);
      }

      const targetIdentifier = getPlanIdentifier(targetPlan);
      setTodayPlans((prev) =>
        prev.filter((item) => {
          if (targetIdentifier !== null) {
            return !isSameIdentifier(item, targetIdentifier);
          }
          return item !== targetPlan;
        })
      );

      if (
        selectedPlan &&
        (targetIdentifier !== null
          ? isSameIdentifier(selectedPlan, targetIdentifier)
          : selectedPlan === targetPlan)
      ) {
        setSelectedPlan(null);
        setDetailOpen(false);
      }
    } catch (error) {
      console.error("오늘의 일정 삭제 실패:", error);
      alert("오늘의 일정을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleSaveTodayPlan = async ({
    plannerNo,
    placeName,
    startAt,
    endAt,
    budgetAmount,
    memo,
  }) => {
    if (!selectedPlan) {
      return;
    }

    const resolvedPlannerNo =
      plannerNo ?? currentPlanner?.plannerNo ?? selectedPlan.plannerNo;

    if (!resolvedPlannerNo) {
      alert("먼저 플래너를 저장하거나 선택해주세요.");
      return;
    }

    const identifier = getPlanIdentifier(selectedPlan);
    const requestBody = {
      plannerNo: resolvedPlannerNo,
      todayPlanNo: selectedPlan.todayPlanNo ?? null,
      placeName: placeName ?? selectedPlan.placeName ?? selectedPlan.title ?? "",
      startAt,
      endAt,
      budgetAmount,
      memo,
      mapX: selectedPlan.mapX ?? selectedPlan.mapx ?? null,
      mapY: selectedPlan.mapY ?? selectedPlan.mapy ?? null,
      address: selectedPlan.addr ?? selectedPlan.address ?? "",
      imageUrl: selectedPlan.imageUrl ?? selectedPlan.image ?? null,
    };

    try {
      let response;
      if (selectedPlan.todayPlanNo) {
        response = await updateTodayPlan(selectedPlan.todayPlanNo, requestBody);
      } else {
        response = await createTodayPlan(requestBody);
      }

      const responseData = response ?? {};
      const mergedPlan = normalizePlan(
        {
          ...selectedPlan,
          ...responseData,
          plannerNo: resolvedPlannerNo,
          todayPlanNo:
            responseData?.todayPlanNo ??
            responseData?.todayPlanId ??
            selectedPlan.todayPlanNo ??
            null,
          placeName: placeName ?? selectedPlan.placeName,
          startAt,
          endAt,
          budgetAmount,
          memo,
        },
        resolvedPlannerNo
      );

      setTodayPlans((prev) => {
        const next = prev.map((plan) =>
          isSameIdentifier(plan, identifier) ? mergedPlan : plan
        );
        if (!next.some((plan) => isSameIdentifier(plan, getPlanIdentifier(mergedPlan)))) {
          next.push(mergedPlan);
        }
        return next;
      });

      setSelectedPlan(mergedPlan);
      setDetailOpen(true);
      alert("일정이 저장되었습니다.");
    } catch (error) {
      console.error("오늘의 일정 저장 실패:", error);
      alert("일정을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleCancelDetail = () => {
    setDetailOpen(false);
  };

  const handleSavePlanner = async () => {
    if (!plannerTitle.trim()) {
      alert("플래너 제목을 입력해주세요.");
      return;
    }

    try {
      if (currentPlanner?.plannerNo) {
        await client.put(`/api/planners/${currentPlanner.plannerNo}`, {
          plannerTitle: plannerTitle.trim(),
        });
        setCurrentPlanner((prev) =>
          prev ? { ...prev, plannerTitle: plannerTitle.trim() } : prev
        );
      } else {
        if (!currentUserId) {
          alert("사용자 정보를 불러오지 못했습니다. 다시 로그인해주세요.");
          return;
        }
        const response = await createPlanner({
          userId: currentUserId,
          plannerTitle: plannerTitle.trim(),
        });
        const newPlanner = response ?? {};
        setCurrentPlanner(newPlanner);
        const normalizedPlans = normalizePlannerPlans(newPlanner);
        setTodayPlans(normalizedPlans);
        if (normalizedPlans.length > 0) {
          setSelectedPlan(normalizedPlans[0]);
          setDetailOpen(true);
        }
        await loadPlannerData(currentUserId);
      }

      alert("플래너가 저장되었습니다.");
    } catch (error) {
      console.error("플래너 저장 중 오류:", error);
      alert("플래너 저장에 실패했습니다.");
    }
  };
  // ... (여기까지 로직 동일) ...

  const selectedPlanId = useMemo(
    () => (selectedPlan ? getPlanIdentifier(selectedPlan) : null),
    [selectedPlan]
  );

  return (
    <>
      <Navbar />
      <Container>
        <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start", my: 4 }}>
          <PlannerSidebar
            plannerTitle={plannerTitle}
            onTitleChange={setPlannerTitle}
            todayPlans={todayPlans}
            onSelectPlan={handleSelectSidebarItem}
            selectedPlanId={selectedPlanId}
            onRemove={handleRemovePlan}
            onSave={handleSavePlanner}
          />
          <Box
            sx={{
              flex: 1,
              display: "flex",
              gap: 3,
              alignItems: "flex-start",
              minHeight: 420,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <SearchComponent onAddPlan={handleAddPlan} />
            </Box>
            {detailOpen && selectedPlan ? (
              <TodayPlanDetailComponent
                place={selectedPlan}
                onSave={handleSaveTodayPlan}
                onCancel={handleCancelDetail}
              />
            ) : (
              <Paper
                elevation={3}
                sx={{
                  width: 360,
                  p: 3,
                  bgcolor: "#fff8e1",
                  borderRadius: 2,
                  border: "1px dashed #f2bf24",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  일정 상세 정보
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  왼쪽 플래너에서 일정을 선택하거나 검색 결과에서 일정을 추가하면
                  상세 정보를 편집할 수 있습니다.
                </Typography>
              </Paper>
            )}
          </Box>
        </Box>
      </Container>
      <Footer />

      {/* ... (Dialog 관련 코드는 그대로) ... */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>추가 정보 입력 필요</DialogTitle>
        <DialogContent>
          <DialogContentText>
            처음 로그인하신 것 같아요! 닉네임 등 추가 정보를 입력해주세요.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>닫기</Button>
          <Button
            onClick={handleGoToAdditionalInfo}
            variant="contained"
            sx={{
              backgroundColor: "#d71f1c",
              "&:hover": {
                backgroundColor: "#b81a18",
              },
              color: "#fff",
            }}
          >
            입력하러 가기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MainA;