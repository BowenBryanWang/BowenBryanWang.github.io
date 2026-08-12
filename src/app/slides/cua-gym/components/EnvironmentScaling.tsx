import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from '../lib/remotion-shim';

const PALATINO =
  '"Palatino Linotype", "Palatino", "Book Antiqua", "URW Palladio L", Georgia, serif';
const MONO = 'Menlo, Monaco, "JetBrains Mono", "Cascadia Code", monospace';

const FPS = 60;
const SCENE_FRAMES = 480; // 8.0s
const FADE_OUT_FRAMES = 36;
const FADE_OUT_START = SCENE_FRAMES - FADE_OUT_FRAMES;

// Timeline (480f / 8.0s @ 60fps):
//   0 –  60  title fades in
//  60 – 180  subtitle fades in
// 120 – 332  7 category panels cascade in (rows 1→3, stagger 28f, fade 44f)
// 120 – 444  thumb auto-scroll continues throughout
// 444 – 480  fade out

// Category palette + spans (homepage Gallery LAYOUT, in row order).
type CategoryConfig = {
  name: string;
  short: string;
  span: number;
  tint: string;
  ink: string;
  slugs: string[];
};

const CATEGORIES: CategoryConfig[] = [
  {
    name: 'Communication & Social',
    short: 'Communication',
    span: 7,
    tint: '#E2EAF1',
    ink: '#314A6B',
    slugs: [
      'discord', 'dingtalk', 'facebook', 'feishu', 'gmail', 'instagram',
      'linkedin', 'microsoft-teams', 'outlook-web', 'pinterest', 'reddit',
      'slack', 'twitter', 'wechat', 'weibo', 'xiaohongshu', 'zhihu', 'zoom-web',
    ],
  },
  {
    name: 'Productivity & Documents',
    short: 'Productivity',
    span: 5,
    tint: '#F0E0E5',
    ink: '#7A2440',
    slugs: [
      'airtable', 'asana', 'canvas-lms', 'google-calendar', 'google-docs',
      'google-drive', 'google-sheets', 'jira', 'lattice', 'linear',
      'lucidchart', 'miro', 'monday', 'notion', 'openreview', 'trello',
    ],
  },
  {
    name: 'Development & Cloud',
    short: 'Development',
    span: 5,
    tint: '#E2DEEC',
    ink: '#3F3470',
    slugs: [
      'aws-console', 'azure', 'aliyun', 'circleci', 'cloudflare', 'datadog',
      'github', 'gitlab', 'postman', 'sentry', 'vercel', 'wandb',
    ],
  },
  {
    name: 'Finance & Enterprise',
    short: 'Finance',
    span: 7,
    tint: '#EBE2C8',
    ink: '#5C4811',
    slugs: [
      'bamboohr', 'clio', 'coinbase', 'contractbook', 'docusign', 'expensify',
      'greenhouse', 'gusto', 'hubspot', 'hubspot-marketing', 'paypal',
      'quickbooks', 'robinhood', 'salesforce', 'sap', 'servicenow',
      'stripe-dashboard', 'tradingview', 'workday',
    ],
  },
  {
    name: 'E-commerce & Travel',
    short: 'E-commerce',
    span: 4,
    tint: '#F2E0CC',
    ink: '#7A4A1A',
    slugs: [
      'amazon', 'amazon-seller', 'booking-com', 'ebay', 'expedia', 'instacart',
      'shopify-admin', 'taobao-seller', 'tripadvisor', 'uber-eats', 'woocommerce',
    ],
  },
  {
    name: 'Analytics & Marketing',
    short: 'Analytics',
    span: 4,
    tint: '#DCE9DE',
    ink: '#27593A',
    slugs: [
      'amplitude', 'google-ads', 'google-analytics', 'hotjar', 'klaviyo',
      'looker-studio', 'mailchimp', 'meta-ads', 'mixpanel', 'tableau',
    ],
  },
  {
    name: 'Other',
    short: 'Other',
    span: 4,
    tint: '#E8DEC8',
    ink: '#5A4520',
    slugs: ['12306', 'adp', 'epic-health', 'google-flights', 'westlaw', 'youtube', 'zendesk', 'zillow'],
  },
];

// Row layout (sums of spans = 12 each row).
const ROWS: number[][] = [
  [0, 1],       // Communication (7) + Productivity (5)
  [2, 3],       // Development (5) + Finance (7)
  [4, 5, 6],    // E-commerce (4) + Analytics (4) + Other (4)
];

// Slide-mode limitations narrative (3 bullets, then transition to gallery).
const LIM_FADE_OUT_START = 320;
const LIM_FADE_OUT_END = 360;
const GALLERY_FADE_IN_START = 340;
const GALLERY_FADE_IN_END = 400;

const LIMITATIONS = [
  {
    head: 'OSWorld & WebArena cover only limited applications',
    body: 'drifting further from the authentic domains where computer-use agents are expected to operate.',
  },
  {
    head: 'Agents need to transfer quickly to unseen domains and apps',
    body: 'so the training distribution has to cover the long tail, not just a few canonical desktop tools.',
  },
  {
    head: 'Real apps can’t be deployed as RL environments',
    body: 'they are not sandboxes — no state injection, no parallel isolation, no resetability.',
  },
];

export const EnvironmentScaling = ({
  titleOverride,
}: {
  titleOverride?: string
}) => {
  const frame = useCurrentFrame();

  const titleOp = fadeIn(frame, 0, 60);
  // Phase-1 subtitle (limitations intro) vs phase-2 subtitle (CUA-Gym-Hub
  // recap). We swap them at the same beat as the limitations fade out.
  const subPhase1Op =
    fadeIn(frame, 30, 90) *
    interpolate(frame, [LIM_FADE_OUT_START, LIM_FADE_OUT_END], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  const subPhase2Op = fadeIn(frame, GALLERY_FADE_IN_START, GALLERY_FADE_IN_END);
  const galleryOp = fadeIn(frame, GALLERY_FADE_IN_START, GALLERY_FADE_IN_END);

  const lim1Op =
    fadeIn(frame, 100, 140) *
    interpolate(frame, [LIM_FADE_OUT_START, LIM_FADE_OUT_END], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  const lim2Op =
    fadeIn(frame, 170, 210) *
    interpolate(frame, [LIM_FADE_OUT_START, LIM_FADE_OUT_END], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  const lim3Op =
    fadeIn(frame, 240, 280) *
    interpolate(frame, [LIM_FADE_OUT_START, LIM_FADE_OUT_END], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  const sceneOp = interpolate(
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
      {/* Faint grid + sine background */}
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

      {/* Inline keyframes — drives continuous thumb scrolling regardless of
          the slide's current frame value. */}
      <style>{`
        @keyframes cuagym-thumb-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(var(--scroll-end, -1000px)); }
        }
      `}</style>

      <div style={{ position: 'absolute', inset: 0, opacity: sceneOp }}>
        {/* Title + subtitle (two-phase: limitations intro, then CUA-Gym-Hub recap) */}
        <div
          style={{
            position: 'absolute',
            left: 96,
            right: 96,
            top: 70,
          }}
        >
          <div
            style={{
              fontFamily: PALATINO,
              fontSize: 56,
              lineHeight: 1.18,
              fontWeight: 500,
              color: '#1B1816',
              letterSpacing: '-0.005em',
              opacity: titleOp,
            }}
          >
            {titleOverride ?? (
              <>
                CUA RLVR still needs another scale axis:{' '}
                <span style={{ color: '#862D1A', fontStyle: 'italic', fontWeight: 600 }}>
                  environments
                </span>
                .
              </>
            )}
          </div>

          {/* Phase-1 subtitle: leads into the 3 limitations */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 88,
              fontFamily: PALATINO,
              fontSize: 28,
              lineHeight: 1.4,
              color: '#5C5651',
              letterSpacing: '-0.003em',
              opacity: subPhase1Op,
            }}
          >
            Three limitations stand in the way of training computer-use agents at scale.
          </div>

          {/* Phase-2 subtitle: CUA-Gym-Hub recap (appears once limitations fade) */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 88,
              fontFamily: PALATINO,
              fontSize: 28,
              lineHeight: 1.4,
              color: '#5C5651',
              letterSpacing: '-0.003em',
              opacity: subPhase2Op,
            }}
          >
            We build{' '}
            <span style={{ fontWeight: 600, color: '#1B1816' }}>CUA-Gym-Hub</span>
            : <span style={{ fontWeight: 600, color: '#1B1816' }}>98</span>{' '}
            self-contained mock applications across{' '}
            <span style={{ fontWeight: 600, color: '#1B1816' }}>7</span>{' '}
            domains — all state-injectable and parallel-isolated.
          </div>
        </div>

        {/* Limitations — three numbered bullets fading in one by one,
            then fading out together when the gallery enters. */}
        <div
          style={{
            position: 'absolute',
            left: 200,
            right: 200,
            top: 320,
            display: 'flex',
            flexDirection: 'column',
            gap: 36,
          }}
        >
          <LimitationItem
            n={1}
            head={LIMITATIONS[0].head}
            body={LIMITATIONS[0].body}
            opacity={lim1Op}
          />
          <LimitationItem
            n={2}
            head={LIMITATIONS[1].head}
            body={LIMITATIONS[1].body}
            opacity={lim2Op}
          />
          <LimitationItem
            n={3}
            head={LIMITATIONS[2].head}
            body={LIMITATIONS[2].body}
            opacity={lim3Op}
          />
        </div>

        {/* Gallery — appears all at once once limitations clear */}
        <div
          style={{
            position: 'absolute',
            left: 64,
            right: 64,
            top: 290,
            bottom: 70,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            opacity: galleryOp,
          }}
        >
          {ROWS.map((row, rowIdx) => (
            <div
              key={rowIdx}
              style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: row.map((i) => `${CATEGORIES[i].span}fr`).join(' '),
                gap: 14,
              }}
            >
              {row.map((catIdx) => (
                <div
                  key={catIdx}
                  style={{
                    // `minWidth: 0` is critical here: without it, the
                    // panel's intrinsic content (3× duplicated thumb band)
                    // forces the grid item to its natural width, collapsing
                    // sibling columns out of view.
                    minWidth: 0,
                    overflow: 'hidden',
                  }}
                >
                  <CategoryPanel cfg={CATEGORIES[catIdx]} seed={catIdx} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

function LimitationItem({
  n,
  head,
  body,
  opacity,
}: {
  n: number;
  head: string;
  body: string;
  opacity: number;
}) {
  return (
    <div
      style={{
        opacity,
        display: 'flex',
        alignItems: 'baseline',
        gap: 28,
        fontFamily: PALATINO,
        color: '#1B1816',
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: 28,
          fontWeight: 700,
          color: '#862D1A',
          letterSpacing: '0.04em',
          flexShrink: 0,
          minWidth: 50,
        }}
      >
        ({n})
      </span>
      <div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 600,
            lineHeight: 1.25,
            letterSpacing: '-0.005em',
            color: '#1B1816',
          }}
        >
          {head}
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 34,
            lineHeight: 1.25,
            color: '#5C5651',
            letterSpacing: '-0.005em',
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
}

function fadeIn(frame: number, start: number, end: number) {
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

const CARD_WIDTH = 170;
const CARD_GAP = 10;
const CARD_PITCH = CARD_WIDTH + CARD_GAP;

function CategoryPanel({
  cfg,
  seed,
}: {
  cfg: CategoryConfig;
  seed: number;
}) {
  const slugs = cfg.slugs;

  // CSS-driven continuous horizontal scroll — runs on the browser's render
  // timeline so it never pauses when the slide-mode frame value sits still.
  // Each panel gets a slightly different duration + delay so the bands look
  // mechanical-out-of-phase across the grid.
  const numCopies = Math.max(3, Math.ceil(24 / Math.max(slugs.length, 1)));
  const setWidth = slugs.length * CARD_PITCH;
  const speedPxPerSec = (2.3 + (seed % 3) * 0.25) * 60;
  const durationSec = setWidth / speedPxPerSec;
  // Negative delay starts the animation mid-cycle — gives each panel its own phase.
  const delaySec = -(((seed * 0.43) % 1) * durationSec);

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: cfg.tint,
        borderRadius: 16,
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontFamily: PALATINO,
            fontSize: 22,
            fontWeight: 600,
            color: cfg.ink,
            letterSpacing: '-0.005em',
          }}
        >
          {cfg.name}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 14,
            color: cfg.ink,
            opacity: 0.55,
            letterSpacing: '0.18em',
          }}
        >
          {slugs.length}
        </span>
      </div>

      {/* Scrolling thumb band */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Edge gradient masks */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: 40,
            zIndex: 2,
            background: `linear-gradient(to right, ${cfg.tint} 0%, ${cfg.tint}00 100%)`,
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: 40,
            zIndex: 2,
            background: `linear-gradient(to left, ${cfg.tint} 0%, ${cfg.tint}00 100%)`,
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: CARD_GAP,
            height: '100%',
            willChange: 'transform',
            animation: `cuagym-thumb-scroll ${durationSec}s linear infinite`,
            animationDelay: `${delaySec}s`,
            // CSS custom prop consumed by the @keyframes (see top of scene)
            ...({ ['--scroll-end' as string]: `-${setWidth}px` } as React.CSSProperties),
          }}
        >
          {/* Repeat enough times so even small categories (e.g. Other with
              only 4 slugs after filtering) form a dense, continuously-scrolling
              band — sparse panels look empty during the scroll loop. */}
          {Array.from({ length: numCopies })
            .flatMap(() => slugs)
            .map((slug, i) => (
              <ThumbCard key={`${slug}-${i}`} slug={slug} ink={cfg.ink} />
            ))}
        </div>
      </div>
    </div>
  );
}

function ThumbCard({ slug, ink }: { slug: string; ink: string }) {
  return (
    <div
      style={{
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        width: 170,
      }}
    >
      <div
        style={{
          flex: 1,
          aspectRatio: '8 / 5',
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(27,24,22,0.06)',
          boxShadow: '0 1px 0 rgba(27,24,22,0.04)',
        }}
      >
        <Img
          src={staticFile(`thumbs/${slug}.webp`)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top',
            display: 'block',
          }}
        />
      </div>
      <div
        style={{
          marginTop: 6,
          paddingLeft: 2,
          fontFamily: PALATINO,
          fontSize: 13,
          fontWeight: 500,
          color: ink,
          letterSpacing: '-0.005em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {slug}
      </div>
    </div>
  );
}

export const ENVIRONMENT_SCALING_FRAMES = SCENE_FRAMES;
export const ENVIRONMENT_SCALING_FPS = FPS;
