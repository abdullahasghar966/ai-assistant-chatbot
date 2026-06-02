import { AppShell } from "@/components/layout/AppShell";
import { groqKeyLooksValid, geminiKeyLooksValid } from "@/lib/env";
import type { ChatModelId } from "@/types";

export default function Page() {
  // Pick the default model from whichever real key is configured: Groq first
  // (free + fast), then Gemini, otherwise offline Demo mode so the app always works.
  const defaultModel: ChatModelId = groqKeyLooksValid
    ? "llama-3.3-70b-versatile"
    : geminiKeyLooksValid
      ? "gemini-2.0-flash"
      : "mock";
  return <AppShell defaultModel={defaultModel} />;
}
