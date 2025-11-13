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

export default function TodayPlanDetailComponent({ place, onSave, onCancel }) {
  const [placeName, setPlaceName] = useState(place.title || place.placeName || "");
  const [startAt, setStartAt] = useState(toTimeInputValue(place.startAt));
  const [endAt, setEndAt] = useState(toTimeInputValue(place.endAt));
  const [budgetAmount, setBudgetAmount] = useState(
    place.budgetAmount ?? ""
  );
  const [memo, setMemo] = useState(place.memo || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPlaceName(place.title || place.placeName || "");
    setStartAt(toTimeInputValue(place.startAt));
    setEndAt(toTimeInputValue(place.endAt));
    setBudgetAmount(
      place.budgetAmount === null || place.budgetAmount === undefined
        ? ""
        : place.budgetAmount
    );
    setMemo(place.memo || "");
  }, [place]);

  const parseToDate = (value) => {
    if (!value) return null;
    if (/^\d{2}:\d{2}$/.test(value)) {
      const [hours, minutes] = value.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed;
  };

  const handleSave = async () => {
    if (!placeName.trim()) {
      alert("장소명을 입력하세요.");
      return;
    }
    if (!startAt || !endAt) {
      alert("시작/종료 시간을 입력하세요.");
      return;
    }

    const sanitizedStart = sanitizeTimeInput(startAt);
    const sanitizedEnd = sanitizeTimeInput(endAt);

    const startDate = parseToDate(sanitizedStart);
    const endDate = parseToDate(sanitizedEnd);

    if (startDate && endDate && startDate >= endDate) {
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
        startAt: sanitizedStart,
        endAt: sanitizedEnd,
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
          <label className="mr-2">시작 시간</label>
          <input
            type="time"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
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
