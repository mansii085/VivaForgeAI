import { useState, useEffect } from 'react';
import { Briefcase, AlertTriangle, FileText, CheckCircle2, ChevronRight, Target, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface Resume {
  _id: string;
  title: string;
  version: number;
}

interface MatchResult {
  overallMatch: number;
  skillMatch: {
    matched: string[];
    missing: string[];
    percentage: number;
  };
  experienceMatch: {
    score: number;
    feedback: string;
  };
  keywordAnalysis: {
    critical: { keyword: string; found: boolean; context?: string }[];
    important: { keyword: string; found: boolean; context?: string }[];
    niceToHave: { keyword: string; found: boolean; context?: string }[];
  };
  interviewDifficulty: {
    level: 'Easy' | 'Medium' | 'Hard' | 'Expert';
    score: number;
    reasoning: string;
  };
  tailoredSuggestions: string[];
  coverLetterPoints: string[];
}

export default function JDMatcherPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [roleName, setRoleName] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await api.get('/resumes');
      if (response.data.success) {
        setResumes(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedResumeId(response.data.data[0]._id);
        }
      }
    } catch (err: any) {
      toast.error('Failed to load resumes. Make sure you upload one first.');
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId || !jobDescription.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post('/jd-matcher/analyze', {
        resumeId: selectedResumeId,
        jobDescription,
        companyName,
        roleName,
      });

      if (response.data.success) {
        setResult(response.data.data.matchResult);
        toast.success('Analysis complete!');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze job description.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#43e97b'; // neon green
    if (score >= 60) return '#ff9900'; // neon orange
    return '#ff007f'; // neon pink
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 lg:p-8">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
        <div
          className="inline-flex p-4 rounded-2xl mb-2 animate-gradient"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <Target className="w-10 h-10 text-white" />
        </div>
        <h1
          className="text-4xl font-black gradient-text-purple"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}
        >
          JD MATCHER
        </h1>
        <p className="text-sm max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Precision targeting. Compare your resume against any job description to expose skill gaps and optimize for the ATS.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-6 md:p-8 border-2 border-purple-500/20 shadow-[0_0_30px_rgba(184,0,255,0.05)]"
          >
            <form onSubmit={handleAnalyze} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400 font-medium">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Metadata */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                      <Target className="w-3 h-3 inline mr-1 text-neon-purple" />
                      Select Target Resume
                    </label>
                    {resumes.length === 0 ? (
                      <div className="p-4 border-2 border-dashed border-slate-700 rounded-xl text-center text-sm text-slate-400">
                        You haven't uploaded any resumes yet.{' '}
                        <a href="/resumes" className="text-neon-cyan hover:underline">
                          Upload one now
                        </a>
                        .
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          value={selectedResumeId}
                          onChange={(e) => setSelectedResumeId(e.target.value)}
                          className="input-field w-full cursor-pointer appearance-none bg-slate-900/50"
                          required
                        >
                          {resumes.map((r) => (
                            <option key={r._id} value={r._id}>
                              {r.title} (v{r.version})
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                          <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                        Company Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="input-field w-full bg-slate-900/50"
                        placeholder="e.g. Google"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                        Target Role (Optional)
                      </label>
                      <input
                        type="text"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        className="input-field w-full bg-slate-900/50"
                        placeholder="e.g. Senior Frontend Engineer"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: JD Paste */}
                <div className="flex flex-col h-full">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                    <FileText className="w-3 h-3 inline mr-1 text-neon-cyan" />
                    Paste Job Description
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="input-field w-full flex-1 min-h-[250px] resize-none bg-slate-900/50 font-mono text-xs text-slate-300 p-4 leading-relaxed"
                    placeholder="Paste the full job description here..."
                    required
                  />
                </div>
              </div>

              <div className="flex justify-center pt-6 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={isAnalyzing || resumes.length === 0 || !jobDescription.trim()}
                  className="btn btn-primary min-w-[280px] py-4 text-base relative overflow-hidden group"
                  style={{ background: isAnalyzing ? 'var(--bg-secondary)' : 'var(--gradient-primary)' }}
                >
                  {isAnalyzing ? (
                    <span className="flex items-center justify-center gap-3 text-neon-cyan relative z-10">
                      <Crosshair className="w-5 h-5 animate-spin" /> Commencing Scan...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2 relative z-10">
                      <Target className="w-5 h-5" /> Analyze Match Target
                    </span>
                  )}
                  {/* Neon sweep effect on hover */}
                  {!isAnalyzing && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* ── Match Results HUD ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-8 flex flex-col items-center justify-center text-center space-y-4 border-t-4" style={{ borderTopColor: getScoreColor(result.overallMatch) }}>
                {/* Glowing Score Ring */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" className="stroke-slate-800" strokeWidth="8" fill="none" />
                    <motion.circle 
                      cx="80" cy="80" r="70" 
                      stroke={getScoreColor(result.overallMatch)} 
                      strokeWidth="8" fill="none"
                      strokeDasharray={440}
                      initial={{ strokeDashoffset: 440 }}
                      animate={{ strokeDashoffset: 440 - (440 * result.overallMatch) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      style={{ filter: `drop-shadow(0 0 10px ${getScoreColor(result.overallMatch)}80)` }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black" style={{ color: getScoreColor(result.overallMatch), fontFamily: 'var(--font-display)', textShadow: `0 0 20px ${getScoreColor(result.overallMatch)}60` }}>
                      {result.overallMatch}%
                    </span>
                  </div>
                </div>
                <div className="text-sm font-bold uppercase tracking-widest text-slate-300">Target Lock</div>
              </div>

              <div className="glass-card p-8 md:col-span-2 space-y-6">
                <h4 className="font-bold text-heading flex items-center gap-2 uppercase tracking-widest text-sm">
                  <Briefcase className="w-5 h-5 text-neon-purple" /> Threat Level Gauge
                </h4>
                <div className="flex justify-between text-sm font-black mb-2" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                  <span className="text-slate-300">{result.interviewDifficulty.level} INTERVIEW</span>
                  <span className="text-neon-cyan">{result.interviewDifficulty.score}/100</span>
                </div>
                {/* Neon segmented progress bar */}
                <div className="flex gap-1 h-3 w-full">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const threshold = (i + 1) * 5;
                    const isActive = result.interviewDifficulty.score >= threshold;
                    const color = result.interviewDifficulty.score > 75 ? '#ff007f' : result.interviewDifficulty.score > 40 ? '#ff9900' : '#43e97b';
                    return (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          backgroundColor: isActive ? color : 'rgba(255,255,255,0.05)',
                          boxShadow: isActive ? `0 0 8px ${color}80` : 'none'
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  {result.interviewDifficulty.reasoning}
                </p>
              </div>
            </div>

            {/* ── Skill Gap Analysis (Loot Drops) ────────────────────────── */}
            <div className="glass-card p-8">
              <h3 className="text-xl font-black text-heading mb-6 uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
                Inventory Check
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Matched Skills */}
                <div>
                  <h4 className="flex items-center gap-2 font-bold text-neon-green mb-4 text-sm uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Equipped Skills ({result.skillMatch.matched.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.skillMatch.matched.map((skill, i) => (
                      <motion.span 
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-neon-green border border-neon-green/30 bg-neon-green/10 shadow-[0_0_10px_rgba(67,233,123,0.15)]"
                      >
                        {skill}
                      </motion.span>
                    ))}
                    {result.skillMatch.matched.length === 0 && <span className="text-sm text-slate-500">No matching gear found.</span>}
                  </div>
                </div>

                {/* Missing Skills */}
                <div>
                  <h4 className="flex items-center gap-2 font-bold text-neon-pink mb-4 text-sm uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" /> Missing Gear ({result.skillMatch.missing.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.skillMatch.missing.map((skill, i) => (
                      <motion.span 
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-neon-pink border border-neon-pink/30 bg-neon-pink/10 shadow-[0_0_10px_rgba(255,0,127,0.15)]"
                      >
                        {skill}
                      </motion.span>
                    ))}
                    {result.skillMatch.missing.length === 0 && <span className="text-sm text-slate-500">Inventory complete!</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Tactical Advice ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6 border-l-4 border-l-neon-purple bg-gradient-to-r from-neon-purple/5 to-transparent">
                <h4 className="font-bold flex items-center gap-2 text-heading mb-4 uppercase tracking-widest text-sm">
                  <Target className="w-4 h-4 text-neon-purple" /> Tactical Suggestions
                </h4>
                <ul className="space-y-4">
                  {result.tailoredSuggestions.map((suggestion, i) => (
                    <motion.li 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 text-sm text-slate-300"
                    >
                      <ChevronRight className="w-4 h-4 text-neon-purple shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{suggestion}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-6 border-l-4 border-l-neon-cyan bg-gradient-to-r from-neon-cyan/5 to-transparent">
                <h4 className="font-bold flex items-center gap-2 text-heading mb-4 uppercase tracking-widest text-sm">
                  <FileText className="w-4 h-4 text-neon-cyan" /> Cover Letter Intel
                </h4>
                <ul className="space-y-4">
                  {result.coverLetterPoints.map((point, i) => (
                    <motion.li 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 text-sm text-slate-300"
                    >
                      <ChevronRight className="w-4 h-4 text-neon-cyan shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button onClick={() => setResult(null)} className="btn btn-secondary text-sm font-bold uppercase tracking-widest px-8 py-3">
                Change Target
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
