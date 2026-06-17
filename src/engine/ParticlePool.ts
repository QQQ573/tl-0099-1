import * as THREE from 'three'
import type { ParticleData } from '../types'

const POOL_SIZE = 5000

export class ParticlePool {
  private pool: ParticleData[]
  private active: Set<ParticleData>

  constructor() {
    this.pool = []
    this.active = new Set()
    for (let i = 0; i < POOL_SIZE; i++) {
      this.pool.push(this.createDefault())
    }
  }

  private createDefault(): ParticleData {
    return {
      id: '',
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      initialPosition: new THREE.Vector3(),
      targetPosition: new THREE.Vector3(),
      color: new THREE.Color(),
      startColor: new THREE.Color(),
      endColor: new THREE.Color(),
      alpha: 0,
      size: 0,
      age: 0,
      maxAge: 0,
      phase: 'burst',
      active: false,
    }
  }

  acquire(): ParticleData | null {
    for (const p of this.pool) {
      if (!this.active.has(p)) {
        this.active.add(p)
        p.active = true
        return p
      }
    }
    return null
  }

  release(p: ParticleData): void {
    p.active = false
    p.alpha = 0
    p.age = 0
    p.maxAge = 0
    this.active.delete(p)
  }

  releaseAll(): void {
    for (const p of this.active) {
      p.active = false
      p.alpha = 0
    }
    this.active.clear()
  }

  getActiveCount(): number {
    return this.active.size
  }
}

export const globalParticlePool = new ParticlePool()
