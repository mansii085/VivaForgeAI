import { useState, useEffect, useRef } from 'react';
import { Database, UploadCloud, Search, Loader2, FileText, Trash2, Link2, MessageSquare, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface RAGDocument {
  _id: string;
  title: string;
  fileType: string;
  createdAt: string;
}

interface QueryResponse {
  answer: string;
  sources: { documentTitle: string; chunkText: string }[];
}

export default function RAGPage() {
  const [documents, setDocuments] = useState<RAGDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ q: string; a: QueryResponse | null }>>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAsking]);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/rag/documents');
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load documents');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const allowed = ['application/pdf', 'text/plain', 'text/markdown'];
    if (!allowed.includes(file.type)) {
      toast.error('Only PDF, TXT, and MD files are supported.');
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      const res = await api.post('/rag/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (res.data.success) {
        setDocuments([res.data.data, ...documents]);
        toast.success('System updated. New data injected.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteDoc = async (id: string) => {
    setIsDeletingId(id);
    try {
      await api.delete(`/rag/documents/${id}`);
      setDocuments(documents.filter(d => d._id !== id));
      toast.success('Data purged from system.');
    } catch (err) {
      toast.error('Failed to delete document');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || documents.length === 0) return;

    const currentQ = question;
    setQuestion('');
    setChatHistory(prev => [...prev, { q: currentQ, a: null }]);
    setIsAsking(true);

    try {
      const res = await api.post('/rag/ask', { question: currentQ });
      if (res.data.success) {
        setChatHistory(prev => {
          const updated = [...prev];
          updated[updated.length - 1].a = res.data.data;
          return updated;
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'System error. Query failed.');
      setChatHistory(prev => prev.slice(0, -1)); // Remove failed question
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6 p-4 lg:p-6">
      
      {/* ── Left Panel: Inventory / Document Manager ───────────────────────── */}
      <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-neon-cyan/10 border border-neon-cyan/30 rounded-xl">
            <Database className="w-6 h-6 text-neon-cyan drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
          </div>
          <div>
            <h2 className="text-xl font-black font-display tracking-widest text-white uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Data Nexus</h2>
            <p className="text-[10px] font-bold tracking-widest text-neon-cyan uppercase">Knowledge Base</p>
          </div>
        </div>

        <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.txt,.md" onChange={handleFileUpload} />
        
        <button 
          onClick={() => fileInputRef.current?.click()} 
          disabled={isUploading} 
          className="relative group overflow-hidden rounded-xl border border-dashed border-slate-700 hover:border-neon-cyan transition-colors bg-slate-900/50 p-6 flex flex-col items-center justify-center text-center"
        >
          {/* Hover glow */}
          <div className="absolute inset-0 bg-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-neon-cyan drop-shadow-[0_0_10px_rgba(0,229,255,1)]" />
          ) : (
            <UploadCloud className="w-8 h-8 mb-3 text-slate-500 group-hover:text-neon-cyan transition-colors" />
          )}
          
          <span className="text-sm font-black uppercase tracking-widest text-white mb-1 relative z-10">
            {isUploading ? 'Injecting Data...' : 'Upload File'}
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest relative z-10">PDF, TXT, MD</span>
        </button>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-800 pb-2">Indexed Files ({documents.length})</div>
          
          <AnimatePresence>
            {documents.length === 0 && !isUploading && (
              <div className="text-center p-8 text-xs font-mono text-slate-600 border border-slate-800 border-dashed rounded-xl">No data found in sector.</div>
            )}
            {documents.map((doc, i) => (
              <motion.div 
                key={doc._id} 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                className="glass-card p-3 flex justify-between items-center group hover:border-neon-cyan/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-black border border-slate-800 group-hover:border-neon-cyan/50 text-slate-400 group-hover:text-neon-cyan transition-colors shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-300 truncate font-mono">{doc.title}</p>
                    <p className="text-[9px] font-black tracking-widest text-slate-500 uppercase mt-0.5">{doc.fileType}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteDoc(doc._id)} 
                  disabled={isDeletingId === doc._id} 
                  className="p-1.5 rounded text-slate-600 hover:text-neon-pink hover:bg-neon-pink/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  {isDeletingId === doc._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Right Panel: AI Chat Terminal ──────────────────────────────────── */}
      <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col relative rounded-2xl overflow-hidden bg-[#050505] border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Terminal Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-neon-cyan" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">VivaForgeAI // Terminal v2.0</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full border border-slate-800 animate-ping opacity-20" />
              <div className="p-6 rounded-full bg-slate-900/50 border border-slate-800"><Database className="w-12 h-12 text-slate-700" /></div>
            </div>
            <h3 className="text-xl font-black font-display text-slate-500 uppercase tracking-widest drop-shadow-md">System Offline</h3>
            <p className="text-sm font-mono text-slate-600 max-w-sm">No data sources detected. Inject documents via the Data Nexus to initiate AI query protocols.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
              {chatHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <MessageSquare className="w-12 h-12 text-slate-800" />
                  <p className="text-sm font-mono text-slate-500">SYSTEM ONLINE. READY FOR QUERIES.</p>
                </div>
              )}
              
              {chatHistory.map((chat, idx) => (
                <div key={idx} className="space-y-6">
                  {/* User Terminal Command */}
                  <div className="flex justify-end">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="relative group max-w-[85%]">
                      <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-cyan opacity-20 blur-md rounded-2xl group-hover:opacity-40 transition-opacity" />
                      <div className="relative bg-black border border-slate-800 text-white px-5 py-3 rounded-2xl rounded-tr-sm text-sm font-mono flex gap-3 shadow-lg">
                        <span className="text-neon-cyan select-none">{'>'}</span>
                        <span>{chat.q}</span>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* AI Response Block */}
                  <div className="flex justify-start">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-[90%] w-full">
                      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/80 border-l-2 border-l-neon-cyan text-slate-300 p-5 rounded-2xl rounded-tl-sm shadow-xl">
                        {!chat.a ? (
                          <div className="flex items-center gap-3 text-neon-cyan font-mono text-sm">
                            <Search className="w-4 h-4 animate-spin" /> SEARCHING ARCHIVES...
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="leading-relaxed font-mono text-sm whitespace-pre-wrap">{chat.a.answer}</div>
                            
                            {chat.a.sources?.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-slate-800">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                                  <Link2 className="w-3.5 h-3.5 text-neon-cyan" /> Sourced Intel
                                </span>
                                <div className="grid grid-cols-1 gap-2">
                                  {chat.a.sources.map((src, i) => (
                                    <div key={i} className="text-xs p-3 bg-black/50 rounded-lg border border-slate-800 flex flex-col gap-1">
                                      <span className="font-bold text-neon-cyan truncate font-mono">[{src.documentTitle}]</span>
                                      <span className="text-slate-400 italic font-serif leading-relaxed line-clamp-2">"{src.chunkText}"</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Terminal Input */}
            <div className="p-4 bg-black border-t border-slate-800">
              <form onSubmit={handleAsk} className="relative flex items-center">
                <span className="absolute left-4 text-neon-cyan font-mono select-none">$&gt;</span>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter query parameter..."
                  disabled={isAsking}
                  className="w-full bg-slate-900 border border-slate-800 text-white text-sm font-mono rounded-full pl-10 pr-14 py-4 focus:outline-none focus:border-neon-cyan/50 focus:bg-slate-900/80 transition-all disabled:opacity-50"
                />
                <button type="submit" disabled={isAsking || !question.trim()} className="absolute right-2 top-2 bottom-2 aspect-square bg-neon-cyan hover:bg-cyan-400 hover:shadow-[0_0_15px_#00e5ff] text-black rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:hover:shadow-none">
                  {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
