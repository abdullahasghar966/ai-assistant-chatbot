"use client";

import { motion, useReducedMotion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Volume2, Square } from "lucide-react";
import { messageBubble } from "@/motion/config";
import { useVoiceOutput } from "@/hooks/useVoiceOutput";
import { StreamingCursor } from "./StreamingCursor";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const reduce = useReducedMotion();
  const { speak, stop, isSpeaking, supported } = useVoiceOutput();
  const isUser = message.role === "user";
  const time = formatTime(new Date(message.createdAt));

  return (
    <motion.div
      variants={reduce ? undefined : messageBubble}
      initial={reduce ? false : "initial"}
      animate="animate"
      className={cn("flex w-full flex-col", isUser ? "items-end" : "items-start")}
    >
      {isUser ? (
        <p className="max-w-[80%] whitespace-pre-wrap break-words text-right text-[14px] font-medium text-ink">
          {message.content}
        </p>
      ) : (
        <div className="markdown-body max-w-[88%] break-words rounded-md bg-surface px-4 py-3 text-[14px] font-medium text-ink shadow-card">
          {message.pending ? (
            <span className="whitespace-pre-wrap">
              {message.content}
              <StreamingCursor />
            </span>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      )}

      <div className={cn("mt-1 flex items-center gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
        <span className="text-[11px] text-ink-tertiary">{time}</span>
        {!isUser && !message.pending && supported && message.content && (
          <button
            type="button"
            onClick={() => (isSpeaking ? stop() : speak(message.content))}
            aria-label={isSpeaking ? "Stop reading" : "Read aloud"}
            className="text-ink-tertiary outline-none transition-colors hover:text-accent"
          >
            {isSpeaking ? <Square size={13} fill="currentColor" /> : <Volume2 size={14} />}
          </button>
        )}
      </div>
    </motion.div>
  );
}
