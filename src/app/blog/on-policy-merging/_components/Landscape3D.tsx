// Figure 1, right panel: an illustrative loss landscape over a 2D slice of
// weight space (height = total loss over five domains), seen from one fixed
// camera. The five methods play one at a time. The surface and every path are
// computed once at module load; the figure animates with SMIL only.
//
// The landscape has a wide local basin next to the base, a ridge in the middle,
// and a deeper global basin at the far end, reached through a narrow valley.
// Plain gradient descent from the base falls into the local basin. Each domain
// has its own optimum E_i; their centroid sits on the ridge, so averaging the
// five specialists lands high.

import { camera, deg, dOf, pts, thin, track, type V2 } from './surface'

// ---- geometry helpers ---------------------------------------------------------------
const add = (a: V2, b: V2): V2 => [a[0] + b[0], a[1] + b[1]]
const sub = (a: V2, b: V2): V2 => [a[0] - b[0], a[1] - b[1]]
const mul = (a: V2, s: number): V2 => [a[0] * s, a[1] * s]
const lerp = (a: V2, b: V2, s: number): V2 => add(a, mul(sub(b, a), s))
const len = (a: V2) => Math.hypot(a[0], a[1])
const unit = (a: V2): V2 => mul(a, 1 / (len(a) || 1))
const rot = (a: V2, t: number): V2 => [a[0] * Math.cos(t) - a[1] * Math.sin(t), a[0] * Math.sin(t) + a[1] * Math.cos(t)]
const bump = (p: V2, c: V2, s: number) => Math.exp(-((p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2) / s)

// ---- the landscape ------------------------------------------------------------------
const B0: V2 = [-0.78, -0.8] // base policy, high ground
const GLOB: V2 = [0.5, 0.5] // global basin
const LOC: V2 = [-0.45, 0.05] // wide local basin
const HILL: V2 = [0.12, -0.12] // ridge in the middle
// each domain's own optimum; centroid (0.12, -0.13), on the ridge
const E: V2[] = [
  [-0.35, -0.45],
  [0.55, -0.6],
  [0.7, 0.1],
  [-0.15, 0.5],
  [-0.15, -0.2],
]
// a narrow valley from the base side down to the global basin, deepening as it goes
const CH: V2[] = [
  [-0.3, -0.3],
  [-0.08, 0.08],
  [0.22, 0.33],
  [0.5, 0.5],
]
function channel(p: V2) {
  let best = 9
  let u = 0
  for (let i = 0; i < CH.length - 1; i++) {
    const a = CH[i]
    const v = sub(CH[i + 1], a)
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * v[0] + (p[1] - a[1]) * v[1]) / (v[0] ** 2 + v[1] ** 2)))
    const d = (p[0] - a[0] - t * v[0]) ** 2 + (p[1] - a[1] - t * v[1]) ** 2
    if (d < best) {
      best = d
      u = (i + t) / (CH.length - 1)
    }
  }
  return (0.03 + 0.3 * u) * Math.exp(-best / 0.02)
}
const height = (p: V2) =>
  0.32 * (p[0] ** 2 + p[1] ** 2) -
  0.9 * bump(p, GLOB, 0.13) -
  0.62 * bump(p, LOC, 0.06) +
  0.38 * bump(p, HILL, 0.05) +
  0.45 * bump(p, B0, 0.12) -
  E.reduce((s, e) => s + 0.1 * bump(p, e, 0.02), 0) +
  0.03 * Math.sin(4.1 * p[0] + 1) * Math.cos(3.3 * p[1] - 0.5) -
  channel(p)
const grad = (p: V2): V2 => {
  const e = 1e-4
  return [(height([p[0] + e, p[1]]) - height([p[0] - e, p[1]])) / (2 * e), (height([p[0], p[1] + e]) - height([p[0], p[1] - e])) / (2 * e)]
}

// ---- camera and surface -------------------------------------------------------------
const W = 560
const H = 400
const R = 1.05
const YAW = -15 * deg
const PITCH = 52 * deg
const ZS = 0.45
const proj = camera({ yaw: YAW, pitch: PITCH, scale: 162, cx: 290, cy: 244, centre: [0, 0], zScale: ZS })
const on = (p: V2) => proj(p, height(p) + 0.012)
const depth = (p: V2, z: number) => (p[0] * Math.sin(YAW) + p[1] * Math.cos(YAW)) * Math.cos(PITCH) + ZS * z * Math.sin(PITCH)

const NQ = 28
const LIGHT = (() => {
  // from the upper left of the picture
  const back: V2 = [-1, -0.35] // (screen-left, screen-back) in camera coordinates
  const s: V2 = [back[0] * Math.cos(YAW) + back[1] * Math.sin(YAW), -back[0] * Math.sin(YAW) + back[1] * Math.cos(YAW)]
  const v = [s[0], s[1], 1.3]
  const n = Math.hypot(v[0], v[1], v[2])
  return v.map((x) => x / n)
})()
// plain fills in case the stylesheet is missing (the classes override them)
const FALLBACK = Array.from({ length: 12 }, (_, k) => {
  const c = (a: number, b: number) => Math.round(a + ((b - a) * k) / 11)
  return `rgb(${c(248, 179)},${c(244, 168)},${c(236, 149)})`
})
const QUADS = (() => {
  const out: { d: string; k: number; z: number }[] = []
  const at = (i: number, j: number): V2 => [-R + (2 * R * i) / NQ, -R + (2 * R * j) / NQ]
  let lo = Infinity
  let hi = -Infinity
  for (let i = 0; i <= NQ; i++)
    for (let j = 0; j <= NQ; j++) {
      const z = height(at(i, j))
      lo = Math.min(lo, z)
      hi = Math.max(hi, z)
    }
  for (let i = 0; i < NQ; i++)
    for (let j = 0; j < NQ; j++) {
      const c = [at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)]
      const mid = at(i + 0.5, j + 0.5)
      const z = height(mid)
      const g = grad(mid)
      const n = [-g[0] * ZS, -g[1] * ZS, 1]
      const nn = Math.hypot(n[0], n[1], n[2])
      const lam = (n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]) / nn
      const u = (z - lo) / (hi - lo)
      const dark = Math.max(0, Math.min(1, 1.2 * (1 - u) - 0.12 + 0.55 * (0.95 - lam)))
      out.push({ d: pts(c.map((q) => proj(q, height(q)))), k: Math.round(dark * 11), z: depth(mid, z) })
    }
  return out.sort((a, b) => a.z - b.z)
})()

// ---- paths on the surface -----------------------------------------------------------
/** Catmull-Rom spline through slice waypoints, n samples. */
function spline(w: V2[], n: number): V2[] {
  const out: V2[] = []
  const P = [w[0], ...w, w[w.length - 1]]
  const segs = w.length - 1
  for (let k = 0; k <= n; k++) {
    const s = Math.min(segs - 1e-9, (k / n) * segs)
    const i = Math.floor(s)
    const t = s - i
    const [p0, p1, p2, p3] = [P[i], P[i + 1], P[i + 2], P[i + 3]]
    const f = (a: number, b: number, c: number, d: number) =>
      0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t)
    out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])])
  }
  return out
}
const line = (a: V2, b: V2, n = 10): V2[] => Array.from({ length: n + 1 }, (_, k) => lerp(a, b, k / n))
/** A gentle arc from a to b, bowed sideways by `bend` (fraction of the distance). */
const arc = (a: V2, b: V2, bend: number, n = 40) => {
  const m = lerp(a, b, 0.5)
  const d = sub(b, a)
  return spline([a, add(m, mul([-d[1], d[0]], bend)), b], n)
}
/** Screen polyline and the cumulative arc-length fraction at each point. */
function screen(path: V2[]) {
  const q = path.map(on)
  const c = [0]
  for (let i = 1; i < q.length; i++) c.push(c[i - 1] + Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]))
  const L = c[c.length - 1] || 1
  return { q, f: c.map((v) => v / L) }
}
/** Point at arc-length fraction s along a screen polyline. */
function along(sc: { q: V2[]; f: number[] }, s: number): V2 {
  let i = 1
  while (i < sc.f.length - 1 && sc.f[i] < s) i++
  const t = (s - sc.f[i - 1]) / (sc.f[i] - sc.f[i - 1] || 1)
  return lerp(sc.q[i - 1], sc.q[i], Math.max(0, Math.min(1, t)))
}

// Multi-task RL: plain gradient descent on the total loss from the base, then
// it rattles around the bottom of the local basin.
const MTRL: V2[] = (() => {
  const out: V2[] = [B0]
  let p = B0
  for (let k = 0; k < 400; k++) {
    const g = grad(p)
    p = sub(p, mul(g, 0.02))
    out.push(p)
    if (len(g) < 2e-3) break
  }
  const m = p
  for (let k = 1; k <= 24; k++) out.push(add(m, mul(rot([0.055, 0], k * 2.3), 1 - k / 26)))
  out.push(m)
  return thin(out, 70)
})()
const LOC_MIN = MTRL[MTRL.length - 1]

// Cascade RL: one domain after another, each stage pulled toward its own optimum.
const CASC: V2[][] = (() => {
  const legs: V2[][] = []
  let p = B0
  const bends = [0.12, -0.1, 0.12, 0.1, -0.12]
  E.forEach((e, i) => {
    const to = lerp(p, e, 0.86)
    legs.push(arc(p, to, bends[i], 30))
    p = to
  })
  return legs
})()

// one specialist per domain, from the base to its own optimum
const BEND = [-0.3, -0.12, -0.2, 0.18, 0.08]
const SPEC: V2[][] = E.map((e, i) => arc(B0, e, BEND[i], 40))
const MERGED = mul(E.reduce(add, [0, 0] as V2), 1 / E.length)

// the route the OPM anchor takes: past the local basin and down the narrow valley
const ROUTE: V2[] = spline([B0, [-0.54, -0.52], [-0.3, -0.3], [-0.08, 0.08], [0.22, 0.33], [0.49, 0.49]], 120)
const routeAt = (s: number) => ROUTE[Math.round(s * (ROUTE.length - 1))]
// MOPD's student follows the teachers part of the way down
const STUDENT = ROUTE.slice(0, Math.round(0.6 * (ROUTE.length - 1)) + 1)

// On-Policy Merge: ROUNDS rounds; anchors A_0..A_ROUNDS along the route
const ROUNDS = 10
const COLLAPSE_ROUND = 4
const COLLAPSE_DOMAIN = 3
const ease = (s: number) => s * (1.25 - 0.25 * s) // slightly longer steps early
const ANCHOR_S = Array.from({ length: ROUNDS + 1 }, (_, r) => ease(r / ROUNDS))
const ANCHORS = ANCHOR_S.map(routeAt)
const SPUR_LEN = 0.19
const FAN = [-1.15, -0.58, 0, 0.58, 1.15] // radians either side of the route
const COLLAPSE_TO: V2 = [0.25, -1.0] // where the collapsing trainer runs: off up the far wall
const SPURS: V2[][][] = ANCHORS.slice(0, ROUNDS).map((a, r) => {
  const fwd = unit(sub(ANCHORS[r + 1], a))
  const fa = Math.atan2(fwd[1], fwd[0])
  // each trainer heads toward its own optimum: rank the domains by bearing and fan them out
  const rel = E.map((e) => {
    let da = Math.atan2(e[1] - a[1], e[0] - a[0]) - fa
    while (da > Math.PI) da -= 2 * Math.PI
    while (da < -Math.PI) da += 2 * Math.PI
    return da
  })
  const rank = rel.map((d) => rel.filter((x) => x < d).length)
  return E.map((_, i) => {
    if (r === COLLAPSE_ROUND && i === COLLAPSE_DOMAIN) return line(a, lerp(a, COLLAPSE_TO, 0.85), 16)
    const ang = fa + FAN[rank[i]]
    return line(a, add(a, [SPUR_LEN * Math.cos(ang), SPUR_LEN * Math.sin(ang)]), 6)
  })
})

// ---- timeline (seconds) -------------------------------------------------------------
const ORDER = ['mtrl', 'casc', 'merge', 'mopd', 'opm'] as const
type Key = (typeof ORDER)[number]
const LEN: Record<Key, number> = { mtrl: 3.8, casc: 4.3, merge: 4.0, mopd: 4.6, opm: 7.3 }
const START: Record<Key, number> = (() => {
  let s = 0
  const out = {} as Record<Key, number>
  ORDER.forEach((k) => {
    out[k] = s
    s += LEN[k]
  })
  return out
})()
const LOOP = ORDER.reduce((s, k) => s + LEN[k], 0)
// times below are written on a design clock; SPEED maps them to real seconds
const SPEED = 0.685
const DUR = `${(LOOP * SPEED).toFixed(2)}s`
const NAMES: Record<Key, string> = {
  mtrl: 'Multi-task RL',
  casc: 'Cascade RL',
  merge: 'Merge-after',
  mopd: 'MOPD',
  opm: 'On-Policy Merge',
}

type Pair = [number, number | string]
/** SMIL timing props from (seconds, value) pairs. */
function anim(pairs: Pair[]) {
  const t = track(pairs.map(([s, v]) => [s / LOOP, v]))
  return { values: t.values, keyTimes: t.keyTimes, dur: DUR, repeatCount: 'indefinite' as const }
}
function motion(path: string, pairs: [number, number][]) {
  const t = track(pairs.map(([s, v]) => [s / LOOP, v]))
  return { path, keyPoints: t.values, keyTimes: t.keyTimes, calcMode: 'linear' as const, dur: DUR, repeatCount: 'indefinite' as const }
}
/** Hidden until t0, then fades to `to` over `fade` seconds; optional later level changes. */
function Fade({ t0, to = 1, fade = 0.15, then = [], children }: { t0: number; to?: number; fade?: number; then?: [number, number][]; children: React.ReactNode }) {
  return (
    <g opacity="0">
      <animate attributeName="opacity" {...anim([[t0, 0], [t0 + fade, to], ...then])} />
      {children}
    </g>
  )
}

const CLS = ['forest', 'indigo', 'ochre', 'plum', 'teal']
const stroke = (i: number) => `am-fig-${CLS[i]}-stroke`
const fill = (i: number) => `am-fig-${CLS[i]}`

/**
 * A path drawn progressively on the surface with a moving head. `prog` maps
 * seconds to the drawn fraction of the path (default: linear from t0 to t1).
 */
function Trail({
  path,
  t0,
  t1,
  prog,
  cls,
  dot,
  width = 2.4,
  r = 4.5,
}: {
  path: V2[]
  t0: number
  t1: number
  prog?: [number, number][]
  cls: string
  dot?: string
  width?: number
  r?: number
}) {
  const q = path.map(on)
  const pr: [number, number][] = prog ?? [
    [t0, 0],
    [t1, 1],
  ]
  return (
    <Fade t0={t0} fade={0.05}>
      <polyline
        points={pts(q)}
        fill="none"
        className={cls}
        strokeWidth={width}
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <animate attributeName="stroke-dashoffset" {...anim(pr.map(([s, v]) => [s, 1 - v]))} />
      </polyline>
      {dot && (
        <circle r={r} className={dot}>
          <animateMotion {...motion(dOf(q), pr)} />
        </circle>
      )}
    </Fade>
  )
}

function Label({ at, dx = 0, dy = 0, anchor = 'start', cls = 'am-fig-ink', children }: { at: V2; dx?: number; dy?: number; anchor?: 'start' | 'middle' | 'end'; cls?: string; children: string }) {
  return (
    <text x={at[0] + dx} y={at[1] + dy} textAnchor={anchor} className={`${cls} am-ls-label`} fontSize="15" fontWeight="700">
      {children}
    </text>
  )
}

const dashed = (path: V2[], cls: string, w = 1.6) => <polyline points={pts(path.map(on))} fill="none" className={cls} strokeWidth={w} strokeDasharray="4 4" strokeLinecap="round" />

// ---- the five segments --------------------------------------------------------------
function MtrlSeg() {
  const s = START.mtrl
  const end = on(LOC_MIN)
  return (
    <>
      <Trail path={MTRL} t0={s + 0.35} t1={s + 2.7} cls="am-fig-ink-stroke" dot="am-fig-ink" width={3} r={5.5} />
      <Fade t0={s + 2.3} fade={0.2}>
        <Label at={end} dx={-14} dy={30} anchor="middle">
          local optimum
        </Label>
      </Fade>
    </>
  )
}

function CascSeg() {
  const s = START.casc
  const leg = 0.66
  return (
    <>
      {CASC.map((p, i) => (
        <Trail key={i} path={p} t0={s + 0.35 + i * leg} t1={s + 0.35 + (i + 1) * leg - 0.03} cls={stroke(i)} dot={fill(i)} width={2.8} r={5} />
      ))}
    </>
  )
}

/** Five specialists from the base, over [t0, t1]. */
function Specialists({ t0, t1, dimAt }: { t0: number; t1: number; dimAt?: number }) {
  return (
    <g>
      {dimAt !== undefined && <animate attributeName="opacity" {...anim([[dimAt, 1], [dimAt + 0.3, 0.45]])} />}
      {SPEC.map((p, i) => (
        <Trail key={i} path={p} t0={t0} t1={t1} cls={stroke(i)} dot={fill(i)} width={2.4} r={4.5} />
      ))}
    </g>
  )
}

function MergeSeg() {
  const s = START.merge
  const tm = s + 2.35
  const m = on(MERGED)
  return (
    <>
      <Specialists t0={s + 0.35} t1={s + 2.15} />
      <Fade t0={tm} fade={0.1}>
        {E.map((e, i) => (
          <g key={i}>
            {dashed(line(e, MERGED, 12), stroke(i))}
            <circle r={4.5} className={fill(i)}>
              <animateMotion {...motion(dOf(line(e, MERGED, 12).map(on)), [[tm, 0], [tm + 0.4, 1]])} />
            </circle>
          </g>
        ))}
      </Fade>
      <Fade t0={tm + 0.4} fade={0.1}>
        <circle cx={m[0]} cy={m[1]} r={7} className="am-fig-ink" />
        <Label at={m} dy={-16} anchor="middle">
          merge lands on the ridge
        </Label>
      </Fade>
    </>
  )
}

function MopdSeg() {
  const s = START.mopd
  const t0 = s + 1.55
  const t1 = s + 4.0
  const sc = screen(STUDENT)
  const K = 24
  const xs = Array.from({ length: K + 1 }, (_, k) => along(sc, k / K))
  const kt = (k: number) => t0 + ((t1 - t0) * k) / K
  return (
    <>
      <Specialists t0={s + 0.3} t1={s + 1.3} dimAt={s + 1.45} />
      <Fade t0={t0} fade={0.15}>
        <g>
          <animate attributeName="opacity" {...anim([[t0, 0.5], ...Array.from({ length: 10 }, (_, k) => [t0 + 0.12 + k * 0.245, k % 2 ? 0.5 : 1] as [number, number]), [t1, 0.6]])} />
          {E.map((e, i) => {
            const a = on(e)
            return (
              <line key={i} x1={a[0]} y1={a[1]} x2={xs[0][0]} y2={xs[0][1]} className={stroke(i)} strokeWidth="2" strokeDasharray="5 4">
                <animate attributeName="x2" {...anim(xs.map((x, k) => [kt(k), Number(x[0].toFixed(1))]))} />
                <animate attributeName="y2" {...anim(xs.map((x, k) => [kt(k), Number(x[1].toFixed(1))]))} />
              </line>
            )
          })}
        </g>
      </Fade>
      <Trail path={STUDENT} t0={t0} t1={t1} cls="am-fig-ink-stroke" dot="am-fig-ink" width={3} r={5.5} />
      <Fade t0={t0} fade={0.15} then={[[t0 + 1.4, 1], [t0 + 1.7, 0]]}>
        <Label at={on(B0)} dx={0} dy={-16} anchor="middle">
          student
        </Label>
      </Fade>
    </>
  )
}

// OPM rounds: [a, b] in seconds for each round
const OPM_T0 = START.opm + 0.4
const RD = 0.45
const RD_COLLAPSE = 1.9
const ROUND_T: [number, number][] = (() => {
  const out: [number, number][] = []
  let t = OPM_T0
  for (let r = 0; r < ROUNDS; r++) {
    const d = r === COLLAPSE_ROUND ? RD_COLLAPSE : RD
    out.push([t, t + d])
    t += d
  }
  return out
})()
/** When round r's merge happens and how long the anchor takes to move. */
const mergeAt = (r: number) => {
  const [a, b] = ROUND_T[r]
  return r === COLLAPSE_ROUND ? b - 0.5 : a + 0.58 * (b - a)
}
const MOVE = 0.16

function OpmSeg() {
  const route = screen(ROUTE.slice(0, ROUTE.length))
  // progress of the anchor path: still while trainers run, moves at each merge
  const prog: [number, number][] = [[OPM_T0, 0]]
  ANCHOR_S.slice(1).forEach((sv, r) => {
    const tm = mergeAt(r)
    const f = route.f[Math.round(sv * (ROUTE.length - 1))]
    prog.push([tm, prog[prog.length - 1][1]], [tm + MOVE, f])
  })
  const lastMerge = mergeAt(ROUNDS - 1) + MOVE
  const cr = COLLAPSE_ROUND
  const bad = SPURS[cr][COLLAPSE_DOMAIN]
  const badTip = on(bad[bad.length - 1])
  const back = on(ANCHORS[cr + 1])
  const tc = ROUND_T[cr][0]
  const tmc = mergeAt(cr)
  const tipF = screen([...bad, ANCHORS[cr + 1]]).f[bad.length - 1]
  return (
    <>
      {SPURS.map((fan, r) => {
        const [a] = ROUND_T[r]
        const tm = mergeAt(r)
        const grow = r === cr ? 0.55 : 0.24
        return (
          <g key={r}>
            {/* the trainers move apart, then the faint trace stays behind */}
            <Fade t0={a} fade={0.04} then={[[tm + MOVE, 1], [tm + MOVE + 0.2, 0.35]]}>
              {fan.map((p, i) =>
                r === cr && i === COLLAPSE_DOMAIN ? null : (
                  <polyline
                    key={i}
                    points={pts(p.map(on))}
                    fill="none"
                    className={stroke(i)}
                    strokeWidth="2.2"
                    pathLength={1}
                    strokeDasharray="1 1"
                    strokeDashoffset="1"
                    strokeLinecap="round"
                  >
                    <animate attributeName="stroke-dashoffset" {...anim([[a, 1], [a + grow, 0]])} />
                  </polyline>
                ),
              )}
            </Fade>
            {/* the merge: every trainer is pulled to the new anchor */}
            <Fade t0={tm - 0.02} fade={0.04} then={[[tm + MOVE + 0.05, 1], [tm + MOVE + 0.15, 0]]}>
              {fan.map((p, i) =>
                r === cr && i === COLLAPSE_DOMAIN ? null : (
                  <g key={i}>{dashed(line(p[p.length - 1], ANCHORS[r + 1], 6), stroke(i), 1.3)}</g>
                ),
              )}
            </Fade>
            <Fade t0={tm + MOVE} fade={0.05}>
              <circle cx={on(ANCHORS[r + 1])[0]} cy={on(ANCHORS[r + 1])[1]} r={3} className="am-fig-ink" />
            </Fade>
          </g>
        )
      })}

      {/* the collapse and the roll-back */}
      <Fade t0={tc} fade={0.04} then={[[tmc, 1], [tmc + 0.3, 0]]}>
        <polyline
          points={pts(bad.map(on))}
          fill="none"
          className="am-fig-accent-stroke"
          strokeWidth="2.6"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset="1"
          strokeLinecap="round"
        >
          <animate attributeName="stroke-dashoffset" {...anim([[tc, 1], [tc + 0.55, 0]])} />
        </polyline>
      </Fade>
      <Fade t0={tc} fade={0.04} then={[[tmc + 0.25, 1], [tmc + 0.35, 0]]}>
        <circle r={5} className="am-fig-accent">
          <animateMotion
            {...motion(dOf([...bad.map(on), back]), [
              [tc, 0],
              [tc + 0.55, tipF],
              [tmc, tipF],
              [tmc + 0.25, 1],
            ])}
          />
        </circle>
      </Fade>
      <Fade t0={tc + 0.35} fade={0.12} then={[[tmc, 1], [tmc + 0.15, 0]]}>
        <Label at={badTip} dx={10} dy={5} cls="am-fig-accent">
          trainer collapses
        </Label>
      </Fade>
      <Fade t0={tmc + 0.1} fade={0.12} then={[[tmc + 1.6, 1], [tmc + 1.9, 0]]}>
        <Label at={back} dx={0} dy={34} anchor="middle">
          rolled back at the merge
        </Label>
      </Fade>

      <Fade t0={lastMerge} fade={0.2}>
        <Label at={on(GLOB)} dx={-14} dy={30} anchor="middle">
          global minimum
        </Label>
      </Fade>
      <Trail path={ROUTE} t0={OPM_T0} t1={lastMerge} prog={prog} cls="am-fig-ink-stroke" dot="am-fig-ink" width={3.4} r={6} />
    </>
  )
}

const SEGMENTS: Record<Key, () => JSX.Element> = { mtrl: MtrlSeg, casc: CascSeg, merge: MergeSeg, mopd: MopdSeg, opm: OpmSeg }
const END_FRAME = START.opm + LEN.opm - 0.5

export default function Landscape3D() {
  const b0 = on(B0)
  const gm = on(GLOB)
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Five training methods play one after another on the same loss landscape"
      data-anim-end={(END_FRAME * SPEED).toFixed(2)}
    >
      <g className="am-ls-grid" strokeWidth="0.6" strokeLinejoin="round">
        {QUADS.map((q, i) => (
          <polygon key={i} points={q.d} className={`am-ls-${q.k}`} fill={FALLBACK[q.k]} />
        ))}
      </g>
      <circle cx={gm[0]} cy={gm[1]} r={6} fill="none" className="am-fig-axis" strokeWidth="1.5" />
      {E.map((e, i) => (
        <circle key={i} cx={on(e)[0]} cy={on(e)[1]} r={4.5} fill="none" className={stroke(i)} strokeWidth="1.5" opacity="0.8" />
      ))}
      <circle cx={b0[0]} cy={b0[1]} r={5} className="am-fig-ink" />

      {ORDER.map((key) => {
        const s = START[key]
        const Seg = SEGMENTS[key]
        return (
          <g key={key} opacity="0">
            <animate
              attributeName="opacity"
              {...anim([
                [s, 0],
                [s + 0.25, 1],
                [s + LEN[key] - 0.3, 1],
                [s + LEN[key] - 0.02, 0],
              ])}
            />
            <text x={16} y={32} className="am-fig-ink am-ls-label" fontSize="20" fontWeight="700">
              {NAMES[key]}
            </text>
            <Seg />
          </g>
        )
      })}
    </svg>
  )
}
