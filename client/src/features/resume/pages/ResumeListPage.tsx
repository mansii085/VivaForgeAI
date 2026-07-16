// import { useEffect, useRef, useState } from 'react';
// import {
//   FileText, UploadCloud, Trash2, Calendar, Briefcase, GraduationCap, Loader2, AlertTriangle, X, Plus
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import toast from 'react-hot-toast';
// import api from '@/lib/api';

// interface ParsedData {
//   name: string;
//   email: string;
//   phone: string;
//   summary?: string;
//   skills: string[];
//   experience: { company: string; role: string; duration: string; description: string }[];
//   education: { institution: string; degree: string; year: string }[];
//   certifications: string[];
//   projects: { name: string; description: string; technologies: string[] }[];
// }

// interface Resume {
//   _id: string;
//   title: string;
//   originalFileName: string;
//   version: number;
//   parsedData: ParsedData;
//   tags: string[];
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// export default function ResumeListPage() {
//   const [resumes, setResumes] = useState<Resume[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isUploading, setIsUploading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [deletingId, setDeletingId] = useState<string | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     fetchResumes();
//   }, []);

//   const fetchResumes = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
//       const response = await api.get('/resumes');
//       if (response.data.success) {
//         setResumes(response.data.data);
//       }
//     } catch (err: any) {
//       setError(err.response?.data?.error || 'Failed to load resumes.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUploadClick = () => {
//     fileInputRef.current?.click();
//   };

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files || e.target.files.length === 0) return;
//     const file = e.target.files[0];

//     if (file.type !== 'application/pdf') {
//       toast.error('Only PDF files are supported.');
//       e.target.value = '';
//       return;
//     }

//     if (file.size > 10 * 1024 * 1024) {
//       toast.error('File size must be under 10MB.');
//       e.target.value = '';
//       return;
//     }

//     setIsUploading(true);
//     setError(null);

//     try {
//       const formData = new FormData();
//       formData.append('resume', file);

//       const response = await api.post('/resumes/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       if (response.data.success) {
//         setResumes((prev) => [response.data.data, ...prev]);
//         toast.success('Resume data parsed and stored!');
//       }
//     } catch (err: any) {
//       const msg = err.response?.data?.error || 'Failed to upload resume.';
//       toast.error(msg);
//       setError(msg);
//     } finally {
//       setIsUploading(false);
//       e.target.value = '';
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (deletingId) return;
//     setDeletingId(id);

//     try {
//       const response = await api.delete(`/resumes/${id}`);
//       if (response.data.success) {
//         setResumes((prev) => prev.filter((r) => r._id !== id));
//         toast.success('Item removed from inventory.');
//       }
//     } catch (err: any) {
//       toast.error(err.response?.data?.error || 'Failed to delete resume.');
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const formatDate = (dateStr: string) => {
//     return new Date(dateStr).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   };

//   return (
//     <div className="max-w-6xl mx-auto space-y-8 p-4 lg:p-8">
//       <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />

//       {/* ── Header ──────────────────────────────────────────────────────── */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
//           <h2 className="text-3xl font-black font-display tracking-tight text-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
//             Resume Inventory
//           </h2>
//           <p className="text-sm font-bold text-neon-cyan tracking-widest uppercase">
//             Store & manage your profile iterations
//           </p>
//         </motion.div>
        
//         <motion.button
//           initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
//           className="btn btn-primary relative overflow-hidden group border-none px-6 py-3"
//           style={{ background: 'var(--gradient-primary)' }}
//           onClick={handleUploadClick}
//           disabled={isUploading}
//         >
//           <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
//           <span className="relative z-10 flex items-center gap-2 font-black uppercase tracking-widest text-sm text-white">
//             {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
//             {isUploading ? 'Parsing...' : 'Upload New'}
//           </span>
//         </motion.button>
//       </div>

//       <AnimatePresence>
//         {error && (
//           <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
//             <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
//             <p className="text-sm text-red-400 font-medium flex-1">{error}</p>
//             <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <AnimatePresence mode="wait">
//         {isUploading ? (
//           <motion.div key="uploading" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-16 text-center flex flex-col items-center justify-center space-y-6 border-2 border-neon-cyan relative overflow-hidden" style={{ boxShadow: '0 0 30px rgba(0,229,255,0.1)' }}>
//             <motion.div className="absolute left-0 right-0 h-1 bg-neon-cyan shadow-[0_0_15px_#00e5ff]" animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
//             <div className="relative w-24 h-24 flex items-center justify-center z-10">
//               <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
//               <div className="absolute inset-0 rounded-full border-4 border-neon-cyan border-t-transparent animate-spin shadow-[0_0_15px_#00e5ff]" />
//               <FileText className="w-8 h-8 text-neon-cyan animate-pulse" />
//             </div>
//             <div className="z-10">
//               <h3 className="text-xl font-bold font-display text-white mb-2 tracking-widest uppercase">Extracting Data...</h3>
//               <p className="text-sm text-cyan-400 font-mono">Parsing skills, experience, and metadata</p>
//             </div>
//           </motion.div>
//         ) : isLoading ? (
//           <div key="loading" className="glass-card p-24 flex flex-col items-center justify-center space-y-4 border-slate-800">
//             <Loader2 className="w-10 h-10 text-slate-500 animate-spin" />
//             <p className="text-sm text-slate-500 font-bold tracking-widest uppercase">Accessing Inventory...</p>
//           </div>
//         ) : resumes.length === 0 ? (
//           <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-16 text-center flex flex-col items-center justify-center space-y-6 border-dashed border-2 border-slate-700">
//             <div className="inline-flex p-6 rounded-full bg-slate-900 border border-slate-800 relative">
//               <div className="absolute inset-0 bg-neon-cyan blur-2xl opacity-10 rounded-full" />
//               <FileText className="w-12 h-12 text-slate-500 relative z-10" />
//             </div>
//             <div className="max-w-md space-y-2">
//               <h3 className="text-2xl font-black font-display text-white uppercase tracking-widest">Inventory Empty</h3>
//               <p className="text-sm text-slate-400 leading-relaxed font-mono">
//                 Upload your first resume PDF. The AI will parse it and make it available for ATS scoring and JD matching.
//               </p>
//             </div>
//             <button className="btn btn-primary mt-4 group" onClick={handleUploadClick}>
//               <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" /> Add to Inventory
//             </button>
//           </motion.div>
//         ) : (
//           <div key="grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <AnimatePresence>
//               {resumes.map((resume, index) => (
//                 <motion.div
//                   key={resume._id}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   exit={{ opacity: 0, scale: 0.9 }}
//                   transition={{ delay: index * 0.05 }}
//                   className="product-card group"
//                 >
//                   {/* Glowing Tier Banner */}
//                   <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink" />
                  
//                   <div className="p-6 h-full flex flex-col">
//                     <div className="flex justify-between items-start mb-4">
//                       <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-inner group-hover:border-neon-cyan/50 transition-colors">
//                         <FileText className="w-6 h-6 text-neon-cyan group-hover:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
//                       </div>
//                       <div className="flex gap-2">
//                         <span className="px-2.5 py-1 rounded bg-black/50 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-300">
//                           v{resume.version}
//                         </span>
//                         <button
//                           onClick={() => handleDelete(resume._id)}
//                           disabled={deletingId === resume._id}
//                           className="p-1.5 rounded-lg text-slate-500 hover:text-neon-pink hover:bg-neon-pink/10 transition-colors"
//                           title="Delete"
//                         >
//                           {deletingId === resume._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
//                         </button>
//                       </div>
//                     </div>

//                     <h3 className="text-lg font-bold text-white mb-1 truncate" title={resume.title}>
//                       {resume.title}
//                     </h3>
//                     <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-4">
//                       <Calendar className="w-3.5 h-3.5 text-slate-500" />
//                       {formatDate(resume.createdAt)}
//                     </div>

//                     {resume.parsedData && (
//                       <div className="mt-auto space-y-4 pt-4 border-t border-slate-800">
//                         {/* Summary Stats */}
//                         <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
//                           <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-neon-purple" /> {resume.parsedData.experience?.length || 0} Roles</span>
//                           <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-neon-pink" /> {resume.parsedData.education?.length || 0} Edu</span>
//                         </div>

//                         {/* Skill Chips (Loot) */}
//                         {resume.parsedData.skills?.length > 0 && (
//                           <div className="flex flex-wrap gap-1.5">
//                             {resume.parsedData.skills.slice(0, 5).map((skill) => (
//                               <span key={skill} className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-neon-green">
//                                 {skill}
//                               </span>
//                             ))}
//                             {resume.parsedData.skills.length > 5 && (
//                               <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-500">
//                                 +{resume.parsedData.skills.length - 5}
//                               </span>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </motion.div>
//               ))}
//             </AnimatePresence>
//           </div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }


import { useEffect, useRef, useState } from 'react';
import {
  FileText, UploadCloud, Trash2, Calendar, Briefcase, GraduationCap, Loader2, AlertTriangle, X, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface ParsedData {
  name: string;
  email: string;
  phone: string;
  summary?: string;
  skills: string[];
  experience: { company: string; role: string; duration: string; description: string }[];
  education: { institution: string; degree: string; year: string }[];
  certifications: string[];
  projects: { name: string; description: string; technologies: string[] }[];
}

interface Resume {
  _id: string;
  title: string;
  originalFileName: string;
  cloudinaryUrl?: string;
  version: number;
  parsedData: ParsedData;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ResumeListPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedResumeUrl, setSelectedResumeUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/resumes');
      if (response.data.success) {
        setResumes(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load resumes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported.');
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB.');
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setResumes((prev) => [response.data.data, ...prev]);
        toast.success('Resume data parsed and stored!');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to upload resume.';
      toast.error(msg);
      setError(msg);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);

    try {
      const response = await api.delete(`/resumes/${id}`);
      if (response.data.success) {
        setResumes((prev) => prev.filter((r) => r._id !== id));
        toast.success('Item removed from inventory.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete resume.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 lg:p-8">
      <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
          <h2 className="text-3xl font-black font-display tracking-tight text-heading uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            Resume Inventory
          </h2>
          <p className="text-sm font-bold text-neon-cyan tracking-widest uppercase">
            Store & manage your profile iterations
          </p>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          className="btn btn-primary relative overflow-hidden group border-none px-6 py-3"
          style={{ background: 'var(--gradient-primary)' }}
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
          <span className="relative z-10 flex items-center gap-2 font-black uppercase tracking-widest text-sm text-white">
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
            {isUploading ? 'Parsing...' : 'Upload New'}
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400 font-medium flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isUploading ? (
          <motion.div key="uploading" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-16 text-center flex flex-col items-center justify-center space-y-6 border-2 border-neon-cyan relative overflow-hidden" style={{ boxShadow: '0 0 30px rgba(0,229,255,0.1)' }}>
            <motion.div className="absolute left-0 right-0 h-1 bg-neon-cyan shadow-[0_0_15px_#00e5ff]" animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
            <div className="relative w-24 h-24 flex items-center justify-center z-10">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-neon-cyan border-t-transparent animate-spin shadow-[0_0_15px_#00e5ff]" />
              <FileText className="w-8 h-8 text-neon-cyan animate-pulse" />
            </div>
            <div className="z-10">
              <h3 className="text-xl font-bold font-display text-heading mb-2 tracking-widest uppercase">Extracting Data...</h3>
              <p className="text-sm text-cyan-400 font-mono">Parsing skills, experience, and metadata</p>
            </div>
          </motion.div>
        ) : isLoading ? (
          <div key="loading" className="glass-card p-24 flex flex-col items-center justify-center space-y-4 border-slate-800">
            <Loader2 className="w-10 h-10 text-slate-500 animate-spin" />
            <p className="text-sm text-slate-500 font-bold tracking-widest uppercase">Accessing Inventory...</p>
          </div>
        ) : resumes.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-16 text-center flex flex-col items-center justify-center space-y-6 border-dashed border-2 border-slate-700">
            <div className="inline-flex p-6 rounded-full bg-slate-900 border border-slate-800 relative">
              <div className="absolute inset-0 bg-neon-cyan blur-2xl opacity-10 rounded-full" />
              <FileText className="w-12 h-12 text-slate-500 relative z-10" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-2xl font-black font-display text-heading uppercase tracking-widest">Inventory Empty</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-mono">
                Upload your first resume PDF. The AI will parse it and make it available for ATS scoring and JD matching.
              </p>
            </div>
            <button className="btn btn-primary mt-4 group" onClick={handleUploadClick}>
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" /> Add to Inventory
            </button>
          </motion.div>
        ) : (
          <div key="grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {resumes.map((resume, index) => (
                <motion.div
                  key={resume._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="product-card group"
                >
                  {/* Glowing Tier Banner */}
                  <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink" />
                  
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div 
                        className={`p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-inner transition-colors ${resume.cloudinaryUrl ? 'cursor-pointer hover:border-neon-cyan/50 group/icon' : 'opacity-50'}`}
                        onClick={() => resume.cloudinaryUrl ? setSelectedResumeUrl(resume.cloudinaryUrl) : toast.error('PDF not available for older uploads.')}
                        title={resume.cloudinaryUrl ? 'View PDF' : 'PDF Unavailable'}
                      >
                        <FileText className={`w-6 h-6 text-neon-cyan ${resume.cloudinaryUrl ? 'group-hover/icon:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]' : ''}`} />
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2.5 py-1 rounded bg-black/50 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-300">
                          v{resume.version}
                        </span>
                        <button
                          onClick={() => handleDelete(resume._id)}
                          disabled={deletingId === resume._id}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-neon-pink hover:bg-neon-pink/10 transition-colors"
                          title="Delete"
                        >
                          {deletingId === resume._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-heading mb-1 truncate" title={resume.title}>
                      {resume.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-4">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {formatDate(resume.createdAt)}
                    </div>

                    {resume.parsedData && (
                      <div className="mt-auto space-y-4 pt-4 border-t border-slate-800">
                        {/* Summary Stats */}
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
                          <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-neon-purple" /> {resume.parsedData.experience?.length || 0} Roles</span>
                          <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-neon-pink" /> {resume.parsedData.education?.length || 0} Edu</span>
                        </div>

                        {/* Skill Chips (Loot) */}
                        {resume.parsedData.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {resume.parsedData.skills.slice(0, 5).map((skill) => (
                              <span key={skill} className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-neon-green">
                                {skill}
                              </span>
                            ))}
                            {resume.parsedData.skills.length > 5 && (
                              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-500">
                                +{resume.parsedData.skills.length - 5}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>

      {/* ── PDF Viewer Modal ── */}
      <AnimatePresence>
        {selectedResumeUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedResumeUrl(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl h-[85vh] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              style={{ zIndex: 51 }}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b border-[var(--border-color)] bg-black/20">
                <h3 className="font-bold text-white tracking-widest uppercase flex items-center gap-2">
                  <FileText className="w-5 h-5 text-neon-cyan" />
                  Document Viewer
                </h3>
                <button 
                  onClick={() => setSelectedResumeUrl(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Modal Body (iframe) */}
              <div className="flex-1 w-full h-full bg-slate-900 relative">
                {/* Fallback loading state or info */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-mono text-sm z-0">
                  Loading PDF viewer...
                </div>
                <iframe 
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedResumeUrl)}&embedded=true`} 
                  className="relative z-10 w-full h-full border-none"
                  title="PDF Viewer"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
