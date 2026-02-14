
import React from 'react';
import { Priority, GroundedCase } from '../types';

interface IntelligenceTableProps {
  data: GroundedCase[];
  onSave: (id: string) => void;
  onDiscard: (id: string) => void;
  onMove: (id: string, folder: string) => void;
  folders: string[];
}

const parseAmount = (amountStr: string): number => {
  const normalized = amountStr.replace(/\s/g, '').replace(',', '.');
  const match = normalized.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : 0;
};

export const IntelligenceTable: React.FC<IntelligenceTableProps> = ({ data, onSave, onDiscard, onMove, folders }) => {
  if (data.length === 0) {
    return (
      <div className="bg-slate-900/10 border-2 border-dashed border-slate-800/40 rounded-[3rem] p-40 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-800 rounded-full mb-4"></div>
          <p className="text-slate-500 font-black text-xl tracking-widest uppercase italic">Archive Empty // Awaiting Signal Harvest</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2.5rem] border border-slate-800/60 bg-slate-950/20 shadow-2xl print:border-none print:shadow-none print:rounded-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-950/80 text-slate-500 text-[10px] uppercase font-black tracking-[0.3em] border-b border-slate-900 print:text-black print:bg-slate-100">
              <th className="px-10 py-8">Signal / Signature</th>
              <th className="px-6 py-8">Timestamp</th>
              <th className="px-6 py-8">Capital Involved</th>
              <th className="px-6 py-8">Forensic Summary</th>
              <th className="px-10 py-8 print:hidden">Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 print:divide-slate-200">
            {data.map((item) => {
              const amount = parseAmount(item.amount);
              const isHighValue = amount > 200000;
              const isHighPriority = item.priority === Priority.HIGH || isHighValue;
              
              return (
                <tr 
                  key={item.id} 
                  className={`group transition-all duration-300 ${isHighPriority ? 'bg-rose-950/20 border-l-4 border-l-rose-600' : 'hover:bg-cyan-500/5'}`}
                >
                  <td className="px-10 py-10">
                    <div className="text-base font-black text-white group-hover:text-cyan-400 transition-colors print:text-black">{item.signature}</div>
                    <div className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">{item.court}</div>
                    <div className="mt-4 flex flex-wrap gap-2 print:hidden">
                      <span className="px-3 py-1 bg-slate-900 rounded-lg text-[8px] font-black text-slate-400 border border-slate-800 uppercase tracking-widest">{item.region}</span>
                      <span className="px-3 py-1 bg-cyan-500/10 rounded-lg text-[8px] font-black text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">{item.folder || 'Uncategorized'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-10">
                     <div className="text-[11px] font-mono font-bold text-slate-500 print:text-black">{item.date}</div>
                  </td>
                  <td className="px-6 py-10">
                     <div className={`text-[14px] font-mono font-black tracking-tight ${isHighValue ? 'text-rose-500' : 'text-white'}`}>
                       {item.amount}
                     </div>
                     <div className={`text-[8px] mt-2 font-black uppercase tracking-widest px-2 py-0.5 inline-block rounded ${isHighPriority ? 'text-rose-500 bg-rose-500/10' : 'text-slate-600 bg-slate-800'}`}>
                        {item.priority} RISK
                     </div>
                  </td>
                  <td className="px-6 py-10 max-w-lg">
                    <p className="text-[13px] text-slate-400 font-medium leading-relaxed italic print:text-slate-700">"{item.summary}"</p>
                    <div className="mt-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest">{item.article}</div>
                    <div className="mt-5 flex gap-6 print:hidden">
                      <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-[9px] font-black uppercase text-cyan-600 hover:text-cyan-400 transition-all border-b border-cyan-900/30">Registry Link</a>
                    </div>
                  </td>
                  <td className="px-10 py-10 print:hidden">
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => onSave(item.id)} 
                        className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all ${item.isSaved ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
                      >
                        {item.isSaved ? 'Archived' : 'Pin Entry'}
                      </button>
                      <button onClick={() => onDiscard(item.id)} className="text-[8px] font-black uppercase text-slate-700 hover:text-rose-500 text-left px-2 transition-colors">Discard</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
