'use client'

import { useRef, useState } from 'react'

import { BENCHES, METHODS, score, type BenchKey, type MethodKey } from './results'

// Figure 5: one bar chart per benchmark, one bar per method. The legend on
// the right switches methods on and off, and a bar or a legend entry under
// the pointer is highlighted in every panel.
// Numbers come from results.ts, which also feeds Table 4.

const W = 250
const H = 150
const L = 28 // room for the y-axis labels
const BASE = 132
const HEADROOM = 24

/** Round ticks from zero to the panel's top. */
function ticksOf(top: number) {
  const step = top >= 100 ? 50 : top >= 40 ? 20 : top >= 20 ? 10 : 5
  const out: number[] = []
  for (let t = 0; t <= top; t += step) out.push(t)
  return out
}

function barPath(x: number, w: number, yTop: number) {
  const r = Math.min(3, (BASE - yTop) / 2)
  const n = (v: number) => v.toFixed(1)
  return `M${n(x)},${BASE} V${n(yTop + r)} Q${n(x)},${n(yTop)} ${n(x + r)},${n(yTop)} H${n(x + w - r)} Q${n(
    x + w,
  )},${n(yTop)} ${n(x + w)},${n(yTop + r)} V${BASE} Z`
}

interface Tip {
  x: number
  y: number
  bench: BenchKey
  method: MethodKey
}

export default function ScoresFigure() {
  const [on, setOn] = useState<Set<MethodKey>>(() => new Set(METHODS.map((m) => m.key)))
  const [hot, setHot] = useState<MethodKey | null>(null)
  const [tip, setTip] = useState<Tip | null>(null)
  const wrap = useRef<HTMLDivElement>(null)

  const shown = METHODS.filter((m) => on.has(m.key))
  const slot = (W - L) / Math.max(shown.length, 1)
  const barW = Math.min(32, slot - 7)
  const labelAll = slot >= 28

  const toggle = (k: MethodKey) =>
    setOn((prev) => {
      const next = new Set(prev)
      if (next.has(k)) {
        if (next.size > 1) next.delete(k)
      } else next.add(k)
      return next
    })

  const place = (e: React.MouseEvent, bench: BenchKey, method: MethodKey) => {
    const box = wrap.current?.getBoundingClientRect()
    if (!box) return
    setTip({ x: e.clientX - box.left, y: e.clientY - box.top, bench, method })
  }

  const tipBench = tip ? BENCHES.find((b) => b.key === tip.bench) : undefined
  const tipMethod = tip ? METHODS.find((m) => m.key === tip.method) : undefined
  const tipVal = tip ? score(tip.bench, tip.method) : undefined
  const tipBase = tip ? score(tip.bench, 'base') : undefined

  return (
    <div className="am-bars" ref={wrap}>
      <div className="am-bars-grid">
        {BENCHES.map((b) => {
          const y = (val: number) => BASE - (val / b.top) * (BASE - HEADROOM)
          return (
            <div className="am-bars-panel" key={b.key}>
              <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${b.title}: scores of the selected methods`}>
                {ticksOf(b.top).map((t) => (
                  <g key={t}>
                    {t > 0 ? <line x1={L} x2={W} y1={y(t)} y2={y(t)} className="am-bars-grid-line" /> : null}
                    <text x={L - 6} y={y(t) + 3.5} textAnchor="end" className="am-bars-tick">
                      {t}
                    </text>
                  </g>
                ))}
                <line x1={L} x2={W} y1={BASE} y2={BASE} className="am-bars-axis" />
                {shown.map((m, k) => {
                  const val = score(b.key, m.key)
                  const cx = L + slot * (k + 0.5)
                  const dim = hot !== null && hot !== m.key
                  if (!val) {
                    return (
                      <text key={m.key} x={cx} y={BASE - 7} textAnchor="middle" className="am-bars-none">
                        –
                      </text>
                    )
                  }
                  const hi = val.m + (val.se ?? 0)
                  return (
                    <g
                      key={m.key}
                      className={dim ? 'am-bars-dim' : undefined}
                      onMouseEnter={(e) => {
                        setHot(m.key)
                        place(e, b.key, m.key)
                      }}
                      onMouseMove={(e) => place(e, b.key, m.key)}
                      onMouseLeave={() => {
                        setHot(null)
                        setTip(null)
                      }}
                    >
                      {/* hit area: the whole slot */}
                      <rect x={cx - slot / 2} y={0} width={slot} height={BASE} fill="transparent" />
                      <path d={barPath(cx - barW / 2, barW, y(val.m))} style={{ fill: `var(--m-${m.key})` }} />
                      {val.se !== undefined ? (
                        <g className="am-bars-whisk">
                          <line x1={cx} x2={cx} y1={y(val.m - val.se)} y2={y(hi)} />
                          <line x1={cx - 3.5} x2={cx + 3.5} y1={y(hi)} y2={y(hi)} />
                          <line x1={cx - 3.5} x2={cx + 3.5} y1={y(val.m - val.se)} y2={y(val.m - val.se)} />
                        </g>
                      ) : null}
                      {labelAll || hot === m.key ? (
                        <text x={cx} y={y(hi) - 5} textAnchor="middle" className="am-bars-val">
                          {val.m.toFixed(b.dp)}
                        </text>
                      ) : null}
                    </g>
                  )
                })}
              </svg>
              <div className="am-bars-name">
                <strong>{b.title}</strong>
                <span>{b.domain}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="am-bars-legend">
        {METHODS.map((m) => (
          <button
            key={m.key}
            type="button"
            aria-pressed={on.has(m.key)}
            title={m.name}
            onClick={() => toggle(m.key)}
            onMouseEnter={() => on.has(m.key) && setHot(m.key)}
            onMouseLeave={() => setHot(null)}
            onFocus={() => on.has(m.key) && setHot(m.key)}
            onBlur={() => setHot(null)}
          >
            <span className="am-bars-sw" style={{ background: `var(--m-${m.key})` }} />
            {m.label}
          </button>
        ))}
        <p>
          Click a method to show or hide it. Whiskers are ± 1 standard error; a dash means not evaluated.
        </p>
      </div>

      {tip && tipBench && tipMethod && tipVal ? (
        <div className="am-bars-tip" style={{ left: tip.x, top: tip.y }} role="status">
          <strong>{tipMethod.name}</strong>
          <span>
            {tipBench.title}: {tipVal.m.toFixed(tipBench.dp)}
            {tipVal.se !== undefined ? ` ± ${tipVal.se.toFixed(tipBench.dp)}` : ''}
          </span>
          {tip.method !== 'base' && tipBase ? (
            <span>
              {tipVal.m >= tipBase.m ? '+' : '−'}
              {Math.abs(tipVal.m - tipBase.m).toFixed(tipBench.dp)} against the base model
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
