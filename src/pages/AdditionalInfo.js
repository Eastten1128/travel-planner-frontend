import { useCallback, useMemo, useState } from 'react';
import '../App.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8080';

function AdditionalInfo({ onComplete, onLogout, user }) {
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [travelStyle, setTravelStyle] = useState(user?.travelStyle ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = useMemo(() => nickname.trim().length > 0 && travelStyle.trim().length > 0, [nickname, travelStyle]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!isValid || isSubmitting) {
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nickname,
            phone,
            travelStyle,
          }),
        });

        if (!response.ok) {
          throw new Error('추가 정보를 저장하지 못했습니다.');
        }

        if (onComplete) {
          onComplete();
        }
      } catch (error) {
        alert(error instanceof Error ? error.message : '추가 정보를 저장하는 중 오류가 발생했습니다.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, isValid, nickname, onComplete, phone, travelStyle],
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
          <button type="button" className="ghost-button" onClick={onLogout}>
            로그아웃
          </button>
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

            <button type="submit" className="primary-button" disabled={!isValid || isSubmitting}>
              {isSubmitting ? '저장 중...' : '저장하고 대시보드로 이동'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default AdditionalInfo;
