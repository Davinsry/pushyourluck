import { useState } from "react";
import { Coins, Flame, Milk, Shield, ShoppingCart } from "lucide-react";
import { SHOP } from "../config/balance";
import type { Player, ShopItem } from "../game";
import { playerColor } from "../ui/theme";

interface Props {
  players: Player[];
  cycle: number; // the ronde that just finished
  onBuy: (player: number, item: ShopItem) => void;
  onClose: () => void;
}

const ITEMS: { id: ShopItem; label: string; icon: typeof Milk; kit: keyof Player }[] = [
  { id: "susu", label: "Susu", icon: Milk, kit: "susu" },
  { id: "tameng", label: "Tameng", icon: Shield, kit: "tameng" },
  { id: "cabai", label: "Sambal", icon: Flame, kit: "sabotage" },
];

/** Between-ronde shop: spend points on Susu / Tameng / Sambal (cabai). */
export function ShopScreen({ players, cycle, onBuy, onClose }: Props) {
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
    <div className="mt-[18px] rounded-[20px] bg-card p-6 text-ink relative">
      <div className="mb-1 flex items-center gap-2">
        <ShoppingCart size={20} className="text-chili-dark" />
        <h2 className="m-0 text-xl font-extrabold text-chili-dark">Toko</h2>
      </div>
      <p className="m-0 mb-4 text-[13px] text-muted">
        Ronde {cycle} selesai. Belanja pakai poin sebelum lanjut.
      </p>

      <div className="grid gap-3">
        {players.map((p, i) => (
          <div key={i} className="rounded-2xl border-[1.5px] border-cream-2 bg-cream p-3.5">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: playerColor(i) }} />
              <span className="text-base font-extrabold">{p.name}</span>
              <span className="ml-auto flex items-center gap-1 text-sm font-bold text-chili-dark">
                <Coins size={15} /> {p.score}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ITEMS.map(({ id, label, icon: Icon, kit }) => {
                const itemPrice = SHOP[id];
                const afford = p.score >= itemPrice;
                return (
                  <button
                    key={id}
                    className="tp-btn flex flex-col items-center gap-0.5 rounded-xl bg-cream-2 px-2 py-2 text-ink disabled:opacity-40"
                    onClick={() => setConfirming({ playerIndex: i, itemId: id, qty: 1 })}
                    disabled={!afford}
                  >
                    <Icon size={18} />
                    <span className="text-[13px] font-bold">{label}</span>
                    <span className="text-[11px] font-semibold text-muted">
                      {itemPrice} poin · punya {p[kit] as number}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        className="tp-btn mt-5 w-full rounded-[14px] bg-flame py-3.5 text-[17px] font-extrabold text-white"
        onClick={onClose}
      >
        Lanjut ke ronde berikutnya
      </button>

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
              <div 
                className={`p-3 rounded-full ${
                  confirming.itemId === "susu" ? "bg-sky-100 text-sky-600" :
                  confirming.itemId === "tameng" ? "bg-amber-100 text-amber-600" :
                  "bg-red-100 text-red-600"
                }`}
              >
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
