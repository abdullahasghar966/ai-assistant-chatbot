import type { NextRequest } from "next/server";
import type OpenAI from "openai";
import { z } from "zod";
import {
  hasOpenAI,
  hasGemini,
  hasGroq,
  defaultModel,
  defaultGeminiModel,
  defaultGroqModel,
} from "@/lib/env";
import { getOpenAI } from "@/lib/ai/client";
import { geminiStream } from "@/lib/ai/gemini";
import { groqStream } from "@/lib/ai/groq";
import { buildContext } from "@/lib/ai/memory";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { mockStream } from "@/lib/ai/mock";
import { textStream } from "@/lib/ai/stream";
import type { WireMessage } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(200),
  model: z.string().optional(),
  conversationId: z.string().optional(),
});

const STREAM_HEADERS: HeadersInit = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  "X-Accel-Buffering": "no",
};

type Provider = "groq" | "gemini" | "openai" | "mock";

/** Model ids served by Groq (OpenAI-compatible). */
const GROQ_MODELS = new Set([
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "openai/gpt-oss-120b",
]);

function isGroqModel(model?: string): boolean {
  return Boolean(model && GROQ_MODELS.has(model));
}

/** Pick a provider from the requested model and which keys are configured. */
function chooseProvider(model?: string): Provider {
  if (model === "mock") return "mock";
  if (isGroqModel(model)) return hasGroq ? "groq" : "mock";
  if (model?.startsWith("gemini")) return hasGemini ? "gemini" : "mock";
  if (model?.startsWith("gpt")) return hasOpenAI ? "openai" : "mock";
  // No explicit model: use the first real provider that is configured.
  if (hasGroq) return "groq";
  if (hasGemini) return "gemini";
  if (hasOpenAI) return "openai";
  return "mock";
}

/**
 * Start the generator eagerly and await its first chunk inside the route's
 * try/catch, so auth/connection failures surface as clean JSON errors instead
 * of crashing the response stream after headers are sent.
 */
async function eagerStream(gen: AsyncGenerator<string>): Promise<Response> {
  const first = await gen.next();
  if (first.done) return new Response("", { headers: STREAM_HEADERS });
  async function* prepend(): AsyncGenerator<string> {
    yield first.value;
    yield* gen;
  }
  return new Response(textStream(prepend()), { headers: STREAM_HEADERS });
}

export async function POST(req: NextRequest): Promise<Response> {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(400, "Invalid request", parsed.error.flatten());
  }

  const { messages, model } = parsed.data;
  const provider = chooseProvider(model);
  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  if (provider === "mock") {
    return new Response(textStream(mockStream(lastUser?.content ?? "")), {
      headers: STREAM_HEADERS,
    });
  }

  try {
    const { messages: context } = buildContext(messages as WireMessage[], SYSTEM_PROMPT, {
      maxTokens: 6000,
      keepRecent: 6,
    });

    if (provider === "groq") {
      const groqModel = isGroqModel(model) ? (model as string) : defaultGroqModel;
      return await eagerStream(groqStream(context, groqModel));
    }

    if (provider === "gemini") {
      const geminiModel = model?.startsWith("gemini") ? model : defaultGeminiModel;
      return await eagerStream(geminiStream(context, geminiModel));
    }

    // provider === "openai"
    const apiMessages = context.map((m) => ({
      role: m.role,
      content: m.content,
    })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: model?.startsWith("gpt") ? model : defaultModel,
      messages: apiMessages,
      stream: true,
      temperature: 0.7,
    });

    async function* deltas(): AsyncGenerator<string> {
      for await (const part of completion) {
        const delta = part.choices[0]?.delta?.content;
        if (delta) yield delta;
      }
    }

    return new Response(textStream(deltas()), { headers: STREAM_HEADERS });
  } catch (error) {
    const raw = error instanceof Error ? error.message : "Upstream model error";
    console.error(`[chat] ${provider} error:`, raw);

    if (/unable to verify|self.?signed|leaf signature|certificate/i.test(raw)) {
      return jsonError(
        502,
        "TLS certificate error reaching the model provider. Your network inspects HTTPS; run the dev server with Node's system CA store (npm run dev already enables --use-system-ca).",
      );
    }

    if (/api.?key not valid|api_key_invalid|invalid api key|api key expired|incorrect api key/i.test(raw)) {
      const help =
        provider === "gemini"
          ? 'The Gemini API key is invalid. Add a valid key (starts with "AIza") to .env.local, or switch to Demo mode.'
          : provider === "groq"
            ? "The Groq API key is invalid. Check GROQ_API_KEY in .env.local, or switch to Demo mode."
            : "The API key is invalid. Check your provider key in .env.local, or switch to Demo mode.";
      return jsonError(401, help);
    }
    if (/rate.?limit/i.test(raw)) {
      return jsonError(429, "Rate limited by the model provider. Wait a moment and try again.");
    }
    if (/quota|insufficient|billing/i.test(raw)) {
      return jsonError(402, "Model quota exhausted. Check your provider plan, or switch to Demo mode.");
    }
    if (/fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|network/i.test(raw)) {
      return jsonError(502, "Could not reach the model provider. Check your connection, or switch to Demo mode.");
    }
    return jsonError(502, raw);
  }
}

function jsonError(status: number, error: string, details?: unknown): Response {
  return new Response(JSON.stringify({ error, details }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
