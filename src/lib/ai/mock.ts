/**
 * Local mock assistant used when no valid model key is set (Demo mode), so the
 * whole app is interactive with zero external accounts. Streams word-by-word to
 * mimic a real token stream. This is a general-purpose assistant: it answers a
 * range of everyday topics and only talks about fitness when asked.
 */

const DEMO_NOTE = "\n\n_(Demo mode: this reply is generated locally. Add a valid Gemini API key to `.env.local` for full AI answers.)_";

function pickReply(user: string): string {
  const t = user.toLowerCase().trim();

  if (t.length <= 24 && /\b(hi|hey|hello|yo|sup|good (morning|afternoon|evening))\b/.test(t)) {
    return `Hi! I'm your AI assistant. I can help with writing, coding, explanations, planning, math, and general questions. What would you like to do?`;
  }

  if (/who are you|what are you|your name|what can you do|how do you work/.test(t)) {
    return `I'm a general-purpose AI assistant. I can:

- Answer questions and explain concepts
- Help you write and edit text
- Draft and debug code
- Brainstorm and plan

Ask me anything to get started.`;
  }

  if (/\bcode\b|program|javascript|typescript|python|function|bug|error|react|api\b/.test(t)) {
    return `Here's a clean way to approach that:

\`\`\`ts
function solve(input: string): string {
  // 1. validate the input
  // 2. do the work
  // 3. return the result
  return input.trim();
}
\`\`\`

Share the snippet or the exact error message and I'll give you a precise fix.${DEMO_NOTE}`;
  }

  if (/write|essay|email|draft|paragraph|rewrite|blog|message|letter/.test(t)) {
    return `Happy to help you write that. Tell me three things and I'll draft it:

- **Audience** who is it for
- **Goal** what should it achieve
- **Tone** formal, friendly, persuasive

Give me those and I'll produce a first version.${DEMO_NOTE}`;
  }

  if (/explain|what is|how does|why does|difference between|meaning of/.test(t)) {
    return `Good question. Here's the short version:

- Start with the core idea in one sentence
- Add the key detail that makes it click
- Finish with a quick example

Tell me the specific topic and I'll explain it at whatever depth you want.${DEMO_NOTE}`;
  }

  if (/work ?out|exercise|gym|fitness|nutrition|diet|protein|calorie|stretch/.test(t)) {
    return `Sure, here's a simple, balanced starting point:

- **Move** a short daily walk plus 2-3 strength sessions a week
- **Eat** mostly whole foods, enough protein, plenty of water
- **Recover** consistent sleep and rest days

Tell me your goal and I'll get specific. (Not medical advice; check a professional for anything clinical.)${DEMO_NOTE}`;
  }

  return `Here's how I'd think about that:

- Break it into the smallest first step
- Focus on the one detail that matters most
- Iterate from there

Give me a bit more context and I'll get concrete.${DEMO_NOTE}`;
}

function tokenize(text: string): string[] {
  return text.match(/\S+\s*|\s+/g) ?? [text];
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function* mockStream(userText: string): AsyncGenerator<string> {
  const reply = pickReply(userText);
  for (const token of tokenize(reply)) {
    await sleep(14 + Math.random() * 24);
    yield token;
  }
}
