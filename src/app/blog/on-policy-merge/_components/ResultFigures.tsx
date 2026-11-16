import { MERGE_LOG, installed } from './mergelog'
import {
  BENCHES,
  BFCL_SPLIT,
  BFCL_SPLIT_REFS,
  GENERAL,
  GENERAL_BASE,
  KEPT,
  METHODS,
  OPM_MERGES,
  TRAJ,
  TRAJ_MERGES,
  score,
  type BenchKey,
  type MethodKey,
} from './results'

// Static figures of Main results and Side findings (the score bars are in
// ScoresFigure). Server-rendered SVG with native <title> tooltips; the numbers
// come from results.ts and mergelog.ts.

const f1 = (n: number) => n.toFixed(1)
const px = (n: number) => n.toFixed(1)
const label = (k: MethodKey) => METHODS.find((m) => m.key === k)?.label ?? k

/** A horizontal bar from x0 to x1 with a rounded data end. */
function hbar(x0: number, x1: number, cy: number, h: number) {
  const d = x1 >= x0 ? 1 : -1
  const r = Math.min(3, Math.abs(x1 - x0) / 2)
  return `M${px(x0)},${px(cy - h)} H${px(x1 - d * r)} Q${px(x1)},${px(cy - h)} ${px(x1)},${px(cy - h + r)} V${px(
    cy + h - r,
  )} Q${px(x1)},${px(cy + h)} ${px(x1 - d * r)},${px(cy + h)} H${px(x0)} Z`
}

// ---------------------------------------------------------------------------
// General ability: three benchmarks no method trains on, for every specialist and
// every combined model, as the difference to the base model. Only the zero
// line carries an absolute score, the base model's.

const G = { W: 760, NAME: 150, GAP: 30, TOP: 34, ROW: 23, SEP: 10, BOT: 30 }
const G_PANELS: {
  key: 'mmlu' | 'gpqa' | 'hle'
  title: string
  /** Range and ticks of the difference axis, in points. */
  lo: number
  hi: number
  ticks: number[]
  dp: number
}[] = [
  { key: 'mmlu', title: 'MMLU-Pro', lo: -4, hi: 9, ticks: [5], dp: 1 },
  { key: 'gpqa', title: 'GPQA Diamond', lo: -13, hi: 23, ticks: [20], dp: 1 },
  { key: 'hle', title: 'HLE', lo: -3, hi: 7, ticks: [5], dp: 2 },
]

export function GeneralFigure() {
  const PW = (G.W - G.NAME - G.GAP * (G_PANELS.length - 1)) / G_PANELS.length
  const rowY: number[] = []
  let yy = G.TOP
  GENERAL.forEach((g) => {
    if (g.gap) yy += G.SEP
    rowY.push(yy + G.ROW / 2)
    yy += G.ROW
  })
  const bottom = yy
  const H = bottom + G.BOT
  const firstCombined = GENERAL.findIndex((g) => g.gap)

  return (
    <svg
      viewBox={`0 0 ${G.W} ${H}`}
      className="am-rf"
      role="img"
      aria-label="MMLU-Pro, GPQA Diamond and HLE of the eight specialists and the combined models, as the difference to the base model in points; the scores are in Tables F8 and F1"
    >
      <text x={0} y={18} className="am-rf-tick">
        Specialists
      </text>
      {GENERAL.map((g, i) => (
        <text key={g.label} x={0} y={rowY[i] + 4.5} className="am-rf-domain am-rf-rowname">
          {g.label}
        </text>
      ))}
      {G_PANELS.map((p, j) => {
        const x0 = G.NAME + j * (PW + G.GAP)
        const x = (d: number) => x0 + ((d - p.lo) / (p.hi - p.lo)) * (PW - 40)
        const base = GENERAL_BASE[p.key]
        const diff = (d: number) => `${d >= 0 ? '+' : '−'}${Math.abs(d).toFixed(p.dp)}`
        return (
          <g key={p.key}>
            <text x={x0} y={18} className="am-rf-head">
              {p.title}
            </text>
            {p.ticks.map((t) => (
              <g key={t}>
                <line x1={x(t)} x2={x(t)} y1={G.TOP - 4} y2={bottom} className="am-rf-rule" />
                <text x={x(t)} y={bottom + 18} textAnchor="middle" className="am-rf-tick">
                  {t > 0 ? `+${t}` : `−${-t}`}
                </text>
              </g>
            ))}
            <line x1={x(0)} x2={x(0)} y1={G.TOP - 4} y2={bottom} className="am-rf-axis" />
            <text x={x(0)} y={bottom + 18} textAnchor="middle" className="am-rf-val">
              Base {base.toFixed(p.dp)}
            </text>
            {GENERAL.map((g, i) => {
              const val = g[p.key]
              if (val === undefined) {
                return (
                  <text key={g.label} x={x(0) + 8} y={rowY[i] + 4.5} className="am-rf-tick">
                    –
                  </text>
                )
              }
              const d = val - base
              const up = d >= 0
              return (
                <g key={g.label}>
                  <title>{`${g.label}, ${p.title}: ${val.toFixed(p.dp)}, ${diff(d)} against the base model`}</title>
                  <path d={hbar(x(0), x(d), rowY[i], 7)} style={{ fill: `var(--m-${g.color})` }} />
                  <text
                    x={x(d) + (up ? 6 : -6)}
                    y={rowY[i] + 4.5}
                    textAnchor={up ? 'start' : 'end'}
                    className="am-rf-val"
                  >
                    {diff(d)}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}
      {firstCombined > 0 ? (
        <line
          x1={0}
          x2={G.W}
          y1={rowY[firstCombined] - G.ROW / 2 - G.SEP / 2}
          y2={rowY[firstCombined] - G.ROW / 2 - G.SEP / 2}
          className="am-rf-rule"
        />
      ) : null}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Trajectory: the OPM model along its merges, twelve panels in four columns.
// Dashed lines are the finished baselines.

// R leaves room for the value label to the right of a line's last point.
const T = { W: 196, H: 132, L: 26, R: 30, TOP: 14, BASE: 104 }
const T_XTICKS = [0, 5, 10, 15, 20]
const T_KEYS: MethodKey[] = ['mtrl', 'ta1', 'mopd']

export function TrajFigure() {
  return (
    <div className="am-bars">
      <div className="am-bars-grid">
        {TRAJ.map((p) => {
          const x = (m: number) => T.L + 8 + (m / TRAJ_MERGES) * (T.W - T.L - T.R - 16)
          const y = (val: number) => T.BASE - ((val - p.lo) / (p.hi - p.lo)) * (T.BASE - T.TOP)
          const fv = (val: number) => val.toFixed(p.dp ?? 1)
          return (
            <div className="am-bars-panel" key={p.key}>
              <svg viewBox={`0 0 ${T.W} ${T.H}`} role="img" aria-label={`${p.title}: the OPM model along its merges`}>
                {p.ticks.map((t) => (
                  <g key={t}>
                    <line
                      x1={T.L}
                      x2={T.W - T.R + 6}
                      y1={y(t)}
                      y2={y(t)}
                      className={t === p.lo ? 'am-bars-axis' : 'am-bars-grid-line'}
                    />
                    <text x={T.L - 6} y={y(t) + 3.5} textAnchor="end" className="am-bars-tick">
                      {t}
                    </text>
                  </g>
                ))}
                {T_XTICKS.map((m) => (
                  <text key={m} x={x(m)} y={T.BASE + 13} textAnchor="middle" className="am-bars-x">
                    {m}
                  </text>
                ))}
                {p.refs.map((r, ri) => (
                  <line
                    key={r.key}
                    x1={T.L}
                    x2={T.W - T.R + 6}
                    y1={y(r.v)}
                    y2={y(r.v)}
                    className="am-traj-ref"
                    // two baselines with the same score: shift the dashes so both colours show
                    style={{
                      stroke: `var(--m-${r.key})`,
                      strokeDashoffset: p.refs.findIndex((o) => o.v === r.v) < ri ? 4.5 : undefined,
                    }}
                  >
                    <title>{`${p.title}, ${label(r.key)}: ${fv(r.v)}`}</title>
                  </line>
                ))}
                {p.lines.map((ln, li) => {
                  const end = ln.pts[ln.pts.length - 1]
                  // A named line carries its name inside the plot: above the first line, below the second.
                  const mid = ln.pts[Math.floor(ln.pts.length / 2) + 1]
                  const what = ln.name ? `${p.title}, ${ln.name}` : p.title
                  return (
                    <g key={li}>
                      <polyline
                        points={ln.pts.map(([m, val]) => `${px(x(m))},${px(y(val))}`).join(' ')}
                        className="am-traj-line"
                      />
                      {ln.pts.map(([m, val]) => (
                        <circle key={m} cx={x(m)} cy={y(val)} r={3.2} className="am-traj-pt">
                          <title>
                            {`${what}, ${m === 0 ? 'base model' : `after ${m} merge${m > 1 ? 's' : ''}`}: ${fv(val)}`}
                          </title>
                        </circle>
                      ))}
                      <text x={x(end[0]) + 7} y={y(end[1]) + 3.5} className="am-bars-val">
                        {fv(end[1])}
                      </text>
                      {ln.name ? (
                        <text
                          x={x(mid[0])}
                          y={y(mid[1]) + (li === 0 ? -8 : 15)}
                          textAnchor="middle"
                          className="am-bars-tick"
                        >
                          {ln.name}
                        </text>
                      ) : null}
                    </g>
                  )
                })}
              </svg>
              <div className="am-bars-name">
                <strong>{p.title}</strong>
                <span>{p.sub}</span>
              </div>
            </div>
          )
        })}
      </div>
      <div className="am-bars-legend">
        <span className="am-bars-key">
          <svg viewBox="0 0 22 10" aria-hidden="true">
            <line x1={1} x2={21} y1={5} y2={5} className="am-traj-line" />
            <circle cx={11} cy={5} r={3} className="am-traj-pt" />
          </svg>
          OPM
        </span>
        {T_KEYS.map((k) => (
          <span className="am-bars-key" key={k}>
            <svg viewBox="0 0 22 10" aria-hidden="true">
              <line x1={1} x2={21} y1={5} y2={5} className="am-traj-ref" style={{ stroke: `var(--m-${k})` }} />
            </svg>
            {label(k)}
          </span>
        ))}
        <p>The horizontal axis is the number of merges completed; 0 is the base model.</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// The merges themselves: at every merge, the KL residual of the plain sum and
// of the guarded merge as a share of the trainers' drift, one vertical pair
// per merge.

const K = { W: 760, H: 236, X0: 44, X1: 748, TOP: 40, BOT: 188 }

export function MergeFigure() {
  const n = MERGE_LOG.length
  const gx = (merge: number) => K.X0 + 16 + ((merge - 1) / (n - 1)) * (K.X1 - K.X0 - 32)
  const gy = (pct: number) => K.BOT - (pct / 100) * (K.BOT - K.TOP)
  return (
    <svg
      viewBox={`0 0 ${K.W} ${K.H}`}
      className="am-rf"
      role="img"
      aria-label={`At each of the ${n} merges, the KL residual of the plain sum and of the guarded merge as a share of the trainers' drift. The guarded merge is lower at every merge.`}
    >
      <g transform="translate(44, 18)">
        <circle cx={5} cy={-4} r={4.5} className="am-rf-bar" />
        <text x={15} y={0} className="am-rf-tick">
          guarded merge
        </text>
        <circle cx={118} cy={-4} r={4.5} className="am-rf-open" />
        <text x={128} y={0} className="am-rf-tick">
          plain sum of the updates
        </text>
      </g>
      {[0, 50, 100].map((t) => (
        <g key={t}>
          <line x1={K.X0} x2={K.X1} y1={gy(t)} y2={gy(t)} className={t === 0 ? 'am-rf-axis' : 'am-rf-rule'} />
          <text x={K.X0 - 6} y={gy(t) + 4} textAnchor="end" className="am-rf-tick">
            {t}%
          </text>
        </g>
      ))}
      <text x={K.X1} y={gy(100) - 5} textAnchor="end" className="am-rf-tick am-rf-small">
        no merge
      </text>
      {MERGE_LOG.map((r) => {
        const sum = (100 * r.sum) / r.none
        const guarded = (100 * installed(r)) / r.none
        return (
          <g key={r.merge}>
            <title>{`Merge ${r.merge} (${r.from}): the plain sum leaves ${f1(sum)}% of the trainers' drift, the guarded merge ${f1(guarded)}%`}</title>
            <line x1={gx(r.merge)} x2={gx(r.merge)} y1={gy(guarded)} y2={gy(sum)} className="am-rf-link" />
            <circle cx={gx(r.merge)} cy={gy(sum)} r={4.5} className="am-rf-open" />
            <circle cx={gx(r.merge)} cy={gy(guarded)} r={5} className="am-rf-bar" />
            <text x={gx(r.merge)} y={K.BOT + 16} textAnchor="middle" className="am-rf-tick">
              {r.merge}
            </text>
          </g>
        )
      })}
      <text x={(K.X0 + K.X1) / 2} y={K.BOT + 38} textAnchor="middle" className="am-rf-tick">
        merge
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Residual per trainer: what the merges it joined left of its update.

const R = { W: 760, NAME: 0, COUNT: 250, X0: 270, X1: 640, MAX: 30, ROW: 23, TOP: 30 }

export function ResidualFigure() {
  const x = (pct: number) => R.X0 + (pct / R.MAX) * (R.X1 - R.X0)
  const bottom = R.TOP + R.ROW * KEPT.length
  return (
    <svg
      viewBox={`0 0 ${R.W} ${bottom + 26}`}
      className="am-rf"
      role="img"
      aria-label={`Per trainer, the KL residual left by the first ${OPM_MERGES} merges as a share of its drift, and the number of merges it contributed to.`}
    >
      <text x={R.COUNT} y={18} textAnchor="end" className="am-rf-tick am-rf-small">
        merges joined
      </text>
      <text x={R.X0} y={18} className="am-rf-tick am-rf-small">
        KL residual, share of the trainer’s drift
      </text>
      {[0, 10, 20, 30].map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={R.TOP - 2} y2={bottom} className={t === 0 ? 'am-rf-axis' : 'am-rf-rule'} />
          <text x={x(t)} y={bottom + 18} textAnchor="middle" className="am-rf-tick">
            {t}%
          </text>
        </g>
      ))}
      {KEPT.map((d, i) => {
        const cy = R.TOP + R.ROW * i + R.ROW / 2
        return (
          <g key={d.domain}>
            <title>{`${d.domain}: residual ${f1(d.resid)}% of drift over ${d.merges} merge${d.merges > 1 ? 's' : ''}`}</title>
            <text x={R.NAME} y={cy + 4.5} className="am-rf-domain am-rf-rowname">
              {d.domain}
            </text>
            <text x={R.COUNT} y={cy + 4.5} textAnchor="end" className="am-rf-tick">
              {d.merges}
            </text>
            <path d={hbar(x(0), x(d.resid), cy, 6)} className="am-rf-bar" />
            <text x={x(d.resid) + 7} y={cy + 4.5} className="am-rf-val">
              {f1(d.resid)}%
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Figure 1, lower strip: five benchmarks, one small bar chart each (base,
// multi-task RL, MOPD, OPM), each on its own axis. HTML and CSS, so the labels
// stay sharp.

const HERO: BenchKey[] = ['ifb', 'swepro', 'tb', 'bc', 'tau2']
const HERO_COLS: { key: MethodKey; name: string }[] = [
  { key: 'base', name: 'Base' },
  { key: 'mtrl', name: 'MTRL' },
  { key: 'mopd', name: 'MOPD' },
  { key: 'opm', name: 'OPM' },
]
const HERO_H = 56 // height of the tallest bar, in px
const HERO_MIN = 6 // a bar is never shorter than this, in px

export function HeroResults() {
  return (
    <div className="am-hero">
      {HERO.map((b) => {
        const bench = BENCHES.find((q) => q.key === b)
        const vals = HERO_COLS.map((c) => score(b, c.key))
        if (!bench || vals.some((v) => !v)) return null
        // Each tile has its own axis: from the lower end of the benchmark's
        // range in Figure 4 to the tile's highest score.
        const max = Math.max(...vals.map((v) => v!.m))
        const lo = Math.min(bench.lo, Math.min(...vals.map((v) => v!.m)))
        const h = (m: number) => Math.max(HERO_MIN, (HERO_H * (m - lo)) / (max - lo))
        return (
          <div className="am-hero-tile" key={b}>
            <div className="am-hero-bars">
              {HERO_COLS.map((c, i) => (
                <div className={`am-hero-col am-hero-${c.key}`} key={c.key}>
                  <span className="am-hero-val">{vals[i]!.m.toFixed(bench.dp)}</span>
                  <span className="am-hero-bar" style={{ height: `${h(vals[i]!.m).toFixed(1)}px` }} />
                </div>
              ))}
            </div>
            <div className="am-hero-labels">
              {HERO_COLS.map((c) => (
                <span className={`am-hero-${c.key}`} key={c.key}>
                  {c.name}
                </span>
              ))}
            </div>
            <div className="am-hero-name">
              {bench.title}
              <span>{bench.domain}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// BFCL by item type along the OPM run: items that need a function call and
// items where none should be made. Finished baselines as dots at the right.

const B = { W: 760, H: 250, X0: 44, X1: 590, TOP: 30, BOT: 200, LO: 50, HI: 80, REF0: 650, REF: 62 }
const B_SERIES = [
  { key: 'call', name: 'items that need a call', stroke: 'var(--m-opm)' },
  { key: 'none', name: 'items that need no call', stroke: 'var(--f4-other)' },
] as const

export function BfclFigure() {
  const last = BFCL_SPLIT[BFCL_SPLIT.length - 1]
  const x = (m: number) => B.X0 + 10 + (m / last.merge) * (B.X1 - B.X0 - 20)
  const y = (v: number) => B.BOT - ((v - B.LO) / (B.HI - B.LO)) * (B.BOT - B.TOP)
  return (
    <svg
      viewBox={`0 0 ${B.W} ${B.H}`}
      className="am-rf"
      role="img"
      aria-label="BFCL accuracy of the OPM model along its merges, separately for items that need a function call and items that need none, with multi-task RL and MOPD for reference. Accuracy on items that need a call rises; accuracy on items that need none falls."
    >
      {B_SERIES.map((g, n) => (
        <g key={g.key} transform={`translate(${B.X0 + n * 176}, 18)`}>
          <line x1={0} x2={18} y1={-4} y2={-4} style={{ stroke: g.stroke, strokeWidth: 2.25 }} />
          <circle cx={9} cy={-4} r={3.2} className="am-rf-dot" style={{ fill: g.stroke }} />
          <text x={25} y={0} className="am-rf-tick">
            {g.name}
          </text>
        </g>
      ))}
      {[50, 60, 70, 80].map((t) => (
        <g key={t}>
          <line x1={B.X0} x2={B.W} y1={y(t)} y2={y(t)} className={t === B.LO ? 'am-rf-axis' : 'am-rf-rule'} />
          <text x={B.X0 - 6} y={y(t) + 4} textAnchor="end" className="am-rf-tick">
            {t}
          </text>
        </g>
      ))}
      {[0, 5, 10, 15, 20].map((m) => (
        <text key={m} x={x(m)} y={B.BOT + 16} textAnchor="middle" className="am-rf-tick">
          {m}
        </text>
      ))}
      <text x={(B.X0 + B.X1) / 2} y={B.BOT + 38} textAnchor="middle" className="am-rf-tick">
        OPM, merges completed (0 is the base model)
      </text>
      {B_SERIES.map((g) => (
        <g key={g.key}>
          <polyline
            points={BFCL_SPLIT.map((d) => `${px(x(d.merge))},${px(y(d[g.key]))}`).join(' ')}
            style={{ fill: 'none', stroke: g.stroke, strokeWidth: 2.25, strokeLinejoin: 'round' }}
          />
          {BFCL_SPLIT.map((d) => (
            <circle key={d.merge} cx={x(d.merge)} cy={y(d[g.key])} r={3.2} className="am-rf-dot" style={{ fill: g.stroke }}>
              <title>{`${d.merge === 0 ? 'Base model' : `After ${d.merge} merges`}, ${g.name}: ${f1(d[g.key])}`}</title>
            </circle>
          ))}
          <text x={x(last.merge) + 8} y={y(last[g.key]) + 4} className="am-rf-val">
            {f1(last[g.key])}
          </text>
        </g>
      ))}
      {BFCL_SPLIT_REFS.map((r, n) => {
        const rx = B.REF0 + n * B.REF
        return (
          <g key={r.key}>
            <text x={rx} y={B.BOT + 16} textAnchor="middle" className="am-rf-tick">
              {label(r.key)}
            </text>
            {B_SERIES.map((g) => (
              <g key={g.key}>
                <title>{`${label(r.key)}, ${g.name}: ${f1(r[g.key])}`}</title>
                <circle cx={rx} cy={y(r[g.key])} r={4.5} className="am-rf-dot" style={{ fill: g.stroke }} />
                <text x={rx + 8} y={y(r[g.key]) + (g.key === 'call' ? -4 : 12)} className="am-rf-tick am-rf-small">
                  {f1(r[g.key])}
                </text>
              </g>
            ))}
          </g>
        )
      })}
    </svg>
  )
}
