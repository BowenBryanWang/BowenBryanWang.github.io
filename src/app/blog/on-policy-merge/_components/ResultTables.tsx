import type { ReactNode } from 'react'

import { Pending } from './Placeholder'
import { MERGE_LOG } from './mergelog'
import { BENCHES, OPM_MERGES, OPM_NOW, OPM_SHOW, SCORES, fmt, type ArmKey } from './results'

// Result tables of the main comparison (9B, eight domains). Every number is
// transcribed from the project's results register and cost ledger (snapshot
// of 16 Nov 2026 UTC). A null cell means the arm was not
// evaluated on that benchmark.

type Cell = string | null
const PENDING: unique symbol = Symbol('pending')
type Row = [ReactNode, ...(Cell | typeof PENDING)[]]

function DataTable({
  id,
  head,
  rows,
  text = false,
}: {
  id: string
  head: ReactNode[]
  rows: Row[]
  /** Cells hold short text instead of numbers: left-aligned. */
  text?: boolean
}) {
  const cls = text ? undefined : 'am-num'
  return (
    <div className="am-table am-results" id={id}>
      <table>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} className={i ? cls : undefined}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((c, i) => (
                <td key={i} className={i ? cls : undefined}>
                  {c === PENDING ? (
                    <Pending>–</Pending>
                  ) : c === null ? (
                    '–'
                  ) : (
                    (c as ReactNode)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Held-out sets were last run on the model after 20 merges, on math and instruction following only.
const OPM_HELDOUT = <strong>OPM, 20 merges</strong>
// The latest evaluated model, used in the appendix tables.
const OPM_NOW_LABEL = <strong>OPM, {OPM_MERGES} merges</strong>
// The OPM row of Table 3 follows Figure 4.
const OPM_T3_LABEL = OPM_SHOW === 'best' ? <strong>OPM, best merge</strong> : OPM_NOW_LABEL

// Arm labels, shared by every table.
const A = {
  base: 'Base',
  mtrl: 'MTRL, step 150',
  ta1: 'TA, λ = 1',
  ties: 'TIES',
  liu: 'Closed form of Liu et al.',
  mopd: 'MOPD, iteration 14',
}

/** Table 3: one public benchmark per domain, in percent (data of Figure 4). */
export function MainResultsTable() {
  const rows: [string, ArmKey][] = [
    [A.base, 'base'],
    ['Specialist', 'spec'],
    ['MTRL', 'mtrl'],
    ['TA', 'ta1'],
    ['MOPD', 'mopd'],
  ]
  return (
    <DataTable
      id="table-3"
      head={['Method', ...BENCHES.map((b) => b.short)]}
      rows={[
        ...rows.map(([label, key]): Row => [label, ...BENCHES.map((b) => fmt(SCORES[b.key][key], b.dp))]),
        [OPM_T3_LABEL, ...BENCHES.map((b) => fmt(OPM_NOW[b.key], b.dp))],
        ['merge of the OPM score', ...BENCHES.map((b) => (OPM_NOW[b.key]?.at === undefined ? null : String(OPM_NOW[b.key]!.at)))],
      ]}
    />
  )
}

/** Table 4: the OPM model along its merges, in percent (data of Figure 6). */
export function OpmAnchorsTable() {
  return (
    <DataTable
      id="table-4"
      head={[
        'Merges',
        'IFBench',
        'IFEval',
        'AIME 2026',
        'AIME 2026, truncation rate',
        'BFCL',
        'BFCL, call needed',
        'BFCL, no call',
        'τ²',
        'GPQA',
        'MMLU-Pro',
        'SWE-Pro',
        'TB 2.1',
        'BC-Plus',
        'HLE',
      ]}
      rows={[
        ['0 (base)', '27.8', '67.0', '65.3', '28.4', '69.1', '68.5', '70.6', '69.8', '60.4', '75.2', '74.6', '12.8', '11.0', '5.86'],
        ['1', '29.7', '70.3', '67.3', '28.2', '69.9', '69.0', '72.0', '74.2', '60.7', '76.0', '74.9', null, null, '5.80'],
        ['3', '44.0', '81.9', '66.9', '27.2', '71.2', '72.6', '67.8', '72.2', '62.9', '76.7', '74.6', null, null, '5.91'],
        ['5', '62.9', '89.1', '68.1', '27.4', '71.6', '74.5', '64.8', '73.0', '66.1', '77.7', '75.2', null, null, '6.63'],
        ['8', '71.6', '92.7', '70.9', '22.3', '72.3', '75.7', '64.0', '73.5', '69.3', '79.3', '75.7', null, null, '7.85'],
        ['12', '77.7', '94.3', '74.0', '22.4', '70.3', '75.5', '57.7', '72.2', '72.0', '79.7', '77.7', '21.8', '23.3', '9.28'],
        ['16', '74.9', '93.9', '77.2', '17.3', '70.2', '76.3', '55.4', '69.5', '72.9', '79.6', '77.7', '24.3', '21.6', '8.67'],
        ['17', '77.7', '94.0', '76.8', '18.5', '70.1', '76.0', '55.7', '74.2', '72.9', '79.7', '78.9', '28.8', '21.2', '9.61'],
        ['18', '78.6', '94.3', '79.4', '16.9', '69.3', '75.4', '54.4', '72.8', '74.3', '80.2', '80.8', '30.6', '22.0', '10.17'],
        ['19', '77.8', '94.3', '80.8', '16.7', '70.0', '75.7', '56.2', '74.5', '73.4', '80.2', '81.6', '30.3', '20.7', '9.94'],
        ['20', '80.5', '94.8', '79.8', '16.5', '69.0', '75.0', '54.5', '69.8', '74.6', '80.0', '80.5', '29.0', '23.0', '10.33'],
        ['21', '81.0', '94.9', '82.4', '14.7', '69.5', '75.0', '56.0', '70.2', '73.7', '80.3', null, null, null, '10.99'],
      ]}
    />
  )
}

/** Table 5: cost ledger entries, each with its own scope. */
export function CostTable() {
  return (
    <DataTable
      id="table-5"
      text
      head={['Entry', 'GPU-hours', 'Wall-clock']}
      rows={[
        ['MTRL, to step 150', '8,800 (H100)', '50 h'],
        ['Eight specialists, training only', '4,784 (B200)', '63 h (critical path)'],
        ['TA, TIES: merge only', 'about 0; CPU time not recorded', null],
        ['Closed form of Liu et al.: merge only', '82 (B200)', null],
        ['MOPD student, to iteration 14', '174 (B200), of which 82.3 teacher scoring', '10.3 h'],
        [OPM_NOW_LABEL, '14,041 (B200), of which 344 in merges', '20.6 h in merges'],
      ]}
    />
  )
}

/** Table F7: held-out score divided by the specialist's. */
export function RelativeTable() {
  return (
    <DataTable
      id="table-f7"
      head={['Arm', 'Math', 'IF', 'Search', 'Tool use', 'SWE', 'Terminal', 'Cyber']}
      rows={[
        [A.base, '0.732', '0.216', '0.403', '0.770', '0.985', '0.463', '0.886'],
        [A.mtrl, '1.100', '0.823', null, null, '1.027', '0.695', '0.927'],
        [A.ta1, '0.935', '0.945', '0.997', '0.960', '0.715', '0.768', '0.903'],
        [A.ties, '1.107', '0.987', '0.615', '1.039', null, null, null],
        [A.liu, '0.802', '0.870', '0.002', '1.021', null, null, null],
        [A.mopd, '1.032', '0.567', '0.914', '0.900', '1.172', '1.039', '1.015'],
        [OPM_HELDOUT, '0.913', '1.045', null, null, null, null, null],
      ]}
    />
  )
}

/** Table F1: public math and HLE, in percent. */
export function MathPublicTable() {
  return (
    <DataTable
      id="table-f1"
      head={['Arm', 'AIME25', 'AIME26', 'HMMT Feb 26', 'Pooled', 'HLE']}
      rows={[
        [A.base, '62.8 ± 6.3', '65.3 ± 6.4', '49.5 ± 7.1', '58.9', '5.86 ± 1.08'],
        ['Math specialist, step 60', '72.6 ± 6.5', '78.3 ± 6.0', '54.2 ± 7.2', '67.9', null],
        [A.mtrl, '80.3 ± 5.4', '83.5 ± 5.7', '68.8 ± 6.8', '77.3', '10.50 ± 1.41'],
        [A.ta1, '55.5 ± 7.2', '59.4 ± 7.7', '38.4 ± 7.5', '50.7', '4.92 ± 1.00'],
        [A.ties, '87.0 ± 4.5', '85.9 ± 5.1', '73.1 ± 6.4', '81.7', '12.93 ± 1.55'],
        [A.liu, '63.6 ± 7.0', '69.0 ± 7.3', '50.8 ± 7.4', '60.8', '5.30 ± 1.03'],
        [A.mopd, '84.5 ± 4.7', '85.6 ± 4.6', '72.1 ± 6.1', '80.4', '10.50 ± 1.41'],
        [OPM_NOW_LABEL, '77.9 ± 6.2', '82.4 ± 5.8', '64.0 ± 7.0', '74.4', '10.99 ± 1.44'],
      ]}
    />
  )
}

/** Table F2: secondary benchmarks. */
export function SecondaryTable() {
  return (
    <DataTable
      id="table-f2"
      head={['Method', 'SWE-rebench (%)', 'IFEval (%)', 'BFCL v4, official', 'BFCL v4, items (%)']}
      rows={[
        [A.base, '34.3', '67.0', '0.606', '69.1'],
        ['SWE specialist', '35.5', null, null, null],
        ['Instruction-following specialist', null, '92.0', null, null],
        ['Tool-use specialist', null, null, '0.571', '65.0'],
        [A.mtrl, '32.9', '91.9', '0.631', '71.6'],
        [A.ta1, '24.8', '87.9', '0.663', '67.6'],
        [A.ties, '40.2', '94.3', '0.665', '73.3'],
        [A.liu, '4.3', '92.6', '0.582', '69.1'],
        [A.mopd, '37.9', '81.7', '0.690', '75.1'],
        [OPM_NOW_LABEL, null, '94.9', '0.607', '69.5'],
      ]}
    />
  )
}

/** Table F3: held-out sets of the single-turn and fast agentic domains. */
export function HeldoutFastTable() {
  return (
    <DataTable
      id="table-f3"
      head={['Arm', 'Math', 'IF', 'Search', 'Tool use']}
      rows={[
        [A.base, '.521 ± .026', '.188 ± .018', '.252 ± .019', '.632 ± .037'],
        ['Specialists (math: step 210)', '.712 ± .024', '.869 ± .018', '.626 ± .027', '.821 ± .033'],
        [A.mtrl, '.783', '.715', null, null],
        [A.ta1, '.666 ± .026', '.821 ± .021', '.624 ± .028', '.788 ± .035'],
        [A.ties, '.788 ± .023', '.858 ± .019', '.385 ± .025', '.853 ± .029'],
        [A.liu, '.571 ± .028', '.756 ± .023', '.001', '.838 ± .031'],
        [A.mopd, '.735 ± .024', '.493 ± .023', '.572 ± .027', '.739 ± .035'],
        [OPM_HELDOUT, '.650', '.908', null, null],
      ]}
    />
  )
}

/** Table F4: held-out sets of the slow agentic domains. */
export function HeldoutSlowTable() {
  return (
    <DataTable
      id="table-f4"
      head={['Arm', 'SWE', 'Terminal', 'Cyber']}
      rows={[
        [A.base, '.539 ± .048', '.094 ± .029', '.859 ± .032'],
        ['Specialists', '.547 ± .051', '.203 ± .046', '.969 ± .019'],
        [A.mtrl, '.562', '.141', '.898'],
        [A.ta1, '.391 ± .056', '.156 ± .043', '.875 ± .037'],
        [A.ties, null, null, null],
        [A.liu, null, null, null],
        [A.mopd, '.641 ± .053', '.211 ± .047', '.984 ± .011'],
        [OPM_HELDOUT, null, null, null],
      ]}
    />
  )
}

/** Table F5: the math specialist over training, in percent. */
export function MathSpecialistTable() {
  return (
    <DataTable
      id="table-f5"
      head={['Checkpoint', 'AIME25', 'AIME26', 'HMMT Feb 26']}
      rows={[
        ['Step 60, reported as the specialist', '72.6 ± 6.5', '78.3 ± 6.0', '54.2 ± 7.2'],
        ['Step 90', '72.4 ± 6.6', '78.0 ± 6.0', '44.3 ± 7.3'],
        ['Step 210, used in the merges and as MOPD teacher', '68.0 ± 6.4', '72.0 ± 6.2', '52.0 ± 6.9'],
        ['Step 300, final', '38.6 ± 7.1', '46.7 ± 6.8', '27.4 ± 6.4'],
      ]}
    />
  )
}

/** Table F6: the other merges of the same specialists, on the benchmarks of Figure 4. */
export function OtherPublicTable() {
  const rows: [string, ArmKey][] = [
    [A.base, 'base'],
    [A.ta1, 'ta1'],
    [A.ties, 'ties'],
    [A.liu, 'liu'],
  ]
  return (
    <DataTable
      id="table-f6"
      head={['Method', ...BENCHES.map((b) => b.short)]}
      rows={rows.map(([label, key]): Row => [label, ...BENCHES.map((b) => fmt(SCORES[b.key][key], b.dp))])}
    />
  )
}

/** Table F8: two benchmarks no method trains on, in percent. */
export function GeneralTable() {
  return (
    <DataTable
      id="table-f8"
      head={['Model', 'MMLU-Pro', 'GPQA Diamond']}
      rows={[
        [A.base, '75.2', '60.4'],
        ['Specialist: math, step 60', '80.0', '74.5'],
        ['Specialist: instruction following', '81.0', '77.0'],
        ['Specialist: search', '78.1', '66.4'],
        ['Specialist: tool use', '79.6', '74.1'],
        ['Specialist: software engineering', '76.1', '67.9'],
        ['Specialist: terminal', '75.7', '59.6'],
        ['Specialist: cyber', '76.1', '66.4'],
        ['Specialist: knowledge work', '73.4', '51.4'],
        [A.mtrl, '80.8', '76.5'],
        [A.ta1, '78.5', '68.4'],
        [A.ties, '81.5', '79.9'],
        [A.liu, '78.2', '60.6'],
        [A.mopd, '79.4', '73.9'],
        [OPM_NOW_LABEL, '80.3', '73.7'],
      ]}
    />
  )
}

/** Table F9: scores at the standard output limit and at 131,072 tokens, in percent. */
export function LimitTable() {
  return (
    <DataTable
      id="table-f9"
      head={['Model', 'AIME25', 'AIME26', 'HMMT Feb 26', 'Pooled', 'GPQA Diamond', 'HLE']}
      rows={[
        [A.base, '62.8 → 69.0', '65.3 → 71.1', '49.5 → 60.3', '58.9 → 66.6', '60.4 → 66.9', '5.86 → 6.52'],
        [A.mtrl, '80.3 → 80.2', '83.5 → 83.9', '68.8 → 69.7', '77.3 → 77.7', '76.5 → 78.8', '10.50 → 10.28'],
        [A.mopd, '84.5 → 87.5', '85.6 → 87.1', '72.1 → 75.8', '80.4 → 83.2', '73.9 → 76.1', '10.50 → 12.82'],
        [
          <strong key="opm16">OPM, 16 merges</strong>,
          '72.3 → 77.2',
          '77.2 → 80.5',
          '60.9 → 65.9',
          '69.8 → 74.3',
          '72.9 → 76.5',
          '8.67 → 10.06',
        ],
        [<strong key="opm17">OPM, 17 merges</strong>, null, '76.8 → 81.4', null, null, null, null],
      ]}
    />
  )
}

/** Table C2: the held-out KL residual at every merge of the 9B run, in nats. */
export function MergeLogTable() {
  const f = (x: number | undefined) => (x === undefined ? null : x.toFixed(1))
  return (
    <DataTable
      id="table-c2-rows"
      head={['Merge', 'Updates from', 'No merge', 'Sum (γ = 0)', 'γ = ½', 'γ = 1', 'Installed', 'vs sum']}
      rows={MERGE_LOG.map((r): Row => {
        const inst = r.gamma === 1 ? r.full : r.half!
        return [
          String(r.merge),
          r.from,
          f(r.none),
          f(r.sum),
          f(r.half),
          f(r.full),
          r.gamma === 1 ? 'γ = 1' : 'γ = ½',
          `−${Math.round(100 * (1 - inst / r.sum))}%`,
        ]
      })}
    />
  )
}
