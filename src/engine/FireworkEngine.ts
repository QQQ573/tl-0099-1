import * as THREE from 'three'
import type { ParticleData, FireworkPreset, FireworkInstance } from '../types'
import { getEasing } from './EasingCurves'
import { sampleGradientColor } from '../utils/colorUtils'

let particleIdCounter = 0

function nextParticleId(): string {
  return `p_${++particleIdCounter}`
}

let fireworkIdCounter = 0

function nextFireworkId(): string {
  return `fw_${++fireworkIdCounter}`
}

function createLaunchParticle(origin: THREE.Vector3, preset: FireworkPreset): ParticleData {
  const targetY = origin.y + preset.launch.launchHeight
  const target = new THREE.Vector3(origin.x, targetY, origin.z)
  const c = new THREE.Color(preset.color.gradient[1])
  const initialSize = 5.0
  return {
    id: nextParticleId(),
    position: origin.clone(),
    velocity: new THREE.Vector3(0, targetY / preset.launch.launchDuration, 0),
    initialPosition: origin.clone(),
    targetPosition: target,
    color: c,
    startColor: c.clone(),
    endColor: new THREE.Color(preset.color.gradient[0]),
    alpha: 1,
    size: initialSize,
    initialSize,
    age: 0,
    maxAge: preset.launch.launchDuration,
    phase: 'launch',
    active: true,
  }
}

function createBurstParticles(
  burstOrigin: THREE.Vector3,
  preset: FireworkPreset
): ParticleData[] {
  const count = preset.launch.burstCount
  const particles: ParticleData[] = []
  const startColor = new THREE.Color(preset.color.gradient[0])
  const midColor = new THREE.Color(preset.color.gradient[1])
  const endColor = new THREE.Color(preset.color.gradient[2])

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const speedFactor = 0.6 + Math.random() * 0.6

    const dir = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.sin(phi) * Math.sin(theta),
      Math.cos(phi)
    )

    const t = Math.random()
    const color = sampleGradientColor(startColor, midColor, endColor, t)
    if (preset.color.hueVariation > 0) {
      const hsl = { h: 0, s: 0, l: 0 }
      color.getHSL(hsl)
      hsl.h += (Math.random() - 0.5) * preset.color.hueVariation
      hsl.h = ((hsl.h % 1) + 1) % 1
      color.setHSL(hsl.h, hsl.s, hsl.l)
    }

    const maxAge = preset.burst.duration * (0.7 + Math.random() * 0.5)
    const baseSize = 3.0 + Math.random() * 3.5

    particles.push({
      id: nextParticleId(),
      position: burstOrigin.clone(),
      velocity: dir.multiplyScalar(preset.burst.radius * speedFactor),
      initialPosition: burstOrigin.clone(),
      targetPosition: burstOrigin.clone().add(dir.clone().multiplyScalar(preset.burst.radius * speedFactor)),
      color,
      startColor: color.clone(),
      endColor: endColor.clone(),
      alpha: 1,
      size: baseSize,
      initialSize: baseSize,
      age: 0,
      maxAge,
      phase: 'burst',
      active: true,
    })
  }
  return particles
}

export function createFireworkInstance(
  origin: THREE.Vector3,
  preset: FireworkPreset
): FireworkInstance {
  const launchParticle = createLaunchParticle(origin, preset)
  return {
    id: nextFireworkId(),
    origin: origin.clone(),
    burstOrigin: new THREE.Vector3(),
    preset: { ...preset },
    phase: 'launch',
    elapsed: 0,
    launchParticle,
    burstParticles: [],
  }
}

export function updateFireworkInstance(fw: FireworkInstance, delta: number): void {
  if (fw.phase === 'done') return

  fw.elapsed += delta

  if (fw.phase === 'launch') {
    const p = fw.launchParticle
    p.age += delta
    const t = Math.min(p.age / p.maxAge, 1)
    const ease = getEasing(fw.preset.easing.launchEase)

    p.position.lerpVectors(p.initialPosition, p.targetPosition, ease(t))
    p.alpha = t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15
    p.color.copy(p.startColor).lerp(p.endColor, t)
    p.size = p.initialSize * (1 + t * 0.3)

    if (t >= 1) {
      fw.burstOrigin.copy(p.targetPosition)
      fw.burstParticles = createBurstParticles(fw.burstOrigin, fw.preset)
      fw.phase = 'burst'
      fw.elapsed = 0
      p.active = false
    }
  }

  if (fw.phase === 'burst') {
    let allDead = true
    const burstEase = getEasing(fw.preset.easing.burstEase)
    const fadeEase = getEasing(fw.preset.easing.fadeEase)
    const gravity = fw.preset.burst.gravity
    const trailFactor = 1 + fw.preset.burst.trailLength * 0.12

    for (const p of fw.burstParticles) {
      if (!p.active) continue
      p.age += delta
      const t = Math.min(p.age / p.maxAge, 1)

      const easedT = burstEase(t)
      p.position.copy(p.initialPosition).addScaledVector(p.velocity, easedT)

      p.position.y -= gravity * p.age * p.age * 0.5

      const fadeT = fadeEase(Math.pow(t, 1 / trailFactor))
      p.alpha = 1 - fadeT
      p.color.copy(p.startColor).lerp(p.endColor, t)

      const sizeEase = 1 - Math.pow(t, 1 / trailFactor) * 0.7
      p.size = p.initialSize * sizeEase

      if (t >= 1) {
        p.active = false
      } else {
        allDead = false
      }
    }

    if (allDead) {
      fw.phase = 'done'
    }
  }
}

export function isFireworkDone(fw: FireworkInstance): boolean {
  return fw.phase === 'done'
}

export function getAllParticles(fw: FireworkInstance): ParticleData[] {
  const particles: ParticleData[] = []
  if (fw.launchParticle.active) particles.push(fw.launchParticle)
  particles.push(...fw.burstParticles.filter((p) => p.active))
  return particles
}

export function cloneFireworkInstance(fw: FireworkInstance): FireworkInstance {
  const cloneParticle = (p: ParticleData): ParticleData => ({
    id: p.id,
    position: p.position.clone(),
    velocity: p.velocity.clone(),
    initialPosition: p.initialPosition.clone(),
    targetPosition: p.targetPosition.clone(),
    color: p.color.clone(),
    startColor: p.startColor.clone(),
    endColor: p.endColor.clone(),
    alpha: p.alpha,
    size: p.size,
    initialSize: p.initialSize,
    age: p.age,
    maxAge: p.maxAge,
    phase: p.phase,
    active: p.active,
  })

  return {
    id: fw.id,
    origin: fw.origin.clone(),
    burstOrigin: fw.burstOrigin.clone(),
    preset: JSON.parse(JSON.stringify(fw.preset)),
    phase: fw.phase,
    elapsed: fw.elapsed,
    launchParticle: cloneParticle(fw.launchParticle),
    burstParticles: fw.burstParticles.map(cloneParticle),
  }
}
