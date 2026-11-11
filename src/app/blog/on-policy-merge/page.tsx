import { type Metadata } from 'next'
import type { ReactNode } from 'react'

import { Container } from '@/components/Container'

import './_styles/merge.css'
import './_styles/algorithm.css'
import './_styles/residual.css'
import './_styles/system.css'

import Tex from './_components/Tex'
import SectionTitle from './_components/SectionTitle'
import { ParadigmFigure } from './_components/Figures'
import WeightSpace3D from './_components/WeightSpace3D'
import ResidualChart from './_components/ResidualChart'
import SystemDiagram from './_components/SystemDiagram'
import Landscape3D from './_components/Landscape3D'
import { Cite, CiteT } from './_components/Cite'
import { Placeholder, Pending } from './_components/Placeholder'
import Appendix from './_components/Appendix'
import CopyBib from './_components/CopyBib'
import { Algorithm, Line, K } from './_components/Algorithm'
import ReduceMotion from './_components/ReduceMotion'
import SideToc, { type TocItem } from './_components/SideToc'
import SidenoteLayout from './_components/SidenoteLayout'

const T = String.raw

/** Brown bold for the post's key concepts and claims. */
function Key({ children }: { children: ReactNode }) {
  return <strong className="am-key">{children}</strong>
}

export const metadata: Metadata = {
  title: 'On-Policy Merge',
  description:
    'One on-policy RL trainer per domain, merged during training at the point closest in KL to every trainer on its own fresh rollouts. The closed form, why it decouples domains and what it gives up, the compute cost of a merge at 9B, and results against multi-task RL, merging after training and multi-teacher on-policy distillation.',
}

const POST = {
  title: 'On-Policy Merge',
  subtitle:
    'Frontier models are post-trained with RL on many domains, and each current way of combining those domains has a drawback. Mixed batches let domains interfere, merging finished specialists loses part of what they learned, and multi-teacher distillation needs a second round of rollouts and at best matches its teachers. On-Policy Merge gives each domain its own on-policy trainer and, whenever one trainer has drifted a set KL distance from the shared anchor, merges them during training at the point closest in KL to every trainer on its own fresh rollouts. We derive the merge, state what it guarantees and what it gives up, measure its compute cost at 9B, and test it.',
  author: 'Bowen Wang',
  date: 'Nov 5, 2026',
  reading: 'Research · 35 min read',
}

// Sections for the table of contents: one entry per <SectionTitle id=...>
// (the appendix has one), plus the introduction above the first of them.
const TOC: TocItem[] = [
  { label: 'Introduction', href: '#introduction' },
  { label: 'Five ways to get one model', href: '#map' },
  { label: 'On-Policy Merge', href: '#method' },
  { label: 'What the merge guarantees, and what it costs', href: '#theory' },
  { label: 'System design', href: '#system' },
  { label: 'Computing the merge at scale', href: '#engineering' },
  { label: 'A first test on released specialists', href: '#oneshot' },
  { label: 'Main results', href: '#results' },
  { label: 'Side findings', href: '#findings' },
  { label: 'Discussion', href: '#discussion' },
  { label: 'Citation', href: '#citation' },
  { label: 'Appendices A–H', href: '#appendix' },
]

const BIBTEX = `@article{wang2026onpolicymerge,
  author  = {Bowen Wang},
  title   = {On-Policy Merge},
  journal = {bowenwang.me},
  year    = {2026},
  month   = nov,
  note    = {https://bowenwang.me/blog/on-policy-merge}
}`

function PostHero() {
  return (
    <header className="mb-8 mt-4">
      <h1 className="text-center text-[1.9rem] font-bold leading-[1.2] tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-[clamp(1.9rem,4.4vw,2.6rem)]">
        On-Policy Merge
      </h1>
      <div className="mt-6 text-center text-[17px] text-zinc-800 dark:text-zinc-200">
        {POST.author}
      </div>
      <div className="mt-2 text-center text-[16px] text-zinc-500 dark:text-zinc-400">
        {POST.date}
      </div>
    </header>
  )
}

/** A table row whose numbers are not in yet. */
function PendingRow({ label, n }: { label: ReactNode; n: number }) {
  return (
    <tr>
      <td>{label}</td>
      {Array.from({ length: n }, (_, i) => (
        <td key={i} className="am-num">
          <Pending>–</Pending>
        </td>
      ))}
    </tr>
  )
}

export default function OnPolicyMergingPost() {
  return (
    <Container className="mt-6 lg:mt-10">
      <article className="mx-auto max-w-3xl">
        <PostHero />

        <div className="am-scope scroll-mt-24" id="introduction">
          <SideToc items={TOC} />
          <SidenoteLayout />
          <figure id="fig-1" className="am-fig1">
            <div className="am-fig1-panels">
              <div>
                <ParadigmFigure />
                <ReduceMotion />
              </div>
              <div className="am-fit">
                <Landscape3D />
              </div>
            </div>
            <figcaption>
              <strong>Figure 1.</strong> Five ways to train one model on
              several RL domains. <strong>Left:</strong> when each method
              combines the domains. <strong>Right:</strong> the methods are
              animated one at a time on the same loss landscape over a slice of
              weight space, each starting from a base model high on the left.
              Small rings mark each domain’s own optimum. Multi-task RL descends
              on the mixed loss and converges to a local optimum. Cascade RL
              trains the domains in turn; each stage moves the model away from
              the points the earlier stages reached, and the final model is far
              from the global basin. Merge-after averages five finished
              specialists once, and the merged point lies on a ridge. MOPD
              distils the same specialists into a new student trained from the
              base, and the student reaches at most its teachers’ level.{' '}
              <strong>On-Policy Merge</strong> (OPM) trains the domains
              separately until one trainer has drifted a KL budget{' '}
              <Tex>{T`\delta`}</Tex> from the anchor, then merges them, and
              repeats. Its path passes the local optimum and reaches the global
              minimum. When one trainer collapses, the next merge replaces its
              weights with the merged model. The landscape is a schematic of a
              case in which the domains conflict; when domains help each other,
              multi-task RL can be faster.
            </figcaption>
          </figure>

          {/* ------------------------------------------------------------ */}
          {/* Introduction */}
          {/* ------------------------------------------------------------ */}
          <div className="am-prose">
            <p>
              Frontier models now acquire most of their breadth from
              reinforcement learning on many domains at once. A single policy
              is trained on competition math, instruction following, tool use,
              search, terminal work and software-engineering episodes, with one
              optimizer and batches that mix rollouts from all of them. Training
              on mixed batches assumes, usually without saying so, that the
              domains’ updates can be added. At every step, the change in a
              domain’s objective is the effect of its own gradient plus the
              effect of the other domains’ gradients.
            </p>
            <p>
              When domains agree, the second term is positive transfer. When
              they conflict, it is negative, and it affects most the domains
              with a small share of the batch, small gradients, or episodes so
              slow that the optimizer steps before they finish. Each of the
              usual alternatives replaces this problem with another. Training
              domains in sequence forgets the earlier ones. Training
              specialists apart and merging their weights once gives a model
              tens to hundreds of nats from every policy that produced data{' '}
              <Cite k={['ilharco2023', 'yadav2023']} />. Distilling the
              specialists into one student with multi-teacher on-policy
              distillation (MOPD), the recipe in recent frontier reports{' '}
              <Cite k={['deepseek2026', 'kimi2026', 'ma2026']} />, needs a
              second round of rollouts in every domain and at best matches its
              teachers.
            </p>
            <p>
              We start from a merge rule. Let
              trainers move from a shared anchor <Tex>{T`\bar\theta`}</Tex> by
              updates <Tex tail=".">{T`\Delta_i`}</Tex> The model whose behaviour
              on each domain is closest in KL to that domain’s trainer has, to
              second order, a closed form, a Fisher-weighted average{' '}
              <Tex tail=",">{T`\theta^{+}=\bar\theta+\big(\sum_iF_i\big)^{+}\sum_iF_i\Delta_i`}</Tex>{' '}
              and its properties depend on where each Fisher is measured. With{' '}
              <Tex>{T`F_i`}</Tex> taken on trainer <Tex>i</Tex>’s own on-policy
              rollouts, its policy gradient lies in the range of{' '}
              <Tex tail=":">{T`F_i`}</Tex> if a change <Tex>{T`v`}</Tex>{' '}
              satisfies <Tex tail=",">{T`F_iv=0`}</Tex> it leaves domain{' '}
              <Tex>i</Tex>’s action probabilities, and hence its return,
              unchanged to first order. Whenever the trainers’
              updates can be reconciled, the merged model therefore keeps every
              domain’s own first-order gain and drops every cross-domain term.
            </p>
            <p>
              The rule is accurate only locally. It is a second-order expansion
              around each trainer, and its weights are each trainer’s current
              Fisher, which becomes small on states where a trainer’s policy is
              near-deterministic. In the 4B test we applied it once to five
              released RL specialists, which are tens to hundreds of nats apart,
              with no training and no student rollouts. The merged model beats
              the released MOPD model on five of six benchmarks and task
              arithmetic on four, and beats task arithmetic by 10 points on
              IFBench. It does not fully match each specialist on its own
              domain, and no later training corrects the difference.
            </p>
            <p>
              <strong>On-Policy Merge</strong> (OPM) therefore applies the rule
              during training. The trainers stay independent between merges, and
              merges happen before the trainers are far apart. Each domain has
              its own on-policy trainer, started from a shared anchor. As soon as
              any trainer has drifted a fixed KL budget <Tex>{T`\delta`}</Tex>{' '}
              from the anchor, all trainers are merged with the rule above, with
              each Fisher measured on the rollouts its trainer has just
              collected. Every trainer reloads the merged model and continues,
              and the next round of RL corrects the error of the merge. Merges
              are frequent enough that each one happens in the region where the
              second-order rule is accurate.
            </p>
            <p>
              OPM stabilizes multi-task RL in the following sense. Each domain
              improves whenever its own trainer does, whatever the batch shares,
              gradient scales or speeds of the others, and the other domains’
              updates do not move a domain whose trainer stalls or breaks.
              Decoupling removes positive transfer as well as negative transfer,
              so OPM does not optimize faster than summing the updates. When
              domains help each other, summing does better; in the 4B test, at
              the same bf16 precision, plain summation beats the one-shot merge
              on AIME and GPQA, as the theory predicts for math, science and
              code. OPM gives a per-domain guarantee. It requires one model copy
              per domain and a merge that needs no environment interaction.
            </p>
            <p>
              Computing the merge is the main engineering problem. Each{' '}
              <Tex>{T`F_i`}</Tex> has one row and one column per parameter,
              about <Tex>{T`10^{20}`}</Tex> entries at 9B, and it has to be
              measured again at every merge on each trainer’s newest rollouts.
              We never form it. Conjugate gradient needs only products{' '}
              <Tex tail=",">{T`F_iv`}</Tex> and each product costs two forward
              passes and one backward pass over a trainer’s cached rollouts. In
              our eight-domain 9B run a merge took 15–24 minutes of compute on
              the trainers’ own GPUs, 22–30 on the slowest trainer. That is
              0.6–0.9 times the GPU time of the training steps between merges
              and, by our estimate, 5–7% of their FLOPs. The larger cost is that
              every trainer waits during a merge: 37–70 minutes per rendezvous,
              6–19% of a round’s wall-clock. Two 9B trainers merge in about five
              minutes. <a className="am-ref" href="#engineering">Computing the merge at scale</a>{' '}
              states these costs, what we have done about them and our plan for
              the rest: solve the merge on snapshots while training continues,
              on GPUs that the trainers leave idle 89–94% of the time while they
              wait for rollouts; spread the products evenly over the trainers;
              and use fewer and cheaper products.
            </p>
            <p>
              The rest of the post places OPM among the existing recipes,
              derives the merge, why it must be applied often and what it
              guarantees, shows how to reduce its compute cost, and tests it: first on those released specialists, then
              against strong multi-task RL, merging after training and MOPD on
              eight frontier-style domains at 9B. The 9B results are marked as
              pending until the runs finish.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Five ways to get one model" id="map" />
          <div className="am-prose">
            <p>
              Every method for combining RL domains makes two choices: how often
              the domains’ progress is combined, and by what rule. <a className="am-ref" href="#fig-1">Figure 1</a>{' '}
              shows the first choice, and <a className="am-ref" href="#table-1">Table 1</a> sets both side by side.
            </p>
          </div>

          <div className="am-prose">
            <p>
              <strong>Multi-task RL</strong> combines at every step, in
              parameter space: one optimizer receives the sum of the domains’
              gradients, weighted by their token shares in the batch. With plain
              SGD this is equivalent to running one trainer per domain and
              summing their updates after every step (<a className="am-ref" href="#app-a">Appendix A</a>). Combining
              once, after training, gives <strong>merge-after</strong> methods: task
              arithmetic, TIES and DARE{' '}
              <Cite k={['ilharco2023', 'yadav2023', 'yu2024']} />. Cascade RL
              trains the domains one after another{' '}
              <Cite k={['wang2025', 'yang2026']} />. In these terms it is
              multi-task RL with every share but one set to zero, so no term
              keeps the other domains’ behaviour fixed while one domain trains.
            </p>
            <p>
              <strong>MOPD</strong> also combines once, in a different
              geometry. The student minimises the sum of reverse KLs to the
              teachers on its own rollouts, and to second order this solves a
              Fisher-weighted merge <Cite k="liu2026" />, with the Fisher
              measured on the student’s states, which requires fresh rollouts
              in every domain. Distral and Divide-and-Conquer RL use the same KL
              barycenter as their shared policy and reach it by distillation{' '}
              <Cite k={['teh2017', 'ghosh2018']} />.
            </p>
            <p>
              <strong>OPM</strong> is the remaining combination. It combines
              during training, whenever a trainer reaches a KL budget, in KL geometry,
              with the Fisher measured on each trainer’s own states. <a className="am-ref" href="#table-1">Table 1</a>{' '}
              lists the drawbacks of each method.
            </p>
            <div className="am-table" id="table-1">
              <table>
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>How often</th>
                    <th>Geometry</th>
                    <th>Reward when combining</th>
                    <th>Drawbacks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Multi-task RL</strong>
                    </td>
                    <td>Every step</td>
                    <td>Euclidean, one shared optimizer</td>
                    <td>Yes</td>
                    <td>
                      Domains interfere through the shared step; domains with
                      small gradients or slow episodes contribute little to it.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Merge-after</strong> (TA, TIES, DARE)
                    </td>
                    <td>Once</td>
                    <td>Euclidean</td>
                    <td>No</td>
                    <td>
                      The merged model is far from every policy that produced
                      data; the whole drift is merged in one step.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>MOPD</strong>
                    </td>
                    <td>Once, then a distillation stage</td>
                    <td>KL, student states</td>
                    <td>No, unless an outcome reward is added</td>
                    <td>
                      A second rollout stage in every domain; at best matches the
                      teachers.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>OPM</strong>
                    </td>
                    <td>
                      When a trainer’s KL reaches <Tex>{T`\delta`}</Tex>
                    </td>
                    <td>KL, trainer states</td>
                    <td>Yes, in every local step</td>
                    <td>
                      Removes positive transfer along with interference; one
                      model copy per domain.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '14px' }}>
              <strong>Table 1.</strong> How often each method combines the
              domains, in which geometry, whether reward is used when combining,
              and its drawbacks.
            </p>
            <p>
              The rules are related by exact identities (<a className="am-ref" href="#app-a">Appendix A</a>,
              <a className="am-ref" href="#table-a2">Table A2</a>). Summing is OPM when the domains’ Fishers are mutually
              orthogonal. Averaging is OPM when they are all equal. With one
              natural-gradient step per trainer, the OPM merge is a natural
              policy gradient step on the summed objective{' '}
              <Cite k="kakade2001" />. Task arithmetic with a coefficient
              between <Tex>{T`1/n`}</Tex> and 1 interpolates between the
              assumptions of the average and the sum (<a className="am-ref" href="#table-1">Table 1</a>). OPM measures, direction by direction, which one
              holds; <a className="am-ref" href="#fig-2">Figure 2</a> shows what that looks like in weight space.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="On-Policy Merge" id="method" />
          <div className="am-prose">
            <p>
              This section derives OPM in five steps: the quantity a merge of RL
              trainers should preserve, the closed form that preserves it, the
              choice of Fisher for RL, the reason to merge during training, and
              the training loop.
            </p>
            <p>
              <span className="am-runin">What a merge should preserve.</span>{' '}
              The merged model should keep what each trainer learned on its own
              domain. We measure this by behaviour rather than by weights: on
              domain <Tex>i</Tex>, the merged model’s rollouts should have the
              same distribution as trainer <Tex>i</Tex>’s. A rollout{' '}
              <Tex>{T`\xi=(h_1,a_1,\dots,h_L,a_L)`}</Tex> has probability{' '}
              <Tex>{T`P^i_\theta(\xi)=\prod_t\pi_\theta(a_t\mid h_t)`}</Tex>{' '}
              times environment terms that do not depend on{' '}
              <Tex tail=".">{T`\theta`}</Tex> The environment’s transition
              probabilities are the same under every policy, so they drop out of
              the likelihood ratio, and the KL between rollout distributions
              depends only on the policy’s token probabilities. We define the
              merge as the <Key>KL barycenter</Key> of the trainers:
            </p>
            <Tex
              display
            >{T`\theta^{+}\in\arg\min_\theta\;\sum_i\mathrm{KL}\big(P^i_{\theta_i}\,\|\,P^i_\theta\big).\tag{1}`}</Tex>
            <p>
              Up to a constant, (1) is the negative log-likelihood of every
              trainer’s own rollouts under the merged model, so it can be
              evaluated from data the trainers already hold. Distral and
              Divide-and-Conquer RL use the same objective for their shared
              policy and reach it by distillation{' '}
              <Cite k={['teh2017', 'ghosh2018']} />. OPM differs in solving it in
              closed form, in one shared network, during training.
            </p>
            <p>
              <span className="am-runin">The closed form.</span> Let trainer{' '}
              <Tex>i</Tex> move from the anchor to{' '}
              <Tex tail=".">{T`\theta_i=\bar\theta+\Delta_i`}</Tex> Expanding
              each KL to second order around its trainer,{' '}
              <Tex tail=",">{T`\mathrm{KL}\approx\tfrac12(\theta-\theta_i)^\top F_i(\theta-\theta_i)`}</Tex>{' '}
              and setting the gradient of the sum to zero gives the OPM merge:
            </p>
            <Tex
              display
            >{T`\boxed{\;\theta^{+}=\bar\theta+\Big(\sum_iF_i\Big)^{+}\sum_iF_i\,\Delta_i\;},\qquad F_i=\mathbb{E}_{\xi\sim P^i_{\theta_i}}\Big[\sum_t s_ts_t^\top\Big],\quad s_t=\nabla\log\pi_{\theta_i}(a_t\mid h_t).\tag{2}`}</Tex>
            <p>
              The Fisher in (2) has one row and one column per parameter, and
              we never form it. The merge is computed from products{' '}
              <Tex>{T`F_iv`}</Tex> alone (<a className="am-ref" href="#fvp">Computing a Fisher-vector product</a>).
            </p>
            <p>
              Consider (2) one direction of weight space at a time. In a
              direction where only domain <Tex>i</Tex> has curvature, the anchor
              moves by the full component of{' '}
              <Tex tail=".">{T`\Delta_i`}</Tex> Where several domains have
              curvature, it moves by their curvature-weighted mean. Where no
              domain has curvature, the anchor does not move. For tabular
              policies the exact minimiser of (1) is, at every history, the
              mixture of the trainers’ action distributions weighted by how
              often each visits it; (2) is its second-order approximation.
            </p>
            <p>
              <span className="am-runin">Which Fisher.</span> Formula (2) is
              Fisher-weighted averaging <Cite k="matena2022" />, and its result
              depends on which Fisher is used. OPM uses the <Key>on-policy Fisher</Key>:
              the Fisher of trainer <Tex>i</Tex>’s current policy on its own
              domain, estimated from rollouts that policy has just sampled and
              summed over the tokens of each rollout. We use it for RL because of
              the following property. Write{' '}
              <Tex>{T`S(\xi)=\sum_ts_t`}</Tex> for the score of a rollout and{' '}
              <Tex>b</Tex> for any reward baseline. For every direction{' '}
              <Tex tail=",">v</Tex>
            </p>
            <Tex
              display
            >{T`F_iv=0\;\Longrightarrow\;\mathbb{E}\big[(v^\top S)^2\big]=0\;\Longrightarrow\;v^\top S=0\ \text{on every rollout}\;\Longrightarrow\;v^\top\nabla J_i=\mathbb{E}\big[(R_i-b)\,v^\top S\big]=0 .`}</Tex>
            <p>
              The policy gradient therefore lies in the range of the on-policy
              Fisher. If a change <Tex>v</Tex> satisfies{' '}
              <Tex tail=",">{T`F_iv=0`}</Tex> it leaves domain <Tex>i</Tex>’s
              action probabilities, and hence its return, unchanged to first
              order. A merge that preserves each domain’s policy as measured by
              its Fisher therefore also preserves each domain’s return, and it
              does not use any reward. The argument requires the gradient and the
              Fisher to be expectations under the same distribution. It does not
              hold for the empirical Fisher of stale or foreign rollouts, which is
              a different and biased estimator{' '}
              <Cite k="kunstner2019" />, or for supervised gradients paired with a
              model Fisher. We call the method on-policy because the data, the
              metric and, through the loop below, the continuation are all
              on-policy.
            </p>
            <p id="why-meet-often">
              <span className="am-runin">Why meet often.</span> Formula (2) is a
              second-order expansion with weights measured at the trainers, so it
              is accurate only near them. Four properties degrade as the trainers
              drift apart, and each one favours merging during training over
              merging after it.
            </p>
            <ul>
              <li>
                <Key>Locality.</Key> The cubic remainder of the quadratic model
                accumulates token by token; over a run of <Tex>R</Tex> rounds its
                total falls as <Tex>{T`1/R^2`}</Tex> (<a className="am-ref" href="#app-b-4">Appendix B.4</a>). In a
                two-action example the locality ratio{' '}
                <Tex tail=",">{T`\kappa`}</Tex> true KL over its quadratic
                prediction, grows from 1.00 to 1.92 after 20 steps and to 8.9
                after 200.
              </li>
              <li>
                <Key>Calibration.</Key> As a trainer’s policy becomes more
                deterministic, its Fisher goes to zero on the logits it moved, so a
                late merge gives little weight to the logits the trainer moved
                furthest.
              </li>
              <li>
                <Key>Repair.</Key> After a merge during training, the next round
                of RL starts from the merged model and uses reward to correct the
                merge’s error. A merge after training is followed by no such
                correction.
              </li>
              <li>
                <Key>Continuation.</Key> If a merge moves each trainer by a small
                per-token KL, the trainer’s in-flight rollouts remain usable with
                per-token importance weights, so training does not pause at a
                merge.
              </li>
            </ul>
            <p>
              Merging more often does not remove every error. Where domains
              conflict, each round leaves a second-order residual whose
              first-order effect on reward does not decrease with merge
              frequency, and where the domains’ Fishers do not overlap, merge
              frequency has no effect. The merge interval is therefore a
              trade-off against the compute cost of a merge, which we measure
              in the engineering section.
            </p>
            <p>
              <span className="am-runin">The loop.</span> OPM runs one ordinary
              on-policy trainer per domain from a shared anchor and merges them
              by (2) whenever the drift of any trainer from the anchor,{' '}
              <Tex tail=",">{T`D_i=\mathrm{KL}(P^i_{\theta_i}\,\|\,P^i_{\bar\theta})`}</Tex>{' '}
              reaches its ceiling <Tex tail=".">{T`\delta_i`}</Tex> We call each
              merge a <Key>rendezvous</Key>. The drift is measured on a
              subsample of each batch and never penalised. Algorithm 1 gives the
              whole procedure.
            </p>
            <Algorithm
              number={1}
              title="On-Policy Merge"
              input={
                <>
                  base model <Tex tail=";">{T`\theta_0`}</Tex> for each domain{' '}
                  <Tex tail=":">i</Tex> its data, verifier, rollout workers and
                  hyperparameters, and a drift ceiling{' '}
                  <Tex>{T`\delta_i`}</Tex>
                </>
              }
            >
              <Line>
                <Tex>{T`\bar\theta\leftarrow\theta_0`}</Tex>
              </Line>
              <Line note="trainer i owns domain i and its optimizer state">
                <Tex>{T`\theta_i\leftarrow\bar\theta`}</Tex> for every domain{' '}
                <Tex>i</Tex>
              </Line>
              <Line>
                <K>repeat</K>
              </Line>
              <Line indent={1}>
                <K>for</K> each trainer <Tex>i</Tex> <K>in parallel do</K>
              </Line>
              <Line indent={2} note={<>on-policy GRPO <Cite k="shao2024" />, no KL penalty</>}>
                sample rollouts <Tex tail=";">{T`\xi\sim P^i_{\theta_i}`}</Tex>{' '}
                <Tex>{T`\theta_i\leftarrow`}</Tex> GRPO step on{' '}
                <Tex>{T`\xi`}</Tex>
              </Line>
              <Line indent={2} note="anchor scores a subsample; measured, never penalised">
                <Tex>{T`D_i\leftarrow\mathrm{KL}\big(P^i_{\theta_i}\,\|\,P^i_{\bar\theta}\big)`}</Tex>
              </Line>
              <Line indent={1} note="rendezvous">
                <K>if</K> <Tex>{T`D_i\ge\delta_i`}</Tex> for some{' '}
                <Tex>i</Tex> <K>then</K>
              </Line>
              <Line indent={2} note="from each trainer’s cached rollouts; Fᵢ is used only through products Fᵢv">
                <Tex tail=",">{T`\Delta_i\leftarrow\theta_i-\bar\theta`}</Tex>{' '}
                <Tex>{T`F_i\leftarrow\mathbb{E}_{\xi\sim P^i_{\theta_i}}\big[\textstyle\sum_ts_ts_t^\top\big]`}</Tex>
              </Line>
              <Line
                indent={2}
                note={
                  <>
                    the merge (2), solved as in{' '}
                    <a href="#engineering">Computing the merge at scale</a>
                  </>
                }
              >
                <Tex>{T`\bar\theta\leftarrow\bar\theta+\big(\sum_iF_i\big)^{+}\sum_iF_i\Delta_i`}</Tex>
              </Line>
              <Line indent={2} note="optimizer states kept; in-flight rollouts reweighted per token">
                <Tex>{T`\theta_i\leftarrow\bar\theta`}</Tex> for every{' '}
                <Tex>i</Tex>
              </Line>
              <Line>
                <K>until</K> the training budget is spent
              </Line>
              <Line note="a final rendezvous, so the last round’s updates are kept">
                merge once more (lines 8–9), whatever the drifts
              </Line>
              <Line>
                <K>return</K> <Tex>{T`\bar\theta`}</Tex>
              </Line>
            </Algorithm>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle
            label="What the merge guarantees, and what it costs"
            id="theory"
          />
          <div className="am-prose">
            <p>
              By the property above, (2) does not change a domain’s return to
              first order through any direction in the null space of its Fisher.
              This section states what the merge guarantees in the remaining
              directions, which of these guarantees multi-task RL lacks, and what
              the merge gives up to obtain them. Each statement
              carries a status in <a className="am-ref" href="#app-b">Appendix B</a> (theorem, proposition under stated
              assumptions, or conjecture with numerical support), with its proof.
            </p>
            <p>
              <span className="am-runin">Lossless rounds.</span> Each domain’s
              policy is unchanged, to second order, along the affine subspace{' '}
              <Tex tail=",">{T`\theta_j+\operatorname{null}(F_j)`}</Tex>{' '}
              which appears in weight space as a flat-bottomed trough (<a className="am-ref" href="#fig-2">Figure 2</a>). Call a round{' '}
              <Key>lossless</Key> if these subspaces intersect, that is, if some
              displacement <Tex>d</Tex> satisfies{' '}
              <Tex>{T`F_j(d-\Delta_j)=0`}</Tex> for every{' '}
              <Tex tail=".">j</Tex> This holds for every possible set of updates
              if and only if the Fisher ranges are linearly independent; they
              need not be orthogonal.
            </p>
          </div>

          <div>
            <figure id="fig-2">
              <WeightSpace3D />
              <figcaption>
                <strong>Figure 2.</strong> One round in a two-dimensional slice
                of weight space. Height is the second-order KL
                residual summed over both domains. Each domain is a
                flat-bottomed trough, the set of weights with the same policy on
                that domain, to second order the affine subspace{' '}
                <Tex tail=".">{T`\theta_i+\operatorname{null}(F_i)`}</Tex>{' '}
                Each trainer moves from the anchor to the bottom of its own
                trough. Averaging the two updates and summing them (task
                arithmetic) both give points on the trough walls; the OPM merge
                (2) solves for the point where the troughs intersect, which exists
                when the round is lossless. The quadratic model holds only near the
                trainers, so OPM merges before they drift far.
              </figcaption>
            </figure>
          </div>

          <div className="am-prose">
            <div className="am-callout" id="thm-1">
              <div className="am-callout-label">Theorem 1 · decoupling</div>
              <p>
                In a lossless round, (2) returns a lossless point and, for every
                domain <Tex tail=",">j</Tex> to first order in the
                displacements,
              </p>
              <Tex
                display
              >{T`J_j(\theta^{+})-J_j(\theta_j)=0,\qquad J_j\Big(\bar\theta+\sum_i\Delta_i\Big)-J_j(\theta^{+})=T_j,\qquad T_j=\nabla J_j(\theta_j)^\top\sum_{i\ne j}\Delta_i .`}</Tex>
            </div>
            <p>
              In the second identity,{' '}
              <Tex>{T`T_j`}</Tex> is the <Key>cross-domain term</Key>: the
              change in domain <Tex>j</Tex>’s return caused by the other domains’
              updates. Summing the updates retains this term, and OPM removes it
              regardless of sign. When{' '}
              <Tex>{T`T_j<0`}</Tex> it is interference, which OPM is designed to
              remove. When <Tex>{T`T_j>0`}</Tex> it is positive transfer, which
              OPM also removes. Whether the term is large depends on how much
              the domains’ Fishers overlap; the alignment of their gradients in
              parameter space does not determine it. In the released 4B
              specialists merged later in this post, parameter cosines are at
              most 0.022, but the math specialist’s update moves the code
              specialist’s policy by 1.78 times the code specialist’s own drift.
            </p>
            <p>
              <span className="am-runin">Consequences of decoupling.</span> Where
              rounds are lossless, each domain behaves as if it were trained
              alone: to first order per round in general, and exactly for
              log-linear policies with linearly independent feature spans, after
              any number of rounds and for any trainer optimizer whose update
              depends only on its own history, Adam with persistent state
              included (<a className="am-ref" href="#app-b-2">Appendix B.2</a>). This yields the following guarantees,
              which multi-task RL does not have.
            </p>
            <div className="am-callout" id="prop-2">
              <div className="am-callout-label">
                Proposition 2 · per-domain guarantees, given lossless rounds
              </div>
              <ol>
                <li>
                  <strong>Monotone per domain.</strong> <Tex>{T`J_j`}</Tex>{' '}
                  decreases only if domain <Tex>j</Tex>’s solo run does.
                </li>
                <li>
                  <strong>Invariant to shares.</strong> Domain <Tex>j</Tex>’s
                  trajectory is independent of the other domains’ batch shares,
                  gradient scales and speeds.
                </li>
                <li>
                  <strong>Idle protection.</strong> If trainer <Tex>j</Tex> makes
                  no progress, the anchor moves inside{' '}
                  <Tex tail=".">{T`\operatorname{null}(F_j)`}</Tex>
                </li>
                <li>
                  <strong>Bounded drift and residuals.</strong> For any
                  optimizer, <Tex tail=",">{T`D_i\le\delta_i+\omega`}</Tex> with{' '}
                  <Tex>{T`\omega`}</Tex> the KL of one step, and the exact
                  merge’s KL residuals <Tex>{T`\varepsilon_i`}</Tex> satisfy{' '}
                  <Tex tail=".">{T`\sum_i\varepsilon_i\le\sum_iD_i\le\sum_i(\delta_i+\omega)`}</Tex>
                </li>
              </ol>
            </div>
            <p>
              Item 4 holds without a lossless point. Multi-task RL has none of
              these guarantees. One step of it changes the return of domain <Tex>j</Tex> by
            </p>
            <Tex
              display
            >{T`\Delta J_j\approx\eta\Big(c_j\,\nabla J_j^\top P\,\nabla J_j+\sum_{i\ne j}c_i\,\nabla J_j^\top P\,\nabla J_i\Big),`}</Tex>
            <p>
              with <Tex>{T`c_i`}</Tex> the batch shares and <Tex>P</Tex> the
              optimizer’s preconditioner, so when gradients conflict, any domain
              with a small enough share or gradient regresses. A two-parameter
              example shows this: with domain 2’s share at 0.2, multi-task SGD
              drives its return from 0.50 to 0.24, and Adam in a rotated
              parameterisation drives it to <Tex tail=",">{T`3\times10^{-4}`}</Tex>{' '}
              while under OPM domain 2 follows the same trajectory for every
              share and reward scale of domain 1 (<a className="am-ref" href="#app-b-5">Appendix B.5</a>, which also
              covers forgetting under Cascade RL).
            </p>
            <p id="gradient-channels">
              <span className="am-runin">In terms of gradients.</span> The
              formula above describes the first of three ways in which
              multi-task RL couples domains. A shared update adds the domains’
              gradients, so their directions interfere. A global gradient-norm
              clip scales every domain’s step by the norm of the sum, so when a
              domain with long, high-norm rollouts triggers the clip, every
              domain’s step is scaled down. Adam’s second moment is a running
              average of the squared{' '}
              <em>mixed</em> gradient: wherever one domain’s gradients are large,
              every domain’s effective learning rate in those coordinates drops,
              even when the gradients are orthogonal, because in a dense model
              all domains share all coordinates. OPM removes all three within a
              round. Each trainer has its own optimizer state, clip, learning
              rate and schedule, which we call <Key>optimizer isolation</Key>;
              it is the mechanism behind item 2 of{' '}
              <a className="am-ref" href="#prop-2">Proposition 2</a> and behind
              the Adam example above. We measure each channel in our 9B run in{' '}
              <a className="am-ref" href="#coupling">Main results</a>.
            </p>
            <p>
              At the merge, a domain’s weight in a direction is its curvature in
              that direction; its gradient norm does not enter. A domain with
              large gradients therefore gets no extra weight from them, and a
              converged domain with small gradients but large curvature keeps a
              large weight. Directions are compared in the Fisher metric.
              Euclidean cosines between updates are close to zero at LLM scale,
              at most 0.022 between the 4B specialists, and say little about
              interaction; (2) weights the Fisher overlap, which is what couples
              domains. This choice has a limitation. A drift orthogonal to{' '}
              <Tex>{T`\nabla J_j`}</Tex> leaves domain <Tex>j</Tex>’s return
              unchanged to first order but still increases the KL on domain{' '}
              <Tex tail=",">j</Tex> so the merge treats it like a harmful drift
              of the same KL. The objective (1) is defined on behaviour and
              contains no reward, so the merge also removes drift that would have
              been harmless to the return.
            </p>
            <p>
              By item 4 of{' '}
              <a className="am-ref" href="#prop-2">Proposition 2</a>, the drift
              trigger bounds each trainer’s KL from the anchor, so it acts as a
              trust region.
              OPM therefore needs no reference-KL penalty, which matches frontier
              practice; no arm of our experiments uses one. Because the cubic
              remainder accumulates per token, the ceiling{' '}
              <Tex>{T`\delta_i`}</Tex> is best set in proportion to domain{' '}
              <Tex>i</Tex>’s response length (<a className="am-ref" href="#app-b-6">Appendix B.6</a>).
            </p>
            <p>
              <span className="am-runin">What decoupling gives up.</span> Removing
              the cross-domain term also removes positive transfer, and
              Proposition 3 states the effect exactly.
            </p>
            <div className="am-callout" id="prop-3">
              <div className="am-callout-label">Proposition 3 · amplification and the rate floor</div>
              <p>
                Let <Tex>n</Tex> domains share a direction with common curvature
                and agreeing objectives, and let each round solve a fraction{' '}
                <Tex>x</Tex> of it. Along that direction OPM moves <Tex>x</Tex>,
                the sum moves <Tex tail=",">{T`nx`}</Tex> and multi-task RL’s
                convergence exponent is about <Tex>n</Tex> times OPM’s. With an
                interior optimum the sum is better per round iff{' '}
                <Tex>{T`x<2/(n+1)`}</Tex> and diverges iff{' '}
                <Tex tail=";">{T`x>2/n`}</Tex> with a boundary optimum it is at
                least as good at every <Tex tail=".">x</Tex>
              </p>
            </div>
            <p>
              A boundary optimum is the common case, for example raising the
              probability of an action that every domain rewards. OPM therefore
              has no general rate advantage over a well-tuned multi-task run, and
              we do not claim one. In KL geometry, positive transfer is
              additional reward-aligned drift, equivalent to a larger step. A
              larger trainer learning rate recovers part of it. Merging more often
              does not, because in lossless directions OPM equals solo training
              at every merge interval. With nonlinear policies OPM also has an
              error floor of order <Tex tail=",">{T`\eta K`}</Tex> set by how far
              the lossless point lies in parameter space (<a className="am-ref" href="#app-b-4">Appendix B.4</a>). OPM
              provides the guarantees above in place of a rate advantage. When
              domains conflict, we consider those guarantees more important than
              speed.
            </p>
            <p>
              A controlled toy experiment shows both effects (<a className="am-ref" href="#app-e">Appendix E</a>). Four chain tasks
              share a 704-parameter policy trained with exact gradients over ten
              seeds, in five variants from strong positive transfer to conflict,
              with learning rates tuned for both methods. Under positive transfer
              multi-task RL leads, by 0.20–0.23 in success at 10 steps per task
              and 0.03–0.05 at 50. Under conflict OPM leads at every budget, 0.97
              against at most 0.80 at 50 steps. Across all variants no CG-merged
              OPM run ended with a task below its starting point, while
              multi-task RL, task arithmetic and the sum left 20–37% of tasks
              below it.
            </p>
            <p>
              <span className="am-runin">Relation to MOPD.</span> Multi-teacher
              on-policy distillation minimises the reverse KLs to the same
              trainers on the student’s own rollouts, so the two can be compared
              directly.
            </p>
            <div className="am-callout" id="prop-4">
              <div className="am-callout-label">Proposition 4 · MOPD</div>
              <p>
                Let{' '}
                <Tex>{T`L_i(\theta)=\mathrm{KL}(P^i_\theta\|P^i_{\theta_i})`}</Tex>{' '}
                be MOPD’s loss for teacher <Tex tail=".">i</Tex> Then{' '}
                <Tex tail=".">{T`J_i(\theta)\le J_i(\theta_i)+\sqrt{L_i(\theta)/2}`}</Tex>{' '}
                The OPM point is a stationary point of{' '}
                <Tex>{T`\sum_iL_i`}</Tex> to second order, with gradient{' '}
                <Tex>{T`O(\|\cdot\|^2)`}</Tex> against{' '}
                <Tex>{T`O(\|\cdot\|)`}</Tex> for task arithmetic and the sum,
                and in a lossless round it is the global minimiser to third
                order.
              </p>
            </div>
            <p>
              The bound follows from Pinsker’s inequality. At its optimum the
              MOPD student matches its teachers, and it can exceed them only if
              it does not converge or if an outcome reward is added. <CiteT k="liu2026" /> showed
              that MOPD is Fisher merging to second order; <a className="am-ref" href="#prop-4">Proposition 4</a> adds the
              lossless statement and which Fisher to use. OPM reaches the same
              point without student rollouts, and it has no fixed teacher: each
              round’s <Tex>{T`\theta_i`}</Tex> is retrained on reward from the
              last merge. A rendezvous needs no environment interaction, while a
              round of MOPD needs fresh rollouts in every domain, which for
              agentic domains means sandboxes running for minutes per episode.
            </p>
            <p>
              <span className="am-runin">The scope of these guarantees.</span>{' '}
              <a className="am-ref" href="#thm-1">Theorem 1</a> and{' '}
              <a className="am-ref" href="#prop-2">Proposition 2</a> hold
              exactly only in <Key>lossless</Key> rounds, where some merged point
              keeps every trainer’s policy. We have not shown that such rounds
              exist at LLM scale, and the one-shot 4B merge below suggests they
              do not exist exactly: even after 30 CG iterations, the merged
              model’s KL to the specialists is still 16% of how far they drifted.
              The guarantees therefore hold approximately, to within an error set
              by that residual, and the main runs log the residual at every rendezvous. In
              our 9B run the held-out residual, summed over trainers, was 0.12
              to 0.51 of their drift over the first five rendezvous, the same order as the one-shot 4B merge.{' '}
              <a className="am-ref" href="#app-b">Appendix B</a> gives the
              status and proof of every statement, and lists what is not
              claimed.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="System design" id="system" />
          <div className="am-prose">
            <p>
              OPM modifies the training loop and reuses the existing RL stack.{' '}
              <a className="am-ref" href="#fig-3">Figure 3</a> shows the system
              for <Tex>n</Tex> domains. Each domain runs as a{' '}
              <Key>unit</Key> of ordinary asynchronous RL: a trainer with its
              own optimizer state and settings, a group of rollout engines
              serving that trainer’s current weights, and a buffer between them,
              synchronised every step as in single-domain RL. Rollouts
              must come from the trainer’s own weights, so each engine is assigned
              to one unit instead of a shared pool, and the number of engines a
              unit gets is set by its rollout cost: long agentic episodes get
              more engines than math.
            </p>
            <p>
              Everything else is shared. Verifiers, sandboxes and environments
              serve all units. The anchor against which each trainer’s drift is
              measured is stored in the slot RL frameworks already reserve for a
              reference model, which is unused here because no arm has a KL penalty, and
              it is replaced by <Tex>{T`\theta^{+}`}</Tex> at every rendezvous.
              A small coordinator process tracks the drifts, triggers a rendezvous,
              runs the solver of{' '}
              <a className="am-ref" href="#engineering">Computing the merge at scale</a>{' '}
              across the trainers and broadcasts the result. Between rendezvous
              the units never wait for each other, so a slow domain does not delay
              a fast one, and a unit can be added, retuned or rolled back
              alone. To prevent one fast domain from triggering most rendezvous,
              engines can be moved between units at each rendezvous so that the
              drifts grow at similar rates.{' '}
              <a className="am-ref" href="#app-c">Appendix C</a> compares the
              five recipes as systems, from memory to how each handles a single
              broken domain (<a className="am-ref" href="#table-c1">Table C1</a>
              ).
            </p>
          </div>
          <figure id="fig-3">
            <SystemDiagram />
            <figcaption>
              <strong>Figure 3.</strong> The OPM system. Each domain is a unit
              of ordinary asynchronous RL, with its own trainer and its own
              rollout engines, sized by its rollout cost. Verifiers, sandboxes
              and the anchor scorer are shared. A coordinator merges the
              trainers whenever the drift of one reaches its ceiling and sends the merged
              model back to all of them.
            </figcaption>
          </figure>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Computing the merge at scale" id="engineering" />
          <div className="am-prose">
            <p>
              A merge is useful only if its compute and wall-clock time are
              small relative to the training between merges. This section derives
              the compute of a merge, measures it at 9B, and discusses what
              changes at frontier scale, where models
              have hundreds of billions to trillions of parameters, layers are
              mixtures of experts, and rollouts arrive asynchronously from
              inference engines that do not match the trainer exactly.
            </p>
            <p>
              <span className="am-runin">What a merge costs.</span> Formula (2)
              cannot be formed for a model of this size, since the Fisher has as
              many rows as the model has parameters. It can still be solved with
              conjugate gradient (CG), which needs only products{' '}
              <Tex>{T`F_iv`}</Tex> <Cite k="martens2010" />. Each trainer
              computes its own product on its own GPUs, at its own weights, over
              the rollouts it has cached, and one all-reduce per iteration adds
              the products up. A rendezvous with <Tex>K</Tex> CG iterations and{' '}
              <Tex>L</Tex> line-search candidates, on <Tex>{T`N_F`}</Tex>{' '}
              Fisher tokens per trainer, spread over the <Tex>S</Tex> training
              steps of <Tex>{T`N_{\rm step}`}</Tex> tokens between
              rendezvous, adds
            </p>
            <Tex
              display
            >{T`\text{overhead}\;\approx\;\frac{(K\,c_{\rm FVP}+L\,c_{\rm fwd})\,N_F}{S\,N_{\rm step}}`}</Tex>
            <p>
              to training compute, where <Tex>{T`c_{\rm FVP}`}</Tex> and{' '}
              <Tex>{T`c_{\rm fwd}`}</Tex> are the costs of a product and of a
              forward pass per token, in units of one training token. This has
              two consequences. First, the compute ratio does not depend on
              model size. A Fisher-vector product touches the same parameters per
              token as a training step does, so both scale with the active
              parameters, and a trillion-parameter mixture-of-experts model has
              the same overhead fraction as a dense model of its active size.
              Second, memory and communication do depend on model size, because
              they scale with all the parameters. CG keeps fp32 vectors as long as
              the model, and four of them take as much memory as the training
              state itself. Each iteration also all-reduces one of them across
              trainers: 4 TB at a trillion parameters, which takes seconds inside
              one cluster and is impractical between clusters.
            </p>
            <div className="am-callout" id="fvp">
              <div className="am-callout-label">Computing a Fisher-vector product</div>
              <p>
                The score of a rollout is the sum of per-token scores{' '}
                <Tex tail=",">{T`s_t`}</Tex> and the cross terms{' '}
                <Tex>{T`\mathbb{E}[s_ts_{t'}^\top]`}</Tex> with{' '}
                <Tex>{T`t\neq t'`}</Tex> are zero because each score has mean
                zero given its history. Taking the expectation over the action
                at each token gives
              </p>
              <Tex
                display
              >{T`F_iv=\mathbb{E}_{\xi\sim P^i_{\theta_i}}\Big[\sum_tJ_t^\top\big(\mathrm{diag}(p_t)-p_tp_t^\top\big)J_tv\Big],`}</Tex>
              <p>
                where <Tex>{T`p_t`}</Tex> is the policy’s distribution over the
                vocabulary at token <Tex>t</Tex> and <Tex>{T`J_t`}</Tex> is the
                Jacobian of its logits <Tex>{T`z_t`}</Tex> with respect to the
                weights. Each trainer computes its product in three steps, on its
                own cached rollouts and at its own weights:
              </p>
              <ol>
                <li>
                  <Tex>{T`J_tv`}</Tex> by a central finite difference, from two
                  forward passes at <Tex tail=":">{T`\theta_i\pm\varepsilon v`}</Tex>{' '}
                  <Tex tail=",">{T`\big(z_t(\theta_i+\varepsilon v)-z_t(\theta_i-\varepsilon v)\big)/2\varepsilon`}</Tex>{' '}
                  with <Tex>{T`\varepsilon`}</Tex> set by a logit step of 0.03;
                </li>
                <li>
                  <Tex tail=",">{T`u_t=p_t\odot J_tv-p_t\,(p_t^\top J_tv)`}</Tex>{' '}
                  which costs <Tex>{T`O(V)`}</Tex> per token;
                </li>
                <li>
                  <Tex>{T`J_t^\top u_t`}</Tex> by one backward pass with{' '}
                  <Tex>{T`u_t`}</Tex> as the gradient of the logits.
                </li>
              </ol>
              <p>
                One all-reduce per CG iteration sums the trainers’ products. In
                the 9B run each trainer uses 64 cached rollouts, cut at their
                2,048th action token with contexts of up to 16,384 tokens, so a
                rendezvous processes 0.57–0.96 million action tokens and 3.2–4.8
                million context tokens over all trainers. CG uses a small
                damping term and a Jacobi preconditioner built from a Monte
                Carlo estimate of the Fisher diagonal.
              </p>
            </div>
            <p>
              <span className="am-runin">What we measured at 9B.</span> On
              MiMo-V2.6-Distill-Qwen-9B <Cite k="mimo2026" /> the Fisher-vector
              product dominates the cost of a merge. We compute it exactly, with the true
              per-token Fisher rather than the empirical one, in fp32 and with
              finite differences in logit space. It costs 6.9 GPU-milliseconds
              per token, so <Tex>{T`c_{\rm FVP}\approx16`}</Tex> bf16 gradient
              passes; about half of that is the backward pass and 40% the
              finite-difference forward passes. Communication and the{' '}
              <Tex>{T`n\times n`}</Tex> algebra were negligible on one node,
              and keeping the CG vectors in CPU memory to save GPU memory made
              every product three times slower. The guarded
              merge below uses four products and four forward passes and takes
              about ten minutes with two trainers. With eight trainers, as in
              our main run, a rendezvous took 37–70 minutes. Each of the first
              five took 48–57 minutes and about 11 GPU-hours, including 18–22
              minutes for five preconditioned CG iterations, 1–2 minutes of line
              search and up to 17 minutes waiting for the slowest trainer to
              arrive; the longest included a second solve after the guard
              rejected the first. Two 9B trainers merge in 3–19 minutes, 5 at
              the median over 29 merges.
            </p>
            <p>
              <span className="am-runin">Where the time goes.</span> Over the
              first five rendezvous of the 9B run, a merge took 15–24 minutes of
              compute on an average trainer and 22–30 on the slowest. About 85%
              of it was Fisher-vector products, their finite-difference forward
              passes and their backward passes; the rest was the diagonal
              estimate, the line search and loading weights. Every CG iteration
              waits for the slowest trainer. Instruction following finished in
              4.5 minutes, and software engineering and knowledge work took the
              longest, because their Fisher rollouts include long environment
              contexts: the cyber trainer’s 115 thousand action tokens came with
              970 thousand context tokens, while for math the two counts are
              about equal. Between merges, the trainers’ GPUs ran training steps
              for 29–35 minutes of each 5–15 hour round and waited for rollouts
              the rest of the time. In GPU time the merge is 0.6–0.9 times the
              trainers’ training compute. In FLOPs it is much smaller: a
              finite-difference product does the arithmetic of about 1.3
              gradient passes but takes the time of 16, because it runs in fp32,
              so we estimate the merge at 5–7% of the trainers’ training FLOPs,
              before rollouts are counted. The largest cost is wall-clock: every
              trainer waits 48–57 minutes per rendezvous, 6–19% of a round.
            </p>
            <p id="compute-plan">
              <span className="am-runin">Our plan.</span> We order the remaining
              work by how much of this cost it removes. First, the merge should
              stop blocking training. It can be solved on snapshots of the
              trainers while they keep stepping, with the correction{' '}
              <Tex>{T`\theta^{+}-\theta_{\rm snapshot}`}</Tex> added when it is
              ready (Hidden latency, below), and its products can run in the
              trainers’ idle time. If a correction a few steps stale is
              acceptable, as it is for rollouts in asynchronous RL, this removes
              the 6–19% of wall-clock and needs no extra GPUs. Second, merge
              compute should follow the average trainer instead of the slowest:
              spreading the products over all trainer GPUs by context tokens
              would cut it by 1.2–1.6 times on our timings. Third, fewer
              products per merge. A per-layer subspace solve recovers 72% of
              CG’s reduction of the residual with two products on the{' '}
              <a className="am-ref" href="#table-2">Table 2</a> test case
              (below), so it is a candidate starting point for one or two CG
              iterations; CG can also start from the previous rendezvous’
              correction, and each trainer’s Adam second moment may replace the
              Monte Carlo diagonal. Fourth, cheaper products. Exact JVP–VJP
              products, or bf16 arithmetic with fp32 accumulation, would bring
              the 16 gradient passes per token closer to the 1.3 that the
              arithmetic needs, and trainers that compute 6–11% of the time could
              share one training pool. None of these steps has been tested at 9B
              yet; the experiments are listed at the end of this section. The
              rest of the section explains the guarded merge and the options for
              reducing <Tex tail=".">{T`c_{\rm FVP}N_F`}</Tex>
            </p>
            <p>
              <span className="am-runin">Conjugate gradient overshoots.</span>{' '}
              Our first attempt failed. Plain CG, started
              from the summed update, made the held-out residual worse at each of
              its first iterations, even though the quadratic model was accurate
              along the directions it took (<Tex>{T`\kappa`}</Tex> between
              0.87 and 1.0). The cause lies in CG’s first search directions. They are
              the Fisher’s highest-curvature directions, with about{' '}
              <Tex>{T`10^7`}</Tex> times the curvature of typical ones, and along
              them the KL saturates within 0.3% of the update norm. A
              finite-difference product measures a secant across its step, and
              across a region where the KL saturates the secant is smaller than
              the curvature at the starting point. It underestimated the curvature
              sixteen-fold at a logit step of 0.3 and by 40% at 0.03. With the
              curvature underestimated, CG took steps that were too long.
            </p>
            <p>
              <span className="am-runin">The guarded merge.</span> We use
              a finite-difference logit step of 0.01, run three CG iterations
              from the summed update <Tex tail=",">{T`d_\Sigma`}</Tex> and
              choose <Tex>{T`\gamma\in\{0,\tfrac14,\tfrac12,1\}`}</Tex> along{' '}
              <Tex>{T`d(\gamma)=d_\Sigma+\gamma(x_{\rm CG}-d_\Sigma)`}</Tex> by
              the true KL on held-out rollouts of the trainers. Since{' '}
              <Tex>{T`\gamma=0`}</Tex> is the sum, the chosen point is never
              worse than the sum up to estimation error, and no quadratic
              assumption is needed for that (<a className="am-ref" href="#prop-5">Proposition 5</a>, <a className="am-ref" href="#app-c">Appendix C</a>).
            </p>
            <div className="am-table" id="table-2">
              <table>
                <thead>
                  <tr>
                    <th>Merge</th>
                    <th className="am-num">
                      <Tex>{T`\gamma=1`}</Tex>
                    </th>
                    <th className="am-num">
                      <Tex>{T`\gamma=\tfrac12`}</Tex>
                    </th>
                    <th className="am-num">
                      <Tex>{T`\gamma=\tfrac14`}</Tex>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>No merge (stay at the anchor)</td>
                    <td className="am-num" colSpan={3}>
                      125.3
                    </td>
                  </tr>
                  <tr>
                    <td>Average of the updates</td>
                    <td className="am-num" colSpan={3}>
                      30.7
                    </td>
                  </tr>
                  <tr>
                    <td>Sum of the updates</td>
                    <td className="am-num" colSpan={3}>
                      13.35
                    </td>
                  </tr>
                  <tr>
                    <td>CG, 1 iteration</td>
                    <td className="am-num">10.71</td>
                    <td className="am-num">10.05</td>
                    <td className="am-num">11.23</td>
                  </tr>
                  <tr>
                    <td>CG, 2 iterations</td>
                    <td className="am-num">10.44</td>
                    <td className="am-num">8.74</td>
                    <td className="am-num">10.11</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>CG, 3 iterations</strong>
                    </td>
                    <td className="am-num">11.10</td>
                    <td className="am-num">
                      <strong>8.57</strong>
                    </td>
                    <td className="am-num">9.91</td>
                  </tr>
                  <tr>
                    <td>CG, 5 iterations</td>
                    <td className="am-num">14.07</td>
                    <td className="am-num">9.34</td>
                    <td className="am-num">10.08</td>
                  </tr>
                  <tr>
                    <td>CG, 10 iterations</td>
                    <td className="am-num">21.89</td>
                    <td className="am-num">11.46</td>
                    <td className="am-num">10.55</td>
                  </tr>
                  <tr>
                    <td>CG, 3 iterations, finite-difference step 0.3</td>
                    <td className="am-num">214.66</td>
                    <td className="am-num">52.73</td>
                    <td className="am-num">17.40</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '14px' }}>
              <strong>Table 2.</strong> Held-out KL residual{' '}
              <Tex>{T`\sum_i\mathrm{KL}(P^i_{\theta_i}\|P^i_{\rm merge})`}</Tex>{' '}
              in nats, for two trainers branched from the 9B model (math, 40
              steps; instruction following, 30 steps) with drifts of 76.4 and
              49.0 nats. Lower is better. Finite-difference logit step 0.01
              except in the last row. Values for <Tex>{T`\gamma=0`}</Tex> are
              the sum.
            </p>
            <p>
              Three iterations plus the line search cut the residual by 36%
              relative to the sum (13.35 to 8.57 nats) and by 72% relative to
              averaging, in about ten minutes: four Fisher-vector products and
              four forward passes. The full CG step never has a lower residual
              than the half step, five or more iterations increase the residual,
              and a large finite-difference step of 0.3 raises the full step’s
              residual to 113 nats after two iterations and 215 after three. This
              is a single test case, with two domains on one model. The main run uses a
              Jacobi-preconditioned variant: five CG iterations from the sum, a
              central logit step of 0.03 and{' '}
              <Tex tail=".">{T`\gamma\in\{0,\tfrac12,1\}`}</Tex> With eight
              trainers it cut the held-out residual by 44–78% relative to the sum
              at all seven rendezvous so far, and the full step was best at six
              of them, so preconditioning appears to remove most of the
              overshoot. At two of the first five rendezvous the plain sum was further from the trainers than not
              merging at all, at 1.51 and 1.04 times the no-merge residual, so
              summing updates during training can be worse than not merging (<a className="am-ref" href="#table-c2">Table C2</a>).
              The guard was also triggered in that run. At the seventh
              rendezvous the full solve put a trainer above its ceiling at every
              step size, so the guard deferred the math trainer’s update to
              the next rendezvous, solved again over the other trainers and
              installed the result at half its length, 44% below the sum.
            </p>
          </div>

          <figure id="fig-4">
            <ResidualChart />
            <figcaption>
              <strong>Figure 4.</strong> Held-out KL residual of the guarded
              merge after one to ten CG iterations, for three damping factors{' '}
              <Tex>{T`\gamma`}</Tex> along the path from the summed update (data
              of <a className="am-ref" href="#table-2">Table 2</a>). Dashed lines mark the sum (13.35 nats) and the
              average (30.7); not merging gives 125.3. At the default
              finite-difference step every damped step stays below the sum, and the residual is lowest at three
              iterations with <Tex tail=",">{T`\gamma=\tfrac12`}</Tex> the
              default. The full step’s residual rises after two iterations, and
              with a finite-difference step of 0.3 two of the three settings lie
              above the plotted range.
            </figcaption>
          </figure>
          <div className="am-prose">
            <p>
              <span className="am-runin">Scaling to frontier models.</span> We
              now consider models at frontier size, hundreds of billions to
              trillions of parameters, and describe the optimisations and analysis
              we expect OPM to need there. Four of them reduce the cost of a
              merge; three more concern how the merge fits into asynchronous training. The
              runs that would confirm each are listed at the end of the section.
            </p>
            <p>
              <Key>Fewer tokens.</Key> A small fraction of tokens contributes
              most of the Fisher. For one token, the Fisher in logit space is{' '}
              <Tex tail=",">{T`\mathrm{diag}(p)-pp^\top`}</Tex> the covariance
              of the next-token distribution, and its size is its trace,{' '}
              <Tex tail=".">{T`1-\sum_ap_a^2`}</Tex> On a low-entropy
              token, <Tex>p</Tex> is nearly one-hot and the trace is nearly
              zero, so the token adds almost nothing to{' '}
              <Tex>{T`F_iv`}</Tex> regardless of its compute cost. Reasoning
              traces are mostly such tokens: only about a fifth are high-entropy
              forks, and those carry most of the RL signal{' '}
              <Cite k="wang2025b" />. We can therefore sample tokens with
              probability proportional to <Tex tail=",">{T`1-\sum_ap_a^2`}</Tex>{' '}
              weight each by the inverse of that probability so the estimate
              stays unbiased, and keep only the top few logits of each token to
              trim the vocabulary head. A simpler rule already gives
              most of the saving. Our run computes the Fisher only on the
              first 2,048 action tokens of each rollout, 22% of a math
              rollout’s tokens, at almost no loss in quality. Subsampling within that
              prefix did not help. On the <a className="am-ref" href="#table-2">Table 2</a> test case, keeping 5–50%
              of the prefix tokens, by entropy or uniformly, left the time per
              product unchanged (17–19 s against 18 s with every token), because
              the forward and backward passes still run over the whole context,
              and raised the residual from 8.3 to 8.6–11.7 nats.
            </p>
            <p>
              <Key>Exact, cheaper products.</Key> The finite difference adds
              compute and caused the overshoot above. A Jacobian-vector
              product followed by a vector-Jacobian product computes the
              Gauss–Newton product exactly, with no step to tune. CG then
              uses the true local curvature, and the guard is kept as a
              precaution but is no longer required. Running the products in bf16
              with fp32 accumulation cuts <Tex>{T`c_{\rm FVP}`}</Tex> further,
              as long as the merge’s own arithmetic stays in fp32, above the
              bf16 floor. The difficulty is in the implementation, because forward-mode differentiation
              has to pass through fused attention and expert kernels, which few
              training stacks support today. We have not built this yet.
            </p>
            <p>
              <Key>A subspace solve.</Key> CG searches the whole parameter
              space. The trainers’ updates span a low-dimensional subspace that
              can serve as a basis for a merge. Restricting the merge to{' '}
              <Tex>{T`\bar\theta+\sum_kc_k\Delta_k`}</Tex> turns (2) into an{' '}
              <Tex>{T`n\times n`}</Tex> linear system whose entries,{' '}
              <Tex tail=",">{T`\sum_i\Delta_j^\top F_i\Delta_k`}</Tex> are
              the summed domain Fishers evaluated on each pair of updates. The
              result is task arithmetic with Fisher-optimal coefficients, and
              splitting the inner products by layer or by expert gives one
              coefficient per block from the same products. Each trainer
              computes <Tex>{T`F_i\Delta_k`}</Tex> for every <Tex>k</Tex> on
              its own data, in parallel, and sends <Tex>{T`n^2`}</Tex> numbers.
              That is <Tex>n</Tex> products instead of <Tex>K</Tex> sequential
              ones, so it does not always save compute, but it removes every
              full-size all-reduce beyond the exchange of updates that any merge
              needs, which makes it feasible to place trainers in different
              clusters. The subspace solution is also a better starting point
              for CG than the sum, and a rendezvous can warm-start from the
              previous one. In our 9B run, however, 99.5–99.7% of the CG
              correction to the sum lay outside the span of the updates, so one
              coefficient per update can only rescale the updates. Finer blocks
              recover much of the correction. On the <a className="am-ref" href="#table-2">Table 2</a> test case a global
              subspace solve recovered 48% of CG’s reduction of the residual,
              one coefficient per parameter type 51%, one per layer 70% and one
              per layer and type 72%, for two Fisher-vector products against
              about eight for CG.
            </p>
            <p>
              <Key>Experts.</Key> Mixture-of-experts layers give the
              Fisher a block structure. An expert’s block sums only over the
              tokens routed to it, so where domains use different experts their
              blocks barely overlap and (2) reduces to the plain sum there; the
              coupling, and the CG work, concentrate in attention, embeddings,
              shared experts and the router. Routing also adds a locality
              condition of its own. A merge that flips the top-<Tex>k</Tex>{' '}
              choice for many tokens moves them onto different experts, outside
              any quadratic model, so the fraction of flipped routes should be
              tracked alongside <Tex>{T`\kappa`}</Tex> as a per-rendezvous diagnostic. In a
              proxy test on Qwen3-30B-A3B, a
              perturbation of{' '}
              <Tex>{T`7\times10^{-5}`}</Tex> nats per token already changed the
              top-8 expert set for 2% of token–layer pairs, and about 7% at a
              rendezvous-sized KL, where KL grows almost linearly with step size
              and <Tex>{T`\kappa`}</Tex> is no longer meaningful. A merge for
              mixture-of-experts models will need to be routing-aware. The
              Fisher-vector product takes about 12 training passes per
              token on that model against 13 on the 9B dense one, so its compute
              scales with active parameters.
            </p>
            <p>
              <Key>Memory.</Key> At frontier scale, memory is the larger cost. A
              full-parameter trainer holds about 16 bytes per parameter (bf16
              weights, fp32 master weights, two fp32 Adam moments and the
              gradient), 16 TB at a trillion parameters. Multi-task RL already
              holds one such state, sharded across thousands of GPUs; OPM would
              hold one per trainer. Any recipe that trains domains separately
              has this requirement: the recipe in recent frontier reports already trains a
              specialist per domain before distilling them{' '}
              <Cite k={['deepseek2026', 'kimi2026', 'ma2026']} />, which needs the
              same <Tex>n</Tex> training states, and MOPD then keeps the{' '}
              <Tex>n</Tex> teachers resident on top. Four choices reduce it to close to one copy
              without changing the method. Asynchronous RL is bound by rollouts,
              so its training GPUs are often idle: one shared training pool can
              step the <Tex>n</Tex> trainers in turn and keep the idle trainers’
              sharded states in host memory, where a 16 TB state spread over
              2,048 GPUs is about 8 GB per GPU per domain and swaps in in well
              under a second. The trainers can share the anchor’s fp32 master
              weights and keep only their own update <Tex>{T`\Delta_i`}</Tex> in
              bf16, which is accurate because the update is small. Adam’s
              moments can be kept in bf16, but per trainer, since sharing them
              would undo optimizer isolation. And experts a domain barely routes
              to keep the anchor’s weights and need no optimizer state of their
              own, so the trainers can share them copy-on-write. Together these
              leave roughly 4–6 bytes per parameter for each additional domain,
              in host memory rather than on the GPU, with added swap and
              synchronisation time; grouping domains (
              <a className="am-ref" href="#discussion">Discussion</a>) divides
              what remains.
            </p>
            <p>
              <span className="am-runin">
                Asynchronous RL and training–inference mismatch.
              </span>{' '}
              Frontier rollouts are not quite on-policy. Inference engines run
              weights a few steps old, with different kernels and often lower
              precision, so the token probabilities they sample from differ from
              the trainer’s, and trainers correct the gap with truncated
              importance sampling <Cite k={['yao2025', 'ling2025']} />. This
              affects OPM directly, since the range property relies on the
              gradient and the Fisher being expectations under the same
              distribution. Three choices preserve this property.
            </p>
            <p>
              <Key>A logit-space Fisher.</Key> Compute the Fisher per token as{' '}
              <Tex tail=",">{T`J_t^\top\big(\mathrm{diag}(p_t)-p_tp_t^\top\big)J_t`}</Tex>{' '}
              with <Tex>{T`p_t`}</Tex> the trainer’s own recomputed next-token
              distribution, rather than from the score of the sampled token. Staleness
              and mismatch enter through the sampled token, and this form does
              not use it; it averages over the whole vocabulary
              under the trainer’s distribution. It is also centred by
              construction, because <Tex>{T`\mathrm{diag}(p)-pp^\top`}</Tex> is
              the covariance of the one-hot token under <Tex tail=".">p</Tex> A
              Fisher built from sampled scores would need per-token importance
              weights and explicit score centring, since the score has mean zero
              only under the trainer’s own policy. What remains is a shift in
              which histories get visited, of the size of the per-token KL
              between the rollout and trainer policies, which truncated prefix
              weights correct for.
            </p>
            <p>
              <Key>Policy lag from a merge.</Key> After a merge, the
              rollouts still in flight were sampled by the pre-merge weights, so
              they are stale by the merge’s displacement. The importance weights
              the trainer already applies handle that, as long as the per-token
              KL a merge introduces stays within the range those weights are
              tuned for. Measured on held-out rollouts, a rendezvous of our 9B
              run moved each trainer by 0.0002–0.0026 nats per token, about half
              to one step of the trainers’ own train–inference KL; the plain sum
              would have moved them 3–5 times as far. This is a reason to bound a merge per token
              rather than per rollout. Our 9B run uses a simpler rule and
              drops groups sampled entirely by the pre-merge weights.
            </p>
            <p>
              <Key>Hidden latency.</Key> The merge need not stop training. Solve
              it on a snapshot of the trainers while they keep stepping, then add{' '}
              <Tex>{T`\theta^{+}-\theta_{\rm snapshot}`}</Tex> to every
              trainer. The correction is then a few steps stale, and asynchronous
              RL is already designed to handle staleness of this kind. We have not implemented this: in
              our runs every trainer waits for the merge.
            </p>
            <p>
              The precision of the serving stack sets a lower limit for all of the above. Casting an
              fp32 specialist to bf16 moves its policy by 25–40% of its RL drift
              (<a className="am-ref" href="#findings">Side findings</a>), so the triggers, residual targets and the guard’s thresholds all
              have to be set above the mismatch between the engines that sample and
              the trainer that learns.
            </p>
          </div>
          <Placeholder label="Efficiency experiments" status="need experiment">
            <ul>
              <li>
                【need experiment: asynchronous snapshot merge. Solve the merge
                on snapshots while the trainers keep stepping, then add{' '}
                <Tex>{T`\theta^{+}-\theta_{\rm snapshot}`}</Tex> to every
                trainer. Today every trainer waits 48–57 minutes per rendezvous,
                6–19% of a round. Report wall-clock overhead per rendezvous,
                held-out residual and per-token KL at install against the
                blocking merge, and train reward around installs. Two trainers
                first, then the 9B run.】
              </li>
              <li>
                【need experiment: run the merge’s products in the trainer GPUs’
                idle time. Each trainer GPU computes for 29–35 minutes of a 5–15
                hour round and waits for rollouts the rest of the time. Report
                extra GPUs needed (target: none) and the effect on rollout-to-train
                latency.】
              </li>
              <li>
                【need experiment: balance Fisher-vector products across all
                trainer GPUs by context tokens instead of 64 rollouts per
                trainer. Merge compute follows the slowest trainer, 22–30 minutes
                against a mean of 15–24; instruction following finishes in 4.5
                minutes, while software engineering and knowledge work carry long
                environment contexts. Report merge compute time and residual.】
              </li>
              <li>
                【need experiment: fewer products per merge. The per-layer and
                per-type subspace solve as the starting point of CG, followed by
                one or two iterations, and CG warm-started from the previous
                rendezvous. Report products per merge and held-out residual
                against five-iteration preconditioned CG, on the{' '}
                <a className="am-ref" href="#table-2">Table 2</a> test case first,
                then at 9B.】
              </li>
              <li>
                【need experiment: each trainer’s Adam second moment as the
                Jacobi diagonal in place of the Monte Carlo estimate, which takes
                about 1.5 minutes per merge. Report CG iterations to the same
                residual.】
              </li>
              <li>
                【need experiment: JVP–VJP products, or bf16 products with fp32
                accumulation. The fp32 finite-difference product takes the time
                of about 16 bf16 gradient passes for the FLOPs of about 1.3.
                Report time per product, residual, and whether unpreconditioned
                CG still overshoots.】
              </li>
              <li>
                【need experiment: trainers time-sharing one training pool with
                optimizer states offloaded, since each trainer computes 6–11% of
                the time. Report training GPUs against multi-task RL and the
                overhead per step.】
              </li>
              <li>
                【need experiment: cost in FLOPs. Table 5 split into rollout,
                training, merge, teacher scoring and idle time per arm, and score
                against cumulative FLOPs with multi-task RL’s intermediate
                checkpoints as a curve.】
              </li>
            </ul>
          </Placeholder>

          {/* ------------------------------------------------------------ */}
          <SectionTitle
            label="A first test on released specialists"
            id="oneshot"
          />
          <div className="am-prose">
            <p>
              Before training anything, we can test the merge rule on RL
              specialists that someone else trained. <CiteT k="wu2026" />{' '}
              released five 300-step GRPO specialists of Qwen3-4B-Instruct-2507
              in fp32 (math, science, code, instruction following and a
              tool-using agent), together with their own task-arithmetic, mixed-RL
              and MOPD models and their evaluation. We merged the five
              specialists once with (2): ten CG iterations from the summed
              update, with exact per-token Fisher-vector products on 256 of each
              specialist’s own rollouts, and no training or student rollouts.
              This tests the merge operator without the training loop, in its least
              favourable setting: a single merge after 75 to 248 nats of drift. It also
              lets us check three things the theory predicts.
            </p>
            <p>
              <span className="am-runin">Comparison with the theory.</span>{' '}
              The quadratic model still holds at this drift: the locality ratio{' '}
              <Tex>{T`\kappa`}</Tex> toward the merged points is 0.96–1.17,
              where an exact quadratic gives 1, and plain CG did not overshoot
              here. The merged model stays closer in KL to each specialist than the
              other rules do. On held-out prompts its KL residual is 0.31 of the
              drift, against 0.52 for task arithmetic, 0.34 for the released MOPD
              model and 1.12 for the sum, and 0.16 after 30 iterations. For a
              domain whose action probabilities the other domains’ updates change
              little, the round is{' '}
              <Key>close to lossless</Key>. The residual is 0.025 of the drift
              for the instruction-following specialist and 0.037 for the agent,
              against 0.26 for task arithmetic.
            </p>
            <div className="am-table" id="table-3">
              <table>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th className="am-num">AIME 25+26</th>
                    <th className="am-num">GPQA</th>
                    <th className="am-num">LCB v6</th>
                    <th className="am-num">IFEval</th>
                    <th className="am-num">IFBench</th>
                    <th className="am-num">BFCL v3</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Base</td>
                    <td className="am-num">49.4</td>
                    <td className="am-num">57.4</td>
                    <td className="am-num">59.9</td>
                    <td className="am-num">83.7</td>
                    <td className="am-num">30.7</td>
                    <td className="am-num">63.8</td>
                  </tr>
                  <tr>
                    <td>Specialist, own domain</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.00 }}>54.5</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.03 }}>61.7</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.00 }}>63.7</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.89 }}>89.6</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.74 }}>48.9</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.44 }}>72.4</td>
                  </tr>
                  <tr>
                    <td>Task arithmetic, λ = 0.6</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.55 }}>57.1</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.79 }}>63.9</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.03 }}>63.8</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.51 }}>88.2</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.02 }}>40.4</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.00 }}>71.7</td>
                  </tr>
                  <tr>
                    <td>Mixed RL (released)</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.40 }}>56.4</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.00 }}>61.6</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.16 }}>64.2</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.00 }}>86.3</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.00 }}>40.2</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.00 }}>71.7</td>
                  </tr>
                  <tr>
                    <td>MOPD (released)</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.30 }}>55.9</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.45 }}>62.9</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.06 }}>63.9</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.76 }}>89.1</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.55 }}>46.7</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.56 }}>72.6</td>
                  </tr>
                  <tr>
                    <td>Sum, λ = 1</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 1.00 }}><strong>59.2</strong></td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 1.00 }}><strong>64.5</strong></td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.23 }}>64.4</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.89 }}>89.6</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.77 }}>49.3</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.44 }}>72.4</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>OPM merge</strong>, 10 CG iterations
                    </td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.15 }}>55.2</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.48 }}>63.0</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.61 }}>65.6</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.86 }}>89.5</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.87 }}>50.5</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 1.00 }}><strong>73.3</strong></td>
                  </tr>
                  <tr>
                    <td>OPM merge, 30 CG iterations</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.51 }}>56.9</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.41 }}>62.8</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.94 }}>66.6</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.73 }}>89.0</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.90 }}>50.8</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.81 }}>73.0</td>
                  </tr>
                  <tr>
                    <td>OPM merge, 10 iterations, deployed in fp32</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.70 }}>57.8</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.86 }}>64.1</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 1.00 }}><strong>66.8</strong></td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 1.00 }}><strong>90.0</strong></td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 1.00 }}><strong>52.0</strong></td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.50 }}>72.5</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '14px' }}>
              <strong>Table 3.</strong> One-shot merges of the five released
              Qwen3-4B specialists of <CiteT k="wu2026" />, mean over 32 samples
              per prompt, in percent. AIME pools the 2025 and 2026 problems (60
              in all), and LiveCodeBench is v6. The domains are math (AIME),
              science (GPQA-Diamond), code (LCB v6), instruction following
              (IFEval and IFBench) and tool use (BFCL v3). Within each column, darker shading is a
              higher score and bold is the highest; the base model is left
              unshaded as the reference. All merged models are deployed in bf16
              except the last row. The specialist row takes each benchmark from
              its own domain’s specialist. Per-benchmark paired intervals are{' '}
              <Pending>being recomputed</Pending>.
            </p>
            <p>
              <span className="am-runin">On benchmarks it beats task arithmetic and MOPD.</span>{' '}
              In <a className="am-ref" href="#table-3">Table 3</a>, the one-shot
              OPM merge scores above task arithmetic on four of the six
              benchmarks and above the released MOPD model on five, using no
              rollouts beyond the 256 per domain used to estimate the Fisher. The
              gains are largest on the domains that overlap least with the others.
              On IFBench it scores 50.5, against 40.4 for task arithmetic, 46.7 for
              MOPD and 48.9 for the instruction-following specialist itself, and
              on LiveCodeBench 65.6 against 63.8 and 63.9. It scores below task
              arithmetic on AIME (55.2 against 57.1) and GPQA (63.0 against 63.9),
              the two domains where, as the next paragraph shows, the other
              domains’ updates raise the score. Deploying the same merge in fp32
              raises five of the six scores further (
              <a className="am-ref" href="#findings">Side findings</a>).
            </p>
            <p>
              <span className="am-runin">Summation scores higher on math and science.</span>{' '}
              At the same bf16 precision, plain summation beats the OPM merge on
              AIME by 4.0 points and on GPQA by 1.5, although its KL residual is
              almost four times larger; with 30 CG iterations the AIME gap
              shrinks to 2.3.{' '}
              <a className="am-ref" href="#thm-1">Theorem 1</a> predicts this
              gap, so it does not indicate a fault in the metric. Math, science
              and code have positive transfer between them. The summed model
              scores above each reasoning specialist on that specialist’s own
              benchmark, and the estimated cross-domain term is positive on all
              three, 0.17 to 0.26 of each domain’s own gain. The OPM merge keeps
              each domain’s behaviour close to its specialist’s and therefore does
              not obtain this transfer, as the theory predicts. On instruction
              following and the agent, whose behaviour the other domains’ updates
              change little, the sum and the OPM merge tie. The KL residual
              therefore measures how closely the merge retains each specialist’s
              behaviour, and a lower residual does not imply a higher reward.
            </p>
            <p>
              <span className="am-runin">Scope of the 4B result.</span>{' '}
              One-shot at 4B, the OPM merge scores above task arithmetic and MOPD
              but not above the sum. Because the quadratic model held, its
              shortfall against the sum comes from overlap between the reasoning
              domains and not from a failure of locality. On these results a
              one-shot OPM merge is a useful post-hoc method for combining
              released specialists. One result points the other way. A Fisher
              computed on the base model’s rollouts instead of each specialist’s
              own gives a higher KL residual but ties on benchmarks, so the case
              for the on-policy metric does not rest on this experiment. Merging
              during training adds the remaining components of{' '}
              <a className="am-ref" href="#why-meet-often">
                Why meet often
              </a>
              , namely calibrated weights and a further round of RL that reduces
              the residual. The main experiment tests these.{' '}
              <a className="am-ref" href="#app-d">Appendix D</a> has the full
              residual tables, the interference matrix, the other merge
              variants and the evaluation protocol.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Main results" id="results" />
          <div className="am-prose">
            <p>
              <span className="am-runin">Setting.</span> The main comparison
              trains MiMo-V2.6-Distill-Qwen-9B <Cite k="mimo2026" /> on eight
              domains that public frontier recipes train with RL: software
              engineering, terminal, cyber, knowledge work, search, tool use,
              hard math and instruction following. Verifiers are executable
              tests, rule checkers, state checks and, for knowledge work, a
              rubric judge. Agentic episodes run up to 150 turns and 128k
              tokens. All arms share one RL framework (slime), one GRPO recipe,
              one chat template with thinking on, the same verifiers, harnesses
              and evaluation, and no reference-KL penalty. The budget is matched
              in environment rollouts per domain, counting MOPD’s student
              rollouts. This matches the tokens each arm trains on. It does not
              match the number of optimizer steps: multi-task RL takes one step
              per mixed batch of all eight domains, while each OPM trainer and
              each specialist steps on batches of its own domain. GPU-hours and
              wall-clock are reported separately. All
              arms are reported at their final checkpoints except in math, where
              held-out math declines late in training under continued math RL,
              with or without merging. The math specialist, which A2 merges and
              A3 distils from, is taken at step 210, chosen on held-out math, and
              OPM’s math trainer stops at step 228. Multi-task RL cannot stop one
              domain alone and is reported at its final checkpoint; final-step
              math scores for every arm are in <a className="am-ref" href="#app-f">Appendix F</a>, which also gives every
              other detail.
            </p>
            <ul>
              <li>
                <strong>A1 · Multi-task RL.</strong> One trainer on all eight
                domains. To make it a strong baseline it uses per-domain rollout
                quotas matched to the budget, ledger-normalised gradient shares,
                deficit scheduling with replay for slow domains, per-domain
                length and turn budgets, and a tuned learning rate.
              </li>
              <li>
                <strong>A2 · Merge-after.</strong> Eight specialists trained to
                the full budget and merged once. We report the best of task
                arithmetic with <Tex>{T`\lambda\in\{0.4,0.6,0.8,1.0\}`}</Tex>{' '}
                (chosen on held-out reward), DARE, TIES, the closed-form merge
                of <CiteT k="liu2026" /> (whose linearisation error at eight
                domains, 0.42, is outside the 0.10 the paper allows), and a
                one-shot OPM merge.
              </li>
              <li>
                <strong>A3 · MOPD.</strong> The same eight specialists as
                teachers.
              </li>
              <li>
                <strong>A4 · OPM.</strong> Eight trainers, KL-triggered
                rendezvous, and the guarded merge described above.
              </li>
            </ul>
          </div>

          <Placeholder label="Headline paragraph" status="pending main runs">
            <p>
              Per-domain scores of A4 against A1–A3 at matched rollouts, with
              confidence intervals: on which domains A4 wins and loses, and one
              sentence per baseline on where the gap comes from.
            </p>
          </Placeholder>

          <div className="am-prose">
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>Arm</th>
                    <th className="am-num">SWE-rebench</th>
                    <th className="am-num">TB 2.1</th>
                    <th className="am-num">Cyber</th>
                    <th className="am-num">GDPval-AA</th>
                    <th className="am-num">BC-Plus</th>
                    <th className="am-num">τ²</th>
                    <th className="am-num">AIME26</th>
                    <th className="am-num">IFBench</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Base</td>
                    <td className="am-num"><Pending>–</Pending></td>
                    <td className="am-num">12.8</td>
                    <td className="am-num">84.5</td>
                    <td className="am-num"><Pending>–</Pending></td>
                    <td className="am-num">11.0</td>
                    <td className="am-num">72.5 ± 3.8</td>
                    <td className="am-num">65.3 ± 6.4</td>
                    <td className="am-num">27.8</td>
                  </tr>
                  <tr>
                    <td>Specialists, own domain</td>
                    <td className="am-num"><Pending>–</Pending></td>
                    <td className="am-num">23.4</td>
                    <td className="am-num">94.7</td>
                    <td className="am-num">40.5*</td>
                    <td className="am-num"><Pending>–</Pending></td>
                    <td className="am-num">61.0</td>
                    <td className="am-num"><Pending>–</Pending></td>
                    <td className="am-num">68.5</td>
                  </tr>
                  <PendingRow label="A1 · Multi-task RL" n={8} />
                  <PendingRow label="A2 · Merge-after, best" n={8} />
                  <PendingRow label="A3 · MOPD" n={8} />
                  <PendingRow label={<strong>A4 · OPM</strong>} n={8} />
                </tbody>
              </table>
            </div>
          </div>
          <Placeholder
            label="Table 4"
            status="pending main runs (A1–A4, seed 1)"
          >
            <p>
              Per-domain scores: SWE-rebench, Terminal-Bench 2.1, MiMo
              Cyber (mini), GDPval-AA, BrowseComp-Plus, τ²-Bench,
              AIME26, IFBench, each ± its uncertainty over tasks and samples.
              Secondary benchmarks per domain (SWE-bench Pro, HMMT Feb 26,
              IFEval, BFCL v4) and the held-out suite (MMLU-Pro, GPQA, HLE) go
              in <a className="am-ref" href="#app-f">Appendix F</a>.
            </p>
          </Placeholder>

          <div className="am-prose">
            <p>
              <span className="am-runin">Cost.</span> The arms use compute in
              different stages. Multi-task RL has no separate combining step. For
              MOPD, combining is a second stage that needs student rollouts in
              every domain, including agentic sandboxes, and teacher scoring of
              every student token. For OPM, combining is the merges, which need no
              environment interaction: a few Fisher-vector products per trainer on
              cached rollouts and four forward passes for the line search. In the
              eight-domain 9B run so far, one rendezvous takes 37–70 minutes of
              wall-clock, during which the trainers wait. The merge runs on the
              trainers’ own GPUs, which otherwise run training steps 6–11% of the
              time, and uses 0.6–0.9 times their training GPU time, which we
              estimate at 5–7% of their training FLOPs (<a className="am-ref" href="#engineering">Computing the merge at scale</a>).
            </p>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>Arm</th>
                    <th className="am-num">Env. rollouts</th>
                    <th className="am-num">Student rollouts</th>
                    <th className="am-num">Teacher scoring (GPU-h)</th>
                    <th className="am-num">Merges (GPU-h)</th>
                    <th className="am-num">Total (GPU-h)</th>
                    <th className="am-num">Wall-clock</th>
                  </tr>
                </thead>
                <tbody>
                  <PendingRow label="A1 · Multi-task RL" n={6} />
                  <PendingRow label="A2 · Merge-after" n={6} />
                  <PendingRow label="A3 · MOPD" n={6} />
                  <PendingRow label={<strong>A4 · OPM</strong>} n={6} />
                </tbody>
              </table>
            </div>
          </div>
          <Placeholder label="Table 5" status="pending main runs (ledger)">
            <p>
              Cost per arm from the shared ledger, seed 1: environment rollouts
              per domain (matched by design), student rollouts, teacher-scoring
              and merge GPU-hours, total GPU-hours and wall-clock. Also the
              number of OPM rendezvous and the mean wall-clock per merge.
            </p>
          </Placeholder>

          <div className="am-prose">
            <p id="coupling">
              <span className="am-runin">Where the domains couple.</span> The
              theory names three channels through which multi-task RL couples
              domains (<a className="am-ref" href="#gradient-channels">In terms of gradients</a>),
              and in our 9B runs their measured sizes differ widely. Policy
              gradients of different domains have cosines of at most 0.02 at a
              common point, no larger than the cosine between two halves of one
              domain’s batch, so at this scale a policy gradient is mostly sampling
              noise. The trainers’ updates are even closer to orthogonal, with
              cosines of at most 0.0023 between any two of the eight at every
              rendezvous. Even so, the other trainers’ summed updates moved the
              small-drift software-engineering trainer by 6–14 times its own drift
              and the terminal trainer by 5–6 times, while they moved instruction
              following by only 0.14–0.35 of its own. The global clip was never
              triggered: over 110 steps of the eight-domain multi-task run, the
              largest pre-clip gradient norm was 0.18 against a threshold of 1.0.
              In our recipe the clip channel is therefore inactive, and the domains
              are coupled through the shared update and Adam’s second moment.
            </p>
          </div>
          <Placeholder label="Adam coupling" status="need experiment">
            <p>
              【need experiment: in the multi-task run, the Adam-preconditioned
              gradient cosines between domains and how much the shared second
              moment lowers each domain’s effective learning rate.】
            </p>
          </Placeholder>

          <div className="am-prose">
            <p>
              <span className="am-runin">Transfer.</span> <a className="am-ref" href="#thm-1">Theorem 1</a> makes a
              testable prediction about the domains on which OPM should score
              lower. Per domain and rendezvous, the sign of{' '}
              <Tex>{T`J_j(\text{sum})-J_j(\text{OPM})`}</Tex> should be the sign
              of the transfer term <Tex tail=",">{T`T_j`}</Tex> which each
              trainer can estimate from its own batch with one forward-mode pass
              per rollout. OPM should match or beat multi-task RL on domains whose
              updates conflict with the others’, and trail it on domains with
              positive transfer between them (knowledge work and tool use, or math
              and held-out reasoning) unless trainer learning rates are raised.
              reasoning) unless trainer learning rates are raised. In an
              exact-gradient check the correlation between <Tex>{T`T_j`}</Tex>{' '}
              and the realised gap was 0.84–0.87 for short rounds and fell to
              0.27 for long ones, where second-order terms dominate. Testing it
              at 9B needs <Tex>{T`T_j`}</Tex> and the summed update’s reward at
              every rendezvous, which our run does not record; we leave it to
              future work.
            </p>
          </div>
          <Placeholder label="Table 6" status="pending main runs">
            <p>
              Per-domain score of each arm normalised to that domain’s
              specialist (above 1 means the domain benefits from the others),
              A1–A4, seed 1.
            </p>
          </Placeholder>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Side findings" id="findings" />
          <div className="am-prose">
            <p>
              We measured merges at the level of policies, in exact fp32, and
              logged every rendezvous of the 9B run. Several of the resulting
              findings apply beyond OPM. <a className="am-ref" href="#app-g">Appendix G</a> has the
              numbers.
            </p>
            <p>
              <span className="am-runin">Near-orthogonal updates still interfere.</span>{' '}
              The released specialists’ task vectors are nearly orthogonal, with
              cosines of at most 0.022, yet they interfere strongly. The math
              specialist’s update moves the code specialist’s policy by 1.78
              times the code specialist’s own drift. Interference is measured by the
              Fisher, which weights each direction by how much it changes the
              policy’s action probabilities, and the Fisher’s curvature along the
              directions RL moves is thousands of times larger than along random
              ones. The same holds inside our 9B run: the
              eight trainers’ updates had pairwise cosines of at most 0.0023,
              yet the merge moved the small-drift software-engineering and
              terminal trainers by 1.6–5.4 times their own drift. Cosine
              similarity of task vectors therefore does not indicate whether two
              specialists can be merged.
            </p>
            <p>
              <span className="am-runin">
                Apparent sparsity of RL updates comes from bf16 rounding.
              </span>{' '}
              In fp32 the specialists’ updates are dense: 99.996% of entries are
              nonzero, with a median size of about <Tex>{T`2^{-11}`}</Tex>{' '}
              relative to the weights. Rounding the specialists to bf16 leaves
              only 18% of the update entries nonzero, and the rounded update has
              cosine 0.57 with the true one and an 84% relative error. Claims
              that RL makes sparse updates should be checked against fp32
              weights.
            </p>
            <p>
              <span className="am-runin">Policy change from bf16 casting.</span> Casting
              an fp32 specialist to bf16 moves its policy by 25–40% of its whole
              RL drift, measured in KL on its own rollouts. The same merged
              model deployed in fp32 instead of bf16 scores higher on five of six
              benchmarks, by 2.6 points on AIME. Any merge, trigger or residual threshold therefore has to be
              larger than this casting error, and scoring has to run in true fp32.
            </p>
            <p>
              <span className="am-runin">KL residual and reward change.</span>{' '}
              The sum has the largest KL residual of any merge and the best
              bf16 scores on AIME and GPQA. An exact decomposition accounts for
              this. A return change equals the reward-weighted log-likelihood
              ratio plus a term bounded by the KL. To first order it is{' '}
              <Tex tail=",">{T`\rho\,\sigma\sqrt{2\varepsilon}`}</Tex> with{' '}
              <Tex>{T`\rho`}</Tex> the correlation between reward and the
              log-ratio, <Tex>{T`\sigma`}</Tex> the reward’s standard deviation
              and <Tex>{T`\varepsilon`}</Tex> the KL residual. A large residual therefore lowers reward little when{' '}
              <Tex>{T`\rho\approx0`}</Tex> and raises it when{' '}
              <Tex tail=".">{T`\rho>0`}</Tex> Pinsker-type bounds are vacuous
              above about 2 nats, while specialists drift 75–248 nats.
            </p>
            <p>
              <span className="am-runin">When the sum beats OPM.</span> The sum
              scores higher when domains transfer positively to each other. Two
              per-domain quantities measure this: the part of the others’ updates
              that lies in the range of domain{' '}
              <Tex>j</Tex>’s Fisher (its visibility), and the sign of the transfer term{' '}
              <Tex tail=".">{T`T_j`}</Tex> The 4B reasoning domains are in this
              regime. The instruction-following and agent domains have low
              visibility of the others’ updates, so the sum and the OPM merge tie there. The toy’s conflict variants are
              in the opposite regime, where OPM scores higher. Logging <Tex>{T`T_j`}</Tex>{' '}
              at each rendezvous would show which regime a run is
              in.
            </p>
            <p>
              <span className="am-runin">The merge is the sum plus a correction outside the updates.</span>{' '}
              At every rendezvous of the 9B run the OPM merge differed from the
              plain sum by 7–8% of the sum’s norm, and 99.5–99.7% of that
              difference lay outside the span of the trainers’ updates. A
              reweighting of the updates would stay inside their span, so the
              merge mostly adds a direction that none of the updates contains.
            </p>
            <p>
              <span className="am-runin">Scoring infrastructure failures as zero biases agentic evaluation.</span>{' '}
              When a sandbox or tool server fails, many harnesses score the
              episode as a wrong answer. Re-queuing such episodes instead moved
              the 9B base model from 31.9 to 53.9 on our internal
              software-engineering set, from 6.2 to 9.4 on terminal and from 82.2
              to 85.9 on cyber. Infrastructure failures are not random across
              models, so the bias can change the ranking of models as well as
              their scores.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Discussion" id="discussion" />
          <div className="am-prose">
            <p>
              <span className="am-runin">When to use it.</span> OPM trains
              domains separately. This helps when coupling between domains is
              harmful, as with domains that conflict, many domains with small
              shares each, rollout latencies that differ by orders of magnitude,
              domains whose gradient scales differ enough to interfere through a
              shared clip or Adam state, and teams that want to add, drop, tune
              or fix a domain without retraining the rest. It is slower when
              coupling is beneficial. When domains share skills, multi-task RL or
              the plain sum moves faster along the shared directions, and OPM
              recovers that only through larger trainer steps. The transfer term
              and visibility, both computable at a rendezvous, tell which
              situation a run is in.
            </p>
            <p id="modularity">
              <span className="am-runin">Adding a domain, containing a fault.</span>{' '}
              Because each domain has its own trainer, OPM can change its set of
              domains mid-run. A new skill starts as one more trainer from the
              current anchor and joins at the next rendezvous. Multi-task RL has
              to re-mix its quotas instead, and the new gradients reach every
              domain from the first step. By idle protection (<a className="am-ref" href="#prop-2">Proposition 2</a>), the
              existing domains’ policies are unchanged to first order wherever the
              new trainer’s Fisher range is independent of theirs. The same
              structure limits how far a fault spreads. If one domain’s reward is
              faulty, for example a verifier that gives reward for any
              syntactically valid tool call, the fault reaches the others only
              through the merge, along the Fisher directions they share and by at
              most the ceiling per round. The per-rendezvous diagnostics flag
              that trainer, which can then be rolled back or dropped on its own.
              This requires the guard to be enforced; a merge that admits a
              flagged trainer passes the fault to every domain. In multi-task RL
              the faulty gradients have already reached every weight. We have
              not tested either case; both can be run at low compute cost as
              branches of a main run.
            </p>
            <p>
              <span className="am-runin">Trade-offs.</span> Every rendezvous
              costs a merge and a synchronisation, since every trainer waits for
              the merged model. The merge takes about five minutes for two 9B
              trainers and 37–70 minutes for eight, because each trainer
              computes Fisher products on its own rollouts. Frequent rendezvous provide locality, calibrated
              weights and repair and require many merges; merge-then-polish
              requires only a few. Memory grows with the number of trainers, one
              model copy per domain, which grouping domains reduces. Decoupling
              also loses transfer along shared directions, which a larger trainer
              learning rate recovers only in part.
            </p>
            <p>
              <span className="am-runin">Synchronisation.</span> Multi-task RL
              synchronises all domains at every optimizer step, so each step
              waits for the slowest domain’s episodes or carries them over to the
              next step. OPM synchronises at a rendezvous, every 5–15 hours in our
              run, and a merge does not need every trainer. In our run one
              trainer missed a rendezvous while its machines were down and the
              merge went ahead without it; at another rendezvous the guard
              deferred the math trainer’s update to the next one; and trainers
              that had finished their budget took part with their final weights.
              MOPD needs no synchronisation while the specialists train, so they
              can run at different times on different clusters. Its
              distillation stage starts only after the last specialist finishes,
              and it adds student rollouts in every domain and teacher scoring
              of every student token. OPM’s remaining synchronisation cost is that
              the trainers present at a rendezvous wait for the merge, 6–19% of a
              round in our run. The first step of{' '}
              <a className="am-ref" href="#compute-plan">our plan</a> is meant to
              remove it.
            </p>
            <p>
              <span className="am-runin">Limitations.</span> The guarantees
              assume lossless rounds, and we have not shown that they exist at
              LLM scale. In the 4B merge the residual after 30 CG iterations is
              still 16% of drift on held-out prompts, and the reasoning domains
              overlap. At
              realistic drift, the informative guarantees are second-order or are
              stated in KL rather than in reward. The trajectory Fisher grows with tokens, so
              long-response domains get more weight in shared directions. OPM
              keeps one model copy per domain in memory. The Fisher is estimated
              from a subsample, and the evidence for the guarded merge comes
              from one two-domain test and seven rendezvous of one 9B run. In the one-shot merge, a stale metric
              tied the on-policy one on benchmarks. In the 9B run the merge did
              not keep small-drift trainers in place; it moved the
              software-engineering and terminal trainers by more than their own
              drift. Every 9B arm is a single training run (seed 1), so its
              intervals reflect variation across tasks and samples but not across
              seeds. All results are at 4B and 9B on dense
              models; mixture-of-experts models and larger scales are untested.
            </p>
            <p>
              <span className="am-runin">Related work.</span> The barycenter
              objective comes from Distral and Divide-and-Conquer RL{' '}
              <Cite k={['teh2017', 'ghosh2018']} />, and policy distillation
              into one network from <CiteT k="rusu2016" />. The merge operator
              comes from Fisher merging, RegMean and MaTS{' '}
              <Cite k={['matena2022', 'jin2023', 'tam2024']} />, all applied
              once and in supervised settings. <CiteT k="liu2026" /> showed that
              MOPD is Fisher merging to second order. WARP iterates merging and
              re-initialisation across parallel RLHF runs on one task{' '}
              <Cite k="rame2024" />. Co-Evolving Policy Distillation couples
              per-domain GRPO branches during training through distillation{' '}
              <Cite k="gu2026" />, and M2A merges a math vector into an agent
              only along the null space of agent-critical activations{' '}
              <Cite k="wang2026b" />, which is closely related to <a className="am-ref" href="#thm-1">Theorem 1</a>. Federated
              learning studies periodic averaging under heterogeneity{' '}
              <Cite
                k={['mcmahan2017', 'li2020', 'karimireddy2020', 'wang2020']}
              />
              , including function-space aggregation <Cite k="dhawan2024" />,
              federated GRPO <Cite k="guo2026" /> and federated natural policy
              gradient for multi-task RL <Cite k="yang2023" />. As far as we
              know, OPM is the first to use the on-policy trajectory Fisher
              inside RL, where <a className="am-ref" href="#thm-1">Theorem 1</a> holds, and the first to trigger a
              weight merge on trajectory KL. <a className="am-ref" href="#app-h">Appendix H</a> discusses each in
              detail.
            </p>
            <p>
              <span className="am-runin">How often to merge.</span> The
              rendezvous frequency moves OPM between merge-after, one rendezvous
              at the end, and multi-task RL. In the toy the result depends
              strongly on the interval. At 50 steps per task, merging every 1, 5,
              10, 25 or 50 steps gave 0.97, 0.96, 0.93, 0.34 and 0.08, and a KL
              trigger scored higher than a fixed interval with a similar number of
              rendezvous, 0.987 against 0.88 (<a className="am-ref" href="#app-e">Appendix E</a>). An intermediate setting that needs few merges is
              merge-then-polish, in which specialists train separately as usual
              and a few rendezvous at the end merge them. Measuring this
              curve at 9B is future work.
            </p>
            <p>
              <span className="am-runin">An extension: grouped OPM.</span>{' '}
              Frontier runs train dozens of domains, and the published evidence
              on how they interact is mixed, with differences that appear
              systematic rather than random. Reasoning domains tend to transfer
              positively to each other. RLVR across domains shows small mutual interference and synergy
              among reasoning-intensive domains <Cite k="wang2026a" />, and math,
              code and science benefit from cross-domain training while logic,
              simulation and tabular reasoning need in-domain data{' '}
              <Cite k="cheng2025" />. Other pairs conflict. Math-only GRPO on
              Qwen2.5-7B lowers its code average from 67.46 to 29.59{' '}
              <Cite k="li2025" />; the instruction-following specialist of{' '}
              <CiteT k="wu2026" /> lowers BFCL from 63.9 to 54.1; models trained
              on mixed-domain batches consistently underperform the best
              domain experts <Cite k="cai2026" />; and in a Code → Math → QA →
              writing curriculum, math falls from 66.49 to 57.66 during the later
              stages while the full-model gradient cosine between math and QA
              stays close to zero <Cite k="yang2026b" />. In that last case the
              gradient cosine does not detect the interference, while a
              Fisher-weighted measure can.
            </p>
            <p>
              This suggests a middle ground between one trainer for all domains
              and one per domain. Group the domains that help each other into a
              single multi-task trainer, so their transfer is kept inside the
              group, and give groups that conflict separate trainers that meet
              through the OPM merge. With a single group this is multi-task RL,
              and with one domain per group it is OPM. <a className="am-ref" href="#thm-1">Theorem 1</a> then holds between groups. It
              bounds each group’s change from the other groups’ updates and gives
              no guarantee between domains inside a group. The quantities that decide the grouping can be computed at
              every rendezvous: the visibility of one domain’s
              update in another’s Fisher and the sign of the transfer term{' '}
              <Tex tail=".">{T`T_j`}</Tex> Domains with positive{' '}
              <Tex>{T`T_j`}</Tex> and high mutual visibility should share a group,
              and a pair with negative <Tex>{T`T_j`}</Tex> and high visibility
              should be split. Since a rendezvous is cheap, the grouping can change
              during a run, for example by splitting a group when its members’
              transfer terms turn negative. Grouping also reduces OPM’s memory use
              from one model copy per domain to one per group. We have not run
              it. We plan it as the next experiment, after the main runs show how
              the 9B domains interact.
            </p>
            <p>
              <span className="am-runin">Conclusion.</span> Combining RL domains
              requires choosing how often to merge and in which geometry.
              Merging often in the on-policy KL geometry gives a merge with a
              closed form that removes cross-domain terms of both signs. It
              guarantees per-domain progress where domains can be separated, is
              slower where they agree, and takes from minutes to an hour per
              merge at 9B, depending on the number of trainers. In a single merge at 4B, it scores above task arithmetic and
              MOPD and below the plain sum, as the theory predicts. The pending
              results above will show whether merging often closes that gap and
              how OPM compares with multi-task RL and MOPD at scale.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Citation" id="citation" />
          <div className="am-prose">
            <CopyBib text={BIBTEX} />
          </div>

          {/* ------------------------------------------------------------ */}
          <Appendix />
        </div>
      </article>
    </Container>
  )
}
