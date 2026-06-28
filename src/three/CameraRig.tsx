import { useEffect, useRef, type ElementRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { cameraForSeat } from "./seats";

interface Props {
  activeIndex: number;
  playerCount: number;
}

/**
 * Camera you can orbit freely (3rd-person, hand-free), but that still "locks"
 * to the active player like at the start of the game:
 *  - the orbit target always follows the active eater (so you orbit around them);
 *  - on each turn change it re-frames to the across-the-table shot, unless you
 *    are currently dragging the camera.
 */
export function CameraRig({ activeIndex, playerCount }: Props) {
  const { camera } = useThree();
  const controls = useRef<ElementRef<typeof OrbitControls>>(null);
  const dragging = useRef(false);
  const relockUntil = useRef(0);
  const desiredPos = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());

  // Re-lock the framing whenever the active player changes (or on mount).
  useEffect(() => {
    relockUntil.current = performance.now() + 1200;
  }, [activeIndex]);

  useFrame(() => {
    const { pos, target } = cameraForSeat(activeIndex, playerCount);
    desiredTarget.current.set(target.x, target.y, target.z);

    if (controls.current) {
      // target always eases toward the active player (orbit stays centred on them)
      controls.current.target.lerp(desiredTarget.current, 0.06);
      // re-lock the camera position briefly after a turn change, unless the
      // player is actively dragging the view
      if (!dragging.current && performance.now() < relockUntil.current) {
        desiredPos.current.set(pos.x, pos.y, pos.z);
        camera.position.lerp(desiredPos.current, 0.06);
      }
      controls.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.12}
      minDistance={3.5}
      maxDistance={20}
      maxPolarAngle={Math.PI * 0.49}
      onStart={() => (dragging.current = true)}
      onEnd={() => (dragging.current = false)}
    />
  );
}
