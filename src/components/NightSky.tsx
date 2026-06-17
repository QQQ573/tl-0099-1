import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const STAR_COUNT = 2000

export default function NightSky() {
  const meshRef = useRef<THREE.Points>(null)

  const { positions, sizes, colors } = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3)
    const sz = new Float32Array(STAR_COUNT)
    const col = new Float32Array(STAR_COUNT * 3)

    for (let i = 0; i < STAR_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 200
      pos[i * 3 + 1] = Math.random() * 80 + 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 200

      sz[i] = Math.random() * 1.5 + 0.3

      const brightness = 0.5 + Math.random() * 0.5
      const blueShift = Math.random() * 0.3
      col[i * 3] = brightness * (1 - blueShift)
      col[i * 3 + 1] = brightness * (1 - blueShift * 0.5)
      col[i * 3 + 2] = brightness
    }

    return { positions: pos, sizes: sz, colors: col }
  }, [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const geo = meshRef.current.geometry
    const sizeAttr = geo.getAttribute('size') as THREE.BufferAttribute
    if (!sizeAttr) return

    const time = clock.getElapsedTime()
    for (let i = 0; i < STAR_COUNT; i++) {
      const twinkle = 0.5 + 0.5 * Math.sin(time * (0.5 + (i % 10) * 0.1) + i)
      sizeAttr.setX(i, sizes[i] * twinkle)
    }
    sizeAttr.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={STAR_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={STAR_COUNT}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={STAR_COUNT}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
