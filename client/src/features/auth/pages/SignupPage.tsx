import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const GOOGLE_TOAST_ID = 'google-signup-disabled';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export default function SignupPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (!name || !email || !password || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Password must contain at least one uppercase letter and one number
    if (!/[A-Z]/.test(password)) {
      toast.error('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[0-9]/.test(password)) {
      toast.error('Password must contain at least one number');
      return;
    }

    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await api.post('/auth/signup', {
        name,
        email: normalizedEmail,
        password,
        confirmPassword,
      });
      const { user, accessToken } = response.data.data;
      setAuth(user, accessToken);
      toast.success('Account created successfully! Welcome!');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to sign up';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = (e: React.MouseEvent) => {
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
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] mb-2">
          <Sparkles className="w-6 h-6 text-[var(--color-brand-500)]" />
        </div>
        <h2 className="text-3xl font-extrabold font-display tracking-tight text-[var(--text-primary)]">
          Create Account
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Join VivaForgeAI and unlock your competitive edge.
        </p>
      </div>

      <div className="glass-card p-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field pl-10"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

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
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 pr-10"
                placeholder="Min. 6 chars, 1 uppercase, 1 digit"
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

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pl-10 pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full py-2.5"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
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
          onClick={handleGoogleSignup}
          type="button"
          disabled={!googleEnabled}
          className={`btn btn-secondary w-full py-2.5 mt-4 flex items-center justify-center gap-3 ${!googleEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.478 0-6.3-2.822-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.506 0 2.887.533 3.981 1.417l3.072-3.072C18.995 2.215 15.82 1 12.24 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.897 0 10.866-4.22 10.866-11.24 0-.768-.068-1.506-.188-2.22H12.24z"
            />
          </svg>
          Google
        </button>

        <button
          onClick={() => {
            const { demoLogin } = useAuthStore.getState();
            demoLogin();
            toast.success('Logged in as Demo User');
            navigate('/dashboard', { replace: true });
          }}
          type="button"
          className="btn btn-secondary w-full py-2.5 mt-2.5 flex items-center justify-center gap-3 bg-[var(--color-brand-50)] text-[var(--color-brand-600)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)] border-[var(--color-brand-200)] dark:border-[var(--color-brand-800)] hover:bg-[var(--color-brand-100)] dark:hover:bg-[var(--color-brand-800)]"
        >
          <Sparkles className="w-5 h-5" />
          Explore Demo Mode
        </button>
      </div>

      <p className="text-center mt-4 text-sm text-[var(--text-secondary)]">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-[var(--color-brand-500)] hover:text-[var(--color-brand-600)] transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
