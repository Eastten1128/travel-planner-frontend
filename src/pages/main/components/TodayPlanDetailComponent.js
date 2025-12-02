import React, { useEffect, useState } from "react";

const toTimeInputValue = (value) => {
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

const sanitizeTimeInput = (value) => {
  if (!value) {
    return "";
  }

  if (/^\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
    return value.slice(0, 5);
  }

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toISOString().slice(11, 16);
  }

  return "";
};

const toDateInputValue = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.slice(0, 10);
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return "";
};

const splitDateAndTime = (value) => {
  const date = toDateInputValue(value);
  const time = toTimeInputValue(value);
  return { date, time };
};

export default function TodayPlanDetailComponent({
  place,
  onSave,
  onCancel,
  plannerStartday,
  plannerEndday,
}) {
  const initialStart = splitDateAndTime(place.startAtDateTime ?? place.startAt);
  const initialEnd = splitDateAndTime(place.endAtDateTime ?? place.endAt);

  const fallbackStartDate =
    place.startDate || place.todayPlanDate || plannerStartday || "";
  const fallbackEndDate = place.endDate || place.todayPlanDate || plannerEndday || "";

  const [placeName, setPlaceName] = useState(place.title || place.placeName || "");
  const [startDate, setStartDate] = useState(
    initialStart.date || fallbackStartDate
  );
  const [endDate, setEndDate] = useState(initialEnd.date || fallbackEndDate);
  const [startAt, setStartAt] = useState(initialStart.time);
  const [endAt, setEndAt] = useState(initialEnd.time);
  const [budgetAmount, setBudgetAmount] = useState(
    place.budgetAmount ?? ""
  );
  const [memo, setMemo] = useState(place.memo || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPlaceName(place.title || place.placeName || "");
    const nextStart = splitDateAndTime(place.startAtDateTime ?? place.startAt);
    const nextEnd = splitDateAndTime(place.endAtDateTime ?? place.endAt);
    setStartDate(nextStart.date || place.startDate || place.todayPlanDate || plannerStartday || "");
    setEndDate(nextEnd.date || place.endDate || place.todayPlanDate || plannerEndday || "");
    setStartAt(nextStart.time);
    setEndAt(nextEnd.time);
    setBudgetAmount(
      place.budgetAmount === null || place.budgetAmount === undefined
        ? ""
        : place.budgetAmount
    );
    setMemo(place.memo || "");
  }, [place, plannerStartday, plannerEndday]);

  const handleSave = async () => {
    if (!placeName.trim()) {
      alert("장소명을 입력하세요.");
      return;
    }
    if (!startDate || !endDate || !startAt || !endAt) {
      alert("시작/종료 날짜와 시간을 모두 입력하세요.");
      return;
    }

    const sanitizedStart = sanitizeTimeInput(startAt);
    const sanitizedEnd = sanitizeTimeInput(endAt);

    if (!sanitizedStart || !sanitizedEnd) {
      alert("시작/종료 시간을 올바르게 입력하세요.");
      return;
    }

    const startDateTime = `${startDate}T${sanitizedStart.length === 5 ? `${sanitizedStart}:00` : sanitizedStart}`;
    const endDateTime = `${endDate}T${sanitizedEnd.length === 5 ? `${sanitizedEnd}:00` : sanitizedEnd}`;

    if (new Date(startDateTime) >= new Date(endDateTime)) {
      alert("종료 시간은 시작 시간 이후여야 합니다.");
      return;
    }

    const numericBudget = Number(budgetAmount);
    if (budgetAmount !== "" && Number.isNaN(numericBudget)) {
      alert("예산은 숫자로 입력해주세요.");
      return;
    }

    try {
      setSaving(true);
      await onSave({
        plannerNo: place.plannerNo ?? null,
        placeName: placeName.trim(),
        startAt: startDateTime,
        endAt: endDateTime,
        startDate,
        endDate,
        budgetAmount:
          budgetAmount === "" || Number.isNaN(numericBudget)
            ? null
            : numericBudget,
        memo,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside
      className="w-[340px] rounded-md p-4"
      style={{ background: "#f2bf24" }}
    >
      <h3 className="text-xl font-bold mb-2">
        {place.title || placeName || "선택된 일정"}
      </h3>
      {place.imageUrl && (
        <img
          src={place.imageUrl}
          alt={placeName || place.title}
          width={300}
          height={200}
          className="rounded-md mb-3 object-cover"
        />
      )}

      {place.addr && <p className="text-sm mb-3">{place.addr}</p>}

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-2">
          <label className="mr-2">시작 날짜</label>
          <input
            type="date"
            value={startDate}
            min={plannerStartday || undefined}
            max={plannerEndday || undefined}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex-1 rounded-md px-2 py-1"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <label className="mr-2">시작 시간</label>
          <input
            type="time"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className="flex-1 rounded-md px-2 py-1"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <label className="mr-2">종료 날짜</label>
          <input
            type="date"
            value={endDate}
            min={plannerStartday || undefined}
            max={plannerEndday || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex-1 rounded-md px-2 py-1"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <label className="mr-2">종료 시간</label>
          <input
            type="time"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className="flex-1 rounded-md px-2 py-1"
          />
        </div>
        <div>
          <label className="block mb-1">활동 장소명</label>
          <input
            className="w-full rounded-md px-2 py-1"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <label>예산</label>
          <input
            type="number"
            className="w-24 px-2 py-1 rounded-md"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            min="0"
          />
          <span>원</span>
        </div>
        <div>
          <label className="block mb-1">메모</label>
          <textarea
            rows={5}
            className="w-full rounded-md p-2"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <button
          className="px-4 py-2 rounded-md bg-gray-300"
          onClick={onCancel}
          type="button"
        >
          취소
        </button>
        <button
          className="px-4 py-2 rounded-md bg-green-600 text-white"
          onClick={handleSave}
          type="button"
          disabled={saving}
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </aside>
  );
}
