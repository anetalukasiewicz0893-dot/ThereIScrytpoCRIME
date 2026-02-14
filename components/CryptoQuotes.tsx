
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

export const CryptoQuotes: React.FC = () => {
  const [quote, setQuote] = useState<string>('Scanning for on-chain wisdom...');
  const [author, setAuthor] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuote = async () => {
    setIsLoading(true);
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setQuote("No API Key. Wisdom is centralized and currently unavailable.");
      setIsLoading(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Provide a very short, powerful, and insightful crypto quote (e.g., from Satoshi Nakamoto, Vitalik Buterin, or general crypto culture wisdom). Format the response as "Quote - Author". Keep the quote under 15 words. Sharp, professional tone.',
      });
      const text = response.text || 'The root problem with conventional currency is all the trust that’s required to make it work. - Satoshi Nakamoto';
      const [q, a] = text.split(' - ');
      setQuote(q?.replace(/"/g, '') || text);
      setAuthor(a || 'Unknown');
    } catch (err) {
      setQuote('The consensus for wisdom has failed. Try again later.');
      setAuthor('Network Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-20 p-16 bg-slate-900/30 border border-slate-800 rounded-[3rem] text-center space-y-10 backdrop-blur-3xl shadow-2xl animate-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div className="space-y-4">
        <h3 className="text-xs font-black text-cyan-500 uppercase tracking-[0.4em]">Signal Wisdom</h3>
        <div className="text-3xl font-black text-white italic leading-relaxed">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            </div>
          ) : `"${quote}"`}
        </div>
        {!isLoading && author && (
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">— {author}</div>
        )}
      </div>
      <div className="pt-8">
        <button 
          onClick={fetchQuote}
          disabled={isLoading}
          className="px-8 py-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:border-slate-700 transition-all active:scale-95"
        >
          {isLoading ? 'Confirming...' : 'Next Insight'}
        </button>
      </div>
    </div>
  );
};
