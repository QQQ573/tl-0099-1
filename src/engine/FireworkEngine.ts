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
    size: 3.0,
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
    const speed = preset.burst.radius * (0.5 + Math.random() * 0.5)

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

    const maxAge = preset.burst.duration * (0.6 + Math.random() * 0.4)

    particles.push({
      id: nextParticleId(),
      position: burstOrigin.clone(),
      velocity: dir.multiplyScalar(speed),
      initialPosition: burstOrigin.clone(),
      targetPosition: burstOrigin.clone().add(dir.clone().multiplyScalar(speed)),
      color,
      startColor: color.clone(),
      endColor: endColor.clone(),
      alpha: 1,
      size: 1.5 + Math.random() * 1.5,
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
    p.alpha = t < 0.8 ? 1 : 1 - (t - 0.8) / 0.2
    p.color.copy(p.startColor).lerp(p.endColor, t)

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

    for (const p of fw.burstParticles) {
      if (!p.active) continue
      p.age += delta
      const t = Math.min(p.age / p.maxAge, 1)

      const easedT = burstEase(t)
      const disp = p.velocity.clone().multiplyScalar(easedT * fw.preset.burst.duration / p.maxAge * p.maxAge / fw.preset.burst.duration)

      p.position.copy(p.initialPosition).add(disp)
      p.position.y -= gravity * p.age * p.age * 0.5

      const fadeT = fadeEase(t)
      p.alpha = 1 - fadeT
      p.color.copy(p.startColor).lerp(p.endColor, t)

      p.size = (1 - t * 0.5) * (1.5 + Math.random() * 0.3)

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
