import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
  </div>
);

// Signed-in users (real or guest) see the app. Anyone else is started in a
// guest demo workspace; if guest sign-in is unavailable they go to /login.
export default function ProtectedRoute() {
  const { isAuthenticated, isLoadingAuth, guestError, ensureGuest } = useAuth();
  const location = useLocation();
  const needsGuest = !isLoadingAuth && !isAuthenticated && !guestError;

  useEffect(() => {
    if (needsGuest) ensureGuest();
  }, [needsGuest, ensureGuest]);

  if (isAuthenticated) return <Outlet />;
  if (guestError) {
    const here = location.pathname + location.search;
    const to = here === '/' ? '/login' : `/login?returnTo=${encodeURIComponent(here)}`;
    return <Navigate to={to} replace />;
  }
  return <Spinner />;
}
