import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from '../lib/remotion-shim';

const PALATINO =
  '"Palatino Linotype", "Palatino", "Book Antiqua", "URW Palladio L", Georgia, serif';
const MONO = 'Menlo, Monaco, "JetBrains Mono", "Cascadia Code", monospace';

const FPS = 60;
const SCENE_FRAMES = 300; // 5.0s
const FADE_OUT_FRAMES = 30;
const FADE_OUT_START = SCENE_FRAMES - FADE_OUT_FRAMES;

// Timeline (300f / 5.0s @ 60fps):
//   0 –  45f (0.00–0.75s) title + task card + Gmail mac-window all fade in together
//  45 –  60f (0.75–1.0s)  brief hold
//  60 – 105f (1.0–1.75s)  big "reward = ???" fades in
// 105 – 120f (1.75–2.0s)  brief hold
// 120 – 180f (2.0–3.0s)   eraser sweeps left → right, clipping "reward = ???"
// 180 – 210f (3.0–3.5s)   "how to scale this up?" fades in
// 210 – 270f (3.5–4.5s)   hold 1s on the new question
// 270 – 300f (4.5–5.0s)   scene fade out

const TITLE_TEXT = 'Take a real computer-use task.';

export const ComputerUseTask = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const taskOpacity = interpolate(frame, [0, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Gmail now reveals together with title + task (same fade window).
  const gmailOpacity = interpolate(frame, [0, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rewardOpacity = interpolate(frame, [60, 105], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Slide mode: drop the eraser; both texts coexist on the same row and
  // fade in independently.
  const questionOpacity = interpolate(frame, [150, 200], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const sceneOpacity = interpolate(
    frame,
    [FADE_OUT_START, SCENE_FRAMES],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#F7F4ED',
        fontFamily: PALATINO,
        color: '#1B1816',
        overflow: 'hidden',
      }}
    >
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

      <div style={{ position: 'absolute', inset: 0, opacity: sceneOpacity }}>
        {/* Big title — matches Stage 2 style */}
        <div
          style={{
            position: 'absolute',
            left: 96,
            right: 96,
            top: 88,
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 24,
            opacity: titleOpacity,
          }}
        >
          <div
            style={{
              fontFamily: PALATINO,
              fontSize: 62,
              lineHeight: 1.18,
              fontWeight: 500,
              color: '#1B1816',
              letterSpacing: '-0.005em',
            }}
          >
            {TITLE_TEXT}
          </div>
          <div
            style={{
              fontFamily: PALATINO,
              fontSize: 22,
              fontStyle: 'italic',
              color: '#9C948A',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            — example —
          </div>
        </div>

        {/* Two-column body */}
        <div
          style={{
            position: 'absolute',
            left: 96,
            right: 96,
            top: 210,
            bottom: 290,
            display: 'grid',
            gridTemplateColumns: '0.95fr 1.05fr',
            gap: 48,
          }}
        >
          {/* Task instruction card */}
          <div
            style={{
              opacity: taskOpacity,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E0D8C5',
              borderRadius: 6,
              padding: '36px 44px 28px 44px',
              boxShadow:
                '0 1px 0 rgba(27,24,22,0.04), 0 16px 30px -22px rgba(27,24,22,0.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: 22,
              position: 'relative',
            }}
          >
            {/* Big opening quote glyph */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: -16,
                left: 22,
                fontFamily: PALATINO,
                fontSize: 160,
                lineHeight: 1,
                color: '#862D1A',
                opacity: 0.16,
                fontWeight: 700,
              }}
            >
              “
            </div>

            <p
              style={{
                fontFamily: PALATINO,
                fontSize: 32,
                lineHeight: 1.5,
                color: '#1B1816',
                margin: 0,
                marginTop: 30,
              }}
            >
              Can you please send an email to each client listed in the opened{' '}
              <AppChip svg="logos/apps/notion.svg" name="Notion" color="#1B1816" />{' '}
              page using the template from{' '}
              <AppChip svg="logos/apps/gmail.svg" name="Gmail" color="#EA4335" />?
              You should attach their transactions in the{' '}
              <AppChip svg="logos/apps/excel.svg" name="Excel" color="#107C41" />{' '}
              <FileTag>&apos;clients.xlsx&apos;</FileTag> table on{' '}
              <AppChip svg="logos/apps/apple.svg" name="Desktop" color="#1B1816" />.
            </p>
          </div>

          {/* Gmail screenshot in Mac window chrome */}
          <div
            style={{
              opacity: gmailOpacity,
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 6px 24px -12px rgba(27,24,22,0.35)',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E0D8C5',
            }}
          >
            <div
              style={{
                backgroundColor: '#ECECEC',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #D5D5D5',
              }}
            >
              <div style={{ display: 'flex', gap: 8 }}>
                <Dot color="#FF5F57" />
                <Dot color="#FEBC2E" />
                <Dot color="#28C840" />
              </div>
              <div
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontFamily: MONO,
                  fontSize: 15,
                  color: '#5C5651',
                  letterSpacing: '0.02em',
                }}
              >
                Inbox — mail.google.com
              </div>
              <div style={{ width: 60 }} />
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <Img
                src={staticFile('screenshots/gmail-inbox-zero.png')}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  objectFit: 'cover',
                  objectPosition: 'top',
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom band: both texts share one row, each fades in on its own step */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 96,
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: 56,
            height: 140,
            fontFamily: PALATINO,
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
          }}
        >
          {/* "reward = ???" — fades in first */}
          <span
            style={{
              opacity: rewardOpacity,
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: 16,
            }}
          >
            <span style={{ fontSize: 60, fontWeight: 600, color: '#1B1816' }}>
              reward =
            </span>
            <span
              style={{
                fontSize: 88,
                fontWeight: 700,
                fontStyle: 'italic',
                color: '#862D1A',
              }}
            >
              ???
            </span>
          </span>

          {/* Connector arrow — appears with the question */}
          <span
            style={{
              opacity: questionOpacity,
              fontSize: 56,
              color: '#9C948A',
              transform: 'translateY(-6px)',
            }}
          >
            →
          </span>

          {/* "How to scale this up?" — fades in second */}
          <span
            style={{
              opacity: questionOpacity,
              fontSize: 60,
              fontWeight: 600,
              color: '#1B1816',
            }}
          >
            How to{' '}
            <span style={{ color: '#862D1A', fontStyle: 'italic' }}>
              scale this up
            </span>
            ?
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Inline "app chip" — real brand SVG icon rendered at the surrounding font
// size, followed by the brand name in a sans-serif font colored to match.
function AppChip({
  svg,
  name,
  color,
}: {
  svg: string;
  name: string;
  color: string;
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        verticalAlign: '-0.18em',
        marginRight: 2,
      }}
    >
      <Img
        src={staticFile(svg)}
        style={{
          width: '1em',
          height: '1em',
          display: 'inline-block',
        }}
      />
      <span
        style={{
          fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontStyle: 'normal',
          fontWeight: 600,
          color,
          letterSpacing: '-0.01em',
          fontSize: '0.92em',
        }}
      >
        {name}
      </span>
    </span>
  );
}

// Inline filename token — monospaced, lightly boxed.
function FileTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: MONO,
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: '0.86em',
        color: '#1B1816',
        backgroundColor: 'rgba(27, 24, 22, 0.06)',
        padding: '2px 8px',
        borderRadius: 4,
        verticalAlign: '0.04em',
      }}
    >
      {children}
    </span>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <div
      style={{
        width: 14,
        height: 14,
        borderRadius: '50%',
        backgroundColor: color,
      }}
    />
  );
}

// ─── Eraser: a pink rubber block that slides across as it "erases" text ──
function Eraser({ progress }: { progress: number }) {
  // The reward text is approximately 720px wide (estimated visual width).
  // Eraser starts ~100px left of the reward area and moves to ~100px right of it.
  const ERASER_WIDTH = 140;
  const ERASER_HEIGHT = 60;
  const SWEEP_DISTANCE = 980; // pixels of horizontal travel

  // Position: progress 0 → eraser at left edge of sweep, progress 1 → right edge
  const x = (progress - 0.5) * SWEEP_DISTANCE;
  // Slight tilt for hand-drawn feel
  const rotation = -8;

  return (
    <div
      style={{
        position: 'absolute',
        transform: `translateX(${x}px) rotate(${rotation}deg)`,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      {/* Eraser body */}
      <div
        style={{
          width: ERASER_WIDTH,
          height: ERASER_HEIGHT,
          background: 'linear-gradient(135deg, #F2B4A8 0%, #E89685 100%)',
          borderRadius: 6,
          border: '2px solid #1B1816',
          boxShadow: '0 6px 14px -6px rgba(27, 24, 22, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Metal band (the silver ferrule of a classic eraser) */}
        <div
          style={{
            position: 'absolute',
            top: -2,
            bottom: -2,
            left: '62%',
            width: 18,
            background: 'linear-gradient(to bottom, #C0C0C0 0%, #888888 50%, #C0C0C0 100%)',
            border: '2px solid #1B1816',
            borderTopLeftRadius: 2,
            borderBottomLeftRadius: 2,
          }}
        />
      </div>
      {/* Eraser dust/shavings trail */}
      <svg
        style={{
          position: 'absolute',
          left: ERASER_WIDTH - 20,
          top: -10,
          pointerEvents: 'none',
        }}
        width="60"
        height="80"
      >
        <circle cx="8" cy="20" r="2" fill="#9C948A" opacity="0.6" />
        <circle cx="22" cy="34" r="1.6" fill="#9C948A" opacity="0.5" />
        <circle cx="14" cy="48" r="2" fill="#9C948A" opacity="0.55" />
        <circle cx="32" cy="14" r="1.4" fill="#9C948A" opacity="0.45" />
        <circle cx="40" cy="44" r="1.8" fill="#9C948A" opacity="0.5" />
        <circle cx="50" cy="28" r="1.5" fill="#9C948A" opacity="0.4" />
      </svg>
    </div>
  );
}

export const COMPUTER_USE_TASK_FRAMES = SCENE_FRAMES;
export const COMPUTER_USE_TASK_FPS = FPS;
