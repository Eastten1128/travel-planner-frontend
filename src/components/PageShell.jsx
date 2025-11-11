import React from "react";
import { Link, useLocation } from "react-router-dom";

function PageShell({ children, onLogout }) {
  const location = useLocation();
  const isCreatePage = location.pathname === "/createplan";

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/" className="text-xl font-semibold text-gray-900">
            Travel Planner
          </Link>
          <div className="flex items-center gap-3">
            {!isCreatePage && (
              <Link
                to="/createplan"
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                새 여행 만들기
              </Link>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-8">{children}</main>
    </div>
  );
}

export default PageShell;
