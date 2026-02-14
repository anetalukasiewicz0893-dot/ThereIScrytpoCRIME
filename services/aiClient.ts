import { GoogleGenAI } from "@google/genai";

/**
 * Safely retrieves the API key from the environment.
 */
const getSafeApiKey = (): string => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    if (typeof window !== 'undefined' && (window as any).API_KEY) {
      return (window as any).API_KEY;
    }
  } catch (e) {
    console.warn("Environment check failed:", e);
  }
  return '';
};

export const FLASH_MODEL = "gemini-3-flash-preview";
export const PRO_MODEL = "gemini-3-pro-preview";

// Internal state for the active high-intelligence model
let activeHighIntelModel = PRO_MODEL;
let isProExhausted = false;

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

export const getCurrentModel = () => activeHighIntelModel;

export const isProAvailable = () => !isProExhausted;

export const fallbackToFlash = () => {
  if (!isProExhausted) {
    console.warn("INTELLIGENCE FALLBACK: Pro model exhausted. Switching to Flash.");
    activeHighIntelModel = FLASH_MODEL;
    isProExhausted = true;
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('ai-model-fallback', { detail: { model: FLASH_MODEL } }));
  }
};

export const resetModelToPro = () => {
  activeHighIntelModel = PRO_MODEL;
  isProExhausted = false;
  window.dispatchEvent(new CustomEvent('ai-model-reset', { detail: { model: PRO_MODEL } }));
};
