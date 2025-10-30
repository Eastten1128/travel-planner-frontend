import './App.css';

function App() {
  const isLoggedIn = false;

  const beforeLoginNav = ['여행지', '고객지원', '이용방법'];
  const afterLoginNav = ['여행지', '고객지원', '이용방법'];
  const navItems = isLoggedIn ? afterLoginNav : beforeLoginNav;

  return (
    <div className="app">
      <header className="header">
        <h2 className="logo">[LOGO]</h2>
        <nav className="nav">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item} className="nav-item">
                <button type="button" className="nav-button">
                  {item}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="login-button">
            {isLoggedIn ? '로그아웃' : '로그인'}
          </button>
        </nav>
      </header>

      <main className="main">
        <section className="hero">
          <div className="hero-text">
            <span className="hero-eyebrow">당신만의 여행 파트너</span>
            <h1 className="hero-title">모든 여행이 설레는 계획으로 시작되도록</h1>
            <p className="hero-description">
              여행 스타일에 맞는 일정, 장소, 예산을 한 번에 구성하고 팀원과 쉽게 공유하세요.
              Google 계정으로 간편하게 로그인하고 AI 추천과 함께 완성도 높은 여행을 만들어 보세요.
            </p>
            <div className="hero-actions">
              <button type="button" className="primary-action">
                여행 플래너 시작하기
              </button>
              <button type="button" className="secondary-action">
                데모 일정 살펴보기
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-card-header">
                <span className="trip-name">봄날의 제주 3박 4일</span>
                <span className="trip-dates">04.12 - 04.15</span>
              </div>
              <ul className="hero-card-list">
                <li>
                  <span className="list-time">DAY 1</span>
                  <span className="list-place">협재 해수욕장 · 우도 투어 · 흑돼지</span>
                </li>
                <li>
                  <span className="list-time">DAY 2</span>
                  <span className="list-place">사려니 숲길 · 카페 투어 · 레이크 뮤지엄</span>
                </li>
                <li>
                  <span className="list-time">DAY 3</span>
                  <span className="list-place">오름 하이킹 · 감성 숙소 휴식</span>
                </li>
                <li>
                  <span className="list-time">DAY 4</span>
                  <span className="list-place">기념품 쇼핑 · 공항 이동</span>
                </li>
              </ul>
              <div className="hero-card-footer">
                <span className="hero-badge">AI 추천 일정</span>
                <span className="hero-budget">예산 540,000원</span>
              </div>
            </div>
          </div>
        </section>

        <section className="highlights">
          <div className="highlight-item">
            <strong>간편한 일정 작성</strong>
            <span>시간대별 일정과 메모를 자유롭게 정리</span>
          </div>
          <div className="highlight-item">
            <strong>팀 초대 &amp; 권한 관리</strong>
            <span>Google 이메일로 초대하고 실시간 협업</span>
          </div>
          <div className="highlight-item">
            <strong>AI 맞춤 추천</strong>
            <span>여행지 · 맛집 · 체험을 취향에 맞게</span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
