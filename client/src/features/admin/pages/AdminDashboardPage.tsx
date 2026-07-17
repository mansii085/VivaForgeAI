import { Shield, AlertCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 lg:p-8">
      <div>
        <h2 className="text-3xl font-bold font-display tracking-tight text-[var(--text-primary)]">
          Admin Control Panel
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Manage user accounts, monitor platforms stats, and analyze cost variables.
        </p>
      </div>

      <div className="glass-card p-12 text-center flex flex-col items-center justify-center space-y-6">
        <div className="inline-flex p-4 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
          <Shield className="w-10 h-10" />
        </div>
        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-bold font-display text-[var(--text-primary)]">
            Phase 9 Admin Features
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Admin role checks, user administration lists, prompt settings, and AI cost tracking modules are restricted to administrative accounts.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <AlertCircle className="w-3.5 h-3.5" />
          Under active development
        </div>
      </div>
    </div>
  );
}
