import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
  </div>
);

// Renders the app for signed-in users; everyone else goes to /login and comes
// back to the page they asked for afterwards.
export default function ProtectedRoute() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) return <Spinner />;
  if (!isAuthenticated) {
    const here = location.pathname + location.search;
    const to = here === '/' ? '/login' : `/login?returnTo=${encodeURIComponent(here)}`;
    return <Navigate to={to} replace />;
  }
  return <Outlet />;
}
