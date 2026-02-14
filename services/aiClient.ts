import { GoogleGenAI } from "@google/genai";

export const FLASH_MODEL = "gemini-3-flash-preview";
export const PRO_MODEL = "gemini-3-pro-preview";

// Internal state for the active model
let activeHighIntelModel = PRO_MODEL;
let isProExhausted = false;

/**
 * Standard initialization as per guidelines.
 * Uses process.env.API_KEY injected by the environment.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAI = () => ai;

export const getCurrentModel = () => activeHighIntelModel;

export const isProAvailable = () => !isProExhausted;

export const fallbackToFlash = () => {
  if (!isProExhausted) {
    activeHighIntelModel = FLASH_MODEL;
    isProExhausted = true;
    window.dispatchEvent(new CustomEvent('ai-model-fallback', { detail: { model: FLASH_MODEL } }));
  }
};
