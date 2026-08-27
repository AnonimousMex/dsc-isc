import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Group } from 'three';

type Point3 = [number, number, number];

const COLS = 5;
const ROWS = 4;
const SPACING = 0.62;

interface Badge {
  base: Point3;
  phase: number;
}

function Badges() {
  const groupRef = useRef<Group>(null);
  const items = useMemo<Badge[]>(() => {
    const list: Badge[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        list.push({
          base: [(c - (COLS - 1) / 2) * SPACING, (r - (ROWS - 1) / 2) * SPACING, (Math.random() - 0.5) * 0.5],
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
    return list;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.15) * 0.3;
    groupRef.current.children.forEach((child, i) => {
      const item = items[i];
      child.position.set(
        item.base[0],
        item.base[1],
        item.base[2] + Math.sin(clock.elapsedTime * 0.6 + item.phase) * 0.18,
      );
    });
  });

  return (
    <group ref={groupRef}>
      {items.map((item, i) => (
        <mesh key={i} position={item.base}>
          <boxGeometry args={[0.34, 0.44, 0.03]} />
          <meshStandardMaterial color="#123821" emissive="#8DC63F" emissiveIntensity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Retícula flotante de placas tipo credencial, cada una con su propio
 * balanceo — representa al cuerpo docente como un colectivo de personas.
 * Acento 3D para Docentes. Se carga con React.lazy.
 */
export default function FacultyGrid() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.7} />
      <pointLight position={[3, 3, 3]} intensity={25} />
      <Badges />
    </Canvas>
  );
}
