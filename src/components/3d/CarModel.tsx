"use client";

import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
  useGLTF,
  Html,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

interface CarModelProps {
  modelUrl?: string;
  autoRotate?: boolean;
  showControls?: boolean;
  className?: string;
}

function CarPlaceholder() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Car Body */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.5, 0.6, 1.2]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Car Cabin */}
      <mesh position={[0.1, 0.9, 0]}>
        <boxGeometry args={[1.4, 0.5, 1.1]} />
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0.8}
          roughness={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Hood */}
      <mesh position={[-0.9, 0.55, 0]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.8, 0.3, 1.15]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Front Grille with Cyan Accent */}
      <mesh position={[-1.26, 0.4, 0]}>
        <boxGeometry args={[0.02, 0.3, 0.8]} />
        <meshStandardMaterial
          color="#00D4FF"
          emissive="#00D4FF"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Headlights */}
      <mesh position={[-1.26, 0.5, 0.4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#00D4FF"
          emissive="#00D4FF"
          emissiveIntensity={2}
        />
      </mesh>
      <mesh position={[-1.26, 0.5, -0.4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#00D4FF"
          emissive="#00D4FF"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Taillights */}
      <mesh position={[1.26, 0.45, 0.4]}>
        <boxGeometry args={[0.02, 0.1, 0.2]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={1}
        />
      </mesh>
      <mesh position={[1.26, 0.45, -0.4]}>
        <boxGeometry args={[0.02, 0.1, 0.2]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Wheels */}
      {[
        [-0.8, 0.15, 0.65],
        [-0.8, 0.15, -0.65],
        [0.8, 0.15, 0.65],
        [0.8, 0.15, -0.65],
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.15, 32]} />
            <meshStandardMaterial
              color="#2a2a2a"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.16, 16]} />
            <meshStandardMaterial
              color="#3a3a3a"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function LoadedModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={1}
      position={[0, 0, 0]}
    />
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-[var(--muted-foreground)]">
          Cargando modelo...
        </span>
      </div>
    </Html>
  );
}

export function CarModel({
  modelUrl,
  autoRotate = true,
  showControls = true,
  className = "",
}: CarModelProps) {
  return (
    <div className={`w-full h-full min-h-[300px] ${className}`}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[4, 2, 4]} fov={45} />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <spotLight
          position={[-5, 5, 0]}
          intensity={0.5}
          color="#00D4FF"
          angle={0.5}
        />
        <pointLight position={[0, 3, 0]} intensity={0.3} color="#0095FF" />

        <Suspense fallback={<LoadingFallback />}>
          {modelUrl ? (
            <LoadedModel url={modelUrl} />
          ) : (
            <CarPlaceholder />
          )}

          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.5}
            scale={10}
            blur={2}
            far={4}
            color="#00D4FF"
          />

          <Environment preset="city" />
        </Suspense>

        {showControls && (
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            autoRotate={autoRotate}
            autoRotateSpeed={1}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={3}
            maxDistance={8}
          />
        )}
      </Canvas>
    </div>
  );
}

export function CarModelCompact({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[3, 1.5, 3]} fov={50} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 3, 3]} intensity={0.8} />
        <spotLight position={[-2, 3, 0]} intensity={0.3} color="#00D4FF" />

        <Suspense fallback={<LoadingFallback />}>
          <CarPlaceholder />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={2}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  );
}
