// import { useState } from 'react';
// import { Search, UploadCloud, CheckCircle2, AlertTriangle, Zap, Target } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import api from '@/lib/api';

// interface AtsAnalysisResult {
//   overallScore: number;
//   breakdown: { label: string; score: number }[];
//   improvements: { type: 'success' | 'warning'; title: string; description: string }[];
// }

// export default function ATSAnalyzerPage() {
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [analysisResult, setAnalysisResult] = useState<AtsAnalysisResult | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files || e.target.files.length === 0) return;
//     const file = e.target.files[0];
    
//     setIsAnalyzing(true);
//     setError(null);
    
//     try {
//       const formData = new FormData();
//       formData.append('resume', file);
      
//       const response = await api.post('/ats/analyze', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
      
//       if (response.data.success) {
//         setAnalysisResult(response.data.data);
//       } else {
//         throw new Error('Analysis failed');
//       }
//     } catch (err: any) {
//       console.error('ATS Analysis error:', err);
//       setError(err.response?.data?.error || 'Failed to analyze resume. Please try again.');
//     } finally {
//       setIsAnalyzing(false);
//       e.target.value = '';
//     }
//   };

//   const getScoreColor = (score: number) => {
//     if (score >= 80) return '#43e97b'; // neon green
//     if (score >= 60) return '#ff9900'; // neon orange
//     return '#ff007f'; // neon pink
//   };

//   return (
//     <div className="max-w-5xl mx-auto space-y-8 p-4 lg:p-8">
//       {/* ── Header ──────────────────────────────────────────────────────── */}
//       <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
//         <div
//           className="inline-flex p-4 rounded-2xl mb-2 animate-gradient"
//           style={{ background: 'var(--gradient-primary)' }}
//         >
//           <Search className="w-10 h-10 text-white" />
//         </div>
//         <h1
//           className="text-4xl font-black gradient-text"
//           style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}
//         >
//           ATS ANALYZER
//         </h1>
//         <p className="text-sm max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
//           Beat the bots. Scan your resume against industry benchmarks and receive actionable optimization advice using Gemini AI.
//         </p>
//       </motion.div>

//       {error && (
//         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
//           <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
//           <p className="text-sm text-red-400 font-medium">{error}</p>
//         </motion.div>
//       )}

//       <AnimatePresence mode="wait">
//         {!analysisResult ? (
//           <motion.div 
//             key="upload"
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.95 }}
//             className="relative max-w-2xl mx-auto"
//           >
//             {isAnalyzing ? (
//               <div className="glass-card p-16 flex flex-col items-center justify-center space-y-8 border-2 border-neon-cyan relative overflow-hidden" style={{ boxShadow: '0 0 30px rgba(0,229,255,0.1)' }}>
//                 {/* Laser scan line */}
//                 <motion.div 
//                   className="absolute left-0 right-0 h-1 bg-neon-cyan shadow-[0_0_15px_#00e5ff]"
//                   animate={{ top: ['0%', '100%', '0%'] }}
//                   transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
//                 />
//                 <div className="flex flex-col items-center space-y-6 relative z-10">
//                   <div className="relative w-24 h-24 flex items-center justify-center">
//                     <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
//                     <div className="absolute inset-0 rounded-full border-4 border-neon-cyan border-t-transparent animate-spin shadow-[0_0_15px_#00e5ff]" />
//                     <Search className="w-8 h-8 text-neon-cyan animate-pulse" />
//                   </div>
//                   <div className="text-center">
//                     <h3 className="text-xl font-bold text-heading mb-2" style={{ fontFamily: 'var(--font-display)' }}>Analyzing Resume Data...</h3>
//                     <p className="text-sm text-cyan-400 animate-pulse">Running against ATS algorithms via Gemini AI</p>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <label className="glass-card p-16 flex flex-col items-center justify-center space-y-6 border-dashed border-2 transition-all cursor-pointer rounded-2xl relative overflow-hidden group" style={{ borderColor: 'rgba(0,229,255,0.3)' }}>
//                 {/* Hover particles */}
//                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.05),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//                 <input 
//                   type="file" 
//                   className="hidden" 
//                   accept=".pdf"
//                   onChange={handleFileUpload}
//                 />
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-neon-cyan opacity-20 blur-xl rounded-full group-hover:opacity-40 transition-opacity duration-500" />
//                   <div className="inline-flex p-5 rounded-full relative bg-black border border-cyan-500/50 group-hover:scale-110 transition-transform duration-300">
//                     <UploadCloud className="w-12 h-12 text-neon-cyan" />
//                   </div>
//                 </div>
//                 <div className="text-center space-y-2 relative z-10">
//                   <h3 className="text-2xl font-bold font-display text-heading group-hover:text-neon-cyan transition-colors">
//                     INITIALIZE SCAN
//                   </h3>
//                   <p className="text-sm text-slate-400 font-semibold tracking-widest uppercase">
//                     Drop PDF Here (Max 10MB)
//                   </p>
//                 </div>
//               </label>
//             )}
//           </motion.div>
//         ) : (
//           <motion.div 
//             key="results"
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="space-y-8"
//           >
//             {/* ── PUBG-Style Results HUD ──────────────────────────────── */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="glass-card p-8 flex flex-col items-center justify-center text-center space-y-4 border-t-4" style={{ borderTopColor: getScoreColor(analysisResult.overallScore) }}>
//                 {/* Glowing Score Ring */}
//                 <div className="relative w-40 h-40 flex items-center justify-center">
//                   <svg className="absolute inset-0 w-full h-full transform -rotate-90">
//                     <circle cx="80" cy="80" r="70" className="stroke-slate-800" strokeWidth="8" fill="none" />
//                     <motion.circle 
//                       cx="80" cy="80" r="70" 
//                       stroke={getScoreColor(analysisResult.overallScore)} 
//                       strokeWidth="8" fill="none"
//                       strokeDasharray={440}
//                       initial={{ strokeDashoffset: 440 }}
//                       animate={{ strokeDashoffset: 440 - (440 * analysisResult.overallScore) / 100 }}
//                       transition={{ duration: 1.5, ease: "easeOut" }}
//                       style={{ filter: `drop-shadow(0 0 10px ${getScoreColor(analysisResult.overallScore)}80)` }}
//                       strokeLinecap="round"
//                     />
//                   </svg>
//                   <div className="absolute inset-0 flex flex-col items-center justify-center">
//                     <span className="text-5xl font-black" style={{ color: getScoreColor(analysisResult.overallScore), fontFamily: 'var(--font-display)', textShadow: `0 0 20px ${getScoreColor(analysisResult.overallScore)}60` }}>
//                       {analysisResult.overallScore}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="text-sm font-bold uppercase tracking-widest text-slate-300">Overall ATS Score</div>
//                 <div className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: `${getScoreColor(analysisResult.overallScore)}20`, color: getScoreColor(analysisResult.overallScore) }}>
//                   {analysisResult.overallScore >= 80 ? 'EXCELLENT MATCH' : analysisResult.overallScore >= 60 ? 'MODERATE MATCH' : 'LOW MATCH'}
//                 </div>
//               </div>
              
//               <div className="glass-card p-8 md:col-span-2 space-y-6">
//                 <h4 className="font-bold text-heading flex items-center gap-2 uppercase tracking-widest text-sm">
//                   <Target className="w-5 h-5 text-neon-cyan" /> Scan Breakdown
//                 </h4>
//                 <div className="space-y-5">
//                   {analysisResult.breakdown.map((stat, i) => (
//                     <div key={stat.label} className="space-y-2">
//                       <div className="flex justify-between text-xs font-bold uppercase text-slate-300">
//                         <span>{stat.label}</span>
//                         <span style={{ color: getScoreColor(stat.score) }}>{stat.score}/100</span>
//                       </div>
//                       <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
//                         <motion.div 
//                           className="h-full rounded-full" 
//                           style={{ backgroundColor: getScoreColor(stat.score), boxShadow: `0 0 10px ${getScoreColor(stat.score)}` }}
//                           initial={{ width: 0 }}
//                           animate={{ width: `${stat.score}%` }}
//                           transition={{ duration: 1, delay: i * 0.1 }}
//                         />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* ── Flipkart-Style Action Cards ─────────────────────────── */}
//             <div>
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="p-2 rounded-xl bg-neon-cyan/20 border border-neon-cyan/30">
//                   <Zap className="w-5 h-5 text-neon-cyan" />
//                 </div>
//                 <h3 className="text-2xl font-black text-heading" style={{ fontFamily: 'var(--font-display)' }}>ACTIONABLE INTEL</h3>
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {analysisResult.improvements.map((improvement, index) => {
//                   const isSuccess = improvement.type === 'success';
//                   const color = isSuccess ? '#43e97b' : '#ff9900';
                  
//                   return (
//                     <motion.div 
//                       key={index} 
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: index * 0.05 }}
//                       className="glass-card relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
//                     >
//                       {/* Left accent bar */}
//                       <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
                      
//                       <div className="p-5 pl-7 flex gap-4">
//                         <div className="shrink-0 mt-0.5">
//                           {isSuccess ? (
//                             <CheckCircle2 className="w-6 h-6" style={{ color }} />
//                           ) : (
//                             <AlertTriangle className="w-6 h-6" style={{ color }} />
//                           )}
//                         </div>
//                         <div>
//                           <h4 className="font-bold text-heading text-sm mb-1">{improvement.title}</h4>
//                           <p className="text-xs text-slate-400 leading-relaxed">
//                             {improvement.description}
//                           </p>
//                         </div>
//                       </div>
//                     </motion.div>
//                   );
//                 })}
//               </div>
//             </div>

//             <div className="flex justify-center pt-6 border-t border-slate-800/50">
//                <button onClick={() => setAnalysisResult(null)} className="btn btn-secondary text-sm font-bold uppercase tracking-widest px-8 py-3">
//                  Initiate New Scan
//                </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { Search, UploadCloud, CheckCircle2, AlertTriangle, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useLatestAtsQuery } from '../api';
import type { AtsAnalysisResult } from '../api';



export default function ATSAnalyzerPage() {
  const queryClient = useQueryClient();
  const { data: latestAts, isLoading: isFetchingLatest } = useLatestAtsQuery();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AtsAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize with the latest ATS score if it exists
  useEffect(() => {
    if (latestAts && !analysisResult && !isAnalyzing) {
      setAnalysisResult(latestAts);
    }
  }, [latestAts]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await api.post('/ats/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setAnalysisResult(response.data.data);
        // Invalidate queries so Dashboard and Sidebar pick up the new score
        queryClient.invalidateQueries({ queryKey: ['latestAtsAnalysis'] });
        queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      } else {
        throw new Error('Analysis failed');
      }
    } catch (err: any) {
      console.error('ATS Analysis error:', err);
      setError(err.response?.data?.error || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
      e.target.value = '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#43e97b'; // neon green
    if (score >= 60) return '#ff9900'; // neon orange
    return '#ff007f'; // neon pink
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 lg:p-8">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
        <div
          className="inline-flex p-4 rounded-2xl mb-2 animate-gradient"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <Search className="w-10 h-10 text-white" />
        </div>
        <h1
          className="text-4xl font-black text-heading"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}
        >
          ATS ANALYZER
        </h1>
        <p className="text-sm max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Beat the bots. Scan your resume against industry benchmarks and receive actionable optimization advice using Gemini AI.
        </p>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400 font-medium">{error}</p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {isFetchingLatest ? (
           <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center h-64">
             <div className="w-8 h-8 rounded-full border-4 border-neon-cyan border-t-transparent animate-spin" />
           </motion.div>
        ) : !analysisResult ? (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative max-w-2xl mx-auto"
          >
            {isAnalyzing ? (
              <div className="glass-card p-16 flex flex-col items-center justify-center space-y-8 border-2 border-neon-cyan relative overflow-hidden" style={{ boxShadow: '0 0 30px rgba(0,229,255,0.1)' }}>
                {/* Laser scan line */}
                <motion.div 
                  className="absolute left-0 right-0 h-1 bg-neon-cyan shadow-[0_0_15px_#00e5ff]"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                <div className="flex flex-col items-center space-y-6 relative z-10">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-neon-cyan border-t-transparent animate-spin shadow-[0_0_15px_#00e5ff]" />
                    <Search className="w-8 h-8 text-neon-cyan animate-pulse" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-heading mb-2" style={{ fontFamily: 'var(--font-display)' }}>Analyzing Resume Data...</h3>
                    <p className="text-sm text-cyan-400 animate-pulse">Running against ATS algorithms via Gemini AI</p>
                  </div>
                </div>
              </div>
            ) : (
              <label className="glass-card p-16 flex flex-col items-center justify-center space-y-6 border-dashed border-2 transition-all cursor-pointer rounded-2xl relative overflow-hidden group" style={{ borderColor: 'rgba(0,229,255,0.3)' }}>
                {/* Hover particles */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.05),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf"
                  onChange={handleFileUpload}
                />
                <div className="relative">
                  <div className="absolute -inset-4 bg-neon-cyan opacity-20 blur-xl rounded-full group-hover:opacity-40 transition-opacity duration-500" />
                  <div className="inline-flex p-5 rounded-full relative bg-black border border-cyan-500/50 group-hover:scale-110 transition-transform duration-300">
                    <UploadCloud className="w-12 h-12 text-neon-cyan" />
                  </div>
                </div>
                <div className="text-center space-y-2 relative z-10">
                  <h3 className="text-2xl font-bold font-display text-heading group-hover:text-neon-cyan transition-colors">
                    INITIALIZE SCAN
                  </h3>
                  <p className="text-sm text-slate-400 font-semibold tracking-widest uppercase">
                    Drop PDF Here (Max 10MB)
                  </p>
                </div>
              </label>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* ── PUBG-Style Results HUD ──────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-8 flex flex-col items-center justify-center text-center space-y-4 border-t-4" style={{ borderTopColor: getScoreColor(analysisResult.overallScore) }}>
                {/* Glowing Score Ring */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" className="stroke-slate-800" strokeWidth="8" fill="none" />
                    <motion.circle 
                      cx="80" cy="80" r="70" 
                      stroke={getScoreColor(analysisResult.overallScore)} 
                      strokeWidth="8" fill="none"
                      strokeDasharray={440}
                      initial={{ strokeDashoffset: 440 }}
                      animate={{ strokeDashoffset: 440 - (440 * analysisResult.overallScore) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      style={{ filter: `drop-shadow(0 0 10px ${getScoreColor(analysisResult.overallScore)}80)` }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black" style={{ color: getScoreColor(analysisResult.overallScore), fontFamily: 'var(--font-display)', textShadow: `0 0 20px ${getScoreColor(analysisResult.overallScore)}60` }}>
                      {analysisResult.overallScore}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-bold uppercase tracking-widest text-slate-300">Overall ATS Score</div>
                <div className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: `${getScoreColor(analysisResult.overallScore)}20`, color: getScoreColor(analysisResult.overallScore) }}>
                  {analysisResult.overallScore >= 80 ? 'EXCELLENT MATCH' : analysisResult.overallScore >= 60 ? 'MODERATE MATCH' : 'LOW MATCH'}
                </div>
              </div>
              
              <div className="glass-card p-8 md:col-span-2 space-y-6">
                <h4 className="font-bold text-heading flex items-center gap-2 uppercase tracking-widest text-sm">
                  <Target className="w-5 h-5 text-neon-cyan" /> Scan Breakdown
                </h4>
                <div className="space-y-5">
                  {analysisResult.breakdown.map((stat, i) => (
                    <div key={stat.label} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase text-slate-300">
                        <span>{stat.label}</span>
                        <span style={{ color: getScoreColor(stat.score) }}>{stat.score}/100</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <motion.div 
                          className="h-full rounded-full" 
                          style={{ backgroundColor: getScoreColor(stat.score), boxShadow: `0 0 10px ${getScoreColor(stat.score)}` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.score}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Flipkart-Style Action Cards ─────────────────────────── */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-neon-cyan/20 border border-neon-cyan/30">
                  <Zap className="w-5 h-5 text-neon-cyan" />
                </div>
                <h3 className="text-2xl font-black text-heading" style={{ fontFamily: 'var(--font-display)' }}>ACTIONABLE INTEL</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResult.improvements.map((improvement, index) => {
                  const isSuccess = improvement.type === 'success';
                  const color = isSuccess ? '#43e97b' : '#ff9900';
                  
                  return (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
                    >
                      {/* Left accent bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
                      
                      <div className="p-5 pl-7 flex gap-4">
                        <div className="shrink-0 mt-0.5">
                          {isSuccess ? (
                            <CheckCircle2 className="w-6 h-6" style={{ color }} />
                          ) : (
                            <AlertTriangle className="w-6 h-6" style={{ color }} />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-heading text-sm mb-1">{improvement.title}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {improvement.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center pt-6 border-t border-slate-800/50">
               <button onClick={() => setAnalysisResult(null)} className="btn btn-secondary text-sm font-bold uppercase tracking-widest px-8 py-3">
                 Initiate New Scan
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
