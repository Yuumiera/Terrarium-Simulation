import React, { useRef } from 'react';
import { OrbitControls, Environment, ContactShadows, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export default function TerrariumScene({ sensorData }) {
  const { temp, humidity, light } = sensorData;

  // Temperature logic for the Heat Lamp
  const getHeatLampColor = () => {
    if (temp > 29) return '#ff4500'; // Orange/Red for hot
    if (temp < 25) return '#4169e1'; // Blue for cold
    return '#ffd700'; // Yellow/Gold for optimal
  };

  const heatColor = getHeatLampColor();

  return (
    <>
      <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 2 + 0.1} />
      
      {/* Dynamic Ambient Light based on Sensor Data */}
      <ambientLight intensity={(light / 1000) * 0.8} />
      
      {/* Dynamic Heat Lamp focusing on the Lizard */}
      <spotLight 
        position={[-1, 5, 0]} 
        angle={0.5} 
        penumbra={0.5} 
        intensity={80} 
        color={heatColor} 
        castShadow 
      />
      <spotLight 
        position={[2, 5, 0]} 
        angle={0.6} 
        penumbra={0.8} 
        intensity={20} 
        color="#ffffff" 
      />

      <group position={[0, -1.5, 0]}>
        
        {/* Rectangular Glass Tank */}
        <mesh position={[0, 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[6, 4, 4]} />
          <meshPhysicalMaterial 
            color="#ffffff"
            transmission={0.9} // Glass effect
            opacity={1}
            metalness={0.1}
            roughness={0}
            ior={1.5}
            thickness={0.2}
            side={THREE.DoubleSide}
            transparent
          />
        </mesh>

        {/* Tank Frame (Edges) */}
        <mesh position={[0, -0.1, 0]}>
           <boxGeometry args={[6.2, 0.2, 4.2]} />
           <meshStandardMaterial color="#18181b" /> {/* Dark zinc base */}
        </mesh>
        <mesh position={[0, 4.1, 0]}>
           <boxGeometry args={[6.2, 0.2, 4.2]} />
           <meshStandardMaterial color="#18181b" /> {/* Dark zinc top lid */}
        </mesh>

        {/* Inner Soil/Sand */}
        <mesh receiveShadow position={[0, 0.1, 0]}>
          <boxGeometry args={[5.8, 0.2, 3.8]} />
          <meshStandardMaterial color="#78350f" roughness={1} /> {/* Desert sand/dirt */}
        </mesh>

        {/* Basking Rock Formation */}
        <group position={[-1, 0.5, 0]}>
          <mesh castShadow receiveShadow position={[0, 0, 0]} rotation={[0.2, 0.4, 0.1]}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#52525b" roughness={0.9} />
          </mesh>
          <mesh castShadow receiveShadow position={[0.8, -0.2, 0.5]} rotation={[0.5, 0.1, 0.4]}>
            <dodecahedronGeometry args={[0.8, 0]} />
            <meshStandardMaterial color="#3f3f46" roughness={0.9} />
          </mesh>
        </group>

        {/* Procedural Low-Poly Lizard on the Rock */}
        <group position={[-1.2, 1.3, 0]} rotation={[Math.PI / 2, Math.PI / 4, 0]}>
          {/* Body */}
          <mesh castShadow receiveShadow>
             <capsuleGeometry args={[0.15, 0.5, 4, 8]} />
             <meshStandardMaterial color="#166534" roughness={0.7} />
          </mesh>
          {/* Head */}
          <mesh castShadow receiveShadow position={[0, 0.4, -0.1]} rotation={[-0.2, 0, 0]}>
             <coneGeometry args={[0.12, 0.3, 8]} />
             <meshStandardMaterial color="#14532d" />
          </mesh>
          {/* Tail */}
          <mesh castShadow receiveShadow position={[0, -0.6, -0.1]} rotation={[0.2, 0, 0]}>
             <coneGeometry args={[0.08, 0.8, 8]} />
             <meshStandardMaterial color="#166534" />
          </mesh>
        </group>

        {/* Climbing Branch */}
        <mesh castShadow receiveShadow position={[1.5, 1.5, -0.5]} rotation={[0.3, 0, -0.6]}>
           <cylinderGeometry args={[0.15, 0.2, 4, 8]} />
           <meshStandardMaterial color="#451a03" roughness={1} />
        </mesh>

        {/* Water Bowl */}
        <mesh castShadow receiveShadow position={[2, 0.25, 1]}>
           <cylinderGeometry args={[0.5, 0.6, 0.1, 16]} />
           <meshStandardMaterial color="#3f3f46" />
        </mesh>
        {/* Water inside bowl */}
        <mesh position={[2, 0.31, 1]}>
           <cylinderGeometry args={[0.45, 0.45, 0.02, 16]} />
           <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.8} />
        </mesh>

        {/* Humidity Mist Particles */}
        <Sparkles 
          count={humidity * 4} 
          scale={[5, 3, 3]} 
          size={6} 
          speed={0.4} 
          opacity={0.4} 
          color="#a5f3fc" 
          position={[0, 2, 0]} 
        />
      </group>

      <Environment preset="city" />
      <ContactShadows position={[0, -1.7, 0]} opacity={0.6} scale={15} blur={2.5} far={4} />
    </>
  );
}
