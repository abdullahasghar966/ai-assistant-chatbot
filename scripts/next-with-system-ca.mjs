// Launches the Next.js CLI with Node's system CA trust store enabled
// (`--use-system-ca`, via NODE_OPTIONS so it propagates to Next's worker
// processes). Required when the local network inspects HTTPS (corporate /
// antivirus / ISP TLS proxies): the proxy's root CA lives in the OS trust
// store, which Node ignores by default, breaking outbound fetch to AI providers
// (Groq, Gemini, OpenAI) with UNABLE_TO_VERIFY_LEAF_SIGNATURE.
//
// Cross-platform, zero dependencies.
// Usage: node scripts/next-with-system-ca.mjs <dev|start|build> [extra args]
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const sub = process.argv[2] ?? "dev";
const extraArgs = process.argv.slice(3);

const env = {
  ...process.env,
  NODE_OPTIONS: [process.env.NODE_OPTIONS, "--use-system-ca"].filter(Boolean).join(" "),
};

const child = spawn(process.execPath, [nextBin, sub, ...extraArgs], {
  stdio: "inherit",
  env,
});

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => {
    try {
      child.kill(signal);
    } catch {
      /* already gone */
    }
  });
}

child.on("exit", (code) => process.exit(code ?? 0));
child.on("error", (err) => {
  console.error("Failed to start Next.js:", err);
  process.exit(1);
});
