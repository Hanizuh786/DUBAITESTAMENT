"use client";

import { PointMaterial, Points } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Points as ThreePoints } from "three";

function Field() {
  const pointsRef = useRef<ThreePoints>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(1200);
    for (let index = 0; index < values.length; index += 1) {
      values[index] = (Math.random() - 0.5) * 8;
    }
    return values;
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.025;
    pointsRef.current.rotation.x += delta * 0.006;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#c8a76a"
        size={0.018}
        sizeAttenuation
        depthWrite={false}
        opacity={0.58}
      />
    </Points>
  );
}

export default function HeroScene() {
  return (
    <div className="scene" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 3] }} dpr={[1, 1.5]}>
        <Field />
      </Canvas>
    </div>
  );
}
