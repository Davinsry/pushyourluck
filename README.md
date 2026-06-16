# Tahan Pedas 🌶️

A digital **push-your-luck party game** — a spicy-eating contest for 2–4 players,
local pass-and-play on one device. Eat more chili for more points, but every bite
raises your **kepedesan** (bust) risk. Bank before you choke.

Tablet-first, works in a phone browser, no backend. In-game copy is in Bahasa
Indonesia; the code is in English.

---

## Quick start

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # typecheck + production build → dist/
npm run preview    # preview the production build
npm test           # run the unit tests once (vitest)
npm run test:watch # watch mode
```

For **online multiplayer** (Supabase Realtime — no game server to run):

1. Copy `.env.local.example` → `.env.local` and fill in your Supabase project's
   URL + **publishable (anon)** key (`VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`).
2. (Optional, for the open-room browser) run [`supabase/rooms.sql`](supabase/rooms.sql)
   once in the Supabase SQL editor. Join-by-code works without it.
3. Smoke-test the realtime transport: `node scripts/supabase-smoketest.mjs`.

**Keep the free project awake:** Supabase pauses a free project after ~1 week
idle. A daily GitHub Action ([`.github/workflows/keepalive.yml`](.github/workflows/keepalive.yml))
pings it — add repo secrets `SUPABASE_URL` + `SUPABASE_KEY`. Locally / via any
cron you can run `node scripts/keepalive.mjs`.

---

## How to tune the balance

**Every gameplay number lives in one file: [`src/config/balance.ts`](src/config/balance.ts).**
Tuning the game = editing that file only. Nothing else hard-codes a value.

What you can change there:

| Constant         | Effect                                                            |
| ---------------- | ----------------------------------------------------------------- |
| `CYCLES`         | Rondes (turns) each player gets.                                  |
| `SABOTAGE_HEAT`  | Heat added per spectator "tambah sambal".                         |
| `SUSU_COOL`      | Heat removed by drinking susu.                                    |
| `BET_STAKE`      | Spectator bet payout (correct `+`, wrong `−`).                    |
| `FINAL_MULT`     | Score multiplier on the final "pamungkas" ronde.                  |
| `BUST`           | `bustChance% = clamp(heat − offset, 0, cap)`.                     |
| `MULT`           | Heat thresholds for the ×1.5 / ×2 "Level Berani" multiplier.      |
| `HEMAT`          | Si Hemat's safe-bank bonus and threshold.                         |
| `BITES`          | Each chili's point range, heat, name, and palette colour.         |
| `CHARS`          | Each character's upside/downside mechanics **and** display copy.  |
| `STARTING_KIT`   | Default tameng / susu / sabotage tokens.                          |

Characters are **sidegrades** — one upside, one downside — meant to stay roughly
equal. Mechanic fields (`pointMod`, `heatMod`, `surviveBust`, `maxMult`,
`sabotage`, `safeBonus`/`safeBelow`) are read by the rules engine; `tag` / `up` /
`down` are the Indonesian UI copy.

### Reskinning colours

The warm palette is defined once as CSS variables in
[`src/index.css`](src/index.css) and mapped to Tailwind utilities in
[`tailwind.config.js`](tailwind.config.js). Change a `--c-*` variable to restyle
the whole game. Per-chili / per-character colours reference these tokens via
`colorKey` in `balance.ts`.

---

## Project structure

```
src/
  config/
    balance.ts        ← ALL tunable numbers + game copy (the one file you tune)
  game/               ← typed domain logic, NO React (unit-testable)
    types.ts          ← Player, CharacterId, BiteId, Phase, Bet, GameState, Action
    rules.ts          ← pure functions: bustChance, multiplier, scoreBank, …
    reducer.ts        ← the state machine (pure given an injected rng)
    rules.test.ts     ← unit tests for the maths
    reducer.test.ts   ← unit tests for the state machine
    index.ts          ← barrel export
  hooks/
    useGame.ts        ← wires the reducer to React + derived turn values
    useSound.ts       ← synth-based SFX (no assets) with a mute toggle
  ui/
    theme.ts          ← palette token + heat-colour helpers
  components/         ← one dumb component per screen/phase + shared pieces
    SetupScreen.tsx   DraftScreen.tsx
    PreturnPhase.tsx  ActivePhase.tsx  ResultPhase.tsx  GameOverScreen.tsx
    HeatMeter.tsx     Scoreboard.tsx   KitBadges.tsx     Header.tsx
    ViewToggle.tsx    ← 2D / 3D switch
  three/              ← OPTIONAL 3D layer (lazy-loaded, reads game state only)
    GameScene.tsx     ← Canvas + lights + composes the stage
    ChiliHead.tsx     ← primitive "chili-head" eater, reacts to heat
    Particles.tsx     ← sweat / steam / fire (cheap fixed pools)
    Table.tsx         ← table + clickable chili bowls
    CameraRig.tsx     ← lerps camera to the active player
    seats.ts          ← seat / camera / bowl geometry (pure maths)
  App.tsx             ← wires game state to the right screen, fires SFX
  main.tsx            ← React entry point
  index.css           ← Tailwind + palette CSS variables
```

### Architecture in one breath

- **Logic is separate from UI.** All rules live in `src/game/` with no React
  import. The `gameReducer(state, action, rng)` is pure — same inputs always
  give the same output — so it is driven both from React (`useGame`) and from
  tests with a deterministic `rng`.
- **Components are dumb.** Each screen/phase component takes plain props and
  callbacks; it holds no game logic.
- **Randomness is injectable.** The reducer takes an `rng` (defaults to
  `Math.random`); tests pass a seeded sequence to make every dice roll
  deterministic.

---

## Game rules (summary)

1. **Setup** — pick 2–4 players, name them.
2. **Draft** — each player is shown 2 random characters and keeps 1. Each starts
   with 1 Tameng, 1 Susu, and Sabotage tokens (Tukang Kompor 2, others 1).
3. **Turns** — every player plays `CYCLES` rondes. Each turn has three phases:
   - **Preturn (penonton):** other players may bet *Aman* / *Kepedesan* and spend
     a sabotage token to add heat; the active player may spend a Tameng to block
     all sabotage.
   - **Active (makan):** eat chilis (points + heat, then a bust roll), drink susu
     to cool down (once), or *Sajikan* to bank.
   - **Result:** show the outcome and settle bets.
4. **Scoring on bank:** `round(roundPoints × multiplier) + hematBonus`, then
   `× FINAL_MULT` on the final "Pamungkas" ronde. A bust scores 0 for the ronde.
5. **Win** — after everyone finishes their rondes, the highest score wins (ties =
   "Seri").

---

## Modes

From the intro screen → main menu you can pick:

- **Main Sendiri (solo)** — 1 human vs bots. Bot brains are pure functions in
  [`src/game/bot.ts`](src/game/bot.ts), driven on a timer in `App.tsx` so the
  moves are watchable; tune their behaviour via `BOT` in `balance.ts`.
- **Main Bareng (local)** — pass-and-play, 2–4 humans on one device.
- **Cara Main** — a full in-app tutorial / rules screen (start to finish), with
  numbers pulled live from `balance.ts` so it never drifts from the real values.
- **Pengaturan** — rondes per player + sound toggle.
- **Main Online** — Supabase Realtime rooms; see roadmap.

There are **6 characters** and each player **freely picks** a different one
(taken characters disappear). Players start at **0 points** (`STARTING_SCORE`)
and earn them by playing; the shop spends points earned in earlier rondes.

Other table features (all tunable in `balance.ts`):

- **Turn timer** — `TURN_SECONDS` (20) per eating turn; running out skips the turn.
- **Pause** — freezes the timer; offers Resume / Restart (keeps names) / Menu.
- **Shop** — opens after each ronde (local play): spend points on Susu, Tameng,
  and Sambal (cabai = a sabotage token). Prices in `SHOP`.

## Roadmap

- **Phase 1 (done):** the 2D game — typed reducer, centralized balance, split
  components, sound + mute, unit tests. This is the primary product.
- **Modes (done):** intro + menu, solo-vs-bot, local multiplayer, settings,
  6 unique characters.
- **Online (done):** join-a-room multiplayer over **Supabase Realtime** — no
  game server to host. Transport = a Supabase channel per room (presence for the
  member list, broadcast for messages). The room **host is authoritative**: it
  runs the *same* pure reducer with its own rng and broadcasts the `GameState`;
  everyone else sends intents (game Actions) which the host validates by
  seat/turn ownership (`actionAllowed`). Create a room → share the 4-letter code
  → friends join by code or from the open-room list → host starts. Client hook:
  [`src/net/useRoom.ts`](src/net/useRoom.ts); protocol/types in
  [`src/net/protocol.ts`](src/net/protocol.ts); the optional open-room browser
  uses a `rooms` table ([`supabase/rooms.sql`](supabase/rooms.sql)).
- **Phase 2 (done):** an optional React Three Fiber + drei 3D layer in
  [`src/three/`](src/three), driven by the *same* game state — `heat` drives the
  whole reaction (sweat → reddening → steam → fire on bust), the camera lerps to
  face the active player each turn, and the chili bowls are clickable. Switch
  with the **2D / 3D** buttons on the play screen.

### About the 3D layer

- It is a pure **presentation layer**: it only *reads* `GameState`, never mutates
  it. The 2D reducer remains the single engine.
- The whole `three/` bundle is **lazy-loaded** (`React.lazy`), so the 2D game
  loads fast and devices that never open 3D never download three.js. (That's why
  the build prints a large `GameScene` chunk — it only loads on demand.)
- Everything is **low-poly, code-generated primitives** — zero 3D assets, zero
  rigging — to stay smooth on tablets. Pixel ratio is capped (`dpr={[1, 1.5]}`).
- Seat / camera / bowl positions are computed on a circle in
  [`seats.ts`](src/three/seats.ts) (`angle = (2π / playerCount) * index`).
- **Eat/drink gesture:** picking a chili (or drinking susu) plays a hand
  animation that reaches for the bowl/bottle and back to the mouth; the controls
  are **locked** until it finishes (duration = `ACTION_ANIM_MS` in `balance.ts`).
- **Camera:** orbit it freely (drag = 3rd-person, hand-free), but it still
  re-locks to the active player each turn like at game start — see
  [`CameraRig.tsx`](src/three/CameraRig.tsx).
