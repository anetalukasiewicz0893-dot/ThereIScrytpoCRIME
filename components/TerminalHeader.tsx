
import React from 'react';

interface TerminalHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="border-b border-slate-800/60 bg-slate-950/40 p-5 backdrop-blur-xl sticky top-0 z-50 print:hidden">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 bg-cyan-600 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-tight uppercase">
              Crypto-Crime OSINT
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] text-slate-500 font-mono font-medium tracking-wider uppercase">
                Status: Live Feed Active
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8">
          <div className="relative group hidden sm:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-3 w-3 text-slate-500 group-focus-within:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="SEARCH CASES..." 
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-slate-900/50 border border-slate-800/60 rounded-lg pl-9 pr-4 py-2 text-[10px] font-black text-slate-300 placeholder-slate-600 uppercase tracking-widest outline-none focus:border-cyan-500/50 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500/20 transition-all w-48 lg:w-64"
            />
          </div>

          <div className="hidden md:flex items-center gap-6 text-[10px] font-mono font-semibold text-slate-500 tracking-widest uppercase">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-md border border-slate-800">
              UPLINK: ACTIVE
            </div>
            <div className="hidden lg:block">{new Date().toLocaleDateString('en-GB')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
