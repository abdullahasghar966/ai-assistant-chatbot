import OpenAI from "openai";
import { env } from "@/lib/env";

let client: OpenAI | null = null;

/** Lazily create a singleton OpenAI client. Throws if no key is configured. */
export function getOpenAI(): OpenAI {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  if (!client) {
    client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return client;
}
