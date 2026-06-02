import type { NextRequest } from "next/server";
import { toFile } from "openai";
import { hasOpenAI } from "@/lib/env";
import { getOpenAI } from "@/lib/ai/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<Response> {
  const form = await req.formData().catch(() => null);
  const audio = form?.get("audio");

  if (!(audio instanceof File)) {
    return json(400, { error: "No audio file provided." });
  }

  // Demo mode: no key, so we can't transcribe. Report it cleanly.
  if (!hasOpenAI) {
    return json(200, { transcript: "", demo: true });
  }

  try {
    const openai = getOpenAI();
    const file = await toFile(audio, "audio.webm");
    const result = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
    });
    return json(200, { transcript: result.text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transcription failed.";
    return json(502, { error: message });
  }
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
