import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Group } from 'three';

const COUNT = 40;

interface Particle {
  radius: number;
  speed: number;
  offset: number;
  tilt: number;
  size: number;
}

function Cluster() {
  const groupRef = useRef<Group>(null);
  const items = useMemo<Particle[]>(
    () =>
      Array.from({ length: COUNT }, () => ({
        radius: 0.6 + Math.random() * 1.4,
        speed: 0.1 + Math.random() * 0.25,
        offset: Math.random() * Math.PI * 2,
        tilt: Math.random() * Math.PI,
        size: 0.04 + Math.random() * 0.05,
      })),
    [],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const item = items[i];
      const angle = t * item.speed + item.offset;
      child.position.set(
        Math.cos(angle) * item.radius,
        Math.sin(angle * 0.7 + item.tilt) * item.radius * 0.6,
        Math.sin(angle) * item.radius,
      );
    });
  });

  return (
    <group ref={groupRef}>
      {items.map((item, i) => (
        <mesh key={i}>
          <sphereGeometry args={[item.size, 10, 10]} />
          <meshStandardMaterial color="#8DC63F" emissive="#3f6b46" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Nube orgánica de partículas orbitando sin conexiones fijas, a diferencia
 * del CircuitOrb (red de nodos) — evoca un colectivo en movimiento libre.
 * Acento 3D para Comunidad. Se carga con React.lazy.
 */
export default function CommunityCluster() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 3, 3]} intensity={30} />
      <Cluster />
    </Canvas>
  );
}
