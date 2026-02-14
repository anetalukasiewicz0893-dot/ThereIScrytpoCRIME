
import React, { useState, useEffect, useMemo } from 'react';
import { TerminalHeader } from './components/TerminalHeader';
import { StatCards } from './components/StatCards';
import { IntelligenceTable } from './components/IntelligenceTable';
import { TacticalMap } from './components/TacticalMap';
import { searchCryptoCases } from './services/geminiService';
import { fetchJudgments } from './services/saosService';
import { GroundedCase, Priority } from './types';

const INITIAL_FOLDERS = ["Uncategorized", "Money Laundering", "Fraud", "Cyber-Theft", "AML Reports"];

function App() {
  const [cases, setCases] = useState<GroundedCase[]>([]);
  const [folders, setFolders] = useState<string[]>(INITIAL_FOLDERS);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'TERMINAL' | 'MAP' | 'FOLDERS'>('TERMINAL');
  
  // Filtering States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterFolder, setFilterFolder] = useState<string>('ALL');

  // Load from Persistence
  useEffect(() => {
    const savedData = localStorage.getItem('osint_ledger_v3');
    const savedFolders = localStorage.getItem('osint_folders_v3');
    if (savedData) {
      try {
        setCases(JSON.parse(savedData));
      } catch (e) {
        console.error("Archive corruption detected.");
      }
    }
    if (savedFolders) {
      setFolders(JSON.parse(savedFolders));
    }
  }, []);

  // Save on Change
  useEffect(() => {
    localStorage.setItem('osint_ledger_v3', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('osint_folders_v3', JSON.stringify(folders));
  }, [folders]);

  const performDeepScan = async () => {
    setIsScanning(true);
    setError(null);
    setStatus('CONDUCTING MASSIVE CROSS-SOURCE AUDIT...');
    
    try {
      const activeSignatures = cases.filter(c => !c.isDiscarded).map(c => c.signature);
      const discardedSignatures = cases.filter(c => c.isDiscarded).map(c => c.signature);
      
      // Multi-source acquisition
      const osintPromise = searchCryptoCases(activeSignatures, discardedSignatures);
      const saosPromise = fetchJudgments('kryptowaluta BTC waluta wirtualna').catch(() => []);

      const [osintResult, saosResult] = await Promise.all([osintPromise, saosPromise]);

      // Fix: Explicitly defined return type for map and cast region to literal union to avoid type widening to 'string'
      const mappedSaosCases: GroundedCase[] = saosResult.map((sj): GroundedCase => ({
        id: `saos-${sj.id}`,
        signature: sj.courtCases[0] || `SAOS-${sj.id}`,
        court: sj.courtType,
        date: sj.judgmentDate,
        isCryptoCrime: true,
        summary: sj.analysis?.summary || 'Historical judicial archival unit.',
        amount: sj.analysis?.amount || 'Unknown',
        article: sj.analysis?.article || 'KK',
        priority: (sj.analysis?.priority as Priority) || Priority.LOW,
        sourceUrl: `https://www.saos.org.pl/judgments/${sj.id}`,
        region: 'Poland' as 'Poland' | 'European Union',
        folder: 'Uncategorized',
        isSaved: false,
        isDiscarded: false,
        location: { lat: 52.2297, lng: 21.0122, city: 'Warsaw' } // Default map location for SAOS
      }));

      const incoming = [...osintResult.cases, ...mappedSaosCases].filter(nc => 
        !activeSignatures.includes(nc.signature) && !discardedSignatures.includes(nc.signature)
      );

      setCases(prev => [...incoming, ...prev]);
      setStatus(`SYNC COMPLETE. ${incoming.length} SIGNALS ACQUIRED.`);
    } catch (err: any) {
      setError("Uplink Interrupted: Source database timeout.");
    } finally {
      setIsScanning(false);
      setTimeout(() => setStatus(''), 4000);
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

  const addFolder = () => {
    const name = prompt("Enter Tactical Folder Name:");
    if (name && !folders.includes(name)) setFolders([...folders, name]);
  };

  const visibleCases = useMemo(() => {
    return cases.filter(c => !c.isDiscarded && (filterFolder === 'ALL' || c.folder === filterFolder));
  }, [cases, filterFolder]);

  const filteredCases = useMemo(() => {
    return visibleCases.filter(c => {
      const matchSearch = searchTerm === '' || 
        `${c.signature} ${c.summary} ${c.court} ${c.article}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPriority = filterPriority === 'ALL' || c.priority === filterPriority;
      return matchSearch && matchPriority;
    });
  }, [visibleCases, searchTerm, filterPriority]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 antialiased font-sans selection:bg-cyan-500 selection:text-white pb-20">
      <div className="scanline"></div>
      <TerminalHeader />

      <main className="max-w-7xl mx-auto px-6 mt-12 space-y-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
          <div className="space-y-6 flex-1">
             <div className="flex gap-4">
                {['TERMINAL', 'MAP', 'FOLDERS'].map(v => (
                  <button 
                    key={v}
                    onClick={() => setView(v as any)}
                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${
                      view === v ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'border-slate-800 text-slate-600 hover:text-white'
                    }`}
                  >
                    {v}
                  </button>
                ))}
             </div>
             <h2 className="text-7xl font-black text-white trm-heading uppercase leading-[0.85]">
               Forensic <br/><span className="text-cyan-500">Registry</span>
             </h2>
             <p className="text-slate-400 max-w-2xl font-medium">
               Real-time ingestion engine mapping criminal activity in the digital asset landscape. 
               Deduplicating signals across multiple judicial archives.
             </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
             <button
                onClick={performDeepScan}
                disabled={isScanning}
                className="px-10 py-5 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50"
             >
                {isScanning ? 'Synchronizing Archive...' : 'Refresh Forensic Intel'}
             </button>
             {view === 'FOLDERS' && (
                <button onClick={addFolder} className="px-8 py-5 border border-slate-800 rounded-xl text-slate-400 hover:text-white font-black text-xs uppercase tracking-widest transition-all">
                  Create Folder
                </button>
             )}
          </div>
        </div>

        {status && (
          <div className="py-4 px-6 bg-cyan-500/5 border border-cyan-500/20 rounded-xl text-[10px] font-black text-cyan-400 uppercase tracking-widest animate-pulse">
            SIGNAL: {status}
          </div>
        )}

        {error && (
          <div className="py-4 px-6 bg-rose-500/5 border border-rose-500/20 rounded-xl text-[10px] font-black text-rose-500 uppercase tracking-widest">
            ERROR: {error}
          </div>
        )}

        {view === 'TERMINAL' && (
          <div className="space-y-10">
            <StatCards 
              total={cases.length} 
              analyzed={cases.filter(c => !c.isDiscarded).length}
              cryptoCount={cases.filter(c => c.isSaved).length} 
              highPriority={cases.filter(c => c.priority === Priority.HIGH && !c.isDiscarded).length} 
            />

            <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-[2rem] flex flex-col md:flex-row gap-8 items-center backdrop-blur-3xl shadow-2xl">
              <div className="flex-1 w-full relative">
                 <input 
                   type="text" placeholder="FILTER SIGNATURES, ARTICLES OR JUDGMENTS..." 
                   className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[12px] font-black uppercase tracking-widest outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-800"
                   value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                 />
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer">
                  <option value="ALL">All Risk Levels</option>
                  <option value={Priority.HIGH}>Critical Risk</option>
                  <option value={Priority.MEDIUM}>Medium Risk</option>
                </select>
                <select value={filterFolder} onChange={e => setFilterFolder(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer">
                  <option value="ALL">All Folders</option>
                  {folders.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <IntelligenceTable 
               data={filteredCases} 
               onSave={id => handleAction(id, 'SAVE')}
               onDiscard={id => handleAction(id, 'DISCARD')}
               onMove={(id, f) => handleAction(id, 'MOVE', f)}
               folders={folders}
            />
          </div>
        )}

        {view === 'MAP' && <TacticalMap cases={visibleCases} />}

        {view === 'FOLDERS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {folders.map(f => (
              <div key={f} onClick={() => { setFilterFolder(f); setView('TERMINAL'); }} className="p-10 bg-slate-900/30 border border-slate-800/60 rounded-[2.5rem] space-y-6 hover:border-cyan-500/40 transition-all cursor-pointer group shadow-xl">
                 <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                 </div>
                 <div>
                    <h4 className="text-2xl font-black text-white">{f}</h4>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">
                      {cases.filter(c => c.folder === f && !c.isDiscarded).length} Signals Logged
                    </p>
                 </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-[#020617]/95 backdrop-blur-2xl border-t border-slate-900/60 p-6 text-[10px] font-black text-slate-600 flex justify-between items-center px-12 uppercase tracking-widest z-50">
        <div className="flex gap-16">
          <div>Registry: <span className="text-slate-300">OSINT ARCHIVE V3.2.1</span></div>
          <div className="hidden lg:block">Status: <span className="text-emerald-500">Live Datastream Active</span></div>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_15px_cyan]"></span>
          Encrypted Uplink
        </div>
      </footer>
    </div>
  );
}

export default App;
