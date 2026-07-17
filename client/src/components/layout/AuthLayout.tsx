import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, MessageSquare, BookOpen, TrendingUp } from 'lucide-react';

const features = [
  { icon: Target,        label: 'ATS Scoring',      desc: 'Beat the bots',       color: '#00e5ff', delay: 0.0 },
  { icon: MessageSquare, label: 'Mock Interviews',   desc: 'AI-powered practice', color: '#ff007f', delay: 0.1 },
  { icon: BookOpen,      label: 'Learning Paths',    desc: 'Skill roadmaps',      color: '#43e97b', delay: 0.2 },
  { icon: TrendingUp,    label: 'JD Matching',       desc: 'Smart job fit',       color: '#b800ff', delay: 0.3 },
];

// 20 random particles
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left:  `${5 + (i * 4.7) % 90}%`,
  top:   `${5 + (i * 7.3) % 85}%`,
  size:  i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1.5,
  color: i % 4 === 0 ? '#00e5ff' : i % 4 === 1 ? '#ff007f' : i % 4 === 2 ? '#b800ff' : '#ffd700',
  dur:   `${5 + (i % 5)}s`,
  delay: `${(i * 0.4) % 4}s`,
}));

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* ── Global Animated Backgrounds ─────────────────────── */}
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, #0a0619 0%, #0b1424 40%, #060b14 100%)',
        }}
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0 z-0 opacity-50"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,229,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 100%)',
        }}
      />

      {/* Ambient neon orbs */}
      <div className="absolute top-16 left-12 w-80 h-80 rounded-full blur-3xl opacity-20 animate-float z-0"
        style={{ background: 'radial-gradient(circle, #00e5ff, transparent)', animationDelay: '0s' }} />
      <div className="absolute bottom-16 right-8 w-96 h-96 rounded-full blur-3xl opacity-15 animate-float z-0"
        style={{ background: 'radial-gradient(circle, #ff007f, transparent)', animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-10 animate-float z-0"
        style={{ background: 'radial-gradient(circle, #b800ff, transparent)', animationDelay: '1.5s' }} />

      {/* Floating particles */}
      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full pointer-events-none z-0"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
          }}
          animate={{ y: [0, -40, 0], opacity: [0.4, 1, 0.4], scale: [1, 1.5, 1] }}
          transition={{ duration: parseFloat(p.dur), delay: parseFloat(p.delay), repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* ── Left Panel — Gaming / Neon Brand ─────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center z-10">
        {/* Main content */}
        <div className="relative z-10 text-center max-w-md px-8">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.1, stiffness: 120 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-6 relative"
          >
            <img src="/logo.svg" alt="VivaForgeAI Logo" className="w-20 h-20 drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]" />
            {/* Ping ring */}
            <motion.span
              className="absolute inset-0 rounded-3xl"
              style={{ border: '2px solid rgba(0,229,255,0.3)' }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-black mb-2 gradient-text animate-neon-flicker"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}
          >
            VivaForgeAI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm mb-6"
            style={{ color: 'rgba(148,163,184,0.85)' }}
          >
            Prepare Smarter. Interview Better. Get Hired Faster.
          </motion.p>

          {/* Horizontal neon line */}
          <hr className="neon-divider my-4" />

          {/* Feature cards grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-2 mt-2"
          >
            {features.map((f) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + f.delay }}
                className="rounded-2xl p-3 text-left backdrop-blur-sm"
                style={{
                  background: `${f.color}10`,
                  border: `1px solid ${f.color}28`,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded-lg" style={{ background: `${f.color}20`, color: f.color }}>
                    <f.icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold" style={{ color: f.color }}>{f.label}</span>
                </div>
                <p className="text-[10px]" style={{ color: 'rgba(148,163,184,0.7)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Right Panel — Form ───────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md relative z-10"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
