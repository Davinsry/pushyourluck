import * as THREE from "three";
import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
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
  onPick: (bowlIdx: number) => void;
  secretBowls: BiteId[];
}

export function Table({ activeIndex, playerCount, canEat, onPick, secretBowls }: Props) {
  const bowls = bowlPositions(activeIndex, playerCount);

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
      {[0, 1, 2].map((idx) => {
        const secretChili = secretBowls[idx] ?? "ijo";
        return (
          <Bowl
            key={idx}
            position={bowls[idx]}
            hex={BITE_HEX[secretChili] ?? token("leaf")}
            active={canEat}
            onClick={() => canEat && onPick(idx)}
          />
        );
      })}
    </group>
  );
}

function BowlLid() {
  return (
    <group>
      {/* Lid dome */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.33, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#eadfcb" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Handle sphere */}
      <mesh position={[0, 0.38, 0]} castShadow>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#6b4226" roughness={0.3} />
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
          emissiveIntensity={0}
        />
      </mesh>

      {/* Bowl is always covered since there is no peeking */}
      <BowlLid />
    </group>
  );
}

