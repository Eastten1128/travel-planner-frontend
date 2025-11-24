import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Divider,
} from "@mui/material";
import { getTodayPlansByPlanner } from "../../api/todayplan";


const PlannerSidebar = ({
  plannerTitle = "",
  onTitleChange,
  todayPlans = [],
  plannerNo,
  onSelectPlan,
  selectedPlanId,
  onRemove,
  onSave,
}) => {
  const [titleInput, setTitleInput] = useState(plannerTitle ?? "");
  const [savedPlans, setSavedPlans] = useState([]);

    useEffect(() => {
    let active = true;

    const fetchSavedPlans = async () => {
      if (plannerNo === undefined || plannerNo === null) {
        setSavedPlans([]);
        return;
      }

      try {
        const data = await getTodayPlansByPlanner(plannerNo);
        if (!active) return;

        const planList = (() => {
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.content)) return data.content;
          if (Array.isArray(data?.data)) return data.data;
          if (Array.isArray(data?.items)) return data.items;
          if (Array.isArray(data?.todayPlans)) return data.todayPlans;
          return [];
        })();

        setSavedPlans(
          planList.map((plan) => ({
            ...plan,
            plannerNo: plan?.plannerNo ?? plannerNo,
            __source: "saved",
          }))
        );
      } catch (error) {
        console.error("오늘의 일정 불러오기 실패:", error);
        if (active) {
          setSavedPlans([]);
        }
      }
    };

    fetchSavedPlans();

    return () => {
      active = false;
    };
  }, [plannerNo]);

  useEffect(() => {
    setTitleInput(plannerTitle ?? "");
  }, [plannerTitle]);

  const handleChangeTitle = (event) => {
    const nextValue = event.target.value;
    setTitleInput(nextValue);
    if (typeof onTitleChange === "function") {
      onTitleChange(nextValue);
    }
  };

  const resolvePlanId = (plan) =>
    plan?.todayPlanNo ??
    plan?.todayPlanId ??
    plan?.id ??
    plan?.contentId ??
    plan?.contentid ??
    plan?.placeId ??
    plan?.placeNo ??
    plan?.clientGeneratedId ??
    null;

      const resolvePlannerNo = (plan) =>
    plan?.plannerNo ?? plan?.plannerId ?? plan?.plannerid ?? null;

  const filteredDraftPlans = useMemo(() => {
    if (plannerNo === undefined || plannerNo === null) {
      return todayPlans;
    }

    return todayPlans.filter((plan) => {
      const planPlannerNo = resolvePlannerNo(plan);
      if (planPlannerNo === undefined || planPlannerNo === null) {
        return false;
      }

      return String(planPlannerNo) === String(plannerNo);
    });
  }, [plannerNo, todayPlans]);

  const filteredSavedPlans = useMemo(() => {
    if (plannerNo === undefined || plannerNo === null) {
      return savedPlans;
    }

    return savedPlans.filter((plan) => {
      const planPlannerNo = resolvePlannerNo(plan);
      if (planPlannerNo === undefined || planPlannerNo === null) {
        return false;
      }

      return String(planPlannerNo) === String(plannerNo);
    });
  }, [plannerNo, savedPlans]);

  const combinedPlans = useMemo(() => {
    const decoratedDrafts = filteredDraftPlans.map((plan) => ({
      ...plan,
      __source: plan.__source ?? "draft",
    }));

    const decoratedSaved = filteredSavedPlans.map((plan) => ({
      ...plan,
      __source: "saved",
    }));

    const seen = new Set();

    return [...decoratedSaved, ...decoratedDrafts].filter((plan) => {
      const id = resolvePlanId(plan);
      if (id === undefined || id === null) {
        return true;
      }

      if (seen.has(String(id))) {
        return false;
      }

      seen.add(String(id));
      return true;
    });
  }, [filteredDraftPlans, filteredSavedPlans]);

  const normalizedPlans = useMemo(
    () =>
      combinedPlans.map((plan) => {
        const planId = resolvePlanId(plan);
        const titleText = plan?.placeName || plan?.title || "이름 없는 일정";
        const addressText = plan?.addr || plan?.address || "";
        return {
          ...plan,
          __display: {
            id: planId,
            title: titleText,
            address: addressText,
            image: plan?.imageUrl || plan?.image || plan?.thumbnail,
            sourceLabel: plan.__source === "saved" ? "저장됨" : "임시",
          },
        };
      }),
    [combinedPlans]
  );

  const handleRemovePlan = (plan) => {
    const planId = resolvePlanId(plan);
    if (typeof onRemove === "function") {
      onRemove(planId, plan);
    }
  };

  const handleSelectPlan = (plan) => {
    if (typeof onSelectPlan !== "function") {
      return;
    }

    onSelectPlan(plan);
  };

  const isPlanSelected = (planId) => {
    if (selectedPlanId === undefined || selectedPlanId === null) {
      return false;
    }

    return selectedPlanId === planId;
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: 340,
        p: 3,
        bgcolor: "#d0f0ff",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          label="플래너 제목"
          value={titleInput}
          onChange={handleChangeTitle}
          size="small"
          fullWidth
        />
        <Button
          variant="contained"
          onClick={onSave}
          sx={{
            backgroundColor: "#3a8d97",
            "&:hover": { backgroundColor: "#2e7078" },
            color: "#fff",
            whiteSpace: "nowrap",
          }}
        >
          저장
        </Button>
      </Stack>

      <Divider />

      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          오늘의 일정
        </Typography>
        {normalizedPlans.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            추가한 일정이 없습니다. 검색 결과에서 "추가" 버튼을 눌러 일정을
            등록하세요.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {normalizedPlans.map((plan) => {
              const planId = plan.__display.id;
              const isSelected = isPlanSelected(planId);
              return (
                <Paper
                  key={planId ?? plan.__display.title}
                  variant={isSelected ? "elevation" : "outlined"}
                  elevation={isSelected ? 6 : 0}
                  onClick={() => handleSelectPlan(plan)}
                  sx={{
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    cursor: "pointer",
                    transition: "background-color 0.2s ease, box-shadow 0.2s ease",
                    bgcolor: isSelected ? "rgba(58, 141, 151, 0.16)" : "inherit",
                    borderColor: isSelected ? "#3a8d97" : undefined,
                    "&:hover": {
                      bgcolor: "rgba(58, 141, 151, 0.08)",
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                    {plan.__display.image && (
                      <Avatar
                        src={plan.__display.image}
                        alt={plan.__display.title}
                        variant="rounded"
                        sx={{ width: 48, height: 48 }}
                      />
                    )}
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {plan.__display.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {plan.__display.sourceLabel}
                      </Typography>
                      {plan.__display.address && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {plan.__display.address}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                  {plan.__source === "draft" ? (
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemovePlan(plan);
                      }}
                    >
                      삭제
                    </Button>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      저장된 일정
                    </Typography>
                  )}  
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
    </Paper>
  );
};

export default PlannerSidebar;