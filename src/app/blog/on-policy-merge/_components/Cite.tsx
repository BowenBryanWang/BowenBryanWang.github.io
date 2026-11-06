import * as React from 'react'
import { Fragment } from 'react'

// Bibliography for the post. Each entry was checked against the arXiv
// listing or the publisher page (authors, title, venue, year, identifier).
// `cite` is the author short form shown in the sidenotes and by CiteT.

export interface RefEntry {
  cite: string
  year: string
  title: string
  text: string
  url: string
}

export const REFS: Record<string, RefEntry> = {
  agarwal2021: {
    cite: 'Agarwal et al.',
    year: '2021',
    title: 'On the Theory of Policy Gradient Methods: Optimality, Approximation, and Distribution Shift',
    text: 'Alekh Agarwal, Sham M. Kakade, Jason D. Lee, Gaurav Mahajan. On the Theory of Policy Gradient Methods: Optimality, Approximation, and Distribution Shift. Journal of Machine Learning Research 22(98), 2021. arXiv:1908.00261.',
    url: 'https://arxiv.org/abs/1908.00261',
  },
  agarwal2024: {
    cite: 'Agarwal et al.',
    year: '2024',
    title: 'On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes',
    text: 'Rishabh Agarwal, Nino Vieillard, Yongchao Zhou, Piotr Stanczyk, Sabela Ramos, Matthieu Geist, Olivier Bachem. On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes. ICLR 2024. arXiv:2306.13649.',
    url: 'https://arxiv.org/abs/2306.13649',
  },
  deepseek2026: {
    cite: 'DeepSeek-AI',
    year: '2026',
    title: 'DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence',
    text: 'DeepSeek-AI. DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence. arXiv:2606.19348, 2026.',
    url: 'https://arxiv.org/abs/2606.19348',
  },
  dhawan2024: {
    cite: 'Dhawan et al.',
    year: '2024',
    title: 'Leveraging Function Space Aggregation for Federated Learning at Scale',
    text: 'Nikita Dhawan, Nicole Mitchell, Zachary Charles, Zachary Garrett, Gintare Karolina Dziugaite. Leveraging Function Space Aggregation for Federated Learning at Scale. Transactions on Machine Learning Research, 2024. arXiv:2311.10291.',
    url: 'https://arxiv.org/abs/2311.10291',
  },
  douillard2023: {
    cite: 'Douillard et al.',
    year: '2023',
    title: 'DiLoCo: Distributed Low-Communication Training of Language Models',
    text: 'Arthur Douillard, Qixuan Feng, Andrei A. Rusu, Rachita Chhaparia, Yani Donchev, Adhiguna Kuncoro, Marc’Aurelio Ranzato, Arthur Szlam, Jiajun Shen. DiLoCo: Distributed Low-Communication Training of Language Models. arXiv:2311.08105, 2023.',
    url: 'https://arxiv.org/abs/2311.08105',
  },
  ghosh2018: {
    cite: 'Ghosh et al.',
    year: '2018',
    title: 'Divide-and-Conquer Reinforcement Learning',
    text: 'Dibya Ghosh, Avi Singh, Aravind Rajeswaran, Vikash Kumar, Sergey Levine. Divide-and-Conquer Reinforcement Learning. ICLR 2018. arXiv:1711.09874.',
    url: 'https://arxiv.org/abs/1711.09874',
  },
  gu2026: {
    cite: 'Gu et al.',
    year: '2026',
    title: 'Co-Evolving Policy Distillation',
    text: 'Naibin Gu, Chenxu Yang, Qingyi Si, Chuanyu Qin, Dingyu Yao, Peng Fu, Zheng Lin, Weiping Wang, Nan Duan, Jiaqi Wang. Co-Evolving Policy Distillation. arXiv:2604.27083, 2026.',
    url: 'https://arxiv.org/abs/2604.27083',
  },
  guo2026: {
    cite: 'Guo et al.',
    year: '2026',
    title: 'Fed-GRPO: Reward-Signal-Driven Federated Group Relative Policy Optimization',
    text: 'Pengxin Guo, Shuang Zeng, Zonggen Li, Weiying Zheng, Mengting Liu, Liangqiong Qu. Fed-GRPO: Reward-Signal-Driven Federated Group Relative Policy Optimization. arXiv:2610.11502, 2026.',
    url: 'https://arxiv.org/abs/2610.11502',
  },
  ilharco2023: {
    cite: 'Ilharco et al.',
    year: '2023',
    title: 'Editing Models with Task Arithmetic',
    text: 'Gabriel Ilharco, Marco Tulio Ribeiro, Mitchell Wortsman, Suchin Gururangan, Ludwig Schmidt, Hannaneh Hajishirzi, Ali Farhadi. Editing Models with Task Arithmetic. ICLR 2023. arXiv:2212.04089.',
    url: 'https://arxiv.org/abs/2212.04089',
  },
  jin2023: {
    cite: 'Jin et al.',
    year: '2023',
    title: 'Dataless Knowledge Fusion by Merging Weights of Language Models',
    text: 'Xisen Jin, Xiang Ren, Daniel Preotiuc-Pietro, Pengxiang Cheng. Dataless Knowledge Fusion by Merging Weights of Language Models. ICLR 2023. arXiv:2212.09849.',
    url: 'https://arxiv.org/abs/2212.09849',
  },
  kakade2001: {
    cite: 'Kakade',
    year: '2001',
    title: 'A Natural Policy Gradient',
    text: 'Sham M. Kakade. A Natural Policy Gradient. Advances in Neural Information Processing Systems 14 (NIPS 2001).',
    url: 'https://proceedings.neurips.cc/paper_files/paper/2001',
  },
  kamp2018: {
    cite: 'Kamp et al.',
    year: '2018',
    title: 'Efficient Decentralized Deep Learning by Dynamic Model Averaging',
    text: 'Michael Kamp, Linara Adilova, Joachim Sicking, Fabian Hüger, Peter Schlicht, Tim Wirtz, Stefan Wrobel. Efficient Decentralized Deep Learning by Dynamic Model Averaging. ECML PKDD 2018. arXiv:1807.03210.',
    url: 'https://arxiv.org/abs/1807.03210',
  },
  karimireddy2020: {
    cite: 'Karimireddy et al.',
    year: '2020',
    title: 'SCAFFOLD: Stochastic Controlled Averaging for Federated Learning',
    text: 'Sai Praneeth Karimireddy, Satyen Kale, Mehryar Mohri, Sashank J. Reddi, Sebastian U. Stich, Ananda Theertha Suresh. SCAFFOLD: Stochastic Controlled Averaging for Federated Learning. ICML 2020. arXiv:1910.06378.',
    url: 'https://arxiv.org/abs/1910.06378',
  },
  kimi2026: {
    cite: 'Kimi Team',
    year: '2026',
    title: 'Kimi K3: Open Frontier Intelligence',
    text: 'Kimi Team. Kimi K3: Open Frontier Intelligence. arXiv:2607.24653, 2026.',
    url: 'https://arxiv.org/abs/2607.24653',
  },
  kunstner2019: {
    cite: 'Kunstner et al.',
    year: '2019',
    title: 'Limitations of the Empirical Fisher Approximation for Natural Gradient Descent',
    text: 'Frederik Kunstner, Lukas Balles, Philipp Hennig. Limitations of the Empirical Fisher Approximation for Natural Gradient Descent. NeurIPS 2019. arXiv:1905.12558.',
    url: 'https://arxiv.org/abs/1905.12558',
  },
  li2020: {
    cite: 'Li et al.',
    year: '2020',
    title: 'Federated Optimization in Heterogeneous Networks',
    text: 'Tian Li, Anit Kumar Sahu, Manzil Zaheer, Maziar Sanjabi, Ameet Talwalkar, Virginia Smith. Federated Optimization in Heterogeneous Networks. MLSys 2020. arXiv:1812.06127.',
    url: 'https://arxiv.org/abs/1812.06127',
  },
  li2021: {
    cite: 'Li et al.',
    year: '2021',
    title: 'Softmax Policy Gradient Methods Can Take Exponential Time to Converge',
    text: 'Gen Li, Yuting Wei, Yuejie Chi, Yuxin Chen. Softmax Policy Gradient Methods Can Take Exponential Time to Converge. COLT 2021 (in part); Mathematical Programming, Series A. arXiv:2102.11270.',
    url: 'https://arxiv.org/abs/2102.11270',
  },
  ling2025: {
    cite: 'Ling Team',
    year: '2025',
    title: 'Every Step Evolves: Scaling Reinforcement Learning for Trillion-Scale Thinking Model',
    text: 'Ling Team. Every Step Evolves: Scaling Reinforcement Learning for Trillion-Scale Thinking Model. arXiv:2510.18855, 2025. (Introduces IcePop.)',
    url: 'https://arxiv.org/abs/2510.18855',
  },
  liu2026: {
    cite: 'Liu et al.',
    year: '2026',
    title: 'A Fisher-Geometric View of Multi-Teacher On-Policy Distillation',
    text: 'Kaiyuan Liu, Ziyuan Zhuang, Haoxuan Ma, Yannian Gu, Mingfei Song, Rongxiang Weng, Jieping Ye. A Fisher-Geometric View of Multi-Teacher On-Policy Distillation. arXiv:2610.26525, 2026.',
    url: 'https://arxiv.org/abs/2610.26525',
  },
  lu2025: {
    cite: 'Lu and Thinking Machines Lab',
    year: '2025',
    title: 'On-Policy Distillation',
    text: 'Kevin Lu and Thinking Machines Lab. On-Policy Distillation. Thinking Machines Lab: Connectionism, 2025. doi:10.64434/tml.20251026.',
    url: 'https://thinkingmachines.ai/blog/on-policy-distillation/',
  },
  ma2026: {
    cite: 'Ma et al.',
    year: '2026',
    title: 'MOPD: Multi-Teacher On-Policy Distillation for Capability Integration in LLM Post-Training',
    text: 'Wenhan Ma, Jianyu Wei, Liang Zhao, Hailin Zhang, Bangjun Xiao, Lei Li, Qibin Yang, Bofei Gao, Yudong Wang, Rang Li, Jinhao Dong, Zhifang Sui, Fuli Luo. MOPD: Multi-Teacher On-Policy Distillation for Capability Integration in LLM Post-Training. arXiv:2606.30406, 2026.',
    url: 'https://arxiv.org/abs/2606.30406',
  },
  martens2010: {
    cite: 'Martens',
    year: '2010',
    title: 'Deep Learning via Hessian-Free Optimization',
    text: 'James Martens. Deep Learning via Hessian-Free Optimization. ICML 2010.',
    url: 'https://www.cs.toronto.edu/~jmartens/docs/Deep_HessianFree.pdf',
  },
  matena2022: {
    cite: 'Matena and Raffel',
    year: '2022',
    title: 'Merging Models with Fisher-Weighted Averaging',
    text: 'Michael Matena, Colin Raffel. Merging Models with Fisher-Weighted Averaging. NeurIPS 2022. arXiv:2111.09832.',
    url: 'https://arxiv.org/abs/2111.09832',
  },
  mcmahan2017: {
    cite: 'McMahan et al.',
    year: '2017',
    title: 'Communication-Efficient Learning of Deep Networks from Decentralized Data',
    text: 'H. Brendan McMahan, Eider Moore, Daniel Ramage, Seth Hampson, Blaise Agüera y Arcas. Communication-Efficient Learning of Deep Networks from Decentralized Data. AISTATS 2017. arXiv:1602.05629.',
    url: 'https://arxiv.org/abs/1602.05629',
  },
  mimo2026: {
    cite: 'Xiaomi LLM-Core',
    year: '2026',
    title: 'MiMo-V2.6: Scaling Reinforcement Learning Towards Self-Improvement',
    text: 'LLM-Core Xiaomi. MiMo-V2.6: Scaling Reinforcement Learning Towards Self-Improvement. arXiv:2610.11959, 2026.',
    url: 'https://arxiv.org/abs/2610.11959',
  },
  rame2024: {
    cite: 'Ramé et al.',
    year: '2024',
    title: 'WARP: On the Benefits of Weight Averaged Rewarded Policies',
    text: 'Alexandre Ramé, Johan Ferret, Nino Vieillard, Robert Dadashi, Léonard Hussenot, Pierre-Louis Cedoz, Pier Giuseppe Sessa, Sertan Girgin, Arthur Douillard, Olivier Bachem. WARP: On the Benefits of Weight Averaged Rewarded Policies. arXiv:2406.16768, 2024.',
    url: 'https://arxiv.org/abs/2406.16768',
  },
  rusu2016: {
    cite: 'Rusu et al.',
    year: '2016',
    title: 'Policy Distillation',
    text: 'Andrei A. Rusu, Sergio Gomez Colmenarejo, Caglar Gulcehre, Guillaume Desjardins, James Kirkpatrick, Razvan Pascanu, Volodymyr Mnih, Koray Kavukcuoglu, Raia Hadsell. Policy Distillation. ICLR 2016. arXiv:1511.06295.',
    url: 'https://arxiv.org/abs/1511.06295',
  },
  schulman2015: {
    cite: 'Schulman et al.',
    year: '2015',
    title: 'Trust Region Policy Optimization',
    text: 'John Schulman, Sergey Levine, Philipp Moritz, Michael I. Jordan, Pieter Abbeel. Trust Region Policy Optimization. ICML 2015. arXiv:1502.05477.',
    url: 'https://arxiv.org/abs/1502.05477',
  },
  shao2024: {
    cite: 'Shao et al.',
    year: '2024',
    title: 'DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models',
    text: 'Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Xiao Bi, Haowei Zhang, Mingchuan Zhang, Y. K. Li, Y. Wu, Daya Guo. DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models. arXiv:2402.03300, 2024. (Introduces GRPO.)',
    url: 'https://arxiv.org/abs/2402.03300',
  },
  tam2024: {
    cite: 'Tam et al.',
    year: '2024',
    title: 'Merging by Matching Models in Task Parameter Subspaces',
    text: 'Derek Tam, Mohit Bansal, Colin Raffel. Merging by Matching Models in Task Parameter Subspaces. Transactions on Machine Learning Research, 2024. arXiv:2312.04339.',
    url: 'https://arxiv.org/abs/2312.04339',
  },
  teh2017: {
    cite: 'Teh et al.',
    year: '2017',
    title: 'Distral: Robust Multitask Reinforcement Learning',
    text: 'Yee Whye Teh, Victor Bapst, Wojciech Marian Czarnecki, John Quan, James Kirkpatrick, Raia Hadsell, Nicolas Heess, Razvan Pascanu. Distral: Robust Multitask Reinforcement Learning. NeurIPS 2017. arXiv:1707.04175.',
    url: 'https://arxiv.org/abs/1707.04175',
  },
  wang2020: {
    cite: 'Wang et al.',
    year: '2020',
    title: 'Tackling the Objective Inconsistency Problem in Heterogeneous Federated Optimization',
    text: 'Jianyu Wang, Qinghua Liu, Hao Liang, Gauri Joshi, H. Vincent Poor. Tackling the Objective Inconsistency Problem in Heterogeneous Federated Optimization. NeurIPS 2020. arXiv:2007.07481.',
    url: 'https://arxiv.org/abs/2007.07481',
  },
  wang2025: {
    cite: 'Wang et al.',
    year: '2025',
    title: 'Nemotron-Cascade: Scaling Cascaded Reinforcement Learning for General-Purpose Reasoning Models',
    text: 'Boxin Wang, Chankyu Lee, Nayeon Lee, Sheng-Chieh Lin, Wenliang Dai, Yang Chen, Yangyi Chen, Zhuolin Yang, Zihan Liu, Mohammad Shoeybi, Bryan Catanzaro, Wei Ping. Nemotron-Cascade: Scaling Cascaded Reinforcement Learning for General-Purpose Reasoning Models. arXiv:2512.13607, 2025.',
    url: 'https://arxiv.org/abs/2512.13607',
  },
  wang2026a: {
    cite: 'Wang et al.',
    year: '2026a',
    title: 'To Mix or To Merge: Toward Multi-Domain Reinforcement Learning for Large Language Models',
    text: 'Haoqing Wang, Xiang Long, Ziheng Li, Yilong Xu, Tingguang Li, Yehui Tang. To Mix or To Merge: Toward Multi-Domain Reinforcement Learning for Large Language Models. arXiv:2602.12566, 2026.',
    url: 'https://arxiv.org/abs/2602.12566',
  },
  wang2026b: {
    cite: 'Wang et al.',
    year: '2026b',
    title: 'M2A: Synergizing Mathematical and Agentic Reasoning in Large Language Models',
    text: 'Junjian Wang, Xin Zhou, Qiran Xu, Kun Zhan. M2A: Synergizing Mathematical and Agentic Reasoning in Large Language Models. arXiv:2605.09879, 2026.',
    url: 'https://arxiv.org/abs/2605.09879',
  },
  wu2026: {
    cite: 'Wu et al.',
    year: '2026',
    title: 'Consolidating RLVR Capabilities Across Domains: A Deep Dive into Fusion Paradigms',
    text: 'Siye Wu, Kai Yang, Yuchen Cai, Xin Xu, Peng-Yuan Wang, Jiaxuan Wang, Jiashun Liu, Jiafei Lyu, Yangkun Chen, Saiyong Yang, Yanghua Xiao. Consolidating RLVR Capabilities Across Domains: A Deep Dive into Fusion Paradigms. arXiv:2608.27409, 2026.',
    url: 'https://arxiv.org/abs/2608.27409',
  },
  xie2023: {
    cite: 'Xie and Song',
    year: '2023',
    title: 'FedKL: Tackling Data Heterogeneity in Federated Reinforcement Learning by Penalizing KL Divergence',
    text: 'Zhijie Xie, Shenghui Song. FedKL: Tackling Data Heterogeneity in Federated Reinforcement Learning by Penalizing KL Divergence. IEEE Journal on Selected Areas in Communications 41(4), 2023. arXiv:2204.08125.',
    url: 'https://arxiv.org/abs/2204.08125',
  },
  yadav2023: {
    cite: 'Yadav et al.',
    year: '2023',
    title: 'TIES-Merging: Resolving Interference When Merging Models',
    text: 'Prateek Yadav, Derek Tam, Leshem Choshen, Colin Raffel, Mohit Bansal. TIES-Merging: Resolving Interference When Merging Models. NeurIPS 2023. arXiv:2306.01708.',
    url: 'https://arxiv.org/abs/2306.01708',
  },
  yang2023: {
    cite: 'Yang et al.',
    year: '2023',
    title: 'Federated Natural Policy Gradient and Actor Critic Methods for Multi-task Reinforcement Learning',
    text: 'Tong Yang, Shicong Cen, Yuting Wei, Yuxin Chen, Yuejie Chi. Federated Natural Policy Gradient and Actor Critic Methods for Multi-task Reinforcement Learning. arXiv:2311.00201, 2023.',
    url: 'https://arxiv.org/abs/2311.00201',
  },
  yang2026: {
    cite: 'Yang et al.',
    year: '2026',
    title: 'Nemotron-Cascade 2: Post-Training LLMs with Cascade RL and Multi-Domain On-Policy Distillation',
    text: 'Zhuolin Yang, Zihan Liu, Yang Chen, Wenliang Dai, Boxin Wang, Sheng-Chieh Lin, et al. Nemotron-Cascade 2: Post-Training LLMs with Cascade RL and Multi-Domain On-Policy Distillation. arXiv:2603.19220, 2026.',
    url: 'https://arxiv.org/abs/2603.19220',
  },
  yu2024: {
    cite: 'Yu et al.',
    year: '2024',
    title: 'Language Models are Super Mario: Absorbing Abilities from Homologous Models as a Free Lunch',
    text: 'Le Yu, Bowen Yu, Haiyang Yu, Fei Huang, Yongbin Li. Language Models are Super Mario: Absorbing Abilities from Homologous Models as a Free Lunch. ICML 2024. arXiv:2311.03099.',
    url: 'https://arxiv.org/abs/2311.03099',
  },
}

function entry(k: string): RefEntry {
  const r = REFS[k]
  if (!r) throw new Error(`Unknown citation key: ${k}`)
  return r
}

// Numbering in order of first appearance. Server components render depth
// first in document order, so the first <Cite>/<CiteT> to ask for a key gets
// the next number and later citations of the same key reuse it. React's
// `cache` scopes the registry to one render (one request, or one page at
// build time).
type Registry = { order: Map<string, number>; noted: Set<string> }
const reactCache = (React as unknown as { cache?: <F>(fn: F) => F }).cache
let fallback: Registry | null = null
const getRegistry: () => Registry = reactCache
  ? reactCache(() => ({ order: new Map<string, number>(), noted: new Set<string>() }))
  : () => (fallback ??= { order: new Map<string, number>(), noted: new Set<string>() })

function numberOf(k: string): number {
  const { order } = getRegistry()
  let n = order.get(k)
  if (n === undefined) {
    n = order.size + 1
    order.set(k, n)
  }
  return n
}

/**
 * One superscript number and its sidenote. On wide screens the note sits in
 * the right margin level with its line (CSS, `.am-sn-note`): number, title
 * link, (authors, year). On narrow ones it is hidden and the number toggles
 * it open below the line with the full reference (authors, title, venue,
 * year). The checkbox makes the toggle work without client JavaScript.
 * There is no reference list; these notes are the bibliography.
 */
function Sidenote({ k }: { k: string }) {
  const r = entry(k)
  const n = numberOf(k)
  // The first note for a source carries its title; later ones are one short
  // line (number, authors, year) so dense passages do not overflow the margin.
  const { noted } = getRegistry()
  const repeat = noted.has(k)
  noted.add(k)
  const by = `${r.cite.replace(/\.$/, '')}, ${r.year}`
  // The full reference around the title (authors before, venue and year
  // after), shown in the narrow-screen note since there is no list at the end.
  const at = r.text.indexOf(r.title)
  const full =
    at >= 0
      ? { before: r.text.slice(0, at), after: r.text.slice(at + r.title.length) }
      : null
  return (
    <label className="am-sn">
      <input
        type="checkbox"
        className="am-sn-toggle"
        aria-label={`Reference ${n}: ${r.title}`}
      />
      <sup className="am-sn-num">{n}</sup>
      <span className={repeat ? 'am-sn-note am-sn-repeat' : 'am-sn-note'} role="note">
        <span className="am-sn-n">{n}.</span>{' '}
        {repeat && (
          <a className="am-sn-short" href={r.url} target="_blank" rel="noreferrer" title={r.title}>
            {by}
          </a>
        )}
        {full && <span className="am-sn-full">{full.before}</span>}
        <a className="am-sn-title" href={r.url} target="_blank" rel="noreferrer">
          {r.title}
        </a>
        {full && <span className="am-sn-full">{full.after}</span>}{' '}
        <span className="am-sn-by">({by})</span>
      </span>
    </label>
  )
}

/** Parenthetical citation: a superscript number per source, notes in the margin. */
export function Cite({ k }: { k: string | string[] }) {
  const keys = Array.isArray(k) ? k : [k]
  return (
    <span className="am-cite" data-cite="">
      {keys.map((key, i) => (
        <Fragment key={key}>
          {i > 0 ? <sup className="am-sn-sep">,</sup> : null}
          <Sidenote k={key} />
        </Fragment>
      ))}
    </span>
  )
}

/** Textual citation: the authors stay in the sentence, “Liu et al.³”. */
export function CiteT({ k }: { k: string }) {
  const r = entry(k)
  return (
    <span className="am-cite am-cite-t">
      {r.cite}
      <Sidenote k={k} />
    </span>
  )
}
