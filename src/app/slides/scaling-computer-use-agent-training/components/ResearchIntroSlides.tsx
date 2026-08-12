import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
} from '../../cua-gym/lib/remotion-shim'
import opencuaImage from '@/images/publications/opencua.png'
import portraitImage from '@/images/portrait.jpg'

const PALATINO =
  '"Palatino Linotype", "Palatino", "Book Antiqua", "URW Palladio L", Georgia, serif'
const MONO = 'Menlo, Monaco, "JetBrains Mono", "Cascadia Code", monospace'

const PAPER = '#F7F4ED'
const INK = '#1B1816'
const MUTED = '#5C5651'
const FAINT = '#C9C0AB'
const RULE = '#E0D8C5'
const OXBLOOD = '#862D1A'
const BLUE = '#2F5D7C'
const GREEN = '#526E46'

function fadeIn(frame: number, start = 0, end = 26) {
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
}

function Shell({
  kicker,
  title,
  children,
}: {
  kicker?: string
  title?: string
  children: React.ReactNode
}) {
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
      <div style={{ position: 'absolute', left: 96, top: 72, right: 96 }}>
        {kicker && (
          <div
            style={{
              fontFamily: MONO,
              fontSize: 24,
              letterSpacing: '0.08em',
              color: OXBLOOD,
              textTransform: 'uppercase',
            }}
          >
            {kicker}
          </div>
        )}
        {title && (
          <h1
            style={{
              margin: kicker ? '16px 0 0' : 0,
              fontSize: 72,
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
              fontWeight: 600,
              maxWidth: 1480,
            }}
          >
            {title}
          </h1>
        )}
      </div>
      {children}
    </AbsoluteFill>
  )
}

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

function Chip({
  children,
  tone = OXBLOOD,
}: {
  children: React.ReactNode
  tone?: string
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: `1.5px solid ${tone}`,
        color: tone,
        padding: '10px 18px',
        borderRadius: 999,
        fontSize: 25,
        lineHeight: 1,
        fontWeight: 600,
        background: 'rgba(247, 244, 237, 0.82)',
      }}
    >
      {children}
    </div>
  )
}

function Metric({
  value,
  label,
  tone = OXBLOOD,
}: {
  value: string
  label: string
  tone?: string
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 62,
          fontWeight: 800,
          color: tone,
          lineHeight: 0.95,
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: 27,
          color: MUTED,
          lineHeight: 1.18,
          maxWidth: 290,
        }}
      >
        {label}
      </div>
    </div>
  )
}

function Claim({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: 39,
        lineHeight: 1.28,
        color: MUTED,
        maxWidth: 980,
      }}
    >
      {children}
    </p>
  )
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function donutPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number,
) {
  const startOuter = polarToCartesian(cx, cy, outerR, endAngle)
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle)
  const startInner = polarToCartesian(cx, cy, innerR, startAngle)
  const endInner = polarToCartesian(cx, cy, innerR, endAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArcFlag} 1 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ')
}

function DistributionWheel({
  inner,
  outer,
}: {
  inner: Array<{ label: string; value: number; color: string }>
  outer: Array<{ label: string; value: number; color: string }>
}) {
  const cx = 300
  const cy = 300
  let innerStart = 0
  let outerStart = 0
  const labelRotation = (angle: number) =>
    angle > 90 && angle < 270 ? angle + 180 : angle

  return (
    <svg width="600" height="600" viewBox="0 0 600 600" aria-label="AgentNet distribution">
      <circle cx={cx} cy={cy} r={292} fill="rgba(255,255,255,0.42)" />
      {outer.map((slice) => {
        const start = outerStart
        const end = start + slice.value * 3.6
        outerStart = end
        const mid = (start + end) / 2
        const labelPoint = polarToCartesian(cx, cy, 242, mid)
        const fontSize = slice.value < 2 ? 12 : slice.value < 4 ? 15 : slice.value < 7 ? 17 : 25
        return (
          <g key={slice.label}>
            <path
              d={donutPath(cx, cy, 190, 292, start, end)}
              fill={slice.color}
              stroke={PAPER}
              strokeWidth={2}
            />
            <text
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#050505"
              fontFamily={'Arial, Helvetica, sans-serif'}
              fontSize={fontSize}
              fontWeight={500}
              transform={`rotate(${labelRotation(mid)} ${labelPoint.x} ${labelPoint.y})`}
            >
              {slice.label.split('\n').map((line, i) => (
                <tspan key={line} x={labelPoint.x} dy={i === 0 ? -((slice.label.split('\n').length - 1) * fontSize) / 2 : fontSize * 1.04}>
                  {line}
                </tspan>
              ))}
              <tspan x={labelPoint.x} dy={fontSize * 1.04}>
                {slice.value.toFixed(1)}%
              </tspan>
            </text>
          </g>
        )
      })}
      {inner.map((slice) => {
        const start = innerStart
        const end = start + slice.value * 3.6
        innerStart = end
        const mid = (start + end) / 2
        const labelPoint = polarToCartesian(cx, cy, 136, mid)
        const lines = slice.label.split('\n')
        return (
          <g key={slice.label}>
            <path
              d={donutPath(cx, cy, 78, 190, start, end)}
              fill={slice.color}
              stroke={PAPER}
              strokeWidth={2}
            />
            <text
              x={labelPoint.x}
              y={labelPoint.y - 16}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#050505"
              fontFamily={'Arial, Helvetica, sans-serif'}
              fontSize={32}
              fontWeight={500}
              transform={`rotate(${labelRotation(mid)} ${labelPoint.x} ${labelPoint.y})`}
            >
              {lines.map((line, i) => (
                <tspan key={line} x={labelPoint.x} dy={i === 0 ? 0 : 34}>
                  {line}
                </tspan>
              ))}
            </text>
            <text
              x={labelPoint.x}
              y={labelPoint.y + 38 + (lines.length - 1) * 17}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#050505"
              fontFamily={'Arial, Helvetica, sans-serif'}
              fontSize={26}
              fontWeight={500}
              transform={`rotate(${labelRotation(mid)} ${labelPoint.x} ${labelPoint.y})`}
            >
              {slice.value.toFixed(1)}%
            </text>
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r={78} fill="#FFFFFF" stroke={PAPER} strokeWidth={2} />
      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#5A5A5A"
        fontFamily={'Arial, Helvetica, sans-serif'}
        fontSize={28}
        fontStyle="italic"
        fontWeight={800}
      >
        AgentNet
      </text>
    </svg>
  )
}

function DatasetTable() {
  const rows = [
    ['AitW', '2,346', '8.1', 'Mobile', 'no'],
    ['Mind2Web', '2,350', '7.3', 'Web', 'no'],
    ['AgentNet', '22,625', '18.6', 'Desktop', 'yes'],
  ]

  return (
    <div
      style={{
        border: `2px solid ${RULE}`,
        background: 'rgba(255,255,255,0.56)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.25fr 0.9fr 0.9fr 1fr 0.9fr',
          borderBottom: `2px solid ${RULE}`,
          fontFamily: MONO,
          fontSize: 20,
          fontWeight: 800,
          color: INK,
        }}
      >
        {['Dataset', 'Tasks', 'Avg. step', 'Env. type', 'Desktop'].map((head) => (
          <div key={head} style={{ padding: '16px 14px', borderRight: `1px solid ${RULE}` }}>
            {head}
          </div>
        ))}
      </div>
      {rows.map((row) => (
        <div
          key={row[0]}
          style={{
            display: 'grid',
            gridTemplateColumns: '1.25fr 0.9fr 0.9fr 1fr 0.9fr',
            borderBottom: row[0] === 'AgentNet' ? 'none' : `1px solid ${RULE}`,
            background: row[0] === 'AgentNet' ? 'rgba(134,45,26,0.08)' : 'transparent',
            fontFamily: row[0] === 'AgentNet' ? MONO : PALATINO,
            fontSize: row[0] === 'AgentNet' ? 22 : 24,
            fontWeight: row[0] === 'AgentNet' ? 800 : 500,
            color: row[0] === 'AgentNet' ? INK : MUTED,
          }}
        >
          {row.map((cell, i) => (
            <div
              key={`${row[0]}-${i}`}
              style={{
                padding: '17px 14px',
                borderRight: i === row.length - 1 ? 'none' : `1px solid ${RULE}`,
              }}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1920 1080"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <defs>
        <marker
          id="arrow-head"
          markerWidth="10"
          markerHeight="10"
          refX="7"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L8,3 z" fill={FAINT} />
        </marker>
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={FAINT}
        strokeWidth="5"
        markerEnd="url(#arrow-head)"
      />
    </svg>
  )
}

export function TitleSlide() {
  const frame = useCurrentFrame()
  const titleOpacity = fadeIn(frame, 0, 30)
  const authorOpacity = fadeIn(frame, 46, 88)

  return (
    <Shell>
      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 132,
          right: 120,
          opacity: titleOpacity,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 128,
            lineHeight: 1.04,
            letterSpacing: '-0.014em',
            fontWeight: 600,
            maxWidth: 1480,
          }}
        >
          Scaling Computer-Use Agent Training
        </h1>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 96,
          bottom: 150,
          opacity: authorOpacity,
        }}
      >
        <div style={{ fontSize: 34, color: INK }}>Bowen Wang</div>
        <div style={{ marginTop: 8, fontSize: 29, color: MUTED }}>
          The University of Hong Kong
        </div>
      </div>
    </Shell>
  )
}

export function PersonalIntroSlide() {
  const frame = useCurrentFrame()
  const textOpacity = fadeIn(frame, 0, 30)
  const imageOpacity = fadeIn(frame, 18, 54)
  const linkStyle: React.CSSProperties = {
    color: OXBLOOD,
    textDecoration: 'underline',
    textDecorationColor: 'rgba(134, 45, 26, 0.38)',
    textUnderlineOffset: 6,
  }

  return (
    <Shell>
      <div
        style={{
          position: 'absolute',
          left: 104,
          top: 92,
          bottom: 92,
          width: 980,
          opacity: textOpacity,
          display: 'grid',
          alignContent: 'center',
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 25,
            letterSpacing: '0.08em',
            color: OXBLOOD,
            textTransform: 'uppercase',
            marginBottom: 30,
          }}
        >
          Personal intro
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 88,
            lineHeight: 1.02,
            fontWeight: 600,
            color: INK,
          }}
        >
          Bowen Wang
        </h1>
        <div
          style={{
            marginTop: 44,
            display: 'grid',
            gap: 26,
            fontSize: 31,
            lineHeight: 1.28,
            color: MUTED,
            maxWidth: 900,
          }}
        >
          <p style={{ margin: 0 }}>
            I&apos;m a 2nd year Ph.D. student at{' '}
            <a href="https://www.hku.hk/" style={linkStyle}>
              the University of Hong Kong
            </a>
            , advised by{' '}
            <a href="https://taoyds.github.io/" style={linkStyle}>
              Prof. Tao Yu
            </a>
            . Prev@
            <a href="https://www.tsinghua.edu.cn/" style={linkStyle}>
              Tsinghua University
            </a>
            .
          </p>
          <p style={{ margin: 0 }}>
            My research focuses on building universal digital agents. I have
            primarily worked on computer-use agents (CUA), developing open
            foundations through mid-training and post-training and building
            open-sourced CUA models.
          </p>
          <p style={{ margin: 0 }}>
            My current research interests lie in digital agentic models,
            particularly in post-training methodologies for creating
            generalizable and intelligent agents that can reliably operate
            across diverse digital environments including coding, computer-use,
            terminal-use and more.
          </p>
          <p style={{ margin: 0 }}>
            I hope to make computer-use a core capability of frontier models. I
            believe universal digital agents (UDA) are a path toward AGI.
          </p>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 116,
          top: 126,
          bottom: 126,
          width: 600,
          opacity: imageOpacity,
        }}
      >
        <Img
          src={portraitImage.src}
          alt="Bowen Wang"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 8,
            border: `2px solid ${RULE}`,
            boxShadow: '0 34px 90px rgba(27, 24, 22, 0.18)',
          }}
        />
      </div>
    </Shell>
  )
}

export function BackgroundOverviewSlide() {
  const frame = useCurrentFrame()
  const relatedWork = [
    'OpenCUA: open foundations for computer-use agents',
    'Computer Agent Arena: interactive agent evaluation',
    'OSWorld-2.0: realistic desktop benchmark',
    'CUA-Gym: verifiable environments for post-training',
    'UDA-Gym: towards unified digital-agent training',
  ]
  const trainingWork = [
    'Qwen3.5 / Qwen3.7: computer-use capability training',
    'Kimi K2.5 / Kimi K2.6: visual agentic intelligence and CUA ability',
  ]

  return (
    <Shell kicker="Background" title="Overview of my background.">
      <div
        style={{
          position: 'absolute',
          left: 116,
          right: 116,
          top: 286,
          bottom: 92,
          display: 'grid',
          gridTemplateColumns: '0.88fr 1.12fr',
          gap: 76,
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'grid', gap: 58, opacity: fadeIn(frame, 18, 54) }}>
          <section>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 24,
                letterSpacing: '0.08em',
                color: BLUE,
                textTransform: 'uppercase',
                fontWeight: 800,
              }}
            >
              CUA Research
            </div>
            <p
              style={{
                margin: '26px 0 0',
                fontSize: 37,
                lineHeight: 1.22,
                color: INK,
                maxWidth: 700,
              }}
            >
              My academic work follows the scaling problem of computer-use
              agents: from open agent foundations to benchmarks, environment
              construction, and post-training.
            </p>
          </section>

          <section style={{ opacity: fadeIn(frame, 46, 82) }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 24,
                letterSpacing: '0.08em',
                color: OXBLOOD,
                textTransform: 'uppercase',
                fontWeight: 800,
              }}
            >
              Industrial Training
            </div>
            <p
              style={{
                margin: '26px 0 0',
                fontSize: 37,
                lineHeight: 1.22,
                color: INK,
                maxWidth: 760,
              }}
            >
              During my internships at Kimi and Qwen, I mainly participated in
              improving computer-use capabilities for frontier multimodal agent
              models.
            </p>
          </section>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 48,
            opacity: fadeIn(frame, 36, 76),
          }}
        >
          <section
            style={{
              borderTop: `2px solid ${RULE}`,
              paddingTop: 28,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 42,
                lineHeight: 1.1,
                color: INK,
                fontWeight: 600,
              }}
            >
              Related work
            </h2>
            <ul
              style={{
                margin: '28px 0 0',
                paddingLeft: 34,
                display: 'grid',
                gap: 16,
                fontSize: 32,
                lineHeight: 1.18,
                color: MUTED,
              }}
            >
              {relatedWork.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section
            style={{
              borderTop: `2px solid ${RULE}`,
              paddingTop: 28,
              opacity: fadeIn(frame, 60, 96),
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 42,
                lineHeight: 1.1,
                color: INK,
                fontWeight: 600,
              }}
            >
              Model training experience
            </h2>
            <ul
              style={{
                margin: '28px 0 0',
                paddingLeft: 34,
                display: 'grid',
                gap: 16,
                fontSize: 32,
                lineHeight: 1.18,
                color: MUTED,
              }}
            >
              {trainingWork.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

        </div>
      </div>
    </Shell>
  )
}

export function WhatsNextCUAProUDASlide() {
  const frame = useCurrentFrame()
  const items = [
    {
      num: '01',
      title: 'CUA-Pro: professional and long-horizon tasks',
      body: 'Computer-use agents need to move beyond short desktop chores into professional work: designing, multimedia editing, business operations, finance analysis, and other long-horizon workflows.',
      tone: BLUE,
    },
    {
      num: '02',
      title: 'UDA-Gym: seamless CUA + coding harness',
      body: 'The next training environment should fuse GUI interaction with coding harnesses, terminal tools, tests, and verifiers. UDA-Gym creates verifiable tasks and environments for professional CUA and unified digital agents.',
      tone: OXBLOOD,
    },
  ]

  return (
    <Shell kicker="What's next" title="CUA-Pro and UDA.">
      <div
        style={{
          position: 'absolute',
          left: 116,
          right: 116,
          top: 300,
          display: 'grid',
          gap: 58,
        }}
      >
        {items.map((item, i) => (
          <section
            key={item.num}
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr',
              gap: 42,
              opacity: fadeIn(frame, 18 + i * 38, 54 + i * 38),
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 42,
                lineHeight: 1,
                fontWeight: 900,
                color: item.tone,
              }}
            >
              {item.num}
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 54,
                  lineHeight: 1.08,
                  fontWeight: 600,
                  color: INK,
                }}
              >
                {item.title}
              </h2>
              <p
                style={{
                  margin: '22px 0 0',
                  fontSize: 36,
                  lineHeight: 1.24,
                  color: MUTED,
                  maxWidth: 1440,
                }}
              >
                {item.body}
              </p>
            </div>
          </section>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 116,
          right: 116,
          bottom: 78,
          height: 2,
          background: RULE,
          opacity: fadeIn(frame, 92, 120),
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 116,
          bottom: 40,
          fontFamily: MONO,
          fontSize: 22,
          color: MUTED,
          opacity: fadeIn(frame, 92, 120),
        }}
      >
        From computer-use agents to unified digital agents.
      </div>
    </Shell>
  )
}

type ResearchExample = {
  eyebrow: string
  title: string
  body: string
  image: string
  bullets: string[]
  tone: string
}

function ExamplesGridSlide({
  kicker,
  title,
  examples,
}: {
  kicker: string
  title: string
  examples: ResearchExample[]
}) {
  return (
    <Shell kicker={kicker} title={title}>
      <div
        style={{
          position: 'absolute',
          left: 98,
          right: 98,
          top: 250,
          bottom: 58,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 30,
        }}
      >
        {examples.map((example) => (
          <section
            key={example.title}
            style={{
              display: 'grid',
              gridTemplateColumns: '305px 1fr',
              gap: 24,
              alignItems: 'start',
              borderTop: `3px solid ${example.tone}`,
              paddingTop: 18,
              opacity: 1,
            }}
          >
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                border: `2px solid ${RULE}`,
                background: 'rgba(255,255,255,0.42)',
                height: 188,
                boxShadow: '0 18px 44px rgba(27, 24, 22, 0.10)',
              }}
            >
              <Img
                src={example.image}
                alt={example.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 18,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: example.tone,
                  fontWeight: 900,
                }}
              >
                {example.eyebrow}
              </div>
              <h2
                style={{
                  margin: '12px 0 0',
                  fontSize: 32,
                  lineHeight: 1.08,
                  color: INK,
                  fontWeight: 600,
                }}
              >
                {example.title}
              </h2>
              <p
                style={{
                  margin: '12px 0 0',
                  fontSize: 21,
                  lineHeight: 1.2,
                  color: MUTED,
                }}
              >
                {example.body}
              </p>
              <ul
                style={{
                  margin: '14px 0 0',
                  paddingLeft: 24,
                  display: 'grid',
                  gap: 5,
                  fontSize: 19,
                  lineHeight: 1.16,
                  color: MUTED,
                }}
              >
                {example.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </Shell>
  )
}

export function CUAProExamplesSlide() {
  const examples: ResearchExample[] = [
    {
      eyebrow: 'Video editing',
      title: 'Remove localized review marks',
      body: 'Remove burned-in marks while preserving timing and audio.',
      image: '/figures/uda-gym/examples/video/frame_5600ms.png',
      bullets: ['editing surface', 'pixel verifier'],
      tone: GREEN,
    },
    {
      eyebrow: 'Blender',
      title: 'Restore a scanned artifact in Blender',
      body: 'Recover materials from reference views and export final assets.',
      image: '/figures/uda-gym/examples/blender/three_quarter.png',
      bullets: ['3D restoration', 'render verifier'],
      tone: BLUE,
    },
    {
      eyebrow: 'BI analytics',
      title: 'Investigate a returned-value spike',
      body: 'Find the product and country driving an anomaly.',
      image: '/figures/uda-gym/examples/business/bi_anomaly_dashboard.png',
      bullets: ['dashboard + SQL', 'evidence CSV'],
      tone: OXBLOOD,
    },
    {
      eyebrow: 'Business Excel',
      title: 'Refresh a Treasury risk workbook',
      body: 'Update a formula-backed risk workbook.',
      image: '/figures/uda-gym/examples/business/excel_workbook_preview.png',
      bullets: ['spreadsheet modeling', 'recalc verifier'],
      tone: OXBLOOD,
    },
  ]

  return (
    <ExamplesGridSlide
      kicker="CUA-Pro examples"
      title="Professional software use at longer horizons."
      examples={examples}
    />
  )
}

export function UDAExamplesSlide() {
  const examples: ResearchExample[] = [
    {
      eyebrow: 'Code collaboration',
      title: 'GitLab-style project work',
      body: 'Combine repository state, issues, and code artifacts.',
      image: '/figures/uda-gym/examples/live/gitlab.png',
      bullets: ['real CUA-Gym app', 'code + browser'],
      tone: BLUE,
    },
    {
      eyebrow: 'Deployment console',
      title: 'Vercel-style release operations',
      body: 'Inspect deployment state and project settings.',
      image: '/figures/uda-gym/examples/live/vercel.png',
      bullets: ['ops surface', 'stateful env'],
      tone: OXBLOOD,
    },
    {
      eyebrow: 'Analytics workspace',
      title: 'Mixpanel-style product analysis',
      body: 'Reason over reports, funnels, cohorts, and events.',
      image: '/figures/uda-gym/examples/live/mixpanel.png',
      bullets: ['analytics UI', 'cross-view reasoning'],
      tone: GREEN,
    },
    {
      eyebrow: 'Collaboration surface',
      title: 'Slack-style team coordination',
      body: 'Follow threaded context and turn messages into actions.',
      image: '/figures/uda-gym/examples/live/slack.png',
      bullets: ['team context', 'multi-app handoff'],
      tone: OXBLOOD,
    },
  ]

  return (
    <ExamplesGridSlide
      kicker="UDA-Gym examples"
      title="Browser, code, files, and verifiers."
      examples={examples}
    />
  )
}

export function ThesisMap() {
  const frame = useCurrentFrame()
  const phases = [
    {
      title: 'Offline learning',
      stage: 'Pre-training / mid-training',
      work: 'Collect high-quality expert trajectories',
      signal: 'Agentic SFT supervision from human demonstrations',
      anchor: 'OpenCUA -> AgentNet',
      tone: BLUE,
    },
    {
      title: 'Online learning',
      stage: 'Post-training',
      work: 'Provide complete, accessible, resettable environments',
      signal: 'Supervision signal from execution and verification',
      anchor: 'CUA-Gym',
      tone: OXBLOOD,
    },
  ]

  return (
    <Shell kicker="Research arc" title="Scaling CUA training across the training timeline.">
      <div
        style={{
          position: 'absolute',
          left: 160,
          top: 306,
          height: 520,
          width: 2,
          background: '#BDB5A6',
          opacity: 0.85,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 116,
          right: 118,
          top: 286,
          display: 'grid',
          gap: 66,
        }}
      >
        {phases.map((phase, i) => (
          <div
            key={phase.title}
            style={{
              display: 'grid',
              gridTemplateColumns: '88px 470px 1fr',
              gap: 40,
              alignItems: 'start',
              minHeight: 220,
              opacity: fadeIn(frame, 26 + i * 44, 62 + i * 44),
            }}
          >
            <div
              style={{
                paddingTop: 2,
                fontFamily: MONO,
                fontSize: 24,
                fontWeight: 800,
                color: phase.tone,
                textAlign: 'center',
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </div>
            <div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 23,
                  color: phase.tone,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  fontWeight: 800,
                }}
              >
                {phase.stage}
              </div>
              <h2
                style={{
                  margin: '18px 0 0',
                  fontSize: 50,
                  lineHeight: 1.04,
                  color: phase.tone,
                  fontWeight: 500,
                }}
              >
                {phase.title}
              </h2>
              <div
                style={{
                  marginTop: 18,
                  fontFamily: MONO,
                  fontSize: 22,
                  color: MUTED,
                }}
              >
                {phase.anchor}
              </div>
            </div>
            <div
              style={{
                borderTop: `2px solid ${RULE}`,
                paddingTop: 26,
              }}
            >
              <div style={{ fontSize: 38, lineHeight: 1.16, color: INK }}>
                {phase.work}
              </div>
              <div
                style={{
                  marginTop: 20,
                  fontSize: 29,
                  lineHeight: 1.25,
                  color: MUTED,
                  maxWidth: 980,
                }}
              >
                {phase.signal}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p
        style={{
          position: 'absolute',
          left: 244,
          bottom: 82,
          right: 120,
          margin: 0,
          fontSize: 28,
          lineHeight: 1.28,
          color: MUTED,
          opacity: 0.72,
        }}
      >
        The central question is how to turn interaction with computers into
        scalable supervision at each stage of model training.
      </p>
    </Shell>
  )
}

export function OpenCUAProblem() {
  const frame = useCurrentFrame()

  return (
    <Shell kicker="OpenCUA motivation" title="Powerful CUAs were becoming closed systems.">
      <div style={{ position: 'absolute', left: 96, top: 304 }}>
        <Claim>
          To study capabilities, limitations, and risks, the community needed
          the full stack: data collection, datasets, training recipe, benchmark,
          code, and models.
        </Claim>
        <div
          style={{
            display: 'flex',
            gap: 18,
            marginTop: 44,
            opacity: fadeIn(frame, 48, 78),
          }}
        >
          <Chip tone={BLUE}>data</Chip>
          <Chip tone={BLUE}>infrastructure</Chip>
          <Chip tone={BLUE}>models</Chip>
          <Chip tone={BLUE}>evaluation</Chip>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 112,
          top: 292,
          width: 560,
          opacity: fadeIn(frame, 26, 58),
        }}
      >
        <Img
          src={opencuaImage.src}
          style={{
            width: '100%',
            display: 'block',
            border: `2px solid ${RULE}`,
            boxShadow: '0 30px 80px rgba(27, 24, 22, 0.12)',
          }}
        />
      </div>
    </Shell>
  )
}

export function OpenCUAQuestion() {
  const frame = useCurrentFrame()
  const items = [
    'How do we capture real computer-use behavior across platforms?',
    'How do we convert messy demonstrations into learning-ready trajectories?',
    'How do we make the trained agents improve with scale?',
  ]

  return (
    <Shell kicker="Core question" title="Scaling data is not just adding examples.">
      <div style={{ position: 'absolute', left: 150, top: 310, width: 1320 }}>
        {items.map((item, i) => (
          <div
            key={item}
            style={{
              display: 'grid',
              gridTemplateColumns: '96px 1fr',
              alignItems: 'start',
              gap: 30,
              marginTop: i === 0 ? 0 : 54,
              opacity: fadeIn(frame, 24 + i * 38, 58 + i * 38),
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 42,
                color: OXBLOOD,
                fontWeight: 800,
              }}
            >
              0{i + 1}
            </div>
            <div style={{ fontSize: 46, lineHeight: 1.18, color: INK }}>
              {item}
            </div>
          </div>
        ))}
      </div>
    </Shell>
  )
}

export function AgentNetToolSlide() {
  const frame = useCurrentFrame()

  return (
    <Shell kicker="AgentNetTool" title="A universal recorder for digital work.">
      <div style={{ position: 'absolute', left: 96, top: 302, width: 680 }}>
        <Claim>
          A cross-platform annotation application captures screen video,
          mouse/keyboard events, metadata, and accessibility trees while users
          complete natural tasks.
        </Claim>
      </div>
      <Arrow x1={760} y1={590} x2={1020} y2={590} />
      <Arrow x1={1292} y1={590} x2={1510} y2={590} />
      {[
        ['Human task demonstration', 'Windows / macOS / Ubuntu'],
        ['AgentNetTool', 'video + actions + AXTree'],
        ['Unified agent data', 'task, action trajectory, metadata'],
      ].map(([title, body], i) => (
        <div
          key={title}
          style={{
            position: 'absolute',
            left: 850 + i * 340,
            top: 438,
            width: 270,
            height: 295,
            border: `2px solid ${i === 1 ? OXBLOOD : RULE}`,
            background: 'rgba(255, 255, 255, 0.48)',
            padding: 26,
            opacity: fadeIn(frame, 38 + i * 28, 68 + i * 28),
          }}
        >
          <div
            style={{
              fontSize: 31,
              fontWeight: 700,
              lineHeight: 1.1,
              color: i === 1 ? OXBLOOD : INK,
            }}
          >
            {title}
          </div>
          <p
            style={{
              marginTop: 28,
              fontFamily: MONO,
              fontSize: 20,
              lineHeight: 1.42,
              color: MUTED,
            }}
          >
            {body}
          </p>
        </div>
      ))}
    </Shell>
  )
}

function StageHeader({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        position: 'absolute',
        height: 82,
        borderRadius: 14,
        border: '2px solid #5E5E5E',
        background: '#D9EAD3',
        display: 'grid',
        placeItems: 'center',
        fontFamily: '"Gill Sans", Arial, sans-serif',
        fontSize: 32,
        lineHeight: 1.18,
        color: '#000',
        textAlign: 'center',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function CodeBox({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      style={{
        position: 'absolute',
        border: '2px solid #7B7B7B',
        background: '#FFFFFF',
        padding: '26px 28px',
        fontFamily: 'Consolas, "SF Mono", monospace',
        fontSize: 29,
        lineHeight: 1.22,
        color: '#000',
        ...style,
      }}
    >
      mouse move
      <br />
      type j
      <br />
      mouse move
      <br />
      mouse move
      <br />
      mouse press
      <br />
      press ctrl
      <br />
      mouse move
      <br />
      mouse release
      <br />
      type v
      <br />
      ...
    </div>
  )
}

function BlueAction({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        position: 'absolute',
        borderRadius: 14,
        border: '2px solid #5E5E5E',
        background: '#CFE2F3',
        display: 'grid',
        placeItems: 'center',
        fontFamily: '"Gill Sans", Arial, sans-serif',
        fontSize: 31,
        lineHeight: 1.18,
        textAlign: 'center',
        color: '#000',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function ReasoningBox({
  label,
  children,
  style,
}: {
  label: string
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        position: 'absolute',
        borderRadius: 14,
        border: '2px solid #5E5E5E',
        background: '#FCE5CD',
        padding: '18px 26px',
        fontFamily: '"Gill Sans", Arial, sans-serif',
        fontSize: 28,
        lineHeight: 1.22,
        textAlign: 'center',
        color: '#000',
        ...style,
      }}
    >
      <strong>{label}</strong>: {children}
    </div>
  )
}

export function AgentNetPipelineFigureSlide() {
  const stepLabelStyle: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: 20,
    fontWeight: 800,
    lineHeight: 1,
  }

  const panelBaseStyle: React.CSSProperties = {
    border: `2px solid ${RULE}`,
    background: 'rgba(255,255,255,0.58)',
  }

  const columns = [
    {
      title: 'Human demonstration',
      subtitle: 'continuous actions + video',
      tone: BLUE,
      body: (
        <>
          <div
            style={{
              ...panelBaseStyle,
              height: 206,
              padding: '17px 20px',
              fontFamily: MONO,
              fontSize: 17,
              lineHeight: 1.2,
              color: INK,
            }}
          >
            mouse move
            <br />
            type j
            <br />
            mouse press
            <br />
            press ctrl
            <br />
            mouse release
            <br />
            type v
            <br />
            ...
          </div>
          <Img
            src="/figures/opencua/agentnet-pipeline/video.png"
            style={{
              width: '100%',
              height: 285,
              objectFit: 'cover',
              objectPosition: 'center top',
              border: `2px solid ${RULE}`,
            }}
          />
        </>
      ),
    },
    {
      title: 'Action reduction + alignment',
      subtitle: 'compact state-action pairs',
      tone: OXBLOOD,
      body: (
        <>
          <div
            style={{
              display: 'grid',
              gap: 12,
              fontFamily: MONO,
              fontSize: 17,
              lineHeight: 1.2,
            }}
          >
            <div
              style={{
                ...panelBaseStyle,
                height: 76,
                padding: '13px 16px',
              }}
            >
              Action 2
              <br />
              pyautogui.click(1540, 460)
            </div>
            <div
              style={{
                ...panelBaseStyle,
                height: 76,
                padding: '13px 16px',
              }}
            >
              Action 3
              <br />
              {"pyautogui.hotkey('ctrl', 'v')"}
            </div>
          </div>
          <Img
            src="/figures/opencua/agentnet-pipeline/keyframe.png"
            style={{
              width: '100%',
              height: 338,
              objectFit: 'cover',
              objectPosition: 'center top',
              border: `2px solid ${RULE}`,
            }}
          />
        </>
      ),
    },
    {
      title: 'Reasoning enhancement',
      subtitle: 'learning-ready agent data',
      tone: GREEN,
      body: (
        <div style={{ display: 'grid', gap: 13 }}>
          {[
            ['Observation', 'Photoshop is open with a dog image and the color bar visible.'],
            ['Thought', 'Previous actions copied an image; the next step should paste it.'],
            ['Action instruction', 'press ctrl+v to paste the copied image'],
            ['Action', "pyautogui.hotkey('ctrl', 'v')"],
          ].map(([label, text]) => (
            <div
              key={label}
              style={{
                borderLeft: `5px solid ${GREEN}`,
                background: 'rgba(255,255,255,0.58)',
                minHeight: label === 'Thought' ? 102 : 86,
                padding: '12px 16px',
                fontSize: 19,
                lineHeight: 1.16,
                color: MUTED,
              }}
            >
              <span style={{ color: INK, fontWeight: 700 }}>{label}</span>
              <br />
              {text}
            </div>
          ))}
        </div>
      ),
    },
  ]

  return (
    <AbsoluteFill
      style={{
        background: PAPER,
        color: INK,
        fontFamily: PALATINO,
        overflow: 'hidden',
      }}
    >
      <Grid />
      <h1
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 62,
          margin: 0,
          fontSize: 56,
          lineHeight: 1.04,
          fontWeight: 600,
          color: INK,
        }}
      >
        AgentNet pipeline: from human demos to agent data
      </h1>
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 184,
          bottom: 72,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 36,
        }}
      >
        {columns.map((col, i) => (
          <div
            key={col.title}
            style={{
              display: 'flex',
              minWidth: 0,
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <div
              style={{
                color: col.tone,
                ...stepLabelStyle,
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </div>
            <h2
              style={{
                margin: '18px 0 0',
                fontSize: 34,
                lineHeight: 1.08,
                color: col.tone,
                fontWeight: 600,
                minHeight: 78,
              }}
            >
              {col.title}
            </h2>
            <div
              style={{
                marginTop: 2,
                fontFamily: MONO,
                fontSize: 17,
                color: MUTED,
                minHeight: 26,
              }}
            >
              {col.subtitle}
            </div>
            <div
              style={{
                marginTop: 20,
                borderTop: `3px solid ${RULE}`,
                paddingTop: 22,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {col.body}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  )
}

export function AgentNetPipelineSlide() {
  const frame = useCurrentFrame()
  const stages = [
    {
      title: 'Raw demo',
      text: 'continuous mouse, keyboard, video, screen state',
    },
    {
      title: 'Reduction + alignment',
      text: 'clean actions aligned to key observations',
    },
    {
      title: 'Reflective reasoning',
      text: 'inner monologue, action history, recovery-aware CoT',
    },
  ]

  return (
    <Shell kicker="Data pipeline" title="From demonstrations to state-action learning data.">
      <div
        style={{
          position: 'absolute',
          left: 132,
          right: 132,
          top: 346,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 36,
        }}
      >
        {stages.map((stage, i) => (
          <div
            key={stage.title}
            style={{
              minHeight: 390,
              padding: '36px 34px',
              borderLeft: `8px solid ${i === 2 ? OXBLOOD : BLUE}`,
              background: 'rgba(255, 255, 255, 0.46)',
              opacity: fadeIn(frame, 22 + i * 36, 58 + i * 36),
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 23,
                color: i === 2 ? OXBLOOD : BLUE,
                fontWeight: 800,
              }}
            >
              STEP {i + 1}
            </div>
            <h2
              style={{
                margin: '38px 0 0',
                fontSize: 47,
                lineHeight: 1.05,
              }}
            >
              {stage.title}
            </h2>
            <p style={{ marginTop: 38, fontSize: 30, lineHeight: 1.28, color: MUTED }}>
              {stage.text}
            </p>
          </div>
        ))}
      </div>
    </Shell>
  )
}

export function AgentNetDatasetSlide() {
  const frame = useCurrentFrame()
  return (
    <Shell kicker="AgentNet data" title="Desktop trajectories become a dataset.">
      <div
        style={{
          position: 'absolute',
          left: 104,
          right: 104,
          top: 270,
          bottom: 96,
          display: 'grid',
          gridTemplateColumns: '0.96fr 1.04fr',
          gap: 72,
          alignItems: 'center',
          opacity: fadeIn(frame, 18, 44),
        }}
      >
        <div
          style={{
            display: 'grid',
            justifyItems: 'center',
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 22,
              fontWeight: 800,
              color: OXBLOOD,
              textTransform: 'uppercase',
              marginBottom: 18,
              justifySelf: 'start',
            }}
          >
            Task distribution
          </div>
          <Img
            src="/figures/opencua/domain_distribution.png"
            style={{
              width: 610,
              height: 610,
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 22,
              fontWeight: 800,
              color: OXBLOOD,
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            Compared with prior GUI data
          </div>
          <DatasetTable />
        </div>
      </div>
    </Shell>
  )
}

export function OpenCUATrainingSlide() {
  const frame = useCurrentFrame()
  const stages = [
    {
      phase: 'Pre-training',
      title: 'Build visual and GUI priors',
      tone: BLUE,
      mix: [
        ['Broad visual-language corpus', 'dominant foundation signal', 1.35, '#B9DDF0'],
        ['GUI grounding data', 'interface localization and semantics', 1.05, '#63C5E6'],
        ['Early action traces', 'light agentic bridge', 0.72, '#2F5D7C'],
      ],
      notes: [
        'keep broad visual-language ability',
        'teach screen localization and UI semantics',
        'introduce low-level mouse / keyboard actions',
      ],
    },
    {
      phase: 'Mid-training',
      title: 'Convert trajectories into agent behavior',
      tone: OXBLOOD,
      mix: [
        ['AgentNet trajectories', 'expert desktop demonstrations', 1.35, '#862D1A'],
        ['Reasoning annotations', 'observation, thought, and action alignment', 0.98, '#C46A45'],
        ['History context', 'long-horizon recovery signal', 0.78, '#E7B18D'],
      ],
      notes: [
        'scale expert desktop demonstrations',
        'align observations, thoughts, and actions',
        'train multi-step recovery and long-horizon context',
      ],
    },
  ]

  return (
    <Shell kicker="OpenCUA recipe" title="A open training recipe for computer-use agent.">
      <div style={{ position: 'absolute', left: 106, top: 292, width: 720 }}>
        <Claim>
          The recipe is not just adding AgentNet at the end. OpenCUA changes the
          data mixture across stages: broad multimodal priors first, then
          increasingly agentic supervision.
        </Claim>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 940,
          right: 112,
          top: 286,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 34,
        }}
      >
        {stages.map((stage, i) => (
          <div
            key={stage.phase}
            style={{
              minHeight: 530,
              borderTop: `5px solid ${stage.tone}`,
              background: 'rgba(255,255,255,0.54)',
              padding: '28px 28px 30px',
              opacity: fadeIn(frame, 28 + i * 34, 66 + i * 34),
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 21,
                color: stage.tone,
                fontWeight: 800,
                textTransform: 'uppercase',
              }}
            >
              {stage.phase}
            </div>
            <h2
              style={{
                margin: '20px 0 28px',
                fontSize: 38,
                lineHeight: 1.08,
                color: INK,
              }}
            >
              {stage.title}
            </h2>
            <div
              style={{
                height: 42,
                display: 'flex',
                border: `2px solid ${RULE}`,
                background: PAPER,
              }}
            >
              {stage.mix.map(([label, _description, weight, color]) => (
                <div
                  key={label}
                  title={label as string}
                  style={{
                    flex: weight as number,
                    background: color as string,
                    borderRight: `2px solid ${PAPER}`,
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'grid', gap: 14, marginTop: 22 }}>
              {stage.mix.map(([label, description, _weight, color]) => (
                <div
                  key={label}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '16px 1fr',
                    gap: 12,
                    alignItems: 'start',
                    fontSize: 21,
                    color: MUTED,
                  }}
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      marginTop: 5,
                      background: color as string,
                    }}
                  />
                  <span>
                    <strong style={{ color: INK }}>{label}</strong>
                    <br />
                    <span style={{ fontSize: 18, lineHeight: 1.22 }}>
                      {description}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 28,
                borderTop: `2px solid ${RULE}`,
                paddingTop: 22,
                display: 'grid',
                gap: 16,
              }}
            >
              {stage.notes.map((note) => (
                <div
                  key={note}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '28px 1fr',
                    gap: 12,
                    alignItems: 'start',
                    fontSize: 23,
                    lineHeight: 1.18,
                    color: MUTED,
                  }}
                >
                  <span style={{ color: stage.tone, fontFamily: MONO, fontWeight: 800 }}>+</span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 126,
          right: 126,
          bottom: 82,
          height: 3,
          background: RULE,
          opacity: fadeIn(frame, 90, 128),
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 126,
          bottom: 48,
          fontFamily: MONO,
          fontSize: 21,
          color: MUTED,
          opacity: fadeIn(frame, 90, 128),
        }}
      >
        {
          'Training arc: generic multimodal competence -> GUI grounding -> agentic SFT on expert trajectories.'
        }
      </div>
    </Shell>
  )
}

export function OpenCUAResultsSlide() {
  const frame = useCurrentFrame()
  const plot = {
    left: 340,
    top: 370,
    width: 950,
    height: 420,
  }
  const xMax = 55
  const yMax = 40
  const x = (value: number) => plot.left + (value / xMax) * plot.width
  const y = (value: number) => plot.top + plot.height - (value / yMax) * plot.height
  const ourPoints = [
    [0, 0],
    [10, 10],
    [27, 20],
    [42, 30],
    [55, 36],
  ]
  const basePoints = [
    [0, 0],
    [10, 4.0],
    [27, 4.4],
    [42, 4.5],
    [55, 4.5],
  ]
  const linePath = (points: number[][]) =>
    points.map(([px, py], i) => `${i === 0 ? 'M' : 'L'} ${x(px)} ${y(py)}`).join(' ')

  return (
    <Shell kicker="OpenCUA result" title="The recipe turns data scale into agent capability.">
      <svg
        viewBox="0 0 1920 1080"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: fadeIn(frame, 10, 38),
        }}
        aria-label="OSWorld success rate versus data scale"
      >
        <defs>
          <filter id="starShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#862D1A" floodOpacity="0.18" />
          </filter>
          <marker
            id="arrowOx"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={OXBLOOD} />
          </marker>
        </defs>

        <rect
          x={plot.left - 74}
          y={plot.top - 92}
          width={plot.width + 470}
          height={plot.height + 170}
          fill="rgba(255,255,255,0.44)"
          stroke={RULE}
          strokeWidth="2"
        />

        {[0, 10, 20, 30, 40].map((tick) => (
          <g key={`y-${tick}`}>
            <line
              x1={plot.left}
              x2={plot.left + plot.width}
              y1={y(tick)}
              y2={y(tick)}
              stroke={tick === 0 ? INK : RULE}
              strokeWidth={tick === 0 ? 3 : 1.5}
              opacity={tick === 0 ? 0.85 : 0.72}
            />
            <text
              x={plot.left - 28}
              y={y(tick) + 8}
              textAnchor="end"
              fontFamily={MONO}
              fontSize="22"
              fill={MUTED}
            >
              {tick}
            </text>
          </g>
        ))}

        {[0, 10, 20, 27, 42, 55].map((tick) => (
          <g key={`x-${tick}`}>
            <line
              x1={x(tick)}
              x2={x(tick)}
              y1={plot.top}
              y2={plot.top + plot.height}
              stroke={RULE}
              strokeWidth="1.2"
              opacity="0.52"
            />
            <text
              x={x(tick)}
              y={plot.top + plot.height + 46}
              textAnchor="middle"
              fontFamily={MONO}
              fontSize="22"
              fill={MUTED}
            >
              {tick}
            </text>
          </g>
        ))}

        <line
          x1={plot.left}
          y1={plot.top}
          x2={plot.left}
          y2={plot.top + plot.height}
          stroke={INK}
          strokeWidth="3"
        />
        <line
          x1={plot.left}
          y1={plot.top + plot.height}
          x2={plot.left + plot.width}
          y2={plot.top + plot.height}
          stroke={INK}
          strokeWidth="3"
        />

        <path
          d={linePath(basePoints)}
          fill="none"
          stroke="#C9C9C9"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="18 18"
        />
        <path
          d={linePath(ourPoints)}
          fill="none"
          stroke={BLUE}
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {ourPoints.slice(2).map(([px, py], i) => (
          <g key={`star-${px}`} filter="url(#starShadow)">
            <text
              x={x(px)}
              y={y(py) - 44}
              textAnchor="middle"
              fontFamily={MONO}
              fontSize="30"
              fontWeight="800"
              fill={INK}
            >
              {['7B', '32B', '72B'][i]}
            </text>
            <text
              x={x(px)}
              y={y(py) + 18}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="64"
              fill="#FF7A1A"
            >
              ★
            </text>
          </g>
        ))}

        <text
          x={plot.left + plot.width / 2}
          y={plot.top - 38}
          textAnchor="middle"
          fontFamily={PALATINO}
          fontSize="38"
          fontWeight="700"
          fill={INK}
        >
          OSWorld SR (%) vs. Data Scale (k)
        </text>
        <text
          x={plot.left + plot.width / 2}
          y={plot.top + plot.height + 96}
          textAnchor="middle"
          fontFamily={PALATINO}
          fontSize="30"
          fill={INK}
        >
          Data Scale (k)
        </text>
        <text
          x={plot.left - 104}
          y={plot.top + plot.height / 2}
          textAnchor="middle"
          fontFamily={PALATINO}
          fontSize="30"
          fill={INK}
          transform={`rotate(-90 ${plot.left - 104} ${plot.top + plot.height / 2})`}
        >
          OSWorld SR (%)
        </text>

        <g transform={`translate(${plot.left + 44}, ${plot.top + 36})`}>
          <line x1="0" y1="0" x2="58" y2="0" stroke="#C9C9C9" strokeWidth="6" strokeDasharray="14 14" />
          <text x="76" y="9" fontFamily={PALATINO} fontSize="28" fill={MUTED}>
            Base recipe
          </text>
          <line x1="0" y1="46" x2="58" y2="46" stroke={BLUE} strokeWidth="8" />
          <text x="76" y="55" fontFamily={PALATINO} fontSize="28" fill={INK}>
            OpenCUA recipe
          </text>
        </g>

        <path
          d={`M ${x(3)} ${y(4.4)} L ${x(10)} ${y(4.4)}`}
          stroke={OXBLOOD}
          strokeWidth="6"
          fill="none"
          markerEnd="url(#arrowOx)"
        />
        <text
          x={plot.left + 92}
          y={y(4.4) - 62}
          textAnchor="start"
          fontFamily={PALATINO}
          fontSize="27"
          fill={INK}
        >
          <tspan x={plot.left + 92} dy="0">State-action pairs alone</tspan>
          <tspan x={plot.left + 92} dy="31">flatten around 4.4% SR.</tspan>
        </text>

        <path
          d={`M ${x(37)} ${y(12)} L ${x(34)} ${y(22)}`}
          stroke={OXBLOOD}
          strokeWidth="6"
          fill="none"
          markerEnd="url(#arrowOx)"
        />
        <text
          x={x(39)}
          y={y(12) + 8}
          fontFamily={PALATINO}
          fontSize="28"
          fill={INK}
        >
          <tspan x={x(39)} dy="0">Data mixture unlocks</tspan>
          <tspan x={x(39)} dy="34">robust scaling.</tspan>
        </text>

        <path
          d={`M ${plot.left + plot.width + 82} ${y(36)} C ${plot.left + plot.width + 130} ${y(36)}, ${plot.left + plot.width + 130} ${y(20)}, ${plot.left + plot.width + 82} ${y(20)}`}
          stroke="#FF7A1A"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        <text
          x={plot.left + plot.width + 160}
          y={y(30)}
          fontFamily={PALATINO}
          fontSize="28"
          fill={INK}
        >
          <tspan x={plot.left + plot.width + 160} dy="0">The same recipe</tspan>
          <tspan x={plot.left + plot.width + 160} dy="32">scales with model size.</tspan>
        </text>
      </svg>
    </Shell>
  )
}

export function BridgeToCUAGymSlide() {
  const frame = useCurrentFrame()

  return (
    <Shell kicker="Bridge" title="But offline learning leaves the agent outside the loop.">
      <div style={{ position: 'absolute', left: 112, top: 330, width: 700 }}>
        <Claim>
          Demonstrations teach behavior. They do not directly answer the next
          question: how should an agent improve by attempting tasks, failing,
          resetting, and receiving verifiable feedback?
        </Claim>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 130,
          top: 308,
          width: 760,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 30,
        }}
      >
        {[
          ['OpenCUA', 'human demos -> offline SFT'],
          ['CUA-Gym', 'verifiable envs -> online RLVR'],
        ].map(([title, text], i) => (
          <div
            key={title}
            style={{
              minHeight: 330,
              padding: 34,
              border: `2px solid ${i === 0 ? BLUE : OXBLOOD}`,
              opacity: fadeIn(frame, 44 + i * 40, 76 + i * 40),
            }}
          >
            <h2
              style={{
                margin: 0,
                color: i === 0 ? BLUE : OXBLOOD,
                fontSize: 52,
                lineHeight: 1,
              }}
            >
              {title}
            </h2>
            <p
              style={{
                marginTop: 60,
                fontFamily: MONO,
                fontSize: 28,
                lineHeight: 1.35,
                color: MUTED,
              }}
            >
              {text}
            </p>
          </div>
        ))}
      </div>
    </Shell>
  )
}

export function CUAGymSectionBridge() {
  const frame = useCurrentFrame()

  return (
    <Shell>
      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 132,
          width: 1400,
          opacity: fadeIn(frame, 0, 34),
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 27,
            color: OXBLOOD,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Part II
        </div>
        <h1
          style={{
            margin: '48px 0 0',
            fontSize: 130,
            lineHeight: 1.03,
            fontWeight: 600,
            letterSpacing: '-0.014em',
          }}
        >
          CUA-Gym
        </h1>
        <p
          style={{
            marginTop: 44,
            fontSize: 46,
            lineHeight: 1.24,
            color: MUTED,
            maxWidth: 1260,
          }}
        >
          Scaling verifiable training environments and tasks for
          computer-use agents.
        </p>
      </div>
    </Shell>
  )
}

export function ResearchProgramSlide() {
  const frame = useCurrentFrame()
  const rows = [
    ['Data foundation', 'OpenCUA / AgentNet', 'what humans actually do'],
    ['RL foundation', 'CUA-Gym', 'what agents can verify and improve on'],
    ['World foundation', 'next thesis chapter', 'what agents can simulate and remember'],
  ]

  return (
    <Shell kicker="Thesis through-line" title="The thesis is not one benchmark. It is a training stack.">
      <div
        style={{
          position: 'absolute',
          left: 110,
          right: 110,
          top: 320,
          display: 'grid',
          gap: 30,
        }}
      >
        {rows.map(([axis, work, claim], i) => (
          <div
            key={axis}
            style={{
              display: 'grid',
              gridTemplateColumns: '380px 430px 1fr',
              gap: 34,
              alignItems: 'center',
              minHeight: 120,
              borderTop: `2px solid ${RULE}`,
              paddingTop: 28,
              opacity: fadeIn(frame, 26 + i * 34, 60 + i * 34),
            }}
          >
            <div style={{ fontSize: 38, color: OXBLOOD, fontWeight: 700 }}>
              {axis}
            </div>
            <div style={{ fontSize: 34, color: INK }}>{work}</div>
            <div style={{ fontSize: 31, color: MUTED }}>{claim}</div>
          </div>
        ))}
      </div>
    </Shell>
  )
}
