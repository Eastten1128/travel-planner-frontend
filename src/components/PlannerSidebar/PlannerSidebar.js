/**
 * 플래너 상세 화면 좌측에 노출되는 사이드바 컴포넌트.
 * - 플래너 제목 수정, 저장
 * - 선택한 플래너에 속한 오늘의 일정 목록 표시 및 삭제/선택 기능을 담당한다.
 */
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
  const [titleInput, setTitleInput] = useState(plannerTitle ?? ""); // 제목 입력 필드 상태
  const [savedPlans, setSavedPlans] = useState([]); // 서버에 저장된 TodayPlan 목록 캐시

  useEffect(() => {
    let active = true;

    const fetchSavedPlans = async () => {
      // 플래너 번호가 없으면 저장된 일정이 없다고 판단하고 초기화
      if (plannerNo === undefined || plannerNo === null) {
        setSavedPlans([]);
        return;
      }

      try {
        // 선택된 플래너 번호로 TodayPlan을 조회
        const data = await getTodayPlansByPlanner(plannerNo);
        if (!active) return;

        // API 응답 형식이 다양할 수 있어 여러 형태를 안전하게 파싱
        const planList = (() => {
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.content)) return data.content;
          if (Array.isArray(data?.data)) return data.data;
          if (Array.isArray(data?.items)) return data.items;
          if (Array.isArray(data?.todayPlans)) return data.todayPlans;
          return [];
        })();

        // 서버에서 가져온 일정에 __source 플래그를 붙여 저장됨/임시 여부 구분
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
      // 비동기 처리 후 언마운트 상황 방지
      active = false;
    };
  }, [plannerNo]);

  useEffect(() => {
    // 상위에서 플래너 제목이 변경될 때 입력 필드 동기화
    setTitleInput(plannerTitle ?? "");
  }, [plannerTitle]);

  // 플래너 제목 입력 값 변경 시 상위 콜백에 전달
  const handleChangeTitle = (event) => {
    const nextValue = event.target.value;
    setTitleInput(nextValue);
    if (typeof onTitleChange === "function") {
      onTitleChange(nextValue);
    }
  };

  // 다양한 응답 형태에서 TodayPlan ID를 추출하기 위한 헬퍼
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

  // plan 객체에서 플래너 번호를 안전하게 추출
  const resolvePlannerNo = (plan) =>
    plan?.plannerNo ?? plan?.plannerId ?? plan?.plannerid ?? null;

  // 아직 저장되지 않은 임시 일정(todayPlans) 중 현재 플래너에 해당하는 것만 선별
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

  // 서버에서 가져온 저장된 일정 중 현재 플래너에 해당하는 것만 선별
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

  // 임시 일정과 저장된 일정을 합치고, 같은 ID가 중복될 경우 하나만 유지
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

  // UI에서 바로 사용할 수 있도록 제목/주소/이미지 등 표시용 필드 구성
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

  // 날짜 문자열을 Date 객체로 변환하되 잘못된 포맷은 null 처리
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

  // 플래너 시작일을 00:00 시점으로 맞춰 그룹핑 기준일 계산
  const startDateBase = useMemo(() => {
    const parsed = parseDateValue(plannerStartday);
    if (!parsed) return null;
    const midnight = new Date(parsed);
    midnight.setHours(0, 0, 0, 0);
    return midnight;
  }, [plannerStartday]);

  // 플래너 종료일을 00:00 기준으로 계산해 마지막 일차를 제한
  const endDateBase = useMemo(() => {
    const parsed = parseDateValue(plannerEndday);
    if (!parsed) return null;
    const midnight = new Date(parsed);
    midnight.setHours(0, 0, 0, 0);
    return midnight;
  }, [plannerEndday]);

  // 하루를 밀리초로 환산한 상수 (일차 계산용)
  const msPerDay = 1000 * 60 * 60 * 24;

  // 일차가 범위를 벗어나지 않도록 0 ~ (여행일수-1) 사이로 보정
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

  // 일정에서 날짜 정보 추출 (시작 시간이 우선)
  const getPlanDate = (plan) =>
    parseDateValue(plan?.startAt ?? plan?.todayPlanDate ?? plan?.date ?? null);

  // 그룹 헤더에 표시할 월/일 라벨 생성
  const formatDateLabel = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return "날짜 미지정";
    }

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}/${day}`;
  };

  // 일정 목록을 날짜 기준으로 정렬 후 일차별로 묶어 UI에 전달
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

  // 임시 일정 삭제 요청을 상위 콜백으로 전달
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

  // 사이드바 아이템 클릭 시 상세 패널에 표시할 일정 선택
  const handleSelectPlan = (plan) => {
    if (typeof onSelectPlan !== "function") {
      return;
    }

    onSelectPlan(plan);
  };

  // 현재 선택된 일정인지 여부를 비교해 강조 스타일 적용
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