
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment } from './components/World/Environment';
import { Player } from './components/World/Player';
import { LevelManager } from './components/World/LevelManager';
import { Effects } from './components/World/Effects';
import { HUD } from './components/UI/HUD';
import { useStore } from './store';

// Dynamic Camera Controller
const CameraController = () => {
  const { camera, size } = useThree();
  const { laneCount } = useStore();
  
  useFrame((state, delta) => {
    // Determine if screen is narrow (mobile portrait)
    const aspect = size.width / size.height;
    const isMobile = aspect < 1.2; 

    const heightFactor = isMobile ? 2.0 : 0.5;
    const distFactor = isMobile ? 4.5 : 1.0;

    const extraLanes = Math.max(0, laneCount - 3);

    const targetY = 5.5 + (extraLanes * heightFactor);
    const targetZ = 8.0 + (extraLanes * distFactor);

    const targetPos = new THREE.Vector3(0, targetY, targetZ);
    
    // Smoothly interpolate camera position
    camera.position.lerp(targetPos, delta * 2.0);
    camera.lookAt(0, 0, -30); 
  });
  
  return null;
};

function Scene() {
  const { quality } = useStore();
  return (
    <>
        <Environment />
        <group>
            {/* Attach a userData to identify player group for LevelManager collision logic */}
            <group userData={{ isPlayer: true }} name="PlayerGroup">
                 <Player />
            </group>
            <LevelManager />
        </group>
        {quality === 'HIGH' && <Effects />}
    </>
  );
}

function App() {
  const { quality } = useStore();
  
  // Performance Scaling: High = [1, 1.5] pixel ratio, Low = [0.5, 1] pixel ratio for FPS boost
  const dpr = quality === 'HIGH' ? [1, 1.5] : [0.5, 1];

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000' }}>
      <HUD />
      <Canvas
        shadows
        dpr={dpr as any} 
        gl={{ 
            antialias: false, 
            stencil: false, 
            depth: true, 
            powerPreference: "high-performance" 
        }}
        camera={{ position: [0, 5.5, 8], fov: 60 }}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
      >
        <CameraController />
        <Suspense fallback={null}>
            <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;