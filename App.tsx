
import React, { useState, useEffect, useMemo } from 'react';
import { TerminalHeader } from './components/TerminalHeader';
import { StatCards } from './components/StatCards';
import { IntelligenceTable } from './components/IntelligenceTable';
import { searchCryptoCases } from './services/geminiService';
import { fetchJudgments } from './services/saosService';
import { GroundedCase, Priority } from './types';

function App() {
  const [cases, setCases] = useState<GroundedCase[]>([]);
  const [sources, setSources] = useState<{title: string, uri: string}[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  
  // Filtering States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterRegion, setFilterRegion] = useState<string>('ALL');

  useEffect(() => {
    const saved = localStorage.getItem('crypto_judicial_archive');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCases(parsed);
      } catch (e) {
        console.error("Failed to load archive");
      }
    }
  }, []);

  const performDeepScan = async (isRefresh = false) => {
    setIsScanning(true);
    setError(null);
    setStatus(isRefresh ? 'SYNCHRONIZING GLOBAL ARCHIVE DATA...' : 'CONDUCTING EXHAUSTIVE KK-STATUTE AUDIT...');
    
    try {
      const existingSignatures = isRefresh ? [] : cases.map(c => c.signature);
      
      // 1. Broad OSINT Search (Google Grounding)
      const osintResult = await searchCryptoCases(existingSignatures);
      
      // 2. Deep Archival Scan (SAOS + Gemini Analysis)
      const saosResult = await fetchJudgments().catch(err => {
        console.warn("Archival scan uplink limited:", err);
        return [];
      });

      // 3. Convert SAOS results to GroundedCase format
      // Fix: Explicitly cast the region to match the union type defined in types.ts
      const mappedSaosCases: GroundedCase[] = saosResult.map(sj => ({
        id: `saos-${sj.id}`,
        signature: sj.courtCases[0] || `SAOS-${sj.id}`,
        court: sj.courtType,
        date: sj.judgmentDate,
        isCryptoCrime: sj.analysis?.isCryptoCrime || true,
        summary: sj.analysis?.summary || 'Archived Judicial Record.',
        amount: sj.analysis?.amount || 'Unknown',
        article: sj.analysis?.article || 'KK',
        priority: (sj.analysis?.priority as Priority) || Priority.LOW,
        sourceUrl: `https://www.saos.org.pl/judgments/${sj.id}`,
        region: 'Poland' as 'Poland' | 'European Union',
        euContext: 'Direct statutory violation from Polish National Archive.'
      }));

      // 4. Merge results
      let combinedCases = isRefresh ? [...osintResult.cases, ...mappedSaosCases] : [...cases];
      
      if (!isRefresh) {
        [...osintResult.cases, ...mappedSaosCases].forEach(nc => {
          if (!combinedCases.find(c => c.signature === nc.signature)) {
            combinedCases.push(nc);
          }
        });
      }

      // 5. Sort and Deduplicate
      const uniqueCases = Array.from(new Map(combinedCases.map(c => [c.signature, c])).values())
        .sort((a, b) => b.date.localeCompare(a.date));

      setCases(uniqueCases);
      setSources(osintResult.sources);
      
      localStorage.setItem('crypto_judicial_archive', JSON.stringify(uniqueCases));

      setStatus(isRefresh ? "LEDGER REFRESHED." : "NEW INTELLIGENCE ACQUIRED.");
      setTimeout(() => setStatus(''), 3000);
    } catch (err: any) {
      console.error(err);
      setError("Archive Uplink Interrupted. Verify API connectivity and re-attempt synchronization.");
    } finally {
      setIsScanning(false);
      if (!error) setStatus('');
    }
  };

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const keywords = searchTerm.toLowerCase().split(' ').filter(k => k.length > 0);
      const textToSearch = `${c.signature} ${c.court} ${c.summary} ${c.article} ${c.euContext || ''}`.toLowerCase();
      
      const matchesSearch = keywords.length === 0 || keywords.every(k => textToSearch.includes(k));
      const matchesPriority = filterPriority === 'ALL' || c.priority === filterPriority;
      const matchesRegion = filterRegion === 'ALL' || c.region === filterRegion;

      return matchesSearch && matchesPriority && matchesRegion;
    });
  }, [cases, searchTerm, filterPriority, filterRegion]);

  return (
    <div className="min-h-screen pb-20 bg-[#020617] text-slate-300 antialiased selection:bg-cyan-500 selection:text-white">
      <div className="scanline"></div>
      
      <TerminalHeader />

      <main className="max-w-7xl mx-auto px-6 mt-16 space-y-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">
              Judicial Forensic Intelligence
            </div>
            <h2 className="text-5xl md:text-8xl font-black text-white trm-heading uppercase leading-[0.85]">
              Crypto Crime <br/><span className="text-cyan-600">Ledger</span>
            </h2>
            <div className="max-w-3xl space-y-5">
              <p className="text-white text-xl md:text-2xl font-bold leading-tight tracking-tight">
                Forensic repository of judicial evidence regarding crypto-specific offenses.
              </p>
              <p className="text-slate-400 text-base leading-relaxed font-medium">
                The intelligence layer for cross-border digital asset litigation. 
                Tracking every critical enforcement action, Penal Code (KK) violation, 
                and judicial precedent across Poland and the European Union.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {cases.length === 0 ? (
              <button
                onClick={() => performDeepScan(false)}
                disabled={isScanning}
                className="px-12 py-5 rounded-lg bg-white text-black hover:bg-slate-200 font-black text-xs uppercase tracking-[0.15em] transition-all shadow-2xl active:scale-95 border border-white disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
              >
                {isScanning ? 'Querying Archives...' : 'Initiate Full Audit'}
              </button>
            ) : (
              <button 
                onClick={() => performDeepScan(true)}
                disabled={isScanning}
                className="px-10 py-5 border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 rounded-lg text-cyan-400 hover:text-cyan-300 transition-all font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.1)] active:scale-95 disabled:opacity-50"
              >
                <svg className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isScanning ? 'Synchronizing...' : 'Refresh Ledger'}
              </button>
            )}
          </div>
        </div>

        {status && (
          <div className="py-3 px-5 bg-cyan-500/5 border-l-4 border-cyan-500 rounded-r-md text-[10px] font-mono text-cyan-400 uppercase tracking-[0.35em] font-black animate-pulse">
            {status}
          </div>
        )}

        {error && (
          <div className="p-5 bg-rose-500/5 border-l-4 border-rose-600 rounded-r-md text-rose-500 text-xs font-black flex items-center gap-3">
            <span className="w-2 h-2 bg-rose-600 rounded-full animate-ping"></span>
            SYSTEM ALERT: {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-14">
          <StatCards 
            total={cases.length} 
            analyzed={cases.length}
            cryptoCount={cases.filter(c => c.isCryptoCrime).length} 
            highPriority={cases.filter(c => c.priority === Priority.HIGH).length} 
          />

          <div className="space-y-8">
            {cases.length > 0 && (
              <div className="bg-slate-900/20 border border-slate-800/40 p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-center backdrop-blur-sm">
                <div className="flex-1 w-full relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="KEYWORD SEARCH (e.g. 'Art. 299', 'Pranie brudnych pieniędzy', 'Warszawa')..." 
                    className="block w-full pl-12 pr-4 py-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-[12px] font-black text-white focus:outline-none focus:border-cyan-500/50 transition-all uppercase tracking-widest placeholder:text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <div className="relative group">
                    <select 
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="bg-slate-950/80 border border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-2xl focus:outline-none focus:border-cyan-500/50 appearance-none min-w-[160px] cursor-pointer hover:text-white transition-colors"
                    >
                      <option value="ALL">Risk: All</option>
                      <option value={Priority.HIGH}>Risk: Critical</option>
                      <option value={Priority.MEDIUM}>Risk: Elevated</option>
                      <option value={Priority.LOW}>Risk: Normal</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="3"/></svg>
                    </div>
                  </div>
                  <div className="relative group">
                    <select 
                      value={filterRegion}
                      onChange={(e) => setFilterRegion(e.target.value)}
                      className="bg-slate-950/80 border border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-2xl focus:outline-none focus:border-cyan-500/50 appearance-none min-w-[160px] cursor-pointer hover:text-white transition-colors"
                    >
                      <option value="ALL">Region: All</option>
                      <option value="Poland">Poland (KK)</option>
                      <option value="European Union">EU (Supranational)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="3"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">
                  {filteredCases.length} Forensic Signals Detected
                </h3>
                <div className="h-px flex-1 bg-slate-800/40"></div>
              </div>
              <IntelligenceTable data={filteredCases} />
            </div>
          </div>

          {sources.length > 0 && (
            <div className="p-12 bg-slate-900/10 border border-slate-800/50 rounded-[2rem] space-y-10">
               <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] flex items-center gap-4">
                 <span className="w-3 h-3 bg-cyan-600 rounded-sm rotate-45"></span> 
                 Data Lineage & Source Grounding
               </h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12">
                 {sources.slice(0, 16).map((s, idx) => (
                   <a key={idx} href={s.uri} target="_blank" rel="noreferrer" className="group block space-y-2.5">
                     <div className="text-[13px] text-slate-400 group-hover:text-cyan-400 font-bold leading-snug transition-colors line-clamp-1">
                       {s.title}
                     </div>
                     <div className="text-[9px] text-slate-600 font-mono tracking-tighter uppercase flex items-center gap-2">
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        {new URL(s.uri).hostname.replace('www.', '')}
                     </div>
                   </a>
                 ))}
               </div>
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-[#020617]/98 backdrop-blur-3xl border-t border-slate-900/80 p-6 text-[10px] font-black text-slate-600 z-50 flex justify-between items-center px-14 uppercase tracking-[0.2em]">
        <div className="flex gap-16">
          <div>Registry: <span className="text-slate-400">KK Statute Forensic Audit</span></div>
          <div className="hidden lg:block">Architecture: <span className="text-slate-400">Immutable Deployment State</span></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]"></div>
          <span className="text-slate-500">Archive Synchronized</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
