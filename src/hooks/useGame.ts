import { useMemo, useReducer, useEffect } from "react";
import {
  activeIndex,
  currentCycle,
  gameReducer,
  initialState,
  isFinalRonde,
  totalTurns,
  type Action,
  type GameState,
  type Rng,
} from "../game";

/**
 * Wires the pure game reducer to React. The rng defaults to Math.random
 * but can be injected (tests, deterministic demos). Returns the state,
 * a dispatch, and the handful of turn-derived values screens care about.
 */
export function useGame(rng: Rng = Math.random) {
  const reducer = useMemo(() => (s: GameState, a: Action) => gameReducer(s, a, rng), [rng]);
  
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    if (typeof window !== "undefined" && window.localStorage) {
      const saved = localStorage.getItem("push_your_luck_game_state");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object" && parsed.screen && parsed.players) {
            return parsed as GameState;
          }
        } catch (e) {
          console.error("Failed to parse saved game state:", e);
        }
      }
    }
    return initialState(rng);
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("push_your_luck_game_state", JSON.stringify(state));
    }
  }, [state]);

  const derived = useMemo(
    () => ({
      activeIndex: activeIndex(state),
      cycle: currentCycle(state),
      isFinal: isFinalRonde(state),
      totalTurns: totalTurns(state),
      activePlayer: state.players[activeIndex(state)],
    }),
    [state]
  );

  return { state, dispatch, ...derived };
}

export type UseGame = ReturnType<typeof useGame>;
