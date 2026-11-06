import { type Metadata } from 'next'
import type { ReactNode } from 'react'

import { Container } from '@/components/Container'

import './_styles/merge.css'

import Tex from './_components/Tex'
import SectionTitle from './_components/SectionTitle'
import { ParadigmFigure } from './_components/Figures'
import WeightSpace3D from './_components/WeightSpace3D'
import Landscape3D from './_components/Landscape3D'
import { Cite, CiteT } from './_components/Cite'
import { Placeholder, Pending } from './_components/Placeholder'
import Appendix from './_components/Appendix'
import ReduceMotion from './_components/ReduceMotion'
import SideToc, { type TocItem } from './_components/SideToc'
import SidenoteLayout from './_components/SidenoteLayout'

const T = String.raw

export const metadata: Metadata = {
  title: 'On-Policy Merge Stabilizes Multi-Task Reinforcement Learning',
  description:
    'One on-policy RL trainer per domain, merged during training at the point closest in KL to every trainer on its own fresh rollouts. The closed form, why it decouples domains and what that costs, how to make a merge take ten minutes on a 9B model, and results against multi-task RL, merging after training and multi-teacher on-policy distillation.',
}

const POST = {
  title: 'On-Policy Merge Stabilizes Multi-Task Reinforcement Learning',
  subtitle:
    'Frontier models are post-trained with RL on many domains, and every current way of combining those domains pays somewhere: mixed batches let domains interfere, merging finished specialists loses what they learned, and multi-teacher distillation needs a second round of rollouts and stops at its teachers. On-Policy Merge gives each domain its own on-policy trainer and merges them during training, at the point closest in KL to every trainer on its own fresh rollouts, whenever one has drifted far enough. We derive the merge, show what it guarantees and what it gives up, make it take about ten minutes on a 9B model, and test it.',
  author: 'Bowen Wang',
  date: 'Nov 5, 2026',
  reading: 'Research · 35 min read',
}

// Sections for the table of contents: one entry per <SectionTitle id=...>
// (the appendix has one), plus the introduction above the first of them.
const TOC: TocItem[] = [
  { label: 'Introduction', href: '#introduction' },
  { label: 'Four ways to get one model', href: '#map' },
  { label: 'On-Policy Merge', href: '#method' },
  { label: 'What the merge guarantees, and what it costs', href: '#theory' },
  { label: 'Making the merge cheap', href: '#engineering' },
  { label: 'A first test on released specialists', href: '#oneshot' },
  { label: 'Main results', href: '#results' },
  { label: 'How often to merge', href: '#frequency' },
  { label: 'Adding a skill, containing a fault', href: '#modularity' },
  { label: 'Side findings', href: '#findings' },
  { label: 'Discussion', href: '#discussion' },
  { label: 'Citation', href: '#citation' },
  { label: 'Appendices A–H', href: '#appendix' },
]

const BIBTEX = `@article{wang2026onpolicymerging,
  author  = {Bowen Wang},
  title   = {On-Policy Merge Stabilizes Multi-Task Reinforcement Learning},
  journal = {bowenbryanwang.github.io},
  year    = {2026},
  month   = nov,
  note    = {https://bowenwang.me/blog/on-policy-merge}
}`

function PostHero() {
  return (
    <header className="mb-8 mt-4">
      <h1 className="text-center text-[1.9rem] font-bold leading-[1.2] tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-[clamp(1.9rem,4.4vw,2.6rem)]">
        <span className="sm:whitespace-nowrap">On-Policy Merge Stabilizes</span>{' '}
        <br className="hidden sm:inline" />
        <span className="sm:whitespace-nowrap">
          Multi-Task Reinforcement Learning
        </span>
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
          <figure className="am-fig1">
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
              combines the domains. <strong>Right:</strong> the methods play
              one at a time on the same loss landscape over a slice of weight
              space, each starting from a base model high on the left. Small
              rings mark each domain’s own optimum. Multi-task RL descends on
              the mixed loss and settles in a local optimum. Cascade RL trains
              the domains in turn; each stage pulls the model away from what
              the earlier ones reached, and it ends far from the global basin.
              Merge-after averages five finished specialists once, and the
              merge lands on a ridge. MOPD distils the same specialists into a
              new student trained from the base, which stops at its teachers’
              level. <strong>On-Policy Merge</strong> (OPM) lets the trainers
              move apart only as far as a KL budget <Tex>{T`\delta`}</Tex>{' '}
              allows, then merges them, round after round. Its path passes the
              local optimum and reaches the global minimum. When one trainer
              collapses, the next merge rolls it back. The landscape is an
              illustrative schematic of a conflict case; when domains help each
              other, multi-task RL can be faster.
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
              optimizer and batches that mix rollouts from all of them. The
              mixed batch rests on an assumption that is rarely stated: the
              domains’ updates can simply be added. At every step, what happens
              to a domain is its own gradient plus whatever the other domains’
              gradients do to it.
            </p>
            <p>
              When domains agree, that second term is free transfer. When they
              conflict, it is a tax, and it falls on the domains least able to
              pay: those with a small share of the batch, small gradients, or
              episodes slow enough that the run moves on without them. The
              usual remedies each trade this problem for another. Training
              domains in sequence forgets the earlier ones. Training
              specialists apart and merging their weights once lands tens to
              hundreds of nats from every policy that produced data{' '}
              <Cite k={['ilharco2023', 'yadav2023']} />. Distilling the
              specialists into one student with multi-teacher on-policy
              distillation (MOPD), the recipe in recent frontier reports{' '}
              <Cite k={['deepseek2026', 'kimi2026', 'ma2026']} />, needs a
              second round of rollouts in every domain and at best matches its
              teachers.
            </p>
            <p>
              <strong>On-Policy Merge</strong> (OPM) keeps the specialists’
              independence and gives up only the distance. Each domain trains
              on-policy on its own trainer, from a shared anchor. As soon as any
              trainer has drifted a fixed KL budget <Tex>{T`\delta`}</Tex> from
              the anchor, all of them merge: the anchor moves to the point whose
              policy on each domain is closest in KL to that domain’s trainer,
              measured on the rollouts the trainer has just collected. Every
              trainer reloads it and continues. Train apart, meet often.
            </p>
            <p>
              To second order the merge has a closed form, a Fisher-weighted
              average{' '}
              <Tex tail=",">{T`\theta^{+}=\bar\theta+\big(\sum_iF_i\big)^{+}\sum_iF_i\Delta_i`}</Tex>{' '}
              and the choice of Fisher is what does the work. With{' '}
              <Tex>{T`F_i`}</Tex> taken on trainer <Tex>i</Tex>’s own on-policy
              rollouts, its policy gradient lies in the range of{' '}
              <Tex tail=":">{T`F_i`}</Tex> a change that domain’s Fisher cannot
              see is a change its return cannot feel. Whenever the trainers’
              updates can be reconciled, the merged model therefore keeps every
              domain’s own first-order gain and drops every cross-domain term.
              This is the sense in which OPM stabilizes multi-task RL. Each
              domain improves whenever its own trainer does, whatever the
              batch shares, gradient scales or speeds of the others, and a
              domain that stalls or breaks is held in place rather than
              dragged.
            </p>
            <p>
              Decoupling removes transfer of both signs, so OPM is not a faster
              optimizer, and when domains help each other, summing their
              updates does better. What OPM buys is a per-domain guarantee at a
              measurable price. With a guarded solver, one merge of a 9B model
              takes about ten minutes and needs no environment interaction.
              Merging five released 4B RL specialists once with the OPM rule,
              with no training and no student rollouts, beats task arithmetic
              by 1.7 points and the released MOPD model by 1.1 points on an
              eight-benchmark mean. Plain summation still wins by 0.9, as the
              theory predicts for math, science and code, which help each
              other.
            </p>
            <p>
              The rest of the post places OPM among the existing recipes,
              derives the merge and what it guarantees, shows how to make it
              cheap, and tests it: first on those released specialists, then
              against strong multi-task RL, merging after training and MOPD on
              eight frontier-style domains at 9B. The 9B results are marked as
              pending until the runs finish.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Four ways to get one model" id="map" />
          <div className="am-prose">
            <p>
              Every method for combining RL domains makes two choices: how often
              the domains’ progress is combined, and in which geometry. Placing
              the methods on those two axes shows what each one gives up.
            </p>
          </div>

          <Placeholder label="Figure 2" status="author to draw">
            <p>
              <strong>The unification map.</strong> Horizontal axis: how often
              the domains are combined (every optimizer step; every <Tex>K</Tex>{' '}
              steps; when a KL budget is spent; once, after training). Vertical
              axis: the geometry of the combination (Euclidean in parameter
              space; KL in policy space, with the Fisher measured on the
              student’s states or on each trainer’s own states). Points:
              multi-task RL (every step, Euclidean, one shared optimizer);
              periodic sum or average, the local-SGD and DiLoCo family (every{' '}
              <Tex>K</Tex> steps, Euclidean); task arithmetic, TIES and DARE
              (once, Euclidean); MOPD (once, KL on student states, plus a second
              rollout stage); Distral and Divide-and-Conquer RL (KL, reached by
              distillation); OPM (KL-triggered, KL on trainer states). Cascade
              RL as an annotation: multi-task RL with one domain active at a
              time.
            </p>
          </Placeholder>

          <div className="am-prose">
            <p>
              <strong>Multi-task RL</strong> combines at every step, in
              parameter space: one optimizer receives the sum of the domains’
              gradients, weighted by their token shares in the batch. With plain
              SGD this is exactly the same as running one trainer per domain and
              summing their updates after every step (Appendix A). Combining
              every <Tex>K</Tex> steps instead gives periodic summing or
              averaging, the federated-averaging and DiLoCo family{' '}
              <Cite k={['mcmahan2017', 'douillard2023']} />. Combining once,
              after training, gives <strong>merge-after</strong> methods: task
              arithmetic, TIES and DARE{' '}
              <Cite k={['ilharco2023', 'yadav2023', 'yu2024']} />. Cascade RL
              trains the domains one after another{' '}
              <Cite k={['wang2025', 'yang2026']} />. On this map it is
              multi-task RL with every share but one set to zero, which is why
              nothing holds the other domains in place while one trains.
            </p>
            <p>
              <strong>MOPD</strong> changes the geometry instead of the
              frequency. The student minimises the sum of reverse KLs to the
              teachers on its own rollouts, and to second order this solves a
              Fisher-weighted merge <Cite k="liu2026" />, with the Fisher
              measured on the student’s states and paid for with fresh rollouts
              in every domain. Distral and Divide-and-Conquer RL use the same KL
              barycenter as their shared policy and reach it by distillation{' '}
              <Cite k={['teh2017', 'ghosh2018']} />.
            </p>
            <p>
              <strong>OPM</strong> takes the remaining corner. It combines
              during training, as often as a KL budget demands, in KL geometry,
              with the Fisher measured on each trainer’s own states. Table 1
              lists what each point on the map pays.
            </p>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>How often</th>
                    <th>Geometry</th>
                    <th>Reward when combining</th>
                    <th>What it pays</th>
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
                      Domains interfere through the shared step; weak or slow
                      domains lose their share.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Periodic sum or average</strong>
                    </td>
                    <td>
                      Every <Tex>K</Tex> steps
                    </td>
                    <td>Euclidean</td>
                    <td>Yes</td>
                    <td>
                      The sum presumes no domain sees another’s update; the
                      average presumes every domain sees every update equally.
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
                      data, and pays for the whole drift at once.
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
                      A second rollout stage in every domain; capped at the
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
            <p>
              The relations on the map are exact, not analogies (Appendix A,
              Table A2). Summing is OPM when the domains’ Fishers are mutually
              orthogonal. Averaging is OPM when they are all equal. With one
              natural-gradient step per trainer, the OPM merge is a natural
              policy gradient step on the summed objective{' '}
              <Cite k="kakade2001" />. Task arithmetic with a coefficient
              between <Tex>{T`1/n`}</Tex> and 1 interpolates between the first
              two presumptions. OPM measures, direction by direction, which one
              holds.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="On-Policy Merge" id="method" />
          <div className="am-prose">
            <div className="am-callout">
              <div className="am-callout-label">The loop</div>
              <ol>
                <li>
                  All trainers start at the anchor{' '}
                  <Tex tail=".">{T`\bar\theta`}</Tex> Trainer <Tex>i</Tex> owns
                  domain <Tex tail=":">i</Tex> its data and verifier, its
                  rollout workers and sandboxes, its optimizer state and its
                  hyperparameters.
                </li>
                <li>
                  Each trainer runs ordinary on-policy GRPO{' '}
                  <Cite k="shao2024" /> on its domain, with no KL penalty.
                </li>
                <li>
                  On a subsample of each batch, the frozen anchor scores the
                  trainer’s tokens. This gives the trainer’s drift{' '}
                  <Tex tail=",">{T`D_i=\mathrm{KL}(P^i_{\theta_i}\,\|\,P^i_{\bar\theta})`}</Tex>{' '}
                  summed over the tokens of a rollout. It is measured, never
                  penalised.
                </li>
                <li>
                  When any drift reaches its ceiling{' '}
                  <Tex tail=",">{T`\delta_i`}</Tex> the trainers{' '}
                  <strong>rendezvous</strong>. Each contributes its weights and
                  a cached subsample of its latest rollouts, and the anchor
                  moves to the merge (2).
                </li>
                <li>
                  Every trainer reloads the anchor, keeps its optimizer state,
                  and continues. Rollouts still in flight are kept with
                  per-token importance weights.
                </li>
              </ol>
            </div>
            <p>
              <span className="am-runin">The objective.</span> We want one model
              whose behaviour on each domain is as close as possible to that
              domain’s trainer. A rollout{' '}
              <Tex>{T`\xi=(h_1,a_1,\dots,h_L,a_L)`}</Tex> of domain <Tex>i</Tex>{' '}
              has probability{' '}
              <Tex>{T`P^i_\theta(\xi)=\prod_t\pi_\theta(a_t\mid h_t)`}</Tex>{' '}
              times environment terms that do not depend on{' '}
              <Tex tail=".">{T`\theta`}</Tex> Closeness of behaviour over whole
              rollouts is the KL between rollout distributions, in which the
              environment terms cancel:
            </p>
            <Tex
              display
            >{T`\theta^{+}\in\arg\min_\theta\;\sum_i\mathrm{KL}\big(P^i_{\theta_i}\,\|\,P^i_\theta\big).\tag{1}`}</Tex>
            <p>
              Up to a constant, this is the negative log-likelihood of every
              trainer’s own rollouts under the merged model, so it needs nothing
              the trainers do not already hold. The barycenter objective is not
              ours: Distral and Divide-and-Conquer RL use it for their shared
              policy and reach it by distillation{' '}
              <Cite k={['teh2017', 'ghosh2018']} />. What is new is solving it
              in closed form, in one shared network, during training.
            </p>
            <p>
              <span className="am-runin">The closed form.</span> In a round,
              trainer <Tex>i</Tex> moves from the anchor to{' '}
              <Tex tail=".">{T`\theta_i=\bar\theta+\Delta_i`}</Tex> Expanding
              each KL around its trainer,{' '}
              <Tex tail=",">{T`\mathrm{KL}\approx\tfrac12(\theta-\theta_i)^\top F_i(\theta-\theta_i)`}</Tex>{' '}
              and setting the gradient of the sum to zero gives the OPM merge:
            </p>
            <Tex
              display
            >{T`\boxed{\;\theta^{+}=\bar\theta+\Big(\sum_iF_i\Big)^{+}\sum_iF_i\,\Delta_i\;},\qquad F_i=\mathbb{E}_{\xi\sim P^i_{\theta_i}}\Big[\sum_t s_ts_t^\top\Big],\quad s_t=\nabla\log\pi_{\theta_i}(a_t\mid h_t).\tag{2}`}</Tex>
            <p>
              Each direction in weight space goes to the domains that are
              sensitive to it. Where only domain <Tex>i</Tex> has curvature, the
              anchor takes all of <Tex tail=".">{T`\Delta_i`}</Tex> Where
              several do, it takes their curvature-weighted mean. Where none
              does, nothing changes that any domain can see. For tabular
              policies the exact minimiser of (1) is, at every history, the
              mixture of the trainers’ action distributions weighted by how
              often each one visits that history; (2) is its second-order
              version.
            </p>
            <p>
              Formula (2) is Fisher-weighted averaging <Cite k="matena2022" />.
              The difference is which Fisher. Here it is the Fisher of each
              trainer’s current policy, on its own domain, estimated from
              rollouts that policy has just sampled, summed over tokens. That is
              where the name comes from. The <em>data</em> are on-policy: every
              gradient step of every trainer uses its own rollouts. The{' '}
              <em>metric</em> is on-policy: the Fisher is an expectation over
              the policy’s own actions, and on stale or foreign rollouts the
              same formula becomes the empirical Fisher, a different and biased
              object <Cite k="kunstner2019" />. And the <em>continuation</em> is
              on-policy: the merge moves each trainer by a small per-token KL,
              so the rollouts it holds remain usable and training resumes
              without a hand-over stage.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle
            label="What the merge guarantees, and what it costs"
            id="theory"
          />
          <div className="am-prose">
            <p>
              The theory rests on one property of the on-policy Fisher. Write{' '}
              <Tex>{T`S(\xi)=\sum_ts_t`}</Tex> for the score of a rollout. If{' '}
              <Tex tail=",">{T`F_iv=0`}</Tex> then{' '}
              <Tex>{T`\mathbb{E}[(v^\top S)^2]=0`}</Tex>, so{' '}
              <Tex>{T`v^\top S=0`}</Tex> on every rollout of domain{' '}
              <Tex tail=",">i</Tex> and therefore{' '}
              <Tex tail=".">{T`v^\top\nabla J_i=\mathbb{E}[(R_i-b)\,v^\top S]=0`}</Tex>{' '}
              The policy gradient lies in the range of the Fisher. A
              displacement the Fisher cannot see is a displacement the return
              cannot feel. This holds because the gradient and the Fisher are
              expectations under the same distribution. It fails for supervised
              gradients against a model Fisher, and for Fishers computed on
              stale or foreign states.
            </p>
            <p>
              Call a round <em>lossless</em> if some displacement <Tex>d</Tex>{' '}
              leaves every trainer’s policy unchanged to second order,{' '}
              <Tex>{T`F_j(d-\Delta_j)=0`}</Tex> for all <Tex tail=".">j</Tex>{' '}
              This holds for every possible set of updates exactly when the
              Fisher ranges are linearly independent: independent, not
              orthogonal.
            </p>
            <div className="am-callout">
              <div className="am-callout-label">Theorem 1 · decoupling</div>
              <p>
                In a lossless round, (2) returns such a point, and for every
                domain <Tex tail=",">j</Tex> to first order in the
                displacements,
              </p>
              <Tex
                display
              >{T`J_j(\theta^{+})-J_j(\theta_j)=0,\qquad J_j\Big(\bar\theta+\sum_i\Delta_i\Big)-J_j(\theta^{+})=T_j,\qquad T_j=\nabla J_j(\theta_j)^\top\sum_{i\ne j}\Delta_i .`}</Tex>
              <p>
                For log-linear policies whose domains have linearly independent
                feature spans, this is exact at every interval: after{' '}
                <Tex>r</Tex> rounds the anchor’s policy on domain <Tex>j</Tex>{' '}
                equals that of a run that trained domain <Tex>j</Tex> alone for{' '}
                <Tex>{T`rK`}</Tex> steps. This holds for any trainer optimizer
                whose update depends only on its own history: gradient descent,
                momentum, natural gradient, and Adam with persistent state.
              </p>
            </div>
            <p>
              The second identity is the important one. <Tex>{T`T_j`}</Tex> is
              the cross-domain term: what the other domains’ updates do to
              domain <Tex>j</Tex>’s return. Summing keeps it; OPM removes it.
              When <Tex>{T`T_j<0`}</Tex> that term is interference, and removing
              it is the point. When <Tex>{T`T_j>0`}</Tex> it is positive
              transfer, and OPM removes that too. Coupling between domains needs
              overlapping Fishers, not aligned gradients. In the released 4B
              specialists merged below, parameter cosines are at most 0.022, yet
              the math specialist’s update moves the code specialist’s policy by
              1.78 times the code specialist’s own drift.
            </p>
          </div>

          <div>
            <figure>
              <WeightSpace3D />
              <figcaption>
                <strong>Figure 3.</strong> One round in a two-dimensional slice
                of weight space. Height is the second-order KL
                residual summed over both domains. Each domain is a
                flat-bottomed trough, the set of weights with the same policy on
                that domain, to second order the affine subspace{' '}
                <Tex tail=".">{T`\theta_i+\operatorname{null}(F_i)`}</Tex>{' '}
                The two trainers slide from the anchor to the bottom of their
                own troughs. Averaging their updates and summing them (task
                arithmetic) both land on the walls; the OPM merge (2) solves for
                the point where the troughs cross, which exists when the round
                is lossless. The quadratic picture holds only near the trainers,
                which is why the rendezvous happens before they drift far.
              </figcaption>
            </figure>
          </div>

          <div className="am-prose">
            <p>
              Where lossless rounds exist, decoupling gives guarantees that
              multi-task RL does not have.
            </p>
            <div className="am-callout">
              <div className="am-callout-label">
                Proposition 2 · per-domain guarantees, given lossless rounds
              </div>
              <ol>
                <li>
                  <strong>Monotone per domain.</strong> <Tex>{T`J_j`}</Tex>{' '}
                  decreases only if domain <Tex>j</Tex>’s solo run does,
                  whatever the other domains do.
                </li>
                <li>
                  <strong>Invariant to shares.</strong> Domain <Tex>j</Tex>’s
                  trajectory does not depend on the other domains’ batch shares,
                  gradient scales or speeds.
                </li>
                <li>
                  <strong>Idle protection.</strong> A trainer that made no
                  progress is held in place: the anchor moves inside{' '}
                  <Tex tail=".">{T`\operatorname{null}F_j`}</Tex>
                </li>
                <li>
                  <strong>The trigger is the trust region.</strong> Whatever the
                  optimizer, every drift is at most <Tex>{T`\delta`}</Tex> plus
                  one step <Tex tail=",">{T`\omega`}</Tex> and the exact merge
                  has total residual{' '}
                  <Tex tail=".">{T`\sum_i\varepsilon_i\le\sum_iD_i\le n(\delta+\omega)`}</Tex>
                </li>
              </ol>
              <p>
                Items 1–3 are exact for log-linear policies and hold per round
                to first order otherwise. Item 4 needs no lossless point.
              </p>
            </div>
            <p>
              Multi-task RL has none of these. One step changes{' '}
              <Tex>{T`J_j`}</Tex> by{' '}
              <Tex tail=",">{T`\eta\big(c_j\nabla J_j^\top P\nabla J_j+\sum_{i\ne j}c_i\nabla J_j^\top P\nabla J_i\big)`}</Tex>{' '}
              with <Tex>{T`c_i`}</Tex> the batch shares and <Tex>P</Tex> the
              optimizer’s preconditioner, so under conflict any domain with a
              small enough share or gradient regresses. Two parameters are
              enough to see it. Take <Tex>{T`J_1=a\,\sigma(s)`}</Tex> and{' '}
              <Tex tail=",">{T`J_2=b\,(1-\sigma(s+p))`}</Tex> with domain 2’s
              share at 0.2. Multi-task SGD drives <Tex>{T`J_2`}</Tex> from 0.50
              down to 0.24, Adam in a rotated parameterisation drives it to{' '}
              <Tex>{T`3\times10^{-4}`}</Tex> and leaves it there, and periodic
              summing dips by 0.20. OPM’s <Tex>{T`J_2`}</Tex> trajectory is
              identical, to <Tex tail=",">{T`2\times10^{-16}`}</Tex> for every
              share and reward scale of domain 1. A cascade on the same problem
              takes <Tex>{T`J_2`}</Tex> from 0.9987 to 0.0735 while domain 1
              trains; keeping the idle trainer in an OPM merge keeps it at
              0.9987.
            </p>
            <p>
              No reference-KL penalty is needed for a trust region, because the
              trigger is one. That matches frontier practice, where RL runs
              without a KL term, and no arm of our experiments uses one. The
              ceiling is best set per token. The cubic remainder of the
              quadratic model accumulates token by token, so{' '}
              <Tex>{T`\delta_i`}</Tex> should scale with domain <Tex>i</Tex>’s
              response length (Appendix B.6).
            </p>
            <div className="am-callout">
              <div className="am-callout-label">Proposition 3 · the price</div>
              <p>
                Let <Tex>n</Tex> domains share a direction with a common
                curvature and agreeing objectives, and let each trainer’s round
                solve a fraction <Tex>x</Tex> of it. OPM moves <Tex>x</Tex> (the
                average) and the sum moves <Tex tail=".">{T`nx`}</Tex> Along
                that direction, multi-task RL’s convergence exponent is about{' '}
                <Tex>n</Tex> times OPM’s. With an interior optimum the sum is
                better per round iff <Tex>{T`x<2/(n+1)`}</Tex> and diverges iff{' '}
                <Tex tail=".">{T`x>2/n`}</Tex> With a boundary optimum, such as
                pushing up an action every domain rewards, the sum is better at
                every <Tex tail=".">x</Tex> With nonlinear policies OPM also
                carries an error floor of order <Tex tail=",">{T`\eta K`}</Tex>{' '}
                set by how far the lossless point lies in parameter space.
              </p>
            </div>
            <p>
              So OPM has no general rate advantage over a well-tuned multi-task
              RL run, and we do not claim one. In KL geometry, positive transfer
              is extra reward-aligned drift on a domain, in effect a larger
              step, and a larger trainer learning rate recovers part of it.
              Meeting more often does not change this for an exact merge: in
              lossless directions OPM equals solo training at every interval.
              What OPM offers instead of speed are the guarantees above, and
              when domains conflict, those are worth more than speed.
            </p>
            <p>
              A controlled toy shows both sides (Appendix E): four chain tasks
              share a 704-parameter policy, with exact gradients, ten seeds, and
              five variants ranging from strong positive transfer to conflict.
              With learning rates tuned for both methods, OPM and multi-task RL
              end within a few hundredths of each other on the original problem:
              0.955 to 0.993 for OPM against 0.949 at 50 steps per task. An
              earlier version of this comparison used an under-tuned multi-task
              baseline (0.688) and overstated the gap as 0.27. Under positive
              transfer, multi-task RL leads at small budgets: by 0.20–0.23 at 10
              steps per task and 0.03–0.05 at 50. Under conflict OPM leads at
              every budget once both learning rates are tuned. At 50 steps it
              reaches 0.97 at its default rate, against 0.77–0.80 for the best
              multi-task rate. No OPM run ever ended with a task below its
              starting point, while multi-task RL, task arithmetic and summing
              left 20–37% of tasks below it.
            </p>
            <div className="am-callout">
              <div className="am-callout-label">Proposition 4 · MOPD</div>
              <p>
                MOPD’s loss for teacher <Tex>i</Tex> is{' '}
                <Tex tail=".">{T`L_i(\theta)=\mathrm{KL}(P^i_\theta\|P^i_{\theta_i})`}</Tex>{' '}
                By Pinsker,{' '}
                <Tex tail=":">{T`J_i(\theta)\le J_i(\theta_i)+\sqrt{L_i(\theta)/2}`}</Tex>{' '}
                at its optimum the student equals its teachers, and exceeds them
                only by not converging or through an added outcome reward. The
                OPM point is a stationary point of MOPD’s objective to second
                order (its gradient there is <Tex>{T`O(\|\cdot\|^2)`}</Tex>{' '}
                against <Tex>{T`O(\|\cdot\|)`}</Tex> for task arithmetic and the
                sum), and in a lossless round it is MOPD’s global optimum to
                third order, reached without student rollouts.
              </p>
            </div>
            <p>
              <CiteT k="liu2026" /> showed that MOPD is Fisher merging to second
              order; what we add is the lossless statement and which Fisher to
              use. OPM has no fixed teacher: each round’s “teacher”{' '}
              <Tex>{T`\theta_i`}</Tex> is retrained on reward from the last
              merge. And a rendezvous needs no environment interaction, while a
              round of MOPD needs fresh rollouts in every domain, which for
              agentic domains means sandboxes running for minutes to tens of
              minutes per episode.
            </p>
            <p>
              Every statement here carries a status in Appendix B: theorem,
              proposition under stated assumptions, or conjecture with numerical
              support. The guarantees of Proposition 2 assume lossless rounds,
              which we have not shown to exist at LLM scale (see the
              Discussion). Appendix B also has the proofs, the first-order
              coupling of every merge, and a list of what is not claimed.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Making the merge cheap" id="engineering" />
          <div className="am-prose">
            <p>
              Formula (2) cannot be formed for a model with billions of
              parameters, but it can be solved. Conjugate gradient needs only
              Fisher-vector products <Cite k="martens2010" />. Each trainer
              computes its own <Tex>{T`F_iv`}</Tex> on its own GPUs, at its own
              weights, over its own cached rollouts, and one all-reduce per
              iteration sums them. We profiled this on MiMo-V2.6-Distill-Qwen-9B{' '}
              <Cite k="mimo2026" /> and found three things.
            </p>
            <p>
              <span className="am-runin">
                The Fisher-vector product is the cost.
              </span>{' '}
              One exact product costs 6.9 GPU-milliseconds per generated token
              in fp32, about sixteen bf16 gradient passes. Roughly 40% goes to
              the finite-difference forward passes, 50% to the backward pass of
              the vector-Jacobian product and 7% to the vocabulary head.
              Communication and the <Tex>{T`n\times n`}</Tex> algebra are
              negligible. Keeping the CG vectors in CPU memory, a natural choice
              for vectors with nine billion entries, made each product about
              three times slower: a float64 reduction over 2.35 billion entries
              alone cost 31 seconds per product. At the Fisher budget we first
              planned, ten iterations made one merge take one to three hours,
              the time of tens of training steps.
            </p>
            <p>
              <span className="am-runin">Conjugate gradient overshoots.</span>{' '}
              In a first test, CG started from the summed update made the true
              held-out KL residual worse at each of its first two iterations
              (56, then 112, then 198 nats). The quadratic model was not the
              problem: along the cross-domain directions the locality ratio{' '}
              <Tex tail=",">{T`\kappa`}</Tex> true KL over quadratic prediction,
              stayed between 0.87 and 1.0. The problem is where CG looks. Its
              first search directions lie in the Fisher’s stiffest
              eigendirections, about <Tex>{T`10^7`}</Tex> times stiffer than
              typical ones, where the KL saturates within roughly 0.3% of the
              update norm. A finite-difference Fisher-vector product measures a
              secant over its step, and over a saturating stretch the secant is
              flatter than the local curvature. It underestimated the curvature
              sixteen-fold at a logit step of 0.3 and by about 40% at 0.03, so
              CG takes too long a step.
            </p>
            <p>
              <span className="am-runin">The fix is a guarded merge.</span> Use
              a finite-difference logit step of 0.01, run three CG iterations
              from the summed update <Tex tail=",">{T`d_\Sigma`}</Tex> and
              choose <Tex>{T`\gamma\in\{0,\tfrac14,\tfrac12,1\}`}</Tex> along{' '}
              <Tex>{T`d(\gamma)=d_\Sigma+\gamma(x_{\rm CG}-d_\Sigma)`}</Tex> by
              the true KL on held-out rollouts of the trainers. Since{' '}
              <Tex>{T`\gamma=0`}</Tex> is the sum, the chosen point is never
              worse than the sum up to estimation error, and no quadratic
              assumption is needed for that (Proposition 5, Appendix C).
            </p>
            <div className="am-table">
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
              four forward passes. The full CG step never beats a damped one,
              five or more iterations make things worse, and a large
              finite-difference step blows the residual up to 113–215 nats. This
              guarded merge is the default in all our runs. When rendezvous are
              frequent, the CG step can be dropped, leaving the sum plus the
              line search. This is one test case, two domains on one model. The
              main runs log the residual for every <Tex>{T`\gamma`}</Tex> at
              every rendezvous.
            </p>
          </div>

          <Placeholder label="Figure 4" status="author to draw from Table 2">
            <p>
              Held-out residual against CG iteration, one line per{' '}
              <Tex tail=",">{T`\gamma`}</Tex> with the sum and the average as
              horizontal references, and the finite-difference-step-0.3 run as a
              dashed line off the top of the chart.
            </p>
          </Placeholder>

          {/* ------------------------------------------------------------ */}
          <SectionTitle
            label="A first test on released specialists"
            id="oneshot"
          />
          <div className="am-prose">
            <p>
              Before training anything, we can test the merge operator on RL
              specialists that someone else trained. <CiteT k="wu2026" />{' '}
              released five 300-step GRPO specialists of Qwen3-4B-Instruct-2507
              in fp32 (math, science, code, instruction following and a
              tool-using agent), together with their task-arithmetic merge (
              <Tex tail=")">{T`\lambda=0.6`}</Tex>, a mixed-RL model, an MOPD
              model, and their data and evaluation. We merged the five
              specialists once with the OPM rule: ten CG iterations from the
              summed update, with exact per-token Fisher-vector products on 256
              of each specialist’s own fp32 rollouts. There is no training and
              there are no student rollouts. This tests the operator in its
              least favourable setting, one merge at the end of 75 to 248 nats
              of drift. It does not test the loop.
            </p>
            <p>
              The quadratic model holds even at that drift. The locality ratio{' '}
              <Tex>{T`\kappa`}</Tex> toward the merged points is 0.96–1.17,
              where a quadratic would give exactly 1, and the directions of the
              specialists’ updates carry 5,800 times the curvature of random
              directions of the same norm. The merge brings each specialist’s KL
              residual far below task arithmetic’s. On held-out prompts the
              residual averages 0.31 of the drift, against 0.52 for task
              arithmetic, 1.12 for the sum and 0.34 for the released MOPD model,
              and it falls to 0.16 after 30 iterations. For the
              instruction-following and agent specialists it is 0.025 and 0.037
              of their drift, against 0.26 for task arithmetic. Held-out and
              in-sample residuals agree, so 256 rollouts per domain do not
              overfit.
            </p>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th className="am-num">AIME25</th>
                    <th className="am-num">AIME26</th>
                    <th className="am-num">GPQA</th>
                    <th className="am-num">LCB v5</th>
                    <th className="am-num">LCB v6</th>
                    <th className="am-num">IFEval</th>
                    <th className="am-num">IFBench</th>
                    <th className="am-num">BFCL</th>
                    <th className="am-num">Mean</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Base</td>
                    <td className="am-num">45.9</td>
                    <td className="am-num">52.9</td>
                    <td className="am-num">57.4</td>
                    <td className="am-num">58.6</td>
                    <td className="am-num">59.9</td>
                    <td className="am-num">83.7</td>
                    <td className="am-num">30.7</td>
                    <td className="am-num">63.8</td>
                    <td className="am-num">56.62</td>
                  </tr>
                  <tr>
                    <td>Specialist, own domain</td>
                    <td className="am-num">50.3</td>
                    <td className="am-num">58.6</td>
                    <td className="am-num">61.7</td>
                    <td className="am-num">63.3</td>
                    <td className="am-num">63.7</td>
                    <td className="am-num">89.6</td>
                    <td className="am-num">48.9</td>
                    <td className="am-num">72.4</td>
                    <td className="am-num">63.56</td>
                  </tr>
                  <tr>
                    <td>Task arithmetic, λ = 0.6</td>
                    <td className="am-num">53.9</td>
                    <td className="am-num">60.2</td>
                    <td className="am-num">63.9</td>
                    <td className="am-num">64.0</td>
                    <td className="am-num">63.8</td>
                    <td className="am-num">88.2</td>
                    <td className="am-num">40.4</td>
                    <td className="am-num">71.7</td>
                    <td className="am-num">63.26</td>
                  </tr>
                  <tr>
                    <td>Mixed RL (released)</td>
                    <td className="am-num">52.7</td>
                    <td className="am-num">60.0</td>
                    <td className="am-num">61.6</td>
                    <td className="am-num">64.1</td>
                    <td className="am-num">64.2</td>
                    <td className="am-num">86.3</td>
                    <td className="am-num">40.2</td>
                    <td className="am-num">71.7</td>
                    <td className="am-num">62.60</td>
                  </tr>
                  <tr>
                    <td>MOPD (released)</td>
                    <td className="am-num">52.0</td>
                    <td className="am-num">59.7</td>
                    <td className="am-num">62.9</td>
                    <td className="am-num">63.9</td>
                    <td className="am-num">63.9</td>
                    <td className="am-num">89.1</td>
                    <td className="am-num">46.7</td>
                    <td className="am-num">72.6</td>
                    <td className="am-num">63.84</td>
                  </tr>
                  <tr>
                    <td>Sum, λ = 1</td>
                    <td className="am-num">55.7</td>
                    <td className="am-num">62.7</td>
                    <td className="am-num">64.5</td>
                    <td className="am-num">68.0</td>
                    <td className="am-num">64.4</td>
                    <td className="am-num">89.6</td>
                    <td className="am-num">49.3</td>
                    <td className="am-num">72.4</td>
                    <td className="am-num">
                      <strong>65.84</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>OPM merge</strong>, 10 CG iterations
                    </td>
                    <td className="am-num">51.0</td>
                    <td className="am-num">59.3</td>
                    <td className="am-num">63.0</td>
                    <td className="am-num">67.3</td>
                    <td className="am-num">65.6</td>
                    <td className="am-num">89.5</td>
                    <td className="am-num">
                      <strong>50.5</strong>
                    </td>
                    <td className="am-num">73.3</td>
                    <td className="am-num">64.94</td>
                  </tr>
                  <tr>
                    <td>OPM merge, 30 CG iterations</td>
                    <td className="am-num">53.9</td>
                    <td className="am-num">59.8</td>
                    <td className="am-num">62.8</td>
                    <td className="am-num">66.7</td>
                    <td className="am-num">66.6</td>
                    <td className="am-num">89.0</td>
                    <td className="am-num">50.8</td>
                    <td className="am-num">73.0</td>
                    <td className="am-num">65.32</td>
                  </tr>
                  <tr>
                    <td>OPM merge, 10 iterations, deployed in fp32</td>
                    <td className="am-num">53.3</td>
                    <td className="am-num">62.3</td>
                    <td className="am-num">64.1</td>
                    <td className="am-num">68.9</td>
                    <td className="am-num">66.8</td>
                    <td className="am-num">90.0</td>
                    <td className="am-num">52.0</td>
                    <td className="am-num">72.5</td>
                    <td className="am-num">66.24</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '14px' }}>
              <strong>Table 3.</strong> One-shot merges of the five released
              Qwen3-4B specialists of <CiteT k="wu2026" />, mean over 32 samples
              per prompt, in percent. All merged models are deployed in bf16
              except the last row. The specialist row takes each benchmark from
              its own domain’s specialist. Run-to-run noise, measured by
              evaluating a bit-identical model twice, is about 0.3 points on the
              mean.
            </p>
            <p>
              On benchmarks (Table 3) the one-shot OPM merge beats task
              arithmetic by 1.68 ± 0.42 points on the eight-benchmark mean,
              paired over prompts, and the released MOPD model by 1.11 ± 0.40.
              It uses no rollouts beyond the 256 per domain behind the Fisher.
              On IFBench it scores 50.5, against 40.4 for task arithmetic and
              48.9 for the instruction-following specialist itself, so it
              recovers 119% of the gap that task arithmetic leaves. Deployed in
              fp32 instead of bf16, the same merge gains another 1.30 ± 0.34
              points.
            </p>
            <p>
              <strong>Plain summation is the best one-shot merge.</strong> The
              sum (<Tex tail=")">{T`\lambda=1`}</Tex> beats the OPM merge by
              0.89 ± 0.36 points, mostly on AIME, even though its KL residual is
              almost four times larger. This is Theorem 1 at work, not a failure
              of the metric. Math, science and code help each other, and the
              merged reasoning scores exceed every individual specialist. The
              OPM merge pulls each specialist back toward its own behaviour and
              gives that transfer up. The theory’s diagnostic agrees: the sum’s
              estimated first-order advantage on the reasoning domains is
              positive, 0.17 to 0.26 of each domain’s own gain, while the
              instruction-following and agent domains barely see the others’
              updates, and there every merge ties. The KL residual bounds how
              much of each specialist’s own behaviour is lost. It does not
              predict reward.
            </p>
            <p>
              Two more observations temper the result. A metric computed on
              stale rollouts (the base model’s, instead of each specialist’s
              own) is worse in KL, 0.38 against 0.31 of drift, but ties on
              benchmarks (−0.22 ± 0.31). And starting CG from the
              task-arithmetic point instead of the sum does not beat task
              arithmetic (−0.25 ± 0.35). One-shot at 4B, then, the metric earns
              its keep against task arithmetic and MOPD, but not against the
              sum. The case for OPM rests on merging repeatedly while trainers
              are still close. That is what the main experiment tests. Appendix
              D has the full residual tables, the interference matrix and the
              evaluation protocol.
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
              rollouts. GPU-hours and wall-clock are reported separately.
              Appendix F gives every detail.
            </p>
            <ul>
              <li>
                <strong>A1 · Multi-task RL.</strong> One trainer on all eight
                domains, made strong: per-domain rollout quotas matched to the
                budget, ledger-normalised gradient shares, deficit scheduling
                with replay for slow domains, per-domain length and turn
                budgets, and a tuned learning rate.
              </li>
              <li>
                <strong>A2 · Merge-after.</strong> Eight specialists trained to
                the full budget and merged once. We report the best of task
                arithmetic with <Tex>{T`\lambda\in\{0.4,0.6,0.8,1.0\}`}</Tex>{' '}
                (chosen on held-out reward), DARE, TIES, the closed-form merge
                of <CiteT k="liu2026" />, and a one-shot OPM merge.
              </li>
              <li>
                <strong>A3 · MOPD.</strong> The same eight specialists as
                teachers, with and without an outcome-reward term.
              </li>
              <li>
                <strong>A4 · OPM.</strong> Eight trainers, KL-triggered
                rendezvous, and the guarded merge described above.
              </li>
            </ul>
          </div>

          <Placeholder label="Headline paragraph" status="pending main runs">
            <p>
              Mean and worst-domain normalised score of A4 against A1–A3 at
              matched rollouts, three seeds, with confidence intervals; one
              sentence per baseline on where the gap comes from.
            </p>
          </Placeholder>

          <div className="am-prose">
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>Arm</th>
                    <th className="am-num">SWE-V</th>
                    <th className="am-num">TB 2.1</th>
                    <th className="am-num">Cyber</th>
                    <th className="am-num">KW</th>
                    <th className="am-num">BC-Plus</th>
                    <th className="am-num">τ²</th>
                    <th className="am-num">AIME26</th>
                    <th className="am-num">IFBench</th>
                    <th className="am-num">Mean</th>
                    <th className="am-num">Worst</th>
                  </tr>
                </thead>
                <tbody>
                  <PendingRow label="Base" n={10} />
                  <PendingRow label="Specialists, own domain" n={10} />
                  <PendingRow label="A1 · Multi-task RL" n={10} />
                  <PendingRow label="A2 · Merge-after, best" n={10} />
                  <PendingRow label="A3 · MOPD" n={10} />
                  <PendingRow label="A3 · MOPD + outcome reward" n={10} />
                  <PendingRow label={<strong>A4 · OPM</strong>} n={10} />
                </tbody>
              </table>
            </div>
          </div>
          <Placeholder
            label="Table 4"
            status="pending main runs (A1–A4, 3 seeds)"
          >
            <p>
              Per-domain scores: SWE-bench Verified, Terminal-Bench 2.1, MiMo
              Cyber (mini), MiMo General (mini), BrowseComp-Plus, τ²-Bench,
              AIME26, IFBench. Mean and worst columns are normalised from base
              (0) to each domain’s specialist (1). Mean ± 95% CI over 3 seeds.
              Secondary benchmarks per domain (SWE-bench Pro, HMMT Feb 26,
              IFEval, BFCL v4, τ³-Bench) and the held-out suite (MMLU-Pro, GPQA,
              HLE) go in Appendix F.
            </p>
          </Placeholder>

          <div className="am-prose">
            <p>
              <span className="am-runin">Cost.</span> The arms spend their
              budgets in different places. Multi-task RL spends nothing on
              combining. MOPD’s combining cost is a second stage: student
              rollouts in every domain, including agentic sandboxes, and teacher
              scoring of every student token. OPM’s is its merges, which need no
              environment interaction: a few Fisher-vector products per trainer
              on cached rollouts and four forward passes for the line search.
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
            <p>
              <span className="am-runin">Transfer.</span> Theorem 1 makes a
              sharp prediction about where OPM should lose. Per domain and
              rendezvous, the sign of{' '}
              <Tex>{T`J_j(\text{sum})-J_j(\text{OPM})`}</Tex> should be the sign
              of the transfer term <Tex tail=",">{T`T_j`}</Tex> which each
              trainer can estimate from its own batch with one forward-mode pass
              per rollout. OPM should match or beat multi-task RL on the worst
              domain where domains conflict, and trail it on domains that help
              each other (knowledge work and tool use, or math and held-out
              reasoning) unless trainer learning rates are raised. In an
              exact-gradient check the correlation between <Tex>{T`T_j`}</Tex>{' '}
              and the realised gap was 0.84–0.87 for short rounds and fell to
              0.27 for long ones, where second-order terms dominate. Whether it
              predicts at LLM scale is open.
            </p>
          </div>
          <Placeholder label="Table 6 and Figure 5" status="pending main runs">
            <p>
              Table 6: per-domain score of each arm normalised to that domain’s
              specialist (above 1 means the domain benefits from the others),
              A1–A4, 3 seeds. Figure 5: at every rendezvous of A4, the estimated{' '}
              <Tex>{T`T_j`}</Tex> against the realised held-out reward gap
              between the summed update and the OPM merge, one point per domain
              and rendezvous; sign agreement reported in the caption.
            </p>
          </Placeholder>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="How often to merge" id="frequency" />
          <div className="am-prose">
            <p>
              The rendezvous frequency is the one knob that moves OPM along the
              map, from merge-after (a single rendezvous at the end) toward
              multi-task RL. The theory says what frequency does and does not
              do. It keeps every round local, so the quadratic model holds and
              rollouts in flight stay usable. It keeps the Fisher weights
              calibrated along shared directions: as a trainer grows confident,
              its endpoint Fisher vanishes on the logits it pushed, and a merge
              made too late undervalues it. In a two-action example the locality
              ratio is 1.00, 1.35, 1.92 and 8.9 after 1, 10, 20 and 200 steps.
              In lossless directions, frequency changes nothing.
            </p>
            <p>
              In the toy the interval matters sharply. At 50 steps per task,
              merging every 1, 5, 10, 25 or 50 steps gave 0.97, 0.96, 0.93, 0.34
              and 0.08. A KL trigger beat a fixed interval with a similar number
              of rendezvous, 0.987 against 0.88. Frequent rendezvous also passed
              more transfer into an idle task: under the exact merge, +0.48 at
              an interval of 1 against −0.21 at 50. The theory attributes this
              to calibration along shared directions, not to transfer through
              lossless ones, and part of it is unexplained (Appendix E).
              Experiment E measures the same curve on the 9B model.
            </p>
          </div>
          <div className="am-prose">
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>Rendezvous per run</th>
                    <th className="am-num">Mean</th>
                    <th className="am-num">Worst</th>
                    <th className="am-num">In-domain benefit (T1)</th>
                    <th className="am-num">Untrained domain (T2)</th>
                    <th className="am-num">Merge cost</th>
                  </tr>
                </thead>
                <tbody>
                  <PendingRow
                    label="1 (one-shot OPM merge, end of run)"
                    n={5}
                  />
                  <PendingRow label="≈ 4" n={5} />
                  <PendingRow label="≈ 16" n={5} />
                  <PendingRow label="≈ 32" n={5} />
                  <PendingRow label="A1 · Multi-task RL (reference)" n={5} />
                  <PendingRow
                    label="A2 · Merge-after, best (reference)"
                    n={5}
                  />
                </tbody>
              </table>
            </div>
          </div>
          <Placeholder
            label="Figure 6 and Table 7"
            status="pending experiment E"
          >
            <p>
              The merge-frequency curve E. A4 with the trigger ceiling set for
              about 1, 4, 16 and 32 rendezvous at a fixed budget; the
              one-rendezvous end coincides with A2’s one-shot OPM merge.
              Horizontal axis: rendezvous per run (log scale). Vertical axes:
              mean and worst normalised score, with A1 and A2 as horizontal
              bands. Table 7 adds in-domain benefit from other domains (T1), the
              score on competitive code, which no arm trains on (T2), and merge
              cost.
            </p>
          </Placeholder>

          {/* ------------------------------------------------------------ */}
          <SectionTitle
            label="Adding a skill, containing a fault"
            id="modularity"
          />
          <div className="am-prose">
            <p>
              Because each domain has its own trainer, OPM can change its set of
              domains mid-run, and a fault in one domain reaches the others only
              through the merge. Two demonstrations test whether that matters in
              practice. Both branch from the seed-1 runs and apply the same
              intervention to multi-task RL.
            </p>
            <p>
              <span className="am-runin">Demo B: adding a skill.</span> At half
              the budget, competitive code, a domain no arm has trained on, is
              added. OPM starts a code trainer from the current anchor at the
              next rendezvous; multi-task RL resumes with a re-mixed nine-domain
              quota. We measure how many rollouts and how much wall-clock code
              needs to approach its specialist, the largest drop on the eight
              existing domains, and the extra cost. Idle protection predicts
              that the existing domains hold wherever the new trainer’s Fisher
              range is independent of theirs.
            </p>
          </div>
          <Placeholder label="Figure 7 and Table 8" status="pending demo B">
            <p>
              Code score against rollouts after the branch point for A1 and A4,
              with the code specialist as a reference line; below it, the
              per-domain change on the eight existing domains over the same
              window. Table 8: rollouts and wall-clock to reach 90% of the code
              specialist’s gain, maximum drop on an existing domain, extra
              GPU-hours.
            </p>
          </Placeholder>
          <div className="am-prose">
            <p>
              <span className="am-runin">
                Demo C: containing a broken domain.
              </span>{' '}
              At 30% of the budget the tool-use reward is broken for a fixed
              window: any syntactically valid tool call is rewarded. Then it is
              restored. Both arms get the same fault. We measure the other
              domains’ scores and behaviour during and after the window, how
              fast they recover, whether OPM’s per-rendezvous diagnostics flag
              the faulty trainer, and what rolling back that one trainer does.
              Theorem 1 predicts that the fault reaches other domains only
              through Fisher overlap, and the trigger bounds how far it moves
              them per round.
            </p>
          </div>
          <Placeholder label="Figure 8 and Table 9" status="pending demo C">
            <p>
              Per-domain scores over training for A1 and A4 with the fault
              window shaded, plus tool-call validity and response length. Table
              9: worst drop on another domain during the window and after
              recovery; the rendezvous at which the guard flagged the tool-use
              trainer; the effect of rolling back that trainer alone.
            </p>
          </Placeholder>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Side findings" id="findings" />
          <div className="am-prose">
            <p>
              Measuring merges at the level of policies, in exact fp32, turned
              up five findings that matter beyond OPM. Appendix G has the
              numbers.
            </p>
            <p>
              <span className="am-runin">Orthogonal is not independent.</span>{' '}
              The released specialists’ task vectors are nearly orthogonal, with
              cosines of at most 0.022, yet they interfere strongly. The math
              specialist’s update moves the code specialist’s policy by 1.78
              times the code specialist’s own drift. Interference lives in the
              Fisher, which weights directions by how much the policy cares
              about them, and the directions RL moves are thousands of times
              stiffer than random ones. Cosine similarity of task vectors is a
              poor guide to whether two specialists can be merged.
            </p>
            <p>
              <span className="am-runin">
                “Sparse” RL updates are a bf16 artefact.
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
              <span className="am-runin">There is a bf16 floor.</span> Casting
              an fp32 specialist to bf16 moves its policy by 25–40% of its whole
              RL drift, measured in KL on its own rollouts. The same merged
              model scores 1.30 ± 0.34 points higher deployed in fp32 than in
              bf16. Any merge, trigger or residual threshold has to sit above
              this floor, and scoring has to run in true fp32.
            </p>
            <p>
              <span className="am-runin">KL residual is not reward loss.</span>{' '}
              The sum has the largest KL residual of any merge and the best
              benchmark mean. The exact identity behind this is that a return
              change equals the reward-weighted log-likelihood ratio plus at
              most the KL. To first order it is{' '}
              <Tex tail=",">{T`\rho\,\sigma\sqrt{2\varepsilon}`}</Tex> with{' '}
              <Tex>{T`\rho`}</Tex> the correlation between reward and the
              log-ratio. A large residual costs little reward when{' '}
              <Tex>{T`\rho\approx0`}</Tex> and helps when{' '}
              <Tex tail=".">{T`\rho>0`}</Tex> Pinsker-type bounds are vacuous
              above about 2 nats, while specialists drift 75–248 nats.
            </p>
            <p>
              <span className="am-runin">When the sum beats OPM.</span> The sum
              wins exactly when domains help each other, and that can be
              measured per domain: how much of the others’ updates domain{' '}
              <Tex>j</Tex>’s Fisher sees, and the sign of the transfer term{' '}
              <Tex tail=".">{T`T_j`}</Tex> The 4B reasoning domains are in this
              regime. The instruction-following and agent domains barely see
              each other, so every merge ties. The toy’s conflict variants are
              the opposite regime, where OPM wins. Logging <Tex>{T`T_j`}</Tex>{' '}
              at each rendezvous tells a practitioner which regime a run is in.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Discussion" id="discussion" />
          <div className="am-prose">
            <p>
              <span className="am-runin">When to use it.</span> OPM is a
              decoupling device. It pays where coupling hurts: domains that
              conflict, many domains with small shares each, rollout latencies
              that differ by orders of magnitude, and teams that want to add,
              drop or fix a domain without retraining the rest. It gives ground
              where coupling helps: when domains share skills, multi-task RL or
              the plain sum moves faster along the shared directions, and OPM
              recovers that only through larger trainer steps. The transfer term
              and visibility, both logged at every rendezvous, tell which
              situation a run is in.
            </p>
            <p>
              <span className="am-runin">Limitations.</span> The guarantees
              assume lossless rounds, and we have not shown that they exist at
              LLM scale. In the 4B merge the residual after 30 CG iterations is
              still 15% of drift, and the reasoning domains overlap. The
              informative statements at realistic drift are second-order or
              about KL, not reward. The trajectory Fisher grows with tokens, so
              long-response domains get more weight in shared directions. OPM
              keeps one model copy per domain in memory. The Fisher is estimated
              from a subsample, and the evidence for the guarded merge comes
              from one two-domain test. At one shot, a stale metric tied the
              on-policy one on benchmarks. All results are at 4B and 9B on dense
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
              <Cite k="wang2026b" />, a close cousin of Theorem 1. Federated
              learning studies periodic averaging under heterogeneity{' '}
              <Cite
                k={['mcmahan2017', 'li2020', 'karimireddy2020', 'wang2020']}
              />
              , including function-space aggregation <Cite k="dhawan2024" />,
              federated GRPO <Cite k="guo2026" /> and federated natural policy
              gradient for multi-task RL <Cite k="yang2023" />. As far as we
              know, OPM is the first to use the on-policy trajectory Fisher
              inside RL, where Theorem 1 holds, and the first to trigger a
              weight merge on trajectory KL. Appendix H discusses each in
              detail.
            </p>
            <p>
              <span className="am-runin">Conclusion.</span> Combining RL domains
              is a choice of how often and in which geometry. Choosing often and
              in the on-policy KL geometry gives a merge with a closed form that
              removes cross-domain terms of both signs. It guarantees per-domain
              progress where domains can be separated, costs speed where they
              agree, and takes about ten minutes on a 9B model once the solver
              is guarded. Merged once at 4B, it beats task arithmetic and MOPD
              and loses to the plain sum, for reasons the theory predicts.
              Whether merging often closes that gap, and what OPM buys against
              multi-task RL and MOPD at scale, is what the pending results above
              settle.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Citation" id="citation" />
          <div className="am-prose">
            <p>Please cite this work as:</p>
            <p>
              Wang, Bowen. “On-Policy Merge Stabilizes Multi-Task Reinforcement Learning.”
              bowenbryanwang.github.io, November 2026.
            </p>
            <p>Or use the BibTeX citation:</p>
            <pre className="am-bib">{BIBTEX}</pre>
          </div>

          {/* ------------------------------------------------------------ */}
          <Appendix />
        </div>
      </article>
    </Container>
  )
}
