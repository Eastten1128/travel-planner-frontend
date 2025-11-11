import React, { useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";

/**
 * Travel Planner – React Router App
 * Derived from Figma fileKey: wGA94AM7jkUpqVzjSrfZky
 * Pages mapped from nodes:
 *  - 홈(빈상태)      : 2:35
 *  - 홈(여행목록)    : 6:211
 *  - /plan           : 2:125
 *  - /createplan     : 2:173
 *
 * Styling: TailwindCSS (no external UI kit required)
 */

/* -------------------------- Shared Layout -------------------------- */
function Header({ onLogout }) {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-screen-2xl px-6">
        <div className="flex h-[110px] items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight">로고</Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link to="/" className="rounded-md px-2 py-1 hover:bg-gray-100">nav1</Link>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-md px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-100"
            >
              로그아웃
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

function PageShell({ children, onLogout }) {
  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      <Header onLogout={onLogout} />
      <main className="mx-auto max-w-screen-2xl px-6 py-8">{children}</main>
    </div>
  );
}

/* ------------------------------ Home ------------------------------- */
function HomeEmpty({ onAdd }) {
  const navigate = useNavigate();
  const goCreate = () => (onAdd ? onAdd() : navigate("/createplan"));

  return (
    <>
      <div className="mb-6 flex w-full justify-center">
        <button
          type="button"
          onClick={goCreate}
          className="inline-flex h-14 items-center justify-center rounded-xl border border-gray-300 px-6 text-base font-semibold shadow-sm hover:shadow transition"
          aria-label="새 여행 추가"
        >
          새 여행 추가
        </button>
      </div>
      <section className="mx-auto grid w-full max-w-[1223px] place-items-center rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
        <div className="flex max-w-[820px] flex-col items-center gap-4 text-center">
          <p className="text-2xl font-semibold">등록된 여행이 없습니다.</p>
          <p className="text-base text-gray-600">새 여행을 추가하여 계획을 시작해보세요!</p>
          <button
            type="button"
            onClick={goCreate}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-lg bg-gray-900 px-6 text-sm font-semibold text-white hover:opacity-90 transition"
          >
            새 여행 추가
          </button>
        </div>
      </section>
    </>
  );
}

function PlannerCard({ plan, onEdit }) {
  const navigate = useNavigate();
  return (
    <div className="w-full rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h3 className="text-xl font-semibold">{plan.title}</h3>
          <p className="text-sm text-gray-600">{plan.startDate} ~ {plan.endDate}</p>
          {plan.description && (
            <p className="mt-1 text-sm text-gray-700">{plan.description}</p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
            onClick={() => (onEdit ? onEdit(plan) : null)}
          >
            여행 정보 수정
          </button>
          <button
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            onClick={() => navigate(`/plan/${plan.id}`)}
          >
            상세 보기
          </button>
        </div>
      </div>
    </div>
  );
}

function HomeWithPlans({ plans }) {
  const navigate = useNavigate();
  return (
    <>
      {/* Top action */}
      <div className="mb-6 flex w-full justify-center">
        <button
          type="button"
          onClick={() => navigate("/createplan")}
          className="inline-flex h-14 items-center justify-center rounded-xl border border-gray-300 px-6 text-base font-semibold shadow-sm hover:shadow transition"
        >
          새 여행 추가
        </button>
      </div>

      {/* Planner box */}
      <section className="mx-auto w-full max-w-[1223px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6">
          {plans.map((p) => (
            <PlannerCard key={p.id} plan={p} />
          ))}
        </div>

        {/* plan options */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <button className="rounded-xl border px-6 py-10 text-lg font-semibold hover:bg-gray-50">AI 추천</button>
          <button className="rounded-xl border px-6 py-10 text-lg font-semibold hover:bg-gray-50">장소 추가</button>
        </div>
      </section>
    </>
  );
}

/* ------------------------------ /plan ------------------------------ */
function TodayItem({ item }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-sm font-medium">{item.todayNo}</div>
      <div className="text-sm">{item.placeName}</div>
      <div className="text-xs text-gray-600">{item.placeType}</div>
      <div className="text-xs text-gray-600">{item.startAt} ~ {item.endAt}</div>
    </div>
  );
}

function PlanPage({ plans }) {
  const { id } = useParams();
  const plan = useMemo(() => plans.find((p) => String(p.id) === String(id)), [plans, id]);

  return (
    <div className="grid gap-4 md:grid-cols-[263px_1fr]">
      {/* left list */}
      <aside className="rounded-xl border p-4">
        <div className="mb-3 text-center text-base font-semibold">여행계획</div>
        <div className="grid gap-2">
          {plan?.today?.map((t) => <TodayItem key={t.todayNo} item={t} />)}
        </div>
      </aside>

      {/* map area */}
      <section className="relative min-h-[540px] rounded-xl border p-4">
        <div className="rounded-md border p-2 text-sm text-gray-600">[지도 임베드 자리]</div>
        <div className="absolute left-4 top-4 w-[481px] rounded-md border bg-white/90 p-3 text-sm">검색 바 / 결과 패널</div>
      </section>
    </div>
  );
}

/* --------------------------- /createplan --------------------------- */
function CreatePlan({ onCreate, onCancel }) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="mx-auto w-full max-w-[522px] rounded-2xl border p-6 shadow-sm">
      <div className="mb-6 text-center text-2xl font-semibold">새 여행 추가</div>

      <div className="grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-medium">여행명 *</span>
          <input
            className="h-10 rounded-md border px-3"
            placeholder="행복한 여행 계획을 입력해주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">시작일 *</span>
          <input type="date" className="h-10 rounded-md border px-3" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">종료일 *</span>
          <input type="date" className="h-10 rounded-md border px-3" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">여행 설명</span>
          <textarea className="min-h-[140px] rounded-md border p-3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="여행에 대한 간단한 설명을 입력해주세요." />
        </label>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button className="rounded-md border px-5 py-2 hover:bg-gray-50" onClick={onCancel}>취소</button>
        <button
          className="rounded-md bg-gray-900 px-5 py-2 font-semibold text-white hover:opacity-90"
          onClick={() => onCreate?.({ title, startDate, endDate, description })}
        >
          추가
        </button>
      </div>
    </div>
  );
}

/* ------------------------- App + Routing -------------------------- */
function AppInner() {
  const navigate = useNavigate();

  // mock seed
  const [plans, setPlans] = useState([]);

  const handleLogout = () => {
    // TODO: integrate real logout
    alert("로그아웃");
  };

  const handleCreate = (payload) => {
    const id = Date.now();
    const newPlan = {
      id,
      title: payload.title || "새 여행",
      startDate: payload.startDate || "2025-11-06",
      endDate: payload.endDate || "2025-11-07",
      description: payload.description || "",
      today: [
        { todayNo: 1, placeName: "서울숲", placeType: "공원", startAt: "10:00", endAt: "12:00" },
        { todayNo: 2, placeName: "성수 카페", placeType: "카페", startAt: "12:30", endAt: "14:00" },
      ],
    };
    setPlans((prev) => [newPlan, ...prev]);
    navigate(`/plan/${id}`);
  };

  return (
    <PageShell onLogout={handleLogout}>
      <Routes>
        <Route
          path="/"
          element={plans.length === 0 ? <HomeEmpty /> : <HomeWithPlans plans={plans} />}
        />
        <Route path="/plan/:id" element={<PlanPage plans={plans} />} />
        <Route path="/createplan" element={<CreatePlan onCreate={handleCreate} onCancel={() => navigate(-1)} />} />
        {/* Fallback */}
        <Route path="*" element={<div className="p-10 text-center text-gray-500">페이지를 찾을 수 없습니다.</div>} />
      </Routes>
    </PageShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
