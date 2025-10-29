import { useCallback, useState } from 'react';
import './App.css';

function App() {
  const [destination, setDestination] = useState('');

  const handleLogin = useCallback(() => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }, []);

  const handleDestinationChange = useCallback((event) => {
    setDestination(event.target.value);
  }, []);

  const handleSearchSubmit = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">MYRO</div>
        <nav className="nav-links" aria-label="주요 페이지">
          <a href="/" className="nav-link">여행지</a>
          <a href="/" className="nav-link">고객지원</a>
          <a href="/" className="nav-link">이용방법</a>
          <button type="button" className="login-button" onClick={handleLogin}>
            로그인
          </button>
        </nav>
      </header>

      <main className="hero" role="main">
        <div className="hero-content">
          <p className="tagline">간편한 여행 플래너와 함께하는 일정 관리</p>
          <h1 className="hero-title">
            기존에 경험하지 못한
            <br />
            새로운 여행 플래너
          </h1>
          <p className="hero-description">
            여행의 시작부터 끝까지, 일정을 한눈에 확인하고 팀원과 손쉽게 공유하세요.
          </p>
          <form className="search-bar" role="search" onSubmit={handleSearchSubmit}>
            <label htmlFor="destination" className="sr-only">
              여행지 검색
            </label>
            <input
              id="destination"
              type="search"
              placeholder="어디로 여행을 떠나시나요?"
              aria-label="여행지 검색"
              value={destination}
              onChange={handleDestinationChange}
            />
            <button type="submit">플래너 찾기</button>
          </form>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="map-card">
            <div className="map-card-header">
              <span className="map-card-title">오늘의 인기 여행</span>
              <span className="map-card-badge">제주도</span>
            </div>
            <div className="map-embed">
              <iframe
                title="제주도 지도"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26553.640711116595!2d126.50695560232035!3d33.499621348176824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x350ce356cf0d03a1%3A0x675f76dddbda3555!2z7KCE7LKt64Ko!5e0!3m2!1sko!2skr!4v1700000000000!5m2!1sko!2skr"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="schedule-preview">
              <div className="schedule-item">
                <span className="time">Day 1</span>
                <span className="place">한라산 국립공원</span>
              </div>
              <div className="schedule-item">
                <span className="time">Day 2</span>
                <span className="place">협재 해수욕장</span>
              </div>
              <div className="schedule-item">
                <span className="time">Day 3</span>
                <span className="place">동문 재래시장</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="feature-hint" aria-label="주요 기능 소개">
        <div className="hint-card">
          <h3>Google OAuth 2.0</h3>
          <p>간편한 소셜 로그인으로 언제든지 MYRO에 접속하고 프로필을 관리하세요.</p>
        </div>
        <div className="hint-card">
          <h3>그룹 플래너</h3>
          <p>구글 이메일로 팀원을 초대하고 일정 열람 권한을 부여할 수 있어요.</p>
        </div>
        <div className="hint-card">
          <h3>AI 여행 추천</h3>
          <p>ChatGPT 기반 추천으로 여행지를 빠르게 탐색하고 일정을 구성해보세요.</p>
        </div>
      </section>
    </div>
  );
}

export default App;
