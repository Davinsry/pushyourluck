import { useState, useEffect } from "react";
import { CheckCheck, Coins, Flame, FlameKindling, Hand, Milk, Shield, Sparkles } from "lucide-react";
import { BET_STAKE, BITES, CHARS, FINAL_MULT, TAMENG_BLOCK, SABOTAGE_MAX_PER_TARGET, BLOCK_BET_AND_SABO, SABOTAGE_HEAT } from "../config/balance";
import type { Bet, BiteId, GameState } from "../game";
import { multiplier } from "../game";
import { color } from "../ui/theme";
import { HeatMeter } from "./HeatMeter";

interface Props {
  state: GameState;
  activeIndex: number;
  isFinal: boolean;
  isLastTurn: boolean;
  onToggleBet: (player: number, bet: Bet) => void;
  onAddSabo: (player: number) => void;
  onConfirm: () => void;
  onUseTameng: (count: number) => void;
  onAcceptHeat: () => void;
  onSuap: (bite: BiteId) => void;
  onMinumSusu: () => void;
  onSajikan: () => void;
  onNext: () => void;
  onTogglePassiveShield?: () => void;
  busy?: boolean; // an eat/drink animation is playing — lock the controls
}

// Side panel shell — cream card, anchored to a screen edge so the centre stays
// clear and the 3D character/table remain visible.
const panel = "pointer-events-auto rounded-2xl bg-card p-4 text-ink shadow-2xl";

/**
 * Heads-up display for the full-screen 3D mode. Instead of one big centre card,
 * controls live in left/right side panels so they never cover the eater.
 */
export function Hud3D(props: Props) {
  const { state, activeIndex } = props;
  const me = state.players[activeIndex];

  if (state.phase === "preturn") return <PreturnHud {...props} me={me} />;
  if (state.phase === "active") return <ActiveHud {...props} me={me} />;
  if (state.phase === "result" && state.outcome) return <ResultHud {...props} />;
  return null;
}

type SubProps = Props & { me: GameState["players"][number] };

function PreturnHud({ state, activeIndex, me, onToggleBet, onAddSabo, onConfirm, onUseTameng, onAcceptHeat, onTogglePassiveShield }: SubProps) {
  const hasHumanSpectators = state.players.some((p, k) => k !== activeIndex && !p.isBot);
  const maxShields = Math.min(me.tameng, Math.ceil(state.pendingHeat / TAMENG_BLOCK));
  const [shieldCount, setShieldCount] = useState(maxShields);

  // Sync shieldCount when maxShields changes (e.g. spectator queues more heat)
  useEffect(() => {
    setShieldCount(maxShields);
  }, [maxShields]);

  if (state.blockAsk) {
    const sambalIncoming = Math.ceil(state.pendingHeat / SABOTAGE_HEAT);
    return (
      <div className={`absolute bottom-4 right-4 w-[min(46vw,340px)] ${panel}`}>
        <p className="m-0 text-[13px] font-semibold text-muted">Giliran</p>
        <p className="m-0 mb-2 text-xl font-extrabold text-chili-dark">{me.name}</p>
        <p className="m-0 mb-3 text-sm font-semibold text-ink">
          Kena sambal <span className="font-bold text-chili">+{state.pendingHeat} pedas ({sambalIncoming} sambal)</span>.
        </p>

        {me.char === "baja" && me.passiveShields > 0 && (
          <label className="mb-3 flex items-center gap-2 cursor-pointer select-none rounded-xl border border-line bg-cream-2/40 px-3 py-2 text-[13px] font-bold text-ink">
            <input
              type="checkbox"
              checked={state.passiveShieldActivated}
              onChange={onTogglePassiveShield}
              className="h-4 w-4 accent-chili"
            />
            <span>Aktifkan Tameng Kebal (Sisa: {me.passiveShields})</span>
          </label>
        )}

        {maxShields > 0 ? (
          <>
            <div className="mb-3 flex items-center justify-between rounded-xl bg-cream-2/55 p-2">
              <span className="text-xs font-bold text-ink flex items-center gap-1">
                <Shield size={14} className="text-steel" /> Gunakan Tameng:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="tp-btn flex h-7 w-7 items-center justify-center rounded-lg bg-cream-2 text-base font-bold disabled:opacity-40 text-ink"
                  disabled={shieldCount <= 0}
                  onClick={() => setShieldCount((prev) => Math.max(0, prev - 1))}
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-black text-ink">
                  {shieldCount} / {me.tameng}
                </span>
                <button
                  type="button"
                  className="tp-btn flex h-7 w-7 items-center justify-center rounded-lg bg-cream-2 text-base font-bold disabled:opacity-40 text-ink"
                  disabled={shieldCount >= maxShields}
                  onClick={() => setShieldCount((prev) => Math.min(maxShields, prev + 1))}
                >
                  +
                </button>
              </div>
            </div>

            {maxShields > 1 && (
              <div className="mb-3 flex gap-1.5">
                <button
                  type="button"
                  className={`tp-btn flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                    shieldCount === 1 ? "bg-steel text-white" : "bg-cream-2 text-muted"
                  }`}
                  onClick={() => setShieldCount(1)}
                >
                  Tangkis 1
                </button>
                <button
                  type="button"
                  className={`tp-btn flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                    shieldCount === maxShields ? "bg-steel text-white" : "bg-cream-2 text-muted"
                  }`}
                  onClick={() => setShieldCount(maxShields)}
                >
                  Tangkis Semua ({maxShields})
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="my-2 mb-3 text-xs text-muted font-medium">
            Kamu tidak memiliki tameng.
          </p>
        )}

        <div className="flex gap-2">
          <button
            className="tp-btn flex-1 rounded-xl bg-steel py-3 text-sm font-extrabold text-white disabled:opacity-50"
            onClick={() => onUseTameng(shieldCount)}
            disabled={maxShields <= 0 || shieldCount <= 0}
          >
            <Shield size={16} className="mr-1.5 inline-block align-[-3px]" />
            Tangkis −{shieldCount * TAMENG_BLOCK}
          </button>
          <button
            className="tp-btn flex-1 rounded-xl bg-cream-2 py-3 text-sm font-extrabold text-ink"
            onClick={onAcceptHeat}
          >
            Terima aja
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* left: who's up + instructions */}
      <div className={`absolute bottom-4 left-4 w-[min(42vw,300px)] ${panel}`}>
        <p className="m-0 text-[13px] font-semibold text-muted font-bold uppercase tracking-wider">
          Mulai Giliran
        </p>
        <p className="m-0 text-2xl font-extrabold text-chili-dark">{me.name}</p>
        {me.char && (
          <p className="m-0 text-[13px] font-bold mb-2" style={{ color: color(CHARS[me.char].colorKey) }}>
            {CHARS[me.char].name}
          </p>
        )}

        {me.char === "baja" && me.passiveShields > 0 && (
          <label className="mb-3 flex items-center gap-2 cursor-pointer select-none rounded-xl border border-line bg-cream-2/40 px-3 py-2 text-[13px] font-bold text-ink">
            <input
              type="checkbox"
              checked={state.passiveShieldActivated}
              onChange={onTogglePassiveShield}
              className="h-4 w-4 accent-chili"
            />
            <span>Aktifkan Tameng Kebal (Sisa: {me.passiveShields})</span>
          </label>
        )}

        <p className="m-0 text-[13px] text-ink">
          {hasHumanSpectators
            ? `Penonton: tebak nasib ${me.name} (benar +${BET_STAKE}, salah −${BET_STAKE}), dan boleh tambah sambal.`
            : "Lawan-lawan bot diam-diam pasang taruhan & sambal..."}
          {state.pendingHeat > 0 && <span className="font-bold text-chili"> Sambal: +{state.pendingHeat} pedas.</span>}
        </p>
        <button
          className="tp-btn mt-3 w-full rounded-xl bg-flame py-3 text-[15px] font-extrabold text-white"
          onClick={onConfirm}
        >
          Mulai giliran {me.name}
        </button>
      </div>

      {/* right: spectator bets + sabotage (humans only — bots bet on their own) */}
      {state.players.some((p, k) => k !== activeIndex && !p.isBot) && (
      <div className={`absolute bottom-4 right-4 max-h-[70vh] w-[min(46vw,320px)] overflow-y-auto ${panel}`}>
        <p className="m-0 mb-2 text-[13px] font-bold text-muted">Penonton</p>
        <div className="grid gap-2">
          {state.players.map((p, k) => {
            if (k === activeIndex || p.isBot) return null;
            const hasBetBust = state.bets[k] === "bust";
            const saboBlockedByBet = BLOCK_BET_AND_SABO && hasBetBust;
            const capReached = SABOTAGE_MAX_PER_TARGET > 0 && state.pendingHeat >= SABOTAGE_MAX_PER_TARGET;
            const canSabo = p.sabotage > 0 && !saboBlockedByBet && !capReached;
            return (
              <div key={k} className="rounded-xl border-[1.5px] border-cream-2 bg-cream px-2.5 py-2">
                <div className="mb-1.5 text-sm font-bold">{p.name}</div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    className={`tp-btn rounded-full px-2.5 py-1 text-xs font-bold ${
                      state.bets[k] === "aman" ? "bg-leaf text-white" : "bg-cream-2 text-muted"
                    }`}
                    onClick={() => onToggleBet(k, "aman")}
                  >
                    <Coins size={12} className="mr-1 inline-block align-[-2px]" />
                    Aman
                  </button>
                  <button
                    className={`tp-btn rounded-full px-2.5 py-1 text-xs font-bold ${
                      state.bets[k] === "bust" ? "bg-chili text-white" : "bg-cream-2 text-muted"
                    }`}
                    onClick={() => onToggleBet(k, "bust")}
                  >
                    <Coins size={12} className="mr-1 inline-block align-[-2px]" />
                    Kepedesan
                  </button>
                  {p.sabotage > 0 ? (
                    <button
                      className="tp-btn ml-auto rounded-full px-2.5 py-1 text-xs font-bold text-chili-dark disabled:opacity-40"
                      style={{ background: "#FBE0D6" }}
                      onClick={() => onAddSabo(k)}
                      disabled={!canSabo}
                      title={
                        saboBlockedByBet
                          ? "Tidak bisa nyabotase jika bertaruh Kepedesan"
                          : capReached
                          ? `Batas sabotase target sudah penuh (${SABOTAGE_MAX_PER_TARGET} pedas)`
                          : undefined
                      }
                    >
                      <Flame size={12} className="mr-1 inline-block align-[-2px]" />
                      Sambal ({p.sabotage})
                    </button>
                  ) : (
                    <span className="ml-auto text-[11px] text-muted font-bold py-1">
                      Sambal habis
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </>
  );
}

function ActiveHud({ state, me, isFinal, onSuap, onMinumSusu, onSajikan, busy }: SubProps) {
  const ch = me.char;
  const charDef = ch ? CHARS[ch] : null;
  const curMult = multiplier(state.heat, ch);

  return (
    <>
      {/* left: status (heat, points, feedback) */}
      <div className={`absolute bottom-4 left-4 w-[min(42vw,300px)] ${panel}`}>
        <div className="mb-2 flex items-start justify-between">
          <div>
            <p className="m-0 text-[13px] font-semibold text-muted">Giliran</p>
            <p className="m-0 text-xl font-extrabold text-chili-dark">{me.name}</p>
            {charDef && (
              <div className="flex flex-col gap-1 mt-0.5">
                <p className="m-0 text-[13px] font-bold" style={{ color: color(charDef.colorKey) }}>
                  {charDef.name}
                </p>
                {ch === "baja" && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span 
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold shadow-sm ${
                        state.shieldUsed 
                          ? "bg-stone-200 text-stone-500 line-through" 
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      <Shield size={10} className={state.shieldUsed ? "text-stone-400" : "text-emerald-600"} />
                      {state.shieldUsed 
                        ? `Kebal: Tidak Aktif (Sisa: ${me.passiveShields})` 
                        : `Kebal: Aktif (Sisa: ${me.passiveShields})`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="text-right text-[11px] font-semibold text-muted">
            <div>
              <Shield size={12} className="inline-block align-[-2px]" /> {me.tameng}
            </div>
            <div>
              <Milk size={12} className="inline-block align-[-2px]" /> {me.susu}
            </div>
            <div>
              <Flame size={12} className="inline-block align-[-2px]" /> {me.sabotage}
            </div>
          </div>
        </div>

        {isFinal && (
          <div className="mb-2 rounded-lg bg-amber py-1 text-center text-[12px] font-extrabold text-ink">
            <Sparkles size={13} className="mr-1 inline-block align-[-2px]" /> Pamungkas ×{FINAL_MULT}!
          </div>
        )}

        <HeatMeter heat={state.heat} />

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold leading-none">{state.roundPts}</span>
          <span className="text-[13px] font-semibold text-muted">poin ronde ini</span>
          {curMult > 1 && (
            <span className="ml-auto animate-pop rounded-full bg-leaf px-2.5 py-0.5 text-base font-extrabold text-white">
              ×{curMult}
            </span>
          )}
        </div>
        <p className="m-0 mt-1 h-5 text-[13px] font-bold text-flame">{state.feedback}</p>
      </div>

      {/* right: actions (bites + susu + sajikan) */}
      <div className={`absolute bottom-4 right-4 w-[min(42vw,260px)] ${panel}`}>
        <div className="mb-2">
          <p className="m-0 text-xs font-semibold text-muted">Pilih suapan:</p>
          {charDef && (
            <p className="m-0 mt-0.5 text-[11px] font-bold leading-tight" style={{ color: color(charDef.colorKey) }}>
              ✨ {charDef.name}: {charDef.up} <span className="opacity-80">({charDef.down})</span>
            </p>
          )}
        </div>
        <div className="grid gap-2">
          {(Object.entries(BITES) as [BiteId, (typeof BITES)[BiteId]][]).map(([key, b]) => {
            let pointMod = 0;
            if (charDef) {
              const anyCharDef = charDef as any;
              if (anyCharDef.pointModPerChili && key in anyCharDef.pointModPerChili) {
                pointMod = anyCharDef.pointModPerChili[key];
              } else {
                pointMod = anyCharDef.pointMod ?? 0;
              }
            }
            let heatMod = 0;
            if (charDef) {
              const anyCharDef = charDef as any;
              if (anyCharDef.heatModPerChili && key in anyCharDef.heatModPerChili) {
                heatMod = anyCharDef.heatModPerChili[key];
              } else {
                heatMod = anyCharDef.heatMod ?? 0;
              }
            }

            const baseMin = b.points[0];
            const baseMax = b.points[1];
            const finalMin = Math.max(1, baseMin + pointMod);
            const finalMax = Math.max(1, baseMax + pointMod);

            const finalHeat = b.heat + heatMod;

            return (
              <button
                key={key}
                className="tp-btn flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-extrabold text-white"
                style={{ background: color(b.colorKey) }}
                onClick={() => onSuap(key)}
                disabled={busy}
              >
                <span>{b.name}</span>
                <span className="text-[11px] font-semibold opacity-95">
                  +{finalMin}–{finalMax}
                  {" · "}🌶{finalHeat}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex gap-2">
          <button
            className="tp-btn flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-steel py-2.5 text-[13px] font-extrabold text-white"
            onClick={onMinumSusu}
            disabled={me.susu <= 0 || state.heat <= 0 || busy}
          >
            <Milk size={16} /> Susu
          </button>
          <button
            className="tp-btn flex flex-[1.3] items-center justify-center gap-1.5 rounded-xl bg-leaf py-2.5 text-sm font-extrabold text-white"
            onClick={onSajikan}
            disabled={state.roundPts === 0 || busy}
          >
            <Hand size={17} /> Sajikan
          </button>
        </div>
      </div>
    </>
  );
}

function ResultHud({ state, activeIndex, isLastTurn, onNext }: Props & { isLastTurn: boolean }) {
  const outcome = state.outcome!;
  const me = state.players[activeIndex];
  const { busted, gained, raw, mult, hematBonus, final, bets } = outcome;
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    setSecondsLeft(5);
  }, [outcome]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          onNext();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onNext]);

  return (
    <div className={`absolute bottom-4 right-4 w-[min(46vw,340px)] ${panel}`}>
      <div className="text-center">
        {busted ? (
          <>
            <FlameKindling size={38} className="mx-auto text-chili" />
            <p className="my-1 text-2xl font-extrabold text-chili-dark">Kepedesan!</p>
            <p className="m-0 text-[13px] text-muted">{me.name} kepedesan. Poin ronde hangus.</p>
          </>
        ) : (
          <>
            <CheckCheck size={38} className="mx-auto text-leaf" />
            <p className="my-1 text-2xl font-extrabold text-leaf">Aman!</p>
            <p className="m-0 text-[13px] font-semibold text-ink">
              {mult > 1 ? `${raw} × ${mult}` : `${raw}`}
              {hematBonus ? ` + ${hematBonus}` : ""}
              {final ? ` × ${FINAL_MULT}` : ""} = <span className="font-extrabold text-chili-dark">{gained} poin</span>
            </p>
          </>
        )}
      </div>

      {bets.length > 0 && (
        <div className="mt-2 grid gap-0.5">
          {bets.map((b, i) => (
            <div key={i} className={`text-xs font-semibold ${b.correct ? "text-leaf-dark" : "text-chili-dark"}`}>
              {b.name} tebak "{b.bet === "bust" ? "kepedesan" : "aman"}" →{" "}
              {b.correct ? `benar +${BET_STAKE}` : `salah ${b.delta}`}
            </div>
          ))}
        </div>
      )}

      <button
        className="tp-btn mt-3 w-full rounded-xl bg-flame py-3 text-[15px] font-extrabold text-white"
        onClick={onNext}
      >
        {isLastTurn ? "Lihat hasil" : `Lanjut (${secondsLeft}s)`}
      </button>
    </div>
  );
}
