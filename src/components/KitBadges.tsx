import { Flame, Milk, Shield } from "lucide-react";
import type { Player } from "../game";

interface Props {
  player: Player;
}

/** Compact tally of a player's remaining tameng / susu / sambal tokens. */
export function KitBadges({ player }: Props) {
  return (
    <div className="text-right text-xs font-semibold text-muted">
      <div>
        <Shield size={13} className="inline-block align-[-2px]" /> Tameng: {player.tameng}
      </div>
      <div>
        <Milk size={13} className="inline-block align-[-2px]" /> Susu: {player.susu}
      </div>
      <div>
        <Flame size={13} className="inline-block align-[-2px]" /> Sambal: {player.sabotage}
      </div>
    </div>
  );
}
