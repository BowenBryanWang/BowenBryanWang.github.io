import { AbsoluteFill, Img, staticFile } from '../../cua-gym/lib/remotion-shim'

const PALATINO =
  '"Palatino Linotype", "Palatino", "Book Antiqua", "URW Palladio L", Georgia, serif'
const MONO = 'Menlo, Monaco, "JetBrains Mono", "Cascadia Code", monospace'

const PAPER = '#F7F4ED'
const INK = '#1B1816'
const MUTED = '#5C5651'
const RULE = '#E0D8C5'
const OXBLOOD = '#862D1A'
const BLUE = '#2F5D7C'
const PURPLE = '#7651CF'

function Grid() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(to right, ${RULE} 1px, transparent 1px),
          linear-gradient(to bottom, ${RULE} 1px, transparent 1px)
        `,
        backgroundSize: '56px 56px',
        opacity: 0.46,
      }}
    />
  )
}

export function IndustrialTrainingSectionSlide() {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: PAPER,
        color: INK,
        fontFamily: PALATINO,
        overflow: 'hidden',
      }}
    >
      <Grid />
      <svg
        viewBox="0 0 1920 1080"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M 0 890 C 330 760, 650 1010, 980 875 S 1600 750, 1920 880" fill="none" stroke="#C9C0AB" strokeWidth={1.2} />
        <path d="M 0 950 C 300 1040, 590 820, 910 950 S 1620 1030, 1920 930" fill="none" stroke="#D5CCBB" strokeWidth={1} />
      </svg>

      <div style={{ position: 'absolute', left: 96, top: 90, fontFamily: MONO, fontSize: 25, letterSpacing: '0.1em', color: OXBLOOD, textTransform: 'uppercase' }}>
        Section III · Industry
      </div>
      <div style={{ position: 'absolute', left: 96, top: 350, right: 110 }}>
        <h1 style={{ margin: 0, maxWidth: 1660, fontSize: 116, lineHeight: 1.02, letterSpacing: '-0.025em', fontWeight: 600 }}>
          Industrial Computer-Use
          <br />
          Agent Training
        </h1>
        <p style={{ margin: '40px 0 0', fontSize: 42, lineHeight: 1.3, color: MUTED, maxWidth: 1400 }}>
          From frontier multimodal models to native computer-use foundations.
        </p>
      </div>
      <div style={{ position: 'absolute', left: 96, bottom: 86, fontFamily: MONO, fontSize: 23, color: MUTED }}>
        Foundation model work · Kimi × Qwen
      </div>
    </AbsoluteFill>
  )
}

export function WhatsNextSlide() {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: PAPER,
        color: INK,
        fontFamily: PALATINO,
        overflow: 'hidden',
      }}
    >
      <Grid />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 150,
            lineHeight: 1,
            letterSpacing: '-0.035em',
            fontWeight: 600,
          }}
        >
          What&apos;s Next?
        </h1>
      </div>
    </AbsoluteFill>
  )
}

export function NextChallengeSlide() {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: PAPER,
        color: INK,
        fontFamily: PALATINO,
        overflow: 'hidden',
      }}
    >
      <Grid />

      <div style={{ position: 'absolute', left: 88, top: 58, right: 88 }}>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: '0.08em', color: OXBLOOD, textTransform: 'uppercase' }}>
          The next challenge
        </div>
        <h1 style={{ margin: '12px 0 0', fontSize: 64, lineHeight: 1.04, letterSpacing: '-0.02em', fontWeight: 600 }}>
          The next frontier is finishing real work.
        </h1>
      </div>

      <div style={{ position: 'absolute', left: 88, top: 202, width: 1030 }}>
        <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: '0.06em', color: BLUE, textTransform: 'uppercase' }}>
          OSWorld 2.0 · Long-horizon execution
        </div>
        <Img
          src={staticFile('osworld-v2-challenge.png')}
          alt="OSWorld 2.0 long-horizon reimbursement workflow"
          style={{ width: 1030, height: 580, objectFit: 'contain', display: 'block', marginTop: 16, background: '#fff', border: `1px solid ${RULE}` }}
        />
        <div style={{ marginTop: 18, fontFamily: MONO, fontSize: 23, lineHeight: 1.35, color: BLUE }}>
          108 workflows · median 1.6 h · &gt;250 steps
        </div>
        <div style={{ marginTop: 5, fontSize: 25, lineHeight: 1.3, color: MUTED }}>
          Best binary completion: <span style={{ color: OXBLOOD, fontWeight: 700 }}>20.6%</span>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 1172, top: 202, width: 660, paddingLeft: 44, borderLeft: `1px solid ${RULE}` }}>
        <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: '0.06em', color: PURPLE, textTransform: 'uppercase' }}>
          Agents&apos; Last Exam · Professional breadth
        </div>
        <Img
          src={staticFile('agents-last-exam-taxonomy.webp')}
          alt="Agents' Last Exam professional task taxonomy"
          style={{ width: 616, height: 347, objectFit: 'cover', display: 'block', marginTop: 16, border: `1px solid ${RULE}` }}
        />
        <div style={{ display: 'flex', gap: 52, marginTop: 34 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 46, lineHeight: 1, fontWeight: 800, color: PURPLE }}>1K+</div>
            <div style={{ marginTop: 8, fontSize: 22, color: MUTED }}>real professional tasks</div>
          </div>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 46, lineHeight: 1, fontWeight: 800, color: PURPLE }}>55</div>
            <div style={{ marginTop: 8, fontSize: 22, color: MUTED }}>subfields · 13 industries</div>
          </div>
        </div>
        <div style={{ marginTop: 30, paddingTop: 24, borderTop: `1px solid ${RULE}` }}>
          <span style={{ fontFamily: MONO, fontSize: 42, lineHeight: 1, fontWeight: 800, color: OXBLOOD }}>2.6%</span>
          <span style={{ marginLeft: 18, fontSize: 23, color: MUTED }}>average pass rate on the hardest tier</span>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 88, right: 88, bottom: 54, borderTop: `2px solid ${OXBLOOD}`, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 31, lineHeight: 1.25, fontWeight: 600 }}>
          Maintain state. Adapt. Verify. Finish.
        </div>
        <div style={{ fontFamily: MONO, fontSize: 14, color: '#766F69' }}>
          Sources: osworld-v2.xlang.ai · agents-last-exam.org
        </div>
      </div>
    </AbsoluteFill>
  )
}

function Milestone({ left, top, label, date, metric, detail, tone, width = 250 }: {
  left: number
  top: number
  label: string
  date: string
  metric: string
  detail: string
  tone: string
  width?: number
}) {
  return (
    <div style={{ position: 'absolute', left, top, width }}>
      <div style={{ width: 18, height: 18, borderRadius: 99, background: tone, border: `4px solid ${PAPER}`, boxShadow: `0 0 0 2px ${tone}`, marginBottom: 20 }} />
      <div style={{ fontFamily: MONO, fontSize: 18, color: tone, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{date}</div>
      <div style={{ marginTop: 7, fontSize: 32, lineHeight: 1.05, fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 23, lineHeight: 1.15, fontWeight: 700, color: tone }}>{metric}</div>
      <div style={{ marginTop: 9, fontSize: 21, lineHeight: 1.22, color: MUTED }}>{detail}</div>
    </div>
  )
}

export function IndustrialFoundationTimelineSlide() {
  return (
    <AbsoluteFill style={{ backgroundColor: PAPER, color: INK, fontFamily: PALATINO, overflow: 'hidden' }}>
      <Grid />
      <div style={{ position: 'absolute', left: 88, top: 62, right: 88 }}>
        <div style={{ fontFamily: MONO, fontSize: 21, letterSpacing: '0.08em', color: OXBLOOD, textTransform: 'uppercase' }}>
          Industrial foundation models I contributed to
        </div>
        <h1 style={{ margin: '14px 0 0', fontSize: 62, lineHeight: 1.05, letterSpacing: '-0.018em', fontWeight: 600 }}>
          Scale, capability, and verified performance move together.
        </h1>
      </div>

      <div style={{ position: 'absolute', left: 88, top: 220, width: 1120, height: 760, borderRight: `1px solid ${RULE}` }}>
        <div style={{ position: 'absolute', left: 0, top: 56, fontFamily: MONO, fontSize: 25, fontWeight: 800, color: BLUE }}>KIMI</div>
        <div style={{ position: 'absolute', left: 118, top: 71, width: 860, height: 2, background: '#B9C8D1' }} />
        <Milestone left={128} top={49} label="K2.5" date="Jan 2026" metric="15T multimodal tokens" detail="Native vision + self-directed swarm: 100 agents, 1,500 tool calls." tone={BLUE} width={300} />
        <Milestone left={675} top={49} label="K3" date="Jul 2026" metric="2.8T · 1M context" detail="Long-horizon coding, visual creation, and expert workflows in one model." tone={BLUE} width={330} />

        <div style={{ position: 'absolute', left: 0, top: 410, fontFamily: MONO, fontSize: 25, fontWeight: 800, color: PURPLE }}>QWEN</div>
        <div style={{ position: 'absolute', left: 118, top: 425, width: 860, height: 2, background: '#C9BCE9' }} />
        <Milestone left={128} top={403} label="Qwen3.5" date="Feb 2026" metric="397B-A17B" detail="A native multimodal agent foundation for search, tools, building, and office work." tone={PURPLE} width={250} />
        <Milestone left={442} top={403} label="Qwen3.7" date="Jun 2026" metric="73.3 OSWorld-V" detail="A strong generalist GUI baseline, but long-horizon completion remains limited." tone={PURPLE} width={260} />
        <Milestone left={758} top={403} label="Qwen-CUA" date="Aug 2026" metric="86.2 → 87.6" detail="Native computer use; Max scales beyond 1T parameters." tone={PURPLE} width={270} />
      </div>

      <div style={{ position: 'absolute', left: 1248, top: 245, width: 590 }}>
        <div style={{ fontFamily: MONO, fontSize: 20, color: PURPLE, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Model scale raises the ceiling
        </div>
        <Img src={staticFile('qwen-cua-model-scaling.png')} alt="Qwen-CUA model scaling results" style={{ width: 590, height: 251, objectFit: 'contain', display: 'block', marginTop: 18, background: '#fff', border: `1px solid ${RULE}` }} />
        <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${RULE}` }}>
          <div style={{ fontSize: 29, lineHeight: 1.25, fontWeight: 600 }}>Qwen3.7 → Qwen-CUA</div>
          <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 45, fontWeight: 800, color: PURPLE }}>+12.9 pts</div>
          <div style={{ marginTop: 5, fontSize: 23, lineHeight: 1.3, color: MUTED }}>
            OSWorld-Verified, driven by 40K verifiable tasks and nearly 100K rollout vCPUs.
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 88, right: 88, bottom: 40, display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 14, color: '#766F69' }}>
        <span>Sources: kimi.com/blog/kimi-k2-5 · kimi.com/ai-models/kimi-k3 · qwen.ai/blog?id=qwen3.5</span>
        <span>Qwen-CUA Technical Report · arXiv:2608.02352</span>
      </div>
    </AbsoluteFill>
  )
}

function ExperienceHeader({ subtitle }: { subtitle: string }) {
  return (
    <div style={{ position: 'absolute', left: 88, top: 60, right: 88 }}>
      <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: '0.08em', color: OXBLOOD, textTransform: 'uppercase' }}>
        Industrial Experiences of Training
      </div>
      <h1 style={{ margin: '14px 0 0', fontSize: 61, lineHeight: 1.04, letterSpacing: '-0.018em', fontWeight: 600 }}>
        {subtitle}
      </h1>
    </div>
  )
}

function MetricStrip({ items, tone }: { items: Array<{ value: string; label: string }>; tone: string }) {
  return (
    <div style={{ display: 'flex', gap: 38, marginTop: 28 }}>
      {items.map((item) => (
        <div key={item.value} style={{ minWidth: 150 }}>
          <div style={{ fontFamily: MONO, fontSize: 36, lineHeight: 1, fontWeight: 800, color: tone }}>{item.value}</div>
          <div style={{ marginTop: 8, fontSize: 19, lineHeight: 1.2, color: MUTED }}>{item.label}</div>
        </div>
      ))}
    </div>
  )
}

export function IndustrialExperienceScalingSlide() {
  return (
    <AbsoluteFill style={{ backgroundColor: PAPER, color: INK, fontFamily: PALATINO, overflow: 'hidden' }}>
      <Grid />
      <ExperienceHeader subtitle="Industrial CUA training scales through systems and data." />

      <div style={{ position: 'absolute', left: 88, right: 88, top: 220, height: 342, display: 'grid', gridTemplateColumns: '120px 1fr 650px', columnGap: 34, alignItems: 'start', borderTop: `2px solid ${BLUE}`, paddingTop: 30 }}>
        <div style={{ fontFamily: MONO, fontSize: 70, lineHeight: 1, fontWeight: 800, color: BLUE }}>01</div>
        <div>
          <h2 style={{ margin: 0, fontSize: 43, lineHeight: 1.08 }}>Environment scaling</h2>
          <p style={{ margin: '16px 0 0', fontSize: 26, lineHeight: 1.33, color: MUTED, maxWidth: 740 }}>
            CUA training is unusually dependent on the environment layer. Working with the engineering team, we scaled configurable AgentHub images and resources into a rollout service that launches environments in seconds.
          </p>
        </div>
        <div>
          <MetricStrip tone={BLUE} items={[
            { value: '100K', label: 'vCPU capacity' },
            { value: '5K', label: 'concurrent RL rollouts' },
            { value: 'seconds', label: 'environment startup' },
          ]} />
          <p style={{ margin: '28px 0 0', fontSize: 22, lineHeight: 1.3, color: MUTED }}>
            Flexible image, configuration, memory, and disk management reduces rollout tail latency and training bubbles.
          </p>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 88, right: 88, top: 598, height: 344, display: 'grid', gridTemplateColumns: '120px 1fr 650px', columnGap: 34, alignItems: 'start', borderTop: `2px solid ${PURPLE}`, paddingTop: 30 }}>
        <div style={{ fontFamily: MONO, fontSize: 70, lineHeight: 1, fontWeight: 800, color: PURPLE }}>02</div>
        <div>
          <h2 style={{ margin: 0, fontSize: 43, lineHeight: 1.08 }}>Data scaling</h2>
          <p style={{ margin: '16px 0 0', fontSize: 26, lineHeight: 1.33, color: MUTED, maxWidth: 740 }}>
            Industrial training needs both scale and iteration speed. This experience led directly to the CUA-Gym synthesis engine: generate data for the target capability, train, evaluate behavior, and build the next data version.
          </p>
        </div>
        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: MONO, fontSize: 22, fontWeight: 800, color: PURPLE }}>
            <span>MODEL SIGNALS</span><span>→</span><span>DATA ENGINE</span><span>→</span><span>NEXT RUN</span>
          </div>
          <p style={{ margin: '27px 0 0', fontSize: 24, lineHeight: 1.34, color: MUTED }}>
            Vendor data establishes breadth. A scenario-specific synthesis loop converts failures and evaluator feedback into the next SFT and RL mixture—the critical path for model iteration.
          </p>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 88, bottom: 40, fontFamily: MONO, fontSize: 16, color: '#766F69' }}>
        Throughput is not only compute: it is environment availability × useful data iteration.
      </div>
    </AbsoluteFill>
  )
}

export function IndustrialExperienceRLSlide() {
  return (
    <AbsoluteFill style={{ backgroundColor: PAPER, color: INK, fontFamily: PALATINO, overflow: 'hidden' }}>
      <Grid />
      <ExperienceHeader subtitle="RL is simple. Making it work at scale is not." />

      <div style={{ position: 'absolute', left: 88, right: 88, top: 235, bottom: 90, display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 76, borderTop: `2px solid ${OXBLOOD}`, paddingTop: 44 }}>
        <div style={{ paddingRight: 62, borderRight: `1px solid ${RULE}` }}>
          <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: '0.06em', color: BLUE }}>STABILITY</div>
          <h2 style={{ margin: '12px 0 0', fontSize: 46, lineHeight: 1.08 }}>Build the system around RL.</h2>

          <div style={{ marginTop: 46 }}>
            <h3 style={{ margin: 0, fontSize: 31 }}>Optimize the infrastructure</h3>
            <p style={{ margin: '12px 0 0', fontSize: 25, lineHeight: 1.34, color: MUTED }}>
              Decoupled training and evaluation, black-box RL, and Ray mm-cache optimization keep image-heavy CUA runs fast and stable.
            </p>
          </div>

          <div style={{ marginTop: 40 }}>
            <h3 style={{ margin: 0, fontSize: 31 }}>Read behavior, not only reward</h3>
            <p style={{ margin: '12px 0 0', fontSize: 25, lineHeight: 1.34, color: MUTED }}>
              Turn failure modes into the next SFT mixture, RL tasks, and verifier distribution.
            </p>
          </div>
        </div>

        <div>
          <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: '0.06em', color: PURPLE }}>GENERALIZATION</div>
          <h2 style={{ margin: '12px 0 0', fontSize: 46, lineHeight: 1.08 }}>Merge models and data.</h2>
          <p style={{ margin: '26px 0 0', fontSize: 27, lineHeight: 1.36, color: MUTED, maxWidth: 720 }}>
            Consolidated training can outperform specialized models. Coding and multimodal reasoning data often deliver the strongest transfer to computer use.
          </p>

          <div style={{ marginTop: 78, borderTop: `1px solid ${RULE}`, paddingTop: 38 }}>
            <div style={{ fontFamily: MONO, fontSize: 19, letterSpacing: '0.06em', color: OXBLOOD }}>OPERATING PRINCIPLE</div>
            <p style={{ margin: '18px 0 0', fontSize: 39, lineHeight: 1.24, fontWeight: 600, maxWidth: 720 }}>
              Fast iteration.<br />
              Reliable delivery.<br />
              Close collaboration.
            </p>
            <p style={{ margin: '24px 0 0', fontSize: 23, lineHeight: 1.32, color: MUTED }}>
              Trust scaling laws and data gradients—then execute with engineering partners.
            </p>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
