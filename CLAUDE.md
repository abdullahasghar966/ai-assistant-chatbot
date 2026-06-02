# CLAUDE.md — Project Architecture

## Project: AI Chatbot Platform

A warm light-mode, general-purpose AI chatbot. The chat is the primary surface
(streaming replies, voice input, Markdown), paired with a live **Insights panel**
that derives a summary, a you-vs-AI message split, recent-activity bars, and topic
themes purely from the current conversation. Coral-red accent, floating white bento
cards on a warm off-white canvas, Plus Jakarta Sans.

It is a general assistant: it answers any topic (writing, code, explanations,
planning, math) and only discusses fitness/wellbeing when the user asks. The visual
language was originally inspired by Dribbble #26738539, but the fitness dashboard,
charcoal nav rail, and demo metrics have been removed in favour of the chatbot.

---

## Session resume (READ THIS FIRST, every new session)

Read these in order before touching anything:
1. **CLAUDE.md** (this file) — architecture, stack, design system, conventions.
2. **STATE.md** — current phase, last step, NEXT step, known issues, decisions log.
3. **PROGRESS.md** — phase-by-phase checklist of done vs pending.

Then continue from the **"Next Step"** line in STATE.md. Provider keys live in
`.env.local` (gitignored). A working **Groq** key is present, so `npm run dev` runs
live AI out of the box (Demo mode still works with no keys).

**IMPORTANT — TLS / `--use-system-ca`:** this machine sits behind a TLS-inspecting
proxy whose root CA is only in the Windows store, not Node's. Plain `next dev` makes
Node's `fetch` fail every provider call with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`. So
`npm run dev` / `npm start` go through `scripts/next-with-system-ca.mjs`, which sets
`NODE_OPTIONS=--use-system-ca`. Use `npm run dev` (not `next dev` directly), or live
AI will fail with a TLS error.

---

## Stack (as built)

- **Framework:** Next.js 14 (App Router, React Server Components), React 18, TypeScript (strict).
- **Styling:** Tailwind CSS 3.4 mapped onto a CSS-custom-property token system (`src/styles/tokens.css`). Components use semantic Tailwind keys only — no raw hex.
- **Animation:** Motion (Framer Motion v12), imported from `motion/react`. All variants centralised in `src/motion/config.ts`.
- **Font:** Plus Jakarta Sans via `next/font/google` (self-hosted, `display: swap`, exposed as `--font-jakarta`).
- **Icons:** `lucide-react` (SVG only, never emoji).
- **AI:** Multi-provider, chosen per-request from the selected model and which keys are configured:
  - **Groq** (PRIMARY, active) — OpenAI-compatible, streamed via raw `fetch` + SSE in `src/lib/ai/groq.ts` (Llama 3.3 70B, etc.). Free, fast.
  - **Gemini** (`@google/generative-ai`) — supported when a valid `GOOGLE_AI_API_KEY` (starts with `AIza`) is set.
  - **OpenAI** — supported when `OPENAI_API_KEY` is set.
  - **Mock** — local streamer so the app runs with zero external accounts (Demo mode).
- **Markdown:** `react-markdown` + `remark-gfm` + `rehype-highlight` for AI replies.

### Deviations from the original master prompt (and why)

| Prompt said | We did | Reason |
| --- | --- | --- |
| pnpm | **npm** | Directory was already npm-initialised (`package-lock.json`); avoids a mixed lockfile. |
| `create-next-app` (interactive) | **Manual scaffold** | Non-interactive shell; exact control over config. |
| `@import` Google Fonts | **next/font** | No render-blocking request, no layout shift. |
| tiktoken (wasm) | **char/4 estimator** | wasm is brittle in Next route bundles; the sliding-window math doesn't need exact counts. |
| Clerk / Neon / Pusher required | **Optional, env-gated** | No keys available; app must run in demo mode and upgrade when keys are added. |

---

## Run modes

- **Demo mode (default, no keys):** mock streaming assistant, in-memory conversation, no auth. `npm run dev` just works.
- **Production mode (keys present):** real OpenAI streaming; Clerk/Prisma/Pusher modules activate behind env flags (scaffolded, see PROGRESS.md phases 5–7).

---

## Design system (source of truth: `src/styles/tokens.css`)

- **Canvas** `#EDECEA` greige → **app container** `#F4F2F0` → **cards** `#FFFFFF`.
- **Sidebar** charcoal `#4A4848`; **accent** coral `#E8552A`.
- **Text:** primary `#1A1918`, secondary `#6B6966`, tertiary `#A09C99`.
- **Radii:** xs 8 / sm 12 / md 16 / lg 24 / xl 32 / pill 100.
- **Shadows:** `card`, `raised`, `sidebar` (soft, warm, never blue).
- **Type scale (Tailwind keys):** `text-display` (800/-0.02em), `text-h1/h2/h3`, `text-body`, `text-body-md`, `text-caption`, `text-metric-lg/md/sm`.

Tailwind theme keys (see `tailwind.config.ts`): colors `canvas app surface(.dark) sidebar(.active) accent(.hover/.soft/.softer) ink(.secondary/.tertiary/.inverse/.sidebar) line(.medium/.input) chart(.primary/.secondary/.track/.bar-active/.bar-muted)`; `rounded-{xs..xl,pill}`; `shadow-{card,raised,sidebar}`; `animate-{blink,shimmer}`.

### Craft guardrails (from impeccable)

No side-stripe borders, no gradient text, no decorative glassmorphism, no em dashes in UI copy, motion never animates layout properties (transform/opacity only), `prefers-reduced-motion` respected everywhere.

---

## Directory map

```
src/
  app/                  App Router pages, layouts, API routes
    page.tsx            Server entry: picks default model from key validity
    api/chat/route.ts   Streaming chat (Gemini / OpenAI / mock), Zod-validated
  components/
    ui/                 Skeleton, ... (shared primitives)
    layout/             AppShell (client; owns chat state, 2-pane: chat + insights)
    chat/               ChatPanel, MessageBubble, MessageFeed, StreamingCursor,
                        ChatInput, ModelSelector, EmptyState
    insights/           InsightsPanel (chat-driven summary, ring, bars, themes)
    data/               RingChart, BarChart, AnimatedNumber (repurposed for chat insights)
    voice/              VoiceButton, WaveformVisualizer
  hooks/                useStream, useVoice, useReducedMotion helpers
  lib/
    ai/                 client (OpenAI), gemini, memory (sliding window), system prompt, mock, stream
    insights.ts         deriveInsights(messages): pure summary/stats/topics/activity
    env.ts              Zod env + provider flags (hasGemini, geminiKeyLooksValid)
    demo-data.ts        General suggested prompts
    utils.ts            cn(), formatTime()
  motion/config.ts      All Motion variants
  styles/               tokens.css, globals.css
  types/                Shared TS interfaces (+ MODEL_OPTIONS)
```

---

## Environment variables

See `.env.example`. All optional in demo mode. Primary provider is **Groq**:
`GROQ_API_KEY` (starts with `gsk_` — get one free at https://console.groq.com/keys),
`GROQ_MODEL` (default `llama-3.3-70b-versatile`). Also `GOOGLE_AI_API_KEY` (Gemini, must
start with `AIza`), `GEMINI_MODEL`, `OPENAI_API_KEY`, `OPENAI_MODEL`, and (future phases)
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `PUSHER_*`.
`page.tsx` picks the default model from whichever key looks valid (Groq, then Gemini,
else offline Demo).

---

## Non-negotiables

TS strict, zero `any`/`@ts-ignore`. Zod on every API route. CSS variables only in components. Plus Jakarta Sans only. Motion on every interactive element. `prefers-reduced-motion` honoured. Keyboard-navigable, labelled controls, `aria-live` for streaming.
