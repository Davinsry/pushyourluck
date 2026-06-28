import { useEffect, useState } from "react";
import { ArrowLeft, Plus, RefreshCw, Users } from "lucide-react";
import type { UseRoom } from "../../net/useRoom";

interface Props {
  room: UseRoom;
  onBack: () => void;
}

/** Create a room or pick from the list of open rooms. */
export function OnlineLobby({ room, onBack }: Props) {
  const [name, setName] = useState("Pemain");
  const [roomName, setRoomName] = useState("");

  // Poll the open-room list while we sit in the lobby.
  useEffect(() => {
    room.refreshRooms();
    const id = setInterval(room.refreshRooms, 3000);
    return () => clearInterval(id);
  }, [room]);

  return (
    <div className="mt-[18px] rounded-[20px] bg-card p-6 text-ink">
      <div className="mb-4 flex items-center gap-2">
        <button className="tp-btn rounded-full bg-cream-2 p-2 text-ink" onClick={onBack} aria-label="Kembali">
          <ArrowLeft size={18} />
        </button>
        <h2 className="m-0 text-xl font-extrabold text-chili-dark">Main Online</h2>
      </div>

      {!room.ready && (
        <p className="mb-3 rounded-lg bg-[#FBE0D6] px-3 py-2 text-[13px] font-semibold text-chili-dark">
          Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL & VITE_SUPABASE_KEY di .env.local lalu restart.
        </p>
      )}
      {room.error && (
        <p className="mb-3 rounded-lg bg-[#FBE0D6] px-3 py-2 text-[13px] font-semibold text-chili-dark">{room.error}</p>
      )}

      <label className="mb-1 block text-[13px] font-semibold text-muted">Nama kamu</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={14}
        className="mb-3 w-full rounded-xl border-[1.5px] border-line bg-cream px-3.5 py-3 text-base font-semibold text-ink outline-none focus:border-flame"
      />

      <label className="mb-1 block text-[13px] font-semibold text-muted">Nama Room Baru</label>
      <input
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        maxLength={20}
        placeholder="Masukkan nama room..."
        className="mb-4 w-full rounded-xl border-[1.5px] border-line bg-cream px-3.5 py-3 text-base font-semibold text-ink outline-none focus:border-flame"
      />

      <button
        className="tp-btn mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-flame py-3.5 text-[17px] font-extrabold text-white disabled:opacity-50"
        onClick={() => {
          if (roomName.trim()) {
            room.create(name.trim() || "Pemain", roomName.trim());
          }
        }}
        disabled={!roomName.trim() || !name.trim()}
      >
        <Plus size={20} /> Buat room baru
      </button>

      <div className="mt-5 flex items-center justify-between border-t border-line/10 pt-4">
        <span className="text-[13px] font-bold text-muted">
          <Users size={14} className="mr-1 inline-block align-[-2px]" /> Room tersedia
        </span>
        <button className="tp-btn rounded-full bg-cream-2 p-1.5 text-ink" onClick={room.refreshRooms} aria-label="Refresh">
          <RefreshCw size={15} />
        </button>
      </div>
      <div className="mt-2 grid gap-2">
        {room.rooms.length === 0 && (
          <p className="m-0 rounded-lg bg-cream px-3 py-3 text-center text-[13px] text-muted">
            Belum ada room. Buat satu, atau pastikan server jalan.
          </p>
        )}
        {room.rooms.map((r) => (
          <button
            key={r.code}
            className="tp-btn flex items-center justify-between rounded-xl border-[1.5px] border-line bg-cream px-4 py-2.5 text-left transition-colors hover:bg-cream-2"
            onClick={() => room.join(r.code, name.trim() || "Pemain")}
          >
            <span className="text-base font-extrabold text-chili-dark">{r.code}</span>
            <span className="text-[13px] font-semibold text-muted">
              host {r.host} · {r.count}/4
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
