import { type Metadata } from 'next'
import type { ReactNode } from 'react'

import { Container } from '@/components/Container'

import './_styles/merge.css'
import './_styles/algorithm.css'
import './_styles/residual.css'

import Tex from './_components/Tex'
import SectionTitle from './_components/SectionTitle'
import { ParadigmFigure } from './_components/Figures'
import WeightSpace3D from './_components/WeightSpace3D'
import ResidualChart from './_components/ResidualChart'
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
  { label: 'Five ways to get one model', href: '#map' },
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

const BIBTEX = `@article{wang2026onpolicymerge,
  author  = {Bowen Wang},
  title   = {On-Policy Merge Stabilizes Multi-Task Reinforcement Learning},
  journal = {bowenwang.me},
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
              Our starting point is a merge rule, not a training loop. Let
              trainers move from a shared anchor <Tex>{T`\bar\theta`}</Tex> by
              updates <Tex tail=".">{T`\Delta_i`}</Tex> The model whose behaviour
              on each domain is closest in KL to that domain’s trainer has, to
              second order, a closed form, a Fisher-weighted average{' '}
              <Tex tail=",">{T`\theta^{+}=\bar\theta+\big(\sum_iF_i\big)^{+}\sum_iF_i\Delta_i`}</Tex>{' '}
              and the choice of Fisher is what does the work. With{' '}
              <Tex>{T`F_i`}</Tex> taken on trainer <Tex>i</Tex>’s own on-policy
              rollouts, its policy gradient lies in the range of{' '}
              <Tex tail=":">{T`F_i`}</Tex> a change that domain’s Fisher cannot
              see is a change its return cannot feel. Whenever the trainers’
              updates can be reconciled, the merged model therefore keeps every
              domain’s own first-order gain and drops every cross-domain term.
            </p>
            <p>
              The rule is accurate only locally. It is a second-order expansion
              around each trainer, and its weights are each trainer’s current
              Fisher, which fades on exactly the behaviour a trainer has become
              confident about. Applied once to finished specialists, tens to
              hundreds of nats apart, it still works: merging five released 4B
              RL specialists with no training and no student rollouts beats
              task arithmetic by 1.3 points and the released MOPD model by 0.8
              points on a domain-balanced benchmark mean. But it leaves part of
              each specialist behind, and nothing corrects what it misses.
            </p>
            <p>
              <strong>On-Policy Merge</strong> (OPM) therefore applies the rule
              during training, keeping the specialists’ independence and giving
              up only the distance. Each domain has its own on-policy trainer,
              started from a shared anchor. As soon as any trainer has drifted a
              fixed KL budget <Tex>{T`\delta`}</Tex> from the anchor, all of
              them merge with the rule above, measured on the rollouts each
              trainer has just collected. Every trainer reloads the merged model
              and continues, and the next round of RL repairs what the merge
              missed. Train apart, meet often: often enough that every merge
              stays where the rule is accurate.
            </p>
            <p>
              This is the sense in which OPM stabilizes multi-task RL. Each
              domain improves whenever its own trainer does, whatever the batch
              shares, gradient scales or speeds of the others, and a domain that
              stalls or breaks is held in place rather than dragged. Decoupling
              removes transfer of both signs, so OPM is not a faster optimizer:
              when domains help each other, summing their updates does better,
              and at the same bf16 precision plain summation beats the one-shot
              merge by 0.6, as the theory predicts for math, science and code.
              What OPM buys is a per-domain guarantee at a measurable price: one
              model copy per domain, and a merge that takes about ten minutes on
              a 9B model with a guarded solver and needs no environment
              interaction.
            </p>
            <p>
              The rest of the post places OPM among the existing recipes,
              derives the merge, why it must be applied often and what it
              guarantees, shows how to make it cheap, and tests it: first on those released specialists, then
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
              SGD this is exactly the same as running one trainer per domain and
              summing their updates after every step (<a className="am-ref" href="#app-a">Appendix A</a>). Combining
              every <Tex>K</Tex> steps instead gives periodic summing or
              averaging, the federated-averaging and DiLoCo family{' '}
              <Cite k={['mcmahan2017', 'douillard2023']} />. Combining once,
              after training, gives <strong>merge-after</strong> methods: task
              arithmetic, TIES and DARE{' '}
              <Cite k={['ilharco2023', 'yadav2023', 'yu2024']} />. Cascade RL
              trains the domains one after another{' '}
              <Cite k={['wang2025', 'yang2026']} />. In these terms it is
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
              <strong>OPM</strong> takes the remaining combination. It combines
              during training, as often as a KL budget demands, in KL geometry,
              with the Fisher measured on each trainer’s own states. <a className="am-ref" href="#table-1">Table 1</a>{' '}
              lists what each method pays.
            </p>
            <div className="am-table" id="table-1">
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
            <p style={{ fontSize: '14px' }}>
              <strong>Table 1.</strong> How often each method combines the
              domains, in which geometry, whether reward is used when combining,
              and what it pays.
            </p>
            <p>
              The rules are related exactly, not by analogy (<a className="am-ref" href="#app-a">Appendix A</a>,
              <a className="am-ref" href="#table-a2">Table A2</a>). Summing is OPM when the domains’ Fishers are mutually
              orthogonal. Averaging is OPM when they are all equal. With one
              natural-gradient step per trainer, the OPM merge is a natural
              policy gradient step on the summed objective{' '}
              <Cite k="kakade2001" />. Task arithmetic with a coefficient
              between <Tex>{T`1/n`}</Tex> and 1 interpolates between the
              presumptions of the average and the sum (<a className="am-ref" href="#table-1">Table 1</a>). OPM measures, direction by direction, which one
              holds; <a className="am-ref" href="#fig-2">Figure 2</a> shows what that looks like in weight space.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="On-Policy Merge" id="method" />
          <div className="am-prose">
            <p>
              This section builds OPM step by step: what a merge of RL trainers
              should preserve, the closed form that preserves it, the Fisher that
              makes the closed form right for RL, why the merge has to happen
              during training, and the loop that runs it.
            </p>
            <p>
              <span className="am-runin">What a merge should preserve.</span>{' '}
              Each trainer has learned something about its own domain, and the
              merged model should keep it. We measure that by behaviour, not by
              weights: on domain <Tex>i</Tex>, the merged model’s rollouts should
              look like trainer <Tex>i</Tex>’s. A rollout{' '}
              <Tex>{T`\xi=(h_1,a_1,\dots,h_L,a_L)`}</Tex> has probability{' '}
              <Tex>{T`P^i_\theta(\xi)=\prod_t\pi_\theta(a_t\mid h_t)`}</Tex>{' '}
              times environment terms that do not depend on{' '}
              <Tex tail=",">{T`\theta`}</Tex> so the KL between rollout
              distributions is well defined and the environment cancels from it.
              The merge we want is the <Key>KL barycenter</Key> of the trainers:
            </p>
            <Tex
              display
            >{T`\theta^{+}\in\arg\min_\theta\;\sum_i\mathrm{KL}\big(P^i_{\theta_i}\,\|\,P^i_\theta\big).\tag{1}`}</Tex>
            <p>
              Up to a constant, (1) is the negative log-likelihood of every
              trainer’s own rollouts under the merged model, so it needs nothing
              the trainers do not already hold. The objective is not new:
              Distral and Divide-and-Conquer RL use it for their shared policy
              and reach it by distillation{' '}
              <Cite k={['teh2017', 'ghosh2018']} />. What is new is solving it in
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
              Read (2) one direction of weight space at a time. Where only
              domain <Tex>i</Tex> has curvature, the anchor takes all of{' '}
              <Tex tail=".">{T`\Delta_i`}</Tex> Where several domains do, it
              takes their curvature-weighted mean. Where none does, it moves
              nowhere any domain can see. For tabular policies the exact
              minimiser of (1) is, at every history, the mixture of the
              trainers’ action distributions weighted by how often each visits
              it; (2) is its second-order version.
            </p>
            <p>
              <span className="am-runin">Which Fisher.</span> Formula (2) is
              Fisher-weighted averaging <Cite k="matena2022" />, and everything
              depends on which Fisher. OPM uses the <Key>on-policy Fisher</Key>:
              the Fisher of trainer <Tex>i</Tex>’s current policy on its own
              domain, estimated from rollouts that policy has just sampled and
              summed over the tokens of each rollout. One property makes this
              the right choice for RL. Write{' '}
              <Tex>{T`S(\xi)=\sum_ts_t`}</Tex> for the score of a rollout and{' '}
              <Tex>b</Tex> for any reward baseline. For every direction{' '}
              <Tex tail=",">v</Tex>
            </p>
            <Tex
              display
            >{T`F_iv=0\;\Longrightarrow\;\mathbb{E}\big[(v^\top S)^2\big]=0\;\Longrightarrow\;v^\top S=0\ \text{on every rollout}\;\Longrightarrow\;v^\top\nabla J_i=\mathbb{E}\big[(R_i-b)\,v^\top S\big]=0 .`}</Tex>
            <p>
              <Key>
                The policy gradient lies in the range of the on-policy Fisher: a
                change that a domain’s Fisher cannot see is a change its return
                cannot feel.
              </Key>{' '}
              That is why a merge that respects each Fisher can respect each
              return without ever looking at a reward. The argument needs the
              gradient and the Fisher to be expectations under the same
              distribution. It fails for the empirical Fisher of stale or
              foreign rollouts, a different and biased object{' '}
              <Cite k="kunstner2019" />, and for supervised gradients against a
              model Fisher. Hence the name: the data, the metric and, as the loop
              below ensures, the continuation are all on-policy.
            </p>
            <p id="why-meet-often">
              <span className="am-runin">Why meet often.</span> Formula (2) is a
              second-order expansion with weights measured at the trainers, so
              it is <Key>accurate only locally</Key>. Four things degrade as the
              trainers drift apart, and each is a reason to merge during
              training rather than after it.
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
                <Key>Calibration.</Key> As a trainer grows confident, its Fisher
                vanishes on the logits it pushed, so a late merge undervalues
                exactly what the trainer learned best.
              </li>
              <li>
                <Key>Repair.</Key> After a merge during training, the next round
                of RL starts from the merged model and corrects with reward what
                the merge missed. A merge after training has no second chance.
              </li>
              <li>
                <Key>Continuation.</Key> A merge that moves each trainer by a
                small per-token KL keeps its rollouts in flight usable under
                per-token importance weights, so training never stops for a
                hand-over.
              </li>
            </ul>
            <p>
              Frequency does not fix everything. Where domains genuinely
              conflict, each round leaves a second-order residual whose
              first-order reward cost does not shrink with frequency, and where
              the domains’ Fishers do not overlap, frequency changes nothing. How
              often to merge is therefore a trade-off against the cost of a
              merge, which the engineering section makes small and the frequency
              sweep measures.
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
              <Line indent={2} note="from each trainer’s cached rollouts">
                <Tex tail=",">{T`\Delta_i\leftarrow\theta_i-\bar\theta`}</Tex>{' '}
                <Tex>{T`F_i\leftarrow\mathbb{E}_{\xi\sim P^i_{\theta_i}}\big[\textstyle\sum_ts_ts_t^\top\big]`}</Tex>
              </Line>
              <Line
                indent={2}
                note={
                  <>
                    the merge (2), solved as in{' '}
                    <a href="#engineering">Making the merge cheap</a>
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
              The property above says that (2) never moves a domain’s return
              through a direction its Fisher ignores. This section asks what the
              merge guarantees in the directions that remain, what multi-task RL
              lacks by comparison, and what the guarantee costs. Each statement
              carries a status in <a className="am-ref" href="#app-b">Appendix B</a> (theorem, proposition under stated
              assumptions, or conjecture with numerical support), with its proof.
            </p>
            <p>
              <span className="am-runin">When a merge loses nothing.</span> Each
              domain’s policy is unchanged, to second order, along the affine
              subspace <Tex tail=":">{T`\theta_j+\operatorname{null}(F_j)`}</Tex>{' '}
              a flat-bottomed trough in weight space (<a className="am-ref" href="#fig-2">Figure 2</a>). Call a round{' '}
              <Key>lossless</Key> if the troughs meet, that is, if some
              displacement <Tex>d</Tex> satisfies{' '}
              <Tex>{T`F_j(d-\Delta_j)=0`}</Tex> for every{' '}
              <Tex tail=".">j</Tex> This holds for every possible set of updates
              exactly when the Fisher ranges are linearly independent:
              independent, not orthogonal.
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
                The two trainers slide from the anchor to the bottom of their
                own troughs. Averaging their updates and summing them (task
                arithmetic) both land on the walls; the OPM merge (2) solves for
                the point where the troughs cross, which exists when the round
                is lossless. The quadratic picture holds only near the trainers,
                which is why OPM meets before they drift far.
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
              The second identity is the one that matters.{' '}
              <Tex>{T`T_j`}</Tex> is the <Key>cross-domain term</Key>: what the
              other domains’ updates do to domain <Tex>j</Tex>’s return. Summing
              keeps it; OPM removes it, whatever its sign. When{' '}
              <Tex>{T`T_j<0`}</Tex> it is interference, and removing it is the
              point. When <Tex>{T`T_j>0`}</Tex> it is positive transfer, and OPM
              removes that too. What the term depends on is the surprise:{' '}
              <Key>
                domains couple through overlapping Fishers, not through aligned
                gradients.
              </Key>{' '}
              In the released 4B specialists merged later in this post,
              parameter cosines are at most 0.022, yet the math specialist’s
              update moves the code specialist’s policy by 1.78 times the code
              specialist’s own drift.
            </p>
            <p>
              <span className="am-runin">What decoupling buys.</span> Where
              rounds are lossless, each domain behaves as if it were trained
              alone: to first order per round in general, and exactly for
              log-linear policies with linearly independent feature spans, after
              any number of rounds and for any trainer optimizer whose update
              depends only on its own history, Adam with persistent state
              included (<a className="am-ref" href="#app-b-2">Appendix B.2</a>). That gives guarantees multi-task RL does
              not have.
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
                  <strong>The trigger is the trust region.</strong> For any
                  optimizer, <Tex tail=",">{T`D_i\le\delta_i+\omega`}</Tex> with{' '}
                  <Tex>{T`\omega`}</Tex> the KL of one step, and the exact
                  merge’s KL residuals <Tex>{T`\varepsilon_i`}</Tex> satisfy{' '}
                  <Tex tail=".">{T`\sum_i\varepsilon_i\le\sum_iD_i\le\sum_i(\delta_i+\omega)`}</Tex>
                </li>
              </ol>
            </div>
            <p>
              Item 4 needs no lossless point. Multi-task RL has none of these
              guarantees. One step of it changes the return of domain <Tex>j</Tex> by
            </p>
            <Tex
              display
            >{T`\Delta J_j\approx\eta\Big(c_j\,\nabla J_j^\top P\,\nabla J_j+\sum_{i\ne j}c_i\,\nabla J_j^\top P\,\nabla J_i\Big),`}</Tex>
            <p>
              with <Tex>{T`c_i`}</Tex> the batch shares and <Tex>P</Tex> the
              optimizer’s preconditioner, so under conflict any domain with a
              small enough share or gradient regresses. Two parameters are
              enough to see it: with domain 2’s share at 0.2, multi-task SGD
              drives its return from 0.50 to 0.24, and Adam in a rotated
              parameterisation drives it to <Tex tail=",">{T`3\times10^{-4}`}</Tex>{' '}
              while under OPM domain 2 follows the same trajectory for every
              share and reward scale of domain 1 (<a className="am-ref" href="#app-b-5">Appendix B.5</a>, which also
              covers forgetting under Cascade RL).
            </p>
            <p>
              <span className="am-runin">In terms of gradients.</span> The
              formula above is only the first of three ways multi-task RL
              couples domains. A shared update adds their gradients, so their
              directions interfere. A global gradient-norm clip scales every
              domain’s step by the norm of the sum, so a domain with long,
              high-norm rollouts shrinks everyone’s step whenever it triggers the
              clip. And Adam’s second moment is a running average of the squared{' '}
              <em>mixed</em> gradient: wherever one domain’s gradients are large,
              every domain’s effective learning rate in those coordinates drops,
              even when the gradients are orthogonal, because in a dense model
              all domains share all coordinates. OPM cuts all three inside a
              round. Each trainer has its own optimizer state, clip, learning
              rate and schedule, which we call <Key>optimizer isolation</Key>;
              it is the mechanism behind item 2 of{' '}
              <a className="am-ref" href="#prop-2">Proposition 2</a> and behind
              the Adam example above.
            </p>
            <p>
              At the merge, the weight a domain gets in a direction is its
              curvature there, not its gradient norm. A fast domain cannot pull
              the anchor its way by pushing hard, and a converged domain whose
              gradients are small but whose curvature is large is protected.
              Direction is judged in the metric that matters: Euclidean cosines
              between updates are close to zero at LLM scale, at most 0.022
              between the 4B specialists, and say little, while the Fisher
              overlap that actually couples domains is what (2) weighs. The same
              choice has a blind spot. A drift that leaves domain{' '}
              <Tex>j</Tex>’s return unchanged to first order, because it is
              orthogonal to <Tex tail=",">{T`\nabla J_j`}</Tex> still costs KL,
              so OPM resists it as firmly as a harmful one.{' '}
              <Key>The merge preserves behaviour, not reward</Key>, and it pays
              for that wherever such drift would have been harmless.
            </p>
            <Placeholder label="Gradient diagnostics" status="need experiment">
              <p>
                【need experiment: gradient coupling. For each pair of domains in
                the main runs, the Euclidean and Adam-preconditioned gradient
                cosines next to the Fisher visibility; in the multi-task run, how
                often the global clip triggers and how much the shared second
                moment lowers each domain’s effective learning rate.】
              </p>
            </Placeholder>
            <p>
              Item 4 of{' '}
              <a className="am-ref" href="#prop-2">Proposition 2</a> deserves a
              word: <Key>the trigger is the trust region</Key>.
              OPM therefore needs no reference-KL penalty, which matches frontier
              practice; no arm of our experiments uses one. Because the cubic
              remainder accumulates per token, the ceiling{' '}
              <Tex>{T`\delta_i`}</Tex> is best set in proportion to domain{' '}
              <Tex>i</Tex>’s response length (<a className="am-ref" href="#app-b-6">Appendix B.6</a>).
            </p>
            <p>
              <span className="am-runin">What decoupling costs.</span> Removing
              the cross-domain term removes positive transfer with it, and the
              price can be stated exactly.
            </p>
            <div className="am-callout" id="prop-3">
              <div className="am-callout-label">Proposition 3 · the price</div>
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
              A boundary optimum is the common case: pushing up an action that
              every domain rewards. So{' '}
              <Key>
                OPM has no general rate advantage over a well-tuned multi-task
                run
              </Key>
              , and we do not claim one. In KL geometry positive transfer is
              extra reward-aligned drift, in effect a larger step, and a larger
              trainer learning rate recovers part of it; merging more often does
              not, because in lossless directions OPM equals solo training at
              every interval. With nonlinear policies OPM also carries an error
              floor of order <Tex tail=",">{T`\eta K`}</Tex> set by how far the
              lossless point lies in parameter space (<a className="am-ref" href="#app-b-4">Appendix B.4</a>). What OPM
              offers instead of speed are the guarantees above, and when domains
              conflict, those are worth more than speed.
            </p>
            <p>
              A controlled toy shows both sides (<a className="am-ref" href="#app-e">Appendix E</a>). Four chain tasks
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
              The bound is Pinsker’s inequality: at its optimum the MOPD student
              equals its teachers, and it can exceed them only by not converging
              or through an added outcome reward. <CiteT k="liu2026" /> showed
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
              do not quite: even after 30 CG iterations, the merged model’s KL to
              the specialists is still 16% of how far they drifted. In practice
              the guarantees hold approximately, as closely as that residual is
              small, which is why the main runs log it at every rendezvous.{' '}
              <a className="am-ref" href="#app-b">Appendix B</a> gives the
              status and proof of every statement, and lists what is not
              claimed.
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Making the merge cheap" id="engineering" />
          <div className="am-prose">
            <p>
              A merge is only worth having if it is cheap next to the training
              it interrupts. This section works out what a merge costs, measures
              it at 9B, and asks what changes at frontier scale, where models
              have hundreds of billions to trillions of parameters, layers are
              mixtures of experts, and rollouts arrive asynchronously from
              inference engines that do not match the trainer exactly.
            </p>
            <p>
              <span className="am-runin">What a merge costs.</span> Formula (2)
              cannot be formed for a model of this size, since the Fisher has as
              many rows as the model has parameters. It can be solved, though:
              conjugate gradient (CG) only ever needs products{' '}
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
              forward pass per token, in units of one training token. Two
              consequences follow, and they pull in different directions.{' '}
              <Key>The compute ratio does not depend on model size.</Key> A
              Fisher-vector product touches the same parameters per token as a
              training step does, so both scale with the active parameters, and
              a trillion-parameter mixture-of-experts model pays the same
              fraction as a dense model of its active size.{' '}
              <Key>Memory and communication do depend on it</Key>, because they
              scale with all the parameters. CG keeps fp32 vectors as long as
              the model, and four of them take as much memory as the training
              state itself. Each iteration also all-reduces one of them across
              trainers: 4 TB at a trillion parameters, a matter of seconds inside
              one cluster and impractical between clusters.
            </p>
            <p>
              <span className="am-runin">What we measured at 9B.</span> On
              MiMo-V2.6-Distill-Qwen-9B <Cite k="mimo2026" /> the product
              dominates everything else. We compute it exactly, with the true
              per-token Fisher rather than the empirical one, in fp32 and with
              finite differences in logit space. It costs 6.9 GPU-milliseconds
              per token, so <Tex>{T`c_{\rm FVP}\approx16`}</Tex> bf16 gradient
              passes; about half of that is the backward pass and 40% the
              finite-difference forward passes. Communication and the{' '}
              <Tex>{T`n\times n`}</Tex> algebra were negligible on one node,
              and keeping the CG vectors in CPU memory, a tempting way to save
              GPU memory, made every product three times slower. The guarded
              merge below uses four products and four forward passes and takes
              about ten minutes. Everything that follows is about shrinking{' '}
              <Tex tail=".">{T`c_{\rm FVP}N_F`}</Tex>
            </p>
            <p>
              <span className="am-runin">Conjugate gradient overshoots.</span>{' '}
              Our first attempt failed in an instructive way. Plain CG, started
              from the summed update, made the held-out residual worse at each of
              its first iterations, even though the quadratic model was accurate
              along the directions it took (<Tex>{T`\kappa`}</Tex> between
              0.87 and 1.0). The trouble is where CG looks first. Its earliest
              directions are the Fisher’s stiffest, about{' '}
              <Tex>{T`10^7`}</Tex> times stiffer than typical ones, and along
              them the KL saturates within 0.3% of the update norm. A
              finite-difference product measures a secant across its step, and
              across a saturating stretch the secant is flatter than the
              curvature at the start: it underestimated the curvature
              sixteen-fold at a logit step of 0.3 and by 40% at 0.03. Seeing too
              little curvature, CG stepped too far.
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
              four forward passes. The full CG step never beats the half step,
              five or more iterations make things worse, and a large
              finite-difference step of 0.3 blows the full step’s residual up to
              113 nats after two iterations and 215 after three. This guarded
              merge is the default in all our training runs. It is one test
              case, two domains on one model, and the main runs log the residual
              for every <Tex>{T`\gamma`}</Tex> at every rendezvous.
            </p>
          </div>

          <figure id="fig-3">
            <ResidualChart />
            <figcaption>
              <strong>Figure 3.</strong> Held-out KL residual of the guarded
              merge after one to ten CG iterations, for three damping factors{' '}
              <Tex>{T`\gamma`}</Tex> along the path from the summed update (data
              of <a className="am-ref" href="#table-2">Table 2</a>). Dashed lines mark the sum (13.35 nats) and the
              average (30.7); not merging at all leaves 125.3. At the default
              finite-difference step every damped step stays below the sum, and the residual is lowest at three
              iterations with <Tex tail=",">{T`\gamma=\tfrac12`}</Tex> the
              default. The full step degrades after two iterations, and a
              finite-difference step of 0.3 pushes two of the three settings off
              the chart.
            </figcaption>
          </figure>
          <div className="am-prose">
            <p>
              <span className="am-runin">Levers at frontier scale.</span> We
              now reason about models at frontier size, hundreds of billions to
              trillions of parameters, and lay out the optimisations and analysis
              we expect OPM to need there. Four levers act on the cost of a
              merge; three more choices fit it into asynchronous training. The
              runs that would confirm each are listed at the end of the section.
            </p>
            <p>
              <Key>Fewer tokens.</Key> Most of the Fisher sits on a small
              fraction of tokens. For one token, the Fisher in logit space is{' '}
              <Tex tail=",">{T`\mathrm{diag}(p)-pp^\top`}</Tex> the covariance
              of the next-token distribution, and its size is its trace,{' '}
              <Tex tail=".">{T`1-\sum_ap_a^2`}</Tex> On a token the model is
              sure about, <Tex>p</Tex> is nearly one-hot and the trace is nearly
              zero, so the token adds almost nothing to{' '}
              <Tex>{T`F_iv`}</Tex> however much it cost to process. Reasoning
              traces are mostly such tokens: only about a fifth are high-entropy
              forks, and those carry most of the RL signal{' '}
              <Cite k="wang2025b" />. We can therefore sample tokens with
              probability proportional to <Tex tail=",">{T`1-\sum_ap_a^2`}</Tex>{' '}
              weight each by the inverse of that probability so the estimate
              stays unbiased, and keep only the top few logits of each token to
              trim the vocabulary head. If the Fisher is as concentrated as the
              gradient, this cuts <Tex>{T`c_{\rm FVP}N_F`}</Tex> several-fold at
              little cost in accuracy.
            </p>
            <p>
              <Key>Exact, cheaper products.</Key> The finite difference is both
              a cost and the cause of the overshoot above. A Jacobian-vector
              product followed by a vector-Jacobian product computes the
              Gauss–Newton product exactly, with no step to tune. The curvature
              CG sees is then the true local curvature, and the guard becomes a
              safety net rather than a requirement. Running the products in bf16
              with fp32 accumulation cuts <Tex>{T`c_{\rm FVP}`}</Tex> further,
              as long as the merge’s own arithmetic stays in fp32, above the
              bf16 floor. The risk is engineering: forward-mode differentiation
              has to pass through fused attention and expert kernels, which few
              training stacks support today.
            </p>
            <p>
              <Key>A subspace solve.</Key> CG searches the whole parameter
              space, but the trainers’ updates already span most of what a merge
              needs. Restricting the merge to{' '}
              <Tex>{T`\bar\theta+\sum_kc_k\Delta_k`}</Tex> turns (2) into an{' '}
              <Tex>{T`n\times n`}</Tex> linear system whose entries,{' '}
              <Tex tail=",">{T`\sum_i\Delta_j^\top F_i\Delta_k`}</Tex> are
              the curvature the domains assign to each pair of updates. The
              result is task arithmetic with Fisher-optimal coefficients, and
              splitting the inner products by layer or by expert gives one
              coefficient per block from the same products. Each trainer
              computes <Tex>{T`F_i\Delta_k`}</Tex> for every <Tex>k</Tex> on
              its own data, in parallel, and sends <Tex>{T`n^2`}</Tex> numbers.
              That is <Tex>n</Tex> products instead of <Tex>K</Tex> sequential
              ones, so it does not always save compute, but it removes every
              full-size all-reduce beyond the exchange of updates that any merge
              needs, which is what makes trainers in different clusters
              feasible. The subspace solution is also a better starting point
              for CG than the sum, and a rendezvous can warm-start from the
              previous one.
            </p>
            <p>
              <Key>Experts and memory.</Key> Mixture-of-experts layers give the
              Fisher a block structure. An expert’s block sums only over the
              tokens routed to it, so where domains use different experts their
              blocks barely overlap and (2) reduces to the plain sum there; the
              coupling, and the CG work, concentrate in attention, embeddings,
              shared experts and the router. Routing also adds a locality
              condition of its own. A merge that flips the top-<Tex>k</Tex>{' '}
              choice for many tokens moves them onto different experts, outside
              any quadratic model, so the fraction of flipped routes belongs next
              to <Tex>{T`\kappa`}</Tex> among the diagnostics logged at every
              rendezvous. The larger frontier cost is memory: <Tex>n</Tex>{' '}
              trainers hold <Tex>n</Tex> training states of about 16 bytes per
              parameter, 16 TB each at a trillion parameters. Grouping domains
              (<a className="am-ref" href="#discussion">Discussion</a>) divides that by the group size. Low-rank trainers
              would divide it further: each domain trains an adapter on the
              shared anchor, and each rendezvous merges the adapters’ updates in
              their span and folds the result into the anchor. LoRA matches full
              fine-tuning in RL even at very low rank <Cite k="schulman2025" />;
              whether the merge keeps its guarantees under that restriction is
              open.
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
              touches the core of OPM: the range property holds because the
              gradient and the Fisher are expectations under the same
              distribution. Three choices keep it intact.
            </p>
            <p>
              <Key>A logit-space Fisher.</Key> Compute the Fisher per token as{' '}
              <Tex tail=",">{T`J_t^\top\big(\mathrm{diag}(p_t)-p_tp_t^\top\big)J_t`}</Tex>{' '}
              with <Tex>{T`p_t`}</Tex> the trainer’s own recomputed next-token
              distribution, rather than from the score of the sampled token. The
              sampled token is exactly where staleness and mismatch enter, and
              this form never uses it: it averages over the whole vocabulary
              under the trainer’s distribution. It is also centred by
              construction, because <Tex>{T`\mathrm{diag}(p)-pp^\top`}</Tex> is
              the covariance of the one-hot token under <Tex tail=".">p</Tex> A
              Fisher built from sampled scores would need per-token importance
              weights and explicit score centring, since the score has mean zero
              only under the trainer’s own policy. What remains is a shift in
              which histories get visited, of the size of the per-token KL
              between the rollout and trainer policies, which truncated prefix
              weights absorb.
            </p>
            <p>
              <Key>A rendezvous is one more policy lag.</Key> After a merge, the
              rollouts still in flight were sampled by the pre-merge weights, so
              they are stale by the merge’s displacement. The importance weights
              the trainer already applies handle that, as long as the per-token
              KL a merge introduces stays within the range those weights are
              tuned for. This gives a concrete reason to bound a merge per token
              rather than per rollout.
            </p>
            <p>
              <Key>Hidden latency.</Key> The merge need not stop training. Solve
              it on a snapshot of the trainers while they keep stepping, then add{' '}
              <Tex>{T`\theta^{+}-\theta_{\rm snapshot}`}</Tex> to every
              trainer. The correction is a few steps stale, which asynchronous
              RL already tolerates by design.
            </p>
            <p>
              All of this sits on a floor set by the serving stack. Casting an
              fp32 specialist to bf16 moves its policy by 25–40% of its RL drift
              (<a className="am-ref" href="#findings">Side findings</a>), so triggers, residual targets and the guard all
              have to sit above the mismatch between the engines that sample and
              the trainer that learns.
            </p>
          </div>
          <Placeholder label="Experiments to run" status="need experiment">
            <ul>
              <li>
                【need experiment: cost baseline. Overhead terms for one
                rendezvous at 9B and on the largest MoE available, with{' '}
                <Tex>{T`c_{\rm FVP}`}</Tex> for finite differences, bf16 and
                JVP–VJP.】
              </li>
              <li>
                【need experiment: token subsampling at 5/10/20/50%. Error of{' '}
                <Tex tail=",">{T`F_iv`}</Tex> <a className="am-ref" href="#table-2">Table 2</a> residual, time.】
              </li>
              <li>
                【need experiment: subspace solve (global, per layer, per expert)
                against the sum and guarded CG, at 9B and on the 4B merge.】
              </li>
              <li>
                【need experiment: JVP–VJP products. Does CG still overshoot?】
              </li>
              <li>
                【need experiment: per-token KL of each rendezvous against the
                run’s staleness and mismatch KL; snapshot merge applied 0, 2 and
                5 steps late.】
              </li>
              <li>
                【need experiment: top-<Tex>k</Tex> routing flip rate per merge
                against <Tex tail=".">{T`\kappa`}</Tex>】
              </li>
              <li>
                【need experiment: LoRA trainers at ranks 8, 32, 128 against
                full-parameter OPM.】
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
              This tests the operator, not the loop, and in its least favourable
              setting: a single merge after 75 to 248 nats of drift. It also
              lets us check three things the theory predicts.
            </p>
            <p>
              <span className="am-runin">The merge does what the theory says.</span>{' '}
              The quadratic model still holds at this drift: the locality ratio{' '}
              <Tex>{T`\kappa`}</Tex> toward the merged points is 0.96–1.17,
              where an exact quadratic gives 1, and plain CG did not overshoot
              here. The merge keeps far more of each specialist than the other
              rules do. On held-out prompts its KL residual is 0.31 of the
              drift, against 0.52 for task arithmetic, 0.34 for the released MOPD
              model and 1.12 for the sum, and 0.16 after 30 iterations. Where a
              domain barely sees the others’ updates, the round is{' '}
              <Key>close to lossless</Key>: the residual is 0.025 of the drift
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
                    <th className="am-num">Mean</th>
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
                    <td className="am-num">57.54</td>
                  </tr>
                  <tr>
                    <td>Specialist, own domain</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.00 }}>54.5</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.03 }}>61.7</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.00 }}>63.7</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.89 }}>89.6</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.74 }}>48.9</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.44 }}>72.4</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.29 }}>64.30</td>
                  </tr>
                  <tr>
                    <td>Task arithmetic, λ = 0.6</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.55 }}>57.1</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.79 }}>63.9</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.03 }}>63.8</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.51 }}>88.2</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.02 }}>40.4</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.00 }}>71.7</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.24 }}>64.15</td>
                  </tr>
                  <tr>
                    <td>Mixed RL (released)</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.40 }}>56.4</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.00 }}>61.6</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.16 }}>64.2</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.00 }}>86.3</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.00 }}>40.2</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.00 }}>71.7</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.00 }}>63.42</td>
                  </tr>
                  <tr>
                    <td>MOPD (released)</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.30 }}>55.9</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.45 }}>62.9</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.06 }}>63.9</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.76 }}>89.1</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.55 }}>46.7</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.56 }}>72.6</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.40 }}>64.63</td>
                  </tr>
                  <tr>
                    <td>Sum, λ = 1</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 1.00 }}><strong>59.2</strong></td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 1.00 }}><strong>64.5</strong></td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.23 }}>64.4</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.89 }}>89.6</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.77 }}>49.3</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.44 }}>72.4</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.85 }}>65.99</td>
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
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.66 }}>65.41</td>
                  </tr>
                  <tr>
                    <td>OPM merge, 30 CG iterations</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.51 }}>56.9</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.41 }}>62.8</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.94 }}>66.6</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.73 }}>89.0</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.90 }}>50.8</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.81 }}>73.0</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.80 }}>65.83</td>
                  </tr>
                  <tr>
                    <td>OPM merge, 10 iterations, deployed in fp32</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.70 }}>57.8</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.86 }}>64.1</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 1.00 }}><strong>66.8</strong></td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 1.00 }}><strong>90.0</strong></td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 1.00 }}><strong>52.0</strong></td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 0.50 }}>72.5</td>
                    <td className="am-num am-heat" style={{ ['--h' as string]: 1.00 }}><strong>66.44</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '14px' }}>
              <strong>Table 3.</strong> One-shot merges of the five released
              Qwen3-4B specialists of <CiteT k="wu2026" />, mean over 32 samples
              per prompt, in percent. AIME pools the 2025 and 2026 problems (60
              in all), and LiveCodeBench is v6. The mean weights the five
              domains equally: math (AIME), science (GPQA-Diamond), code (LCB
              v6), instruction following (the average of IFEval and IFBench)
              and tool use (BFCL v3). Within each column, darker shading is a
              higher score and bold is the highest; the base model is left
              unshaded as the reference. All merged models are deployed in bf16
              except the last row. The specialist row takes each benchmark from
              its own domain’s specialist. Run-to-run noise, measured by
              evaluating a bit-identical model twice, is about 0.3 points on the
              eight-benchmark mean of <CiteT k="wu2026" />.
            </p>
            <p>
              <span className="am-runin">On benchmarks it beats task arithmetic and MOPD.</span>{' '}
              On the domain-balanced mean of{' '}
              <a className="am-ref" href="#table-3">Table 3</a>, the one-shot OPM
              merge is 1.26 points above task arithmetic and 0.78 above the
              released MOPD model, with no rollouts beyond the 256 per domain
              behind the Fisher. Paired intervals for this mean are{' '}
              <Pending>being recomputed</Pending>; on the eight-benchmark mean of{' '}
              <CiteT k="wu2026" />, which counts AIME and LiveCodeBench twice,
              the same gaps are 1.68 ± 0.42 and 1.11 ± 0.40 over prompts. The
              clearest single case is IFBench: 50.5, against 40.4 for task
              arithmetic and 48.9 for the instruction-following specialist
              itself. Deploying the same merge in fp32 adds about a point more
              (<a className="am-ref" href="#findings">Side findings</a>).
            </p>
            <p>
              <span className="am-runin">Where domains help each other, the sum wins.</span>{' '}
              At the same bf16 precision, plain summation beats the OPM merge by
              0.58 points, mostly on AIME, although its KL residual is almost
              four times larger; with 30 CG iterations the gap shrinks to 0.16,
              within run-to-run noise. This is{' '}
              <a className="am-ref" href="#thm-1">Theorem 1</a> at work, not a
              failure of the metric. Math, science and code help each other: the
              summed model beats every reasoning specialist on its own benchmark,
              and the estimated cross-domain term is positive on all three, 0.17
              to 0.26 of each domain’s own gain. The OPM merge pulls each
              specialist back toward its own behaviour and gives that transfer
              up, exactly as the theory says it should. Instruction following
              and the agent barely see the others’ updates, and there the sum
              and the OPM merge tie. <Key>The KL residual measures how much of
              each specialist is kept, not how much reward is gained.</Key>
            </p>
            <p>
              <span className="am-runin">What this shows, and what it does not.</span>{' '}
              One-shot at 4B, the operator earns its keep against task
              arithmetic and MOPD but not against the sum, and since the quadratic
              model held, what limits it is overlap between the reasoning
              domains rather than locality. That already makes a one-shot OPM
              merge a strong post-hoc tool for released specialists. One caveat
              cuts the other way: a Fisher computed on the base model’s rollouts
              instead of each specialist’s own is worse in KL but ties on
              benchmarks, so the case for the on-policy metric does not rest on
              this experiment. What merging during training must add is the rest
              of{' '}
              <a className="am-ref" href="#why-meet-often">
                Why meet often
              </a>
              : calibrated weights and a next round of RL that repairs the
              residual. The main experiment and the frequency sweep test that.{' '}
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
              rollouts. GPU-hours and wall-clock are reported separately.
              <a className="am-ref" href="#app-f">Appendix F</a> gives every detail.
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
              HLE) go in <a className="am-ref" href="#app-f">Appendix F</a>.
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
              <span className="am-runin">Transfer.</span> <a className="am-ref" href="#thm-1">Theorem 1</a> makes a
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
          <Placeholder label="Table 6 and Figure 4" status="pending main runs">
            <p>
              <a className="am-ref" href="#table-6">Table 6</a>: per-domain score of each arm normalised to that domain’s
              specialist (above 1 means the domain benefits from the others),
              A1–A4, 3 seeds. <a className="am-ref" href="#fig-4">Figure 4</a>: at every rendezvous of A4, the estimated{' '}
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
              frequency axis, from merge-after (a single rendezvous at the end)
              toward multi-task RL. <a className="am-ref" href="#why-meet-often">Why meet often</a> gave four reasons to merge
              early and one thing frequency cannot fix; this section tests
              them. Between the two ends sits a cheap compromise,
              merge-then-polish: the specialists train apart as usual, and a few
              rendezvous at the end of the run bring them back together. It
              keeps the training pipeline unchanged and adds the repair that a
              single merge lacks.
            </p>
            <p>
              In the toy the interval matters sharply. At 50 steps per task,
              merging every 1, 5, 10, 25 or 50 steps gave 0.97, 0.96, 0.93, 0.34
              and 0.08. A KL trigger beat a fixed interval with a similar number
              of rendezvous, 0.987 against 0.88. Frequent rendezvous also passed
              more transfer into an idle task: under the exact merge, +0.48 at
              an interval of 1 against −0.21 at 50. The theory attributes this
              to calibration along shared directions, not to transfer through
              lossless ones, and part of it is unexplained (<a className="am-ref" href="#app-e">Appendix E</a>).
              The merge-frequency experiment below measures the same curve on the
              9B model.
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
                    <th className="am-num">In-domain benefit</th>
                    <th className="am-num">Untrained domain</th>
                    <th className="am-num">Merge cost</th>
                  </tr>
                </thead>
                <tbody>
                  <PendingRow
                    label="1 (one-shot OPM merge, end of run)"
                    n={5}
                  />
                  <PendingRow label="≈ 4" n={5} />
                  <PendingRow
                    label="Merge-then-polish (4 rendezvous in the last 20%)"
                    n={5}
                  />
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
            label="Figure 5 and Table 7"
            status="pending frequency sweep"
          >
            <p>
              The merge-frequency curve. A4 with the drift ceiling set for
              about 1, 4, 16 and 32 rendezvous at a fixed budget, plus
              merge-then-polish (independent specialists, then four rendezvous
              in the last 20% of the budget); the one-rendezvous end coincides
              with A2’s one-shot OPM merge.
              Horizontal axis: rendezvous per run (log scale). Vertical axes:
              mean and worst normalised score, with A1 and A2 as horizontal
              bands. <a className="am-ref" href="#table-7">Table 7</a> adds in-domain benefit from other domains, the
              score on competitive code, which no arm trains on, and merge
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
              <span className="am-runin">Demo 1: adding a skill.</span> At half
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
          <Placeholder label="Figure 6 and Table 8" status="pending demo 1">
            <p>
              Code score against rollouts after the branch point for A1 and A4,
              with the code specialist as a reference line; below it, the
              per-domain change on the eight existing domains over the same
              window. <a className="am-ref" href="#table-8">Table 8</a>: rollouts and wall-clock to reach 90% of the code
              specialist’s gain, maximum drop on an existing domain, extra
              GPU-hours.
            </p>
          </Placeholder>
          <div className="am-prose">
            <p>
              <span className="am-runin">
                Demo 2: containing a broken domain.
              </span>{' '}
              At 30% of the budget the tool-use reward is broken for a fixed
              window: any syntactically valid tool call is rewarded. Then it is
              restored. Both arms get the same fault. We measure the other
              domains’ scores and behaviour during and after the window, how
              fast they recover, whether OPM’s per-rendezvous diagnostics flag
              the faulty trainer, and what rolling back that one trainer does.
              <a className="am-ref" href="#thm-1">Theorem 1</a> predicts that the fault reaches other domains only
              through Fisher overlap, and the trigger bounds how far it moves
              them per round.
            </p>
          </div>
          <Placeholder label="Figure 7 and Table 9" status="pending demo 2">
            <p>
              Per-domain scores over training for A1 and A4 with the fault
              window shaded, plus tool-call validity and response length. Table
              9: worst drop on another domain during the window and after
              recovery; the rendezvous at which the diagnostics flagged the tool-use
              trainer; the effect of rolling back that trainer alone.
            </p>
          </Placeholder>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Side findings" id="findings" />
          <div className="am-prose">
            <p>
              Measuring merges at the level of policies, in exact fp32, turned
              up five findings that matter beyond OPM. <a className="am-ref" href="#app-g">Appendix G</a> has the
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
              model scores 1.0 points higher (1.30 ± 0.34 on the eight-benchmark
              mean) deployed in fp32 than in
              bf16. Any merge, trigger or residual threshold has to sit above
              this floor, and scoring has to run in true fp32.
            </p>
            <p>
              <span className="am-runin">KL residual is not reward loss.</span>{' '}
              The sum has the largest KL residual of any merge and the best
              benchmark mean at bf16. Behind this is an exact decomposition: a
              return change is the reward-weighted log-likelihood ratio plus a
              term bounded by the KL. To first order it is{' '}
              <Tex tail=",">{T`\rho\,\sigma\sqrt{2\varepsilon}`}</Tex> with{' '}
              <Tex>{T`\rho`}</Tex> the correlation between reward and the
              log-ratio, <Tex>{T`\sigma`}</Tex> the reward’s standard deviation
              and <Tex>{T`\varepsilon`}</Tex> the KL residual. A large residual costs little reward when{' '}
              <Tex>{T`\rho\approx0`}</Tex> and helps when{' '}
              <Tex tail=".">{T`\rho>0`}</Tex> Pinsker-type bounds are vacuous
              above about 2 nats, while specialists drift 75–248 nats.
            </p>
            <p>
              <span className="am-runin">When the sum beats OPM.</span> The sum
              wins exactly when domains help each other, and that can be
              measured per domain: how much of the others’ updates domain{' '}
              <Tex>j</Tex>’s Fisher sees (its visibility), and the sign of the transfer term{' '}
              <Tex tail=".">{T`T_j`}</Tex> The 4B reasoning domains are in this
              regime. The instruction-following and agent domains barely see
              the others’ updates, so the sum and the OPM merge tie there. The toy’s conflict variants are
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
              that differ by orders of magnitude, domains whose gradient scales
              differ enough to fight over a shared clip or Adam state, and teams
              that want to add, drop, tune or fix a domain without retraining the
              rest. It gives ground
              where coupling helps: when domains share skills, multi-task RL or
              the plain sum moves faster along the shared directions, and OPM
              recovers that only through larger trainer steps. The transfer term
              and visibility, both logged at every rendezvous, tell which
              situation a run is in.
            </p>
            <p>
              <span className="am-runin">Trade-offs.</span> Every rendezvous
              costs a merge, about ten minutes on a 9B model with the guarded
              solver, and a synchronisation, since every trainer waits for the
              merged model. Meeting often buys locality, calibrated weights and
              repair, and pays for them in merges; merge-then-polish pays for
              only a few. Memory grows with the number of trainers, one model
              copy per domain, which grouping domains reduces. And decoupling
              gives up transfer along shared directions, which a larger trainer
              learning rate recovers only in part.
            </p>
            <p>
              <span className="am-runin">Limitations.</span> The guarantees
              assume lossless rounds, and we have not shown that they exist at
              LLM scale. In the 4B merge the residual after 30 CG iterations is
              still 16% of drift on held-out prompts, and the reasoning domains
              overlap. The
              informative statements at realistic drift are second-order or
              about KL, not reward. The trajectory Fisher grows with tokens, so
              long-response domains get more weight in shared directions. OPM
              keeps one model copy per domain in memory. The Fisher is estimated
              from a subsample, and the evidence for the guarded merge comes
              from one two-domain test. In the one-shot merge, a stale metric
              tied the on-policy one on benchmarks. All results are at 4B and 9B on dense
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
              <Cite k="wang2026b" />, a close cousin of <a className="am-ref" href="#thm-1">Theorem 1</a>. Federated
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
              <span className="am-runin">An extension: grouped OPM.</span>{' '}
              Frontier runs train dozens of domains, and the published evidence
              on how they interact is mixed in a way that looks like structure
              rather than noise. Reasoning domains tend to help each other:
              RLVR across domains shows small mutual interference and synergy
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
              stays close to zero <Cite k="yang2026b" />. That last case is
              interference a gradient cosine cannot see and a Fisher can.
            </p>
            <p>
              This suggests a middle ground between one trainer for all domains
              and one per domain. Group the domains that help each other into a
              single multi-task trainer, so their transfer is kept inside the
              group, and give groups that conflict separate trainers that meet
              through the OPM merge. One group is multi-task RL; one domain per
              group is OPM. <a className="am-ref" href="#thm-1">Theorem 1</a> then holds between groups: each group is
              protected from the others, and nothing is protected inside a
              group. The quantities that decide the grouping are the ones OPM
              already logs at every rendezvous, the visibility of one domain’s
              update in another’s Fisher and the sign of the transfer term{' '}
              <Tex tail=".">{T`T_j`}</Tex> Domains with positive{' '}
              <Tex>{T`T_j`}</Tex> and high mutual visibility belong together; a
              pair with negative <Tex>{T`T_j`}</Tex> and high visibility is the
              one to split. Since a rendezvous is cheap, the grouping can change
              during a run, for example by splitting a group when its members’
              transfer terms turn negative. Grouping also cuts OPM’s memory cost
              from one model copy per domain to one per group. We have not run
              it yet; it is the natural next experiment once the main runs show
              where the 9B domains fall.
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
              multi-task RL and MOPD at scale, are what the pending results
              above will settle.
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
