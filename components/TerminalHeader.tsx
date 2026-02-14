
import React from 'react';

export const TerminalHeader: React.FC = () => {
  return (
    <div className="border-b border-slate-800/60 bg-slate-950/40 p-5 backdrop-blur-xl sticky top-0 z-50 print:hidden">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 bg-cyan-600 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-tight uppercase">
              Rug-Pull Intelligence Terminal
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] text-slate-500 font-mono font-medium tracking-wider uppercase">
                Status: Indexing the Alpha
              </p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[10px] font-mono font-semibold text-slate-500 tracking-widest uppercase">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-md border border-slate-800">
            Node: CT-MAINNET-VOICE
          </div>
          <div>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        </div>
      </div>
    </div>
  );
};
