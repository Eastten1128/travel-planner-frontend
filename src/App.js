import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

const DEFAULT_LOGIN_PATH = '/oauth2/authorization/google';
const DEFAULT_LOGOUT_REDIRECT = '/';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Boolean(window.localStorage.getItem('accessToken'));
  });

  useEffect(() => {
    const handleStorage = () => {
      setIsLoggedIn(Boolean(window.localStorage.getItem('accessToken')));
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const loginUrl = useMemo(() => {
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const configuredUrl = process.env.REACT_APP_GOOGLE_OAUTH_URL;

    if (configuredUrl) {
      return configuredUrl;
    }

    if (baseUrl) {
      return `${baseUrl.replace(/\/?$/, '')}${DEFAULT_LOGIN_PATH}`;
    }

    return DEFAULT_LOGIN_PATH;
  }, []);

  const beforeLoginNav = useMemo(() => ['여행지', '고객지원', '이용방법'], []);
  const afterLoginNav = useMemo(() => ['여행지', '고객지원', '이용방법'], []);
  const navItems = isLoggedIn ? afterLoginNav : beforeLoginNav;

  const handleLogin = useCallback(() => {
    window.location.href = loginUrl;
  }, [loginUrl]);

  const handleLogout = useCallback(() => {
    window.localStorage.removeItem('accessToken');
    setIsLoggedIn(false);

    const redirectUrl = process.env.REACT_APP_LOGOUT_REDIRECT_URL || DEFAULT_LOGOUT_REDIRECT;
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }, []);

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
          <button
            type="button"
            className="login-button"
            onClick={isLoggedIn ? handleLogout : handleLogin}
          >
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
