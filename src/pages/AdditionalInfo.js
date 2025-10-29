import { useCallback, useMemo, useState } from 'react';
import '../App.css';

function AdditionalInfo({ onNavigate }) {
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [travelStyle, setTravelStyle] = useState('');

  const isValid = useMemo(() => nickname.trim().length > 0 && travelStyle.trim().length > 0, [nickname, travelStyle]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (!isValid) {
        return;
      }

      alert('추가 정보가 저장되었습니다. 대시보드로 이동합니다.');
      if (onNavigate) {
        onNavigate('/main');
      }
    },
    [isValid, onNavigate],
  );

  return (
    <div className="additional-info-page">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">MYRO</span>
          <span className="brand-subtitle">Collaborative Travel Planner</span>
        </div>
        <div className="top-actions">
          <span className="welcome-chip">첫 로그인 확인</span>
        </div>
      </header>

      <main className="additional-info-content">
        <section className="additional-info-panel">
          <div>
            <span className="hero-badge">추가 정보 등록</span>
            <h1>마이로에서 사용할 프로필을 완성해주세요</h1>
            <p>
              첫 로그인 사용자에게는 닉네임과 선호 여행 스타일을 저장하도록 안내합니다. 입력을 완료하면 대시보드로
              이동합니다.
            </p>
          </div>

          <form className="additional-info-form" onSubmit={handleSubmit}>
            <label>
              닉네임
              <input
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="팀원에게 보여질 이름"
                required
              />
            </label>

            <label>
              연락처 (선택)
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="010-1234-5678"
              />
            </label>

            <label>
              선호 여행 스타일
              <textarea
                rows={4}
                value={travelStyle}
                onChange={(event) => setTravelStyle(event.target.value)}
                placeholder="예: 느긋한 힐링 여행, 카페 투어, 현지 맛집 등"
                required
              />
            </label>

            <button type="submit" className="primary-button" disabled={!isValid}>
              저장하고 대시보드로 이동
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default AdditionalInfo;

