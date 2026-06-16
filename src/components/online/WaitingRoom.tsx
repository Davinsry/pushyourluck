import { Crown, LogOut, Play, Wifi, WifiOff } from "lucide-react";
import type { UseRoom } from "../../net/useRoom";
import { playerColor } from "../../ui/theme";

interface Props {
  room: UseRoom;
}

/** Lobby waiting room: shows the code to share, members, and (host) Start. */
export function WaitingRoom({ room }: Props) {
  return (
    <div className="mt-[18px] rounded-[20px] bg-card p-6 text-ink">
      <p className="m-0 text-center text-[13px] font-semibold text-muted">Kode room — bagikan ke teman</p>
      <p className="m-0 mb-5 text-center text-5xl font-extrabold tracking-[0.3em] text-chili-dark">{room.code}</p>

      {room.error && (
        <p className="mb-3 rounded-lg bg-[#FBE0D6] px-3 py-2 text-[13px] font-semibold text-chili-dark">{room.error}</p>
      )}

      <div className="mb-5 grid gap-2">
        {room.members.map((m, i) => (
          <div
            key={m.id}
            className="flex items-center gap-3 rounded-xl border-[1.5px] border-line bg-cream px-4 py-3"
          >
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: playerColor(i) }} />
            <span className="flex-1 text-base font-bold">{m.name}</span>
            {m.id === room.hostId && <Crown size={16} className="text-amber" />}
            {m.id === room.myId && <span className="text-[12px] font-bold text-muted">(kamu)</span>}
            {m.connected ? <Wifi size={15} className="text-leaf" /> : <WifiOff size={15} className="text-muted" />}
          </div>
        ))}
      </div>

      {room.isHost ? (
        <button
          className="tp-btn flex w-full items-center justify-center gap-2 rounded-xl bg-flame py-3.5 text-[17px] font-extrabold text-white disabled:opacity-40"
          onClick={room.start}
          disabled={room.members.length < 2}
        >
          <Play size={20} /> {room.members.length < 2 ? "Nunggu pemain lain..." : "Mulai main"}
        </button>
      ) : (
        <p className="m-0 rounded-xl bg-cream py-3.5 text-center text-[15px] font-semibold text-muted">
          Menunggu host memulai...
        </p>
      )}

      <button
        className="tp-btn mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-cream-2 py-2.5 text-sm font-bold text-ink"
        onClick={room.leave}
      >
        <LogOut size={16} /> Keluar room
      </button>
    </div>
  );
}
