# PROGRESS.md — Build Progress

Legend: `[x]` done · `[~]` partial / scaffolded · `[ ]` not started.

## Phase 1: Foundation
- [x] Project scaffolding (Next.js 14.2.35, TypeScript strict, Tailwind 3.4) — manual, npm
- [x] Design system — tokens.css full palette, next/font Plus Jakarta Sans, motion config
- [ ] Clerk auth — deferred (no keys; env-gated, documented in .env.example)
- [ ] Prisma + Neon + seed — deferred (no DB; in-memory/client store for demo)
- [x] Environment config — `.env.example` + Zod env parsing (`src/lib/env.ts`)

## Phase 2: Core Chat Engine
- [x] OpenAI streaming API route (/api/chat), Zod-validated, OpenAI-or-mock
- [x] useStream hook — ReadableStream parsing, abort, optimistic, typed errors
- [x] Sliding-window memory manager (`src/lib/ai/memory.ts`, char-estimate budget)
- [x] Optimistic UI message updates
- [~] Message persistence — in-memory/client now; Postgres path reserved for prod

## Phase 3: App Shell & Layout (general chatbot)
- [x] AppShell — 2-pane grid: chat (primary) + live insights panel; owns chat state
- [x] ChatPanel — header with brand + functional "New chat", message feed, input, model selector
- [x] InsightsPanel — chat-driven summary, you-vs-AI ring, activity bars, theme tags
- [x] Mobile responsive — panes stack, chat first
- [removed] Charcoal Sidebar / NavItem / MobileNav / MainArea — deleted (non-functional fitness nav)

## Phase 4: UI Components
- [x] MessageBubble (user text-only / AI white card + markdown + read-aloud)
- [x] StreamingCursor (blink)
- [x] RingChart (animated SVG arcs) — repurposed: you-vs-AI message split
- [x] BarChart (staggered grow) — repurposed: recent message-length activity
- [x] AnimatedNumber — rewritten with rAF tween that always settles on target (live during streaming)
- [x] ChatInput (auto-grow textarea, send + mic, Enter/Shift+Enter)
- [x] ModelSelector (Gemini / GPT / Demo dropdown)
- [x] EmptyState (general intro + general suggested prompts)
- [x] Skeleton loaders (shimmer)
- [removed] ProgressCard / QuickActionButton / ActivityMiniCards / SummarySection / SegmentedControl / AIChatbotBadge — deleted (fitness-specific)

## Phase 5: Voice I/O
- [x] VoiceButton (idle/recording/processing/done/error, pulse rings)
- [x] WaveformVisualizer (Web Audio canvas, coral bars)
- [x] Whisper transcription route — env-gated, clean demo fallback
- [x] useVoiceOutput (Web Speech TTS, read-aloud button on AI messages)

## Phase 6: Chatbot Intelligence + Insights
- [x] LIVE AI working via Groq (primary) — `src/lib/ai/groq.ts`, raw fetch + SSE, Llama 3.3 70B
- [x] Multi-provider model selector (Groq / Gemini / OpenAI / Demo)
- [x] General-purpose system prompt + general mock (fitness only when asked)
- [x] Chat-driven insights engine (`src/lib/insights.ts`) — summary, stats, topics, activity
- [x] Smart default model — Groq when key valid (gsk_), then Gemini (AIza), else Demo
- [x] TLS fix for corporate proxy — `scripts/next-with-system-ca.mjs` sets `--use-system-ca`
- [x] Friendly provider errors (invalid key / TLS cert / rate limit / quota / network)
- [ ] Pusher channels — deferred (env-gated)
- [ ] Conversation history / multi-thread — single conversation for now

## Phase 7: Testing + Deploy
- [x] Vitest unit (memory, stream, mock, insights) — 27 tests across 4 files, all passing
- [ ] Playwright E2E
- [ ] Lighthouse audit
- [x] vercel.json + README + .env.example

## Completion Log
- 2026-05-31 ✅ Phase 1 foundation + design system (Next 14.2.35, Tailwind tokens, motion).
- 2026-05-31 ✅ Phase 2 chat engine (streaming route, useStream, memory, mock).
- 2026-05-31 ✅ Phase 3 app shell + responsive layout.
- 2026-05-31 ✅ Phase 4 full UI component set.
- 2026-05-31 ✅ Phase 5 voice in/out.
- 2026-05-31 ✅ Verified: `tsc` clean, `next build` green, app renders + streams in browser.
- 2026-05-31 ✅ Phase 6 (partial): Gemini fallback + model selector UI (5-option dropdown).
- 2026-05-31 ✅ Phase 7 (partial): Vitest unit tests for memory, stream, mock (19 tests passing).
- 2026-06-01 ✅ PIVOT to general chatbot: removed the fitness dashboard, nav rail, and demo metrics.
- 2026-06-01 ✅ General assistant system prompt + general mock replies (fitness only on request).
- 2026-06-01 ✅ Chat insights: summary + you-vs-AI ring + activity bars + theme tags, all from live chat.
- 2026-06-01 ✅ Diagnosed live-Gemini failure = invalid API key (Google returns API_KEY_INVALID); code path verified correct.
- 2026-06-01 ✅ Fixed AnimatedNumber so metrics settle correctly while the chat streams; 27 unit tests green, tsc clean.
- 2026-06-02 ✅ Integrated Groq as the primary live provider (raw fetch + SSE, Llama 3.3 70B); model selector updated.
- 2026-06-02 ✅ Diagnosed the real blocker: Node fetch failed for all providers with UNABLE_TO_VERIFY_LEAF_SIGNATURE (TLS-inspecting proxy; CA only in Windows store).
- 2026-06-02 ✅ Fixed via scripts/next-with-system-ca.mjs (NODE_OPTIONS=--use-system-ca); live Groq verified via curl + browser, 27 tests + tsc + lint all green.
