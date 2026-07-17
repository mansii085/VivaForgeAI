import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setIsSent(true);
      toast.success('Reset instruction sent successfully!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to send reset link';
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
          Reset Password
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {isSent
            ? "We've sent you a link to reset your password."
            : 'Enter your email to receive a password reset link.'}
        </p>
      </div>

      <div className="glass-card p-8">
        {isSent ? (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 mb-2">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Check your email <b>{email}</b> for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
            </p>
            <button
              onClick={() => setIsSent(false)}
              className="btn btn-secondary w-full py-3"
            >
              Try another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3"
            >
              {isLoading ? 'Sending link...' : 'Send Reset Link'}
              {!isLoading && <Send className="w-4 h-4" />}
            </button>
          </form>
        )}
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
