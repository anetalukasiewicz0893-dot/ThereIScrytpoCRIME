
import { GoogleGenAI } from "@google/genai";

/**
 * Shared Google Gemini AI client instance.
 * Ensures compatibility with browser environments where process.env might be missing.
 */
export const getAI = () => {
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : (window as any).API_KEY;
  if (!apiKey) {
    console.warn("OSINT Warning: API_KEY is undefined. Signal uplink will fail.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const FLASH_MODEL = "gemini-3-flash-preview";
export const PRO_MODEL = "gemini-3-pro-preview";
