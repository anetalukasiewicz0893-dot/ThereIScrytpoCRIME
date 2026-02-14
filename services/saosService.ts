import { getAI, getCurrentModel, fallbackToFlash } from './aiClient';
import { Type } from "@google/genai";
import { CourtJudgment, AnalysisStatus, AIAnalysis, Priority } from '../types';

/**
 * Fetches and analyzes real Polish court judgments using Gemini with Google Search grounding.
 */
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
      contents: `Search for real, specific Polish court judgments (wyroki sądowe) related to cryptocurrency, bitcoin, or virtual assets. 
        CRITICAL: Do NOT include any of the following case signatures: [${excludeStr}].
        Return a JSON object containing an array of 'judgments' that are NEW and NOT in the exclusion list.
        Each judgment must have: id (unique number), caseNumber (signature), date, courtType, summary (1-sentence Polish), amount (PLN/BTC), article (Penal code), and priority (High/Medium/Low).`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: 'You are a legal OSINT expert. Find real Polish court cases. Output valid JSON only. Do not repeat cases the user already has.',
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
    console.error('Forensic Pipeline Error:', error);
    throw error;
  }
};
