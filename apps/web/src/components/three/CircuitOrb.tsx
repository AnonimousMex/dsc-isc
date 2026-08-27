import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import type { Group } from 'three';

type Point3 = [number, number, number];

const NODE_COUNT = 26;
const RADIUS = 1.8;
const CONNECT_DISTANCE = 1.05;

function fibonacciSpherePoints(count: number, radius: number): Point3[] {
  const points: Point3[] = [];
  const offset = 2 / count;
  const increment = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = i * offset - 1 + offset / 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = i * increment;
    points.push([Math.cos(phi) * r * radius, y * radius, Math.sin(phi) * r * radius]);
  }
  return points;
}

function distance(a: Point3, b: Point3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function Network() {
  const groupRef = useRef<Group>(null);
  const points = useMemo(() => fibonacciSpherePoints(NODE_COUNT, RADIUS), []);
  const edges = useMemo(() => {
    const lines: [Point3, Point3][] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        if (distance(points[i], points[j]) < CONNECT_DISTANCE) {
          lines.push([points[i], points[j]]);
        }
      }
    }
    return lines;
  }, [points]);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.12;
    groupRef.current.rotation.x += delta * 0.025;
  });

  return (
    <group ref={groupRef}>
      {points.map((point, i) => (
        <mesh key={i} position={point}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#8DC63F" emissive="#8DC63F" emissiveIntensity={1.4} />
        </mesh>
      ))}
      {edges.map(([a, b], i) => (
        <Line key={i} points={[a, b]} color="#3f6b46" transparent opacity={0.55} lineWidth={1} />
      ))}
    </group>
  );
}

/**
 * Esfera de nodos conectados tipo circuito, decorativa (no informativa —
 * a diferencia de la retícula, aquí las conexiones no representan datos
 * reales). Se usa como acento visual en tramos cinematográficos. Se carga
 * con React.lazy desde la página para no penalizar el resto del sitio con
 * el peso de three.js, igual que LabRack3D.
 */
export default function CircuitOrb() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 3, 3]} intensity={30} />
      <Network />
    </Canvas>
  );
}
