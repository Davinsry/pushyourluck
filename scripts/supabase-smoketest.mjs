// Two-client smoke test for Supabase Realtime (presence + broadcast).
// Reads VITE_SUPABASE_URL / VITE_SUPABASE_KEY from .env.local.
//   node scripts/supabase-smoketest.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

const URL_ = env.VITE_SUPABASE_URL;
const KEY = env.VITE_SUPABASE_KEY;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const code = "TEST" + Math.floor(Math.random() * 1000);

const mk = () => createClient(URL_, KEY, { realtime: { params: { eventsPerSecond: 20 } } });
const a = mk();
const b = mk();
const idA = crypto.randomUUID();
const idB = crypto.randomUUID();

let bGotState = null;

const chA = a.channel(`room:${code}`, { config: { presence: { key: idA }, broadcast: { self: false } } });
const chB = b.channel(`room:${code}`, { config: { presence: { key: idB }, broadcast: { self: false } } });

chB.on("broadcast", { event: "state" }, ({ payload }) => (bGotState = payload));
chA.on("presence", { event: "sync" }, () => {});

await new Promise((res) =>
  chA.subscribe((s) => {
    console.log("A status:", s);
    if (s === "SUBSCRIBED") chA.track({ id: idA, name: "Alice", ts: Date.now() }).then(res);
  })
);
await new Promise((res) =>
  chB.subscribe((s) => {
    console.log("B status:", s);
    if (s === "SUBSCRIBED") chB.track({ id: idB, name: "Bob", ts: Date.now() }).then(res);
  })
);

await wait(4000);
const membersA = Object.values(chA.presenceState()).map((x) => x[0].name).sort();
console.log("A sees members:", membersA.join(", "));
if (membersA.length !== 2) throw new Error("presence did not sync both clients");

// Host (A) broadcasts an authoritative state; B should receive it.
chA.send({ type: "broadcast", event: "state", payload: { state: { screen: "draft" }, seatIds: [idA, idB] } });
await wait(800);
console.log("B received state:", JSON.stringify(bGotState));
if (!bGotState || bGotState.state.screen !== "draft") throw new Error("broadcast not received");

console.log("\nSUPABASE SMOKE TEST OK ✅ (room", code + ")");
await a.removeChannel(chA);
await b.removeChannel(chB);
process.exit(0);
