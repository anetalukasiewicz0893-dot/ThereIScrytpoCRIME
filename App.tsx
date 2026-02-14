
import React, { useState, useEffect, useMemo } from 'react';
import { TerminalHeader } from './components/TerminalHeader';
import { StatCards } from './components/StatCards';
import { IntelligenceTable } from './components/IntelligenceTable';
import { TacticalMap } from './components/TacticalMap';
import { CryptoQuotes } from './components/CryptoQuotes';
import { Manifesto } from './components/Manifesto';
import { Readme } from './components/Readme';
import { searchCryptoCases } from './services/osintService';
import { fetchJudgments } from './services/saosService';
import { GroundedCase, Priority } from './types';

const INITIAL_FOLDERS = ["Uncategorized", "Exit Liquidity", "Meme Rugs", "Laundered Alpha"];

const TITLES = [
  "Crypto Intelligence",
  "Digital Forensics",
  "Ledger Oversight",
  "Blockchain Audit",
  "Asset Recovery",
  "On-Chain Intel"
];

const SUBTITLES = [
  "The chain doesn't lie, but forensic analysis reveals the motive.",
  "Indexing the digital ruins of the previous cycles.",
  "Forensic alpha for the sovereign investigator.",
  "Sifting through the mempool of judicial archives."
];

type ViewType = 'TERMINAL' | 'MAP' | 'FOLDERS' | 'QUOTES' | 'MANIFESTO' | 'README';

function App() {
  const [cases, setCases] = useState<GroundedCase[]>([]);
  const [folders, setFolders] = useState<string[]>(INITIAL_FOLDERS);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewType>('TERMINAL');
  const [subtitle, setSubtitle] = useState('');
  const [title, setTitle] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterFolder, setFilterFolder] = useState<string>('ALL');

  useEffect(() => {
    setTitle(TITLES[Math.floor(Math.random() * TITLES.length)]);
    setSubtitle(SUBTITLES[Math.floor(Math.random() * SUBTITLES.length)]);
    
    const savedData = localStorage.getItem('osint_ledger_v11');
    if (savedData) setCases(JSON.parse(savedData));
  }, []);

  useEffect(() => {
    localStorage.setItem('osint_ledger_v11', JSON.stringify(cases));
  }, [cases]);

  const performAlphaHarvest = async (isFresh: boolean = false) => {
    // Standard API key check - using process.env.API_KEY as provided by platform
    const hasKey = !!process.env.API_KEY;
    if (!hasKey) {
      setError("CRITICAL ERROR: API_KEY is missing from environment secrets.");
      return;
    }

    setIsScanning(true);
    setError(null);
    setStatus(isFresh ? 'PURGING LOCAL CACHE. RE-ESTABLISHING UPLINK...' : 'SCANNING FOR NEW SIGNATURES...');
    
    if (isFresh) setCases(prev => prev.filter(c => c.isSaved));

    try {
      const activeSigs = cases.filter(c => !c.isDiscarded).map(c => c.signature);
      const discardedSigs = cases.filter(c => c.isDiscarded).map(c => c.signature);
      
      const [osintResult, saosResult] = await Promise.all([
        searchCryptoCases(activeSigs, discardedSigs),
        fetchJudgments().catch((e) => {
          console.error("Judgments fetch failed", e);
          return [];
        })
      ]);

      const mappedSaosCases: GroundedCase[] = saosResult.map((sj): GroundedCase => ({
        id: `saos-${sj.id}`,
        signature: sj.courtCases[0] || `SAOS-${sj.id}`,
        court: sj.courtType,
        date: sj.judgmentDate,
        isCryptoCrime: true,
        summary: sj.analysis?.summary || 'Automated classification pending.',
        amount: sj.analysis?.amount || 'N/A',
        article: sj.analysis?.article || 'Unknown',
        priority: (sj.analysis?.priority as Priority) || Priority.LOW,
        sourceUrl: `https://www.saos.org.pl/judgments/${sj.id}`,
        region: 'Poland',
        folder: 'Uncategorized',
        isSaved: false,
        isDiscarded: false,
        location: { lat: 52.2297 + (Math.random() - 0.5) * 5, lng: 21.0122 + (Math.random() - 0.5) * 5, city: 'Scanning...' }
      }));

      const incoming = [...osintResult.cases, ...mappedSaosCases].filter(nc => 
        !activeSigs.includes(nc.signature) && !discardedSigs.includes(nc.signature)
      );

      setCases(prev => [...incoming, ...prev]);
      setStatus(`UPLINK SYNCED. ${incoming.length} NEW NODES FOUND.`);
    } catch (err: any) {
      setError(`UPLINK FAILURE: ${err.message || 'Check API Configuration'}`);
    } finally {
      setIsScanning(false);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const handleAction = (id: string, action: 'SAVE' | 'DISCARD' | 'MOVE', value?: string) => {
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
      <div className="scanline print:hidden"></div>
      <TerminalHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{title}</h2>
            <p className="text-slate-500 font-medium tracking-wide italic">{subtitle}</p>
          </div>
          <div className="flex gap-4">
             <button 
               onClick={() => performAlphaHarvest()}
               disabled={isScanning}
               className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isScanning ? 'bg-slate-900 text-slate-700 cursor-not-allowed' : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_20px_rgba(8,145,178,0.3)]'}`}
             >
               {isScanning ? 'Syncing...' : 'Live Harvest'}
             </button>
             <button 
               onClick={() => setView(view === 'TERMINAL' ? 'MAP' : 'TERMINAL')}
               className="px-8 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
             >
               {view === 'TERMINAL' ? 'Tactical Map' : 'Terminal UI'}
             </button>
          </div>
        </div>

        <StatCards {...stats} />

        <div className="flex gap-4 border-b border-slate-900 pb-2 overflow-x-auto whitespace-nowrap">
          {(['TERMINAL', 'MAP', 'FOLDERS', 'QUOTES', 'MANIFESTO', 'README'] as ViewType[]).map(v => (
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
            <p className="text-xs text-rose-400 font-bold uppercase tracking-widest leading-relaxed">
              {error} <br/> 
              <span className="text-[10px] opacity-60 text-slate-400">Please verify the signal connection and environment parameters.</span>
            </p>
          </div>
        )}

        {status && (
          <div className="text-[10px] font-mono text-cyan-500 animate-pulse tracking-widest uppercase py-2">
            >> {status}
          </div>
        )}

        <div className="space-y-12">
          {view === 'TERMINAL' && (
            <IntelligenceTable 
              data={filteredCases} 
              onSave={(id) => handleAction(id, 'SAVE')}
              onDiscard={(id) => handleAction(id, 'DISCARD')}
              onMove={(id, folder) => handleAction(id, 'MOVE', folder)}
              folders={folders}
            />
          )}
          {view === 'MAP' && <TacticalMap cases={filteredCases} />}
          {view === 'QUOTES' && <CryptoQuotes />}
          {view === 'MANIFESTO' && <Manifesto />}
          {view === 'README' && <Readme />}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-[#020617]/95 border-t border-slate-900/60 p-4 text-[9px] font-black text-slate-600 flex justify-between items-center px-12 uppercase tracking-widest z-50 print:hidden">
        <div>Registry: OSINT-INTEL v11.0.4</div>
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_cyan]"></span>
          Tactical Link Established
        </div>
      </footer>
    </div>
  );
}

export default App;
