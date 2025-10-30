# Travel Planner Frontend

통합 여행 플래너 서비스의 프론트엔드 애플리케이션입니다. 이 저장소는 `feature/sso` 와 `feature/jdr` 브랜치를 통합한 백엔드 명세와 `codex/22-51-41` 브랜치의 구현을 기준으로, 3주차 일정(SSO/OAuth, Planner & TodayPlan CRUD)까지의 기능을 React 로 재구성한 코드 베이스를 제공합니다.

## 핵심 기능 (3주차 기준)
- **Google OAuth 2.0 로그인**: 백엔드(Spring Security + OAuth2 + JWT)가 발급한 토큰을 OAuth 콜백에서 수신하여 프론트엔드 세션으로 저장합니다.
- **사용자 프로필 확인**: 로그인 이후 "내 정보" API를 통해 사용자 프로필을 불러옵니다.
- **여행 플래너 CRUD**: 플래너 생성, 목록 조회, 수정, 삭제 기능을 제공합니다.
- **TodayPlan 관리**: 특정 플래너에 속한 하루 일정(TodayPlan)을 추가, 수정, 삭제할 수 있습니다.
- **에러/예외 페이지**: 로그인 실패, 토큰 누락과 같은 예외 상황을 처리합니다.

## 기술 스택
| 영역 | 사용 기술 |
| --- | --- |
| Language | JavaScript (ES2022), JSX |
| Framework | React 19, React Router 7 |
| UI | Material UI (MUI) |
| 상태관리 | React Context API |
| HTTP 통신 | Axios |

## 폴더 구조
```
src/
├── App.js
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.js
│   ├── layout/
│   │   ├── AppFooter.js
│   │   └── AppNavbar.js
│   └── planner/
│       ├── PlannerForm.js
│       └── TodayPlanForm.js
├── context/
│   └── AuthContext.js
├── hooks/
│   └── useAuth.js
├── pages/
│   ├── auth/
│   │   ├── OAuthCallback.js
│   │   └── OAuthError.js
│   ├── landing/
│   │   └── LandingPage.js
│   └── planner/
│       ├── PlannerDetailPage.js
│       └── PlannerListPage.js
├── services/
│   ├── apiClient.js
│   ├── authService.js
│   └── plannerService.js
└── utils/
    └── formatters.js
```

## 환경 변수
프론트엔드는 다음 환경 변수를 사용합니다.

| 변수 | 설명 |
| --- | --- |
| `REACT_APP_API_BASE_URL` | 백엔드 API 엔드포인트 (예: `http://localhost:8080`) |
| `REACT_APP_GOOGLE_OAUTH_URL` | 백엔드 OAuth2 인증 시작 URL (예: `http://localhost:8080/oauth2/authorization/google`) |

> `.env` 파일에 위 값을 정의하거나, 실행 환경에서 직접 주입하세요.

## 실행 방법
```bash
npm install
npm start
```

## 백엔드 연동 가이드
- OAuth 성공 시 백엔드가 프론트엔드의 `/oauth2/callback` 으로 `accessToken`, `refreshToken`, `isProfileIncomplete` 값을 쿼리스트링으로 전달한다고 가정합니다.
- 모든 인증이 필요한 API 호출은 `Authorization: Bearer <accessToken>` 헤더를 포함합니다.
- 토큰이 만료되면 `refreshToken` 을 사용해 새 토큰을 발급받는 로직을 추후(4주차 이후) 확장할 수 있도록 구조화했습니다.

## 향후 계획
- Kakao OAuth 확장 및 소셜 로그인 옵션 추가
- 그룹/초대 기능 UI 연동
- 여행 추천(AI) 입력폼 및 결과 화면 구현
- Swagger 기반 API 문서 연동 및 개발 모드 전용 Mock API 구성

## 라이선스
학습 및 비상업적 용도로 사용 가능합니다. 프로젝트 내 소스코드 및 산출물의 저작권은 원 개발자(Eastten1128 및 팀원)에게 있습니다.
