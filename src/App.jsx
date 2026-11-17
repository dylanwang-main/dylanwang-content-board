import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import Analysis from '@/pages/Analysis';
import TikTokCallback from '@/pages/TikTokCallback';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
// Add page imports here
import Dashboard from '@/pages/Dashboard';
import Brain from '@/pages/Brain';
import Research from '@/pages/Research';
import Library from '@/pages/Library';
import Create from '@/pages/Create';
import Performance from '@/pages/Performance';
import Settings from '@/pages/Settings';
import Instagram from '@/pages/Instagram';
import TikTok from '@/pages/TikTok';
import YouTube from '@/pages/YouTube';
import Outliers from '@/pages/Outliers';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/brand" element={<Navigate to="/brain" replace />} />
        <Route path="/auth/tiktok" element={<TikTokCallback />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/brain" element={<Brain />} />
          <Route path="/research" element={<Research />} />
          <Route path="/library" element={<Library />} />
          <Route path="/create" element={<Create />} />
          <Route path="/instagram" element={<Instagram />} />
          <Route path="/tiktok" element={<TikTok />} />
          <Route path="/youtube" element={<YouTube />} />
          <Route path="/outliers" element={<Outliers />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AppRoutes />
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App