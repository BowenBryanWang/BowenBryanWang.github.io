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

// Figure-column horizontal boundaries (eyeballed from env_figure_paper.png at
// 2400×669). Each tuple is [leftInsetPct, rightInsetPct] for clip-path.
const SOURCES_CLIP    = 'inset(0 89% 0 0)';     // 0 – 11%
const AGENTS_CLIP     = 'inset(0 21% 0 11%)';   // 11 – 79%
const ENG_CLIP        = 'inset(0 0 0 79%)';     // 79 – 100%

function fadeIn(frame: number, start: number, end: number) {
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}
function fadeOut(frame: number, start: number, end: number) {
  return interpolate(frame, [start, end], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

export const HowToScaleEnvs = () => {
  const frame = useCurrentFrame();

  // Per-column reveal — each column fades in cumulatively
  const sourcesOp = fadeIn(frame, 30, 70);
  const agentsOp = fadeIn(frame, 130, 170);
  const engOp = fadeIn(frame, 230, 270);

  // Per-step caption — each fades in when its step begins and fades out when
  // the next step begins. Only one caption is visible at a time.
  const cap1Op = fadeIn(frame, 30, 70) * fadeOut(frame, 110, 150);
  const cap2Op = fadeIn(frame, 130, 170) * fadeOut(frame, 210, 250);
  const cap3Op = fadeIn(frame, 230, 270);

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
          top: 80,
          fontFamily: PALATINO,
          fontSize: 60,
          fontWeight: 500,
          color: '#1B1816',
          letterSpacing: '-0.005em',
          lineHeight: 1.16,
        }}
      >
        How do we scale{' '}
        <span style={{ color: '#862D1A', fontWeight: 700 }}>environments</span>
        ?
      </div>

      {/* Figure — three overlaid copies, each clipped to its column range */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 230,
          height: 540,
        }}
      >
        {/* Column 1 — Sources */}
        <Img
          src={staticFile('env_figure_paper.png')}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            clipPath: SOURCES_CLIP,
            opacity: sourcesOp,
          }}
        />

        {/* Columns 2–4 — Plan + Dev + Web Agents */}
        <Img
          src={staticFile('env_figure_paper.png')}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            clipPath: AGENTS_CLIP,
            opacity: agentsOp,
          }}
        />

        {/* Column 5 — Engineering */}
        <Img
          src={staticFile('env_figure_paper.png')}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            clipPath: ENG_CLIP,
            opacity: engOp,
          }}
        />
      </div>

      {/* Bottom caption — switches per step */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          bottom: 90,
          height: 130,
        }}
      >
        <Caption
          tag="(1) Sources"
          tagColor="#1B1816"
          body={
            <>
              Start from <Strong>real-world software-use distributions</Strong>{' '}
              sampled from <Strong>O*NET</Strong> and the{' '}
              <Strong>Anthropic Economic Index</Strong> — biasing coverage
              toward authentic digital knowledge work.
            </>
          }
          opacity={cap1Op}
        />
        <Caption
          tag="(2) Plan / Dev / Web agents"
          tagColor="#2A8B6F"
          body={
            <>
              A <Strong>multi-agent coding pipeline</Strong> plans the spec,
              codes the frontend, and Playwright-tests the UI/UX over{' '}
              <Strong>N rounds</Strong> of dev ↔ web feedback.
            </>
          }
          opacity={cap2Op}
        />
        <Caption
          tag="(3) Engineering"
          tagColor="#3D6FA0"
          body={
            <>
              An engineering pass fixes the contract:{' '}
              <Strong>data schema</Strong>,{' '}
              <Strong>state-injection endpoints</Strong>, and a{' '}
              <Strong>SKILL.md</Strong> so every mock is a deterministic,
              resettable RL sandbox.
            </>
          }
          opacity={cap3Op}
        />
      </div>
    </AbsoluteFill>
  );
};

function Caption({
  tag,
  tagColor,
  body,
  opacity,
}: {
  tag: string;
  tagColor: string;
  body: React.ReactNode;
  opacity: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        opacity,
        display: 'flex',
        alignItems: 'baseline',
        gap: 28,
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: 22,
          fontWeight: 700,
          color: tagColor,
          letterSpacing: '0.06em',
          flexShrink: 0,
          minWidth: 380,
        }}
      >
        {tag}
      </span>
      <span
        style={{
          fontFamily: PALATINO,
          fontSize: 30,
          lineHeight: 1.35,
          color: '#1B1816',
          letterSpacing: '-0.005em',
        }}
      >
        {body}
      </span>
    </div>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ color: '#862D1A', fontWeight: 600 }}>{children}</span>
  );
}
