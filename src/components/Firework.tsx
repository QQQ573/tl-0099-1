import { useRef, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import type { FireworkInstance, ParticleData } from '../types'
import { updateFireworkInstance, isFireworkDone, getAllParticles, cloneFireworkInstance } from '../engine/FireworkEngine'
import { useFireworkStore } from '../store/useFireworkStore'

interface FireworkProps {
  firework: FireworkInstance
  onDone: (id: string) => void
}

export default function Firework({ firework, onDone }: FireworkProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const glowRef = useRef<THREE.Points>(null)
  const fwRef = useRef<FireworkInstance | null>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  const isPaused = useFireworkStore((s) => s.isPaused)
  const selectParticle = useFireworkStore((s) => s.selectParticle)

  if (fwRef.current === null) {
    fwRef.current = cloneFireworkInstance(firework)
  }

  const maxParticles = firework.preset.launch.burstCount + 1
  const glowParticleCount = Math.min(200, Math.floor(maxParticles * 0.4))

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

      const activeParticles = particles.filter((p) => p.active)
      activeParticles.sort((a, b) => b.alpha * b.size - a.alpha * a.size)

      let idx = 0
      for (const p of activeParticles) {
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
        const gAlpha = glowRef.current.geometry.getAttribute('alpha') as THREE.BufferAttribute

        const glowCount = Math.min(glowParticleCount, activeParticles.length)
        for (let i = 0; i < glowCount; i++) {
          const p = activeParticles[i]
          const glowSize = p.size * 7.0 * (1 - i / glowCount * 0.3)
          gPos.setXYZ(i, p.position.x, p.position.y, p.position.z)
          gCol.setXYZ(i, p.color.r, p.color.g, p.color.b)
          gSize.setX(i, glowSize)
          gAlpha.setX(i, p.alpha * 0.7)
        }
        for (let i = glowCount; i < glowParticleCount; i++) {
          gPos.setXYZ(i, 0, -1000, 0)
          gSize.setX(i, 0)
          gAlpha.setX(i, 0)
        }
        gPos.needsUpdate = true
        gCol.needsUpdate = true
        gSize.needsUpdate = true
        gAlpha.needsUpdate = true
      }
    },
    [maxParticles, glowParticleCount, positions, colors, alphas, sizes]
  )

  useFrame((_, delta) => {
    const fw = fwRef.current
    if (!fw) return
    if (!isPaused) {
      updateFireworkInstance(fw, Math.min(delta, 0.05))
      if (isFireworkDone(fw)) {
        onDoneRef.current(fw.id)
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

  const glowPositions = useMemo(() => new Float32Array(glowParticleCount * 3), [glowParticleCount])
  const glowColors = useMemo(() => new Float32Array(glowParticleCount * 3), [glowParticleCount])
  const glowSizes = useMemo(() => new Float32Array(glowParticleCount), [glowParticleCount])
  const glowAlphas = useMemo(() => new Float32Array(glowParticleCount), [glowParticleCount])

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
          vertexColors
          vertexShader={`
            attribute float size;
            attribute float alpha;
            varying float vAlpha;
            varying vec3 vColor;
            void main() {
              vAlpha = alpha;
              vColor = color;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = size * (300.0 / -mvPosition.z);
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
              intensity = pow(intensity, 1.3);
              gl_FragColor = vec4(vColor * 1.5, vAlpha * intensity);
            }
          `}
        />
      </points>
      <points ref={glowRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={glowParticleCount}
            array={glowPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={glowParticleCount}
            array={glowColors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={glowParticleCount}
            array={glowSizes}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-alpha"
            count={glowParticleCount}
            array={glowAlphas}
            itemSize={1}
          />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexColors
          vertexShader={`
            attribute float size;
            attribute float alpha;
            varying vec3 vColor;
            varying float vAlpha;
            void main() {
              vColor = color;
              vAlpha = alpha;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = size * (500.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `}
          fragmentShader={`
            varying vec3 vColor;
            varying float vAlpha;
            void main() {
              float d = length(gl_PointCoord - vec2(0.5));
              if (d > 0.5) discard;
              float intensity = 1.0 - smoothstep(0.0, 0.5, d);
              intensity = pow(intensity, 0.9) * 0.6;
              gl_FragColor = vec4(vColor * 1.3, vAlpha * intensity);
            }
          `}
        />
      </points>
    </group>
  )
}
