import { ANCHORS, MERGES } from './results'

// Figure 6 of the main results. Static server-rendered SVG with native
// <title> tooltips, like Figure 4; the numbers come from results.ts.

const f1 = (n: number) => n.toFixed(1)
const px = (n: number) => n.toFixed(1)

// ---------------------------------------------------------------------------
// Figure 6: the OPM model along its merges, three benchmarks on one scale.

const A = { W: 760, H: 318, L: 44, R: 8, TOP: 38, BOT: 54, GAP: 30, Y0: 20, Y1: 90 }

export function AnchorsFigure() {
  const n = ANCHORS.length
  const PW = (A.W - A.L - A.R - A.GAP * (n - 1)) / n
  const PH = A.H - A.TOP - A.BOT
  const bottom = A.TOP + PH
  const y = (val: number) => bottom - ((val - A.Y0) / (A.Y1 - A.Y0)) * PH
  const last = MERGES[MERGES.length - 1]
  const yTicks = [20, 40, 60, 80]

  return (
    <svg
      viewBox={`0 0 ${A.W} ${A.H}`}
      className="am-rf"
      role="img"
      aria-label="The OPM model after 0, 1, 3 and 5 merges on IFBench, pooled math and BFCL, against the finished baselines; the numbers are in Table 5"
    >
      {yTicks.map((t) => (
        <text key={t} x={A.L - 10} y={y(t) + 4} textAnchor="end" className="am-rf-tick">
          {t}
        </text>
      ))}
      {ANCHORS.map((p, i) => {
        const x0 = A.L + i * (PW + A.GAP)
        const x = (m: number) => x0 + 18 + (m / last) * (PW - 36)
        const refs = [...p.refs].sort((a, b) => b.v - a.v)
        return (
          <g key={p.key}>
            <text x={x0} y={20} className="am-rf-bench">
              {p.title}
            </text>
            {yTicks.map((t) => (
              <line key={t} x1={x0} x2={x0 + PW} y1={y(t)} y2={y(t)} className="am-rf-rule" />
            ))}
            <line x1={x0} x2={x0 + PW} y1={bottom} y2={bottom} className="am-rf-axis" />
            {MERGES.map((m) => (
              <text key={m} x={x(m)} y={bottom + 20} textAnchor="middle" className="am-rf-tick">
                {m}
              </text>
            ))}

            {/* finished baselines, labelled on the line */}
            {refs.map((r, k) => {
              const crowded = k > 0 && y(r.v) - y(refs[k - 1].v) < 18
              const below = crowded || r.v < p.opm[0]
              return (
                <g key={r.label}>
                  <line x1={x0} x2={x0 + PW} y1={y(r.v)} y2={y(r.v)} className="am-rf-ref" />
                  <text x={x0 + 6} y={y(r.v) + (below ? 15 : -6)} className="am-rf-reflabel">
                    {r.label} {f1(r.v)}
                  </text>
                </g>
              )
            })}

            {/* the OPM model */}
            <polyline
              points={p.opm.map((val, k) => `${px(x(MERGES[k]))},${px(y(val))}`).join(' ')}
              className="am-rf-line"
            />
            {p.opm.map((val, k) => (
              <circle key={k} cx={x(MERGES[k])} cy={y(val)} r={4.5} className="am-rf-pt">
                <title>
                  {`${p.title}, ${MERGES[k] === 0 ? 'base model' : `after ${MERGES[k]} merge${MERGES[k] > 1 ? 's' : ''}`}: ${f1(val)}`}
                </title>
              </circle>
            ))}
            <text x={x(0) - 6} y={y(p.opm[0]) + 20} className="am-rf-val">
              {f1(p.opm[0])}
            </text>
            <text x={x(last) + 6} y={y(p.opm[p.opm.length - 1]) + 20} textAnchor="end" className="am-rf-val">
              {f1(p.opm[p.opm.length - 1])}
            </text>
          </g>
        )
      })}
      <text x={A.L + (A.W - A.L - A.R) / 2} y={A.H - 8} textAnchor="middle" className="am-rf-tick">
        merges completed (0 is the base model)
      </text>
    </svg>
  )
}
