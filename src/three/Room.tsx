/**
 * A beautiful, spacious 3D Neoclassical diorama room surrounding the dining table,
 * matching the user's reference image:
 *  - Golden-oak parquet flooring.
 *  - Off-white wainscoting walls with decorative raised moldings.
 *  - Curved cream designer sofa with a round white coffee table.
 *  - Classic white TV cabinet with a wall-mounted flat-screen TV.
 *  - A large sliding glass patio door in the center back wall with soft white curtains.
 *  - A classic neoclassical paneled entry door with brass hardware.
 *  - A modern industrial black dome pendant light hanging above the dining table.
 */
export function Room() {
  return (
    <group>
      {/* ── FLOOR (Golden-Oak Parquet Planks) ── */}
      <group position={[0, -0.05, 0]} receiveShadow>
        {/* Parquet Floor Base */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[17.0, 0.1, 17.8]} />
          <meshStandardMaterial color="#b45309" roughness={0.95} />
        </mesh>
        {/* Parquet Wood Planks Loop */}
        {Array.from({ length: 26 }).map((_, i) => {
          const x = -8.2 + i * 0.655;
          // Alternate warm oak colors for a realistic plank look
          const plankColor = i % 3 === 0 ? "#ca782d" : i % 3 === 1 ? "#d97706" : "#b45309";
          return (
            <mesh key={i} position={[x, 0.06, 0]} receiveShadow>
              <boxGeometry args={[0.63, 0.02, 17.4]} />
              <meshStandardMaterial color={plankColor} roughness={0.78} metalness={0.05} />
            </mesh>
          );
        })}
      </group>

      {/* ── WALLS (Neoclassical Off-white with Wainscoting) ── */}
      {/* Back Wall */}
      <mesh position={[0, 2.5, -8.6]} castShadow receiveShadow>
        <boxGeometry args={[17.0, 5.0, 0.2]} />
        <meshStandardMaterial color="#f7f6f2" roughness={0.9} />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-8.5, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 5.0, 17.8]} />
        <meshStandardMaterial color="#f2f0eb" roughness={0.9} />
      </mesh>
      {/* Right Wall */}
      <mesh position={[8.5, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 5.0, 17.8]} />
        <meshStandardMaterial color="#f2f0eb" roughness={0.9} />
      </mesh>

      {/* Wainscoting Base Molding (Runs along bottom of all walls) */}
      <mesh position={[0, 0.25, -8.48]}>
        <boxGeometry args={[16.6, 0.5, 0.04]} />
        <meshStandardMaterial color="#fcfbf7" roughness={0.8} />
      </mesh>
      <mesh position={[-8.38, 0.25, 0]}>
        <boxGeometry args={[0.04, 0.5, 17.4]} />
        <meshStandardMaterial color="#fcfbf7" roughness={0.8} />
      </mesh>
      <mesh position={[8.38, 0.25, 0]}>
        <boxGeometry args={[0.04, 0.5, 17.4]} />
        <meshStandardMaterial color="#fcfbf7" roughness={0.8} />
      </mesh>

      {/* Wainscoting Raised Trim Molding (Horizontal chair rail) */}
      <mesh position={[0, 0.9, -8.47]}>
        <boxGeometry args={[16.6, 0.06, 0.06]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </mesh>
      <mesh position={[-8.37, 0.9, 0]}>
        <boxGeometry args={[0.06, 0.06, 17.4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </mesh>
      <mesh position={[8.37, 0.9, 0]}>
        <boxGeometry args={[0.06, 0.06, 17.4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </mesh>

      {/* Raised Rectangular Wainscoting Panels (Neoclassical Wall Molding Frames) */}
      {/* Back Wall Molding Panels */}
      {[-6.0, -3.8, 3.8, 6.0].map((xOffset, idx) => (
        <group key={idx} position={[xOffset, 2.2, -8.48]}>
          {/* Outer Border (thin box framing) */}
          <mesh>
            <boxGeometry args={[1.5, 2.0, 0.02]} />
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          </mesh>
          {/* Inner inset panel */}
          <mesh position={[0, 0, -0.005]}>
            <boxGeometry args={[1.4, 1.9, 0.02]} />
            <meshStandardMaterial color="#f2f0eb" roughness={0.8} />
          </mesh>
        </group>
      ))}
      {/* Left Wall Molding Panels */}
      {[-5.0, -2.0, 1.5, 3.8, 6.0].map((zOffset, idx) => (
        <group key={idx} position={[-8.38, 2.2, zOffset]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <boxGeometry args={[1.4, 2.0, 0.02]} />
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0, -0.005]}>
            <boxGeometry args={[1.3, 1.9, 0.02]} />
            <meshStandardMaterial color="#eceae4" roughness={0.8} />
          </mesh>
        </group>
      ))}
      {/* Right Wall Molding Panels */}
      {[-5.0, -2.0, 1.5, 3.8, 6.0].map((zOffset, idx) => (
        <group key={idx} position={[8.38, 2.2, zOffset]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <boxGeometry args={[1.4, 2.0, 0.02]} />
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0, -0.005]}>
            <boxGeometry args={[1.3, 1.9, 0.02]} />
            <meshStandardMaterial color="#eceae4" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* ── CENTRAL WINDOW/SLIDING GLASS PATIO DOOR (Back Wall) ── */}
      <group position={[0, 2.1, -8.5]}>
        {/* Backdrop (Bright warm sunny garden preview) */}
        <mesh position={[0, 0, -0.08]}>
          <boxGeometry args={[5.2, 3.5, 0.02]} />
          <meshBasicMaterial color="#fdf2e9" />
        </mesh>
        {/* Glass panes */}
        <mesh position={[0, 0, -0.04]}>
          <boxGeometry args={[5.0, 3.4, 0.04]} />
          <meshStandardMaterial color="#dbeafe" transparent opacity={0.3} roughness={0.05} metalness={0.2} />
        </mesh>
        {/* Outer Frame (Black Metal) */}
        <mesh>
          <boxGeometry args={[5.1, 3.5, 0.08]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        {/* Inner frame punch-out (to see background) */}
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[4.9, 3.3, 0.08]} />
          <meshStandardMaterial color="#f7f6f2" roughness={0.9} />
        </mesh>
        {/* Black dividers */}
        {[-1.63, 0, 1.63].map((xO, i) => (
          <mesh key={i} position={[xO, 0, 0.02]}>
            <boxGeometry args={[0.06, 3.3, 0.06]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        ))}
        {/* Curtains (Soft vertical waves) */}
        {/* Left curtains group */}
        <group position={[-2.8, 0, 0.15]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <mesh key={i} position={[i * 0.08 - 0.15, 0, Math.sin(i * 1.5) * 0.04]}>
              <cylinderGeometry args={[0.06, 0.06, 3.4, 8]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.65} roughness={0.9} />
            </mesh>
          ))}
        </group>
        {/* Right curtains group */}
        <group position={[2.8, 0, 0.15]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <mesh key={i} position={[i * 0.08 - 0.15, 0, Math.sin(i * 1.5) * 0.04]}>
              <cylinderGeometry args={[0.06, 0.06, 3.4, 8]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.65} roughness={0.9} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ── NEOCLASSICAL ENTRY DOOR (Back Wall, Right Side) ── */}
      <group position={[5.8, 2.0, -8.5]}>
        {/* White Door Frame */}
        <mesh position={[0, 0, 0.04]} castShadow>
          <boxGeometry args={[1.34, 2.66, 0.1]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </mesh>
        {/* Door Frame Inner cut out */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[1.2, 2.52, 0.1]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
        </mesh>
        {/* Door Panel */}
        <mesh position={[0, -0.04, 0.06]} castShadow>
          <boxGeometry args={[1.18, 2.44, 0.06]} />
          <meshStandardMaterial color="#fafaf9" roughness={0.7} /> {/* Creamy white wood */}
        </mesh>
        {/* Panel Moldings (raised boxes on the door) */}
        {/* Top pane panel */}
        <mesh position={[0, 0.5, 0.095]}>
          <boxGeometry args={[0.8, 0.9, 0.015]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </mesh>
        {/* Bottom pane panel */}
        <mesh position={[0, -0.6, 0.095]}>
          <boxGeometry args={[0.8, 0.9, 0.015]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </mesh>
        {/* Brass Door Handle / Knob */}
        <group position={[-0.45, -0.05, 0.13]}>
          {/* plate */}
          <mesh position={[0, 0, -0.01]}>
            <boxGeometry args={[0.06, 0.22, 0.01]} />
            <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.1} /> {/* brass */}
          </mesh>
          {/* knob */}
          <mesh position={[0, 0.04, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.06, 8]} />
            <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[-0.04, 0.04, 0.06]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* ── DESIGNER CURVED COUCH (Left Side) ── */}
      <group position={[-5.5, 0, -0.2]} rotation={[0, 0.2, 0]}>
        {/* Curved Seat Cushions */}
        {/* Left Segment */}
        <mesh position={[-0.5, 0.24, 0.8]} rotation={[0, -0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.48, 1.2]} />
          <meshStandardMaterial color="#fafaf9" roughness={0.8} /> {/* Off-white cream fabric */}
        </mesh>
        {/* Center Segment */}
        <mesh position={[-0.8, 0.24, -0.3]} rotation={[0, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.48, 1.2]} />
          <meshStandardMaterial color="#fafaf9" roughness={0.8} />
        </mesh>
        {/* Right Segment */}
        <mesh position={[-0.5, 0.24, -1.4]} rotation={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.48, 1.2]} />
          <meshStandardMaterial color="#fafaf9" roughness={0.8} />
        </mesh>

        {/* Curved Backrest */}
        {/* Left backrest */}
        <mesh position={[-1.0, 0.65, 0.8]} rotation={[0, -0.3, 0.02]} castShadow>
          <boxGeometry args={[0.35, 0.8, 1.2]} />
          <meshStandardMaterial color="#f5f5f4" roughness={0.85} />
        </mesh>
        {/* Mid backrest */}
        <mesh position={[-1.3, 0.65, -0.35]} rotation={[0, 0.15, 0.02]} castShadow>
          <boxGeometry args={[0.35, 0.8, 1.4]} />
          <meshStandardMaterial color="#f5f5f4" roughness={0.85} />
        </mesh>
        {/* Right backrest */}
        <mesh position={[-1.0, 0.65, -1.4]} rotation={[0, 0.6, 0.02]} castShadow>
          <boxGeometry args={[0.35, 0.8, 1.2]} />
          <meshStandardMaterial color="#f5f5f4" roughness={0.85} />
        </mesh>

        {/* Accent Round Coffee Table (In front of sofa) */}
        <group position={[1.4, 0.01, -0.2]}>
          {/* Top Panel (White Marble) */}
          <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.62, 0.62, 0.05, 24]} />
            <meshStandardMaterial color="#fafaf9" roughness={0.15} />
          </mesh>
          {/* Legs */}
          {[-0.38, 0, 0.38].map((xVal, idx) => (
            <mesh key={idx} position={[xVal, 0.1, idx === 1 ? 0.38 : -0.22]} castShadow>
              <cylinderGeometry args={[0.07, 0.07, 0.2, 10]} />
              <meshStandardMaterial color="#fafaf9" roughness={0.4} />
            </mesh>
          ))}
          {/* Tiny flower vase on coffee table */}
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.05, 0.04, 0.12, 8]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.38, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
        </group>
      </group>

      {/* ── NEOCLASSICAL WHITE TV CABINET (Right Wall) ── */}
      <group position={[6.3, 0, -0.6]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Credenza Console Body */}
        <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.64, 0.7]} />
          <meshStandardMaterial color="#fafaf9" roughness={0.7} /> {/* Neoclassical cream cabinet */}
        </mesh>
        {/* Moldings on Cabinet Front */}
        {[-1.0, 0, 1.0].map((xVal, idx) => (
          <group key={idx} position={[xVal, 0.32, 0.355]}>
            {/* Drawer outer trim */}
            <mesh>
              <boxGeometry args={[0.8, 0.44, 0.02]} />
              <meshStandardMaterial color="#ffffff" roughness={0.5} />
            </mesh>
            {/* Small brass pull handle */}
            <mesh position={[0, 0, 0.015]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        ))}

        {/* Polished White Countertop */}
        <mesh position={[0, 0.66, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.24, 0.04, 0.74]} />
          <meshStandardMaterial color="#ffffff" roughness={0.15} />
        </mesh>

        {/* Cabinet base molding trim */}
        <mesh position={[0, 0.05, 0.02]} castShadow>
          <boxGeometry args={[3.22, 0.1, 0.72]} />
          <meshStandardMaterial color="#f5f5f4" roughness={0.8} />
        </mesh>

        {/* Wall Mounted Flat Screen TV (Behind cabinet, flush with right wall) */}
        {/* We place it at the same rotation, shifted back in Z-local space (which matches X-world space) */}
        <group position={[0, 1.7, -0.28]}>
          {/* Frame */}
          <mesh castShadow>
            <boxGeometry args={[2.4, 1.35, 0.08]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>
          {/* Display panel showing painting / dark mirror */}
          <mesh position={[0, 0, 0.045]}>
            <boxGeometry args={[2.32, 1.27, 0.01]} />
            <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.3} />
          </mesh>
        </group>

        {/* Decorative items on TV cabinet */}
        {/* Tall flower vase */}
        <group position={[-1.1, 0.68, 0]}>
          <mesh position={[0, 0.24, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.08, 0.48, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.15} />
          </mesh>
          {/* Dry twigs/leaves */}
          {[-0.08, 0, 0.08].map((xVal, i) => (
            <mesh key={i} position={[xVal, 0.6, Math.sin(i * 2) * 0.05]} rotation={[0.2 * (i - 1), 0, 0.1 * (i - 1)]}>
              <cylinderGeometry args={[0.008, 0.008, 0.4, 6]} />
              <meshStandardMaterial color="#a16207" roughness={0.9} />
            </mesh>
          ))}
        </group>
        {/* Stack of decor books */}
        <group position={[1.1, 0.72, 0]}>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.4, 0.06, 0.32]} />
            <meshStandardMaterial color="#0284c7" roughness={0.5} />
          </mesh>
          <mesh position={[0.02, 0.06, -0.02]} castShadow>
            <boxGeometry args={[0.38, 0.06, 0.32]} />
            <meshStandardMaterial color="#b45309" roughness={0.5} />
          </mesh>
          <mesh position={[-0.01, 0.12, 0.01]} castShadow>
            <boxGeometry args={[0.4, 0.06, 0.3]} />
            <meshStandardMaterial color="#15803d" roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* ── MODERN/INDUSTRIAL BLACK DOME PENDANT LIGHT (Hanging from ceiling center) ── */}
      <group position={[0, 3.1, 0]}>
        {/* Ceiling Canopy (tapered cup at the ceiling Y=4.4, which is +1.7 relative to Y=2.7) */}
        <mesh position={[0, 1.62, 0]}>
          <cylinderGeometry args={[0.12, 0.07, 0.16, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>

        {/* Thin Hanging Cord */}
        {/* Spans from Y = 0.16 (top of lamp neck) to Y = 1.54 (bottom of canopy) */}
        {/* Height = 1.38, center position is at Y = 0.85 */}
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 1.38, 8]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
        </mesh>

        {/* Lamp Shade Neck (tapered top collar) */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.09, 0.12, 24]} />
          <meshStandardMaterial color="#222222" roughness={0.6} metalness={0.2} />
        </mesh>

        {/* Outer Dome Shade (Black) */}
        <mesh position={[0, 0.06, 0]} castShadow>
          <sphereGeometry args={[0.42, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1c1c1c" roughness={0.55} metalness={0.1} />
        </mesh>

        {/* Inner Dome Shade (Reflective White) */}
        <mesh position={[0, 0.06, 0]}>
          <sphereGeometry args={[0.415, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.25} metalness={0.1} side={1} />
        </mesh>

        {/* Light Bulb (Recessed inside the dome) */}
        <mesh position={[0, -0.06, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#fffbeb" emissive="#fef08a" emissiveIntensity={2.5} />
        </mesh>

        {/* Warm golden light source */}
        <pointLight position={[0, -0.15, 0]} color="#fef08a" intensity={1.4} distance={10} castShadow shadow-bias={-0.002} />
      </group>

      {/* ── COZY WALL SCONCE LAMPS (Warm Ambient Glow on Walls) ── */}
      {/* Back Left sconce */}
      <group position={[-5.0, 2.6, -8.38]}>
        <mesh>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#eab308" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.12, 0.08]}>
          <cylinderGeometry args={[0.06, 0.06, 0.16, 8]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
        <pointLight position={[0, 0.12, 0.12]} color="#fef08a" intensity={0.5} distance={6} />
      </group>
      {/* Back Right sconce */}
      <group position={[3.2, 2.6, -8.38]}>
        <mesh>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#eab308" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.12, 0.08]}>
          <cylinderGeometry args={[0.06, 0.06, 0.16, 8]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
        <pointLight position={[0, 0.12, 0.12]} color="#fef08a" intensity={0.5} distance={6} />
      </group>

      {/* ── ROOM DECORATIONS (Plants) ── */}
      {/* Corner potted plant near sliding door */}
      <group position={[-3.2, 0, -7.8]}>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.2, 0.14, 0.36, 10]} />
          <meshStandardMaterial color="#fcfbf7" roughness={0.5} />
        </mesh>
        {/* Foliage */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.26, 10, 10]} />
          <meshStandardMaterial color="#166534" roughness={0.7} />
        </mesh>
        <mesh position={[-0.1, 0.7, 0.06]} castShadow>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#15803d" roughness={0.7} />
        </mesh>
      </group>

      {/* ── COZY PVC WOOD CEILING ── */}
      <group position={[0, 4.4, 0]}>
        {/* Main Ceiling Board */}
        <mesh receiveShadow>
          <boxGeometry args={[17.0, 0.1, 17.8]} />
          <meshStandardMaterial color="#593c1d" roughness={0.65} /> {/* warm PVC brown */}
        </mesh>
        {/* PVC Slats / Stripes */}
        {Array.from({ length: 18 }).map((_, i) => {
          const x = -8.0 + i * 0.95;
          return (
            <mesh key={i} position={[x, -0.052, 0]}>
              <boxGeometry args={[0.06, 0.015, 17.6]} />
              <meshStandardMaterial color="#361f0b" roughness={0.7} />
            </mesh>
          );
        })}
      </group>

      {/* ── NEOCLASSICAL FRONT ARCHWAY FRAME (Portal at Z = 8.7) ── */}
      <group position={[0, 0, 8.7]}>
        {/* Left Pillar Frame */}
        <mesh position={[-6.9, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 4.4, 0.2]} />
          <meshStandardMaterial color="#f2f0eb" roughness={0.9} />
        </mesh>
        {/* Left Pillar Baseboard */}
        <mesh position={[-6.9, 0.25, -0.12]}>
          <boxGeometry args={[3.0, 0.5, 0.04]} />
          <meshStandardMaterial color="#fcfbf7" roughness={0.8} />
        </mesh>
        {/* Left Pillar Chair Rail */}
        <mesh position={[-6.9, 0.9, -0.13]}>
          <boxGeometry args={[3.0, 0.06, 0.06]} />
          <meshStandardMaterial color="#ffffff" roughness={0.7} />
        </mesh>
        {/* Left Pillar Molded Panel */}
        <group position={[-6.9, 2.2, -0.12]}>
          <mesh>
            <boxGeometry args={[1.2, 2.0, 0.02]} />
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0, -0.005]}>
            <boxGeometry args={[1.15, 1.9, 0.02]} />
            <meshStandardMaterial color="#eceae4" roughness={0.8} />
          </mesh>
        </group>

        {/* Right Pillar Frame */}
        <mesh position={[6.9, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 4.4, 0.2]} />
          <meshStandardMaterial color="#f2f0eb" roughness={0.9} />
        </mesh>
        {/* Right Pillar Baseboard */}
        <mesh position={[6.9, 0.25, -0.12]}>
          <boxGeometry args={[3.0, 0.5, 0.04]} />
          <meshStandardMaterial color="#fcfbf7" roughness={0.8} />
        </mesh>
        {/* Right Pillar Chair Rail */}
        <mesh position={[6.9, 0.9, -0.13]}>
          <boxGeometry args={[3.0, 0.06, 0.06]} />
          <meshStandardMaterial color="#ffffff" roughness={0.7} />
        </mesh>
        {/* Right Pillar Molded Panel */}
        <group position={[6.9, 2.2, -0.12]}>
          <mesh>
            <boxGeometry args={[1.2, 2.0, 0.02]} />
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0, -0.005]}>
            <boxGeometry args={[1.15, 1.9, 0.02]} />
            <meshStandardMaterial color="#eceae4" roughness={0.8} />
          </mesh>
        </group>

        {/* Top Connecting Arch/Lintel Beam */}
        <mesh position={[0, 4.1, 0]} castShadow>
          <boxGeometry args={[17.0, 0.6, 0.2]} />
          <meshStandardMaterial color="#f2f0eb" roughness={0.9} />
        </mesh>
        {/* Top Arch Molding Trim */}
        <mesh position={[0, 3.75, -0.12]}>
          <boxGeometry args={[17.0, 0.06, 0.04]} />
          <meshStandardMaterial color="#ffffff" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}
