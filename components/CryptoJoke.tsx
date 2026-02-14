
import React, { useState, useEffect } from 'react';
import { getAI, FLASH_MODEL } from '../services/aiClient';

export const CryptoJoke: React.FC = () => {
  const [joke, setJoke] = useState<string>('Scanning the mempool for humor...');
  const [isLoading, setIsLoading] = useState(false);

  const fetchJoke = async () => {
    setIsLoading(true);
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: 'Tell a very short, witty crypto joke in heavy Crypto Twitter slang (alpha, rug, exit liquidity, degen, forced HODL, wagmi, ngmi). Keep it sharp and professional.'
      });

      const jokeText = response.text || 'Wagmi, but your portfolio is ngmi.';
      setJoke(jokeText.replace(/"/g, '').trim());
    } catch (err) {
      setJoke('The blockchain of comedy has forked. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJoke();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-20 p-16 bg-slate-900/30 border border-slate-800 rounded-[3rem] text-center space-y-10 backdrop-blur-3xl shadow-2xl animate-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <h3 className="text-xs font-black text-cyan-500 uppercase tracking-[0.4em]">Crypto Joke of the Day</h3>
      <div className="text-3xl font-black text-white italic leading-relaxed min-h-[100px] flex items-center justify-center">
        {isLoading ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce"></div>
            <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          </div>
        ) : `"${joke}"`}
      </div>
      <div className="pt-8">
        <button 
          onClick={fetchJoke}
          disabled={isLoading}
          className="px-8 py-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:border-slate-700 transition-all active:scale-95"
        >
          {isLoading ? 'Hashing...' : 'Get New Alpha'}
        </button>
      </div>
    </div>
  );
};
