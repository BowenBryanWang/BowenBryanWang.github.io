import type { ReactNode } from 'react'

import { Pending } from './Placeholder'
import { BENCHES, SCORES, fmt, type ArmKey } from './results'

// Result tables of the main comparison (9B, eight domains). Every number is
// transcribed from the project's results register (snapshot of 14 Nov 2026
// UTC) and the cost ledger (11 Nov 2026). A null cell means the arm was not
// evaluated on that benchmark; PENDING marks the final OPM model.

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

const pendingRow = (label: ReactNode, n: number): Row => [
  label,
  ...Array.from({ length: n }, (): typeof PENDING => PENDING),
]

const OPM = <strong>OPM, final</strong>

// Arm labels, shared by every table.
const A = {
  base: 'Base',
  mtrl: 'MTRL, step 150',
  ta1: 'TA, λ = 1',
  ties: 'TIES',
  liu: 'Closed form of Liu et al.',
  mopd: 'MOPD, iteration 14',
}

/** Table 4: one public benchmark per domain, in percent (data of Figure 5). */
export function MainResultsTable() {
  const rows: [string, ArmKey][] = [
    [A.base, 'base'],
    ['Specialists, own domain', 'spec'],
    [A.mtrl, 'mtrl'],
    [A.ta1, 'ta1'],
    [A.mopd, 'mopd'],
  ]
  return (
    <DataTable
      id="table-4"
      head={['Method', ...BENCHES.map((b) => b.short)]}
      rows={[
        ...rows.map(([label, key]): Row => [label, ...BENCHES.map((b) => fmt(SCORES[b.key][key], b.dp))]),
        pendingRow(OPM, BENCHES.length),
      ]}
    />
  )
}

/** Table 5: anchors of the OPM run in progress, in percent. */
export function OpmAnchorsTable() {
  return (
    <DataTable
      id="table-5"
      head={['Model', 'IFBench', 'IFEval', 'Math, 93 problems', 'BFCL, items', 'τ², items']}
      rows={[
        [A.base, '27.8', '67.0', '58.9', '69.1', '69.8'],
        ['OPM anchor A₁', '29.7', '70.3', '59.9', '69.9', '74.2'],
        ['OPM anchor A₃', '44.0', '81.9', '60.1', '71.2', '72.2'],
        ['OPM anchor A₅', '60.8', '89.2', '62.4', '71.6', '73.0'],
        ['A₅ − base, paired', '+33.0 ± 2.1', '+22.3 ± 1.4', '+3.5 ± 0.9', '+2.5 ± 0.6', '+3.2 ± 3.1'],
      ]}
    />
  )
}

/** Table 6: cost ledger entries, each with its own scope. */
export function CostTable() {
  return (
    <DataTable
      id="table-6"
      text
      head={['Entry', 'GPU-hours', 'Wall-clock']}
      rows={[
        ['MTRL, to step 175', '10,619 (H100)', '60 h'],
        ['Eight specialists, training only', '4,784 (B200)', '63 h (critical path)'],
        ['TA, TIES: merge only', 'about 0; CPU time not recorded', null],
        ['Closed form of Liu et al.: merge only', '82 (B200)', null],
        ['MOPD student, 15 of 50 steps', '174 (B200), of which 82.3 teacher scoring', '10.3 h'],
        pendingRow(OPM, 2),
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
        pendingRow(OPM, 7),
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
        [A.mopd, '84.5 ± 4.7', '85.6 ± 4.6', '72.1 ± 6.1', '80.5', '10.50 ± 1.41'],
        pendingRow(OPM, 5),
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
        [A.mtrl, '32.9', '91.9', '0.631', null],
        [A.ta1, '24.8', null, null, null],
        [A.ties, '40.2', null, null, null],
        [A.liu, '4.3', null, null, null],
        [A.mopd, '37.9', '81.7', '0.690', '75.1'],
        pendingRow(OPM, 4),
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
        pendingRow(OPM, 4),
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
        pendingRow(OPM, 3),
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

/** Table F6: the other merges of the same specialists, on the benchmarks of Figure 5. */
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
