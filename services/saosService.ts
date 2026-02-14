import { getAI, getCurrentModel, fallbackToFlash } from './aiClient';
import { Type } from "@google/genai";
import { CourtJudgment, AnalysisStatus, AIAnalysis, Priority } from '../types';

export const fetchJudgments = async (
  excludeSignatures: string[] = [],
  query: string = 'wyroki sądowe kryptowaluty Polska'
): Promise<CourtJudgment[]> => {
  const ai = getAI();
  const currentModel = getCurrentModel();
  const excludeStr = excludeSignatures.slice(0, 40).join(', ');
  
  try {
    const response = await ai.models.generateContent({
      model: currentModel,
      contents: `Search for real Polish court judgments related to cryptocurrency crimes. Search query: ${query}. Exclude: [${excludeStr}]. Return only valid JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: 'You are a legal OSINT expert. Find real Polish court cases using Google Search. Output valid JSON ONLY matching the requested schema.',
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
      sourceUrl: sourceUris[index % sourceUris.length] || "https://www.saos.org.pl/"
    }));

    return judgments;
  } catch (error: any) {
    if (error?.message?.includes('429') || error?.message?.toLowerCase().includes('exhausted')) {
      fallbackToFlash();
      if (currentModel !== "gemini-3-flash-preview") {
        return fetchJudgments(excludeSignatures, query);
      }
    }
    throw error;
  }
};
