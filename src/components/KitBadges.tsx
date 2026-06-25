import { Milk } from "lucide-react";
import type { Player } from "../game";

interface Props {
  player: Player;
}

/** Compact tally of a player's remaining susu tokens. */
export function KitBadges({ player }: Props) {
  return (
    <div className="text-right text-xs font-semibold text-muted">
      <div>
        <Milk size={13} className="inline-block align-[-2px]" /> Susu: {player.susu}
      </div>
    </div>
  );
}
