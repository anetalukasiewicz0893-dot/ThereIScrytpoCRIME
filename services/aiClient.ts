import { GoogleGenAI } from "@google/genai";

/**
 * Shared Google Gemini AI client instance.
 * The API key is obtained exclusively from the environment variable process.env.API_KEY.
 */
export const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const FLASH_MODEL = "gemini-3-flash-preview";
export const PRO_MODEL = "gemini-3-pro-preview";