import { useAuthStore } from '@/store/authStore';
import {
  Sparkles, FileText, Search, Briefcase, MessageSquare,
  BookOpen, Database, ArrowRight, Zap, Target,
  TrendingUp, Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

import { useDashboardQuery } from '../api';
import { Loader2 } from 'lucide-react';

const iconMap: Record<string, any> = {
  FileText,
  MessageSquare,
  Briefcase,
  BookOpen
};

// ── Container variants for stagger animation ──────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.5, ease: [0.34,1.56,0.64,1] as [number, number, number, number] } },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: dashboardData, isLoading, error } = useDashboardQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="p-4 rounded-full bg-red-500/10 text-red-500">
          <Target className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[var(--text-primary)]">Failed to load dashboard</h3>
        <p className="text-sm text-[var(--text-secondary)]">Please try refreshing the page.</p>
      </div>
    );
  }

  const skillData = [
    { skill: 'Resume',    score: dashboardData?.skillRadar?.resume || 0 },
    { skill: 'ATS',       score: dashboardData?.skillRadar?.ats || 0 },
    { skill: 'Interview', score: dashboardData?.skillRadar?.interview || 0 },
    { skill: 'JD Match',  score: dashboardData?.skillRadar?.jdMatch || 0 },
    { skill: 'Learning',  score: dashboardData?.skillRadar?.learning || 0 },
    { skill: 'Research',  score: dashboardData?.skillRadar?.research || 0 },
  ];

  const overallCareerScore = Math.round(
    ((skillData[0]?.score || 0) + (skillData[2]?.score || 0) + (skillData[3]?.score || 0) + (skillData[4]?.score || 0)) / 4
  );

  const stats = [
    { label: 'ATS Score',   value: dashboardData?.stats?.atsScore !== null && dashboardData?.stats?.atsScore !== undefined ? `${dashboardData.stats.atsScore}%` : 'N/A', icon: Target,   colorClass: 'stat-card-cyan',   color: '#00e5ff', trend: dashboardData?.stats?.atsScore !== null && dashboardData?.stats?.atsScore !== undefined ? 'Analyzed' : 'Pending' },
    { label: 'Interviews',  value: (dashboardData?.stats?.interviewCount || 0).toString(),  icon: MessageSquare, colorClass: 'stat-card-pink',   color: '#ff007f', trend: (dashboardData?.stats?.interviewCount || 0) > 0 ? 'Active' : 'No data yet' },
    { label: 'Resume Completion',  value: `${dashboardData?.stats?.resumeCompletion || 0}%`,  icon: FileText,    colorClass: 'stat-card-orange', color: '#ff6b00', trend: (dashboardData?.stats?.resumeCompletion || 0) > 0 ? 'In Progress' : 'Pending' },
    { label: 'Learning Progress',   value: `${dashboardData?.stats?.learningProgress || 0}%`, icon: BookOpen,      colorClass: 'stat-card-purple', color: '#b800ff', trend: (dashboardData?.stats?.learningProgress || 0) > 0 ? 'Active' : 'Not Started' },
  ];

  const quickActions = [
    {
      name: 'Resume Manager',
      description: 'Upload, polish & version-control your professional resumes.',
      icon: FileText,
      href: '/resumes',
      gradient: 'var(--card-resume)',
      badge: 'NEW',
      badgeColor: 'linear-gradient(135deg,#00e5ff,#0077ff)',
      stat: `${dashboardData.quickActionsData?.resumeCount || 0} Resumes`,
    },
    {
      name: 'ATS Analyzer',
      description: 'Beat ATS algorithms. Get an instant resume compatibility score.',
      icon: Search,
      href: '/ats-analyzer',
      gradient: 'var(--card-ats)',
      badge: 'HOT',
      badgeColor: 'linear-gradient(135deg,#ff4500,#ff007f)',
      stat: dashboardData?.stats?.atsScore !== null && dashboardData?.stats?.atsScore !== undefined ? `${dashboardData.stats.atsScore}% Score` : 'N/A',
    },
    {
      name: 'JD Matcher',
      description: 'Paste any job description & see how well your resume fits.',
      icon: Briefcase,
      href: '/jd-matcher',
      gradient: 'var(--card-jd)',
      badge: null,
      badgeColor: '',
      stat: `${dashboardData.quickActionsData?.avgJdMatchScore || 0}% Match`,
    },
    {
      name: 'Mock Interview',
      description: 'AI-powered voice & text interviews that feel like the real thing.',
      icon: MessageSquare,
      href: '/mock-interview',
      gradient: 'var(--card-interview)',
      badge: 'AI',
      badgeColor: 'linear-gradient(135deg,#a18cd1,#b800ff)',
      stat: `${dashboardData.quickActionsData?.interviewCount || 0} Sessions`,
    },
    {
      name: 'Learning Paths',
      description: 'Daily study roadmaps crafted for your target role & skill gaps.',
      icon: BookOpen,
      href: '/learning',
      gradient: 'var(--card-learning)',
      badge: null,
      badgeColor: '',
      stat: `${dashboardData.quickActionsData?.learningProgress || 0}% Done`,
    },
    {
      name: 'Knowledge Base',
      description: 'Upload docs & query them with AI — your personal research engine.',
      icon: Database,
      href: '/rag',
      gradient: 'var(--card-rag)',
      badge: null,
      badgeColor: '',
      stat: `${dashboardData.quickActionsData?.ragDocCount || 0} Docs`,
    },
  ];

  return (
    <div className="space-y-8">

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* HERO BANNER — Myntra / PUBG lobby style                       */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="hero-banner scanlines p-8 md:p-10 relative overflow-hidden"
        style={{ minHeight: 220 }}
      >
        {/* Grid overlay */}
        <div className="hero-banner-grid" />

        {/* Floating orbs */}
        <div className="absolute top-6 right-8 w-64 h-64 rounded-full opacity-20 blur-3xl animate-float"
          style={{ background: 'radial-gradient(circle, #00e5ff, transparent)', animationDelay: '0s' }} />
        <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full opacity-15 blur-3xl animate-float"
          style={{ background: 'radial-gradient(circle, #ff007f, transparent)', animationDelay: '2s' }} />
        <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full opacity-15 blur-2xl animate-float"
          style={{ background: 'radial-gradient(circle, #b800ff, transparent)', animationDelay: '4s' }} />

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <span key={i} className="particle" style={{
            left: `${10 + i * 8}%`,
            top: `${20 + (i % 4) * 20}%`,
            '--dur': `${6 + (i % 4)}s`,
            '--delay': `${i * 0.5}s`,
            background: i % 3 === 0 ? '#00e5ff' : i % 3 === 1 ? '#ff007f' : '#b800ff',
          } as React.CSSProperties} />
        ))}

        {/* Content */}
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
            style={{
              background: 'rgba(0,229,255,0.12)',
              border: '1px solid rgba(0,229,255,0.35)',
              color: '#00e5ff',
              textShadow: '0 0 8px rgba(0,229,255,0.6)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-POWERED CAREER PREPARATION PLATFORM
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl font-black mb-3 leading-tight"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}
          >
            <span style={{ color: 'rgba(255,255,255,0.95)' }}>Welcome back,</span>
            <br />
            <span className="gradient-text">{user?.name ?? 'Champion'}</span>
            <span style={{ color: 'rgba(255,255,255,0.95)' }}>! 👋</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm md:text-base leading-relaxed mb-6"
            style={{ color: 'rgba(148,163,184,0.9)', maxWidth: 480 }}
          >
            Everything you need to prepare for your next opportunity—
            AI mock interviews, ATS resume analysis, job description matching,
            and personalized learning, all in one intelligent platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-3"
          >
            <Link to="/ats-analyzer" className="btn btn-primary py-2.5 px-5 text-sm">
              <Zap className="w-4 h-4" />
              Analyze Resume
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/mock-interview" className="btn btn-neon py-2.5 px-5 text-sm">
              <MessageSquare className="w-4 h-4" />
              Start Interview
            </Link>
          </motion.div>
        </div>

        {/* Right decoration — skill score circle */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-2">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" className="skill-ring-track" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="42"
                className="skill-ring-fill"
                strokeWidth="8"
                stroke="url(#heroGrad)"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - 0.87) }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.8 }}
              />
              <defs>
                <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00e5ff" />
                  <stop offset="100%" stopColor="#b800ff" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{dashboardData?.stats?.atsScore !== null && dashboardData?.stats?.atsScore !== undefined ? `${dashboardData.stats.atsScore}%` : 'N/A'}</span>
              <span className="text-[9px] font-bold text-neon-cyan">ATS SCORE</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* HUD STATS ROW                                                  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((s) => (
          <motion.div key={s.label} variants={cardVariants} className={`stat-card ${s.colorClass}`}>
            <div className="flex items-start justify-between mb-3">
              <div
                className="p-2 rounded-xl"
                style={{ background: `${s.color}18`, color: s.color }}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${s.color}15`, color: s.color }}>
                {s.trend}
              </span>
            </div>
            <div className="text-3xl font-black mb-0.5" style={{ color: s.color, fontFamily: 'var(--font-display)', textShadow: `0 0 20px ${s.color}50` }}>
              {s.value}
            </div>
            <div className="text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* QUICK ACTION GRID — Amazon/Flipkart product card style         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', letterSpacing: '0.03em' }}>
            🎮 AI TOOLS
            <span className="ml-2 text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>— Your Career Arsenal</span>
          </h2>
          <span className="text-xs font-bold text-neon-cyan px-3 py-1 rounded-full shrink-0" style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.25)' }}>
            6 TOOLS
          </span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {quickActions.map((action) => (
            <motion.div key={action.name} variants={cardVariants}>
              <Link to={action.href} className="product-card block">
                {/* Gradient icon header */}
                <div className="product-card-icon" style={{ background: action.gradient }}>
                  {/* Badge */}
                  {action.badge && (
                    <span
                      className="neon-badge"
                      style={{ background: action.badgeColor }}
                    >
                      {action.badge}
                    </span>
                  )}
                  {/* Decorative circles */}
                  <div className="absolute top-2 left-2 w-16 h-16 rounded-full opacity-20 blur-xl bg-white" />
                  <div className="absolute bottom-0 right-2 w-24 h-24 rounded-full opacity-10 blur-2xl bg-white" />
                  <action.icon className="w-12 h-12 text-white relative z-10 drop-shadow-lg" strokeWidth={1.5} />
                </div>

                {/* Card body */}
                <div className="p-5 space-y-2" style={{ background: 'var(--bg-card)' }}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                      {action.name}
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,229,255,0.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' }}>
                      {action.stat}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {action.description}
                  </p>
                  <div className="flex items-center gap-1 pt-1 text-xs font-semibold" style={{ color: '#00e5ff' }}>
                    Open Tool <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SKILL RADAR + ACHIEVEMENTS ROW                                 */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Skill Radar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card lg:col-span-2 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-neon-cyan" />
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Skill Radar
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={skillData} margin={{ top: 0, right: 24, bottom: 0, left: 24 }}>
              <PolarGrid stroke="rgba(0,229,255,0.1)" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fill: 'rgba(148,163,184,0.8)', fontSize: 10, fontWeight: 600 }}
              />
              <Radar
                name="Skills"
                dataKey="score"
                stroke="#00e5ff"
                fill="#00e5ff"
                fillOpacity={0.15}
                strokeWidth={2}
                dot={{ fill: '#00e5ff', r: 3 }}
              />
            </RadarChart>
          </ResponsiveContainer>
          <p className="text-center text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
            Overall Career Score: <span className="text-neon-cyan font-bold">{overallCareerScore}%</span>
          </p>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card lg:col-span-3 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-neon-gold" />
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Recent Activity
              </h3>
            </div>
          </div>

          {(!dashboardData?.recentActivity || dashboardData.recentActivity.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-32 rounded-xl" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
               <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>No recent activity yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity, i) => {
                const Icon = iconMap[activity.icon] || FileText;
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="p-2 rounded-lg" style={{ background: 'rgba(0,229,255,0.1)', color: '#00e5ff' }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{activity.title}</h4>
                      <p className="text-xs text-[var(--text-tertiary)]">{activity.description}</p>
                      <p className="text-[10px] mt-1 text-[var(--text-secondary)]">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Skill progress bars */}
          <div className="mt-5 space-y-2.5">
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
              <Star className="w-3.5 h-3.5 inline mr-1 text-neon-gold" />
              Skill Breakdown
            </p>
            {[
              { name: 'Resume Writing', pct: dashboardData?.stats?.resumeCompletion || 0, color: '#667eea' },
              { name: 'Interview Skills', pct: dashboardData?.stats?.avgInterviewScore || 0, color: '#00e5ff' },
              { name: 'Technical Knowledge', pct: dashboardData?.stats?.learningProgress || 0, color: '#43e97b' },
            ].map((sk) => (
              <div key={sk.name}>
                <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--text-tertiary)' }}>
                  <span>{sk.name}</span>
                  <span className="font-bold" style={{ color: sk.color }}>{sk.pct}%</span>
                </div>
                <div className="skill-bar-track">
                  <motion.div
                    className="skill-bar-fill"
                    style={{ background: `linear-gradient(90deg, ${sk.color}, ${sk.color}cc)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${sk.pct}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.8 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
