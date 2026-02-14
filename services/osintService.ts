import { getAI, getCurrentModel, fallbackToFlash } from './aiClient';
import { Type } from "@google/genai";
import { GroundedCase, Priority } from "../types";

export const searchCryptoCases = async (
  existingSignatures: string[] = [], 
  discardedSignatures: string[] = []
): Promise<{ cases: GroundedCase[]; sources: { title: string; uri: string }[] }> => {
  const excludeList = [...existingSignatures, ...discardedSignatures].slice(0, 50).join(', ');
  const ai = getAI();
  const currentModel = getCurrentModel();
  
  try {
    const response = await ai.models.generateContent({
      model: currentModel,
      contents: [{ parts: [{ text: `Search for real Polish and European Union court records or legal news involving cryptocurrency crimes (theft, fraud, laundering). Exclude these signatures: [${excludeList}]. Find 10 unique cases.` }] }],
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: 'You are a professional OSINT researcher. Find real court cases using search. Return only valid JSON.',
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
                  summary: { type: Type.STRING },
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

    const content = response.text; // Accessing property, not method
    const parsedData = content ? JSON.parse(content) : { cases: [] };

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchSources = groundingChunks
      .filter(chunk => chunk.web && chunk.web.uri)
      .map(chunk => ({
        title: chunk.web!.title || "Legal Record",
        uri: chunk.web!.uri
      }));

    const cases: GroundedCase[] = (parsedData.cases || []).map((c: any) => ({
      ...c,
      id: `osint-${c.signature}-${Date.now()}`,
      isSaved: false,
      isDiscarded: false,
      folder: 'Uncategorized',
      sourceUrl: c.sourceUrl && c.sourceUrl.startsWith('http') ? c.sourceUrl : (searchSources[0]?.uri || "#")
    }));

    return { cases, sources: searchSources };
  } catch (error: any) {
    if (error?.message?.includes('429') || error?.message?.toLowerCase().includes('exhausted')) {
      fallbackToFlash();
      if (currentModel !== "gemini-3-flash-preview") {
        return searchCryptoCases(existingSignatures, discardedSignatures);
      }
    }
    throw error;
  }
};
