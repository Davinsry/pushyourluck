import { HEAD_Y } from "./seats";

/**
 * Lesehan seating: a woven floor mat (tikar) with a small sitting cushion,
 * replacing the old dining chair. Rendered inside the per-seat group whose
 * origin sits at world y = HEAD_Y, so the floor is at local y = -HEAD_Y.
 */
export function Chair() {
  const floor = -HEAD_Y; // world floor (y=0) in seat-local space

  return (
    <group>
      {/* Woven mat (tikar) laid on the floor */}
      <mesh position={[0, floor + 0.02, 0.05]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.25, 1.15]} />
        <meshStandardMaterial color="#c79a5b" roughness={0.95} />
      </mesh>
      {/* Mat border trim */}
      <mesh position={[0, floor + 0.025, 0.05]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[0.56, 0.62, 4]} />
        <meshStandardMaterial color="#8a5a2b" roughness={0.9} />
      </mesh>

      {/* Woven stripe detail on the mat */}
      {[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
        <mesh key={i} position={[x, floor + 0.03, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.04, 1.05]} />
          <meshStandardMaterial color="#b07f3f" roughness={0.95} />
        </mesh>
      ))}

      {/* Small sitting cushion (bantal duduk) under the player */}
      <mesh position={[0, floor + 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.12, 0.55]} />
        <meshStandardMaterial color="#7a2f2f" roughness={0.85} />
      </mesh>
      <mesh position={[0, floor + 0.14, 0]}>
        <boxGeometry args={[0.5, 0.04, 0.44]} />
        <meshStandardMaterial color="#9a3b3b" roughness={0.8} />
      </mesh>
    </group>
  );
}
