import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Stars, Environment } from '@react-three/drei';

function AnimatedSphere() {
  const sphereRef = useRef();

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <Sphere ref={sphereRef} args={[1, 64, 64]} scale={1.5}>
        <MeshDistortMaterial
          color="#0d9488" // Teal color to match elite-clinic theme
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </Sphere>
    </Float>
  );
}

function AnimatedSphereSecondary() {
  const sphereRef = useRef();

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={1.5}>
      <Sphere ref={sphereRef} args={[0.6, 64, 64]} position={[3, -2, -2]}>
        <MeshDistortMaterial
          color="#14b8a6" 
          attach="material"
          distort={0.5}
          speed={3}
          roughness={0.1}
          metalness={0.6}
          opacity={0.6}
          transparent
        />
      </Sphere>
    </Float>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full opacity-40">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#5eead4" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#0f766e" />
        
        <AnimatedSphere />
        <AnimatedSphereSecondary />

        {/* Small floating particles */}
        <Stars radius={10} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
