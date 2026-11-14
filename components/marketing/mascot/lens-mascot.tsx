"use client";

import { ContactShadows, Environment, Float, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MathUtils, type Group } from "three";

const LIME = "#d7f36b";

/**
 * The Seenlense mascot: a chunky glossy lime bot with a dark visor, two glowing eyes, a smile, stubby feet and an
 * antenna that ends in a small magnifier lens. It turns and leans toward the pointer anywhere on the page and blinks. The
 * environment is built from local light panels (no HDR download).
 */
function Body({ still }: { still: boolean }) {
  const ref = useRef<Group>(null);
  const eyes = useRef<Group>(null);
  const canvas = useThree((state) => state.gl.domElement);
  // Last pointer position on the page; null until the visitor moves the mouse.
  const pointer = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (still) return;
    const move = (e: PointerEvent) => (pointer.current = { x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [still]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    // Where the pointer is relative to the mascot, scaled by the window so the whole page maps to a natural turn.
    // With no pointer yet it looks slightly up and to the left, toward the headline.
    let yaw = -0.35;
    let pitch = -0.12;
    if (pointer.current && !still) {
      const box = canvas.getBoundingClientRect();
      const dx = (pointer.current.x - (box.left + box.width / 2)) / (window.innerWidth / 2);
      const dy = (pointer.current.y - (box.top + box.height / 2)) / (window.innerHeight / 2);
      yaw = MathUtils.clamp(dx, -1, 1) * 0.7;
      pitch = MathUtils.clamp(dy, -1, 1) * 0.45;
    }
    ref.current.rotation.y = MathUtils.damp(ref.current.rotation.y, yaw, 5, delta);
    ref.current.rotation.x = MathUtils.damp(ref.current.rotation.x, pitch, 5, delta);
    // leans a little toward the pointer as well as turning
    ref.current.position.x = MathUtils.damp(ref.current.position.x, yaw * 0.18, 4, delta);
    ref.current.position.y = MathUtils.damp(ref.current.position.y, -pitch * 0.12, 4, delta);
    // a quick blink every few seconds
    if (eyes.current) eyes.current.scale.y = !still && state.clock.elapsedTime % 4.2 < 0.12 ? 0.1 : 1;
  });

  const ink = <meshPhysicalMaterial color="#141414" roughness={0.18} metalness={0.2} clearcoat={1} clearcoatRoughness={0.05} />;

  return (
    <group ref={ref} rotation={[-0.12, -0.35, 0]}>
      {/* body */}
      <mesh castShadow scale={[1.15, 0.95, 1]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial color="#d7f36b" emissive="#c4e04f" emissiveIntensity={0.18} roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>

      {/* visor with two glowing eyes */}
      <mesh position={[0, 0.08, 0.84]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.6]}>
        <capsuleGeometry args={[0.36, 0.7, 16, 48]} />
        {ink}
      </mesh>
      <group ref={eyes} position={[0, 0.13, 1.07]}>
        {[-0.24, 0.24].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <capsuleGeometry args={[0.085, 0.15, 8, 24]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>
      {/* smile */}
      <mesh position={[0, -0.02, 1.07]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.11, 0.022, 8, 32, Math.PI]} />
        <meshBasicMaterial color="#d7f36b" />
      </mesh>

      {/* stubby feet */}
      {[-0.45, 0.45].map((x) => (
        <mesh key={x} castShadow position={[x, -0.92, 0.15]} scale={[1.35, 0.6, 1.2]}>
          <sphereGeometry args={[0.24, 32, 32]} />
          {ink}
        </mesh>
      ))}

      {/* antenna ending in a little magnifier lens */}
      <mesh position={[0.18, 1.08, -0.05]} rotation={[0, 0, -0.35]}>
        <capsuleGeometry args={[0.05, 0.32, 8, 16]} />
        {ink}
      </mesh>
      <group position={[0.36, 1.4, -0.05]} rotation={[0, 0, -0.35]}>
        <mesh>
          <torusGeometry args={[0.15, 0.045, 16, 48]} />
          {ink}
        </mesh>
        <mesh>
          <circleGeometry args={[0.12, 32]} />
          <meshStandardMaterial color="#d7f36b" emissive="#d7f36b" emissiveIntensity={0.6} side={2} />
        </mesh>
      </group>
    </group>
  );
}

export default function LensMascot({ still = false }: { still?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 6.6], fov: 32 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} castShadow />
      <Float enabled={!still} speed={1.6} rotationIntensity={0.25} floatIntensity={0.6} floatingRange={[-0.08, 0.08]}>
        <Body still={still} />
      </Float>
      <ContactShadows position={[0, -1.12, 0]} opacity={0.35} scale={3.4} blur={2.2} far={1.4} />
      <Environment resolution={256}>
        <Lightformer intensity={3} position={[0, 4, 3]} scale={[6, 2, 1]} />
        <Lightformer intensity={1.5} position={[3, 2, 4]} scale={[1.5, 1.5, 1]} />
        <Lightformer intensity={1.2} position={[-4, 0, 2]} scale={[2, 6, 1]} />
        <Lightformer intensity={0.8} color={LIME} position={[4, -1, 2]} scale={[2, 4, 1]} />
      </Environment>
    </Canvas>
  );
}
