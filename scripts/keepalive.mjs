// Daily keep-alive: makes one lightweight request to Supabase so a free-tier
// project doesn't pause from inactivity. Reads SUPABASE_URL / SUPABASE_KEY from
// the environment, falling back to .env.local for local runs.
//   node scripts/keepalive.mjs
import { existsSync, readFileSync } from "node:fs";

function fromEnvFile() {
  const url = new URL("../.env.local", import.meta.url);
  if (!existsSync(url)) return {};
  return Object.fromEntries(
    readFileSync(url, "utf8")
      .split("\n")
      .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
      .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
  );
}

const file = fromEnvFile();
const URL_ = process.env.SUPABASE_URL || file.VITE_SUPABASE_URL;
const KEY = process.env.SUPABASE_KEY || file.VITE_SUPABASE_KEY;

if (!URL_ || !KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_KEY.");
  process.exit(1);
}

// Any HTTP response from the project means it's awake — that's all we need.
// (A paused/asleep project fails to connect; that's the only real error.)
try {
  const res = await fetch(`${URL_}/rest/v1/`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  console.log("keep-alive OK:", res.status, new Date().toISOString());
} catch (e) {
  console.error("keep-alive FAILED (no response):", e.message);
  process.exitCode = 1;
}
