import { Flame } from "lucide-react";

export function Header() {
  return (
    <div className="relative text-center">
      <h1
        className="m-0 font-display text-4xl font-extrabold tracking-tight text-flame"
        style={{ textShadow: "2px 2px 0 var(--c-chili-dark)" }}
      >
        <Flame size={30} className="mr-1 inline-block align-[-4px] text-chili" /> Tahan Pedas
      </h1>
      <p className="mt-1 text-sm font-semibold text-muted">Push-your-luck lomba makan pedas</p>
    </div>
  );
}
