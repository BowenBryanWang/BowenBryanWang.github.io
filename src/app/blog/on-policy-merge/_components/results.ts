// Numbers behind the main results figures and Table 3, so that a figure and
// its table cannot disagree. Transcribed from the project's results register
// (snapshot of 16 Nov 2026 UTC); nothing here is recomputed from per-sample
// data.

export interface Val {
  /** Score in percent. */
  m: number
  /** Standard error over tasks and samples, when the register has one. */
  se?: number
  /** For an OPM score: merges completed by the model that gave it. */
  at?: number
}

export type ArmKey = 'base' | 'spec' | 'mtrl' | 'ta1' | 'liu' | 'ties' | 'mopd'
export type BenchKey =
  | 'swepro'
  | 'tb'
  | 'bc'
  | 'cyber'
  | 'bfcl'
  | 'tau2'
  | 'math'
  | 'ifb'
  | 'ifeval'
  | 'hle'
  | 'mmlu'
  | 'gpqa'

const v = (m: number, se?: number, at?: number): Val => ({ m, se, at })

// Public math: AIME25, AIME26, HMMT Feb 26 (30, 30 and 33 problems). The main
// figures use AIME26, the only set evaluated at every OPM merge; Table F1 has
// all three.
const MATH_SETS: Record<ArmKey, [Val, Val, Val]> = {
  base: [v(62.8, 6.3), v(65.3, 6.4), v(49.5, 7.1)],
  spec: [v(72.6, 6.5), v(78.3, 6.0), v(54.2, 7.2)], // step 60
  mtrl: [v(80.3, 5.4), v(83.5, 5.7), v(68.8, 6.8)],
  ta1: [v(55.5, 7.2), v(59.4, 7.7), v(38.4, 7.5)],
  ties: [v(87.0, 4.5), v(85.9, 5.1), v(73.1, 6.4)],
  liu: [v(63.6, 7.0), v(69.0, 7.3), v(50.8, 7.4)],
  mopd: [v(84.5, 4.7), v(85.6, 4.6), v(72.1, 6.1)],
}

const ARM_KEYS: ArmKey[] = ['base', 'spec', 'mtrl', 'ta1', 'liu', 'ties', 'mopd']

const MATH = Object.fromEntries(ARM_KEYS.map((k) => [k, MATH_SETS[k][1]])) as Record<ArmKey, Val>

export const SCORES: Record<BenchKey, Partial<Record<ArmKey, Val>>> = {
  // The 641 tasks whose reference patch passes in our harness.
  swepro: {
    base: v(74.6, 1.7),
    spec: v(77.8, 1.6),
    mtrl: v(72.7, 1.8),
    ta1: v(66.0, 1.9),
    ties: v(83.8, 1.5),
    liu: v(20.1),
    mopd: v(80.0, 1.6),
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
  // Item-level accuracy.
  bfcl: {
    base: v(69.1),
    spec: v(65.0, 0.8),
    mtrl: v(71.6),
    ta1: v(67.6),
    ties: v(73.3),
    liu: v(69.1),
    mopd: v(75.1),
  },
  // 100 tasks, four samples each, item mean.
  tau2: {
    base: v(69.8, 3.5),
    spec: v(67.5, 3.5),
    mtrl: v(73.0, 3.3),
    ta1: v(65.8, 3.6),
    ties: v(75.2, 3.1),
    liu: v(75.2, 3.2),
    mopd: v(70.8, 3.4),
  },
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
  // The register has standard errors on IFBench and IFEval for the specialist only.
  ifb: {
    base: v(27.8),
    spec: v(68.1, 2.4),
    mtrl: v(66.1),
    ta1: v(58.0),
    ties: v(70.9),
    liu: v(60.8),
    mopd: v(47.6),
  },
  ifeval: {
    base: v(67.0),
    spec: v(92.0, 1.0),
    mtrl: v(91.9),
    ta1: v(87.9),
    ties: v(94.3),
    liu: v(92.6),
    mopd: v(81.7),
  },
  // No arm trains on these two. Output capped at 32k tokens.
  mmlu: {
    base: v(75.2, 0.4),
    mtrl: v(80.8, 0.4),
    ta1: v(78.5, 0.4),
    ties: v(81.5, 0.4),
    liu: v(78.2, 0.4),
    mopd: v(79.4, 0.4),
  },
  gpqa: {
    base: v(60.4, 2.8),
    mtrl: v(76.5, 2.6),
    ta1: v(68.4, 2.9),
    ties: v(79.9, 2.3),
    liu: v(60.6, 2.9),
    mopd: v(73.9, 2.5),
  },
}

export const BENCHES: {
  key: BenchKey
  title: string
  /** Column head in Table 3. */
  short: string
  domain: string
  /** Range of the bar axis in Figure 4. Most panels do not start at zero, so that differences between methods are visible. */
  lo: number
  top: number
  /** Decimals shown. */
  dp: number
}[] = [
  { key: 'swepro', title: 'SWE-bench Pro', short: 'SWE-Pro', domain: 'software engineering', lo: 60, top: 85, dp: 1 },
  { key: 'tb', title: 'Terminal-Bench 2.1', short: 'TB 2.1', domain: 'terminal', lo: 0, top: 40, dp: 1 },
  { key: 'bc', title: 'BrowseComp-Plus', short: 'BC-Plus', domain: 'search', lo: 5, top: 25, dp: 1 },
  { key: 'cyber', title: 'MiMo Cyber', short: 'Cyber', domain: 'cyber', lo: 80, top: 100, dp: 1 },
  { key: 'bfcl', title: 'BFCL v4', short: 'BFCL', domain: 'tool use', lo: 60, top: 80, dp: 1 },
  { key: 'tau2', title: 'τ²-Bench', short: 'τ²', domain: 'tool use', lo: 55, top: 80, dp: 1 },
  { key: 'math', title: 'AIME 2026', short: 'AIME26', domain: 'math', lo: 50, top: 100, dp: 1 },
  { key: 'ifb', title: 'IFBench', short: 'IFBench', domain: 'instruction following', lo: 20, top: 90, dp: 1 },
  { key: 'ifeval', title: 'IFEval', short: 'IFEval', domain: 'instruction following', lo: 60, top: 100, dp: 1 },
  { key: 'hle', title: 'HLE', short: 'HLE', domain: 'reasoning', lo: 4, top: 12, dp: 2 },
  { key: 'mmlu', title: 'MMLU-Pro', short: 'MMLU-Pro', domain: 'knowledge', lo: 74, top: 82, dp: 1 },
  { key: 'gpqa', title: 'GPQA Diamond', short: 'GPQA', domain: 'science', lo: 55, top: 80, dp: 1 },
]

/** Merges the OPM run has completed, and merges completed by its latest evaluated model. */
export const MERGES_DONE = 22
export const OPM_MERGES = 21

/**
 * The latest evaluated OPM model, after 21 merges. SWE-bench Pro,
 * Terminal-Bench and BrowseComp-Plus were last run one merge earlier.
 */
export const OPM_LATEST: Partial<Record<BenchKey, Val>> = {
  swepro: v(80.5, 1.6, 20),
  tb: v(29.0, 3.9, 20),
  bc: v(23.0, 1.3, 20),
  bfcl: v(69.5, undefined, 21),
  tau2: v(70.2, 3.5, 21),
  math: v(82.4, 5.8, 21),
  ifb: v(81.0, undefined, 21),
  ifeval: v(94.9, undefined, 21),
  // 1,810 questions; standard error over items.
  hle: v(10.99, 0.74, 21),
  mmlu: v(80.3, 0.4, 21),
  gpqa: v(73.7, 2.6, 21),
}

/**
 * TEMPORARY, to see the ceiling: per benchmark, the highest score among the
 * merges evaluated on it. No single model has these scores. Set OPM_SHOW to
 * 'latest' before publishing.
 */
export const OPM_BEST: Partial<Record<BenchKey, Val>> = {
  swepro: v(81.6, 1.5, 19),
  tb: v(30.6, 3.7, 18),
  bc: v(23.3, 1.3, 12),
  bfcl: v(72.3, undefined, 8),
  tau2: v(74.5, undefined, 19),
  math: v(82.4, 5.8, 21),
  ifb: v(81.0, undefined, 21),
  ifeval: v(94.9, undefined, 21),
  hle: v(10.99, 0.74, 21),
  mmlu: v(80.3, 0.4, 21),
  gpqa: v(74.6, 2.6, 20),
}

/** Which OPM row Figure 1, Figure 4, Figure 7 and Table 3 show. */
export const OPM_SHOW = 'best' as 'best' | 'latest'
export const OPM_NOW = OPM_SHOW === 'best' ? OPM_BEST : OPM_LATEST
export const OPM_NAME = OPM_SHOW === 'best' ? 'OPM, best merge per benchmark' : `OPM after ${OPM_MERGES} merges`

export type MethodKey = 'base' | 'spec' | 'mtrl' | 'ta1' | 'mopd' | 'opm'

/** Bars of Figure 4, in drawing order. */
export const METHODS: { key: MethodKey; label: string; short: string; name: string }[] = [
  { key: 'base', label: 'Base', short: 'Base', name: 'Base model' },
  { key: 'spec', label: 'Specialist', short: 'Spec', name: 'Specialist of the domain' },
  { key: 'mtrl', label: 'MTRL', short: 'MTRL', name: 'Multi-task RL, step 150' },
  { key: 'ta1', label: 'TA', short: 'TA', name: 'Task arithmetic, λ = 1' },
  { key: 'mopd', label: 'MOPD', short: 'MOPD', name: 'MOPD, iteration 14' },
  { key: 'opm', label: 'OPM', short: 'OPM', name: OPM_NAME },
]

export function score(b: BenchKey, m: MethodKey): Val | undefined {
  return m === 'opm' ? OPM_NOW[b] : SCORES[b][m]
}

/** Last merge on the horizontal axis of the trajectory figure. */
export const TRAJ_MERGES = 21

/**
 * The OPM model against the number of merges completed (0 is the base
 * model). Twelve panels in four columns; Terminal-Bench and BrowseComp-Plus
 * are evaluated from the 12th merge.
 */
export const TRAJ: {
  key: string
  title: string
  sub: string
  /** y-axis range and ticks of the panel. */
  lo: number
  hi: number
  ticks: number[]
  /** Decimals of the value label; one by default. */
  dp?: number
  /** [merges completed, value in percent]; a named line carries its name at its end. */
  lines: { name?: string; pts: [number, number][] }[]
  refs: { key: 'mtrl' | 'ta1' | 'mopd'; v: number }[]
}[] = [
  {
    key: 'ifb',
    title: 'IFBench',
    sub: 'instruction following',
    lo: 20,
    hi: 100,
    ticks: [20, 40, 60, 80, 100],
    lines: [
      {
        pts: [
          [0, 27.8],
          [1, 29.7],
          [3, 44.0],
          [5, 62.9],
          [8, 71.6],
          [12, 77.7],
          [16, 74.9],
          [17, 77.7],
          [18, 78.6],
          [19, 77.8],
          [20, 80.5],
          [21, 81.0],
        ],
      },
    ],
    refs: [
      { key: 'mtrl', v: 66.1 },
      { key: 'mopd', v: 47.6 },
    ],
  },
  {
    key: 'ifeval',
    title: 'IFEval',
    sub: 'instruction following',
    lo: 60,
    hi: 100,
    ticks: [60, 70, 80, 90, 100],
    lines: [
      {
        pts: [
          [0, 67.0],
          [1, 70.3],
          [3, 81.9],
          [5, 89.1],
          [8, 92.7],
          [12, 94.3],
          [16, 93.9],
          [17, 94.0],
          [18, 94.3],
          [19, 94.3],
          [20, 94.8],
          [21, 94.9],
        ],
      },
    ],
    refs: [
      { key: 'mtrl', v: 91.9 },
      { key: 'ta1', v: 87.9 },
      { key: 'mopd', v: 81.7 },
    ],
  },
  {
    key: 'math',
    title: 'AIME 2026',
    sub: 'math',
    lo: 50,
    hi: 90,
    ticks: [50, 60, 70, 80, 90],
    lines: [
      {
        pts: [
          [0, 65.3],
          [1, 67.3],
          [3, 66.9],
          [5, 68.1],
          [8, 70.9],
          [12, 74.0],
          [16, 77.2],
          [17, 76.8],
          [18, 79.4],
          [19, 80.8],
          [20, 79.8],
          [21, 82.4],
        ],
      },
    ],
    refs: [
      { key: 'mopd', v: MATH.mopd.m },
      { key: 'mtrl', v: MATH.mtrl.m },
      { key: 'ta1', v: MATH.ta1.m },
    ],
  },
  {
    key: 'cut',
    title: 'AIME 2026, truncation rate',
    sub: '81,920-token limit',
    lo: 0,
    hi: 30,
    ticks: [0, 10, 20, 30],
    lines: [
      {
        pts: [
          [0, 28.4],
          [1, 28.2],
          [3, 27.2],
          [5, 27.4],
          [8, 22.3],
          [12, 22.4],
          [16, 17.3],
          [17, 18.5],
          [18, 16.9],
          [19, 16.7],
          [20, 16.5],
          [21, 14.7],
        ],
      },
    ],
    refs: [
      { key: 'mopd', v: 6.7 },
      { key: 'mtrl', v: 4.2 },
    ],
  },
  {
    key: 'bfcl',
    title: 'BFCL v4',
    sub: 'tool use',
    lo: 64,
    hi: 78,
    ticks: [64, 68, 72, 76],
    lines: [
      {
        pts: [
          [0, 69.1],
          [1, 69.9],
          [3, 71.2],
          [5, 71.6],
          [8, 72.3],
          [12, 70.3],
          [16, 70.2],
          [17, 70.1],
          [18, 69.3],
          [19, 70.0],
          [20, 69.0],
          [21, 69.5],
        ],
      },
    ],
    refs: [
      { key: 'mopd', v: 75.1 },
      { key: 'mtrl', v: 71.6 },
      { key: 'ta1', v: 67.6 },
    ],
  },
  {
    key: 'tau2',
    title: 'τ²-Bench',
    sub: 'tool use',
    lo: 60,
    hi: 80,
    ticks: [60, 65, 70, 75, 80],
    lines: [
      {
        pts: [
          [0, 69.8],
          [1, 74.2],
          [3, 72.2],
          [5, 73.0],
          [8, 73.5],
          [12, 72.2],
          [16, 69.5],
          [17, 74.2],
          [18, 72.8],
          [19, 74.5],
          [20, 69.8],
          [21, 70.2],
        ],
      },
    ],
    refs: [
      { key: 'mtrl', v: 73.0 },
      { key: 'mopd', v: 70.8 },
      { key: 'ta1', v: 65.8 },
    ],
  },
  {
    key: 'gpqa',
    title: 'GPQA Diamond',
    sub: 'not trained on',
    lo: 55,
    hi: 80,
    ticks: [55, 60, 65, 70, 75, 80],
    lines: [
      {
        pts: [
          [0, 60.4],
          [1, 60.7],
          [3, 62.9],
          [5, 66.1],
          [8, 69.3],
          [12, 72.0],
          [16, 72.9],
          [17, 72.9],
          [18, 74.3],
          [19, 73.4],
          [20, 74.6],
          [21, 73.7],
        ],
      },
    ],
    refs: [
      { key: 'mtrl', v: 76.5 },
      { key: 'mopd', v: 73.9 },
      { key: 'ta1', v: 68.4 },
    ],
  },
  {
    key: 'mmlu',
    title: 'MMLU-Pro',
    sub: 'not trained on',
    lo: 74,
    hi: 82,
    ticks: [74, 76, 78, 80, 82],
    lines: [
      {
        pts: [
          [0, 75.2],
          [1, 76.0],
          [3, 76.7],
          [5, 77.7],
          [8, 79.3],
          [12, 79.7],
          [16, 79.6],
          [17, 79.7],
          [18, 80.2],
          [19, 80.2],
          [20, 80.0],
          [21, 80.3],
        ],
      },
    ],
    refs: [
      { key: 'mtrl', v: 80.8 },
      { key: 'mopd', v: 79.4 },
      { key: 'ta1', v: 78.5 },
    ],
  },
  {
    key: 'swepro',
    title: 'SWE-bench Pro',
    sub: 'software engineering',
    lo: 60,
    hi: 85,
    ticks: [60, 65, 70, 75, 80, 85],
    lines: [
      {
        pts: [
          [0, 74.6],
          [1, 74.9],
          [3, 74.6],
          [5, 75.2],
          [8, 75.7],
          [12, 77.7],
          [16, 77.7],
          [17, 78.9],
          [18, 80.8],
          [19, 81.6],
          [20, 80.5],
        ],
      },
    ],
    refs: [
      { key: 'mopd', v: 80.0 },
      { key: 'mtrl', v: 72.7 },
      { key: 'ta1', v: 66.0 },
    ],
  },
  {
    key: 'tb',
    title: 'Terminal-Bench 2.1',
    sub: 'terminal',
    lo: 0,
    hi: 40,
    ticks: [0, 10, 20, 30, 40],
    lines: [
      {
        pts: [
          [0, 12.8],
          [12, 21.8],
          [16, 24.3],
          [17, 28.8],
          [18, 30.6],
          [19, 30.3],
          [20, 29.0],
        ],
      },
    ],
    refs: [
      { key: 'mopd', v: 31.7 },
      { key: 'mtrl', v: 23.6 },
      { key: 'ta1', v: 19.8 },
    ],
  },
  {
    key: 'bc',
    title: 'BrowseComp-Plus',
    sub: 'search',
    lo: 5,
    hi: 25,
    ticks: [5, 10, 15, 20, 25],
    lines: [
      {
        pts: [
          [0, 11.0],
          [12, 23.3],
          [16, 21.6],
          [17, 21.2],
          [18, 22.0],
          [19, 20.7],
          [20, 23.0],
        ],
      },
    ],
    refs: [
      { key: 'mopd', v: 22.2 },
      { key: 'ta1', v: 18.8 },
      { key: 'mtrl', v: 17.3 },
    ],
  },
  {
    key: 'hle',
    title: 'HLE',
    sub: 'not trained on',
    lo: 4,
    hi: 12,
    ticks: [4, 6, 8, 10, 12],
    dp: 2,
    lines: [
      {
        pts: [
          [0, 5.86],
          [1, 5.80],
          [3, 5.91],
          [5, 6.63],
          [8, 7.85],
          [12, 9.28],
          [16, 8.67],
          [17, 9.61],
          [18, 10.17],
          [19, 9.94],
          [20, 10.33],
          [21, 10.99],
        ],
      },
    ],
    refs: [
      { key: 'mtrl', v: 10.5 },
      { key: 'mopd', v: 10.5 },
      { key: 'ta1', v: 4.92 },
    ],
  },
]

/**
 * MMLU-Pro, GPQA Diamond and HLE, which no method trains on, for the eight
 * specialists and the combined models, in percent. OPM is the model of Figure 4.
 */
export const GENERAL_BASE = { mmlu: 75.2, gpqa: 60.4, hle: 5.86 }
export const GENERAL: {
  label: string
  color: MethodKey
  mmlu: number
  gpqa: number
  /** HLE was not run on the specialists. */
  hle?: number
  gap?: boolean
}[] = [
  { label: 'Instruction following', color: 'spec', mmlu: 81.0, gpqa: 77.0 },
  { label: 'Math', color: 'spec', mmlu: 80.0, gpqa: 74.5 },
  { label: 'Tool use', color: 'spec', mmlu: 79.6, gpqa: 74.1 },
  { label: 'Search', color: 'spec', mmlu: 78.1, gpqa: 66.4 },
  { label: 'Software engineering', color: 'spec', mmlu: 76.1, gpqa: 67.9 },
  { label: 'Cyber', color: 'spec', mmlu: 76.1, gpqa: 66.4 },
  { label: 'Terminal', color: 'spec', mmlu: 75.7, gpqa: 59.6 },
  { label: 'Knowledge work', color: 'spec', mmlu: 73.4, gpqa: 51.4 },
  { label: 'MTRL', color: 'mtrl', mmlu: 80.8, gpqa: 76.5, hle: 10.5, gap: true },
  { label: 'TA', color: 'ta1', mmlu: 78.5, gpqa: 68.4, hle: 4.92 },
  { label: 'MOPD', color: 'mopd', mmlu: 79.4, gpqa: 73.9, hle: 10.5 },
  { label: 'OPM', color: 'opm', mmlu: OPM_NOW.mmlu!.m, gpqa: OPM_NOW.gpqa!.m, hle: OPM_NOW.hle!.m },
]

/**
 * Per trainer, the KL residual left by the merges it contributed
 * to, as a share of its drift (sum of residuals over sum of drifts), and the
 * number of the first 21 merges it contributed to.
 */
export const KEPT: { domain: string; merges: number; resid: number }[] = [
  { domain: 'Search', merges: 18, resid: 3.6 },
  { domain: 'Instruction following', merges: 18, resid: 4.9 },
  { domain: 'Terminal', merges: 2, resid: 11.4 },
  { domain: 'Tool use', merges: 14, resid: 15.4 },
  { domain: 'Math', merges: 4, resid: 16.1 },
  { domain: 'Cyber', merges: 7, resid: 16.4 },
  { domain: 'Software engineering', merges: 7, resid: 20.1 },
  { domain: 'Knowledge work', merges: 8, resid: 25.8 },
]

/**
 * BFCL v4 by item type, in percent: the 2,717 items that need a function
 * call and the 1,124 where none should be made.
 */
export const BFCL_SPLIT: { merge: number; call: number; none: number }[] = [
  { merge: 0, call: 68.5, none: 70.6 },
  { merge: 1, call: 69.0, none: 72.0 },
  { merge: 3, call: 72.6, none: 67.8 },
  { merge: 5, call: 74.5, none: 64.8 },
  { merge: 8, call: 75.7, none: 64.0 },
  { merge: 12, call: 75.5, none: 57.7 },
  { merge: 16, call: 76.3, none: 55.4 },
  { merge: 17, call: 76.0, none: 55.7 },
  { merge: 18, call: 75.4, none: 54.4 },
  { merge: 19, call: 75.7, none: 56.2 },
  { merge: 20, call: 75.0, none: 54.5 },
  { merge: 21, call: 75.0, none: 56.0 },
]
export const BFCL_SPLIT_REFS: { key: 'mtrl' | 'mopd'; call: number; none: number }[] = [
  { key: 'mtrl', call: 75.9, none: 61.1 },
  { key: 'mopd', call: 76.4, none: 72.0 },
]

/** "74.5 ± 1.7", or "27.8" when there is no standard error. */
export function fmt(x: Val | undefined, dp = 1): string | null {
  if (!x) return null
  return x.se === undefined ? x.m.toFixed(dp) : `${x.m.toFixed(dp)} ± ${x.se.toFixed(dp)}`
}
