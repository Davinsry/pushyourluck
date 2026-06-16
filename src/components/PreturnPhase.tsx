import { Coins, Flame, Shield } from "lucide-react";
import { BET_STAKE } from "../config/balance";
import type { Bet, BetMap, Player } from "../game";

interface Props {
  players: Player[];
  activeIndex: number;
  bets: BetMap;
  usedSabo: number[];
  pendingHeat: number;
  blockAsk: boolean;
  onToggleBet: (player: number, bet: Bet) => void;
  onAddSabo: (player: number) => void;
  onConfirm: () => void;
  onUseTameng: () => void;
  onAcceptHeat: () => void;
  viewerSeat?: number; // online: which seat is looking (gates controls)
}

export function PreturnPhase({
  players,
  activeIndex,
  bets,
  usedSabo,
  pendingHeat,
  blockAsk,
  onToggleBet,
  onAddSabo,
  onConfirm,
  onUseTameng,
  onAcceptHeat,
  viewerSeat,
}: Props) {
  const me = players[activeIndex];
  const hasHumanSpectators = players.some((p, k) => k !== activeIndex && !p.isBot);
  const online = viewerSeat !== undefined;
  const youAreActive = !online || viewerSeat === activeIndex;

  if (blockAsk) {
    if (online && !youAreActive) {
      return (
        <div className="animate-pop">
          <p className="m-0 text-[13px] font-semibold text-muted">Giliran</p>
          <p className="m-0 mb-2 text-2xl font-extrabold text-chili-dark">{me.name}</p>
          <p className="m-0 text-[14px] font-semibold text-muted">{me.name} lagi mikir pakai tameng atau nggak...</p>
        </div>
      );
    }
    return (
      <div className="animate-pop">
        <p className="m-0 text-[13px] font-semibold text-muted">Giliran</p>
        <p className="m-0 mb-1 text-2xl font-extrabold text-chili-dark">{me.name}</p>
        <p className="my-2 mb-4 text-[15px] font-semibold text-ink">
          {me.name} kena sambal +{pendingHeat} pedas. Pakai tameng buat tangkis?
        </p>
        <div className="flex gap-2.5">
          <button
            className="tp-btn flex-1 rounded-xl bg-steel py-3 text-[15px] font-extrabold text-white"
            onClick={onUseTameng}
          >
            <Shield size={16} className="mr-1.5 inline-block align-[-3px]" />
            Tangkis
          </button>
          <button
            className="tp-btn flex-1 rounded-xl bg-cream-2 py-3 text-[15px] font-extrabold text-ink"
            onClick={onAcceptHeat}
          >
            Terima aja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pop">
      <p className="m-0 text-[13px] font-semibold text-muted">Giliran</p>
      <p className="m-0 mb-1 text-2xl font-extrabold text-chili-dark">{me.name}</p>
      <p className="m-0 mb-3 text-[13px] text-ink">
        {hasHumanSpectators
          ? `Penonton: tebak nasib ${me.name} (benar +${BET_STAKE}, salah −${BET_STAKE}), dan boleh tambah sambal.`
          : `Lawan-lawan bot diam-diam pasang taruhan & sambal...`}
        {pendingHeat > 0 && <span className="font-bold text-chili"> Sambal: +{pendingHeat} pedas.</span>}
      </p>

      <div className="mb-3.5 grid gap-2.5">
        {players.map((p, k) => {
          if (k === activeIndex || p.isBot) return null;
          if (online && k !== viewerSeat) return null; // online: only bet for yourself
          const canSabo = p.sabotage > 0 && !usedSabo.includes(k);
          return (
            <div key={k} className="rounded-xl border-[1.5px] border-cream-2 bg-cream px-3 py-2.5">
              <div className="mb-2 text-sm font-bold">{p.name}</div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  className={`tp-btn rounded-full px-3 py-1.5 text-[13px] font-bold ${
                    bets[k] === "aman" ? "bg-leaf text-white" : "bg-cream-2 text-muted"
                  }`}
                  onClick={() => onToggleBet(k, "aman")}
                >
                  <Coins size={13} className="mr-1 inline-block align-[-2px]" />
                  Aman
                </button>
                <button
                  className={`tp-btn rounded-full px-3 py-1.5 text-[13px] font-bold ${
                    bets[k] === "bust" ? "bg-chili text-white" : "bg-cream-2 text-muted"
                  }`}
                  onClick={() => onToggleBet(k, "bust")}
                >
                  <Coins size={13} className="mr-1 inline-block align-[-2px]" />
                  Kepedesan
                </button>
                {canSabo && (
                  <button
                    className="tp-btn ml-auto rounded-full px-3 py-1.5 text-[13px] font-bold text-chili-dark"
                    style={{ background: "#FBE0D6" }}
                    onClick={() => onAddSabo(k)}
                  >
                    <Flame size={13} className="mr-1 inline-block align-[-2px]" />
                    Tambah sambal
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {youAreActive ? (
        <button
          className="tp-btn w-full rounded-[14px] bg-flame py-3.5 text-[17px] font-extrabold text-white"
          onClick={onConfirm}
        >
          Mulai giliran {me.name}
        </button>
      ) : (
        <p className="m-0 rounded-xl bg-cream py-3 text-center text-[14px] font-semibold text-muted">
          Menunggu {me.name} mulai...
        </p>
      )}
    </div>
  );
}
