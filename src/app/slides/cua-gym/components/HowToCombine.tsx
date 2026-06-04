import { useEffect, useRef, useState } from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from '../lib/remotion-shim';

const PALATINO =
  '"Palatino Linotype", "Palatino", "Book Antiqua", "URW Palladio L", Georgia, serif';
const MONO = 'Menlo, Monaco, "JetBrains Mono", "Cascadia Code", monospace';

// Reused verbatim from cua-gym-homepage/src/components/StateInjectionDemo.tsx
const MOCK_BASE = 'https://cua-gym-gmail.xlang.ai';
const DEMOS = [
  {
    sid: 'demo-inbox-zero',
    title: 'Monday, inbox zero',
    description:
      'The user logged off Friday with a clean inbox. Three system newsletters trickled in over the weekend. Nothing unread, no drafts.',
  },
  {
    sid: 'demo-project-crunch',
    title: 'Mid-sprint, paper deadline approaching',
    description:
      'Twenty-five threads piled up over twelve hours — PR review pings, Sentry alerts, an urgent RFC sign-off. One draft sits in Compose.',
  },
  {
    sid: 'demo-vacation-aftermath',
    title: 'First morning back from a week off',
    description:
      'Eighty-one emails waiting. Forty-one in Primary alone — coworker pings, customer follow-ups, conference invites, recruiters.',
  },
];

function fadeIn(frame: number, start: number, end: number) {
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

export const HowToCombine = () => {
  const frame = useCurrentFrame();

  // Per-step reveal
  const sessionOp = fadeIn(frame, 30, 70);
  const stateTextOp = fadeIn(frame, 130, 170);
  const iframesOp = fadeIn(frame, 230, 270);

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
          fontSize: 54,
          fontWeight: 500,
          color: '#1B1816',
          letterSpacing: '-0.005em',
          lineHeight: 1.16,
        }}
      >
        How do we combine{' '}
        <span style={{ color: '#862D1A', fontWeight: 700 }}>environments</span>{' '}
        and{' '}
        <span style={{ color: '#862D1A', fontWeight: 700 }}>tasks</span>?
      </div>

      {/* (1) Session isolation — short */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 180,
          opacity: sessionOp,
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
            color: '#1B1816',
            letterSpacing: '0.06em',
            flexShrink: 0,
            minWidth: 320,
          }}
        >
          (1) Session isolation
        </span>
        <span
          style={{
            fontFamily: PALATINO,
            fontSize: 28,
            lineHeight: 1.4,
            color: '#1B1816',
            letterSpacing: '-0.005em',
          }}
        >
          Every URL carries its own session id; parallel RL workers training on
          the same mock <Strong>never see one another&apos;s changes</Strong> —
          critical for distributed rollouts.
        </span>
      </div>

      {/* (2) State injection — longer + figure */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 320,
          opacity: stateTextOp,
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
            color: '#1B1816',
            letterSpacing: '0.06em',
            flexShrink: 0,
            minWidth: 320,
          }}
        >
          (2) State injection
        </span>
        <span
          style={{
            fontFamily: PALATINO,
            fontSize: 26,
            lineHeight: 1.4,
            color: '#1B1816',
            letterSpacing: '-0.005em',
          }}
        >
          When a task is created, the synthesis pipeline ships a JSON initial
          state alongside its <Code>reward.py</Code> and posts it to the mock;
          loading <Code>?sid=&lt;task_id&gt;</Code> renders that exact world —
          emails, project boards, calendars, customer tickets, whatever the
          task description calls for, so{' '}
          <Strong>
            a single mock can host arbitrarily many distinct task worlds with
            no code change
          </Strong>
          .
        </span>
      </div>

      {/* 3 live iframes — same gmail_mock, three different ?sid= → three worlds */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 560,
          bottom: 50,
          opacity: iframesOp,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 28,
        }}
      >
        {DEMOS.map((demo) => (
          <DemoCard key={demo.sid} demo={demo} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

function DemoCard({ demo }: { demo: (typeof DEMOS)[number] }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        // Critical: without minWidth:0 the iframe's intrinsic 1440px width
        // becomes the grid item's min-content and blows the columns out.
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontFamily: PALATINO,
          fontSize: 22,
          fontWeight: 700,
          color: '#1B1816',
          letterSpacing: '-0.005em',
          lineHeight: 1.2,
        }}
      >
        {demo.title}
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: PALATINO,
          fontSize: 16,
          lineHeight: 1.45,
          color: '#5C5651',
          letterSpacing: '-0.003em',
          height: 70,
          overflow: 'hidden',
        }}
      >
        {demo.description}
      </div>
      <FittedIframe sid={demo.sid} label={demo.title} />
      <a
        href={`${MOCK_BASE}/?sid=${demo.sid}`}
        target="_blank"
        rel="noreferrer"
        style={{
          marginTop: 8,
          alignSelf: 'flex-end',
          fontFamily: MONO,
          fontSize: 13,
          color: '#5C5651',
          textDecoration: 'none',
        }}
      >
        open in new tab ↗
      </a>
    </div>
  );
}

// FittedIframe — same approach as homepage: render the Gmail mock at a fixed
// "desktop logical" viewport (1440×900) and use CSS scale to fit the card.
function FittedIframe({ sid, label }: { sid: string; label: string }) {
  const LOGICAL_W = 1440;
  const LOGICAL_H = 900;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.36);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      const w = containerRef.current?.clientWidth ?? 0;
      if (w > 0) setScale(w / LOGICAL_W);
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const cardHeight = LOGICAL_H * scale;

  return (
    <div
      ref={containerRef}
      style={{
        marginTop: 14,
        width: '100%',
        height: cardHeight,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#E0D8C5',
        border: '1px solid #E0D8C5',
        borderRadius: 6,
      }}
    >
      <iframe
        src={`${MOCK_BASE}/?sid=${sid}`}
        title={`Gmail mock — ${label}`}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
        // Absolute-position the iframe inside the (overflow:hidden) container
        // so its intrinsic 1440px width doesn't bloat any ancestor's layout.
        // pointerEvents kept default → the live Gmail mock is interactive.
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: LOGICAL_W,
          height: LOGICAL_H,
          border: 0,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      />
    </div>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ color: '#862D1A', fontWeight: 600 }}>{children}</span>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: '0.85em',
        backgroundColor: 'rgba(27,24,22,0.06)',
        padding: '1px 6px',
        borderRadius: 4,
      }}
    >
      {children}
    </span>
  );
}
