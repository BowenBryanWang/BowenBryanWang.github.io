// Every merge of the 9B run so far, from the merge log: which trainers'
// updates it merged, and the held-out KL residual sum_i KL(P_i || merged), in
// nats, of not merging, of the plain sum of the updates, and of the guarded
// merge at half and full step. Feeds Figure 5 and Table C2.

export interface MergeRow {
  merge: number
  /** Trainers whose updates were merged. */
  from: string
  /** Residual without a merge: the trainers' total drift from the anchor. */
  none: number
  /** Plain sum of the updates (step 0 of the line search). */
  sum: number
  /** CG solve at half step; not logged for the last merge. */
  half?: number
  /** CG solve at full step. */
  full: number
  /** Step the line search chose. */
  gamma: 0.5 | 1
  /** CG iterations; 10 where the per-trainer check failed at 5. */
  cg: 5 | 10
}

export const MERGE_LOG: MergeRow[] = [
  { merge: 1, from: 'IF, KW, cyber, tool use, search', none: 67.766, sum: 32.392, half: 14.83, full: 8.249, gamma: 1, cg: 5 },
  { merge: 2, from: 'SWE, IF, tool use, search', none: 67.401, sum: 36.442, half: 14.841, full: 8.39, gamma: 1, cg: 5 },
  { merge: 3, from: 'IF, KW, tool use, search', none: 80.144, sum: 58.019, half: 23.539, full: 16.011, gamma: 1, cg: 5 },
  { merge: 4, from: 'IF, tool use, search', none: 89.617, sum: 64.813, half: 25.771, full: 14.028, gamma: 1, cg: 5 },
  { merge: 5, from: 'math, IF, tool use, search', none: 100.591, sum: 53.686, half: 17.573, full: 6.179, gamma: 1, cg: 10 },
  { merge: 6, from: 'IF, tool use, search', none: 82.974, sum: 44.277, half: 17.196, full: 10.661, gamma: 1, cg: 5 },
  { merge: 7, from: 'IF, KW, tool use, search', none: 153.427, sum: 94.088, half: 35.393, full: 17.609, gamma: 1, cg: 5 },
  { merge: 8, from: 'IF, tool use, search', none: 90.667, sum: 37.399, half: 15.716, full: 9.268, gamma: 1, cg: 5 },
  { merge: 9, from: 'SWE, cyber, search', none: 69.445, sum: 38.755, half: 19.463, full: 37.594, gamma: 0.5, cg: 5 },
  { merge: 10, from: 'IF, KW, tool use, search', none: 139.677, sum: 108.138, half: 45.556, full: 30.115, gamma: 1, cg: 5 },
  { merge: 11, from: 'IF, search', none: 79.16, sum: 20.018, half: 11.666, full: 11.608, gamma: 1, cg: 5 },
  { merge: 12, from: 'math, IF, KW, tool use, search', none: 135.368, sum: 73.568, half: 27.677, full: 11.987, gamma: 1, cg: 10 },
  { merge: 13, from: 'search', none: 34.209, sum: 3.741, half: 1.309, full: 1.058, gamma: 1, cg: 5 },
  { merge: 14, from: 'SWE, IF, tool use, search', none: 132.149, sum: 66.595, half: 28.528, full: 18.28, gamma: 1, cg: 5 },
  { merge: 15, from: 'KW, cyber, tool use, search', none: 128.462, sum: 84.917, half: 33.07, full: 19.304, gamma: 1, cg: 5 },
  { merge: 16, from: 'IF, KW, tool use, search', none: 96.525, sum: 24.329, half: 11.641, full: 8.476, gamma: 1, cg: 5 },
  { merge: 17, from: 'SWE, IF, terminal, cyber, tool use, search', none: 200.915, sum: 92.916, half: 38.933, full: 22.005, gamma: 1, cg: 5 },
  { merge: 18, from: 'SWE, math, IF, terminal, KW, cyber, search', none: 152.5, sum: 106.3, half: 42.5, full: 21.5, gamma: 1, cg: 5 },
  { merge: 19, from: 'SWE, IF, KW, cyber', none: 91.4, sum: 68.8, half: 25.9, full: 13.4, gamma: 1, cg: 10 },
  { merge: 20, from: 'IF, cyber', none: 13.68, sum: 3.17, half: 1.58, full: 1.05, gamma: 1, cg: 5 },
  { merge: 21, from: 'SWE, math, IF', none: 80.2, sum: 43.2, half: 17.6, full: 9.45, gamma: 1, cg: 5 },
  { merge: 22, from: 'SWE, IF', none: 64.9, sum: 16.2, full: 4.93, gamma: 1, cg: 5 },
]

/** Residual the installed merge left, in nats. */
export const installed = (r: MergeRow) => (r.gamma === 1 ? r.full : r.half!)
