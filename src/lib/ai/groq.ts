import { env } from "@/lib/env";
import type { WireMessage } from "@/types";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/** Minimal shape of a Groq (OpenAI-compatible) streaming chunk. */
interface GroqChunk {
  choices?: { delta?: { content?: string } }[];
}

/**
 * Stream a Groq completion as text deltas. Groq is OpenAI-compatible, but we use
 * a raw fetch + SSE parser (not the OpenAI SDK) because the SDK's connection
 * handling fails under Next.js's patched global fetch. Raw fetch works in-route,
 * mirroring how the Gemini client streams.
 */
export async function* groqStream(
  messages: WireMessage[],
  model: string,
): AsyncGenerator<string> {
  if (!env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set");
  }

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
      temperature: 0.7,
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Groq error ${res.status}: ${detail || res.statusText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Server-Sent Events: process complete lines, keep the remainder buffered.
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data) as GroqChunk;
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        /* ignore keep-alive comments / partial frames */
      }
    }
  }
}
