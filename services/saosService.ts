
import { GoogleGenAI, Type } from "@google/genai";
import { CourtJudgment, AnalysisStatus, AIAnalysis, Priority } from '../types';

/**
 * Calls our internal backend proxy to fetch historical records and analyzes each with Gemini.
 * This performs a deep forensic scan of raw court text.
 */
export const fetchJudgments = async (query: string = 'waluta wirtualna kryptowaluta'): Promise<CourtJudgment[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Terminal Configuration Error: API_KEY missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // 1. Fetch raw records from our internal Express proxy
    const response = await fetch(`http://localhost:3000/api/scan?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Uplink Error: ${response.status}`);
    }

    const data = await response.json();
    const rawItems = data.items || [];

    // 2. Process and analyze each judgment using Gemini 3 Flash for efficiency
    const analyzedItems = await Promise.all(rawItems.map(async (item: any) => {
      try {
        const textToAnalyze = (item.textContent || '').substring(0, 8000);
        if (!textToAnalyze) return null;

        const genResponse = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Analyze this Polish court judgment text. Determine if it involves a cryptocurrency-related crime (theft, fraud, AML, tax evasion).
          Return JSON: { "isCryptoCrime": boolean, "summary": "1-sentence Polish summary", "amount": "PLN/BTC value or 'Unknown'", "article": "Statute/Article (e.g. Art. 299 KK)", "priority": "High/Medium/Low" }
          
          JUDGMENT TEXT:
          ${textToAnalyze}`,
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

        // We only proceed if it's confirmed as a crypto crime by the AI
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
        console.error(`[INTEL] Analysis failed for ID ${item.id}:`, err);
        return null;
      }
    }));

    // 3. Filter out nulls and non-crypto cases
    return analyzedItems.filter((item): item is CourtJudgment => item !== null);
  } catch (error) {
    console.error('Forensic Scan Failure:', error);
    throw error;
  }
};
