import { useCallback } from 'react';
import './App.css';

const HERO_STATS = [
  { label: '여행 일정 생성', value: '5분 이내' },
  { label: '협업 인원', value: '무제한 초대' },
  { label: 'AI 추천', value: 'ChatGPT 기반' },
];

const SCHEDULE_DAYS = [
  {
    day: 'DAY 1',
    title: '제주 동부 트립',
    items: ['사려니숲길 트래킹', '성산일출봉 일몰 감상', '표선해수욕장 힐링'],
  },
  {
    day: 'DAY 2',
    title: '핵심 명소 탐방',
    items: ['협재 해수욕장', '우도 버킷리스트', '달빛이 머무는 제주 야경'],
  },
  {
    day: 'DAY 3',
    title: '현지 맛집 투어',
    items: ['동문 재래시장', '흑돼지 로컬 맛집', '용두암 노을'],
  },
];

const INVITES = [
  { email: 'mentor@myro.travel', role: '읽기' },
  { email: 'planner@myro.travel', role: '편집' },
  { email: 'designer@myro.travel', role: '읽기' },
];

const FEATURES = [
  {
    accent: '단일 로그인',
    title: 'Google OAuth 2.0 연동',
    description:
      'Google 계정으로 간편하게 가입하고 로그인할 수 있으며 Spring Security & JWT 기반으로 안전하게 세션을 관리합니다.',
  },
  {
    accent: '권한 제어',
    title: '그룹 플래너 협업',
    description:
      '구글 이메일 기준으로 팀원을 초대하고 읽기 및 편집 권한을 부여해 동일한 보드를 함께 관리할 수 있습니다.',
  },
  {
    accent: 'AI 시너지',
    title: 'ChatGPT 여행 추천',
    description:
      '여행지와 취향을 입력하면 ChatGPT API가 일정 틀과 개별 여행지를 추천하여 플래너에 자동으로 반영할 수 있습니다.',
  },
];

const WORKFLOW_STEPS = [
  {
    index: '01',
    title: '요구사항 입력',
    description: '여행 기간, 동행자, 취향, 예산 등을 자연어로 작성하면 MYRO가 맥락을 이해합니다.',
  },
  {
    index: '02',
    title: 'AI 추천 수신',
    description: 'ChatGPT 대화형 API가 여행 플로우와 추천 장소를 제안하고 메모까지 자동 생성합니다.',
  },
  {
    index: '03',
    title: '플래너 반영',
    description: '제안받은 일정을 확인하여 날짜별 카드로 저장하고 팀과 공유하세요.',
  },
];

function App() {
  const handleLogin = useCallback(() => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }, []);

  return (
    <div className="page">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">MYRO</span>
          <span className="brand-subtitle">Collaborative Travel Planner</span>
        </div>
        <nav className="nav-links" aria-label="주요 탐색">
          <a href="#planner-preview" className="nav-link">
            플래너 미리보기
          </a>
          <a href="#team" className="nav-link">
            협업
          </a>
          <a href="#ai" className="nav-link">
            AI 추천
          </a>
        </nav>
        <div className="top-actions">
          <button type="button" className="ghost-button" onClick={handleLogin}>
            데모 로그인
          </button>
          <button type="button" className="primary-button" onClick={handleLogin}>
            Google 로그인
          </button>
        </div>
      </header>

      <main className="page-content">
        <section className="hero-section">
          <div className="hero-text">
            <span className="hero-badge">DEV / SSO &amp; MAIN PAGE</span>
            <h1 className="hero-title">
              협업과 AI로 완성하는
              <br />
              차세대 여행 플래너
            </h1>
            <p className="hero-description">
              사용자 초대와 권한 관리, AI 기반 일정 추천까지 한 화면에서 경험하세요. MYRO는 여행
              준비의 모든 과정을 자동화된 워크플로우로 지원합니다.
            </p>
            <div className="cta-row">
              <button type="button" className="primary-button" onClick={handleLogin}>
                Google 계정으로 시작
              </button>
              <a className="secondary-link" href="#planner-preview">
                기능 미리보기
              </a>
            </div>
            <ul className="hero-stats">
              {HERO_STATS.map((stat) => (
                <li key={stat.label}>
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-preview">
            <article className="preview-card schedule-card" id="planner-preview">
              <header className="preview-card-header">
                <span className="preview-card-title">여행 일정 보드</span>
                <span className="preview-card-tag">실시간 동기화</span>
              </header>
              <div className="schedule-columns">
                {SCHEDULE_DAYS.map((day) => (
                  <div className="schedule-column" key={day.day}>
                    <h3>{day.day}</h3>
                    <p>{day.title}</p>
                    <ul>
                      {day.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>

            <article className="preview-card invite-card" id="team">
              <header className="preview-card-header">
                <span className="preview-card-title">Google Workspace 초대</span>
                <span className="preview-card-tag">권한 관리</span>
              </header>
              <ul className="invite-list">
                {INVITES.map((invite) => (
                  <li key={invite.email}>
                    <span className="invite-email">{invite.email}</span>
                    <span className="invite-role">{invite.role}</span>
                  </li>
                ))}
              </ul>
              <p className="preview-note">구글 이메일을 기반으로 초대하고 읽기/편집 권한을 설정하세요.</p>
            </article>
          </div>
        </section>

        <section className="feature-section">
          <h2>MYRO 핵심 기능</h2>
          <p className="section-description">
            소셜 로그인부터 일정 관리, AI 추천까지 여행 기획에 필요한 모든 기능을 한 곳에서 제공합니다.
          </p>
          <div className="feature-grid">
            {FEATURES.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <span className="feature-accent">{feature.accent}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="workflow-section" id="ai">
          <div className="workflow-intro">
            <h2>AI 추천과 함께 여행을 설계하세요</h2>
            <p>
              ChatGPT 대화형 API로 여행 틀을 자동으로 제안받고, 추천 일정을 MYRO 플래너에 바로 반영할 수
              있습니다.
            </p>
          </div>
          <div className="workflow-content">
            <div className="chat-preview" role="log" aria-label="AI 추천 예시">
              <div className="chat-bubble from-user">서울에서 2박 3일 커플 여행 추천해줘.</div>
              <div className="chat-bubble from-ai">
                <strong>AI 플래너</strong>
                <span>
                  낮에는 북촌과 삼청동을 거닐고, 저녁에는 한강 유람선을 추천드려요. 상세 일정은 플래너에
                  추가해두었습니다.
                </span>
              </div>
              <div className="chat-bubble from-ai">
                <strong>Day 2 추천</strong>
                <span>남산타워 → 명동 맛집 탐방 → 남산순환버스 야경.</span>
              </div>
            </div>
            <ol className="workflow-steps">
              {WORKFLOW_STEPS.map((step) => (
                <li key={step.index}>
                  <span className="step-index">{step.index}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-card">
            <div>
              <h2>지금 바로 MYRO로 여행을 계획해보세요</h2>
              <p>
                SSO 기반 로그인과 협업 기능으로 팀과 함께하는 여행 준비 과정을 한층 효율적으로 만들어
                드립니다.
              </p>
            </div>
            <button type="button" className="primary-button" onClick={handleLogin}>
              Google OAuth로 시작하기
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
