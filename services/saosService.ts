import axios from 'axios';
import { getAI, FLASH_MODEL } from './aiClient';
import { Type } from "@google/genai";
import { CourtJudgment, AnalysisStatus, AIAnalysis, Priority } from '../types';

/**
 * Fetches and analyzes court judgments from the SAOS API using Gemini.
 */
export const fetchJudgments = async (query: string = 'waluta wirtualna kryptowaluta'): Promise<CourtJudgment[]> => {
  try {
    // We use a relative path for the internal proxy API. 
    // If the environment requires an absolute URL, we prepend the origin.
    const origin = typeof window !== 'undefined' && window.location ? window.location.origin : '';
    const apiEndpoint = `${origin}/api/scan?q=${encodeURIComponent(query)}`;
    
    const response = await axios.get(apiEndpoint);
    const rawItems = response.data.items || [];

    const ai = getAI();
    
    // Analyze high-relevance records using Gemini
    const analyzedPromises = rawItems.slice(0, 8).map(async (item: any) => {
      try {
        const textToAnalyze = (item.textContent || '').substring(0, 15000);
        if (!textToAnalyze) return null;

        const response = await ai.models.generateContent({
          model: FLASH_MODEL,
          contents: `Analyze this Polish court judgment for cryptocurrency crime relevance.
            JUDGMENT: ${textToAnalyze}`,
          config: {
            systemInstruction: 'You are a Polish legal forensic expert. Analyze court judgments for cryptocurrency crime relevance. Return valid JSON only.',
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isCryptoCrime: { type: Type.BOOLEAN },
                summary: { type: Type.STRING, description: "1-sentence Polish summary" },
                amount: { type: Type.STRING, description: "Value in PLN/BTC" },
                article: { type: Type.STRING, description: "Penal code article (Art. KK)" },
                priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
              },
              required: ["isCryptoCrime", "summary", "amount", "article", "priority"]
            }
          }
        });

        const content = response.text;
        if (!content) return null;
        
        const analysis: AIAnalysis = JSON.parse(content);
        
        if (!analysis || !analysis.isCryptoCrime) return null;

        const result: CourtJudgment = {
          id: item.id,
          courtCases: (item.courtCases || []).map((c: any) => c.caseNumber),
          judgmentDate: item.judgmentDate || 'Unknown',
          textContent: item.textContent || '',
          courtType: item.courtType || 'Common Court',
          analysis: analysis,
          status: AnalysisStatus.COMPLETED
        };
        return result;
      } catch (err) {
        console.error("AI Analysis failed for item", item.id, err);
        return null;
      }
    });

    const results = await Promise.all(analyzedPromises);
    return results.filter((res): res is CourtJudgment => res !== null);
  } catch (error) {
    console.error('Forensic Pipeline Error:', error);
    throw error;
  }
};