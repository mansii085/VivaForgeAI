import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Sparkles, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
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
      await api.post(`/auth/reset-password/${token}`, {
        password,
        confirmPassword,
      });
      toast.success('Password reset successful! Please log in with your new password.');
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to reset password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] mb-4">
          <Sparkles className="w-8 h-8 text-[var(--color-brand-500)]" />
        </div>
        <h2 className="text-3xl font-extrabold font-display tracking-tight text-[var(--text-primary)]">
          New Password
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Choose a secure, strong password to safeguard your account.
        </p>
      </div>

      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">
              New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="Min. 6 chars, 1 uppercase, 1 digit"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">
              Confirm New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full py-3"
          >
            {isLoading ? 'Resetting password...' : 'Update Password'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>

      <p className="text-center mt-8">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-500)] hover:text-[var(--color-brand-600)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
