import SectionTitle from './SectionTitle';
import { RESULTS } from '../_lib/data';

export default function Results() {
  return (
    <section id="results" className="pb-20">
      <div className="container-prose">
        <SectionTitle label="Results" />
      </div>

      <div className="container-prose">
      <div className="prose-research mb-10">
        <p>
          Each tuple pairs an <span className="font-mono">initial_setup.py</span> script
          that provisions the environment with a natural-language task and a{' '}
          <span className="font-mono">reward.py</span> script that verifies
          completion. Interactive examples with replayable trajectories are on
          the{' '}
          <a href="https://cua-gym.xlang.ai" target="_blank" rel="noreferrer">
            project homepage
          </a>.
        </p>
        <p>
          We trained two models using GSPO on the full 32K corpus:{' '}
          <strong>CUA-Gym-A3B</strong> on the Qwen3.5-35B-A3B base, and{' '}
          <strong>CUA-Gym-A17B</strong> on Qwen3.5-397B-A17B. The first
          result that genuinely surprised us was how much the smaller model
          gained. CUA-Gym-A3B lifted 35B-A3B from 54.5 to{' '}
          <strong>62.1</strong> on OSWorld-Verified, effectively matching the
          unmodified 397B-A17B base at roughly{' '}
          <strong>10× fewer active parameters</strong>. Training had
          compressed a lot of capability into a much smaller compute budget.
        </p>
        <p>
          At the larger scale, CUA-Gym-A17B pushed the 397B-A17B base from
          62.2 to <strong>70.2</strong>. Gains at this scale are typically
          harder to come by — the base model is already strong, and most RL
          recipes saturate. The fact that the improvement held, and was
          consistent across most domains, gave us more confidence that the
          data distribution was doing real work rather than just tuning to
          benchmark artifacts. The per-domain breakdown in Figure 4 shows the
          largest gains on multi-application workflows and office tools, which
          aligns with where the training data had the broadest coverage.
        </p>
        <p>
          The result we were most uncertain about going in was WebArena.
          The training corpus has no WebArena tasks in it — only desktop
          apps and synthesized web mocks. But both checkpoints improve on the
          held-out WebArena benchmark (A3B: 40.8 to 44.5, A17B: 54.0 to 56.0),
          which means the mock environments are teaching something that
          genuinely transfers to real browser interactions, not just pattern-
          matching the training pool. That was the clearest validation of the
          synthetic sandbox approach.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-x-6 gap-y-10 my-10">
        {/* Figure 4 — per-domain horizontal bars (A3B + A17B) */}
        <figure className="col-span-12 lg:col-span-7 m-0">
          <PerDomainBars />
          <figcaption className="mt-3 text-[12.5px] leading-[1.65] text-ink-soft">
            <strong>Figure 4.</strong> Per-domain success on OSWorld-Verified
            for both <span className="font-mono">Qwen3.5-35B-A3B</span> (top)
            and <span className="font-mono">Qwen3.5-397B-A17B</span> (bottom).
            Base score (gray) + CUA-Gym lift (oxblood); hatched red marks
            domains where RL regresses below the base. <em>n</em> is task
            count.
          </figcaption>
        </figure>

        {/* Table 1 */}
        <figure className="col-span-12 lg:col-span-5 m-0 overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-ink">
                <th className="text-left py-2 pr-3 font-medium text-ink">Model</th>
                <th className="text-right py-2 pr-3 font-medium text-ink whitespace-nowrap">OSWorld-V.</th>
                <th className="text-right py-2 font-medium text-ink whitespace-nowrap">WebArena</th>
              </tr>
            </thead>
            <tbody>
              <SubHead label="Proprietary models" />
              {RESULTS.proprietary.map((r) => (
                <Row key={r.model} {...r} />
              ))}
              <SubHead label="Open-source models" />
              {RESULTS.openSource.map((r) => (
                <Row key={r.model} {...r} />
              ))}
              <SubHead label="Ours" />
              {RESULTS.ours.map((r) => (
                <Row key={r.model} {...r} />
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-ink">
                <td colSpan={3} className="pt-2" />
              </tr>
            </tfoot>
          </table>
          <figcaption className="mt-3 text-[12.5px] leading-[1.65] text-ink-soft">
            <strong>Table 2.</strong> Main results. Italic rows are baselines;
            the highlighted row is our model trained on CUA-Gym data.
          </figcaption>
        </figure>
      </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Figure 4 — per-domain horizontal bar chart
// ─────────────────────────────────────────────────────────────────────────────

// (domain, n, base, ours) per row, ordered as in the paper's plot.
type DomainRow = { domain: string; n: number; base: number; ours: number };

const PER_DOMAIN_A3B: DomainRow[] = [
  { domain: 'overall',      n: 369, base: 54.5, ours: 62.1 },
  { domain: 'writer',       n: 31,  base: 50.0, ours: 60.0 },
  { domain: 'calc',         n: 47,  base: 39.0, ours: 53.9 },
  { domain: 'impress',      n: 22,  base: 55.0, ours: 60.0 },
  { domain: 'gimp',         n: 26,  base: 33.0, ours: 40.0 },
  { domain: 'chrome',       n: 38,  base: 65.0, ours: 72.0 },
  { domain: 'multi_apps',   n: 24,  base: 30.0, ours: 51.5 },
  { domain: 'os',           n: 55,  base: 70.0, ours: 70.0 },
  { domain: 'vs_code',      n: 23,  base: 42.0, ours: 55.6 },
  { domain: 'thunderbird',  n: 18,  base: 45.0, ours: 50.0 },
];

const PER_DOMAIN_A17B: DomainRow[] = [
  { domain: 'overall',      n: 360, base: 62.2, ours: 70.2 },
  { domain: 'writer',       n: 23,  base: 65.2, ours: 91.3 },
  { domain: 'calc',         n: 47,  base: 66.0, ours: 80.9 },
  { domain: 'impress',      n: 47,  base: 69.1, ours: 82.8 },
  { domain: 'gimp',         n: 26,  base: 50.0, ours: 61.5 },
  { domain: 'chrome',       n: 46,  base: 63.5, ours: 73.9 },
  { domain: 'multi_apps',   n: 93,  base: 45.9, ours: 54.7 },
  { domain: 'os',           n: 24,  base: 79.2, ours: 87.5 },
  { domain: 'vs_code',      n: 22,  base: 68.2, ours: 68.2 },
  { domain: 'thunderbird',  n: 15,  base: 80.0, ours: 66.7 },
];

const SCALE_MAX = 100; // bar axis max (%)

function PerDomainBars() {
  return (
    <div className="font-system">
      {/* Shared legend */}
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[9.5px] text-ink-soft mb-2.5">
        <div className="flex items-center gap-1">
          <span className="block w-2.5 h-1.5 rounded-sm" style={{ backgroundColor: '#D6CDB6' }} />
          <span>base score</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="block w-2.5 h-1.5 rounded-sm" style={{ backgroundColor: '#862D1A' }} />
          <span>+ CUA-Gym lift</span>
        </div>
        <div className="flex items-center gap-1">
          <span
            className="block w-2.5 h-1.5 rounded-sm border"
            style={{
              borderColor: '#B83D44',
              borderWidth: 0.5,
              backgroundImage:
                'repeating-linear-gradient(135deg, #C8B8A8 0 1.5px, #FBE5E5 1.5px 3px)',
            }}
          />
          <span>RL regression</span>
        </div>
        <div className="ml-auto font-mono text-[9.5px] text-ink-faint tabular-nums">
          axis: 0 — {SCALE_MAX}
        </div>
      </div>

      <Panel title="Qwen3.5-35B-A3B" rows={PER_DOMAIN_A3B} />
      <div className="h-4" />
      <Panel title="Qwen3.5-397B-A17B" rows={PER_DOMAIN_A17B} />
    </div>
  );
}

function Panel({ title, rows }: { title: string; rows: DomainRow[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="text-[11px] font-semibold tracking-tight text-ink"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {title}
        </span>
        <span className="h-px flex-1 bg-rule" />
      </div>
      <ul className="space-y-1">
        {rows.map((d) => (
          <DomainBar key={d.domain} {...d} highlight={d.domain === 'overall'} />
        ))}
      </ul>
    </div>
  );
}

function DomainBar({
  domain,
  n,
  base,
  ours,
  highlight,
}: DomainRow & { highlight?: boolean }) {
  const lift = ours - base;
  const basePct = (base / SCALE_MAX) * 100;
  const oursPct = (ours / SCALE_MAX) * 100;
  const liftPct = (Math.max(0, lift) / SCALE_MAX) * 100;
  const lossPct = (Math.max(0, -lift) / SCALE_MAX) * 100; // RL regression

  return (
    <li
      className="grid items-center gap-2"
      style={{ gridTemplateColumns: '5.5rem 1.75rem minmax(0,1fr) 5.25rem' }}
    >
      {/* domain label */}
      <span
        className={[
          'text-[10.5px] truncate',
          highlight ? 'font-semibold text-ink' : 'text-ink-soft',
        ].join(' ')}
        style={{ fontFamily: 'var(--font-mono)' }}
        title={domain}
      >
        {domain}
      </span>

      {/* n count */}
      <span className="font-mono text-[9px] text-ink-faint tabular-nums text-right">
        n={n}
      </span>

      {/* bar */}
      <div
        className="relative h-3 rounded-sm"
        style={{ backgroundColor: 'rgba(27,24,22,0.05)' }}
      >
        {/* base portion: kept = min(base, ours); rendered up to oursPct on regression */}
        <div
          className="absolute top-0 left-0 h-full rounded-sm"
          style={{
            width: lift >= 0 ? `${basePct}%` : `${oursPct}%`,
            backgroundColor: highlight ? '#9C948A' : '#D6CDB6',
          }}
        />
        {/* positive lift extension (oxblood) */}
        {liftPct > 0 && (
          <div
            className="absolute top-0 h-full rounded-sm"
            style={{
              left: `${basePct}%`,
              width: `${liftPct}%`,
              backgroundColor: '#862D1A',
            }}
          />
        )}
        {/* RL regression: hatched red overlay where bar shrinks back from base to ours */}
        {lossPct > 0 && (
          <div
            className="absolute top-0 h-full rounded-sm border"
            style={{
              left: `${oursPct}%`,
              width: `${lossPct}%`,
              borderColor: '#B83D44',
              borderWidth: 0.5,
              backgroundImage:
                'repeating-linear-gradient(135deg, #C8B8A8 0 2px, #FBE5E5 2px 4px)',
            }}
          />
        )}
      </div>

      {/* numbers — two lines (base→ours / lift) to keep horizontal width compact */}
      <span className="font-mono text-[10px] tabular-nums text-right flex flex-col leading-tight whitespace-nowrap">
        <span className="text-ink">
          {base.toFixed(1)}→<span className={highlight ? 'font-semibold' : ''}>{ours.toFixed(1)}</span>
        </span>
        <span
          className="text-[9px]"
          style={{ color: lift > 0 ? '#1F6E3F' : lift < 0 ? '#B83D44' : '#9C948A' }}
        >
          {lift >= 0 ? '+' : ''}{lift.toFixed(1)} pp
        </span>
      </span>
    </li>
  );
}

function SubHead({ label }: { label: string }) {
  return (
    <tr>
      <td colSpan={3} className="pt-5 pb-1.5 font-display italic text-[13px] text-ink-faint">
        {label}
      </td>
    </tr>
  );
}

function Row({
  model,
  osworld,
  webarena,
  baseline,
  highlight,
}: {
  model: string;
  osworld: string;
  webarena: string;
  baseline?: boolean;
  highlight?: boolean;
}) {
  return (
    <tr className={highlight ? 'bg-oxblood/5' : ''}>
      <td
        className={[
          'py-1.5 pr-4 border-b border-rule',
          highlight ? 'font-medium text-ink' : 'text-ink-soft',
          baseline ? 'italic' : '',
        ].join(' ')}
      >
        {highlight && <span className="text-oxblood mr-1.5">▸</span>}
        {model}
      </td>
      <td
        className={[
          'py-1.5 pr-4 text-right font-mono border-b border-rule tabular-nums',
          highlight ? 'text-oxblood font-medium' : 'text-ink',
        ].join(' ')}
      >
        {osworld}
      </td>
      <td
        className={[
          'py-1.5 text-right font-mono border-b border-rule tabular-nums',
          highlight ? 'text-oxblood font-medium' : 'text-ink',
        ].join(' ')}
      >
        {webarena}
      </td>
    </tr>
  );
}
