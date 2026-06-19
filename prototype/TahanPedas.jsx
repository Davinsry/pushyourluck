// ─────────────────────────────────────────────────────────────
//  ORIGINAL PROTOTYPE — kept for reference / source-of-truth on
//  rules and balance. The shipping game is the refactor under src/.
//  Do not import this file; it is documentation, not build input.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Flame, Trophy, RotateCcw, Crown, Users, Play, Hand, CheckCheck, Shield, Sparkles, FlameKindling, Milk, Coins } from "lucide-react";

const C = {
  bg: "#1E130D", bg2: "#2A1B12", card: "#FBF1E3", ink: "#2A1B12",
  chili: "#D7263D", chiliDark: "#9E1B2C", flame: "#F26419", amber: "#F6A609",
  leaf: "#6FA315", leafDark: "#4E7410", steel: "#3E7CB1", cream: "#FDF6EC", muted: "#9B8675",
};

const CYCLES = 4;
const SABOTAGE_HEAT = 15;
const SUSU_COOL = 25;
const BET_STAKE = 5;
const FINAL_MULT = 2;
const PARAMS = { bustOffset: 10, bustCap: 100, mult15: 50, mult2: 80 };

const BITES = {
  ijo:      { name: "Cabe Ijo", min: 4, max: 7, heat: 8, color: C.leaf },
  rawit:    { name: "Cabe Rawit", min: 8, max: 12, heat: 15, color: C.flame },
  carolina: { name: "Cabe Carolina", min: 15, max: 22, heat: 28, color: C.chiliDark },
};

const CHARS = {
  baja:   { name: "Si Lidah Baja", tag: "Tahan banting", color: C.steel,
            up: "Sekali di setiap ronde, selamat dari 1 kepedesan.", down: "Poin tiap suap −2." },
  rakus:  { name: "Si Rakus", tag: "High-roller", color: C.chili,
            up: "Poin tiap suap +3.", down: "Pedas naik lebih cepat (+5)." },
  kompor: { name: "Si Tukang Kompor", tag: "Pengganggu", color: C.flame,
            up: "Dapat 2 jatah tambah sambal (lawan 1).", down: "Multiplier mentok ×1.5." },
  hemat:  { name: "Si Hemat", tag: "Grinder", color: C.leaf,
            up: "Sajikan saat pedas < 40 → bonus +6.", down: "Multiplier mentok ×1.5." },
};
const CHAR_KEYS = Object.keys(CHARS);

const rr = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const bustChance = (h) => Math.min(PARAMS.bustCap, Math.max(0, Math.round(h - PARAMS.bustOffset)));
function multiplier(h, ch) {
  let m = h >= PARAMS.mult2 ? 2 : h >= PARAMS.mult15 ? 1.5 : 1;
  if ((ch === "kompor" || ch === "hemat") && m > 1.5) m = 1.5;
  return m;
}
const heatColor = (h) => (h < 40 ? C.amber : h < 70 ? C.flame : C.chili);
function pick2() {
  const a = [...CHAR_KEYS];
  const x = a.splice(Math.floor(Math.random() * a.length), 1)[0];
  const y = a.splice(Math.floor(Math.random() * a.length), 1)[0];
  return [x, y];
}
const newPlayer = (i) => ({ name: `Pemain ${i + 1}`, score: 0, char: null, sabotage: 1, tameng: 1, susu: 1 });

export default function TahanPedas() {
  const [screen, setScreen] = useState("setup");
  const [players, setPlayers] = useState([newPlayer(0), newPlayer(1)]);
  const [draftIdx, setDraftIdx] = useState(0);
  const [draftOpts, setDraftOpts] = useState(["baja", "rakus"]);

  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState("preturn"); // preturn | active | result
  const [heat, setHeat] = useState(0);
  const [roundPts, setRoundPts] = useState(0);
  const [shieldUsed, setShieldUsed] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [outcome, setOutcome] = useState(null);

  // preturn
  const [pendingHeat, setPendingHeat] = useState(0);
  const [usedSabo, setUsedSabo] = useState([]);
  const [bets, setBets] = useState({});
  const [blockAsk, setBlockAsk] = useState(false);

  const n = players.length;
  const pIdx = turn % n;
  const cycle = Math.floor(turn / n) + 1;
  const isFinal = cycle === CYCLES;
  const me = players[pIdx];
  const ch = me?.char;
  const curMult = multiplier(heat, ch);

  // ── setup ──
  function setCount(c) {
    const next = [];
    for (let i = 0; i < c; i++) next.push(players[i] || newPlayer(i));
    setPlayers(next);
  }
  function rename(i, v) { setPlayers((ps) => ps.map((p, idx) => (idx === i ? { ...p, name: v } : p))); }
  function toDraft() {
    setPlayers((ps) => ps.map((p, i) => ({ ...newPlayer(i), name: p.name.trim() || `Pemain ${i + 1}` })));
    setDraftIdx(0); setDraftOpts(pick2()); setScreen("draft");
  }
  function chooseChar(key) {
    const next = players.map((p, idx) =>
      idx === draftIdx ? { ...p, char: key, sabotage: key === "kompor" ? 2 : 1, tameng: 1, susu: 1 } : p);
    setPlayers(next);
    if (draftIdx + 1 < n) { setDraftIdx(draftIdx + 1); setDraftOpts(pick2()); }
    else { setTurn(0); startTurn(0, next); setScreen("play"); }
  }

  // ── turn lifecycle ──
  function startTurn() {
    setHeat(0); setRoundPts(0); setShieldUsed(false); setFeedback(""); setOutcome(null);
    setPendingHeat(0); setUsedSabo([]); setBets({}); setBlockAsk(false);
    setPhase("preturn");
  }
  function toggleBet(k, val) { setBets((b) => ({ ...b, [k]: b[k] === val ? undefined : val })); }
  function addSabo(k) {
    setPlayers((ps) => ps.map((p, i) => (i === k ? { ...p, sabotage: p.sabotage - 1 } : p)));
    setUsedSabo((u) => [...u, k]); setPendingHeat((h) => h + SABOTAGE_HEAT);
  }
  function confirmPreturn() {
    if (pendingHeat > 0 && me.tameng > 0) setBlockAsk(true);
    else startActive(pendingHeat);
  }
  function blockYes() { setPlayers((ps) => ps.map((p, i) => (i === pIdx ? { ...p, tameng: p.tameng - 1 } : p))); startActive(0); }
  function startActive(h) {
    setHeat(h); setBlockAsk(false); setPhase("active");
    setFeedback(h > 0 ? `Mulai dengan pedas +${h} dari sambal lawan!` : "");
  }

  // ── core loop ──
  function suap(biteKey) {
    const bite = BITES[biteKey];
    const newHeat = heat + bite.heat + (ch === "rakus" ? 5 : 0);
    if (Math.random() * 100 < bustChance(newHeat)) {
      if (ch === "baja" && !shieldUsed) { setShieldUsed(true); setHeat(newHeat); setFeedback("Perut baja nahan! Selamat sekali."); return; }
      setHeat(newHeat); resolve(true, 0, {}); return;
    }
    let gain = rr(bite.min, bite.max) + (ch === "rakus" ? 3 : 0) - (ch === "baja" ? 2 : 0);
    gain = Math.max(1, gain);
    setHeat(newHeat); setRoundPts((r) => r + gain); setFeedback(`Nyam ${bite.name}! +${gain} poin`);
  }
  function minumSusu() {
    if (me.susu <= 0 || heat <= 0) return;
    setPlayers((ps) => ps.map((p, i) => (i === pIdx ? { ...p, susu: p.susu - 1 } : p)));
    setHeat((h) => Math.max(0, h - SUSU_COOL));
    setFeedback(`Glek! Minum susu, pedas turun ${SUSU_COOL}.`);
  }
  function sajikan() {
    if (roundPts === 0) return;
    const m = multiplier(heat, ch);
    const hematBonus = ch === "hemat" && heat < 40 ? 6 : 0;
    let gained = Math.round(roundPts * m) + hematBonus;
    if (isFinal) gained *= FINAL_MULT;
    resolve(false, gained, { raw: roundPts, mult: m, hematBonus, fin: isFinal });
  }
  function resolve(busted, gained, extra) {
    const betSummary = Object.entries(bets)
      .filter(([, v]) => v)
      .map(([k, v]) => {
        const correct = (busted && v === "bust") || (!busted && v === "aman");
        return { name: players[Number(k)].name, v, correct, delta: correct ? BET_STAKE : -BET_STAKE };
      });
    setPlayers((ps) => ps.map((p, i) => {
      let s = p.score;
      if (i === pIdx && !busted) s += gained;
      const b = bets[i];
      if (b) s += (busted && b === "bust") || (!busted && b === "aman") ? BET_STAKE : -BET_STAKE;
      return { ...p, score: Math.max(0, s) };
    }));
    setOutcome({ busted, gained, betSummary, ...extra });
    setPhase("result");
  }
  function next() {
    const nt = turn + 1;
    if (nt >= n * CYCLES) { setScreen("gameover"); return; }
    setTurn(nt);
    setHeat(0); setRoundPts(0); setShieldUsed(false); setFeedback(""); setOutcome(null);
    setPendingHeat(0); setUsedSabo([]); setBets({}); setBlockAsk(false); setPhase("preturn");
  }
  function reset() { setScreen("setup"); setPlayers((ps) => ps.map((p, i) => ({ ...newPlayer(i), name: p.name }))); }

  const ranked = players.map((p, i) => ({ ...p, i })).sort((a, b) => b.score - a.score);
  const topScore = ranked[0]?.score ?? 0;

  // ── small components ──
  const Meter = () => (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>
          <Flame size={16} style={{ verticalAlign: -3, marginRight: 4, color: heatColor(heat) }} /> Level pedas
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.chiliDark }}>Peluang kepedesan: {bustChance(heat)}%</span>
      </div>
      <div style={{ height: 16, background: "#EADFCB", borderRadius: 999, overflow: "hidden", marginBottom: 18 }}>
        <div style={{ height: "100%", width: `${Math.min(100, heat)}%`, background: heatColor(heat), transition: "width .25s, background .25s" }} />
      </div>
    </>
  );

  return (
    <div style={{ minHeight: "100%", background: C.bg, color: C.cream, fontFamily: "'Baloo 2', system-ui, sans-serif", padding: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&display=swap');
        .tp-btn{transition:transform .08s ease, filter .15s ease;cursor:pointer;border:none;font-family:inherit}
        .tp-btn:hover{filter:brightness(1.07)} .tp-btn:active{transform:scale(.97)} .tp-btn:disabled{opacity:.35;cursor:not-allowed}
        @keyframes pop{0%{transform:scale(.7);opacity:0}60%{transform:scale(1.07)}100%{transform:scale(1);opacity:1}}
        .tp-pop{animation:pop .35s ease}`}</style>

      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <Header />

        {/* SETUP */}
        {screen === "setup" && (
          <div style={{ background: C.card, color: C.ink, borderRadius: 20, padding: 24, marginTop: 18 }}>
            <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 14px", color: C.chiliDark }}><Users size={17} style={{ verticalAlign: -3, marginRight: 6 }} /> Jumlah pemain</p>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              {[2, 3, 4].map((c) => (
                <button key={c} className="tp-btn" onClick={() => setCount(c)} style={{ flex: 1, padding: "14px 0", borderRadius: 14, fontSize: 20, fontWeight: 800, background: n === c ? C.chili : "#EADFCB", color: n === c ? "#fff" : C.muted }}>{c}</button>
              ))}
            </div>
            <div style={{ display: "grid", gap: 10, marginBottom: 22 }}>
              {players.map((p, i) => (
                <input key={i} value={p.name} onChange={(e) => rename(i, e.target.value)} maxLength={14} style={{ padding: "12px 14px", borderRadius: 12, border: "1.5px solid #E2D4BE", background: C.cream, color: C.ink, fontSize: 16, fontFamily: "inherit", fontWeight: 600, outline: "none" }} />
              ))}
            </div>
            <button className="tp-btn" onClick={toDraft} style={{ width: "100%", padding: "16px 0", borderRadius: 14, background: C.flame, color: "#fff", fontSize: 19, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Play size={20} /> Pilih karakter</button>
          </div>
        )}

        {/* DRAFT */}
        {screen === "draft" && (
          <div style={{ marginTop: 18 }}>
            <p style={{ textAlign: "center", fontSize: 14, color: C.muted, fontWeight: 600, margin: "0 0 4px" }}>Cabut 2, pilih 1 — pemain {draftIdx + 1} / {n}</p>
            <p style={{ textAlign: "center", fontSize: 24, fontWeight: 800, color: C.flame, margin: "0 0 18px" }}>{players[draftIdx].name}, pilih karaktermu</p>
            <div style={{ display: "grid", gap: 12 }}>
              {draftOpts.map((key) => {
                const k = CHARS[key];
                return (
                  <button key={key} className="tp-btn" onClick={() => chooseChar(key)} style={{ textAlign: "left", background: C.card, borderRadius: 18, padding: "18px 20px", borderTop: `5px solid ${k.color}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>{k.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: k.color, padding: "2px 10px", borderRadius: 999 }}>{k.tag}</span>
                    </div>
                    <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: C.leafDark }}><Sparkles size={14} style={{ verticalAlign: -2, marginRight: 4 }} /> {k.up}</p>
                    <p style={{ margin: 0, fontSize: 14, color: C.chiliDark }}><FlameKindling size={14} style={{ verticalAlign: -2, marginRight: 4 }} /> {k.down}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PLAY */}
        {screen === "play" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 2px 12px", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 14, color: isFinal ? C.amber : C.muted, fontWeight: 700 }}>Ronde {cycle} / {CYCLES}{isFinal ? " — PAMUNGKAS ×2" : ""}</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {players.map((p, i) => (
                  <span key={i} style={{ fontSize: 13, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: i === pIdx ? C.chili : C.bg2, color: i === pIdx ? "#fff" : C.muted }}>{p.name}: {p.score}</span>
                ))}
              </div>
            </div>

            <div style={{ background: C.card, color: C.ink, borderRadius: 20, padding: 24 }}>
              {/* PRETURN: betting + sabotage */}
              {phase === "preturn" && (
                <div className="tp-pop">
                  <p style={{ margin: 0, fontSize: 13, color: C.muted, fontWeight: 600 }}>Giliran</p>
                  <p style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: C.chiliDark }}>{me.name}</p>
                  {!blockAsk ? (
                    <>
                      <p style={{ fontSize: 13, color: C.ink, margin: "0 0 12px" }}>
                        Penonton: tebak nasib {me.name} (benar +{BET_STAKE}, salah −{BET_STAKE}), dan boleh tambah sambal.
                        {pendingHeat > 0 && <span style={{ color: C.chili, fontWeight: 700 }}> Sambal: +{pendingHeat} pedas.</span>}
                      </p>
                      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
                        {players.map((p, k) => {
                          if (k === pIdx) return null;
                          const canSabo = p.sabotage > 0 && !usedSabo.includes(k);
                          return (
                            <div key={k} style={{ background: C.cream, borderRadius: 12, padding: "10px 12px", border: "1.5px solid #EADFCB" }}>
                              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{p.name}</div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                <button className="tp-btn" onClick={() => toggleBet(k, "aman")} style={{ padding: "7px 12px", borderRadius: 999, fontSize: 13, fontWeight: 700, background: bets[k] === "aman" ? C.leaf : "#EADFCB", color: bets[k] === "aman" ? "#fff" : C.muted }}>
                                  <Coins size={13} style={{ verticalAlign: -2, marginRight: 4 }} />Aman
                                </button>
                                <button className="tp-btn" onClick={() => toggleBet(k, "bust")} style={{ padding: "7px 12px", borderRadius: 999, fontSize: 13, fontWeight: 700, background: bets[k] === "bust" ? C.chili : "#EADFCB", color: bets[k] === "bust" ? "#fff" : C.muted }}>
                                  <Coins size={13} style={{ verticalAlign: -2, marginRight: 4 }} />Kepedesan
                                </button>
                                {canSabo && (
                                  <button className="tp-btn" onClick={() => addSabo(k)} style={{ marginLeft: "auto", padding: "7px 12px", borderRadius: 999, fontSize: 13, fontWeight: 700, background: "#FBE0D6", color: C.chiliDark }}>
                                    <Flame size={13} style={{ verticalAlign: -2, marginRight: 4 }} />Tambah sambal
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <button className="tp-btn" onClick={confirmPreturn} style={{ width: "100%", padding: "14px 0", borderRadius: 14, background: C.flame, color: "#fff", fontSize: 17, fontWeight: 800 }}>Mulai giliran {me.name}</button>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 15, color: C.ink, margin: "8px 0 16px", fontWeight: 600 }}>{me.name} kena sambal +{pendingHeat} pedas. Pakai tameng buat tangkis?</p>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button className="tp-btn" onClick={blockYes} style={{ flex: 1, padding: "13px 0", borderRadius: 12, background: C.steel, color: "#fff", fontWeight: 800, fontSize: 15 }}><Shield size={16} style={{ verticalAlign: -3, marginRight: 5 }} />Tangkis</button>
                        <button className="tp-btn" onClick={() => startActive(pendingHeat)} style={{ flex: 1, padding: "13px 0", borderRadius: 12, background: "#EADFCB", color: C.ink, fontWeight: 800, fontSize: 15 }}>Terima aja</button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ACTIVE */}
              {phase === "active" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, color: C.muted, fontWeight: 600 }}>Giliran</p>
                      <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.chiliDark }}>{me.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, color: CHARS[ch].color }}>{CHARS[ch].name}</p>
                    </div>
                    <div style={{ textAlign: "right", fontSize: 12, color: C.muted, fontWeight: 600 }}>
                      <div><Shield size={13} style={{ verticalAlign: -2 }} /> Tameng: {me.tameng}</div>
                      <div><Milk size={13} style={{ verticalAlign: -2 }} /> Susu: {me.susu}</div>
                      <div><Flame size={13} style={{ verticalAlign: -2 }} /> Sambal: {me.sabotage}</div>
                    </div>
                  </div>

                  {isFinal && (
                    <div style={{ background: C.amber, color: C.ink, fontWeight: 800, fontSize: 13, textAlign: "center", padding: "6px 0", borderRadius: 10, marginBottom: 14 }}>
                      <Sparkles size={14} style={{ verticalAlign: -2, marginRight: 4 }} /> Ronde pamungkas — semua poin ronde ini ×{FINAL_MULT}!
                    </div>
                  )}

                  <Meter />

                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 42, fontWeight: 800, lineHeight: 1 }}>{roundPts}</span>
                    <span style={{ fontSize: 15, color: C.muted, fontWeight: 600 }}>poin ronde ini</span>
                    {curMult > 1 && <span className="tp-pop" style={{ marginLeft: "auto", fontSize: 18, fontWeight: 800, color: "#fff", background: C.leaf, padding: "4px 12px", borderRadius: 999 }}>×{curMult}</span>}
                  </div>
                  <p style={{ height: 20, margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: C.flame }}>{feedback}</p>

                  <div style={{ marginBottom: 8 }}>
                    <p style={{ fontSize: 12, color: C.muted, fontWeight: 600, margin: 0 }}>Pilih suapan:</p>
                    {ch && CHARS[ch] && (
                      <p style={{ fontSize: 11, fontWeight: 700, color: CHARS[ch].color, margin: "2px 0 0", lineHeight: 1.2 }}>
                        ✨ {CHARS[ch].name}: {CHARS[ch].up} <span style={{ opacity: 0.8 }}>({CHARS[ch].down})</span>
                      </p>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
                    {Object.entries(BITES).map(([key, b]) => {
                      const pointMod = ch === "rakus" ? 3 : (ch === "baja" ? -2 : 0);
                      const heatMod = ch === "rakus" ? 5 : 0;
                      const finalMin = Math.max(1, b.min + pointMod);
                      const finalMax = Math.max(1, b.max + pointMod);
                      const finalHeat = b.heat + heatMod;

                      return (
                        <button key={key} className="tp-btn" onClick={() => suap(key)} style={{ padding: "12px 6px", borderRadius: 12, background: b.color, color: "#fff", fontWeight: 800, fontSize: 14, lineHeight: 1.3 }}>
                          {b.name}
                          <span style={{ display: "block", fontSize: 11, fontWeight: 600, opacity: 0.95, marginTop: 3 }}>
                            +{finalMin}–{finalMax} poin
                            {pointMod !== 0 && (
                              <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.8 }}> ({pointMod > 0 ? `+${pointMod}` : pointMod})</span>
                            )}
                            <br />
                            pedas +{finalHeat}
                            {heatMod !== 0 && (
                              <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.8 }}> (+{heatMod})</span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="tp-btn" onClick={minumSusu} disabled={me.susu <= 0 || heat <= 0} style={{ flex: 1, padding: "14px 0", borderRadius: 14, background: C.steel, color: "#fff", fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Milk size={17} /> Minum susu
                    </button>
                    <button className="tp-btn" onClick={sajikan} disabled={roundPts === 0} style={{ flex: 1.4, padding: "14px 0", borderRadius: 14, background: C.leaf, color: "#fff", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Hand size={18} /> Sajikan
                    </button>
                  </div>
                </>
              )}

              {/* RESULT */}
              {phase === "result" && outcome && (
                <div className="tp-pop" style={{ textAlign: "center", padding: "4px 0" }}>
                  {outcome.busted ? (
                    <>
                      <Flame size={46} style={{ color: C.chili }} />
                      <p style={{ fontSize: 27, fontWeight: 800, color: C.chiliDark, margin: "6px 0 4px" }}>Kepedesan!</p>
                      <p style={{ fontSize: 15, color: C.muted, margin: 0 }}>{me.name} kepedesan. Poin ronde hangus.</p>
                    </>
                  ) : (
                    <>
                      <CheckCheck size={46} style={{ color: C.leaf }} />
                      <p style={{ fontSize: 27, fontWeight: 800, color: C.leaf, margin: "6px 0 4px" }}>Aman!</p>
                      <p style={{ fontSize: 15, color: C.ink, margin: 0, fontWeight: 600 }}>
                        {outcome.mult > 1 ? `${outcome.raw} × ${outcome.mult}` : `${outcome.raw}`}{outcome.hematBonus ? ` + ${outcome.hematBonus}` : ""}{outcome.fin ? ` × ${FINAL_MULT}` : ""} = <span style={{ color: C.chiliDark, fontWeight: 800 }}>{outcome.gained} poin</span>
                      </p>
                    </>
                  )}
                  {outcome.betSummary && outcome.betSummary.length > 0 && (
                    <div style={{ marginTop: 12, display: "grid", gap: 4, textAlign: "left", maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
                      {outcome.betSummary.map((b, i) => (
                        <div key={i} style={{ fontSize: 13, fontWeight: 600, color: b.correct ? C.leafDark : C.chiliDark }}>
                          {b.name} tebak "{b.v === "bust" ? "kepedesan" : "aman"}" → {b.correct ? `benar +${BET_STAKE}` : `salah ${b.delta}`}
                        </div>
                      ))}
                    </div>
                  )}
                  <button className="tp-btn" onClick={next} style={{ marginTop: 16, padding: "13px 40px", borderRadius: 14, background: C.flame, color: "#fff", fontSize: 17, fontWeight: 800 }}>{turn + 1 >= n * CYCLES ? "Lihat hasil" : "Lanjut"}</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* GAME OVER */}
        {screen === "gameover" && (
          <div style={{ background: C.card, color: C.ink, borderRadius: 20, padding: 26, marginTop: 18, textAlign: "center" }}>
            <Crown size={44} style={{ color: C.amber }} />
            <p style={{ fontSize: 26, fontWeight: 800, color: C.chiliDark, margin: "6px 0 2px" }}>{ranked.filter((p) => p.score === topScore).length > 1 ? "Seri!" : `${ranked[0].name} menang!`}</p>
            <p style={{ fontSize: 14, color: C.muted, margin: "0 0 20px" }}>Hasil akhir lomba makan pedas</p>
            <div style={{ display: "grid", gap: 8, marginBottom: 22, textAlign: "left" }}>
              {ranked.map((p, rank) => (
                <div key={p.i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, background: p.score === topScore ? "#FBE9C8" : C.cream, border: p.score === topScore ? `2px solid ${C.amber}` : "1.5px solid #EADFCB" }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: C.muted, width: 22 }}>{rank + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: p.char ? CHARS[p.char].color : C.muted }}>{p.char ? CHARS[p.char].name : ""}</div>
                  </div>
                  {p.score === topScore && <Trophy size={18} style={{ color: C.amber }} />}
                  <span style={{ fontSize: 20, fontWeight: 800, color: C.chiliDark }}>{p.score}</span>
                </div>
              ))}
            </div>
            <button className="tp-btn" onClick={reset} style={{ width: "100%", padding: "15px 0", borderRadius: 14, background: C.flame, color: "#fff", fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><RotateCcw size={19} /> Main lagi</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div style={{ textAlign: "center" }}>
      <h1 style={{ margin: 0, fontSize: 38, fontWeight: 800, letterSpacing: -0.5, color: C.flame, textShadow: `2px 2px 0 ${C.chiliDark}` }}>
        <Flame size={30} style={{ verticalAlign: -4, marginRight: 4, color: C.chili }} /> Tahan Pedas
      </h1>
      <p style={{ margin: "4px 0 0", fontSize: 14, color: C.muted, fontWeight: 600 }}>Push-your-luck lomba makan pedas</p>
    </div>
  );
}
