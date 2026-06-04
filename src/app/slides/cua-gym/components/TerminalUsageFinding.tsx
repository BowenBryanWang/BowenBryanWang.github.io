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

export const TerminalUsageFinding = () => {
  const frame = useCurrentFrame();

  const titleOp = fadeIn(frame, 0, 30);
  const defOp = fadeIn(frame, 60, 100);
  const statOp = fadeIn(frame, 150, 200);
  const framingOp = fadeIn(frame, 240, 280);
  const figureOp = fadeIn(frame, 60, 120);
  const punchOp = fadeIn(frame, 330, 380);

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
          fontSize: 52,
          fontWeight: 500,
          color: '#1B1816',
          letterSpacing: '-0.005em',
          lineHeight: 1.16,
          opacity: titleOp,
        }}
      >
        We observe{' '}
        <span style={{ color: '#862D1A', fontWeight: 700 }}>
          unexpected model behavior
        </span>{' '}
        during RL training.
      </div>

      {/* LEFT column: definition + statistic + framing */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 200,
          width: 820,
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
        }}
      >
        {/* (1) Define the metric */}
        <div style={{ opacity: defOp }}>
          <Kicker>Terminal-Usage</Kicker>
          <div
            style={{
              marginTop: 12,
              fontFamily: PALATINO,
              fontSize: 28,
              lineHeight: 1.4,
              color: '#1B1816',
              letterSpacing: '-0.003em',
            }}
          >
            <span style={{ fontWeight: 600 }}>A heuristic metric:</span>{' '}
            whether the agent explicitly{' '}
            <Strong>opens a terminal</Strong> and interacts with the{' '}
            <Strong>CLI</Strong> during a rollout, instead of completing the
            task through the GUI alone.
          </div>
        </div>

        {/* (2) Headline statistic */}
        <div style={{ opacity: statOp }}>
          <Kicker>On OSWorld-Verified</Kicker>
          <div
            style={{
              marginTop: 12,
              display: 'flex',
              alignItems: 'baseline',
              gap: 24,
              fontFamily: MONO,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <span style={{ fontSize: 80, color: '#5C5651', fontWeight: 600 }}>
              20%
            </span>
            <span style={{ fontSize: 56, color: '#9C948A' }}>→</span>
            <span style={{ fontSize: 96, color: '#862D1A', fontWeight: 700 }}>
              50%
            </span>
          </div>
          <div
            style={{
              marginTop: 6,
              fontFamily: PALATINO,
              fontSize: 22,
              color: '#5C5651',
              
            }}
          >
            terminal-usage rate, before vs after RL training
          </div>
        </div>

        {/* (3) Framing */}
        <div style={{ opacity: framingOp }}>
          <div
            style={{
              fontFamily: PALATINO,
              fontSize: 26,
              lineHeight: 1.4,
              color: '#1B1816',
              letterSpacing: '-0.003em',
            }}
          >
            A <Strong>non-hacking but non-natural</Strong> behavior — the
            model increasingly chooses to <Strong>solve GUI tasks via CLI</Strong>{' '}
            once it discovers the terminal is reliably rewarded.
          </div>
        </div>
      </div>

      {/* Bottom punchline — the obvious follow-up question */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          bottom: 50,
          textAlign: 'center',
          fontFamily: PALATINO,
          
          fontSize: 36,
          fontWeight: 600,
          color: '#862D1A',
          letterSpacing: '-0.005em',
          opacity: punchOp,
        }}
      >
        Then why not just let the agent access the CLI tool?
      </div>

      {/* RIGHT column: trajectory screenshot */}
      <div
        style={{
          position: 'absolute',
          right: 96,
          top: 220,
          width: 880,
          opacity: figureOp,
        }}
      >
        <Img
          src={staticFile('terminal_usage_example.png')}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            border: '1px solid #E0D8C5',
            borderRadius: 12,
            boxShadow: '0 24px 50px -30px rgba(27,24,22,0.25)',
          }}
        />
        <div
          style={{
            marginTop: 14,
            textAlign: 'center',
            fontFamily: PALATINO,
            fontSize: 18,
            
            color: '#5C5651',
            lineHeight: 1.4,
          }}
        >
          Step 5 / 47 of a PDF-rendering task: instead of clicking through the
          PDF viewer, the agent opens a terminal and pipes a{' '}
          <code style={{ fontFamily: MONO, fontSize: 16 }}>
            python3 &lt;&lt; &lsquo;EOF&rsquo;
          </code>{' '}
          heredoc into <code style={{ fontFamily: MONO, fontSize: 16 }}>fitz.open(…)</code>.
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
        fontSize: 16,
        letterSpacing: '0.28em',
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
