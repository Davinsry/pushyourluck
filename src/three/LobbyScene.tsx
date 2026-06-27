import { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ChiliHead } from "./ChiliHead";
import { Table } from "./Table";
import { Room } from "./Room";
import { Chair } from "./Chair";
import { seatPosition, seatFacing, HEAD_Y, milkPosition, propFacing } from "./seats";
import { TableMilkBottle } from "./MilkBottle";

const LOBBY_CHARS = ["baja", "terawang", "pendingin", "hemat"];
const LOBBY_ACCENTS = ["#3e7cb1", "#8e5bd0", "#4e7410", "#6fa315"];

function LobbySceneGroup({ eaterStates, activeIndex }: { eaterStates: { heat: number; bust: boolean }[], activeIndex: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Very slow constant rotation so the scene feels alive and dynamic
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={[1.4, -0.4, 0]}>
      {/* Table */}
      <Suspense fallback={null}>
        <Room />
        {/* warm teplok key light (rotates with the scene, centred on the gardu) */}
        <pointLight position={[0, 1.75, 0]} intensity={1.7} color="#ffb24d" distance={9} decay={1.4} />
        <Table
          activeIndex={activeIndex}
          playerCount={4}
          canEat={false}
          onPick={() => {}}
          secretBowls={["ijo", "ijo", "ijo"]}
        />

        {/* Milk Bottle for the active eater in lobby */}
        {(() => {
          const m = milkPosition(activeIndex, 4);
          return (
            <TableMilkBottle
              full={true}
              position={m}
              rotation={[0, propFacing(activeIndex, 4), 0]}
              active={false}
              anim={null}
            />
          );
        })()}

        {/* 4 players sitting around the table */}
        {LOBBY_CHARS.map((char, i) => {
          const pos = seatPosition(i, 4, HEAD_Y);
          const state = eaterStates[i];
          const accent = LOBBY_ACCENTS[i];
          const bodyColor = i === 0 ? "#e8533a" : i === 1 ? "#3e7cb1" : i === 2 ? "#8e5bd0" : "#2fa98c";
          return (
            <group key={i} position={[pos.x, pos.y, pos.z]} rotation={[0, seatFacing(i, 4), 0]}>
              <ChiliHead
                heat={state.heat}
                accent={accent}
                active={false}
                bust={state.bust}
                anim={null}
                char={char}
              />
              <Chair />
              {/* seated cross-legged body (matches the in-game lesehan pose) */}
              <mesh position={[0, -HEAD_Y + 0.17, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.62, 0.66, 0.3, 16]} />
                <meshStandardMaterial color={bodyColor} roughness={0.85} />
              </mesh>
              <mesh position={[0, -HEAD_Y + 0.5, 0]} castShadow>
                <cylinderGeometry args={[0.32, 0.46, 0.58, 16]} />
                <meshStandardMaterial color={bodyColor} roughness={0.85} />
              </mesh>
            </group>
          );
        })}
      </Suspense>
    </group>
  );
}

/** 
 * Full-screen live 3D background scene for the game lobby and menus.
 * Shows a 4-player game where characters take turns breathing fire and burning each other.
 */
export function LobbyScene() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [eaterStates, setEaterStates] = useState([
    { heat: 0, bust: false }, // seat 0
    { heat: 0, bust: false }, // seat 1
    { heat: 0, bust: false }, // seat 2
    { heat: 0, bust: false }, // seat 3
  ]);

  useEffect(() => {
    let frameId: number;
    const startTime = performance.now();

    const update = () => {
      const elapsed = ((performance.now() - startTime) / 1000) % 13; // 13-second loop
      const currentActive = elapsed < 6.0 ? 0 : 1;
      
      const states = [
        { heat: 0, bust: false },
        { heat: 0, bust: false },
        { heat: 0, bust: false },
        { heat: 0, bust: false },
      ];

      if (elapsed < 3.0) {
        // Seat 0 spicing up (0s to 3s)
        states[0].heat = (elapsed / 3.0) * 85;
      } else if (elapsed < 5.0) {
        // Seat 0 breathing fire! (3s to 5s)
        states[0].heat = 100;
        states[0].bust = true;
      } else if (elapsed < 6.0) {
        // Seat 0 cools down. (5s to 6s)
        states[0].heat = 0;
      } else if (elapsed < 9.0) {
        // Seat 1 spicing up (6s to 9s)
        const progress = (elapsed - 6.0) / 3.0;
        states[1].heat = progress * 85;
      } else if (elapsed < 11.0) {
        // Seat 1 breathing fire! (9s to 11s)
        states[1].heat = 100;
        states[1].bust = true;
      } else if (elapsed < 12.0) {
        // Seat 1 cools down. (11s to 12s)
        states[1].heat = 0;
      }

      setActiveIndex(currentActive);
      setEaterStates(states);
      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="fixed inset-0 z-10 pointer-events-none" style={{ background: "#0a0f1a" }}>
      <Canvas
        shadows
        dpr={[1, 1.2]} // cap pixel ratio for performance in menu backgrounds
        camera={{ position: [0, 2.4, 7.5], fov: 46 }}
      >
        <color attach="background" args={["#0a0f1a"]} />
        <fog attach="fog" args={["#0a0f1a", 12, 30]} />
        {/* night ambience matching the in-game stage */}
        <ambientLight intensity={0.24} color="#5a6b8c" />
        <directionalLight position={[-6, 9, -4]} intensity={0.35} color="#8fa6d8" castShadow shadow-mapSize={[512, 512]} />

        <LobbySceneGroup eaterStates={eaterStates} activeIndex={activeIndex} />
      </Canvas>
    </div>
  );
}
