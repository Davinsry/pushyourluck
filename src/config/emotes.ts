export interface Emote {
  id: string;
  emoji: string;
  label: string;
}

export const EMOTES: Emote[] = [
  { id: "mock", emoji: "😜", label: "Meledek" },
  { id: "laugh_at", emoji: "😂", label: "Menertawakan" },
  { id: "grin", emoji: "😄", label: "Ketawa" },
  { id: "cry", emoji: "😭", label: "Nangis" }
];
