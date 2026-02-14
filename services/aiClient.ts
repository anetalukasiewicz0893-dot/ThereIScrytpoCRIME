import { GoogleGenAI } from "@google/genai";

/**
 * Safely retrieves the API key from the environment.
 * Browsers do not have a global 'process' object, so we check existence first.
 */
const getSafeApiKey = (): string => {
  try {
    // Check if process is defined (Node.js/Zeabur environment)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    // Fallback for browser-injected keys
    if (typeof window !== 'undefined' && (window as any).API_KEY) {
      return (window as any).API_KEY;
    }
  } catch (e) {
    console.warn("Environment check failed:", e);
  }
  return '';
};

/**
 * Shared Google Gemini AI client instance.
 */
export const getAI = () => {
  const apiKey = getSafeApiKey();
  if (!apiKey) {
    console.error("CRITICAL ERROR: API_KEY is missing. Check deployment environment variables.");
  }
  return new GoogleGenAI({ apiKey: apiKey });
};

export const FLASH_MODEL = "gemini-3-flash-preview";
export const PRO_MODEL = "gemini-3-pro-preview";
