import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const GOOGLE_TOAST_ID = 'google-login-disabled';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    let isMounted = true;

    api.get('/auth/config')
      .then((response) => {
        if (isMounted) {
          setGoogleEnabled(response.data.data.googleEnabled);
        }
      })
      .catch(() => {
        if (isMounted) {
          setGoogleEnabled(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await api.post('/auth/login', { email: normalizedEmail, password });
      const { user, accessToken } = response.data.data;
      setAuth(user, accessToken);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to login';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!googleEnabled) {
      toast.error(
        'Google Login is unavailable. Please use Demo Mode or standard email signup.',
        { id: GOOGLE_TOAST_ID, duration: 5000 }
      );
      return;
    }

    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] mb-3">
          <Sparkles className="w-6 h-6 text-[var(--color-brand-500)]" />
        </div>
        <h2 className="text-3xl font-extrabold font-display tracking-tight text-[var(--text-primary)]">
          Welcome Back !
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Sign in to resume your career acceleration.
        </p>
      </div>

      <div className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-[var(--color-brand-500)] hover:text-[var(--color-brand-600)] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full py-2.5"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between">
          <span className="w-1/5 border-b border-[var(--border-color)]"></span>
          <span className="text-xs uppercase text-[var(--text-tertiary)] font-medium">
            or continue with
          </span>
          <span className="w-1/5 border-b border-[var(--border-color)]"></span>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={!googleEnabled}
          className={`btn btn-secondary w-full py-2.5 mt-4 flex items-center justify-center gap-3 ${!googleEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.478 0-6.3-2.822-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.506 0 2.887.533 3.981 1.417l3.072-3.072C18.995 2.215 15.82 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.897 0 10.866-4.22 10.866-11.24 0-.768-.068-1.506-.188-2.22H12.24z"
            />
          </svg>
          Google
        </button>

        <button
          onClick={() => {
            const { demoLogin } = useAuthStore.getState();
            demoLogin();
            toast.success('Logged in as Demo User');
            navigate(from, { replace: true });
          }}
          type="button"
          className="btn btn-secondary w-full py-2.5 mt-2.5 flex items-center justify-center gap-3 bg-[var(--color-brand-50)] text-[var(--color-brand-600)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)] border-[var(--color-brand-200)] dark:border-[var(--color-brand-800)] hover:bg-[var(--color-brand-100)] dark:hover:bg-[var(--color-brand-800)]"
        >
          <Sparkles className="w-5 h-5" />
          Explore Demo Mode
        </button>
      </div>

      <p className="text-center mt-5 text-sm text-[var(--text-secondary)]">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="font-semibold text-[var(--color-brand-500)] hover:text-[var(--color-brand-600)] transition-colors"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
