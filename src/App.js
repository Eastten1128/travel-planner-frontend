import { useCallback, useEffect, useState } from 'react';
import './App.css';
import AdditionalInfo from './pages/AdditionalInfo';
import MainPageA from './pages/MainPageA';
import MainPageB from './pages/MainPageB';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8080';
const AUTH_ENDPOINT = `${API_BASE_URL}/api/users/me`;

const AUTH_STATUS = {
  LOADING: 'loading',
  LOGGED_OUT: 'logged-out',
  LOGGED_IN: 'logged-in',
  NEEDS_PROFILE: 'needs-profile',
};

function App() {
  const [status, setStatus] = useState(AUTH_STATUS.LOADING);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const refreshAuthState = useCallback(async () => {
    setStatus(AUTH_STATUS.LOADING);
    setError(null);

    try {
      const response = await fetch(AUTH_ENDPOINT, {
        credentials: 'include',
      });

      if (!response.ok) {
        setUser(null);
        setStatus(AUTH_STATUS.LOGGED_OUT);
        return;
      }

      const data = await response.json();
      setUser(data);

      if (data?.firstLogin || !data?.nickname) {
        setStatus(AUTH_STATUS.NEEDS_PROFILE);
      } else {
        setStatus(AUTH_STATUS.LOGGED_IN);
      }
    } catch (fetchError) {
      setUser(null);
      setError(fetchError instanceof Error ? fetchError.message : String(fetchError));
      setStatus(AUTH_STATUS.LOGGED_OUT);
    }
  }, []);

  useEffect(() => {
    refreshAuthState();
  }, [refreshAuthState]);

  const handleProfileCompleted = useCallback(() => {
    refreshAuthState();
  }, [refreshAuthState]);

  const handleLogout = useCallback(() => {
    setStatus(AUTH_STATUS.LOGGED_OUT);
    setUser(null);

    const logoutUrl = `${API_BASE_URL}/logout`;
    if (typeof window !== 'undefined') {
      window.location.href = logoutUrl;
    }
  }, []);

  if (status === AUTH_STATUS.LOADING) {
    return (
      <div className="loading-screen">
        <div className="loading-indicator" aria-hidden />
        <p>사용자 정보를 확인하고 있습니다...</p>
      </div>
    );
  }

  if (status === AUTH_STATUS.NEEDS_PROFILE) {
    return <AdditionalInfo user={user} onComplete={handleProfileCompleted} onLogout={handleLogout} />;
  }

  if (status === AUTH_STATUS.LOGGED_IN && user) {
    return <MainPageA user={user} onLogout={handleLogout} onRefresh={refreshAuthState} error={error} />;
  }

  return <MainPageB error={error} />;
}

export default App;
