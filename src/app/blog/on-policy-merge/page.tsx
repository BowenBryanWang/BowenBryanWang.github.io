import { type Metadata } from 'next'
import type { ReactNode } from 'react'

import { Container } from '@/components/Container'

import './_styles/merge.css'
import './_styles/algorithm.css'
import './_styles/residual.css'
import './_styles/system.css'
import './_styles/results.css'

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
import { MainResultsTable, OpmAnchorsTable, CostTable } from './_components/ResultTables'
import { AnchorsFigure } from './_components/ResultFigures'
import ScoresFigure from './_components/ScoresFigure'
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

const DEV = process.env.NODE_ENV !== 'production'

export const metadata: Metadata = {
  title: 'On-Policy Merge',
  description:
    'On-Policy Merge trains one RL trainer per domain and merges all trainers during training with a closed-form, Fisher-weighted formula. The domains are trained separately and remain one model throughout, without a shared optimizer and without a distillation stage.',
}

const POST = {
  title: 'On-Policy Merge',
  subtitle:
    'On-Policy Merge (OPM) trains one RL trainer per domain and merges all trainers during training with a closed-form, Fisher-weighted formula, each time any trainer has moved a fixed KL distance from the last merged model. The domains are trained separately and remain one model throughout, without a shared optimizer and without a distillation stage.',
  author: 'Bowen Wang',
  date: 'Nov 5, 2026',
  reading: 'Research · 35 min read',
}

// Sections for the table of contents: one entry per <SectionTitle id=...>
// (the appendix has one), plus the introduction above the first of them.
const TOC: TocItem[] = [
  { label: 'Introduction', href: '#introduction' },
  { label: 'Where OPM sits among existing methods', href: '#map' },
  { label: 'On-Policy Merge', href: '#method' },
  { label: 'What the merge guarantees, and what it gives up', href: '#theory' },
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
              Post-training a frontier language model has to combine
              reinforcement learning (RL) on many domains into one model:
              agentic coding, terminal use, cybersecurity, knowledge work, web
              search and competition math. The common
              recipe, multi-task RL, trains all domains in one run with one
              optimizer. Each optimizer step
              is computed from a batch that mixes all domains, so every update
              changes the policy on every domain, and improving one domain
              often makes another regress{' '}
              <Cite k={['mimo2026flash', 'ma2026']} />.
            </p>
            <p>
              For this reason, recent frontier recipes train one RL specialist
              per domain and combine the specialists afterwards{' '}
              <Cite k={['deepseek2026', 'kimi2026', 'ma2026']} />. There are
              two ways to combine them. Multi-teacher on-policy distillation
              (MOPD) trains a student, on the student’s own rollouts, to match
              the specialist of each domain. MOPD adds a second training stage with rollouts in
              every domain, and a student trained to match its teachers is
              bounded by them <Cite k="wu2026" />. Weight merging needs no
              training, but the merged model typically does not match the
              specialists <Cite k={['yadav2023', 'ma2026']} />. Both are
              applied after training has finished, when the specialists’
              policies have moved far apart.
            </p>
            <p>
              We introduce <strong>On-Policy Merge</strong> (OPM), which
              combines the domains during training instead of after it. Each
              domain has its own RL trainer with its own optimizer. When the KL
              divergence of any trainer’s policy from the last merged model
              reaches a threshold, all trainers are merged and continue
              training from the merged model. The merged model is the minimizer
              of the sum, over domains, of the KL divergence from each
              trainer’s rollout distribution to the merged model’s rollout
              distribution on that domain. If the trainers start from shared
              weights <Tex>{T`\bar\theta`}</Tex> and trainer <Tex>i</Tex> has
              moved by <Tex tail=",">{T`\Delta_i`}</Tex> the solution to second
              order is a Fisher-weighted average{' '}
              <Cite k={['matena2022', 'liu2026']} />:
            </p>
            <Tex
              display
            >{T`\theta^{+}=\bar\theta+\Big(\sum_iF_i\Big)^{+}\sum_iF_i\,\Delta_i ,`}</Tex>
            <p>
              where <Tex>{T`(\cdot)^{+}`}</Tex> is the pseudoinverse and{' '}
              <Tex>{T`F_i`}</Tex> is the <Key>on-policy Fisher</Key>: the
              Fisher information matrix of trainer <Tex>i</Tex>’s policy at its
              current weights, on rollouts that trainer has just sampled.
            </p>
            <p>
              The merge follows from an objective, not from a weighting rule.
              The objective asks the merged model to behave like each trainer
              on the states that trainer visits, which are the states that
              determine its domain’s return. Because each domain’s policy
              gradient lies in the range of its on-policy Fisher, the merged
              model keeps each domain’s own first-order improvement and none of
              the change that the other domains’ updates would cause in its
              return, whenever one model can match the policies of all trainers
              (<a className="am-ref" href="#thm-1">Theorem 1</a>). Multi-task
              RL and task arithmetic sum the domains’ updates and keep that
              change. The objective is also the one MOPD minimizes by training
              a student. The gradient of that objective vanishes to first
              order at the OPM merge, which it does not at the sum of the
              updates
              (<a className="am-ref" href="#prop-4">Proposition 4</a>), so OPM
              computes in closed form what MOPD approaches by training. The
              closed form is a second-order approximation and is accurate while
              the trainers are close. Finished specialists are far apart, but
              trainers that are merged at a fixed KL threshold never are, and a
              line search on held-out KL guarantees that the merged model is no
              further from the trainers than the sum of their updates, up to
              estimation error
              (<a className="am-ref" href="#prop-5">Proposition 5</a>).
            </p>
            <p>
              OPM is also practical at the scale of frontier training. It
              changes how the domains are combined and leaves each domain’s
              training as it is: every domain runs ordinary on-policy RL with
              its own data, reward, optimizer and hyperparameters, the way
              frontier post-training is already organized. The merge needs no
              new rollouts, no environment interaction and no second training
              stage, and we engineered it to stay cheap as models grow. The
              Fisher matrices are never formed. Each trainer computes
              Fisher-vector products, at the cost of three forward passes and
              one backward pass, on a small fixed sample of rollouts it has already
              collected, using its own GPUs, which in our runs mostly wait for
              rollouts. A Jacobi-preconditioned conjugate-gradient solve needs
              only a few such products, and merges are triggered by the KL
              threshold, so they run only when the trainers have diverged.
              Since the trainers interact only at merges, no optimizer step
              waits for another domain’s episodes, a trainer that stalls or
              fails does not affect the others to first order
              (<a className="am-ref" href="#prop-2">Proposition 2</a>), and a
              new domain can join at any merge. The costs are one copy of the
              model per trainer, a pause in training while each merge is
              solved, and the loss of positive transfer along with
              interference. Grouping domains that help each other under one
              trainer recovers the transfer and reduces the number of copies
              (<a className="am-ref" href="#grouped">grouped OPM</a>).
            </p>
            <p>Our experiments support both arguments.</p>
            <ol>
              <li>
                <strong>
                  OPM outperforms multi-task RL, weight merging and MOPD.
                </strong>{' '}
                We took five publicly released 4B RL specialists and merged
                them once with the OPM formula, with no training and no new
                rollouts. The merged model scores above the multi-task RL model
                and above the MOPD student released with the same specialists
                on five of six benchmarks each, and above task arithmetic on
                four. It also stays closer in KL to the specialists than task
                arithmetic and the MOPD student do. The exception is
                competition math, where the domains help each other and OPM
                gives up that transfer.
              </li>
              <li>
                <strong>
                  During training at 9B, the merge keeps every domain’s
                  progress.
                </strong>{' '}
                We trained eight domains with a 9B model, one trainer per
                domain, and merged them seven times. At every merge we measured,
                on held-out rollouts, how far the merged model was in KL from
                each trainer. Adding the trainers’ updates together gave a
                model about two to five times further from the trainers than
                the OPM merge, and at some merges further than the model before
                the merge. Cross-domain
                interference is therefore present in a real multi-domain RL
                run, and the OPM merge removes most of it.
              </li>
              <li>
                <strong>
                  OPM fits frontier-scale training with low overhead.
                </strong>{' '}
                In the 9B run with eight domains, all merges together used
                about 4% of the FLOPs of the training steps, and about 2% when
                rollouts are counted. A Fisher-vector product touches the same
                parameters per token as a training step, so this fraction does
                not grow with model size. For mixture-of-experts models it
                follows the active parameters: on a 30B model with 3B active
                parameters, a product costs about the same number of training
                passes per token as on the dense 9B model. For runs with dozens
                of domains, OPM is applied between groups of domains, so the
                number of trainers and model copies is the number of groups.
              </li>
            </ol>
            <p>
              Taken together, these results show that OPM is a strong and
              cost-efficient way to combine domains in frontier LLM training.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Where OPM sits among existing methods" id="map" />
          <div className="am-prose">
            <p>
              Every method for combining RL domains makes two choices: when
              the domains are combined, and in which space.{' '}
              <a className="am-ref" href="#fig-1">Figure 1</a> shows the first
              choice, and <a className="am-ref" href="#table-1">Table 1</a>{' '}
              compares the five methods on both.
            </p>
            <p>
              <strong>Multi-task RL</strong> combines at every step, in weight
              space: one optimizer receives the sum of the domains’ gradients,
              weighted by their token shares in the batch. With plain SGD this
              is the same as running one trainer per domain and summing their
              updates after every step
              (<a className="am-ref" href="#app-a">Appendix A</a>).{' '}
              <strong>Cascade RL</strong> trains the domains one after another{' '}
              <Cite k={['wang2025', 'yang2026']} />; it is multi-task RL with
              every share but one set to zero. <strong>Weight merging</strong>{' '}
              (task arithmetic, TIES, DARE){' '}
              <Cite k={['ilharco2023', 'yadav2023', 'yu2024']} /> combines
              once, after training, also in weight space.{' '}
              <strong>MOPD</strong> combines once, after training, in policy
              space: the student is trained to match each specialist’s policy
              on the student’s own rollouts. <strong>OPM</strong> combines
              during training, each time a trainer reaches its KL threshold, in
              policy space, on each trainer’s own rollouts.
            </p>
            <div className="am-table" id="table-1">
              <table>
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Combined</th>
                    <th>Space</th>
                    <th>Shared optimizer</th>
                    <th>Extra training stage</th>
                    <th>Reward training after combining</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Multi-task RL</td>
                    <td>Every step</td>
                    <td>Weight</td>
                    <td>Yes</td>
                    <td>No</td>
                    <td>Yes</td>
                  </tr>
                  <tr>
                    <td>Cascade RL</td>
                    <td>In sequence</td>
                    <td>Weight</td>
                    <td>Yes</td>
                    <td>No</td>
                    <td>Yes</td>
                  </tr>
                  <tr>
                    <td>Weight merging</td>
                    <td>Once, after training</td>
                    <td>Weight</td>
                    <td>No</td>
                    <td>No</td>
                    <td>No</td>
                  </tr>
                  <tr>
                    <td>MOPD</td>
                    <td>Once, after training</td>
                    <td>Policy, student rollouts</td>
                    <td>In the student stage</td>
                    <td>Yes</td>
                    <td>Optional</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>OPM</strong>
                    </td>
                    <td>During training, at a KL threshold</td>
                    <td>Policy, trainer rollouts</td>
                    <td>No</td>
                    <td>No</td>
                    <td>Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '14px' }}>
              <strong>Table 1.</strong> When each method combines the domains,
              in which space, and what it requires. MOPD can add an outcome
              reward to its distillation stage.
            </p>
            <p>
              Existing merge rules are special cases of the OPM merge under
              assumptions about the domains’ Fishers
              (<a className="am-ref" href="#table-a2">Table A2</a>). The sum of
              the updates is the OPM merge when the Fishers are mutually
              orthogonal, and the average is the OPM merge when they are all
              equal. Task arithmetic with a coefficient between{' '}
              <Tex>{T`1/n`}</Tex> and 1 interpolates between these two
              assumptions. With natural-gradient trainers merged at every step,
              OPM is a natural policy gradient step on the summed objective{' '}
              <Cite k="kakade2001" />. To second order, MOPD solves the same
              merge by gradient descent, with the Fisher measured on the
              student’s rollouts <Cite k="liu2026" />. OPM makes no assumption
              about how the Fishers relate. It measures them on each trainer’s
              rollouts and solves the merge with them;{' '}
              <a className="am-ref" href="#fig-2">Figure 2</a> shows the result
              in weight space.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="On-Policy Merge" id="method" />
          <div className="am-prose">
            <p>
              <span className="am-runin">The objective.</span> The merged
              model should keep what each trainer has learned on its own
              domain. We state this in terms of behaviour: on domain{' '}
              <Tex tail=",">i</Tex> rollouts of the merged model should have
              the same distribution as rollouts of trainer{' '}
              <Tex tail=".">i</Tex> A rollout{' '}
              <Tex>{T`\xi=(h_1,a_1,\dots,h_L,a_L)`}</Tex> has probability{' '}
              <Tex>{T`P^i_\theta(\xi)=\prod_t\pi_\theta(a_t\mid h_t)`}</Tex>{' '}
              times environment terms that do not depend on{' '}
              <Tex tail=",">{T`\theta`}</Tex> so the KL divergence between two
              rollout distributions on the same domain depends only on the
              policies’ token probabilities. We define the merge as the{' '}
              <Key>KL barycenter</Key> of the trainers:
            </p>
            <Tex
              display
            >{T`\theta^{+}\in\arg\min_\theta\;\sum_i\mathrm{KL}\big(P^i_{\theta_i}\,\|\,P^i_\theta\big).\tag{1}`}</Tex>
            <p>
              Up to a constant, (1) is the negative log-likelihood of every
              trainer’s own rollouts under the merged model, so it can be
              evaluated from data the trainers already hold. The KL is summed
              over the tokens of a rollout and every domain has weight one, so
              domains with longer rollouts contribute more. Distral and
              Divide-and-Conquer RL use the same objective for a shared policy
              and reach it by distillation{' '}
              <Cite k={['teh2017', 'ghosh2018']} />; OPM solves it in closed
              form.
            </p>
            <p>
              <span className="am-runin">The closed form.</span> Let every
              trainer start from the same weights{' '}
              <Tex tail=",">{T`\bar\theta`}</Tex> which we call the{' '}
              <Key>anchor</Key>, and let trainer <Tex>i</Tex> move to{' '}
              <Tex tail=".">{T`\theta_i=\bar\theta+\Delta_i`}</Tex> To second
              order around <Tex tail=",">{T`\theta_i`}</Tex>{' '}
              <Tex tail=",">{T`\mathrm{KL}(P^i_{\theta_i}\|P^i_\theta)\approx\tfrac12(\theta-\theta_i)^\top F_i(\theta-\theta_i)`}</Tex>{' '}
              where <Tex>{T`F_i`}</Tex> is the Fisher information of trainer{' '}
              <Tex>i</Tex>’s rollout distribution. Setting the gradient of the
              sum to zero gives the OPM merge:
            </p>
            <Tex
              display
            >{T`\boxed{\;\theta^{+}=\bar\theta+\Big(\sum_iF_i\Big)^{+}\sum_iF_i\,\Delta_i\;},\qquad F_i=\mathbb{E}_{\xi\sim P^i_{\theta_i}}\Big[\sum_t s_ts_t^\top\Big],\quad s_t=\nabla\log\pi_{\theta_i}(a_t\mid h_t).\tag{2}`}</Tex>
            <p>
              Here <Tex>{T`(\cdot)^{+}`}</Tex> is the pseudoinverse and{' '}
              <Tex>{T`s_t`}</Tex> is the score of token{' '}
              <Tex tail=".">t</Tex> Formula (2) is
              Fisher-weighted averaging <Cite k="matena2022" />. It minimises
              the second-order expansion of (1) and agrees with the exact
              minimiser to first order in the updates. When the Fishers share
              eigenvectors, (2) can be read one direction at a time: where only
              domain <Tex>i</Tex> has curvature, the merged model takes the
              full component of <Tex tail=",">{T`\Delta_i`}</Tex> and where
              several domains have curvature it takes their curvature-weighted
              mean. Each Fisher has one row and one column per parameter and is
              never formed; the merge is computed from products{' '}
              <Tex>{T`F_iv`}</Tex>{' '}
              (<a className="am-ref" href="#fvp">Computing a Fisher-vector product</a>).
            </p>
            <p>
              The minimiser of the second-order objective is not unique. A
              direction <Tex>v</Tex> with <Tex>{T`F_iv=0`}</Tex> for every{' '}
              <Tex>i</Tex> can be added to <Tex>{T`\theta^{+}`}</Tex> without
              changing the objective. The pseudoinverse selects the solution
              with no component in such directions. Our solver selects another
              one: it starts from the sum of the updates and corrects it with a
              few conjugate-gradient iterations
              (<a className="am-ref" href="#engineering">Computing the merge at scale</a>),
              so in these directions the merged model keeps the sum of the
              updates. The property below shows that the choice does not
              change any domain’s return to first order.
            </p>
            <p>
              <span className="am-runin">The on-policy Fisher.</span> In OPM,{' '}
              <Tex>{T`F_i`}</Tex> is the <Key>on-policy Fisher</Key>: it is
              taken at trainer <Tex>i</Tex>’s current weights, on rollouts of
              domain <Tex>i</Tex> sampled from those weights. This choice gives
              the merge its main property.
            </p>
            <div className="am-callout" id="range">
              <div className="am-callout-label">Range property</div>
              <p>
                Let <Tex>{T`J_i(\theta)=\mathbb{E}_{\xi\sim P^i_\theta}[R_i(\xi)]`}</Tex>{' '}
                be the return of domain <Tex tail=",">i</Tex>{' '}
                <Tex>{T`S(\xi)=\sum_ts_t`}</Tex> the score of a rollout, and{' '}
                <Tex>b</Tex> a baseline that does not depend on the sampled
                actions. Scores at different tokens are uncorrelated, so{' '}
                <Tex tail=".">{T`F_i=\mathbb{E}[SS^\top]`}</Tex> For every
                direction <Tex tail=",">v</Tex>
              </p>
              <Tex
                display
              >{T`\begin{aligned}F_iv=0\;&\Longrightarrow\;\mathbb{E}\big[(v^\top S)^2\big]=0\;\Longrightarrow\;v^\top S=0\ \text{almost surely}\\&\Longrightarrow\;v^\top\nabla J_i(\theta_i)=\mathbb{E}\big[(R_i-b)\,v^\top S\big]=0 .\end{aligned}`}</Tex>
              <p>
                The policy gradient of domain <Tex>i</Tex> therefore lies in
                the range of its on-policy Fisher.
              </p>
            </div>
            <p>
              A change <Tex>v</Tex> with <Tex>{T`F_iv=0`}</Tex> leaves domain{' '}
              <Tex>i</Tex>’s action probabilities on its own rollouts, and
              hence its return, unchanged to first order. A merge that matches
              each trainer in its Fisher metric therefore preserves each
              trainer’s return to first order, and it uses no reward. The
              argument needs the gradient and the Fisher to be expectations
              under the same rollout distribution, with scores at the same
              weights. It fails for a Fisher measured on rollouts with a
              different support, such as another domain’s, or with scores
              taken at other weights. In our runs each Fisher is estimated on
              the first 2,048 action tokens of each rollout, so the property
              and the objective (1) apply to that prefix; the drifts and
              residuals we report are measured on the same prefix.
            </p>
            <p>
              <span className="am-runin" id="during-training">Merging during training.</span>{' '}
              Formula (2) is a second-order expansion with weights measured at
              the trainers, so it is accurate only while the trainers are close
              to the merged model. Two errors grow as the trainers move away
              from the anchor. The remainder of the quadratic model grows with
              the drift
              (<a className="am-ref" href="#app-b-6">Appendix B.6</a>). And as
              a trainer’s policy becomes more deterministic, its Fisher shrinks
              on the logits it has moved, so a late merge gives the least
              weight to what that trainer changed most. Merging during training
              keeps both errors small. It also allows the remaining error to be
              corrected: after each merge every trainer continues RL from the
              merged model, and its reward acts on whatever the merge lost. A
              merge after training has no such step. Merging more often does
              not remove the residual that remains when the trainers’ updates
              conflict, and every merge has a cost, so the interval between
              merges is a trade-off
              (<a className="am-ref" href="#engineering">Computing the merge at scale</a>).
            </p>
            <p>
              <span className="am-runin">The training loop.</span> OPM runs
              one on-policy RL trainer per domain from the anchor. Each trainer
              measures its drift from the anchor,{' '}
              <Tex tail=",">{T`D_i=\mathrm{KL}(P^i_{\theta_i}\,\|\,P^i_{\bar\theta})`}</Tex>{' '}
              on a subsample of its own rollouts. When the drift of any trainer
              reaches its threshold <Tex tail=",">{T`\delta_i`}</Tex> all
              trainers are merged by (2), the merged model becomes the new
              anchor, and every trainer continues from it with its optimizer
              state. The drift is measured and never penalised. Algorithm 1
              gives the procedure.
            </p>
            <Algorithm
              number={1}
              title="On-Policy Merge"
              input={
                <>
                  base model <Tex tail=";">{T`\theta_0`}</Tex> for each domain{' '}
                  <Tex tail=":">i</Tex> its data, verifier, rollout workers and
                  hyperparameters, and a drift threshold{' '}
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
              <Line indent={1} note="merge">
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
              <Line indent={2} note="optimizer states kept">
                <Tex>{T`\theta_i\leftarrow\bar\theta`}</Tex> for every{' '}
                <Tex>i</Tex>
              </Line>
              <Line>
                <K>until</K> the training budget is spent
              </Line>
              <Line note="a final merge, so the last round’s updates are kept">
                merge once more (lines 8–9), whatever the drifts
              </Line>
              <Line>
                <K>return</K> <Tex>{T`\bar\theta`}</Tex>
              </Line>
            </Algorithm>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle
            label="What the merge guarantees, and what it gives up"
            id="theory"
          />
          <div className="am-prose">
            <p>
              <span className="am-runin">Lossless merges.</span> Along the
              affine subspace{' '}
              <Tex tail=",">{T`\theta_j+\operatorname{null}(F_j)`}</Tex> the KL
              from trainer <Tex>j</Tex> is zero to second order. We call a
              merge <Key>lossless</Key> if these subspaces intersect, that is,
              if some displacement <Tex>d</Tex> from the anchor satisfies{' '}
              <Tex>{T`F_j(d-\Delta_j)=0`}</Tex> for every{' '}
              <Tex tail=".">j</Tex> For fixed Fishers, this holds for every set
              of updates if and only if the ranges of the Fishers are linearly
              independent; they need not be orthogonal
              (<a className="am-ref" href="#fig-2">Figure 2</a>).
            </p>
          </div>

          <div>
            <figure id="fig-2">
              <WeightSpace3D />
              <figcaption>
                <strong>Figure 2.</strong> One merge in a two-dimensional slice
                of weight space. Height is the second-order KL
                residual summed over both domains. Each domain is a
                trough, the set of weights whose KL from that domain’s trainer is
                zero to second order, the affine subspace{' '}
                <Tex tail=".">{T`\theta_i+\operatorname{null}(F_i)`}</Tex>{' '}
                Each trainer moves from the anchor to the bottom of its own
                trough. Averaging the two updates and summing them (task
                arithmetic) both give points on the trough walls; the OPM merge
                (2) solves for the point where the troughs intersect, which exists
                when the merge is lossless. The quadratic model holds only near the
                trainers, so OPM merges before they drift far.
              </figcaption>
            </figure>
          </div>

          <div className="am-prose">
            <div className="am-callout" id="thm-1">
              <div className="am-callout-label">Theorem 1 · decoupling</div>
              <p>
                In a lossless merge, every exact solution of (2) is a lossless
                point and, for every domain <Tex tail=",">j</Tex> to first
                order in <Tex tail=",">{T`\theta^{+}-\theta_j`}</Tex>
              </p>
              <Tex
                display
              >{T`J_j(\theta^{+})-J_j(\theta_j)=0,\qquad J_j\Big(\bar\theta+\sum_i\Delta_i\Big)-J_j(\theta^{+})=T_j,\qquad T_j=\nabla J_j(\theta_j)^\top\sum_{i\ne j}\Delta_i .`}</Tex>
            </div>
            <p>
              <Tex>{T`T_j`}</Tex> is the <Key>cross-domain term</Key>: the
              first-order change in domain <Tex>j</Tex>’s return caused by the
              other domains’ updates. Summing the updates keeps{' '}
              <Tex tail=".">{T`T_j`}</Tex> OPM removes it, whether it is
              interference (<Tex>{T`T_j<0`}</Tex>) or positive transfer
              (<Tex>{T`T_j>0`}</Tex>). A small cosine between two domains’
              updates does not make their interaction small. In the released
              4B specialists the cosines between updates are at most 0.022,
              and the math specialist’s update still moves the code
              specialist’s policy by 1.78 times that specialist’s own drift,
              measured in the code specialist’s Fisher metric. This measures a
              change in policy; it does not give the sign of{' '}
              <Tex tail=".">{T`T_j`}</Tex>
            </p>
            <p>
              <span className="am-runin">How close real merges are.</span>{' '}
              <a className="am-ref" href="#thm-1">Theorem 1</a> is a
              first-order statement about lossless merges, and real merges are
              not lossless. On the 4B specialists, the merged model’s held-out
              KL to the specialists is still 16% of their drift after 30 CG
              iterations. In the 9B run it was 0.12 to 0.51 of the drift over
              the first five merges. At residuals of this size we have no
              bound on the change in return: Pinsker-type bounds say nothing
              above about 2 nats
              (<a className="am-ref" href="#app-b-9">Appendix B.9</a>). What
              holds without any assumption is a statement about KL. The merge
              we run chooses its step by a line search on held-out KL that
              includes the sum of the updates as a candidate, so with high
              probability its total KL to the trainers exceeds that of the sum
              by at most the estimation error
              (<a className="am-ref" href="#prop-5">Proposition 5</a>). We log
              the remaining KL of every trainer at every merge.
            </p>
            <p>
              <span className="am-runin" id="decoupling">What decoupling gives each domain.</span>{' '}
              For log-linear policies whose feature spans are linearly
              independent, lossless merges make each domain’s training
              identical to training it alone. This holds after any number of
              merges and for any optimizer whose update depends only on that
              trainer’s own gradient history, Adam included
              (<a className="am-ref" href="#app-b-2">Appendix B.2</a>). For
              general policies the same properties hold to first order at each
              merge.
            </p>
            <div className="am-callout" id="prop-2">
              <div className="am-callout-label">
                Proposition 2 · per-domain properties of a lossless merge
              </div>
              <p>
                Exactly for log-linear policies with independent feature
                spans, and to first order at each merge in general:
              </p>
              <ol>
                <li>
                  The return of domain <Tex>j</Tex> decreases only if it would
                  decrease when domain <Tex>j</Tex> is trained alone.
                </li>
                <li>
                  The training of domain <Tex>j</Tex> does not depend on the
                  other domains’ batch shares, gradient scales or speeds.
                </li>
                <li>
                  If trainer <Tex>j</Tex> has not moved
                  (<Tex>{T`\Delta_j=0`}</Tex>), the merge moves the anchor only
                  within <Tex tail=".">{T`\operatorname{null}(F_j)`}</Tex>
                </li>
              </ol>
            </div>
            <p>
              Multi-task RL has none of these properties. One step with
              learning rate <Tex tail=",">{T`\eta`}</Tex> batch shares{' '}
              <Tex>{T`c_i`}</Tex> and optimizer preconditioner <Tex>P</Tex>{' '}
              changes the return of domain <Tex>j</Tex> by
            </p>
            <Tex
              display
            >{T`\Delta J_j\approx\eta\Big(c_j\,\nabla J_j^\top P\,\nabla J_j+\sum_{i\ne j}c_i\,\nabla J_j^\top P\,\nabla J_i\Big),`}</Tex>
            <p>
              so when gradients conflict, a domain with a small enough share or
              gradient regresses
              (<a className="am-ref" href="#app-b-5">Appendix B.5</a>). The
              shared optimizer couples the domains in two further ways. A
              global gradient-norm clip scales every domain’s step by the norm
              of the summed gradient. Adam’s second moment averages the squared
              mixed gradient, so where one domain’s gradients are large, every
              domain’s effective learning rate drops, even if the gradients are
              orthogonal. In OPM each trainer has its own optimizer state,
              clip, learning rate and schedule, which we call{' '}
              <Key>optimizer isolation</Key>, so none of the three acts between
              merges. We measure each of them in the 9B run in{' '}
              <a className="am-ref" href="#coupling">Main results</a>.
            </p>
            <p>
              Two further facts concern the trigger and the weights. The
              trigger keeps each trainer’s measured drift below{' '}
              <Tex>{T`\delta_i`}</Tex> plus the largest increase of one
              training step, for any optimizer. This bounds the KL from the
              anchor between two merges. It does not bound the KL from the base
              model, since the anchor moves at every merge; no arm of our
              experiments uses a reference-KL penalty. At a merge, each domain
              is weighted by its Fisher, and its gradient norm enters only
              through the size of its update{' '}
              <Tex tail=".">{T`\Delta_i`}</Tex>
            </p>
            <p>
              <span className="am-runin">What OPM gives up.</span> Removing{' '}
              <Tex>{T`T_j`}</Tex> removes positive transfer.{' '}
              <a className="am-ref" href="#prop-3">Proposition 3</a> quantifies
              this in a one-dimensional model.
            </p>
            <div className="am-callout" id="prop-3">
              <div className="am-callout-label">
                Proposition 3 · the transfer OPM gives up
              </div>
              <p>
                Let <Tex>n</Tex> domains share one direction with the same
                curvature and agreeing objectives. Let every trainer and the
                multi-task run use the same learning rate, with the multi-task
                gradient summed over domains, and let one round of a single
                trainer cover a fraction <Tex>x</Tex> of the distance to the
                optimum. Along that direction OPM moves <Tex>x</Tex> and the
                sum of the updates moves <Tex tail=".">{T`nx`}</Tex> With an
                interior optimum the sum is better per round iff{' '}
                <Tex>{T`x<2/(n+1)`}</Tex> and diverges iff{' '}
                <Tex tail=";">{T`x>2/n`}</Tex> with the optimum at the boundary
                it is at least as good for every <Tex tail=".">x</Tex>
              </p>
            </div>
            <p>
              The factor <Tex>n</Tex> is equivalent to a larger step along the
              shared direction. A multi-task run that averages the domains’
              gradients with shares summing to one moves as far as OPM at the
              same learning rate. OPM therefore has no rate advantage over a
              well-tuned multi-task run, and we do not claim one. A larger
              trainer learning rate recovers part of the transfer; merging more
              often does not. In a controlled experiment with four tasks
              sharing a small policy, multi-task RL leads when the tasks help
              each other and OPM leads when they conflict
              (<a className="am-ref" href="#app-e">Appendix E</a>). Domains
              that help each other can share one trainer
              (<a className="am-ref" href="#grouped">grouped OPM</a>).
            </p>
            <p>
              The merge also acts on drift that does not affect return. A
              change orthogonal to <Tex>{T`\nabla J_j`}</Tex> leaves domain{' '}
              <Tex>j</Tex>’s return unchanged to first order but still has KL
              on domain <Tex tail=".">j</Tex> The objective (1) contains no
              reward, so the merge treats this change like any other drift.
            </p>
            <p>
              <span className="am-runin">Relation to MOPD.</span> MOPD trains a
              student to minimise{' '}
              <Tex tail=",">{T`L_i(\theta)=\mathrm{KL}(P^i_\theta\|P^i_{\theta_i})`}</Tex>{' '}
              the reverse of the KL in (1), on the student’s own rollouts. The
              two KLs have the same second-order expansion, so MOPD and OPM
              solve the same problem to second order{' '}
              <Cite k="liu2026" />.
            </p>
            <div className="am-callout" id="prop-4">
              <div className="am-callout-label">Proposition 4 · MOPD</div>
              <p>
                Let rewards lie in <Tex tail=".">{T`[0,1]`}</Tex> Then{' '}
                <Tex tail=".">{T`J_i(\theta)\le J_i(\theta_i)+\sqrt{L_i(\theta)/2}`}</Tex>{' '}
                At an exact solution <Tex>{T`\theta^{+}`}</Tex> of (2), the
                gradient of <Tex>{T`\sum_iL_i`}</Tex> is of second order in
                the distances <Tex tail=",">{T`\|\theta^{+}-\theta_i\|`}</Tex>{' '}
                while at the sum of the updates and at task arithmetic it is
                of first order. In a lossless merge,{' '}
                <Tex>{T`\sum_iL_i(\theta^{+})`}</Tex> is itself of third
                order.
              </p>
            </div>
            <p>
              The first statement limits how far a student can exceed teacher{' '}
              <Tex>i</Tex> when <Tex>{T`L_i`}</Tex> is small, and it says
              nothing once <Tex>{T`L_i`}</Tex> exceeds about 2 nats. The second
              means that OPM computes in closed form a point that agrees to
              first order with the one MOPD approaches by training, and it
              needs no student rollouts. OPM also has no fixed teacher: after
              each merge, every trainer continues RL from the merged model.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="System design" id="system" />
          <div className="am-prose">
            <p>
              OPM adds three things to a single-domain RL stack: rollout
              engines assigned per domain, a stored anchor, and a coordinator
              (<a className="am-ref" href="#fig-3">Figure 3</a>). Each domain
              runs ordinary asynchronous RL with a trainer, its optimizer state
              and settings, and a group of rollout engines that serve that
              trainer’s current weights. Rollouts must come from the trainer’s
              own weights, so an engine belongs to one domain and is not drawn
              from a shared pool. The number of engines per domain follows its
              rollout cost: long agentic episodes get more engines than math.
              Verifiers, sandboxes and environments are shared by all domains.
              The anchor is stored in the slot that RL frameworks reserve for a
              reference model, and the coordinator tracks the drifts and runs
              the merge.
            </p>
            <p>
              Between merges the trainers never wait for each other, so a slow
              domain does not delay a fast one. At a merge, in the runs
              reported here, the coordinator waits for every trainer to finish
              its current step, runs the solver across the trainers, and
              installs the merged model in every trainer and its engines.
              Training pauses during this time. Optimizer states are kept.
              Rollout groups sampled entirely by the pre-merge weights are
              dropped, and the remaining ones are handled by the importance
              weights that asynchronous RL already applies. On held-out
              rollouts a merge moved each trainer by 0.0002–0.0026 nats per
              token, about half to one step of the trainers’ own
              train–inference KL. A trainer that has finished its budget takes
              part in later merges with its final weights.{' '}
              <a className="am-ref" href="#app-c">Appendix C</a> compares the
              five methods as systems
              (<a className="am-ref" href="#table-c1">Table C1</a>).
            </p>
          </div>
          <figure id="fig-3">
            <SystemDiagram />
            <figcaption>
              <strong>Figure 3.</strong> The OPM system. Each domain runs
              ordinary asynchronous RL, with its own trainer and its own
              rollout engines, sized by its rollout cost. Verifiers, sandboxes
              and the anchor scorer are shared. A coordinator merges the
              trainers whenever the drift of one reaches its threshold and sends the merged
              model back to all of them.
            </figcaption>
          </figure>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Computing the merge at scale" id="engineering" />
          <div className="am-prose">
            <p>
              With eight 9B trainers, a merge takes 15–24 minutes of compute
              per trainer and about 4% of the FLOPs of the training steps
              between merges. This section describes how the merge is
              computed, what it costs and how the cost changes with model
              size.
            </p>
            <p>
              <span className="am-runin">Fisher-vector products.</span>{' '}
              Formula (2) is solved with conjugate gradient (CG), which needs
              only products <Tex>{T`\big(\sum_iF_i\big)v`}</Tex>{' '}
              <Cite k="martens2010" />. Each trainer computes{' '}
              <Tex>{T`F_iv`}</Tex> on its own GPUs, at its own weights, on
              rollouts it has cached, and one all-reduce per iteration sums the
              products.
            </p>
            <div className="am-callout" id="fvp">
              <div className="am-callout-label">Computing a Fisher-vector product</div>
              <p>
                Taking the expectation over the action at each token of a
                rollout gives
              </p>
              <Tex
                display
              >{T`F_iv=\mathbb{E}_{\xi\sim P^i_{\theta_i}}\Big[\sum_tJ_t^\top\big(\mathrm{diag}(p_t)-p_tp_t^\top\big)J_tv\Big],`}</Tex>
              <p>
                where <Tex>{T`p_t`}</Tex> is the trainer’s own next-token
                distribution at token <Tex>t</Tex> and <Tex>{T`J_t`}</Tex> is
                the Jacobian of its logits <Tex>{T`z_t`}</Tex> with respect to
                the weights. A trainer computes the product in three steps:
              </p>
              <ol>
                <li>
                  <Tex>{T`J_tv`}</Tex> by a central finite difference, from two
                  forward passes at{' '}
                  <Tex tail=":">{T`\theta_i\pm\varepsilon v`}</Tex>{' '}
                  <Tex tail=",">{T`\big(z_t(\theta_i+\varepsilon v)-z_t(\theta_i-\varepsilon v)\big)/2\varepsilon`}</Tex>{' '}
                  with <Tex>{T`\varepsilon`}</Tex> set so that the logits move
                  by 0.03;
                </li>
                <li>
                  <Tex tail=",">{T`u_t=p_t\odot J_tv-p_t\,(p_t^\top J_tv)`}</Tex>{' '}
                  which costs <Tex>{T`O(V)`}</Tex> per token for a vocabulary
                  of size <Tex tail=";">V</Tex>
                </li>
                <li>
                  <Tex>{T`J_t^\top u_t`}</Tex> by one forward and one backward
                  pass at <Tex tail=",">{T`\theta_i`}</Tex> with{' '}
                  <Tex>{T`u_t`}</Tex> as the gradient of the logits.
                </li>
              </ol>
              <p>
                The expectation over the vocabulary is exact, and{' '}
                <Tex>{T`J_tv`}</Tex> is a finite-difference approximation. The
                product uses the trainer’s recomputed distribution and not the
                sampled token, so it does not depend on which token the
                inference engine sampled. In the 9B run each trainer uses 64
                cached rollouts, cut at their 2,048th action token, with
                contexts of up to 16,384 tokens.
              </p>
            </div>
            <p>
              <span className="am-runin">The guarded merge.</span> Plain CG
              started from the sum of the updates does not work. On two
              trainers branched from the 9B model, it increased the held-out
              KL to the trainers after its first iterations
              (<a className="am-ref" href="#table-2">Table 2</a>). The first CG
              directions are dominated by the highest-curvature directions of
              the Fisher, which have about <Tex>{T`10^7`}</Tex> times the
              curvature of typical ones, and along them the finite-difference
              product underestimates the curvature, sixteen-fold at a logit
              step of 0.3 and by 40% at 0.03. With the curvature
              underestimated, CG steps too far. The <Key>guarded merge</Key>{' '}
              therefore has three steps:
            </p>
            <ol>
              <li>
                Run a few CG iterations from the sum of the updates{' '}
                <Tex tail=",">{T`d_\Sigma`}</Tex> giving{' '}
                <Tex tail=".">{T`x_{\rm CG}`}</Tex>
              </li>
              <li>
                Choose <Tex>{T`\gamma`}</Tex> from a small set that contains 0,
                along <Tex tail=",">{T`d(\gamma)=d_\Sigma+\gamma(x_{\rm CG}-d_\Sigma)`}</Tex>{' '}
                by the KL to the trainers measured on held-out rollouts. Since{' '}
                <Tex>{T`\gamma=0`}</Tex> is the sum, the chosen point is no
                worse than the sum up to estimation error, and this needs no
                quadratic assumption
                (<a className="am-ref" href="#prop-5">Proposition 5</a>).
              </li>
              <li>
                Check every trainer’s held-out KL to the merged model against
                its threshold, scaling the step by 1, ½ or ¼. If a trainer
                fails at every scale, its update is left out, the merge is
                solved again over the other trainers, and the update is offered
                again at the next merge.
              </li>
            </ol>
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
              <a className="am-ref" href="#table-2">Table 2</a> is the study
              behind these choices. Without a preconditioner and with a logit
              step of 0.01, three iterations and{' '}
              <Tex>{T`\gamma=\tfrac12`}</Tex> reduce the residual by 36%
              relative to the sum, from 13.35 to 8.57 nats. The full step is
              never better than the half step, five or more iterations increase
              the residual, and a logit step of 0.3 fails. This is a single
              test case with two domains.
            </p>
            <p>
              The eight-domain 9B run uses a Jacobi preconditioner, built from
              a Monte Carlo estimate of the Fisher diagonal, with a small
              damping term, five CG iterations, a logit step of 0.03 and{' '}
              <Tex tail=".">{T`\gamma\in\{0,\tfrac12,1\}`}</Tex> At each of its
              seven merges, the guarded merge left 44–78% less held-out KL to
              the trainers than the sum of their updates
              (<a className="am-ref" href="#table-c2">Table C2</a>), and{' '}
              <Tex>{T`\gamma=1`}</Tex> was chosen at six of them. At two of the
              first five merges the sum was further from the trainers than the
              anchor, at 1.51 and 1.04 times the anchor’s KL, so summing the
              updates during training can be worse than not merging. The
              per-trainer check was recorded but not enforced in the first five
              merges. At the seventh it left out the math trainer’s update.
            </p>
          </div>

          <figure id="fig-4">
            <ResidualChart />
            <figcaption>
              <strong>Figure 4.</strong> Held-out KL residual of the guarded
              merge after one to ten CG iterations, for three step sizes{' '}
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
              <span className="am-runin">Cost at 9B.</span> A merge with{' '}
              <Tex>m</Tex> CG iterations needs <Tex>{T`m+1`}</Tex> products on{' '}
              <Tex>{T`N_F`}</Tex> Fisher tokens and <Tex>q</Tex> forward passes
              on <Tex>{T`N_H`}</Tex> held-out tokens for the line search.
              Relative to the <Tex>{T`N_{\rm train}`}</Tex> tokens trained
              between two merges, it adds
            </p>
            <Tex
              display
            >{T`\text{overhead}\;\approx\;\frac{(m+1)\,c_{\rm FVP}\,N_F+q\,c_{\rm fwd}\,N_H}{N_{\rm train}}`}</Tex>
            <p>
              to training compute, where <Tex>{T`c_{\rm FVP}`}</Tex> and{' '}
              <Tex>{T`c_{\rm fwd}`}</Tex> are the costs of a product and of a
              forward pass per token, in units of one training token. The
              table gives what we measured on MiMo-V2.6-Distill-Qwen-9B{' '}
              <Cite k="mimo2026" /> over the first five merges of the
              eight-domain run.
            </p>
            <div className="am-table">
              <table>
                <thead>
                  <tr>
                    <th>Quantity, per merge</th>
                    <th>Measured</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Compute per trainer, mean</td>
                    <td>15–24 min</td>
                  </tr>
                  <tr>
                    <td>Compute per trainer, slowest</td>
                    <td>22–30 min</td>
                  </tr>
                  <tr>
                    <td>Share of compute in Fisher-vector products</td>
                    <td>about 85%</td>
                  </tr>
                  <tr>
                    <td>GPU time</td>
                    <td>8–13 GPU-hours</td>
                  </tr>
                  <tr>
                    <td>GPU time relative to the round’s training steps</td>
                    <td>0.6–0.9</td>
                  </tr>
                  <tr>
                    <td>FLOPs relative to the training steps</td>
                    <td>about 4%</td>
                  </tr>
                  <tr>
                    <td>FLOPs relative to rollouts plus training steps</td>
                    <td>about 2%</td>
                  </tr>
                  <tr>
                    <td>Wall-clock, all trainers paused</td>
                    <td>48–57 min</td>
                  </tr>
                  <tr>
                    <td>Share of a round’s wall-clock</td>
                    <td>6–19%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              The three measures of cost differ for two reasons. First, a
              product does the arithmetic of about 1.8 gradient passes but
              takes the time of about 16, because it runs in fp32 with finite
              differences. This is why the merge is 4% of the training FLOPs
              and 0.6–0.9 of the training GPU time. Second, training steps are
              a small part of a round. Each trainer GPU ran training steps for
              29–35 minutes of a round of 5–15 hours and waited for rollouts
              the rest of the time. The main cost of a merge is therefore the
              pause, not the compute. About half of the pause is compute; the
              rest is waiting for the last trainer to finish its step, up to
              17 minutes, and loading weights. Within the compute, every CG
              iteration waits for the slowest trainer. Instruction following
              needs 4.5 minutes, and software engineering and knowledge work
              need the longest, because their rollouts carry long environment
              contexts: the cyber trainer’s 115 thousand action tokens come
              with 970 thousand context tokens. Over all seven merges the
              pause was 37–70 minutes; the longest included a second solve
              after the per-trainer check. Two 9B trainers merge in 3–19
              minutes, with a median of 5 over 29 merges.
            </p>
            <p>
              <span className="am-runin">Scaling with model size.</span> A
              Fisher-vector product touches the same parameters per token as a
              training step, so for a fixed number of iterations and Fisher
              tokens the overhead does not grow with model size. For
              mixture-of-experts models it follows the active parameters: on
              Qwen3-30B-A3B a product takes about 12 training passes per token,
              close to the dense 9B model. Memory and communication follow the
              total parameter count. Preconditioned CG keeps about six fp32
              vectors of the model’s size, which is more than the 16 bytes per
              parameter of a full training state, and each iteration
              all-reduces one of them across trainers, 4 TB at a trillion
              parameters. Each trainer also holds its own training state.
              Precision sets a lower limit on all thresholds: casting an fp32
              specialist to bf16 moves its policy by 25–40% of its RL drift
              (<a className="am-ref" href="#findings">Side findings</a>), so
              triggers and residual targets have to be set above that level.
            </p>
            <p>
              <span className="am-runin" id="not-tested">Not yet tested at scale.</span> The
              following changes address the costs above. None has been run in
              the eight-domain setting, and we state the evidence for each.
            </p>
            <ul>
              <li>
                <strong>Merging without a pause.</strong> The merge can be
                solved on snapshots of the trainers while they keep training,
                and the correction{' '}
                <Tex>{T`\theta^{+}-\theta_i^{\rm snapshot}`}</Tex> added to
                each trainer when it is ready. The products can run while the
                trainers’ GPUs wait for rollouts. The correction is then a few
                steps stale, which is the kind of staleness asynchronous RL
                already handles for rollouts. This would remove the pause, 6–19%
                of a round, without extra GPUs. Not implemented.
              </li>
              <li>
                <strong>Balancing the products across trainers.</strong> Every
                CG iteration waits for the slowest trainer. Spreading the
                Fisher rollouts over all trainer GPUs by context tokens,
                instead of 64 rollouts per trainer, would cut the compute of a
                merge by 1.2–1.6 times on our timings. Not implemented.
              </li>
              <li>
                <strong>A subspace solve.</strong> Restricting the merge to{' '}
                <Tex>{T`\bar\theta+\sum_kc_k\Delta_k`}</Tex> turns (2) into an{' '}
                <Tex>{T`n\times n`}</Tex> system with entries{' '}
                <Tex tail=",">{T`\sum_i\Delta_j^\top F_i\Delta_k`}</Tex> and
                splitting the inner products by layer or by parameter type
                gives one coefficient per block. Each trainer computes one
                product per update and sends scalars, so no parameter-sized
                solver state or all-reduce is needed. On the{' '}
                <a className="am-ref" href="#table-2">Table 2</a> test case,
                one coefficient per update recovers 48% of CG’s reduction of
                the residual, one per layer 70%, and one per layer and
                parameter type 72%. In the 9B run, 99.5–99.7% of CG’s
                correction to the sum lay outside the span of the updates,
                which is why a single coefficient per update is not enough. The
                subspace solution can also serve as the starting point of CG,
                and CG can start from the previous merge’s correction, to
                reduce the number of products.
              </li>
              <li>
                <strong>Cheaper products.</strong> A Jacobian-vector product
                followed by a vector-Jacobian product computes{' '}
                <Tex>{T`F_iv`}</Tex> without a finite difference, and bf16
                arithmetic with fp32 accumulation would bring the cost closer
                to the 1.8 gradient passes of arithmetic. Forward-mode
                differentiation has to pass through fused attention and expert
                kernels. Not implemented.
              </li>
              <li>
                <strong>Fewer Fisher tokens.</strong> The 9B run already limits
                the Fisher to the first 2,048 action tokens of each rollout,
                22% of a math rollout’s tokens. Sampling tokens further, by the
                entropy of their next-token distribution, did not help. On the{' '}
                <a className="am-ref" href="#table-2">Table 2</a> test case,
                keeping 5–50% of the tokens in the 2,048-token prefix left the
                time per product unchanged, because the forward and backward
                passes still run over the whole context, and increased the
                residual.
              </li>
              <li>
                <strong>Mixture-of-experts models.</strong> No OPM merge has
                been run on a mixture-of-experts model. In a test on
                Qwen3-30B-A3B, a perturbation of{' '}
                <Tex>{T`7\times10^{-5}`}</Tex> nats per token changed the top-8
                expert set for 2% of token–layer pairs, and a perturbation of
                the size of a merge changed it for about 7%. A change of
                routing is outside the quadratic model, so the line search
                should also reject steps that change the routing of more than
                a set fraction of tokens.
              </li>
              <li>
                <strong>Memory.</strong> OPM holds one training state per
                trainer, as any method that trains one specialist per domain
                does. Three changes would reduce this: stepping the trainers
                in turn on one shared training pool, with idle trainers’
                states in host memory; storing each trainer’s update in bf16
                against the shared anchor; and grouping domains under one
                trainer
                (<a className="am-ref" href="#grouped">grouped OPM</a>).
              </li>
            </ul>
          </div>

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
              <a className="am-ref" href="#during-training">
                Merging during training
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
              hard math and instruction following. All arms share one RL
              framework (slime), one chat template with thinking on, and the
              same verifiers, harnesses and evaluation. The budget is matched
              in environment rollouts per domain, counting MOPD’s student
              rollouts. This matches the tokens each arm trains on, not the
              number of optimizer steps: multi-task RL takes one step per
              mixed batch of all eight domains, while each OPM trainer and
              each specialist steps on batches of its own domain. The final
              OPM run differs from the baselines’ recipe in four trainers: it
              lowers the learning rate for math, software engineering,
              instruction following and tool use, adds a KL penalty and a
              longer length cap for math, and gives software engineering 36%
              more rollouts. <a className="am-ref" href="#app-f-recipes">Appendix F</a>{' '}
              lists the recipe of every method.
            </p>
            <ul>
              <li>
                <strong>Base and specialists.</strong> The base model, and on
                each benchmark the specialist of that domain. The math
                specialist is its checkpoint at step 60; the others are final
                checkpoints.
              </li>
              <li>
                <strong>Multi-task RL (MTRL).</strong> One trainer on all eight
                domains, with per-domain rollout quotas matched to the budget,
                ledger-normalised gradient shares, deficit scheduling with
                replay for slow domains, and a tuned learning rate. Every step
                draws the same fraction of each domain’s budget, so 31% of its
                rollouts are math, 31% instruction following, 10% tool use,
                10% search, 6% software engineering, 6% knowledge work, 4%
                cyber and 3% terminal
                (<a className="am-ref" href="#app-f-budget">Appendix F</a>).
                Reported: step 150.
              </li>
              <li>
                <strong>Task arithmetic (TA).</strong> The merge-after
                baseline: eight specialists trained to the full budget, then
                merged once. Reported: <Tex tail=",">{T`\lambda=1`}</Tex> the
                plain sum of the eight updates.
              </li>
              <li>
                <strong>MOPD.</strong> The same eight specialists as teachers
                of one student. Reported: iteration 14.
              </li>
              <li>
                <strong>OPM.</strong> Eight trainers and the guarded merge
                described above. A trainer pauses when its drift reaches the
                cap, the trainers merge when all have paused or a timer
                expires, and a trainer whose drift is still small at that
                moment is deferred to a later merge. Reported: the merged
                model at the end of the run. The run is still training, so the
                figures below show the model after its fifth merge.
              </li>
            </ul>
          </div>

          <div className="am-prose">
            <p>
              <span className="am-runin">Scores.</span>{' '}
              <a className="am-ref" href="#fig-5">Figure 5</a> compares the
              methods on nine benchmarks. OPM is shown on the four evaluated
              so far.
            </p>
          </div>

          <figure id="fig-5" className="am-wide">
            <ScoresFigure />
            <figcaption>
              <strong>Figure 5.</strong> Scores in percent; each panel has its
              own scale. MTRL is multi-task RL, TA is task arithmetic with{' '}
              <Tex tail=",">{T`\lambda=1`}</Tex> and Specialist is the
              specialist of the panel’s domain. OPM is the model after five
              merges.
            </figcaption>
          </figure>

          <div className="am-prose">
            <details className="am-fold">
              <summary>Table 4 · The numbers of Figure 5, with standard errors</summary>
              <MainResultsTable />
              <p style={{ fontSize: '14px' }}>
                <strong>Table 4.</strong> The numbers of Figure 5, in percent,
                ± one standard error. A dash means not evaluated.
              </p>
            </details>
            <p>
              Multi-task RL gains 10.8 points over the base model on
              Terminal-Bench 2.1, 6.3 on BrowseComp-Plus and 18.4 on math, and
              raises IFBench from 27.8 to 66.1. MOPD scores above multi-task
              RL and task arithmetic on SWE-bench Pro, Terminal-Bench 2.1,
              BrowseComp-Plus, cyber and math, and 18.5 points below multi-task
              RL on IFBench.
            </p>
            <p>
              Software engineering moves least. The specialist scores 77.7 on
              SWE-bench Pro against 74.5 for the base model, and multi-task RL,
              at 72.6, is within one standard error of the base.
            </p>
            <p>
              No method trains on HLE. Multi-task RL and MOPD raise it from
              5.86 to 10.50, and task arithmetic lowers it to 4.92.
            </p>
            {DEV ? (
              <>
                <Placeholder label="Figure 7 · does OPM match each baseline?" status="needs the final OPM model">
                  <p>
                    【Reader’s question: on which benchmarks is OPM better,
                    equal or worse? Rows are the benchmarks of Figure 5 plus
                    GDPval-AA. Three columns: OPM minus multi-task RL, minus
                    task arithmetic, minus MOPD, as a paired difference over
                    items with a ± 2 SE interval and a line at zero. The
                    paragraph gives the count of wins, ties and losses and
                    names every loss.】
                  </p>
                </Placeholder>
                <Placeholder label="Analysis · abilities no method trains on" status="needs MMLU-Pro and GPQA for every method">
                  <p>
                    【Reader’s question: does combining eight domains cost
                    general ability? Add MMLU-Pro and GPQA to HLE for every
                    method, and report mean response length and the share of
                    truncated answers per method.】
                  </p>
                </Placeholder>
              </>
            ) : null}
            <p>
              <span className="am-runin">Merging after training.</span> Task
              arithmetic is below the base model on SWE-bench Pro (65.9
              against 74.5), on math (50.7 against 58.9) and on HLE (4.92
              against 5.86), and above it on Terminal-Bench 2.1,
              BrowseComp-Plus and cyber. The finished specialists are too far
              apart for their updates to be summed, which is consistent with
              the second-order formula being accurate only while the models
              are close
              (<a className="am-ref" href="#during-training">Merging during training</a>).{' '}
              <a className="am-ref" href="#table-f6">Table F6</a> reports two
              other merges of the same specialists.
            </p>
            <p>
              A combined model is not bounded by the specialists. On math,
              multi-task RL and MOPD score 77.3 and 80.5 against 67.9 for the
              math specialist.
            </p>
            {DEV ? (
              <>
                <Placeholder label="Figure 8 · how often should the trainers merge?" status="needs the interval study at 9B">
                  <p>
                    【Reader’s question: is merging during training better
                    than merging once at the end, with the same trainers?
                    x: steps between merges (4, 10, 32, and once at the end);
                    y: score on math and IFBench of the merged model, with
                    multi-task RL as a horizontal line. This is the direct
                    test of the method’s main design choice.】
                  </p>
                </Placeholder>
                <Placeholder label="Analysis · which specialist carries a merge’s gain" status="needs two merges and two evaluations">
                  <p>
                    【Reader’s question: where does the gain of a merge over
                    the specialist come from? Redo task arithmetic
                    without the software-engineering specialist and score it
                    on SWE-bench Pro; redo it without the math specialist and
                    score it on math. One table: merge, left-out specialist,
                    score, paired difference to the full merge.】
                  </p>
                </Placeholder>
              </>
            ) : null}
          </div>

          <div className="am-prose">
            <p>
              <span className="am-runin">OPM during training.</span>{' '}
              <a className="am-ref" href="#fig-6">Figure 6</a> follows the OPM
              model through its first five merges. By the fifth, instruction
              following, search and tool use have contributed updates, and
              math, software engineering, terminal and cyber have mostly been
              deferred.
            </p>
          </div>

          <figure id="fig-6">
            <AnchorsFigure />
            <figcaption>
              <strong>Figure 6.</strong> The OPM model after 0, 1, 3 and 5
              merges, in percent. Dashed lines are the finished baselines.
            </figcaption>
          </figure>

          <div className="am-prose">
            <details className="am-fold">
              <summary>Table 5 · The same anchors on five benchmarks</summary>
              <OpmAnchorsTable />
              <p style={{ fontSize: '14px' }}>
                <strong>Table 5.</strong> The OPM model after 1, 3 and 5
                merges, in percent. The last row is the paired difference over
                items.
              </p>
            </details>
            <p>
              IFBench rises from 27.8 to 60.8, a paired gain of 33.0 ± 2.1
              points. This is above MOPD at 47.6 and below multi-task RL at
              66.1.
            </p>
            <p>
              Math rises by 3.5 ± 0.9 points, to 62.4, with few of the math
              trainer’s updates merged. Multi-task RL and MOPD are at 77.3 and
              80.5, so the comparison on math depends on merges that have not
              happened yet. BFCL rises by 2.5 ± 0.6 points.
            </p>
            {DEV ? (
              <>
                <Placeholder label="Figure 9 · what each merge wrote" status="needs the merge log of the final run">
                  <p>
                    【Reader’s question: are the merges stable, and which
                    trainers take part? One column per merge, one row per
                    trainer. A cell says whether the trainer contributed, was
                    deferred, or was left out by the per-trainer check, shaded
                    by its drift. Below, per merge: the held-out KL residual
                    of the guarded merge, of the plain sum of the same
                    updates, and of not merging, with the chosen{' '}
                    <Tex tail=".">{T`\gamma`}</Tex> The paragraph gives the
                    number of merges at which the guarded merge was closer to
                    the trainers than the sum.】
                  </p>
                </Placeholder>
                <Placeholder label="Figure 10 · what a merge keeps of each trainer’s gain" status="needs evaluations at each merge">
                  <p>
                    【Reader’s question: does the merged model keep what each
                    trainer learned? Per domain, three bars as gain over the
                    base model on that domain’s held-out set: the specialist,
                    the OPM trainer before the last merge, and the merged
                    model. This is the claim of the decoupling theorem, and
                    the test is hardest on the small-drift domains, software
                    engineering and terminal.】
                  </p>
                </Placeholder>
                <Placeholder label="Figure 11 · progress against budget, per domain" status="needs the anchors’ budget fractions">
                  <p>
                    【Reader’s question: at the same budget, which method is
                    ahead? Eight panels, one per domain. x: fraction of the
                    domain’s rollout budget used; y: held-out reward. Three
                    curves: the OPM anchors, the specialist’s checkpoints, and
                    multi-task RL at steps 50, 75, 100 and 150.】
                  </p>
                </Placeholder>
                <Placeholder label="Analysis · the math gap" status="needs per-method truncation counts">
                  <p>
                    【Reader’s question: why is OPM behind on math? For every
                    method on the 93 problems: the share of samples cut at
                    81,920 tokens, accuracy on completed answers, and mean
                    answer length. For OPM, the same after each merge, with
                    the norm of the math update merged so far. This separates
                    three explanations: few math updates merged, longer
                    reasoning that hits the cap, and a weaker math trainer.】
                  </p>
                </Placeholder>
              </>
            ) : null}
            <p>
              <span className="am-runin">Cost.</span> The methods use compute
              in different stages. Multi-task RL has no separate combining
              step. Task arithmetic trains the specialists and then merges
              them. MOPD adds a second stage with student rollouts in every
              domain and teacher scoring of every student token. OPM combines
              by merging, which needs no environment interaction; the cost of
              one merge is measured in{' '}
              <a className="am-ref" href="#engineering">Computing the merge at scale</a>.
              Costs aligned with the reported checkpoints are not available
              yet.
            </p>
            <details className="am-fold">
              <summary>Table 6 · Cost ledger entries so far</summary>
              <CostTable />
              <p style={{ fontSize: '14px' }}>
                <strong>Table 6.</strong> Entries of the cost ledger as of 11
                November 2026. They are not aligned with the reported
                checkpoints: the multi-task entry runs to step 175, and an
                aborted attempt adds 381 H100 GPU-hours; the MOPD entry is an
                earlier 15-step snapshot. The MOPD and merge-only entries
                exclude the training of the specialists. GPU-hours include idle
                time, and H100 and B200 hours are different units.
              </p>
            </details>
            {DEV ? (
              <Placeholder label="Figure 12 · what does each method cost?" status="needs the final ledger">
                <p>
                  【Reader’s question: how much compute and time does one
                  model take? Left: one stacked bar per method in wall-clock
                  hours, split into rollouts, training, combining (merges, or
                  MOPD’s teacher scoring) and idle time, cut at the reported
                  checkpoint, with GPU-hours and GPU type beside it. Right:
                  mean gain over the base model against GPU-hours, one point
                  per method.】
                </p>
              </Placeholder>
            ) : null}
            <p id="coupling">
              <span className="am-runin">Where the domains couple.</span> The
              theory names three channels through which multi-task RL couples
              domains (<a className="am-ref" href="#decoupling">What decoupling gives each domain</a>),
              and in our 9B runs their measured sizes differ widely. Policy
              gradients of different domains have cosines of at most 0.02 at a
              common point, no larger than the cosine between two halves of one
              domain’s batch, so at this scale a policy gradient is mostly sampling
              noise. The trainers’ updates are even closer to orthogonal, with
              cosines of at most 0.0023 between any two of the eight at every
              merge. Even so, the other trainers’ summed updates moved the
              small-drift software-engineering trainer by 6–14 times its own drift
              and the terminal trainer by 5–6 times, while they moved instruction
              following by only 0.14–0.35 of its own. The global clip was never
              triggered: over 110 steps of the eight-domain multi-task run, the
              largest pre-clip gradient norm was 0.18 against a threshold of 1.0.
              In our recipe the clip channel is therefore inactive, and the domains
              are coupled through the shared update and Adam’s second moment.
            </p>
          </div>

          <div className="am-prose">
            <p>
              <span className="am-runin">Transfer.</span> <a className="am-ref" href="#thm-1">Theorem 1</a> makes a
              testable prediction about the domains on which OPM should score
              lower. Per domain and merge, the sign of{' '}
              <Tex>{T`J_j(\text{sum})-J_j(\text{OPM})`}</Tex> should be the sign
              of the transfer term <Tex tail=",">{T`T_j`}</Tex> which each
              trainer can estimate from its own batch with one forward-mode pass
              per rollout. OPM should match or beat multi-task RL on domains whose
              updates conflict with the others’, and trail it on domains with
              positive transfer between them (knowledge work and tool use, or math
              and held-out reasoning) unless trainer learning rates are raised. In an
              exact-gradient check the correlation between <Tex>{T`T_j`}</Tex>{' '}
              and the realised gap was 0.84–0.87 for short rounds and fell to
              0.27 for long ones, where second-order terms dominate. Testing it
              at 9B needs <Tex>{T`T_j`}</Tex> and the summed update’s reward at
              every merge, which our run does not record; we leave it to
              future work.
            </p>
            {DEV ? (
              <Placeholder label="Figure 13 · which domains help or hurt each other?" status="needs the cross-domain evaluations">
                <p>
                  【Reader’s question: is there transfer or interference
                  between the domains? An 8 × 8 matrix: row is the specialist,
                  column is the domain’s held-out set, cell is the gain over
                  the base model, on a diverging colour scale. Two extra rows
                  give multi-task RL and OPM.】
                </p>
              </Placeholder>
            ) : null}
          </div>
          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Side findings" id="findings" />
          <div className="am-prose">
            <p>
              We measured merges at the level of policies, in exact fp32, and
              logged every merge of the 9B run. Several of the resulting
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
              at each merge would show which regime a run is
              in.
            </p>
            <p>
              <span className="am-runin">The merge is the sum plus a correction outside the updates.</span>{' '}
              At every merge of the 9B run the OPM merge differed from the
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
              and visibility, both computable at a merge, tell which
              situation a run is in.
            </p>
            <p id="modularity">
              <span className="am-runin">Adding a domain, containing a fault.</span>{' '}
              Because each domain has its own trainer, OPM can change its set of
              domains mid-run. A new skill starts as one more trainer from the
              current anchor and joins at the next merge. Multi-task RL has
              to re-mix its quotas instead, and the new gradients reach every
              domain from the first step. By idle protection (<a className="am-ref" href="#prop-2">Proposition 2</a>), the
              existing domains’ policies are unchanged to first order wherever the
              new trainer’s Fisher range is independent of theirs. The same
              structure limits how far a fault spreads. If one domain’s reward is
              faulty, for example a verifier that gives reward for any
              syntactically valid tool call, the fault reaches the others only
              through the merge, along the Fisher directions they share and by at
              most the threshold per round. The per-merge diagnostics flag
              that trainer, which can then be rolled back or dropped on its own.
              This requires the guard to be enforced; a merge that admits a
              flagged trainer passes the fault to every domain. In multi-task RL
              the faulty gradients have already reached every weight. We have
              not tested either case; both can be run at low compute cost as
              branches of a main run.
            </p>
            <p>
              <span className="am-runin">Trade-offs.</span> Every merge
              costs a merge and a synchronisation, since every trainer waits for
              the merged model. The merge takes about five minutes for two 9B
              trainers and 37–70 minutes for eight, because each trainer
              computes Fisher products on its own rollouts. Frequent merges provide locality, calibrated
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
              next step. OPM synchronises at a merge, every 5–15 hours in our
              run, and a merge does not need every trainer. In our run one
              trainer missed a merge while its machines were down and the
              other trainers were merged without it; at another merge the guard
              deferred the math trainer’s update to the next one; and trainers
              that had finished their budget took part with their final weights.
              MOPD needs no synchronisation while the specialists train, so they
              can run at different times on different clusters. Its
              distillation stage starts only after the last specialist finishes,
              and it adds student rollouts in every domain and teacher scoring
              of every student token. OPM’s remaining synchronisation cost is that
              the trainers taking part in a merge wait for it, 6–19% of a
              round in our run. Solving the merge on snapshots while the trainers
              keep training would remove it
              (<a className="am-ref" href="#not-tested">Not yet tested at scale</a>).
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
              from one two-domain test and seven merges of one 9B run. In the one-shot merge, a stale metric
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
              merge frequency moves OPM between merge-after, one merge
              at the end, and multi-task RL. In the toy the result depends
              strongly on the interval. At 50 steps per task, merging every 1, 5,
              10, 25 or 50 steps gave 0.97, 0.96, 0.93, 0.34 and 0.08, and a KL
              trigger scored higher than a fixed interval with a similar number of
              merge, 0.987 against 0.88 (<a className="am-ref" href="#app-e">Appendix E</a>). An intermediate setting that needs few merges is
              merge-then-polish, in which specialists train separately as usual
              and a few merges at the end merge them. Measuring this
              curve at 9B is future work.
            </p>
            <p>
              <span className="am-runin" id="grouped">An extension: grouped OPM.</span>{' '}
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
              every merge: the visibility of one domain’s
              update in another’s Fisher and the sign of the transfer term{' '}
              <Tex tail=".">{T`T_j`}</Tex> Domains with positive{' '}
              <Tex>{T`T_j`}</Tex> and high mutual visibility should share a group,
              and a pair with negative <Tex>{T`T_j`}</Tex> and high visibility
              should be split. Since a merge is cheap, the grouping can change
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

          {/* Author TODO: one place for open experiments and facts to confirm.
              Rendered only in development; readers of the published site do
              not see it. */}
          {process.env.NODE_ENV !== 'production' ? (
            <div id="author-todo">
          <Placeholder label="Author TODO · efficiency experiments" status="need experiment">
            <ul>
              <li>
                【need experiment: asynchronous snapshot merge. Solve the merge
                on snapshots while the trainers keep stepping, then add{' '}
                <Tex>{T`\theta^{+}-\theta_{\rm snapshot}`}</Tex> to every
                trainer. Today every trainer waits 48–57 minutes per merge,
                6–19% of a round. Report wall-clock overhead per merge,
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
                merge. Report products per merge and held-out residual
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
                【need experiment: cost in FLOPs. Figure 9 split into rollout,
                training, merge, teacher scoring and idle time per arm, and score
                against cumulative FLOPs with multi-task RL’s intermediate
                checkpoints as a curve.】
              </li>
            </ul>
          </Placeholder>
          <Placeholder label="Author TODO · Adam coupling" status="need experiment">
            <p>
              【need experiment: in the multi-task run, the Adam-preconditioned
              gradient cosines between domains and how much the shared second
              moment lowers each domain’s effective learning rate.】
            </p>
          </Placeholder>
          <Placeholder label="Author TODO · facts to confirm" status="need input">
            <ul>
              <li>【confirm: the values and units of the drift thresholds δ_i used at 9B, how they were chosen, and the number of steps per round.】</li>
              <li>【confirm: drift and residual are measured on the 2,048-action-token prefix (the logs suggest so).】</li>
              <li>【confirm: the per-trainer check was not enforced in merges 1–5 and enforced from merge 6.】</li>
              <li>【confirm: rollouts are sampled at temperature 1 with no top-p or top-k; otherwise diag(p) − ppᵀ is not the Fisher of the sampling policy.】</li>
              <li>【confirm: the 0.0002–0.0026 nats per token moved by a merge, and which tokens it is normalised by.】</li>
              <li>【confirm: 4% and 2% FLOPs shares, and 1.8 gradient passes of arithmetic per product.】</li>
              <li>【confirm: one-shot 4B residual after 30 CG iterations is 16% in the text and 15% in Appendix B.9.】</li>
              <li>【decide: whether engines are rebalanced between domains at merges; removed from the text until confirmed.】</li>
              <li>【confirm: SWE-bench Pro is the V2 set, 642 tasks, one sample, no network access. Base scores 74.5%, above published resolve rates for 9B models; say the harness is not comparable to leaderboards.】</li>
              <li>【confirm: multi-task RL and MOPD have the same HLE entry, 10.50 ± 1.41 (Table F1). Check it is not a copied cell.】</li>
              <li>【confirm: which validation set chose step 60 for the math specialist; held-out math chose step 210 earlier.】</li>
              <li>【confirm: SWE-rebench (84 tasks) and the held-out SWE set were run in the sealed harness, and what “gold-valid” removed (93 to 84).】</li>
              <li>【confirm: A₁, A₃, A₅ are the anchors after merges 1, 3 and 5, and the ± in the paired row of Table 5 is a standard error.】</li>
              <li>【confirm: the recipe table of Appendix F for the final OPM run (math 1e-6, KL 1e-4, 64k; SWE 16×8×300 at 1e-6, staleness 4; IF and tool use 2e-6), what the math KL penalty is measured against (the base model, or a reference refreshed every 20 steps), and the training data of the SWE trainer.】</li>
              <li>【need evaluation: IFBench and IFEval for the specialist and the merges; τ²-Bench or BFCL for multi-task RL step 150 and the merges; GDPval-AA for every arm and the final OPM model under one judge. Figure 5 has no tool-use or knowledge-work panel until then.】</li>
              <li>【confirm: the realised mix of a multi-task step (accepted rollouts per domain) and what the ledger rule sets the gradient weights to; Appendix F gives the planned mix only.】</li>
              <li>【decide: the rule that picks the reported OPM model (the anchor at the end of the run, or one chosen on a dev set); one anchor for every column.】</li>
              <li>【note: the body reports task arithmetic with λ = 1 only. TIES scores above it on most benchmarks and the closed form of Liu et al. fails; both are in Table F6.】</li>
              <li>【decide: the introduction says a merged model typically does not match the specialists and an MOPD student is bounded by its teachers. Table 4 and Table F7 contradict both at 9B.】</li>
            </ul>
          </Placeholder>
            </div>
          ) : null}

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
