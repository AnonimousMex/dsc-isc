import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';

const RISERS = 18;

interface Riser {
  angle: number;
  radius: number;
  speed: number;
  offset: number;
}

function Scene() {
  const ring = useRef<Mesh>(null);
  const risers = useRef<Group>(null);
  const items = useMemo<Riser[]>(
    () =>
      Array.from({ length: RISERS }, () => ({
        angle: Math.random() * Math.PI * 2,
        radius: 0.3 + Math.random() * 1.3,
        speed: 0.3 + Math.random() * 0.5,
        offset: Math.random() * 4,
      })),
    [],
  );

  useFrame((state, delta) => {
    if (ring.current) {
      ring.current.rotation.x += delta * 0.2;
      ring.current.rotation.z += delta * 0.1;
    }
    if (risers.current) {
      risers.current.children.forEach((child, i) => {
        const item = items[i];
        const y = (((state.clock.elapsedTime * item.speed + item.offset) % 3) - 1.5) * 1.2;
        child.position.set(Math.cos(item.angle) * item.radius, y, Math.sin(item.angle) * item.radius);
      });
    }
  });

  return (
    <>
      <mesh ref={ring} rotation={[0.5, 0.3, 0]}>
        <torusGeometry args={[1.4, 0.05, 16, 64]} />
        <meshStandardMaterial color="#8DC63F" emissive="#8DC63F" emissiveIntensity={0.5} />
      </mesh>
      <group ref={risers}>
        {items.map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#F4F6F2" emissive="#8DC63F" emissiveIntensity={0.6} />
          </mesh>
        ))}
      </group>
    </>
  );
}

/**
 * Anillo inclinado con partículas ascendiendo a su alrededor, evocando el
 * momento de titulación/egreso. Acento 3D para Egresados. Se carga con
 * React.lazy.
 */
export default function GraduationRing() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 3, 3]} intensity={30} />
      <Scene />
    </Canvas>
  );
}
