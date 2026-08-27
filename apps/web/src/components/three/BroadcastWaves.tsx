import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Mesh, MeshStandardMaterial } from 'three';

const WAVE_COUNT = 5;

function Waves() {
  const meshes = useRef<(Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    meshes.current.forEach((mesh, i) => {
      if (!mesh) return;
      const phase = (t * 0.4 + i / WAVE_COUNT) % 1;
      const scale = 0.3 + phase * 2.4;
      mesh.scale.set(scale, scale, scale);
      (mesh.material as MeshStandardMaterial).opacity = 1 - phase;
    });
  });

  return (
    <>
      {Array.from({ length: WAVE_COUNT }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[1, 0.02, 8, 64]} />
          <meshStandardMaterial color="#8DC63F" emissive="#8DC63F" emissiveIntensity={0.6} transparent opacity={1} />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#F4F6F2" emissive="#8DC63F" emissiveIntensity={0.4} />
      </mesh>
    </>
  );
}

/**
 * Ondas concéntricas expandiéndose desde un punto central, como una señal
 * de transmisión. Acento 3D para Noticias. Se carga con React.lazy.
 */
export default function BroadcastWaves() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 3, 3]} intensity={30} />
      <Waves />
    </Canvas>
  );
}
