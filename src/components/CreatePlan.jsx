import { useState } from "react";
import { createPlanner } from "../api/planner";

const initialForm = {
  plannerTitle: "",
  plannerStartDay: "",
  plannerEndDay: "",
};

const CreatePlan = ({ onSuccess, onClose }) => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!form.plannerTitle.trim() || !form.plannerStartDay || !form.plannerEndDay) {
      setError("여행명과 시작일, 종료일을 모두 입력해주세요.");
      return;
    }

    if (form.plannerStartDay > form.plannerEndDay) {
      setError("시작일은 종료일보다 이후일 수 없습니다.");
      return;
    }

    setSubmitting(true);
    try {
      const newPlanner = await createPlanner({
        plannerTitle: form.plannerTitle.trim(),
        plannerStartDay: form.plannerStartDay,
        plannerEndDay: form.plannerEndDay,
      });

      alert("새 여행이 추가되었습니다.");
      resetForm();
      onSuccess?.(newPlanner);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      } else {
        const message = err?.response?.data?.message || "여행 생성에 실패했습니다.";
        alert(message);
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full rounded-3xl bg-white p-8 shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-900">새 여행 추가</h2>
      <p className="mt-2 text-sm text-gray-500">행복한 여행 계획을 입력해 주세요.</p>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">여행명 *</span>
            <input
              type="text"
              name="plannerTitle"
              value={form.plannerTitle}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-black focus:outline-none"
              placeholder="행복한 여행 계획을 입력해주세요"
              disabled={submitting}
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">시작일 *</span>
              <input
                type="date"
                name="plannerStartDay"
                value={form.plannerStartDay}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-black focus:outline-none"
                disabled={submitting}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">종료일 *</span>
              <input
                type="date"
                name="plannerEndDay"
                value={form.plannerEndDay}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-black focus:outline-none"
                disabled={submitting}
                required
              />
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose?.();
            }}
            className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
            disabled={submitting}
          >
            취소
          </button>
          <button
            type="submit"
            className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={submitting}
          >
            {submitting ? "추가 중..." : "추가"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreatePlan;
