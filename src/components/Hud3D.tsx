import { useState, useEffect } from "react";
import { CheckCheck, Coins, Flame, FlameKindling, Hand, Milk, Shield, Sparkles } from "lucide-react";
import { BET_STAKE, BITES, CHARS, FINAL_MULT } from "../config/balance";
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
  onUseTameng: () => void;
  onAcceptHeat: () => void;
  onSuap: (bite: BiteId) => void;
  onMinumSusu: () => void;
  onSajikan: () => void;
  onNext: () => void;
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

function PreturnHud({ state, activeIndex, me, onToggleBet, onAddSabo, onConfirm, onUseTameng, onAcceptHeat }: SubProps) {
  const hasHumanSpectators = state.players.some((p, k) => k !== activeIndex && !p.isBot);
  if (state.blockAsk) {
    return (
      <div className={`absolute bottom-4 right-4 w-[min(46vw,340px)] ${panel}`}>
        <p className="m-0 text-[13px] font-semibold text-muted">Giliran</p>
        <p className="m-0 mb-2 text-xl font-extrabold text-chili-dark">{me.name}</p>
        <p className="m-0 mb-3 text-sm font-semibold text-ink">
          Kena sambal +{state.pendingHeat} pedas. Pakai tameng buat tangkis?
        </p>
        <div className="flex gap-2">
          <button className="tp-btn flex-1 rounded-xl bg-steel py-3 text-sm font-extrabold text-white" onClick={onUseTameng}>
            <Shield size={16} className="mr-1.5 inline-block align-[-3px]" />
            Tangkis
          </button>
          <button className="tp-btn flex-1 rounded-xl bg-cream-2 py-3 text-sm font-extrabold text-ink" onClick={onAcceptHeat}>
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
        <p className="m-0 text-[13px] font-semibold text-muted">Giliran</p>
        <p className="m-0 mb-2 text-2xl font-extrabold text-chili-dark">{me.name}</p>
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
            const canSabo = p.sabotage > 0 && !state.usedSabo.includes(k);
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
                  {canSabo && (
                    <button
                      className="tp-btn ml-auto rounded-full px-2.5 py-1 text-xs font-bold text-chili-dark"
                      style={{ background: "#FBE0D6" }}
                      onClick={() => onAddSabo(k)}
                    >
                      <Flame size={12} className="mr-1 inline-block align-[-2px]" />
                      Sambal
                    </button>
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
              <p className="m-0 text-[13px] font-bold" style={{ color: color(charDef.colorKey) }}>
                {charDef.name}
              </p>
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
        <p className="m-0 mb-2 text-xs font-semibold text-muted">Pilih suapan:</p>
        <div className="grid gap-2">
          {(Object.entries(BITES) as [BiteId, (typeof BITES)[BiteId]][]).map(([key, b]) => (
            <button
              key={key}
              className="tp-btn flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-extrabold text-white"
              style={{ background: color(b.colorKey) }}
              onClick={() => onSuap(key)}
              disabled={busy}
            >
              <span>{b.name}</span>
              <span className="text-[11px] font-semibold opacity-95">
                +{b.points[0]}–{b.points[1]} · 🌶{b.heat}
              </span>
            </button>
          ))}
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
    <div className={`absolute bottom-4 right-4 w-[min-46vw,340px] ${panel}`}>
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
