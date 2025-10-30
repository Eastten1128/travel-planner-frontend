import { useCallback, useState } from 'react';
import './App.css';
import AdditionalInfo from './pages/AdditionalInfo';
import MainPageA from './pages/MainPageA';
import MainPageB from './pages/MainPageB';

const AUTH_STATUS_KEY = 'myro.authStatus';

const readInitialStatus = () => {
  if (typeof window === 'undefined') {
    return 'logged-out';
  }

  const params = new URLSearchParams(window.location.search);

  const updateUrl = () => {
    const search = params.toString();
    const next = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', next);
  };

  const authStatusParam = params.get('authStatus');
  if (authStatusParam === 'needs-profile' || authStatusParam === 'logged-in') {
    sessionStorage.setItem(AUTH_STATUS_KEY, authStatusParam);
    params.delete('authStatus');
    updateUrl();
    return authStatusParam;
  }

  if (params.get('firstLogin') === 'true') {
    sessionStorage.setItem(AUTH_STATUS_KEY, 'needs-profile');
    params.delete('firstLogin');
    updateUrl();
    return 'needs-profile';
  }

  if (params.get('loggedIn') === 'true') {
    sessionStorage.setItem(AUTH_STATUS_KEY, 'logged-in');
    params.delete('loggedIn');
    updateUrl();
    return 'logged-in';
  }

  const stored = sessionStorage.getItem(AUTH_STATUS_KEY);
  if (stored === 'needs-profile' || stored === 'logged-in') {
    return stored;
  }

  return 'logged-out';
};

function App() {
  const [status, setStatus] = useState(() => readInitialStatus());

  const persistStatus = useCallback((nextStatus) => {
    if (typeof window !== 'undefined') {
      if (nextStatus === 'logged-out') {
        sessionStorage.removeItem(AUTH_STATUS_KEY);
      } else {
        sessionStorage.setItem(AUTH_STATUS_KEY, nextStatus);
      }
    }
    setStatus(nextStatus);
  }, []);

  const handleLogout = useCallback(() => {
    persistStatus('logged-out');
    if (typeof window !== 'undefined') {
      window.location.href = 'http://localhost:8080/logout';
    }
  }, [persistStatus]);

  const handleLandingNavigate = useCallback(() => {
    persistStatus('logged-out');
  }, [persistStatus]);

  if (status === 'needs-profile') {
    return (
      <AdditionalInfo
        onNavigate={(path) => {
          if (path === '/main') {
            persistStatus('logged-in');
          } else {
            persistStatus('logged-out');
          }
        }}
      />
    );
  }

  if (status === 'logged-in') {
    return <MainPageA onLogout={handleLogout} onNavigateLanding={handleLandingNavigate} />;
  }

  return <MainPageB />;
}

export default App;
