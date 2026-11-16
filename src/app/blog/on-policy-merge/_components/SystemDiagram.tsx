// Figure 3: the OPM system as one flow, left to right.
// Domains are grouped; every group has one trainer that runs on-policy RL
// without pausing; a merge takes a snapshot of every trainer, solves the
// guarded merge on the snapshots, and each trainer adds the difference between
// the merged model and its snapshot.
// Shapes: a pill is a domain, a hexagon is a set of weights, a rectangle is a
// process. Ink for training, the accent colour for the merge.
// Styles are in _styles/system.css.

const W = 760
const H = 400
const ROWS = [104, 190, 276]

const GROUPS = [['Math'], ['Software engineering', 'Terminal'], ['Search', 'Tool use']]
const MERGE_STEPS = ['Fisher products', 'CG from the sum', 'line search', 'per-trainer check']

// Geometry, in viewBox units.
const G = {
  BASE: { x: 44, r: 26 },
  GROUP: { x: 112, w: 144, pill: 24, gap: 4, pad: 8 },
  PANEL_T: { x: 270, w: 140 }, // trainers
  TRAINER: { x: 280, w: 120, h: 50 },
  PANEL_M: { x: 422, w: 338 }, // merge
  PANEL_Y: 36,
  PANEL_H: 310,
  SNAP: { x: 462, r: 20 },
  MERGE: { x: 524, w: 140, y: 136, h: 110 },
  OUT: { x: 716, r: 24 },
  RETURN_Y: 368,
}

// A hexagon with a vertex at the top; its left and right sides are vertical.
function hex(cx: number, cy: number, r: number) {
  const a = r * 0.866
  const b = r * 0.5
  return [
    [cx, cy - r],
    [cx + a, cy - b],
    [cx + a, cy + b],
    [cx, cy + r],
    [cx - a, cy + b],
    [cx - a, cy - b],
  ]
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')
}

// A numbered step label: a small ring with the number, then the name.
function Step({ x, y, n, name, note }: { x: number; y: number; n: number; name: string; note: string }) {
  return (
    <g>
      <circle className="am-fl-stepring" cx={x + 8} cy={y - 4.5} r={8} />
      <text className="am-fl-stepnum" x={x + 8} y={y - 4.5} textAnchor="middle" dominantBaseline="central">
        {n}
      </text>
      <text className="am-fl-t am-fl-b" x={x + 22} y={y}>
        {name}
      </text>
      <text className="am-fl-s" x={x} y={y + 16}>
        {note}
      </text>
    </g>
  )
}

export default function SystemDiagram() {
  const mergeMid = G.MERGE.y + G.MERGE.h / 2
  const snapRight = G.SNAP.x + G.SNAP.r * 0.866 + 1
  const elbowX = 502

  return (
    <svg
      className="am-fl"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Flow of the OPM system. On the left, the base model feeds groups of domains: math alone, software engineering with terminal, search with tool use, and more. Each group has one trainer that runs on-policy RL without pausing. On the right, an asynchronous merge in three steps: a snapshot of every trainer is taken when a drift reaches its cap; the guarded merge is solved on the snapshots, through Fisher products, conjugate gradient from the sum, a line search and a per-trainer check, while the trainers keep training; and every trainer adds the difference between the merged model and its snapshot, with the merged model as the new anchor."
    >
      <defs>
        <marker id="am-fl-arrow" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="8" refX="8" refY="4" orient="auto">
          <path className="am-fl-arrow" d="M0.5,0.8 L8.5,4 L0.5,7.2 Z" />
        </marker>
        <marker id="am-fl-arrow-acc" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="9" refX="9" refY="4.5" orient="auto">
          <path className="am-fl-arrow-acc" d="M0.5,0.8 L9.5,4.5 L0.5,8.2 Z" />
        </marker>
      </defs>

      {/* ---- headers and panels ---- */}
      <text className="am-fl-head" x={G.GROUP.x + G.GROUP.w / 2} y={22} textAnchor="middle">
        Grouped domains
      </text>
      <text className="am-fl-head" x={G.PANEL_T.x + G.PANEL_T.w / 2} y={22} textAnchor="middle">
        One trainer per group
      </text>
      <text className="am-fl-head" x={G.PANEL_M.x + G.PANEL_M.w / 2} y={22} textAnchor="middle">
        Async merge
      </text>
      <rect className="am-fl-panel" x={G.PANEL_T.x} y={G.PANEL_Y} width={G.PANEL_T.w} height={G.PANEL_H} rx={10} />
      <rect className="am-fl-panel" x={G.PANEL_M.x} y={G.PANEL_Y} width={G.PANEL_M.w} height={G.PANEL_H} rx={10} />

      {/* ---- base model ---- */}
      <polygon className="am-fl-hex" points={hex(G.BASE.x, ROWS[1], G.BASE.r)} />
      <text className="am-fl-t" x={G.BASE.x} y={ROWS[1]} textAnchor="middle" dominantBaseline="central">
        θ₀
      </text>
      <text className="am-fl-t" x={G.BASE.x} y={ROWS[1] + G.BASE.r + 17} textAnchor="middle">
        Base model
      </text>
      {ROWS.map((y, i) => {
        const x0 = G.BASE.x + G.BASE.r * 0.866 + 1
        const x1 = G.GROUP.x - 2
        const d =
          i === 1
            ? `M ${x0} ${y} H ${x1}`
            : `M ${x0} ${ROWS[1]} H 86 Q 92 ${ROWS[1]} 92 ${ROWS[1] + (i === 0 ? -6 : 6)} V ${y + (i === 0 ? 6 : -6)} Q 92 ${y} 98 ${y} H ${x1}`
        return <path key={y} className="am-fl-line" d={d} markerEnd="url(#am-fl-arrow)" />
      })}

      {/* ---- groups of domains, and their trainers ---- */}
      {GROUPS.map((domains, i) => {
        const y = ROWS[i]
        const inner = domains.length * G.GROUP.pill + (domains.length - 1) * G.GROUP.gap
        const top = y - inner / 2
        return (
          <g key={domains[0]}>
            <rect
              className="am-fl-group"
              x={G.GROUP.x}
              y={top - G.GROUP.pad}
              width={G.GROUP.w}
              height={inner + 2 * G.GROUP.pad}
              rx={10}
            />
            {domains.map((d, k) => {
              const py = top + k * (G.GROUP.pill + G.GROUP.gap)
              return (
                <g key={d}>
                  <rect
                    className="am-fl-pill"
                    x={G.GROUP.x + G.GROUP.pad}
                    y={py}
                    width={G.GROUP.w - 2 * G.GROUP.pad}
                    height={G.GROUP.pill}
                    rx={G.GROUP.pill / 2}
                  />
                  <text
                    className="am-fl-t"
                    x={G.GROUP.x + G.GROUP.w / 2}
                    y={py + G.GROUP.pill / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {d}
                  </text>
                </g>
              )
            })}
            <line
              className="am-fl-line"
              x1={G.GROUP.x + G.GROUP.w}
              x2={G.TRAINER.x - 2}
              y1={y}
              y2={y}
              markerEnd="url(#am-fl-arrow)"
            />

            {/* trainer */}
            <rect
              className="am-fl-box"
              x={G.TRAINER.x}
              y={y - G.TRAINER.h / 2}
              width={G.TRAINER.w}
              height={G.TRAINER.h}
              rx={6}
            />
            <polygon className="am-fl-hex" points={hex(G.TRAINER.x + 20, y, 10)} />
            <text className="am-fl-t am-fl-b" x={G.TRAINER.x + 38} y={y - 4}>
              Trainer {i + 1}
            </text>
            <text className="am-fl-s" x={G.TRAINER.x + 38} y={y + 12}>
              on-policy RL
            </text>
            {/* the RL loop */}
            <path
              className="am-fl-line am-fl-dash"
              d={`M ${G.TRAINER.x + 82} ${y + G.TRAINER.h / 2} C ${G.TRAINER.x + 82} ${y + G.TRAINER.h / 2 + 19}, ${G.TRAINER.x + 38} ${y + G.TRAINER.h / 2 + 19}, ${G.TRAINER.x + 38} ${y + G.TRAINER.h / 2 + 3}`}
              markerEnd="url(#am-fl-arrow)"
            />

            {/* snapshot */}
            <line
              className="am-fl-line"
              x1={G.TRAINER.x + G.TRAINER.w}
              x2={G.SNAP.x - G.SNAP.r * 0.866 - 2}
              y1={y}
              y2={y}
              markerEnd="url(#am-fl-arrow)"
            />
            <polygon className="am-fl-hex am-fl-dash" points={hex(G.SNAP.x, y, G.SNAP.r)} />
            <text className="am-fl-t" x={G.SNAP.x} y={y} textAnchor="middle" dominantBaseline="central">
              θ{['₁', '₂', '₃'][i]}
            </text>
            <path
              className="am-fl-line"
              d={
                i === 1
                  ? `M ${snapRight} ${y} H ${G.MERGE.x - 2}`
                  : `M ${snapRight} ${y} H ${elbowX - 6} Q ${elbowX} ${y} ${elbowX} ${y + (i === 0 ? 6 : -6)} V ${mergeMid + (i === 0 ? -20 : 20)} Q ${elbowX} ${mergeMid + (i === 0 ? -14 : 14)} ${elbowX + 6} ${mergeMid + (i === 0 ? -14 : 14)} H ${G.MERGE.x - 2}`
              }
              markerEnd="url(#am-fl-arrow)"
            />
          </g>
        )
      })}
      {[G.GROUP.x + G.GROUP.w / 2, G.TRAINER.x + G.TRAINER.w / 2, G.SNAP.x].map((x) => (
        <text key={x} className="am-fl-more" x={x} y={336} textAnchor="middle">
          ⋯
        </text>
      ))}

      {/* ---- the merge ---- */}
      <Step x={432} y={60} n={1} name="Snapshot" note="when a drift reaches its cap" />
      <Step x={G.MERGE.x} y={104} n={2} name="Solve" note="while the trainers keep training" />
      <rect className="am-fl-merge" x={G.MERGE.x} y={G.MERGE.y} width={G.MERGE.w} height={G.MERGE.h} rx={6} />
      <text className="am-fl-t am-fl-b am-fl-acc-fill" x={G.MERGE.x + G.MERGE.w / 2} y={G.MERGE.y + 21} textAnchor="middle">
        Guarded merge
      </text>
      <line
        className="am-fl-acc am-fl-thin"
        x1={G.MERGE.x + 20}
        x2={G.MERGE.x + 20}
        y1={G.MERGE.y + 39}
        y2={G.MERGE.y + 39 + 3 * 18}
      />
      {MERGE_STEPS.map((s, k) => (
        <g key={s}>
          <circle className="am-fl-acc-fill" cx={G.MERGE.x + 20} cy={G.MERGE.y + 39 + k * 18} r={2.75} />
          <text className="am-fl-s" x={G.MERGE.x + 32} y={G.MERGE.y + 39 + k * 18} dominantBaseline="central">
            {s}
          </text>
        </g>
      ))}

      {/* merged model */}
      <line
        className="am-fl-acc"
        x1={G.MERGE.x + G.MERGE.w}
        x2={G.OUT.x - G.OUT.r * 0.866 - 2}
        y1={mergeMid}
        y2={mergeMid}
        markerEnd="url(#am-fl-arrow-acc)"
      />
      <polygon className="am-fl-hex-out" points={hex(G.OUT.x, mergeMid, G.OUT.r)} />
      <text className="am-fl-on-acc am-fl-b" x={G.OUT.x} y={mergeMid} textAnchor="middle" dominantBaseline="central">
        θ⁺
      </text>
      <text className="am-fl-t" x={G.OUT.x} y={mergeMid - G.OUT.r - 9} textAnchor="middle">
        merged model
      </text>

      {/* step 3: back to every trainer */}
      <path
        className="am-fl-acc"
        d={`M ${G.OUT.x} ${mergeMid + G.OUT.r} V ${G.RETURN_Y - 8} Q ${G.OUT.x} ${G.RETURN_Y} ${G.OUT.x - 8} ${G.RETURN_Y} H ${G.PANEL_T.x + G.PANEL_T.w / 2 + 8} Q ${G.PANEL_T.x + G.PANEL_T.w / 2} ${G.RETURN_Y} ${G.PANEL_T.x + G.PANEL_T.w / 2} ${G.RETURN_Y - 8} V ${G.PANEL_Y + G.PANEL_H + 3}`}
        markerEnd="url(#am-fl-arrow-acc)"
      />
      <g>
        <circle className="am-fl-stepring" cx={372} cy={G.RETURN_Y + 19.5} r={8} />
        <text className="am-fl-stepnum" x={372} y={G.RETURN_Y + 19.5} textAnchor="middle" dominantBaseline="central">
          3
        </text>
        <text className="am-fl-t am-fl-b" x={386} y={G.RETURN_Y + 24}>
          Add back
        </text>
        <text className="am-fl-s" x={450} y={G.RETURN_Y + 24}>
          every trainer adds θ⁺ − its snapshot; θ⁺ is the new anchor
        </text>
      </g>
    </svg>
  )
}
