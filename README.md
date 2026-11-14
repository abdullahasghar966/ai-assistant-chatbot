# AI Assistant

**🔗 Live site:** [ai-assistant-chatbot-dusky.vercel.app](https://ai-assistant-chatbot-dusky.vercel.app) — demo mode (mock assistant) until an AI key is added

A warm light-mode, general-purpose AI chatbot. The chat is the primary surface, paired
with a live **Insights panel** that derives a summary, a you-vs-AI message split,
recent-activity bars, and topic themes purely from your conversation. Coral-red accent,
floating white bento cards on a warm off-white canvas, Plus Jakarta Sans, motion on every
interactive surface.

It answers any topic (writing, code, explanations, planning, math) and only talks about
fitness/wellbeing when you ask.

## Highlights

- **Live AI via Groq** (free, fast, OpenAI-compatible) streaming Llama 3.3 70B by default.
  Gemini and OpenAI are supported too; with no key it runs a local **Demo** mock so the app
  is always interactive.
- **Chat insights.** A live summary, message counts, a you-vs-AI ring, recent-activity bars,
  and topic tags, all computed from your actual conversation (`src/lib/insights.ts`).
- **Streaming chat** with optimistic updates, stop/abort, a model picker, "New chat", and an
  error bar with retry and friendly provider messages.
- **Voice in and out.** Mic capture with a live coral waveform, transcription route, and Web
  Speech read-aloud on AI replies.
- **Craft.** TypeScript strict, design tokens (no raw hex in components), `prefers-reduced-motion`
  honoured, keyboard-navigable controls, `aria-live` streaming.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

The app works immediately in **Demo mode** with no keys. For live AI, copy `.env.example`
to `.env.local` and set a **Groq** key (free, no card — https://console.groq.com/keys):

```
GROQ_API_KEY=gsk_your_key_here
```

> **TLS-inspecting networks (corporate / antivirus / ISP proxies):** if live calls fail with
> `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, your network re-signs HTTPS with a private root CA that
> Node doesn't trust by default. `npm run dev` and `npm start` go through
> `scripts/next-with-system-ca.mjs`, which runs Node with `--use-system-ca` to trust the OS
> store. **Use `npm run dev`, not bare `next dev`.**

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Dev server with `--use-system-ca` (live AI works behind TLS proxies) |
| `npm run dev:plain` | Plain `next dev` (no system-CA; only if your network does not inspect TLS) |
| `npm run build` | Production build (also type-checks + lints) |
| `npm run start` | Serve the production build (with `--use-system-ca`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm test` | Vitest unit tests (memory, stream, mock, insights) |

## Architecture

See [CLAUDE.md](CLAUDE.md) for the full architecture, design system, and decision log.
Build progress lives in [PROGRESS.md](PROGRESS.md); current state in [STATE.md](STATE.md).

```
src/
  app/                  layout, page (picks default model), /api/chat, /api/voice/transcribe
  components/{layout,chat,insights,data,voice,ui}
  hooks/                useStream, useVoiceInput, useVoiceOutput
  lib/ai/               groq, gemini, client (openai), memory (sliding window), mock, stream, system prompt
  lib/insights.ts       deriveInsights(messages): summary, stats, topics, activity
  lib/env.ts            Zod env + provider flags
  motion/config.ts      all Motion variants
  styles/               tokens.css (source of truth), globals.css
scripts/next-with-system-ca.mjs  launcher that enables Node's system CA store
```

## Providers

| Model picker | Provider | Needs |
| --- | --- | --- |
| Llama 3.3 70B / 3.1 8B / GPT-OSS 120B | Groq | `GROQ_API_KEY` (gsk_...) |
| Gemini 2.0 Flash | Google | `GOOGLE_AI_API_KEY` (AIza...) |
| GPT-4o | OpenAI | `OPENAI_API_KEY` |
| Demo | Local mock | nothing |

`src/app/page.tsx` picks the default model from whichever key looks valid: Groq, then Gemini,
otherwise Demo.

## Notable decisions

- **Groq via raw `fetch` + SSE** (not the OpenAI SDK), because the SDK's connection handling
  fails under Next.js's patched global fetch.
- **`--use-system-ca`** launcher to survive TLS-inspecting proxies without disabling cert
  verification.
- **npm** (repo was already npm-initialised), **manual scaffold**, **next/font** over a blocking
  `@import`, **Tailwind 3.4** with the token system mapped into the theme, **char-based token
  estimate** instead of wasm `tiktoken`. Next pinned to **14.2.35** (security-patched).

## Deployment

`vercel.json` sets streaming function timeouts. Deploy to Vercel and add provider env vars in
the project settings. (Vercel's network does not inspect TLS, so `--use-system-ca` is only
needed for local dev behind a corporate proxy.)
