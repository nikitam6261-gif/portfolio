'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float, Html, OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

const hotspots = [
  { position: [-1.9, 1.25, 0.1] as [number, number, number], label: 'CAB-01', value: '76 км/ч' },
  { position: [0.2, 1.75, 0.1] as [number, number, number], label: 'REEFER', value: '+2.4°C' },
  { position: [1.75, 1.1, 0.1] as [number, number, number], label: 'CARGO-08', value: '+2.6°C' },
];

function DigitalTruck() {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/free-truck.glb');
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((item) => {
      if (!(item instanceof THREE.Mesh)) return;
      item.castShadow = true;
      item.receiveShadow = true;
      item.material = new THREE.MeshPhysicalMaterial({
        color: '#90edff',
        emissive: '#0d7891',
        emissiveIntensity: 0.16,
        metalness: 0.72,
        roughness: 0.24,
        clearcoat: 0.82,
        transparent: true,
        opacity: 0.9,
      });
    });
    return clone;
  }, [scene]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = -0.7 + Math.sin(clock.elapsedTime * 0.22) * 0.06;
  });

  return (
    <Float speed={1.1} floatIntensity={0.12} rotationIntensity={0.015}>
      <group ref={group} rotation={[0, -0.7, 0]} position={[0, -0.75, 0]} scale={1.45}>
        <primitive object={model} />
        {hotspots.map((spot) => (
          <Html key={spot.label} position={spot.position} center distanceFactor={7} occlude={false}>
            <div className="model-hotspot">
              <i />
              <span><small>{spot.label}</small><b>{spot.value}</b></span>
            </div>
          </Html>
        ))}
      </group>
    </Float>
  );
}

function Scene() {
  const scan = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (scan.current) scan.current.position.z = -3.8 + ((clock.elapsedTime * 1.4) % 7.6);
  });

  return (
    <>
      <fog attach="fog" args={['#050b0f', 7, 20]} />
      <ambientLight intensity={0.45} color="#a6edff" />
      <directionalLight position={[5, 7, 4]} intensity={3.2} color="#e6fbff" castShadow />
      <pointLight position={[-4, 2, -3]} intensity={22} distance={12} color="#2be1ff" />
      <pointLight position={[4, 1, 2]} intensity={12} distance={10} color="#ff805a" />
      <gridHelper args={[18, 26, '#1a788e', '#102d36']} position={[0, -1.08, 0]} />
      <mesh ref={scan} position={[0, 0.7, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[10, 0.025]} />
        <meshBasicMaterial color="#7feaff" transparent opacity={0.9} toneMapped={false} />
      </mesh>
      <DigitalTruck />
      <ContactShadows position={[0, -1.05, 0]} opacity={0.75} scale={10} blur={2.6} far={5} color="#000000" />
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={6}
        maxDistance={12}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate={false}
        target={[0, 0.25, 0]}
      />
    </>
  );
}

export default function TruckScene() {
  return (
    <div className="digital-twin-canvas" aria-label="Интерактивная 3D-модель грузовика">
      <Canvas
        shadows
        dpr={[1, 1.6]}
        camera={{ position: [7.2, 3.5, 7.6], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}><Scene /></Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/models/free-truck.glb');
