// 좌측 플래너 사이드바 컴포넌트 - 제목 저장과 오늘의 일정 목록 제공
import React, { useEffect, useMemo, useState } from "react";
import { getTodayPlansByPlanner, deleteTodayPlan } from "../../api/todayplan";

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
    parseDateValue(
      plan?.startAt ?? plan?.start_at ?? plan?.todayPlanDate ?? plan?.date ?? null
    );

  const isSameDay = (a, b) => {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const formatDateLabel = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return "날짜 미지정";
    }

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}/${day}`;
  };

  const formatTimeHM = (value) => {
    const parsed = parseDateValue(value);
    if (!parsed) return null;

    const hours = String(parsed.getHours()).padStart(2, "0");
    const minutes = String(parsed.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // 플래너의 시작일(planner_startday) ~ 종료일(planner_endday)까지 날짜를 순회하면서
  // 각 날짜에 해당하는 todayPlan들을 모아 "N일차 (MM/DD)" 단위로 그룹핑하여 렌더링한다.
  // 같은 날짜에 속한 todayPlan들은 start_at 시간 기준으로 정렬한다.
  const groupedPlans = useMemo(() => {
    const plansWithDate = normalizedPlans.map((plan) => {
      const parsedDate = getPlanDate(plan);
      const midnight = parsedDate ? new Date(parsedDate) : null;
      if (midnight) {
        midnight.setHours(0, 0, 0, 0);
      }

      return { plan, parsedDate, midnight };
    });

    const results = [];

    if (startDateBase && endDateBase) {
      for (
        let dateCursor = new Date(startDateBase), dayIndex = 0;
        dateCursor <= endDateBase;
        dateCursor = new Date(dateCursor.getTime() + msPerDay), dayIndex += 1
      ) {
        const dayPlans = plansWithDate
          .filter(({ parsedDate }) => isSameDay(parsedDate, dateCursor))
          .sort((a, b) => {
            const timeA = a.parsedDate ? a.parsedDate.getTime() : 0;
            const timeB = b.parsedDate ? b.parsedDate.getTime() : 0;
            return timeA - timeB;
          })
          .map(({ plan }) => plan);

        if (dayPlans.length > 0) {
          results.push({ dayIndex, date: new Date(dateCursor), plans: dayPlans });
        }
      }

      return results;
    }

    const fallbackMap = new Map();
    plansWithDate.forEach(({ plan, parsedDate, midnight }) => {
      const key = midnight ? midnight.getTime() : "unknown";
      if (!fallbackMap.has(key)) {
        fallbackMap.set(key, { date: midnight, plans: [] });
      }
      fallbackMap.get(key).plans.push(plan);
    });

    return Array.from(fallbackMap.entries())
      .sort(([keyA], [keyB]) => {
        if (keyA === "unknown") return 1;
        if (keyB === "unknown") return -1;
        return keyA - keyB;
      })
      .map(([, value], idx) => ({
        dayIndex: clampDayIndex(idx),
        date: value.date,
        plans: value.plans.sort((a, b) => {
          const timeA = getPlanDate(a)?.getTime() ?? 0;
          const timeB = getPlanDate(b)?.getTime() ?? 0;
          return timeA - timeB;
        }),
      }));
  }, [normalizedPlans, startDateBase, endDateBase]);

  const handleRemovePlan = (plan) => {
    const planId = resolvePlanId(plan);
    if (typeof onRemove === "function") {
      onRemove(planId, plan);
    }
  };

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
    <aside className="flex h-full min-h-[360px] flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-500">플래너 제목</label>
          <input
            value={titleInput}
            onChange={handleChangeTitle}
            className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800 outline-none transition focus:border-gray-400 focus:bg-white"
          />
        </div>
        <button
          type="button"
          onClick={onSave}
          className="mt-5 whitespace-nowrap rounded-2xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          저장
        </button>
      </div>

      <div className="my-4 h-px w-full bg-gray-100" />

      <div className="flex flex-1 min-h-0 flex-col gap-3 overflow-y-auto pr-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">오늘의 일정</p>
          <span className="text-xs font-medium text-emerald-600">{normalizedPlans.length}개</span>
        </div>

        {normalizedPlans.length === 0 ? (
          <p className="rounded-2xl bg-gray-50 px-4 py-3 text-xs text-gray-500">
            추가한 일정이 없습니다. 검색 결과에서 "추가" 버튼을 눌러 일정을 등록하세요.
          </p>
        ) : (
          <div className="space-y-4">
            {groupedPlans.map((group) => (
              <div key={group.dayIndex} className="space-y-2">
                <p className="text-xs font-bold text-emerald-700">
                  {group.dayIndex + 1}일차 ({formatDateLabel(group.date)})
                </p>
                <div className="space-y-2">
                  {group.plans.map((plan) => {
                    const planId = plan.__display.id;
                    const startLabel = formatTimeHM(plan.startAt ?? plan.start_at);
                    const endLabel = formatTimeHM(plan.endAt ?? plan.end_at);
                    const isSelected = isPlanSelected(planId);
                    return (
                      <div
                        key={planId ?? plan.__display.title}
                        onClick={() => handleSelectPlan(plan)}
                        className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-2 shadow-sm transition hover:bg-gray-50 ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 shadow"
                            : "border-gray-100 bg-white"
                        }`}
                      >
                        {plan.__display.image ? (
                          <img
                            src={plan.__display.image}
                            alt={plan.__display.title}
                            className="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-gray-100" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {plan.__display.title}
                          </p>
                          {/* 일정의 시작/종료 시간을 "HH:MM ~ HH:MM" 형식으로 표시 */}
                          {startLabel && endLabel && (
                            <p className="text-[11px] font-medium text-gray-700">
                              {startLabel} ~ {endLabel}
                            </p>
                          )}
                          <p className="text-[11px] font-medium text-gray-500">
                            {plan.__display.sourceLabel}
                          </p>
                          {plan.__display.address && (
                            <p className="truncate text-xs text-gray-500">{plan.__display.address}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          className="rounded-xl bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                          onClick={(event) => handleDeletePlan(event, plan)}
                        >
                          삭제
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default PlannerSidebar;
