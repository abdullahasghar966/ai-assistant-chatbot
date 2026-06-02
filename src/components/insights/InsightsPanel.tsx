"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { Sparkles, MessagesSquare, Hash } from "lucide-react";
import { RingChart } from "@/components/data/RingChart";
import { BarChart } from "@/components/data/BarChart";
import { AnimatedNumber } from "@/components/data/AnimatedNumber";
import { deriveInsights } from "@/lib/insights";
import { staggerChild, staggerContainer } from "@/motion/config";
import type { ChatMessage } from "@/types";

function LegendDot({ color }: { color: string }) {
  return <span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden />;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={staggerChild}
      className={`rounded-md border border-line bg-surface p-5 shadow-card ${className}`}
    >
      {children}
    </motion.div>
  );
}

/** Live conversation insights derived entirely from the chat: summary, you-vs-AI
 *  split, recent message activity, and the themes you have been talking about. */
export function InsightsPanel({ messages }: { messages: ChatMessage[] }) {
  const insights = useMemo(() => deriveInsights(messages), [messages]);
  const hasChat = insights.totalMessages > 0;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-4"
    >
      <motion.header variants={staggerChild}>
        <p className="text-[13px] font-medium text-ink-secondary">Conversation</p>
        <h1 className="mt-1 text-h1 text-ink">Chat insights</h1>
      </motion.header>

      <Card>
        <div className="mb-2 flex items-center gap-1.5">
          <Sparkles size={14} className="text-accent" aria-hidden />
          <h2 className="text-[13px] font-semibold text-ink">Summary</h2>
        </div>
        <p className="text-[13px] leading-relaxed text-ink-secondary">{insights.summary}</p>
      </Card>

      <motion.div variants={staggerChild} className="grid grid-cols-2 gap-4">
        <div className="rounded-md border border-line bg-surface p-5 shadow-card">
          <div className="mb-1 flex items-center gap-1.5">
            <MessagesSquare size={14} className="text-ink-tertiary" aria-hidden />
            <span className="text-[11px] text-ink-secondary">Messages</span>
          </div>
          <p className="text-metric-md text-ink">
            <AnimatedNumber value={insights.totalMessages} />
          </p>
        </div>
        <div className="rounded-md border border-line bg-surface p-5 shadow-card">
          <div className="mb-1 flex items-center gap-1.5">
            <Hash size={14} className="text-ink-tertiary" aria-hidden />
            <span className="text-[11px] text-ink-secondary">Words</span>
          </div>
          <p className="text-metric-md text-ink">
            <AnimatedNumber value={insights.totalWords} />
          </p>
        </div>
      </motion.div>

      {hasChat ? (
        <>
          <Card>
            <h2 className="mb-3 text-[13px] font-semibold text-ink">Who is talking</h2>
            <div className="flex items-center gap-4">
              <RingChart
                primary={insights.userShare}
                secondary={insights.aiShare}
                size={104}
                ariaLabel={`You ${Math.round(insights.userShare * 100)} percent, AI ${Math.round(insights.aiShare * 100)} percent of messages`}
              />
              <div className="flex flex-col gap-2.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <LegendDot color="var(--color-chart-primary)" />
                    <span className="text-[11px] text-ink-secondary">You</span>
                  </div>
                  <p className="text-[15px] font-bold text-ink">{insights.userMessages}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <LegendDot color="var(--color-chart-secondary)" />
                    <span className="text-[11px] text-ink-secondary">AI</span>
                  </div>
                  <p className="text-[15px] font-bold text-ink">{insights.aiMessages}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 text-[13px] font-semibold text-ink">Recent activity</h2>
            <BarChart
              bars={insights.activity}
              activeIndex={insights.activity.length - 1}
              labels={insights.activityRoles.map((r) => (r === "user" ? "You" : "AI"))}
              height={56}
            />
            <p className="mt-2 text-[11px] text-ink-tertiary">Message length, most recent on the right</p>
          </Card>

          {insights.topics.length > 0 && (
            <Card>
              <h2 className="mb-3 text-[13px] font-semibold text-ink">Themes</h2>
              <div className="flex flex-wrap gap-2">
                {insights.topics.map((topic) => (
                  <span
                    key={topic.label}
                    className="rounded-pill bg-accent-softer px-3 py-1 text-[12px] font-medium text-ink-secondary"
                    style={{ opacity: 0.6 + topic.weight * 0.4 }}
                  >
                    {topic.label}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </>
      ) : (
        <motion.p variants={staggerChild} className="px-1 text-[13px] text-ink-tertiary">
          Start chatting and your live summary, message split, and themes will build here.
        </motion.p>
      )}
    </motion.div>
  );
}
