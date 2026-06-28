import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * An Indonesian village street in front of the pos ronda: a dirt road with
 * houses (glowing windows), electric poles + wires, slow night traffic
 * (a car and a motorbike), and an "abang nasi goreng" pushing his cart.
 * Built from primitives; placed on the −z side of the gardu.
 */

const ROAD_Z = -8.5; // road centre line
const ROAD_Y = -0.24; // just above the dark ground
const HOUSE_Z = -11.2; // houses behind the road
const POLE_X = [-14, -6, 2, 10, 16];

export function Village() {
  return (
    // Placed on the OPEN front side of the pos (+z) so the camera/POV sees it.
    <group rotation={[0, Math.PI, 0]}>
      {/* ── dirt road ── */}
      <mesh position={[0, ROAD_Y, ROAD_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[46, 3.2]} />
        <meshStandardMaterial color="#5b4632" roughness={1} />
      </mesh>
      {[-0.6, 0.6].map((o, i) => (
        <mesh key={i} position={[0, ROAD_Y + 0.005, ROAD_Z + o]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[46, 0.4]} />
          <meshStandardMaterial color="#4a3826" roughness={1} />
        </mesh>
      ))}
      {/* grass verge in front of the houses */}
      <mesh position={[0, ROAD_Y + 0.002, ROAD_Z - 2.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[46, 2.2]} />
        <meshStandardMaterial color="#16241a" roughness={1} />
      </mesh>

      {/* ── houses ── */}
      {[
        { x: -13, c: "#caa66a" },
        { x: -6, c: "#b98f57" },
        { x: 1, c: "#c9b083" },
        { x: 8.5, c: "#a9b08a" },
        { x: 15, c: "#bfa275" },
      ].map((h, i) => (
        <House key={i} x={h.x} color={h.c} />
      ))}

      {/* ── electric poles ── */}
      {POLE_X.map((x, i) => (
        <Pole key={i} x={x} />
      ))}
      {/* ── wires between poles ── */}
      {POLE_X.slice(0, -1).flatMap((x, i) => {
        const x2 = POLE_X[i + 1];
        return [2.5, 2.32].map((y, j) => (
          <mesh key={`${i}-${j}`} position={[(x + x2) / 2, y, ROAD_Z - 1.4]}>
            <boxGeometry args={[x2 - x, 0.015, 0.015]} />
            <meshStandardMaterial color="#0a0a0a" />
          </mesh>
        ));
      })}

      {/* ── night traffic ── */}
      <Vehicle z={ROAD_Z + 0.6} speed={3.4} dir={1} color="#cc2a2a" kind="car" span={48} />
      <Vehicle z={ROAD_Z - 0.6} speed={5} dir={-1} color="#2b2b2b" kind="moto" span={48} />

      {/* ── nasi goreng vendor ── */}
      <Vendor z={ROAD_Z + 1.45} />
    </group>
  );
}

function House({ x, color }: { x: number; color: string }) {
  return (
    <group position={[x, ROAD_Y, HOUSE_Z]}>
      {/* wall body */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[2.4, 1.6, 2.2]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* gable/pyramid roof */}
      <mesh position={[0, 1.98, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.0, 1.0, 4]} />
        <meshStandardMaterial color="#7a3526" roughness={0.9} />
      </mesh>
      {/* door (faces +z toward the road) */}
      <mesh position={[0, 0.5, 1.11]}>
        <boxGeometry args={[0.5, 1.0, 0.05]} />
        <meshStandardMaterial color="#3a2414" roughness={0.8} />
      </mesh>
      {/* warm glowing windows */}
      {[-0.72, 0.72].map((wx, i) => (
        <mesh key={i} position={[wx, 0.95, 1.11]}>
          <boxGeometry args={[0.46, 0.46, 0.04]} />
          <meshStandardMaterial color="#ffd98a" emissive="#ffb74d" emissiveIntensity={1.5} />
        </mesh>
      ))}
    </group>
  );
}

function Pole({ x }: { x: number }) {
  return (
    <group position={[x, ROAD_Y, ROAD_Z - 1.4]}>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.07, 0.1, 3.0, 8]} />
        <meshStandardMaterial color="#3b3b3b" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.7, 0]}>
        <boxGeometry args={[0.9, 0.08, 0.08]} />
        <meshStandardMaterial color="#2a1f14" roughness={0.8} />
      </mesh>
      {/* little street lamp glow */}
      <mesh position={[0, 2.5, 0.32]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#fff0c0" emissive="#ffbf5e" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function Vehicle({
  z,
  speed,
  dir,
  color,
  kind,
  span,
}: {
  z: number;
  speed: number;
  dir: number;
  color: string;
  kind: "car" | "moto";
  span: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * speed;
    let x = (t % span) - span / 2;
    if (dir < 0) x = -x;
    ref.current.position.x = x;
  });
  return (
    <group ref={ref} position={[0, ROAD_Y, z]} rotation={[0, dir > 0 ? 0 : Math.PI, 0]}>
      {kind === "car" ? <CarMesh color={color} /> : <MotoMesh color={color} />}
    </group>
  );
}

function CarMesh({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[1.5, 0.4, 0.9]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[-0.05, 0.62, 0]}>
        <boxGeometry args={[0.8, 0.35, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {([
        [-0.5, 0.5],
        [-0.5, -0.5],
        [0.5, 0.5],
        [0.5, -0.5],
      ] as const).map(([wx, wz], i) => (
        <mesh key={i} position={[wx, 0.15, wz]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.12, 10]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
      {/* headlights (front +x) */}
      {[-0.3, 0.3].map((wz, i) => (
        <mesh key={i} position={[0.77, 0.32, wz]}>
          <boxGeometry args={[0.05, 0.12, 0.18]} />
          <meshStandardMaterial color="#fff" emissive="#fff2c0" emissiveIntensity={3} />
        </mesh>
      ))}
      {/* taillights (back −x) */}
      {[-0.3, 0.3].map((wz, i) => (
        <mesh key={i} position={[-0.77, 0.32, wz]}>
          <boxGeometry args={[0.05, 0.1, 0.15]} />
          <meshStandardMaterial color="#900" emissive="#ff2a2a" emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  );
}

function MotoMesh({ color }: { color: string }) {
  return (
    <group>
      {[-0.32, 0.32].map((wx, i) => (
        <mesh key={i} position={[wx, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.08, 10]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.55, 0.18, 0.18]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* rider */}
      <mesh position={[-0.05, 0.6, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color="#33502f" />
      </mesh>
      <mesh position={[-0.05, 0.84, 0]}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshStandardMaterial color="#cc2222" />
      </mesh>
      {/* headlight */}
      <mesh position={[0.35, 0.34, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#fff" emissive="#fff2c0" emissiveIntensity={3} />
      </mesh>
    </group>
  );
}

function Vendor({ z }: { z: number }) {
  const ref = useRef<THREE.Group>(null);
  const span = 30;
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * 0.7; // slow stroll
    ref.current.position.x = (t % span) - span / 2;
  });
  return (
    <group ref={ref} position={[0, ROAD_Y, z]}>
      {/* gerobak (cart, front +x) */}
      <group position={[0.5, 0, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.9, 0.5, 0.6]} />
          <meshStandardMaterial color="#6b4a2a" roughness={0.85} />
        </mesh>
        {([
          [-0.4, 0.25],
          [-0.4, -0.25],
          [0.4, 0.25],
          [0.4, -0.25],
        ] as const).map(([cx, cz], i) => (
          <mesh key={i} position={[cx, 0.97, cz]}>
            <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
            <meshStandardMaterial color="#3a2414" />
          </mesh>
        ))}
        <mesh position={[0, 1.25, 0]}>
          <boxGeometry args={[1.02, 0.06, 0.72]} />
          <meshStandardMaterial color="#7a2f2f" roughness={0.8} />
        </mesh>
        {/* warm lamp under the canopy */}
        <mesh position={[0, 1.1, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#fff0c0" emissive="#ffb74d" emissiveIntensity={2.6} />
        </mesh>
        <pointLight position={[0, 1.05, 0]} color="#ffb24d" intensity={0.5} distance={3.5} />
        {/* wok */}
        <mesh position={[0, 0.78, 0]} rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* cart wheels */}
        {[0.32, -0.32].map((cz, i) => (
          <mesh key={i} position={[0, 0.18, cz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.06, 12]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        ))}
      </group>
      {/* the abang pushing (behind, −x) */}
      <group position={[-0.55, 0, 0]}>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.16, 0.2, 0.6, 10]} />
          <meshStandardMaterial color="#2e6b4f" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <sphereGeometry args={[0.17, 12, 12]} />
          <meshStandardMaterial color="#caa06a" />
        </mesh>
        {/* peci */}
        <mesh position={[0, 0.99, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.07, 12]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </group>
  );
}
