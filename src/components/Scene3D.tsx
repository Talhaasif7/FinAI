import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function Particles({ count = 300 }) {
  const mesh = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, [count]);

  const colors = useMemo(() => {
    const col = new Float32Array(count * 3);
    const teal = new THREE.Color("hsl(174, 72%, 46%)");
    const gold = new THREE.Color("hsl(38, 95%, 55%)");
    const lav = new THREE.Color("hsl(258, 60%, 62%)");
    const palette = [teal, gold, lav];
    for (let i = 0; i < count; i++) {
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return col;
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.03;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function GlowSphere() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.15;
      mesh.current.rotation.z = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={mesh} position={[0, 0, 0]}>
        <icosahedronGeometry args={[2, 16]} />
        <MeshDistortMaterial
          color="hsl(174, 72%, 30%)"
          emissive="hsl(174, 72%, 20%)"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
          distort={0.25}
          speed={2}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

function FloatingRing({ position, color, size = 1 }: { position: [number, number, number]; color: string; size?: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.3;
      mesh.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={mesh} position={position}>
        <torusGeometry args={[size, size * 0.08, 16, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.5} metalness={0.9} roughness={0.1} />
      </mesh>
    </Float>
  );
}

export function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="hsl(174, 72%, 46%)" />
      <pointLight position={[-5, -3, 3]} intensity={0.6} color="hsl(38, 95%, 55%)" />
      <pointLight position={[0, 5, -5]} intensity={0.4} color="hsl(258, 60%, 62%)" />
      
      <GlowSphere />
      <Particles count={400} />
      <FloatingRing position={[3.5, 1.5, -2]} color="hsl(38, 95%, 55%)" size={0.7} />
      <FloatingRing position={[-3, -1, -3]} color="hsl(258, 60%, 62%)" size={0.5} />
      <FloatingRing position={[2, -2.5, -1]} color="hsl(174, 72%, 46%)" size={0.4} />
    </Canvas>
  );
}
