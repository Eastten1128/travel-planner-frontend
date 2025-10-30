import { useCallback, useEffect, useMemo, useState } from 'react';
import '../App.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8080';

function MainPageA({ onLogout, onReload, user }) {
  const [plans, setPlans] = useState([]);
  const [groupInvites, setGroupInvites] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const profileName = useMemo(() => user?.nickname ?? user?.name ?? '플래너 사용자', [user]);
  const profileEmail = useMemo(() => user?.email ?? '이메일 정보가 없습니다.', [user]);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [planResponse, inviteResponse, aiResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/plans`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/groups/invitations`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/ai/recommendations`, { credentials: 'include' }),
      ]);

      if (!planResponse.ok || !inviteResponse.ok || !aiResponse.ok) {
        throw new Error('대시보드 정보를 불러오지 못했습니다.');
      }

      const [planData, inviteData, aiData] = await Promise.all([
        planResponse.json(),
        inviteResponse.json(),
        aiResponse.json(),
      ]);

      setPlans(Array.isArray(planData) ? planData : []);
      setGroupInvites(Array.isArray(inviteData) ? inviteData : []);
      setAiSuggestions(Array.isArray(aiData) ? aiData : []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : String(fetchError));
      setPlans([]);
      setGroupInvites([]);
      setAiSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleCreatePlan = useCallback(() => {
    alert('새 여행 플랜 생성은 준비 중입니다.');
  }, []);

  const handleRefresh = useCallback(() => {
    fetchPlans();
    if (onReload) {
      onReload();
    }
  }, [fetchPlans, onReload]);

  return (
    <div className="dashboard-page">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">MYRO</span>
          <span className="brand-subtitle">Collaborative Travel Planner</span>
        </div>
        <nav className="nav-links" aria-label="주요 탐색">
          <span className="nav-link current">내 일정</span>
          <span className="nav-link">협업</span>
          <span className="nav-link">AI 추천</span>
        </nav>
        <div className="top-actions">
          <button type="button" className="ghost-button" onClick={handleCreatePlan}>
            새 플랜 생성
          </button>
          <button type="button" className="ghost-button" onClick={handleRefresh}>
            새로고침
          </button>
          <button type="button" className="ghost-button" onClick={onLogout}>
            로그아웃
          </button>
          <div className="profile-chip" role="button" tabIndex={0}>
            <span className="profile-avatar" aria-hidden>
              {profileName.charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{profileName}</strong>
              <span>{profileEmail}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="page-content">
        <section className="dashboard-hero">
          <div>
            <span className="hero-badge">MYRO DASHBOARD</span>
            <h1>안녕하세요, {profileName}님!</h1>
            <p>
              로그인한 사용자라면 여행 일정과 그룹 초대, AI 추천을 한 번에 확인할 수 있습니다. 팀원과 함께 여행을
              계획해보세요.
            </p>
            <div className="quick-actions">
              <button type="button" className="primary-button" onClick={handleCreatePlan}>
                새 여행 플랜 시작하기
              </button>
              <button type="button" className="ghost-button" onClick={handleRefresh}>
                대시보드 새로고침
              </button>
            </div>
          </div>
          <div className="dashboard-summary">
            <article className="summary-card">
              <span className="summary-label">내 여행 플랜</span>
              <strong className="summary-value">{plans.length}</strong>
            </article>
            <article className="summary-card">
              <span className="summary-label">그룹 초대</span>
              <strong className="summary-value">{groupInvites.length}</strong>
            </article>
            <article className="summary-card">
              <span className="summary-label">AI 추천</span>
              <strong className="summary-value">{aiSuggestions.length}</strong>
            </article>
          </div>
        </section>

        {error ? (
          <section className="status-banner" role="alert">
            <p>{error}</p>
          </section>
        ) : null}

        <section className="board-section">
          <div className="section-heading">
            <h2>여행 플랜 목록</h2>
            <button type="button" className="text-button" onClick={handleCreatePlan}>
              새 일정 추가
            </button>
          </div>
          <div className="board-grid">
            {loading && plans.length === 0 ? <p className="empty-state">일정을 불러오는 중입니다...</p> : null}
            {!loading && plans.length === 0 ? (
              <p className="empty-state">등록된 여행 플랜이 없습니다. 새로운 여행을 계획해보세요!</p>
            ) : null}
            {plans.map((plan) => (
              <article key={plan.id ?? plan.title} className="board-card">
                <span className="board-period">{plan.period ?? plan.dateRange ?? '기간 미정'}</span>
                <h3>{plan.title ?? '제목 없는 여행'}</h3>
                <ul>
                  {(plan.tasks ?? plan.todos ?? []).map((task) => (
                    <li key={typeof task === 'string' ? task : task.id}>
                      {typeof task === 'string' ? task : task.name}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="collaboration-section">
          <div className="collaboration-card">
            <div className="section-heading">
              <h2>그룹 초대 현황</h2>
              <span className="tag">Google 초대</span>
            </div>
            {groupInvites.length === 0 ? (
              <p className="empty-state">진행 중인 초대가 없습니다. 팀원을 초대해보세요.</p>
            ) : (
              <ul>
                {groupInvites.map((invite) => (
                  <li key={invite.id ?? invite.email}>
                    <div>
                      <strong>{invite.name ?? invite.nickname ?? '팀원'}</strong>
                      <span>{invite.email}</span>
                    </div>
                    <span className="role-chip">{invite.role ?? '읽기'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="ai-card">
            <div className="section-heading">
              <h2>AI 추천 결과</h2>
              <span className="tag accent">ChatGPT</span>
            </div>
            {aiSuggestions.length === 0 ? (
              <p className="empty-state">AI 추천을 불러오는 중이거나 아직 생성된 결과가 없습니다.</p>
            ) : (
              <ul>
                {aiSuggestions.map((item) => (
                  <li key={item.id ?? item.title}>
                    <strong>{item.title ?? '추천 항목'}</strong>
                    <span>{item.description ?? item.detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default MainPageA;
