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
import { getTodayPlansByPlanner, deleteTodayPlan} from "../../api/todayplan";


const PlannerSidebar = ({
  plannerTitle = "",
  onTitleChange,
  todayPlans = [],
  plannerNo,
  plannerStartday,
  plannerEndday,
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

  const parseDateValue = (value) => {
    if (!value) return null;

    const direct = new Date(value);
    if (!Number.isNaN(direct.getTime())) {
      return direct;
    }

    if (typeof value === "string" && value.includes(" ")) {
      const spaced = new Date(value.replace(" ", "T"));
      if (!Number.isNaN(spaced.getTime())) {
        return spaced;
      }
    }

    return null;
  };

  const startDateBase = useMemo(() => {
    const parsed = parseDateValue(plannerStartday);
    if (!parsed) return null;
    const midnight = new Date(parsed);
    midnight.setHours(0, 0, 0, 0);
    return midnight;
  }, [plannerStartday]);

  const endDateBase = useMemo(() => {
    const parsed = parseDateValue(plannerEndday);
    if (!parsed) return null;
    const midnight = new Date(parsed);
    midnight.setHours(0, 0, 0, 0);
    return midnight;
  }, [plannerEndday]);

  const msPerDay = 1000 * 60 * 60 * 24;

  const clampDayIndex = (dayIndex) => {
    if (dayIndex === null || dayIndex === undefined || Number.isNaN(dayIndex)) {
      return 0;
    }

    let clamped = dayIndex;

    if (clamped < 0) {
      clamped = 0;
    }

    if (startDateBase && endDateBase) {
      const maxIndex = Math.max(
        0,
        Math.floor((endDateBase.getTime() - startDateBase.getTime()) / msPerDay)
      );
      if (clamped > maxIndex) {
        clamped = maxIndex;
      }
    }

    return clamped;
  };

  const getPlanDate = (plan) =>
    parseDateValue(plan?.startAt ?? plan?.todayPlanDate ?? plan?.date ?? null);

  const formatDateLabel = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return "날짜 미지정";
    }

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}/${day}`;
  };

  const groupedPlans = useMemo(() => {
    const sortedPlans = [...normalizedPlans].sort((a, b) => {
      const dateA = getPlanDate(a);
      const dateB = getPlanDate(b);

      if (dateA && dateB) {
        return dateA.getTime() - dateB.getTime();
      }

      if (dateA) return -1;
      if (dateB) return 1;

      const idA = resolvePlanId(a);
      const idB = resolvePlanId(b);
      return String(idA ?? "").localeCompare(String(idB ?? ""));
    });

    const groupMap = new Map();

    sortedPlans.forEach((plan) => {
      const planDate = getPlanDate(plan);
      const planMidnight = planDate
        ? new Date(planDate.setHours(0, 0, 0, 0))
        : null;

      let dayIndex = 0;
      if (planMidnight && startDateBase) {
        dayIndex = Math.floor(
          (planMidnight.getTime() - startDateBase.getTime()) / msPerDay
        );
      }

      dayIndex = clampDayIndex(dayIndex);

      if (!groupMap.has(dayIndex)) {
        groupMap.set(dayIndex, {
          dayIndex,
          date: planMidnight ?? startDateBase ?? null,
          plans: [],
        });
      }

      groupMap.get(dayIndex).plans.push(plan);
    });

    return Array.from(groupMap.values()).sort((a, b) => a.dayIndex - b.dayIndex);
  }, [normalizedPlans, startDateBase, endDateBase]);

  const handleRemovePlan = (plan) => {
    const planId = resolvePlanId(plan);
    if (typeof onRemove === "function") {
      onRemove(planId, plan);
    }
  };

  // 삭제 버튼 클릭 시 TodayPlan을 제거 (플래너 번호가 일치할 때만 수행)
  const handleDeletePlan = async (event, plan) => {
    event.stopPropagation();

    const planId = resolvePlanId(plan);
    const planPlannerNo = resolvePlannerNo(plan);

    if (planId === undefined || planId === null) {
      console.warn("삭제할 일정의 ID를 찾을 수 없습니다.", plan);
      return;
    }

    if (plannerNo === undefined || plannerNo === null) {
      console.warn("선택된 플래너가 없어 삭제를 건너뜁니다.");
      return;
    }

    if (planPlannerNo === undefined || planPlannerNo === null) {
      console.warn("일정의 플래너 번호가 없어 삭제를 건너뜁니다.", plan);
      return;
    }

    if (String(planPlannerNo) !== String(plannerNo)) {
      console.warn("현재 플래너와 일치하지 않는 일정입니다.", plan);
      return;
    }

    if (plan.__source === "saved") {
      try {
        await deleteTodayPlan(planId);
        setSavedPlans((prev) =>
          prev.filter((savedPlan) => {
            const savedPlanId = resolvePlanId(savedPlan);
            const savedPlannerNo = resolvePlannerNo(savedPlan);

            if (String(savedPlannerNo) !== String(plannerNo)) {
              return true;
            }

            return String(savedPlanId) !== String(planId);
          })
        );
      } catch (error) {
        console.error("오늘의 일정 삭제 실패:", error);
      }
    } else {
      handleRemovePlan(plan);
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
          <Stack spacing={2}>
            {groupedPlans.map((group) => (
              <Box key={group.dayIndex}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 1, color: "#3a8d97" }}
                >
                  {group.dayIndex + 1}일차 ({formatDateLabel(group.date)})
                </Typography>
                <Stack spacing={1}>
                  {group.plans.map((plan) => {
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
                          transition:
                            "background-color 0.2s ease, box-shadow 0.2s ease",
                          bgcolor: isSelected
                            ? "rgba(58, 141, 151, 0.16)"
                            : "inherit",
                          borderColor: isSelected ? "#3a8d97" : undefined,
                          "&:hover": {
                            bgcolor: "rgba(58, 141, 151, 0.08)",
                          },
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{ flex: 1, minWidth: 0 }}
                        >
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
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={(event) => handleDeletePlan(event, plan)}
                        >
                          삭제
                        </Button>
                      </Paper>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Paper>
  );
};

export default PlannerSidebar;