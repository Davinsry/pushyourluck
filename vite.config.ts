import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // relative paths so the static build works from any sub-path
  build: {
    // The three.js (3D) chunk is intentionally large but lazy-loaded on demand,
    // so it never blocks the 2D game. Raise the warning threshold accordingly.
    chunkSizeWarningLimit: 1100,
  },
});
