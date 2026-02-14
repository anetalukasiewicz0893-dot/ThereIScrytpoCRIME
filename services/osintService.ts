import { getAI, getCurrentModel, fallbackToFlash } from './aiClient';
import { Type } from "@google/genai";
import { GroundedCase, Priority } from "../types";

/**
 * Searches for real cryptocurrency-related court cases across Poland and the EU using Google Search grounding.
 */
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
      contents: `Search for real Polish and European Union court records or legal news involving cryptocurrency crimes (theft, fraud, laundering). 
        Exclude these signatures: [${excludeList}]. 
        Find 10 unique cases and return them in the specified JSON schema.`,
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
      // Retry once with Flash if it wasn't already Flash
      if (currentModel !== "gemini-3-flash-preview") {
        return searchCryptoCases(existingSignatures, discardedSignatures);
      }
    }
    console.error("Intelligence Search Error:", error);
    throw error;
  }
};
