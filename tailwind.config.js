/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Warm "spicy" palette — ported from the prototype's C{} object.
      // Tweak these (or the matching CSS vars in src/index.css) to reskin the game.
      colors: {
        bg: "var(--c-bg)",
        bg2: "var(--c-bg2)",
        card: "var(--c-card)",
        ink: "var(--c-ink)",
        chili: "var(--c-chili)",
        "chili-dark": "var(--c-chili-dark)",
        flame: "var(--c-flame)",
        amber: "var(--c-amber)",
        leaf: "var(--c-leaf)",
        "leaf-dark": "var(--c-leaf-dark)",
        steel: "var(--c-steel)",
        cream: "var(--c-cream)",
        muted: "var(--c-muted)",
        line: "var(--c-line)",
        "cream-2": "var(--c-cream-2)",
      },
      fontFamily: {
        display: ["'Baloo 2'", "system-ui", "sans-serif"],
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(.7)", opacity: "0" },
          "60%": { transform: "scale(1.07)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "20%,60%": { transform: "translateX(-6px)" },
          "40%,80%": { transform: "translateX(6px)" },
        },
      },
      animation: {
        pop: "pop .35s ease",
        shake: "shake .4s ease",
      },
    },
  },
  plugins: [],
};
