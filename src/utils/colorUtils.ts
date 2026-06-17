import * as THREE from 'three'

export function sampleGradientColor(
  start: THREE.Color,
  mid: THREE.Color,
  end: THREE.Color,
  t: number
): THREE.Color {
  if (t <= 0.5) {
    return start.clone().lerp(mid, t * 2)
  }
  return mid.clone().lerp(end, (t - 0.5) * 2)
}

export function hexToThreeColor(hex: string): THREE.Color {
  return new THREE.Color(hex)
}

export function createGradientTexture(
  colors: [string, string, string],
  width: number = 256
): THREE.DataTexture {
  const data = new Uint8Array(width * 3)
  const c0 = new THREE.Color(colors[0])
  const c1 = new THREE.Color(colors[1])
  const c2 = new THREE.Color(colors[2])

  for (let i = 0; i < width; i++) {
    const t = i / (width - 1)
    const c = sampleGradientColor(c0, c1, c2, t)
    data[i * 3] = Math.floor(c.r * 255)
    data[i * 3 + 1] = Math.floor(c.g * 255)
    data[i * 3 + 2] = Math.floor(c.b * 255)
  }

  const texture = new THREE.DataTexture(data, width, 1, THREE.RGBFormat)
  texture.needsUpdate = true
  return texture
}
