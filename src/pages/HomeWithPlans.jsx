import React from "react";
import { Link } from "react-router-dom";

function HomeWithPlans({ plans }) {
  if (!plans || plans.length === 0) {
    return <p className="text-center text-gray-500">표시할 여행 계획이 없습니다.</p>;
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">나의 여행 계획</h1>
          <p className="text-gray-600">최근에 생성한 여행 계획을 확인해보세요.</p>
        </div>
        <Link
          to="/createplan"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          새 계획 추가
        </Link>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <li key={plan.id} className="rounded-lg border bg-white p-5 shadow-sm transition hover:shadow">
            <Link to={`/plan/${plan.id}`} className="block space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xl font-semibold text-gray-900">{plan.title}</h2>
                <span className="text-sm font-medium text-gray-500">
                  {plan.startDate} ~ {plan.endDate}
                </span>
              </div>
              {plan.description && (
                <p className="text-sm text-gray-600">{plan.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium">일정</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                  {plan.today?.length || 0}건
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default HomeWithPlans;
