
import { getAI, PRO_MODEL } from './aiClient';
import { Type } from "@google/genai";
import { GroundedCase, Priority } from "../types";

/**
 * Searches for cryptocurrency-related court cases using Gemini's intelligence capabilities.
 */
export const searchCryptoCases = async (
  existingSignatures: string[] = [], 
  discardedSignatures: string[] = []
): Promise<{ cases: GroundedCase[]; sources: { title: string; uri: string }[] }> => {
  const excludeList = [...existingSignatures, ...discardedSignatures].slice(0, 50).join(', ');
  const ai = getAI();
  
  try {
    const response = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: `Perform a deep archival search of Polish and EU court records involving cryptocurrency crimes. 
        Exclude these signatures: [${excludeList}]. Provide 10 unique cases.`,
      config: {
        systemInstruction: 'You are a professional OSINT researcher specializing in Polish and EU cryptocurrency court cases. Return only valid JSON matching the provided schema.',
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  signature: { type: Type.STRING },
                  court: { type: Type.STRING },
                  date: { type: Type.STRING },
                  isCryptoCrime: { type: Type.BOOLEAN },
                  summary: { type: Type.STRING, description: "Polish summary" },
                  amount: { type: Type.STRING },
                  article: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                  sourceUrl: { type: Type.STRING },
                  region: { type: Type.STRING, enum: ["Poland", "European Union"] },
                  location: {
                    type: Type.OBJECT,
                    properties: {
                      lat: { type: Type.NUMBER },
                      lng: { type: Type.NUMBER },
                      city: { type: Type.STRING }
                    },
                    required: ["lat", "lng", "city"]
                  }
                },
                required: ["signature", "court", "date", "isCryptoCrime", "summary", "amount", "article", "priority", "sourceUrl", "region", "location"]
              }
            }
          },
          required: ["cases"]
        }
      }
    });

    const content = response.text;
    const parsedData = content ? JSON.parse(content) : { cases: [] };

    const cases: GroundedCase[] = (parsedData.cases || []).map((c: any) => ({
      ...c,
      id: `osint-${c.signature}-${Date.now()}`,
      isSaved: false,
      isDiscarded: false,
      folder: 'Uncategorized'
    }));

    const sources = cases.map((c: any) => ({
      title: `Judgment: ${c.signature}`,
      uri: c.sourceUrl || "#"
    }));

    return { cases, sources };
  } catch (error) {
    console.error("Intelligence Search Error:", error);
    throw error;
  }
};
