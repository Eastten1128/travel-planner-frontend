import { useCallback, useEffect, useState } from 'react';
import AdditionalInfo from './pages/AdditionalInfo';
import MainPageA from './pages/MainPageA';
import MainPageB from './pages/MainPageB';

const ROUTES = {
  '/': MainPageB,
  '/main': MainPageA,
  '/additional-info': AdditionalInfo,
};

function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = useCallback((nextPath) => {
    if (!nextPath || typeof nextPath !== 'string') {
      return;
    }

    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, '', nextPath);
    }
    setPath(nextPath);
  }, []);

  const PageComponent = ROUTES[path] ?? MainPageB;

  return <PageComponent onNavigate={handleNavigate} />;
}

export default App;
