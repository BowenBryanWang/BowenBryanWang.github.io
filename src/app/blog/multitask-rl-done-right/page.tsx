import { type Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/Container'

// Shared prose, table, callout and KaTeX styles from the first Agentic RL
// Week post; this post adds only its figure tokens.
import '../anticausal-masks/_styles/anticausal.css'
import './_styles/multitask.css'

import Tex from '../anticausal-masks/_components/Tex'
import SectionTitle from '../anticausal-masks/_components/SectionTitle'
import { MixLedgerFigure, AggregationFigure } from './_components/Figures'

export const metadata: Metadata = {
  title: "Filtering Doesn't Change Your Mix. Fixing the Mix Does.",
  description:
    'Multi-task RL done right, part one: in multi-environment GRPO training, zero-advantage filtering leaves environment weights intact, while the common fix of holding the post-filter mix multiplies them by one over the acceptance rate, and per-sequence loss normalization silently reweights environments by inverse length. A pre-registered research plan.',
  robots: { index: false },
}

const POST = {
  series: 'Agentic RL Week · Multi-Task RL Done Right',
  title: "Filtering Doesn't Change Your Mix. Fixing the Mix Does.",
  subtitle:
    'Every multi-environment RL run contains three mixtures: the prompts you dispatch, the groups that survive filtering, and the gradient that actually moves the weights. Only the third is your objective. We show that zero-advantage filtering leaves it alone, that holding the post-filter mix distorts it by one over the acceptance rate, and that per-sequence loss normalization reweights environments by inverse length and keeps re-mixing them as episodes grow. One ledger rule fixes both; one log statistic tells you whether you need it.',
  author: 'Bowen Wang',
  date: 'November 4, 2026',
  reading: 'Research plan · 18 min read',
}

const TOC = [
  { label: 'Scope', href: '#scope' },
  { label: 'Three mixtures', href: '#mixtures' },
  { label: 'Setup and notation', href: '#setup' },
  { label: 'Result 1: filtering is free', href: '#filtering' },
  { label: 'Result 2: fixing the mix is not', href: '#ratio' },
  { label: 'Result 3: the normalizer is a mixer', href: '#normalizer' },
  { label: 'Doing it right', href: '#rule' },
  { label: 'Boundary conditions', href: '#caveats' },
  { label: 'What is new and what is not', href: '#related' },
  { label: 'Experimental plan', href: '#plan' },
  { label: 'Predictions and falsifiers', href: '#predictions' },
  { label: 'Out of scope, and the rest of the series', href: '#next' },
  { label: 'References', href: '#references' },
]

function Ref({ n }: { n: number }) {
  return (
    <sup>
      <a href={`#ref-${n}`}>[{n}]</a>
    </sup>
  )
}

function PostHero() {
  return (
    <header className="mb-8 mt-4">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-[2.75rem] sm:leading-[1.15]">
        {POST.title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
        {POST.subtitle}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3 text-[13px]">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {POST.author}
        </span>
        <span className="am-pill">Draft · pre-registration · no results yet</span>
      </div>
      <hr className="mt-6 border-zinc-200 dark:border-zinc-700/40" />
    </header>
  )
}

function TableOfContents() {
  const mid = Math.ceil(TOC.length / 2)
  const cols = [TOC.slice(0, mid), TOC.slice(mid)]
  return (
    <nav
      className="mb-10 mt-6 rounded-xl border px-6 py-5"
      style={{ borderColor: 'var(--rule)' }}
    >
      <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
        {cols.map((col, i) => (
          <ul key={i} className="space-y-2">
            {col.map((e) => (
              <li key={e.href}>
                <a
                  href={e.href}
                  className="text-[13.5px] transition-colors hover:text-amber-700 dark:hover:text-amber-300"
                  style={{ color: 'var(--ink)' }}
                >
                  {e.label}
                </a>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </nav>
  )
}

export default function MultitaskMixPost() {
  return (
    <Container className="mt-6 lg:mt-10">
      <article className="mx-auto max-w-3xl">

        <PostHero />

        <div className="am-scope mt-scope">
          <figure>
            <MixLedgerFigure />
            <figcaption>
              <strong>Figure 1.</strong> Two environments, a 50 / 50 target,
              eight rollouts per prompt. The easy environment loses 43% of its
              groups to zero-advantage filtering, so it looks under-represented
              in the batch (left, middle bar). The groups it keeps are exactly
              the ones that contain a failure, and they carry proportionally
              more signal, so its gradient share is still 50%. Re-dispatching
              to restore the batch share (right) over-corrects: the easy
              environment now receives 63.5% of the gradient. The distortion is{' '}
              <Tex tail=",">{String.raw`a_{\text{hard}}/a_{\text{easy}}`}</Tex>{' '}
              the ratio of acceptance rates, and it grows without bound as an
              environment saturates.
            </figcaption>
          </figure>

          <div className="am-prose">
            <p>
              Frontier agentic models are now trained on hundreds to thousands
              of environments in one run. DeepSeek-V3.2 synthesized 1,827
              agent environments<Ref n={7} />; LongCat-Flash-Thinking-2601
              trains on more than ten thousand<Ref n={6} />. Labs disagree on
              whether to train them jointly or as specialists that are later
              distilled, and both camps cite interference between domains as
              the reason for their choice<Ref n={29} />. Almost every report
              that trains jointly also describes hand-tuning the mixture
              <Ref n={18} />
              <Ref n={19} />
              <Ref n={20} />, and at least two systems built machinery
              specifically to hold the mixture fixed while filtering rates and
              episode durations drift<Ref n={3} />
              <Ref n={4} />.
            </p>
            <p>
              This post asks a narrow question underneath that machinery:{' '}
              <em>
                when you set environment weights, are those the weights your
                gradient actually uses?
              </em>{' '}
              The answer depends on two implementation choices that look
              unrelated to the mixture: how the batch is refilled after
              filtering, and how the loss is normalized. We derive the exact
              environment weights each choice produces, show that two widely
              used patterns get them wrong in opposite directions, and give a
              rule that makes the realized weights equal the intended ones by
              construction.
            </p>
            <p>The claims, in the order we defend them:</p>
            <ul>
              <li>
                <strong>Filtering is free.</strong> Dropping groups whose
                advantages are all zero, then refilling with the original
                dispatch weights, leaves every environment&rsquo;s gradient
                weight unchanged. It only rescales the step.
              </li>
              <li>
                <strong>Fixing the mix is not.</strong> Refilling so that the{' '}
                <em>post-filter</em> share matches the target multiplies each
                environment&rsquo;s weight by{' '}
                <Tex tail=",">{String.raw`1/a_k`}</Tex> one over its acceptance
                rate. Near-solved and near-impossible environments are
                amplified, and in a two-task construction the expected update
                becomes exactly zero while the true gradient is not.
              </li>
              <li>
                <strong>The normalizer is a mixer.</strong> Per-sequence{' '}
                <Tex>{String.raw`1/|o|`}</Tex> normalization, which GRPO as
                written, GSPO and several production recipes use, weights
                environment <Tex>k</Tex> by roughly{' '}
                <Tex tail=".">{String.raw`q_k\,\mathbb{E}[1/L_k]`}</Tex> A 40k-token
                environment dispatched at 30% receives about 2% of the
                gradient, and less as its episodes grow. Global token-mean does
                not have this problem.
              </li>
              <li>
                <strong>One ledger rule fixes both.</strong> Choose dispatch
                weights for speed, then weight each episode by{' '}
                <Tex tail=".">{String.raw`w_k/(q_k\kappa_k)`}</Tex> The
                objective no longer depends on how you sample.
              </li>
              <li>
                <strong>Whether it matters is measurable for free.</strong> The
                realized gradient share per environment can be computed from
                existing logs. That number decides whether this is a headline
                or a diagnostic, and we commit to reporting it either way.
              </li>
            </ul>
            <p>
              No result in this post has been run yet. As in the previous post
              in this series<Ref n={23} />, we write the predictions down
              before the experiments.
            </p>
          </div>

          <TableOfContents />

          {/* ------------------------------------------------------------ */}
          <SectionTitle id="scope" label="Scope" />
          <div className="am-prose">
            <div className="am-callout forest">
              <div className="am-callout-label">In scope</div>
              <ul>
                <li>
                  One policy trained on <Tex>K</Tex> environments with a
                  GRPO-family estimator: a group-relative baseline, optionally
                  divided by the group standard deviation, binary or bounded
                  rewards.
                </li>
                <li>
                  Batch construction after zero-advantage filtering: refill
                  rules, per-environment quotas, oversampling.
                </li>
                <li>
                  Loss aggregation: global token-mean, per-sequence{' '}
                  <Tex tail=",">{String.raw`1/|o|`}</Tex> per-group
                  (prompt-average) normalizers, and GSPO&rsquo;s
                  length-normalized sequence ratio.
                </li>
                <li>
                  The question: given target weights{' '}
                  <Tex tail=",">w</Tex> which of these choices make the
                  expected update equal{' '}
                  <Tex tail=",">{String.raw`\sum_k w_k\nabla J_k`}</Tex> and
                  by how much do the common ones miss?
                </li>
                <li>
                  Deliverables: three exact statements, a ledger rule of
                  roughly fifteen lines, a log statistic, and two controlled
                  experiments.
                </li>
              </ul>
            </div>
            <div className="am-callout">
              <div className="am-callout-label">Out of scope</div>
              <ul>
                <li>
                  <strong>Choosing <Tex>w</Tex>.</strong> We take the target
                  weights as given. We sketch one principled way to produce
                  them, a constrained objective, only to show that it needs
                  the same estimator fix.
                </li>
                <li>
                  <strong>Cost-aware allocation.</strong> How many rollouts to
                  spend per environment is a variance question with known
                  answers<Ref n={14} />. We use it as a tool, not a claim.
                </li>
                <li>
                  <strong>Transfer and interference.</strong> Measuring which
                  environments help each other online is covered by TAC and
                  HarnessBandit<Ref n={16} />
                  <Ref n={17} />.
                </li>
                <li>
                  <strong>Curricula over horizons and tasks.</strong> Whether
                  learning-progress samplers confuse budget growth with
                  learning is the next post in this series.
                </li>
                <li>
                  <strong>Drops that carry gradient.</strong> Staleness,
                  timeout and turn-cap drops are not zero-advantage filters;
                  they are the subject of the previous post<Ref n={23} />.
                </li>
                <li>
                  <strong>Optimizer effects.</strong> We note where Adam or
                  Muon absorb or compress a weight, and leave the net effect to
                  the experiments.
                </li>
              </ul>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle id="mixtures" label="Three mixtures" />
          <div className="am-prose">
            <p>
              Any multi-environment run has three distributions over
              environments, and frameworks expose knobs for the first two:
            </p>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>Mixture</th>
                    <th>What it counts</th>
                    <th>Who controls it</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Dispatch</strong> <Tex>q_k</Tex>
                    </td>
                    <td>Prompts sent to the rollout engine</td>
                    <td>
                      The <code>ratio</code> or <code>weights</code> field in
                      most configs
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Batch</strong>
                    </td>
                    <td>Groups that survive filtering and reach the trainer</td>
                    <td>Quota or refill logic in the data buffer</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Gradient</strong> <Tex>w_k</Tex>
                    </td>
                    <td>
                      Each environment&rsquo;s share of the expected update
                    </td>
                    <td>Nobody directly; it follows from the other two and the loss</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              The objective is the third one. If the expected update is{' '}
              <Tex tail=",">{String.raw`\sum_k \omega_k\nabla J_k`}</Tex> the
              run is ascending <Tex tail=",">{String.raw`\sum_k \omega_k J_k`}</Tex>{' '}
              whatever the config says. The rest of this post computes{' '}
              <Tex>{String.raw`\omega_k`}</Tex> for the common choices.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle id="setup" label="Setup and notation" />
          <div className="am-prose">
            <p>
              Environment <Tex>k</Tex> has prompt distribution{' '}
              <Tex>{String.raw`D_k`}</Tex> and success rate{' '}
              <Tex>{String.raw`J_k(\theta)=\mathbb{E}_{x\sim D_k}[p_x(\theta)]`}</Tex>{' '}
              with binary reward. A prompt gets <Tex>G</Tex> rollouts. With
              group-mean advantages{' '}
              <Tex tail=",">{String.raw`A_i=R_i-\bar R`}</Tex> the group&rsquo;s
              score sum{' '}
              <Tex>{String.raw`S=\sum_i A_i\nabla\log\pi_\theta(\tau_i)`}</Tex>{' '}
              satisfies
            </p>
            <Tex display>{String.raw`\mathbb{E}[S\mid x]=(G-1)\,\nabla p_x .`}</Tex>
            <p>
              A group is <em>accepted</em> when its rewards are not all equal.
              Its probability is{' '}
              <Tex tail=",">{String.raw`a_x=1-p_x^G-(1-p_x)^G`}</Tex> and the
              environment-level acceptance rate is{' '}
              <Tex tail=".">{String.raw`a_k=\mathbb{E}_{x\sim D_k}[a_x]`}</Tex>{' '}
              The trainer receives a batch of <Tex>B</Tex> accepted groups and
              averages their losses. Target weights{' '}
              <Tex>{String.raw`w_k\ge 0`}</Tex> sum to one; the intended
              update is{' '}
              <Tex tail=".">{String.raw`\sum_k w_k\nabla J_k`}</Tex>
            </p>
            <details>
              <summary>Assumptions used in the three results</summary>
              <ul>
                <li>
                  The filter acts on the final advantage: a filtered group has{' '}
                  <Tex>A\equiv 0</Tex> exactly. Reward shaping can break this;
                  see boundary conditions.
                </li>
                <li>
                  Groups are drawn independently; refill draws are i.i.d.
                  from the stated dispatch distribution; <Tex>B</Tex> is fixed.
                </li>
                <li>
                  Group size is equal across environments in the headline
                  formulas. Unequal <Tex>{String.raw`G_k`}</Tex> adds a static
                  factor{' '}
                  <Tex>{String.raw`(G_k-1)/G_k`}</Tex> under per-sample
                  averaging.
                </li>
                <li>
                  Expectations are first-order: the baseline is treated as a
                  constant in Result 3, and PPO clipping is inactive or acts
                  identically across arms. The clipped surrogate is exactly
                  zero at <Tex tail=",">A=0</Tex> so Result 1 survives clipping
                  and multiple epochs.
                </li>
              </ul>
            </details>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle id="filtering" label="Result 1: filtering is free" />
          <div className="am-prose">
            <p>
              A filtered group contributes <Tex>S=0</Tex>. So the accepted
              groups carry the whole expected gradient of their environment:
            </p>
            <Tex display>{String.raw`\mathbb{E}\big[S\,\mathbb{1}\{\text{acc}\}\mid k\big]=\mathbb{E}[S\mid k]=(G-1)\nabla J_k
\quad\Longrightarrow\quad
\mathbb{E}[S\mid \text{acc},k]=\frac{(G-1)\nabla J_k}{a_k}.`}</Tex>
            <p>
              If the batch is refilled with the dispatch weights, environment{' '}
              <Tex>k</Tex> makes up a fraction{' '}
              <Tex>{String.raw`q_k a_k/\bar a`}</Tex> of accepted groups, where{' '}
              <Tex tail=".">{String.raw`\bar a=\sum_j q_j a_j`}</Tex> The two
              factors of <Tex>{String.raw`a_k`}</Tex> cancel:
            </p>
            <div className="am-callout">
              <div className="am-callout-label">Result 1</div>
              <Tex display>{String.raw`\mathbb{E}[\hat g_{\text{refill}(q)}]=\frac{G-1}{G\,\bar a}\sum_k q_k\,\nabla J_k .`}</Tex>
              <p>
                Environment weights equal the dispatch weights. Prompt weights
                inside each environment are also unchanged. Filtering changes
                only the global step size{' '}
                <Tex tail=",">{String.raw`1/\bar a`}</Tex> which adaptive
                optimizers absorb.
              </p>
            </div>
            <p>
              The same argument at the level of single prompts is folklore for
              DAPO&rsquo;s dynamic sampling<Ref n={1} />, and ARCUS states it
              as a corollary<Ref n={12} />. Lifting it to environments is
              immediate. We state it because the systems in the next section
              act as if it were false.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle id="ratio" label="Result 2: fixing the mix is not" />
          <div className="am-prose">
            <p>
              The batch share after filtering is{' '}
              <Tex tail=",">{String.raw`q_k a_k/\bar a`}</Tex> not{' '}
              <Tex tail=".">{String.raw`q_k`}</Tex> An environment that is
              nearly solved looks starved. A natural fix is to hold the
              post-filter share at the target: dispatch{' '}
              <Tex>{String.raw`q_k\propto w_k/a_k`}</Tex> or, equivalently,
              keep sampling environment <Tex>k</Tex> until it has{' '}
              <Tex>{String.raw`w_kB`}</Tex> accepted groups. Each accepted group
              still carries{' '}
              <Tex tail=",">{String.raw`(G-1)\nabla J_k/a_k`}</Tex> so:
            </p>
            <div className="am-callout">
              <div className="am-callout-label">Result 2</div>
              <Tex display>{String.raw`\mathbb{E}[\hat g_{\text{hold}(w)}]=\frac{G-1}{G}\sum_k \frac{w_k}{a_k}\,\nabla J_k .`}</Tex>
              <p>
                The realized weights are{' '}
                <Tex tail=",">{String.raw`w_k/a_k`}</Tex> renormalized. The
                distortion between two environments is the inverse ratio of
                their acceptance rates. It depends on acceptance, not on
                difficulty: an environment at pass rate 0.97 and one at 0.03
                are amplified equally.
              </p>
            </div>
            <p>How large is it? With a 50 / 50 target against an environment at pass rate 0.5:</p>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>Other environment&rsquo;s pass rate</th>
                    <th className="am-num">Acceptance, G = 8</th>
                    <th className="am-num">Distortion, G = 8</th>
                    <th className="am-num">Realized split, G = 8</th>
                    <th className="am-num">Distortion, G = 16</th>
                    <th className="am-num">Realized split, G = 16</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>0.90</td>
                    <td className="am-num">0.570</td>
                    <td className="am-num">1.74×</td>
                    <td className="am-num">63.5 / 36.5</td>
                    <td className="am-num">1.23×</td>
                    <td className="am-num">55.1 / 44.9</td>
                  </tr>
                  <tr>
                    <td>0.95</td>
                    <td className="am-num">0.337</td>
                    <td className="am-num">2.95×</td>
                    <td className="am-num">74.7 / 25.3</td>
                    <td className="am-num">1.79×</td>
                    <td className="am-num">64.1 / 35.9</td>
                  </tr>
                  <tr>
                    <td>0.97</td>
                    <td className="am-num">0.216</td>
                    <td className="am-num">4.59×</td>
                    <td className="am-num">82.1 / 17.9</td>
                    <td className="am-num">2.59×</td>
                    <td className="am-num">72.2 / 27.8</td>
                  </tr>
                  <tr>
                    <td>0.99</td>
                    <td className="am-num">0.077</td>
                    <td className="am-num">12.8×</td>
                    <td className="am-num">92.8 / 7.2</td>
                    <td className="am-num">6.73×</td>
                    <td className="am-num">87.1 / 12.9</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              At moderate pass rates the effect is modest. It becomes large
              exactly when an environment saturates, which in a long run
              happens to some environment all the time. Without a cap the
              saturating environment&rsquo;s weight diverges; prime-rl&rsquo;s
              proposal capped the correction at 20×<Ref n={4} />.
            </p>

            <div className="am-callout forest">
              <div className="am-callout-label">A two-task construction where the update vanishes</div>
              <p>
                Let task A have{' '}
                <Tex>{String.raw`p_A(\theta)=\sigma(\theta)`}</Tex> and task B
                have{' '}
                <Tex tail=",">{String.raw`p_B(\theta)=\sigma(\log 9-\theta)`}</Tex>{' '}
                with equal target weights, two rollouts per group, binary
                reward and population-std normalization. At{' '}
                <Tex tail=",">\theta=0</Tex> checked by exact enumeration:
              </p>
              <div className="am-table">
                <table>
                  <thead>
                    <tr>
                      <th>Quantity</th>
                      <th className="am-num">Task A</th>
                      <th className="am-num">Task B</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Pass rate</td>
                      <td className="am-num">0.5</td>
                      <td className="am-num">0.9</td>
                    </tr>
                    <tr>
                      <td>Acceptance</td>
                      <td className="am-num">0.50</td>
                      <td className="am-num">0.18</td>
                    </tr>
                    <tr>
                      <td>Update per accepted group</td>
                      <td className="am-num">+0.5</td>
                      <td className="am-num">−0.5</td>
                    </tr>
                    <tr>
                      <td>Expected update, unfiltered</td>
                      <td className="am-num">+0.25</td>
                      <td className="am-num">−0.09</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                The true gradient of the equal-weight objective is{' '}
                <Tex tail=",">{String.raw`\tfrac12(0.25-0.09)=0.08`}</Tex> and
                unfiltered GRPO matches it exactly in this construction, so
                the discrepancy below cannot be blamed on GRPO&rsquo;s own
                bias. Refilling with the dispatch weights gives a positive
                update in the same direction. Holding equal accepted counts
                gives <strong>exactly zero</strong>. Tilting the target
                slightly toward B reverses the sign.
              </p>
            </div>

            <p>
              <span className="am-runin">Where this pattern lives.</span> We
              read the documentation, papers and pull requests below; we have
              not run their code. Two of them define their target as batch
              composition and meet it. The point is that batch composition is
              not the objective.
            </p>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>System</th>
                    <th>What it holds fixed</th>
                    <th>Realized gradient weights</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Miles mixed data sources<Ref n={5} /></td>
                    <td>Dispatch share; refill uses the same weights</td>
                    <td>
                      <Tex>{String.raw`\propto q_k`}</Tex>, as intended
                    </td>
                  </tr>
                  <tr>
                    <td>MiMo-V2.6 Sample Mixer, Eq. 7<Ref n={3} /></td>
                    <td>Retained-group share; both terms of the dispatch weight divide by the acceptance rate</td>
                    <td>
                      <Tex>{String.raw`\propto B_k/a_k`}</Tex>
                    </td>
                  </tr>
                  <tr>
                    <td>MT-GRPO ratio-preserving sampler<Ref n={2} /></td>
                    <td>Post-filter counts drawn from the task weights; oversampling by one over the acceptance rate, capped</td>
                    <td>
                      <Tex>{String.raw`\propto z_k/a_k`}</Tex> up to the cap,
                      against its own stated objective{' '}
                      <Tex>{String.raw`\sum_k z_kJ_k`}</Tex>
                    </td>
                  </tr>
                  <tr>
                    <td>prime-rl #2072 and #3804, both closed<Ref n={4} /></td>
                    <td>Realized training ratio, or shipped prompt share with a correction capped at 20×</td>
                    <td>
                      Fixed point <Tex>{String.raw`q\propto w/a`}</Tex>
                    </td>
                  </tr>
                  <tr>
                    <td>LongCat-Flash-Thinking-2601 §3.3.3<Ref n={6} /></td>
                    <td>Per-domain oversampling to keep a balanced mixture at the training stage</td>
                    <td>Depends on whether balance is enforced after filtering; not stated</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              MT-GRPO is the clearest case because it states the objective. Its
              appendix argues that &ldquo;enforcing the ratio-preserving
              constraint is what converts the intended weight into actual
              gradient contribution&rdquo;<Ref n={2} />. Result 1 says the
              opposite: refilling with the original weights already does that,
              and enforcing the constraint undoes it. In fairness, its hardest
              task also has the highest filter rate, so the{' '}
              <Tex>{String.raw`1/a`}</Tex> factor happens to push toward its
              worst-case goal, and its ablation improves that task. Whether the
              tilt helps is a separate question from whether it is the one the
              designer wrote down.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle id="normalizer" label="Result 3: the normalizer is a mixer" />
          <div className="am-prose">
            <p>
              The second hidden mixer is the loss normalizer. Let each episode
              receive an aggregation weight{' '}
              <Tex tail=":">{String.raw`h(\tau)`}</Tex>{' '}
              <Tex>h</Tex> is a constant under global token-mean,{' '}
              <Tex>{String.raw`1/L(\tau)`}</Tex> under per-sequence{' '}
              <Tex>{String.raw`1/|o|`}</Tex> normalization, and roughly{' '}
              <Tex>{String.raw`1/(G\bar L_x)`}</Tex> under a per-group
              normalizer. Holding the baseline fixed at{' '}
              <Tex tail=",">{String.raw`J_x`}</Tex> the score-function
              identity gives exactly
            </p>
            <Tex display>{String.raw`\mathbb{E}[\hat g]=\sum_k q_k\,\mathbb{E}_{x\sim D_k}\Big[H_x(\theta)\,\nabla J_x+\nabla\,\mathrm{Cov}_x\big(R,h\big)\Big],\qquad H_x=\mathbb{E}[h\mid x].`}</Tex>
            <div className="am-callout">
              <div className="am-callout-label">Result 3</div>
              <ul>
                <li>
                  <strong>Global token-mean is neutral.</strong> Every episode
                  enters with its full score function times one shared
                  scalar, which is sequence-level REINFORCE. Environment
                  weights equal <Tex tail=".">{String.raw`q_k`}</Tex> Long
                  environments do <em>not</em> dominate.
                </li>
                <li>
                  <strong>Per-sequence and per-group normalizers reweight.</strong>{' '}
                  Environment <Tex>k</Tex> gets weight{' '}
                  <Tex tail=",">{String.raw`\approx q_k\,\mathbb{E}[1/L_k](\theta)`}</Tex>{' '}
                  which depends on the parameters. The update is then not the
                  gradient of any fixed weighted objective.
                </li>
                <li>
                  <strong>The covariance term</strong> is the familiar
                  within-task length bias<Ref n={9} />: it rewards short
                  successes and long failures.
                </li>
              </ul>
            </div>
            <figure>
              <AggregationFigure />
              <figcaption>
                <strong>Figure 2.</strong> Three environments dispatched at
                30 / 30 / 40 with mean generated lengths of 40k, 1k and 15k
                tokens. Under global token-mean the gradient shares equal the
                dispatch shares (top). Under a per-sequence normalizer the
                long-horizon SWE environment receives 2.2% of the gradient
                (middle). When its episodes grow to 80k tokens, which agents
                commonly do as they learn to use more turns, its share halves
                again with no config change (bottom).
              </figcaption>
            </figure>
            <p>
              The drift creates a plausible feedback loop in agentic training.
              Failures in a hard long-horizon environment already tend to run
              to the turn cap; the covariance term lengthens them further; the
              environment&rsquo;s weight falls; it learns more slowly and
              fails more. We have not observed this loop. It is a prediction.
            </p>
            <p>
              <span className="am-runin">Who uses which normalizer.</span>{' '}
              GRPO as written in DeepSeek-V3.2 normalizes per sequence
              <Ref n={7} />. GSPO&rsquo;s length-normalized sequence ratio has
              the same effect on the gradient<Ref n={8} />, and LongCat-Flash-Thinking-2601
              trains its multi-domain run with GSPO<Ref n={6} />. ScaleRL&rsquo;s
              prompt-average<Ref n={10} /> and MiniMax&rsquo;s per-group
              CISPO normalizer<Ref n={11} /> are per-group. verl&rsquo;s
              default <code>token-mean</code> and prime-rl&rsquo;s global
              denominator are neutral. Two reports already point at
              aggregation mattering for agents: GLM-4.5 found a token-weighted
              mean clearly better than a sequence mean<Ref n={21} />, and
              CompactionRL lost 6.8 points on SWE-bench Verified without
              token-level normalization<Ref n={26} />, and AgentRL reports that
              tasks of different lengths learn at very different rates
              <Ref n={25} />. None attributes the effect to environment
              weights.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle id="rule" label="Doing it right" />
          <div className="am-prose">
            <p>
              The three results separate cleanly into what should be chosen and
              what should be corrected.
            </p>
            <h3>1. Write the objective down</h3>
            <p>
              Either a weighted objective{' '}
              <Tex tail=",">{String.raw`J_w=\sum_k w_kJ_k`}</Tex> or a
              constrained one that improves the total without letting any
              capability fall more than a tolerance<Ref n={15} />:
            </p>
            <Tex display>{String.raw`\max_\theta\ \sum_k w_kJ_k(\theta)\quad\text{s.t.}\quad J_k(\theta)\ \ge\ J_k(\theta_{\text{ref}})-\delta_k .`}</Tex>
            <p>
              The constrained version is solved with per-environment
              multipliers <Tex>{String.raw`\mu_k\ge0`}</Tex> and an update
              direction{' '}
              <Tex tail=".">{String.raw`\sum_k (w_k+\mu_k)\nabla J_k`}</Tex>{' '}
              Here the estimator matters twice. If the batch holds the
              post-filter share, the multipliers believe they are applying{' '}
              <Tex>{String.raw`w_k+\mu_k`}</Tex> while the gradient applies{' '}
              <Tex tail=",">{String.raw`(w_k+\mu_k)/a_k`}</Tex> and the dual
              updates chase the wrong target. Any scheme that produces weights,
              whether a designer, a dual variable or a min-max game, needs an
              estimator that delivers them.
            </p>
            <h3>2. Choose dispatch for speed, freely</h3>
            <p>
              Once the objective is fixed, the dispatch distribution{' '}
              <Tex>q</Tex> only affects variance. Cost-aware rules such as{' '}
              <Tex>{String.raw`q_k\propto w_k\sigma_k/\sqrt{c_k}`}</Tex> are
              textbook stratified sampling, and DUET derives the per-prompt
              version for RLVR<Ref n={14} />; earlier allocators work per prompt and by
              rollout count<Ref n={27} />. Oversampling a low-acceptance
              environment is fine. Keep{' '}
              <Tex>{String.raw`q_k\ge\epsilon\,w_k`}</Tex> so the correction
              below stays bounded.
            </p>
            <h3>3. Weight each episode by the ledger</h3>
            <p>
              Give every episode from environment <Tex>k</Tex> a fixed loss
              weight
            </p>
            <Tex display>{String.raw`\lambda_k=\frac{w_k}{q_k\,\kappa_k},`}</Tex>
            <p>
              where <Tex>{String.raw`\kappa_k`}</Tex> is the per-episode
              aggregation factor: one for token-sum with a batch-wide
              denominator, or a constant measured once at warm-up if a
              per-sequence normalizer must stay. Then the expected update is{' '}
              <Tex>{String.raw`\propto\sum_k w_k\nabla J_k`}</Tex> regardless of{' '}
              <Tex tail=",">q</Tex> filtering, or length drift. If you
              oversample to hold the post-filter share,{' '}
              <Tex>{String.raw`q_k\propto w_k/a_k`}</Tex> and the ledger weight
              becomes <Tex>{String.raw`\lambda_k\propto a_k`}</Tex>: keep the
              extra groups for their lower variance, and multiply them by the
              acceptance rate.
            </p>
            <pre className="overflow-x-auto rounded-lg border p-4 text-[12.5px] leading-relaxed" style={{ borderColor: 'var(--rule)', background: 'var(--paper-deep)' }}>
              <code>{`# per accepted episode i from environment k
# w: target weights   q: dispatch probabilities actually used
# kappa: aggregation factor, frozen after warm-up (1.0 for token-sum)
lam = w[env] / (q[env] * kappa[env])                 # fixed per environment
tok_loss = (pg_loss * response_mask).sum(-1)         # token-SUM per episode
loss = (lam * tok_loss).sum() / num_tokens_global    # one shared denominator
# GSPO: use the token form (detached sequence ratio) before this step.
# Never rescale for zero-advantage filtering; refill with q.`}</code>
            </pre>
            <h3>4. Correct what carries gradient, and nothing else</h3>
            <p>
              Zero-advantage filtering should not be corrected. Drops that
              remove gradient-carrying episodes, such as stale, timed-out or
              capped rollouts, should be, and leaving them uncorrected is the
              subsidy described in the previous post<Ref n={23} />.
              prime-rl&rsquo;s closed proposal corrected both kinds with one
              factor<Ref n={4} />; they need opposite treatment.
            </p>
            <h3>5. Log the ledger</h3>
            <p>
              Per environment and step, log dispatched groups, accepted groups,
              mean generated tokens, the analytic weight{' '}
              <Tex tail=",">{String.raw`q_k\lambda_k\kappa_k`}</Tex> and the
              realized gradient share
            </p>
            <Tex display>{String.raw`s_k=\frac{\langle g_k,\,g\rangle}{\lVert g\rVert^2},\qquad \textstyle\sum_k s_k=1,`}</Tex>
            <p>
              where <Tex>{String.raw`g_k`}</Tex> is the gradient of
              environment <Tex>k</Tex>&rsquo;s micro-batches. With a handful of
              environment groups this costs one extra accumulation buffer per
              group at a few checkpoints. No framework we read logs it today.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle id="caveats" label="Boundary conditions" />
          <div className="am-prose">
            <ul>
              <li>
                <strong>Regularizers are not filtered for free.</strong> KL
                and entropy terms are nonzero on groups with zero advantage.
                Dropping those groups reweights the regularizer by{' '}
                <Tex tail=".">{String.raw`q_ka_k`}</Tex> If per-environment KL
                strength matters, as DeepSeek-V3.2 reports it does<Ref n={7} />,
                compute it over dispatched groups or apply the ledger to it.
              </li>
              <li>
                <strong>The filter must see the final advantage.</strong> If
                reward shaping, such as a length penalty, gives all-pass groups
                a nonzero advantage, filtering on pass labels drops real
                gradient and becomes an outcome-dependent mask<Ref n={23} />.
                MiMo-V2.6 combines shaped rewards with all-pass filtering; the
                text does not say which signal the filter uses<Ref n={3} />.
              </li>
              <li>
                <strong>Std normalization adds its own factor.</strong>{' '}
                Filtering stays neutral, but dividing by the group std scales
                each prompt&rsquo;s expected update by a factor that also grows
                at extreme pass rates, and it compounds with{' '}
                <Tex tail=".">{String.raw`1/a`}</Tex>
              </li>
            </ul>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>Std-normalized factor relative to mean-only</th>
                    <th className="am-num">p = 0.5</th>
                    <th className="am-num">p = 0.9</th>
                    <th className="am-num">p = 0.97</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>G = 8</td>
                    <td className="am-num">2.12</td>
                    <td className="am-num">2.66</td>
                    <td className="am-num">2.90</td>
                  </tr>
                  <tr>
                    <td>G = 16</td>
                    <td className="am-num">2.06</td>
                    <td className="am-num">3.04</td>
                    <td className="am-num">3.71</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ul>
              <li>
                <strong>Estimating acceptance from a fill-until-full loop is
                biased.</strong> If an environment is sampled until it yields{' '}
                <Tex>m</Tex> accepted groups after <Tex>N</Tex> attempts,{' '}
                <Tex>m/N</Tex> overestimates acceptance. Fix the attempts per
                environment in advance, or use the inverse-sampling estimate{' '}
                <Tex>{String.raw`(m-1)/(N-1)`}</Tex>
                <Ref n={22} />.
              </li>
              <li>
                <strong>Optimizers.</strong> Adam and Muon absorb the global{' '}
                <Tex>{String.raw`1/\bar a`}</Tex> and partly compress relative
                weights. The experiments measure the net effect rather than
                assume it.
              </li>
              <li>
                <strong>First order only.</strong> Result 3 holds the baseline
                fixed. Group baselines that include the episode itself add an{' '}
                <Tex>{String.raw`O(1/G)`}</Tex> term, which we leave to the
                experiments.
              </li>
            </ul>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle id="related" label="What is new and what is not" />
          <div className="am-prose">
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>Statement</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Zero-advantage filtering leaves per-prompt weights unchanged</td>
                    <td>Known: DAPO folklore, ARCUS Corollary 1<Ref n={1} /><Ref n={12} /></td>
                  </tr>
                  <tr>
                    <td>Multiply kept samples by their acceptance probability</td>
                    <td>Known principle: PrefixRL Appendix E.1.1, for rejection-sampled off-policy traces<Ref n={13} /></td>
                  </tr>
                  <tr>
                    <td>Per-sequence normalization biases length within a task</td>
                    <td>Known: Dr. GRPO and follow-ups<Ref n={9} /><Ref n={24} /></td>
                  </tr>
                  <tr>
                    <td>Cost-aware allocation; constrained multi-task objectives; transfer-aware scheduling</td>
                    <td>Known<Ref n={14} /><Ref n={15} /><Ref n={16} /><Ref n={17} /></td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Holding the post-filter mix multiplies environment weights by</strong>{' '}
                      <Tex>{String.raw`1/a_k`}</Tex>, <strong>and can erase the gradient</strong>
                    </td>
                    <td>Not found in prior work; MT-GRPO asserts the opposite</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Per-sequence normalizers set environment weights</strong>{' '}
                      <Tex>{String.raw`q_k\mathbb{E}[1/L_k](\theta)`}</Tex>,{' '}
                      <strong>which drift with length</strong>
                    </td>
                    <td>Not found in prior work at the environment level</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>The ledger rule and the realized-share statistic</strong>
                    </td>
                    <td>The combination is ours; each piece is standard</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              We expect the most serious objection to be that both new results
              are short derivations. We agree. The contribution is that the
              derivations contradict patterns that shipped in production
              systems and a published method, and that the size of the effect
              is measurable from logs that already exist.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle id="plan" label="Experimental plan" />
          <div className="am-prose">
            <h3>Phase 0: the ledger census</h3>
            <p>
              <span className="am-runin">Setup.</span> Take any existing
              multi-environment run. For each environment and step, reconstruct
              dispatched and accepted groups, mean generated length, and the
              analytic weight under the run&rsquo;s refill rule and normalizer.
              At five checkpoints, compute the realized share{' '}
              <Tex>{String.raw`s_k`}</Tex> with per-environment gradient
              buffers.
            </p>
            <p>
              <span className="am-runin">Gate.</span> If realized and target
              shares stay within 1.5× of each other throughout training and do
              not drift, the experiments below are still run, but the post is
              rewritten around the diagnostic rather than the distortion.
            </p>
            <h3>Experiment A: refill rules</h3>
            <p>
              <span className="am-runin">Design.</span> Isolate acceptance from
              length: two task pools of the <em>same</em> multi-turn tool-use
              environment, one that saturates during training (starting pass
              rate near 0.8) and one that stays hard (near 0.3). Lengths are
              matched by construction. Global token-mean, mean-only advantages,
              Qwen3-4B, 200 to 300 steps, G = 8.
            </p>
            <p>
              <span className="am-runin">Arms, three seeds each.</span> (a) No
              filtering. (b) Filter and refill with the dispatch weights. (c)
              Filter and hold the post-filter share, capped at 20×. (d) Arm c
              plus the ledger weight{' '}
              <Tex tail=".">{String.raw`\lambda_k\propto a_k`}</Tex> Ablations:
              G = 16; std-normalized advantages.
            </p>
            <p>
              <span className="am-runin">Measurements.</span> Realized share{' '}
              <Tex tail=",">{String.raw`s_k(t)`}</Tex> per-pool success on fixed
              held-out sets, global step size, per-pool KL, and the fraction of
              the easy pool&rsquo;s gradient that comes from groups with a
              single failure.
            </p>
            <h3>Experiment B: normalizers</h3>
            <p>
              <span className="am-runin">Design.</span> Isolate length from
              acceptance: two environments with similar starting pass rates and
              very different lengths, a short function-calling environment
              under 1k generated tokens and a multi-turn terminal or SWE-lite
              environment above 10k tokens with thinking on.
            </p>
            <p>
              <span className="am-runin">Arms, three seeds each.</span> (a)
              Global token-mean. (b) Per-sequence normalization. (c)
              Per-sequence normalization with ledger weights chosen to match arm
              b at step 0 and then frozen, which isolates the drift from the
              initial tilt. (d) Optional: GSPO in its default form against its
              token form with the ledger.
            </p>
            <p>
              <span className="am-runin">Measurements.</span> Realized share,
              mean length and success per environment over time; failure-length
              growth in the long environment.
            </p>
            <h3>Compute</h3>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th className="am-num">Runs</th>
                    <th className="am-num">H100-hours, estimate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Phase 0 census on existing runs</td>
                    <td className="am-num">0</td>
                    <td className="am-num">≤ 20</td>
                  </tr>
                  <tr>
                    <td>Experiment A, four arms</td>
                    <td className="am-num">12</td>
                    <td className="am-num">≈ 300</td>
                  </tr>
                  <tr>
                    <td>Experiment A ablations</td>
                    <td className="am-num">6</td>
                    <td className="am-num">≈ 150</td>
                  </tr>
                  <tr>
                    <td>Experiment B, three arms plus optional GSPO pair</td>
                    <td className="am-num">9 to 15</td>
                    <td className="am-num">≈ 400 to 650</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Total</strong>
                    </td>
                    <td className="am-num">
                      <strong>27 to 33</strong>
                    </td>
                    <td className="am-num">
                      <strong>≈ 0.9k to 1.1k</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Per-run costs are extrapolated from a Qwen3-4B multi-turn run of
              about 25 H100-hours for the short environments and 45 for the
              long one; they will be replaced with measured numbers after the
              first run. On a 24-node H100 allocation every run fits in one
              wave.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle id="predictions" label="Predictions and falsifiers" />
          <div className="am-prose">
            <ul>
              <li>
                <strong>P1, the algebra.</strong> In Experiment A, arm b&rsquo;s
                realized shares match dispatch within seed noise; arm c&rsquo;s
                match{' '}
                <Tex>{String.raw`w_k/a_k`}</Tex> and grow as the easy pool
                saturates; arm d returns to the target.
              </li>
              <li>
                <strong>P2, the consequence.</strong> At equal steps, arm c
                improves the hard pool more slowly than arms b and d, and its
                late updates on the easy pool are dominated by single-failure
                groups.
              </li>
              <li>
                <strong>P3, the normalizer.</strong> In Experiment B, arm
                b&rsquo;s long-environment share starts near the predicted
                inverse-length ratio and falls as episodes lengthen; its
                long-environment success lags arms a and c. Arm c starts at arm
                b&rsquo;s share and stays flat.
              </li>
              <li>
                <strong>P4, the loop.</strong> Failure length in the long
                environment grows faster under arm b than under arm a.
              </li>
            </ul>
            <div className="am-callout">
              <div className="am-callout-label">What would change our mind</div>
              <ul>
                <li>
                  Realized and target shares differ by less than 1.5× in
                  Phase 0 and in arm c: the distortion is real but too small to
                  matter, and we say so.
                </li>
                <li>
                  Arms c and d learn within seed noise of each other despite a
                  measured distortion of 2× or more: the optimizer or shared
                  features wash it out, which is itself worth reporting.
                </li>
                <li>
                  Arm c of Experiment B tracks arm b: the drift is harmless and
                  only the initial tilt matters.
                </li>
              </ul>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle id="next" label="Out of scope, and the rest of the series" />
          <div className="am-prose">
            <p>
              This post covers the first half of multi-task RL done right:
              making the gradient implement the objective. The second half is
              about the signals that choose the objective and the sampler.
            </p>
            <ul>
              <li>
                <strong>Budget-matched progress.</strong> Learning-progress
                samplers compare an environment&rsquo;s reward across steps.
                When the episode budget grows during training, as it does in
                Avalon-M1&rsquo;s schedule from two to more than five hours
                <Ref n={28} />, the signal mixes learning with extra time.
                Nested task curricula cause the same confusion. That is the
                next post.
              </li>
              <li>
                <strong>Transfer, harnesses and cost.</strong> Online transfer
                estimation and harness scheduling are covered by TAC and
                HarnessBandit<Ref n={16} />
                <Ref n={17} />; cost-aware allocation by DUET<Ref n={14} />. We
                cite them rather than compete with them.
              </li>
              <li>
                <strong>Earlier in the series.</strong>{' '}
                <Link href="/blog/anticausal-masks">Every Loss Mask Is a Reward</Link>{' '}
                covers drops that carry gradient, which are the ones this post
                tells you to correct.
              </li>
            </ul>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle id="references" label="References" />
          <ol className="am-refs list-none space-y-1 pl-0">
            <li id="ref-1">
              [1] Q. Yu et al. <em>DAPO: An Open-Source LLM Reinforcement
              Learning System at Scale.</em>{' '}
              <a href="https://arxiv.org/abs/2503.14476">arXiv:2503.14476</a>,
              2025. Dynamic sampling.
            </li>
            <li id="ref-2">
              [2] <em>MT-GRPO</em>: multi-task GRPO with worst-task
              reweighting and a ratio-preserving sampler.{' '}
              <a href="https://arxiv.org/abs/2602.05547">arXiv:2602.05547</a>,
              2026. Eq. 5, §5, Appendix D.4.
            </li>
            <li id="ref-3">
              [3] Xiaomi. <em>MiMo-V2.6 technical report.</em>{' '}
              <a href="https://arxiv.org/abs/2610.11959">arXiv:2610.11959</a>,
              2026. §6.3, Eq. 6&ndash;7.
            </li>
            <li id="ref-4">
              [4] prime-rl pull requests{' '}
              <a href="https://github.com/PrimeIntellect-ai/prime-rl/pull/2072">#2072</a>{' '}
              and{' '}
              <a href="https://github.com/PrimeIntellect-ai/prime-rl/pull/3804">#3804</a>,
              both closed without merging, 2026.
            </li>
            <li id="ref-5">
              [5] Miles. <em>Mixing datasets</em>, user guide.{' '}
              <a href="https://github.com/radixark/miles">github.com/radixark/miles</a>,{' '}
              <code>docs/user-guide/mixing-datasets.md</code>.
            </li>
            <li id="ref-6">
              [6] Meituan LongCat Team. <em>LongCat-Flash-Thinking-2601
              technical report.</em>{' '}
              <a href="https://arxiv.org/abs/2601.16725">arXiv:2601.16725</a>,
              2026. §3.3.1 and §3.3.3.
            </li>
            <li id="ref-7">
              [7] DeepSeek-AI. <em>DeepSeek-V3.2.</em>{' '}
              <a href="https://arxiv.org/abs/2512.02556">arXiv:2512.02556</a>,
              2025.
            </li>
            <li id="ref-8">
              [8] C. Zheng et al. <em>Group Sequence Policy Optimization.</em>{' '}
              <a href="https://arxiv.org/abs/2507.18071">arXiv:2507.18071</a>,
              2025.
            </li>
            <li id="ref-9">
              [9] Z. Liu et al. <em>Understanding R1-Zero-Like Training: A
              Critical Perspective (Dr. GRPO).</em>{' '}
              <a href="https://arxiv.org/abs/2503.20783">arXiv:2503.20783</a>,
              2025.
            </li>
            <li id="ref-10">
              [10] <em>The Art of Scaling Reinforcement Learning Compute for
              LLMs (ScaleRL).</em>{' '}
              <a href="https://arxiv.org/abs/2510.13786">arXiv:2510.13786</a>,
              2025.
            </li>
            <li id="ref-11">
              [11] MiniMax. <em>Forge: scalable agent RL.</em>{' '}
              <a href="https://www.minimax.io/blog/forge-scalable-agent-rl-en-1779896141">blog</a>,
              2026.
            </li>
            <li id="ref-12">
              [12] <em>ARCUS.</em>{' '}
              <a href="https://arxiv.org/abs/2609.38018">arXiv:2609.38018</a>,
              2026. Corollary 1, &ldquo;every sampler is an objective&rdquo;.
            </li>
            <li id="ref-13">
              [13] <em>Reuse your FLOPs: Scaling RL on Hard Problems by
              Conditioning on Very Off-Policy Prefixes (PrefixRL).</em>{' '}
              <a href="https://arxiv.org/abs/2601.18795">arXiv:2601.18795</a>,
              2026. Appendix E.1.1.
            </li>
            <li id="ref-14">
              [14] <em>DUET.</em>{' '}
              <a href="https://arxiv.org/abs/2605.08441">arXiv:2605.08441</a>,
              2026. Theorem 1, cost-weighted Neyman allocation per prompt.
            </li>
            <li id="ref-15">
              [15] Constrained multi-task reinforcement learning with
              per-task performance constraints.{' '}
              <a href="https://arxiv.org/abs/2405.02456">arXiv:2405.02456</a>,
              2024.
            </li>
            <li id="ref-16">
              [16] Y. Yang et al. <em>Transferability for General Reasoning:
              An Automated Curriculum for Multi-Domain RLVR (TAC).</em>{' '}
              <a href="https://arxiv.org/abs/2606.25178">arXiv:2606.25178</a>,
              2026.
            </li>
            <li id="ref-17">
              [17] H. Wei et al. <em>HarnessBandit: Joint
              Learnability-Transferability Scheduling for Multi-Harness Agentic
              Reinforcement Learning.</em>{' '}
              <a href="https://arxiv.org/abs/2609.13739">arXiv:2609.13739</a>,
              2026.
            </li>
            <li id="ref-18">
              [18] <em>Olmo 3.</em>{' '}
              <a href="https://arxiv.org/abs/2512.13961">arXiv:2512.13961</a>,
              2025. §4.4&ndash;4.5, RL data mixing.
            </li>
            <li id="ref-19">
              [19] Prime Intellect. <em>INTELLECT-3.</em>{' '}
              <a href="https://arxiv.org/abs/2512.16144">arXiv:2512.16144</a>,
              2025.
            </li>
            <li id="ref-20">
              [20] NVIDIA. <em>Nemotron 3 Nano.</em>{' '}
              <a href="https://arxiv.org/abs/2512.20848">arXiv:2512.20848</a>,
              2025.
            </li>
            <li id="ref-21">
              [21] Zhipu AI. <em>GLM-4.5.</em>{' '}
              <a href="https://arxiv.org/abs/2508.06471">arXiv:2508.06471</a>,
              2025.
            </li>
            <li id="ref-22">
              [22] J. B. S. Haldane. <em>On a method of estimating
              frequencies.</em> Biometrika 33(3), 222&ndash;225, 1945. Inverse
              binomial sampling.
            </li>
            <li id="ref-23">
              [23] B. Wang.{' '}
              <Link href="/blog/anticausal-masks">Every Loss Mask Is a Reward</Link>.
              Agentic RL Week, November 3, 2026.
            </li>
            <li id="ref-24">
              [24] <em>Balanced Aggregation</em>{' '}
              <a href="https://arxiv.org/abs/2605.04077">arXiv:2605.04077</a> and{' '}
              <em>LUSPO</em>{' '}
              <a href="https://arxiv.org/abs/2602.05261">arXiv:2602.05261</a>,
              2026. Loss aggregation within a task.
            </li>
            <li id="ref-25">
              [25] <em>AgentRL.</em>{' '}
              <a href="https://arxiv.org/abs/2510.04206">arXiv:2510.04206</a>,
              2025. Task-level advantage normalization; tasks of different
              lengths learn at different rates.
            </li>
            <li id="ref-26">
              [26] <em>CompactionRL.</em>{' '}
              <a href="https://arxiv.org/abs/2607.05378">arXiv:2607.05378</a>,
              2026.
            </li>
            <li id="ref-27">
              [27] <em>Knapsack RL</em>{' '}
              <a href="https://arxiv.org/abs/2509.25849">arXiv:2509.25849</a>,
              2025, and <em>VIP</em>{' '}
              <a href="https://arxiv.org/abs/2602.01601">arXiv:2602.01601</a>,
              2026. Per-prompt rollout allocation by count.
            </li>
            <li id="ref-28">
              [28] General Reasoning. <em>Avalon-M1: Reinforcement Learning
              from Collective Rewards.</em>{' '}
              <a href="https://www.gr.inc/avalonm1.pdf">report</a>, 2026.
              §2.2.3&ndash;2.2.4.
            </li>
            <li id="ref-29">
              [29] Interference between domains as the stated reason for a
              training design: ByteDance Seed,{' '}
              <a href="https://arxiv.org/abs/2504.13914">Seed1.5-Thinking</a>;
              Xiaomi,{' '}
              <a href="https://arxiv.org/abs/2601.02780">MiMo-V2-Flash</a>;
              Qwen Team,{' '}
              <a href="https://arxiv.org/abs/2505.09388">Qwen3</a>; and [6].
            </li>
          </ol>
        </div>
      </article>
    </Container>
  )
}
