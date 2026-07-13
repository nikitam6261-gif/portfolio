'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Suspense, useMemo, useRef } from 'react';

function Wheel({ position }: { position: [number, number, number] }) {
  const wheel = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (wheel.current) wheel.current.rotation.x -= delta * 5.5;
  });
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh ref={wheel} castShadow>
        <cylinderGeometry args={[0.56, 0.56, 0.34, 24]} />
        <meshStandardMaterial color="#090b0d" roughness={0.78} metalness={0.25} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.25, 0.25, 0.36, 20]} />
        <meshStandardMaterial color="#85909a" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Truck() {
  const truck = useRef<THREE.Group>(null);
  const wheelPositions: [number, number, number][] = [
    [-1.25, -0.62, -3.0], [1.25, -0.62, -3.0],
    [-1.25, -0.62, 1.8], [1.25, -0.62, 1.8],
    [-1.25, -0.62, 3.5], [1.25, -0.62, 3.5],
  ];

  useFrame(({ clock, camera }) => {
    if (!truck.current || typeof window === 'undefined') return;
    const p = Math.min(1, window.scrollY / (window.innerHeight * 3.35));
    truck.current.rotation.y = -0.28 + p * 0.43;
    truck.current.position.x = Math.sin(p * Math.PI * 1.2) * 0.75;
    truck.current.position.y = Math.sin(clock.elapsedTime * 2.5) * 0.018;
    truck.current.position.z = p * 1.8;
    camera.position.x = 8.5 - p * 4.8;
    camera.position.y = 3.3 + p * 1.2;
    camera.position.z = 10.2 - p * 2.6;
    camera.lookAt(0, 0.4, 0.2);
  });

  return (
    <group ref={truck} scale={0.88}>
      <RoundedBox args={[2.5, 2.55, 2.65]} radius={0.25} smoothness={4} position={[0, 0.63, -3.2]} castShadow>
        <meshPhysicalMaterial color="#e8edf0" metalness={0.62} roughness={0.25} clearcoat={1} />
      </RoundedBox>
      <mesh position={[0, 1.15, -4.55]} rotation={[-0.08, 0, 0]} castShadow>
        <boxGeometry args={[2.22, 0.88, 0.06]} />
        <meshPhysicalMaterial color="#101b22" metalness={0.7} roughness={0.08} transmission={0.12} />
      </mesh>
      <mesh position={[0, 0.15, -4.58]}>
        <boxGeometry args={[2.25, 0.38, 0.1]} />
        <meshStandardMaterial color="#101419" metalness={0.8} roughness={0.22} />
      </mesh>
      <mesh position={[0, -0.08, -4.65]}>
        <boxGeometry args={[2.48, 0.22, 0.12]} />
        <meshStandardMaterial color="#7f8b92" metalness={0.95} roughness={0.16} />
      </mesh>
      <mesh position={[0, 0.2, -4.72]}>
        <boxGeometry args={[0.72, 0.16, 0.05]} />
        <meshStandardMaterial color="#0c1216" />
      </mesh>
      <mesh position={[-0.84, 0.36, -4.69]}>
        <boxGeometry args={[0.5, 0.22, 0.07]} />
        <meshStandardMaterial color="#dffaff" emissive="#b5f5ff" emissiveIntensity={5} />
      </mesh>
      <mesh position={[0.84, 0.36, -4.69]}>
        <boxGeometry args={[0.5, 0.22, 0.07]} />
        <meshStandardMaterial color="#dffaff" emissive="#b5f5ff" emissiveIntensity={5} />
      </mesh>
      <spotLight position={[-0.85, 0.4, -4.7]} target-position={[-0.85, -0.2, -14]} intensity={48} angle={0.3} penumbra={0.75} color="#b8efff" distance={22} />
      <spotLight position={[0.85, 0.4, -4.7]} target-position={[0.85, -0.2, -14]} intensity={48} angle={0.3} penumbra={0.75} color="#b8efff" distance={22} />
      <RoundedBox args={[2.68, 2.95, 6.2]} radius={0.17} smoothness={3} position={[0, 0.85, 1.05]} castShadow>
        <meshPhysicalMaterial color="#cbd3d7" metalness={0.55} roughness={0.29} clearcoat={0.7} />
      </RoundedBox>
      <mesh position={[0, 0.8, -2.08]}>
        <boxGeometry args={[2.5, 2.1, 0.12]} />
        <meshStandardMaterial color="#dbe1e3" metalness={0.45} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.98, 4.19]}>
        <boxGeometry args={[2.38, 2.4, 0.06]} />
        <meshStandardMaterial color="#bec7cb" metalness={0.65} roughness={0.28} />
      </mesh>
      <mesh position={[-1.352, 0.95, 0.9]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.6, 0.95]} />
        <meshBasicMaterial color="#10202a" />
      </mesh>
      <mesh position={[-1.36, 0.95, 0.88]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.9, 0.48]} />
        <meshBasicMaterial color="#7eeaff" />
      </mesh>
      <mesh position={[-1.37, 0.96, 0.86]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.75, 0.19]} />
        <meshBasicMaterial color="#071014" />
      </mesh>
      {wheelPositions.map((position, i) => <Wheel key={i} position={position} />)}
    </group>
  );
}

function World() {
  const road = useRef<THREE.Group>(null);
  const stars = useMemo(() => Array.from({ length: 70 }, (_, i) => ({
    x: Math.sin(i * 45.7) * 25,
    y: 1 + ((i * 1.97) % 11),
    z: -38 + ((i * 3.71) % 65),
    s: 0.015 + (i % 4) * 0.009,
  })), []);

  useFrame(({ clock }) => {
    if (road.current) road.current.position.z = (clock.elapsedTime * 9) % 8;
  });

  return (
    <>
      <fog attach="fog" args={['#03070a', 10, 48]} />
      <ambientLight intensity={0.34} color="#b8e8ff" />
      <directionalLight position={[7, 10, 2]} intensity={2.8} color="#dff8ff" castShadow />
      <pointLight position={[-7, 2, -5]} intensity={30} distance={22} color="#21d7ff" />
      <pointLight position={[7, 4, 4]} intensity={18} distance={20} color="#ff7a45" />
      <group ref={road}>
        <mesh position={[0, -1.15, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[18, 90]} />
          <meshStandardMaterial color="#070b0e" roughness={0.88} metalness={0.2} />
        </mesh>
        {Array.from({ length: 13 }, (_, i) => (
          <mesh key={i} position={[0, -1.12, -42 + i * 8]}>
            <boxGeometry args={[0.11, 0.025, 3.8]} />
            <meshBasicMaterial color="#b7d6dc" toneMapped={false} />
          </mesh>
        ))}
        <mesh position={[-4.7, -1.1, 0]}><boxGeometry args={[0.08, 0.025, 90]} /><meshBasicMaterial color="#2f6877" /></mesh>
        <mesh position={[4.7, -1.1, 0]}><boxGeometry args={[0.08, 0.025, 90]} /><meshBasicMaterial color="#2f6877" /></mesh>
      </group>
      {stars.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.s, 6, 6]} />
          <meshBasicMaterial color={i % 5 === 0 ? '#76eaff' : '#d9f7ff'} transparent opacity={0.5} />
        </mesh>
      ))}
      <Float speed={1.2} rotationIntensity={0.03} floatIntensity={0.08}><Truck /></Float>
      <Environment preset="night" />
    </>
  );
}

export default function TruckScene() {
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (
    <div className="truck-canvas" aria-hidden="true">
      <Canvas shadows dpr={[1, 1.65]} camera={{ position: [8.5, 3.3, 10.2], fov: 38 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} frameloop={reduced ? 'demand' : 'always'}>
        <Suspense fallback={null}><World /></Suspense>
      </Canvas>
    </div>
  );
}
