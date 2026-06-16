/**
 * A beautiful neoclassical wooden dining chair matching the room style.
 * Sits exactly under the player body cylinder.
 */
export function Chair() {
  return (
    <group>
      {/* Seat Cushion (Off-white cream fabric) */}
      <mesh position={[0, -1.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.08, 0.7]} />
        <meshStandardMaterial color="#fafaf9" roughness={0.8} />
      </mesh>

      {/* Seat Wooden Trim Frame */}
      <mesh position={[0, -1.5, 0]} castShadow>
        <boxGeometry args={[0.74, 0.04, 0.74]} />
        <meshStandardMaterial color="#fcfbf7" roughness={0.7} />
      </mesh>

      {/* Chair Legs (4 white legs going down to floor at -2.05) */}
      {/* Front Left Leg */}
      <mesh position={[-0.31, -1.78, 0.31]} castShadow>
        <cylinderGeometry args={[0.035, 0.025, 0.52, 8]} />
        <meshStandardMaterial color="#fcfbf7" roughness={0.7} />
      </mesh>
      {/* Front Right Leg */}
      <mesh position={[0.31, -1.78, 0.31]} castShadow>
        <cylinderGeometry args={[0.035, 0.025, 0.52, 8]} />
        <meshStandardMaterial color="#fcfbf7" roughness={0.7} />
      </mesh>
      {/* Back Left Leg */}
      <mesh position={[-0.31, -1.78, -0.31]} castShadow>
        <cylinderGeometry args={[0.035, 0.025, 0.52, 8]} />
        <meshStandardMaterial color="#fcfbf7" roughness={0.7} />
      </mesh>
      {/* Back Right Leg */}
      <mesh position={[0.31, -1.78, -0.31]} castShadow>
        <cylinderGeometry args={[0.035, 0.025, 0.52, 8]} />
        <meshStandardMaterial color="#fcfbf7" roughness={0.7} />
      </mesh>

      {/* Chair Backrest (At Z = -0.32, behind player body, extending upwards) */}
      {/* Left Back Post */}
      <mesh position={[-0.31, -1.18, -0.31]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
        <meshStandardMaterial color="#fcfbf7" roughness={0.7} />
      </mesh>
      {/* Right Back Post */}
      <mesh position={[0.31, -1.18, -0.31]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
        <meshStandardMaterial color="#fcfbf7" roughness={0.7} />
      </mesh>
      {/* Curved back splat / panel */}
      <mesh position={[0, -0.96, -0.31]} castShadow>
        <boxGeometry args={[0.62, 0.26, 0.04]} />
        <meshStandardMaterial color="#fafaf9" roughness={0.8} />
      </mesh>
      {/* Top rail */}
      <mesh position={[0, -0.82, -0.31]} castShadow>
        <boxGeometry args={[0.68, 0.05, 0.05]} />
        <meshStandardMaterial color="#fcfbf7" roughness={0.7} />
      </mesh>
    </group>
  );
}
