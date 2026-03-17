import { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { usePatient } from './context/usePatient';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';
import { SkeletonReport } from './components/LoadingSkeleton';

import Entrance from './pages/Entrance';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import NewAnalysis from './pages/NewAnalysis';
import Analysis from './pages/Analysis';
import NotFound from './pages/NotFound';

const Report = lazy(() => import('./pages/Report'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  const { toasts, addToast, removeToast } = usePatient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOnline(false);
    const handleOnline  = () => {
      setIsOnline(true);
      addToast("Connection restored", "success");
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online",  handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online",  handleOnline);
    };
  }, [addToast]);

  useEffect(() => {
    const titles = {
      '/': 'OncoDetect | Enterprise AI Triage',
      '/sign-in': 'OncoDetect | Secure Login',
      '/dashboard': 'OncoDetect | Dashboard',
      '/new-analysis': 'OncoDetect | New Patient Analysis',
      '/analysis': 'OncoDetect | Processing...',
      '/report': 'OncoDetect | Clinical Report',
    };
    document.title = titles[location.pathname] || 'OncoDetect AI';
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-[rgba(255,188,66,0.15)] border-b border-[#FFBC42] text-[#FFBC42] text-center text-xs tracking-widest uppercase py-2 font-bold backdrop-blur-md">
          No internet connection — AI features unavailable
        </div>
      )}
      <ScrollToTop />
      <Suspense fallback={<SkeletonReport />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Entrance />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/new-analysis" element={<NewAnalysis />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/report" element={<Report />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toast toasts={toasts} removeToast={removeToast} />
    </ErrorBoundary>
  );
}
