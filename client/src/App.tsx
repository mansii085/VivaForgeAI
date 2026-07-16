import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

// Layouts
import AuthLayout from '@/components/layout/AuthLayout';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { GlobalErrorBoundary } from '@/components/ErrorBoundary';

// Pages
import LoginPage from '@/features/auth/pages/LoginPage';
import SignupPage from '@/features/auth/pages/SignupPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import GoogleCallbackPage from '@/features/auth/pages/GoogleCallbackPage';
import ProfilePage from '@/features/auth/pages/ProfilePage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import ResumeListPage from '@/features/resume/pages/ResumeListPage';
import ATSAnalyzerPage from '@/features/ats-analyzer/pages/ATSAnalyzerPage';
import JDMatcherPage from '@/features/jd-matcher/pages/JDMatcherPage';
import MockInterviewPage from '@/features/mock-interview/pages/MockInterviewPage';
import LearningPage from '@/features/learning/pages/LearningPage';
import RAGPage from '@/features/rag/pages/RAGPage';
import AdminDashboardPage from '@/features/admin/pages/AdminDashboardPage';

export default function App() {
  const { setUser, logout, setLoading, isDarkMode } = useAuthStore();

  useEffect(() => {
    // New CSS: dark is default; add 'light' class for light mode
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }

    const initializeAuth = async () => {
      // Skip backend check for demo user
      const currentUser = useAuthStore.getState().user;
      if (currentUser && currentUser._id === 'demo-user-123') {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data.data);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setUser, logout, setLoading, isDarkMode]);

  return (
    <GlobalErrorBoundary>
      <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'glass-card',
          style: {
            background: 'var(--bg-glass)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            backdropFilter: 'blur(16px)',
          },
        }}
      />
      <Routes>
        {/* Public Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Route>
        <Route path="/auth/callback" element={<GoogleCallbackPage />} />

        {/* Protected App Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/resumes" element={<ResumeListPage />} />
          <Route path="/ats-analyzer" element={<ATSAnalyzerPage />} />
          <Route path="/jd-matcher" element={<JDMatcherPage />} />
          <Route path="/mock-interview" element={<MockInterviewPage />} />
          <Route path="/learning" element={<LearningPage />} />
          <Route path="/rag" element={<RAGPage />} />
          <Route path="/settings" element={<ProfilePage />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
    </GlobalErrorBoundary>
  );
}
