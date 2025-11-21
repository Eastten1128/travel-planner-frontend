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
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SearchComponent from "../../components/Search/SearchComponent";
import PlannerSidebar from "../../components/PlannerSidebar/PlannerSidebar";
import TodayPlanDetailComponent from "./components/TodayPlanDetailComponent";
import client from "../../api/client";
import { createPlanner, getMyPlanners, getPlannerByNo } from "../../api/planner";
import {
  createTodayPlan,
  updateTodayPlan,
  deleteTodayPlan,
} from "../../api/todayplan";

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

const normalizeTimeForDisplay = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    if (value.includes("T")) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString().slice(11, 16);
      }
    }

    if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
      return value.slice(0, 5);
    }

    if (/^\d{2}:\d{2}$/.test(value)) {
      return value;
    }
  }

  if (value instanceof Date) {
    return value.toISOString().slice(11, 16);
  }

  return "";
};

const normalizeNumeric = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return null;
  }
  return numeric;
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
    startAt: normalizeTimeForDisplay(plan.startAt),
    endAt: normalizeTimeForDisplay(plan.endAt),
    budgetAmount: normalizeNumeric(plan.budgetAmount),
    memo: plan.memo ?? "",
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

const toTimeWithSeconds = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    if (/^\d{2}:\d{2}$/.test(value)) {
      return `${value}:00`;
    }

    if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
      return value;
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(11, 19);
    }
  }

  if (value instanceof Date) {
    return value.toISOString().slice(11, 19);
  }

  return null;
};

const normalizeCoordinate = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return null;
  }
  return numeric;
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
  const {plannerNo} = useParams();

const loadPlannerData = useCallback(
  async (userId, targetPlannerNo) => {
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

      // 🔥 URL에서 온 plannerNo와 일치하는 플래너 찾기
      let selectedPlanner = planners[0]; // 기본값: 첫 번째
      if (targetPlannerNo !== undefined && targetPlannerNo !== null) {
        const numericTarget = Number(targetPlannerNo);
        if (!Number.isNaN(numericTarget)) {
          const found = planners.find(
            (p) => Number(p.plannerNo) === numericTarget
          );
          if (found) {
            selectedPlanner = found; // URL과 일치하는 plannerNo 있으면 그걸 사용
          }
        }
      }

      setCurrentPlanner(selectedPlanner);

      const resolvedTitle = resolvePlannerTitle(selectedPlanner);
      setPlannerTitle(resolvedTitle);

      const normalizedPlans = normalizePlannerPlans(selectedPlanner);
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

        await loadPlannerData(resolvedUserId ?? undefined, plannerNo);

      } catch (error) {
        console.log("요청 시 보낸 토큰:", savedToken);
        console.error("유저 정보 요청 실패:", error);
        alert("로그인 정보가 유효하지 않습니다.");
        navigate("/login");
      }
    };

    initialize();
  }, [location, navigate, loadPlannerData, plannerNo]);

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
    //**************************씨부레 8이 나온?
    console.log(enrichedPlan);



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

  // 1) 시간 부분을 HH:mm:ss 로 정규화
  const sanitizedStartTime =
    toTimeWithSeconds(startAt) ?? toTimeWithSeconds(selectedPlan.startAt);
  const sanitizedEndTime =
    toTimeWithSeconds(endAt) ?? toTimeWithSeconds(selectedPlan.endAt);

  if (!sanitizedStartTime || !sanitizedEndTime) {
    alert("시작 시간과 종료 시간을 올바르게 입력해주세요.");
    return;
  }

  // 2) 날짜 부분(todayPlanDate 등)에서 yyyy-MM-dd 추출
  const rawDateValue =
    selectedPlan.todayPlanDate ??
    selectedPlan.planDate ??
    selectedPlan.todayDate ??
    selectedPlan.travelDate ??
    null;

  const extractDatePart = (value) => {
    if (!value) return null;

    // 문자열인 경우
    if (typeof value === "string") {
      // "2025-11-19T00:00:00" 같이 T가 있으면 앞부분만
      if (value.includes("T")) {
        return value.split("T")[0];
      }
      // "2025-11-19" 형태라고 가정
      return value.slice(0, 10);
    }

    // Date 객체인 경우
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10); // yyyy-MM-dd
    }

    return null;
  };

  let datePart = extractDatePart(rawDateValue);

  // 만약 날짜가 전혀 없다면, 오늘 날짜로 fallback
  if (!datePart) {
    datePart = new Date().toISOString().slice(0, 10); // yyyy-MM-dd
  }

  // 3) LocalDateTime 형식으로 합치기: yyyy-MM-ddTHH:mm:ss
  const startDateTime = `${datePart}T${sanitizedStartTime}`;
  const endDateTime = `${datePart}T${sanitizedEndTime}`;

  const numericBudget = normalizeNumeric(budgetAmount);
  const resolvedBudget =
    numericBudget ?? normalizeNumeric(selectedPlan.budgetAmount);
  const numericPlannerNo = Number(resolvedPlannerNo);

  if (Number.isNaN(numericPlannerNo)) {
    alert("선택된 플래너 정보를 확인할 수 없습니다. 다시 시도해주세요.");
    return;
  }

  const identifier = getPlanIdentifier(selectedPlan);
  const resolvedMemo =
    typeof memo === "string" ? memo : selectedPlan.memo ?? "";

  const todaySequence =
    selectedPlan.todayNo ??
    selectedPlan.sequence ??
    selectedPlan.order ??
    selectedPlan.orderNo ??
    null;


    //********************************************************return값을 +1씩 증가시켜야해요.
    //db에서 userId, PlannerNo를 특정시킨 Planner의 today_no의 최대값을 갖고와 +1 
  const resolvedTodayNo = (() => {
    if (todaySequence !== null && todaySequence !== undefined) {
      const numericTodayNo = Number(todaySequence);
      return Number.isNaN(numericTodayNo) ? 3 : numericTodayNo;
    }
    return 2;
  })();

  const placeTypeCandidate =
    selectedPlan.placeTypeId ??
    selectedPlan.placeTypeNo ??
    selectedPlan.placeType?.id ??
    selectedPlan.contentTypeId ??
    selectedPlan.contenttypeid ??
    null;
  const resolvedPlaceTypeId = (() => {
    if (placeTypeCandidate === null || placeTypeCandidate === undefined) {
      return null;
    }
    const numericType = Number(placeTypeCandidate);
    return Number.isNaN(numericType) ? null : numericType;
  })();

  const placeRefCandidate =
    selectedPlan.placeRef ??
    selectedPlan.contentId ??
    selectedPlan.contentid ??
    selectedPlan.placeId ??
    selectedPlan.placeNo ??
    selectedPlan.id ??
    null;

  const todayPlanDate =
    selectedPlan.todayPlanDate ??
    selectedPlan.planDate ??
    selectedPlan.todayDate ??
    selectedPlan.travelDate ??
    null;

  const baseRequest = {
    plannerNo: numericPlannerNo,
    todayNo: resolvedTodayNo,
    placeName:
      placeName ?? selectedPlan.placeName ?? selectedPlan.title ?? "",
    startAt: startDateTime,
    endAt: endDateTime,
    ...(resolvedBudget !== null ? { budgetAmount: resolvedBudget } : {}),
    memo: resolvedMemo,
  };

  if (resolvedPlaceTypeId !== null) {
    baseRequest.placeTypeId = resolvedPlaceTypeId;
  }

  if (placeRefCandidate !== null && placeRefCandidate !== undefined) {
    baseRequest.placeRef = String(placeRefCandidate);
  }

  try {
    let response;
    if (selectedPlan.todayPlanNo) {
      response = await updateTodayPlan(selectedPlan.todayPlanNo, {
        ...baseRequest,
        todayPlanNo: selectedPlan.todayPlanNo,
      });
    } else {
      response = await createTodayPlan(baseRequest);
    }

    const responseData = response ?? {};
    const mergedPlan = normalizePlan(
      {
        ...selectedPlan,
        ...responseData,
        plannerNo: numericPlannerNo,
        todayPlanNo:
          responseData?.todayPlanNo ??
          responseData?.todayPlanId ??
          selectedPlan.todayPlanNo ??
          null,
        placeName:
          placeName ??
          responseData?.placeName ??
          selectedPlan.placeName ??
          selectedPlan.title ??
          "",
        // 여기에는 LocalDateTime을 넣지만, normalizePlan에서 화면용 HH:mm로 다시 잘라줄 것
        startAt: startDateTime,
        endAt: endDateTime,
        budgetAmount:
          resolvedBudget ?? normalizeNumeric(selectedPlan.budgetAmount) ?? null,
        memo: resolvedMemo,
        todayPlanDate:
          responseData?.todayPlanDate ??
          todayPlanDate ??
          selectedPlan.todayPlanDate ??
          selectedPlan.planDate ??
          selectedPlan.todayDate ??
          null,
        todayNo:
          responseData?.todayNo ??
          responseData?.sequence ??
          responseData?.order ??
          todaySequence ??
          selectedPlan.todayNo ??
          selectedPlan.sequence ??
          selectedPlan.order ??
          selectedPlan.orderNo ??
          null,
        contentId:
          responseData?.contentId ??
          baseRequest.contentId ??
          selectedPlan.contentId ??
          selectedPlan.contentid ??
          selectedPlan.placeId ??
          selectedPlan.placeNo ??
          selectedPlan.id ??
          null,
        contentTypeId:
          responseData?.contentTypeId ??
          responseData?.contenttypeid ??
          baseRequest.contentTypeId ??
          selectedPlan.contentTypeId ??
          selectedPlan.contenttypeid ??
          null,
      },
      numericPlannerNo
    );

    setTodayPlans((prev) => {
      const next = prev.map((plan) =>
        isSameIdentifier(plan, identifier) ? mergedPlan : plan
      );
      if (
        !next.some((plan) =>
          isSameIdentifier(plan, getPlanIdentifier(mergedPlan))
        )
      ) {
        next.push(mergedPlan);
      }
      return next;
    });

    setSelectedPlan(mergedPlan);
    setDetailOpen(true);
    alert("일정이 저장되었습니다.");
  } catch (error) {
    console.error("오늘의 일정 저장 실패:", error);
    let message = "일정을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.";
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      message = "로그인 세션이 만료되었습니다. 다시 로그인한 뒤 이용해주세요.";
    } else if (error?.code === "ERR_NETWORK") {
      message =
        "서버에 연결할 수 없습니다. 로그인 상태를 확인한 뒤 다시 시도해주세요.";
      console.log("saved accessToken:", localStorage.getItem("accessToken"));

    }
    alert(message);
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