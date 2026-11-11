import Tex from './Tex'
import SectionTitle from './SectionTitle'
import { Cite, CiteT } from './Cite'
import { Placeholder } from './Placeholder'
import OpenOnHash from './OpenOnHash'

const T = String.raw

// Appendices of the On-Policy Merge post: derivations, proofs, solver and
// cost model, the one-shot 4B study, the toy, the main setup, secondary
// findings and extended related work. Status labels follow the theory notes:
// [T] theorem, [P] proposition under stated assumptions, [C] conjecture with
// numerical support.

function Status({ s }: { s: string }) {
  return (
    <span
      className="font-mono text-[11px]"
      style={{ color: 'var(--ink-faint)', letterSpacing: '0.08em' }}
    >
      [{s}]
    </span>
  )
}

export default function Appendix() {
  return (
    <>
      <SectionTitle label="Appendices" id="appendix" />
      <OpenOnHash />
      <div className="am-prose">
        <p>
          The appendices contain the material the main text refers to. A gives the
          notation, the derivation and the exact relations between methods. B
          states every theoretical result with its status and proof. C covers
          the merge solver and its cost. D has the one-shot 4B study, E the toy,
          F the main experimental setup, G the secondary findings and H the
          extended related work. Status labels: <Status s="T" /> theorem,{' '}
          <Status s="P" /> proposition proved under the stated assumptions,{' '}
          <Status s="C" /> conjecture with numerical support.
        </p>

        {/* ============================================================ */}
        <details className="am-app" id="app-a">
          <summary>
            <h3>A. Notation, derivation and exact relations between methods</h3>
          </summary>
          <p>
            <span className="am-runin">Notation.</span> Domains{' '}
            <Tex>{T`i=1,\dots,n`}</Tex> share parameters{' '}
            <Tex tail=".">{T`\theta\in\mathbb{R}^P`}</Tex> A rollout{' '}
            <Tex>{T`\xi`}</Tex> of domain <Tex>i</Tex> has law{' '}
            <Tex>{T`P^i_\theta`}</Tex> and return{' '}
            <Tex tail=",">{T`J_i(\theta)=\mathbb{E}_{P^i_\theta}[R_i]`}</Tex>{' '}
            <Tex tail=";">{T`R_i\in[0,1]`}</Tex>{' '}
            <Tex tail=".">{T`\Phi=\sum_iJ_i`}</Tex> The score is{' '}
            <Tex tail=",">{T`S(\xi)=\sum_ts_t`}</Tex>{' '}
            <Tex tail=".">{T`s_t=\nabla\log\pi_\theta(a_t\mid h_t)`}</Tex> The
            trajectory Fisher of domain <Tex>i</Tex> at <Tex>{T`\theta`}</Tex> is{' '}
            <Tex tail=";">{T`F_i(\theta)=\mathbb{E}_{P^i_\theta}[SS^\top]`}</Tex>{' '}
            without an argument, <Tex>{T`F_i=F_i(\theta_i)`}</Tex> is the
            on-policy Fisher at trainer <Tex tail=".">i</Tex> We write{' '}
            <Tex tail=".">{T`g_i=\nabla J_i`}</Tex> From the anchor{' '}
            <Tex tail=",">{T`\bar\theta`}</Tex> trainer <Tex>i</Tex> takes{' '}
            <Tex>K</Tex> local steps to{' '}
            <Tex tail=";">{T`\theta_i=\bar\theta+\Delta_i`}</Tex> the merge
            returns <Tex tail=".">{T`\bar\theta^{+}=\bar\theta+d`}</Tex> Drift is{' '}
            <Tex tail=",">{T`D_i=\mathrm{KL}(P^i_{\theta_i}\|P^i_{\bar\theta})`}</Tex>{' '}
            residual is{' '}
            <Tex tail=",">{T`\varepsilon_i(d)=\mathrm{KL}(P^i_{\theta_i}\|P^i_{\bar\theta+d})`}</Tex>{' '}
            with second-order part{' '}
            <Tex tail=".">{T`\varepsilon_i^{(2)}(d)=\tfrac12\|d-\Delta_i\|^2_{F_i}`}</Tex>{' '}
            The OPM merge is{' '}
            <Tex tail=",">{T`d^\star=(\sum_iF_i)^{+}\sum_iF_i\Delta_i`}</Tex> the
            sum is <Tex tail=",">{T`d_\Sigma=\sum_i\Delta_i`}</Tex> and the
            sum of the updates of the domains other than <Tex>j</Tex> is{' '}
            <Tex tail=".">{T`s_j=\sum_{i\ne j}\Delta_i`}</Tex> The transfer term
            is <Tex tail=".">{T`T_j=g_j(\theta_j)^\top s_j`}</Tex> Throughout,{' '}
            <Tex tail=",">{T`A=\sum_iF_i`}</Tex>{' '}
            <Tex>{T`b=\sum_iF_i\Delta_i`}</Tex> (except in Lemmas 1–2, where{' '}
            <Tex>b</Tex> is a reward baseline). The theory assumes no
            reference-KL penalty.
          </p>

          <details>
            <summary>Derivation of (1) and (2)</summary>
            <p>
              For <Tex tail=",">{T`t<t'`}</Tex>{' '}
              <Tex>{T`\mathbb{E}[s_ts_{t'}^\top]=\mathbb{E}\big[s_t\,\mathbb{E}[s_{t'}\mid h_{t'}]^\top\big]=0`}</Tex>{' '}
              because the score has zero mean given its prefix, so{' '}
              <Tex>{T`F_i=\mathbb{E}[\sum_ts_ts_t^\top]`}</Tex>, which is a sum over
              the tokens of a rollout rather than a per-token average. The
              log-ratio of two rollout
              probabilities in the same environment is{' '}
              <Tex tail=",">{T`\sum_t\big(\log\pi_{\theta_i}(a_t\mid h_t)-\log\pi_\theta(a_t\mid h_t)\big)`}</Tex>{' '}
              so{' '}
              <Tex>{T`\mathrm{KL}(P^i_{\theta_i}\|P^i_\theta)=\mathbb{E}_{P^i_{\theta_i}}\big[\sum_t\mathrm{KL}(\pi_{\theta_i}(\cdot\mid h_t)\|\pi_\theta(\cdot\mid h_t))\big]`}</Tex>{' '}
              because the environment’s transition probabilities are the same
              under both policies and cancel in the ratio. The Hessian of a KL at
              its minimum
              is the Fisher of its first argument, which gives the quadratic form,
              and the normal equations{' '}
              <Tex>{T`\sum_iF_i(\theta-\theta_i)=0`}</Tex> give (2). The
              pseudo-inverse picks the minimum-norm solution. A direction{' '}
              <Tex>v</Tex> in <Tex>{T`\operatorname{null}A`}</Tex> satisfies{' '}
              <Tex>{T`F_iv=0`}</Tex> for every <Tex tail=",">i</Tex> so it leaves
              every domain’s action probabilities unchanged to first order.
            </p>
          </details>

          <details>
            <summary>
              The exact barycenter is a visitation-weighted mixture{' '}
              <Status s="T" />
            </summary>
            <p>
              For tabular policies over histories, the minimiser of (1) is{' '}
              <Tex tail=",">{T`\pi^{+}(\cdot\mid h)=\sum_id_i(h)\,\pi_{\theta_i}(\cdot\mid h)\big/\sum_id_i(h)`}</Tex>{' '}
              with <Tex>{T`d_i(h)`}</Tex> the expected number of visits to{' '}
              <Tex>h</Tex> under <Tex tail=".">{T`P^i_{\theta_i}`}</Tex>{' '}
              <em>Proof.</em> By the chain rule, (1) equals{' '}
              <Tex tail=".">{T`\sum_h\sum_id_i(h)\,\mathrm{KL}(\pi_{\theta_i}(\cdot\mid h)\|\pi(\cdot\mid h))`}</Tex>{' '}
              Each history separates; minimising{' '}
              <Tex>{T`-\sum_a\big(\sum_id_i(h)\pi_{\theta_i}(a\mid h)\big)\log\pi(a\mid h)`}</Tex>{' '}
              over the simplex gives the mixture by Gibbs’ inequality. The minimum
              is zero iff all <Tex>{T`\pi_{\theta_i}(\cdot\mid h)`}</Tex> with{' '}
              <Tex>{T`d_i(h)>0`}</Tex> coincide. So a round is lossless iff the
              trainers’ policies coincide on every history that more than one of
              them visits, and (2), the second-order version in logit space with
              Fishers at the trainers’ endpoints, matches the mixture only while
              per-context logit changes are of order one (<a className="am-ref" href="#app-b-6">B.6</a>). ∎
            </p>
          </details>

          <p>
            <span className="am-runin" id="table-a1">Table A1.</span> The displacement of the
            shared model under each method.
          </p>
          <div className="am-table">
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Displacement of the shared model</th>
                  <th>Signal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Multi-task RL</td>
                  <td>
                    <Tex tail=",">{T`\eta P\sum_ic_i\nabla J_i(\bar\theta)`}</Tex>{' '}
                    every step
                  </td>
                  <td>
                    Reward; <Tex>{T`c_i`}</Tex> are token shares of the batch;{' '}
                    <Tex>P</Tex> is the shared optimizer’s preconditioner
                  </td>
                </tr>
                <tr>
                  <td>Cascade RL</td>
                  <td>
                    <Tex tail=",">{T`\eta P\nabla J_{\sigma(b)}(\bar\theta)`}</Tex>{' '}
                    one domain per stage <Tex>b</Tex>
                  </td>
                  <td>Reward of the active domain only</td>
                </tr>
                <tr>
                  <td>Periodic sum or average</td>
                  <td>
                    <Tex>{T`\sum_i\Delta_i`}</Tex> or{' '}
                    <Tex tail=",">{T`\tfrac1n\sum_i\Delta_i`}</Tex> every{' '}
                    <Tex>K</Tex> steps
                  </td>
                  <td>
                    Reward, through each <Tex>{T`\Delta_i`}</Tex>
                  </td>
                </tr>
                <tr>
                  <td>Merge-after (TA)</td>
                  <td>
                    <Tex>{T`\lambda\sum_i\tau_i`}</Tex> once, with{' '}
                    <Tex>{T`\tau_i`}</Tex> the whole specialist run
                  </td>
                  <td>None at merge time</td>
                </tr>
                <tr>
                  <td>MOPD</td>
                  <td>
                    <Tex>{T`-\eta\sum_iF_i^{\rm student}(\theta-\theta_i)`}</Tex>{' '}
                    plus higher orders, iterated to its fixed point
                  </td>
                  <td>Teacher log-probabilities on student states</td>
                </tr>
                <tr>
                  <td>OPM</td>
                  <td>
                    <Tex tail=",">{T`(\sum_iF_i)^{+}\sum_iF_i\Delta_i`}</Tex> when
                    a trainer’s drift reaches its ceiling
                  </td>
                  <td>
                    Reward, through each <Tex>{T`\Delta_i`}</Tex>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            <span className="am-runin" id="table-a2">Table A2.</span> Exact limits{' '}
            <Status s="T" />. Each row is a setting of OPM and what it becomes.
          </p>
          <div className="am-table">
            <table>
              <thead>
                <tr>
                  <th>Setting</th>
                  <th>Becomes</th>
                  <th>What is lost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Sum every step; SGD trainers at rates{' '}
                    <Tex tail=";">{T`\eta c_i`}</Tex> <Tex>{T`c_i`}</Tex> token
                    shares
                  </td>
                  <td>
                    Multi-task RL with SGD, exactly. With any other optimizer: one
                    shared optimizer state, which is not the same as summing
                    per-domain Adam steps
                  </td>
                  <td>
                    Decoupling: cross terms return at first order, in both signs,
                    and batch shares set the weights
                  </td>
                </tr>
                <tr>
                  <td>Merge every step, natural-gradient trainers</td>
                  <td>
                    Multi-task natural policy gradient,{' '}
                    <Tex>{T`d=\eta(\sum_iF_i)^{+}\sum_ig_i`}</Tex>
                  </td>
                  <td>Nothing; exact only for natural-gradient trainers</td>
                </tr>
                <tr>
                  <td>Fishers mutually orthogonal</td>
                  <td>The sum</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>All Fishers equal</td>
                  <td>The average</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>One trainer active per stage, others idle, summed</td>
                  <td>Cascade RL: multi-task RL with every share but one at 0</td>
                  <td>
                    The idle domains’ terms in the merge; keeping them in an OPM
                    merge gives a protected cascade (<a className="am-ref" href="#app-b-5">B.5</a>)
                  </td>
                </tr>
                <tr>
                  <td>One round, interval = whole run, Euclidean metric</td>
                  <td>Task arithmetic</td>
                  <td>The metric and locality</td>
                </tr>
                <tr>
                  <td>
                    Merge once, Fisher on student states, solved by gradient
                    descent
                  </td>
                  <td>MOPD, to second order</td>
                  <td>
                    Reward and reuse of rollouts; MOPD adds a second stage and has
                    a teacher ceiling
                  </td>
                </tr>
                <tr>
                  <td>Objective (1) solved in function space</td>
                  <td>Distral, Divide-and-Conquer RL</td>
                  <td>The closed form; distillation replaces the linear solve</td>
                </tr>
              </tbody>
            </table>
          </div>

          <details>
            <summary>Proofs of the limits</summary>
            <p>
              Multi-task SGD gives{' '}
              <Tex tail=";">{T`\eta\sum_ic_ig_i(\bar\theta)`}</Tex> periodic sum
              at <Tex>{T`K=1`}</Tex> with rates <Tex>{T`\eta c_i`}</Tex> gives the
              same. With a token-mean loss over the mixed batch the gradient is{' '}
              <Tex tail=",">{T`\sum_i(\mathrm{tok}_i/\mathrm{tok})\hat g_i`}</Tex>{' '}
              so <Tex>{T`c_i`}</Tex> is the token share. For natural-gradient
              trainers <Tex>{T`F_i\Delta_i=\eta F_iF_i^{+}g_i=\eta g_i`}</Tex> by
              the range lemma (<a className="am-ref" href="#app-b-1">B.1</a>), so{' '}
              <Tex tail=".">{T`d^\star=\eta A^{+}\sum_ig_i`}</Tex> Orthogonal
              ranges give <Tex tail=",">{T`A^{+}=\sum_iF_i^{+}`}</Tex> so{' '}
              <Tex>{T`d^\star=\sum_jF_j^{+}F_j\Delta_j=\sum_j\Delta_j`}</Tex> for{' '}
              <Tex tail=".">{T`\Delta_j\in\operatorname{range}F_j`}</Tex> Equal
              Fishers give{' '}
              <Tex tail=".">{T`d^\star=(nF)^{+}F\sum_i\Delta_i=\tfrac1n\sum_i\Delta_i`}</Tex>{' '}
              The rest hold by definition. Numerically, the natural-gradient
              identity holds to <Tex tail=",">{T`3\times10^{-14}`}</Tex> the sum and
              average limits to <Tex>{T`2\times10^{-9}`}</Tex> and{' '}
              <Tex tail=".">{T`4\times10^{-12}`}</Tex> ∎
            </p>
          </details>
        </details>

        {/* ============================================================ */}
        <details className="am-app" id="app-b">
          <summary>
            <h3>B. Theory: statements and proofs</h3>
          </summary>

          <h4 id="app-b-1">B.1 Two lemmas</h4>
          <p>
            <strong>Lemma 1 (range)</strong> <Status s="T" />.{' '}
            <Tex tail=".">{T`g_i(\theta)\in\operatorname{range}F_i(\theta)`}</Tex>{' '}
            For every <Tex tail=",">v</Tex>{' '}
            <Tex tail=",">{T`v^\top g_i=\operatorname{Cov}_{P^i_\theta}(R_i,v^\top S)`}</Tex>{' '}
            so <Tex>{T`|v^\top g_i|\le\sigma_i\sqrt{v^\top F_iv}`}</Tex> with{' '}
            <Tex tail=";">{T`\sigma_i^2=\operatorname{Var}(R_i)`}</Tex> and{' '}
            <Tex tail=".">{T`\|g_i\|^2_{F_i^{+}}\le\sigma_i^2`}</Tex> The lemma
            needs the gradient and the Fisher to be expectations under the same
            law, which is the on-policy property. It fails for supervised
            gradients against a model Fisher, and for stale or foreign-state
            Fishers.
          </p>
          <p>
            <strong>Lemma 2 (exact surrogate)</strong> <Status s="T" />. For any{' '}
            <Tex>{T`\theta,\theta'`}</Tex> and baseline <Tex tail=",">b</Tex>
          </p>
          <Tex
            display
          >{T`J(\theta')-J(\theta)=\mathbb{E}_{P_\theta}\Big[(R-b)\log\frac{P_{\theta'}}{P_\theta}\Big]+r,\qquad|r|\le\sup|R-b|\;\mathrm{KL}(P_\theta\|P_{\theta'}),`}</Tex>
          <p>
            and by Pinsker{' '}
            <Tex tail=".">{T`J(\theta')\ge J(\theta)-\sqrt{\mathrm{KL}/2}`}</Tex>{' '}
            To first order the change is{' '}
            <Tex tail=",">{T`\rho\,\sigma\sqrt{2\varepsilon^{(2)}}`}</Tex> with{' '}
            <Tex>{T`\rho\in[-1,1]`}</Tex> the correlation between reward and the
            log-ratio. The KL bound holds for every reward, so it is the worst
            case over rewards. In 2,000 random checks neither bound was violated.
          </p>
          <details>
            <summary>Proofs</summary>
            <p>
              Lemma 1. If <Tex>{T`F_iv=0`}</Tex> then{' '}
              <Tex tail=",">{T`\mathbb{E}[(v^\top S)^2]=0`}</Tex> so{' '}
              <Tex>{T`v^\top S=0`}</Tex> almost surely and{' '}
              <Tex tail=".">{T`v^\top g_i=\mathbb{E}[(R_i-b)v^\top S]=0`}</Tex>{' '}
              Hence{' '}
              <Tex tail=".">{T`g_i\perp\operatorname{null}F_i=(\operatorname{range}F_i)^\perp`}</Tex>{' '}
              Cauchy–Schwarz on the covariance gives the bound; with{' '}
              <Tex>{T`v=F_i^{+}g_i`}</Tex> it gives the last claim.
            </p>
            <p>
              Lemma 2. Let <Tex tail=";">{T`w=P_{\theta'}/P_\theta`}</Tex> softmax
              gives full support and environment terms cancel. Since{' '}
              <Tex tail=",">{T`\mathbb{E}_\theta w=1`}</Tex>{' '}
              <Tex tail=".">{T`J(\theta')-J(\theta)=\mathbb{E}_\theta[(w-1)(R-b)]`}</Tex>{' '}
              Write <Tex tail=";">{T`w-1=\log w+(w-1-\log w)`}</Tex> the second
              term is nonnegative with mean{' '}
              <Tex tail=",">{T`\mathbb{E}_\theta[-\log w]=\mathrm{KL}(P_\theta\|P_{\theta'})`}</Tex>{' '}
              which bounds <Tex tail=".">{T`|r|`}</Tex> Pinsker:{' '}
              <Tex tail=".">{T`|J(\theta')-J(\theta)|\le\mathrm{TV}\le\sqrt{\mathrm{KL}/2}`}</Tex>{' '}
              ∎
            </p>
          </details>

          <h4 id="app-b-2">B.2 Decoupling</h4>
          <p>
            <strong>Pythagoras</strong> <Status s="T" />. For any PSD{' '}
            <Tex tail=",">{T`F_i`}</Tex> any <Tex>{T`\Delta_i`}</Tex> and any{' '}
            <Tex tail=",">d</Tex>{' '}
            <Tex tail=".">{T`\sum_i\tfrac12\|d-\Delta_i\|^2_{F_i}=\sum_i\tfrac12\|d^\star-\Delta_i\|^2_{F_i}+\tfrac12\|d-d^\star\|^2_A`}</Tex>{' '}
            Also <Tex>{T`\sum_iF_jA^{+}F_i=F_j`}</Tex> for every{' '}
            <Tex tail=".">j</Tex>
          </p>
          <p>
            <strong>Coupling</strong> <Status s="T" />. To first order, with
            gradients and Fishers at <Tex tail=",">{T`\theta_j`}</Tex> the merged
            model’s return minus trainer <Tex>j</Tex>’s is:
          </p>
          <div className="am-table">
            <table>
              <thead>
                <tr>
                  <th>Merge</th>
                  <th>
                    <Tex>{T`J_j(\bar\theta+d)-J_j(\theta_j)`}</Tex>, first order
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Sum</td>
                  <td>
                    <Tex tail=",">{T`T_j`}</Tex> the cross terms, both signs
                  </td>
                </tr>
                <tr>
                  <td>Average</td>
                  <td>
                    <Tex>{T`\tfrac1nT_j-(1-\tfrac1n)\,g_j^\top\Delta_j`}</Tex>
                  </td>
                </tr>
                <tr>
                  <td>
                    Task arithmetic, coefficient <Tex>{T`\lambda`}</Tex>
                  </td>
                  <td>
                    <Tex>{T`\lambda T_j-(1-\lambda)\,g_j^\top\Delta_j`}</Tex>
                  </td>
                </tr>
                <tr>
                  <td>OPM</td>
                  <td>
                    <Tex tail=",">{T`u_j^\top\big(\sum_i\Omega_{ji}\Delta_i-F_j\Delta_j\big)`}</Tex>{' '}
                    at most{' '}
                    <Tex>{T`\sigma_j\sqrt{2\varepsilon_j^{(2)}(d^\star)}`}</Tex>{' '}
                    in size; zero in a lossless round
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Here <Tex>{T`u_j=F_j^{+}g_j`}</Tex> and{' '}
            <Tex tail=",">{T`\Omega_{ji}=F_jA^{+}F_i`}</Tex> with{' '}
            <Tex tail=".">{T`\sum_i\Omega_{ji}=F_j`}</Tex> If{' '}
            <Tex>{T`F_iF_j=0`}</Tex> then <Tex tail=",">{T`\Omega_{ji}=0`}</Tex> so OPM
            does not couple the two domains; the sum still does unless{' '}
            <Tex tail=".">{T`F_j\Delta_i=0`}</Tex>
          </p>
          <p>
            <strong>Theorem 1 (decoupling)</strong> <Status s="T" />. A round is
            lossless for every choice of updates iff{' '}
            <Tex tail=".">{T`\operatorname{rank}A=\sum_i\operatorname{rank}F_i`}</Tex>{' '}
            In a lossless round, for every <Tex tail=",">j</Tex>{' '}
            <Tex>{T`J_j(\bar\theta+d^\star)-J_j(\theta_j)=O(\|d^\star-\Delta_j\|^2)`}</Tex>{' '}
            and{' '}
            <Tex tail=".">{T`J_j(\bar\theta+d_\Sigma)-J_j(\bar\theta+d^\star)=T_j+O(\|\cdot\|^2)`}</Tex>{' '}
            For log-linear policies{' '}
            <Tex tail=",">{T`\pi(a\mid h)\propto e^{\phi(h,a)^\top\theta}`}</Tex>{' '}
            with linearly independent centred feature spans <Tex>{T`V_j`}</Tex> of
            the domains’ reachable histories, exact merges with any full-support
            Fishers (endpoint, anchor or stale), and trainers whose update depends
            only on their own domain’s gradient and Fisher history, the anchor’s
            policy on domain <Tex>j</Tex> after <Tex>r</Tex> rounds equals that of
            a solo run of <Tex>{T`rK`}</Tex> steps. In numerical checks on
            log-linear problems the OPM error is at most <Tex tail=";">{T`3\times10^{-16}`}</Tex> in a
            small MLP it scales as <Tex>{T`t^2`}</Tex> and the sum’s change
            matches <Tex>{T`T_j`}</Tex> to about 1% at small <Tex tail=";">t</Tex>{' '}
            the deviation from solo is at most <Tex>{T`2\times10^{-12}`}</Tex> for
            GD, natural gradient and persistent Adam at intervals 1–60. The
            constant in <Tex>{T`O(\cdot)`}</Tex> grows with the null-space
            excursion <Tex tail=";">{T`\|d^\star-\Delta_j\|`}</Tex> in the MLP,{' '}
            <Tex>{T`\|d^\star\|`}</Tex> was 8–12 times{' '}
            <Tex tail=".">{T`\|d_\Sigma\|`}</Tex>
          </p>
          <details>
            <summary>Proofs</summary>
            <p>
              Pythagoras. <Tex>{T`Q(d)=\tfrac12d^\top Ad-d^\top b+c`}</Tex> with{' '}
              <Tex tail=",">{T`b\in\operatorname{range}A`}</Tex> so{' '}
              <Tex>{T`Ad^\star=b`}</Tex> and{' '}
              <Tex tail=".">{T`Q(d)-Q(d^\star)=\tfrac12\|d-d^\star\|_A^2`}</Tex>{' '}
              Partition of unity: <Tex>{T`\sum_iF_jA^{+}F_i=F_jA^{+}A=F_j`}</Tex>{' '}
              because{' '}
              <Tex>{T`\operatorname{range}F_j\subseteq\operatorname{range}A`}</Tex>{' '}
              for PSD summands.
            </p>
            <p>
              Coupling. By Taylor,{' '}
              <Tex tail=",">{T`J_j(\bar\theta+d)-J_j(\theta_j)=g_j^\top(d-\Delta_j)+O(\|d-\Delta_j\|^2)`}</Tex>{' '}
              where <Tex>{T`d-\Delta_j`}</Tex> is <Tex tail=",">{T`s_j`}</Tex>{' '}
              <Tex tail=",">{T`\tfrac1ns_j-(1-\tfrac1n)\Delta_j`}</Tex>{' '}
              <Tex>{T`\lambda s_j-(1-\lambda)\Delta_j`}</Tex> and{' '}
              <Tex>{T`d^\star-\Delta_j`}</Tex> for the four rows. For OPM,{' '}
              <Tex>{T`g_j=F_ju_j`}</Tex> by Lemma 1 and{' '}
              <Tex tail=".">{T`F_jd^\star=\sum_i\Omega_{ji}\Delta_i`}</Tex> The
              bound is Lemma 1 with <Tex tail=".">{T`v=d^\star-\Delta_j`}</Tex>
            </p>
            <p>
              Lossless iff independent ranges. The map{' '}
              <Tex>{T`d\mapsto(F_1d,\dots,F_nd)`}</Tex> takes values in{' '}
              <Tex tail=".">{T`\oplus_i\operatorname{range}F_i`}</Tex> Its kernel
              is{' '}
              <Tex tail=",">{T`\bigcap_i\operatorname{null}F_i=\operatorname{null}A`}</Tex>{' '}
              so its rank is <Tex tail=",">{T`\operatorname{rank}A`}</Tex> and it
              is onto iff{' '}
              <Tex tail=".">{T`\operatorname{rank}A=\sum_i\operatorname{rank}F_i`}</Tex>
            </p>
            <p>
              Main claim. If some <Tex>d</Tex> has <Tex tail=",">{T`Q(d)=0`}</Tex>{' '}
              Pythagoras gives <Tex tail=",">{T`Q(d^\star)=0`}</Tex> so{' '}
              <Tex>{T`F_j(d^\star-\Delta_j)=0`}</Tex> for every{' '}
              <Tex tail=".">j</Tex> Lemma 1 at <Tex>{T`\theta_j`}</Tex> gives{' '}
              <Tex tail=".">{T`g_j(\theta_j)^\top(d^\star-\Delta_j)=0`}</Tex>{' '}
              Subtracting from the sum row gives the second claim.
            </p>
            <p>
              Log-linear policies. With full-support softmax,{' '}
              <Tex>{T`\operatorname{null}F_j(\theta)=N_j`}</Tex>, the set of{' '}
              <Tex>v</Tex> with <Tex>{T`\phi(h,a)^\top v`}</Tex> independent of{' '}
              <Tex>a</Tex> at every history reachable in domain{' '}
              <Tex tail=",">j</Tex> for every <Tex tail=".">{T`\theta`}</Tex>{' '}
              Domain <Tex>j</Tex>’s policy, hence <Tex tail=",">{T`g_j`}</Tex>{' '}
              <Tex>{T`F_j`}</Tex> and <Tex tail=",">{T`J_j`}</Tex> depends on{' '}
              <Tex>{T`\theta`}</Tex> only modulo <Tex tail=".">{T`N_j`}</Tex>{' '}
              Independence makes every round lossless, so{' '}
              <Tex tail=".">{T`\bar\theta^{+}\equiv\theta_j\pmod{N_j}`}</Tex>{' '}
              Induct over steps and rounds: if the anchor is congruent to the solo
              iterate and the trainer’s optimizer state equals the solo state, the
              trainer computes the same gradients and applies the same updates. Any
              full-support Fisher has range <Tex tail=",">{T`N_j^\perp`}</Tex> so
              the result holds with endpoint, anchor and stale metrics. ∎
            </p>
          </details>

          <h4 id="app-b-3">B.3 KL-efficiency and the natural-gradient limit</h4>
          <p>
            <strong>KL-efficiency</strong> <Status s="T" />. (a) For any update{' '}
            <Tex tail=",">d</Tex>{' '}
            <Tex tail=",">{T`g_j^\top d\le\|g_j\|_{F_j^{+}}\sqrt{d^\top F_jd}`}</Tex>{' '}
            with equality iff <Tex>{T`F_jd`}</Tex> is a positive multiple of{' '}
            <Tex tail=".">{T`g_j`}</Tex> (b) If every trainer takes one
            natural-gradient step and the round is lossless, each domain gets
            exactly its solo gain: <Tex>{T`x_i=A^{+}g_i`}</Tex> satisfies{' '}
            <Tex>{T`F_ix_i=g_i`}</Tex> and <Tex>{T`F_jx_i=0`}</Tex> for{' '}
            <Tex tail=",">{T`j\ne i`}</Tex> so every cross term{' '}
            <Tex>{T`g_j^\top A^{+}g_i`}</Tex> vanishes. Without a lossless point,{' '}
            <Tex tail=":">{T`\|g_j\|^2_{A^{+}}\le\|g_j\|^2_{F_j^{+}}`}</Tex> the
            own term shrinks and nonzero cross terms redistribute gain. (c) With
            natural-gradient trainers in a lossless round, the merged model
            attains equality in (a) on every domain at once, with{' '}
            <Tex tail=".">{T`\tfrac12\|d^\star\|^2_{F_j}=\tfrac12\|\Delta_j\|^2_{F_j}`}</Tex> (d)
            Multi-task RL gives{' '}
            <Tex tail=";">{T`g_j^\top d=\eta(c_j\|g_j\|^2+\sum_{i\ne j}c_ig_i^\top g_j)`}</Tex>{' '}
            it can exceed OPM’s gain on <Tex>j</Tex> only through larger drift
            on <Tex>j</Tex>, and only to the extent that this drift aligns with
            reward. In a numerical check the own-term share was 1.000 and the
            identity held to <Tex tail=".">{T`10^{-14}`}</Tex>
          </p>
          <p>
            Multi-task natural gradient passes every gradient through{' '}
            <Tex tail=",">{T`A^{+}`}</Tex> but in a lossless round each piece{' '}
            <Tex>{T`x_i`}</Tex> satisfies <Tex>{T`F_jx_i=0`}</Tex> for every{' '}
            <Tex tail=",">{T`j\ne i`}</Tex> so it leaves every other domain’s
            action probabilities unchanged to first order. Cross-domain effects
            occur only in shared directions, and there multi-task natural
            gradient averages the domains’ gradient components instead of
            summing them.
          </p>
          <p>
            <strong>Tabular reduction</strong> <Status s="T" />. With tabular
            policies over histories, one step per round, natural-gradient trainers
            and Fishers at the anchor, OPM is exactly natural policy gradient on
            the domain-mixture process, with advantage{' '}
            <Tex>{T`\sum_iP(i\mid h)A_i(h,\cdot)`}</Tex> and{' '}
            <Tex tail=".">{T`P(i\mid h)\propto d_i(h)`}</Tex> It inherits the
            dimension-free global rate of natural policy gradient{' '}
            <Cite k="agarwal2021" /> (discounted setting; we do not re-derive
            episodic constants), whereas Euclidean softmax policy gradient can
            take time exponential in the number of states <Cite k="li2021" />. The
            separation is due to natural versus Euclidean geometry and is not
            specific to OPM; it holds for exact gradients.
          </p>
          <details>
            <summary>Proofs</summary>
            <p>
              (a){' '}
              <Tex>{T`g_j^\top d=u_j^\top F_jd\le\sqrt{u_j^\top F_ju_j}\sqrt{d^\top F_jd}`}</Tex>{' '}
              with <Tex tail=".">{T`u_j^\top F_ju_j=g_j^\top F_j^{+}g_j`}</Tex>{' '}
              (b) Apply a lossless merge to <Tex>{T`\Delta_i=F_i^{+}g_i`}</Tex>{' '}
              and <Tex>{T`\Delta_k=0`}</Tex> for <Tex tail=":">{T`k\ne i`}</Tex>{' '}
              then <Tex tail=",">{T`b=g_i`}</Tex> so <Tex>{T`F_ix_i=g_i`}</Tex>{' '}
              and <Tex tail=".">{T`F_kx_i=0`}</Tex> Hence{' '}
              <Tex>{T`g_j^\top x_i=u_j^\top F_jx_i=0`}</Tex> for{' '}
              <Tex>{T`j\ne i`}</Tex> and{' '}
              <Tex tail=".">{T`g_i^\top x_i=\|g_i\|^2_{F_i^{+}}`}</Tex> For{' '}
              <Tex>{T`A\succeq F_j`}</Tex> and{' '}
              <Tex tail=",">{T`g_j\in\operatorname{range}F_j`}</Tex>{' '}
              <Tex tail=".">{T`g_j^\top A^{+}g_j=\sup_v(2g_j^\top v-v^\top Av)\le\sup_v(2g_j^\top v-v^\top F_jv)=g_j^\top F_j^{+}g_j`}</Tex>{' '}
              (c) <Tex>{T`F_jd^\star=F_j\Delta_j=\eta g_j`}</Tex> gives equality
              in (a). Tabular: Fisher and gradient are block-diagonal over
              histories,{' '}
              <Tex>{T`F_i=\oplus_hd_i(h)(\operatorname{diag}\pi_h-\pi_h\pi_h^\top)`}</Tex>{' '}
              and{' '}
              <Tex tail=",">{T`g_i=\oplus_hd_i(h)\,\pi_h\odot A_i(h,\cdot)`}</Tex>{' '}
              so the merged natural step on block <Tex>h</Tex> is{' '}
              <Tex>{T`\eta\sum_id_i(h)A_i(h,\cdot)/\sum_id_i(h)`}</Tex> up to a
              constant. ∎
            </p>
          </details>

          <h4 id="app-b-4">B.4 Amplification, fixed points and the rate floor</h4>
          <p>
            <strong>Proposition 3</strong> <Status s="P" />, in the stated models.
            (A) <em>Amplification against averaging.</em> With <Tex>n</Tex>{' '}
            domains sharing a direction <Tex>u</Tex> with common curvature{' '}
            <Tex>f</Tex> and agreeing objectives, each trainer’s <Tex>K</Tex>{' '}
            steps remove a fraction <Tex>{T`x=1-(1-\eta f)^K`}</Tex> of the
            distance to the optimum along it. OPM moves{' '}
            <Tex tail=",">x</Tex> the sum <Tex tail=",">{T`nx`}</Tex> multi-task
            RL <Tex tail=".">{T`1-(1-n\eta f)^K`}</Tex> With an interior optimum
            the per-round error factors are <Tex>{T`1-x`}</Tex> and{' '}
            <Tex tail=";">{T`|1-nx|`}</Tex> the sum is better iff{' '}
            <Tex>{T`x<2/(n+1)`}</Tex> and diverges iff{' '}
            <Tex tail=".">{T`x>2/n`}</Tex> With a boundary optimum the sum is at
            least as good at every <Tex tail=".">x</Tex> (B){' '}
            <em>Multi-task natural gradient redistributes.</em> Along{' '}
            <Tex tail=",">u</Tex> it moves <Tex tail=",">{T`\eta\bar a/f`}</Tex>{' '}
            with <Tex>{T`\bar a`}</Tex> the mean gradient component; domain{' '}
            <Tex>j</Tex>’s gain relative to solo is{' '}
            <Tex tail=",">{T`\bar a/a_j`}</Tex> and the total is at most the sum
            of solo gains. Euclidean multi-task RL’s ratio is{' '}
            <Tex tail=",">{T`\sum_ia_i/a_j`}</Tex> which amplifies. (C){' '}
            <em>Fixed points under conflict.</em> Multi-task RL:{' '}
            <Tex tail=".">{T`\sum_ic_ig_i=0`}</Tex> OPM at one step per round with{' '}
            <Tex tail=":">{T`\Delta_i=\eta_iP_ig_i`}</Tex>{' '}
            <Tex tail=",">{T`\sum_i\eta_iF_iP_ig_i=0`}</Tex> which for
            natural-gradient trainers is <Tex>{T`\sum_i\eta_ig_i=0`}</Tex>: the
            trainer step sizes act as batch shares. Trainers that solve their
            round (quadratic model, <Tex tail=")">{T`F_i=H_i`}</Tex> reach the
            optimum of the unweighted <Tex tail=",">{T`\sum_iJ_i`}</Tex> whatever
            the speeds. In numerical checks all predictions hold to{' '}
            <Tex tail=";">{T`10^{-11}`}</Tex> OPM with natural-gradient rates
            (0.09, 0.01) reaches the same point as multi-task RL with shares
            (0.9, 0.1).
          </p>
          <p>
            <strong>Rate floor</strong> <Status s="P" />. Assume relative
            smoothness along natural-gradient steps,{' '}
            <Tex tail=";">{T`J_j(\theta+u)\ge J_j(\theta)+g_j^\top u-\tfrac L2u^\top F_ju`}</Tex>{' '}
            null-space curvature{' '}
            <Tex>{T`J_j(\theta+v)\ge J_j(\theta)-\tfrac M2\|v\|^2`}</Tex> for{' '}
            <Tex tail=";">{T`v\in\operatorname{null}F_j`}</Tex> lossless exact
            merges; <Tex>{T`\|F_j^{+}g_j\|\le G`}</Tex> and{' '}
            <Tex>{T`\kappa_c=\max_i\|F_i\|/\lambda^{+}_{\min}(A)`}</Tex> along the
            run. With <Tex>K</Tex> natural-gradient steps per round,{' '}
            <Tex tail=",">{T`\eta\le1/L`}</Tex> and <Tex tail=":">{T`T=KR`}</Tex>
          </p>
          <Tex
            display
          >{T`\frac1{nT}\sum_{r,j,k}\|g_j(\theta^{r,k}_j)\|^2_{F_j^{+}}\le\frac{2(\Phi^\ast-\Phi(\bar\theta_0))}{n\eta T}+M(1+n\kappa_c)^2\,\eta K\,G^2 .`}</Tex>
          <p>
            With <Tex>{T`M=0`}</Tex> (log-linear) this is the solo rate for every
            domain, independent of <Tex tail=".">K</Tex> With <Tex>{T`M>0`}</Tex>{' '}
            there is an <Tex>{T`O(\eta K)`}</Tex> floor, the analogue of client
            drift in local SGD <Cite k={['li2020', 'karimireddy2020']} />. In a
            check the deviation from solo grew from 0.03 to 0.14 as <Tex>K</Tex>{' '}
            went from 1 to 30.
          </p>
          <details>
            <summary>Proofs</summary>
            <p>
              (A) <Tex>K</Tex> gradient steps contract the error by{' '}
              <Tex tail=".">{T`(1-\eta f)^K`}</Tex> Identical trainers make OPM
              the average (<a className="am-ref" href="#table-a2">Table A2</a>), error <Tex tail=";">{T`1-x`}</Tex> the sum
              gives <Tex tail=".">{T`|1-nx|`}</Tex> For <Tex>{T`nx\le1`}</Tex> the
              sum is better since <Tex tail=";">{T`(n-1)x>0`}</Tex> for{' '}
              <Tex>{T`nx>1`}</Tex> it is better iff{' '}
              <Tex tail=".">{T`nx-1<1-x`}</Tex> Divergence is{' '}
              <Tex tail=".">{T`|1-nx|>1`}</Tex> With a boundary optimum{' '}
              <Tex>{T`J_j`}</Tex> is non-decreasing along <Tex>u</Tex> and the sum
              lies further along it. (B) Along <Tex tail=",">u</Tex>{' '}
              <Tex tail=";">{T`\eta A^{+}\sum_ig_i=\eta\bar a/f`}</Tex> gains are{' '}
              <Tex>{T`a_j\eta\bar a/f`}</Tex> against solo{' '}
              <Tex tail=",">{T`\eta a_j^2/f`}</Tex> and{' '}
              <Tex tail=".">{T`\sum_ja_j\bar a=n\bar a^2\le\sum_ja_j^2`}</Tex> (C)
              At one step, <Tex>{T`d=A^{+}\sum_i\eta_iF_iP_ig_i`}</Tex> vanishes
              iff the sum does; substitute <Tex>{T`P_i=F_i^{+}`}</Tex> or{' '}
              <Tex tail=".">{T`P_i=I`}</Tex> Round-solving trainers reach{' '}
              <Tex tail=",">{T`\theta+\Pi_i(a_i-\theta)`}</Tex> and the merge
              returns <Tex tail=".">{T`(\sum_iH_i)^{-1}\sum_iH_ia_i`}</Tex>
            </p>
            <p>
              Rate floor. Each natural-gradient step gains at least{' '}
              <Tex tail=".">{T`\tfrac\eta2\|g_j\|^2_{F_j^{+}}`}</Tex>{' '}
              <Tex>{T`\|\Delta_j\|\le\eta KG`}</Tex> and{' '}
              <Tex tail=",">{T`\|d^\star\|\le n\kappa_c\eta KG`}</Tex> so{' '}
              <Tex>{T`\|d^\star-\Delta_j\|\le(1+n\kappa_c)\eta KG`}</Tex> inside{' '}
              <Tex tail=",">{T`\operatorname{null}F_j`}</Tex> which lowers{' '}
              <Tex>{T`J_j`}</Tex> by at most{' '}
              <Tex tail=".">{T`\tfrac M2(1+n\kappa_c)^2\eta^2K^2G^2`}</Tex> Sum
              over <Tex tail=",">j</Tex> telescope over <Tex>R</Tex> rounds, and
              divide by <Tex tail=".">{T`n\eta T/2`}</Tex> ∎
            </p>
          </details>

          <h4 id="app-b-5">B.5 Regression under multi-task RL; cascade forgetting</h4>
          <p>
            <strong>Multi-task RL can regress a domain; OPM cannot in a lossless round</strong>{' '}
            <Status s="T" />. A multi-task RL step changes <Tex>{T`J_j`}</Tex> by{' '}
            <Tex tail=".">{T`\eta(c_jg_j^\top Pg_j+\sum_{i\ne j}c_ig_j^\top Pg_i)+O(\eta^2)`}</Tex>{' '}
            Whenever the cross sum is negative, a small enough{' '}
            <Tex>{T`c_j\|g_j\|`}</Tex> makes domain <Tex>j</Tex> regress. In the
            example <Tex tail=",">{T`J_1=a\sigma(s)`}</Tex>{' '}
            <Tex tail=",">{T`J_2=b(1-\sigma(s+p))`}</Tex> <Tex>{T`J_2`}</Tex>{' '}
            falls at the origin under SGD iff <Tex tail=".">{T`c_1a>2c_2b`}</Tex> The Fisher
            ranges <Tex>{T`\operatorname{span}(1,0)`}</Tex> and{' '}
            <Tex>{T`\operatorname{span}(1,1)`}</Tex> are independent, so <a className="am-ref" href="#thm-1">Theorem 1</a>{' '}
            applies to OPM. Numbers are in the main text.
          </p>
          <p>
            <strong>Cascade forgetting</strong> <Status s="T" />. During the stage
            that trains domain <Tex tail=",">i</Tex> the change in{' '}
            <Tex>{T`J_j`}</Tex> is, exactly,{' '}
            <Tex tail=",">{T`J_j(\theta_{\rm end})-J_j(\theta_{\rm start})=\sum_kg_j(\theta_k)^\top\Delta\theta_k+\tfrac12\sum_k\Delta\theta_k^\top\nabla^2J_j(\xi_k)\Delta\theta_k`}</Tex>{' '}
            bounded only by{' '}
            <Tex tail=",">{T`\sqrt{\mathrm{KL}(P^j_{\rm start}\|P^j_{\rm end})/2}`}</Tex>{' '}
            domain <Tex>j</Tex>’s drift during the stage, which cascade does not
            control. A protected cascade keeps idle trainers in the merge with{' '}
            <Tex tail=";">{T`\Delta_j=0`}</Tex> in a lossless round the anchor
            moves inside <Tex tail=",">{T`\operatorname{null}F_j`}</Tex> exactly
            for log-linear policies. In the example, cascade takes{' '}
            <Tex>{T`J_2`}</Tex> from 0.9987 to 0.0735 (accumulated first-order
            term −0.891, remainder −0.034); protected cascade keeps 0.9987 with
            the same <Tex>{T`J_1`}</Tex> of 0.997. The OPM merge is symmetric in
            the domains. Cascade depends on the order of stages and carries
            positive transfer forward along it; the protected cascade removes
            that transfer.
          </p>

          <h4 id="app-b-6">B.6 The trigger, locality and the choice of δ</h4>
          <p>
            <strong>The trigger is a trust region</strong> <Status s="T" /> for
            (a) and (c), <Status s="P" /> second order for (b). Let rounds end
            when <Tex>{T`D_i\ge\delta_i`}</Tex> for some <Tex>i</Tex> (here a
            common <Tex tail=")">{T`\delta`}</Tex>, with one-step
            overshoot <Tex tail=".">{T`\omega`}</Tex> Then{' '}
            <Tex>{T`D_i\le\delta+\omega`}</Tex> for every trainer, whatever its
            optimizer. (a) The exact minimiser of (1) has{' '}
            <Tex tail=",">{T`\sum_i\varepsilon_i\le\sum_iD_i\le n(\delta+\omega)`}</Tex>{' '}
            because the old anchor is feasible. An inexact merge inherits this
            only if its candidate set contains a point with residual at most{' '}
            <Tex tail=";">{T`\sum_iD_i`}</Tex> the production merge guarantees
            only “no worse than the sum” (<a className="am-ref" href="#prop-5">Proposition 5</a>). (b) On domain{' '}
            <Tex>j</Tex> the new anchor is within{' '}
            <Tex>{T`\|d\|_{F_j}\le\sqrt{2\varepsilon^{(2)}_j}+\sqrt{2D^{(2)}_j}`}</Tex>{' '}
            of the old one. (c){' '}
            <Tex tail=",">{T`J_j(\bar\theta^{+})\ge J_j(\bar\theta)+G_j-\sqrt{\varepsilon_j/2}`}</Tex>{' '}
            with <Tex tail=".">{T`G_j=J_j(\theta_j)-J_j(\bar\theta)`}</Tex>{' '}
            Without a reference KL, the trainers’ local solution is not a
            natural-gradient step and no term in the objective bounds drift, so
            the trigger is the only bound on drift. KL penalties toward a shared model appear in
            federated policy gradient <Cite k="xie2023" />; OPM replaces the
            penalty by the trigger and moves the anchor at every rendezvous.
          </p>
          <p>
            <strong>Locality</strong> <Status s="P" />, lossless rounds, per-round
            displacements of order <Tex tail=",">{T`h=\ell/R`}</Tex> with{' '}
            <Tex>{T`\ell`}</Tex> the Fisher path length. The residual of a round
            is <Tex tail=",">{T`O(h^3)`}</Tex> and <Tex>{T`O(h^4)`}</Tex> along
            null directions, so over <Tex>R</Tex> rounds it totals{' '}
            <Tex tail=".">{T`O(\ell^3/R^2)`}</Tex> One-shot merging is{' '}
            <Tex tail=".">{T`R=1`}</Tex> When domains conflict, each round
            leaves a second-order residual whose first-order effect on reward
            does not decrease with merge frequency.
          </p>
          <p>
            <strong>Endpoint-Fisher collapse</strong> <Status s="T" /> for the
            logistic case, <Status s="C" /> for many rounds. One trainer pushes a
            logit to <Tex tail=";">{T`z_1`}</Tex> an idle trainer stays at 0.
            Formula (2) returns{' '}
            <Tex tail=",">{T`z^{+}=f(z_1)z_1/(f(z_1)+\tfrac14)\to0`}</Tex> with{' '}
            <Tex tail=",">{T`f=\sigma(1-\sigma)`}</Tex> while the exact barycenter
            keeps{' '}
            <Tex tail=".">{T`\sigma(z^{+})=(\sigma(z_1)+\tfrac12)/2\to\tfrac34`}</Tex>{' '}
            The locality ratio{' '}
            <Tex>{T`\kappa=\mathrm{KL}(1)/(16\,\mathrm{KL}(\tfrac14))`}</Tex> is
            1.00, 1.35, 1.92 and 8.9 after 1, 10, 20 and 200 steps, so the
            test <Tex>{T`\kappa>1.5`}</Tex> flags the collapse within 20 steps. In a
            multi-round tabular check at fixed budget, as the interval grows from
            1 to 120, the quadratic merge’s idle-domain gain falls from 0.43 to
            0.11 and the exact barycenter’s from 0.43 to 0.29.
          </p>
          <p>
            <strong>Repair and data validity</strong> <Status s="T" />. After a
            rendezvous, trainers resume on-policy RL, so a round’s residual slows
            training but does not limit final quality; the final bound involves
            only the last round. Whole-trajectory importance weights have{' '}
            <Tex tail=",">{T`\chi^2\ge e^{\mathrm{KL}}-1`}</Tex> so at residuals
            of tens of nats no trajectory-level reuse is possible, for OPM or any
            other method. In-flight reuse is possible with per-token importance
            sampling, as in truncated importance sampling and IcePop{' '}
            <Cite k="ling2025" />, where{' '}
            <Tex tail=".">{T`\chi^2_{\rm tok}\approx2\varepsilon_{\rm tok}`}</Tex>{' '}
            One-shot per-token residuals at 4B are 0.01–0.44 nats (sum:
            0.03–0.07).
          </p>
          <p>
            <strong>Choosing δ</strong> <Status s="P" />, partly <Status s="C" />.
            (i) Locality is a per-token condition, so set{' '}
            <Tex>{T`\delta_i=\bar\ell_i\tau_{\rm tok}`}</Tex>, with{' '}
            <Tex>{T`\bar\ell_i`}</Tex> the mean response length, or trigger on per-token KL. At 4B,{' '}
            <Tex>{T`\kappa\approx1`}</Tex> toward the merged points at 0.02–0.04
            nats per token. (ii) The Fisher sample needs many more tokens than the
            effective rank of the subspace in which the domains’ Fishers overlap,
            so it
            grows with the drift budget. (iii) Rounds per unit of Fisher path scale
            as <Tex tail=";">{T`\delta^{-1/2}`}</Tex> take the largest{' '}
            <Tex>{T`\delta`}</Tex> meeting (i) and (ii) within the merge-cost
            budget. (iv) Record <Tex>{T`\kappa`}</Tex> and the in-sample against
            held-out KL gap at each rendezvous to tell estimation failures from
            locality failures.
          </p>

          <h4 id="app-b-7">B.7 MOPD</h4>
          <p>
            <strong>Teacher ceiling (Proposition 4)</strong> <Status s="T" />. With{' '}
            <Tex tail=",">{T`L_i(\theta)=\mathrm{KL}(P^i_\theta\|P^i_{\theta_i})`}</Tex>{' '}
            <Tex>{T`J_i(\theta)\le J_i(\theta_i)+\sqrt{L_i(\theta)/2}`}</Tex> by
            Pinsker on the reverse KL; at <Tex>{T`L_i=0`}</Tex> the student equals
            the teacher. OPM has{' '}
            <Tex tail=",">{T`J_i(\bar\theta^{+})\ge J_i(\theta_i)-\sqrt{\varepsilon_i/2}`}</Tex>{' '}
            with <Tex>{T`\theta_i`}</Tex> retrained on reward each round.
          </p>
          <p>
            <strong>Stationarity</strong> <Status s="P" />, KL three times
            differentiable.{' '}
            <Tex tail=".">{T`\nabla L_i(\theta)=F_i(\theta_i)(\theta-\theta_i)+O(\|\theta-\theta_i\|^2)`}</Tex>{' '}
            At <Tex>{T`d^\star`}</Tex> the leading terms cancel by the normal
            equations, so{' '}
            <Tex tail=";">{T`\|\nabla\sum_iL_i(\bar\theta^{+})\|=O(\sum_i\|\bar\theta^{+}-\theta_i\|^2)`}</Tex>{' '}
            for task arithmetic and the sum it is{' '}
            <Tex tail=".">{T`O(\|\cdot\|)`}</Tex> In a lossless round{' '}
            <Tex tail=".">{T`\sum_iL_i(\bar\theta^{+})=O(\|\cdot\|^3)`}</Tex>{' '}
            Student-state and trainer-state Fishers give quadratic forms that
            differ by a relative <Tex tail=".">{T`O(\sqrt{\varepsilon_i})`}</Tex>{' '}
            In a check the OPM gradient fell from 0.60 to 0.0034 as{' '}
            <Tex>{T`t^2`}</Tex>; the sum’s fell as <Tex tail=".">t</Tex> The
            second-order equivalence of MOPD and Fisher merging is due to{' '}
            <CiteT k="liu2026" />.
          </p>
          <p>
            <strong>Cost identity</strong> <Status s="T" />. MOPD’s second stage
            costs{' '}
            <Tex tail=",">{T`\sum_iN^s_i(c^{\rm gen}_i+c^{\rm env}_i+c^{\rm teach}_i)`}</Tex>{' '}
            including fresh environment interaction. An OPM rendezvous needs no
            environment interaction; it uses a few Fisher-vector products per
            trainer on cached rollouts plus forward passes for the line search.
          </p>

          <h4 id="app-b-8">B.8 The transfer predictor and a regime map</h4>
          <p>
            <strong>Transfer predictor</strong> <Status s="T" /> as an estimator,{' '}
            <Status s="C" /> as a predictor.{' '}
            <Tex>{T`T_j=\operatorname{Cov}_{P^j_{\theta_j}}(R_j,\,S_j^\top s_j)`}</Tex>{' '}
            is estimable without bias from trainer <Tex>j</Tex>’s own batch:
            rewards plus one forward-mode JVP per rollout along{' '}
            <Tex tail=".">{T`s_j`}</Tex> For natural-gradient-like trainers,{' '}
            <Tex tail=",">{T`T_j=G^{(1)}_j\langle\Delta_j,s_j\rangle_{F_j}/\|\Delta_j\|^2_{F_j}`}</Tex>{' '}
            computable by polarisation from three KLs. In an exact check with Adam
            trainers and a CG merge, its correlation with{' '}
            <Tex>{T`J_j(\text{sum})-J_j(\text{merge})`}</Tex> was 0.84–0.87 for{' '}
            <Tex tail=",">{T`K\le10`}</Tex> falling to 0.27 at{' '}
            <Tex tail=".">{T`K=30`}</Tex> The sign was always right for agreeing
            shared contexts.
          </p>
          <p>
            Per domain and round, define visibility{' '}
            <Tex tail=",">{T`V_j=\|s_j\|^2_{F_j}/\|\Delta_j\|^2_{F_j}\approx\varepsilon_j(\text{sum})/D_j`}</Tex>{' '}
            alignment{' '}
            <Tex tail=",">{T`\rho_j=\langle\Delta_j,s_j\rangle_{F_j}/(\|\Delta_j\|_{F_j}\|s_j\|_{F_j})`}</Tex>{' '}
            and the sum’s first-order advantage relative to own gain{' '}
            <Tex tail=".">{T`C_j=\rho_j\sqrt{V_j}=T_j/G^{(1)}_j`}</Tex>
          </p>
          <div className="am-table">
            <table>
              <thead>
                <tr>
                  <th>Regime</th>
                  <th>Diagnostic</th>
                  <th>Prediction</th>
                  <th>Evidence so far</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Low visibility</td>
                  <td>
                    <Tex>{T`V_j\ll1`}</Tex>
                  </td>
                  <td>Every merge ties</td>
                  <td>
                    4B IF and agent: <Tex>{T`V`}</Tex> 0.03–0.18; sum ≈ OPM on
                    IFEval (89.6 vs 89.5) and BFCL (72.4 vs 73.3)
                  </td>
                </tr>
                <tr>
                  <td>Aligned overlap</td>
                  <td>
                    <Tex tail=",">{T`V_j\gtrsim0.3`}</Tex> <Tex>{T`C_j>0`}</Tex>
                  </td>
                  <td>Sum and multi-task RL beat OPM on the mean</td>
                  <td>
                    4B reasoning: <Tex>{T`C`}</Tex> +0.17 to +0.26 (estimated),{' '}
                    <Tex>{T`V`}</Tex> 0.5–3.1; sum wins on AIME. Toy positive
                    variants at small budgets
                  </td>
                </tr>
                <tr>
                  <td>Conflicting overlap or small share</td>
                  <td>
                    <Tex>{T`C_j<0`}</Tex>
                  </td>
                  <td>OPM wins, most on the worst domain</td>
                  <td>
                    Toy conflict variants; literature pairs IF and tool use,
                    search and math
                  </td>
                </tr>
                <tr>
                  <td>Non-local</td>
                  <td>
                    <Tex tail=";">{T`\kappa>1.5`}</Tex> saturated trainers
                  </td>
                  <td>Exact closed form collapses; line search needed</td>
                  <td>
                    Toy at interval 50: exact OPM 0.07–0.37, CG-10 0.61–0.91, sum
                    0.54–0.76
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Falsifiable predictions for the main runs: (P1) per domain, the sign
            of <Tex>{T`J_j(\text{sum})-J_j(\text{merge})`}</Tex> is the sign of{' '}
            <Tex tail=";">{T`T_j`}</Tex> (P2) OPM is at least as good as multi-task RL on the
            worst domain exactly where <Tex tail=",">{T`C_j<0`}</Tex> and below it
            on the mean for reasoning pairs unless trainer learning rates are
            raised; (P3) once <Tex tail=",">{T`\kappa>1.5`}</Tex> the line
            search picks <Tex>{T`\gamma\to0`}</Tex> and CG gains vanish; (P4) the
            best task-arithmetic coefficient for RL specialists stays near 1.
          </p>

          <h4 id="app-b-9">B.9 What is not claimed</h4>
          <ul>
            <li>
              No general rate advantage over well-tuned multi-task RL. OPM is
              slower along agreeing shared directions, up to <Tex>n</Tex> times in
              the exponent, and has an <Tex>{T`O(\eta K)`}</Tex> floor with
              nonlinear networks.
            </li>
            <li>
              No positive transfer within a round. Frequency does not change this
              for exact lossless merges (refuted: “frequent rendezvous captures
              transfer”).
            </li>
            <li>
              No reward guarantee at realistic trajectory KL. Pinsker-type bounds
              are vacuous above about 2 nats; 4B specialists drift 75–248 nats.
            </li>
            <li>
              At LLM scale, the existence of lossless points is an assumption
              that we have not verified. At 4B the
              residual after 30 CG iterations is still 15% of drift.
            </li>
            <li>
              Speed invariance holds only in lossless directions or with
              round-solving trainers; under conflict, step sizes act as weights.
            </li>
            <li>
              No invariance to rollout length: domains with longer responses
              receive more weight in shared directions.
            </li>
            <li>
              Exact gradients and Fishers are assumed except in <a className="am-ref" href="#prop-5">Proposition 5</a> and
              the CG step criterion; the tabular rate is inherited from the
              discounted literature.
            </li>
          </ul>
        </details>

        {/* ============================================================ */}
        <details className="am-app" id="app-c">
          <summary>
            <h3>C. The merge solver and its cost</h3>
          </summary>
          <p id="prop-5">
            <strong>Proposition 5 (the production merge)</strong> <Status s="T" />
            . Candidates are{' '}
            <Tex>{T`d(\gamma)=d_\Sigma+\gamma(x_k-d_\Sigma)`}</Tex>, with{' '}
            <Tex>{T`x_k`}</Tex> the <Tex>k</Tex>-th CG iterate and{' '}
            <Tex tail=".">{T`\gamma\in\Gamma=\{1,\tfrac12,\tfrac14,0\}`}</Tex> Let{' '}
            <Tex>{T`\hat E(\gamma)`}</Tex> estimate{' '}
            <Tex>{T`E(\gamma)=\sum_i\varepsilon_i(d(\gamma))`}</Tex> on fresh
            trainer rollouts. If{' '}
            <Tex tail=",">{T`\max_\gamma|\hat E(\gamma)-E(\gamma)|\le e`}</Tex>{' '}
            then{' '}
            <Tex>{T`\hat\gamma=\arg\min_\gamma\hat E(\gamma)`}</Tex> satisfies{' '}
            <Tex tail=".">{T`E(\hat\gamma)\le E(\text{sum})+2e`}</Tex> With
            per-rollout log-ratio spread <Tex>s</Tex> and <Tex>M</Tex> rollouts,{' '}
            <Tex tail=".">{T`e=O(s\sqrt{\log|\Gamma|/M})`}</Tex> <em>Proof.</em>{' '}
            <Tex>{T`E(\hat\gamma)\le\hat E(\hat\gamma)+e\le\hat E(0)+e\le E(0)+2e`}</Tex>{' '}
            by a union bound over sub-Gaussian means. ∎ The guarantee bounds
            the total KL over domains, measured on the trainers’ distributions;
            it gives no bound on any single domain’s KL or on reward. Estimating{' '}
            <Tex>{T`\hat E(\gamma)-\hat E(0)`}</Tex> on the same rollouts shrinks{' '}
            <Tex tail=".">s</Tex> Adding a candidate on the anchor side would
            restore the <Tex>{T`n(\delta+\omega)`}</Tex> bound of <a className="am-ref" href="#app-b-6">B.6</a>.
          </p>
          <p>
            <strong>When CG raises the true KL</strong> <Status s="T" /> for the
            criterion, <Status s="C" /> for the attribution. With{' '}
            <Tex tail=",">{T`A=\sum F_i`}</Tex>{' '}
            <Tex tail=",">{T`\hat A=\sum\hat F_i+\mu I`}</Tex> <Tex>r</Tex> the
            true and <Tex>{T`\hat r`}</Tex> the sampled residual of (2) at the
            sum, the first CG step raises the true quadratic iff{' '}
            <Tex tail=";">{T`\hat r^\top r/\|\hat r\|^2<\tfrac12\,\hat r^\top A\hat r/\hat r^\top\hat A\hat r`}</Tex>{' '}
            likewise for later directions. There are two sources of failure: estimation noise,
            with relative size growing as{' '}
            <Tex tail=",">{T`\sqrt{r_{\rm eff}/N_{\rm tok}}`}</Tex> and curvature
            underestimated along the step. Proof: for{' '}
            <Tex>{T`q(x)=\tfrac12x^\top Ax-b^\top x`}</Tex> and{' '}
            <Tex tail=",">{T`r=b-Ax_0`}</Tex>{' '}
            <Tex tail=";">{T`q(x_0+\alpha p)-q(x_0)=-\alpha p^\top r+\tfrac12\alpha^2p^\top Ap`}</Tex>{' '}
            substitute <Tex>{T`p=\hat r`}</Tex> and{' '}
            <Tex tail=".">{T`\alpha=\|\hat r\|^2/\hat r^\top\hat A\hat r`}</Tex>{' '}
            In synthetic checks with <Tex>{T`\kappa\approx1`}</Tex> three CG
            iterations cut the true residual by 40–50%; with saturated trainers (
            <Tex>{T`\kappa\approx16`}</Tex> at the sum) five iterations cut the
            quadratic residual by 93% but the true one by only 5–24%. The 9B
            diagnosis in the main text (secant underestimation along the stiffest
            directions) is consistent with the second source.
          </p>
          <p>
            <span className="am-runin">Cost model.</span> Per merge,{' '}
            <Tex tail=",">{T`T_{\rm merge}=T_{\rm rhs}+N_{\rm it}\max_iT_{\rm FVP}(T_i)+N_{\rm eval}T_{\rm KL}+N_{\rm it}T_{\rm ar}`}</Tex>{' '}
            with{' '}
            <Tex>{T`T_{\rm FVP}(T)=(T/G)(n_{\rm fd}c^{\rm fp32}_{\rm fwd}+c_{\rm cal}+c_{\rm vjp}+c_{\rm head})`}</Tex>{' '}
            for <Tex>T</Tex> cached action tokens on <Tex>G</Tex> GPUs and central
            differences (<Tex tail=")">{T`n_{\rm fd}=2`}</Tex>. The all-reduce
            costs about 10 ms per billion parameters. Measured on B200 for the
            9.4B hybrid model, in GPU-milliseconds per generated token:
          </p>
          <div className="am-table">
            <table>
              <thead>
                <tr>
                  <th>Component</th>
                  <th className="am-num">fp32</th>
                  <th className="am-num">TF32</th>
                  <th className="am-num">bf16</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Forward, reference linear-attention kernel</td>
                  <td className="am-num">1.39</td>
                  <td className="am-num">0.60</td>
                  <td className="am-num">–</td>
                </tr>
                <tr>
                  <td>Forward, fused linear-attention kernel</td>
                  <td className="am-num">1.08</td>
                  <td className="am-num">0.21</td>
                  <td className="am-num">0.17</td>
                </tr>
                <tr>
                  <td>Forward + backward (checkpointed)</td>
                  <td className="am-num">≈ 3.6</td>
                  <td className="am-num">–</td>
                  <td className="am-num">0.44</td>
                </tr>
                <tr>
                  <td>Vocabulary-softmax head</td>
                  <td className="am-num">0.51</td>
                  <td className="am-num">0.06</td>
                  <td className="am-num">–</td>
                </tr>
                <tr>
                  <td>Full FVP, CG vectors in CPU memory</td>
                  <td className="am-num">20–24</td>
                  <td className="am-num">–</td>
                  <td className="am-num">–</td>
                </tr>
                <tr>
                  <td>
                    <strong>Full FVP, CG vectors on GPU</strong>
                  </td>
                  <td className="am-num">
                    <strong>6.9</strong>
                  </td>
                  <td className="am-num">–</td>
                  <td className="am-num">–</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Moving the vectors to the GPU took one product on 11k tokens from 66 s
            to 19 s. One product over about 36k tokens takes 100–120 s. Further
            speed-ups we have not yet adopted: running the vector-Jacobian product in
            bf16 (it is linear in the cotangent, and bf16 forward+backward costs
            0.44 against 3.6 in fp32), TF32 finite-difference forwards with fp32
            refinement, subsampling the curvature batch as Hessian-free
            optimisation and TRPO do <Cite k={['martens2010', 'schulman2015']} />,
            warm starts across rendezvous, and running the solve on spare GPUs
            while training continues.
          </p>
          <p>
            <span className="am-runin">The 9B test case.</span> Two trainers
            branched from MiMo-V2.6-Distill-Qwen-9B: math for 40 steps and
            instruction following for 30. Fisher-vector products on 32 rollouts
            per trainer, residuals on held-out rollouts, damping{' '}
            <Tex>{T`\mu=10^{-3}`}</Tex> of the mean curvature. Held-out drifts
            76.4 and 49.0 nats. Along the sum-minus-own direction the quadratic
            model holds, <Tex>{T`\kappa`}</Tex> 0.87–1.0. With a finite-difference
            step of 0.3, CG with the full step gave 112.7 nats after two
            iterations and 214.7 after three; with step 0.01 the numbers are those
            of <a className="am-ref" href="#table-2">Table 2</a>. The per-trainer residuals at the chosen point (three
            iterations, <Tex tail=")">{T`\gamma=\tfrac12`}</Tex> are 3.0 and 5.5
            nats, against 5.2 and 8.1 for the sum.
          </p>
          <p>
            <span className="am-runin">System.</span> Each trainer is an ordinary
            GRPO trainer with a hook: after each optimizer step it runs the frozen
            anchor on about one rollout in eight to update its drift. At a
            rendezvous, the merge runs as a collective across trainers: every
            trainer computes its own Fisher-vector products on its own GPUs and
            cached tokens (a forward-mode pass for the change in logits,
            multiplication by{' '}
            <Tex tail=",">{T`\operatorname{diag}(\pi)-\pi\pi^\top`}</Tex> and a
            backward pass), one all-reduce per iteration sums them, and the line
            search scores the candidates on held-out rollouts. In our runs a
            rendezvous blocks: every trainer pauses until the merged model is
            installed, and a trainer that has finished its budget stays in the
            merge with its final weights. Each trainer keeps its optimizer moments,
            learning rate, batch size, rollout servers and sandboxes; the trainers
            share only a weight format. Logged at every rendezvous: drift, the
            held-out residual per trainer for every step size tried, the chosen{' '}
            <Tex tail=",">{T`\gamma`}</Tex> CG iterations, tokens and
            wall-clock.
          </p>
          <p>
            <span className="am-runin" id="table-c1">Table C1.</span> The five
            recipes as systems, for <Tex>n</Tex> domains. A training state is a
            full copy of weights, master weights and optimizer moments, about 16
            bytes per parameter.
          </p>
          <div className="am-table am-table-wide">
            <table>
              <thead>
                <tr>
                  <th>Recipe</th>
                  <th>Training states</th>
                  <th>Rollouts</th>
                  <th>What a step waits for</th>
                  <th>Optimizer per domain</th>
                  <th>Changing or fixing one domain</th>
                  <th>Extra cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Multi-task RL</td>
                  <td>One.</td>
                  <td>One shared pool; every batch mixes all domains.</td>
                  <td>Every domain’s quota, so the slowest domain determines the step time.</td>
                  <td>No: one optimizer state, one clip, one learning rate.</td>
                  <td>Re-mix the quotas and keep training; updates from a broken domain are already in every weight.</td>
                  <td>None.</td>
                </tr>
                <tr>
                  <td>Cascade RL</td>
                  <td>One.</td>
                  <td>One domain at a time.</td>
                  <td>The stage in progress.</td>
                  <td>Per stage, not per domain.</td>
                  <td>Add a stage; nothing constrains earlier domains, so they can be forgotten.</td>
                  <td>None.</td>
                </tr>
                <tr>
                  <td>Merge-after</td>
                  <td>
                    <Tex tail=",">n</Tex> in parallel or in turn.
                  </td>
                  <td>One pool per specialist.</td>
                  <td>Nothing until the single merge at the end.</td>
                  <td>Yes.</td>
                  <td>Retrain one specialist and merge again; the specialists are tens to hundreds of nats apart.</td>
                  <td>One merge.</td>
                </tr>
                <tr>
                  <td>MOPD</td>
                  <td>
                    <Tex>n</Tex> for the specialists, then one student while{' '}
                    <Tex>n</Tex> teachers run inference.
                  </td>
                  <td>One pool per specialist, then a student pool sampling every domain.</td>
                  <td>The specialists, then the student.</td>
                  <td>During the specialist stage only.</td>
                  <td>Retrain one specialist and distil again.</td>
                  <td>A second rollout stage in every domain.</td>
                </tr>
                <tr>
                  <td>
                    <strong>OPM</strong>
                  </td>
                  <td>
                    <Tex tail=",">n</Tex> which can share one training pool in
                    turn (Computing the merge at scale).
                  </td>
                  <td>One engine group per trainer, sized by rollout cost.</td>
                  <td>Only the next rendezvous; units never wait for each other between rendezvous.</td>
                  <td>Yes, throughout training.</td>
                  <td>Start, retune or roll back one trainer at a rendezvous; the others continue training.</td>
                  <td>A merge per rendezvous: about five minutes with two trainers at 9B, about an hour with eight.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <span className="am-runin" id="table-c2">Table C2.</span> Held-out
            KL residual{' '}
            <Tex>{T`\sum_i\mathrm{KL}(P^i_{\theta_i}\|P^i_{\rm merge})`}</Tex>{' '}
            in nats at each rendezvous of the eight-domain 9B run. “No merge”
            is the trainers’ total drift from the anchor; the merge is the
            preconditioned CG solve at step size{' '}
            <Tex tail=".">{T`\gamma`}</Tex> “Trainers” counts those still
            training; trainers that had finished their budget took part with
            their final weights. Rendezvous 6 and 7 installed the merge at half
            its length. At rendezvous 7 the full solve failed the per-trainer
            check at every step size; the row reports the solve without the math
            trainer, whose update was deferred to the next rendezvous.
          </p>
          <div className="am-table">
            <table>
              <thead>
                <tr>
                  <th>Rendezvous</th>
                  <th className="am-num">Trainers</th>
                  <th className="am-num">No merge</th>
                  <th className="am-num">Sum (γ = 0)</th>
                  <th className="am-num">γ = ½</th>
                  <th className="am-num">γ = 1</th>
                  <th className="am-num">vs sum</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>1</td><td className="am-num">8</td><td className="am-num">1,999</td><td className="am-num">3,024</td><td className="am-num">1,374</td><td className="am-num"><strong>652</strong></td><td className="am-num">−78%</td></tr>
                <tr><td>2</td><td className="am-num">8</td><td className="am-num">3,151</td><td className="am-num">2,692</td><td className="am-num">1,236</td><td className="am-num"><strong>677</strong></td><td className="am-num">−75%</td></tr>
                <tr><td>3</td><td className="am-num">7</td><td className="am-num">2,122</td><td className="am-num">928</td><td className="am-num">453</td><td className="am-num"><strong>249</strong></td><td className="am-num">−73%</td></tr>
                <tr><td>4</td><td className="am-num">7</td><td className="am-num">1,128</td><td className="am-num">595</td><td className="am-num">293</td><td className="am-num"><strong>186</strong></td><td className="am-num">−69%</td></tr>
                <tr><td>5</td><td className="am-num">5</td><td className="am-num">509</td><td className="am-num">528</td><td className="am-num">303</td><td className="am-num"><strong>259</strong></td><td className="am-num">−51%</td></tr>
                <tr><td>6</td><td className="am-num">6</td><td className="am-num">–</td><td className="am-num">2,092</td><td className="am-num">–</td><td className="am-num"><strong>499</strong></td><td className="am-num">−76%</td></tr>
                <tr><td>7</td><td className="am-num">4</td><td className="am-num">–</td><td className="am-num">1,071</td><td className="am-num">–</td><td className="am-num"><strong>596</strong></td><td className="am-num">−44%</td></tr>
              </tbody>
            </table>
          </div>
        </details>

        {/* ============================================================ */}
        <details className="am-app" id="app-d">
          <summary>
            <h3>D. One-shot merge of released 4B specialists</h3>
          </summary>
          <p>
            <span className="am-runin">Artefacts.</span> Base
            Qwen3-4B-Instruct-2507 and the five fp32 specialists of{' '}
            <CiteT k="wu2026" />, with their training and test data and their
            verl-based code. Their recipe: GRPO with 128 prompts × 16 rollouts per
            step, learning rate <Tex tail=",">{T`10^{-6}`}</Tex> 300 steps,
            responses up to 16,384 tokens, temperature 1, and a KL loss to the
            base with coefficient 0.001, which is effectively no penalty. The
            released task-arithmetic merge uses <Tex>{T`\lambda=0.6`}</Tex> over
            the fp32 specialists and is stored in bf16. Casting each fp32
            specialist to bf16 reproduces the released bf16 checkpoint bit for
            bit.
          </p>
          <p>
            <span className="am-runin">Measurement.</span> For each specialist,
            1,024 rollouts on its own training prompts plus 256 held-out prompts.
            Every KL is the exact per-token KL over the full vocabulary, summed
            over the model’s tokens, scored in true fp32. Ratios use a paired
            bootstrap.
          </p>
          <p>
            <span className="am-runin">Drift.</span> Trajectory KL to the base
            (nats) and per-token KL: math 248 / 0.040, agent 177 / 0.225, code 155
            / 0.024, IF 100 / 0.67, science 75 / 0.029. The rankings by trajectory
            and by per-token KL differ.
          </p>
          <p>
            <span className="am-runin">Interference.</span> The index{' '}
            <Tex>{T`I_{ij}=\mathrm{KL}(\theta_j\|\theta_j+\tau_i)/\mathrm{KL}(\theta_j\|\text{base})`}</Tex>{' '}
            (rows: added update <Tex tail=";">i</Tex> columns: scored specialist{' '}
            <Tex tail=")">j</Tex>:
          </p>
          <div className="am-table">
            <table>
              <thead>
                <tr>
                  <th>
                    <Tex>{T`i\backslash j`}</Tex>
                  </th>
                  <th className="am-num">math</th>
                  <th className="am-num">science</th>
                  <th className="am-num">code</th>
                  <th className="am-num">IF</th>
                  <th className="am-num">agent</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>math</td>
                  <td className="am-num">1.18</td>
                  <td className="am-num">1.23</td>
                  <td className="am-num">1.78</td>
                  <td className="am-num">0.011</td>
                  <td className="am-num">0.040</td>
                </tr>
                <tr>
                  <td>science</td>
                  <td className="am-num">0.288</td>
                  <td className="am-num">0.989</td>
                  <td className="am-num">0.429</td>
                  <td className="am-num">0.010</td>
                  <td className="am-num">0.017</td>
                </tr>
                <tr>
                  <td>code</td>
                  <td className="am-num">0.156</td>
                  <td className="am-num">0.174</td>
                  <td className="am-num">0.948</td>
                  <td className="am-num">0.004</td>
                  <td className="am-num">0.027</td>
                </tr>
                <tr>
                  <td>IF</td>
                  <td className="am-num">0.081</td>
                  <td className="am-num">0.278</td>
                  <td className="am-num">0.173</td>
                  <td className="am-num">0.970</td>
                  <td className="am-num">0.078</td>
                </tr>
                <tr>
                  <td>agent</td>
                  <td className="am-num">0.088</td>
                  <td className="am-num">0.165</td>
                  <td className="am-num">0.286</td>
                  <td className="am-num">0.012</td>
                  <td className="am-num">0.952</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            The off-diagonal median is 0.122. Global task-vector cosines are at
            most 0.022 (math–science); the Spearman correlation between{' '}
            <Tex>{T`I_{ij}`}</Tex> and cosine is 0.64. The IF and agent
            specialists are barely moved by other updates, but their own updates
            move the reasoning specialists.
          </p>
          <p>
            <span className="am-runin">Locality.</span> Along every direction,{' '}
            <Tex>{T`\mathrm{KL}(\tfrac12)/(4\,\mathrm{KL}(\tfrac14))`}</Tex> lies
            in [0.80, 1.25]. The locality ratio is 0.87–1.10 across cross
            directions, at most 0.997 toward task arithmetic, and 0.96–1.17 toward
            the merged points.
          </p>
          <p>
            <span className="am-runin">The merge.</span> CG on{' '}
            <Tex>{T`(\sum_iF_i+\mu I)d=\sum_iF_i\Delta_i+\mu d_0`}</Tex> from{' '}
            <Tex tail=",">{T`d_0`}</Tex>{' '}
            with <Tex>{T`\mu=10^{-3}\operatorname{tr}(\sum_iF_i)/P`}</Tex>{' '}
            estimated by Hutchinson’s method. <Tex>{T`F_i`}</Tex> is the exact per-token
            Gauss–Newton Fisher{' '}
            <Tex tail=",">{T`J^\top(\operatorname{diag}\pi-\pi\pi^\top)J`}</Tex>{' '}
            applied as a forward-mode then backward product, on 256 fp32 rollouts
            per domain (about 5.7M tokens in total). Against finite differences of{' '}
            <Tex>{T`2\,\mathrm{KL}(\theta\|\theta+\epsilon v)/\epsilon^2`}</Tex>{' '}
            the quadratic form agrees within 1–3% along the math update, 0.05%
            along the code update and 0.1% along a random direction, along which
            the curvature is 5,800 times smaller. Points: (a) from the sum, 10 iterations;
            (c) continued to 30; (b) from task arithmetic, 10; (d) stale metric,
            Fisher on base-model rollouts, 10.
          </p>
          <p>
            <span className="am-runin">Residual over drift,</span> mean (max) over
            the five domains:
          </p>
          <div className="am-table">
            <table>
              <thead>
                <tr>
                  <th>Point</th>
                  <th className="am-num">In-sample</th>
                  <th className="am-num">Same distribution, unused</th>
                  <th className="am-num">Held-out prompts</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Task arithmetic, λ = 0.6</td>
                  <td className="am-num">0.550 (1.194)</td>
                  <td className="am-num">0.557 (1.180)</td>
                  <td className="am-num">0.521 (1.121)</td>
                </tr>
                <tr>
                  <td>Sum, λ = 1</td>
                  <td className="am-num">1.191 (3.085)</td>
                  <td className="am-num">1.190 (3.057)</td>
                  <td className="am-num">1.116 (2.899)</td>
                </tr>
                <tr>
                  <td>Released mixed RL</td>
                  <td className="am-num">1.051 (1.275)</td>
                  <td className="am-num">1.066 (1.452)</td>
                  <td className="am-num">1.073 (1.409)</td>
                </tr>
                <tr>
                  <td>Released MOPD</td>
                  <td className="am-num">0.348 (0.421)</td>
                  <td className="am-num">0.345 (0.416)</td>
                  <td className="am-num">0.340 (0.413)</td>
                </tr>
                <tr>
                  <td>OPM (a), 10 iterations</td>
                  <td className="am-num">0.322 (0.683)</td>
                  <td className="am-num">0.350 (0.776)</td>
                  <td className="am-num">0.311 (0.631)</td>
                </tr>
                <tr>
                  <td>OPM, 20 iterations</td>
                  <td className="am-num">0.202 (0.476)</td>
                  <td className="am-num">0.235 (0.576)</td>
                  <td className="am-num">0.205 (0.457)</td>
                </tr>
                <tr>
                  <td>OPM (c), 30 iterations</td>
                  <td className="am-num">0.148 (0.363)</td>
                  <td className="am-num">0.183 (0.468)</td>
                  <td className="am-num">0.158 (0.363)</td>
                </tr>
                <tr>
                  <td>OPM (b), from task arithmetic</td>
                  <td className="am-num">0.271 (0.537)</td>
                  <td className="am-num">0.294 (0.602)</td>
                  <td className="am-num">0.266 (0.498)</td>
                </tr>
                <tr>
                  <td>OPM (d), stale metric</td>
                  <td className="am-num">0.405 (0.836)</td>
                  <td className="am-num">0.416 (0.852)</td>
                  <td className="am-num">0.380 (0.799)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Per domain, OPM (a) against task arithmetic: math 0.29 / 0.33, science
            0.68 / 0.71, code 0.58 / 1.19, IF 0.025 / 0.26, agent 0.037 / 0.26.
            The OPM point moves only 3.9% of <Tex>{T`\|\sum_i\tau_i\|`}</Tex> from
            the sum after 10 iterations (6.4% after 20, 8.3% after 30), and
            99.4–99.6% of that move lies outside the span of the five updates;
            it reduces the residual relative to the sum 3.7-fold at 10
            iterations and 8-fold at 30. The relative CG residual is 0.13, 0.078
            and 0.068 at 10, 20 and 30 iterations.
          </p>
          <p>
            <span className="am-runin">Evaluation.</span> The protocol of{' '}
            <CiteT k="wu2026" />: mean over 32 samples, temperature 0.6, top-p
            0.95, responses up to 16,384 tokens, non-thinking mode, their scorers
            for each benchmark, and a local sandbox for LiveCodeBench. Our base,
            MOPD and IF-specialist IFBench scores (30.7 / 46.7 / 48.9) reproduce
            the published 30.3 / 47.3 / 49.0. <a className="am-ref" href="#table-3">Table 3</a> reports AIME 2025 and 2026
            pooled and LiveCodeBench v6 only; the paired differences quoted with
            ± in this appendix follow Wu et al. and average their eight
            benchmarks, which weights AIME and LiveCodeBench twice. Our task-arithmetic point is
            bit-identical to the released merge after the bf16 cast; evaluating
            both gives −0.32 ± 0.22, the run-to-run noise floor. The sum writes
            the longest code answers (about 6,000 tokens against 3,600 for task
            arithmetic; 5–7% hit the cap), the OPM points about 4,400–4,900.
          </p>
          <p>
            <span className="am-runin">Paired differences,</span> mean over eight
            benchmarks ± standard error:
          </p>
          <div className="am-table">
            <table>
              <thead>
                <tr>
                  <th>Comparison</th>
                  <th className="am-num">Mean of 8</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>OPM (a) − task arithmetic</td>
                  <td className="am-num">+1.68 ± 0.42</td>
                  <td>IFBench +10.1 ± 1.9; LCB v5 +3.3; AIME25 −2.8 ± 1.7</td>
                </tr>
                <tr>
                  <td>OPM (c) − task arithmetic</td>
                  <td className="am-num">+2.06 ± 0.40</td>
                  <td></td>
                </tr>
                <tr>
                  <td>OPM (d) − task arithmetic</td>
                  <td className="am-num">+1.90 ± 0.46</td>
                  <td></td>
                </tr>
                <tr>
                  <td>OPM (b) − task arithmetic</td>
                  <td className="am-num">−0.25 ± 0.35</td>
                  <td></td>
                </tr>
                <tr>
                  <td>Sum − task arithmetic</td>
                  <td className="am-num">+2.57 ± 0.47</td>
                  <td></td>
                </tr>
                <tr>
                  <td>OPM (a) − sum</td>
                  <td className="am-num">−0.89 ± 0.36</td>
                  <td>AIME25 −4.7, AIME26 −3.4</td>
                </tr>
                <tr>
                  <td>OPM (c) − sum</td>
                  <td className="am-num">−0.51 ± 0.36</td>
                  <td></td>
                </tr>
                <tr>
                  <td>OPM (a) − OPM (d), on-policy vs stale metric</td>
                  <td className="am-num">−0.22 ± 0.31</td>
                  <td></td>
                </tr>
                <tr>
                  <td>OPM (a) − released MOPD</td>
                  <td className="am-num">+1.11 ± 0.40</td>
                  <td></td>
                </tr>
                <tr>
                  <td>OPM (a) fp32 − OPM (a) bf16</td>
                  <td className="am-num">+1.30 ± 0.34</td>
                  <td>AIME +2.3 / +3.0, GPQA +1.1, LCB +1.6 / +1.2</td>
                </tr>
                <tr>
                  <td>OPM (a) fp32 − sum bf16</td>
                  <td className="am-num">+0.41 ± 0.37</td>
                  <td>The sum was not evaluated in fp32</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            About 330 B200 GPU-hours were logged for the merges, residual scoring
            and evaluation. Only bf16 checkpoints of the 8B specialists were
            released, and bf16 rounding destroys their task vectors (<a className="am-ref" href="#app-g">Appendix G</a>),
            so we did not merge at 8B.
          </p>
        </details>

        {/* ============================================================ */}
        <details className="am-app" id="app-e">
          <summary>
            <h3>E. The toy, with the corrected baseline</h3>
          </summary>
          <p>
            <span className="am-runin">Setting.</span> A 704-parameter policy
            shared by four chain tasks with horizons 2, 6, 16 and 16, trained with
            exact policy gradients and Adam; returns, gradients, Fishers and KLs
            are computed in closed form. Ten random problems per cell. Five
            variants set the cross-task effect: the original (gradient cosine
            −0.16; training one task changes another by −0.16), pos-soft (+0.21;
            +0.10), pos-strong (+0.50; +0.19), neg (−0.24; −0.19) and mixed
            (−0.19; −0.13). OPM uses an interval of 5 steps and 10 CG iterations
            unless noted. The code will be released with the main runs.
          </p>
          <p>
            <span className="am-runin">Correction.</span> The previous version of
            this post compared OPM with multi-task RL at its default learning
            rate, 0.688 against 0.963 on the original variant. Tuning the
            multi-task learning rate over 1–16× its default raises it to 0.949.
            The comparison below tunes both.
          </p>
          <p>Mean final return at 50 steps per task (± about 0.01 or less):</p>
          <div className="am-table">
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th className="am-num">orig</th>
                  <th className="am-num">pos-soft</th>
                  <th className="am-num">pos-strong</th>
                  <th className="am-num">neg</th>
                  <th className="am-num">mixed</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Multi-task RL, default rate</td>
                  <td className="am-num">0.688</td>
                  <td className="am-num">0.820</td>
                  <td className="am-num">0.910</td>
                  <td className="am-num">0.619</td>
                  <td className="am-num">0.648</td>
                </tr>
                <tr>
                  <td>Multi-task RL, 4× rate</td>
                  <td className="am-num">0.949</td>
                  <td className="am-num">0.990</td>
                  <td className="am-num">0.993</td>
                  <td className="am-num">0.762</td>
                  <td className="am-num">0.804</td>
                </tr>
                <tr>
                  <td>Multi-task RL, best of 1–16×</td>
                  <td className="am-num">0.949</td>
                  <td className="am-num">1.000</td>
                  <td className="am-num">1.000</td>
                  <td className="am-num">0.773</td>
                  <td className="am-num">0.804</td>
                </tr>
                <tr>
                  <td>Specialists + task arithmetic, oracle coefficient</td>
                  <td className="am-num">0.550</td>
                  <td className="am-num">0.815</td>
                  <td className="am-num">0.872</td>
                  <td className="am-num">0.410</td>
                  <td className="am-num">0.459</td>
                </tr>
                <tr>
                  <td>Specialists + MOPD, best split</td>
                  <td className="am-num">0.641</td>
                  <td className="am-num">0.875</td>
                  <td className="am-num">0.903</td>
                  <td className="am-num">0.498</td>
                  <td className="am-num">0.552</td>
                </tr>
                <tr>
                  <td>Periodic sum, interval 5</td>
                  <td className="am-num">0.750</td>
                  <td className="am-num">0.941</td>
                  <td className="am-num">0.973</td>
                  <td className="am-num">0.558</td>
                  <td className="am-num">0.634</td>
                </tr>
                <tr>
                  <td>OPM, exact merge</td>
                  <td className="am-num">0.963</td>
                  <td className="am-num">0.957</td>
                  <td className="am-num">0.918</td>
                  <td className="am-num">0.969</td>
                  <td className="am-num">0.965</td>
                </tr>
                <tr>
                  <td>OPM, CG-10, default rate</td>
                  <td className="am-num">0.955</td>
                  <td className="am-num">0.937</td>
                  <td className="am-num">0.963</td>
                  <td className="am-num">0.974</td>
                  <td className="am-num">0.967</td>
                </tr>
                <tr>
                  <td>OPM, CG-10, 2× rate</td>
                  <td className="am-num">0.993</td>
                  <td className="am-num">0.990</td>
                  <td className="am-num">0.994</td>
                  <td className="am-num">0.996</td>
                  <td className="am-num">0.995</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            At smaller budgets the positive variants favour multi-task RL more
            strongly. Against multi-task RL at 4× its rate, OPM (CG-10, default
            rate) trails by 0.23 / 0.20 at 10 steps per task, 0.18 / 0.10 at 25
            and 0.05 / 0.03 at 50 (pos-soft / pos-strong). In the conflict variants, OPM
            leads at every budget once both rates are tuned (at 25 steps, 0.980 /
            0.986 for OPM at 4× against 0.762 / 0.776 for the best multi-task
            rate, neg / mixed).
          </p>
          <p>
            <span className="am-runin">Transfer into an idle task</span> (the
            task’s trainer is in the merge but does not train), 10 steps: periodic
            sum −0.13 / +0.13 / +0.33 / −0.19 / −0.15 over the five variants;
            exact OPM −0.07 / −0.08 / −0.11 / −0.03 / −0.05; OPM CG-10 −0.01 /
            +0.04 / +0.19 / −0.03 / −0.01. OPM blocks positive transfer into idle
            tasks, as <a className="am-ref" href="#thm-1">Theorem 1</a> predicts. A task absent from the run receives
            about as much transfer under OPM as under multi-task RL or the sum
            (pos-strong: +0.30, +0.24, +0.33). In a sweep of the interval at 50
            steps (pos-strong), idle-task transfer under exact OPM is +0.48 at an
            interval of 1, more than the sum’s +0.38, and −0.21 at 50; CG-10 goes
            from +0.49 to +0.13. A tabular check of the same quantity gives 0.43
            for OPM against 0.45 for the sum, so we suspect the excess at interval
            1 comes from summing Adam steps, but it is unconfirmed.
          </p>
          <p>
            <span className="am-runin">A reward-aware merge.</span> Adding the
            trainers’ gradients to the merge,{' '}
            <Tex tail=",">{T`\bar\theta+A^{+}\sum_i(F_i\Delta_i+g_i/\beta_m)`}</Tex>{' '}
            is a candidate way to recover transfer. Because{' '}
            <Tex tail=",">{T`g_i\in\operatorname{range}F_i`}</Tex> it is exactly
            OPM applied to trainers that each took one extra natural-gradient step
            (numerical identity error at most{' '}
            <Tex tail=")">{T`2.6\times10^{-3}`}</Tex>. Its
            gain is similar across variants (+0.21 to +0.26 at 10 steps), and OPM
            with a 4× trainer rate reproduces it within about 0.02, so the gain is a
            step-size effect. We report it only as an ablation.
          </p>
          <p>
            <span className="am-runin">Guarantees.</span> Pinsker’s bound held in
            all 79,012 trainer–round pairs. OPM CG-10 never lost more than a
            trainer’s gain in a round, and no CG-merged run ended with a task
            below its starting point; multi-task RL, task arithmetic and the sum
            left 20–37% of tasks below it in the conflict variants.
          </p>
          <p>
            <span className="am-runin">Results from the first toy version</span>{' '}
            (same problem, original variant, 50 steps per task). These do not
            depend on the multi-task learning rate, except the last item, which
            uses multi-task RL at its default rate.
          </p>
          <ul>
            <li>
              Metric: Fisher from the trainer’s current rollouts 0.96; from the
              anchor’s, one round old, 0.95; from the base model’s, never
              refreshed, 0.13.
            </li>
            <li>
              Operator: average 0.48, diagonal Fisher 0.47, layer Grams 0.62,
              K-FAC 0.71, sum 0.75, ten likelihood steps 0.84, CG with 3
              iterations 0.82, with 10 iterations 0.955, exact 0.963. Cheap
              layer-wise approximations did worse than the plain sum.
            </li>
            <li>
              Interval: every 1, 5, 10, 25, 50 steps gave 0.97, 0.96, 0.93, 0.34,
              0.08. With 100 steps per task, a KL trigger of 0.3 nats reached
              0.987 with 6.6 rendezvous; a fixed interval with 5 rendezvous
              reached 0.88.
            </li>
            <li>
              Staleness after a rendezvous at interval 5: median residual 0.0003
              nats and effective sample size 99.9% for OPM, against 0.059 nats and
              86% for the sum.
            </li>
            <li>
              A slow task given a fifth of the steps: final success 0.03 under
              multi-task RL, 0.01 under the periodic sum, 0.70 under OPM, from a
              start of 0.25. If it never trains: 0.01, 0.00 and 0.14, so OPM
              reduces the slow task’s loss in each round but does not remove it.
            </li>
          </ul>
        </details>

        {/* ============================================================ */}
        <details className="am-app" id="app-f">
          <summary>
            <h3>F. Main experimental setup</h3>
          </summary>
          <p>
            <span className="am-runin">Model.</span> MiMo-V2.6-Distill-Qwen-9B{' '}
            <Cite k="mimo2026" />, a 9.4B dense model with the Qwen3.5-9B
            architecture, already supervised-fine-tuned. Thinking is on in every
            domain with one chat template shared by all specialists and arms, so
            weights stay mergeable; earlier turns’ thinking is kept in agentic
            domains. The language-model head runs in fp32. The vision tower and
            multi-token-prediction head are excluded from merges and keep the
            anchor’s values.
          </p>
          <div className="am-table">
            <table>
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Training tasks</th>
                  <th>Verifier</th>
                  <th>Evaluation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Software engineering</td>
                  <td>MiMo-V2.6-RL-oss code split (2,602) and SWE-smith; 932 in the training pool</td>
                  <td>Executed tests in containers</td>
                  <td>SWE-rebench (93 tasks), SWE-bench Pro</td>
                </tr>
                <tr>
                  <td>Terminal</td>
                  <td>FACET-Terminal-Tasks-6k and MiMo terminal tasks (64); 203 in the training pool</td>
                  <td>Executed test scripts</td>
                  <td>Terminal-Bench 2.1, all 89 tasks, 5 trials</td>
                </tr>
                <tr>
                  <td>Cyber</td>
                  <td>MiMo-V2.6-RL-oss cyber split (1,000)</td>
                  <td>Crash reproduction</td>
                  <td>MiMo Cyber (mini), held out by project</td>
                </tr>
                <tr>
                  <td>Knowledge work</td>
                  <td>MiMo-V2.6-RL-oss general split (925 environments); 761 in the training pool</td>
                  <td>Per-environment checks plus an LLM rubric judge</td>
                  <td>GDPval-AA tasks (220), our own judge</td>
                </tr>
                <tr>
                  <td>Search</td>
                  <td>ASearcher training data over a local Wikipedia corpus</td>
                  <td>Answer match with aliases</td>
                  <td>BrowseComp-Plus (official settings, Qwen3-32B judge)</td>
                </tr>
                <tr>
                  <td>Tool use</td>
                  <td>WorkBench and EnterpriseOps-Gym (1,163 tasks)</td>
                  <td>Executable state checks, binary reward</td>
                  <td>τ²-Bench, BFCL v4 (non-agentic categories)</td>
                </tr>
                <tr>
                  <td>Math</td>
                  <td>Polaris and DAPO, filtered (61,404 problems)</td>
                  <td>Answer match</td>
                  <td>AIME26, HMMT Feb 26</td>
                </tr>
                <tr>
                  <td>Instruction following</td>
                  <td>The IF split of Wu et al. (2026)</td>
                  <td>Rule checkers</td>
                  <td>IFBench, IFEval</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            SWE-rebench tasks are those created after the Qwen3.5-9B base was
            released (February 2026); the distilled model we train was released
            later, so exposure through its distillation data cannot be ruled
            out. Evaluation tasks from repositories in our training pool are
            removed (110 to 93), training repositories are decontaminated
            against SWE-bench Verified and Pro, and one AIME26 duplicate is
            removed from DAPO. Terminal-Bench runs with network access as in
            the official harness. The
            held-out suite, on which no arm trains, is MMLU-Pro, GPQA and HLE (the older
            publicly available release, scored with the official judge prompt,
            not comparable to published HLE numbers).
            Single-turn benchmarks decode up to the official cap of 81,920 new
            tokens. Base scores are re-measured in our harnesses, with one fixed open
            harness per agentic domain for every arm. Knowledge work uses the 220
            GDPval-AA tasks, judged our own way, so the scores are not
            comparable to the Artificial Analysis leaderboard. Each arm produces
            its deliverable files in a port of their Stirrup harness, with web
            search through our own search API. One judge, Claude Haiku 5.5, scores each deliverable against
            its rubric and compares deliverables pairwise; we report the rubric
            score, a Bradley–Terry Elo with the base model at 1000, and the
            head-to-head win rate between arms, with intervals bootstrapped over
            tasks. On the gold deliverables it agrees with Claude Opus 5 on 94%
            of rubric criteria (κ = 0.82) and is the stricter of the two. The
            judge is a closed-API model, which limits reproducibility.
          </p>
          <p>
            <span className="am-runin">Shared RL recipe.</span> slime, run
            asynchronously with a fixed staleness per domain (4 for math and
            instruction following, 3 for search, 2 for tool use, 8 for the other
            agentic domains), the same in every arm. GRPO with groups of 16 (8 for agentic domains) <Cite k="shao2024" />: advantage is
            reward minus the group mean with no standard-deviation normalisation,
            a global token-mean loss, a REINFORCE-style objective with one
            optimizer step per rollout batch (so the PPO ratio is 1 and clipping
            is inactive), score centering, train–inference
            mismatch masking with IcePop <Cite k="ling2025" />, zero-variance
            groups dropped, no entropy bonus, no KL penalty.
            Environment-observation tokens are masked out of the loss, the drift
            KL and the Fisher.
          </p>
          <div className="am-table">
            <table>
              <thead>
                <tr>
                  <th>Domain</th>
                  <th className="am-num">Max response / turn</th>
                  <th className="am-num">Max turns</th>
                  <th className="am-num">Max context</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Math</td>
                  <td className="am-num">32k</td>
                  <td className="am-num">1</td>
                  <td className="am-num">–</td>
                </tr>
                <tr>
                  <td>Instruction following</td>
                  <td className="am-num">16k</td>
                  <td className="am-num">1</td>
                  <td className="am-num">–</td>
                </tr>
                <tr>
                  <td>Tool use</td>
                  <td className="am-num">8k</td>
                  <td className="am-num">40</td>
                  <td className="am-num">64k</td>
                </tr>
                <tr>
                  <td>Search</td>
                  <td className="am-num">8k</td>
                  <td className="am-num">24</td>
                  <td className="am-num">64k</td>
                </tr>
                <tr>
                  <td>Software engineering</td>
                  <td className="am-num">8k</td>
                  <td className="am-num">100</td>
                  <td className="am-num">128k</td>
                </tr>
                <tr>
                  <td>Terminal</td>
                  <td className="am-num">8k</td>
                  <td className="am-num">150</td>
                  <td className="am-num">128k</td>
                </tr>
                <tr>
                  <td>Cyber</td>
                  <td className="am-num">8k</td>
                  <td className="am-num">100</td>
                  <td className="am-num">128k</td>
                </tr>
                <tr>
                  <td>Knowledge work</td>
                  <td className="am-num">8k</td>
                  <td className="am-num">100</td>
                  <td className="am-num">128k</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <span className="am-runin">Budget.</span> Steps per domain: math
            and instruction following 300, tool use and search 200, software
            engineering and knowledge work 110, cyber 80, terminal 60. A step
            trains on 32 accepted groups (zero-variance groups do not count) of
            16 rollouts for math and instruction following and 8 for agentic
            domains. These define the per-domain rollout budget every arm
            matches; multi-task RL runs 200 steps and covers the same fraction
            of every domain’s budget at each step. Learning rates were swept
            over <Tex>{T`\{1,2,4\}\times10^{-6}`}</Tex> on math, instruction
            following, search and tool use (giving 4, 4, 1 and{' '}
            <Tex tail=";">{T`4\times10^{-6}`}</Tex> the other four domains use{' '}
            <Tex tail=",">{T`2\times10^{-6}`}</Tex> and multi-task RL and MOPD{' '}
            <Tex tail=".">{T`4\times10^{-6}`}</Tex> One seed per arm (seed 1).
          </p>
          <p>
            <span className="am-runin">Arms.</span> A1 multi-task RL: per-domain
            rollout quotas matched to the budget, uniform gradient weights per
            domain through a ledger rule, deficit scheduling, and rollouts that
            miss a short-batch deadline carried over to the next step. A2
            merge-after: the best of task arithmetic at{' '}
            <Tex>{T`\lambda\in\{0.4,0.6,0.8,1.0\}`}</Tex> chosen on held-out
            reward, DARE-TA, TIES, the closed form of <CiteT k="liu2026" /> and a
            one-shot OPM merge. A3 MOPD: per-token advantage teacher minus student
            log-probability, clipped to ±5, 50 steps of 1,024 prompts with one
            rollout each; student rollouts count toward the budget. A4 OPM: eight trainers, drift measured on about one rollout in
            eight, a per-token ceiling, the Fisher on the first 2,048 action
            tokens of each rollout, blocking rendezvous, and the guarded merge
            with five Jacobi-preconditioned CG iterations from the sum, a
            central finite-difference logit step of 0.03,{' '}
            <Tex>{T`\gamma\in\{0,\tfrac12,1\}`}</Tex> on held-out true KL,
            and a check of every trainer’s held-out residual against its
            ceiling. Groups sampled entirely by the pre-merge weights are
            dropped. A trainer that finishes its budget stays in later merges
            with its final weights.
          </p>
          <p>
            <span className="am-runin">Metrics.</span> Per benchmark, the score
            with its uncertainty over tasks and samples; no average across
            domains is reported. Cost from one shared ledger:
            GPU-hours including teacher scoring and merges, wall-clock, rollouts
            per domain. Secondary: the held-out suite, a cross-domain matrix (each
            arm and specialist on every domain), response length, entropy,
            thinking leakage, tool-call validity, and OPM’s per-rendezvous
            diagnostics.
          </p>
          <Placeholder label="Table F1" status="pending main runs">
            <p>
              Secondary benchmarks per domain (SWE-bench Pro, HMMT Feb 26, IFEval,
              BFCL v4 non-agentic) and the held-out suite (MMLU-Pro, GPQA-Diamond,
              HLE) for base, specialists and A1–A4, seed 1, and final-step math
              scores for every arm. Base so far: IFEval 67.0, BFCL v4 60.9 ± 1.8,
              MMLU-Pro 75.7, GPQA-Diamond 65.5, HLE 3.0 ± 0.8.
            </p>
          </Placeholder>

        </details>

        {/* ============================================================ */}
        <details className="am-app" id="app-g">
          <summary>
            <h3>G. Secondary findings in detail</h3>
          </summary>
          <p>
            <span className="am-runin">Near-orthogonal updates still interfere.</span> At
            4B, global cosines between task vectors are at most 0.022 and mostly
            below 0.002, yet the off-diagonal interference index has median 0.122
            and maximum 1.78 (<a className="am-ref" href="#app-d">Appendix D</a>). Directions along the specialists’
            updates carry 5,800 times the Fisher curvature of random directions of
            the same norm. Interference between two domains depends on the overlap
            of their Fishers, which cosines do not measure; the coupling table of{' '}
            <a className="am-ref" href="#app-b-2">B.2</a> gives this overlap.
          </p>
          <p>
            <span className="am-runin">Apparent sparsity comes from bf16 rounding.</span> On
            layer-16 tensors of the 4B specialists, task vectors have{' '}
            <Tex>{T`\|\tau\|/\|\theta\|\approx7\times10^{-4}`}</Tex> per layer and
            a median entry of about <Tex tail=",">{T`1.1\times10^{-5}`}</Tex>{' '}
            about <Tex>{T`2^{-11}`}</Tex> relative to the weights, which equals the
            rounding step of TF32. In fp32, 99.996% of entries are nonzero. After
            bf16 rounding only 18% are, the rounded task vector has cosine 0.57
            with the true one, and its relative L2 error is 84%. The layer-16
            cosines of <CiteT k="wu2026" /> reproduce exactly (math–science
            0.0217, math–code 0.0103), so the near-orthogonality holds in fp32,
            while the sparsity appears only after bf16 rounding. Building the merge from bf16 checkpoints instead of
            fp32 raises the median off-diagonal interference from 0.122 to 0.14
            and the maximum from 1.78 to 2.51.
          </p>
          <p>
            <span className="am-runin">The bf16 floor.</span> The KL between an
            fp32 specialist and its own bf16 cast, as a fraction of its drift from
            the base: math 0.276, science 0.248, code 0.314, IF 0.247, agent
            0.403. Deploying the OPM merge in fp32 adds 1.30 ± 0.34 points on the
            eight-benchmark mean, mostly
            on AIME, GPQA and LiveCodeBench. Whether fp32 deployment favours the
            OPM merge specifically is open, because the sum was not evaluated in
            fp32. Merges, residuals and triggers must be computed in true fp32;
            TF32 rounds away perturbations at the <Tex>{T`2^{-11}`}</Tex>{' '}
            level.
          </p>
          <p>
            <span className="am-runin">KL residual and reward loss differ.</span> The
            sum has the largest residual (1.19 of drift in-sample, up to 3.09 on
            code) and the best one-shot mean among bf16 merges. By Lemma 2 the return change is the
            reward-weighted log-ratio plus at most the KL; to first order{' '}
            <Tex tail=",">{T`\rho\sigma\sqrt{2\varepsilon}`}</Tex> with the
            reward–log-ratio correlation <Tex>{T`\rho`}</Tex> estimated at 0.1–0.3
            here. The residual bounds how much of a specialist’s own behaviour is
            lost. Minimising it is an appropriate objective when domains conflict
            and an inappropriate one when they help each other.
          </p>
          <p>
            <span className="am-runin">When the sum beats OPM.</span> In the
            regime map of <a className="am-ref" href="#app-b-8">B.8</a>, aligned overlap with <Tex>{T`C_j>0`}</Tex> favours
            the sum. One-shot at 4B, the reasoning domains are in that regime and
            IF and agent in the low-visibility one, where the sum and the OPM
            merge tie; so the sum is the best one-shot merge at equal (bf16)
            precision. The same release also shows the
            conflicting regime outside the merge: in their evaluation, the IF
            specialist trained alone lowers BFCL from 63.9 to 54.1, and the agent and code specialists lose
            about 2 points on AIME25 <Cite k="wu2026" />. <a className="am-ref" href="#table-6">Table 6</a>{' '}
            will show which regime each of the eight main domains is in.
          </p>
          <p>
            <span className="am-runin">A stale Fisher matches the on-policy one in a single merge.</span> A
            Fisher from base-model rollouts gives a worse residual (0.38 vs 0.31
            held-out) but the same benchmark mean (−0.22 ± 0.31). In the toy, a
            metric that was never refreshed scored much lower (0.13 against 0.96)
            because it was used across many rounds. A single merge therefore does
            not distinguish the stale metric from the fresh one.
          </p>
        </details>

        {/* ============================================================ */}
        <details className="am-app" id="app-h">
          <summary>
            <h3>H. Extended related work</h3>
          </summary>
          <p>
            <span className="am-runin">The objective and the loop.</span> Distral
            shares a distilled policy across tasks and regularises each task
            policy toward it by KL <Cite k="teh2017" />. Divide-and-Conquer RL
            trains one policy per context, periodically distils them into a
            central policy on their own trajectories, and resets them to it{' '}
            <Cite k="ghosh2018" />. This solves objective (1) by gradient
            descent at a fixed interval, so the barycenter objective comes from
            their work.
            Policy distillation compresses several task policies into one network{' '}
            <Cite k="rusu2016" />. OPM replaces distillation by its closed form in
            one shared network, and adds the KL trigger and the coupling theory.
            Co-Evolving Policy Distillation runs per-domain GRPO branches that
            distil into each other during training and merges them at the end{' '}
            <Cite k="gu2026" />. WARP runs parallel RLHF policies with a moving
            EMA anchor, merges them by spherical interpolation and re-initialises,
            for one task and on a fixed schedule <Cite k="rame2024" />.
          </p>
          <p>
            <span className="am-runin">The merge rule.</span> Fisher-weighted
            averaging <Cite k="matena2022" />, RegMean’s layer-wise Gram solve{' '}
            <Cite k="jin2023" /> and MaTS, which solves the same system with
            conjugate gradient <Cite k="tam2024" />, are applied once to finished
            supervised models with diagonal, layer or empirical Fishers, for which
            the gradient need not lie in the Fisher’s range. FedFish derives a
            function-space average and applies it each round in supervised
            federated learning <Cite k="dhawan2024" />. <CiteT k="liu2026" /> show
            that MOPD is Fisher merging to second order; <a className="am-ref" href="#app-b-7">B.7</a> adds the lossless
            statement and which Fisher to use. M2A merges a math task vector into a
            software agent only along the null space of agent-critical activations{' '}
            <Cite k="wang2026b" />, which applies the idea behind <a className="am-ref" href="#thm-1">Theorem 1</a>{' '}
            once.
          </p>
          <p>
            <span className="am-runin">Combining RL domains.</span> Controlled
            comparisons of mixing, merging and distillation at small scale find
            them within a few points of each other, with the ordering depending on
            budget and benchmark <Cite k={['wang2026a', 'wu2026']} />. Cascade RL
            trains domains in sequence <Cite k={['wang2025', 'yang2026']} />.
            Frontier reports train specialists and consolidate by on-policy
            distillation <Cite k={['deepseek2026', 'kimi2026', 'ma2026']} />,
            building on on-policy distillation of language models{' '}
            <Cite k={['agarwal2024', 'lu2025']} />; MiMo-V2.6 runs mixed RL
            followed by multi-teacher distillation <Cite k="mimo2026" />.
          </p>
          <p>
            <span className="am-runin">Federated and local optimisation.</span>{' '}
            Periodic averaging of local trainers is federated averaging and DiLoCo{' '}
            <Cite k={['mcmahan2017', 'douillard2023']} />; its bias under
            heterogeneous clients is client drift, addressed by proximal terms,
            control variates and normalised averaging{' '}
            <Cite k={['li2020', 'karimireddy2020', 'wang2020']} />. For log-linear
            policies (<Tex tail=")">{T`M=0`}</Tex> OPM has no drift bias; otherwise
            lossless rounds still leave a floor proportional to{' '}
            <Tex>{T`M(1+n\kappa_c)^2\eta KG^2`}</Tex> (<a className="am-ref" href="#app-b-4">B.4</a>). Federated natural policy
            gradient for multi-task RL aggregates natural gradients for a common
            objective <Cite k="yang2023" />; the tabular reduction in <a className="am-ref" href="#app-b-3">B.3</a> shows
            why the multi-task Fisher is needed in place of an average of
            directions when domains visit different states. Federated GRPO with plain
            averaging fell below local-only training under non-IID data{' '}
            <Cite k="guo2026" />. FedKL penalises KL to the global policy{' '}
            <Cite k="xie2023" />. Synchronising when models diverge, instead of on a
            fixed schedule, has been used with parameter distance in supervised
            decentralised training <Cite k="kamp2018" />; we know of no use of
            trajectory KL to trigger a weight merge.
          </p>
          <p>
            <span className="am-runin">Policy optimisation.</span> The natural
            policy gradient <Cite k="kakade2001" /> and trust-region policy
            optimisation <Cite k="schulman2015" /> are the source of the Fisher geometry; the return
            bound of <a className="am-ref" href="#app-b-6">B.6</a> is the standard trust-region argument applied to a merge
            residual. Because of the limitations of the empirical Fisher{' '}
            <Cite k="kunstner2019" />, we compute the metric on the trainer’s own
            samples.
          </p>
        </details>
      </div>
    </>
  )
}
