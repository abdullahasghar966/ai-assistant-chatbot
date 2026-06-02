"use client";

import { useCallback, useRef, useState } from "react";
import type { VoiceState } from "@/types";

interface UseVoiceInput {
  state: VoiceState;
  error: string | null;
  stream: MediaStream | null;
  toggle: () => void;
  stop: () => void;
}

/**
 * Microphone capture via MediaRecorder, posting the blob to /api/voice/transcribe.
 * Gracefully reports unsupported browsers, denied permissions, and demo mode.
 */
export function useVoiceInput(onResult: (text: string) => void): UseVoiceInput {
  const [state, setState] = useState<VoiceState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const flashError = useCallback((message: string) => {
    setError(message);
    setState("error");
    window.setTimeout(() => setState("idle"), 1800);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    const unsupported =
      typeof window === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined";
    if (unsupported) {
      flashError("Recording isn't supported in this browser.");
      return;
    }

    let media: MediaStream;
    try {
      media = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      flashError("Microphone permission denied.");
      return;
    }

    setStream(media);
    const recorder = new MediaRecorder(media);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = async () => {
      setState("processing");
      media.getTracks().forEach((track) => track.stop());
      setStream(null);
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      try {
        const form = new FormData();
        form.append("audio", blob, "audio.webm");
        const res = await fetch("/api/voice/transcribe", { method: "POST", body: form });
        const data = (await res.json()) as { transcript?: string; demo?: boolean; error?: string };
        if (!res.ok) throw new Error(data.error || "Transcription failed.");
        if (data.demo) {
          setError("Add an OpenAI key to transcribe voice.");
          setState("idle");
          return;
        }
        if (data.transcript) onResult(data.transcript);
        setState("done");
        window.setTimeout(() => setState("idle"), 1200);
      } catch (err) {
        flashError(err instanceof Error ? err.message : "Transcription failed.");
      }
    };

    recorder.start();
    recorderRef.current = recorder;
    setState("recording");
  }, [flashError, onResult]);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  const toggle = useCallback(() => {
    if (state === "recording") stop();
    else void start();
  }, [state, start, stop]);

  return { state, error, stream, toggle, stop };
}
