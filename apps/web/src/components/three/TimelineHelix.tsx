import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import type { Group } from 'three';

type Point3 = [number, number, number];

const POINTS = 24;
const HEIGHT = 3.6;
const RADIUS = 1.1;

function helixPoint(i: number, strand: number): Point3 {
  const t = i / (POINTS - 1);
  const angle = t * Math.PI * 5 + strand * Math.PI;
  const y = (t - 0.5) * HEIGHT;
  return [Math.cos(angle) * RADIUS, y, Math.sin(angle) * RADIUS];
}

function Helix() {
  const groupRef = useRef<Group>(null);
  const strandA = useMemo(() => Array.from({ length: POINTS }, (_, i) => helixPoint(i, 0)), []);
  const strandB = useMemo(() => Array.from({ length: POINTS }, (_, i) => helixPoint(i, 1)), []);
  const rungs = useMemo(() => {
    const lines: [Point3, Point3][] = [];
    for (let i = 0; i < POINTS; i += 3) {
      lines.push([strandA[i], strandB[i]]);
    }
    return lines;
  }, [strandA, strandB]);

  useFrame((_state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.18;
  });

  return (
    <group ref={groupRef}>
      <Line points={strandA} color="#8DC63F" lineWidth={1.5} />
      <Line points={strandB} color="#8DC63F" lineWidth={1.5} />
      {rungs.map((rung, i) => (
        <Line key={i} points={rung} color="#3f6b46" transparent opacity={0.7} lineWidth={1} />
      ))}
      {[...strandA, ...strandB].map((point, i) => (
        <mesh key={i} position={point}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color="#C9F0A0" emissive="#8DC63F" emissiveIntensity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Doble hélice ascendente que evoca evolución/continuidad en el tiempo.
 * Acento 3D para Nosotros (historia y valores). Se carga con React.lazy.
 */
export default function TimelineHelix() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 3, 3]} intensity={30} />
      <Helix />
    </Canvas>
  );
}
