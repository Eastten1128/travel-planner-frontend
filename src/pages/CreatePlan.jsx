import React, { useState } from "react";

function CreatePlan({ onCreate, onCancel }) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!title || !startDate || !endDate) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    onCreate?.({ title, startDate, endDate, description });
  };

  return (
    <section className="mx-auto max-w-3xl rounded-lg border bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900">여행 계획 만들기</h1>
      <p className="mt-2 text-gray-600">여행 정보를 입력하고 일정을 생성해보세요.</p>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium">여행 제목 *</span>
            <input
              type="text"
              className="h-10 rounded-md border px-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2박 3일 부산 여행"
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">시작일 *</span>
              <input
                type="date"
                className="h-10 rounded-md border px-3"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">종료일 *</span>
              <input
                type="date"
                className="h-10 rounded-md border px-3"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </label>
          </div>
          <label className="grid gap-2">
            <span className="text-sm font-medium">여행 설명</span>
            <textarea
              className="min-h-[140px] rounded-md border p-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="여행에 대한 간단한 설명을 입력해주세요."
            />
          </label>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="rounded-md border px-5 py-2 hover:bg-gray-50"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="submit"
            className="rounded-md bg-gray-900 px-5 py-2 font-semibold text-white hover:opacity-90"
          >
            추가
          </button>
        </div>
      </form>
    </section>
  );
}

export default CreatePlan;
