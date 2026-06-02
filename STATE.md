# STATE.md — Current Working State

## Last Updated: 2026-06-02
## Current Phase: General chatbot + LIVE Groq AI working. 7 partial (Vitest). E2E/Lighthouse remain.
## Last Completed Step: Wired Groq (primary), fixed the real blocker (Node TLS / --use-system-ca); verified real LLM replies + live insights in browser.
## Next Step (suggested): Playwright E2E + Lighthouse; optional: persist conversations, conversation history.
## Active Files: src/lib/ai/groq.ts, src/app/api/chat/route.ts, src/lib/env.ts, src/app/page.tsx, scripts/next-with-system-ca.mjs, src/components/insights/InsightsPanel

## Test Results — Last Run
- Type check (tsc --noEmit): PASS
- Lint (next lint): PASS (0 warnings/errors)
- Unit tests (vitest): PASS — 27 tests across 4 files (memory, stream, mock, insights)
- LIVE Groq: PASS — real Llama 3.3 70B replies verified via curl AND in the browser UI (insights update live)
- Browser render: PASS — 2-pane layout (chat + insights), metrics settle correctly
- Live Gemini: still BLOCKED by an invalid key (Groq is the working provider now); code path correct
- E2E (playwright): NOT WRITTEN YET
- Lighthouse: NOT RUN YET

## Known Issues / Active Blockers
- RESOLVED (the real blocker): Node's fetch failed for ALL providers with UNABLE_TO_VERIFY_LEAF_SIGNATURE.
  Cause: this machine is behind a TLS-inspecting proxy whose root CA is only in the Windows store, not
  Node's bundled store. Fix: `npm run dev`/`npm start` run via scripts/next-with-system-ca.mjs which sets
  NODE_OPTIONS=--use-system-ca (Node 24 trusts the OS store). MUST use `npm run dev`, not bare `next dev`.
- GROQ_API_KEY in .env.local is VALID and working (gsk_..., Llama 3.3 70B). Default model = llama-3.3-70b-versatile.
- GOOGLE_AI_API_KEY is still INVALID (AQ.Ab8RN6..., not AIza...). Gemini models will 401 until replaced.
  Get a free Gemini key at https://aistudio.google.com/apikey if Gemini is wanted; Groq covers live AI now.
- No OpenAI/Clerk/Neon/Pusher keys — Demo mode by design. GPT-* models need an OpenAI key, else go to mock.

## Architecture Decisions Log
- 2026-05-31 npm over pnpm | dir already npm-initialised | rejected pnpm (mixed lockfile).
- 2026-05-31 manual scaffold | non-interactive shell | rejected create-next-app.
- 2026-05-31 next/font over @import | perf, no CLS | rejected CSS @import.
- 2026-05-31 Tailwind theme maps CSS vars | enforce "no raw hex" | rejected arbitrary [var(--x)].
- 2026-05-31 demo mode default (mock AI, in-memory) | runnable without accounts | rejected hard-require Clerk/OpenAI.
- 2026-05-31 Next pinned 14.2.35 | 14.2.18 had a flagged security vuln | rejected staying on 14.2.18.
- 2026-05-31 raw text stream (not SSE framing) | simpler client reader, fewer parsing bugs | rejected data: SSE lines.
- 2026-06-02 pivot fitness dashboard → general chatbot | user wants a real general assistant | removed nav rail, hero, progress, quick actions, fitness summary.
- 2026-06-02 InsightsPanel from live chat (deriveInsights) | "summary + graphs based on my chats" | rejected static/demo metrics.
- 2026-06-02 default model from key shape (geminiKeyLooksValid) | app must be usable now + auto-enable Gemini on valid key | rejected hard-defaulting to Gemini (would error on every send).
- 2026-06-02 AnimatedNumber rewritten with rAF tween | motion animate() left metrics stuck during streaming | rejected the motion-based version.
- 2026-06-02 Groq as PRIMARY provider | user supplied a working free Groq key; Gemini key invalid | added src/lib/ai/groq.ts.
- 2026-06-02 Groq via raw fetch + SSE (not OpenAI SDK) | SDK threw "Connection error" under Next's patched fetch | rejected the OpenAI SDK path for Groq.
- 2026-06-02 NODE_OPTIONS=--use-system-ca via launcher script | corporate TLS proxy CA only in Windows store; Node fetch failed cert check | rejected NODE_TLS_REJECT_UNAUTHORIZED=0 (insecure) and per-request rejectUnauthorized.

## Context Preservation
Resume order: read CLAUDE.md (architecture) → this file (state).
Codebase root: D:\Internship Task 4
Run: `npm run dev` → http://localhost:3000 (uses --use-system-ca; live Groq works; Demo works with no env).
Do NOT run bare `next dev` on this machine — TLS cert verification will fail for all live providers.
