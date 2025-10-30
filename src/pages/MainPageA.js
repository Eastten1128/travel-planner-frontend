import { useCallback, useEffect, useMemo, useState } from 'react';
import '../App.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8080';

function MainPageA({ error, onLogout, onRefresh, user }) {
  const [itineraries, setItineraries] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요!';
    if (hour < 18) return '반가워요!';
    return '오늘 하루도 수고하셨어요!';
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [planResponse, collaboratorResponse, aiResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/plans`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/collaborators`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/ai/recommendations`, { credentials: 'include' }),
      ]);

      if (!planResponse.ok || !collaboratorResponse.ok || !aiResponse.ok) {
        throw new Error('대시보드 정보를 불러오지 못했습니다.');
      }

      const [planData, collaboratorData, aiData] = await Promise.all([
        planResponse.json(),
        collaboratorResponse.json(),
        aiResponse.json(),
      ]);

      setItineraries(Array.isArray(planData) ? planData : []);
      setCollaborators(Array.isArray(collaboratorData) ? collaboratorData : []);
      setAiRecommendations(Array.isArray(aiData) ? aiData : []);
    } catch (fetchError) {
      setItineraries([]);
      setCollaborators([]);
      setAiRecommendations([]);
      setLoadError(fetchError instanceof Error ? fetchError.message : String(fetchError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCreatePlan = useCallback(() => {
    alert('새 여행 플랜 생성은 백엔드 구현 이후 제공될 예정입니다.');
  }, []);

  const handleRefresh = useCallback(() => {
    fetchDashboardData();
    if (onRefresh) {
      onRefresh();
    }
  }, [fetchDashboardData, onRefresh]);

  const profileName = user?.nickname ?? user?.name ?? '플래너 사용자';
  const profileEmail = user?.email ?? '이메일 정보가 없습니다.';

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
            <h1>{greeting}</h1>
            <p>
              Google OAuth로 로그인한 사용자를 위해 협업과 AI 추천 정보가 한눈에 보이도록 구성했습니다. 진행 중인
              여행 플랜을 확인하고 팀원과 실시간으로 공유하세요.
            </p>
            <div className="quick-actions">
              <button type="button" className="primary-button" onClick={handleCreatePlan}>
                새 여행 플랜 시작하기
              </button>
              <button type="button" className="ghost-button" onClick={handleRefresh}>
                데이터 새로고침
              </button>
            </div>
          </div>
          <div className="dashboard-summary">
            <article className="summary-card">
              <span className="summary-label">진행 중 플랜</span>
              <strong className="summary-value">{itineraries.length}</strong>
            </article>
            <article className="summary-card">
              <span className="summary-label">협업 중 팀원</span>
              <strong className="summary-value">{collaborators.length}</strong>
            </article>
            <article className="summary-card">
              <span className="summary-label">AI 추천</span>
              <strong className="summary-value">{aiRecommendations.length}</strong>
            </article>
          </div>
        </section>

        {error || loadError ? (
          <section className="status-banner" role="alert">
            <p>{loadError ?? error}</p>
          </section>
        ) : null}

        <section className="board-section">
          <div className="section-heading">
            <h2>다가오는 여행 일정</h2>
            <button type="button" className="text-button" onClick={handleCreatePlan}>
              새 일정 추가
            </button>
          </div>
          <div className="board-grid">
            {isLoading && itineraries.length === 0 ? (
              <p className="empty-state">일정을 불러오는 중입니다...</p>
            ) : null}
            {!isLoading && itineraries.length === 0 ? (
              <p className="empty-state">등록된 여행 일정이 없습니다. 새 여행을 계획해보세요!</p>
            ) : null}
            {itineraries.map((itinerary) => (
              <article key={itinerary.id ?? itinerary.title} className="board-card">
                <span className="board-period">{itinerary.period ?? itinerary.dateRange}</span>
                <h3>{itinerary.title}</h3>
                <ul>
                  {(itinerary.tasks ?? itinerary.todoList ?? []).map((task) => (
                    <li key={typeof task === 'string' ? task : task.id}>{typeof task === 'string' ? task : task.name}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="collaboration-section">
          <div className="collaboration-card">
            <div className="section-heading">
              <h2>협업 중인 팀원</h2>
              <span className="tag">Google 초대</span>
            </div>
            {collaborators.length === 0 ? (
              <p className="empty-state">아직 협업 중인 팀원이 없습니다. 팀원을 초대해보세요.</p>
            ) : (
              <ul>
                {collaborators.map((collaborator) => (
                  <li key={collaborator.email ?? collaborator.id}>
                    <div>
                      <strong>{collaborator.name ?? collaborator.nickname}</strong>
                      <span>{collaborator.email}</span>
                    </div>
                    <span className="role-chip">{collaborator.role ?? '읽기'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="ai-card">
            <div className="section-heading">
              <h2>AI 추천 업데이트</h2>
              <span className="tag accent">ChatGPT</span>
            </div>
            {aiRecommendations.length === 0 ? (
              <p className="empty-state">AI 추천을 가져오는 중이거나 아직 생성된 내용이 없습니다.</p>
            ) : (
              <ul>
                {aiRecommendations.map((recommendation) => (
                  <li key={recommendation.id}>
                    <strong>{recommendation.title}</strong>
                    <span>{recommendation.description}</span>
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
