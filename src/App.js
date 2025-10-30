import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import AdditionalInfo from './pages/AdditionalInfo';
import MainPageA from './pages/MainPageA';
import MainPageB from './pages/MainPageB';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8080';

const truthy = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    return (
      normalized === 'true' ||
      normalized === '1' ||
      normalized === 'yes' ||
      normalized === 'y' ||
      normalized === 't' ||
      normalized === 'success' ||
      normalized === 'on'
    );
  }

  return false;
};

const parseSessionFlags = () => {
  if (typeof window === 'undefined') {
    return { needsProfile: false, logoutSuccess: false };
  }

  const params = new URLSearchParams(window.location.search);
  const lowerKeys = (...keys) =>
    keys.some((key) => {
      const raw = params.get(key);
      return raw ? truthy(raw) : false;
    });

  const needsProfile = lowerKeys('needsProfile', 'requireProfile', 'firstLogin', 'isFirstLogin', 'onboarding');
  const logoutRaw = params.get('logout');
  const logoutSuccess = logoutRaw ? truthy(logoutRaw) || logoutRaw.toLowerCase() === 'success' : false;

  if (needsProfile || logoutSuccess) {
    const cleaned = new URLSearchParams(params);
    ['needsProfile', 'requireProfile', 'firstLogin', 'isFirstLogin', 'onboarding', 'logout'].forEach((key) => {
      cleaned.delete(key);
    });

    const cleanedQuery = cleaned.toString();
    const currentQuery = params.toString();

    if (cleanedQuery !== currentQuery) {
      const newUrl = `${window.location.pathname}${cleanedQuery ? `?${cleanedQuery}` : ''}${window.location.hash}`;
      window.history.replaceState(null, '', newUrl);
    }
  }

  return { needsProfile, logoutSuccess };
};

function App() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const authEndpoint = useMemo(() => `${API_BASE_URL}/api/users/me`, []);

  const loadSession = useCallback(async () => {
    const { logoutSuccess, needsProfile: needsProfileQuery } = parseSessionFlags();

    if (logoutSuccess) {
      setUser(null);
      setStatus('logged-out');
      setError(null);
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const response = await fetch(authEndpoint, {
        credentials: 'include',
      });

      if (response.status === 401) {
        setUser(null);
        setStatus('logged-out');
        return;
      }

      if (response.status === 403) {
        let data = null;

        try {
          data = await response.json();
        } catch (parseError) {
          console.error('Failed to parse profile response', parseError);
        }

        setUser(data);
        setStatus('needs-profile');
        return;
      }

      if (!response.ok) {
        throw new Error('사용자 정보를 불러오지 못했습니다.');
      }

      const data = await response.json();
      setUser(data);

      const hasNickname =
        typeof data?.nickname === 'string'
          ? data.nickname.trim().length > 0
          : Boolean(data?.nickname);

      const statusNeedsProfile =
        needsProfileQuery ||
        truthy(data?.firstLogin) ||
        truthy(data?.needsProfile) ||
        truthy(data?.requireProfile) ||
        data?.status === 'INCOMPLETE_PROFILE' ||
        data?.status === 'NEEDS_PROFILE' ||
        !hasNickname;

      if (statusNeedsProfile) {
        setStatus('needs-profile');
      } else {
        setStatus('logged-in');
      }
    } catch (fetchError) {
      setUser(null);
      setStatus('logged-out');
      setError(fetchError instanceof Error ? fetchError.message : String(fetchError));
    }
  }, [authEndpoint]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const handleProfileSaved = useCallback(() => {
    loadSession();
  }, [loadSession]);

  const handleLogout = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.location.href = `${API_BASE_URL}/logout`;
  }, []);

  if (status === 'loading') {
    return (
      <div className="loading-screen">
        <div className="loading-indicator" aria-hidden />
        <p>사용자 정보를 확인하고 있습니다...</p>
      </div>
    );
  }

  if (status === 'needs-profile') {
    return <AdditionalInfo user={user} onComplete={handleProfileSaved} onLogout={handleLogout} />;
  }

  if (status === 'logged-in' && user) {
    return <MainPageA user={user} onLogout={handleLogout} onReload={loadSession} />;
  }

  return <MainPageB error={error} />;
}

export default App;
