
import { GoogleGenAI, Type } from "@google/genai";
import { GroundedCase } from "../types";

export const searchCryptoCases = async (
  existingSignatures: string[] = [], 
  discardedSignatures: string[] = []
): Promise<{ cases: GroundedCase[]; sources: { title: string; uri: string }[] }> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  
  // Combine all signatures that should not be returned again
  const excludeList = [...existingSignatures, ...discardedSignatures].slice(0, 50).join(', ');
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `PERFORM A MASSIVE ARCHIVAL OSINT SEARCH. 
      Identify judicial rulings where Cryptocurrency intersects with Polish/EU Penal Codes (Art 286, 299, 287 KK).
      
      CRITICAL INSTRUCTIONS:
      1. Target 40-60 unique results per request.
      2. Extract specific city and approximate GPS coordinates (latitude, longitude) for each court.
      3. ABSOLUTELY EXCLUDE these signatures already in database: [${excludeList}].
      4. Ensure sourceUrl is a valid link to a legal database or news report.

      Return ONLY JSON with a "cases" array:
      - signature: string (e.g., II AKa 12/23)
      - court: string
      - date: string (YYYY-MM-DD)
      - isCryptoCrime: boolean
      - summary: string (Deep 1-sentence analysis)
      - amount: string
      - article: string
      - priority: "High" | "Medium" | "Low"
      - sourceUrl: string
      - region: "Poland" | "European Union"
      - euContext: string
      - location: { lat: number, lng: number, city: string }`,
      config: {
        tools: [{ googleSearch: {} }],
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
                  euContext: { type: Type.STRING },
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
                required: ["signature", "court", "date", "summary", "priority", "sourceUrl", "location"]
              }
            }
          },
          required: ["cases"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Judicial Archive Record",
      uri: chunk.web?.uri || "#"
    })) || [];

    const cases = (data.cases || []).map((c: any) => ({
      ...c,
      id: `ledger-${c.signature}-${Date.now()}`,
      isSaved: false,
      isDiscarded: false,
      folder: 'Uncategorized'
    }));

    return { cases, sources };
  } catch (error) {
    console.error("OSINT Ledger Search Error:", error);
    throw error;
  }
};
