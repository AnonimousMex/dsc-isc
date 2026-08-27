import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Group } from 'three';

const DOC_COUNT = 9;

function Stack() {
  const groupRef = useRef<Group>(null);

  useFrame((_state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.15;
  });

  return (
    <group ref={groupRef} rotation={[0.35, 0, 0]}>
      {Array.from({ length: DOC_COUNT }).map((_, i) => (
        <mesh
          key={i}
          position={[0, i * 0.05 - (DOC_COUNT * 0.05) / 2, 0]}
          rotation={[0, 0, (i % 2 === 0 ? 1 : -1) * 0.035 * i]}
        >
          <boxGeometry args={[1.5, 2, 0.03]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#F4F6F2' : '#DCE8DC'} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Pila de documentos en abanico, girando lentamente — evoca reglamentos y
 * formatos apilados. Acento 3D para Normateca. Se carga con React.lazy.
 */
export default function DocumentStack() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.8} />
      <pointLight position={[3, 4, 3]} intensity={30} />
      <Stack />
    </Canvas>
  );
}
