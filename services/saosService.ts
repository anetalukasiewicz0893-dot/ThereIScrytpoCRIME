
import { GoogleGenAI, Type } from "@google/genai";
import { CourtJudgment, AnalysisStatus, AIAnalysis, Priority } from '../types';

export const fetchJudgments = async (query: string = 'waluta wirtualna kryptowaluta'): Promise<CourtJudgment[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing. The AI has zero alpha.");

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await fetch(`http://localhost:3000/api/scan?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(`Uplink Error: ${response.status}`);

    const data = await response.json();
    const rawItems = data.items || [];

    // Massive increase: analyzing up to 100 cases per harvest for deep coverage
    const analyzedItems = await Promise.all(rawItems.slice(0, 100).map(async (item: any) => {
      try {
        const textToAnalyze = (item.textContent || '').substring(0, 15000);
        if (!textToAnalyze) return null;

        const genResponse = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `As a professional CT (Crypto Twitter) forensic analyst with a witty, slightly cynical edge, dissect this Polish court judgment. 
          Is this a "forced exit liquidity" event? (Theft, Fraud, Art 286 KK, Art 299 KK - money laundering).
          
          JUDGMENT DATA:
          ${textToAnalyze}
          
          Return JSON: { "isCryptoCrime": boolean, "summary": "1-sentence professional but sharp Polish summary", "amount": "kwota w PLN/BTC", "article": "Art. KK", "priority": "High/Medium/Low" }`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isCryptoCrime: { type: Type.BOOLEAN },
                summary: { type: Type.STRING },
                amount: { type: Type.STRING },
                article: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
              },
              required: ["isCryptoCrime", "summary", "amount", "article", "priority"]
            }
          }
        });

        const analysis = JSON.parse(genResponse.text || "{}") as AIAnalysis;
        if (!analysis.isCryptoCrime) return null;

        return {
          id: item.id,
          courtCases: (item.courtCases || []).map((c: any) => c.caseNumber),
          judgmentDate: item.judgmentDate || 'Unknown',
          textContent: item.textContent || '',
          courtType: item.courtType || 'Common Court',
          analysis: analysis,
          status: AnalysisStatus.COMPLETED
        };
      } catch (err) {
        return null;
      }
    }));

    return analyzedItems.filter((item): item is CourtJudgment => item !== null);
  } catch (error) {
    console.error('Forensic Scan Failure:', error);
    throw error;
  }
};
