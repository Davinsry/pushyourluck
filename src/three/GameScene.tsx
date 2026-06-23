import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { CHARS } from "../config/balance";
import type { BiteId, GameState } from "../game";
import { color as token, playerColor } from "../ui/theme";
import { CameraRig } from "./CameraRig";
import { ChiliHead } from "./ChiliHead";
import { TableMilkBottle } from "./MilkBottle";
import { Table } from "./Table";
import { Room } from "./Room";
import { Chair } from "./Chair";
import { HEAD_Y, milkPosition, propFacing, seatFacing, seatPosition } from "./seats";

// Concrete hex per character accent (three needs real colours, not CSS vars).
const ACCENT: Record<string, string> = {
  baja: "#3e7cb1",
  rakus: "#d7263d",
  kompor: "#f26419",
  hemat: "#6fa315",
  perisai: "#f6a609",
  pendingin: "#4e7410",
};

/** Signals the active eater's hand animation (reach for a chili / drink milk). */
export interface ActionAnim {
  kind: "bite" | "milk";
  bite?: BiteId;
  nonce: number; // start time (performance.now) — changes to retrigger
}

interface Props {
  state: GameState;
  activeIndex: number;
  onPick: (bite: BiteId) => void;
  anim?: ActionAnim | null;
  busy?: boolean;
  paused?: boolean;
}

/** The 3D stage. Reads game state only — it never mutates it. */
export function GameScene({ state, activeIndex, onPick, anim, busy = false, paused = false }: Props) {
  const n = state.players.length;
  const busted = state.phase === "result" && state.outcome?.busted === true;
  const canEat = state.phase === "active" && !busy;

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]} // cap pixel ratio for tablet performance
      camera={{ position: [0, 4, 7], fov: 50 }}
      className="rounded-[20px]"
    >
      <color attach="background" args={["#edeae4"]} />
      <fog attach="fog" args={["#edeae4", 18, 32]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 8, 5]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[0, 3.0, 0]} intensity={0.5} color="#f6a609" />

      <CameraRig activeIndex={activeIndex} playerCount={n} />

      <Suspense fallback={null}>
        <Room />
        <Table activeIndex={activeIndex} playerCount={n} canEat={canEat} onPick={onPick} />

        {/* milk bottle for the active player — full until they drink it */}
        {(() => {
          const m = milkPosition(activeIndex, n);
          return (
            <TableMilkBottle
              full={state.players[activeIndex].susu > 0}
              position={m}
              rotation={[0, propFacing(activeIndex, n), 0]}
              active={true}
              anim={anim}
            />
          );
        })()}

        {state.players.map((p, i) => {
          const pos = seatPosition(i, n, HEAD_Y);
          const isActive = i === activeIndex;
          // headband = which character; body = which player (distinct per seat)
          const accent = p.char ? ACCENT[p.char] ?? token(CHARS[p.char].colorKey) : "#9b8675";
          const body = playerColor(i);

          return (
            <group key={i} position={[pos.x, pos.y, pos.z]} rotation={[0, seatFacing(i, n), 0]}>
              {state.screen !== "shop" && (
                <Html
                  position={[0, 0.85, 0]}
                  center
                  distanceFactor={5.5}
                  style={{
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                    userSelect: "none",
                    display: paused ? "none" : "block",
                  }}
                >
                  <div
                    className="chili-player-badge px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-lg border border-line/10 flex items-center gap-1.5"
                    style={{
                      backgroundColor: "rgba(30, 19, 13, 0.85)",
                      color: "var(--c-cream)",
                      display: paused ? "none" : "flex",
                    }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: body }} />
                    {p.name}
                  </div>
                </Html>
              )}
              <ChiliHead
                heat={isActive ? state.heat : 0}
                accent={accent}
                active={isActive}
                bust={isActive && busted}
                anim={isActive ? anim ?? null : null}
                char={p.char}
              />
              <Chair />
              {/* simple body so heads aren't floating — coloured per player */}
              <mesh position={[0, -0.95, 0]} castShadow>
                <cylinderGeometry args={[0.4, 0.55, 1.1, 16]} />
                <meshStandardMaterial color={body} roughness={0.8} />
              </mesh>
            </group>
          );
        })}
      </Suspense>
    </Canvas>
  );
}
