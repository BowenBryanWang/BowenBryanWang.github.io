// Figure 4: held-out KL residual of the guarded merge against CG iterations (data of Table 3).
// Static server-rendered SVG; native <title> tooltips on every point.

const ITERS = [1, 2, 3, 5, 10]
const SERIES = [
  { key: 'g1', label: 'γ = 1', name: 'full CG step', v: [10.71, 10.44, 11.1, 14.07, 21.89] },
  { key: 'g2', label: 'γ = ½', name: 'half step', v: [10.05, 8.74, 8.57, 9.34, 11.46] },
  { key: 'g3', label: 'γ = ¼', name: 'quarter step', v: [11.23, 10.11, 9.91, 10.08, 10.55] },
] as const
const SUM = 13.35
const AVG = 30.7
// finite-difference step 0.3, 3 iterations
const FD = { g1: 214.66, g2: 52.73, g3: 17.4 } as const

const W = 640
const H = 390
const L = 58
const R = 96
const TOP = 58
const BOT = 54
const PW = W - L - R
const PH = H - TOP - BOT
const Y0 = 5
const Y1 = 32

const x = (it: number) => L + 14 + (Math.log(it) / Math.log(10)) * (PW - 28)
const y = (v: number) => TOP + PH - ((v - Y0) / (Y1 - Y0)) * PH
const f = (n: number) => n.toFixed(1)

// right-end label positions, dodged so the two low lines do not collide
const END_LABEL: Record<string, number> = { g1: 21.89, g2: 12.15, g3: 9.85 }

export default function ResidualChart() {
  const xr = x(10) + 10
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="am-res"
      role="img"
      aria-label="Held-out KL residual against CG iterations for three step sizes; the half step at three iterations is lowest at 8.57 nats, below the sum at 13.35 and the average at 30.7"
    >
      {/* y grid and ticks */}
      {[10, 15, 20, 25, 30].map((t) => (
        <g key={t}>
          <line x1={L} x2={L + PW} y1={y(t)} y2={y(t)} className="am-res-grid" />
          <text x={L - 10} y={y(t) + 5} textAnchor="end" className="am-res-tick">
            {t}
          </text>
        </g>
      ))}
      <text x={L - 44} y={TOP - 30} className="am-res-axis-title">
        held-out KL residual (nats)
      </text>
      {/* x axis */}
      <line x1={L} x2={L + PW} y1={TOP + PH} y2={TOP + PH} className="am-res-baseline" />
      {ITERS.map((it) => (
        <text key={it} x={x(it)} y={TOP + PH + 24} textAnchor="middle" className="am-res-tick">
          {it}
        </text>
      ))}
      <text x={L + PW / 2} y={H - 6} textAnchor="middle" className="am-res-axis-title">
        CG iterations
      </text>

      {/* references */}
      {[
        { v: AVG, t: `average of the updates  ${AVG}` },
        { v: SUM, t: `sum of the updates  ${SUM}` },
      ].map((r) => (
        <g key={r.v}>
          <line x1={L} x2={L + PW} y1={y(r.v)} y2={y(r.v)} className="am-res-ref" />
          <text x={L + 8} y={y(r.v) - 8} className="am-res-ref-label">
            {r.t}
          </text>
        </g>
      ))}

      {/* finite-difference step 0.3: one point per γ at 3 iterations, two of them off the top */}
      <g>
        <line x1={x(3)} x2={x(3)} y1={y(FD.g3) - 7} y2={TOP - 6} className="am-res-fd" />
        <path d={`M ${x(3) - 5} ${TOP} L ${x(3)} ${TOP - 9} L ${x(3) + 5} ${TOP}`} className="am-res-fd-head" />
        <circle cx={x(3)} cy={y(FD.g3)} r={5} className="am-res-hollow am-res-g3">
          <title>{`finite-difference step 0.3, γ = ¼, 3 CG iterations: ${FD.g3} nats`}</title>
        </circle>
        <text x={x(3) + 10} y={TOP - 14} className="am-res-fd-label">
          FD step 0.3:{' '}
          <tspan className="am-res-g1-text">{f(FD.g1)}</tspan>
          {' · '}
          <tspan className="am-res-g2-text">{f(FD.g2)}</tspan>
          {' · '}
          <tspan className="am-res-g3-text">{f(FD.g3)}</tspan>
        </text>
      </g>

      {/* series */}
      {SERIES.map((s) => (
        <g key={s.key} className={`am-res-${s.key}`}>
          <polyline
            points={s.v.map((v, i) => `${f(x(ITERS[i]))},${f(y(v))}`).join(' ')}
            className="am-res-line"
          />
          {s.v.map((v, i) => (
            <circle key={i} cx={x(ITERS[i])} cy={y(v)} r={4.5} className="am-res-dot">
              <title>{`${s.label} (${s.name}), ${ITERS[i]} CG iteration${ITERS[i] > 1 ? 's' : ''}: ${v} nats`}</title>
            </circle>
          ))}
          <line
            x1={x(10) + 6}
            x2={xr}
            y1={y(s.v[4])}
            y2={y(END_LABEL[s.key])}
            className="am-res-leader"
          />
          <text x={xr + 4} y={y(END_LABEL[s.key]) + 5} className="am-res-label">
            {s.label}
          </text>
        </g>
      ))}

      {/* the default: 3 iterations, γ = ½ */}
      <circle cx={x(3)} cy={y(8.57)} r={10} className="am-res-pick" />
      <text x={x(3) + 14} y={y(8.57) + 24} className="am-res-pick-label">
        8.57, the default
      </text>
    </svg>
  )
}
