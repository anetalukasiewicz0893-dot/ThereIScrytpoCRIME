
import React from 'react';

interface StatCardsProps {
  total: number;
  analyzed: number;
  cryptoCount: number;
  highPriority: number;
}

export const StatCards: React.FC<StatCardsProps> = ({ total, analyzed, cryptoCount, highPriority }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-slate-900/40 border border-slate-800/60 p-7 rounded-2xl">
        <div className="text-slate-500 text-[10px] font-black mb-2 uppercase tracking-[0.3em]">Cumulative Records</div>
        <div className="text-4xl font-black text-white tracking-tighter">{total}</div>
        <div className="text-[9px] text-slate-600 mt-2 font-bold uppercase tracking-widest">Identified Judicial Units</div>
      </div>
      <div className="bg-slate-900/40 border border-slate-800/60 p-7 rounded-2xl">
        <div className="text-slate-500 text-[10px] font-black mb-2 uppercase tracking-[0.3em]">Analysis Coverage</div>
        <div className="text-3xl font-black text-white tracking-tighter flex items-baseline gap-2">
          {analyzed} <span className="text-slate-700 text-lg">/ {total}</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 mt-4 rounded-full overflow-hidden">
          <div 
            className="bg-white h-full transition-all duration-1000 ease-out" 
            style={{ width: `${total > 0 ? (analyzed / total) * 100 : 0}%` }}
          ></div>
        </div>
      </div>
      <div className="bg-slate-900/40 border border-slate-800/60 p-7 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <div className="w-20 h-20 bg-cyan-500 rounded-full blur-3xl"></div>
        </div>
        <div className="text-slate-500 text-[10px] font-black mb-2 uppercase tracking-[0.3em]">Crypto-Specific</div>
        <div className="text-4xl font-black text-cyan-500 tracking-tighter">{cryptoCount}</div>
        <div className="text-[9px] text-cyan-900 mt-2 font-bold uppercase tracking-widest underline decoration-cyan-900/30 underline-offset-4">Verified Crime Vectors</div>
      </div>
      <div className="bg-rose-500/5 border border-rose-500/20 p-7 rounded-2xl group">
        <div className="text-rose-500 text-[10px] font-black mb-2 uppercase tracking-[0.3em]">High Risk Alerts</div>
        <div className="text-4xl font-black text-rose-600 tracking-tighter group-hover:text-rose-500 transition-colors">{highPriority}</div>
        <div className="text-[9px] text-rose-900/60 mt-2 font-bold uppercase tracking-widest">Immediate Oversight Required</div>
      </div>
    </div>
  );
};
