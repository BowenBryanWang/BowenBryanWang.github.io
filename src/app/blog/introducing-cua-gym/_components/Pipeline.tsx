import SectionTitle from './SectionTitle';
import PipelineFigure from './PipelineFigure';

export default function Pipeline() {
  return (
    <section id="pipeline" className="container-prose pb-20">
      <SectionTitle label="Method" />

      <div className="prose-research">
        <p>
          An RLVR training tuple for CUA is a triple{' '}
          <em>(t, s, r)</em>: a task instruction, a reproducible initial
          environment state, and a reward function. The challenge is that
          if you generate these three components independently, there is no
          guarantee they are consistent with each other. The reward might
          pass trivially on the initial state, or the environment setup might
          make the task impossible to complete. Prior approaches tried to
          filter or verify consistency after the fact. CUA-Gym instead
          generates all three from a single shared specification, so
          consistency is guaranteed by construction.
        </p>
        <p>
          The key design choice is an <em>information
          barrier</em> between the Generator and Discriminator. The Generator
          proposes the full (task, environment, reward) triple; the
          Discriminator then verifies whether the reward actually tests what
          the task asks, but it cannot see the environment setup script. This
          forces the reward function to be grounded in the task semantics
          rather than the implementation details, which closes off the
          shortcut of simply re-checking what was just constructed.
        </p>
      </div>

      <figure className="my-12">
        <div className="relative left-1/2 -translate-x-1/2 w-[min(82rem,95vw)] px-2 sm:px-3">
          <PipelineFigure />
        </div>
        <figcaption className="mt-5 mx-auto max-w-prose2 text-[13px] leading-[1.7] text-ink-soft">
          <strong>Figure 1.</strong> The CUA-Gym data synthesis pipeline.
          Task instructions and grounded context (left) feed an{' '}
          <em>Orchestrator</em> that spawns an adversarial Generator–
          Discriminator loop under a strict information barrier; accepted
          tuples pass a two-stage <em>Filter</em>.
        </figcaption>
      </figure>

      <div className="prose-research mt-12">
        <p>
          We first ran this pipeline against the ten desktop applications in
          the OSWorld environment pool, generating roughly{' '}
          <strong>10,000+ verified tuples</strong>. Trained on these,
          OpenCUA-72B climbed from around 50 to 59 on OSWorld, which
          validated that automated co-generation could work. For a moment,
          it felt like the problem was solved.
        </p>
        <p>
          But ten applications is a benchmark, not a training distribution.
          The whole premise of CUA post-training is that the GUI surface is{' '}
          <em>vast</em>, and if training is confined to ten apps, the model
          has experienced a negligible fraction of it. We had validated the
          pipeline; we had not yet validated the thesis.
        </p>
        <p>
          Expanding coverage along the{' '}
          <em>environment axis</em> meant confronting the
          same accessibility problem from the motivation section, now at
          larger scale. Real users spend their days in Gmail, Slack, Notion,
          Salesforce, and dozens of domain-specific tools that no benchmark
          has ever covered. We tried to instrument some of these directly,
          building wrappers around live services and scripting account
          provisioning. The approach did not hold at training scale: parallel
          rollouts require fresh, isolated environment state on demand, and
          real applications simply cannot provide that.
        </p>
        <p>
          The insight that unblocked us was that CUA models do not actually
          need authentic environments. They need surfaces that{' '}
          <em>behave</em> like the real thing at the interaction level, with
          state that can be injected, inspected, and reset programmatically.
          We applied the same coding-agent loop from the reward-generation
          pipeline to environment synthesis: a <em>Plan Agent</em> drafts
          the application spec and UI traversal tree, a{' '}
          <em>Dev Agent</em> implements it as a self-contained SPA, and a{' '}
          <em>Web Agent</em> runs Playwright against the live mock, feeds
          discrepancies back, and iterates until behavior converges.
        </p>
      </div>

      <figure className="my-12">
        <div className="relative left-1/2 -translate-x-1/2 w-[min(82rem,95vw)] px-4">
          <img
            src="/figures/cua-gym/env_pipeline_t.png"
            alt="Multi-agent pipeline for mock environment synthesis"
            loading="lazy"
            className="block w-full h-auto"
          />
        </div>
        <figcaption className="mt-5 mx-auto max-w-prose2 text-[13px] leading-[1.7] text-ink-soft">
          <strong>Figure 2.</strong> Multi-agent pipeline for mock-environment
          synthesis. A <em>Plan Agent</em> drafts{' '}
          <span className="font-mono">DESIGN.md</span> and{' '}
          <span className="font-mono">TODO.md</span> from grounded research; a{' '}
          <em>Dev Agent</em> implements the SPA; a <em>Web Agent</em> verifies
          live behaviour via Playwright, feeding discrepancies back for{' '}
          <em>N</em> rounds until convergence.
        </figcaption>
      </figure>

      <div className="prose-research mt-4">
        <p>
          This produced <strong>94 mock web applications</strong> covering
          communication, productivity, finance, developer tooling, and
          e-commerce. Combined with the 16 desktop applications from OSWorld,
          that gives us <strong>110 environments</strong> and{' '}
          <strong>32,122 verified RLVR tuples</strong>, the largest open
          CUA training corpus to date.
        </p>
        <p>
          One thing the pipeline made viscerally clear: once reward generation
          is automated and environments are reliable, the bottleneck shifts
          entirely to the queries. A good query for CUA is not just a
          well-formed instruction. It requires careful thought about what
          capability it exercises, what difficulty level it targets, and what
          the initial environment context looks like before the agent starts.
          Generating a rich, grounded environment context alongside a
          realistic task description turned out to be significantly harder
          and more impactful than getting the reward annotation right.
        </p>
        <p>
          We partially addressed this by grounding query generation in
          tutorials, online forums, and prepared asset files, which helped
          calibrate task realism and difficulty. But there is substantial room
          to improve. Scaling truly difficult, long-horizon queries that
          reflect how people actually use computers remains an open problem,
          and one we believe deserves deeper design and research attention.
        </p>
      </div>

      <ComparisonTable />
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Table 1 — comparison vs other CUA RLVR datasets
// ─────────────────────────────────────────────────────────────────────────────

type ComparisonRow = {
  name: string;
  ref?: string;
  platform: string;
  size: string;
  env: string;
  reward: string;
  open: string;
  ours?: boolean;
};

const COMPARISON: ComparisonRow[] = [
  { name: 'GUI-Genesis',      ref: '7',  platform: 'Mobile',      size: '969',    env: '1',   reward: 'Programmatic', open: 'No' },
  { name: 'WebArena-Infinity',ref: '38', platform: 'Web',         size: '1,260',  env: '10',  reward: 'Programmatic', open: 'Yes' },
  { name: 'InfiniteWeb',      ref: '36', platform: 'Web',         size: '600',    env: '—',   reward: 'Programmatic', open: 'No★' },
  { name: 'UltraCUA',         ref: '35', platform: 'Desktop',     size: '17,000', env: '9',   reward: 'Programmatic', open: 'No★' },
  { name: 'Gym-Anything',     ref: '1',  platform: 'Desktop',     size: '7,277',  env: '193', reward: 'VLM',          open: 'Yes' },
  { name: 'CUA-Gym',          ours: true,platform: 'Desktop + Web',size: '32,122', env: '110', reward: 'Programmatic', open: 'Yes' },
];

function ComparisonTable() {
  return (
    <figure className="my-10">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="border-b-2 border-ink">
            <th className="text-left py-2 pr-4 font-medium text-ink">Dataset</th>
            <th className="text-left py-2 pr-4 font-medium text-ink">Platform</th>
            <th className="text-right py-2 pr-4 font-medium text-ink whitespace-nowrap">Data size</th>
            <th className="text-right py-2 pr-4 font-medium text-ink whitespace-nowrap">Env. size</th>
            <th className="text-left py-2 pr-4 font-medium text-ink">Reward</th>
            <th className="text-left py-2 font-medium text-ink">Open</th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON.map((r, i) => {
            const last = i === COMPARISON.length - 1;
            return (
              <tr
                key={r.name}
                className={[
                  'transition-colors',
                  r.ours ? 'bg-oxblood/5' : 'hover:bg-paper-deep/30',
                  last ? '' : '',
                ].join(' ')}
                style={{
                  borderTop: r.ours ? '1px solid var(--ink)' : undefined,
                }}
              >
                <td
                  className={[
                    'py-1.5 pr-4 border-b border-rule',
                    r.ours ? 'font-medium text-ink' : 'text-ink-soft',
                  ].join(' ')}
                >
                  {r.ours && <span className="text-oxblood mr-1.5">▸</span>}
                  {r.name}
                  {r.ref && (
                    <span className="font-mono text-[10px] text-ink-faint ml-1">
                      [{r.ref}]
                    </span>
                  )}
                </td>
                <td
                  className={[
                    'py-1.5 pr-4 border-b border-rule whitespace-nowrap',
                    r.ours ? 'font-medium text-ink' : 'text-ink-soft',
                  ].join(' ')}
                >
                  {r.platform}
                </td>
                <td
                  className={[
                    'py-1.5 pr-4 text-right border-b border-rule font-mono tabular-nums whitespace-nowrap',
                    r.ours ? 'text-oxblood font-semibold' : 'text-ink',
                  ].join(' ')}
                >
                  {r.size}
                </td>
                <td
                  className={[
                    'py-1.5 pr-4 text-right border-b border-rule font-mono tabular-nums',
                    r.ours ? 'text-oxblood font-semibold' : 'text-ink',
                  ].join(' ')}
                >
                  {r.env}
                </td>
                <td
                  className={[
                    'py-1.5 pr-4 border-b border-rule',
                    r.ours ? 'font-medium text-ink' : 'text-ink-soft',
                  ].join(' ')}
                >
                  {r.reward}
                </td>
                <td
                  className={[
                    'py-1.5 border-b border-rule',
                    r.ours ? 'font-medium text-ink' : 'text-ink-soft',
                  ].join(' ')}
                >
                  {r.open}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <figcaption className="mt-3 text-[12.5px] leading-[1.65] text-ink-soft">
        <strong>Table 1.</strong> CUA-Gym versus existing CUA RLVR datasets.
        Highlighted row is ours. <em>Open</em> indicates whether both data
        and pipeline are publicly released; ★ marks partial release.
      </figcaption>
    </figure>
  );
}

