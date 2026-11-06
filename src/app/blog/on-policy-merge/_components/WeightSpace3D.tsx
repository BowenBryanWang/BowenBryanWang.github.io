// Figure 2: one round in a 2D slice of weight space, seen from a fixed camera.
// Height is the summed second-order KL residual of the two domains,
// sum_i (n_i . (theta - X))^2 : each domain is a flat-bottomed trough (the null
// space of its Fisher) and the two troughs cross at the lossless point X.
// The trainers slide down their own troughs from the anchor, then the merge
// rules appear: average, task arithmetic (sum of updates) and the OPM merge.
// Server-rendered; animated with SVG <animate> only.

import { camera, deg, dOf, pts, track, wireframe, type V2 } from './surface'

const N1: V2 = [Math.cos(10 * deg), Math.sin(10 * deg)]
const N2: V2 = [Math.cos(70 * deg), Math.sin(70 * deg)]
const X: V2 = [0.25, 0.3]
const A0: V2 = [-0.75, -0.7]
const R = 1.1

const dot = (a: V2, b: V2) => a[0] * b[0] + a[1] * b[1]
const sub = (a: V2, b: V2): V2 => [a[0] - b[0], a[1] - b[1]]
const add = (a: V2, b: V2): V2 => [a[0] + b[0], a[1] + b[1]]
const mul = (a: V2, s: number): V2 => [a[0] * s, a[1] * s]
const lerp = (a: V2, b: V2, s: number): V2 => add(a, mul(sub(b, a), s))

const height = (p: V2) => Math.min(1.12, 0.33 * (dot(N1, sub(p, X)) ** 2 + dot(N2, sub(p, X)) ** 2))
const TH1 = sub(A0, mul(N1, dot(N1, sub(A0, X))))
const TH2 = sub(A0, mul(N2, dot(N2, sub(A0, X))))
const AVG = mul(add(TH1, TH2), 0.5)
const SUM = sub(add(TH1, TH2), A0)

const W = 760
const H = 460
const proj = camera({ yaw: -38 * deg, pitch: 30 * deg, scale: 205, cx: 380, cy: 262, centre: [0, 0], zScale: 0.75 })
const on = (p: V2) => proj(p, height(p) + 0.006)
const GRID = wireframe(height, proj, [0, 0], R, 22, 44)
const FLOOR = pts(([[-R, -R], [R, -R], [R, R], [-R, R], [-R, -R]] as V2[]).map((p) => proj(p, 0)))
const trough = (nv: V2) => {
  const d: V2 = [-nv[1], nv[0]]
  const out: V2[] = []
  for (let s = -2; s <= 2; s += 0.02) {
    const p = add(X, mul(d, s))
    if (Math.abs(p[0]) <= R && Math.abs(p[1]) <= R) out.push(on(p))
  }
  return pts(out)
}
const descent = (to: V2) => Array.from({ length: 31 }, (_, k) => on(lerp(A0, to, k / 30)))

const LOOP = 6.5
const DUR = `${LOOP}s`
const anim = (pairs: [number, number][]) => {
  const t = track(pairs)
  return { values: t.values, keyTimes: t.keyTimes, dur: DUR, repeatCount: 'indefinite' as const }
}
// the whole round fades out at the end of each loop
const FADE = anim([
  [0, 1],
  [0.93, 1],
  [1, 0],
])

function Trainer({ to, cls, dot: dotCls }: { to: V2; cls: string; dot: string }) {
  const q = descent(to)
  return (
    <g>
      <polyline points={pts(q)} fill="none" className={cls} strokeWidth="2" strokeDasharray="4 3" opacity="0">
        <animate attributeName="opacity" {...anim([[0.02, 0], [0.06, 1]])} />
      </polyline>
      <circle r={6} className={dotCls}>
        <animateMotion path={dOf(q)} keyPoints="0;0;1;1" keyTimes="0;0.02;0.32;1" calcMode="linear" dur={DUR} repeatCount="indefinite" />
      </circle>
    </g>
  )
}

function Candidate({ p, t, name, cls, dx, dy, anchor }: { p: V2; t: number; name: string; cls: string; dx: number; dy: number; anchor: 'start' | 'middle' | 'end' }) {
  const q = on(p)
  const floor = proj(p, 0)
  const a1 = on(TH1)
  const a2 = on(TH2)
  return (
    <g opacity="0">
      <animate attributeName="opacity" {...anim([[t, 0], [t + 0.06, 1]])} />
      <line x1={q[0]} y1={q[1]} x2={floor[0]} y2={floor[1]} className="am-fig-accent-stroke" strokeWidth="1" strokeDasharray="2 3" />
      <line x1={a1[0]} y1={a1[1]} x2={q[0]} y2={q[1]} className="am-fig-axis" strokeWidth="1" strokeDasharray="2 4" />
      <line x1={a2[0]} y1={a2[1]} x2={q[0]} y2={q[1]} className="am-fig-axis" strokeWidth="1" strokeDasharray="2 4" />
      <circle cx={q[0]} cy={q[1]} r={6} className="am-fig-accent" />
      <text x={q[0] + dx} y={q[1] + dy} textAnchor={anchor} className={cls} fontSize="13" fontWeight="700">
        {name}
      </text>
    </g>
  )
}

export default function WeightSpace3D() {
  const a0 = on(A0)
  const t1 = on(TH1)
  const t2 = on(TH2)
  const x = on(X)
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Two trainers descend their own troughs; the OPM merge lands where the troughs cross, the average and task arithmetic land on the walls"
      data-anim-end={`${LOOP * 0.9}`}
    >
      <polyline points={FLOOR} fill="none" className="am-fig-rule" strokeWidth="1" />
      {GRID.map((g, i) => (
        <polyline key={i} points={g} fill="none" className="am-fig-rule" strokeWidth="0.9" />
      ))}
      {/* the troughs are drawn only after the average and task arithmetic, just before the OPM merge */}
      {[
        { nv: N1, cls: 'am-fig-forest-stroke' },
        { nv: N2, cls: 'am-fig-indigo-stroke' },
      ].map(({ nv, cls }) => (
        <polyline key={cls} points={trough(nv)} fill="none" className={cls} strokeWidth="2.6" pathLength={1} strokeDasharray="1 1" strokeDashoffset="1">
          <animate attributeName="stroke-dashoffset" {...anim([[0.6, 1], [0.68, 0]])} />
          <animate attributeName="opacity" {...FADE} />
        </polyline>
      ))}

      <g>
        <animate attributeName="opacity" {...FADE} />
        <circle cx={a0[0]} cy={a0[1]} r={5.5} className="am-fig-ink" />
        <text x={a0[0] - 10} y={a0[1] - 10} textAnchor="end" className="am-fig-ink" fontSize="13" fontWeight="700">
          anchor
        </text>
        <Trainer to={TH1} cls="am-fig-forest-stroke" dot="am-fig-forest" />
        <Trainer to={TH2} cls="am-fig-indigo-stroke" dot="am-fig-indigo" />
        <g opacity="0">
          <animate attributeName="opacity" {...anim([[0.3, 0], [0.34, 1]])} />
          <text x={t1[0] + 12} y={t1[1] - 8} className="am-fig-forest" fontSize="13" fontWeight="700">
            trainer 1
          </text>
          <text x={t2[0] - 12} y={t2[1] + 20} textAnchor="end" className="am-fig-indigo" fontSize="13" fontWeight="700">
            trainer 2
          </text>
        </g>
        <Candidate p={AVG} t={0.38} name="average" cls="am-fig-accent" dx={-12} dy={4} anchor="end" />
        <Candidate p={SUM} t={0.5} name="task arithmetic" cls="am-fig-accent" dx={12} dy={-8} anchor="start" />
        <g opacity="0">
          <animate attributeName="opacity" {...anim([[0.7, 0], [0.75, 1]])} />
          <circle cx={x[0]} cy={x[1]} r={9} fill="none" className="am-fig-ink-stroke" strokeWidth="2">
            <animate attributeName="r" {...anim([[0.7, 9], [0.77, 15], [0.86, 9]])} />
          </circle>
          <circle cx={x[0]} cy={x[1]} r={4} className="am-fig-ink" />
          <text x={x[0] + 14} y={x[1] + 22} className="am-fig-ink" fontSize="13.5" fontWeight="700">
            OPM merge
          </text>
        </g>
      </g>
    </svg>
  )
}
