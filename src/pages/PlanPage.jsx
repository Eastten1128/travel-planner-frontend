import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function PlanPage({ plans }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const plan = plans.find((item) => String(item.id) === id);

  if (!plan) {
    return (
      <div className="space-y-6 text-center">
        <p className="text-lg font-semibold text-gray-700">해당 여행 계획을 찾을 수 없습니다.</p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => navigate(-1)}
          >
            이전 페이지로
          </button>
          <Link
            to="/"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            홈으로 이동
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-gray-900">{plan.title}</h1>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {plan.startDate} ~ {plan.endDate}
          </span>
        </div>
        {plan.description && <p className="text-gray-600">{plan.description}</p>}
      </header>

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">일정</h2>
        </div>
        <ul className="divide-y">
          {(plan.today || []).map((schedule) => (
            <li key={schedule.todayNo} className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                  {schedule.todayNo}
                </span>
                <div>
                  <p className="text-base font-semibold text-gray-900">{schedule.placeName}</p>
                  <p className="text-sm text-gray-500">{schedule.placeType}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600">
                {schedule.startAt} ~ {schedule.endAt}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default PlanPage;
