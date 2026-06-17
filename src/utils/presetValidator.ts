import type { FireworkPreset, ValidationResult } from '../types'
import { BURST_COUNT_MIN, BURST_COUNT_MAX } from '../types'

export function validatePreset(preset: unknown): ValidationResult {
  const errors: string[] = []

  if (!preset || typeof preset !== 'object') {
    return { valid: false, errors: ['Invalid preset: must be an object'] }
  }

  const p = preset as Record<string, unknown>

  if (typeof p.name !== 'string' || p.name.trim() === '') {
    errors.push('name: must be a non-empty string')
  }

  if (typeof p.version !== 'string') {
    errors.push('version: must be a string')
  }

  if (!p.launch || typeof p.launch !== 'object') {
    errors.push('launch: must be an object')
  } else {
    const l = p.launch as Record<string, unknown>
    if (typeof l.burstCount !== 'number' || l.burstCount < BURST_COUNT_MIN || l.burstCount > BURST_COUNT_MAX) {
      errors.push(`launch.burstCount: must be a number between ${BURST_COUNT_MIN} and ${BURST_COUNT_MAX}`)
    }
    if (typeof l.launchHeight !== 'number' || l.launchHeight <= 0) {
      errors.push('launch.launchHeight: must be a positive number')
    }
    if (typeof l.launchDuration !== 'number' || l.launchDuration <= 0) {
      errors.push('launch.launchDuration: must be a positive number')
    }
    if (typeof l.launchInterval !== 'number' || l.launchInterval < 0) {
      errors.push('launch.launchInterval: must be a non-negative number')
    }
  }

  if (!p.burst || typeof p.burst !== 'object') {
    errors.push('burst: must be an object')
  } else {
    const b = p.burst as Record<string, unknown>
    if (typeof b.radius !== 'number' || b.radius <= 0) {
      errors.push('burst.radius: must be a positive number')
    }
    if (typeof b.duration !== 'number' || b.duration <= 0) {
      errors.push('burst.duration: must be a positive number')
    }
    if (typeof b.trailLength !== 'number' || b.trailLength < 0) {
      errors.push('burst.trailLength: must be a non-negative number')
    }
    if (typeof b.gravity !== 'number' || b.gravity < 0) {
      errors.push('burst.gravity: must be a non-negative number')
    }
  }

  if (!p.color || typeof p.color !== 'object') {
    errors.push('color: must be an object')
  } else {
    const c = p.color as Record<string, unknown>
    if (!Array.isArray(c.gradient) || c.gradient.length !== 3 || !(c.gradient as string[]).every((v) => typeof v === 'string')) {
      errors.push('color.gradient: must be an array of 3 color strings')
    }
    if (typeof c.hueVariation !== 'number' || c.hueVariation < 0 || c.hueVariation > 1) {
      errors.push('color.hueVariation: must be a number between 0 and 1')
    }
  }

  if (!p.easing || typeof p.easing !== 'object') {
    errors.push('easing: must be an object')
  } else {
    const e = p.easing as Record<string, unknown>
    const validEasing = ['easeOutCubic', 'easeOutQuart', 'easeInOutQuad', 'easeOutExpo', 'easeInCubic']
    if (!validEasing.includes(e.launchEase as string)) {
      errors.push(`easing.launchEase: must be one of ${validEasing.join(', ')}`)
    }
    if (!validEasing.includes(e.burstEase as string)) {
      errors.push(`easing.burstEase: must be one of ${validEasing.join(', ')}`)
    }
    if (!validEasing.includes(e.fadeEase as string)) {
      errors.push(`easing.fadeEase: must be one of ${validEasing.join(', ')}`)
    }
  }

  return { valid: errors.length === 0, errors }
}

export function exportPresetToJson(preset: FireworkPreset): string {
  return JSON.stringify(preset, null, 2)
}

export function importPresetFromJson(json: string): { preset: FireworkPreset | null; validation: ValidationResult } {
  try {
    const parsed = JSON.parse(json)
    const validation = validatePreset(parsed)
    if (validation.valid) {
      return { preset: parsed as FireworkPreset, validation }
    }
    return { preset: null, validation }
  } catch {
    return {
      preset: null,
      validation: { valid: false, errors: ['Invalid JSON format'] },
    }
  }
}

export function downloadPresetJson(preset: FireworkPreset): void {
  const json = exportPresetToJson(preset)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${preset.name.replace(/\s+/g, '_')}_preset.json`
  a.click()
  URL.revokeObjectURL(url)
}
