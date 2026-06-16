import * as THREE from "three";
import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BITES } from "../config/balance";
import type { BiteId } from "../game";
import { color as token } from "../ui/theme";
import { bowlPositions, TABLE_RADIUS, TABLE_TOP_Y } from "./seats";

// Resolve our palette tokens to concrete hex for three materials.
const BITE_HEX: Record<BiteId, string> = {
  ijo: "#6fa315",
  rawit: "#f26419",
  carolina: "#9e1b2c",
};

interface Props {
  activeIndex: number;
  playerCount: number;
  canEat: boolean;
  onPick: (bite: BiteId) => void;
}

export function Table({ activeIndex, playerCount, canEat, onPick }: Props) {
  const bowls = bowlPositions(activeIndex, playerCount);
  const bites = Object.keys(BITES) as BiteId[];

  return (
    <group>
      {/* table top */}
      <mesh position={[0, TABLE_TOP_Y, 0]} receiveShadow>
        <cylinderGeometry args={[TABLE_RADIUS, TABLE_RADIUS, 0.3, 48]} />
        <meshStandardMaterial color="#8a5a3c" roughness={0.85} />
      </mesh>
      {/* table rim */}
      <mesh position={[0, TABLE_TOP_Y + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[TABLE_RADIUS, 0.1, 12, 48]} />
        <meshStandardMaterial color="#6b4226" roughness={0.7} />
      </mesh>
      {/* pedestal */}
      <mesh position={[0, TABLE_TOP_Y / 2, 0]}>
        <cylinderGeometry args={[0.5, 0.8, TABLE_TOP_Y, 16]} />
        <meshStandardMaterial color="#6b4226" roughness={0.8} />
      </mesh>

      {/* the 3 chili bowls in front of the active player */}
      {bites.map((id, i) => (
        <Bowl key={id} position={bowls[i]} hex={BITE_HEX[id] ?? token(BITES[id].colorKey)} active={canEat} onClick={() => canEat && onPick(id)} />
      ))}
    </group>
  );
}

function CartoonChili({ color }: { color: string }) {
  return (
    <group scale={1.15}>
      {/* Chili Body (Pointed bottom) */}
      <mesh position={[0, -0.04, 0]} castShadow>
        <coneGeometry args={[0.045, 0.22, 8]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
      </mesh>
      {/* Chili Base/Shoulder (Rounded top) */}
      <mesh position={[0, 0.07, 0]} castShadow>
        <sphereGeometry args={[0.045, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      {/* Green Stem Cap */}
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.03, 0.045, 0.02, 8]} />
        <meshStandardMaterial color="#558010" roughness={0.7} />
      </mesh>
      {/* Green Stem Tail */}
      <mesh position={[0.018, 0.13, 0]} rotation={[0, 0, -0.45]}>
        <cylinderGeometry args={[0.01, 0.01, 0.07, 6]} />
        <meshStandardMaterial color="#558010" roughness={0.7} />
      </mesh>
    </group>
  );
}

interface BowlProps {
  position: { x: number; y: number; z: number };
  hex: string;
  active: boolean;
  onClick: () => void;
}

function Bowl({ position, hex, active, onClick }: BowlProps) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const targetY = hovered && active ? 0.08 : 0;
    const targetScale = hovered && active ? 1.06 : 1.0;
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, position.y + targetY, Math.min(1, dt * 12));
    const nextScale = THREE.MathUtils.lerp(ref.current.scale.x, targetScale, Math.min(1, dt * 12));
    ref.current.scale.setScalar(nextScale);
  });

  return (
    <group
      ref={ref}
      position={[position.x, position.y, position.z]}
      onClick={(e) => {
        e.stopPropagation();
        if (active) onClick();
      }}
      onPointerOver={(e) => {
        if (active) {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      {/* Ceramic Bowl Base Ring */}
      <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
        <meshStandardMaterial color="#eadfcb" roughness={0.8} />
      </mesh>

      {/* Ceramic Bowl Body */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.32, 20, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#fdf6ec" roughness={0.45} side={THREE.DoubleSide} />
      </mesh>

      {/* Inside bowl bottom surface to prevent table clipping */}
      <mesh position={[0, -0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.29, 24]} />
        <meshStandardMaterial color="#fdf6ec" roughness={0.45} />
      </mesh>

      {/* Ceramic Bowl Lip Rim */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.32, 0.022, 8, 36]} />
        <meshStandardMaterial
          color="#eadfcb"
          roughness={0.4}
          emissive={hex}
          emissiveIntensity={hovered && active ? 0.55 : 0}
        />
      </mesh>

      {/* Pile of 4 Cartoon Chilis */}
      <group position={[0, 0.02, 0]}>
        {/* Chili 1 */}
        <group position={[-0.08, -0.06, 0.04]} rotation={[Math.PI / 2.3, 0.5, 0.1]}>
          <CartoonChili color={hex} />
        </group>
        {/* Chili 2 */}
        <group position={[0.08, -0.06, -0.04]} rotation={[Math.PI / 2.1, -0.6, -1.0]}>
          <CartoonChili color={hex} />
        </group>
        {/* Chili 3 */}
        <group position={[-0.02, -0.05, -0.08]} rotation={[Math.PI / 2.4, 0.1, 1.4]}>
          <CartoonChili color={hex} />
        </group>
        {/* Chili 4 */}
        <group position={[0, 0.01, 0]} rotation={[Math.PI / 3.2, 1.1, 0.3]}>
          <CartoonChili color={hex} />
        </group>
      </group>
    </group>
  );
}
