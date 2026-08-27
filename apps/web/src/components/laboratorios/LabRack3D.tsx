import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Group, Mesh, MeshStandardMaterial } from 'three';

interface RackUnitProps {
  position: [number, number, number];
  emissive?: boolean;
}

function RackUnit({ position, emissive = false }: RackUnitProps) {
  const ref = useRef<Mesh>(null);

  useFrame((state) => {
    if (!ref.current || !emissive) return;
    const material = ref.current.material as MeshStandardMaterial;
    material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
  });

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[2, 0.3, 1]} />
      <meshStandardMaterial
        color="#0B1F13"
        emissive={emissive ? '#8DC63F' : '#000000'}
        emissiveIntensity={emissive ? 1 : 0}
      />
    </mesh>
  );
}

function Rack() {
  const groupRef = useRef<Group>(null);
  useFrame((_state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.15;
  });

  return (
    <group ref={groupRef}>
      {[0, 1, 2, 3, 4].map((i) => (
        <RackUnit key={i} position={[0, i * 0.4 - 0.8, 0]} emissive={i === 2} />
      ))}
    </group>
  );
}

/**
 * Rack de servidores en 3D, ligero (sección 10.5, opcional). Se importa
 * con React.lazy desde la página para no penalizar el resto del sitio con
 * el peso de three.js.
 */
export default function LabRack3D() {
  return (
    <Canvas camera={{ position: [3, 1.5, 3], fov: 40 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 3]} intensity={40} />
      <Rack />
    </Canvas>
  );
}
