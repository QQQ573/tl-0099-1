import { useCallback } from 'react'
import * as THREE from 'three'
import { Canvas, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import NightSky from './NightSky'
import Firework from './Firework'
import VelocityArrow from './VelocityArrow'
import { useFireworkStore } from '../store/useFireworkStore'
import { createFireworkInstance } from '../engine/FireworkEngine'

function FireworkRenderer() {
  const { fireworkInstances, removeFireworkInstance, isPaused, selectedParticle } = useFireworkStore()

  const handleDone = useCallback(
    (id: string) => {
      removeFireworkInstance(id)
    },
    [removeFireworkInstance]
  )

  return (
    <>
      {fireworkInstances.map((fw) => (
        <Firework key={fw.id} firework={fw} onDone={handleDone} />
      ))}
      {isPaused && selectedParticle && <VelocityArrow particle={selectedParticle} />}
    </>
  )
}

function ClickHandler() {
  const { preset, addFireworkInstance, isPaused } = useFireworkStore()

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (isPaused) return
      const point = e.point
      if (!point) return
      const origin = new THREE.Vector3(point.x, 0, point.z)
      const fw = createFireworkInstance(origin, preset)
      addFireworkInstance(fw)
    },
    [preset, addFireworkInstance, isPaused]
  )

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} onClick={handleClick}>
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial color="#050510" transparent opacity={0.5} />
    </mesh>
  )
}

export default function SceneCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 8, 25], fov: 60, near: 0.1, far: 500 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#0a0a1a' }}
      onCreated={({ gl }) => {
        gl.setClearColor('#0a0a1a')
      }}
    >
      <fog attach="fog" args={['#0a0a1a', 40, 120]} />
      <ambientLight intensity={0.1} />
      <NightSky />
      <GroundPlane />
      <ClickHandler />
      <FireworkRenderer />
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={60}
      />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={1.5}
          radius={0.8}
        />
      </EffectComposer>
    </Canvas>
  )
}
