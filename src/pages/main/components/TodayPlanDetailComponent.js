// 일정 상세 편집 패널 - 선택된 TodayPlan 정보를 수정/저장
import React, { useEffect, useState } from "react";

const pad2 = (num) => String(num).padStart(2, "0");

const toTimeInputValue = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    const timeMatch =
      value.match(/T(\d{2}:\d{2}(?::\d{2})?)/) ||
      value.match(/\s(\d{2}:\d{2}(?::\d{2})?)/);

    if (timeMatch) {
      return timeMatch[1].slice(0, 5);
    }

    if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
      return value.slice(0, 5);
    }

    if (/^\d{2}:\d{2}$/.test(value)) {
      return value;
    }
  }

  if (value instanceof Date) {
    return `${pad2(value.getHours())}:${pad2(value.getMinutes())}`;
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

  return "";
};

const toDateInputValue = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.slice(0, 10);
    }

    if (value.includes("T")) {
      return value.split("T")[0];
    }
  }

  if (value instanceof Date) {
    return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
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
  const [startDate, setStartDate] = useState(initialStart.date || fallbackStartDate);
  const [endDate, setEndDate] = useState(initialEnd.date || fallbackEndDate);
  const [startAt, setStartAt] = useState(initialStart.time);
  const [endAt, setEndAt] = useState(initialEnd.time);
  const [budgetAmount, setBudgetAmount] = useState(place.budgetAmount ?? "");
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
      place.budgetAmount === null || place.budgetAmount === undefined ? "" : place.budgetAmount
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
          budgetAmount === "" || Number.isNaN(numericBudget) ? null : numericBudget,
        memo,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside className="w-full max-w-md rounded-3xl bg-white p-5 shadow-lg ring-1 ring-gray-200">
      <h3 className="text-xl font-bold text-gray-900">
        {place.title || placeName || "선택된 일정"}
      </h3>
      {place.imageUrl && (
        <img
          src={place.imageUrl}
          alt={placeName || place.title}
          className="mt-3 h-48 w-full rounded-2xl object-cover"
        />
      )}

      {place.addr && <p className="mt-2 text-sm text-gray-600">{place.addr}</p>}

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-500">시작 날짜</label>
          <input
            type="date"
            value={startDate}
            min={plannerStartday || undefined}
            max={plannerEndday || undefined}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-500">시작 시간</label>
          <input
            type="time"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-500">종료 날짜</label>
          <input
            type="date"
            value={endDate}
            min={plannerStartday || undefined}
            max={plannerEndday || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-500">종료 시간</label>
          <input
            type="time"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500">활동 장소명</label>
          <input
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500">예산</label>
          <input
            type="number"
            className="w-28 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            min="0"
          />
          <span className="text-xs text-gray-600">원</span>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500">메모</label>
          <textarea
            rows={5}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        <button
          className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          onClick={onCancel}
          type="button"
        >
          취소
        </button>
        <button
          className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
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
