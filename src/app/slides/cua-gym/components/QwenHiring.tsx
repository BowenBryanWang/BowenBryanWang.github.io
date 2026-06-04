import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
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

export const QwenHiring = () => {
  const frame = useCurrentFrame();

  const titleOp = fadeIn(frame, 0, 30);
  const bodyOp = fadeIn(frame, 70, 120);
  const tagsOp = fadeIn(frame, 160, 210);
  const emailOp = fadeIn(frame, 260, 320);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#F7F4ED',
        fontFamily: PALATINO,
        color: '#1B1816',
        overflow: 'hidden',
      }}
    >
      {/* faint grid + sine background */}
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

      {/* Qwen logo top-right */}
      <div
        style={{
          position: 'absolute',
          right: 96,
          top: 88,
          opacity: titleOp,
        }}
      >
        <Img
          src={staticFile('qwen.png')}
          style={{ height: 96, width: 'auto', display: 'block' }}
        />
      </div>

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: '34%',
          transform: 'translateY(-50%)',
        }}
      >
        <div
          style={{
            fontFamily: PALATINO,
            fontSize: 18,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: '#9C948A',
            fontWeight: 500,
            opacity: titleOp,
          }}
        >
          The Qwen team is hiring
        </div>
        <h1
          style={{
            fontFamily: PALATINO,
            fontWeight: 700,
            fontSize: 144,
            lineHeight: 1.02,
            letterSpacing: '-0.012em',
            margin: '20px 0 0 0',
            color: '#1B1816',
            opacity: titleOp,
          }}
        >
          Build the{' '}
          <span style={{ color: '#862D1A' }}>next agent</span>{' '}
          with us.
        </h1>
      </div>

      {/* Body */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 600,
          fontFamily: PALATINO,
          fontSize: 32,
          lineHeight: 1.4,
          color: '#1B1816',
          letterSpacing: '-0.005em',
          maxWidth: 1500,
          opacity: bodyOp,
        }}
      >
        We are growing a team to push <Strong>CUA &amp; CLI agents</Strong>{' '}
        forward — frontier models, large-scale RL, agentic tooling, and the
        evaluation suites that hold them honest.
      </div>

      {/* Role tags */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 760,
          display: 'flex',
          gap: 20,
          opacity: tagsOp,
        }}
      >
        <RoleTag>Internships</RoleTag>
        <RoleTag>New grad</RoleTag>
        <RoleTag>Experienced</RoleTag>
        <RoleTag>CUA · CLI · GUI</RoleTag>
      </div>

      {/* Contact email — prominent */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          bottom: 88,
          display: 'flex',
          alignItems: 'baseline',
          gap: 28,
          opacity: emailOp,
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 22,
            letterSpacing: '0.22em',
            color: '#9C948A',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          Reach out
        </span>
        <a
          href="mailto:shenque.sq@alibaba-inc.com"
          style={{
            fontFamily: MONO,
            fontSize: 44,
            fontWeight: 600,
            color: '#862D1A',
            textDecoration: 'underline',
            textDecorationThickness: '2px',
            textUnderlineOffset: '8px',
            letterSpacing: '-0.005em',
          }}
        >
          shenque.sq@alibaba-inc.com
        </a>
      </div>
    </AbsoluteFill>
  );
};

function Strong({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ color: '#862D1A', fontWeight: 600 }}>{children}</span>
  );
}

function RoleTag({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: '14px 28px',
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #862D1A',
        borderRadius: 999,
        fontFamily: PALATINO,
        fontSize: 24,
        fontWeight: 600,
        color: '#862D1A',
        letterSpacing: '-0.005em',
      }}
    >
      {children}
    </div>
  );
}
