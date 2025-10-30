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
          <p className="hero-overline">간편한 여행 계획 작성과 맞춤형 일정 및 유익한 추천을 받아보세요.</p>
          <h1 className="hero-title">기존에 경험하지 못한 새로운 여행 플래너</h1>
          <p className="hero-description">
            간편한 여행 계획 작성과 맞춤형 일정을 맞춤 추천을 통해 새로운 여행의 시작점을 만나보세요.
          </p>
          <button type="button" className="hero-cta">
            여행 시작하기
          </button>
        </section>
      </main>
    </div>
  );
}

export default App;
