import type { EasingType } from '../types'

export const easingFunctions: Record<EasingType, (t: number) => number> = {
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInCubic: (t: number) => t * t * t,
}

export function getEasing(name: EasingType): (t: number) => number {
  return easingFunctions[name]
}

export const EASING_LABELS: Record<EasingType, string> = {
  easeOutCubic: 'EaseOut Cubic (1-(1-t)³)',
  easeOutQuart: 'EaseOut Quart (1-(1-t)⁴)',
  easeInOutQuad: 'EaseInOut Quad',
  easeOutExpo: 'EaseOut Expo (1-2^(-10t))',
  easeInCubic: 'EaseIn Cubic (t³)',
}
