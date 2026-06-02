import { GoogleGenerativeAI, type Content } from "@google/generative-ai";
import { env } from "@/lib/env";
import { SYSTEM_PROMPT } from "./system-prompt";
import type { WireMessage } from "@/types";

/** Map our messages to Gemini's format (roles: user | model; system handled separately). */
function toContents(messages: WireMessage[]): Content[] {
  return messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
}

/** Stream a Gemini completion as text deltas, mirroring the OpenAI/mock interface. */
export async function* geminiStream(
  messages: WireMessage[],
  model: string,
): AsyncGenerator<string> {
  if (!env.GOOGLE_AI_API_KEY) {
    throw new Error("GOOGLE_AI_API_KEY is not set");
  }
  const genAI = new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY);
  const generativeModel = genAI.getGenerativeModel({
    model,
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await generativeModel.generateContentStream({
    contents: toContents(messages),
  });

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}
