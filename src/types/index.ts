import * as THREE from 'three'

export type EasingType = 'easeOutCubic' | 'easeOutQuart' | 'easeInOutQuad' | 'easeOutExpo' | 'easeInCubic'

export interface FireworkPreset {
  name: string
  version: string
  launch: {
    burstCount: number
    launchHeight: number
    launchDuration: number
    launchInterval: number
  }
  burst: {
    radius: number
    duration: number
    trailLength: number
    gravity: number
  }
  color: {
    gradient: [string, string, string]
    hueVariation: number
  }
  easing: {
    launchEase: EasingType
    burstEase: EasingType
    fadeEase: EasingType
  }
}

export interface ParticleData {
  id: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  initialPosition: THREE.Vector3
  targetPosition: THREE.Vector3
  color: THREE.Color
  startColor: THREE.Color
  endColor: THREE.Color
  alpha: number
  size: number
  age: number
  maxAge: number
  phase: 'launch' | 'burst' | 'fade'
  active: boolean
}

export interface FireworkInstance {
  id: string
  origin: THREE.Vector3
  burstOrigin: THREE.Vector3
  preset: FireworkPreset
  phase: 'launch' | 'burst' | 'fade' | 'done'
  elapsed: number
  launchParticle: ParticleData
  burstParticles: ParticleData[]
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export const BURST_COUNT_MIN = 80
export const BURST_COUNT_MAX = 1500

export const EASING_OPTIONS: EasingType[] = [
  'easeOutCubic',
  'easeOutQuart',
  'easeInOutQuad',
  'easeOutExpo',
  'easeInCubic',
]

export const DEFAULT_PRESET: FireworkPreset = {
  name: 'Default Firework',
  version: '1.0.0',
  launch: {
    burstCount: 300,
    launchHeight: 10,
    launchDuration: 1.5,
    launchInterval: 0.8,
  },
  burst: {
    radius: 5,
    duration: 2,
    trailLength: 8,
    gravity: 0.5,
  },
  color: {
    gradient: ['#ff0044', '#ffaa00', '#ffff66'],
    hueVariation: 0.1,
  },
  easing: {
    launchEase: 'easeOutCubic',
    burstEase: 'easeOutExpo',
    fadeEase: 'easeInCubic',
  },
}

export const CAMP_CLOSING_PRESET: FireworkPreset = {
  name: 'Camp Closing Ceremony',
  version: '1.0.0',
  launch: {
    burstCount: 500,
    launchHeight: 14,
    launchDuration: 1.8,
    launchInterval: 0.6,
  },
  burst: {
    radius: 7,
    duration: 2.5,
    trailLength: 12,
    gravity: 0.4,
  },
  color: {
    gradient: ['#ff2266', '#ff8800', '#ffee44'],
    hueVariation: 0.15,
  },
  easing: {
    launchEase: 'easeOutCubic',
    burstEase: 'easeOutQuart',
    fadeEase: 'easeInCubic',
  },
}

export const GOLDEN_SHOWER_PRESET: FireworkPreset = {
  name: 'Golden Shower',
  version: '1.0.0',
  launch: {
    burstCount: 800,
    launchHeight: 12,
    launchDuration: 1.6,
    launchInterval: 1.0,
  },
  burst: {
    radius: 4,
    duration: 3.5,
    trailLength: 15,
    gravity: 1.2,
  },
  color: {
    gradient: ['#ffd700', '#ffaa00', '#ff6600'],
    hueVariation: 0.05,
  },
  easing: {
    launchEase: 'easeOutExpo',
    burstEase: 'easeOutCubic',
    fadeEase: 'easeInCubic',
  },
}

export const ALL_PRESETS: FireworkPreset[] = [DEFAULT_PRESET, CAMP_CLOSING_PRESET, GOLDEN_SHOWER_PRESET]
