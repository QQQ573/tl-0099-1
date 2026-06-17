import { useRef, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import type { FireworkInstance, ParticleData } from '../types'
import { updateFireworkInstance, isFireworkDone, getAllParticles } from '../engine/FireworkEngine'
import { useFireworkStore } from '../store/useFireworkStore'

interface FireworkProps {
  firework: FireworkInstance
  onDone: (id: string) => void
}

export default function Firework({ firework, onDone }: FireworkProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const glowRef = useRef<THREE.Points>(null)
  const fwRef = useRef<FireworkInstance>({ ...firework })
  fwRef.current = { ...firework }

  const { isPaused, selectParticle } = useFireworkStore()

  const maxParticles = firework.preset.launch.burstCount + 1

  const { positions, colors, alphas, sizes } = useMemo(() => {
    return {
      positions: new Float32Array(maxParticles * 3),
      colors: new Float32Array(maxParticles * 3),
      alphas: new Float32Array(maxParticles),
      sizes: new Float32Array(maxParticles),
    }
  }, [maxParticles])

  const writeParticlesToBuffers = useCallback(
    (particles: ParticleData[]) => {
      const posAttr = pointsRef.current?.geometry.getAttribute('position') as THREE.BufferAttribute | undefined
      const colAttr = pointsRef.current?.geometry.getAttribute('color') as THREE.BufferAttribute | undefined
      const sizeAttr = pointsRef.current?.geometry.getAttribute('size') as THREE.BufferAttribute | undefined
      const alphaAttr = pointsRef.current?.geometry.getAttribute('alpha') as THREE.BufferAttribute | undefined

      if (!posAttr || !colAttr || !sizeAttr || !alphaAttr) return

      let idx = 0
      for (const p of particles) {
        if (!p.active) continue
        positions[idx * 3] = p.position.x
        positions[idx * 3 + 1] = p.position.y
        positions[idx * 3 + 2] = p.position.z
        colors[idx * 3] = p.color.r
        colors[idx * 3 + 1] = p.color.g
        colors[idx * 3 + 2] = p.color.b
        alphas[idx] = p.alpha
        sizes[idx] = p.size
        idx++
      }

      for (let i = idx; i < maxParticles; i++) {
        positions[i * 3] = 0
        positions[i * 3 + 1] = -1000
        positions[i * 3 + 2] = 0
        alphas[i] = 0
        sizes[i] = 0
      }

      posAttr.needsUpdate = true
      colAttr.needsUpdate = true
      sizeAttr.needsUpdate = true
      alphaAttr.needsUpdate = true

      if (glowRef.current) {
        const gPos = glowRef.current.geometry.getAttribute('position') as THREE.BufferAttribute
        const gCol = glowRef.current.geometry.getAttribute('color') as THREE.BufferAttribute
        const gSize = glowRef.current.geometry.getAttribute('size') as THREE.BufferAttribute

        for (let i = 0; i < Math.min(idx, 20); i++) {
          gPos.setXYZ(i, positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
          gCol.setXYZ(i, colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2])
          gSize.setX(i, sizes[i] * 3)
        }
        for (let i = Math.min(idx, 20); i < 20; i++) {
          gPos.setXYZ(i, 0, -1000, 0)
          gSize.setX(i, 0)
        }
        gPos.needsUpdate = true
        gCol.needsUpdate = true
        gSize.needsUpdate = true
      }
    },
    [maxParticles, positions, colors, alphas, sizes]
  )

  useFrame((_, delta) => {
    const fw = fwRef.current
    if (!isPaused) {
      updateFireworkInstance(fw, Math.min(delta, 0.05))
      if (isFireworkDone(fw)) {
        onDone(fw.id)
        return
      }
    }
    const particles = getAllParticles(fw)
    writeParticlesToBuffers(particles)
  })

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (!isPaused) return
      e.stopPropagation()
      const particles = getAllParticles(fwRef.current)
      if (particles.length > 0) {
        selectParticle(particles[0])
      }
    },
    [isPaused, selectParticle]
  )

  const glowPositions = useMemo(() => new Float32Array(20 * 3), [])
  const glowColors = useMemo(() => new Float32Array(20 * 3), [])
  const glowSizes = useMemo(() => new Float32Array(20), [])

  return (
    <group>
      <points ref={pointsRef} onClick={handleClick}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={maxParticles}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={maxParticles}
            array={colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={maxParticles}
            array={sizes}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-alpha"
            count={maxParticles}
            array={alphas}
            itemSize={1}
          />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={`
            attribute float size;
            attribute float alpha;
            varying float vAlpha;
            varying vec3 vColor;
            void main() {
              vAlpha = alpha;
              vColor = color;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = size * (200.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `}
          fragmentShader={`
            varying float vAlpha;
            varying vec3 vColor;
            void main() {
              float d = length(gl_PointCoord - vec2(0.5));
              if (d > 0.5) discard;
              float intensity = 1.0 - smoothstep(0.0, 0.5, d);
              gl_FragColor = vec4(vColor, vAlpha * intensity);
            }
          `}
          vertexColors
        />
      </points>
      <points ref={glowRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={20}
            array={glowPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={20}
            array={glowColors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={20}
            array={glowSizes}
            itemSize={1}
          />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={`
            attribute float size;
            varying vec3 vColor;
            void main() {
              vColor = color;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = size * (300.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `}
          fragmentShader={`
            varying vec3 vColor;
            void main() {
              float d = length(gl_PointCoord - vec2(0.5));
              if (d > 0.5) discard;
              float intensity = 1.0 - smoothstep(0.0, 0.5, d);
              intensity = pow(intensity, 2.0) * 0.3;
              gl_FragColor = vec4(vColor, intensity);
            }
          `}
          vertexColors
        />
      </points>
    </group>
  )
}
