import { Box, Square } from "lucide-react";

export type ViewMode = "2d" | "3d";

interface Props {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

/** Two buttons to switch between the flat 2D UI and the 3D stage. */
export function ViewToggle({ mode, onChange }: Props) {
  return (
    <div className="mx-auto mt-3 flex w-fit gap-1 rounded-full bg-bg2 p-1">
      <button
        className={`tp-btn flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold ${
          mode === "2d" ? "bg-flame text-white" : "text-muted"
        }`}
        onClick={() => onChange("2d")}
      >
        <Square size={15} /> 2D
      </button>
      <button
        className={`tp-btn flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold ${
          mode === "3d" ? "bg-flame text-white" : "text-muted"
        }`}
        onClick={() => onChange("3d")}
      >
        <Box size={15} /> 3D
      </button>
    </div>
  );
}
