import { useState } from "react";
import { ArrowLeft, Dices, Volume2, VolumeX } from "lucide-react";
import { getRandomName } from "../config/randomNames";

interface Props {
  muted: boolean;
  onToggleMute: () => void;
  onBack: () => void;
  username: string;
  onSetUsername: (username: string) => void;
}

export function SettingsScreen({ muted, onToggleMute, onBack, username, onSetUsername }: Props) {
  const [name, setName] = useState(username);

  const handleNameChange = (val: string) => {
    setName(val);
    onSetUsername(val.trim());
  };

  const handleRandomize = () => {
    const rName = getRandomName();
    setName(rName);
    onSetUsername(rName);
  };

  return (
    <div className="mt-[18px] rounded-[20px] bg-card p-6 text-ink">
      <div className="mb-5 flex items-center gap-2">
        <button className="tp-btn rounded-full bg-cream-2 p-2 text-ink" onClick={onBack} aria-label="Kembali">
          <ArrowLeft size={18} />
        </button>
        <h2 className="m-0 text-xl font-extrabold text-chili-dark">Pengaturan</h2>
      </div>

      <p className="m-0 mb-2 text-[15px] font-semibold text-ink">Nama kamu</p>
      <div className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          maxLength={14}
          placeholder="Masukkan nama..."
          className="w-full rounded-xl border-[1.5px] border-line bg-cream px-3.5 py-3 text-base font-semibold text-ink outline-none focus:border-flame"
        />
        <button
          type="button"
          onClick={handleRandomize}
          className="tp-btn rounded-xl bg-flame p-3.5 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          title="Acak Nama"
        >
          <Dices size={20} />
        </button>
      </div>



      <p className="m-0 mb-2 text-[15px] font-semibold text-ink">Suara</p>
      <button
        className="tp-btn flex w-full items-center justify-between rounded-xl bg-cream-2 px-4 py-3 text-[15px] font-bold text-ink"
        onClick={onToggleMute}
      >
        <span>{muted ? "Suara mati" : "Suara nyala"}</span>
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
}
