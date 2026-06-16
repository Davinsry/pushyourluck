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
      <div className="mb-5 text-center">
        <h2 className="m-0 text-xl font-extrabold text-chili-dark">Ruang Tunggu</h2>
        <p className="m-0 mt-1 text-[13px] font-semibold text-muted">
          Room ID: <span className="font-extrabold tracking-wider text-ink bg-cream-2 px-2.5 py-1 rounded-lg border border-line">{room.code}</span>
        </p>
      </div>

      {room.error && (
        <p className="mb-3 rounded-lg bg-[#FBE0D6] px-3 py-2 text-[13px] font-semibold text-chili-dark">{room.error}</p>
      )}

      {/* Game Settings Panel */}
      <div className="mb-5 rounded-xl border-[1.5px] border-line bg-cream p-4">
        <h3 className="m-0 mb-3 text-sm font-extrabold text-chili-dark uppercase tracking-wider">
          Pengaturan Game
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-[11px] font-bold text-muted uppercase tracking-wider">
              Jumlah Ronde
            </label>
            <select
              value={room.roomSettings.cycles}
              onChange={(e) => room.updateSettings(Number(e.target.value), room.roomSettings.turnTimerLimit)}
              disabled={!room.isHost}
              className="w-full rounded-xl border-[1.5px] border-line bg-cream-2 px-3 py-2 text-[14px] font-bold text-ink outline-none disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {[1, 2, 3, 4, 5].map((val) => (
                <option key={val} value={val}>
                  {val} Ronde
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold text-muted uppercase tracking-wider">
              Waktu Berpikir
            </label>
            <select
              value={room.roomSettings.turnTimerLimit}
              onChange={(e) => room.updateSettings(room.roomSettings.cycles, Number(e.target.value))}
              disabled={!room.isHost}
              className="w-full rounded-xl border-[1.5px] border-line bg-cream-2 px-3 py-2 text-[14px] font-bold text-ink outline-none disabled:opacity-80 disabled:cursor-not-allowed"
            >
              <option value={15}>15 Detik</option>
              <option value={30}>30 Detik</option>
              <option value={45}>45 Detik</option>
              <option value={60}>1 Menit</option>
              <option value={90}>1.5 Menit</option>
              <option value={120}>2 Menit</option>
              <option value={0}>Tanpa Batas</option>
            </select>
          </div>
        </div>
        
        {!room.isHost && (
          <p className="m-0 mt-3 text-[11px] font-semibold text-muted italic">
            * Hanya Host yang dapat mengubah pengaturan game.
          </p>
        )}
      </div>

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
