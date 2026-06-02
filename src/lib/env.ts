import { z } from "zod";

/**
 * All keys optional: the app runs in demo mode with none of them.
 * Provider priority when keys are present: Gemini, then OpenAI, then mock.
 */
const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).optional(),
  GOOGLE_AI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().min(1).optional(),
  GROQ_API_KEY: z.string().min(1).optional(),
  GROQ_MODEL: z.string().min(1).optional(),
});

export const env = envSchema.parse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GROQ_MODEL: process.env.GROQ_MODEL,
});

export const hasOpenAI = Boolean(env.OPENAI_API_KEY);
export const hasGemini = Boolean(env.GOOGLE_AI_API_KEY);
export const hasGroq = Boolean(env.GROQ_API_KEY);
export const defaultModel = env.OPENAI_MODEL ?? "gpt-4o";
export const defaultGeminiModel = env.GEMINI_MODEL ?? "gemini-2.0-flash";
export const defaultGroqModel = env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

/**
 * Real Google AI Studio keys start with "AIza" and are ~39 chars. We use this
 * cheap shape check to decide the app's default model: a plausibly valid key
 * defaults to live Gemini, anything else (missing/placeholder) defaults to the
 * offline Demo provider so the app is always usable.
 */
export const geminiKeyLooksValid = /^AIza[\w-]{30,}$/.test(env.GOOGLE_AI_API_KEY ?? "");

/** Groq keys start with "gsk_" followed by a long alphanumeric body. */
export const groqKeyLooksValid = /^gsk_[A-Za-z0-9]{20,}$/.test(env.GROQ_API_KEY ?? "");

/** True when at least one real provider is configured. */
export const hasRealModel = hasOpenAI || hasGemini || hasGroq;
