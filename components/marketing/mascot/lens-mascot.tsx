"use client";

import { ContactShadows, Environment, Float, Lightformer } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { MathUtils, type Group } from "three";

const LIME = "#d7f36b";

/**
 * The SeenLense mascot: a glossy ink body wearing one big lens. The body turns to follow the pointer anywhere on the
 * page, so it reads as "watching what AI says". The environment is built from local light panels (no HDR download).
 */
function Body({ still }: { still: boolean }) {
  const ref = useRef<Group>(null);
  useFrame((state, delta) => {
    if (!ref.current || still) return;
    const x = MathUtils.clamp(state.pointer.x, -1.5, 1.5);
    const y = MathUtils.clamp(state.pointer.y, -1.5, 1.5);
    ref.current.rotation.y = MathUtils.damp(ref.current.rotation.y, x * 0.45, 4, delta);
    ref.current.rotation.x = MathUtils.damp(ref.current.rotation.x, -y * 0.3, 4, delta);
  });

  return (
    <group ref={ref}>
      {/* body */}
      <mesh castShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial color="#1b1b1b" roughness={0.28} metalness={0.15} clearcoat={1} clearcoatRoughness={0.12} />
      </mesh>

      {/* the lens: metal rim, lime iris, dark pupil, catch-light */}
      <group position={[0, 0.08, 1.0]}>
        <mesh>
          <torusGeometry args={[0.5, 0.09, 32, 96]} />
          <meshStandardMaterial color="#e5e5e5" metalness={1} roughness={0.18} />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <circleGeometry args={[0.44, 64]} />
          <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.35} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <circleGeometry args={[0.19, 48]} />
          <meshStandardMaterial color="#0d0d0d" roughness={0.2} />
        </mesh>
        <mesh position={[0.1, 0.1, 0.06]}>
          <circleGeometry args={[0.065, 32]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* magnifier handle with a lime tip */}
      <group position={[0.78, -0.78, 0.15]} rotation={[0, 0, Math.PI / 4]}>
        <mesh castShadow position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.11, 0.45, 8, 24]} />
          <meshPhysicalMaterial color="#262626" roughness={0.3} clearcoat={1} />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial color={LIME} roughness={0.3} />
        </mesh>
      </group>

      {/* small antenna, so it reads as a character and not an object */}
      <mesh position={[-0.25, 1.02, 0]} rotation={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.025, 0.025, 0.28, 12]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      <mesh position={[-0.29, 1.18, 0]}>
        <sphereGeometry args={[0.07, 24, 24]} />
        <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export default function LensMascot({ still = false }: { still?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.4], fov: 32 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      eventSource={typeof document === "undefined" ? undefined : document.body}
      eventPrefix="client"
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} castShadow />
      <Float enabled={!still} speed={1.6} rotationIntensity={0.25} floatIntensity={0.6} floatingRange={[-0.08, 0.08]}>
        <Body still={still} />
      </Float>
      <ContactShadows position={[0, -1.3, 0]} opacity={0.3} scale={3.2} blur={2.4} far={1.6} />
      <Environment resolution={256}>
        <Lightformer intensity={3} position={[0, 4, 3]} scale={[6, 2, 1]} />
        <Lightformer intensity={1.5} position={[3, 2, 4]} scale={[1.5, 1.5, 1]} />
        <Lightformer intensity={1.2} position={[-4, 0, 2]} scale={[2, 6, 1]} />
        <Lightformer intensity={0.8} color={LIME} position={[4, -1, 2]} scale={[2, 4, 1]} />
      </Environment>
    </Canvas>
  );
}
