// Inline SVG figures. All drawings are schematic; none encode measured data.

/* Figure 1: the advantage each trajectory outcome receives under the two
   truncation conventions. The truncated bar moves from -b to 0 under masking. */
export function OutcomesFigure() {
  const W = 760
  const H = 300
  const groups = [
    { label: 'Solved', noMask: 0.7, mask: 0.7 },
    { label: 'Submitted, failed', noMask: -0.3, mask: -0.3 },
    { label: 'Hit the cap (truncated)', noMask: -0.3, mask: 0.0 },
  ]
  const x0 = 70
  const colW = (W - x0 - 40) / groups.length
  const zeroY = 170
  const scale = 110 // px per unit advantage
  const bar = 44

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Advantages under R=0 versus masking">
      {/* axis */}
      <line x1={x0 - 10} x2={W - 30} y1={zeroY} y2={zeroY} className="am-fig-axis" strokeWidth="1" />
      <text x={x0 - 14} y={zeroY + 4} textAnchor="end" className="am-fig-text" fontSize="11">
        0
      </text>
      <text x={x0 - 14} y={zeroY - 0.7 * scale + 4} textAnchor="end" className="am-fig-text" fontSize="11">
        +0.7
      </text>
      <text x={x0 - 14} y={zeroY + 0.3 * scale + 4} textAnchor="end" className="am-fig-text" fontSize="11">
        −0.3
      </text>
      <line x1={x0 - 10} x2={W - 30} y1={zeroY - 0.7 * scale} y2={zeroY - 0.7 * scale} className="am-fig-rule" strokeDasharray="3 4" />
      <line x1={x0 - 10} x2={W - 30} y1={zeroY + 0.3 * scale} y2={zeroY + 0.3 * scale} className="am-fig-rule" strokeDasharray="3 4" />

      {groups.map((g, i) => {
        const cx = x0 + colW * i + colW / 2
        const xa = cx - bar - 6
        const xb = cx + 6
        const ya = g.noMask >= 0 ? zeroY - g.noMask * scale : zeroY
        const ha = Math.abs(g.noMask) * scale
        const yb = g.mask >= 0 ? zeroY - g.mask * scale : zeroY
        const hb = Math.abs(g.mask) * scale
        return (
          <g key={g.label}>
            <rect x={xa} y={ya} width={bar} height={Math.max(ha, 0)} className="am-fig-forest" opacity="0.85" />
            {hb > 0 ? (
              <rect x={xb} y={yb} width={bar} height={hb} className="am-fig-accent" opacity="0.85" />
            ) : (
              <g>
                <rect x={xb} y={zeroY - 2} width={bar} height={4} className="am-fig-accent" opacity="0.85" />
                <text x={xb + bar / 2} y={zeroY - 12} textAnchor="middle" className="am-fig-text" fontSize="11">
                  advantage = 0
                </text>
              </g>
            )}
            <text x={cx} y={H - 48} textAnchor="middle" className="am-fig-ink" fontSize="13" fontWeight="600">
              {g.label}
            </text>
            {i === 2 && (
              <text x={cx} y={H - 30} textAnchor="middle" className="am-fig-text" fontSize="11">
                masking pays this trajectory +b relative to R = 0
              </text>
            )}
          </g>
        )
      })}

      {/* legend */}
      <rect x={W - 250} y={18} width={12} height={12} className="am-fig-forest" opacity="0.85" />
      <text x={W - 232} y={29} className="am-fig-text" fontSize="12">
        R = 0 on truncation (no mask)
      </text>
      <rect x={W - 250} y={40} width={12} height={12} className="am-fig-accent" opacity="0.85" />
      <text x={W - 232} y={51} className="am-fig-text" fontSize="12">
        loss-masked on truncation
      </text>
      <text x={x0} y={24} className="am-fig-text" fontSize="12">
        advantage R − b, with group mean b = 0.3
      </text>
    </svg>
  )
}

/* Figure 2: causal vs. anticausal inclusion along one trajectory. */
export function CausalFigure() {
  const W = 760
  const H = 285
  const x0 = 40
  const x1 = W - 40
  const n = 24
  const step = (x1 - x0) / (n - 1)
  const rowA = 70
  const rowB = 180
  const staleFrom = 15

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Causal versus anticausal masks">
      {/* Row A: causal (per-token staleness) */}
      <text x={x0} y={rowA - 32} className="am-fig-ink" fontSize="13" fontWeight="600">
        Causal mask (per-token staleness): decided before the token is sampled
      </text>
      <line x1={x0} x2={x1} y1={rowA} y2={rowA} className="am-fig-axis" strokeWidth="1" />
      {Array.from({ length: n }).map((_, i) => (
        <circle
          key={`a${i}`}
          cx={x0 + i * step}
          cy={rowA}
          r={5}
          className={i >= staleFrom ? 'am-fig-faint' : 'am-fig-forest'}
          opacity={i >= staleFrom ? 0.5 : 0.9}
        />
      ))}
      <line
        x1={x0 + (staleFrom - 0.5) * step}
        x2={x0 + (staleFrom - 0.5) * step}
        y1={rowA - 18}
        y2={rowA + 18}
        className="am-fig-accent-stroke"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <text x={x0 + (staleFrom - 0.5) * step + 6} y={rowA - 8} className="am-fig-text" fontSize="11">
        weight sync; later tokens carry a newer version
      </text>
      <text x={x0} y={rowA + 34} className="am-fig-text" fontSize="12">
        inclusion of token t is a function of h_t  ⇒  E[∇log π(a_t | h_t) · mask_t] = 0  ⇒  no subsidy
      </text>

      {/* Row B: anticausal (truncation / stale drop) */}
      <text x={x0} y={rowB - 32} className="am-fig-ink" fontSize="13" fontWeight="600">
        Anticausal mask (truncation, turn cap, late drop): decided after the trajectory ends
      </text>
      <line x1={x0} x2={x1} y1={rowB} y2={rowB} className="am-fig-axis" strokeWidth="1" />
      {Array.from({ length: n }).map((_, i) => (
        <circle key={`b${i}`} cx={x0 + i * step} cy={rowB} r={5} className="am-fig-faint" opacity="0.5" />
      ))}
      <rect x={x1 - 8} y={rowB - 14} width={16} height={28} className="am-fig-accent" opacity="0.9" rx="2" />
      <text x={x1 - 14} y={rowB - 20} textAnchor="end" className="am-fig-text" fontSize="11.5">
        cap hit / dropped at the end
      </text>
      <path
        d={`M ${x1 - 10} ${rowB + 18} C ${x1 - 180} ${rowB + 70}, ${x0 + 180} ${rowB + 70}, ${x0 + 6} ${rowB + 14}`}
        fill="none"
        className="am-fig-accent-stroke"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        markerEnd="url(#am-arrow)"
      />
      <defs>
        <marker id="am-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" className="am-fig-accent" />
        </marker>
      </defs>
      <text x={(x0 + x1) / 2} y={rowB + 46} textAnchor="middle" className="am-fig-text" fontSize="11.5">
        every earlier token is masked retroactively
      </text>
      <text x={x0} y={rowB + 76} className="am-fig-text" fontSize="12">
        inclusion depends on a_t and the future  ⇒  E[Σ_t ∇log π · mask] = ∇P(kept) ≠ 0  ⇒  subsidy b·∇P(excluded)
      </text>
    </svg>
  )
}

/* Figure 3: predicted (schematic) truncation-rate curves for the online arms. */
export function PredictedCurvesFigure() {
  const W = 760
  const H = 380
  const L = 70
  const R = W - 30
  const T = 40
  const B = H - 110
  const px = (t: number) => L + (R - L) * t
  const py = (v: number) => B - (B - T) * v

  // smooth-ish schematic curves (t in [0,1], value = truncation rate)
  const pts = (f: (t: number) => number) =>
    Array.from({ length: 41 }, (_, i) => {
      const t = i / 40
      return `${px(t).toFixed(1)},${py(f(t)).toFixed(1)}`
    }).join(' ')

  const r0 = (t: number) => 0.9 * Math.exp(-3.2 * t) + 0.08 // R = 0: decays
  const mask = (t: number) => 0.9 - 0.45 * (1 - Math.exp(-2.2 * t)) + 0.25 * t // dips then drifts up
  const impute = (t: number) => mask(t) + 0.012 * Math.sin(9 * t) // overlaps mask
  const drg = (t: number) => mask(t) - 0.08 * t // Dr.GRPO control: same direction, smaller slope

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Predicted truncation-rate curves (schematic)">
      <rect x={L} y={T} width={R - L} height={B - T} fill="none" className="am-fig-rule" />
      {[0, 0.25, 0.5, 0.75, 1].map((v) => (
        <g key={v}>
          <line x1={L} x2={R} y1={py(v)} y2={py(v)} className="am-fig-rule" strokeDasharray="2 4" />
          <text x={L - 8} y={py(v) + 4} textAnchor="end" className="am-fig-text" fontSize="11">
            {Math.round(v * 100)}%
          </text>
        </g>
      ))}
      <text x={(L + R) / 2} y={B + 22} textAnchor="middle" className="am-fig-text" fontSize="12">
        training steps →
      </text>
      <text
        x={18}
        y={(T + B) / 2}
        textAnchor="middle"
        className="am-fig-text"
        fontSize="12"
        transform={`rotate(-90 18 ${(T + B) / 2})`}
      >
        fraction of rollouts hitting the cap
      </text>

      <polyline points={pts(r0)} fill="none" className="am-fig-forest-stroke" strokeWidth="2.2" />
      <polyline points={pts(mask)} fill="none" className="am-fig-accent-stroke" strokeWidth="2.2" />
      <polyline points={pts(impute)} fill="none" className="am-fig-accent-stroke" strokeWidth="2" strokeDasharray="6 5" opacity="0.85" />
      <polyline points={pts(drg)} fill="none" className="am-fig-axis" strokeWidth="1.8" strokeDasharray="2 4" />

      {/* legend, below the plot so it never crosses the curves */}
      <g transform={`translate(${L}, ${B + 46})`}>
        <line x1="0" x2="26" y1="6" y2="6" className="am-fig-forest-stroke" strokeWidth="2.2" />
        <text x="32" y="10" className="am-fig-text" fontSize="12">
          R = 0 on cap (no mask)
        </text>
        <line x1="0" x2="26" y1="28" y2="28" className="am-fig-accent-stroke" strokeWidth="2.2" />
        <text x="32" y="32" className="am-fig-text" fontSize="12">
          loss-masked on cap
        </text>
        <line x1="330" x2="356" y1="6" y2="6" className="am-fig-accent-stroke" strokeWidth="2" strokeDasharray="6 5" />
        <text x="362" y="10" className="am-fig-text" fontSize="12">
          R := b̄ imputed (predicted to trace the mask arm)
        </text>
        <line x1="330" x2="356" y1="28" y2="28" className="am-fig-axis" strokeWidth="1.8" strokeDasharray="2 4" />
        <text x="362" y="32" className="am-fig-text" fontSize="12">
          mask + constant normalization (Dr. GRPO control)
        </text>
      </g>
      <text x={R - 8} y={T + 18} textAnchor="end" className="am-fig-accent" fontSize="11" fontWeight="600">
        SCHEMATIC PREDICTION — NOT DATA
      </text>
    </svg>
  )
}
