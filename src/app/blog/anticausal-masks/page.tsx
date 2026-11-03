import { type Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/Container'

import './_styles/anticausal.css'

import Tex from './_components/Tex'
import SectionTitle from './_components/SectionTitle'
import {
  OutcomesFigure,
  CausalFigure,
  PredictedCurvesFigure,
} from './_components/Figures'

export const metadata: Metadata = {
  title: 'Every Loss Mask Is a Reward',
  description:
    'A pre-registered research plan: masking truncated or dropped rollouts in agentic RL pays them the mean reward. We derive the term, show when it reverses the gradient, and lay out the experiments that would confirm or kill the claim.',
}

const POST = {
  title: 'Every Loss Mask Is a Reward',
  subtitle:
    'A pre-registered research plan. Loss-masking truncated, over-turn, or late rollouts in agentic RL adds a reward-free term to the policy gradient that pays excluded trajectories the mean reward. We derive the term, show when it flips the gradient, and lay out the experiments and ablations that would confirm or kill the claim.',
  author: 'Bowen Wang',
  date: 'November 3, 2026',
  reading: 'Research plan · 25 min read',
}

const TOC = [
  { label: 'Where the masks live', href: '#background' },
  { label: 'Notation and setup', href: '#setup' },
  { label: 'The identity', href: '#identity' },
  { label: 'Three corollaries', href: '#corollaries' },
  { label: 'A constructive reversal', href: '#reversal' },
  { label: 'Why reweighting cannot fix it', href: '#reweighting' },
  { label: 'Remedies', href: '#remedies' },
  { label: 'Experimental plan', href: '#plan' },
  { label: 'Predicted results', href: '#predictions' },
  { label: 'Discussion', href: '#discussion' },
  { label: 'Appendix: execution plan and compute', href: '#appendix' },
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
    <header className="mb-8 mt-8">
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
        Blog · {POST.date} · {POST.reading}
      </div>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-[2.75rem] sm:leading-[1.15]">
        {POST.title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
        {POST.subtitle}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3 text-[13px]">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {POST.author}
        </span>
        <span className="am-pill">Pre-registration · no results yet</span>
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

export default function AnticausalMasksPost() {
  return (
    <Container className="mt-12 lg:mt-20">
      <article className="mx-auto max-w-3xl">
        <div className="text-[12px]">
          <Link
            href="/blog"
            className="text-zinc-500 hover:text-amber-700 dark:text-zinc-400 dark:hover:text-amber-300"
          >
            ← All posts
          </Link>
        </div>

        <PostHero />

        <div className="am-scope">
          <figure>
            <OutcomesFigure />
            <figcaption>
              <strong>Figure 1.</strong> What each outcome is paid under the
              two common conventions for a rollout that hits its turn or
              length cap. With the group mean reward <Tex tail=",">b = 0.3</Tex> a
              solved trajectory receives advantage <Tex tail=",">+0.7</Tex> a
              submitted failure <Tex tail=".">-0.3</Tex> Treating the cap as a failure
              (<Tex tail=",">R=0</Tex> left bars) also pays <Tex tail=".">-0.3</Tex> Loss-masking
              the capped rollout (right bars) sets its advantage to exactly
              zero, which is indistinguishable from paying it <Tex tail=".">R := b</Tex>
              Three consequences follow: <strong>(1)</strong> running out the
              clock becomes strictly better than admitting failure;{' '}
              <strong>(2)</strong> the gap grows with <Tex tail=",">b</Tex> so it grows
              as training succeeds; <strong>(3)</strong> because the mask is
              decided after the trajectory ends, every earlier token inherits
              the subsidy.
            </figcaption>
          </figure>

          <div className="am-prose">
            <p>
              Policy-gradient training of LLM agents routinely excludes
              rollouts from the loss. Responses that hit the length limit are
              masked out (DAPO&rsquo;s <em>overlong filtering</em>
              <Ref n={2} />), trajectories that exhaust their turn budget or
              time out are masked (DeepSWE&rsquo;s <em>compact filtering</em>
              <Ref n={3} />, Mini-o3&rsquo;s <em>over-turn masking</em>
              <Ref n={7} />), and asynchronous systems drop rollouts that
              arrive too stale to be worth training on. The stated rationale is
              usually noise control: a truncated attempt might have been about
              to succeed, so scoring it as a failure injects a wrong label.
              This reasoning is intuitive, widely implemented, and, we will
              argue, wrong in a precise way.
            </p>
            <p>
              The purpose of this post is to lay out a research plan before
              running it. We have a derivation we believe, a set of symptoms in
              the literature that the derivation explains, and a set of
              experiments that would confirm or falsify it. We have not run the
              experiments. Writing the predictions down first is the point: if
              the curves in the last section come out the other way, that is
              what we will report.
            </p>
            <p>The claims, in the order we will defend them:</p>
            <ul>
              <li>
                <strong>Masking is paying.</strong> For any trajectory-level
                inclusion rule, the expected update of the masked loss is{' '}
                <Tex>{String.raw`\nabla\mathbb{E}[R\,\mathbb{1}\{X\}] - b\,\nabla P(X)`}</Tex>
                . When excluded trajectories would otherwise score zero, this is{' '}
                <Tex tail=":">{String.raw`\nabla J + b\,\nabla P(\neg X)`}</Tex> the
                baseline, harmless under full inclusion, becomes a reward of
                size <Tex>b</Tex> for being excluded.
              </li>
              <li>
                <strong>The sign is decided by causality.</strong> A mask that
                is a function of the prefix before a token was sampled adds no
                bias. A mask that depends on how the trajectory ends always
                does. Truncation, turn caps, format failures, and staleness
                drops are all of the second kind.
              </li>
              <li>
                <strong>It can reverse the gradient.</strong> In a two-strategy
                construction where thorough attempts succeed more often but
                finish later, the surviving data asks for <em>fewer</em>{' '}
                thorough attempts while the true objective asks for more.
              </li>
              <li>
                <strong>Reweighting cannot repair it.</strong> Truncation is
                deterministic censoring with inclusion probability zero or
                one. Horvitz&ndash;Thompson corrections need a known positive
                probability. The only exact fixes are not to exclude, or to
                randomize the exclusion so a probability exists.
              </li>
              <li>
                <strong>It is already visible.</strong> Length drifting toward
                the cap under overlong filtering<Ref n={4} />
                <Ref n={5} />
                <Ref n={6} />, environment steps rising through DeepSWE
                training<Ref n={3} />, and the short-response bias of staleness
                thresholds<Ref n={11} /> are all consistent with the term. None
                of these reports names the mechanism.
              </li>
            </ul>
          </div>

          <TableOfContents />

          {/* ------------------------------------------------------------ */}
          <hr className="am-hr" />
          <SectionTitle id="background" label="Where the masks live" />
          <div className="am-prose">
            <p>
              Before any math, it is worth being concrete about how common
              this is, because the identity below is only interesting if the
              switch it describes is on by default somewhere. We read the
              current main branches of the frameworks we might run on. The
              population over which the baseline is computed matters, and it
              differs across implementations, so we record it.
            </p>
            <div className="am-table">
            <table>
              <thead>
                <tr>
                  <th>Framework</th>
                  <th>Switch</th>
                  <th>Baseline computed over</th>
                  <th>Kind</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>rLLM / DeepSWE</strong>
                  </td>
                  <td>
                    <code>compact_filtering.*</code> (max turns, max length,
                    timeout, error)
                  </td>
                  <td>
                    Survivors only: masked episodes are removed{' '}
                    <em>before</em> grouping
                  </td>
                  <td>anticausal</td>
                </tr>
                <tr>
                  <td>
                    <strong>TRL</strong>
                  </td>
                  <td>
                    <code>mask_truncated_completions</code>
                  </td>
                  <td>All <Tex>G</Tex> members</td>
                  <td>anticausal</td>
                </tr>
                <tr>
                  <td>
                    <strong>NeMo-RL</strong>
                  </td>
                  <td>
                    <code>overlong_filtering</code> (sets{' '}
                    <code>loss_multiplier = 0</code>)
                  </td>
                  <td>
                    Flag: <code>masked_reward_policy include | exclude</code>
                  </td>
                  <td>anticausal</td>
                </tr>
                <tr>
                  <td>
                    <strong>Miles</strong>
                  </td>
                  <td>
                    <code>mask_truncated_zero_reward</code> sample filter;{' '}
                    <code>--max-weight-staleness</code> with <code>drop</code>
                  </td>
                  <td>All <Tex>G</Tex> (&ldquo;removed samples still count
                  toward normalization&rdquo;)</td>
                  <td>anticausal</td>
                </tr>
                <tr>
                  <td>
                    <strong>ROLL</strong>
                  </td>
                  <td>Group queue drops groups older than the async ratio</td>
                  <td>n/a (whole group gone)</td>
                  <td>anticausal</td>
                </tr>
                <tr>
                  <td>
                    <strong>prime-rl</strong>
                  </td>
                  <td>
                    <code>mask_stale_tokens</code> by per-token weight version
                  </td>
                  <td>All <Tex>G</Tex></td>
                  <td>
                    <strong>causal</strong> (decided before the token)
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>verl</strong>
                  </td>
                  <td>
                    <code>filter_groups</code> (DAPO dynamic sampling)
                  </td>
                  <td>n/a</td>
                  <td>
                    anticausal but <strong>harmless</strong> (
                    <Tex tail=")">R_i - b = 0</Tex>
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
            <p>
              Two rows deserve a note. The rLLM row is the DeepSWE recipe, and
              it removes masked episodes before the group statistics are
              computed, which puts it in the amplified regime of Corollary 2
              below. The prime-rl row is the one existing implementation we
              found whose mask is decided from information available before
              each token was sampled; it serves as a natural control. And the
              caps bind: in a recent SWE-smith run with an 80-turn budget, 84%
              of trajectories hit the turn cap<Ref n={14} />. Whatever the
              convention does to capped rollouts, it does to most of the
              batch.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <hr className="am-hr" />
          <SectionTitle id="setup" label="Notation and setup" />
          <div className="am-prose">
            <p>
              We work with a single prompt and a policy{' '}
              <Tex>{String.raw`\pi_\theta`}</Tex> that generates a trajectory{' '}
              <Tex>{String.raw`\tau`}</Tex> of action tokens interleaved with
              environment observations. The objective is the terminal reward,
              and the estimator is REINFORCE with a baseline, which is what
              GRPO reduces to on a single step.
            </p>
            <Tex display>
              {String.raw`J(\theta)=\mathbb{E}_{\tau\sim\pi_\theta}[R(\tau)],\qquad
              S(\tau)=\sum_{t}\nabla_\theta\log\pi_\theta(a_t\mid h_t),\qquad
              \hat g=(R-b)\,S(\tau).`}
            </Tex>
            <ul>
              <li>
                <strong><Tex tail=":">R</Tex></strong> terminal reward, here binary.
                Partial credit does not change the argument.
              </li>
              <li>
                <strong><Tex tail=":">b</Tex></strong> the baseline. In GRPO it is the
                group mean; we first treat it as a constant equal to the
                population mean <Tex tail=",">J</Tex> then relax this.
              </li>
              <li>
                <strong><Tex tail=":">h_t</Tex></strong> the prefix before token{' '}
                <Tex>t</Tex> (prompt, earlier actions, earlier observations).
              </li>
              <li>
                <strong><Tex tail=":">{String.raw`X(\tau)`}</Tex></strong> an inclusion
                event. <Tex>{String.raw`\mathbb{1}\{X\}=1`}</Tex> means the
                trajectory enters the loss. &ldquo;Not truncated&rdquo;,
                &ldquo;arrived before the staleness limit&rdquo;, and
                &ldquo;parsed correctly&rdquo; are all instances.
              </li>
            </ul>
            <p>
              The one fact we use repeatedly is the score identity: for any
              prefix, <Tex>{String.raw`\mathbb{E}_{a_t\sim\pi(\cdot\mid h_t)}[\nabla\log\pi(a_t\mid h_t)]=0`}</Tex>
              . Summed over a trajectory it gives{' '}
              <Tex tail=",">{String.raw`\mathbb{E}[S(\tau)]=0`}</Tex> which is exactly
              why a baseline is free: <Tex>{String.raw`\mathbb{E}[b\,S]=0`}</Tex>
              . Everything below is about what happens when the expectation is
              no longer over all trajectories.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <hr className="am-hr" />
          <SectionTitle id="identity" label="The identity" />
          <div className="am-prose">
            <p>
              Apply the inclusion rule to the loss and take the expectation
              over the full policy distribution. The two factors of{' '}
              <Tex>{String.raw`(R-b)`}</Tex> separate:
            </p>
            <Tex display>
              {String.raw`\mathbb{E}\big[\mathbb{1}\{X\}\,(R-b)\,S\big]
              =\underbrace{\nabla_\theta\,\mathbb{E}\big[R\,\mathbb{1}\{X\}\big]}_{\text{gradient of the included reward}}
              \;-\;\underbrace{b\,\nabla_\theta P(X)}_{\text{baseline}\times\text{selection}}.`}
            </Tex>
            <p>
              Both terms are REINFORCE identities,{' '}
              <Tex>{String.raw`\mathbb{E}[f(\tau)S(\tau)]=\nabla\mathbb{E}[f(\tau)]`}</Tex>
              , applied to <Tex>{String.raw`f=R\,\mathbb{1}\{X\}`}</Tex> and{' '}
              <Tex tail=".">{String.raw`f=\mathbb{1}\{X\}`}</Tex> Now use the convention
              that motivates masking in the first place: an excluded trajectory
              would have been scored <Tex tail=".">R=0</Tex> Then{' '}
              <Tex>{String.raw`R\,\mathbb{1}\{X\}=R`}</Tex> almost surely, the
              first term is <Tex tail=",">{String.raw`\nabla J`}</Tex> and
            </p>
            <Tex display>
              {String.raw`\mathbb{E}[\hat g_{\text{masked}}]
              =\nabla J - b\,\nabla P(X)
              =\nabla J + b\,\nabla P(\neg X).`}
            </Tex>
            <p>
              The masked estimator is the unbiased gradient plus a term that
              carries no information about reward. Its direction is
              &ldquo;make exclusion more likely&rdquo; and its magnitude is{' '}
              <Tex tail=".">b</Tex> Equivalently, since a trajectory with advantage zero
              contributes nothing, <strong>masking a trajectory is identical
              to assigning it <Tex>R:=b</Tex></strong>. We find this phrasing
              more useful than the gradient one because it says what the
              policy is being taught: an excluded attempt is worth exactly an
              average attempt.
            </p>
            <details>
              <summary>More on the derivation and its assumptions</summary>
              <div className="am-prose">
                <p>
                  The identity requires only that <Tex>b</Tex> does not depend
                  on the trajectory being scored and that the expectation is
                  over the sampling policy. With a leave-one-out group mean
                  over all <Tex>G</Tex> members (TRL&rsquo;s convention), the
                  expectation is <Tex>{String.raw`(1-1/G)\,[\nabla J + J\,\nabla P(\neg X)]`}</Tex>
                  : the effective subsidy is exactly the population mean{' '}
                  <Tex tail=",">J</Tex> with no extra term. With per-token
                  normalization by a <Tex>{String.raw`\theta`}</Tex>-free weight{' '}
                  <Tex>{String.raw`w(\tau)`}</Tex> the term becomes{' '}
                  <Tex>{String.raw`b\,\nabla\mathbb{E}[w\,\mathbb{1}\{\neg X\}]`}</Tex>
                  : rescaled, not removed. With a survivor-only denominator
                  (token-mean over the micro-batch, which is verl&rsquo;s
                  default) the scale of the whole update depends on the
                  survivor count, which is a separate, mostly benign effect we
                  control for with constant normalization<Ref n={8} />. If
                  excluded trajectories carry a nonzero reward{' '}
                  <Tex>{String.raw`R_{\neg X}`}</Tex> (e.g. a format penalty of{' '}
                  <Tex tail="),">-1</Tex> the subsidy is{' '}
                  <Tex tail=",">{String.raw`b - R_{\neg X}`}</Tex> which is why penalties
                  behave so differently from masks in practice.
                </p>
              </div>
            </details>
            <div className="am-callout">
              <div className="am-callout-label">Key result</div>
              <div className="am-prose">
                <p>
                  Under full inclusion the baseline is a control variate: zero
                  mean, variance only. Under trajectory-level exclusion it
                  stops being zero mean. The masked update equals the unbiased
                  gradient plus <Tex>{String.raw`b\,\nabla P(\text{excluded})`}</Tex>
                  . Masking is paying the excluded rollouts the mean reward.
                </p>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          <hr className="am-hr" />
          <SectionTitle id="corollaries" label="Three corollaries" />
          <div className="am-prose">
            <h3>Corollary 1: the feedback loop</h3>
            <p>
              The subsidy is <Tex tail=",">b</Tex> the mean reward. As training
              succeeds, <Tex>b</Tex> rises, so the reward for being excluded
              rises with it. A policy at 30% success pays truncation 0.3; the
              same policy at 60% pays it 0.6. This is the opposite of a
              self-correcting effect. It is the same structural property that
              makes drift under training&ndash;inference mismatch compound in{' '}
              <em>Score Centering</em><Ref n={1} />: a term whose magnitude is
              tied to the thing being optimized.
            </p>
            <h3>Corollary 2: survivor baselines amplify it</h3>
            <p>
              If the group mean is computed only over surviving members, which
              is what happens when masked episodes are removed before grouping
              (rLLM) or when <code>masked_reward_policy: exclude</code> is set
              (NeMo-RL), the baseline is itself selection-biased. Writing{' '}
              <Tex>{String.raw`N_X`}</Tex> for the number of survivors in a group
              of <Tex tail=",">G</Tex> the expected update becomes{' '}
              <Tex>{String.raw`\kappa\,\nabla J+\beta\,\nabla P(\neg X)`}</Tex>{' '}
              with <Tex>{String.raw`\beta/\kappa\to J/P(X)=\mathbb{E}[R\mid X]`}</Tex>{' '}
              for large <Tex tail=".">G</Tex> The subsidy becomes
            </p>
            <Tex display>
              {String.raw`\text{subsidy}_{\text{survivor}}\;\approx\;\frac{J\,P(\neg X)}{P(X)}\;\nabla P(\neg X),`}
            </Tex>
            <p>
              which grows with the exclusion rate itself. Under
              std-normalized advantages with binary rewards the per-prompt
              subsidy is{' '}
              <Tex tail=",">{String.raw`b/\sigma=\sqrt{p/(1-p)}`}</Tex> largest on
              nearly-solved prompts. We flag these as derived, not yet
              measured; the ablation on baseline population below is designed
              to separate them.
            </p>
            <h3>Corollary 3: causal masks are free, anticausal masks are rewards</h3>
            <figure>
              <CausalFigure />
              <figcaption>
                <strong>Figure 2.</strong> The sign of the bias is decided by
                when the mask is decided. <strong>Top:</strong> a per-token
                staleness mask (prime-rl) is a function of the prefix: the
                weight version used to sample token <Tex>t</Tex> is fixed
                before <Tex>a_t</Tex> is drawn, so{' '}
                <Tex>{String.raw`\mathbb{E}[m_t\,\nabla\log\pi(a_t\mid h_t)]=m_t\,\mathbb{E}[\nabla\log\pi\mid h_t]=0`}</Tex>
                . The surviving update is the on-policy gradient restricted to
                fresh positions: a reweighting of states, not a reward.{' '}
                <strong>Bottom:</strong> a truncation or late-drop mask is
                decided at the end and applied to every earlier token. The
                indicator is correlated with the actions, the score identity
                fails, and every token inherits the subsidy.
              </figcaption>
            </figure>
            <p>
              Formally, let <Tex>m_t</Tex> be the inclusion indicator for token{' '}
              <Tex tail=".">t</Tex> If <Tex>m_t</Tex> is measurable with respect to{' '}
              <Tex>h_t</Tex> (and any randomness independent of{' '}
              <Tex tail="),">a_t</Tex> then{' '}
              <Tex>{String.raw`\mathbb{E}[\sum_t m_t\,(R-b)\,s_t]=\sum_t\mathbb{E}[m_t\,Q_t\,s_t]`}</Tex>
              , which is a valid ascent direction for a behavior-weighted
              objective in the sense of off-policy actor&ndash;critic
              <Ref n={18} />. If <Tex>m_t</Tex> depends on the future, the
              baseline term survives. This gives a one-line design rule for
              infrastructure: <strong>mask only on information that existed
              before the token was sampled</strong>. DAPO&rsquo;s dynamic
              sampling passes this test for a different reason: it excludes
              whole groups whose advantages are already zero.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <hr className="am-hr" />
          <SectionTitle id="reversal" label="A constructive reversal" />
          <div className="am-prose">
            <p>
              A bias of size <Tex>b</Tex> on a direction that is unrelated to
              reward sounds like a nuisance. It is worth showing that it can
              flip the sign of the update in a setting that is not exotic. The
              construction is a two-strategy coding agent under an asynchronous
              trainer that drops rollouts older than a staleness threshold.
            </p>
            <div className="am-table">
            <table>
              <thead>
                <tr>
                  <th>Strategy</th>
                  <th>What it does</th>
                  <th className="am-num">True success</th>
                  <th className="am-num">P(kept | success)</th>
                  <th className="am-num">P(kept | failure)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Fast</strong>
                  </td>
                  <td>Reads two files, edits, submits in ~10 turns</td>
                  <td className="am-num">0.60</td>
                  <td className="am-num">1.0</td>
                  <td className="am-num">1.0</td>
                </tr>
                <tr>
                  <td>
                    <strong>Thorough</strong>
                  </td>
                  <td>
                    Reproduces the bug, writes a regression test, edits, runs
                    the suite; ~80 turns on success, but failures surface early
                  </td>
                  <td className="am-num">0.90</td>
                  <td className="am-num">0.1</td>
                  <td className="am-num">1.0</td>
                </tr>
              </tbody>
            </table>
            </div>
            <p>
              Let <Tex>p</Tex> be the probability of choosing Thorough. The
              true objective is <Tex tail=",">{String.raw`J(p)=0.6+0.3p`}</Tex> increasing
              in <Tex tail=".">p</Tex> The trainer sees the kept distribution, whose
              success rate is
            </p>
            <Tex display>
              {String.raw`J_{\text{kept}}(p)=\frac{\mathbb{E}[cR]}{\mathbb{E}[c]}=\frac{0.6-0.51p}{1-0.81p},
              \qquad
              J_{\text{kept}}'(p)=\frac{-0.024}{(1-0.81p)^2}<0.`}
            </Tex>
            <p>
              The surviving data asks for fewer thorough attempts at every{' '}
              <Tex tail=".">p</Tex> We checked this by exact enumeration at{' '}
              <Tex tail=":">{String.raw`p=\sigma(\theta)=0.5`}</Tex> the full-distribution
              gradient with respect to <Tex>{String.raw`\theta`}</Tex> is{' '}
              <Tex tail=",">{String.raw`+0.075`}</Tex> the survivor estimate with a
              population-mean baseline is <Tex tail=",">{String.raw`-0.017`}</Tex> and
              inverse-probability weighting with the known keep probabilities
              recovers <Tex tail=".">{String.raw`+0.075`}</Tex> The numbers in the table
              are ours, not measured from any system; the point is that the
              structure, successes that finish late and failures that surface
              early, is the ordinary shape of careful software work.
            </p>
            <p>
              The same identity has a second, quieter prediction for
              truncation masks. A failing attempt that is masked when it runs
              out the clock receives advantage 0; one that submits receives{' '}
              <Tex tail=".">-b</Tex> So on tasks the agent is going to fail anyway, the
              trained behavior is to keep going. <strong>Succeed fast, fail
              slow</strong> is the implied reward schedule, and it is the
              signature we will look for in turn-count distributions
              conditioned on outcome.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <hr className="am-hr" />
          <SectionTitle id="reweighting" label="Why reweighting cannot fix it" />
          <div className="am-prose">
            <p>
              The natural instinct is importance weighting: if a trajectory
              survives with probability <Tex tail=",">c(\tau)</Tex> weight it by{' '}
              <Tex tail=".">1/c</Tex> Horvitz&ndash;Thompson corrections of this kind
              exist for token subsampling<Ref n={10} /> and for latency-based
              selection in asynchronous pipelines<Ref n={12} />. They need{' '}
              <Tex>{String.raw`c(\tau)>0`}</Tex> and known. Truncation is
              deterministic censoring: a trajectory that reaches the cap is
              excluded with probability one, and a trajectory that does not is
              included with probability one. There is no weight that recovers
              the contribution of a sample that was never observed. The same
              holds for a hard staleness cutoff.
            </p>
            <p>
              This leaves two exact options. <strong>Do not exclude:</strong>{' '}
              score the capped rollout with the reward its budget implies, or
              keep the late rollout and handle its staleness as an off-policy
              problem, which is what partial rollouts plus per-token
              corrections already do<Ref n={1} />. <strong>Or randomize the
              exclusion</strong> so that a probability exists: when the
              scheduler would drop a group, keep it with a known probability{' '}
              <Tex>a</Tex> and weight it by <Tex tail=".">1/a</Tex> The second option
              is the STOPD trick<Ref n={13} /> applied to trajectories rather
              than tokens; it is unbiased in expectation,
            </p>
            <Tex display>
              {String.raw`\mathbb{E}_B\!\left[\frac{B}{a}\,G_g\right]=G_g,\qquad
              \operatorname{Cov}_B\!\left(\frac{B}{a}G_g\right)=\Big(\frac{1}{a}-1\Big)G_gG_g^{\!\top},`}
            </Tex>
            <p>
              and it is not free: the variance inflation is{' '}
              <Tex tail=".">{String.raw`1/a-1`}</Tex> Whether that price is worth paying
              relative to simply waiting for stragglers is an empirical
              question we will put in the plan.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <hr className="am-hr" />
          <SectionTitle id="remedies" label="Remedies" />
          <div className="am-prose">
            <p>
              None of the remedies is new machinery. Each is the choice that
              the identity says is consistent with a stated objective. What is
              new is the claim that masking is consistent with none of them.
            </p>
            <div className="am-table">
            <table>
              <thead>
                <tr>
                  <th>Why the rollout is excluded</th>
                  <th>Objective you actually want</th>
                  <th>Consistent treatment</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    The task&rsquo;s own budget ran out (turn cap, context cap
                    defined by the task)
                  </td>
                  <td>Solve within budget</td>
                  <td>
                    <strong>Do not mask; assign <Tex tail=".">R=0</Tex></strong> The
                    advantage <Tex>-b</Tex> is the correct signal.
                  </td>
                </tr>
                <tr>
                  <td>
                    Infrastructure cancelled it (staleness threshold, queue
                    limit, timeout unrelated to the task)
                  </td>
                  <td>Solve the task</td>
                  <td>
                    <strong>Do not drop.</strong> Partial rollouts with
                    per-token off-policy correction. If dropping is
                    unavoidable: randomized protection with weight{' '}
                    <Tex tail=".">1/a</Tex>
                  </td>
                </tr>
                <tr>
                  <td>
                    You believe a capped attempt would have succeeded with
                    more budget
                  </td>
                  <td>Solve eventually (budget-free)</td>
                  <td>
                    <strong>Impute a value</strong>{' '}
                    <Tex>{String.raw`\hat V(h_T)`}</Tex> instead of masking.
                    Unbiased for that objective only if{' '}
                    <Tex>{String.raw`\hat V`}</Tex> is the continuation value;
                    say so.
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
            <p>
              The first row is a one-line change in every framework we
              checked. The second is a scheduler change; Miles&rsquo; async
              buffer already holds whole groups and has a single{' '}
              <code>_drop_stale</code> branch where a coin flip and a weight
              would go. The third is a reward-path change that must be
              labelled as optimizing a different objective.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <hr className="am-hr" />
          <SectionTitle id="plan" label="Experimental plan" />
          <div className="am-prose">
            <p>
              We organize the plan around three questions, in increasing cost.
              Each has a measurement that could come out against us. We state
              the arms, the controls, and what we would conclude from each
              outcome before seeing any of them.
            </p>

            <h3>Question 1: Is the term present in real gradients?</h3>
            <p>
              <span className="am-runin">Experiment setup.</span> Fix a
              checkpoint. Collect a few thousand multi-turn rollouts with
              per-token log-probabilities, rewards, truncation flags, and
              weight versions. Miles and slime dump all of this with{' '}
              <code>--save-debug-rollout-data</code> and replay it at a fixed
              checkpoint with <code>--load-debug-rollout-data
              --debug-train-only</code>; swapping the sample filter changes
              the masking rule without regenerating anything. We will use
              SWE-smith rollouts from a Qwen3-4B or 8B mini-swe-agent run with
              a 40&ndash;80 turn cap, where the cap is known to bind for most
              trajectories<Ref n={14} />, and ALFWorld rollouts as a cheap
              second environment.
            </p>
            <p>
              <span className="am-runin">Arms.</span> Advantages recomputed
              under: (a) no mask, <Tex>R=0</Tex> on cap (the reference); (b)
              mask with baseline over all <Tex tail=";">G</Tex> (c) mask with baseline
              over survivors; (d) explicit imputation{' '}
              <Tex tail=";">{String.raw`R:=\bar b`}</Tex> (e) mask only a random fraction{' '}
              <Tex>{String.raw`\rho\in\{0.3,0.6,1.0\}`}</Tex> of capped rollouts.
              For each, the full-batch policy gradient at the fixed{' '}
              <Tex tail=",">{String.raw`\theta`}</Tex> flattened after backward on a
              single device to avoid tensor-parallel gathers.
            </p>
            <p>
              <span className="am-runin">Measurements.</span> Cosine between
              each arm and the reference; the projection of the difference
              onto the estimated <Tex tail=",">{String.raw`\nabla P(\text{cap})`}</Tex>
              obtained by REINFORCE on the cap indicator from the same
              rollouts; the same quantities bucketed by turn index, to see
              whether the subsidy is concentrated late (where capped and
              uncapped trajectories diverge) or spread evenly.
            </p>
            <p>
              <span className="am-runin">What we learn.</span> If (b) and (d)
              are numerically identical, the identity is confirmed at the
              estimator level, which it should be, since they are the same
              computation. The informative numbers are the cosine gap between
              (a) and (b) and the fraction of that gap explained by the{' '}
              <Tex>{String.raw`\nabla P(\text{cap})`}</Tex> direction. If the gap
              is within the seed-to-seed noise of (a), the effect is real but
              small at this checkpoint and we stop here.
            </p>

            <h3>Question 2: Does the term move behavior?</h3>
            <p>
              <span className="am-runin">Experiment setup.</span> The cheapest
              recipe where the cap binds at a high and changing rate is the
              verl-agent GiGPO configuration on ALFWorld<Ref n={15} />:
              Qwen2.5-1.5B-Instruct, 50-step cap, group size 8, 150
              iterations on two H100s, about 15 GPU-hours per run, with public
              training curves. ALFWorld episodes end only on success or on the
              cap, so the cap-hit rate starts near 96% and falls to roughly
              13% under GRPO; this gives the subsidy a large dynamic range to
              act on. The default convention there is <Tex tail=",">R=0</Tex> so the
              other arms are one-line edits to the reward and mask. WebShop,
              with a 15-step cap, is the second environment.
            </p>
            <p>
              <span className="am-runin">Arms (3 seeds each).</span> (i){' '}
              <Tex>R=0</Tex> on cap, no mask; (ii) loss-mask on cap; (iii)
              explicit <Tex>{String.raw`R:=\bar b`}</Tex> imputation, which should
              trace (ii); (iv) mask with Dr.&nbsp;GRPO constant normalization
              <Ref n={8} /> (<code>norm_adv_by_std_in_grpo=False</code>,{' '}
              <code>loss_agg_mode=seq-mean-token-sum-norm</code>) to remove the
              length-normalization bias as a confound; (v) mask with
              survivor-only baseline.
            </p>
            <p>
              <span className="am-runin">Measurements.</span> Cap-hit rate and
              episode length per iteration; success rate; clip ratio; the
              running value of <Tex tail=",">b</Tex> so that we can plot the rate of
              change of the cap-hit rate against <Tex>b</Tex> rather than
              against steps.
            </p>

            <h3>Question 3: Does it suppress slow successes under asynchronous drops?</h3>
            <p>
              <span className="am-runin">Experiment setup.</span> Miles with the
              SWE-smith mini-swe-agent recipe<Ref n={14} /> scaled to
              Qwen3-4B or 8B on a single node, fully asynchronous. The staleness
              drop is the default <code>--max-weight-staleness</code> handler
              and the buffer holds complete groups, so the first experiment
              uses groups that are finished but stale: their rewards exist,
              and the only question is whether they enter the loss and with
              what weight. We will choose a task subset with success rate
              between 0.2 and 0.5 so that <Tex>b</Tex> is large enough for the
              subsidy to be visible.
            </p>
            <p>
              <span className="am-runin">Arms.</span> (i) drop stale groups
              (default); (ii) never drop, train stale groups with per-token
              truncated importance ratios and score centering<Ref n={1} />;
              (iii) randomized protection with{' '}
              <Tex>{String.raw`a\in\{0.25,0.5\}`}</Tex> and weight{' '}
              <Tex tail=";">1/a</Tex> (iv) synchronous reference at matched prompts,
              used only as the gradient-direction oracle.
            </p>
            <p>
              <span className="am-runin">Measurements.</span> Turn-count
              distributions conditioned on outcome (the &ldquo;succeed fast,
              fail slow&rdquo; signature); the rate at which successful
              trajectories ran the test suite before submitting, as a proxy
              for thoroughness; gradient cosine to the synchronous reference;
              wall-clock and sandbox cost per unit of reward improvement, so
              that protection is charged for the stragglers it keeps alive.
            </p>

            <h3>Ablations</h3>
            <p>
              The ablations exist to pin the effect to the mechanism and to
              separate it from the two confounds we know about:
              length-normalization bias<Ref n={8} /><Ref n={9} /> and the
              genuine noise reduction that masking provides early in training.
            </p>
            <div className="am-table">
            <table>
              <thead>
                <tr>
                  <th>Ablation</th>
                  <th>Values</th>
                  <th>What it isolates</th>
                  <th>Prediction</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Baseline population</td>
                  <td>all <Tex>G</Tex> vs. survivors only</td>
                  <td>Corollary 2 amplification</td>
                  <td>Survivor arm drifts faster; gap widens with cap-hit rate</td>
                </tr>
                <tr>
                  <td>Advantage normalization</td>
                  <td>std on vs. off</td>
                  <td>
                    <Tex>{String.raw`\sqrt{p/(1-p)}`}</Tex> scaling
                  </td>
                  <td>Std on: drift concentrated on high-<Tex>b</Tex> prompts</td>
                </tr>
                <tr>
                  <td>Loss normalization</td>
                  <td>token-mean vs. constant (Dr.&nbsp;GRPO)</td>
                  <td>Length-normalization confound</td>
                  <td>Direction unchanged; slope reduced by a constant factor</td>
                </tr>
                <tr>
                  <td>Task difficulty split</td>
                  <td>
                    <Tex>{String.raw`b\in[0.1,0.2],\,[0.3,0.5],\,[0.6,0.8]`}</Tex>
                  </td>
                  <td>Subsidy <Tex>{String.raw`\propto b`}</Tex></td>
                  <td>Cap-hit growth rate increases monotonically with <Tex>b</Tex></td>
                </tr>
                <tr>
                  <td>Mask dose</td>
                  <td>mask 30 / 60 / 100% of capped rollouts</td>
                  <td>Dose&ndash;response, cf.<Ref n={5} /></td>
                  <td>Growth rate roughly linear in dose</td>
                </tr>
                <tr>
                  <td>Cap tightness</td>
                  <td>ALFWorld 30 / 50 / 80 steps</td>
                  <td>Whether the effect is cap-specific</td>
                  <td>Final episode length tracks the cap under masking, not under <Tex>R=0</Tex></td>
                </tr>
                <tr>
                  <td>Group size</td>
                  <td>
                    <Tex>{String.raw`G\in\{4,8,16\}`}</Tex>
                  </td>
                  <td>
                    <Tex>{String.raw`(1-1/G)`}</Tex> factor; survivor-count variance
                  </td>
                  <td>Weak dependence for all-<Tex>G</Tex> baseline; strong for survivor baseline</td>
                </tr>
                <tr>
                  <td>PPO epochs / clip</td>
                  <td>1 vs. 2 epochs; clip on/off</td>
                  <td>Whether clipping hides the term (ratio ≡ 1 on the first pass)</td>
                  <td>Term present at epoch 1; clipping on epoch 2 does not remove it</td>
                </tr>
                <tr>
                  <td>KL / entropy terms</td>
                  <td>
                    <Tex>{String.raw`\beta\in\{0,10^{-3}\}`}</Tex>
                  </td>
                  <td>Mask-dependent regularizers</td>
                  <td>Small modulation; sign unchanged</td>
                </tr>
                <tr>
                  <td>Protection probability</td>
                  <td>
                    <Tex>{String.raw`a\in\{0.1,0.25,0.5,1\}`}</Tex>
                  </td>
                  <td>Bias&ndash;variance of randomized rescue</td>
                  <td>Unbiased at all <Tex tail=";">a</Tex> variance <Tex tail=";">{String.raw`\propto 1/a-1`}</Tex> a sweet spot below 1 only if stragglers are expensive</td>
                </tr>
              </tbody>
            </table>
            </div>
            <div className="am-callout forest">
              <div className="am-callout-label">Workflow commitments</div>
              <div className="am-prose">
                <ol>
                  <li>
                    One objective, one variable at a time, three seeds, error
                    bands. The same discipline as<Ref n={1} />.
                  </li>
                  <li>
                    Q1 runs before any online training. If the offline
                    gradient gap is below seed noise, we report that and stop.
                  </li>
                  <li>
                    Arms (ii) and (iii) in Q2 are the same computation. If
                    their curves separate, there is a bug, not a finding.
                  </li>
                  <li>
                    Every online arm reports <Tex>b</Tex> over time, so that
                    rates are plotted against <Tex>b</Tex> and the{' '}
                    <Tex>{String.raw`\propto b`}</Tex> prediction can be checked
                    directly.
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          <hr className="am-hr" />
          <SectionTitle id="predictions" label="Predicted results" />
          <div className="am-prose">
            <p>
              These are predictions, written before the runs. We give them
              with the observation that would falsify each.
            </p>
            <figure>
              <PredictedCurvesFigure />
              <figcaption>
                <strong>Figure 3 (schematic, not data).</strong> Predicted
                cap-hit rate during Q2 training on ALFWorld. Under{' '}
                <Tex>R=0</Tex> the rate falls monotonically as the policy
                learns to finish. Under masking we expect an initial fall,
                because masking does remove genuine label noise while{' '}
                <Tex>b</Tex> is small, followed by a drift back toward the cap
                as <Tex>b</Tex> grows. The imputation arm is predicted to trace
                the mask arm to within seed noise. The Dr.&nbsp;GRPO control is
                predicted to keep the sign of the drift with a smaller slope.
              </figcaption>
            </figure>
            <ol>
              <li>
                <strong>P1 (identity, Q1).</strong> Mask and explicit{' '}
                <Tex>{String.raw`R:=\bar b`}</Tex> imputation give the same
                gradient to numerical precision. <em>Falsified if</em> they
                differ beyond floating-point tolerance; that would mean the
                baseline or denominator is computed in a way we have not
                modelled, which is itself worth reporting.
              </li>
              <li>
                <strong>P2 (direction, Q1).</strong> The difference between the
                masked and unmasked gradients has cosine above 0.5 with the
                estimated <Tex tail=",">{String.raw`\nabla P(\text{cap})`}</Tex> and its
                norm scales with <Tex>b</Tex> across task subsets.{' '}
                <em>Falsified if</em> the difference is isotropic relative to{' '}
                <Tex tail=",">{String.raw`\nabla P(\text{cap})`}</Tex> or if its norm is
                flat in <Tex tail=".">b</Tex>
              </li>
              <li>
                <strong>P3 (drift, Q2).</strong> The cap-hit rate under masking
                stops falling, or rises, once <Tex>b</Tex> exceeds roughly 0.3,
                while under <Tex>R=0</Tex> it keeps falling. The slope of the
                cap-hit rate against <Tex>b</Tex> is positive under masking and
                negative under <Tex tail=".">R=0</Tex> <em>Falsified if</em> the two
                arms are indistinguishable in cap-hit rate at matched{' '}
                <Tex>b</Tex> across three seeds.
              </li>
              <li>
                <strong>P4 (amplification, Q2 ablation).</strong> The
                survivor-baseline arm drifts faster than the all-<Tex>G</Tex>{' '}
                arm, with a gap that grows with the cap-hit rate.{' '}
                <em>Falsified if</em> the two baselines produce the same
                curves.
              </li>
              <li>
                <strong>P5 (signature, Q3).</strong> Under staleness drops,
                successful trajectories get shorter and failed trajectories get
                longer over training relative to the never-drop arm, and the
                fraction of successes that ran tests before submitting falls.{' '}
                <em>Falsified if</em> the outcome-conditioned turn
                distributions do not separate, or separate in the other
                direction.
              </li>
              <li>
                <strong>P6 (rescue, Q3).</strong> Randomized protection at{' '}
                <Tex>a=0.5</Tex> recovers the never-drop arm&rsquo;s final
                success within seed noise at lower wall-clock than never-drop,
                and at <Tex>a=0.1</Tex> it does not, because the variance
                inflation dominates. <em>Falsified if</em> never-drop is
                cheaper or if no <Tex>a&lt;1</Tex> matches it.
              </li>
            </ol>
            <p>
              We also expect one result that is not a confirmation: the mask
              arm should match or beat <Tex>R=0</Tex> on success rate early in
              training, when <Tex>b</Tex> is small and the label noise removed
              by masking is real. Reports that found overlong filtering helpful
              at short caps and unhelpful at long ones<Ref n={6} /> are
              consistent with the crossover we would predict. If the mask arm
              wins throughout, the identity is still true but the noise
              benefit dominates the subsidy at these scales, and the honest
              headline is narrower.
            </p>
            <div className="am-callout">
              <div className="am-callout-label">Stopping conditions</div>
              <div className="am-prose">
                <ul>
                  <li>
                    The offline gradient gap in Q1 is below the seed-to-seed
                    variation of the reference gradient.
                  </li>
                  <li>
                    A plain queue-policy change in Q3 (train stale, never drop)
                    already removes the effect at no measurable cost, in which
                    case randomized protection is unnecessary and we say so.
                  </li>
                  <li>
                    Protection&rsquo;s variance and sandbox cost make it lose
                    to waiting at every <Tex tail=".">a</Tex>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          <hr className="am-hr" />
          <SectionTitle id="discussion" label="Discussion and what would change our mind" />
          <div className="am-prose">
            <p>
              <strong>What the identity does and does not say.</strong> It is
              a statement about the expected update at a fixed parameter. It
              does not by itself predict training dynamics, and the drift we
              predict depends on <Tex>{String.raw`\nabla P(\text{excluded})`}</Tex>{' '}
              being a cheap direction for the policy to move along. For
              length and turn count it plainly is; for format failures it may
              not be. We also note that masking removes real noise early, so
              the net effect over a run can be positive for a while. The claim
              is that it cannot stay positive, because the subsidy grows with
              the thing being optimized.
            </p>
            <p>
              <strong>Relation to prior observations.</strong> Skywork-OR1
              reported a steadily rising clip ratio with an advantage mask on
              truncated samples and called it reward hacking<Ref n={4} />.
              A later study found that a higher masking rate accelerates length
              growth with a roughly dose-dependent effect<Ref n={5} />. The
              overlong-filtering ablation in<Ref n={6} /> found gains at short
              caps that vanish at long ones. DeepSWE&rsquo;s report shows
              environment steps rising through training under compact
              filtering<Ref n={3} />. Applied Compute documented the
              short-response bias of staleness thresholds<Ref n={11} />, and a
              NeurIPS 2026 paper characterizes latency-conditioned selection
              with a selection-probability weighting fix<Ref n={12} />. Our
              reading is that these are one mechanism seen from five angles;
              the experiments above are designed to test whether that reading
              is right.
            </p>
            <p>
              <strong>Relation to score centering.</strong> The two terms are
              different objects that share a shape. Score centering<Ref n={1} />{' '}
              cancels a drift that arises because the sampler and trainer
              disagree at every prefix; it is a property of the probabilities.
              The term here arises because the trainer never sees some
              trajectories; it is a property of the data pipeline. A pipeline
              can have both, and the remedies compose: centering handles what
              arrives late, and not dropping ensures that it arrives.
            </p>
            <p>
              <strong>What would change our mind.</strong> If P2 fails, the
              bias exists but points somewhere the policy cannot easily
              follow, and the practical consequence is small. If P3 fails
              under constant normalization, the length drift reported in the
              literature is the normalization bias of<Ref n={9} />, not ours.
              If P5 fails, the asynchronous story reduces to the known
              short-response bias with nothing new added. We would publish any
              of these as the result.
            </p>
            <p>
              <strong>Scope limits we accept going in.</strong> ALFWorld has
              no tests and no notion of thoroughness; it can show the subsidy
              but not the reversal. Small SWE models may have success rates so
              low that <Tex tail=",">b</Tex> and with it the effect, is negligible,
              which is why Q3 restricts to a mid-difficulty subset. And
              frontier training stacks may already use penalties or bootstraps
              rather than masks, in which case this is a cleanup of open-source
              defaults rather than a change to frontier practice. We think
              that is still worth doing: the defaults are what most agentic RL
              runs use.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <hr className="am-hr" />
          <SectionTitle id="appendix" label="Appendix: execution plan and compute budget" />
          <div className="am-prose">
            <p>
              The body of the post fixes the arms, controls, and measurements.
              This appendix fixes the order of operations, the code paths we
              will touch, and the compute we expect to spend, so that the plan
              can be executed as written and audited afterwards. Numbers for
              ALFWorld come from the published verl-agent recipe and are
              reliable; numbers for SWE runs are projections from comparable
              configurations and are to be recalibrated after the pilot.
            </p>

            <h3>A. Phases and go/no-go gates</h3>
            <div className="am-table">
            <table>
              <thead>
                <tr>
                  <th>Phase</th>
                  <th>What runs</th>
                  <th>Output</th>
                  <th>Gate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>0. Identity check</strong> (2&ndash;3 days)
                  </td>
                  <td>
                    Fixed checkpoint; one batch of rollouts; advantages
                    recomputed under mask and under{' '}
                    <Tex tail=";">{String.raw`R:=\bar b`}</Tex> gradients
                    compared element-wise and against <Tex>R=0</Tex>
                  </td>
                  <td>Equality to numerical tolerance; cosine to the reference</td>
                  <td>
                    Not equal &rarr; find the baseline or denominator
                    discrepancy before anything else
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>1. ALFWorld online</strong> (1 week)
                  </td>
                  <td>Q2: five arms &times; three seeds, then ablations</td>
                  <td>Slope of cap-hit rate against <Tex>b</Tex></td>
                  <td>
                    Mask and <Tex>R=0</Tex> indistinguishable at matched{' '}
                    <Tex>b</Tex> &rarr; effect too small; reduce investment
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>2. SWE pilot</strong> (1 week)
                  </td>
                  <td>
                    Miles SWE-smith, Qwen3-8B, one arm, 100 steps; dump rollouts
                    for Q1
                  </td>
                  <td>
                    Seconds per step; cap-hit rate; range of <Tex>b</Tex>;
                    offline replay data
                  </td>
                  <td>
                    <Tex>{String.raw`b<0.15`}</Tex> or cap-hit rate below 30%
                    &rarr; change the task subset before Phase 3
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>3. SWE online + async</strong> (2&ndash;3 weeks)
                  </td>
                  <td>Q3: four to five arms &times; two to three seeds</td>
                  <td>
                    Outcome-conditioned turn distributions; cosine to the
                    synchronous reference; cost per unit reward
                  </td>
                  <td>
                    Never-drop already removes the effect at no cost &rarr;
                    randomized protection unnecessary; report that
                  </td>
                </tr>
              </tbody>
            </table>
            </div>

            <h3>B. Engineering checklist</h3>
            <p>
              <span className="am-runin">Phases 0&ndash;1, verl-agent (ALFWorld,
              WebShop).</span> Recipe: Qwen2.5-1.5B-Instruct,{' '}
              <code>env.max_steps=50</code>, group 8 &times; 16 groups, 150
              iterations, two H100s. Three code touches: (a) the reward the
              environment wrapper assigns on a cap hit (already{' '}
              <Tex tail=");">R=0</Tex> (b) zeroing <code>response_mask</code> for
              cap-hit episodes to obtain the mask arm; (c) an arm that sets the
              cap-hit reward to the current group mean{' '}
              <Tex tail=".">{String.raw`\bar b`}</Tex> The survivor-baseline arm
              filters before the mean inside{' '}
              <code>compute_grpo_outcome_advantage</code>. Controls:{' '}
              <code>norm_adv_by_std_in_grpo=False</code> and{' '}
              <code>loss_agg_mode=seq-mean-token-sum-norm</code>.
            </p>
            <p>
              <span className="am-runin">Phases 2&ndash;3, Miles (SWE-smith).</span>{' '}
              Start from the public mini-swe-agent recipe<Ref n={14} /> with
              Qwen3-8B, a 40-turn cap, 64k context, <Tex>n=8</Tex>, 16 prompts
              per step. Task subset: run the pilot over the SWE-smith training
              set and keep tasks with success rate in{' '}
              <Tex tail=",">[0.2,\,0.5]</Tex> roughly one to two thousand. Code
              touches: (a) <code>--rollout-sample-filter-path</code> pointing at{' '}
              <code>mask_truncated_zero_reward</code> gives the mask arm, and
              omitting it gives <Tex tail=";">R=0</Tex> (b) the RESCUE hook
              replaces the else-branch of{' '}
              <code>fully_async_data_buffer.py::_drop_stale</code> with a
              Bernoulli(<Tex>a</Tex>) keep and multiplies that group&rsquo;s
              rewards by <Tex>1/a</Tex> after <code>_post_process_rewards</code>;
              (c) never-drop raises <code>--max-weight-staleness</code> and
              enables truncated importance sampling plus score centering; (d)
              offline replay uses <code>--save-debug-rollout-data</code> and{' '}
              <code>--load-debug-rollout-data --debug-train-only</code>, with a
              post-backward hook that flattens the gradient for the cosine
              computation.
            </p>
            <p>
              <span className="am-runin">Logging contract.</span> Every online
              run logs per step: cap-hit rate, mean and outcome-conditioned
              turn counts, success rate, clip ratio, the realized baseline{' '}
              <Tex tail=",">b</Tex> staleness statistics where applicable, and
              wall-clock. All rate-of-change claims are plotted against{' '}
              <Tex>b</Tex> as well as against steps.
            </p>

            <h3>C. Compute budget</h3>
            <p>
              Units are H100-hours; B200 is taken as roughly twice the
              throughput, so halve the numbers for a B200 cluster.
            </p>
            <div className="am-table">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Per run</th>
                  <th className="am-num">Runs</th>
                  <th className="am-num">H100-h</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Phase 0 identity check</td>
                  <td>&mdash;</td>
                  <td className="am-num">&mdash;</td>
                  <td className="am-num">~20</td>
                  <td>high</td>
                </tr>
                <tr>
                  <td>Phase 1 ALFWorld main: 5 arms &times; 3 seeds</td>
                  <td>2 GPUs &times; 7.5 h &asymp; 15</td>
                  <td className="am-num">15</td>
                  <td className="am-num">225</td>
                  <td>high (363 s/iter published)</td>
                </tr>
                <tr>
                  <td>Phase 1 WebShop replication</td>
                  <td>&asymp; 15</td>
                  <td className="am-num">15</td>
                  <td className="am-num">225</td>
                  <td>high</td>
                </tr>
                <tr>
                  <td>
                    Phase 1 ablations: cap tightness, group size, std, mask
                    dose
                  </td>
                  <td>&asymp; 15</td>
                  <td className="am-num">~30</td>
                  <td className="am-num">450</td>
                  <td>high</td>
                </tr>
                <tr>
                  <td>Phase 2 SWE pilot: 8B, 100 steps, one node</td>
                  <td>see note</td>
                  <td className="am-num">1&ndash;2</td>
                  <td className="am-num">~150&ndash;300</td>
                  <td>low</td>
                </tr>
                <tr>
                  <td>Phase 2 Q1 offline replay: 5 rules &times; 3 checkpoints</td>
                  <td>&asymp; 3 per rule (2k sequences &times; 64k tokens)</td>
                  <td className="am-num">15</td>
                  <td className="am-num">~50</td>
                  <td>medium</td>
                </tr>
                <tr>
                  <td>
                    Phase 3 SWE online: drop / never-drop / <Tex>a=0.5</Tex> /{' '}
                    <Tex>a=0.25</Tex> / sync reference, &times; 2 seeds, 300
                    steps
                  </td>
                  <td>&asymp; 150 (one node &times; ~20 h)</td>
                  <td className="am-num">10</td>
                  <td className="am-num">~1,500</td>
                  <td>low</td>
                </tr>
                <tr>
                  <td>Phase 3 third seed and <Tex>a</Tex> sweep</td>
                  <td>&asymp; 150</td>
                  <td className="am-num">6</td>
                  <td className="am-num">~900</td>
                  <td>low</td>
                </tr>
              </tbody>
            </table>
            </div>
            <p>
              <span className="am-runin">SWE step-cost note.</span> With 128
              rollouts per step averaging 25 turns and contexts growing to
              30k tokens, generation is about 1.2M tokens per step and the
              trainer sees about 4M tokens. On one 8&times;H100 node the LLM
              side is one to two minutes, but rollouts are bounded by sandbox
              and tool latency; we project <strong>three to five minutes per
              step</strong>, so 300 steps is roughly 20 hours, or about 150
              H100-hours per run. A comparable public configuration runs
              Qwen3-8B for 1000 steps on four B200s. The first twenty steps of
              the pilot calibrate this number, and Phase 3 is re-budgeted from
              the measured seconds per step.
            </p>
            <p>
              <span className="am-runin">Totals.</span> Minimum publishable
              version (Phases 0, 1 main, 2, and Phase 3 with drop / never-drop /{' '}
              <Tex>a=0.5</Tex> at two seeds): about <strong>1,100 H100-hours</strong>,
              roughly 550 B200-hours, or six days on one 8&times;H100 node.
              Full version (WebShop, all ablations, three seeds, the{' '}
              <Tex>a</Tex> sweep): about <strong>3,500 H100-hours</strong>,
              roughly 1,800 B200-hours.
            </p>

            <h3>D. Allocation on a 24-node H100 cluster</h3>
            <p>
              With 192 GPUs the full program is about 18 hours of saturated
              compute, so GPU time stops being the constraint. The plan below
              spends the surplus on confidence rather than on more arms.
            </p>
            <div className="am-table">
            <table>
              <thead>
                <tr>
                  <th>Phase</th>
                  <th>Parallelization</th>
                  <th>Wall-clock</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>0. Identity check</td>
                  <td>1 node</td>
                  <td>half a day</td>
                </tr>
                <tr>
                  <td>1. ALFWorld + WebShop, all ~60 runs including ablations</td>
                  <td>2 GPUs per run, 4 runs per node, 15 nodes in one wave</td>
                  <td>about 8 hours</td>
                </tr>
                <tr>
                  <td>2. SWE pilot</td>
                  <td>2 nodes: 8B at cap 40 and at cap 80</td>
                  <td>1 day, mostly calibration</td>
                </tr>
                <tr>
                  <td>2. Q1 offline replay</td>
                  <td>1 node</td>
                  <td>half a day</td>
                </tr>
                <tr>
                  <td>3. SWE online, 8B: 5 arms &times; 3 seeds = 15 runs</td>
                  <td>one node per run, 15 nodes concurrently</td>
                  <td>
                    about 1 day for 300 steps; never-drop and high-<Tex>a</Tex>{' '}
                    arms 30&ndash;50% longer
                  </td>
                </tr>
                <tr>
                  <td>3. 30B-A3B replication: drop / never-drop &times; 2 seeds</td>
                  <td>2 nodes per run, 4 runs on the remaining 9 nodes</td>
                  <td>about 2 days</td>
                </tr>
              </tbody>
            </table>
            </div>
            <p>
              GPU wall-clock for the whole program is four to five days; with
              pilot calibration, code changes, and analysis, two weeks is a
              realistic cycle. Upgrades worth buying with the surplus: five
              seeds instead of three for the headline arms (<Tex>R=0</Tex> vs.
              mask; drop vs. never-drop); 500&ndash;1000 steps for the SWE arms,
              since the subsidy scales with <Tex>b</Tex> and the crossover may
              sit past step 300; the 30B-A3B replication at the scale where the
              84% cap-hit rate was measured<Ref n={14} />; a cap-tightness
              ablation (40 vs. 80 turns) on SWE, which ALFWorld cannot
              provide; and a fully-run synchronous reference as the gradient
              oracle for Q3. Not worth buying: more benchmarks or more model
              families, which dilute engineering time without touching the
              claim.
            </p>

            <h3>E. Infrastructure prerequisites</h3>
            <ul>
              <li>
                <strong>Sandbox CPU.</strong> 128 concurrent rollouts per SWE
                node; 15 nodes plus the 30B runs means roughly 2,000&ndash;2,500
                concurrent containers. Budget 2&ndash;3k CPU cores, a local
                registry with the SWE-smith images cached, and a few hundred GB
                of container-layer storage per node. This is the component
                most likely to delay the program.
              </li>
              <li>
                <strong>Wall-clock scheduling.</strong> Asynchronous arms
                finish at different times because of stragglers; the scheduler
                must not wait on the slowest run before starting analysis.
              </li>
              <li>
                <strong>Storage.</strong> Rollout dumps are 1&ndash;2 GB per
                step; dumping the first 50 steps of 15 runs is about 1&ndash;1.5
                TB.
              </li>
              <li>
                <strong>Discipline.</strong> One variable per comparison, the
                pre-registered predictions unchanged, the stopping conditions
                honored. The failure mode that abundant compute invites is
                adding arms until an effect appears, which is the one thing
                this post is designed to prevent.
              </li>
            </ul>
          </div>

          {/* ------------------------------------------------------------ */}
          <hr className="am-hr" />
          <SectionTitle id="references" label="References" />
          <ol className="am-refs">
            <li id="ref-1">
              [1] M. Marek, M. Ryabinin. <em>Score Centering Stabilizes
              Off-policy Reinforcement Learning.</em>{' '}
              <a href="https://arxiv.org/abs/2609.20807">arXiv:2609.20807</a>,
              2026.
            </li>
            <li id="ref-2">
              [2] Q. Yu et al. <em>DAPO: An Open-Source LLM Reinforcement
              Learning System at Scale.</em>{' '}
              <a href="https://arxiv.org/abs/2503.14476">arXiv:2503.14476</a>,
              2025. §3.4, overlong filtering.
            </li>
            <li id="ref-3">
              [3] Agentica / Together AI. <em>DeepSWE: Training a
              State-of-the-Art Coding Agent from Scratch by Scaling RL.</em>{' '}
              <a href="https://together.ai/blog/deepswe">blog</a>, 2025.
              Compact filtering; Figure 7.
            </li>
            <li id="ref-4">
              [4] J. He et al. <em>Skywork Open Reasoner 1 Technical
              Report.</em>{' '}
              <a href="https://arxiv.org/abs/2505.22312">arXiv:2505.22312</a>,
              2025. §3.2.3, advantage mask on truncated samples.
            </li>
            <li id="ref-5">
              [5] <em>Breaking Training Bottlenecks: masking rate and output
              length growth.</em>{' '}
              <a href="https://arxiv.org/abs/2603.07777">arXiv:2603.07777</a>,
              2026.
            </li>
            <li id="ref-6">
              [6] <em>Tricks or Traps? A Deep Dive into RL for LLM
              Reasoning.</em>{' '}
              <a href="https://arxiv.org/abs/2508.08221">arXiv:2508.08221</a>,
              2025. §4.4.
            </li>
            <li id="ref-7">
              [7] <em>Mini-o3: Scaling Up Reasoning Patterns and Interaction
              Turns for Visual Search.</em>{' '}
              <a href="https://arxiv.org/abs/2509.07969">arXiv:2509.07969</a>,
              2025. Over-turn masking.
            </li>
            <li id="ref-8">
              [8] Z. Liu et al. <em>Understanding R1-Zero-Like Training: A
              Critical Perspective (Dr. GRPO).</em>{' '}
              <a href="https://arxiv.org/abs/2503.20783">arXiv:2503.20783</a>,
              2025.
            </li>
            <li id="ref-9">
              [9] <em>On the impossibility of unbiased and length-invariant
              policy optimization.</em>{' '}
              <a href="https://arxiv.org/abs/2607.23364">arXiv:2607.23364</a>,
              2026.
            </li>
            <li id="ref-10">
              [10] <em>NAT: Horvitz&ndash;Thompson corrections for token
              subsampling in policy gradients.</em>{' '}
              <a href="https://arxiv.org/abs/2603.06619">arXiv:2603.06619</a>,
              2026.
            </li>
            <li id="ref-11">
              [11] Applied Compute. <em>Staleness in fully asynchronous RL.</em>{' '}
              <a href="https://www.appliedcompute.com/research/staleness-in-fully-async-rl">
                research note
              </a>
              , 2026.
            </li>
            <li id="ref-12">
              [12] <em>Latency-Conditioned Selection Bias in Asynchronous
              RL.</em> NeurIPS 2026.{' '}
              <a href="https://neurips.cc/virtual/2026/loc/sydney/poster/148493">
                poster
              </a>
              .
            </li>
            <li id="ref-13">
              [13] <em>STOPD: Stochastic Truncation for On-Policy
              Distillation.</em>{' '}
              <a href="https://arxiv.org/abs/2610.21337">arXiv:2610.21337</a>,
              2026.
            </li>
            <li id="ref-14">
              [14] LMSYS. <em>Agentic RL on MI355X with Miles: SWE-smith
              with mini-swe-agent.</em>{' '}
              <a href="https://www.lmsys.org/blog/2026-10-22-miles-mi355x-agentic-rl">
                blog
              </a>
              , October 2026. 84% of trajectories hit the turn cap.
            </li>
            <li id="ref-15">
              [15] L. Feng et al. <em>Group-in-Group Policy Optimization for
              LLM Agent Training (GiGPO) and verl-agent.</em>{' '}
              <a href="https://arxiv.org/abs/2505.10978">arXiv:2505.10978</a>,{' '}
              <a href="https://github.com/langfengQ/verl-agent">code</a>, 2025.
            </li>
            <li id="ref-16">
              [16] Framework sources read for the table: TRL{' '}
              <code>grpo_trainer.py</code>, rLLM <code>transform.py</code> and{' '}
              <code>CompactFilteringConfig</code>, NeMo-RL{' '}
              <code>algorithms/grpo.py</code>, Miles{' '}
              <code>filter_hub/sample_filters.py</code> and{' '}
              <code>fully_async_data_buffer.py</code>, prime-rl{' '}
              <code>train_sink.py</code>, verl <code>core_algos.py</code>.
              Main branches as of November 3, 2026.
            </li>
            <li id="ref-17">
              [17] NovaSky. <em>SkyRL fully asynchronous training.</em>{' '}
              <a href="https://docs.skyrl.ai/docs/tutorials/fully_async">docs</a>.
            </li>
            <li id="ref-18">
              [18] T. Degris, M. White, R. Sutton. <em>Off-Policy
              Actor-Critic.</em>{' '}
              <a href="https://arxiv.org/abs/1205.4839">arXiv:1205.4839</a>,
              2012.
            </li>
          </ol>
        </div>
      </article>
    </Container>
  )
}
