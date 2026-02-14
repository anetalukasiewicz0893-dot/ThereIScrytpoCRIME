
import React from 'react';

export const Readme: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-8 bg-slate-900/40 border border-slate-800 rounded-[3rem] backdrop-blur-3xl space-y-16 shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
      <header className="space-y-4">
        <h2 className="text-xs font-black text-cyan-500 uppercase tracking-[0.4em]">Operations Manual</h2>
        <h1 className="text-5xl font-black text-white trm-heading uppercase leading-none">The Intelligence Protocol</h1>
        <p className="text-slate-500 italic">Guide to modern on-chain and judicial forensics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <section className="space-y-6">
          <h3 className="text-white font-black uppercase tracking-widest text-sm border-b border-slate-800 pb-2">Mission Parameters</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            This terminal is designed to bridge the gap between immutable blockchain records and the sluggish but definitive world of judicial rulings. We aggregate, analyze, and categorize Polish and EU court judgments specifically involving "Virtual Currencies."
          </p>
        </section>

        <section className="space-y-6">
          <h3 className="text-white font-black uppercase tracking-widest text-sm border-b border-slate-800 pb-2">Data Acquisition</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Signals are harvested from the SAOS API (Polish Common Court System) and enhanced by Gemini-3 OSINT sweeps. Every entry is cross-referenced with Penal Code (KK) statutes to identify specific crime vectors.
          </p>
        </section>
      </div>

      <div className="space-y-8">
        <h3 className="text-white font-black uppercase tracking-widest text-sm border-b border-slate-800 pb-2">Operational Workflow</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-950/60 rounded-2xl border border-slate-800/40">
            <div className="text-cyan-500 font-black text-xl mb-2">01.</div>
            <div className="text-white font-black text-xs uppercase mb-2">Harvest</div>
            <p className="text-[10px] text-slate-500 leading-relaxed">Trigger a 'Live Harvest' to pull fresh judgments. The AI will dissect hundreds of pages to find crypto relevance.</p>
          </div>
          <div className="p-6 bg-slate-950/60 rounded-2xl border border-slate-800/40">
            <div className="text-cyan-500 font-black text-xl mb-2">02.</div>
            <div className="text-white font-black text-xs uppercase mb-2">Triage</div>
            <p className="text-[10px] text-slate-500 leading-relaxed">Pin relevant intel to your vault. Move signals into tactical folders like 'Exit Liquidity' or 'Laundered Alpha'.</p>
          </div>
          <div className="p-6 bg-slate-950/60 rounded-2xl border border-slate-800/40">
            <div className="text-cyan-500 font-black text-xl mb-2">03.</div>
            <div className="text-white font-black text-xs uppercase mb-2">Export</div>
            <p className="text-[10px] text-slate-500 leading-relaxed">Head to a tactical folder to unlock PDF/Drive export features. Formalize your findings for local archives.</p>
          </div>
        </div>
      </div>

      <div className="p-8 bg-rose-500/5 border border-rose-500/20 rounded-3xl space-y-4">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest">Warning: Signal Lag</h4>
        </div>
        <p className="text-[10px] text-rose-900/80 uppercase font-bold tracking-widest leading-relaxed">
          The judicial process moves slower than block confirmation times. Use this tool for historical forensics and asset recovery leads, not real-time frontrunning.
        </p>
      </div>

      <footer className="text-center pt-8">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Protocol Authorized by the Decentralized Collective</p>
      </footer>
    </div>
  );
};
