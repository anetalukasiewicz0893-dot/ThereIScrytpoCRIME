import React, { useState, useMemo, useEffect } from 'react';
import { GroundedCase, Priority } from '../types';
import { generateForensicReport } from '../utils/export';

interface FolderViewProps {
  cases: GroundedCase[];
  folders: string[];
  onAction: (id: string, action: 'SAVE' | 'DISCARD' | 'MOVE', value?: string) => void;
}

export const FolderView: React.FC<FolderViewProps> = ({ cases, folders, onAction }) => {
  // Initialize state from localStorage or default to 'VAULT'
  const [selectedFolder, setSelectedFolder] = useState<string>(() => {
    const saved = localStorage.getItem('osint_folder_pref');
    return saved || 'VAULT';
  });

  // Persist selected folder whenever it changes
  useEffect(() => {
    localStorage.setItem('osint_folder_pref', selectedFolder);
  }, [selectedFolder]);

  const vaultCases = useMemo(() => cases.filter(c => c.isSaved && !c.isDiscarded), [cases]);
  
  const folderStats = useMemo(() => {
    const stats: Record<string, number> = {};
    folders.forEach(f => {
      stats[f] = cases.filter(c => c.folder === f && !c.isDiscarded).length;
    });
    return stats;
  }, [cases, folders]);

  const activeCases = useMemo(() => {
    if (selectedFolder === 'VAULT') return vaultCases;
    return cases.filter(c => c.folder === selectedFolder && !c.isDiscarded);
  }, [cases, selectedFolder, vaultCases]);

  const handleExport = () => {
    generateForensicReport(activeCases, selectedFolder);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Special Vault Folder */}
        <button 
          onClick={() => setSelectedFolder('VAULT')}
          className={`relative p-6 rounded-2xl border transition-all text-left group overflow-hidden ${
            selectedFolder === 'VAULT' 
            ? 'bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-500/20' 
            : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'
          }`}
        >
          <div className="flex flex-col h-full justify-between gap-4">
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-lg ${selectedFolder === 'VAULT' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-[10px] font-mono font-black text-slate-500">01</span>
            </div>
            <div>
              <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${selectedFolder === 'VAULT' ? 'text-cyan-400' : 'text-slate-100'}`}>The Vault</h4>
              <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{vaultCases.length} PINNED ENTRIES</p>
            </div>
          </div>
          {selectedFolder === 'VAULT' && <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 blur-2xl rounded-full -mr-8 -mt-8"></div>}
        </button>

        {/* Dynamic Folders */}
        {folders.map((folder, idx) => (
          <button 
            key={folder}
            onClick={() => setSelectedFolder(folder)}
            className={`relative p-6 rounded-2xl border transition-all text-left group overflow-hidden ${
              selectedFolder === folder 
              ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/20' 
              : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'
            }`}
          >
            <div className="flex flex-col h-full justify-between gap-4">
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg ${selectedFolder === folder ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <span className="text-[10px] font-mono font-black text-slate-500">{(idx + 2).toString().padStart(2, '0')}</span>
              </div>
              <div>
                <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${selectedFolder === folder ? 'text-emerald-400' : 'text-slate-100'}`}>{folder}</h4>
                <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{folderStats[folder] || 0} NODES</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1">
            <h3 className="text-sm font-black text-white uppercase tracking-widest whitespace-nowrap">
              Directory: <span className="text-cyan-500">{selectedFolder}</span>
            </h3>
            <div className="h-px w-full bg-slate-900"></div>
          </div>
          {activeCases.length > 0 && (
            <button 
              onClick={handleExport}
              className="ml-6 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center gap-2"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Brief
            </button>
          )}
        </div>

        {activeCases.length === 0 ? (
          <div className="p-20 border-2 border-dashed border-slate-900 rounded-[2rem] text-center bg-slate-950/20">
            <p className="text-slate-600 font-black text-[10px] uppercase tracking-[0.4em]">Empty Protocol // No Intelligence Assets in this Sector</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeCases.map(item => (
              <div key={item.id} className="bg-slate-900/30 border border-slate-800/60 p-8 rounded-3xl group hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h5 className="text-xs font-black text-white uppercase group-hover:text-cyan-400 transition-colors">{item.signature}</h5>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">{item.court}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${item.priority === Priority.HIGH ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-800 text-slate-400'}`}>
                      {item.priority} RISK
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-400 italic mb-6">"{item.summary}"</p>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-slate-800/40">
                  <div className="text-[10px] font-mono text-cyan-600 font-bold uppercase">{item.amount}</div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => onAction(item.id, 'SAVE')}
                      className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest"
                    >
                      {item.isSaved ? 'Unpin' : 'Pin'}
                    </button>
                    <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-[9px] font-black text-cyan-600 hover:text-cyan-400 uppercase tracking-widest">Source</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};