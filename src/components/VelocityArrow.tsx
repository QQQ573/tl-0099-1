import { useMemo } from 'react'
import * as THREE from 'three'
import type { ParticleData } from '../types'

interface VelocityArrowProps {
  particle: ParticleData
}

export default function VelocityArrow({ particle }: VelocityArrowProps) {
  const arrow = useMemo(() => {
    const dir = particle.velocity.clone().normalize()
    const length = Math.min(particle.velocity.length(), 5)
    const color = new THREE.Color('#00ffaa')
    return { dir, length, color }
  }, [particle.velocity])

  return (
    <group position={[particle.position.x, particle.position.y, particle.position.z]}>
      <arrowHelper
        args={[arrow.dir, new THREE.Vector3(0, 0, 0), arrow.length, '#00ffaa', 0.4, 0.2]}
      />
      <mesh position={[0, -0.15, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#00ffaa" transparent opacity={0.8} />
      </mesh>
    </group>
  )
}
