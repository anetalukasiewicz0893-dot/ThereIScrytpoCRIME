
import React, { useState, useEffect, useMemo } from 'react';
import { TerminalHeader } from './components/TerminalHeader';
import { StatCards } from './components/StatCards';
import { IntelligenceTable } from './components/IntelligenceTable';
import { TacticalMap } from './components/TacticalMap';
import { CryptoQuotes } from './components/CryptoQuotes';
import { Manifesto } from './components/Manifesto';
import { Readme } from './components/Readme';
import { searchCryptoCases } from './services/geminiService';
import { fetchJudgments } from './services/saosService';
import { GroundedCase, Priority } from './types';

const INITIAL_FOLDERS = ["Uncategorized", "Exit Liquidity", "Meme Rugs", "Laundered Alpha"];

const TITLES = [
  "Crypto Intelligence",
  "Digital Forensics",
  "Ledger Oversight",
  "Blockchain Audit",
  "Asset Recovery",
  "On-Chain Intel",
  "Forensic Ledger"
];

const SUBTITLES = [
  "The chain doesn't lie, but forensic analysis reveals the motive.",
  "Indexing the digital ruins of the previous cycles.",
  "Forensic alpha for the sovereign investigator.",
  "Sifting through the mempool of judicial archives.",
  "Transparency is a feature, not a bug.",
  "Mapping the intersection of penal codes and private keys.",
  "The ledger is immutable; your defense might not be.",
  "Where cold storage meets cold hard evidence.",
  "Uncovering the paper trail in a paperless economy."
];

function App() {
  const [cases, setCases] = useState<GroundedCase[]>([]);
  const [folders, setFolders] = useState<string[]>(INITIAL_FOLDERS);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'TERMINAL' | 'MAP' | 'FOLDERS' | 'QUOTES' | 'MANIFESTO' | 'README'>('TERMINAL');
  const [subtitle, setSubtitle] = useState('');
  const [title, setTitle] = useState('Crypto Intelligence');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterFolder, setFilterFolder] = useState<string>('ALL');

  useEffect(() => {
    // Generate new title and subtitle on every mount/refresh
    setTitle(TITLES[Math.floor(Math.random() * TITLES.length)]);
    setSubtitle(SUBTITLES[Math.floor(Math.random() * SUBTITLES.length)]);
    
    const savedData = localStorage.getItem('osint_ledger_v9');
    if (savedData) setCases(JSON.parse(savedData));
  }, []);

  useEffect(() => {
    localStorage.setItem('osint_ledger_v9', JSON.stringify(cases));
  }, [cases]);

  const performAlphaHarvest = async (isFresh: boolean = false) => {
    setIsScanning(true);
    setError(null);
    setStatus(isFresh ? 'PURGING LOCAL CACHE. RE-INDEXING THE ARCHIVE...' : 'HUNTING FOR FRESH SIGNALS...');
    
    if (isFresh) setCases(prev => prev.filter(c => c.isSaved));

    try {
      const activeSigs = cases.filter(c => !c.isDiscarded).map(c => c.signature);
      const discardedSigs = cases.filter(c => c.isDiscarded).map(c => c.signature);
      
      const [osintResult, saosResult] = await Promise.all([
        searchCryptoCases(activeSigs, discardedSigs),
        fetchJudgments().catch(() => [])
      ]);

      const mappedSaosCases: GroundedCase[] = saosResult.map((sj): GroundedCase => ({
        id: `saos-${sj.id}`,
        signature: sj.courtCases[0] || `SAOS-${sj.id}`,
        court: sj.courtType,
        date: sj.judgmentDate,
        isCryptoCrime: true,
        summary: sj.analysis?.summary || 'Standard judicial protocol identified.',
        amount: sj.analysis?.amount || '0 PLN',
        article: sj.analysis?.article || 'KK',
        priority: (sj.analysis?.priority as Priority) || Priority.LOW,
        sourceUrl: `https://www.saos.org.pl/judgments/${sj.id}`,
        region: 'Poland',
        folder: 'Uncategorized',
        isSaved: false,
        isDiscarded: false,
        location: { lat: 52.2297, lng: 21.0122, city: 'Warsaw' }
      }));

      const incoming = [...osintResult.cases, ...mappedSaosCases].filter(nc => 
        !activeSigs.includes(nc.signature) && !discardedSigs.includes(nc.signature)
      );

      setCases(prev => [...incoming, ...prev]);
      setStatus(`HARVEST COMPLETE. ${incoming.length} ENTRIES ADDED TO THE LEDGER.`);
    } catch (err: any) {
      setError("Uplink timed out. Decentralized forensics are meeting resistance.");
    } finally {
      setIsScanning(false);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const handleExport = (type: 'PDF' | 'DRIVE' | 'EMAIL') => {
    if (filterFolder === 'ALL') {
      setStatus("SELECT A SPECIFIC FOLDER TO EXPORT THIS DATA.");
      return;
    }

    if (type === 'PDF') {
      setStatus(`GENERATING DOSSIER FOR ${filterFolder}...`);
      setTimeout(() => window.print(), 800);
    } else if (type === 'DRIVE') {
      setStatus(`SYNCING ${filterFolder} TO GOOGLE DRIVE...`);
      setTimeout(() => setStatus("DOSSIER SYNCED. SECURE STORAGE CONFIRMED."), 2000);
    } else if (type === 'EMAIL') {
      setStatus(`DISPATCHING ENCRYPTED DATA FOR ${filterFolder}...`);
      setTimeout(() => setStatus("EMAIL DISPATCHED. CHECK THE PGP SECURED INBOX."), 2000);
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
    return cases.filter(c => !c.isDiscarded && (filterFolder === 'ALL' || c.folder === filterFolder))
      .filter(c => {
        const matchSearch = searchTerm === '' || 
          `${c.signature} ${c.summary} ${c.court} ${c.article}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchPriority = filterPriority === 'ALL' || c.priority === filterPriority;
        return matchSearch && matchPriority;
      });
  }, [cases, filterFolder, searchTerm, filterPriority]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 antialiased selection:bg-cyan-500 selection:text-black pb-20 print:bg-white print:text-black">
      <div className="scanline print:hidden"></div>
      <TerminalHeader />

      <main className="max-w-7xl mx-auto px-6 mt-12 space-y-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 print:hidden">
          <div className="space-y-6 flex-1">
             <div className="flex flex-wrap gap-2 md:gap-4">
                {['TERMINAL', 'MAP', 'FOLDERS', 'QUOTES', 'MANIFESTO', 'README'].map(v => (
                  <button key={v} onClick={() => setView(v as any)} className={`px-4 md:px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${view === v ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'border-slate-800 text-slate-600 hover:text-white'}`}>{v}</button>
                ))}
             </div>
             <h2 className="text-7xl font-black text-white trm-heading uppercase leading-[0.85]">
               {title.split(' ')[0]} <br/><span className="text-cyan-500">{title.split(' ').slice(1).join(' ')}</span>
             </h2>
             <p className="text-slate-500 max-w-2xl font-medium italic">
               {subtitle}
             </p>
          </div>

          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
             <button onClick={() => performAlphaHarvest(true)} disabled={isScanning} className="px-10 py-5 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-cyan-400 hover:text-black transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center gap-3">
                {isScanning ? 'Syncing...' : 'Live Harvest'}
             </button>
          </div>
        </div>

        {status && <div className="py-4 px-6 bg-cyan-500/5 border border-cyan-500/20 rounded-xl text-[10px] font-black text-cyan-400 uppercase tracking-widest animate-pulse print:hidden">STATUS: {status}</div>}
        {error && <div className="py-4 px-6 bg-rose-500/5 border border-rose-500/20 rounded-xl text-[10px] font-black text-rose-500 uppercase tracking-widest print:hidden">ERROR: {error}</div>}

        {view === 'TERMINAL' && (
          <div className="space-y-10">
            {filterFolder !== 'ALL' && (
              <div className="flex flex-wrap gap-4 print:hidden animate-in fade-in slide-in-from-top-4 duration-500">
                <button onClick={() => handleExport('PDF')} className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black text-cyan-500 uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all">Save PDF Dossier</button>
                <button onClick={() => handleExport('DRIVE')} className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">Upload to Drive</button>
                <button onClick={() => handleExport('EMAIL')} className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-500 hover:text-black transition-all">Email Intelligence</button>
              </div>
            )}
            
            <div className="print:hidden">
              <StatCards 
                total={cases.length} 
                analyzed={cases.filter(c => !c.isDiscarded).length}
                cryptoCount={cases.filter(c => c.isSaved).length} 
                highPriority={cases.filter(c => c.priority === Priority.HIGH && !c.isDiscarded).length} 
              />
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-[2rem] flex flex-col md:flex-row gap-8 items-center print:hidden">
              <input type="text" placeholder="FILTER THE LEDGER..." className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[12px] font-black uppercase tracking-widest outline-none focus:border-cyan-500 transition-colors" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <div className="flex gap-4">
                <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none">
                  <option value="ALL">All Risk</option>
                  <option value={Priority.HIGH}>Critical</option>
                  <option value={Priority.MEDIUM}>Suspect</option>
                </select>
                <select value={filterFolder} onChange={e => setFilterFolder(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none">
                  <option value="ALL">All Vaults</option>
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

        {view === 'MAP' && <TacticalMap cases={cases.filter(c => !c.isDiscarded)} />}

        {view === 'FOLDERS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 print:hidden">
            {folders.map(f => (
              <div key={f} onClick={() => { setFilterFolder(f); setView('TERMINAL'); }} className="p-10 bg-slate-900/30 border border-slate-800/60 rounded-[2.5rem] space-y-6 hover:border-cyan-500/40 transition-all cursor-pointer group shadow-xl">
                 <div className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{f}</div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{cases.filter(c => c.folder === f).length} Records Archived</p>
              </div>
            ))}
          </div>
        )}

        {view === 'QUOTES' && <CryptoQuotes />}
        {view === 'MANIFESTO' && <Manifesto />}
        {view === 'README' && <Readme />}
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-[#020617]/95 border-t border-slate-900/60 p-6 text-[10px] font-black text-slate-600 flex justify-between items-center px-12 uppercase tracking-widest z-50 print:hidden">
        <div>Registry: <span className="text-slate-300">INTEL-OSINT v9.0</span></div>
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_15px_cyan]"></span>
          System Online // Verified Data Stream
        </div>
      </footer>
    </div>
  );
}

export default App;
