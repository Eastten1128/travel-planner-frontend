import { useCallback } from 'react';
import '../App.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8080';

const ITINERARY = [
  {
    label: 'Day 1',
    title: '함덕 서우봉 일출 & 구좌 카페 투어',
  },
  {
    label: 'Day 2',
    title: '서귀포 올레길 & 정방폭포 감상',
  },
  {
    label: 'Day 3',
    title: '애월 드라이브 & 곽지해수욕장 노을',
  },
];

function MainPageB({ error }) {
  const handleLogin = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const redirectUri = encodeURIComponent(window.location.origin);
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google?redirect_uri=${redirectUri}`;
  }, []);

  const handleSearch = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-brand">플래너 이름</div>
        <nav className="landing-nav" aria-label="주요 탐색">
          <a className="landing-nav-link" href="#intro">
            nav1.
          </a>
          <a className="landing-nav-link" href="#itinerary">
            nav2.
          </a>
          <a className="landing-nav-link" href="#map">
            nav3.
          </a>
        </nav>
        <button type="button" className="primary-button login-button" onClick={handleLogin}>
          Google 로그인
        </button>
      </header>

      <main className="landing-main" id="intro">
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-hero-tag">간편한 여행 일정과 협업을 한눈에</span>
            <h1 className="landing-hero-title">기존에 경험하지 못한 새로운 여행 플래너</h1>
            <p className="landing-hero-description">
              여행의 시작부터 일정 공유까지, 플래너 하나로 모든 준비를 마칠 수 있어요. 필요한 일정, 메모, 예산 정보를 한 곳에서
              관리하고 팀원과 실시간으로 공유하세요.
            </p>
            {error ? <p className="landing-error">{error}</p> : null}
            <form className="landing-search-form" onSubmit={handleSearch}>
              <label className="landing-search-label" htmlFor="destination">
                어디로 여행을 떠나시나요?
              </label>
              <div className="landing-search-field">
                <input
                  className="landing-search-input"
                  id="destination"
                  type="text"
                  placeholder="여행지를 입력하세요"
                  aria-label="여행지 검색"
                />
                <button type="submit" className="primary-button landing-search-button">
                  계획 찾기
                </button>
              </div>
            </form>
          </div>

          <div className="landing-hero-visual">
            <div className="landing-map-card" id="map">
              <iframe
                title="제주도 지도"
                className="landing-map-frame"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26287.667144467167!2d126.53118807531631!3d33.49962134815179!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x350cfb1a9f8e2f23%3A0x7f9fcd0d1d2c4d41!2z7KCc7KO87IOB7YyM!5e0!3m2!1sko!2skr!4v1718000000000!5m2!1sko!2skr"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <aside className="landing-itinerary-card" id="itinerary">
              <h2 className="landing-itinerary-title">오늘의 일정 예시</h2>
              <ul className="landing-itinerary-list">
                {ITINERARY.map((item) => (
                  <li key={item.label} className="landing-itinerary-day">
                    <span className="landing-itinerary-day-label">{item.label}</span>
                    <span className="landing-itinerary-day-title">{item.title}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MainPageB;
