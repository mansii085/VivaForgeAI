import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Search,
  Briefcase,
  MessageSquare,
  BookOpen,
  Database,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { useDashboardQuery } from '@/features/dashboard/api';

const navigation = [
  { name: 'Dashboard',      href: '/dashboard',    icon: LayoutDashboard, color: '#00e5ff', glow: 'rgba(0,229,255,0.3)' },
  { name: 'Resumes',        href: '/resumes',       icon: FileText,        color: '#667eea', glow: 'rgba(102,126,234,0.3)', badge: 'NEW' },
  { name: 'ATS Analyzer',   href: '/ats-analyzer',  icon: Search,          color: '#f5576c', glow: 'rgba(245,87,108,0.3)', badge: 'HOT' },
  { name: 'JD Matcher',     href: '/jd-matcher',    icon: Briefcase,       color: '#ff9900', glow: 'rgba(255,153,0,0.3)' },
  { name: 'Mock Interview', href: '/mock-interview', icon: MessageSquare,   color: '#00f2fe', glow: 'rgba(0,242,254,0.3)', badge: 'AI' },
  { name: 'Learning',       href: '/learning',      icon: BookOpen,        color: '#43e97b', glow: 'rgba(67,233,123,0.3)' },
  { name: 'Knowledge Base', href: '/rag',           icon: Database,        color: '#a18cd1', glow: 'rgba(161,140,209,0.3)' },
];

const adminNavigation = [
  { name: 'Admin Panel', href: '/admin', icon: Shield, color: '#ffd700', glow: 'rgba(255,215,0,0.3)' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isDarkMode, toggleDarkMode, logout, isSidebarCollapsed, toggleSidebar } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { data: dashboardData } = useDashboardQuery();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* noop */ }
    logout();
    navigate('/login');
  };

  const navItems = user?.role === 'admin'
    ? [...navigation, ...adminNavigation]
    : navigation;

  const badgeColors: Record<string, string> = {
    HOT: 'linear-gradient(135deg,#ff4500,#ff007f)',
    NEW: 'linear-gradient(135deg,#00e5ff,#0077ff)',
    AI:  'linear-gradient(135deg,#a18cd1,#b800ff)',
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Logo ── */}
      <div
        className="flex items-center justify-between px-4 py-5"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center gap-3 overflow-hidden min-w-0">
          <div
            className="flex items-center justify-center w-10 h-10 min-w-[40px] rounded-xl relative"
          >
            <img src="/logo.svg" alt="VivaForgeAI Logo" className="w-8 h-8 drop-shadow-md" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-xl animate-ping opacity-20"
              style={{ border: '1px solid var(--color-neon-cyan)' }} />
          </div>
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                <h1 className="text-lg font-bold gradient-text" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                  VivaForgeAI
                </h1>
                <p className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>
                  CAREER PREPARATION
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={toggleSidebar}
          className="hidden lg:flex items-center justify-center p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          title={isSidebarCollapsed ? 'Expand' : 'Collapse'}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* ── Career Profile Card ── */}
      <AnimatePresence>
        {!isSidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-3 mt-4 mb-2 rounded-xl p-3 relative overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden"
                style={{ background: 'var(--gradient-primary)' }}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() ?? 'U'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {user?.name ?? 'Career Seeker'}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 mt-2">
              <div className="flex justify-between items-center bg-black/40 rounded-lg p-2.5 border border-white/5">
                <span className="text-xs font-semibold text-slate-300">Interviews Completed</span>
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {dashboardData?.stats?.interviewCount !== undefined ? dashboardData.stats.interviewCount : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black/40 rounded-lg p-2.5 border border-white/5">
                <span className="text-xs font-semibold text-slate-300">Avg Interview Score</span>
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {dashboardData?.stats?.avgInterviewScore !== undefined ? `${dashboardData.stats.avgInterviewScore}%` : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black/40 rounded-lg p-2.5 border border-white/5">
                <span className="text-xs font-semibold text-slate-300">Resume Completion</span>
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {dashboardData?.stats?.resumeCompletion !== undefined ? `${dashboardData.stats.resumeCompletion}%` : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black/40 rounded-lg p-2.5 border border-white/5">
                <span className="text-xs font-semibold text-slate-300">Learning Progress</span>
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {dashboardData?.stats?.learningProgress !== undefined ? `${dashboardData.stats.learningProgress}%` : '—'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative"
              style={{
                color: isActive ? item.color : 'var(--text-tertiary)',
                background: isActive
                  ? `linear-gradient(135deg, ${item.glow.replace('0.3', '0.12')}, ${item.glow.replace('0.3', '0.05')})`
                  : 'transparent',
                boxShadow: isActive ? `inset 0 0 0 1px ${item.color}33` : 'none',
              }}
              title={isSidebarCollapsed ? item.name : undefined}
            >
              {/* Active left accent bar */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}
                />
              )}

              {/* Icon with glow on hover */}
              <span
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200"
                style={{
                  background: isActive ? `${item.color}22` : 'transparent',
                  color: isActive ? item.color : 'var(--text-tertiary)',
                  boxShadow: isActive ? `0 0 10px ${item.glow}` : 'none',
                }}
              >
                <item.icon className="w-4 h-4" />
              </span>

              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap flex-1"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Badge pills */}
              {!isSidebarCollapsed && (item as any).badge && (
                <span
                  className="text-[8px] font-black px-1.5 py-0.5 rounded-full text-white shrink-0"
                  style={{ background: badgeColors[(item as any).badge] ?? badgeColors.NEW }}
                >
                  {(item as any).badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>


      {/* ── Bottom Section ── */}
      <div className="px-2 py-3 space-y-0.5" style={{ borderTop: '1px solid var(--border-color)' }}>
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
          style={{ color: 'var(--text-tertiary)' }}
          title={isSidebarCollapsed ? (isDarkMode ? 'Light Mode' : 'Dark Mode') : undefined}
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-yellow-400/10 transition-colors" style={{ color: isDarkMode ? '#fbbf24' : '#6366f1' }}>
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </span>
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden whitespace-nowrap text-left" style={{ color: 'var(--text-secondary)' }}>
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Settings */}
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
          style={{ color: 'var(--text-tertiary)' }}
          title={isSidebarCollapsed ? 'Settings' : undefined}
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-[rgba(0,229,255,0.08)] transition-colors">
            <Settings className="w-4 h-4" />
          </span>
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
          title={isSidebarCollapsed ? 'Logout' : undefined}
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-red-500/10 transition-colors text-red-500/70 group-hover:text-red-500">
            <LogOut className="w-4 h-4" />
          </span>
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden whitespace-nowrap text-left text-red-500/70 group-hover:text-red-500">
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl glass-card"
        style={{ color: 'var(--text-primary)' }}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[280px]"
            style={{ backgroundColor: 'var(--bg-card)', borderRight: '1px solid var(--border-color)' }}
          >
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? 72 : 260 }}
        transition={{ type: 'spring', damping: 25 }}
        className="hidden lg:block fixed left-0 top-0 bottom-0 z-30 overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRight: '1px solid var(--border-color)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
        }}
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}
