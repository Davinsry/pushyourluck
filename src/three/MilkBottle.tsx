import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ACTION_ANIM_MS } from "../config/balance";

interface Props {
  full: boolean; // true while the player still has their susu
}

/**
 * A little milk bottle that sits on the table by the active player.
 * Full → white milk fills the body. Empty (already drunk) → clear bottle.
 */
export function MilkBottle({ full }: Props) {
  return (
    <group>
      {/* glass body */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.6, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.28}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* milk fill — only visible when full */}
      {full && (
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.14, 0.16, 0.46, 16]} />
          <meshStandardMaterial color="#fbf6ee" roughness={0.6} />
        </mesh>
      )}

      {/* neck */}
      <mesh position={[0, 0.66, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.14, 12]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} roughness={0.1} />
      </mesh>

      {/* cap */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.08, 12]} />
        <meshStandardMaterial color="#3e7cb1" roughness={0.5} />
      </mesh>
    </group>
  );
}

interface TableMilkBottleProps {
  full: boolean;
  position: { x: number; y: number; z: number } | [number, number, number] | number[];
  rotation: [number, number, number] | number[];
  active: boolean;
  anim?: { kind: string; nonce: number } | null;
}

export function TableMilkBottle({ full, position, rotation, active, anim }: TableMilkBottleProps) {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!ref.current) return;
    let visible = true;
    if (active && anim && anim.kind === "milk") {
      const t = (performance.now() - anim.nonce) / ACTION_ANIM_MS;
      if (t >= 0.4 && t < 0.85) {
        visible = false;
      }
    }
    ref.current.visible = visible;
  });

  const posArray: [number, number, number] = Array.isArray(position)
    ? (position as [number, number, number])
    : [position.x, position.y, position.z];

  return (
    <group ref={ref} position={posArray} rotation={rotation as [number, number, number]}>
      <MilkBottle full={full} />
    </group>
  );
}

