import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import type { Group } from 'three';

type Point3 = [number, number, number];

const BRANCH_ANGLES = [-0.5, 0, 0.5];

function Tree() {
  const groupRef = useRef<Group>(null);

  useFrame((_state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.15;
  });

  const trunkBase: Point3 = [0, -1.6, 0];
  const trunkTop: Point3 = [0, -0.2, 0];

  return (
    <group ref={groupRef}>
      <Line points={[trunkBase, trunkTop]} color="#8DC63F" lineWidth={2} />
      {BRANCH_ANGLES.map((angle, i) => {
        const end: Point3 = [Math.sin(angle) * 1.5, 1.4, Math.cos(angle) * 0.4];
        return (
          <group key={i}>
            <Line points={[trunkTop, end]} color="#8DC63F" lineWidth={2} />
            <mesh position={end}>
              <sphereGeometry args={[0.14, 16, 16]} />
              <meshStandardMaterial color="#C9F0A0" emissive="#8DC63F" emissiveIntensity={0.6} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/**
 * Tronco que se divide en tres ramas — cada una representa una
 * especialidad del posgrado. Acento 3D para Especialidades. Se carga con
 * React.lazy.
 */
export default function BranchTree() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 3, 3]} intensity={30} />
      <Tree />
    </Canvas>
  );
}
