
import React, { useEffect, useRef } from 'react';

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'CRIT' | 'SIGNAL';
  message: string;
}

interface TerminalLogProps {
  logs: LogEntry[];
}

export const TerminalLog: React.FC<TerminalLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-6 font-mono text-[10px] h-48 overflow-hidden flex flex-col shadow-inner">
      <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-2">
        <span className="text-cyan-500 font-black tracking-widest uppercase">System Intelligence Stream</span>
        <span className="text-slate-700">UPLINK_STABLE // 256-BIT</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 pr-2 scrollbar-hide">
        {logs.length === 0 && (
          <div className="text-slate-800 animate-pulse">Awaiting signal harvest input...</div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex gap-4">
            <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
            <span className={`shrink-0 w-12 ${
              log.level === 'CRIT' ? 'text-rose-500' : 
              log.level === 'WARN' ? 'text-amber-500' : 
              log.level === 'SIGNAL' ? 'text-emerald-500' : 'text-cyan-600'
            }`}>
              {log.level}
            </span>
            <span className="text-slate-400 break-all uppercase tracking-tight">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
