
import React from 'react';
import { GroundedCase, Priority } from '../types';

interface TacticalMapProps {
  cases: GroundedCase[];
}

export const TacticalMap: React.FC<TacticalMapProps> = ({ cases }) => {
  // Enhanced normalization for Poland/EU focus
  const normalize = (val: number, min: number, max: number) => {
    const clamped = Math.min(Math.max(val, min), max);
    return ((clamped - min) / (max - min)) * 100;
  };

  return (
    <div className="relative aspect-[21/9] bg-slate-950/80 border border-slate-900 rounded-[3rem] overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      
      <div className="absolute top-10 left-10 z-10 space-y-3">
        <h3 className="text-[12px] font-black text-white uppercase tracking-[0.6em]">Tactical Signal Grid</h3>
        <p className="text-[9px] text-slate-500 font-mono tracking-widest bg-slate-900/50 px-3 py-1 rounded inline-block">
          POSITIONING SYSTEM // ACTIVE NODES: {cases.filter(c => c.location).length}
        </p>
      </div>

      <div className="absolute inset-24">
        <svg viewBox="0 0 100 100" className="w-full h-full transform transition-all duration-1000 group-hover:scale-[1.02]">
          {/* Subtle Grid Lines */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeWidth="0.1" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#1e293b" strokeWidth="0.1" />

          {cases.map((c) => {
            if (!c.location) return null;
            // Center map roughly on Poland (Lng 14-24, Lat 49-55)
            const x = normalize(c.location.lng, 12, 26);
            const y = 100 - normalize(c.location.lat, 47, 57);
            
            const isHigh = c.priority === Priority.HIGH;
            
            return (
              <g key={c.id} className="cursor-crosshair group/dot">
                {isHigh && (
                  <circle cx={x} cy={y} r="1.5" className="fill-rose-500/20 animate-ping" />
                )}
                <circle 
                  cx={x} cy={y} r={isHigh ? "0.8" : "0.5"} 
                  className={`${isHigh ? "fill-rose-500 shadow-[0_0_10px_rose]" : "fill-cyan-500"}`}
                />
                <circle 
                  cx={x} cy={y} r="4" 
                  className={`opacity-0 group-hover/dot:opacity-20 transition-all ${isHigh ? "fill-rose-500" : "fill-cyan-500"}`}
                />
                <foreignObject x={x + 1} y={y - 8} width="40" height="25" className="overflow-visible">
                  <div className="opacity-0 group-hover/dot:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover/dot:translate-y-0">
                    <div className="bg-slate-950/95 border border-slate-800 p-3 rounded-xl shadow-2xl backdrop-blur-xl min-w-[140px]">
                      <p className="text-[6px] font-black text-white uppercase truncate">{c.signature}</p>
                      <p className="text-[5px] text-cyan-500 mt-1 uppercase font-bold tracking-widest">{c.location.city}</p>
                      <div className="h-px bg-slate-800 my-2"></div>
                      <p className="text-[5px] text-slate-500 font-medium leading-tight line-clamp-2">
                        {c.summary}
                      </p>
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="absolute bottom-10 right-10 flex gap-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 bg-slate-950/80 px-6 py-3 rounded-2xl border border-slate-900">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse"></span> Critical Signal
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.6)]"></span> Verified Intel
        </div>
      </div>
    </div>
  );
};
