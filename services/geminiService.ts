
import { GoogleGenAI, Type } from "@google/genai";
import { GroundedCase } from "../types";

export const searchCryptoCases = async (existingSignatures: string[] = []): Promise<{ cases: GroundedCase[]; sources: { title: string; uri: string }[] }> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key missing");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `PERFORM AN EXHAUSTIVE FORENSIC SEARCH: 
      Identify all landmark and relevant judicial rulings where Cryptocurrency (waluty wirtualne/kryptowaluty) intersects with the Polish Penal Code (Kodeks Karny - KK) and equivalent European Union criminal statutes.
      
      SPECIFIC FOCUS:
      - Polish Penal Code (KK) Articles: Art. 286 (Fraud), Art. 299 (Money Laundering), Art. 287 (Computer Fraud), Art. 278 (Theft).
      - European Union: Directives 2018/843 (AMLD5) and 2015/849 (AMLD4) enforcement, plus ECLI records.
      
      SCOPE: 
      Find at least 50+ distinct cases. Do not limit to high-profile only; include granular judicial precedents from common courts (Sądy Powszechne) and the Court of Justice of the EU (CJEU).
      
      EXCLUDE signatures: ${existingSignatures.join(', ')}.

      RISK CLASSIFICATION LOGIC:
      - HIGH: Organized crime, systemic AML (Art. 299 KK), value > 500,000 PLN/EUR, or complex cross-border obfuscation.
      - MEDIUM: Isolated Art. 286 KK (Fraud) cases, phishing campaigns, or tax evasion > 100,000 PLN.
      - LOW: Minor thefts, wallet disputes, or non-compliance without malicious intent.

      Return a JSON object with a "cases" array:
      - signature: string (File reference)
      - court: string (Court and Division)
      - date: string (YYYY-MM-DD)
      - isCryptoCrime: boolean
      - summary: string (1-sentence professional legal summary in English)
      - amount: string (Estimated financial impact)
      - article: string (The specific KK Article or EU Directive)
      - priority: "High" | "Medium" | "Low"
      - sourceUrl: string (Direct URL to ruling)
      - region: "Poland" | "European Union"
      - euContext: string (Explain how this relates to European criminal law or cross-border enforcement)

      Only return the JSON.`,
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
                  euContext: { type: Type.STRING }
                },
                required: ["signature", "court", "date", "summary", "priority", "sourceUrl", "region"]
              }
            }
          },
          required: ["cases"]
        }
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Judicial Archive Record",
      uri: chunk.web?.uri || "#"
    })) || [];

    const cases = (data.cases || []).map((c: any) => ({
      ...c,
      id: `ledger-${c.signature}-${Date.now()}`
    }));

    return { cases, sources };
  } catch (error) {
    console.error("Ledger Search Error:", error);
    throw error;
  }
};
