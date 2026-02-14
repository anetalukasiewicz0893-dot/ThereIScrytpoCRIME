import React, { useState, useEffect, useMemo } from 'react';
import { TerminalHeader } from './components/TerminalHeader';
import { StatCards } from './components/StatCards';
import { IntelligenceTable } from './components/IntelligenceTable';
import { TacticalMap } from './components/TacticalMap';
import { FolderView } from './components/FolderView';
import { TerminalLog } from './components/TerminalLog';
import { CryptoQuotes } from './components/CryptoQuotes';
import { Readme } from './components/Readme';
import { searchCryptoCases } from './services/osintService';
import { fetchJudgments } from './services/saosService';
import { GroundedCase, Priority } from './types';
import { getCurrentModel, isProAvailable } from './services/aiClient';

const INITIAL_FOLDERS = ["Uncategorized", "Exit Liquidity", "Meme Rugs", "Laundered Alpha"];
const STORAGE_KEY = 'osint_ledger_v12_final_v2'; 

const TITLES = [
  "Crypto Intelligence", "Digital Forensics", "Ledger Oversight", 
  "Blockchain Audit", "Asset Recovery", "On-Chain Intel"
];

const SUBTITLES = [
  "The chain doesn't lie, but forensic analysis reveals the motive.",
  "Indexing the digital ruins of the previous cycles.",
  "Forensic alpha for the sovereign investigator.",
  "Sifting through the mempool of judicial archives."
];

type ViewType = 'TERMINAL' | 'MAP' | 'FOLDERS' | 'QUOTES' | 'README';

function App() {
  const [cases, setCases] = useState<GroundedCase[]>([]);
  const [folders] = useState<string[]>(INITIAL_FOLDERS);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewType>('TERMINAL');
  const [subtitle, setSubtitle] = useState('');
  const [title, setTitle] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority] = useState<string>('ALL');
  const [filterFolder] = useState<string>('ALL');
  const [aiModelStatus, setAiModelStatus] = useState({
    name: getCurrentModel(),
    isPro: isProAvailable()
  });

  // Listen for AI model changes (fallbacks)
  useEffect(() => {
    const handleFallback = () => {
      setAiModelStatus({
        name: getCurrentModel(),
        isPro: isProAvailable()
      });
      addLog("ENGINE ALERT: Pro intelligence tokens exhausted. Falling back to Flash core.", "WARN");
    };

    window.addEventListener('ai-model-fallback', handleFallback);
    return () => window.removeEventListener('ai-model-fallback', handleFallback);
  }, []);

  // LOAD DATA ON MOUNT
  useEffect(() => {
    setTitle(TITLES[Math.floor(Math.random() * TITLES.length)]);
    setSubtitle(SUBTITLES[Math.floor(Math.random() * SUBTITLES.length)]);
    
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed)) {
          setCases(parsed);
          addLog(`Restored ${parsed.length} intelligence nodes from local archive.`, "INFO");
        }
      } catch (e) {
        console.error("Failed to restore ledger data:", e);
      }
    }

    const savedView = localStorage.getItem('osint_view_pref');
    if (savedView && ['TERMINAL', 'MAP', 'FOLDERS', 'QUOTES', 'README'].includes(savedView)) {
      setView(savedView as ViewType);
    }
  }, []);

  // SAVE DATA ON CHANGE
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('osint_view_pref', view);
  }, [view]);

  const addLog = (message: string, level: 'INFO' | 'WARN' | 'CRIT' | 'SIGNAL' = 'INFO') => {
    setLogs(prev => [...prev.slice(-49), {
      timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      message,
      level
    }]);
  };

  const clearDatabase = () => {
    if (confirm("PROTOCOL ALERT: Permanent deletion of all signal intelligence. Confirm purge?")) {
      localStorage.removeItem(STORAGE_KEY);
      setCases([]);
      addLog("Manual database purge complete. Operating on clean slate.", "WARN");
    }
  };

  const performAlphaHarvest = async () => {
    const apiKeyAvailable = (typeof process !== 'undefined' && process.env?.API_KEY) || (window as any).API_KEY;

    if (!apiKeyAvailable) {
      setError("UPLINK FAILURE: Missing Gemini API Key. Verify environment secrets.");
      addLog("CRITICAL: Signal uplink failed (Missing Credentials)", "CRIT");
      return;
    }

    setIsScanning(true);
    setError(null);
    setStatus(`HARVESTING WITH ${aiModelStatus.name.split('-')[1].toUpperCase()} CORE...`);
    
    const activeSigs = cases.filter(c => !c.isDiscarded).map(c => c.signature);
    const discardedSigs = cases.filter(c => c.isDiscarded).map(c => c.signature);
    const allKnownSigs = Array.from(new Set([...activeSigs, ...discardedSigs]));

    addLog(`Initiating OSINT sweep. Excluded ${allKnownSigs.length} known nodes.`, "INFO");

    try {
      const [osintResult, saosResult] = await Promise.all([
        searchCryptoCases(activeSigs, discardedSigs),
        fetchJudgments(allKnownSigs).catch(() => [])
      ]);

      const mappedSaosCases: GroundedCase[] = saosResult.map((sj): GroundedCase => ({
        id: `saos-${sj.id}-${Date.now()}`,
        signature: sj.courtCases[0] || `SAOS-${sj.id}`,
        court: sj.courtType,
        date: sj.judgmentDate,
        isCryptoCrime: true,
        summary: sj.analysis?.summary || 'Classification pending.',
        amount: sj.analysis?.amount || 'N/A',
        article: sj.analysis?.article || 'Unknown',
        priority: (sj.analysis?.priority as Priority) || Priority.LOW,
        sourceUrl: (sj as any).sourceUrl || `https://www.saos.org.pl/judgments/${sj.id}`,
        region: 'Poland',
        folder: 'Uncategorized',
        isSaved: false,
        isDiscarded: false,
        location: { 
          lat: 52.2297 + (Math.random() - 0.5) * 5, 
          lng: 21.0122 + (Math.random() - 0.5) * 5, 
          city: 'SAOS Node' 
        }
      }));

      const incoming = [...osintResult.cases, ...mappedSaosCases].filter(nc => 
        !allKnownSigs.includes(nc.signature)
      );

      if (incoming.length === 0) {
        setStatus('HARVEST COMPLETE. SYSTEM SYNCHRONIZED.');
        addLog("No new unique signatures detected in current broadcast.", "INFO");
      } else {
        setCases(prev => [...incoming, ...prev]);
        setStatus(`UPLINK SYNCED. ${incoming.length} UNIQUE NODES FOUND.`);
        addLog(`Integration complete. Added ${incoming.length} new records.`, "SIGNAL");
      }
    } catch (err: any) {
      setError(`UPLINK FAILURE: ${err.message || 'Check Connection'}`);
      addLog(`Pipeline crash: ${err.message}`, "CRIT");
    } finally {
      setIsScanning(false);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const handleAction = (id: string, action: 'SAVE' | 'DISCARD' | 'MOVE' | 'DELETE', value?: string) => {
    if (action === 'DELETE') {
      setCases(prev => prev.filter(c => c.id !== id));
      addLog("Node purged from database.", "WARN");
      return;
    }

    setCases(prev => prev.map(c => {
      if (c.id !== id) return c;
      if (action === 'SAVE') return { ...c, isSaved: !c.isSaved };
      if (action === 'DISCARD') return { ...c, isDiscarded: true };
      if (action === 'MOVE') return { ...c, folder: value };
      return c;
    }));
  };

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch = c.signature.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           c.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'ALL' || (c.priority as string) === filterPriority;
      const matchesFolder = filterFolder === 'ALL' || c.folder === filterFolder;
      return matchesSearch && matchesPriority && matchesFolder && !c.isDiscarded;
    });
  }, [cases, searchTerm, filterPriority, filterFolder]);

  const stats = useMemo(() => ({
    total: cases.length,
    analyzed: cases.filter(c => c.isCryptoCrime).length,
    cryptoCount: cases.filter(c => c.isCryptoCrime).length,
    highPriority: cases.filter(c => c.priority === Priority.HIGH).length
  }), [cases]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="scanline print:hidden opacity-30"></div>
      <TerminalHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12 pb-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{title}</h2>
            <div className="flex items-center gap-3">
              <p className="text-slate-500 font-medium tracking-wide italic">{subtitle}</p>
              <div className="h-px w-8 bg-slate-800"></div>
              <div className={`flex items-center gap-2 px-2 py-0.5 rounded border ${aiModelStatus.isPro ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${aiModelStatus.isPro ? 'bg-cyan-500' : 'bg-amber-500 animate-pulse'}`}></div>
                <span className={`text-[8px] font-black uppercase tracking-widest ${aiModelStatus.isPro ? 'text-cyan-500' : 'text-amber-500'}`}>
                  Engine: {aiModelStatus.isPro ? 'Pro Active' : 'Flash Fallback'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
             <button 
               onClick={performAlphaHarvest}
               disabled={isScanning}
               className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isScanning ? 'bg-slate-900 text-slate-700 cursor-not-allowed animate-pulse' : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_20px_rgba(8,145,178,0.3)]'}`}
             >
               {isScanning ? 'Syncing...' : 'Live Harvest'}
             </button>
             <button 
               onClick={clearDatabase}
               className="px-6 py-3 bg-rose-950/20 border border-rose-900/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-900/30 transition-all"
             >
               Purge Database
             </button>
          </div>
        </div>

        <StatCards {...stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex gap-4 border-b border-slate-900 pb-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {(['TERMINAL', 'MAP', 'FOLDERS', 'QUOTES', 'README'] as ViewType[]).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`pb-4 px-4 text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  {v}
                </button>
              ))}
            </div>

            {error && (
              <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-3xl space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <h4 className="text-sm font-black text-rose-500 uppercase tracking-widest">Protocol Error</h4>
                </div>
                <p className="text-xs text-rose-400 font-bold uppercase tracking-widest leading-relaxed">{error}</p>
                {!aiModelStatus.isPro && (
                  <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest bg-amber-500/10 p-2 rounded inline-block mt-2">
                    Note: Pro model tokens are exhausted. Switching to Free/Flash version.
                  </p>
                )}
              </div>
            )}

            {status && <div className="text-[10px] font-mono text-cyan-500 animate-pulse tracking-widest uppercase py-2">>> {status}</div>}

            <div className="space-y-12 min-h-[400px]">
              {view === 'TERMINAL' && (
                <IntelligenceTable 
                  data={filteredCases} 
                  onSave={(id) => handleAction(id, 'SAVE')}
                  onDiscard={(id) => handleAction(id, 'DISCARD')}
                  onDelete={(id) => handleAction(id, 'DELETE')}
                  onMove={(id, folder) => handleAction(id, 'MOVE', folder)}
                  folders={folders}
                />
              )}
              {view === 'MAP' && <TacticalMap cases={filteredCases} />}
              {view === 'FOLDERS' && <FolderView cases={cases} folders={folders} onAction={handleAction} />}
              {view === 'QUOTES' && <CryptoQuotes />}
              {view === 'README' && <Readme />}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <TerminalLog logs={logs} />
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-[#020617]/95 border-t border-slate-900/60 p-4 text-[9px] font-black text-slate-600 flex justify-between items-center px-12 uppercase tracking-widest z-50 print:hidden backdrop-blur-md">
        <div>Registry: OSINT-INTEL v12.1.2 // PERSISTENT STORAGE ACTIVE</div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
             <span className={`text-[8px] font-bold ${aiModelStatus.isPro ? 'text-cyan-800' : 'text-amber-800'}`}>INTEL_CORE: {aiModelStatus.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_cyan]"></span>
            Tactical Link Established
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;