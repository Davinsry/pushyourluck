import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ACTION_ANIM_MS } from "../config/balance";

interface Props {
  heat: number;
  bust: boolean;
  anim?: { kind: string; nonce: number } | null;
}

const SWEAT = 8;
const STEAM = 6;
const FIRE = 16;
const MILK = 10;

/**
 * Cheap particle effects on small fixed pools (no simulation):
 *  - sweat: blue droplets, appear ~heat 20, faster/denser as heat climbs
 *  - steam: rising puffs, appear ~heat 70
 *  - fire : orange burst while `bust` is true
 * Each particle just loops a parametric path; opacity/visibility scale with heat.
 */
export function Particles({ heat, bust, anim }: Props) {
  const sweat = useRef<THREE.Group>(null);
  const steam = useRef<THREE.Group>(null);
  const fire = useRef<THREE.Group>(null);
  const milk = useRef<THREE.Group>(null);

  // per-particle random offsets, stable across renders
  const rnd = useMemo(
    () => ({
      sweat: Array.from({ length: SWEAT }, () => ({ a: Math.random() * Math.PI * 2, p: Math.random(), s: 0.6 + Math.random() * 0.6 })),
      steam: Array.from({ length: STEAM }, () => ({ a: Math.random() * Math.PI * 2, p: Math.random(), r: 0.15 + Math.random() * 0.2 })),
      fire: Array.from({ length: FIRE }, () => ({ a: Math.random() * Math.PI * 2, e: 0.3 + Math.random() * 0.7, p: Math.random() })),
      milk: Array.from({ length: MILK }, () => ({ a: Math.random() * Math.PI * 2, p: Math.random(), s: 0.4 + Math.random() * 0.4 })),
    }),
    []
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const sweatOn = Math.min(1, Math.max(0, (heat - 20) / 50)); // intensity 0..1
    const steamOn = Math.min(1, Math.max(0, (heat - 65) / 35));

    if (sweat.current) {
      sweat.current.visible = sweatOn > 0.02;
      sweat.current.children.forEach((c, i) => {
        const r = rnd.sweat[i];
        const speed = 0.6 + sweatOn * 1.4;
        const phase = (r.p + t * speed) % 1;
        c.position.set(Math.cos(r.a) * 0.5, 0.35 - phase * 0.9, Math.sin(r.a) * 0.5 + 0.1);
        const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
        m.opacity = sweatOn * (1 - phase) * 0.9;
        c.scale.setScalar(r.s * (0.5 + sweatOn * 0.6));
      });
    }

    if (steam.current) {
      steam.current.visible = steamOn > 0.02;
      steam.current.children.forEach((c, i) => {
        const r = rnd.steam[i];
        const phase = (r.p + t * 0.4) % 1;
        c.position.set(Math.cos(r.a) * r.r, 0.6 + phase * 1.1, Math.sin(r.a) * r.r);
        const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
        m.opacity = steamOn * (1 - phase) * 0.5;
        c.scale.setScalar(0.18 + phase * 0.4);
      });
    }

    if (fire.current) {
      fire.current.visible = bust;
      if (bust) {
        fire.current.children.forEach((c, i) => {
          const r = rnd.fire[i];
          const phase = (r.p + t * 1.6) % 1;
          const reach = phase * (0.8 + r.e) * 6.0;
          // shoot forward (+z) and slightly outward from the mouth
          c.position.set(Math.cos(r.a) * reach * 0.35, -0.18 + Math.sin(r.a) * reach * 0.3, 0.5 + reach);
          const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
          m.opacity = (1 - phase);
          c.scale.setScalar(0.35 + phase * 0.5);
        });
      }
    }

    const drinking = anim?.kind === "milk" && (() => {
      const elapsed = (performance.now() - anim.nonce) / ACTION_ANIM_MS;
      return elapsed >= 0.50 && elapsed < 0.75;
    })();

    if (milk.current) {
      milk.current.visible = !!drinking;
      if (drinking) {
        milk.current.children.forEach((c, i) => {
          const r = rnd.milk[i];
          const phase = (r.p + t * 2.2) % 1;
          const splashDist = phase * 0.38;
          // splash outwards and downwards from mouth
          c.position.set(
            Math.cos(r.a) * splashDist * 0.45,
            -0.18 - phase * 0.22,
            0.52 + phase * 0.32
          );
          const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
          m.opacity = 1 - phase;
          c.scale.setScalar(r.s * (0.05 + phase * 0.12));
        });
      }
    }

    void dt;
  });

  return (
    <>
      <group ref={sweat}>
        {Array.from({ length: SWEAT }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#7ec8ff" transparent opacity={0} emissive="#3e7cb1" emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>

      <group ref={steam}>
        {Array.from({ length: STEAM }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0} />
          </mesh>
        ))}
      </group>

      <group ref={fire}>
        {Array.from({ length: FIRE }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.22, 8, 8]} />
            <meshStandardMaterial
              color={i % 2 ? "#f26419" : "#f6a609"}
              emissive={i % 2 ? "#f26419" : "#f6a609"}
              emissiveIntensity={1.4}
              transparent
              opacity={0}
            />
          </mesh>
        ))}
      </group>

      <group ref={milk}>
        {Array.from({ length: MILK }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </>
  );
}
