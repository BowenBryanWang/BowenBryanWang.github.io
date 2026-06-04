import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from '../lib/remotion-shim';

const PALATINO =
  '"Palatino Linotype", "Palatino", "Book Antiqua", "URW Palladio L", Georgia, serif';
const MONO = 'Menlo, Monaco, "JetBrains Mono", "Cascadia Code", monospace';

function fadeIn(frame: number, start: number, end: number) {
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

const BENCHMARKS = [
  { name: 'OSWorld-2.0',    sub: 'desktop apps' },
  { name: 'CocoaBench',     sub: 'macOS native' },
  { name: 'WildClawBench',  sub: 'open-domain web' },
  { name: 'ClawBench',      sub: 'curated browser tasks' },
  { name: '…',              sub: 'and more' },
];

export const UnifiedAgent = () => {
  const frame = useCurrentFrame();

  const titleOp = fadeIn(frame, 0, 30);
  const modelingOp = fadeIn(frame, 60, 110);
  const diagramOp = fadeIn(frame, 130, 200);
  const evalOp = fadeIn(frame, 240, 290);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#F7F4ED',
        fontFamily: PALATINO,
        color: '#1B1816',
        overflow: 'hidden',
      }}
    >
      {/* faint grid background */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, #E0D8C5 1px, transparent 1px),
            linear-gradient(to bottom, #E0D8C5 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
          opacity: 0.5,
        }}
      />
      <svg
        viewBox="0 0 1920 1080"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M 0 940 C 280 1040, 560 820, 880 940 S 1620 1040, 1920 940"
          fill="none"
          stroke="#D5CCBB"
          strokeWidth={1}
        />
      </svg>

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 60,
          fontFamily: PALATINO,
          fontSize: 56,
          fontWeight: 500,
          color: '#1B1816',
          letterSpacing: '-0.005em',
          lineHeight: 1.16,
          opacity: titleOp,
        }}
      >
        Introducing the{' '}
        <span style={{ color: '#862D1A', fontWeight: 700 }}>
          Unified Digital Agent
        </span>
        .
      </div>

      {/* Modeling kicker + body */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 200,
          opacity: modelingOp,
        }}
      >
        <Kicker>Modeling</Kicker>
        <div
          style={{
            marginTop: 12,
            fontFamily: PALATINO,
            fontSize: 30,
            lineHeight: 1.4,
            color: '#1B1816',
            letterSpacing: '-0.003em',
            maxWidth: 1500,
          }}
        >
          Combine <Strong>CLI</Strong> and <Strong>GUI</Strong> actions into a{' '}
          <Strong>single harness</Strong>, and{' '}
          <Strong>directly optimize</Strong> the policy against downstream
          task performance — let the model pick whichever modality is
          cheapest for each step.
        </div>
      </div>

      {/* CLI + GUI → Unified Harness diagram */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 410,
          height: 230,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: diagramOp,
        }}
      >
        <Modality
          label="CLI"
          desc="terminal, scripts, APIs"
          color="#1B1816"
          tint="#FAF6E8"
        />
        <Plus />
        <Modality
          label="GUI"
          desc="click, type, screenshot"
          color="#1B1816"
          tint="#FAF6E8"
        />
        <Arrow />
        <Modality
          label="Unified Digital Agent"
          desc="one policy, one reward"
          color="#FFFFFF"
          tint="#862D1A"
          big
        />
      </div>

      {/* Evaluation kicker + benchmark pills */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 690,
          opacity: evalOp,
        }}
      >
        <Kicker>Evaluation</Kicker>
        <div
          style={{
            marginTop: 14,
            fontFamily: PALATINO,
            fontSize: 24,
            color: '#5C5651',
            letterSpacing: '-0.003em',
            marginBottom: 24,
          }}
        >
          Across the breadth of digital-agent benchmarks — desktop, web,
          and native applications.
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 18,
          }}
        >
          {BENCHMARKS.map((b) => (
            <BenchmarkPill key={b.name} name={b.name} sub={b.sub} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 18,
        letterSpacing: '0.32em',
        textTransform: 'uppercase',
        color: '#9C948A',
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ color: '#862D1A', fontWeight: 600 }}>{children}</span>
  );
}

function Modality({
  label,
  desc,
  color,
  tint,
  big,
}: {
  label: string;
  desc: string;
  color: string;
  tint: string;
  big?: boolean;
}) {
  return (
    <div
      style={{
        padding: big ? '28px 44px' : '22px 36px',
        backgroundColor: tint,
        border: `1.5px solid ${big ? '#862D1A' : '#E0D8C5'}`,
        borderRadius: 16,
        minWidth: big ? 420 : 280,
        textAlign: 'center',
        boxShadow: big
          ? '0 18px 36px -20px rgba(134,45,26,0.45)'
          : '0 6px 18px -14px rgba(27,24,22,0.25)',
      }}
    >
      <div
        style={{
          fontFamily: PALATINO,
          fontSize: big ? 38 : 30,
          fontWeight: 700,
          color,
          letterSpacing: '-0.005em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: PALATINO,
          fontSize: big ? 18 : 16,
          color: big ? 'rgba(255,255,255,0.85)' : '#5C5651',
        }}
      >
        {desc}
      </div>
    </div>
  );
}

function Plus() {
  return (
    <div
      style={{
        margin: '0 28px',
        fontFamily: PALATINO,
        fontSize: 48,
        fontWeight: 500,
        color: '#9C948A',
      }}
    >
      +
    </div>
  );
}

function Arrow() {
  return (
    <div
      style={{
        margin: '0 32px',
        fontFamily: PALATINO,
        fontSize: 48,
        color: '#862D1A',
        fontWeight: 600,
      }}
    >
      →
    </div>
  );
}

function BenchmarkPill({ name, sub }: { name: string; sub: string }) {
  return (
    <div
      style={{
        padding: '14px 24px',
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #862D1A',
        borderRadius: 999,
        display: 'flex',
        alignItems: 'baseline',
        gap: 14,
      }}
    >
      <span
        style={{
          fontFamily: PALATINO,
          fontSize: 24,
          fontWeight: 700,
          color: '#862D1A',
          letterSpacing: '-0.005em',
        }}
      >
        {name}
      </span>
      <span
        style={{
          fontFamily: PALATINO,
          fontSize: 17,
          color: '#9C948A',
        }}
      >
        {sub}
      </span>
    </div>
  );
}
