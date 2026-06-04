import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from '../lib/remotion-shim';

// All text uses Palatino Linotype (system serif). System fallbacks cover
// macOS / Windows / Linux machines that may render the project.
const PALATINO = '"Palatino Linotype", "Palatino", "Book Antiqua", "URW Palladio L", Georgia, serif';

const FPS = 60;
const BANNER_FRAMES = 120; // 2.0s

// All components are present from frame 0. The whole banner fades out over
// the last `FADE_OUT_FRAMES` frames as a clean exit into scene 2.
const FADE_OUT_FRAMES = 30; // 0.5s
const FADE_OUT_START = BANNER_FRAMES - FADE_OUT_FRAMES;

export const Banner: React.FC<{ variant?: 'intro' | 'outro' | 'teaser' }> = ({
  variant = 'intro',
}) => {
  const frame = useCurrentFrame();

  // Single global opacity — full visible 0..FADE_OUT_START, then fade to 0.
  const opacity = interpolate(
    frame,
    [FADE_OUT_START, BANNER_FRAMES],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#F7F4ED', // paper — stays constant
        fontFamily: PALATINO,
        color: '#1B1816', // ink
        overflow: 'hidden',
      }}
    >
      {/* Faint grid background — same as Hero's grid-bg, at 50% opacity. */}
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

      {/* Decorative sine curves — fully drawn from frame 0. */}
      <svg
        viewBox="0 0 1920 1080"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M 0 880 C 320 760, 640 1000, 960 880 S 1600 760, 1920 880"
          fill="none"
          stroke="#C9C0AB"
          strokeWidth={1.2}
        />
        <path
          d="M 0 940 C 280 1040, 560 820, 880 940 S 1620 1040, 1920 940"
          fill="none"
          stroke="#D5CCBB"
          strokeWidth={1}
        />
      </svg>

      {/* Foreground components — these fade out together at end-of-banner.
          Background (paper color + grid + sine curves) stays constant. */}
      <div style={{ position: 'absolute', inset: 0, opacity }}>
        {/* Top-left lockup: XLang Lab | Qwen — co-affiliation */}
        <div
          style={{
            position: 'absolute',
            left: 96,
            top: 88,
            display: 'flex',
            alignItems: 'center',
            gap: 28,
          }}
        >
          <Img
            src={staticFile('logos/xlang-lab.png')}
            style={{ height: 76, width: 'auto', display: 'block' }}
          />
          <div
            aria-hidden
            style={{
              width: 1,
              height: 50,
              backgroundColor: '#9C948A',
              opacity: 0.5,
            }}
          />
          <Img
            src={staticFile('logos/qwen.png')}
            style={{ height: 76, width: 'auto', display: 'block' }}
          />
        </div>

        {/* Center-left stack: title + subtitle (all Palatino, title NOT italic) */}
        <div
          style={{
            position: 'absolute',
            left: 96,
            top: '46%',
            transform: 'translateY(-50%)',
            maxWidth: 1500,
          }}
        >
          <h1
            style={{
              fontFamily: PALATINO,
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: 168,
              lineHeight: 1.02,
              letterSpacing: '-0.012em',
              margin: 0,
              color: '#1B1816',
            }}
          >
            CUA-Gym
          </h1>

          <p
            style={{
              fontFamily: PALATINO,
              fontWeight: 400,
              fontSize: 48,
              lineHeight: 1.3,
              color: '#5C5651',
              marginTop: 40,
              marginBottom: 0,
              maxWidth: 1500,
            }}
          >
            {variant === 'teaser' ? (
              <>
                <span
                  style={{
                    color: '#862D1A',
                    fontWeight: 600,
                    fontStyle: 'italic',
                  }}
                >
                  And what&rsquo;s next?
                </span>
              </>
            ) : variant === 'outro' ? (
              <>
                The largest open CUA RLVR dataset — 32,122 tasks · 110 envs · all open.
                <br />
                <span style={{ color: '#862D1A', fontWeight: 600 }}>
                  Try it out →
                </span>
              </>
            ) : (
              <>
                Scaling Verifiable Training Environments and Tasks
                <br />
                for Computer-Use Agents
              </>
            )}
          </p>
        </div>

        {/* Bottom-left: mascot favicon + URL */}
        <div
          style={{
            position: 'absolute',
            left: 96,
            bottom: 88,
            display: 'flex',
            alignItems: 'center',
            gap: 22,
          }}
        >
          <Img
            src={staticFile('logos/cua-gym-mascot.png')}
            style={{ width: 64, height: 64, objectFit: 'contain', display: 'block' }}
          />
          <span
            style={{
              fontFamily: PALATINO,
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 36,
              letterSpacing: '-0.005em',
              color: '#1B1816',
              textDecoration: 'underline',
              textDecorationThickness: '1.5px',
              textUnderlineOffset: '6px',
            }}
          >
            https://cua-gym.xlang.ai
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const BANNER_DURATION_FRAMES = BANNER_FRAMES;
export const BANNER_FPS = FPS;
