import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

/* ── Floating particles ────────────────────────────────── */
function Particles({ count = 400 }) {
  const mesh = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const green = new THREE.Color("hsl(160, 84%, 48%)");
    const cyan = new THREE.Color("hsl(188, 92%, 52%)");
    const purple = new THREE.Color("hsl(265, 72%, 64%)");
    const white = new THREE.Color("hsl(210, 20%, 80%)");
    const palette = [green, cyan, purple, white, green, cyan];
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.012;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.008) * 0.04;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

/* ── Central glowing orb ───────────────────────────────── */
function GlowOrb() {
  const mesh = useRef<THREE.Mesh>(null);
  const outerShell = useRef<THREE.Mesh>(null);
  const innerGlow = useRef<THREE.Mesh>(null);
  const pulseRing = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.08;
      mesh.current.rotation.z = t * 0.04;
      mesh.current.position.y = Math.sin(t * 0.4) * 0.2;
    }
    if (outerShell.current) {
      outerShell.current.rotation.y = -t * 0.06;
      outerShell.current.rotation.x = t * 0.04;
    }
    if (innerGlow.current) {
      innerGlow.current.rotation.y = t * 0.15;
      const s = 1.8 + Math.sin(t * 0.8) * 0.1;
      innerGlow.current.scale.setScalar(s);
    }
    if (pulseRing.current) {
      const ps = 1 + Math.sin(t * 0.5) * 0.3;
      pulseRing.current.scale.setScalar(ps);
      (pulseRing.current.material as THREE.MeshBasicMaterial).opacity = 0.04 + Math.sin(t * 0.5) * 0.02;
    }
  });

  return (
    <group>
      <Float speed={1} rotationIntensity={0.15} floatIntensity={0.5}>
        <mesh ref={mesh}>
          <icosahedronGeometry args={[2, 24]} />
          <MeshDistortMaterial
            color="hsl(160, 84%, 30%)"
            emissive="hsl(160, 84%, 20%)"
            emissiveIntensity={0.8}
            roughness={0.1}
            metalness={0.95}
            distort={0.25}
            speed={1.2}
            transparent
            opacity={0.5}
          />
        </mesh>
      </Float>

      <mesh ref={innerGlow}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color="hsl(160, 84%, 48%)" transparent opacity={0.04} />
      </mesh>

      {/* Pulse ring */}
      <mesh ref={pulseRing} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4, 0.02, 16, 100]} />
        <meshBasicMaterial color="hsl(160, 84%, 48%)" transparent opacity={0.04} />
      </mesh>

      <mesh ref={outerShell}>
        <icosahedronGeometry args={[3, 2]} />
        <meshBasicMaterial color="hsl(160, 84%, 48%)" wireframe transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

/* ── Orbiting data rings ───────────────────────────────── */
function DataRing({ radius, speed, tilt, color, thickness = 0.018 }: {
  radius: number; speed: number; tilt: number; color: string; thickness?: number;
}) {
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
        emissiveIntensity={0.5}
        transparent
        opacity={0.3}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
}

/* ── Floating geometric shapes ─────────────────────────── */
function FloatingShape({ position, size, color, speed, shape = "octahedron" }: {
  position: [number, number, number]; size: number; color: string; speed: number; shape?: "octahedron" | "box" | "tetrahedron";
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * speed;
      ref.current.rotation.x = state.clock.elapsedTime * speed * 0.6;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed * 0.7) * 0.4;
    }
  });

  const geo = shape === "box"
    ? <boxGeometry args={[size, size, size]} />
    : shape === "tetrahedron"
    ? <tetrahedronGeometry args={[size]} />
    : <octahedronGeometry args={[size]} />;

  return (
    <Float speed={speed * 0.7} rotationIntensity={0.5} floatIntensity={0.4}>
      <mesh ref={ref} position={position}>
        {geo}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </Float>
  );
}

/* ── Orbiting dot trail ────────────────────────────────── */
function OrbitDots({ radius, count = 20, speed = 0.3, color, tilt }: {
  radius: number; count?: number; speed?: number; color: string; tilt: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * speed;
    }
  });

  const dots = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      arr.push([
        Math.cos(angle) * radius,
        Math.sin(angle) * 0.3,
        Math.sin(angle) * radius,
      ]);
    }
    return arr;
  }, [radius, count]);

  return (
    <group ref={ref} rotation={[tilt, 0, 0]}>
      {dots.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.03 + (i / count) * 0.04, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.2 + (i / count) * 0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Energy beam ───────────────────────────────────────── */
function EnergyBeam({ start, end, color }: {
  start: [number, number, number]; end: [number, number, number]; color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.05 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
    }
  });

  const points = useMemo(() => {
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(...end)
    );
    return new THREE.TubeGeometry(curve, 20, 0.008, 8, false);
  }, [start, end]);

  return (
    <mesh ref={ref} geometry={points}>
      <meshBasicMaterial color={color} transparent opacity={0.05} />
    </mesh>
  );
}

/* ── Lighting ──────────────────────────────────────────── */
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.12} />
      <pointLight position={[5, 5, 5]} intensity={1} color="hsl(160, 84%, 48%)" distance={20} />
      <pointLight position={[-5, -3, 3]} intensity={0.6} color="hsl(188, 92%, 52%)" distance={16} />
      <pointLight position={[0, 5, -5]} intensity={0.4} color="hsl(265, 72%, 64%)" distance={16} />
      <pointLight position={[3, -4, 2]} intensity={0.3} color="hsl(38, 92%, 54%)" distance={12} />
    </>
  );
}

/* ── Main Hero 3D Scene ────────────────────────────────── */
export function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 55 }}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <Lighting />
      <GlowOrb />
      <Particles count={600} />

      {/* Data rings */}
      <DataRing radius={3.5} speed={0.12} tilt={0.5} color="hsl(160, 84%, 48%)" thickness={0.022} />
      <DataRing radius={4.2} speed={-0.09} tilt={-0.7} color="hsl(265, 72%, 64%)" thickness={0.016} />
      <DataRing radius={5} speed={0.06} tilt={1.3} color="hsl(38, 92%, 54%)" thickness={0.012} />
      <DataRing radius={5.8} speed={-0.04} tilt={0.2} color="hsl(188, 92%, 52%)" thickness={0.008} />

      {/* Orbiting dots */}
      <OrbitDots radius={4.5} count={24} speed={0.15} color="hsl(160, 84%, 48%)" tilt={0.8} />
      <OrbitDots radius={5.5} count={18} speed={-0.1} color="hsl(265, 72%, 64%)" tilt={-0.4} />

      {/* Energy beams */}
      <EnergyBeam start={[0, 0, 0]} end={[5, 2, -3]} color="hsl(160, 84%, 48%)" />
      <EnergyBeam start={[0, 0, 0]} end={[-4.5, -2, -2]} color="hsl(265, 72%, 64%)" />
      <EnergyBeam start={[0, 0, 0]} end={[-5, 2.5, -1.5]} color="hsl(38, 92%, 54%)" />

      {/* Floating shapes */}
      <FloatingShape position={[5, 2, -3]} size={0.35} color="hsl(38, 92%, 54%)" speed={1} shape="octahedron" />
      <FloatingShape position={[-4.5, -2, -2]} size={0.25} color="hsl(160, 84%, 48%)" speed={0.8} shape="box" />
      <FloatingShape position={[-5, 2.5, -1.5]} size={0.3} color="hsl(265, 72%, 64%)" speed={1.1} shape="tetrahedron" />
      <FloatingShape position={[4, -1.5, -2.5]} size={0.2} color="hsl(188, 92%, 52%)" speed={1.3} shape="octahedron" />
      <FloatingShape position={[0, 4, -4]} size={0.18} color="hsl(38, 92%, 60%)" speed={0.6} shape="tetrahedron" />
      <FloatingShape position={[-2, -3, -3]} size={0.22} color="hsl(160, 84%, 48%)" speed={0.9} shape="box" />
      <FloatingShape position={[6, 0, -4]} size={0.15} color="hsl(328, 72%, 60%)" speed={1.4} shape="tetrahedron" />
      <FloatingShape position={[-6, 0, -3]} size={0.28} color="hsl(188, 92%, 52%)" speed={0.7} shape="octahedron" />
    </Canvas>
  );
}

/* ── Subtle background scene ───────────────────────────── */
export function Scene3DFeatures() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.08} />
      <pointLight position={[3, 3, 3]} intensity={0.6} color="hsl(160, 84%, 48%)" />
      <pointLight position={[-3, -2, 2]} intensity={0.4} color="hsl(265, 72%, 64%)" />
      <Particles count={150} />
      <OrbitDots radius={3} count={16} speed={0.1} color="hsl(160, 84%, 48%)" tilt={0.5} />
      <DataRing radius={3} speed={0.08} tilt={0.5} color="hsl(160, 84%, 48%)" thickness={0.01} />
      <DataRing radius={3.6} speed={-0.05} tilt={-0.8} color="hsl(38, 92%, 54%)" thickness={0.008} />
    </Canvas>
  );
}
