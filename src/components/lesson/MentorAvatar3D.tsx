"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { Suspense, useRef } from "react";
import type { Group } from "three";
import * as THREE from "three";

export type MentorVisualState = "idle" | "thinking" | "speaking";

function MentorFigure({ state }: { state: MentorVisualState }) {
  const group = useRef<Group>(null);
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const t = performance.now() / 1000;
    const bobAmp = state === "thinking" ? 0.06 : state === "speaking" ? 0.1 : 0.025;
    g.position.y = Math.sin(t * 2.2) * bobAmp;
    const sway = state === "speaking" ? 0.12 : state === "thinking" ? 0.08 : 0.04;
    g.rotation.y = Math.sin(t * 0.9) * sway;
  });

  const emBody = state === "speaking" ? 0.28 : state === "thinking" ? 0.18 : 0.1;
  const emVisor = state === "speaking" ? 0.55 : state === "thinking" ? 0.35 : 0.12;

  return (
    <group ref={group} dispose={null}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.32, 0.55, 6, 12]} />
        <meshStandardMaterial
          color="#1e2d4f"
          metalness={0.45}
          roughness={0.42}
          emissive="#456dff"
          emissiveIntensity={emBody}
        />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.36, 28, 28]} />
        <meshStandardMaterial
          color="#dbeafe"
          metalness={0.25}
          roughness={0.38}
          emissive="#88c9f7"
          emissiveIntensity={state === "thinking" ? 0.35 : 0.14}
        />
      </mesh>
      <mesh position={[0, 1.02, 0.26]} castShadow>
        <boxGeometry args={[0.52, 0.16, 0.1]} />
        <meshStandardMaterial color="#0a0f18" metalness={0.6} roughness={0.25} emissive="#f7c325" emissiveIntensity={emVisor} />
      </mesh>
      <mesh position={[0, 1.45, 0]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.06, 0.22, 8]} />
        <meshStandardMaterial color="#f7c325" emissive="#f7c325" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

export function MentorAvatar3D({ state }: { state: MentorVisualState }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      shadows
      camera={{ position: [0, 1.05, 3.8], fov: 38, near: 0.1, far: 20 }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color(0x000000), 0);
      }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight castShadow position={[3.5, 6, 4]} intensity={1.05} shadow-mapSize-width={512} shadow-mapSize-height={512} />
      <Suspense fallback={null}>
        <Environment preset="city" />
        <Float
          speed={state === "thinking" ? 2.2 : 1.4}
          rotationIntensity={state === "speaking" ? 0.35 : 0.15}
          floatIntensity={state === "thinking" ? 0.9 : state === "speaking" ? 0.55 : 0.35}
        >
          <MentorFigure state={state} />
        </Float>
      </Suspense>
    </Canvas>
  );
}
