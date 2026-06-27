import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ACTION_ANIM_MS } from "../config/balance";
import type { BiteId } from "../game";
import { Particles } from "./Particles";
import type { ActionAnim } from "./GameScene";

interface Props {
  heat: number; // 0–100, drives the whole reaction
  accent: string; // character colour (headband) — a hex string
  active: boolean; // is this the player whose turn it is?
  bust: boolean; // fire-breathing trigger
  anim: ActionAnim | null; // active player's eat/drink gesture
  char?: string | null; // character type for custom 3D traits
}

const CALM = new THREE.Color("#e8b98c"); // tan skin
const HOT = new THREE.Color("#d7263d"); // chili red
const tmp = new THREE.Color();

/**
 * A stylised "chili-head" eater made entirely from primitives — zero assets,
 * zero rigging. Everything (skin colour, brow angle, mouth, jitter, particles)
 * is driven continuously by `heat`, so the face is also a danger read-out.
 */
export function ChiliHead({ heat, accent, active, bust, anim, char = null }: Props) {
  const group = useRef<THREE.Group>(null);
  const skin = useRef<THREE.MeshStandardMaterial>(null);
  const browL = useRef<THREE.Mesh>(null);
  const browR = useRef<THREE.Mesh>(null);
  const mouth = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    const t = Math.min(1, Math.max(0, heat / 100)); // 0..1
    // Skin reddens past ~40 heat (lerp, never a hard switch).
    if (skin.current) {
      const redness = Math.min(1, Math.max(0, (heat - 30) / 60));
      tmp.copy(CALM).lerp(HOT, redness);
      skin.current.color.lerp(tmp, Math.min(1, dt * 6));
    }
    // Brows knit downward as it gets spicier; Si Rakus always wears an angry slant.
    const angryBase = char === "rakus" ? 0.5 : 0;
    const brow = t * 0.6 + angryBase;
    if (browL.current) browL.current.rotation.z = -brow;
    if (browR.current) browR.current.rotation.z = brow;
    // Mouth opens with heat.
    if (mouth.current) {
      const open = 0.12 + t * 0.5;
      mouth.current.scale.set(1, open, 1);
    }
    // Jitter/tremble at high heat.
    if (group.current) {
      const shake = Math.max(0, heat - 60) / 40; // 0 below 60, →1 toward 100
      const j = shake * 0.04;
      group.current.position.x = j ? (Math.random() - 0.5) * j : 0;
      group.current.position.y = j ? (Math.random() - 0.5) * j : 0;
    }
  });

  return (
    <group ref={group}>
      {/* head */}
      <mesh castShadow>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial ref={skin} color="#e8b98c" roughness={0.8} />
      </mesh>

      {/* green chili stem on top (the "chili-head" motif) */}
      <mesh position={[0, 0.6, 0]} rotation={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.05, 0.09, 0.28, 8]} />
        <meshStandardMaterial color="#4e7410" roughness={0.7} />
      </mesh>

      {/* ── Per-character head topper (replaces the old uniform headband) ── */}
      {/* baja: tough preman spiky black hair */}
      {char === "baja" &&
        [-0.3, -0.12, 0.06, 0.24, 0.36].map((x, i) => (
          <mesh key={i} position={[x, 0.44 - Math.abs(x) * 0.15, -0.04]} rotation={[-0.25, 0, x * 1.1]}>
            <coneGeometry args={[0.1, 0.3, 6]} />
            <meshStandardMaterial color="#15110d" roughness={0.85} />
          </mesh>
        ))}

      {/* rakus: messy brown hair tufts */}
      {char === "rakus" &&
        [[-0.24, 0.45, 0.08], [-0.02, 0.52, 0.0], [0.22, 0.46, 0.06], [-0.1, 0.46, -0.22], [0.12, 0.45, -0.2]].map(
          ([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.17, 8, 8]} />
              <meshStandardMaterial color="#4a2f17" roughness={0.95} />
            </mesh>
          )
        )}

      {/* terawang: mystic turban wrap (accent colour) + jewel */}
      {char === "terawang" && (
        <group>
          <mesh position={[0, 0.33, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.49, 0.13, 10, 24]} />
            <meshStandardMaterial color={accent} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.46, -0.02]}>
            <sphereGeometry args={[0.36, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={accent} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.36, 0.49]}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshStandardMaterial color="#ffd24a" emissive="#aa7a00" emissiveIntensity={0.6} metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      )}

      {/* hemat: neat green beret sitting straight on the crown (accent colour) */}
      {char === "hemat" && (
        <group position={[0, 0.4, 0]}>
          {/* flat-ish beret cap covering the crown */}
          <mesh scale={[1, 0.62, 1]}>
            <sphereGeometry args={[0.5, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={accent} roughness={0.75} />
          </mesh>
          {/* little nub on top */}
          <mesh position={[0, 0.16, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={accent} roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* perisai: defender helmet dome (accent colour); chili stem acts as the crest */}
      {char === "perisai" && (
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.49, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2.05]} />
          <meshStandardMaterial color={accent} metalness={0.6} roughness={0.35} />
        </mesh>
      )}

      {/* pendingin: winter beanie (accent) + white folded brim + pom-pom */}
      {char === "pendingin" && (
        <group>
          <mesh position={[0, 0.36, 0]}>
            <sphereGeometry args={[0.5, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2.1]} />
            <meshStandardMaterial color={accent} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.5, 0.09, 10, 24]} />
            <meshStandardMaterial color="#eef4ff" roughness={0.9} />
          </mesh>
          <mesh position={[0.12, 0.72, 0]}>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshStandardMaterial color="#eef4ff" roughness={1} />
          </mesh>
        </group>
      )}

      {/* eyes */}
      <mesh position={[-0.2, 0.08, 0.48]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#2a1b12" />
      </mesh>
      <mesh position={[0.2, 0.08, 0.48]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#2a1b12" />
      </mesh>

      {/* eyebrows */}
      <mesh ref={browL} position={[-0.2, 0.26, 0.5]}>
        <boxGeometry args={[0.18, 0.04, 0.04]} />
        <meshStandardMaterial color="#3a2718" />
      </mesh>
      <mesh ref={browR} position={[0.2, 0.26, 0.5]}>
        <boxGeometry args={[0.18, 0.04, 0.04]} />
        <meshStandardMaterial color="#3a2718" />
      </mesh>

      {/* mouth */}
      <mesh ref={mouth} position={[0, -0.18, 0.49]}>
        <sphereGeometry args={[char === "rakus" ? 0.24 : 0.16, 16, 12]} />
        <meshStandardMaterial color="#5a1010" />
      </mesh>

      {/* ── Character-specific 3D Visual Accessories ── */}
      {/* baja (Si Lidah Baja): metallic tongue */}
      {char === "baja" && (
        <mesh position={[0, -0.19, 0.58]} rotation={[0.25, 0, 0]}>
          <boxGeometry args={[0.12, 0.02, 0.2]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
        </mesh>
      )}

      {/* baja (Si Lidah Baja): a lit cigarette dangling from the corner of the mouth */}
      {char === "baja" && <Cigarette />}

      {/* terawang (Si Terawang): floating glowing purple crystal ball */}
      {char === "terawang" && (
        <mesh position={[0, 0.62, 0.1]} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#8e5bd0" emissive="#8e5bd0" emissiveIntensity={0.8} roughness={0.1} />
        </mesh>
      )}

      {/* hemat (Si Hemat): round frames/glasses */}
      {char === "hemat" && (
        <group position={[0, 0, 0.08]}>
          {/* Left lens frame */}
          <mesh position={[-0.2, 0.08, 0.48]}>
            <torusGeometry args={[0.13, 0.018, 8, 24]} />
            <meshStandardMaterial color="#6fa315" roughness={0.4} />
          </mesh>
          {/* Right lens frame */}
          <mesh position={[0.2, 0.08, 0.48]}>
            <torusGeometry args={[0.13, 0.018, 8, 24]} />
            <meshStandardMaterial color="#6fa315" roughness={0.4} />
          </mesh>
          {/* Bridge */}
          <mesh position={[0, 0.08, 0.48]}>
            <boxGeometry args={[0.2, 0.015, 0.015]} />
            <meshStandardMaterial color="#6fa315" roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* perisai (Si Perisai): shiny forehead visor plate */}
      {char === "perisai" && (
        <mesh position={[0, 0.2, 0.48]} rotation={[0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.48, 0.08, 0.08]} />
          <meshStandardMaterial color="#f6a609" metalness={0.8} roughness={0.15} />
        </mesh>
      )}

      {/* pendingin (Si Pendingin): ice-blue earmuffs */}
      {char === "pendingin" && (
        <>
          <mesh position={[-0.58, 0.05, 0]} castShadow>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshStandardMaterial color="#88ccff" roughness={0.25} />
          </mesh>
          <mesh position={[0.58, 0.05, 0]} castShadow>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshStandardMaterial color="#88ccff" roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.55, 0.02, 8, 24, Math.PI]} />
            <meshStandardMaterial color="#88ccff" roughness={0.4} />
          </mesh>
        </>
      )}

      {/* sweat / steam / fire / milk splash */}
      <Particles heat={heat} bust={bust} anim={anim} />

      {/* Dynamic fire light glow */}
      {bust && (
        <pointLight
          position={[0, -0.18, 0.65]}
          color="#ff5500"
          distance={5}
          intensity={4.0 + Math.sin(performance.now() * 0.08) * 1.5 + Math.random() * 0.5}
          castShadow
          shadow-mapSize={[256, 256]}
        />
      )}

      {/* eating / drinking hand */}
      <Hand anim={anim} active={active} />

    </group>
  );
}

// ── Chili colour lookup for the carried chili ──
const BITE_HEX: Record<BiteId, string> = {
  ijo: "#6fa315",
  rawit: "#f26419",
  carolina: "#9e1b2c",
};

// Hand keyframes (local space; +z points toward the bowls/camera).
const REST = new THREE.Vector3(0.52, -0.7, 0.42);
const MOUTH = new THREE.Vector3(0, -0.16, 0.56);

// Three separate bowl targets (local space) — left, centre, right.
// The bowls are spread ±0.75 along the local-X perpendicular (see seats.ts
// bowlPositions), so index 0 = left, 1 = centre, 2 = right. The hand must reach
// for the bowl the player actually clicked, NOT the (shuffled) chili inside it.
const BOWL_LEFT   = new THREE.Vector3(-0.65, -0.82, 1.15);  // bowl index 0 (leftmost)
const BOWL_CENTER = new THREE.Vector3( 0.00, -0.82, 1.15);  // bowl index 1 (centre)
const BOWL_RIGHT  = new THREE.Vector3( 0.65, -0.82, 1.15);  // bowl index 2 (rightmost)

const BOWL_BY_INDEX = [BOWL_LEFT, BOWL_CENTER, BOWL_RIGHT];

// Milk glass position (to the side, where the bottle sits on the table).
const GLASS_POS = new THREE.Vector3(1.05, -0.55, 0.5);

const tmpV = new THREE.Vector3();
const ease = (s: number) => s * s * (3 - 2 * s);
const seg = (a: THREE.Vector3, b: THREE.Vector3, s: number) => tmpV.copy(a).lerp(b, ease(Math.min(1, Math.max(0, s))));

/** A small cartoon chili held in the hand during the bite animation. */
function HandChili({ color }: { color: string }) {
  return (
    <group scale={0.7} rotation={[Math.PI / 2.3, 0.5, 0.1]}>
      {/* body */}
      <mesh castShadow>
        <coneGeometry args={[0.045, 0.22, 8]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      {/* shoulder */}
      <mesh position={[0, 0.11, 0]} castShadow>
        <sphereGeometry args={[0.045, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      {/* stem cap */}
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.03, 0.045, 0.02, 8]} />
        <meshStandardMaterial color="#558010" roughness={0.7} />
      </mesh>
    </group>
  );
}

/** A small glass held in the hand during the milk animation. */
function HandGlass({ full }: { full: boolean }) {
  return (
    <group scale={0.55}>
      {/* glass body (transparent) */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.14, 0.11, 0.4, 16, 1, true]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.25}
          roughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* glass bottom */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.11, 16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} roughness={0.1} />
      </mesh>
      {/* milk fill */}
      {full && (
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.12, 0.10, 0.34, 16]} />
          <meshStandardMaterial color="#fbf6ee" roughness={0.6} />
        </mesh>
      )}
    </group>
  );
}

/** A lit cigarette dangling from the corner of Si Lidah Baja's mouth, with a
 *  glowing ember and a few smoke puffs that rise and fade. */
function Cigarette() {
  const puffs = useRef<(THREE.Mesh | null)[]>([]);
  const ember = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const now = performance.now() / 1000;
    // smoke puffs rise from the tip and fade out, looping
    puffs.current.forEach((m, i) => {
      if (!m) return;
      const t = ((now * 0.4 + i / 4) % 1 + 1) % 1; // 0..1
      m.position.y = t * 0.55;
      m.position.x = Math.sin((t + i) * 5) * 0.05;
      m.position.z = Math.cos((t + i) * 4) * 0.02;
      m.scale.setScalar(0.03 + t * 0.09);
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.opacity = Math.sin(t * Math.PI) * 0.4; // fade in then out as it rises
    });
    // ember flicker
    if (ember.current) {
      const mat = ember.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 2.4 + Math.sin(now * 12) * 0.8 + Math.random() * 0.3;
    }
  });

  return (
    <group>
      {/* cigarette stick, tilted out from the mouth corner */}
      <group position={[0.17, -0.2, 0.46]} rotation={[1.32, 0, -0.55]}>
        {/* filter (mouth end) */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.021, 0.021, 0.06, 10]} />
          <meshStandardMaterial color="#c9a35e" roughness={0.7} />
        </mesh>
        {/* paper body */}
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.019, 0.019, 0.2, 10]} />
          <meshStandardMaterial color="#f3efe6" roughness={0.6} />
        </mesh>
        {/* charred tip just before the ember */}
        <mesh position={[0, 0.265, 0]}>
          <cylinderGeometry args={[0.02, 0.018, 0.03, 10]} />
          <meshStandardMaterial color="#2a2018" roughness={0.9} />
        </mesh>
        {/* glowing ember */}
        <mesh ref={ember} position={[0, 0.285, 0]}>
          <cylinderGeometry args={[0.018, 0.021, 0.02, 10]} />
          <meshStandardMaterial color="#ff4d12" emissive="#ff5a1e" emissiveIntensity={2.6} />
        </mesh>
        <pointLight position={[0, 0.3, 0]} color="#ff6a28" intensity={0.3} distance={0.9} />
      </group>

      {/* smoke puffs rising in head-local up (= world up) from near the ember tip */}
      <group position={[0.3, -0.16, 0.62]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} ref={(el) => (puffs.current[i] = el)}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color="#d2d2d2" transparent opacity={0.25} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** A single hand that reaches for the correct chili bowl or picks up a milk glass. */
function Hand({ anim, active }: { anim: ActionAnim | null; active: boolean }) {
  const hand = useRef<THREE.Group>(null);
  const carryGroup = useRef<THREE.Group>(null);
  const [glassFull, setGlassFull] = useState(true);
  const pos = useRef(new THREE.Vector3().copy(REST));

  useFrame(() => {
    if (!hand.current) return;
    let target: THREE.Vector3 = REST;
    let showCarry = false;
    let tiltZ = 0;

    if (anim) {
      const t = Math.min(1, Math.max(0, (performance.now() - anim.nonce) / ACTION_ANIM_MS));
      if (anim.kind === "bite") {
        // Reach for the bowl the player clicked (by index), not the chili inside.
        const bowlTarget =
          (anim.bowlIdx !== undefined ? BOWL_BY_INDEX[anim.bowlIdx] : undefined) ?? BOWL_CENTER;
        if (t < 0.4) {
          target = seg(REST, bowlTarget, t / 0.4);
        } else if (t < 0.65) {
          target = seg(bowlTarget, MOUTH, (t - 0.4) / 0.25);
          showCarry = true;
        } else {
          target = seg(MOUTH, REST, (t - 0.65) / 0.35);
        }
      } else {
        // Milk: reach for the glass, bring to mouth, tilt to drink
        if (t < 0.4) {
          target = seg(REST, GLASS_POS, t / 0.4);
        } else if (t < 0.7) {
          target = seg(GLASS_POS, MOUTH, (t - 0.4) / 0.3);
        } else {
          target = seg(MOUTH, REST, (t - 0.7) / 0.3);
        }

        if (t >= 0.4 && t < 0.85) {
          showCarry = true;
          if (t >= 0.48 && t < 0.75) {
            const progress = Math.sin(((t - 0.48) / 0.27) * Math.PI);
            tiltZ = -progress * 1.3;
          }
          const shouldBeFull = t < 0.62;
          if (glassFull !== shouldBeFull) {
            setGlassFull(shouldBeFull);
          }
        }
      }
    } else {
      if (!glassFull) {
        setGlassFull(true);
      }
    }

    pos.current.lerp(target, 0.45);
    hand.current.position.copy(pos.current);
    hand.current.visible = active;

    if (carryGroup.current) {
      carryGroup.current.visible = showCarry;
      carryGroup.current.rotation.z = tiltZ;
    }
  });

  // Determine what the hand is currently carrying
  const carryChiliColor = anim?.kind === "bite" && anim.bite ? BITE_HEX[anim.bite] : null;

  return (
    <group ref={hand}>
      <mesh castShadow>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color="#e8b98c" roughness={0.85} />
      </mesh>
      <group ref={carryGroup} position={[0, 0.05, 0]}>
        {/* Show either a chili or a glass depending on the animation */}
        {carryChiliColor ? (
          <HandChili color={carryChiliColor} />
        ) : (
          <HandGlass full={glassFull} />
        )}
      </group>
    </group>
  );
}

