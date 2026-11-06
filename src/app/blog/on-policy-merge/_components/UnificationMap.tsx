// Figure 2: the map of methods as a 2x2. Columns: when the domains are
// combined (during training, or once after it). Rows: how (adding up parameter
// updates, or matching each domain's behaviour in KL). On-Policy Merge is the
// only method in the during-training, KL cell that needs no distillation.
// Static, server-rendered SVG. Two drawings of the same map, a wide one and a
// narrow one for phones, so no label shrinks below ~15px; CSS shows one.

const LH = 1.22 // line height, in font sizes

type Item =
  | { t: 'text'; lines: string[]; size: number; cls: string; bold?: boolean; italic?: boolean; gap?: number }
  | { t: 'pill'; lines: string[]; size: number; gap?: number }
  | { t: 'rule'; gap?: number }

type Cell = { items: Item[]; hi?: boolean }

const pillH = (n: number, size: number) => n * size * LH + size * 0.9

function itemH(it: Item) {
  const g = it.gap ?? 0
  if (it.t === 'text') return g + it.lines.length * it.size * LH
  if (it.t === 'pill') return g + pillH(it.lines.length, it.size)
  return g + 2
}

/** Stack the items of one cell, centred on cx, starting at y. */
function Stack({ items, cx, y, w }: { items: Item[]; cx: number; y: number; w: number }) {
  let cur = y
  return (
    <g>
      {items.map((it, k) => {
        cur += it.gap ?? 0
        const top = cur
        cur += itemH(it) - (it.gap ?? 0)
        if (it.t === 'rule') {
          return <line key={k} x1={cx - w * 0.3} x2={cx + w * 0.3} y1={top + 1} y2={top + 1} className="am-um-divider" strokeWidth="1" />
        }
        if (it.t === 'pill') {
          const h = pillH(it.lines.length, it.size)
          return (
            <g key={k}>
              <rect x={cx - w / 2 - 7} y={top} width={w + 14} height={h} rx={Math.min(h / 2, 15)} className="am-um-pill" strokeWidth="1.1" strokeDasharray="4 3" />
              <text textAnchor="middle" fontSize={it.size} className="am-fig-text">
                {it.lines.map((l, i) => (
                  <tspan key={i} x={cx} y={top + it.size * 0.45 + (i + 0.78) * it.size * LH}>
                    {l}
                  </tspan>
                ))}
              </text>
            </g>
          )
        }
        return (
          <text
            key={k}
            textAnchor="middle"
            fontSize={it.size}
            fontWeight={it.bold ? 700 : 400}
            fontStyle={it.italic ? 'italic' : undefined}
            className={it.cls}
          >
            {it.lines.map((l, i) => (
              <tspan key={i} x={cx} y={top + (i + 0.8) * it.size * LH}>
                {l}
              </tspan>
            ))}
          </text>
        )
      })}
    </g>
  )
}

type Layout = {
  cls: string
  W: number
  gutter: number // left gutter for the row labels (0: labels go above each row)
  colGap: number
  rowGap: number
  pad: number
  headSize: number
  colHeads: string[][]
  rowHeads: string[][]
  cells: Cell[][] // [row][col]
  arrows: boolean
}

function Map2({ L }: { L: Layout }) {
  const { W, gutter, colGap, pad } = L
  const colW = (W - gutter - colGap - 4) / 2
  const x0 = (c: number) => gutter + 2 + c * (colW + colGap)
  const cx = (c: number) => x0(c) + colW / 2
  const hs = L.headSize
  const headH = Math.max(...L.colHeads.map((h) => h.length)) * hs * LH + 14
  const rowHeadH = gutter ? 0 : hs * LH + 12
  const contentH = (r: number) => Math.max(...L.cells[r].map((c) => c.items.reduce((a, it) => a + itemH(it), 0)))
  const rowH = [0, 1].map((r) => contentH(r) + 2 * pad)
  const rowY0 = headH + rowHeadH
  const rowY1 = rowY0 + rowH[0] + L.rowGap + rowHeadH
  const rowY = [rowY0, rowY1]
  const H = rowY1 + rowH[1] + 4
  const tw = colW - 24

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Methods for combining RL domains, by when and how they combine" className={L.cls}>
      {L.arrows && (
        <defs>
          <marker id="um-head" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0.5 L8,4.5 L0,8.5 z" className="am-fig-accent" />
          </marker>
        </defs>
      )}

      {/* column heads: when */}
      {L.colHeads.map((lines, c) => (
        <text key={c} textAnchor="middle" fontSize={hs} fontWeight="700" className="am-fig-ink">
          {lines.map((l, i) => (
            <tspan key={i} x={cx(c)} y={headH - 14 - (lines.length - 1 - i) * hs * LH}>
              {l}
            </tspan>
          ))}
        </text>
      ))}

      {/* row heads: how */}
      {L.rowHeads.map((lines, r) =>
        gutter ? (
          <text key={r} fontSize={hs} fontWeight="700" className="am-fig-ink">
            {lines.map((l, i) => (
              <tspan key={i} x={2} y={rowY[r] + rowH[r] / 2 + (i - (lines.length - 1) / 2) * hs * LH + hs * 0.34}>
                {l}
              </tspan>
            ))}
          </text>
        ) : (
          <text key={r} x={4} y={rowY[r] - 12} fontSize={hs} fontWeight="700" className="am-fig-ink">
            {lines[0]}
          </text>
        ),
      )}

      {/* cells */}
      {L.cells.map((row, r) =>
        row.map((cell, c) => {
          const h = cell.items.reduce((a, it) => a + itemH(it), 0)
          return (
            <g key={`${r}${c}`}>
              <rect
                x={x0(c)}
                y={rowY[r]}
                width={colW}
                height={rowH[r]}
                rx="8"
                className={cell.hi ? 'am-um-tile am-um-tile-hi' : 'am-um-tile'}
                strokeWidth={cell.hi ? 1.6 : undefined}
              />
              <Stack items={cell.items} cx={cx(c)} y={rowY[r] + (rowH[r] - h) / 2} w={tw} />
            </g>
          )
        }),
      )}

      {/* OPM keeps multi-task RL's timing and MOPD's geometry */}
      {L.arrows && (
        <g>
          <line
            x1={cx(0)}
            y1={rowY0 + rowH[0] + 5}
            x2={cx(0)}
            y2={rowY1 - 6}
            className="am-fig-accent-stroke"
            strokeWidth="1.6"
            markerEnd="url(#um-head)"
          />
          <text x={cx(0) + 12} y={rowY0 + rowH[0] + L.rowGap / 2 + 5.5} fontSize="16" fontStyle="italic" className="am-fig-accent">
            same timing
          </text>
          <line
            x1={x0(1) - 5}
            y1={rowY1 + rowH[1] / 2 + 10}
            x2={x0(0) + colW + 6}
            y2={rowY1 + rowH[1] / 2 + 10}
            className="am-fig-accent-stroke"
            strokeWidth="1.6"
            markerEnd="url(#um-head)"
          />
          <text textAnchor="middle" fontSize="16" fontStyle="italic" className="am-fig-accent">
            <tspan x={x0(1) - colGap / 2} y={rowY1 + rowH[1] / 2 - 25}>
              same
            </tspan>
            <tspan x={x0(1) - colGap / 2} y={rowY1 + rowH[1] / 2 - 4}>
              geometry
            </tspan>
          </text>
        </g>
      )}
    </svg>
  )
}

/* ------------------------------------------------------------- content */

const name = (lines: string[], size: number, gap = 0): Item => ({ t: 'text', lines, size, cls: 'am-fig-ink', bold: true, gap })
const also = (lines: string[], size: number, gap = 4): Item => ({ t: 'text', lines, size, cls: 'am-fig-ink', gap })
const says = (lines: string[], size: number, gap = 12): Item => ({ t: 'text', lines, size, cls: 'am-fig-text', italic: true, gap })

const WIDE: Layout = {
  cls: 'am-um-wide',
  W: 760,
  gutter: 150,
  colGap: 84,
  rowGap: 50,
  pad: 24,
  headSize: 17.5,
  colHeads: [['During training'], ['Once, after training']],
  rowHeads: [
    ['Add up the', 'parameter', 'updates'],
    ['Match each', 'domain’s', 'behaviour (KL)'],
  ],
  cells: [
    [
      {
        items: [
          name(['Multi-task RL'], 19),
          also(['and periodic sum or average'], 16),
          says(['domains interfere through', 'one shared update'], 16),
          { t: 'pill', lines: ['Cascade RL: one domain at a time'], size: 15.5, gap: 16 },
        ],
      },
      {
        items: [
          name(['Task arithmetic,', 'TIES, DARE'], 19),
          says(['updates collide in weight space', 'after the fact'], 16),
        ],
      },
    ],
    [
      {
        hi: true,
        items: [
          { t: 'text', lines: ['On-Policy Merge'], size: 21, cls: 'am-fig-accent', bold: true },
          says(['each domain keeps its own gain;', 'no extra rollouts'], 16, 10),
          { t: 'rule', gap: 16 },
          { t: 'text', lines: ['Distral, Divide-and-Conquer RL:'], size: 15.5, cls: 'am-fig-text', gap: 14 },
          { t: 'text', lines: ['by distillation, separate networks'], size: 15.5, cls: 'am-fig-text', italic: true, gap: 2 },
        ],
      },
      {
        items: [name(['MOPD'], 19), says(['needs a second rollout stage', 'to distil'], 16)],
      },
    ],
  ],
  arrows: true,
}

const NARROW: Layout = {
  cls: 'am-um-tall',
  W: 380,
  gutter: 0,
  colGap: 10,
  rowGap: 22,
  pad: 18,
  headSize: 17.5,
  colHeads: [['During', 'training'], ['Once, after', 'training']],
  rowHeads: [['Add up the parameter updates'], ['Match each domain’s behaviour (KL)']],
  cells: [
    [
      {
        items: [
          name(['Multi-task RL'], 19.5),
          also(['and periodic sum', 'or average'], 17),
          says(['domains interfere', 'through one', 'shared update'], 17),
          { t: 'pill', lines: ['Cascade RL: one', 'domain at a time'], size: 17, gap: 14 },
        ],
      },
      {
        items: [
          name(['Task arithmetic,', 'TIES, DARE'], 19.5),
          says(['updates collide', 'in weight space', 'after the fact'], 17),
        ],
      },
    ],
    [
      {
        hi: true,
        items: [
          { t: 'text', lines: ['On-Policy', 'Merge'], size: 21.5, cls: 'am-fig-accent', bold: true },
          says(['each domain keeps', 'its own gain; no', 'extra rollouts'], 17, 10),
          { t: 'rule', gap: 14 },
          { t: 'text', lines: ['Distral, Divide-', 'and-Conquer RL:'], size: 17, cls: 'am-fig-text', gap: 12 },
          { t: 'text', lines: ['by distillation,', 'separate networks'], size: 17, cls: 'am-fig-text', italic: true, gap: 2 },
        ],
      },
      {
        items: [name(['MOPD'], 19.5), says(['needs a second', 'rollout stage', 'to distil'], 17)],
      },
    ],
  ],
  arrows: false,
}

export default function UnificationMap() {
  return (
    <div className="am-um">
      <Map2 L={WIDE} />
      <Map2 L={NARROW} />
    </div>
  )
}
