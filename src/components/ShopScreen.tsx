import { useState } from "react";
import { Coins, Milk, ShoppingCart } from "lucide-react";
import { SHOP } from "../config/balance";
import type { Player, ShopItem } from "../game";
import { playerColor } from "../ui/theme";

interface Props {
  players: Player[];
  cycle: number; // the ronde that just finished
  onBuy: (player: number, item: ShopItem) => void;
  onClose?: () => void;
  secondsLeft?: number;
}

const ITEMS: { id: ShopItem; label: string; icon: typeof Milk; kit: keyof Player }[] = [
  { id: "susu", label: "Susu", icon: Milk, kit: "susu" },
];

/** Between-ronde shop: spend points on Susu / Tameng / Sambal (cabai). */
export function ShopScreen({ players, cycle, onBuy, onClose, secondsLeft }: Props) {
  const [confirming, setConfirming] = useState<{ playerIndex: number; itemId: ShopItem; qty: number } | null>(null);

  const handleConfirmBuy = () => {
    if (!confirming) return;
    const { playerIndex, itemId, qty } = confirming;
    for (let step = 0; step < qty; step++) {
      onBuy(playerIndex, itemId);
    }
    setConfirming(null);
  };

  const activeItem = confirming ? ITEMS.find(item => item.id === confirming.itemId) : null;
  const buyer = confirming ? players[confirming.playerIndex] : null;
  const price = confirming ? SHOP[confirming.itemId] : 0;
  const maxQty = buyer ? Math.floor(buyer.score / price) : 0;
  const totalCost = confirming ? price * confirming.qty : 0;
  const IconComponent = activeItem?.icon;

  return (
    <div className="rounded-[20px] bg-card p-5 text-ink relative max-h-[90vh] flex flex-col shadow-2xl">
      <div className="mb-1 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart size={20} className="text-chili-dark" />
          <h2 className="m-0 text-xl font-extrabold text-chili-dark">Toko</h2>
        </div>
        {secondsLeft !== undefined && (
          <div className="rounded-full bg-flame/10 px-2.5 py-1 text-xs font-bold text-flame animate-pulse">
            Sisa Waktu: {secondsLeft}s
          </div>
        )}
      </div>
      <p className="m-0 mb-3 text-[13px] text-muted flex-shrink-0">
        Ronde {cycle} selesai. Belanja pakai poin sebelum lanjut.
      </p>

      <div className="grid gap-2 overflow-y-auto flex-1 pr-1 my-1.5 min-h-0">
        {players.map((p, i) => (
          <div
            key={i}
            className="rounded-xl border-[1.5px] border-cream-2 bg-cream px-3 py-2 flex items-center gap-2 flex-shrink-0"
          >
            <span className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: playerColor(i) }} />
            <span className="text-sm font-extrabold truncate">{p.name}</span>
            <span className="flex items-center gap-1 text-xs font-bold text-chili-dark flex-shrink-0">
              <Coins size={13} /> {p.score}
            </span>
            <div className="ml-auto flex flex-wrap justify-end gap-1.5">
              {ITEMS.map(({ id, label, icon: Icon, kit }) => {
                const itemPrice = SHOP[id];
                const afford = p.score >= itemPrice;
                return (
                  <button
                    key={id}
                    className="tp-btn flex items-center gap-1.5 rounded-lg bg-cream-2 px-2.5 py-1.5 text-ink disabled:opacity-40"
                    onClick={() => setConfirming({ playerIndex: i, itemId: id, qty: 1 })}
                    disabled={!afford}
                  >
                    <Icon size={15} className="flex-shrink-0" />
                    <span className="text-[12px] font-bold">{label}</span>
                    <span className="text-[11px] font-semibold text-muted">
                      {itemPrice}p · punya {p[kit] as number}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {onClose && (
        <button
          className="tp-btn mt-4 w-full rounded-[14px] bg-flame py-3.5 text-[17px] font-extrabold text-white flex-shrink-0 shadow-md"
          onClick={onClose}
        >
          Lanjut ke ronde berikutnya
        </button>
      )}

      {/* Confirmation Modal */}
      {confirming && buyer && activeItem && IconComponent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity animate-in fade-in duration-200"
          onClick={() => setConfirming(null)}
        >
          <div 
            className="w-full max-w-[340px] transform rounded-3xl bg-cream p-6 border-2 border-line/20 shadow-2xl text-ink relative flex flex-col gap-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center">
              <h3 className="m-0 text-lg font-black text-chili-dark">Konfirmasi Pembelian</h3>
              <p className="m-0 text-xs text-muted font-semibold mt-1">
                Pemain: <span className="text-ink font-bold">{buyer.name}</span>
              </p>
            </div>

            {/* Item Profile Card */}
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-cream-2 border border-line/5 py-4 px-2">
              <div className="p-3 rounded-full bg-sky-100 text-sky-600">
                <IconComponent size={28} />
              </div>
              <span className="text-base font-extrabold">{activeItem.label}</span>
              <span className="text-xs text-muted font-bold">Harga: {price} poin / item</span>
            </div>

            {/* Quantity Selector */}
            <div className="flex flex-col gap-1.5 items-center">
              <span className="text-[10px] font-extrabold text-muted tracking-wider">JUMLAH</span>
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-cream-2 border border-line/10 flex items-center justify-center font-black text-lg hover:bg-cream-3 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
                  onClick={() => setConfirming(prev => prev ? { ...prev, qty: Math.max(1, prev.qty - 1) } : null)}
                  disabled={confirming.qty <= 1}
                >
                  -
                </button>
                <span className="text-2xl font-black text-ink w-10 text-center">{confirming.qty}</span>
                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-cream-2 border border-line/10 flex items-center justify-center font-black text-lg hover:bg-cream-3 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
                  onClick={() => setConfirming(prev => prev ? { ...prev, qty: Math.min(maxQty, prev.qty + 1) } : null)}
                  disabled={confirming.qty >= maxQty}
                >
                  +
                </button>
              </div>
            </div>

            {/* Cost Preview */}
            <div className="rounded-xl border border-line/10 bg-cream-2/40 p-3 text-xs font-semibold flex flex-col gap-1 text-muted">
              <div className="flex justify-between">
                <span>Total Biaya:</span>
                <span className="text-chili-dark font-extrabold">{totalCost} poin</span>
              </div>
              <div className="flex justify-between border-t border-line/5 pt-1 mt-0.5">
                <span>Sisa Poin Pemain:</span>
                <span className="text-ink font-bold">{buyer.score - totalCost} poin</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                className="tp-btn flex-1 rounded-xl bg-cream-2 border border-line/10 py-3 text-sm font-extrabold text-muted hover:text-ink hover:bg-cream-3 active:scale-95 transition-all"
                onClick={() => setConfirming(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="tp-btn flex-1 rounded-xl bg-flame py-3 text-sm font-extrabold text-white shadow-md shadow-flame/15 hover:bg-flame/90 active:scale-95 transition-all"
                onClick={handleConfirmBuy}
              >
                Beli
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
