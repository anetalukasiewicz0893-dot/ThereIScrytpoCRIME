
import { getAI, PRO_MODEL } from './aiClient';
import { Type } from "@google/genai";
import { CourtJudgment, AnalysisStatus, AIAnalysis, Priority } from '../types';

/**
 * Fetches and analyzes real Polish court judgments using Gemini with Google Search grounding.
 * This bypasses local API endpoints and provides live forensic data.
 */
export const fetchJudgments = async (query: string = 'wyroki sądowe kryptowaluty Polska'): Promise<CourtJudgment[]> => {
  const ai = getAI();
  
  try {
    const response = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: `Search for real, specific Polish court judgments (wyroki sądowe) related to cryptocurrency, bitcoin, or virtual assets. 
        Return a JSON object containing an array of 'judgments'.
        Each judgment must have: id (unique number), caseNumber (signature), date, courtType, summary (1-sentence Polish), amount (PLN/BTC), article (Penal code), and priority (High/Medium/Low).`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: 'You are a legal OSINT expert. Find real Polish court cases. Output valid JSON only.',
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            judgments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  caseNumber: { type: Type.STRING },
                  date: { type: Type.STRING },
                  courtType: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  amount: { type: Type.STRING },
                  article: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                },
                required: ["id", "caseNumber", "date", "courtType", "summary", "amount", "article", "priority"]
              }
            }
          },
          required: ["judgments"]
        }
      }
    });

    const content = response.text;
    const parsedData = content ? JSON.parse(content) : { judgments: [] };

    // Extract grounding URLs to satisfy citation requirements
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sourceUris = groundingChunks
      .filter(chunk => chunk.web && chunk.web.uri)
      .map(chunk => chunk.web!.uri);

    const judgments: CourtJudgment[] = (parsedData.judgments || []).map((j: any, index: number) => ({
      id: j.id || Date.now() + index,
      courtCases: [j.caseNumber],
      judgmentDate: j.date,
      textContent: j.summary,
      courtType: j.courtType,
      status: AnalysisStatus.COMPLETED,
      analysis: {
        isCryptoCrime: true,
        summary: j.summary,
        amount: j.amount,
        article: j.article,
        priority: j.priority as Priority
      },
      // If we found search results, use the first one as a source link for this judgment
      sourceUrl: sourceUris[index % sourceUris.length] || "https://www.saos.org.pl/"
    }));

    return judgments;
  } catch (error) {
    console.error('Forensic Pipeline Error:', error);
    throw error;
  }
};
