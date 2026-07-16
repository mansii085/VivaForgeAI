import { useState, useEffect } from 'react';
import { BookOpen, Loader2, Play, CheckCircle2, ChevronDown, ChevronUp, Link as LinkIcon, Zap, Star, Trophy, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface Resource {
  title: string;
  url: string;
  type: string;
}
interface Topic {
  name: string;
  description: string;
  resources: Resource[];
  estimatedHours: number;
  day: number;
  isCompleted: boolean;
}
interface WeekPlan {
  week: number;
  theme: string;
  topics: Topic[];
}
interface Roadmap {
  _id: string;
  goal: string;
  targetRole: string;
  duration: number;
  roadmap: WeekPlan[];
  progress: {
    completedTopics: number;
    totalTopics: number;
    currentWeek: number;
  };
}

// ── Skill Ring SVG component ───────────────────────────────────────────
function SkillRing({ label, pct, color, size = 80 }: { label: string; pct: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2} cy={size / 2} r={r}
            className="skill-ring-track"
            strokeWidth={7}
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            className="skill-ring-fill"
            strokeWidth={7}
            stroke={color}
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>
        <div
          style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
          <span style={{ fontSize: 16, fontWeight: 900, color, textShadow: `0 0 8px ${color}60`, lineHeight: 1 }}>
            {pct}%
          </span>
        </div>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textAlign: 'center', maxWidth: size, lineHeight: 1.2 }}>
        {label}
      </span>
    </div>
  );
}

// ── Difficulty stars ───────────────────────────────────────────────────
function DifficultyStars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="w-2.5 h-2.5"
          style={{ color: i <= count ? '#ffd700' : 'rgba(255,255,255,0.1)', fill: i <= count ? '#ffd700' : 'none' }}
        />
      ))}
    </div>
  );
}

const skillRings = [
  { label: 'Frontend',  pct: 85, color: '#00e5ff' },
  { label: 'Backend',   pct: 60, color: '#ff007f' },
  { label: 'System Design', pct: 45, color: '#b800ff' },
  { label: 'Algorithms', pct: 70, color: '#43e97b' },
  { label: 'DevOps',    pct: 30, color: '#ff9900' },
];

export default function LearningPage() {
  const [_roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [expandedWeek, setExpandedWeek] = useState<number>(1);

  useEffect(() => { fetchRoadmaps(); }, []);

  const fetchRoadmaps = async () => {
    try {
      const res = await api.get('/learning');
      if (res.data.success && res.data.data.length > 0) {
        setRoadmaps(res.data.data);
        fetchRoadmapDetails(res.data.data[0]._id);
      }
    } catch (err) { console.error(err); }
  };

  const fetchRoadmapDetails = async (id: string) => {
    try {
      const res = await api.get(`/learning/${id}`);
      if (res.data.success) {
        setActiveRoadmap(res.data.data);
        setExpandedWeek(res.data.data.progress.currentWeek || 1);
      }
    } catch { toast.error('Failed to load roadmap details'); }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim() || !currentSkills.trim()) return;
    setIsGenerating(true);
    try {
      const skillsArray = currentSkills.split(',').map(s => s.trim()).filter(s => s);
      const res = await api.post('/learning/generate', { targetRole, currentSkills: skillsArray, durationWeeks });
      if (res.data.success) {
        setActiveRoadmap(res.data.data);
        setExpandedWeek(1);
        toast.success('🎮 Roadmap unlocked!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate roadmap.');
    } finally { setIsGenerating(false); }
  };

  const handleToggleTopic = async (weekIndex: number, topicIndex: number) => {
    if (!activeRoadmap) return;
    const updatedRoadmap = { ...activeRoadmap };
    const topic = updatedRoadmap.roadmap[weekIndex].topics[topicIndex];
    const isCompleting = !topic.isCompleted;
    topic.isCompleted = isCompleting;
    updatedRoadmap.progress.completedTopics += isCompleting ? 1 : -1;
    setActiveRoadmap(updatedRoadmap);
    if (isCompleting) toast.success('Topic completed!', { icon: '✅' });
    try {
      await api.patch(`/learning/${activeRoadmap._id}/toggle`, { weekIndex, topicIndex });
    } catch {
      toast.error('Failed to sync progress.');
      fetchRoadmapDetails(activeRoadmap._id);
    }
  };

  // ── SETUP PHASE ──────────────────────────────────────────────────────
  if (!activeRoadmap) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 p-4 lg:p-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
          <div
            className="inline-flex p-4 rounded-2xl mb-2 animate-gradient"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1
            className="text-4xl font-black gradient-text"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}
          >
            LEARNING ARENA
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Generate a custom AI-powered roadmap and level up your career skills.
          </p>
        </motion.div>

        {/* Skill rings preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-secondary)' }}>
            <Target className="w-4 h-4 inline mr-1 text-neon-cyan" />
            YOUR CURRENT SKILL PROFILE
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            {skillRings.map((sk, i) => (
              <motion.div
                key={sk.label}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 200 }}
              >
                <SkillRing {...sk} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Generate form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-8"
          style={{ border: '1px solid rgba(0,229,255,0.2)' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl animate-gradient" style={{ background: 'var(--gradient-primary)' }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-black text-lg" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                GENERATE YOUR ROADMAP
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>AI will craft a personalized week-by-week plan</p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
                🎯 Target Role
              </label>
              <input
                type="text" required value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Developer, Data Scientist"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
                ⚡ Current Skills (comma separated)
              </label>
              <input
                type="text" required value={currentSkills}
                onChange={e => setCurrentSkills(e.target.value)}
                placeholder="e.g. HTML, CSS, basic JavaScript, Python"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
                <span className="flex justify-between items-center">
                  <span>📅 Duration</span>
                  <span className="gradient-text-cyan font-black">{durationWeeks} WEEKS</span>
                </span>
              </label>
              {/* Custom range slider */}
              <div className="relative">
                <input
                  type="range" min="2" max="12" value={durationWeeks}
                  onChange={e => setDurationWeeks(parseInt(e.target.value))}
                  className="w-full h-2 appearance-none rounded-full outline-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #00e5ff ${((durationWeeks - 2) / 10) * 100}%, rgba(255,255,255,0.08) ${((durationWeeks - 2) / 10) * 100}%)`,
                    accentColor: '#00e5ff',
                  }}
                />
                <div className="flex justify-between mt-2">
                  {[2, 4, 6, 8, 10, 12].map(w => (
                    <span key={w} className="text-[9px]" style={{ color: w === durationWeeks ? '#00e5ff' : 'var(--text-tertiary)', fontWeight: w === durationWeeks ? 800 : 400 }}>
                      {w}w
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="btn btn-primary w-full py-4 text-base"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating your roadmap...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Generate Roadmap
                  <Zap className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ── ACTIVE ROADMAP ───────────────────────────────────────────────────
  const progressPercent = Math.round(
    (activeRoadmap.progress.completedTopics / activeRoadmap.progress.totalTopics) * 100
  ) || 0;


  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 lg:p-6">

      {/* ── Roadmap Hero Header ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl relative overflow-hidden p-6 md:p-8"
        style={{
          background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
          border: '1px solid rgba(0,229,255,0.2)',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 animate-float"
          style={{ background: 'radial-gradient(circle, #00e5ff, transparent)' }} />

        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full text-neon-cyan"
                style={{ background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.3)' }}>
                📚 ACTIVE ROADMAP
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black" style={{ color: 'white', fontFamily: 'var(--font-display)' }}>
              {activeRoadmap.goal}
            </h2>
            <p className="text-sm" style={{ color: 'rgba(148,163,184,0.8)' }}>
              Target: <span className="text-neon-cyan font-semibold">{activeRoadmap.targetRole}</span>
              {' '}•{' '}<span style={{ color: 'rgba(255,255,255,0.7)' }}>{activeRoadmap.duration}-Week Plan</span>
            </p>

            {/* Progress bar */}
            <div className="pt-2">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <Target className="w-3.5 h-3.5 text-neon-cyan" /> Overall Progress
                </span>
                <span className="font-black text-neon-cyan">{progressPercent}%</span>
              </div>
              <div className="skill-bar-track" style={{ height: 8, background: 'rgba(255,255,255,0.1)' }}>
                <motion.div
                  className="skill-bar-fill"
                  style={{ background: '#00e5ff' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.4, ease: 'easeOut', delay: 0.4 }}
                />
              </div>
            </div>
          </div>

          {/* Stats orbs */}
          <div className="flex gap-3 shrink-0">
            <div className="text-center px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.25)' }}>
              <div className="text-2xl font-black text-neon-cyan" style={{ fontFamily: 'var(--font-display)' }}>
                {activeRoadmap.progress.completedTopics}/{activeRoadmap.progress.totalTopics}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: 'rgba(148,163,184,0.7)' }}>
                Topics
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Skill Rings Row ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-neon-gold" />
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
            SKILL MASTERY
          </h3>
        </div>
        <div className="flex flex-wrap justify-center gap-5">
          {skillRings.map((sk, i) => (
            <motion.div
              key={sk.label}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 180 }}
            >
              <SkillRing {...sk} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Quest Week Cards ────────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
          🗺️ WEEKLY QUESTS
        </h3>
        {activeRoadmap.roadmap.map((weekPlan, wIndex) => {
          const isExpanded = expandedWeek === weekPlan.week;
          const completedInWeek = weekPlan.topics.filter(t => t.isCompleted).length;
          const allDone = completedInWeek === weekPlan.topics.length;
          const weekPct = Math.round((completedInWeek / weekPlan.topics.length) * 100);
          const difficulty = Math.min(5, Math.max(1, Math.round(weekPlan.week * 0.6)));

          return (
            <motion.div
              key={weekPlan.week}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: wIndex * 0.06 }}
              className={`quest-card ${allDone ? 'completed' : ''}`}
            >
              <button
                onClick={() => setExpandedWeek(isExpanded ? -1 : weekPlan.week)}
                className="w-full flex items-center justify-between p-4 md:p-5 text-left transition-colors"
                style={{ background: 'transparent' }}
              >
                <div className="flex items-center gap-3">
                  {/* Week badge */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                    style={{
                      background: allDone ? 'rgba(67,233,123,0.15)' : 'rgba(0,229,255,0.1)',
                      border: `1px solid ${allDone ? 'rgba(67,233,123,0.35)' : 'rgba(0,229,255,0.25)'}`,
                      color: allDone ? '#43e97b' : '#00e5ff',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {allDone ? '✓' : `W${weekPlan.week}`}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {weekPlan.theme}
                    </h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                        {completedInWeek}/{weekPlan.topics.length} topics
                      </span>
                      <DifficultyStars count={difficulty} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Mini progress ring */}
                  <div style={{ position: 'relative', width: 36, height: 36 }}>
                    <svg width="36" height="36" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="13" className="skill-ring-track" strokeWidth="3.5" />
                      <circle
                        cx="18" cy="18" r="13"
                        className="skill-ring-fill"
                        strokeWidth="3.5"
                        stroke={allDone ? '#43e97b' : '#00e5ff'}
                        strokeDasharray={2 * Math.PI * 13}
                        strokeDashoffset={2 * Math.PI * 13 * (1 - weekPct / 100)}
                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 8, fontWeight: 900, color: allDone ? '#43e97b' : '#00e5ff' }}>{weekPct}%</span>
                    </div>
                  </div>
                  {isExpanded
                    ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                    : <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />}
                </div>
              </button>

              {/* Expanded topics */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ borderTop: '1px solid rgba(0,229,255,0.1)', overflow: 'hidden' }}
                  >
                    <div className="p-4 space-y-3" style={{ background: 'rgba(0,0,0,0.15)' }}>
                      {weekPlan.topics.map((topic, tIndex) => (
                        <motion.div
                          key={tIndex}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: tIndex * 0.05 }}
                          className="rounded-xl p-3.5 transition-all"
                          style={{
                            background: topic.isCompleted
                              ? 'rgba(67,233,123,0.05)'
                              : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${topic.isCompleted ? 'rgba(67,233,123,0.2)' : 'rgba(255,255,255,0.06)'}`,
                          }}
                        >
                          <div className="flex gap-3">
                            {/* Toggle button */}
                            <button
                              onClick={() => handleToggleTopic(wIndex, tIndex)}
                              className="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all"
                              style={{
                                background: topic.isCompleted ? '#43e97b' : 'transparent',
                                borderColor: topic.isCompleted ? '#43e97b' : 'rgba(0,229,255,0.3)',
                                color: 'white',
                                boxShadow: topic.isCompleted ? '0 0 10px rgba(67,233,123,0.4)' : 'none',
                              }}
                            >
                              {topic.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>

                            <div className="flex-1 space-y-1.5">
                              <div className="flex justify-between items-start gap-2">
                                <h4
                                  className="font-semibold text-sm"
                                  style={{
                                    color: topic.isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)',
                                    textDecoration: topic.isCompleted ? 'line-through' : 'none',
                                  }}
                                >
                                  {topic.name}
                                </h4>
                                <span
                                  className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
                                  style={{ background: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.18)' }}
                                >
                                  Day {topic.day} · {topic.estimatedHours}h
                                </span>
                              </div>
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                {topic.description}
                              </p>
                              {topic.resources?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {topic.resources.map((res, rIndex) => (
                                    <a
                                      key={rIndex}
                                      href={res.url} target="_blank" rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors"
                                      style={{ background: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.18)' }}
                                    >
                                      <LinkIcon className="w-2.5 h-2.5" />
                                      {res.title}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Reset link */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => setActiveRoadmap(null)}
          className="text-xs font-semibold transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Generate a new roadmap →
        </button>
      </div>
    </div>
  );
}
