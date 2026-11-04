// Inline SVG figures. Figures 1 and 2 are schematics. Figure 3 plots numbers from the
// exact toy in /public/research/opm-toy (10 seeds, no sampling noise); the arrays are
// copied from its opm_*.json result files.

type Series = {
  label: string
  ys: (number | null)[]
  stroke: string // CSS class that sets `stroke`
  fill: string // CSS class that sets `fill` (for the markers)
  dash?: string
  width?: number
}

type ChartProps = {
  aria: string
  xLabels: string[]
  xTitle: string
  yTitle: string
  yMin: number
  yMax: number
  yTicks: number[]
  series: Series[]
  refLines?: { y: number; label: string; side?: 'left' | 'right' }[]
  band?: { from: number; to: number; label: string } // in x-index units
  legendCols?: number
  note?: string
}

function LineChart({
  aria,
  xLabels,
  xTitle,
  yTitle,
  yMin,
  yMax,
  yTicks,
  series,
  refLines = [],
  band,
  legendCols = 2,
  note,
}: ChartProps) {
  const W = 760
  const L = 64
  const R = W - 24
  const T = 34
  const plotH = 250
  const B = T + plotH
  const rows = Math.ceil(series.length / legendCols)
  const H = B + 58 + rows * 22
  const n = xLabels.length
  const px = (i: number) => L + 18 + ((R - L - 36) * i) / (n - 1)
  const py = (v: number) => B - ((v - yMin) / (yMax - yMin)) * plotH
  const colW = (R - L) / legendCols

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria}>
      {band && (
        <g>
          <rect
            x={px(band.from) - 14}
            y={T}
            width={px(band.to) - px(band.from) + 28}
            height={plotH}
            className="am-fig-band"
          />
          <text x={px(band.from) - 8} y={B - 8} className="am-fig-forest" fontSize="10.5" fontWeight="600">
            {band.label}
          </text>
        </g>
      )}
      <rect x={L} y={T} width={R - L} height={plotH} fill="none" className="am-fig-rule" />
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={L} x2={R} y1={py(v)} y2={py(v)} className="am-fig-rule" strokeDasharray="2 4" />
          <text x={L - 8} y={py(v) + 4} textAnchor="end" className="am-fig-text" fontSize="11">
            {v}
          </text>
        </g>
      ))}
      {xLabels.map((lab, i) => (
        <text key={lab} x={px(i)} y={B + 16} textAnchor="middle" className="am-fig-text" fontSize="11">
          {lab}
        </text>
      ))}
      <text x={(L + R) / 2} y={B + 36} textAnchor="middle" className="am-fig-text" fontSize="12">
        {xTitle}
      </text>
      <text
        x={16}
        y={(T + B) / 2}
        textAnchor="middle"
        className="am-fig-text"
        fontSize="12"
        transform={`rotate(-90 16 ${(T + B) / 2})`}
      >
        {yTitle}
      </text>

      {refLines.map((r) => (
        <g key={r.label}>
          <line x1={L} x2={R} y1={py(r.y)} y2={py(r.y)} className="am-fig-axis" strokeWidth="1.2" strokeDasharray="7 4" />
          <text
            x={r.side === 'left' ? L + 8 : R - 6}
            y={py(r.y) - 5}
            textAnchor={r.side === 'left' ? 'start' : 'end'}
            className="am-fig-text"
            fontSize="10.5"
          >
            {r.label}
          </text>
        </g>
      ))}

      {series.map((s) => {
        const pts = s.ys
          .map((y, i) => (y === null ? null : `${px(i).toFixed(1)},${py(Math.max(yMin, Math.min(yMax, y))).toFixed(1)}`))
          .filter(Boolean)
          .join(' ')
        return (
          <g key={s.label}>
            <polyline points={pts} fill="none" className={s.stroke} strokeWidth={s.width ?? 2.2} strokeDasharray={s.dash} />
            {s.ys.map((y, i) =>
              y === null ? null : (
                <circle key={i} cx={px(i)} cy={py(Math.max(yMin, Math.min(yMax, y)))} r={3} className={s.fill} />
              ),
            )}
          </g>
        )
      })}

      <g transform={`translate(${L}, ${B + 56})`}>
        {series.map((s, i) => {
          const cx = (i % legendCols) * colW
          const cy = Math.floor(i / legendCols) * 22
          return (
            <g key={s.label} transform={`translate(${cx}, ${cy})`}>
              <line x1="0" x2="26" y1="6" y2="6" className={s.stroke} strokeWidth={s.width ?? 2.2} strokeDasharray={s.dash} />
              <circle cx="13" cy="6" r="3" className={s.fill} />
              <text x="33" y="10" className="am-fig-text" fontSize="12">
                {s.label}
              </text>
            </g>
          )
        })}
      </g>
      {note && (
        <text x={R} y={T - 10} textAnchor="end" className="am-fig-accent" fontSize="10.5" fontWeight="600">
          {note}
        </text>
      )}
    </svg>
  )
}

/* Figure 2 (schematic): what a rendezvous does in weight space. */
export function GeometryFigure() {
  const W = 760
  const H = 392
  // Two specialists. S1 and S2 are the sets of weights that behave like
  // specialist 1 (resp. 2) on its own task, to second order: affine subspaces.
  const th0 = { x: 130, y: 300 }
  const th1 = { x: 340, y: 320 }
  const th2 = { x: 150, y: 150 }
  const d1 = { x: 0.45, y: -1 } // direction of S1
  const d2 = { x: 1, y: -0.15 } // direction of S2
  const at = (p: { x: number; y: number }, d: { x: number; y: number }, t: number) => ({
    x: p.x + d.x * t,
    y: p.y + d.y * t,
  })
  const X = at(th1, d1, 212.9) // S1 ∩ S2
  const avg = { x: (th1.x + th2.x) / 2, y: (th1.y + th2.y) / 2 }
  const ta = { x: th1.x + th2.x - th0.x, y: th1.y + th2.y - th0.y }
  const s1a = at(th1, d1, -30)
  const s1b = at(th1, d1, 300)
  const s2a = at(th2, d2, -50)
  const s2b = at(th2, d2, 570)
  const trueX = { x: 447, y: 177 } // where the curved sets cross
  const dot = (p: { x: number; y: number }, cls: string, r = 5) => <circle cx={p.x} cy={p.y} r={r} className={cls} />

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Weight-space picture of merging and distillation">
      <defs>
        <marker id="mg-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" className="am-fig-soft" />
        </marker>
      </defs>
      <text x={24} y={22} className="am-fig-accent" fontSize="10.5" fontWeight="600">
        SCHEMATIC
      </text>

      {/* the affine subspaces (quadratic model) */}
      <line x1={s1a.x} y1={s1a.y} x2={s1b.x} y2={s1b.y} className="am-fig-forest-stroke" strokeWidth="2" />
      <line x1={s2a.x} y1={s2a.y} x2={s2b.x} y2={s2b.y} className="am-fig-indigo-stroke" strokeWidth="2" />
      <text x={s1b.x + 8} y={s1b.y + 8} className="am-fig-forest" fontSize="13" fontWeight="700">
        S₁
      </text>
      <text x={s2b.x + 6} y={s2b.y + 5} className="am-fig-indigo" fontSize="13" fontWeight="700">
        S₂
      </text>
      {/* the true sets: tangent to the lines at the specialists, curving away */}
      <path
        d={`M ${th1.x} ${th1.y} Q 394 200, 520 120`}
        fill="none"
        className="am-fig-forest-stroke"
        strokeWidth="1.3"
        strokeDasharray="3 4"
      />
      <path
        d={`M ${th2.x} ${th2.y} Q 320 124.5, 470 190`}
        fill="none"
        className="am-fig-indigo-stroke"
        strokeWidth="1.3"
        strokeDasharray="3 4"
      />

      {/* task vectors */}
      <line x1={th0.x} y1={th0.y} x2={th1.x - 8} y2={th1.y - 1} className="am-fig-soft-stroke" strokeWidth="1.3" markerEnd="url(#mg-arrow)" />
      <line x1={th0.x} y1={th0.y} x2={th2.x - 1} y2={th2.y + 8} className="am-fig-soft-stroke" strokeWidth="1.3" markerEnd="url(#mg-arrow)" />
      <text x={235} y={329} textAnchor="middle" className="am-fig-text" fontSize="12.5">
        τ₁
      </text>
      <text x={122} y={230} textAnchor="end" className="am-fig-text" fontSize="12.5">
        τ₂
      </text>
      {/* parallelogram and the segment between the specialists */}
      <line x1={th1.x} y1={th1.y} x2={ta.x} y2={ta.y} className="am-fig-axis" strokeWidth="1" strokeDasharray="2 4" />
      <line x1={th2.x} y1={th2.y} x2={ta.x} y2={ta.y} className="am-fig-axis" strokeWidth="1" strokeDasharray="2 4" />
      <line x1={th1.x} y1={th1.y} x2={th2.x} y2={th2.y} className="am-fig-axis" strokeWidth="1" strokeDasharray="2 4" />

      {dot(th0, 'am-fig-faint')}
      <text x={th0.x - 8} y={th0.y + 20} textAnchor="end" className="am-fig-text" fontSize="12">
        base θ₀
      </text>
      {dot(th1, 'am-fig-forest')}
      <text x={th1.x + 12} y={th1.y + 18} className="am-fig-ink" fontSize="12" fontWeight="600">
        specialist θ₁
      </text>
      {dot(th2, 'am-fig-indigo')}
      <text x={th2.x - 44} y={th2.y - 16} className="am-fig-ink" fontSize="12" fontWeight="600">
        specialist θ₂
      </text>

      {dot(avg, 'am-fig-accent', 4.5)}
      <text x={avg.x - 10} y={avg.y + 5} textAnchor="end" className="am-fig-accent" fontSize="12" fontWeight="600">
        average
      </text>
      {dot(ta, 'am-fig-accent', 4.5)}
      <text x={ta.x - 12} y={ta.y + 22} textAnchor="end" className="am-fig-accent" fontSize="12" fontWeight="600">
        task arithmetic
      </text>

      {/* intersection under the quadratic model */}
      <circle cx={X.x} cy={X.y} r={7} fill="none" className="am-fig-ink-stroke" strokeWidth="2" />
      {dot(X, 'am-fig-ink', 3)}
      <text x={X.x - 12} y={X.y - 13} textAnchor="end" className="am-fig-ink" fontSize="12" fontWeight="700">
        OPM rendezvous point
      </text>
      {/* intersection of the true sets */}
      <circle cx={trueX.x} cy={trueX.y} r={6} fill="none" className="am-fig-ink-stroke" strokeWidth="1.6" strokeDasharray="2 2" />
      <text x={trueX.x + 13} y={trueX.y + 14} className="am-fig-ink" fontSize="12" fontWeight="700">
        where MOPD ends up
      </text>

      {/* legend */}
      <g transform="translate(470, 232)">
        <line x1="0" x2="26" y1="6" y2="6" className="am-fig-forest-stroke" strokeWidth="2" />
        <text x="34" y="10" className="am-fig-text" fontSize="12">
          S₁: acts like specialist 1 on task 1
        </text>
        <line x1="0" x2="26" y1="28" y2="28" className="am-fig-indigo-stroke" strokeWidth="2" />
        <text x="34" y="32" className="am-fig-text" fontSize="12">
          S₂: acts like specialist 2 on task 2
        </text>
        <line x1="0" x2="26" y1="50" y2="50" className="am-fig-axis" strokeWidth="1.3" strokeDasharray="3 4" />
        <text x="34" y="54" className="am-fig-text" fontSize="12">
          the true sets, which curve
        </text>
        <text x="34" y="76" className="am-fig-text" fontSize="12">
          solid lines: quadratic model at θᵢ
        </text>
      </g>
    </svg>
  )
}

/* Figure 1 (schematic): five ways to get one model out of several RL domains. */
export function ParadigmFigure() {
  const W = 760
  const H = 500
  const X0 = 250
  const X1 = 736
  const lanes = ['am-fig-forest-stroke', 'am-fig-indigo-stroke', 'am-fig-ochre-stroke']
  const fills = ['am-fig-forest', 'am-fig-indigo', 'am-fig-ochre']
  const offs = [-15, 0, 15]
  const rows = [
    { y: 62, name: 'Multi-task RL', sub: 'one trainer, mixed batches' },
    { y: 152, name: 'Specialists, merged once', sub: 'weight arithmetic at the end' },
    { y: 242, name: 'Specialists, then MOPD', sub: 'a student imitates the teachers' },
    { y: 338, name: 'On-Policy Merging', sub: 'train apart, meet often' },
    { y: 426, name: 'Cascade RL', sub: 'one domain after another' },
  ]
  // a lane that leaves the centre line at x0 and returns to it at x1
  const bulge = (x0: number, x1: number, y: number, off: number) =>
    `M ${x0} ${y} C ${x0 + (x1 - x0) * 0.3} ${y + off}, ${x1 - (x1 - x0) * 0.3} ${y + off}, ${x1} ${y}`
  // a lane that fans out to an offset and stays there
  const fan = (x0: number, x1: number, y: number, off: number) =>
    `M ${x0} ${y} C ${x0 + 26} ${y}, ${x0 + 22} ${y + off}, ${x0 + 48} ${y + off} L ${x1} ${y + off}`
  const meets = [X0, 292, 340, 402, 486, 598, X1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Five ways to train one model on several domains">
      <text x={24} y={22} className="am-fig-accent" fontSize="10.5" fontWeight="600">
        SCHEMATIC
      </text>
      {rows.map((r) => (
        <g key={r.name}>
          <text x={24} y={r.y - 2} className="am-fig-ink" fontSize="13" fontWeight="700">
            {r.name}
          </text>
          <text x={24} y={r.y + 15} className="am-fig-text" fontSize="11.5">
            {r.sub}
          </text>
        </g>
      ))}

      {/* Row 1: one trainer, mixed batches */}
      <line x1={X0} x2={X1} y1={rows[0].y} y2={rows[0].y} className="am-fig-ink-stroke" strokeWidth="2.4" />
      {Array.from({ length: 24 }).map((_, i) => (
        <circle key={i} cx={X0 + 12 + i * 20.4} cy={rows[0].y} r={4} className={fills[i % 3]} />
      ))}
      <text x={X1} y={rows[0].y - 14} textAnchor="end" className="am-fig-text" fontSize="11">
        every step sums the gradients of all domains
      </text>

      {/* Row 2: specialists, one merge */}
      {offs.map((o, i) => (
        <path key={i} d={fan(X0, 690, rows[1].y, o)} fill="none" className={lanes[i]} strokeWidth="2" />
      ))}
      {offs.map((o, i) => (
        <line key={i} x1={690} y1={rows[1].y + o} x2={720} y2={rows[1].y} className="am-fig-axis" strokeWidth="1" strokeDasharray="2 3" />
      ))}
      <circle cx={726} cy={rows[1].y} r={7} className="am-fig-accent" />
      <text x={X1} y={rows[1].y - 26} textAnchor="end" className="am-fig-text" fontSize="11">
        merged far from every policy that produced data
      </text>

      {/* Row 3: specialists, then a distillation stage */}
      {offs.map((o, i) => (
        <path key={i} d={fan(X0, 560, rows[2].y, o)} fill="none" className={lanes[i]} strokeWidth="2" />
      ))}
      <rect x={574} y={rows[2].y - 24} width={X1 - 574} height={48} rx="4" className="am-fig-band" />
      <line x1={582} x2={X1 - 8} y1={rows[2].y} y2={rows[2].y} className="am-fig-ink-stroke" strokeWidth="2.4" />
      {offs.map((o, i) => (
        <line key={i} x1={560} y1={rows[2].y + o} x2={582} y2={rows[2].y} className="am-fig-axis" strokeWidth="1" strokeDasharray="2 3" />
      ))}
      <text x={X1} y={rows[2].y - 32} textAnchor="end" className="am-fig-text" fontSize="11">
        new student rollouts, teacher logits, no reward
      </text>

      {/* Row 4: on-policy merging */}
      {meets.slice(0, -1).map((x, k) =>
        offs.map((o, i) => (
          <path key={`${k}-${i}`} d={bulge(x, meets[k + 1], rows[3].y, o * 1.25)} fill="none" className={lanes[i]} strokeWidth="2" />
        )),
      )}
      {meets.slice(1).map((x) => (
        <g key={x}>
          <circle cx={x} cy={rows[3].y} r={6.5} fill="none" className="am-fig-ink-stroke" strokeWidth="2" />
          <circle cx={x} cy={rows[3].y} r={2.6} className="am-fig-ink" />
        </g>
      ))}
      <text x={X1} y={rows[3].y - 32} textAnchor="end" className="am-fig-text" fontSize="11">
        rendezvous when a trainer drifts δ nats from the anchor
      </text>

      {/* Row 5: cascade RL (drawn last, listed as a baseline) */}
      {[0, 1, 2].map((i) => {
        const w = (X1 - X0) / 3
        return (
          <g key={i}>
            <line
              x1={X0 + i * w + (i === 0 ? 0 : 3)}
              x2={X0 + (i + 1) * w - (i === 2 ? 0 : 3)}
              y1={rows[4].y}
              y2={rows[4].y}
              className={lanes[i]}
              strokeWidth="3.2"
            />
            {i > 0 && <line x1={X0 + i * w} x2={X0 + i * w} y1={rows[4].y - 9} y2={rows[4].y + 9} className="am-fig-axis" strokeWidth="1.2" />}
          </g>
        )
      })}
      <text x={X1} y={rows[4].y - 16} textAnchor="end" className="am-fig-text" fontSize="11">
        each stage starts from the last; nothing holds the earlier domains
      </text>

      {/* legend + axis */}
      <g transform={`translate(${X0}, ${H - 26})`}>
        {['domain A', 'domain B', 'domain C'].map((lab, i) => (
          <g key={lab} transform={`translate(${i * 112}, 0)`}>
            <line x1="0" x2="24" y1="5" y2="5" className={lanes[i]} strokeWidth="2.2" />
            <text x="31" y="9" className="am-fig-text" fontSize="11.5">
              {lab}
            </text>
          </g>
        ))}
      </g>
      <text x={X1} y={H - 17} textAnchor="end" className="am-fig-text" fontSize="11.5">
        training time →
      </text>
    </svg>
  )
}

/* Figure 3 (toy data): the four paradigms at an equal number of optimizer steps per task. */
export function HeadToHeadFigure() {
  return (
    <LineChart
      aria="Mean success of one model on four tasks against the training budget"
      xLabels={['25', '50', '100', '200']}
      xTitle="optimizer steps per task"
      yTitle="mean success of the single model"
      yMin={0.3}
      yMax={1.0}
      yTicks={[0.4, 0.6, 0.8, 1.0]}
      legendCols={2}
      note="EXACT TOY · 10 SEEDS · A SIGNAL, NOT A RESULT AT SCALE"
      series={[
        {
          label: 'On-Policy Merging (10 CG iterations, KL trigger 0.1)',
          ys: [0.802, 0.948, 0.985, 0.995],
          stroke: 'am-fig-ink-stroke',
          fill: 'am-fig-ink',
          width: 2.8,
        },
        {
          label: 'periodic task arithmetic (same loop, no metric)',
          ys: [0.604, 0.75, 0.891, 0.967],
          stroke: 'am-fig-ochre-stroke',
          fill: 'am-fig-ochre',
          dash: '5 4',
        },
        {
          label: 'multi-task RL',
          ys: [0.552, 0.688, 0.86, 0.945],
          stroke: 'am-fig-forest-stroke',
          fill: 'am-fig-forest',
        },
        {
          label: 'specialists, then MOPD (best budget split)',
          ys: [0.55, 0.641, 0.778, 0.876],
          stroke: 'am-fig-indigo-stroke',
          fill: 'am-fig-indigo',
        },
        {
          label: 'specialists, then task arithmetic (oracle coefficient)',
          ys: [0.537, 0.55, 0.554, 0.556],
          stroke: 'am-fig-accent-stroke',
          fill: 'am-fig-accent',
        },
      ]}
    />
  )
}
