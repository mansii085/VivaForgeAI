import { useState } from 'react';
import { MessageSquare, Loader2, Play, CheckCircle2, ChevronRight, AlertTriangle, Target, Mic, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: string;
  userAnswer?: string;
  evaluation?: {
    score: number;
    strengths: string[];
    improvements: string[];
    idealAnswer: string;
  };
}

interface Interview {
  _id: string;
  status: 'in-progress' | 'completed';
  questions: InterviewQuestion[];
  overallScores?: {
    communication: number;
    technical: number;
    confidence: number;
    problemSolving: number;
    overallScore: number;
  };
  finalFeedback?: {
    summary: string;
    topStrengths: string[];
    areasToImprove: string[];
    recommendedResources: string[];
    readinessLevel: string;
  };
}

export default function MockInterviewPage() {
  const [activeInterview, setActiveInterview] = useState<Interview | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  // Setup State
  const [isStarting, setIsStarting] = useState(false);
  const [config, setConfig] = useState({
    company: '',
    role: '',
    experienceLevel: 'Mid',
    interviewType: 'Mixed',
    numberOfQuestions: 5,
  });

  // Flow State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.company.trim() || !config.role.trim()) return;

    setIsStarting(true);
    try {
      const res = await api.post('/interviews/start', config);
      if (res.data.success) {
        setActiveInterview(res.data.data);
        setCurrentQuestionIndex(0);
        setCurrentAnswer('');
        toast.success('Lobby initialized! Proceeding to interview room.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to start interview.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || !activeInterview) return;

    setIsSubmitting(true);
    try {
      const res = await api.post(`/interviews/${activeInterview._id}/answer`, {
        questionIndex: currentQuestionIndex,
        answer: currentAnswer,
      });

      if (res.data.success) {
        const updatedQuestions = [...activeInterview.questions];
        updatedQuestions[currentQuestionIndex] = res.data.data;
        setActiveInterview({ ...activeInterview, questions: updatedQuestions });
        toast.success('Target acquired. Answer evaluated!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to evaluate answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (activeInterview && currentQuestionIndex < activeInterview.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentAnswer('');
    }
  };

  const handleFinish = async () => {
    if (!activeInterview) return;
    
    setIsFinishing(true);
    try {
      const res = await api.post(`/interviews/${activeInterview._id}/finish`);
      if (res.data.success) {
        setActiveInterview(res.data.data);
        toast.success('Mission accomplished! Viewing scorecard.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate scorecard.');
    } finally {
      setIsFinishing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#43e97b';
    if (score >= 60) return '#ff9900';
    return '#ff007f';
  };

  // ── 1. SETUP PHASE (Lobby) ──────────────────────────────────────────────────
  if (!activeInterview) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 p-4 lg:p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
          <div
            className="inline-flex p-4 rounded-2xl mb-2 animate-gradient"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1
            className="text-4xl font-black gradient-text-pink"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}
          >
            INTERVIEW LOBBY
          </h1>
          <p className="text-sm max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Configure your match settings. The AI will simulate a realistic technical or behavioral screening.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 border-t-4 border-t-neon-pink shadow-[0_0_30px_rgba(255,0,127,0.05)]">
          <form onSubmit={handleStart} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Target Company</label>
                  <input
                    type="text" required value={config.company} onChange={(e) => setConfig({ ...config, company: e.target.value })}
                    placeholder="e.g. Meta, Stripe, Netflix"
                    className="input-field w-full bg-slate-900/50 border-slate-800 focus:border-neon-pink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Target Role</label>
                  <input
                    type="text" required value={config.role} onChange={(e) => setConfig({ ...config, role: e.target.value })}
                    placeholder="e.g. Backend Engineer"
                    className="input-field w-full bg-slate-900/50 border-slate-800 focus:border-neon-pink"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Experience</label>
                    <select
                      value={config.experienceLevel} onChange={(e) => setConfig({ ...config, experienceLevel: e.target.value })}
                      className="input-field w-full bg-slate-900/50 border-slate-800 focus:border-neon-pink"
                    >
                      {['Fresher', 'Junior', 'Mid', 'Senior', 'Lead'].map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Type</label>
                    <select
                      value={config.interviewType} onChange={(e) => setConfig({ ...config, interviewType: e.target.value })}
                      className="input-field w-full bg-slate-900/50 border-slate-800 focus:border-neon-pink"
                    >
                      {['Technical', 'Behavioral', 'System Design', 'HR', 'Mixed'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex justify-between">
                    <span>Match Length (Rounds)</span>
                    <span className="text-neon-pink">{config.numberOfQuestions}</span>
                  </label>
                  <input
                    type="range" min="1" max="10" value={config.numberOfQuestions}
                    onChange={(e) => setConfig({ ...config, numberOfQuestions: parseInt(e.target.value) })}
                    className="w-full h-2 appearance-none rounded-full outline-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #ff007f ${(config.numberOfQuestions / 10) * 100}%, rgba(255,255,255,0.08) ${(config.numberOfQuestions / 10) * 100}%)`,
                    }}
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isStarting} className="btn btn-primary w-full py-4 text-lg relative overflow-hidden group border-none" style={{ background: isStarting ? 'var(--bg-secondary)' : 'var(--gradient-primary)' }}>
              {isStarting ? (
                <span className="flex items-center justify-center gap-2 relative z-10"><Loader2 className="w-5 h-5 animate-spin" /> MATCHMAKING...</span>
              ) : (
                <span className="flex items-center justify-center gap-2 relative z-10 font-display tracking-widest font-black"><Play className="w-5 h-5 fill-current" /> READY UP</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ── 2. SCORECARD PHASE (Match Summary) ──────────────────────────────────────
  if (activeInterview.status === 'completed' && activeInterview.overallScores && activeInterview.finalFeedback) {
    const { overallScores, finalFeedback } = activeInterview;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-8 p-4 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-neon-cyan/20">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black font-display tracking-tight text-heading uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Match Summary</h2>
            <p className="text-sm text-neon-cyan mt-1 tracking-widest uppercase font-bold">{config.role} @ {config.company}</p>
          </div>
          <button onClick={() => setActiveInterview(null)} className="btn btn-secondary px-8 border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10">Return to Lobby</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-8 flex flex-col items-center justify-center text-center space-y-4 border-t-4" style={{ borderTopColor: getScoreColor(overallScores.overallScore) }}>
            <Trophy className="w-12 h-12 mb-2" style={{ color: getScoreColor(overallScores.overallScore), filter: `drop-shadow(0 0 10px ${getScoreColor(overallScores.overallScore)}80)` }} />
            <div className="text-7xl font-black font-display leading-none" style={{ color: getScoreColor(overallScores.overallScore), textShadow: `0 0 30px ${getScoreColor(overallScores.overallScore)}60` }}>
              {overallScores.overallScore}
            </div>
            <div className="font-bold text-slate-300 uppercase tracking-widest text-sm">Overall Score</div>
            <div className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: `${getScoreColor(overallScores.overallScore)}20`, color: getScoreColor(overallScores.overallScore) }}>
              Rank: {finalFeedback.readinessLevel}
            </div>
          </div>
          
          <div className="glass-card p-8 md:col-span-2 space-y-6">
            <h4 className="font-bold uppercase tracking-widest flex items-center gap-2 text-heading text-sm"><Target className="w-5 h-5 text-neon-cyan" /> Stats Breakdown</h4>
            <div className="space-y-5">
              {[
                { label: 'Technical Accuracy', score: overallScores.technical, color: '#00e5ff' },
                { label: 'Problem Solving', score: overallScores.problemSolving, color: '#ff007f' },
                { label: 'Communication', score: overallScores.communication, color: '#43e97b' },
                { label: 'Confidence', score: overallScores.confidence, color: '#ff9900' },
              ].map((dim) => (
                <div key={dim.label} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                    <span>{dim.label}</span>
                    <span style={{ color: dim.color }}>{dim.score}/100</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-900 rounded-full shadow-inner overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: dim.color, boxShadow: `0 0 10px ${dim.color}` }} initial={{ width: 0 }} animate={{ width: `${dim.score}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-8 border-l-4 border-l-neon-purple">
          <h4 className="font-bold uppercase tracking-widest text-heading text-sm mb-4">AAR (After Action Report)</h4>
          <p className="text-sm text-slate-300 leading-relaxed font-mono">{finalFeedback.summary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-8 bg-gradient-to-br from-neon-green/5 to-transparent border border-neon-green/20">
            <h4 className="font-bold text-neon-green flex items-center gap-2 uppercase tracking-widest text-sm mb-6"><CheckCircle2 className="w-5 h-5" /> Top Highlights</h4>
            <ul className="space-y-4">{finalFeedback.topStrengths.map((s, i) => (<motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={i} className="flex gap-3 text-sm text-slate-300"><ChevronRight className="w-5 h-5 text-neon-green shrink-0" /><span>{s}</span></motion.li>))}</ul>
          </div>
          <div className="glass-card p-8 bg-gradient-to-br from-neon-pink/5 to-transparent border border-neon-pink/20">
            <h4 className="font-bold text-neon-pink flex items-center gap-2 uppercase tracking-widest text-sm mb-6"><AlertTriangle className="w-5 h-5" /> Critical Vulnerabilities</h4>
            <ul className="space-y-4">{finalFeedback.areasToImprove.map((s, i) => (<motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={i} className="flex gap-3 text-sm text-slate-300"><ChevronRight className="w-5 h-5 text-neon-pink shrink-0" /><span>{s}</span></motion.li>))}</ul>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── 3. LIVE INTERVIEW PHASE ─────────────────────────────────────────────────
  const currentQ = activeInterview.questions[currentQuestionIndex];
  const isAnswered = !!currentQ.evaluation;
  const isLastQuestion = currentQuestionIndex === activeInterview.questions.length - 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 lg:p-8">
      <div className="flex items-center justify-between bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]" />
          <h2 className="text-lg font-black font-display text-heading uppercase tracking-widest">Live Feed</h2>
        </div>
        <div className="text-sm font-black px-4 py-1.5 bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan rounded-full font-display tracking-widest">
          ROUND {currentQuestionIndex + 1} / {activeInterview.questions.length}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentQuestionIndex} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="glass-card p-6 md:p-10 space-y-8 relative overflow-hidden">
          
          {/* Objective HUD */}
          <div className="space-y-4 relative z-10">
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded bg-neon-purple/20 text-neon-purple border border-neon-purple/50">{currentQ.category}</span>
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded bg-slate-500/20 text-slate-300 border border-slate-500/50">DIFFICULTY: {currentQ.difficulty}</span>
            </div>
            <div className="bg-slate-900/80 border-l-4 border-l-neon-cyan p-6 rounded-r-xl">
              <h3 className="text-xl md:text-2xl font-medium text-heading leading-relaxed font-mono">
                <span className="text-neon-cyan mr-2">{'>'}</span>{currentQ.question}
              </h3>
            </div>
          </div>

          {!isAnswered ? (
            <div className="space-y-4 relative z-10 pt-4">
              <div className="relative">
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your response or use voice input (simulated)..."
                  className="input-field w-full h-56 resize-none text-sm bg-slate-950/80 border-slate-700 focus:border-neon-cyan p-5 font-mono text-slate-300"
                />
                <button className="absolute bottom-4 right-4 p-3 rounded-full bg-slate-800 hover:bg-neon-cyan hover:text-black transition-colors text-slate-400">
                  <Mic className="w-5 h-5" />
                </button>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={handleSubmitAnswer} disabled={isSubmitting || !currentAnswer.trim()} className="btn btn-primary px-8 font-black tracking-widest uppercase">
                  {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Transmitting...</span> : 'Submit Response'}
                </button>
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 border-t border-slate-800 pt-8 relative z-10">
              
              <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Target className="w-24 h-24" /></div>
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Transmission Log</span>
                  <span className={`text-sm font-black font-display tracking-widest px-3 py-1 rounded bg-black ${currentQ.evaluation!.score > 70 ? 'text-neon-green border border-neon-green/30' : 'text-neon-pink border border-neon-pink/30'}`}>
                    SCORE: {currentQ.evaluation!.score}
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-mono italic leading-relaxed">"{currentQ.userAnswer}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-5 bg-neon-green/5 border-neon-green/20">
                  <span className="text-xs font-black uppercase tracking-widest text-neon-green flex items-center gap-2 mb-3"><CheckCircle2 className="w-4 h-4" /> Pros</span>
                  <ul className="text-sm text-slate-300 space-y-2">{currentQ.evaluation!.strengths.map((s, i) => <li key={i} className="flex gap-2"><span className="text-neon-green">■</span> {s}</li>)}</ul>
                </div>
                <div className="glass-card p-5 bg-neon-pink/5 border-neon-pink/20">
                  <span className="text-xs font-black uppercase tracking-widest text-neon-pink flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4" /> Cons</span>
                  <ul className="text-sm text-slate-300 space-y-2">{currentQ.evaluation!.improvements.map((s, i) => <li key={i} className="flex gap-2"><span className="text-neon-pink">■</span> {s}</li>)}</ul>
                </div>
              </div>

              <div className="p-6 bg-neon-cyan/5 rounded-xl border border-neon-cyan/20">
                <span className="text-xs font-black uppercase tracking-widest text-neon-cyan mb-2 block">Optimal Strategy (AI)</span>
                <p className="text-sm text-slate-300 leading-relaxed font-mono">{currentQ.evaluation!.idealAnswer}</p>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-800">
                {!isLastQuestion ? (
                  <button onClick={handleNextQuestion} className="btn btn-primary px-8 font-black uppercase tracking-widest group">
                    Next Round <ChevronRight className="w-5 h-5 ml-1 inline group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button onClick={handleFinish} disabled={isFinishing} className="btn btn-primary bg-neon-purple text-white hover:shadow-[0_0_20px_#b800ff] border-none px-8 font-black uppercase tracking-widest">
                    {isFinishing ? <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> : 'Complete Mission'}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
