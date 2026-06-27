import { useState, useEffect } from "react";
import { Coins, Hand, Milk, Shield, Sparkles, Eye, Lock, EyeOff } from "lucide-react";
import { BET, CHARS, FINAL_MULT } from "../config/balance";
import type { Bet, GameState } from "../game";
import { multiplier } from "../game";
import { color } from "../ui/theme";
import { HeatMeter } from "./HeatMeter";

interface Props {
  state: GameState;
  activeIndex: number;
  isFinal: boolean;
  isLastTurn: boolean;
  onToggleBet: (player: number, bet: Bet) => void;
  onSetBetAmount?: (player: number, amount: number) => void;
  onConfirm: () => void;
  onSuap: (bowlIdx: number) => void;
  onMinumSusu: () => void;
  onSajikan: () => void;
  onNext: () => void;
  onTogglePassiveShield?: () => void;
  onTerawang?: () => void;
  busy?: boolean; // an eat/drink animation is playing — lock the controls
}

const panel = "pointer-events-auto rounded-2xl bg-card p-4 text-ink shadow-2xl";

export function Hud3D(props: Props) {
  const { state, activeIndex } = props;
  const me = state.players[activeIndex];

  if (state.phase === "preturn") return <PreturnHud {...props} me={me} />;
  if (state.phase === "active") return <ActiveHud {...props} me={me} />;
  if (state.phase === "result" && state.outcome) return <ResultHud {...props} />;
  return null;
}

type SubProps = Props & { me: GameState["players"][number] };

function PreturnHud({ state, activeIndex, me, onToggleBet, onSetBetAmount, onConfirm, onTogglePassiveShield }: SubProps) {
  const hasHumanSpectators = state.players.some((p, k) => k !== activeIndex && !p.isBot);
  const [showPassiveShieldModal, setShowPassiveShieldModal] = useState(false);
  // which spectators have locked their (now hidden) bet, so the active player can't peek
  const [locked, setLocked] = useState<Set<number>>(new Set());
  const lock = (k: number) => setLocked((s) => new Set(s).add(k));

  // Toggle body class when modal open to prevent 3D floating badges from bleeding through
  useEffect(() => {
    if (showPassiveShieldModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [showPassiveShieldModal]);

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

        <p className="m-0 text-[13px] text-ink font-medium leading-relaxed">
          {hasHumanSpectators
            ? `Penonton pasang taruhan pakai poinnya sendiri. Hasilnya disembunyikan sampai gilirannya selesai.`
            : "Lawan-lawan bot diam-diam pasang taruhan..."}
        </p>
        <button
          className="tp-btn mt-3 w-full rounded-xl bg-flame py-3 text-[15px] font-extrabold text-white"
          onClick={() => {
            if (me.char === "baja" && me.passiveShields > 0 && !me.isBot) {
              setShowPassiveShieldModal(true);
            } else {
              onConfirm();
            }
          }}
        >
          Mulai giliran {me.name}
        </button>
      </div>

      {/* right: spectator wagers (hidden from the active player once locked) */}
      {state.players.some((p, k) => k !== activeIndex && !p.isBot) && (
      <div className={`absolute bottom-4 right-4 max-h-[78vh] w-[min(46vw,330px)] overflow-y-auto ${panel}`}>
        <div className="mb-1 flex items-center gap-1.5 text-chili-dark">
          <EyeOff size={15} />
          <p className="m-0 text-[13px] font-extrabold">{me.name}, jangan ngintip!</p>
        </div>
        <p className="m-0 mb-2.5 text-[11px] text-muted leading-snug">
          Penonton: taruh poin, lalu tekan Kunci 🔒 supaya rahasia. Benar Aman ×{BET.payoutAman}, benar Kepedesan ×{BET.payoutBust}, salah hangus.
        </p>
        <div className="grid gap-2">
          {state.players.map((p, k) => {
            if (k === activeIndex || p.isBot) return null;
            const w = state.bets[k];
            const cap = Math.min(p.score, BET.maxWager);
            const isLocked = locked.has(k);

            if (isLocked) {
              return (
                <div key={k} className="flex items-center gap-2 rounded-xl border-[1.5px] border-cream-2 bg-cream px-3 py-2.5">
                  <Lock size={14} className="text-leaf" />
                  <span className="text-sm font-bold">{p.name}</span>
                  <span className="ml-auto text-xs font-bold text-muted">🔒 Terkunci</span>
                </div>
              );
            }
            if (cap <= 0) {
              return (
                <div key={k} className="rounded-xl border-[1.5px] border-cream-2 bg-cream px-2.5 py-2 opacity-70">
                  <div className="text-sm font-bold">{p.name}</div>
                  <div className="text-[11px] font-semibold text-muted">Poin habis — tidak bisa taruhan.</div>
                </div>
              );
            }

            const amount = w ? w.amount : 0;
            const win = w ? amount * (w.bet === "bust" ? BET.payoutBust : BET.payoutAman) : 0;
            return (
              <div key={k} className="rounded-xl border-[1.5px] border-cream-2 bg-cream px-2.5 py-2">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="text-sm font-bold">{p.name}</span>
                  <span className="ml-auto flex items-center gap-1 text-[11px] font-bold text-chili-dark">
                    <Coins size={11} /> {p.score}
                  </span>
                </div>
                <div className="mb-1.5 flex gap-1.5">
                  <button
                    className={`tp-btn flex-1 rounded-full px-2 py-1 text-xs font-bold ${
                      w?.bet === "aman" ? "bg-leaf text-white" : "bg-cream-2 text-muted"
                    }`}
                    onClick={() => onToggleBet(k, "aman")}
                  >
                    Aman
                  </button>
                  <button
                    className={`tp-btn flex-1 rounded-full px-2 py-1 text-xs font-bold ${
                      w?.bet === "bust" ? "bg-chili text-white" : "bg-cream-2 text-muted"
                    }`}
                    onClick={() => onToggleBet(k, "bust")}
                  >
                    Kepedesan
                  </button>
                </div>
                {w && (
                  <>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <button
                        className="h-7 w-7 rounded-full bg-cream-2 font-black text-base disabled:opacity-30"
                        onClick={() => onSetBetAmount?.(k, amount - 1)}
                        disabled={amount <= 1}
                      >
                        −
                      </button>
                      <div className="text-center">
                        <div className="text-lg font-black leading-none">{amount}</div>
                        <div className="text-[9px] font-bold uppercase tracking-wide text-muted">poin</div>
                      </div>
                      <button
                        className="h-7 w-7 rounded-full bg-cream-2 font-black text-base disabled:opacity-30"
                        onClick={() => onSetBetAmount?.(k, amount + 1)}
                        disabled={amount >= cap}
                      >
                        +
                      </button>
                      <span className="ml-1 text-[11px] font-bold text-leaf">menang +{win}</span>
                    </div>
                    <button
                      className="tp-btn w-full rounded-lg bg-steel py-1.5 text-xs font-extrabold text-white flex items-center justify-center gap-1"
                      onClick={() => lock(k)}
                    >
                      <Lock size={12} /> Kunci taruhan
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Passive Shield Confirmation Modal */}
      {showPassiveShieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[340px] transform rounded-3xl bg-cream p-6 border-2 border-line/20 shadow-2xl text-ink relative flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <h3 className="m-0 text-lg font-black text-chili-dark flex items-center justify-center gap-1.5">
                <Shield size={20} className="text-steel" /> Gunakan Tameng Kebal?
              </h3>
              <p className="m-0 text-xs text-muted font-semibold mt-1">
                Karakter: <span className="text-steel font-bold">Si Lidah Baja</span> (Sisa: {me.passiveShields})
              </p>
            </div>
            
            <p className="m-0 text-sm text-ink leading-relaxed text-center font-medium">
              Apakah kamu ingin mengaktifkan <strong>1 Tameng Kebal</strong> untuk ronde ini?
            </p>
            
            <div className="rounded-2xl bg-cream-2/70 border border-line/5 p-3 text-xs text-muted leading-normal">
              <p className="m-0 mb-1 font-bold text-ink">💡 Cara Kerja:</p>
              <ul className="m-0 pl-4 list-disc space-y-1">
                <li>Melindungi otomatis dari <strong>kepedesan (Bust) pertama</strong> ronde ini.</li>
                <li>Jika kamu selesai makan tanpa Bust, tameng <strong>tetap hangus</strong>.</li>
              </ul>
            </div>

            <div className="flex gap-2.5 mt-1">
              <button
                className="tp-btn flex-1 rounded-xl bg-flame py-3 text-sm font-extrabold text-white hover:scale-102 transition-transform"
                onClick={() => {
                  if (!state.passiveShieldActivated && onTogglePassiveShield) {
                    onTogglePassiveShield();
                  }
                  setShowPassiveShieldModal(false);
                  onConfirm();
                }}
              >
                Ya, Aktifkan
              </button>
              <button
                className="tp-btn flex-1 rounded-xl bg-cream-2 py-3 text-sm font-extrabold text-ink hover:bg-cream-3 transition-colors"
                onClick={() => {
                  if (state.passiveShieldActivated && onTogglePassiveShield) {
                    onTogglePassiveShield();
                  }
                  setShowPassiveShieldModal(false);
                  onConfirm();
                }}
              >
                Tidak
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ActiveHud({ state, me, isFinal, onSuap, onMinumSusu, onSajikan, onTerawang, busy }: SubProps) {
  const ch = me.char;
  const charDef = ch ? CHARS[ch] : null;
  const curMult = multiplier(state.heat, ch, state.terawangUsed);

  return (
    <>
      {/* left: status (heat, points, feedback) */}
      <div className={`absolute bottom-4 left-4 w-[min(42vw,300px)] ${panel}`}>
        <div className="mb-2 flex items-start justify-between">
          <div>
            <p className="m-0 text-[13px] font-semibold text-muted font-bold uppercase tracking-wider">Giliran</p>
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
                {ch === "terawang" && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span 
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold shadow-sm bg-purple-100 text-purple-800 border border-purple-200"
                    >
                      <Eye size={10} className="text-purple-600" />
                      Terawang Sisa: {me.terawangCharges}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="text-right text-[11px] font-semibold text-muted">
            <div>
              <Milk size={12} className="inline-block align-[-2px]" /> {me.susu}
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
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p className="m-0 text-xs font-semibold text-muted">Pilih mangkok:</p>
            {charDef && (
              <p className="m-0 mt-0.5 text-[10px] font-bold leading-tight" style={{ color: color(charDef.colorKey) }}>
                {charDef.name}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-1.5 mb-2">
          {[0, 1, 2].map((idx) => {
            const bite = state.secretBowls && state.secretBowls[idx];
            const isRevealed = state.terawangActive && bite;
            
            let btnClass = "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-650";
            let content = "Tutup";
            let label = "?";

            if (isRevealed) {
              if (bite === "ijo") {
                btnClass = "bg-emerald-600 border-emerald-300 text-white hover:bg-emerald-500";
                content = "🟢 Cabe Ijo";
                label = "+8 Pedas";
              } else if (bite === "rawit") {
                btnClass = "bg-orange-500 border-orange-300 text-white hover:bg-orange-400";
                content = "🔥 Cabe Rawit";
                label = "+15 Pedas";
              } else if (bite === "carolina") {
                btnClass = "bg-red-600 border-red-300 text-white hover:bg-red-500";
                content = "💀 Carolina Reaper";
                label = "+28 Pedas";
              }
            }
            
            return (
              <button
                key={idx}
                className={`tp-btn flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-extrabold border ${btnClass}`}
                onClick={() => onSuap(idx)}
                disabled={busy}
              >
                <span>Mangkok {idx + 1}: {content}</span>
                <span className="text-[9.5px] font-bold opacity-80">{label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex gap-2">
          {ch === "terawang" && me.terawangCharges > 0 && !state.terawangActive && (
            <button
              className="tp-btn flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-purple-700 py-2.5 text-[13px] font-extrabold text-white"
              onClick={onTerawang}
              disabled={busy}
            >
              <Eye size={16} /> Terawang
            </button>
          )}
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
    <>
      <div className={`absolute bottom-4 left-4 w-[min(46vw,340px)] ${panel}`}>
        <p className="m-0 text-[13px] font-semibold text-muted">Hasil Giliran</p>
        <p className="m-0 mb-1.5 text-xl font-extrabold text-chili-dark">{me.name}</p>

        {busted ? (
          <p className="m-0 text-sm font-black text-chili">
            💥 KEPEDESAN! Poin ronde ini hangus.
          </p>
        ) : (
          <div className="text-sm font-semibold text-ink">
            <p className="m-0">
              Menyajikan: <span className="font-bold text-leaf">+{gained} poin</span>
            </p>
            <p className="m-0 text-xs text-muted leading-relaxed mt-0.5">
              Poin dasar {raw} × Pengali {mult}
              {hematBonus > 0 && ` + Bonus Si Hemat ${hematBonus}`}
              {final && " (Ronde Pamungkas ×2)"}
            </p>
          </div>
        )}

        <button
          className="tp-btn mt-3 w-full rounded-xl bg-steel py-2.5 text-sm font-extrabold text-white"
          onClick={onNext}
        >
          {isLastTurn ? "Selesai" : `Lanjut (${secondsLeft}s)`}
        </button>
      </div>

      {bets.length > 0 && (
        <div className={`absolute bottom-4 right-4 w-[min(46vw,300px)] ${panel}`}>
          <p className="m-0 mb-2 text-[13px] font-bold text-muted">Hasil Taruhan</p>
          <div className="grid gap-1.5">
            {bets.map((b, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-xs font-bold">
                <span className="truncate">
                  {b.name} <span className="text-muted">({b.bet === "aman" ? "Aman" : "Kepedesan"} {b.amount})</span>
                </span>
                <span className={b.correct ? "text-leaf" : "text-chili"}>
                  {b.correct ? `✓ +${b.delta}` : `✗ ${b.delta}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

