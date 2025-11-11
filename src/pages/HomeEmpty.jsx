import React from "react";
import { Link } from "react-router-dom";

function HomeEmpty() {
  return (
    <section className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">첫 여행을 계획해보세요</h1>
        <p className="text-gray-600">
          아직 등록된 여행 계획이 없습니다. 여행 일정을 등록하고 나만의 맞춤형 일정을 만들어보세요.
        </p>
        <Link
          to="/createplan"
          className="inline-flex items-center justify-center rounded-md bg-gray-900 px-5 py-2.5 font-semibold text-white transition hover:opacity-90"
        >
          새 여행 만들기
        </Link>
      </div>
    </section>
  );
}

export default HomeEmpty;
