// Numbers behind the main results figures and Table 4, so that a figure and
// its table cannot disagree. Transcribed from the project's results register
// (snapshot of 14 Nov 2026 UTC); nothing here is recomputed from per-sample
// data except the pooled math score, which is derived from the three sets.

export interface Val {
  /** Score in percent. */
  m: number
  /** Standard error over tasks and samples, when the register has one. */
  se?: number
}

export type ArmKey = 'base' | 'spec' | 'mtrl' | 'ta1' | 'liu' | 'ties' | 'mopd'
export type BenchKey = 'swepro' | 'tb' | 'bc' | 'cyber' | 'bfcl' | 'math' | 'hle' | 'ifb' | 'ifeval'

const v = (m: number, se?: number): Val => ({ m, se })

// Public math: AIME25, AIME26, HMMT Feb 26 (30, 30 and 33 problems).
const MATH_N = [30, 30, 33] as const
const MATH_SETS: Record<ArmKey, [Val, Val, Val]> = {
  base: [v(62.8, 6.3), v(65.3, 6.4), v(49.5, 7.1)],
  spec: [v(72.6, 6.5), v(78.3, 6.0), v(54.2, 7.2)], // step 60
  mtrl: [v(80.3, 5.4), v(83.5, 5.7), v(68.8, 6.8)],
  ta1: [v(55.5, 7.2), v(59.4, 7.7), v(38.4, 7.5)],
  ties: [v(87.0, 4.5), v(85.9, 5.1), v(73.1, 6.4)],
  liu: [v(63.6, 7.0), v(69.0, 7.3), v(50.8, 7.4)],
  mopd: [v(84.5, 4.7), v(85.6, 4.6), v(72.1, 6.1)],
}

/** Mean over the 93 problems; the SE combines the three sets as strata. */
function pooled(sets: [Val, Val, Val]): Val {
  const n = MATH_N.reduce((a, b) => a + b, 0)
  const m = sets.reduce((a, s, i) => a + MATH_N[i] * s.m, 0) / n
  const se = Math.sqrt(sets.reduce((a, s, i) => a + ((MATH_N[i] / n) * (s.se ?? 0)) ** 2, 0))
  return { m, se }
}

const ARM_KEYS: ArmKey[] = ['base', 'spec', 'mtrl', 'ta1', 'liu', 'ties', 'mopd']

const MATH = Object.fromEntries(ARM_KEYS.map((k) => [k, pooled(MATH_SETS[k])])) as Record<ArmKey, Val>

export const SCORES: Record<BenchKey, Partial<Record<ArmKey, Val>>> = {
  swepro: {
    base: v(74.5, 1.7),
    spec: v(77.7, 1.6),
    mtrl: v(72.6, 1.8),
    ta1: v(65.9, 1.9),
    ties: v(83.6, 1.5),
    liu: v(20.1),
    mopd: v(79.9, 1.6),
  },
  tb: {
    base: v(12.8, 2.3),
    spec: v(23.6, 3.5),
    mtrl: v(23.6, 3.8),
    ta1: v(19.8, 3.6),
    ties: v(29.2, 3.7),
    liu: v(0.4, 0.3),
    mopd: v(31.7, 3.9),
  },
  bc: {
    base: v(11.0, 0.9),
    spec: v(18.3, 1.2),
    mtrl: v(17.3, 1.2),
    ta1: v(18.8, 1.2),
    ties: v(19.9, 1.2),
    liu: v(3.9, 0.6),
    mopd: v(22.2, 1.3),
  },
  // A held-out set scored by the training verifier, not a public benchmark.
  cyber: {
    base: v(84.5, 2.8),
    spec: v(94.7, 1.5),
    mtrl: v(90.1, 2.2),
    ta1: v(88.4, 2.5),
    ties: v(96.0, 1.5),
    liu: v(22.4, 3.2),
    mopd: v(98.7, 0.8),
  },
  // Item-level accuracy; multi-task RL has only the official weighted score.
  bfcl: { base: v(69.1), mopd: v(75.1) },
  math: MATH,
  // No arm trains on HLE. The register gives a 95% half-width; SE = half-width / 1.96.
  hle: {
    base: v(5.86, 1.08 / 1.96),
    mtrl: v(10.5, 1.41 / 1.96),
    ta1: v(4.92, 1.0 / 1.96),
    ties: v(12.93, 1.55 / 1.96),
    liu: v(5.3, 1.03 / 1.96),
    mopd: v(10.5, 1.41 / 1.96),
  },
  // The register has no standard errors for IFBench and IFEval, and the
  // specialists and merges were not evaluated on them.
  ifb: { base: v(27.8), mtrl: v(66.1), mopd: v(47.6) },
  ifeval: { base: v(67.0), mtrl: v(91.9), mopd: v(81.7) },
}

export const BENCHES: {
  key: BenchKey
  title: string
  /** Column head in Table 4. */
  short: string
  domain: string
  /** Top of the bar axis; bars start at zero. */
  top: number
  /** Decimals shown. */
  dp: number
}[] = [
  { key: 'swepro', title: 'SWE-bench Pro', short: 'SWE-Pro', domain: 'software engineering', top: 100, dp: 1 },
  { key: 'tb', title: 'Terminal-Bench 2.1', short: 'TB 2.1', domain: 'terminal', top: 45, dp: 1 },
  { key: 'bc', title: 'BrowseComp-Plus', short: 'BC-Plus', domain: 'search', top: 30, dp: 1 },
  { key: 'cyber', title: 'MiMo Cyber', short: 'Cyber', domain: 'cyber', top: 100, dp: 1 },
  { key: 'bfcl', title: 'BFCL v4', short: 'BFCL', domain: 'tool use', top: 100, dp: 1 },
  { key: 'math', title: 'AIME + HMMT', short: 'Math', domain: 'math', top: 100, dp: 1 },
  { key: 'hle', title: 'HLE', short: 'HLE', domain: 'reasoning', top: 16, dp: 2 },
  { key: 'ifb', title: 'IFBench', short: 'IFBench', domain: 'instruction following', top: 100, dp: 1 },
  { key: 'ifeval', title: 'IFEval', short: 'IFEval', domain: 'instruction following', top: 100, dp: 1 },
]

/** The OPM model after its fifth merge, where it has been evaluated. */
export const OPM_AFTER_5: Partial<Record<BenchKey, Val>> = {
  bfcl: v(71.6),
  math: v(62.4),
  ifb: v(60.8),
  ifeval: v(89.2),
}

export type MethodKey = 'base' | 'spec' | 'mtrl' | 'ta1' | 'mopd' | 'opm'

/** Bars of Figure 5, in drawing order. */
export const METHODS: { key: MethodKey; label: string; name: string }[] = [
  { key: 'base', label: 'Base', name: 'Base model' },
  { key: 'spec', label: 'Specialist', name: 'Specialist of the domain' },
  { key: 'mtrl', label: 'MTRL', name: 'Multi-task RL, step 150' },
  { key: 'ta1', label: 'TA', name: 'Task arithmetic, λ = 1' },
  { key: 'mopd', label: 'MOPD', name: 'MOPD, iteration 14' },
  { key: 'opm', label: 'OPM', name: 'OPM after 5 merges' },
]

export function score(b: BenchKey, m: MethodKey): Val | undefined {
  return m === 'opm' ? OPM_AFTER_5[b] : SCORES[b][m]
}

/** The OPM model after 0 (base), 1, 3 and 5 merges, in percent. */
export const MERGES = [0, 1, 3, 5] as const
export const ANCHORS: {
  key: string
  title: string
  opm: number[]
  refs: { label: string; v: number }[]
}[] = [
  {
    key: 'ifb',
    title: 'IFBench',
    opm: [27.8, 29.7, 44.0, 60.8],
    refs: [
      { label: 'MTRL', v: 66.1 },
      { label: 'MOPD', v: 47.6 },
    ],
  },
  {
    key: 'math',
    title: 'Math, 93 problems',
    opm: [58.9, 59.9, 60.1, 62.4],
    refs: [
      { label: 'MOPD', v: MATH.mopd.m },
      { label: 'MTRL', v: MATH.mtrl.m },
      { label: 'TA', v: MATH.ta1.m },
    ],
  },
  {
    key: 'bfcl',
    title: 'BFCL v4, items',
    opm: [69.1, 69.9, 71.2, 71.6],
    refs: [{ label: 'MOPD', v: 75.1 }],
  },
]

/** "74.5 ± 1.7", or "27.8" when there is no standard error. */
export function fmt(x: Val | undefined, dp = 1): string | null {
  if (!x) return null
  return x.se === undefined ? x.m.toFixed(dp) : `${x.m.toFixed(dp)} ± ${x.se.toFixed(dp)}`
}
