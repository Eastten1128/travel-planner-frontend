import { useCallback, useMemo } from 'react';
import '../App.css';

const UPCOMING_ITINERARIES = [
  {
    id: 1,
    title: '제주 3박 4일 가족 여행',
    period: '2025.05.02 - 2025.05.05',
    tasks: ['렌터카 픽업 확정', 'AI 추천 일정 검토', '팀 메모 확인'],
  },
  {
    id: 2,
    title: '오사카 2박 3일 미식 투어',
    period: '2025.06.11 - 2025.06.13',
    tasks: ['호텔 체크인 시간 공유', 'JR 패스 등록', '일정 초안 확정'],
  },
];

const COLLABORATORS = [
  { name: '김멘토', email: 'mentor@myro.travel', role: '읽기' },
  { name: '이플래너', email: 'planner@myro.travel', role: '편집' },
  { name: '박디자이너', email: 'designer@myro.travel', role: '읽기' },
];

const AI_RECOMMENDATIONS = [
  {
    id: 'jeju-day1',
    title: 'DAY 1 / 서귀포 감성 루트',
    description:
      '주상절리 해안 산책 후 카페 서연의집에서 브런치, 이어서 외돌개 일몰 감상까지 추천드려요.',
  },
  {
    id: 'jeju-day2',
    title: 'DAY 2 / 힐링 드라이브',
    description:
      '산굼부리 은빛 억새와 비자림 숲길을 묶은 드라이브 코스를 자동 생성했습니다. 이동 시간까지 계산되어 있어요.',
  },
];

function MainPageA({ onNavigate }) {
  const handleCreatePlan = useCallback(() => {
    alert('새 여행 플랜 생성은 곧 제공될 예정입니다.');
  }, []);

  const handleGoLanding = useCallback(() => {
    if (onNavigate) {
      onNavigate('/');
    }
  }, [onNavigate]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요!';
    if (hour < 18) return '반가워요!';
    return '오늘 하루도 수고하셨어요!';
  }, []);

  return (
    <div className="dashboard-page">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">MYRO</span>
          <span className="brand-subtitle">Collaborative Travel Planner</span>
        </div>
        <nav className="nav-links" aria-label="주요 탐색">
          <button type="button" className="nav-link as-button" onClick={handleGoLanding}>
            랜딩 보기
          </button>
          <span className="nav-link current">내 일정</span>
          <span className="nav-link">협업</span>
          <span className="nav-link">AI 추천</span>
        </nav>
        <div className="top-actions">
          <button type="button" className="ghost-button" onClick={handleCreatePlan}>
            새 플랜 생성
          </button>
          <div className="profile-chip" role="button" tabIndex={0}>
            <span className="profile-avatar" aria-hidden>J</span>
            <div>
              <strong>jdr@myro.travel</strong>
              <span>플래너 관리자</span>
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
              <button type="button" className="ghost-button" onClick={handleGoLanding}>
                메인 랜딩 이동
              </button>
            </div>
          </div>
          <div className="dashboard-summary">
            <article className="summary-card">
              <span className="summary-label">진행 중 플랜</span>
              <strong className="summary-value">2</strong>
            </article>
            <article className="summary-card">
              <span className="summary-label">협업 중 팀원</span>
              <strong className="summary-value">5명</strong>
            </article>
            <article className="summary-card">
              <span className="summary-label">AI 추천 적용</span>
              <strong className="summary-value">12회</strong>
            </article>
          </div>
        </section>

        <section className="board-section">
          <div className="section-heading">
            <h2>다가오는 여행 일정</h2>
            <button type="button" className="text-button" onClick={handleCreatePlan}>
              새 일정 추가
            </button>
          </div>
          <div className="board-grid">
            {UPCOMING_ITINERARIES.map((itinerary) => (
              <article key={itinerary.id} className="board-card">
                <span className="board-period">{itinerary.period}</span>
                <h3>{itinerary.title}</h3>
                <ul>
                  {itinerary.tasks.map((task) => (
                    <li key={task}>{task}</li>
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
            <ul>
              {COLLABORATORS.map((collaborator) => (
                <li key={collaborator.email}>
                  <div>
                    <strong>{collaborator.name}</strong>
                    <span>{collaborator.email}</span>
                  </div>
                  <span className="role-chip">{collaborator.role}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="ai-card">
            <div className="section-heading">
              <h2>AI 추천 업데이트</h2>
              <span className="tag accent">ChatGPT</span>
            </div>
            <ul>
              {AI_RECOMMENDATIONS.map((recommendation) => (
                <li key={recommendation.id}>
                  <strong>{recommendation.title}</strong>
                  <span>{recommendation.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MainPageA;

