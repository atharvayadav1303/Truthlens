import { Float, MeshDistortMaterial, OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function DataParticles() {
  const pointsRef = useRef(null);
  const positions = useMemo(() => {
    const count = 420;
    const values = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const radius = 2.2 + Math.random() * 2.7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
      values[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      values[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.72;
      values[i * 3 + 2] = radius * Math.cos(phi);
    }

    return values;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.025;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.08;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#22d3ee" size={0.018} transparent opacity={0.72} depthWrite={false} />
    </points>
  );
}

function RotatingRings() {
  const groupRef = useRef(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.22) * 0.18;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.16;
    groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.16) * 0.12;
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.72, 0.012, 12, 160]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.45} />
      </mesh>
      <mesh rotation={[0.9, 0.2, 0.4]}>
        <torusGeometry args={[1.38, 0.01, 12, 160]} />
        <meshBasicMaterial color="#e879f9" transparent opacity={0.38} />
      </mesh>
      <mesh rotation={[0.25, 1.2, -0.65]}>
        <torusGeometry args={[1.1, 0.008, 12, 160]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function GlassCore() {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.32) * 0.22;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.28;
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.1;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.22} floatIntensity={0.42}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.96, 4]} />
        <MeshDistortMaterial
          color="#8b5cf6"
          emissive="#1e1b4b"
          emissiveIntensity={0.55}
          roughness={0.18}
          metalness={0.42}
          transparent
          opacity={0.78}
          distort={0.28}
          speed={1.8}
        />
      </mesh>
    </Float>
  );
}

function SceneRig() {
  useFrame((state) => {
    state.camera.position.x += (state.pointer.x * 0.55 - state.camera.position.x) * 0.035;
    state.camera.position.y += (state.pointer.y * 0.28 - state.camera.position.y) * 0.035;
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function TruthLensScene() {
  return (
    <Canvas
      className="truth-scene"
      camera={{ position: [0, 0, 5.2], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["transparent"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.7} color="#f1f5f9" />
      <pointLight position={[-3, -2, 2]} intensity={3.2} color="#22d3ee" />
      <pointLight position={[2, 2, -2]} intensity={2.4} color="#e879f9" />
      <SceneRig />
      <Stars radius={8} depth={5} count={900} factor={2.2} saturation={0} fade speed={0.35} />
      <DataParticles />
      <RotatingRings />
      <GlassCore />
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </Canvas>
  );
}
