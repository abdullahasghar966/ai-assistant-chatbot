"use client";

import { useState } from "react";
import { useStream } from "@/hooks/useStream";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { InsightsPanel } from "@/components/insights/InsightsPanel";
import type { ChatModelId } from "@/types";

interface AppShellProps {
  /** Default model chosen on the server based on whether a real key is present. */
  defaultModel: ChatModelId;
}

/**
 * Two-pane workspace: the chat is the primary surface, with a live insights
 * panel beside it. Chat state lives here so the insights panel can read the
 * same messages. Below lg the panes stack (chat first).
 */
export function AppShell({ defaultModel }: AppShellProps) {
  const [model, setModel] = useState<ChatModelId>(defaultModel);
  const { messages, isStreaming, error, send, stop, reset, clearError } = useStream({ model });

  return (
    <div className="min-h-dvh bg-canvas">
      <div className="mx-auto max-w-[1280px] p-3 sm:p-4 lg:p-6">
        <div className="rounded-xl bg-app p-3 sm:p-5 lg:h-[calc(100dvh-48px)] lg:overflow-hidden">
          <div className="flex flex-col gap-4 lg:grid lg:h-full lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-5">
            <main className="min-h-[68vh] min-w-0 lg:min-h-0">
              <ChatPanel
                messages={messages}
                isStreaming={isStreaming}
                error={error}
                model={model}
                onModelChange={setModel}
                onSend={send}
                onStop={stop}
                onReset={reset}
                onClearError={clearError}
              />
            </main>

            <aside className="pb-4 lg:overflow-y-auto lg:pb-2 lg:pr-1">
              <InsightsPanel messages={messages} />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
