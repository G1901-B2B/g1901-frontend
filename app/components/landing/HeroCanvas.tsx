"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import React, { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";

// Deterministic pseudo-random (avoids Math.random during render)
function rand01(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY / scrollHeight;
      setProgress(Math.min(1, Math.max(0, scrolled)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return progress;
}

function RoadmapPath({ scrollProgress }: { scrollProgress: number }) {
  const nodesRef = useRef<THREE.Group>(null);

  const { curve, points } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8, 2, 0),
      new THREE.Vector3(-4, 0, -10),
      new THREE.Vector3(4, -3, -22),
      new THREE.Vector3(-3, -7, -35),
      new THREE.Vector3(5, -11, -50),
      new THREE.Vector3(-2, -16, -65),
      new THREE.Vector3(0, -22, -85),
    ]);
    const points = curve.getPoints(150);
    return { curve, points };
  }, []);

  const linePoints = useMemo(
    () => points.map((p) => [p.x, p.y, p.z] as [number, number, number]),
    [points]
  );

  const nodeData = useMemo(() => {
    return [
      { t: 0.12, color: "#38bdf8", label: "Analyze" },
      { t: 0.3, color: "#a78bfa", label: "Roadmap" },
      { t: 0.5, color: "#10b981", label: "Learn" },
      { t: 0.7, color: "#f59e0b", label: "Practice" },
      { t: 0.88, color: "#ec4899", label: "Master" },
    ].map((node) => ({
      ...node,
      position: curve.getPointAt(node.t),
    }));
  }, [curve]);

  useFrame(() => {
    if (nodesRef.current) {
      nodesRef.current.children.forEach((node, i) => {
        const nodeProgress = nodeData[i].t;
        const isActive = scrollProgress >= nodeProgress - 0.08;
        const isPassed = scrollProgress >= nodeProgress + 0.08;
        const scale = isPassed ? 0.6 : isActive ? 1 : 0.4;
        const targetScale = node.scale.x + (scale - node.scale.x) * 0.1;
        node.scale.setScalar(targetScale);
      });
    }
  });

  return (
    <group>
      {/* The glowing path line */}
      <Line points={linePoints} color="#3b82f6" transparent opacity={0.15} />

      {/* Milestone nodes - smaller */}
      <group ref={nodesRef}>
        {nodeData.map((node, i) => (
          <group key={i} position={node.position}>
            {/* Glow */}
            <mesh>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshBasicMaterial
                color={node.color}
                transparent
                opacity={0.15}
              />
            </mesh>
            {/* Core */}
            <mesh>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial
                color={node.color}
                emissive={node.color}
                emissiveIntensity={0.8}
              />
            </mesh>
          </group>
        ))}
      </group>

      <TrailParticles curve={curve} />
    </group>
  );
}

function TrailParticles({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors, basePositions } = useMemo(() => {
    const count = 300;
    const positions = new Float32Array(count * 3);
    const basePositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const point = curve.getPointAt(t);
      const s = 1000 + i * 13.37;
      const offset = new THREE.Vector3(
        (rand01(s + 1) - 0.5) * 3,
        (rand01(s + 2) - 0.5) * 3,
        (rand01(s + 3) - 0.5) * 3
      );
      basePositions[i * 3] = point.x + offset.x;
      basePositions[i * 3 + 1] = point.y + offset.y;
      basePositions[i * 3 + 2] = point.z + offset.z;

      positions[i * 3] = basePositions[i * 3];
      positions[i * 3 + 1] = basePositions[i * 3 + 1];
      positions[i * 3 + 2] = basePositions[i * 3 + 2];

      const hue = 0.55 + t * 0.2;
      const color = new THREE.Color().setHSL(hue, 0.6, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors, basePositions };
  }, [curve]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const time = clock.getElapsedTime();
      const posAttr = pointsRef.current.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;

      for (let i = 0; i < arr.length / 3; i++) {
        const idx = i * 3;
        arr[idx] = basePositions[idx] + Math.sin(time + i * 0.1) * 0.1;
        arr[idx + 1] = basePositions[idx + 1] + Math.cos(time + i * 0.15) * 0.1;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        transparent
        opacity={0.5}
        vertexColors
        sizeAttenuation
      />
    </points>
  );
}

function AmbientParticles() {
  const points = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 400;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const s = 4000 + i * 9.17;
      positions[i * 3] = (rand01(s + 1) - 0.5) * 60;
      positions[i * 3 + 1] = (rand01(s + 2) - 0.5) * 100 - 30;
      positions[i * 3 + 2] = (rand01(s + 3) - 0.5) * 120 - 40;

      const t = rand01(s + 4);
      colors[i * 3] = 0.2 + t * 0.2;
      colors[i * 3 + 1] = 0.3 + t * 0.3;
      colors[i * 3 + 2] = 0.6 + t * 0.3;
    }

    return { positions, colors };
  }, []);

  useFrame(({ clock }) => {
    if (points.current) {
      points.current.rotation.y = clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        transparent
        opacity={0.3}
        vertexColors
        sizeAttenuation
      />
    </points>
  );
}

function CameraController({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 2, 8));

  useFrame(() => {
    // Camera follows the path as user scrolls - like walking through
    const z = 8 - scrollProgress * 75;
    const y = 2 - scrollProgress * 20;
    const x = Math.sin(scrollProgress * Math.PI * 1.5) * 3;

    targetPosition.current.set(x, y, z);
    camera.position.lerp(targetPosition.current, 0.03);

    // Look slightly ahead on the path
    camera.lookAt(x * 0.5, y - 3, z - 12);
  });

  return null;
}

function Scene({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      <color attach="background" args={["#05060a"]} />
      <fog attach="fog" args={["#05060a", 8, 60]} />

      <ambientLight intensity={0.2} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.5}
        color="#93c5fd"
      />
      <directionalLight
        position={[-10, -5, 5]}
        intensity={0.3}
        color="#c4b5fd"
      />

      <CameraController scrollProgress={scrollProgress} />
      <RoadmapPath scrollProgress={scrollProgress} />
      <AmbientParticles />
    </>
  );
}

export default function HeroCanvas() {
  const scrollProgress = useScrollProgress();

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 2, 8], fov: 55 }}
      >
        <Scene scrollProgress={scrollProgress} />
      </Canvas>

      {/* Very subtle gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.04),transparent_50%)]" />
    </div>
  );
}
