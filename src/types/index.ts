export type Role = "user" | "assistant" | "system";

/** A message as rendered in the UI. */
export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  /** ISO timestamp. */
  createdAt: string;
  /** Assistant message is still streaming. */
  pending?: boolean;
}

/** Minimal shape sent over the wire / to the model. */
export interface WireMessage {
  role: Role;
  content: string;
}

export type ChatModelId =
  | "llama-3.3-70b-versatile"
  | "llama-3.1-8b-instant"
  | "openai/gpt-oss-120b"
  | "gemini-2.0-flash"
  | "gemini-2.5-flash"
  | "gpt-4o"
  | "gpt-4o-mini"
  | "mock";

export interface ChatModelOption {
  id: ChatModelId;
  label: string;
  hint: string;
}

export const MODEL_OPTIONS: ChatModelOption[] = [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", hint: "Groq · most capable" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B", hint: "Groq · fastest" },
  { id: "openai/gpt-oss-120b", label: "GPT-OSS 120B", hint: "Groq · OpenAI OSS" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", hint: "Needs Google key" },
  { id: "gpt-4o", label: "GPT-4o", hint: "Needs OpenAI key" },
  { id: "mock", label: "Demo", hint: "Offline mock" },
];

export type VoiceState = "idle" | "recording" | "processing" | "done" | "error";
