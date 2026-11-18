import * as React from 'react'
import { Fragment } from 'react'

// Bibliography for the post, taken from the paper's refs.bib (arXiv version).
// `cite` is the author short form shown in the sidenotes and by CiteT.

export interface RefEntry {
  cite: string
  year: string
  title: string
  text: string
  url: string
}

export const REFS: Record<string, RefEntry> = {
  "sun2026ale": {
    cite: "Sun et al.",
    year: "2026",
    title: "Agents' Last Exam",
    text: "Yiyou Sun, Xinyang Han, Weichen Zhang, et al. Agents' Last Exam. arXiv:2606.05405, 2026.",
    url: "https://arxiv.org/abs/2606.05405",
  },
  "rli2025": {
    cite: "Mazeika et al.",
    year: "2025",
    title: "Remote Labor Index: Measuring AI Automation of Remote Work",
    text: "Mantas Mazeika, Alice Gatti, Cristina Menghini, et al. Remote Labor Index: Measuring AI Automation of Remote Work. arXiv:2510.26787, 2025.",
    url: "https://arxiv.org/abs/2510.26787",
  },
  "timelinebench2026": {
    cite: "Gupta et al.",
    year: "2026",
    title: "Timeline-Bench: Evaluating Agents on Realistic Video-Editing Tasks, from Raw Footage to Final Cut",
    text: "Gunin Gupta, Nirmit Arora, Pavan Kalyan Tankala. Timeline-Bench: Evaluating Agents on Realistic Video-Editing Tasks, from Raw Footage to Final Cut. arXiv:2609.35143, 2026.",
    url: "https://arxiv.org/abs/2609.35143",
  },
  "edabench2026": {
    cite: "Saini",
    year: "2026",
    title: "EDA Bench: An Execution-Based Benchmark for Language Model Agents on Functional PCB Construction",
    text: "Dhruv Saini. EDA Bench: An Execution-Based Benchmark for Language Model Agents on Functional PCB Construction. alphaXiv preprint, 2026.",
    url: "https://www.alphaxiv.org/",
  },
  "osworldscience2026": {
    cite: "Dai et al.",
    year: "2026",
    title: "OSWorld-Science: A Benchmark of Computer Use Agents for Learning and Using Scientific Software",
    text: "Dingyuan Dai, Heli Qi, Lei Liu, et al. OSWorld-Science: A Benchmark of Computer Use Agents for Learning and Using Scientific Software. arXiv:2609.39903, 2026.",
    url: "https://arxiv.org/abs/2609.39903",
  },
  "scienceboard2026": {
    cite: "Sun et al.",
    year: "2026b",
    title: "ScienceBoard: Evaluating Multimodal Autonomous Agents in Realistic Scientific Workflows",
    text: "Qiushi Sun, Zhoumianze Liu, Chang Ma, et al. ScienceBoard: Evaluating Multimodal Autonomous Agents in Realistic Scientific Workflows. ICLR 2026. arXiv:2505.19897.",
    url: "https://arxiv.org/abs/2505.19897",
  },
  "blenderworld2026": {
    cite: "Fang et al.",
    year: "2026",
    title: "BlenderWorld: Benchmarking Visual Agents for 3D Creation from Real-World References",
    text: "Xinyu Fang, Yuchi Wang, Weihao Yu, et al. BlenderWorld: Benchmarking Visual Agents for 3D Creation from Real-World References. arXiv:2610.23986, 2026.",
    url: "https://arxiv.org/abs/2610.23986",
  },
  "cadbench2026": {
    cite: "Chen et al.",
    year: "2026",
    title: "Parametric CAD Bench v3: Evaluating Agentic Parametric CAD Authoring from Text and Engineering Drawings",
    text: "Mei Chen, Yu Xia, Haipeng Mao. Parametric CAD Bench v3: Evaluating Agentic Parametric CAD Authoring from Text and Engineering Drawings. arXiv:2611.02659, 2026.",
    url: "https://arxiv.org/abs/2611.02659",
  },
  "gymanything2026": {
    cite: "Aggarwal et al.",
    year: "2026",
    title: "Gym-Anything: Turn any Software into an Agent Environment",
    text: "Pranjal Aggarwal, Graham Neubig, Sean Welleck. Gym-Anything: Turn any Software into an Agent Environment. arXiv:2604.06126, 2026.",
    url: "https://arxiv.org/abs/2604.06126",
  },
  "cuagym2026": {
    cite: "Wang et al.",
    year: "2026",
    title: "CUA-Gym: Scaling Verifiable Training Environments and Tasks for Computer-Use Agents",
    text: "Bowen Wang, Dunjie Lu, Junli Wang, et al. CUA-Gym: Scaling Verifiable Training Environments and Tasks for Computer-Use Agents. 2026.",
    url: "/blog/introducing-cua-gym",
  },
  "swesmith2025": {
    cite: "Yang et al.",
    year: "2025",
    title: "SWE-smith: Scaling Data for Software Engineering Agents",
    text: "John Yang, Kilian Lieret, Carlos E. Jimenez, et al. SWE-smith: Scaling Data for Software Engineering Agents. arXiv:2504.21798, 2025.",
    url: "https://arxiv.org/abs/2504.21798",
  },
  "swegym2025": {
    cite: "Pan et al.",
    year: "2025",
    title: "Training Software Engineering Agents and Verifiers with SWE-Gym",
    text: "Jiayi Pan, Xingyao Wang, Graham Neubig, et al. Training Software Engineering Agents and Verifiers with SWE-Gym. arXiv:2412.21139, 2025.",
    url: "https://arxiv.org/abs/2412.21139",
  },
  "r2egym2025": {
    cite: "Jain et al.",
    year: "2025",
    title: "R2E-Gym: Procedural Environments and Hybrid Verifiers for Scaling Open-Weights SWE Agents",
    text: "Naman Jain, Jaskirat Singh, Manish Shetty, et al. R2E-Gym: Procedural Environments and Hybrid Verifiers for Scaling Open-Weights SWE Agents. arXiv:2504.07164, 2025.",
    url: "https://arxiv.org/abs/2504.07164",
  },
  "gdpval2025": {
    cite: "Patwardhan et al.",
    year: "2025",
    title: "GDPval: Evaluating AI Model Performance on Real-World Economically Valuable Tasks",
    text: "Tejal Patwardhan, Rachel Dias, Elizabeth Proehl, et al. GDPval: Evaluating AI Model Performance on Real-World Economically Valuable Tasks. arXiv:2510.04374, 2025.",
    url: "https://arxiv.org/abs/2510.04374",
  },
  "osworld2024": {
    cite: "Xie et al.",
    year: "2024",
    title: "OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments",
    text: "Tianbao Xie, Danyang Zhang, Jixuan Chen, et al. OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments. NeurIPS 2024. arXiv:2404.07972.",
    url: "https://arxiv.org/abs/2404.07972",
  },
  "webarena2024": {
    cite: "Zhou et al.",
    year: "2024",
    title: "WebArena: A Realistic Web Environment for Building Autonomous Agents",
    text: "Shuyan Zhou, Frank F. Xu, Hao Zhu, et al. WebArena: A Realistic Web Environment for Building Autonomous Agents. ICLR 2024. arXiv:2307.13854.",
    url: "https://arxiv.org/abs/2307.13854",
  },
  "theagentcompany2024": {
    cite: "Xu et al.",
    year: "2024",
    title: "TheAgentCompany: Benchmarking LLM Agents on Consequential Real World Tasks",
    text: "Frank F. Xu, Yufan Song, Boxuan Li, et al. TheAgentCompany: Benchmarking LLM Agents on Consequential Real World Tasks. arXiv:2412.14161, 2024.",
    url: "https://arxiv.org/abs/2412.14161",
  },
  "mind2web2023": {
    cite: "Deng et al.",
    year: "2023",
    title: "Mind2Web: Towards a Generalist Agent for the Web",
    text: "Xiang Deng, Yu Gu, Boyuan Zheng, et al. Mind2Web: Towards a Generalist Agent for the Web. NeurIPS 2023. arXiv:2306.06070.",
    url: "https://arxiv.org/abs/2306.06070",
  },
  "opencua2025": {
    cite: "Wang et al.",
    year: "2025",
    title: "OpenCUA: Open Foundations for Computer-Use Agents",
    text: "Xinyuan Wang, Bowen Wang, Dunjie Lu, et al. OpenCUA: Open Foundations for Computer-Use Agents. arXiv:2508.09123, 2025.",
    url: "https://arxiv.org/abs/2508.09123",
  },
  "agenttrek2025": {
    cite: "Xu et al.",
    year: "2025",
    title: "AgentTrek: Agent Trajectory Synthesis via Guiding Replay with Web Tutorials",
    text: "Yiheng Xu, Dunjie Lu, Zhennan Shen, et al. AgentTrek: Agent Trajectory Synthesis via Guiding Replay with Web Tutorials. arXiv:2412.09605, 2025.",
    url: "https://arxiv.org/abs/2412.09605",
  },
  "videoagenttrek2025": {
    cite: "Lu et al.",
    year: "2025",
    title: "VideoAgentTrek: Computer Use Pretraining from Unlabeled Videos",
    text: "Dunjie Lu, Yiheng Xu, Junli Wang, et al. VideoAgentTrek: Computer Use Pretraining from Unlabeled Videos. arXiv:2510.19488, 2025.",
    url: "https://arxiv.org/abs/2510.19488",
  },
  "misscore2026": {
    cite: "Dong et al.",
    year: "2026",
    title: "How Benchmarks Mis-Score Computer-Use Agents",
    text: "Zihan Dong, Zhiyuan Ma, Zekun Wang, et al. How Benchmarks Mis-Score Computer-Use Agents. arXiv:2607.28367, 2026.",
    url: "https://arxiv.org/abs/2607.28367",
  },
  "osworld2_2026": {
    cite: "Yuan et al.",
    year: "2026",
    title: "OSWorld 2.0: Benchmarking Computer Use Agents on Long-Horizon Real-World Tasks",
    text: "Mengqi Yuan, Zilong Zhou, Xinzhuang Xiong, et al. OSWorld 2.0: Benchmarking Computer Use Agents on Long-Horizon Real-World Tasks. arXiv:2606.29537, 2026.",
    url: "https://arxiv.org/abs/2606.29537",
  },
  "deskcraft2026": {
    cite: "Wang et al.",
    year: "2026b",
    title: "DeskCraft: Benchmarking Desktop Agents on Professional Workflows and Human-in-the-Loop Collaboration",
    text: "Wenkai Wang, Tao Xiong, Jingchen Ni, et al. DeskCraft: Benchmarking Desktop Agents on Professional Workflows and Human-in-the-Loop Collaboration. arXiv:2606.03103, 2026.",
    url: "https://arxiv.org/abs/2606.03103",
  },
  "apexagents2026": {
    cite: "Vidgen et al.",
    year: "2026",
    title: "APEX-Agents",
    text: "Bertie Vidgen, Austin Mann, Abby Fennelly, et al. APEX-Agents. arXiv:2601.14242, 2026.",
    url: "https://arxiv.org/abs/2601.14242",
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
