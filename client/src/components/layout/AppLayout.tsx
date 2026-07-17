import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/store/authStore';


export default function AppLayout() {
  const { isSidebarCollapsed } = useAuthStore();

  return (
    <div className="min-h-screen bg-mesh relative">

      {/* ── Floating decorative orbs (behind everything) ─────────── */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: '20%', right: '8%',
          width: 300, height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(184,0,255,0.08), transparent)',
          filter: 'blur(60px)',
          animation: 'orb-drift-1 20s ease-in-out infinite',
        }}
      />
      <div
        className="fixed pointer-events-none z-0"
        style={{
          bottom: '10%', left: '15%',
          width: 250, height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,229,255,0.07), transparent)',
          filter: 'blur(60px)',
          animation: 'orb-drift-2 25s ease-in-out infinite',
        }}
      />

      <Sidebar />

      {/* ── Top notification banner (Myntra flash sale style) ─────── */}
      {/* <div
        className={`fixed top-0 right-0 z-20 flex items-center justify-between gap-3 px-5 py-2 text-xs top-banner-offset ${isSidebarCollapsed ? 'is-collapsed' : ''}`}
        style={{
          background: 'linear-gradient(90deg, rgba(0,229,255,0.08), rgba(184,0,255,0.06), rgba(255,0,127,0.06))',
          borderBottom: '1px solid rgba(0,229,255,0.1)',
        }}
      >
        <div className="flex items-center gap-2" style={{ color: 'rgba(148,163,184,0.8)' }}>
          <Sparkles className="w-3 h-3 text-neon-cyan" />
          <span>AI-powered career acceleration — your personal copilot is ready</span>
        </div>
        <Link to="/ats-analyzer" className="flex items-center gap-1 font-bold text-neon-cyan hover:opacity-80 transition-opacity">
          <Zap className="w-3 h-3" />
          Analyze Resume →
        </Link>
      </div> */}

      {/* ── Main content ──────────────────────────────────────────── */}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={`min-h-screen main-content-layout relative z-10 ${isSidebarCollapsed ? 'is-collapsed' : ''}`}
        style={{ paddingTop: 0 }} // space for top banner
      >
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}
