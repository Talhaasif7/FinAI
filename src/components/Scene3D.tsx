import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere, Box, Torus } from "@react-three/drei";
import * as THREE from "three";

function Particles({ count = 500 }) {
  const mesh = useRef<THREE.Points>(null);
  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const teal = new THREE.Color("hsl(174, 72%, 56%)");
    const gold = new THREE.Color("hsl(38, 95%, 65%)");
    const lav = new THREE.Color("hsl(258, 60%, 72%)");
    const white = new THREE.Color("hsl(0, 0%, 90%)");
    const palette = [teal, gold, lav, white, teal, white];
    for (let i = 0; i < count; i++) {
      const r = 8 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
      siz[i] = 0.02 + Math.random() * 0.06;
    }
    return { positions: pos, colors: col, sizes: siz };
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.015;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.05;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function HeroSphere() {
  const mesh = useRef<THREE.Mesh>(null);
  const wireframe = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.1;
      mesh.current.rotation.z = t * 0.05;
      mesh.current.position.y = Math.sin(t * 0.5) * 0.3;
    }
    if (wireframe.current) {
      wireframe.current.rotation.y = -t * 0.08;
      wireframe.current.rotation.x = t * 0.06;
    }
  });

  return (
    <group>
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.6}>
        <mesh ref={mesh}>
          <icosahedronGeometry args={[2.2, 20]} />
          <MeshDistortMaterial
            color="hsl(174, 72%, 35%)"
            emissive="hsl(174, 72%, 25%)"
            emissiveIntensity={0.6}
            roughness={0.15}
            metalness={0.9}
            distort={0.3}
            speed={1.5}
            transparent
            opacity={0.55}
          />
        </mesh>
      </Float>
      {/* Wireframe outer shell */}
      <mesh ref={wireframe}>
        <icosahedronGeometry args={[3.2, 3]} />
        <meshBasicMaterial color="hsl(174, 72%, 50%)" wireframe transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

function OrbitingRing({ radius, speed, tilt, color, thickness = 0.02 }: { radius: number; speed: number; tilt: number; color: string; thickness?: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = tilt;
      ref.current.rotation.y = state.clock.elapsedTime * speed;
    }
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, thickness, 16, 100]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        transparent
        opacity={0.35}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
}

function FloatingCube({ position, size, color, speed }: { position: [number, number, number]; size: number; color: string; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * speed * 0.5;
      ref.current.rotation.y = state.clock.elapsedTime * speed * 0.7;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={ref} position={position}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          transparent
          opacity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

function FloatingDiamond({ position, size, color, speed }: { position: [number, number, number]; size: number; color: string; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * speed;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed * 0.8) * 0.3;
    }
  });

  return (
    <Float speed={speed * 0.8} rotationIntensity={0.6} floatIntensity={0.4}>
      <mesh ref={ref} position={position}>
        <octahedronGeometry args={[size, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.45}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </Float>
  );
}

function GlowLight() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[6, 6, 6]} intensity={1.2} color="hsl(174, 72%, 50%)" distance={20} />
      <pointLight position={[-6, -4, 4]} intensity={0.8} color="hsl(38, 95%, 60%)" distance={18} />
      <pointLight position={[0, 6, -6]} intensity={0.5} color="hsl(258, 60%, 65%)" distance={16} />
      <pointLight position={[0, -6, 2]} intensity={0.3} color="hsl(174, 72%, 40%)" distance={14} />
    </>
  );
}

export function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 55 }}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <GlowLight />
      <HeroSphere />
      <Particles count={600} />

      {/* Orbiting rings */}
      <OrbitingRing radius={3.8} speed={0.15} tilt={0.4} color="hsl(174, 72%, 50%)" thickness={0.025} />
      <OrbitingRing radius={4.5} speed={-0.1} tilt={-0.6} color="hsl(38, 95%, 55%)" thickness={0.018} />
      <OrbitingRing radius={5.2} speed={0.08} tilt={1.2} color="hsl(258, 60%, 62%)" thickness={0.015} />

      {/* Floating shapes */}
      <FloatingCube position={[5, 2, -3]} size={0.4} color="hsl(38, 95%, 55%)" speed={1.2} />
      <FloatingCube position={[-4.5, -2.5, -2]} size={0.3} color="hsl(174, 72%, 50%)" speed={0.9} />
      <FloatingDiamond position={[-5, 2.5, -1]} size={0.35} color="hsl(258, 60%, 62%)" speed={1.1} />
      <FloatingDiamond position={[4, -1.5, -2.5]} size={0.25} color="hsl(174, 72%, 50%)" speed={1.4} />
      <FloatingDiamond position={[0, 4, -4]} size={0.2} color="hsl(38, 95%, 60%)" speed={0.7} />
    </Canvas>
  );
}

export function Scene3DFeatures() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.1} />
      <pointLight position={[3, 3, 3]} intensity={0.8} color="hsl(174, 72%, 50%)" />
      <pointLight position={[-3, -2, 2]} intensity={0.5} color="hsl(258, 60%, 62%)" />
      <Particles count={200} />
      <OrbitingRing radius={3} speed={0.1} tilt={0.5} color="hsl(174, 72%, 50%)" thickness={0.012} />
      <OrbitingRing radius={3.5} speed={-0.07} tilt={-0.8} color="hsl(38, 95%, 55%)" thickness={0.01} />
    </Canvas>
  );
}
