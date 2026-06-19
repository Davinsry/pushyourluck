import { ArrowLeft, Trash2, Calendar, Trophy, Flame, HelpCircle, Frown, Dice5, History } from "lucide-react";
import { useEffect, useState } from "react";

export interface MatchRecord {
  id: string;
  timestamp: number;
  mode: "solo" | "local";
  cycles: number;
  players: {
    name: string;
    score: number;
    charName: string;
    charColor: string;
    stats: {
      ijoCount: number;
      rawitCount: number;
      carolinaCount: number;
      maxHeat: number;
      correctBets: number;
      busts: number;
    };
    playstyle: { title: string; description: string };
  }[];
  playtestingStats: {
    favoriteChili: string;
    spiciestKing: { name: string; value: number };
    bestGuesser: { name: string; value: number };
    mostBusted: { name: string; value: number };
  };
}

interface Props {
  onBack: () => void;
}

export function HistoryScreen({ onBack }: Props) {
  const [history, setHistory] = useState<MatchRecord[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const saved = localStorage.getItem("tahan_pedas_history");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as MatchRecord[];
          // Sort by newest first
          parsed.sort((a, b) => b.timestamp - a.timestamp);
          setHistory(parsed);
        } catch (e) {
          console.error("Gagal mengurai riwayat permainan:", e);
        }
      }
    }
  }, []);

  const handleDeleteMatch = (id: string) => {
    const updated = history.filter((m) => m.id !== id);
    setHistory(updated);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("tahan_pedas_history", JSON.stringify(updated));
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus semua riwayat pertandingan? Tindakan ini tidak dapat dibatalkan.")) {
      setHistory([]);
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem("tahan_pedas_history");
      }
    }
  };

  return (
    <div className="mt-[18px] animate-pop rounded-[20px] bg-card p-[24px] text-ink text-left flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cream-2 pb-3">
        <button
          onClick={onBack}
          className="tp-btn flex items-center gap-1.5 rounded-xl bg-cream-2 px-3 py-1.5 text-sm font-bold text-ink hover:bg-cream-2/80 transition"
          aria-label="Kembali ke Menu Utama"
        >
          <ArrowLeft size={16} />
          <span>Kembali</span>
        </button>
        <div className="text-right">
          <h2 className="text-xl font-black text-chili-dark flex items-center gap-1.5 justify-end">
            <History size={20} />
            <span>Riwayat Bermain</span>
          </h2>
          <p className="text-[11px] font-semibold text-muted">Data playtesting & analisis match</p>
        </div>
      </div>

      {history.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleClearAll}
            className="tp-btn flex items-center gap-1 text-[11px] font-bold text-chili-dark hover:text-chili hover:scale-105 active:scale-95 transition"
          >
            <Trash2 size={13} />
            <span>Hapus Semua Riwayat</span>
          </button>
        </div>
      )}

      {/* History List */}
      <div className="max-h-[50vh] overflow-y-auto pr-1 flex flex-col gap-4 scrollbar-thin">
        {history.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center gap-2">
            <div className="h-16 w-16 rounded-full bg-cream-2 flex items-center justify-center text-muted">
              <History size={32} />
            </div>
            <p className="text-base font-extrabold text-muted mt-2">Belum Ada Riwayat Pertandingan</p>
            <p className="text-xs text-muted max-w-[250px] mx-auto leading-relaxed">
              Mainkan game sampai selesai (Game Over) agar data tercatat secara otomatis di sini.
            </p>
          </div>
        ) : (
          history.map((record) => {
            // Find Winner
            const sortedPlayers = [...record.players].sort((a, b) => b.score - a.score);
            const winnerName = sortedPlayers[0]?.name || "-";
            const winnerScore = sortedPlayers[0]?.score ?? 0;

            const dateStr = new Date(record.timestamp).toLocaleString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={record.id}
                className="relative rounded-xl border border-cream-2 bg-cream p-4 shadow-sm flex flex-col gap-3.5 transition hover:shadow-md"
              >
                {/* Delete button */}
                <button
                  onClick={() => handleDeleteMatch(record.id)}
                  className="absolute right-3 top-3 p-1.5 text-muted hover:text-chili rounded-lg hover:bg-cream-2/50 transition active:scale-95"
                  title="Hapus pertandingan ini"
                >
                  <Trash2 size={15} />
                </button>

                {/* Match Metadata */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted font-bold">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {dateStr}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-cream-2" />
                  <span className="flex items-center gap-1 uppercase tracking-wider text-[10px] bg-cream-2 px-1.5 py-0.5 rounded text-ink/75">
                    {record.mode === "solo" ? "Solo vs Bot" : "Main Bareng"}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-cream-2" />
                  <span className="text-[10px] text-muted">{record.cycles} Ronde</span>
                </div>

                {/* Winner Card */}
                <div className="flex items-center gap-2 rounded-lg bg-amber/15 border border-amber/25 px-3 py-2 text-xs font-extrabold text-ink">
                  <Trophy size={15} className="text-amber" />
                  <span>
                    Pemenang: <span className="text-chili-dark font-black">{winnerName}</span> ({winnerScore} poin)
                  </span>
                </div>

                {/* Playtesting Stats Card */}
                <div className="rounded-lg bg-card border border-cream-2 p-3 text-[11px]">
                  <p className="font-black text-xs text-chili-dark mb-2 uppercase tracking-wide border-b border-cream-2 pb-1">
                    Statistik Playtesting
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-ink">
                    <div className="flex items-center gap-1.5">
                      <Flame size={12} className="text-flame shrink-0" />
                      <div>
                        <span className="font-semibold text-muted">Cabai Terfavorit:</span>
                        <div className="font-bold">{record.playtestingStats.favoriteChili}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Dice5 size={12} className="text-steel shrink-0" />
                      <div>
                        <span className="font-semibold text-muted">Raja Terpedas:</span>
                        <div className="font-bold">
                          {record.playtestingStats.spiciestKing.name !== "-"
                            ? `${record.playtestingStats.spiciestKing.name} (${record.playtestingStats.spiciestKing.value} SHU)`
                            : "-"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HelpCircle size={12} className="text-amber shrink-0" />
                      <div>
                        <span className="font-semibold text-muted">Dukun Terjitu:</span>
                        <div className="font-bold">
                          {record.playtestingStats.bestGuesser.name !== "-"
                            ? `${record.playtestingStats.bestGuesser.name} (${record.playtestingStats.bestGuesser.value} Tebakan)`
                            : "-"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Frown size={12} className="text-chili shrink-0" />
                      <div>
                        <span className="font-semibold text-muted">Sering Tersedak:</span>
                        <div className="font-bold">
                          {record.playtestingStats.mostBusted.name !== "-"
                            ? `${record.playtestingStats.mostBusted.name} (${record.playtestingStats.mostBusted.value} Bust)`
                            : "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Player Style Analysis */}
                <div className="flex flex-col gap-2">
                  <p className="font-black text-xs text-chili-dark uppercase tracking-wide border-b border-cream-2 pb-1">
                    Analisis Pemain
                  </p>
                  <div className="flex flex-col gap-2">
                    {record.players.map((p, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg bg-cream-2/40 border border-cream-2/70 p-2.5 flex flex-col gap-0.5"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-black flex items-center gap-1.5">
                            <span
                              className="h-2.5 w-2.5 rounded-full inline-block shrink-0"
                              style={{ backgroundColor: p.charColor || "var(--c-muted)" }}
                            />
                            {p.name}
                          </span>
                          <span className="font-bold bg-cream-2/80 px-1.5 py-0.5 rounded text-[10px] text-muted">
                            {p.charName || "Karakter"} • {p.score} Poin
                          </span>
                        </div>
                        <div className="text-[11px] font-extrabold text-flame mt-1">
                          🔥 Gaya: {p.playstyle.title}
                        </div>
                        <div className="text-[10px] text-muted font-medium leading-tight">
                          {p.playstyle.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
