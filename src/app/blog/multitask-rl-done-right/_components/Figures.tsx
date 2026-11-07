// Inline SVG figures. Every number is computed from the closed forms in the
// post (binary rewards, group size 8); none is a training measurement.
// Each segment carries a <title> so hovering shows its exact value.

type Seg = { label: string; value: number; cls: string }

// Integers print bare; everything else keeps one decimal so shares add to 100.
const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1))

function StackedBar({
  x,
  y,
  width,
  height,
  segs,
  row,
}: {
  x: number
  y: number
  width: number
  height: number
  segs: Seg[]
  row: string
}) {
  let cursor = x
  return (
    <g>
      {segs.map((s) => {
        const w = (s.value / 100) * width
        const x0 = cursor
        cursor += w
        const inside = w >= 44
        return (
          <g key={s.label}>
            <rect
              x={x0}
              y={y}
              width={Math.max(w, 0.5)}
              height={height}
              rx={3}
              className={`mt-seg ${s.cls}`}
            >
              <title>{`${row}: ${s.label} ${fmt(s.value)}%`}</title>
            </rect>
            {inside ? (
              <text
                x={x0 + w / 2}
                y={y + height / 2 + 4}
                textAnchor="middle"
                className={s.cls === 'mt-s3' ? 'mt-onfill-dark' : 'mt-onfill'}
                fontSize="12"
              >
                {`${fmt(s.value)}%`}
              </text>
            ) : (
              <text
                x={x0 + w / 2}
                y={y - 6}
                textAnchor="middle"
                className="am-fig-text"
                fontSize="11"
              >
                {`${fmt(s.value)}%`}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

/* Figure 1: dispatch share, post-filter batch share, and gradient share for
   two environments with a 50/50 target, under the two refill rules. */
export function MixLedgerFigure() {
  const W = 760
  const H = 330
  const panels = [
    {
      title: 'Refill with the dispatch weights',
      sub: 'what Miles does',
      x: 130,
      rows: [
        { row: 'Dispatched', easy: 50.0 },
        { row: 'In the batch', easy: 36.5 },
        { row: 'Gradient', easy: 50.0 },
      ],
    },
    {
      title: 'Refill to hold the post-filter share',
      sub: 'MiMo-V2.6 Eq. 7, MT-GRPO',
      x: 470,
      rows: [
        { row: 'Dispatched', easy: 63.5 },
        { row: 'In the batch', easy: 50.0 },
        { row: 'Gradient', easy: 63.5 },
      ],
    },
  ]
  const barW = 260
  const barH = 34
  const rowY = [110, 170, 230]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Dispatch, batch and gradient shares of two environments under two refill rules"
    >
      {/* legend */}
      <rect x={130} y={14} width={12} height={12} rx={2} className="mt-s1" />
      <text x={148} y={25} className="am-fig-text" fontSize="12">
        Easy environment, pass rate 0.9, acceptance 0.57
      </text>
      <rect x={470} y={14} width={12} height={12} rx={2} className="mt-s2" />
      <text x={488} y={25} className="am-fig-text" fontSize="12">
        Hard environment, pass rate 0.5, acceptance 0.99
      </text>

      {rowY.map((y, i) => (
        <text
          key={y}
          x={118}
          y={y + barH / 2 + 4}
          textAnchor="end"
          className="am-fig-ink"
          fontSize="12.5"
          fontWeight={i === 2 ? 700 : 500}
        >
          {panels[0].rows[i].row}
        </text>
      ))}

      {panels.map((p) => (
        <g key={p.title}>
          <text x={p.x} y={60} className="am-fig-ink" fontSize="13" fontWeight="600">
            {p.title}
          </text>
          <text x={p.x} y={78} className="am-fig-text" fontSize="11.5">
            {p.sub}
          </text>
          {p.rows.map((r, i) => (
            <StackedBar
              key={r.row}
              x={p.x}
              y={rowY[i]}
              width={barW}
              height={barH}
              row={`${p.title} · ${r.row}`}
              segs={[
                { label: 'easy', value: r.easy, cls: 'mt-s1' },
                { label: 'hard', value: 100 - r.easy, cls: 'mt-s2' },
              ]}
            />
          ))}
          <line
            x1={p.x + barW / 2}
            x2={p.x + barW / 2}
            y1={rowY[0] - 10}
            y2={rowY[2] + barH + 10}
            className="mt-target"
          />
        </g>
      ))}

      <text x={130} y={300} className="am-fig-text" fontSize="11.5">
        Dashed line: the 50 / 50 target. Group size 8; groups with all-equal
        rewards are filtered and the batch is refilled.
      </text>
      <text x={130} y={318} className="am-fig-text" fontSize="11.5">
        Computed from the closed forms in the post, not measured.
      </text>
    </svg>
  )
}

/* Figure 2: environment weights under global token-mean versus a
   per-sequence 1/|o| normalizer, before and after long episodes double. */
export function AggregationFigure() {
  const W = 760
  const H = 300
  const x = 250
  const barW = 470
  const barH = 34
  const rows = [
    {
      row: 'Dispatched',
      note: '= gradient under global token-mean',
      v: [30, 30, 40],
    },
    {
      row: 'Gradient, per-sequence 1/|o|',
      note: 'lengths 40k / 1k / 15k tokens',
      v: [2.2, 89.8, 8.0],
    },
    {
      row: 'Same, after SWE episodes double',
      note: 'lengths 80k / 1k / 15k tokens',
      v: [1.1, 90.8, 8.1],
    },
  ]
  const names = ['SWE', 'Tool calling', 'Math']
  const cls = ['mt-s1', 'mt-s2', 'mt-s3']
  const rowY = [70, 150, 230]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Environment gradient weights under token-mean and per-sequence normalization"
    >
      {names.map((n, i) => (
        <g key={n}>
          <rect x={x + i * 150} y={14} width={12} height={12} rx={2} className={cls[i]} />
          <text x={x + i * 150 + 18} y={25} className="am-fig-text" fontSize="12">
            {n}
          </text>
        </g>
      ))}
      {rows.map((r, i) => (
        <g key={r.row}>
          <text
            x={x - 12}
            y={rowY[i] + 14}
            textAnchor="end"
            className="am-fig-ink"
            fontSize="12.5"
            fontWeight="600"
          >
            {r.row}
          </text>
          <text
            x={x - 12}
            y={rowY[i] + 30}
            textAnchor="end"
            className="am-fig-text"
            fontSize="11"
          >
            {r.note}
          </text>
          <StackedBar
            x={x}
            y={rowY[i]}
            width={barW}
            height={barH}
            row={r.row}
            segs={r.v.map((value, j) => ({ label: names[j], value, cls: cls[j] }))}
          />
        </g>
      ))}
      <text x={x} y={292} className="am-fig-text" fontSize="11.5">
        Dispatch 30 / 30 / 40. Computed from the closed form, not measured.
      </text>
    </svg>
  )
}
