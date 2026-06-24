import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Send, Code2, FolderGit2, RefreshCw, Check, Copy, Wifi, WifiOff, LogOut, UserPlus, LogIn, Plus, UploadCloud } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- SECURE STANDALONE AUTHENTICATION COMPONENT ---
function AuthForm({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [showForm, setShowForm] = useState(false); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // 🆕 Added state for password pairing
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // --- 🔐 FRONTEND SECURITY VALIDATION LAYERS ---
    if (isRegister) {
      // 1. Enforce strict string match checks
      if (password !== confirmPassword) {
        setError('Confirm password field does not match.');
        return;
      }

      // 2. Enforce complexity: 6+ characters, 1 letter, 1 number, 1 symbol
      const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
      if (!strongPasswordRegex.test(password)) {
        setError('Password must be at least 6 characters and include 1 letter, 1 number, and 1 symbol.');
        return;
      }
    }

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Authentication failed.');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      onAuthSuccess(data.token, data.username);
    } catch (err) {
      setError(err.message);
    }
  };

  // 1. THE ULTIMATE DEVELOPER LANDING VIEW
  if (!showForm) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 text-slate-200 flex flex-col justify-between p-6 md:p-12 relative overflow-hidden font-sans selection:bg-purple-500/30">
        
        {/* Decorative Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Header Navigation */}
        <header className="w-full max-w-6xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-purple-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-wider text-white font-mono">CodeRAG.AI</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">v2.0 Monolith</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => { setIsRegister(false); setShowForm(true); setError(''); }}
            className="text-xs font-mono text-slate-400 hover:text-white border border-slate-900 hover:border-slate-800 bg-slate-950/40 px-4 py-2 rounded-xl transition-all duration-200 backdrop-blur-sm cursor-pointer"
          >
            Access Core System &rarr;
          </button>
        </header>

        {/* Hero Main Content Section */}
        <main className="w-full max-w-4xl mx-auto text-center my-auto space-y-8 relative z-10 py-12">
          <div className="inline-flex items-center gap-2 bg-purple-500/5 border border-purple-500/20 px-3 py-1 rounded-full text-purple-400 text-xs font-mono tracking-wide mx-auto">
            <Terminal className="w-3.5 h-3.5" />
            <span>Absolute Multi-Tenant Workspace Sandboxing</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Chat with Your Codebase. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-500 drop-shadow-sm">
              With Perfect Isolation.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto tracking-wide leading-relaxed font-sans">
            An advanced context-aware engineering companion. Upload production file trees, partition context bounds into standalone PostgreSQL slices, and talk to your architecture with deterministic data security.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <button 
              onClick={() => { setIsRegister(false); setShowForm(true); setError(''); }}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-200 text-sm shadow-xl shadow-purple-600/20 cursor-pointer font-mono tracking-wider"
            >
              INITIALIZE CORE INTERFACE
            </button>
            <button 
              onClick={() => { setIsRegister(true); setShowForm(true); setError(''); }}
              className="w-full sm:w-auto bg-slate-900/60 hover:bg-slate-900 text-slate-300 border border-slate-800 font-medium px-8 py-3.5 rounded-xl transition-all duration-200 text-sm cursor-pointer font-mono tracking-wider"
            >
              CREATE FREE ACCOUNT
            </button>
          </div>

          {/* Minimalist Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 text-left max-w-5xl mx-auto">
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-2 backdrop-blur-sm">
              <div className="text-purple-400 bg-purple-500/5 p-2 rounded-lg border border-purple-500/10 w-fit">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Dynamic Workspaces</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Segment multiple microservices under one account. Toggle project slices effortlessly without leaking cross-context rules.
              </p>
            </div>

            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-2 backdrop-blur-sm">
              <div className="text-indigo-400 bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10 w-fit">
                <Check className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Cryptographic Guard</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Passwords are automatically salted via Bcrypt. API layers are fully fenced under stateless JWT authorization keys.
              </p>
            </div>

            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-2 backdrop-blur-sm">
              <div className="text-purple-400 bg-purple-500/5 p-2 rounded-lg border border-purple-500/10 w-fit">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Monolithic Vector Speed</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                By collapsing everything to FastAPI and pgvector, query tokenizations process instantly inside a warm, 16GB hosting instance.
              </p>
            </div>
          </div>
        </main>

        <footer className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between border-t border-slate-900 pt-6 text-[10px] font-mono text-slate-600 relative z-10 gap-3 select-none">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><span className="w-1 h-1 bg-emerald-500 rounded-full" /> PGVECTOR: SECURE</span>
            <span className="flex items-center gap-1.5"><span className="w-1 h-1 bg-emerald-500 rounded-full" /> MODEL: ALL-MINILM-L6-V2</span>
          </div>
          <div>&copy; {new Date().getFullYear()} CodeRAG AI System Pipeline. All rights reserved.</div>
        </footer>
      </div>
    );
  }

  // 2. THE SECURE LOGIN / REGISTER GATE PANEL
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-200">
      <form onSubmit={handleSubmit} className="w-96 space-y-6 bg-slate-900/50 p-8 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
        <div className="text-center">
          <h2 className="text-xl font-bold tracking-wider text-white">CodeRAG AI Monolith</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">{isRegister ? 'CREATE ACCOUNT' : 'SECURE DEPLOYMENT LOGIN'}</p>
        </div>
        
        {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg font-mono">{error}</div>}
        
        <div className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1">USERNAME</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-purple-500/50" />
          </div>
          
          <div>
            <label className="text-slate-400 block mb-1">PASSWORD</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-purple-500/50" />
          </div>

          {/* 🆕 CONDITIONAL CONFIRM PASSWORD VIEW FOR REGISTER PATHS */}
          {isRegister && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <label className="text-slate-400 block mb-1">CONFIRM PASSWORD</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-purple-500/50" 
              />
            </motion.div>
          )}
        </div>

        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium p-2.5 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-purple-600/10 cursor-pointer">
          {isRegister ? 'Sign Up' : 'Sign In'}
        </button>

        <p className="text-center text-xs text-slate-500 font-mono">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            type="button" 
            onClick={() => { setIsRegister(!isRegister); setError(''); setConfirmPassword(''); }} 
            className="text-purple-400 hover:underline cursor-pointer"
          >
            {isRegister ? 'Log In' : 'Register Here'}
          </button>
        </p>
      </form>
    </div>
  );
}

// --- MAIN RUNTIME APPLICATION MODULE ---
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [currentWorkspace, setCurrentWorkspace] = useState('default-project');
  const [workspaces, setWorkspaces] = useState([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "### 📁 Cryptographic Safe-Zone Active\nWelcome back! I am fully synchronized with your account bounds. Choose or create a codebase workspace below to initialize contextual RAG execution layers."
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [isBackendAlive, setIsBackendAlive] = useState(true);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  // --- LIFECYCLES & ACTIONS ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (token) scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (token) fetchWorkspaces();
  }, [token]);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/workspaces`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to retrieve workspaces.');
      const data = await response.json();
      setWorkspaces(data);
      if (data.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(data[0].workspace_name);
      }
    } catch (err) {
      console.error("Workspace syncing error:", err);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    const cleanWorkspaceName = newWorkspaceName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/workspaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: cleanWorkspaceName })
      });
      const msg = await response.text();
      if (!response.ok) throw new Error(msg);

      setNewWorkspaceName('');
      await fetchWorkspaces();
      setCurrentWorkspace(cleanWorkspaceName);
    } catch (err) {
      alert(`Workspace Error: ${err.message}`);
    }
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    if (!currentWorkspace) {
      alert("Please initialize or select a project workspace first.");
      return;
    }

    const userText = query;
    setQuery('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/assistant/ask?q=${encodeURIComponent(userText)}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "X-Workspace-Name": currentWorkspace
        }
      });
      if (!response.ok) throw new Error(`Server status returned HTTP ${response.status}`);

      const answerText = await response.text();
      setMessages((prev) => [...prev, { role: 'assistant', text: answerText }]);
      setIsBackendAlive(true);
    } catch (error) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: `### ❌ Pipeline Processing Interrupted\nFailed to sync cleanly down the route stack.\n* Reason: _${error.message}_`
      }]);
      setIsBackendAlive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleZipUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("file", file);
    setIsIngesting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/assistant/ingest`, {
        method: "POST",
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Workspace-Name': currentWorkspace
        }
      });
      const msg = await response.text();
      if (!response.ok) throw new Error(msg);

      alert(`🎉 Ingestion Sequence Terminated Nicely:\n${msg}`);
      await fetchWorkspaces();
    } catch (error) {
      alert(`❌ Vector Processing Reject Call:\n${error.message}`);
    } finally {
      setIsIngesting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- 3. SECURITY GATE CHECK ---
  if (!token) {
    return (
      <AuthForm 
        onAuthSuccess={(receivedToken, authenticatedUser) => {
          setToken(receivedToken);
          setUsername(authenticatedUser);
        }} 
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-200 antialiased">
      
      {/* --- SIDEBAR WORKSPACE MANAGER --- */}
      <div className="w-80 bg-slate-900/40 border-r border-slate-900 p-5 flex flex-col justify-between shrink-0 h-full">
        <div className="space-y-6 overflow-y-auto pr-1 select-none">
          
          {/* Logo Block & User Header */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-purple-500/10 p-2 rounded-xl text-purple-400 border border-purple-500/20">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-xs tracking-wider text-white uppercase">{username || 'Developer'}</h1>
                <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Secure Profile</p>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="text-slate-400 hover:text-rose-400 font-mono text-[10px] uppercase border border-slate-800 hover:border-rose-500/20 px-2 py-1 rounded bg-slate-950/60 transition-all cursor-pointer"
            >
              <LogOut className="w-3 h-3 inline mr-1" /> Sign Out
            </button>
          </div>

          {/* Active Target Workspace Banner */}
          <div className="bg-purple-950/20 border border-purple-900/40 rounded-xl p-3 space-y-1">
            <span className="text-[9px] font-mono tracking-wider text-purple-400 block uppercase">Target Workspace</span>
            <div className="text-sm font-mono font-bold text-white flex items-center gap-2 truncate">
              <FolderGit2 className="w-4 h-4 text-purple-400 shrink-0" />
              {currentWorkspace || 'no-active-workspace'}
            </div>
          </div>

          {/* Create New Workspace Segment */}
          <form onSubmit={handleCreateWorkspace} className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block px-0.5">Provision Workspace</label>
            <div className="flex gap-2">
              <input 
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="New project name..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-purple-500/50"
              />
              <button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-500 text-white p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Switch Workspace Registry Selection List */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block px-0.5">Your Saved Registries ({workspaces.length})</label>
            <div className="space-y-1 max-h-36 overflow-y-auto bg-slate-950/50 rounded-xl border border-slate-900 p-1.5">
              {workspaces.length === 0 ? (
                <div className="text-[10px] font-mono text-slate-600 p-2 text-center italic">No sandboxes managed yet</div>
              ) : (
                workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => setCurrentWorkspace(ws.workspace_name)}
                    className={`w-full text-left font-mono text-xs p-2 rounded-lg transition-all truncate flex items-center justify-between cursor-pointer ${
                      currentWorkspace === ws.workspace_name 
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold' 
                        : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <span>/ {ws.workspace_name}</span>
                    {currentWorkspace === ws.workspace_name && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Archive Action Upload Dropzone DropZone */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block px-0.5">Ingest Project Assets</label>
            <div 
              onClick={() => !isIngesting && fileInputRef.current?.click()}
              className={`border border-dashed p-4 rounded-xl text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-950/30 ${
                isIngesting 
                  ? 'border-purple-500/40 bg-purple-500/5 animate-pulse cursor-not-allowed' 
                  : 'border-slate-800 hover:border-purple-500/40 hover:bg-purple-500/[0.02]'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleZipUpload} 
                accept=".zip" 
                disabled={isIngesting} 
                className="hidden" 
              />
              <UploadCloud className={`w-6 h-6 ${isIngesting ? 'text-purple-400' : 'text-slate-500'}`} />
              <div className="text-[11px] font-medium text-slate-300">
                {isIngesting ? "Parsing Codebase Contents..." : "Upload Project Target (.ZIP)"}
              </div>
              <div className="text-[9px] font-mono text-slate-600">Max limit ~50MB archive logs</div>
            </div>
          </div>

        </div>

        {/* Network Ecosystem Heartbeat Indicator */}
        <div className="pt-3 border-t border-slate-900/60 flex items-center justify-between text-[10px] font-mono text-slate-500 px-0.5 select-none">
          <div className="flex items-center gap-1.5">
            {isBackendAlive ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-slate-400">Node Synchronized</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span className="text-rose-400 font-bold">Node Broken</span>
              </>
            )}
          </div>
          <span className="text-slate-600 text-[9px]">v2.0.0-RAG</span>
        </div>
      </div>
      {/* --- MAIN CORE RAG TERMINAL CONSOLE VIEW --- */}
      <div className="flex-1 flex flex-col h-full bg-slate-950">
        
        {/* Stream Message History Viewer Pane */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role !== 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-purple-600/10 text-purple-400 flex items-center justify-center border border-purple-500/20 text-xs shrink-0 font-mono">
                      AI
                    </div>
                  )}
                  
                  <div className={`rounded-xl p-4 max-w-[85%] text-sm leading-relaxed border ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white border-purple-500/30 font-medium shadow-lg shadow-purple-600/10'
                      : 'bg-slate-900/40 text-slate-300 border-slate-900 backdrop-blur-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      /* ⚡ ADDED 'break-all' TO FORCE PATHS TO WRAP INSIDE THE BOX ENVIRONMENT */
                      <div className="prose prose-invert max-w-none text-slate-300 prose-sm font-sans tracking-wide whitespace-pre-line break-all">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text
                            .replace(/\\n/g, '\n')
                            /* ⚡ UPGRADED REGEX: Only replaces \t if NOT preceded by alphanumeric characters (protects Windows paths) */
                            .replace(/(?<![a-zA-Z0-9_])\\t/g, '    ')
                          }
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-slate-400 flex items-center justify-center border border-slate-800 text-xs shrink-0 font-mono uppercase">
                      ME
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Live Streaming LLM Processing Spinner Indicator */}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex gap-4 items-center text-slate-500 font-mono text-xs pl-12"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                Searching vector scopes and computing summary...
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Query Submission Form Area */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/80 backdrop-blur-md">
          <form onSubmit={handleQuerySubmit} className="max-w-3xl mx-auto flex gap-3 bg-slate-900/40 border border-slate-900 rounded-xl p-2 items-center focus-within:border-purple-500/30 transition-all">
            <Terminal className="w-4 h-4 text-slate-600 ml-2 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              placeholder={currentWorkspace ? `Ask about context inside [ ${currentWorkspace} ]...` : "Choose a workspace to toggle execution framework"}
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none py-1.5 disabled:cursor-not-allowed font-mono"
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading || !currentWorkspace}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-1.5 rounded-lg text-xs font-mono font-medium disabled:opacity-20 disabled:hover:bg-purple-600 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>SEND</span>
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}