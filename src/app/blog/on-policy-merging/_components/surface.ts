// Shared helpers for the static 3D landscapes (Figures 1 and 3). Everything is
// computed once on the server; the figures animate with SVG <animate> only.

export type V2 = [number, number]

export const deg = Math.PI / 180

export type Camera = {
  yaw: number
  pitch: number
  scale: number
  cx: number
  cy: number
  centre: V2
  zScale: number
}

/** Orthographic projection of (x, y, z) onto the page. */
export function camera(c: Camera) {
  const cy = Math.cos(c.yaw)
  const sy = Math.sin(c.yaw)
  const sp = Math.sin(c.pitch)
  const cp = Math.cos(c.pitch)
  return (p: V2, z: number): V2 => {
    const px = p[0] - c.centre[0]
    const py = p[1] - c.centre[1]
    const x = px * cy - py * sy
    const y = px * sy + py * cy
    return [c.cx + c.scale * x, c.cy + c.scale * y * sp - c.scale * c.zScale * z * cp]
  }
}

export const pt = (q: V2) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`
export const pts = (qs: V2[]) => qs.map(pt).join(' ')
export const dOf = (qs: V2[]) => 'M ' + qs.map(pt).join(' L ')

/** Wireframe of a height field over a square slice of side 2R around `centre`. */
export function wireframe(
  height: (p: V2) => number,
  proj: (p: V2, z: number) => V2,
  centre: V2,
  R: number,
  lines = 20,
  samples = 40,
): string[] {
  const out: string[] = []
  for (let i = 0; i <= lines; i++) {
    const u = -R + (2 * R * i) / lines
    const a: V2[] = []
    const b: V2[] = []
    for (let j = 0; j <= samples; j++) {
      const v = -R + (2 * R * j) / samples
      const pa: V2 = [centre[0] + u, centre[1] + v]
      const pb: V2 = [centre[0] + v, centre[1] + u]
      a.push(proj(pa, height(pa)))
      b.push(proj(pb, height(pb)))
    }
    out.push(pts(a), pts(b))
  }
  return out
}

/** Evenly spaced subsample that always keeps the last point. */
export function thin<T>(arr: T[], k: number): T[] {
  if (arr.length <= k) return arr
  const out: T[] = []
  for (let i = 0; i < k; i++) out.push(arr[Math.round((i * (arr.length - 1)) / (k - 1))])
  return out
}

/**
 * values/keyTimes for an SMIL <animate> from (time, value) pairs, time in [0, 1].
 * Pairs are sorted, clamped, and padded so the list starts at 0 and ends at 1.
 */
export function track(pairs: [number, number | string][]) {
  const ps = pairs
    .map(([t, v]) => [Math.min(1, Math.max(0, t)), v] as [number, number | string])
    .sort((a, b) => a[0] - b[0])
  if (ps[0][0] > 0) ps.unshift([0, ps[0][1]])
  if (ps[ps.length - 1][0] < 1) ps.push([1, ps[ps.length - 1][1]])
  return {
    values: ps.map((p) => (typeof p[1] === 'number' ? Number(p[1].toFixed(4)) : p[1])).join(';'),
    keyTimes: ps.map((p) => p[0].toFixed(5)).join(';'),
  }
}
