import type { ChatMessage } from "@/types";

export interface Topic {
  label: string;
  /** Relative weight 0–1 (frequency normalised to the most common topic). */
  weight: number;
}

export interface ChatInsights {
  totalMessages: number;
  userMessages: number;
  aiMessages: number;
  userWords: number;
  aiWords: number;
  totalWords: number;
  avgUserWords: number;
  /** Share of messages sent by the user (0–1). */
  userShare: number;
  /** Share of messages sent by the assistant (0–1). */
  aiShare: number;
  /** Top keywords drawn from the user's messages. */
  topics: Topic[];
  /** Word count of the most recent messages, normalised 0–1, for the bar chart. */
  activity: number[];
  /** A label per activity bar ("You" / "AI"). */
  activityRoles: ("user" | "assistant")[];
  /** A short, human-readable summary derived from the conversation. */
  summary: string;
}

/** Words ignored when ranking conversation topics. */
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "if", "then", "so", "of", "to", "in", "on",
  "at", "for", "with", "from", "by", "as", "is", "are", "was", "were", "be", "been",
  "being", "do", "does", "did", "doing", "have", "has", "had", "having", "will",
  "would", "should", "could", "can", "may", "might", "must", "shall", "i", "you",
  "he", "she", "it", "we", "they", "me", "him", "her", "us", "them", "my", "your",
  "his", "its", "our", "their", "this", "that", "these", "those", "what", "which",
  "who", "whom", "whose", "when", "where", "why", "how", "all", "any", "some", "no",
  "not", "just", "than", "too", "very", "about", "into", "over", "out", "up", "down",
  "please", "thanks", "thank", "hi", "hey", "hello", "want", "need", "like", "get",
  "got", "make", "made", "tell", "give", "help", "know", "think", "use", "using",
]);

function countWords(text: string): number {
  const matches = text.trim().match(/\S+/g);
  return matches ? matches.length : 0;
}

function topUserKeywords(userText: string, limit: number): Topic[] {
  const tokens = userText.toLowerCase().match(/[a-z][a-z'-]{2,}/g) ?? [];
  const counts = new Map<string, number>();
  for (const token of tokens) {
    if (STOP_WORDS.has(token) || token.length < 3) continue;
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  if (ranked.length === 0) return [];

  const max = ranked[0]![1];
  return ranked.map(([label, count]) => ({
    label,
    weight: max === 0 ? 0 : count / max,
  }));
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

function buildSummary(
  userMessages: ChatMessage[],
  totalMessages: number,
  topics: Topic[],
): string {
  if (totalMessages === 0) {
    return "No conversation yet. Ask anything and a live summary will appear here.";
  }

  const firstUser = userMessages[0];
  const parts: string[] = [];

  if (firstUser) {
    parts.push(`You opened with: "${truncate(firstUser.content, 90)}"`);
  }

  if (topics.length > 0) {
    const labels = topics.slice(0, 3).map((t) => t.label);
    parts.push(`Main themes so far: ${labels.join(", ")}.`);
  }

  parts.push(
    `${totalMessages} message${totalMessages === 1 ? "" : "s"} exchanged.`,
  );

  return parts.join(" ");
}

/**
 * Derive live conversation insights (summary, stats, topics, activity) purely
 * from the chat messages. No network calls, so it works in every run mode.
 */
export function deriveInsights(messages: ChatMessage[]): ChatInsights {
  const conversational = messages.filter((m) => m.role !== "system");
  const userMessages = conversational.filter((m) => m.role === "user");
  const aiMessages = conversational.filter((m) => m.role === "assistant");

  const userWords = userMessages.reduce((sum, m) => sum + countWords(m.content), 0);
  const aiWords = aiMessages.reduce((sum, m) => sum + countWords(m.content), 0);
  const totalWords = userWords + aiWords;
  const totalMessages = conversational.length;

  const topics = topUserKeywords(userMessages.map((m) => m.content).join(" "), 6);

  const recent = conversational.slice(-8);
  const recentCounts = recent.map((m) => countWords(m.content));
  const maxCount = Math.max(1, ...recentCounts);
  const activity = recentCounts.map((c) => (c === 0 ? 0.04 : c / maxCount));
  const activityRoles = recent.map((m) => (m.role === "assistant" ? "assistant" : "user"));

  return {
    totalMessages,
    userMessages: userMessages.length,
    aiMessages: aiMessages.length,
    userWords,
    aiWords,
    totalWords,
    avgUserWords: userMessages.length === 0 ? 0 : Math.round(userWords / userMessages.length),
    userShare: totalMessages === 0 ? 0 : userMessages.length / totalMessages,
    aiShare: totalMessages === 0 ? 0 : aiMessages.length / totalMessages,
    topics,
    activity,
    activityRoles,
    summary: buildSummary(userMessages, totalMessages, topics),
  };
}
