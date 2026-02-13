
import React from 'react';
import { Priority, GroundedCase } from '../types';

interface IntelligenceTableProps {
  data: GroundedCase[];
}

export const IntelligenceTable: React.FC<IntelligenceTableProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="bg-slate-900/10 border-2 border-dashed border-slate-800/50 rounded-3xl p-32 text-center group transition-all hover:bg-slate-900/20">
        <p className="text-slate-400 font-bold text-xl tracking-tight">Ledger Synchronized: No Entries</p>
        <p className="text-slate-600 text-sm mt-3 max-w-sm mx-auto font-medium">Initiate an archive scan to pull recent cross-border litigation data.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-950/20 backdrop-blur-md shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/90 text-slate-500 text-[10px] uppercase font-black tracking-[0.3em] border-b border-slate-800/80">
              <th className="px-10 py-7">Judgment Ref / Region</th>
              <th className="px-6 py-7 text-center">Enforced</th>
              <th className="px-6 py-7 text-center">Basis</th>
              <th className="px-6 py-7 text-right">Impact Value</th>
              <th className="px-10 py-7">Intelligence Summary</th>
              <th className="px-8 py-7 text-center">Risk Vector</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {data.map((item) => (
              <tr 
                key={item.id} 
                className={`group transition-all hover:bg-white/[0.02] ${
                  item.priority === Priority.HIGH ? 'bg-rose-500/[0.015]' : ''
                }`}
              >
                <td className="px-10 py-8 align-top">
                  <div className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{item.signature}</div>
                  <div className="text-[10px] text-slate-500 mt-1.5 font-bold leading-tight uppercase tracking-wide truncate max-w-[200px]">{item.court}</div>
                  <div className={`mt-4 inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                    item.region === 'Poland' 
                      ? 'bg-slate-800/50 text-slate-400 border-slate-700/50' 
                      : 'bg-blue-900/20 text-blue-400 border-blue-800/40'
                  }`}>
                    {item.region}
                  </div>
                </td>
                <td className="px-6 py-8 align-top text-[11px] font-mono font-bold text-slate-500 text-center">
                  {item.date}
                </td>
                <td className="px-6 py-8 align-top text-center">
                  <span className="inline-block px-3 py-1 rounded text-[10px] font-black bg-slate-950 text-slate-400 border border-slate-800 group-hover:border-slate-700 transition-colors">
                    {item.article || 'MISC_CRIME'}
                  </span>
                </td>
                <td className="px-6 py-8 align-top text-right">
                  <span className={`text-[13px] font-mono font-bold ${item.priority === Priority.HIGH ? 'text-rose-500' : 'text-white'}`}>
                    {item.amount || '—'}
                  </span>
                </td>
                <td className="px-10 py-8 align-top max-w-xl">
                  <div className="text-[14px] text-slate-300 leading-relaxed font-semibold">
                    {item.summary}
                  </div>
                  {item.euContext && (
                    <div className="mt-5 p-4 rounded-xl bg-blue-950/10 border border-blue-900/20 group-hover:bg-blue-950/20 transition-all">
                      <p className="text-[11px] text-blue-400/90 leading-relaxed">
                        <strong className="text-blue-500 uppercase text-[9px] font-black tracking-widest mr-3">Cross-Border Connection:</strong>
                        {item.euContext}
                      </p>
                    </div>
                  )}
                  <div className="mt-5">
                    <a 
                      href={item.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[10px] text-slate-600 hover:text-white font-black uppercase tracking-widest flex items-center gap-2 transition-all group/link"
                    >
                      Verify Record <svg className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  </div>
                </td>
                <td className="px-8 py-8 align-top text-center">
                  <div className={`px-2.5 py-1.5 rounded text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm transition-shadow ${
                    item.priority === Priority.HIGH ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 shadow-rose-900/10' : 
                    item.priority === Priority.MEDIUM ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 
                    'bg-slate-800/50 text-slate-500 border-slate-700'
                  }`}>
                    {item.priority}
                  </div>
                  <div className="mt-2 text-[8px] text-slate-600 font-bold uppercase tracking-tighter">
                    {item.priority === Priority.HIGH ? 'Critical Threshold' : 'Verified Logic'}
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
