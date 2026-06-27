/**
 * Night-time "pos ronda" (Indonesian neighbourhood guard post / gardu) diorama:
 *  - a raised wooden plank deck the players sit on (lesehan),
 *  - four corner posts holding a hip/thatch roof,
 *  - low bamboo railings on the back and sides,
 *  - a warm hanging "teplok" lantern as the key light,
 *  - dark ground ringed by a silhouette of forest trees, a moon and a few stars.
 * Everything is built from primitives — no external assets.
 */

const TRUNK = "#150f0a";
const LEAF_DARK = "#0d2114";
const LEAF_DARK2 = "#102a18";

// Fixed (deterministic) forest ring so nothing flickers between frames.
const TREES = Array.from({ length: 16 }).map((_, i) => {
  const a = (i / 16) * Math.PI * 2 + (i % 2 ? 0.2 : -0.15);
  const r = 7.5 + ((i * 37) % 9) * 0.7; // 7.5 .. ~13
  const s = 0.85 + ((i * 13) % 7) * 0.12; // scale variety
  return { x: Math.cos(a) * r, z: Math.sin(a) * r, s, tall: 2.6 + ((i * 7) % 5) * 0.5 };
});

const STARS = [
  [-6, 7.5, -9], [4, 8.2, -10], [-2, 9, -11], [7, 7, -8],
  [-8, 8, -7], [1, 9.4, -12], [9, 8.6, -6], [-5, 9.2, -10],
];

export function Room() {
  return (
    <group>
      {/* ── DARK FOREST GROUND ── */}
      <mesh position={[0, -0.27, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0a1410" roughness={1} />
      </mesh>

      {/* ── RAISED WOODEN DECK (panggung lesehan) ── */}
      <group position={[0, 0, 0]}>
        {/* deck base */}
        <mesh position={[0, -0.13, 0]} receiveShadow castShadow>
          <boxGeometry args={[8, 0.26, 8]} />
          <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
        </mesh>
        {/* plank lines on the deck top */}
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={i} position={[-3.6 + i * 0.66, 0.005, 0]} receiveShadow>
            <boxGeometry args={[0.6, 0.02, 7.8]} />
            <meshStandardMaterial color={i % 2 ? "#6b4426" : "#5e3b20"} roughness={0.85} />
          </mesh>
        ))}
      </group>

      {/* ── CORNER POSTS (tiang kayu) ── */}
      {[[-3.5, -3.5], [3.5, -3.5], [-3.5, 3.5], [3.5, 3.5]].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.5, z]} castShadow>
          <boxGeometry args={[0.2, 3.0, 0.2]} />
          <meshStandardMaterial color="#3f2a16" roughness={0.85} />
        </mesh>
      ))}

      {/* ── ROOF (atap joglo/limasan sederhana) ── */}
      <group position={[0, 3.0, 0]}>
        {/* top beams ring */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[7.6, 0.18, 0.2]} />
          <meshStandardMaterial color="#2f2010" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.2, 0.18, 7.6]} />
          <meshStandardMaterial color="#2f2010" roughness={0.85} />
        </mesh>
        {/* hip roof (4-sided pyramid) */}
        <mesh position={[0, 1.0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[5.6, 1.8, 4]} />
          <meshStandardMaterial color="#241405" roughness={0.95} />
        </mesh>
        {/* roof underside (visible from below) */}
        <mesh position={[0, 0.72, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[5.4, 1.5, 4]} />
          <meshStandardMaterial color="#3a2814" roughness={0.95} side={1} />
        </mesh>
      </group>

      {/* ── LOW BAMBOO RAILINGS (back + sides, front left open) ── */}
      {/* back rail (z = -3.5) */}
      <Railing position={[0, 0, -3.5]} length={6.8} horizontal />
      {/* left rail (x = -3.5) */}
      <Railing position={[-3.5, 0, 0]} length={6.8} />
      {/* right rail (x = 3.5) */}
      <Railing position={[3.5, 0, 0]} length={6.8} />

      {/* ── HANGING "TEPLOK" / PETROMAX LANTERN (key light prop) ── */}
      <group position={[0, 2.45, 0]}>
        {/* cord to the roof */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.9, 6]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
        </mesh>
        {/* metal cap */}
        <mesh position={[0, 0.18, 0]} castShadow>
          <coneGeometry args={[0.16, 0.16, 12]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* glass body */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.12, 0.13, 0.26, 16]} />
          <meshStandardMaterial color="#fff2c0" transparent opacity={0.35} roughness={0.1} />
        </mesh>
        {/* glowing flame core */}
        <mesh position={[0, 0.0, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#fff0c0" emissive="#ffb347" emissiveIntensity={3} />
        </mesh>
        {/* base */}
        <mesh position={[0, -0.16, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.1, 0.07, 16]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* soft glow light from the lantern */}
        <pointLight position={[0, 0, 0]} color="#ffb24d" intensity={0.8} distance={6} />
      </group>

      {/* ── MOON ── */}
      <group position={[-9, 9, -13]}>
        <mesh>
          <sphereGeometry args={[1.1, 24, 24]} />
          <meshStandardMaterial color="#e8eefc" emissive="#cdd9f5" emissiveIntensity={1.4} />
        </mesh>
        {/* faint halo */}
        <mesh>
          <sphereGeometry args={[1.5, 20, 20]} />
          <meshStandardMaterial color="#aab8e0" transparent opacity={0.12} />
        </mesh>
      </group>

      {/* ── STARS ── */}
      {STARS.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#dfe7ff" emissiveIntensity={2} />
        </mesh>
      ))}

      {/* ── FOREST TREE SILHOUETTES ── */}
      {TREES.map((tr, i) => (
        <group key={i} position={[tr.x, 0, tr.z]} scale={tr.s}>
          {/* trunk */}
          <mesh position={[0, tr.tall / 2 - 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.24, tr.tall, 7]} />
            <meshStandardMaterial color={TRUNK} roughness={1} />
          </mesh>
          {/* foliage */}
          <mesh position={[0, tr.tall + 0.1, 0]} castShadow>
            <coneGeometry args={[1.2, 1.8, 8]} />
            <meshStandardMaterial color={i % 2 ? LEAF_DARK : LEAF_DARK2} roughness={1} />
          </mesh>
          <mesh position={[0, tr.tall + 0.9, 0]} castShadow>
            <coneGeometry args={[0.9, 1.4, 8]} />
            <meshStandardMaterial color={LEAF_DARK} roughness={1} />
          </mesh>
          <mesh position={[0, tr.tall + 1.6, 0]} castShadow>
            <coneGeometry args={[0.6, 1.1, 8]} />
            <meshStandardMaterial color={LEAF_DARK2} roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** A simple low bamboo railing: two horizontal poles + vertical balusters. */
function Railing({ position, length, horizontal = false }: { position: [number, number, number]; length: number; horizontal?: boolean }) {
  const n = 7;
  const bamboo = "#7a5a2e";
  return (
    <group position={position} rotation={[0, horizontal ? 0 : Math.PI / 2, 0]}>
      {/* top + mid horizontal poles (run along local X) */}
      {[0.62, 0.34].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, length, 8]} />
          <meshStandardMaterial color={bamboo} roughness={0.8} />
        </mesh>
      ))}
      {/* vertical balusters */}
      {Array.from({ length: n }).map((_, i) => {
        const x = -length / 2 + (i / (n - 1)) * length;
        return (
          <mesh key={i} position={[x, 0.31, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.62, 8]} />
            <meshStandardMaterial color={bamboo} roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}
