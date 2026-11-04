import { type Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/Container'

import './_styles/merge.css'

import Tex from './_components/Tex'
import SectionTitle from './_components/SectionTitle'
import {
  ParadigmFigure,
  GeometryFigure,
  HeadToHeadFigure,
} from './_components/Figures'

const T = String.raw

export const metadata: Metadata = {
  title: 'On-Policy Merging: Train Apart, Meet Often',
  description:
    'A training paradigm for multi-task RL: one on-policy trainer per domain, merged at the KL barycenter of their policies whenever one drifts too far. The derivation, what a merge provably preserves, and the experiment against multi-task RL, MOPD and one-shot merging.',
}

const POST = {
  title: 'On-Policy Merging: Train Apart, Meet Often',
  subtitle:
    'A training paradigm for multi-task RL post-training. Each domain gets its own on-policy trainer. Whenever a trainer drifts a fixed number of nats from the shared anchor, all trainers meet at the KL barycenter of their policies, measured on the rollouts they have just collected, and continue from there. We derive the merge rule, prove what it preserves, show that multi-task RL, one-shot merging and MOPD are its limits, and lay out the experiment that decides it: one Qwen model trained on the domains that frontier recipes use, with all four paradigms at matched budget.',
  author: 'Bowen Wang',
  date: 'November 4, 2026',
  reading: 'Method proposal · 30 min read',
}

const TOC = [
  { label: 'Three baselines, three mismatches', href: '#baselines' },
  { label: 'The paradigm', href: '#paradigm' },
  { label: 'Deriving the merge', href: '#derivation' },
  { label: 'What a rendezvous preserves', href: '#guarantees' },
  { label: 'The baselines as limits', href: '#limits' },
  { label: 'Running it on a real model', href: '#scale' },
  { label: 'A controlled signal', href: '#signal' },
  { label: 'The experiment that decides it', href: '#experiments' },
  { label: 'Where it can fail', href: '#risks' },
  { label: 'Related work', href: '#related' },
  { label: 'Appendix: proofs and system sketch', href: '#appendix' },
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
        <span className="am-pill">
          Proofs and experiment plan · no LLM results yet
        </span>
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

export default function OnPolicyMergingPost() {
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
            <ParadigmFigure />
            <figcaption>
              <strong>Figure 1.</strong> Four ways to get one model out of
              several RL domains. Multi-task RL couples every domain in every
              step. One-shot merging and MOPD let specialists run free
              and pay for it afterwards: the merged point is far from every
              policy that produced data, so merging loses what was learned and
              MOPD has to collect fresh student rollouts to recover it.{' '}
              <strong>On-Policy Merging</strong> (OPM) lets trainers separate
              only as far as a KL budget <Tex>{T`\delta`}</Tex> allows, then
              brings them back together at a point chosen so that each
              trainer’s policy on its own domain is unchanged. The
              rollouts each trainer holds stay on-policy for the merged model,
              and reward-driven training continues without a separate
              consolidation stage.
            </figcaption>
          </figure>

          <div className="am-prose">
            <p>
              A frontier model is post-trained by RL on many domains at once:
              mathematics, code, logical reasoning, instruction following,
              tool calling, software engineering and more. Each domain is an
              environment in the RL sense, a task distribution with its own
              verifier, and they differ widely in reward rate, rollout length
              and latency. There are three established ways to end up with one
              model, and each has a specific mismatch.
            </p>
            <ul>
              <li>
                <strong>Multi-task RL</strong> sums the gradients of all
                domains in every step. It is on-policy and uses reward, but
                the domains interfere through a shared optimizer and a shared
                batch, and a domain with small gradients or slow rollouts
                loses its share.
              </li>
              <li>
                <strong>One-shot merging</strong> trains specialists and
                combines their weights once. It is free, and it is an{' '}
                <em>off-policy</em> operation in a precise sense: the merged
                policy is many nats away from every policy that generated
                data, and nothing constrains what it does.
              </li>
              <li>
                <strong>MOPD</strong> trains specialists and then distils them
                into a student on the student’s own rollouts
                <Ref n={3} />
                <Ref n={4} />. It is on-policy in its states, but it needs a
                second rollout stage, it never looks at reward, and its
                optimum is the teachers.
              </li>
            </ul>
            <p>
              This post proposes a fourth, which we call{' '}
              <strong>On-Policy Merging</strong>. The claims:
            </p>
            <ol>
              <li>
                <strong>The merge rule is derived, not chosen.</strong>{' '}
                Asking for the single model closest in KL to every trainer on
                that trainer’s own fresh rollouts gives, to second
                order,{' '}
                <Tex tail=".">{T`\theta^{+}=\bar\theta+(\sum_iF_i)^{+}\sum_iF_i\Delta_i`}</Tex>{' '}
                The <Tex>{T`F_i`}</Tex> are Fisher matrices of on-policy
                rollouts, which is the only kind of data for which the
                sampled-action Fisher is unbiased.
              </li>
              <li>
                <strong>One number bounds two things.</strong> The KL residual{' '}
                <Tex>{T`\varepsilon_i`}</Tex> between a trainer and the merged
                model bounds the return lost on that environment by{' '}
                <Tex tail=",">{T`\sqrt{\varepsilon_i/2}`}</Tex> and it bounds
                the off-policy mismatch of every rollout the trainer has in
                flight.
              </li>
              <li>
                <strong>When a lossless point exists, every trainer keeps its
                gain.</strong>{' '}
                In an over-parameterised model the residual is zero to second
                order, and the merged model has the same first-order return as
                each trainer on its own environment. Summing or averaging the
                updates does not have this property.
              </li>
              <li>
                <strong>The three baselines are limits of it.</strong> With
                natural-gradient trainers the merge is exactly a natural
                policy gradient step on the summed objective. Merging every
                step without a metric is multi-task RL. Merging once without a
                metric is task arithmetic. Merging once with the metric
                re-measured on student rollouts is MOPD.
              </li>
              <li>
                <strong>A slow environment is protected, not starved.</strong>{' '}
                A trainer that made little progress still contributes its full
                metric, which stops the others from moving its policy.
              </li>
            </ol>
            <p>
              <span className="am-runin">Status.</span> The derivation and
              proofs are complete. A controlled toy gives a clear signal in
              favour and also shows where the cheap approximations fail. There
              are no LLM results. The second half of the post is the plan for
              the experiment that counts: one Qwen model trained on the same
              domains as the public frontier recipes, against the three
              baselines at matched budget.
            </p>
          </div>

          <TableOfContents />

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Three baselines, three mismatches" id="baselines" />
          <div className="am-prose">
            <p>
              The four paradigms differ in two choices: how often the
              environments are brought together, and in which geometry.
            </p>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Combined in weight space, no metric</th>
                    <th>Combined in policy space, KL metric</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Once, after training</strong>
                    </td>
                    <td>Task arithmetic, TIES</td>
                    <td>MOPD</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Continuously, during training</strong>
                    </td>
                    <td>Multi-task RL (every step)</td>
                    <td>
                      <strong>On-Policy Merging</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Each existing cell has a mismatch that the other axis would fix.
            </p>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Rollouts that train the final model</th>
                    <th>Reward used when combining</th>
                    <th>The mismatch</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Multi-task RL</strong>
                    </td>
                    <td>Its own, on-policy</td>
                    <td>Yes</td>
                    <td>
                      <strong>Gradient mismatch.</strong> One optimizer, one
                      batch. Environments with large gradients dominate; slow
                      environments stall the batch or lose their share
                      <Ref n={17} />.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>One-shot merge</strong>
                    </td>
                    <td>None</td>
                    <td>No</td>
                    <td>
                      <strong>Policy mismatch.</strong> The merged policy is
                      far in KL from every specialist, so every stored rollout
                      is off-policy for it and nothing bounds its return.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>MOPD</strong>
                    </td>
                    <td>The student’s, on-policy</td>
                    <td>No</td>
                    <td>
                      <strong>Teacher mismatch.</strong> Teachers are queried
                      on states they did not visit, the student can at best
                      equal them, and a second rollout stage is needed because
                      the first one’s data is unusable.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>OPM</strong>
                    </td>
                    <td>Each trainer’s own, on-policy</td>
                    <td>Yes, in every local step</td>
                    <td>
                      Bounded by construction: at most{' '}
                      <Tex>{T`\delta`}</Tex> nats between any trainer and the
                      anchor.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Controlled comparisons of the three baselines exist only for
              small models on mostly single-turn tasks, and they find the
              three within a point or two
              <Ref n={5} />. At frontier scale the public recipes have moved
              from mixed RL to specialists followed by MOPD
              <Ref n={3} />
              <Ref n={4} />, and one report of per-domain RL for a
              computer-use agent merged its domain models by a single
              parameter interpolation because joint RL was unstable and too
              costly
              <Ref n={13} />. The proposal here starts from that practice: do
              the merge repeatedly, while the domain models are still close,
              with a rule that knows what each domain cares about.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="The paradigm" id="paradigm" />
          <div className="am-prose">
            <div className="am-callout">
              <div className="am-callout-label">On-Policy Merging</div>
              <ol>
                <li>
                  Start every trainer at the anchor{' '}
                  <Tex tail=".">{T`\bar\theta`}</Tex> Trainer <Tex>i</Tex>{' '}
                  owns domain <Tex tail=",">i</Tex> with its data and
                  verifier, its own rollout workers, its own optimizer state
                  and its own hyperparameters.
                </li>
                <li>
                  Each trainer runs ordinary on-policy RL: sample rollouts
                  with its current weights <Tex tail=",">{T`\theta_i`}</Tex>{' '}
                  take a policy-gradient step, repeat.
                </li>
                <li>
                  After each step, estimate the trainer’s drift on its
                  own batch:{' '}
                  <Tex tail=".">{T`\mathrm{KL}_i=\mathbb{E}_{\xi\sim\theta_i}\big[\sum_t\log\pi_{\theta_i}(a_t\mid h_t)-\log\pi_{\bar\theta}(a_t\mid h_t)\big]`}</Tex>
                </li>
                <li>
                  When any <Tex>{T`\mathrm{KL}_i\ge\delta`}</Tex> all trainers{' '}
                  <strong>rendezvous</strong>: each sends its weights and a
                  subsample of its latest batch, and the anchor moves to{' '}
                  <Tex tail=".">{T`\bar\theta\leftarrow\bar\theta+(\sum_iF_i)^{+}\sum_iF_i(\theta_i-\bar\theta)`}</Tex>
                </li>
                <li>
                  Every trainer reloads the anchor, keeps its optimizer state,
                  and continues from step 2.
                </li>
              </ol>
            </div>
            <p>The name refers to three things that are on-policy.</p>
            <ul>
              <li>
                <strong>The data.</strong> Every gradient step of every
                trainer uses rollouts from the policy being updated. No
                trainer ever learns from another environment’s batch or
                from a teacher.
              </li>
              <li>
                <strong>The metric.</strong>{' '}
                <Tex>{T`F_i`}</Tex> is estimated from the batch the trainer
                has just collected. The Fisher is an expectation over actions
                drawn from the policy itself, and on-policy rollouts are
                exactly such draws. Computed on stale or foreign rollouts, the
                same formula is the empirical Fisher, which is a different and
                biased object
                <Ref n={16} />.
              </li>
              <li>
                <strong>The continuation.</strong> Because the merge moves
                each trainer’s policy by at most a small KL, the
                rollouts it holds remain valid for the merged model, and
                training resumes without a hand-over stage.
              </li>
            </ul>
            <p>
              By contrast, merging specialists after they have finished is
              off-policy merging: it happens long after the data was
              collected, at a point no rollout describes.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Deriving the merge" id="derivation" />
          <div className="am-prose">
            <p>
              <span className="am-runin">Notation.</span> A rollout{' '}
              <Tex>{T`\xi=(h_1,a_1,\dots,h_L,a_L)`}</Tex> in environment{' '}
              <Tex>i</Tex> has probability{' '}
              <Tex>{T`P^i_\theta(\xi)=\prod_t\pi_\theta(a_t\mid h_t)`}</Tex>{' '}
              times environment terms that do not depend on{' '}
              <Tex tail=".">{T`\theta`}</Tex> The return is{' '}
              <Tex tail=",">{T`J_i(\theta)=\mathbb{E}_{P^i_\theta}[R_i]`}</Tex>{' '}
              <Tex tail=".">{T`R_i\in[0,1]`}</Tex> Write{' '}
              <Tex>{T`s_t=\nabla\log\pi_\theta(a_t\mid h_t)`}</Tex> and{' '}
              <Tex tail=".">{T`S(\xi)=\sum_ts_t`}</Tex> In a round, trainer{' '}
              <Tex>i</Tex> moves from the anchor to{' '}
              <Tex tail=".">{T`\theta_i=\bar\theta+\Delta_i`}</Tex> Its
              trajectory Fisher is
            </p>
            <Tex display>{T`F_i=\mathbb{E}_{\xi\sim P^i_{\theta_i}}\big[S(\xi)S(\xi)^\top\big]=\mathbb{E}_{\xi\sim P^i_{\theta_i}}\Big[\sum_t s_ts_t^\top\Big],\tag{1}`}</Tex>
            <p>
              where the second form holds because the scores of different
              steps are uncorrelated. It is a sum over the tokens of a
              rollout, not an average.
            </p>
            <p>
              <span className="am-runin">The objective.</span> We want one
              model whose behaviour on each environment is as close as
              possible to that environment’s trainer. Closeness of
              behaviour over whole rollouts is the KL between rollout
              distributions, and the environment terms cancel in it:
            </p>
            <Tex display>{T`\theta^{+}\in\arg\min_\theta\sum_i\mathrm{KL}\big(P^i_{\theta_i}\,\|\,P^i_\theta\big),\qquad\mathrm{KL}\big(P^i_{\theta_i}\|P^i_\theta\big)=\mathbb{E}_{\xi\sim P^i_{\theta_i}}\Big[\sum_t\mathrm{KL}\big(\pi_{\theta_i}(\cdot\mid h_t)\,\|\,\pi_\theta(\cdot\mid h_t)\big)\Big].\tag{2}`}</Tex>
            <p>
              This is the KL barycenter of the trainers’ policies, each
              measured on its own environment. Up to a constant it is the
              negative log-likelihood of every trainer’s own rollouts
              under the merged model, so it needs nothing that the trainers
              do not already hold.
            </p>
            <p>
              <span className="am-runin">The closed form.</span> Expanding
              each term around its trainer,{' '}
              <Tex tail=",">{T`\mathrm{KL}(P^i_{\theta_i}\|P^i_\theta)=\tfrac12(\theta-\theta_i)^\top F_i(\theta-\theta_i)+O(\|\theta-\theta_i\|^3)`}</Tex>{' '}
              and setting the gradient of the sum to zero gives the OPM
              update:
            </p>
            <Tex display>{T`\boxed{\;\theta^{+}=\bar\theta+\Big(\sum_iF_i\Big)^{+}\sum_iF_i\,\Delta_i\;}\tag{3}`}</Tex>
            <p>
              Each direction of weight space is assigned to the environments
              that are sensitive to it. Where only environment <Tex>i</Tex>{' '}
              has curvature, the anchor takes all of{' '}
              <Tex tail=".">{T`\Delta_i`}</Tex> Where several do, it takes
              their curvature-weighted mean. Where none does, the movement is
              irrelevant to every environment. The residual of trainer{' '}
              <Tex>i</Tex> is
            </p>
            <Tex display>{T`\varepsilon_i=\mathrm{KL}\big(P^i_{\theta_i}\,\|\,P^i_{\theta^{+}}\big),\qquad\varepsilon_i^{(2)}=\tfrac12(\theta^{+}-\theta_i)^\top F_i(\theta^{+}-\theta_i).\tag{4}`}</Tex>
            <p>
              Equation (3) is Fisher-weighted averaging. What is specific here
              is which Fisher: of the trainer’s current policy, on its
              own environment, from rollouts sampled by that policy, summed
              over tokens. The next section shows that this choice is what
              the guarantees need.
            </p>

            <h3>The update direction of each paradigm</h3>
            <p>
              Written as the displacement of the shared model, the four
              paradigms are:
            </p>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>Paradigm</th>
                    <th>Displacement of the shared model</th>
                    <th>Signal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Multi-task RL</td>
                    <td>
                      <Tex>{T`\eta\sum_ic_i\nabla J_i(\bar\theta)`}</Tex>
                    </td>
                    <td>
                      Reward; shares <Tex>{T`c_i`}</Tex> set by the batch mix
                    </td>
                  </tr>
                  <tr>
                    <td>One-shot merge</td>
                    <td>
                      <Tex>{T`\lambda\sum_i\tau_i`}</Tex> once, with{' '}
                      <Tex>{T`\tau_i`}</Tex> the whole specialist run
                    </td>
                    <td>None at merge time</td>
                  </tr>
                  <tr>
                    <td>MOPD</td>
                    <td>
                      <Tex>{T`-\eta\sum_iF_i^{d_\theta}(\theta-\theta_i)`}</Tex>{' '}
                      plus higher orders
                    </td>
                    <td>Teacher logits on student states</td>
                  </tr>
                  <tr>
                    <td>OPM</td>
                    <td>
                      <Tex>{T`(\sum_iF_i)^{+}\sum_iF_i\Delta_i`}</Tex>
                    </td>
                    <td>
                      Reward, through each <Tex>{T`\Delta_i`}</Tex>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              MOPD’s row is gradient descent on the same quadratic that
              equation (3) solves in closed form, with the Fisher measured on
              the student’s states
              <Ref n={2} />. OPM’s row contains the same matrices, but
              they act on reward-driven progress{' '}
              <Tex>{T`\Delta_i`}</Tex> instead of on the distance to a frozen
              teacher.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="What a rendezvous preserves" id="guarantees" />
          <div className="am-prose">
            <figure>
              <GeometryFigure />
              <figcaption>
                <strong>Figure 2.</strong> Two trainers after a round. Around
                each there is a set of weights with the same policy on that
                trainer’s environment; to second order it is the affine
                subspace{' '}
                <Tex tail=".">{T`S_i=\theta_i+\operatorname{null}(F_i)`}</Tex>{' '}
                Averaging and summing the updates pick points from the
                trainers’ coordinates. Equation (3) solves for the
                intersection. The quadratic model is accurate only near the
                trainers, which is why the rendezvous has to happen before
                they drift far: the dotted curves are the true sets.
              </figcaption>
            </figure>

            <div className="am-callout">
              <div className="am-callout-label">Theorem 1 · return</div>
              <p>
                For every environment,{' '}
                <Tex tail=".">{T`J_i(\theta^{+})\ge J_i(\theta_i)-\sqrt{\varepsilon_i/2}`}</Tex>{' '}
                To first order,{' '}
                <Tex>{T`|J_i(\theta^{+})-J_i(\theta_i)|\le\sigma_i\sqrt{2\varepsilon_i^{(2)}}`}</Tex>{' '}
                with{' '}
                <Tex tail=".">{T`\sigma_i^2=\operatorname{Var}_{\theta_i}(R_i)`}</Tex>
              </p>
            </div>
            <p>
              The first statement is Pinsker applied to rollout distributions.
              The second is Cauchy–Schwarz on the policy-gradient identity{' '}
              <Tex tail=".">{T`\nabla J_i=\mathbb{E}[(R_i-J_i)S]`}</Tex> A
              round therefore improves environment <Tex>i</Tex> whenever its
              trainer’s gain exceeds{' '}
              <Tex tail=",">{T`\sqrt{\varepsilon_i/2}`}</Tex> and the merge
              rule (3) is the one that minimises the sum of the{' '}
              <Tex tail=".">{T`\varepsilon_i^{(2)}`}</Tex>
            </p>

            <div className="am-callout">
              <div className="am-callout-label">Theorem 2 · lossless rendezvous</div>
              <p>
                If the subspaces <Tex>{T`\theta_i+\operatorname{null}(F_i)`}</Tex>{' '}
                have a common point, which holds in general position when{' '}
                <Tex tail=",">{T`\sum_i\operatorname{rank}F_i\le P`}</Tex> then
                (3) returns such a point, every{' '}
                <Tex>{T`\varepsilon_i^{(2)}`}</Tex> is zero, and{' '}
                <Tex>{T`\nabla J_i(\theta_i)^\top(\theta^{+}-\theta_i)=0`}</Tex>{' '}
                for every <Tex tail=".">i</Tex> The merged model has the
                return of each trainer on its own environment up to second
                order.
              </p>
            </div>
            <p>
              The proof rests on a lemma that is specific to the on-policy
              Fisher: the policy gradient lies in its range. If{' '}
              <Tex>{T`F_iv=0`}</Tex> then{' '}
              <Tex>{T`\mathbb{E}[(v^\top S)^2]=0`}</Tex> so{' '}
              <Tex>{T`v^\top S=0`}</Tex> on every rollout, and hence{' '}
              <Tex tail=".">{T`v^\top\nabla J_i=\mathbb{E}[(R_i-J_i)\,v^\top S]=0`}</Tex>{' '}
              A displacement that the Fisher cannot see is a displacement the
              return cannot feel. Summing the updates has no such property:
              its first-order change on environment <Tex>i</Tex> is{' '}
              <Tex tail=",">{T`\nabla J_i^\top\sum_{j\ne i}\Delta_j`}</Tex>{' '}
              the interference term. Averaging keeps only a fraction{' '}
              <Tex>{T`1/n`}</Tex> of each gain.
            </p>

            <div className="am-callout">
              <div className="am-callout-label">Theorem 3 · natural-gradient limit</div>
              <p>
                If every trainer takes one natural-gradient step,{' '}
                <Tex tail=",">{T`\Delta_i=\eta F_i^{+}\nabla J_i(\bar\theta)`}</Tex>{' '}
                then{' '}
                <Tex tail=".">{T`\theta^{+}=\bar\theta+\eta\,(\sum_iF_i)^{+}\sum_i\nabla J_i(\bar\theta)`}</Tex>{' '}
                The rendezvous is a natural policy gradient step on{' '}
                <Tex>{T`\sum_iJ_i`}</Tex> under the multi-task Fisher.
              </p>
            </div>
            <p>
              By the same lemma{' '}
              <Tex tail=",">{T`F_iF_i^{+}\nabla J_i=\nabla J_i`}</Tex> and the
              result follows from (3). So OPM is not a heuristic placed on top
              of RL. In its simplest instance it is the trust-region method
              for the joint objective, computed without ever forming a joint
              batch. With several local steps and an adaptive optimizer it is
              the same construction with better local solvers.
            </p>

            <div className="am-callout">
              <div className="am-callout-label">Theorem 4 · off-policy mismatch</div>
              <p>
                The rollouts trainer <Tex>i</Tex> holds were drawn from{' '}
                <Tex tail=".">{T`P^i_{\theta_i}`}</Tex> Relative to the new
                anchor their total-variation distance is at most{' '}
                <Tex tail=",">{T`\sqrt{\varepsilon_i/2}`}</Tex> and their
                importance weights have variance{' '}
                <Tex tail=",">{T`\chi^2(P^i_{\theta^{+}}\|P^i_{\theta_i})=2\varepsilon_i^{(2)}+O(\|\theta^{+}-\theta_i\|^3)`}</Tex>{' '}
                so the effective sample size is a fraction{' '}
                <Tex>{T`1/(1+2\varepsilon_i^{(2)})`}</Tex> of the batch.
              </p>
            </div>
            <p>
              The quantity that bounds the return lost in Theorem 1 is the
              quantity that measures how stale the data has become. One
              trigger controls both. This is also the precise sense in which
              one-shot merging is off-policy: with residuals of several nats,
              the specialists’ rollouts carry no information about the
              merged model, and MOPD has to buy new ones. A further
              consequence is that the two Fishers one could use, on the
              trainer’s states or on the merged model’s states,
              differ by a term of order{' '}
              <Tex tail=".">{T`\sqrt{\varepsilon_i}`}</Tex> The rendezvous
              point satisfies MOPD’s stationarity condition up to that
              term, without student rollouts.
            </p>

            <div className="am-callout">
              <div className="am-callout-label">Proposition 5 · slow trainers</div>
              <p>
                If trainer <Tex>j</Tex> made no progress in a round and a
                lossless point exists, then{' '}
                <Tex tail=",">{T`\theta^{+}-\bar\theta\in\operatorname{null}(F_j)`}</Tex>{' '}
                and the policy on environment <Tex>j</Tex> is unchanged to
                second order.
              </p>
            </div>
            <p>
              In a mixed batch, an environment that supplies few rollouts has
              a small share of the gradient while the other environments keep
              moving its policy. In equation (3) a trainer’s weight is
              its metric, not its step count. A slow environment constrains
              the others exactly as strongly as a fast one. The same
              mechanism gives a way to protect general capabilities: add a
              trainer that never trains, whose rollouts are ordinary prompts.
            </p>

            <h3>Why the trigger is a KL and not a step count</h3>
            <p>
              By equation (2) the drift is a sum over the tokens of a
              rollout. An environment with thousand-token rollouts and one
              with hundred-thousand-token rollouts reach the same per-token
              KL at very different distances from the anchor. A fixed interval
              is therefore too frequent for the short environment or too rare
              for the long one. The trigger in step 4 of the algorithm is
              measured in the units of the theorems, and the environment with
              the longest horizon will usually be the one that fires it.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="The baselines as limits" id="limits" />
          <div className="am-prose">
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>Setting of OPM</th>
                    <th>What it becomes</th>
                    <th>What is lost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      Merge every step, identity metric, shared optimizer
                    </td>
                    <td>Multi-task RL</td>
                    <td>
                      The metric: interference appears at first order. Separate
                      trainers: environments share one clock.
                    </td>
                  </tr>
                  <tr>
                    <td>Merge every step, natural-gradient trainers</td>
                    <td>Natural policy gradient on the summed objective</td>
                    <td>Nothing; this is Theorem 3</td>
                  </tr>
                  <tr>
                    <td>Merge once at the end, identity metric</td>
                    <td>Task arithmetic</td>
                    <td>
                      The metric and the locality: residuals of several nats,
                      no bound
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Merge once at the end, Fisher on student states, solved
                      by gradient descent
                    </td>
                    <td>MOPD</td>
                    <td>
                      The reward, and the reuse of rollouts: a second stage is
                      needed
                    </td>
                  </tr>
                  <tr>
                    <td>Merge periodically, identity metric, averaged</td>
                    <td>Federated averaging, DiLoCo</td>
                    <td>
                      Correct only when all trainers see the same distribution
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              These limits fix the baselines and the ablations. Against
              multi-task RL the question is whether separate trainers with a
              metric beat a shared batch. Against one-shot merging and MOPD
              the question is whether meeting early removes the need for a
              consolidation stage. Against periodic summing and averaging the
              question is whether the metric earns its cost.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Running it on a real model" id="scale" />
          <div className="am-prose">
            <p>
              Equation (3) cannot be evaluated literally for a model with
              billions of parameters. There are four ways to approximate it,
              in increasing cost.
            </p>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>Operator</th>
                    <th>What it computes</th>
                    <th>Cost per rendezvous, per trainer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Layer Grams (RegMean)</td>
                    <td>
                      Per linear layer,{' '}
                      <Tex>{T`W^{+}=(\sum_iW_iA_i)(\sum_iA_i)^{-1}`}</Tex> with{' '}
                      <Tex>{T`A_i`}</Tex> the input Gram on the trainer’s
                      batch
                      <Ref n={7} />
                    </td>
                    <td>Forward hooks only</td>
                  </tr>
                  <tr>
                    <td>Kronecker factors (K-FAC)</td>
                    <td>
                      Adds the output-gradient covariance per layer
                      <Ref n={7} />
                    </td>
                    <td>One backward pass</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Conjugate gradient</strong>
                    </td>
                    <td>
                      Solves (3) with Fisher-vector products on a subsample of
                      the batch; no matrix is formed
                    </td>
                    <td>
                      About ten products, each one forward-mode and one
                      backward pass
                    </td>
                  </tr>
                  <tr>
                    <td>A few likelihood steps</td>
                    <td>
                      Gradient steps on objective (2) over the trainers’
                      cached batches
                    </td>
                    <td>Several optimizer steps on all batches</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              The controlled experiment below says the choice matters: the two
              layer-wise operators lost most of the benefit, and ten
              conjugate-gradient iterations recovered all of it. Our default
              is therefore conjugate gradient, with the layer-wise operators
              as an ablation, since on a model with thousands of hidden
              dimensions they may do much better than on a toy with sixteen.
            </p>
            <p>
              <span className="am-runin">The trigger.</span> The drift{' '}
              <Tex>{T`\mathrm{KL}_i`}</Tex> is the mean over the batch of the
              summed log-probability difference between the trainer and the
              anchor on the sampled tokens. It needs one extra forward pass of
              the frozen anchor on the batch, or on a subsample of it.
            </p>
            <p>
              <span className="am-runin">Rollouts in flight.</span> A rollout
              that finishes after a rendezvous was sampled from{' '}
              <Tex tail=".">{T`\theta_i`}</Tex> By Theorem 4 it can be kept,
              with or without an importance weight, as long as{' '}
              <Tex>{T`\varepsilon_i`}</Tex> is small. This matters for
              environments whose rollouts take longer than a round.
            </p>
            <p>
              <span className="am-runin">What each trainer keeps.</span> Its
              optimizer moments, its learning rate and batch size, its rollout
              servers and sandboxes, and its own software stack. The trainers
              share only a weight format. An environment can be added at any
              rendezvous by starting a new trainer from the anchor.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="A controlled signal" id="signal" />
          <div className="am-prose">
            <p>
              Before committing GPUs we checked the theorems and the paradigm
              on a small problem where returns, gradients, Fisher matrices and
              KL divergences are computed in closed form: a 704-parameter
              policy shared by four chain tasks with horizons 2, 6, 16 and 16,
              trained with exact policy gradients and Adam, ten random
              problems. It is not an LLM benchmark and decides nothing
              about LLMs. It shows that the mechanism exists and which parts
              of the design carry it. Script and results:{' '}
              <a href="/research/opm-toy/opm_toy.py">
                /research/opm-toy/opm_toy.py
              </a>
              .
            </p>
            <figure>
              <HeadToHeadFigure />
              <figcaption>
                <strong>Figure 3.</strong> One model, four tasks, equal
                optimizer steps per task. The MOPD pipeline splits its budget
                between specialists and distillation; the best of three splits
                is shown, starting from an oracle-tuned task-arithmetic point.
                OPM used 5 to 9 rendezvous per run.
              </figcaption>
            </figure>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Result at 50 steps per task unless noted</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Do the theorems hold numerically?</td>
                    <td>
                      Theorem 1’s bound held in all 5,360 trainer–merge
                      pairs. Theorem 3’s identity held to a relative
                      error below <Tex tail=".">{T`3\times10^{-4}`}</Tex>{' '}
                      First-order gain kept at a rendezvous: OPM 99.9%,
                      summing 77%, averaging 19%.
                    </td>
                  </tr>
                  <tr>
                    <td>Does the metric have to be on-policy?</td>
                    <td>
                      Fisher from the trainer’s current rollouts: 0.96.
                      From the anchor’s rollouts, one round old: 0.95.
                      From the base model’s rollouts, never refreshed:
                      0.13, worse than no metric at all.
                    </td>
                  </tr>
                  <tr>
                    <td>Which operator is enough?</td>
                    <td>
                      Average 0.48, diagonal Fisher 0.47, layer Grams 0.62,
                      K-FAC 0.71, plain sum 0.75, ten likelihood steps 0.84,
                      conjugate gradient with 3 iterations 0.82, with 10
                      iterations 0.955, exact 0.963.
                    </td>
                  </tr>
                  <tr>
                    <td>How often to meet?</td>
                    <td>
                      Every 1, 5, 10, 25, 50 steps: 0.97, 0.96, 0.93, 0.34,
                      0.08. With 100 steps per task, a KL trigger of 0.3 nats
                      reached 0.987 with 6.6 rendezvous; a fixed interval with
                      5 rendezvous reached 0.88.
                    </td>
                  </tr>
                  <tr>
                    <td>How stale is the data after a rendezvous?</td>
                    <td>
                      At an interval of 5: median residual 0.0003 nats and
                      effective sample size 99.9% for OPM, against 0.059 nats
                      and 86% for summing. Mean return lost per rendezvous:
                      0.019 against 0.080.
                    </td>
                  </tr>
                  <tr>
                    <td>What happens to a slow environment?</td>
                    <td>
                      One task given a fifth of the steps, 100 steps for the
                      others. Its final success: multi-task RL 0.03, periodic
                      sum 0.01, OPM 0.70; the base model starts at 0.25. If it
                      never trains at all: 0.01, 0.00 and 0.14.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Three of these go against a rosier version of the story and
              shape the plan. The inexpensive layer-wise operators did worse
              than simply summing the updates, so the metric only pays when it
              is computed well. A stalled task was protected only in part
              (0.14 against a starting 0.25): Proposition 5 holds per round
              and small losses accumulate. And the paradigm fails abruptly
              when trainers meet too rarely; nothing about it is forgiving of
              a loose trigger.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="The experiment that decides it" id="experiments" />
          <div className="am-prose">
            <p>
              The claim is about multi-task RL post-training, so it has to be
              tested on the recipe frontier models use. We read the public
              reports for which domains they train with RL and how they
              combine them.
            </p>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>RL domain</th>
                    <th>
                      Public recipes that train on it
                      <Ref n={18} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Mathematics</td>
                    <td>DeepSeek, MiMo, Nemotron, GLM, Kimi, Solar Open, INTELLECT-3</td>
                  </tr>
                  <tr>
                    <td>Competitive code</td>
                    <td>DeepSeek, Nemotron, GLM, Kimi, Solar Open, INTELLECT-3</td>
                  </tr>
                  <tr>
                    <td>Software-engineering agent</td>
                    <td>DeepSeek, MiMo, Nemotron Ultra, GLM, Kimi, MiniMax, Solar Open, INTELLECT-3</td>
                  </tr>
                  <tr>
                    <td>Science questions</td>
                    <td>Nemotron, GLM, Kimi, Solar Open, INTELLECT-3</td>
                  </tr>
                  <tr>
                    <td>Logic and puzzles</td>
                    <td>DeepSeek-V3.2, Kimi K2, INTELLECT-3</td>
                  </tr>
                  <tr>
                    <td>Instruction following</td>
                    <td>DeepSeek-V4, Nemotron, GLM-4.5, Kimi K2, Qwen3, Solar Open</td>
                  </tr>
                  <tr>
                    <td>Tool and function calling</td>
                    <td>MiMo, Nemotron, GLM-4.5, Qwen3, Solar Open</td>
                  </tr>
                  <tr>
                    <td>Search and deep research</td>
                    <td>DeepSeek-V3.2, MiMo, Nemotron Ultra, GLM, MiniMax, Solar Open, INTELLECT-3</td>
                  </tr>
                  <tr>
                    <td>Safety</td>
                    <td>MiMo, Kimi K2, Nemotron Ultra, Solar Open</td>
                  </tr>
                  <tr>
                    <td>Long context</td>
                    <td>Nemotron</td>
                  </tr>
                  <tr>
                    <td>Computer use</td>
                    <td>None found as an RL domain in a public recipe</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              The recipes also agree on the procedure. Until 2025 the
              domains were trained in one mixed or staged GRPO run. The 2026
              reports train ten to twelve specialists, each with supervised
              warm-up and then GRPO with sixteen rollouts per prompt, and fuse
              them by multi-teacher on-policy distillation with a reverse KL
              <Ref n={4} />
              <Ref n={18} />.
            </p>
            <p>
              Two public studies already compare three of the four paradigms
              on Qwen3 with open data, one built on slime and one on verl
              <Ref n={5} />. We take the second one’s setting without
              change, so that the three baselines are reproductions of
              published arms with published numbers, and OPM is the only new
              arm. Its five domains are the common core of the table above,
              its training data, evaluation sets and checkpoints are
              released, and it needs no SFT stage.
            </p>

            <h3>Stage 1: the public five-domain setting</h3>
            <div className="am-table">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <strong>Models</strong>
                    </td>
                    <td>
                      Qwen3-4B-Instruct-2507 and Qwen3-8B, non-thinking mode.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Domains and data</strong>
                    </td>
                    <td>
                      Math: Polaris, hard subset, 38k problems. Science:
                      OpenScienceReasoning-2, hard subset, 50k. Code:
                      CodeContests and Open-R1 Codeforces, 19k. Instruction
                      following: WildChat prompts with Open-Instruct
                      constraints, 17k. Agent: WorkplaceAssistant tool-calling
                      tasks, 10k.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>RL recipe</strong>
                    </td>
                    <td>
                      GRPO in verl. 128 prompts with 16 rollouts each per
                      step, learning rate <Tex tail=",">{T`10^{-6}`}</Tex>{' '}
                      prompts up to 5,120 tokens, responses up to 16,384,
                      temperature 1.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Published budgets</strong>
                    </td>
                    <td>
                      Specialists: 300 steps per domain. Mixed RL: 800 steps
                      on a 25 / 22 / 22 / 19 / 12 mix of math, science, code,
                      instruction following and agent. MOPD: 300 steps, 264
                      prompts with 4 rollouts each.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Evaluation</strong>
                    </td>
                    <td>
                      AIME 2025 and 2026, GPQA-Diamond, LiveCodeBench v5 and
                      v6, IFEval, IFBench, BFCL v3. Mean over 32 samples per
                      prompt at temperature 0.6. A held-out suite for
                      capabilities no arm trains on.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>The published averages over the eight benchmarks are:</p>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th className="am-num">Base</th>
                    <th className="am-num">Specialists</th>
                    <th className="am-num">Task arithmetic</th>
                    <th className="am-num">Mixed RL</th>
                    <th className="am-num">MOPD</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Qwen3-4B</td>
                    <td className="am-num">57.0</td>
                    <td className="am-num">63.9</td>
                    <td className="am-num">63.7</td>
                    <td className="am-num">62.3</td>
                    <td className="am-num">63.3</td>
                  </tr>
                  <tr>
                    <td>Qwen3-8B</td>
                    <td className="am-num">42.0</td>
                    <td className="am-num">53.8</td>
                    <td className="am-num">53.7</td>
                    <td className="am-num">54.6</td>
                    <td className="am-num">53.2</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              This sets an honest bar. On average the three baselines are
              within 1.4 points of each other, and task arithmetic already
              sits next to the specialists. The average hides gaps on single
              benchmarks: on IFBench at 4B, task arithmetic scores 41.0 and
              MOPD 47.3 against the specialist’s 49.0. In this stage
              OPM cannot win by much on the mean. What it has to show is that
              it matches the best baseline on the mean, closes the
              per-benchmark gaps, and does so with no fusion stage and no
              merge coefficient to tune.
            </p>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Arm</th>
                    <th>Definition</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>A1</strong>
                    </td>
                    <td>Multi-task RL</td>
                    <td>
                      Mixed RL as published (800 steps), and at 1,500 steps so
                      that it consumes the same rollouts as five 300-step
                      trainers.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>A2</strong>
                    </td>
                    <td>Vanilla merge</td>
                    <td>
                      Five specialists, then task arithmetic with the
                      coefficient swept, and TIES.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>A3</strong>
                    </td>
                    <td>MOPD</td>
                    <td>
                      The same specialists, then 300 steps of sampled-token
                      on-policy distillation with teachers routed by domain.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>A4</strong>
                    </td>
                    <td>On-Policy Merging</td>
                    <td>
                      Five trainers, each running the per-domain recipe
                      unchanged for 300 local steps, with KL-triggered
                      rendezvous and ten conjugate-gradient iterations on a
                      quarter of each batch.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>B1–B5</strong>
                    </td>
                    <td>Ablations of A4</td>
                    <td>
                      Summed updates at each rendezvous; averaged updates;
                      layer Grams and K-FAC in place of conjugate gradient;
                      fixed interval in place of the trigger; metric from
                      rollouts one round stale.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>Stage 2: where the baselines are known to bend</h3>
            <p>
              The ties in Stage 1 come from a mild regime: five domains, 300
              steps, small models. Published evidence says each baseline
              degrades along a specific axis, and that is where a new paradigm
              has to separate.
            </p>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>Axis</th>
                    <th>Change</th>
                    <th>Why a baseline should bend</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Longer RL</strong>
                    </td>
                    <td>300 to 1,000 steps per domain</td>
                    <td>
                      Specialists move further apart. Task arithmetic then
                      needs a smaller coefficient; at a coefficient of one,
                      outputs grow from about 2k to 7k tokens and reasoning
                      traces leak into two thirds of answers
                      <Ref n={5} />.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>More domains</strong>
                    </td>
                    <td>
                      Five to ten: add logic puzzles, structured outputs,
                      search, safety, and a software-engineering agent with
                      rollouts of up to 50 turns
                    </td>
                    <td>
                      Frontier recipes use more than ten specialists
                      <Ref n={4} />. In a mixed batch each domain’s
                      share shrinks, and summed task vectors accumulate shared
                      drift once per specialist.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Larger model</strong>
                    </td>
                    <td>
                      Qwen3-30B-A3B with math, instruction-following and
                      software-engineering teachers, using the published
                      teacher settings (GRPO, 8 rollouts per prompt, responses
                      up to 32k tokens, 64k for software engineering)
                    </td>
                    <td>
                      The setting in which task arithmetic was reported at
                      0.86 against MOPD’s 0.94 on a normalised score
                      <Ref n={3} />.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Uneven latency</strong>
                    </td>
                    <td>
                      Add the released Xiaomi agentic tasks, whose rollouts
                      are sandboxed and multi-turn, and cut their worker pool
                      to a fifth
                    </td>
                    <td>
                      A shared batch waits for the slow domain or lets its
                      share drift
                      <Ref n={17} />.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>An open data recipe</h3>
            <p>
              Every domain uses data that is public today together with its
              verifier, so the whole comparison can be rerun by anyone
              <Ref n={19} />. Stage 1 takes the released training rows of the
              reference study as they are. Stage 2 adds domains from the two
              labs that have released RL tasks with verifiers, NVIDIA and
              Xiaomi, and from open benchmarks built for RL.
            </p>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>Open source of tasks</th>
                    <th className="am-num">Size</th>
                    <th>Verifier</th>
                    <th>Used in</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Math</td>
                    <td>LLM-Fusion-Train, math split (Polaris, hard subset)</td>
                    <td className="am-num">38k</td>
                    <td>Answer match</td>
                    <td>Stage 1</td>
                  </tr>
                  <tr>
                    <td>Science</td>
                    <td>LLM-Fusion-Train, science split (OpenScienceReasoning-2)</td>
                    <td className="am-num">50k</td>
                    <td>Multiple-choice match</td>
                    <td>Stage 1</td>
                  </tr>
                  <tr>
                    <td>Code</td>
                    <td>LLM-Fusion-Train, code split (CodeContests, Open-R1 Codeforces)</td>
                    <td className="am-num">19k</td>
                    <td>Unit tests in a sandbox</td>
                    <td>Stage 1</td>
                  </tr>
                  <tr>
                    <td>Instruction following</td>
                    <td>LLM-Fusion-Train, IF split (WildChat with Open-Instruct constraints)</td>
                    <td className="am-num">17k</td>
                    <td>Rule checkers</td>
                    <td>Stage 1</td>
                  </tr>
                  <tr>
                    <td>Tool use</td>
                    <td>LLM-Fusion-Train, agent split (Nemotron workplace assistant)</td>
                    <td className="am-num">10k</td>
                    <td>Tool-call and database-state checks</td>
                    <td>Stage 1</td>
                  </tr>
                  <tr>
                    <td>Logic</td>
                    <td>MiniMaxAI/SynLogic</td>
                    <td className="am-num">16k easy, 33k hard</td>
                    <td>Rule verifiers</td>
                    <td>Stage 2</td>
                  </tr>
                  <tr>
                    <td>Structured output</td>
                    <td>nvidia/Nemotron-RL-instruction_following-structured_outputs</td>
                    <td className="am-num">10k</td>
                    <td>Schema match in NeMo Gym</td>
                    <td>Stage 2</td>
                  </tr>
                  <tr>
                    <td>Search</td>
                    <td>nvidia/Nemotron-RL-knowledge-web_search-mcqa</td>
                    <td className="am-num">3k</td>
                    <td>Answer match in NeMo Gym</td>
                    <td>Stage 2</td>
                  </tr>
                  <tr>
                    <td>Software-engineering agent</td>
                    <td>R2E-Gym/R2E-Gym-Subset, or the code split of XiaomiMiMo/MiMo-V2.6-RL-oss</td>
                    <td className="am-num">4.6k, or 2.6k</td>
                    <td>Executable tests in Docker</td>
                    <td>Stage 2</td>
                  </tr>
                  <tr>
                    <td>Knowledge work and terminal agent</td>
                    <td>XiaomiMiMo/MiMo-V2.6-RL-oss, general split</td>
                    <td className="am-num">1k environments</td>
                    <td>verify.py per environment, rules and rubric</td>
                    <td>Stage 2</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              The Xiaomi release is the only one from a frontier recipe that
              contains long-horizon agentic tasks with their environments:
              software engineering, security, knowledge work, web development
              and composition, about 7,700 tasks with Docker images. It is
              what the uneven-latency axis of Stage 2 uses. The reference
              study also released its specialists and its merged, mixed and
              distilled models at both sizes, which makes the first phase
              below possible without training anything.
            </p>

            <h3>Budget rule and logging</h3>
            <p>
              Two matched comparisons are reported. In the first, every arm
              consumes the same number of rollouts per domain, counting the
              student rollouts of A3. In the second, every arm gets the same
              GPU-hours, counting teacher scoring in A3 and merge computation
              in A4. All arms use the same verl code path, data and
              verifiers.
            </p>
            <ul>
              <li>
                Per benchmark: the score normalised between the base model and
                that domain’s specialist. The mean and the worst
                benchmark are the primary metrics.
              </li>
              <li>
                At every rendezvous: each trainer’s drift{' '}
                <Tex tail=",">{T`\mathrm{KL}_i`}</Tex> its residual{' '}
                <Tex tail=",">{T`\varepsilon_i`}</Tex> the ratio of the
                measured residual to its quadratic prediction, the effective
                sample size of the batch under the new anchor, and a quick
                evaluation of trainer and anchor. These test Theorems 1, 2 and
                4 directly.
              </li>
              <li>
                Drift nobody asked for: response length, reasoning-trace
                leakage, entropy, and the held-out suite.
              </li>
            </ul>

            <h3>Hypotheses</h3>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Prediction</th>
                    <th>Would refute it</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>H1</strong>
                    </td>
                    <td>
                      Stage 1: A4’s mean is within seed noise of the
                      best of A1 to A3, and its worst benchmark is closer to
                      the specialist than A2’s.
                    </td>
                    <td>
                      A4 below the best baseline on the mean by more than seed
                      noise.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>H2</strong>
                    </td>
                    <td>
                      No interference tax: at equal rollouts, A4 tracks each
                      specialist’s curve on its own domain, while A1
                      falls behind on the domains with the smallest share.
                    </td>
                    <td>A1 at or above A4 on every domain.</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>H3</strong>
                    </td>
                    <td>
                      The metric pays: A4 is ahead of the summed and averaged
                      ablations, and the stale-metric ablation is behind A4.
                    </td>
                    <td>
                      Summing matches A4. The simpler loop is then the method,
                      and the metric is not needed at this scale.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>H4</strong>
                    </td>
                    <td>
                      Stage 2: the gap between A4 and A2 grows with steps and
                      with the number of domains; the gap between A4 and A1
                      grows with the number of domains and with latency skew.
                    </td>
                    <td>The gaps stay flat along every axis.</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>H5</strong>
                    </td>
                    <td>
                      MOPD stops at its teachers; with twice the budget A3
                      does not improve and A4 does.
                    </td>
                    <td>A3 exceeds its teachers.</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>H6</strong>
                    </td>
                    <td>
                      The domain with the longest responses fires the trigger
                      most often although its per-token KL is not the largest,
                      and effective sample size after a rendezvous follows{' '}
                      <Tex tail=".">{T`1/(1+2\varepsilon_i)`}</Tex>
                    </td>
                    <td>
                      Per-token and trajectory KL rank the domains the same
                      way, or effective sample size collapses at small
                      residuals.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>Phases and gates</h3>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>Phase</th>
                    <th>Content</th>
                    <th>Gate to continue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>0a</strong>
                    </td>
                    <td>
                      No training. Download the released 300-step specialists
                      and their training rows. Sample rollouts from each
                      specialist on its own domain; compute the cross-KL
                      matrix and the ratio of residual to quadratic
                      prediction; merge once with conjugate gradient and
                      evaluate against the released task-arithmetic, mixed-RL
                      and MOPD models on the released test sets.
                    </td>
                    <td>
                      The conjugate-gradient merge is at or above task
                      arithmetic on the mean and recovers part of the
                      instruction-following gap. If it is clearly below, the
                      quadratic model does not hold at 300 steps, and
                      everything rests on meeting earlier.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>0b</strong>
                    </td>
                    <td>
                      Retrain the five 4B specialists as published, saving
                      checkpoints and batches every 10 steps. Offline, merge
                      the step-<Tex>k</Tex> checkpoints with each operator for{' '}
                      <Tex>k</Tex> from 10 to 300 and evaluate. This is one
                      round of OPM at every interval, for the cost of forward
                      passes.
                    </td>
                    <td>
                      There is an interval at which the conjugate-gradient
                      merge keeps more of every specialist’s gain than
                      summing does. It also gives the drift per step in each
                      domain, which fixes the usable{' '}
                      <Tex tail=".">{T`\delta`}</Tex>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>1</strong>
                    </td>
                    <td>
                      Build the coordinator. Pilot the full loop on two
                      domains for 150 steps: A1, A4 and the summed ablation.
                    </td>
                    <td>
                      Two trainers on the same domain match one trainer with
                      twice the batch. A4 at or above A1.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>2</strong>
                    </td>
                    <td>Stage 1 in full at 4B and 8B, three seeds.</td>
                    <td>H1 to H3 evaluated.</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>3</strong>
                    </td>
                    <td>
                      Stage 2, one axis at a time, starting with longer RL,
                      which reuses the Stage 1 trainers.
                    </td>
                    <td>H4 to H6 evaluated.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              <span className="am-runin">Compute.</span> The published study
              reports, for the 4B model on its GPUs, about 5,200 GPU-hours for
              the five specialists, 3,000 for the 800-step mixed run and 740
              for the MOPD stage
              <Ref n={5} />. A4 costs the specialists’ budget plus the
              merge overhead, which Phase 0 measures. One seed of Stage 1 at
              4B is therefore of the order of 15,000 of those GPU-hours across
              the four arms, with the specialists shared between A2 and A3.
              Phase 0a needs only inference and a few hundred Fisher-vector
              products on released models, and is the cheapest run that can
              end the project.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Where it can fail" id="risks" />
          <div className="am-prose">
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>Strength</th>
                    <th>Cost or risk</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      No consolidation stage; reward is used throughout, so
                      there is no teacher ceiling.
                    </td>
                    <td>
                      One model copy and one optimizer state per environment,
                      and GPUs split across trainers.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Environments are decoupled: separate clocks,
                      hyperparameters and software.
                    </td>
                    <td>
                      Transfer between environments happens only at a
                      rendezvous. If the domains help each other at every
                      step, a shared batch may be better.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      The merge keeps each trainer’s gain when the
                      metric is exact.
                    </td>
                    <td>
                      The metric has to be approximated. In the toy the cheap
                      approximations were worse than no metric.
                    </td>
                  </tr>
                  <tr>
                    <td>A slow environment is protected.</td>
                    <td>
                      Protection is per round and partial; a long outage still
                      costs something.
                    </td>
                  </tr>
                  <tr>
                    <td>The trigger adapts to horizon.</td>
                    <td>
                      One more hyperparameter, and failure is abrupt when it
                      is too loose.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              <span className="am-runin">The most likely way to be wrong.</span>{' '}
              In a model with billions of parameters, specialists may barely
              interfere. Published task vectors of RL specialists are sparse
              and nearly orthogonal, and task arithmetic at 4B already sits
              within 0.2 points of the specialists on average
              <Ref n={5} />. If that holds along every axis of Stage 2,
              summing the updates at each rendezvous will match OPM, H3
              fails, and the right conclusion is the simpler loop without a
              metric. That would still be a result: periodic task
              arithmetic with a KL trigger, as a replacement for mixed
              batches. The second most likely is that the benefit of separate
              trainers is real but smaller than the cost of fragmenting GPUs,
              which the wall-clock comparison will show.
            </p>
            <p>
              <span className="am-runin">The scale of the trigger is unknown.</span>{' '}
              In the toy a budget of 0.1 to 0.3 nats per rollout worked.
              Responses in the public recipe run to thousands of tokens, and a
              trajectory KL is a sum over them, so a few GRPO steps may
              already exceed that budget. The closed form needs the quadratic
              model to hold, which depends on per-token changes and may
              tolerate many nats; the return bound of Theorem 1 does not.
              Phase 0 measures both, and{' '}
              <Tex>{T`\delta`}</Tex> will be set from the measured ratio of
              residual to quadratic prediction, not from the toy.
            </p>
            <p>
              <span className="am-runin">What the analysis does not cover.</span>{' '}
              The theorems are per round. They do not give a convergence rate
              for the whole procedure, and they treat the Fisher as known,
              while in practice it is estimated from a few dozen rollouts. The
              base model does not appear in objective (2), so retention of
              capabilities outside the trained domains rests on the untested
              anchor-trainer idea.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Related work" id="related" />
          <div className="am-prose">
            <p>
              <span className="am-runin">The loop.</span> Divide-and-Conquer
              RL trains one policy per context, periodically distils them into
              a central policy by maximum likelihood on their own
              trajectories, and resets them to it
              <Ref n={1} />. That is objective (2) solved by gradient descent
              at a fixed interval. OPM replaces the distillation by its closed
              form, adds the trigger, and supplies the per-round guarantees.
              Co-evolving policy distillation runs per-domain GRPO branches
              that distil into each other and merges their weights once at the
              end
              <Ref n={9} />.
            </p>
            <p>
              <span className="am-runin">The merge rule.</span>{' '}
              Fisher-weighted averaging comes from the supervised merging
              literature
              <Ref n={6} />, where it is applied once to finished models.
              MaTS solves the same system with conjugate gradient and
              Kronecker factors
              <Ref n={7} />. FedFish derives a diagonal Fisher average from
              the KL between client and server functions and applies it every
              round, in supervised federated learning
              <Ref n={8} />. Liu et al. show that MOPD is Fisher merging to
              second order
              <Ref n={2} />. None of these uses the on-policy trajectory
              Fisher inside RL, and the diagonal form is the one the toy
              found useless.
            </p>
            <p>
              <span className="am-runin">The limits.</span> Federated natural
              policy gradient averages client Fisher matrices and gradients at
              the server
              <Ref n={10} />; Theorem 3 identifies it as OPM with one
              natural-gradient step per round. Periodic averaging of local
              trainers is local SGD and DiLoCo
              <Ref n={11} />, and iterated tune-and-merge is known to beat a
              single merge in supervised settings
              <Ref n={11} />. Federated GRPO with plain averaging did worse
              than centralised training
              <Ref n={12} />, which is what the averaging row of the toy
              predicts.
            </p>
            <p>
              <span className="am-runin">The trigger.</span> Synchronising
              when models drift, instead of on a clock, has been used with
              parameter distance in supervised decentralised training, and KL
              penalties appear in federated policy gradient
              <Ref n={14} />. We found no use of a trajectory-level KL to
              trigger a weight merge. The bound in Theorem 1 is the standard
              trust-region argument
              <Ref n={15} /> applied to a merge residual.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Appendix: proofs and system sketch" id="appendix" />
          <div className="am-prose">
            <h3>A. Equations (1) to (3)</h3>
            <p>
              For <Tex tail=",">{T`t<t'`}</Tex>{' '}
              <Tex>{T`\mathbb{E}[s_ts_{t'}^\top]=\mathbb{E}\big[s_t\,\mathbb{E}[s_{t'}\mid h_{t'}]^\top\big]=0`}</Tex>{' '}
              because the score has zero mean given its prefix; this gives the
              second form of (1). The log-ratio of two rollout probabilities
              in the same environment is{' '}
              <Tex tail=",">{T`\sum_t\log\pi_{\theta_i}(a_t\mid h_t)-\log\pi_\theta(a_t\mid h_t)`}</Tex>{' '}
              and taking its expectation under{' '}
              <Tex>{T`P^i_{\theta_i}`}</Tex> gives the chain rule in (2). The
              Hessian of a KL divergence at its minimum is the Fisher matrix
              of the first argument, which gives the quadratic form, and the
              normal equations{' '}
              <Tex>{T`\sum_iF_i(\theta-\theta_i)=0`}</Tex> give (3).
            </p>

            <h3>B. Theorem 1</h3>
            <p>
              <Tex>{T`J_i`}</Tex> is the expectation of a function with values
              in <Tex tail=",">{T`[0,1]`}</Tex> so{' '}
              <Tex tail=".">{T`|J_i(\theta^{+})-J_i(\theta_i)|\le\mathrm{TV}(P^i_{\theta^{+}},P^i_{\theta_i})\le\sqrt{\varepsilon_i/2}`}</Tex>{' '}
              For the first-order statement,{' '}
              <Tex>{T`\nabla J_i(\theta_i)^\top d=\mathbb{E}[(R_i-J_i)\,d^\top S]`}</Tex>{' '}
              and Cauchy–Schwarz gives{' '}
              <Tex tail=".">{T`|\nabla J_i^\top d|\le\sigma_i\sqrt{d^\top F_id}`}</Tex>
            </p>

            <h3>C. Theorem 2 and Proposition 5</h3>
            <p>
              The objective{' '}
              <Tex>{T`\tfrac12\sum_i(\theta-\theta_i)^\top F_i(\theta-\theta_i)`}</Tex>{' '}
              is zero exactly on{' '}
              <Tex tail=",">{T`\bigcap_i(\theta_i+\operatorname{null}F_i)`}</Tex>{' '}
              so when that set is non-empty every minimiser lies in it. Then{' '}
              <Tex tail=",">{T`\theta^{+}-\theta_i\in\operatorname{null}F_i`}</Tex>{' '}
              and by the lemma in the main text{' '}
              <Tex>{T`\nabla J_i(\theta_i)`}</Tex> is orthogonal to it.
              Proposition 5 is the case{' '}
              <Tex tail=".">{T`\theta_j=\bar\theta`}</Tex> The general-position
              statement is the usual count: an affine subspace of codimension{' '}
              <Tex>{T`r_i`}</Tex> is <Tex>{T`r_i`}</Tex> linear equations, and{' '}
              <Tex>{T`\sum_ir_i\le P`}</Tex> equations in <Tex>P</Tex>{' '}
              unknowns are generically solvable.
            </p>

            <h3>D. Theorems 3 and 4</h3>
            <p>
              For Theorem 3 substitute{' '}
              <Tex>{T`\Delta_i=\eta F_i^{+}\nabla J_i`}</Tex> into (3) and use{' '}
              <Tex tail=",">{T`F_iF_i^{+}\nabla J_i=\nabla J_i`}</Tex> which
              holds because <Tex>{T`\nabla J_i`}</Tex> is in the range of{' '}
              <Tex tail=".">{T`F_i`}</Tex> With the Fisher evaluated at the
              trainer instead of the anchor the identity holds up to{' '}
              <Tex tail=".">{T`O(\eta^2)`}</Tex> For Theorem 4 the importance
              weight is{' '}
              <Tex tail=";">{T`w=\exp\big(\sum_t\log\pi_{\theta^{+}}-\log\pi_{\theta_i}\big)=1+d^\top S+O(\|d\|^2)`}</Tex>{' '}
              its variance is{' '}
              <Tex tail=",">{T`\mathbb{E}[(d^\top S)^2]=d^\top F_id=2\varepsilon_i^{(2)}`}</Tex>{' '}
              and the effective sample size of <Tex>N</Tex> weighted samples
              is{' '}
              <Tex tail=".">{T`N/(1+\operatorname{Var}w)`}</Tex>
            </p>

            <h3>E. System sketch</h3>
            <ul>
              <li>
                <strong>Trainer hook.</strong> After each optimizer step, run
                the frozen anchor on a subsample of the batch and update{' '}
                <Tex tail=".">{T`\mathrm{KL}_i`}</Tex> When the coordinator
                calls a rendezvous, write the weights and the cached
                subsample.
              </li>
              <li>
                <strong>Coordinator.</strong> Polls the drifts; on a trigger,
                loads the trainers’ weights on a merge node and runs
                conjugate gradient on{' '}
                <Tex tail=",">{T`(\sum_iF_i+\mu I)\,x=\sum_iF_i\Delta_i`}</Tex>{' '}
                starting from the sum of the updates. Each product{' '}
                <Tex>{T`F_iv`}</Tex> is a forward-mode pass for the change in
                logits, a multiplication by{' '}
                <Tex tail=",">{T`\operatorname{diag}(\pi)-\pi\pi^\top`}</Tex>{' '}
                and a backward pass, on trainer <Tex>i</Tex>’s cached
                tokens.
              </li>
              <li>
                <strong>Safeguard.</strong> After the solve, evaluate{' '}
                <Tex>{T`\varepsilon_i`}</Tex> on the cached batches. If any
                exceeds a ceiling, move only part of the way from the old
                anchor and lower <Tex>{T`\delta`}</Tex> for the next round.
              </li>
              <li>
                <strong>Baseline parity.</strong> A1 uses the same rollout
                servers, sandboxes and GRPO code as the trainers of A4, with
                one buffer in place of three.
              </li>
            </ul>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="References" id="references" />
          <div className="am-prose">
            <p style={{ fontSize: '13.5px' }}>
              Papers from 2026 were retrieved by automated search on 4
              November 2026 and read at abstract or full-text level; numbers
              quoted from them should be checked against the sources.
            </p>
            <ol className="am-refs">
              <li id="ref-1">
                Ghosh et al. Divide-and-Conquer Reinforcement Learning.
                arXiv:1711.09874.
              </li>
              <li id="ref-2">
                Liu et al. A Fisher-Geometric View of Multi-Teacher On-Policy
                Distillation. arXiv:2610.26525.
              </li>
              <li id="ref-3">
                Ma et al. MOPD: Multi-Teacher On-Policy Distillation for
                Capability Integration in LLM Post-Training.
                arXiv:2606.30406.
              </li>
              <li id="ref-4">
                DeepSeek-AI. DeepSeek-V4. arXiv:2606.19348. DeepSeek-V3.2.
                arXiv:2512.02556.
              </li>
              <li id="ref-5">
                Wang et al. To Mix or To Merge. arXiv:2602.12566. Wu et al.
                Consolidating RLVR Capabilities Across Domains.
                arXiv:2608.27409.
              </li>
              <li id="ref-6">
                Matena and Raffel. Merging Models with Fisher-Weighted
                Averaging. arXiv:2111.09832. Daheim et al. Model Merging by
                Uncertainty-Based Gradient Matching. arXiv:2310.12808.
              </li>
              <li id="ref-7">
                Tam et al. Merging by Matching Models in Task Parameter
                Subspaces. arXiv:2312.04339. Jin et al. Dataless Knowledge
                Fusion by Merging Weights of Language Models (RegMean).
                arXiv:2212.09849.
              </li>
              <li id="ref-8">
                Dhawan et al. Leveraging Function Space Aggregation for
                Federated Learning at Scale (FedFish). arXiv:2311.10291.
              </li>
              <li id="ref-9">
                Gu et al. Co-Evolving Policy Distillation. arXiv:2604.27083.
              </li>
              <li id="ref-10">
                Lan et al. Federated natural policy gradient with ADMM.
                arXiv:2310.19807. Yang et al. Federated Natural Policy
                Gradient and Actor Critic Methods for Multi-task
                Reinforcement Learning. arXiv:2311.00201.
              </li>
              <li id="ref-11">
                Douillard et al. DiLoCo. arXiv:2311.08105. Zhou et al. ATM:
                alternating tuning and merging. arXiv:2411.03055. Tao et al.
                Task Arithmetic Through the Lens of One-Shot Federated
                Learning. arXiv:2411.18607.
              </li>
              <li id="ref-12">Guo et al. Fed-GRPO. arXiv:2610.11502.</li>
              <li id="ref-13">UI-TARS-2. arXiv:2509.02544.</li>
              <li id="ref-14">
                Kamp et al. Efficient Decentralized Deep Learning by Dynamic
                Model Averaging. arXiv:1807.03210. Xie et al. FedKL.
                arXiv:2204.08125.
              </li>
              <li id="ref-15">
                Schulman et al. Trust Region Policy Optimization.
                arXiv:1502.05477. Dupuis et al. Path-Space Information Bounds.
                arXiv:1503.05136.
              </li>
              <li id="ref-16">
                Kunstner et al. Limitations of the Empirical Fisher
                Approximation for Natural Gradient Descent. arXiv:1905.12558.
              </li>
              <li id="ref-17">
                Issues and pull requests on environment imbalance in mixed
                batches: tinker-cookbook #822, prime-rl #2072, miles #3947,
                verl #8466.
              </li>
              <li id="ref-18">
                Recipes surveyed for RL domains: DeepSeek-V3.2
                (arXiv:2512.02556) and V4 (arXiv:2606.19348); MiMo-V2-Flash
                (arXiv:2601.02780); Nemotron 3 Nano (arXiv:2512.20848) and
                Ultra (arXiv:2606.15007); GLM-4.5 (arXiv:2508.06471) and
                GLM-5 (arXiv:2602.15763); Kimi K2 (arXiv:2507.20534) and K2.5
                (arXiv:2602.02276); MiniMax-M2 (arXiv:2605.26494); Qwen3
                (arXiv:2505.09388); Solar Open 2 (arXiv:2607.20062);
                INTELLECT-3 (arXiv:2512.16144).
              </li>
              <li id="ref-19">
                Open RL data and code used in the plan, as found on 4 November
                2026: Siye01/LLM-Fusion-Train and LLM-Fusion-Test with the
                Di-viner/LLM-Fusion code and released checkpoints;
                XiaomiMiMo/MiMo-V2.6-RL-oss; the nvidia/Nemotron-RL datasets
                and NVIDIA-NeMo/Gym; MiniMaxAI/SynLogic;
                R2E-Gym/R2E-Gym-Subset; PrimeIntellect/INTELLECT-3-RL.
              </li>
            </ol>
          </div>
        </div>
      </article>
    </Container>
  )
}
