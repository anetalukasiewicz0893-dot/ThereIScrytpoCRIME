
import React from 'react';
import { Priority, GroundedCase } from '../types';

interface IntelligenceTableProps {
  data: GroundedCase[];
  onSave: (id: string) => void;
  onDiscard: (id: string) => void;
  onMove: (id: string, folder: string) => void;
  folders: string[];
}

export const IntelligenceTable: React.FC<IntelligenceTableProps> = ({ data, onSave, onDiscard, onMove, folders }) => {
  if (data.length === 0) {
    return (
      <div className="bg-slate-900/10 border-2 border-dashed border-slate-800/40 rounded-[3rem] p-40 text-center">
        <p className="text-slate-500 font-black text-xl tracking-widest uppercase">Archive Filtered: No Forensic Signals Surfaced</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2.5rem] border border-slate-800/60 bg-slate-950/20 shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-950/80 text-slate-500 text-[10px] uppercase font-black tracking-[0.3em] border-b border-slate-900">
              <th className="px-10 py-8">Signal Descriptor</th>
              <th className="px-6 py-8">Timeline</th>
              <th className="px-6 py-8">Financial Context</th>
              <th className="px-6 py-8">Analysis / Grounding</th>
              <th className="px-10 py-8">Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {data.map((item) => (
              <tr key={item.id} className={`group hover:bg-white/[0.01] transition-colors ${item.priority === Priority.HIGH ? 'bg-rose-500/[0.02]' : ''}`}>
                <td className="px-10 py-10">
                  <div className="text-base font-black text-white group-hover:text-cyan-400 transition-colors">{item.signature}</div>
                  <div className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">{item.court}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-slate-900 rounded-lg text-[8px] font-black text-slate-400 border border-slate-800 uppercase tracking-widest">{item.region}</span>
                    <span className="px-3 py-1 bg-cyan-500/10 rounded-lg text-[8px] font-black text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">{item.folder || 'Uncategorized'}</span>
                    {item.article && <span className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black text-white/40 border border-white/10 uppercase tracking-widest">{item.article}</span>}
                  </div>
                </td>
                <td className="px-6 py-10">
                   <div className="text-[11px] font-mono font-bold text-slate-500">{item.date}</div>
                   <div className="text-[9px] text-slate-700 mt-1 uppercase font-black">Logged Date</div>
                </td>
                <td className="px-6 py-10">
                   <div className="text-[13px] font-mono font-black text-white tracking-tight">{item.amount}</div>
                   <div className={`text-[8px] mt-2 font-black uppercase tracking-widest px-2 py-0.5 inline-block rounded ${item.priority === Priority.HIGH ? 'text-rose-500 bg-rose-500/10' : 'text-slate-600 bg-slate-800'}`}>
                      {item.priority} Risk
                   </div>
                </td>
                <td className="px-6 py-10 max-w-lg">
                  <p className="text-[13px] text-slate-400 font-medium leading-relaxed italic">"{item.summary}"</p>
                  <div className="mt-5 flex gap-6">
                    <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-[9px] font-black uppercase text-cyan-600 hover:text-cyan-400 transition-all border-b border-cyan-900 flex items-center gap-2 group/link">
                      Grounding Link 
                      <svg className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="3"/></svg>
                    </a>
                    {item.euContext && <span className="text-[9px] font-black uppercase text-slate-700">EU: {item.euContext.slice(0, 30)}...</span>}
                  </div>
                </td>
                <td className="px-10 py-10">
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => onSave(item.id)} 
                      className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all ${item.isSaved ? 'bg-white text-black border-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'}`}
                    >
                      {item.isSaved ? 'Secured' : 'Secure Signal'}
                    </button>
                    <div className="relative">
                       <select 
                         onChange={(e) => onMove(item.id, e.target.value)}
                         value={item.folder || 'Uncategorized'}
                         className="w-full bg-slate-950 border border-slate-800 text-[8px] font-black p-2 rounded-xl uppercase text-slate-500 outline-none hover:border-slate-700 transition-colors"
                       >
                         {folders.map(f => <option key={f} value={f}>{f}</option>)}
                       </select>
                    </div>
                    <button onClick={() => onDiscard(item.id)} className="text-[8px] font-black uppercase text-rose-900 hover:text-rose-500 transition-colors text-left px-2 mt-1 underline underline-offset-4 decoration-rose-900/40">
                      Eliminate from Registry
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
