import { AbsoluteFill, interpolate, useCurrentFrame } from '../lib/remotion-shim';
import { BlockMath, InlineMath } from 'react-katex';

const PALATINO =
  '"Palatino Linotype", "Palatino", "Book Antiqua", "URW Palladio L", Georgia, serif';
const MONO = 'Menlo, Monaco, "JetBrains Mono", "Cascadia Code", monospace';

const FPS = 60;
const SCENE_FRAMES = 300; // 5.0s
const FADE_OUT_FRAMES = 30;
const FADE_OUT_START = SCENE_FRAMES - FADE_OUT_FRAMES;

const TITLE_TEXT = 'RLVR works for math, SWE, terminal-use';
const QUESTION_TEXT = '🤔  but how about computer-use agents?';
// Timeline (300f / 5.0s @ 60fps):
//   0 –  60f (0.0–1.0s)  title types
//  60 –  75f (1.0–1.25s) brief pause
//  75 – 105f (1.25–1.75s) cards fade in
// 105 – 150f (1.75–2.5s) hold
// 150 – 210f (2.5–3.5s)  question types
// 210 – 270f (3.5–4.5s)  hold 1s after question completes
// 270 – 300f (4.5–5.0s)  fade out
const TITLE_TYPE_START = 0;
const TITLE_TYPE_END = 60;
const MATH_FADE_START = 75;
const MATH_FADE_END = 100;
const SWE_FADE_START = 110;
const SWE_FADE_END = 135;
const QUESTION_TYPE_START = 160;
const QUESTION_TYPE_END = 220;

export const BackgroundIntro = () => {
  const frame = useCurrentFrame();

  // Plain fade-in (no typewriter) for both title and question.
  const titleOpacity = interpolate(
    frame,
    [TITLE_TYPE_START, TITLE_TYPE_END],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const mathOpacity = interpolate(
    frame,
    [MATH_FADE_START, MATH_FADE_END],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const sweOpacity = interpolate(
    frame,
    [SWE_FADE_START, SWE_FADE_END],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const questionOpacity = interpolate(
    frame,
    [QUESTION_TYPE_START, QUESTION_TYPE_END],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

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
        {/* Title — fades in */}
        <div
          style={{
            position: 'absolute',
            left: 96,
            right: 96,
            top: 96,
            fontFamily: PALATINO,
            fontSize: 66,
            lineHeight: 1.2,
            fontWeight: 500,
            color: '#1B1816',
            letterSpacing: '-0.005em',
            opacity: titleOpacity,
          }}
        >
          {TITLE_TEXT}
        </div>

        {/* Two-column body — each card fades in separately so slide mode
            can stage them with right-arrow presses. */}
        <div
          style={{
            position: 'absolute',
            left: 96,
            right: 96,
            top: 220,
            bottom: 180,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 48,
          }}
        >
          <div style={{ opacity: mathOpacity, display: 'grid', height: '100%' }}>
            <MathCard />
          </div>
          <div style={{ opacity: sweOpacity, display: 'grid', height: '100%' }}>
            <SweCard />
          </div>
        </div>

        {/* Bottom question — fades in */}
        <div
          style={{
            position: 'absolute',
            left: 96,
            right: 96,
            bottom: 88,
            fontFamily: PALATINO,
            fontSize: 60,
            lineHeight: 1.18,
            fontWeight: 600,
            color: '#862D1A',
            letterSpacing: '-0.005em',
            opacity: questionOpacity,
          }}
        >
          {QUESTION_TEXT}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Math card — Olympiad-style integral with real KaTeX ─────────────────────
function MathCard() {
  return (
    <div
      style={{
        // "Math draft paper" feel — pure white with a faint paper-deep edge and shadow.
        backgroundColor: '#FFFFFF',
        border: '1px solid #E0D8C5',
        borderRadius: 6,
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow:
          '0 1px 0 rgba(27,24,22,0.04), 0 16px 30px -22px rgba(27,24,22,0.18)',
        fontSize: 22, // base for KaTeX scaling — reduced to keep card height in bounds
        overflow: 'hidden',
      }}
    >
      <Header label="MATH" rewardText="reward = boxed match" />

      <div>
        <Label>Problem</Label>
        <p
          style={{
            fontFamily: PALATINO,
            fontSize: 18,
            lineHeight: 1.45,
            color: '#1B1816',
            margin: '2px 0 4px 0',
          }}
        >
          Evaluate the definite integral:
        </p>
        <div style={{ fontSize: 22 }}>
          <BlockMath
            math={String.raw`I \;=\; \int_{0}^{\pi/2} \frac{\sin x}{\sin x + \cos x}\, dx`}
          />
        </div>
      </div>

      <div>
        <Label>Agent trajectory</Label>
        <ProofStep
          idx={1}
          text="Let "
          inline={String.raw`u = \tfrac{\pi}{2} - x`}
          eq={String.raw`I = \int_{0}^{\pi/2} \frac{\cos u}{\cos u + \sin u}\, du`}
        />
        <ProofStep
          idx={2}
          text="Add the two forms:"
          eq={String.raw`2I = \int_{0}^{\pi/2} 1\, dx = \tfrac{\pi}{2}`}
        />
        <ProofStep idx={3} text="∴ " inline={String.raw`\;I = \boxed{\dfrac{\pi}{4}}`} />
      </div>

      <MathRewardVisual />
    </div>
  );
}

function MathRewardVisual() {
  return (
    <div
      style={{
        marginTop: 'auto',
        padding: '16px 22px',
        borderLeft: '4px solid #862D1A',
        backgroundColor: 'rgba(134, 45, 26, 0.09)',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      {/* LEFT: small π/4 = π/4 with big ✓ MATCH emphasis */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <CompactBox value={String.raw`\dfrac{\pi}{4}`} />
        <CheckIcon size={32} />
        <span
          style={{
            fontFamily: PALATINO,
            fontSize: 26,
            fontWeight: 700,
            fontStyle: 'italic',
            color: '#1F4E37',
            letterSpacing: '0.01em',
          }}
        >
          match
        </span>
        <CompactBox value={String.raw`\dfrac{\pi}{4}`} />
      </div>
      {/* RIGHT: reward = 1 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
          fontFamily: PALATINO,
          color: '#862D1A',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 24 }}>reward =</span>
        <span style={{ fontSize: 36, lineHeight: 1 }}>1</span>
      </div>
    </div>
  );
}

function CompactBox({ value }: { value: string }) {
  return (
    <div
      style={{
        border: '1.5px solid #1B1816',
        borderRadius: 4,
        padding: '4px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
      }}
    >
      <InlineMath math={value} />
    </div>
  );
}

function CheckIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill="#1F4E37" />
      <path
        d="M5.5 10.5 L8.5 13.5 L14.5 7"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function ProofStep({
  idx,
  text,
  inline,
  eq,
}: {
  idx: number;
  text: string;
  inline?: string;
  eq?: string;
}) {
  return (
    <div style={{ marginTop: idx === 1 ? 2 : 0 }}>
      <div
        style={{
          fontFamily: PALATINO,
          fontSize: 17,
          lineHeight: 1.35,
          color: '#1B1816',
        }}
      >
        <span style={{ color: '#9C948A', marginRight: 6 }}>({idx})</span>
        {text}
        {inline && (
          <>
            {' '}
            <span style={{ fontSize: 18 }}>
              <InlineMath math={inline} />
            </span>
          </>
        )}
      </div>
      {eq && (
        <div style={{ fontSize: 18, marginTop: -4, marginBottom: -4 }}>
          <BlockMath math={eq} />
        </div>
      )}
    </div>
  );
}

// ─── SWE card — bigger terminal text ────────────────────────────────────────
function SweCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Header label="SWE" rewardText="reward = tests pass" />

      <div
        style={{
          flex: 1,
          backgroundColor: '#1E1E1E',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 6px 24px -12px rgba(27,24,22,0.35)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            backgroundColor: '#2D2D2D',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #3A3A3A',
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
              fontSize: 16,
              color: '#9C948A',
              letterSpacing: '0.02em',
            }}
          >
            bash — pytest
          </div>
          <div style={{ width: 60 }} />
        </div>

        <pre
          style={{
            fontFamily: MONO,
            fontSize: 28,
            lineHeight: 1.55,
            color: '#ECECEC',
            margin: 0,
            padding: '28px 32px',
            whiteSpace: 'pre',
            flex: 1,
          }}
        >
{`$ pytest test_cognitoidp.py::test_global_sign_out
`}<span style={{ color: '#FF6B6B' }}>{`FAILED test_global_sign_out
  AssertionError: expected NotAuthorizedException,
    got successful response — token not revoked.`}</span>{`

`}<span style={{ color: '#9C948A' }}>{`# agent patches cognitoidp/models.py:`}</span>{`
$ pytest test_cognitoidp.py::test_global_sign_out
`}<span style={{ color: '#5BD37A' }}>{`PASSED test_global_sign_out
1 passed in 0.42s`}</span>
        </pre>
      </div>

      <SweRewardVisual />
    </div>
  );
}

function SweRewardVisual() {
  return (
    <div
      style={{
        padding: '16px 22px',
        borderLeft: '4px solid #862D1A',
        backgroundColor: 'rgba(134, 45, 26, 0.09)',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      {/* LEFT: 5 big green checkboxes — the headline visual */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <PassBox key={i} />
        ))}
      </div>
      {/* RIGHT: reward = 1 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
          fontFamily: PALATINO,
          color: '#862D1A',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 24 }}>reward =</span>
        <span style={{ fontSize: 36, lineHeight: 1 }}>1</span>
      </div>
    </div>
  );
}

function PassBox() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: '#1F4E37',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
        <path
          d="M3.5 7.5 L6 10 L10.5 4.5"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

// ─── Shared sub-components ───────────────────────────────────────────────────
function Header({ label, rewardText }: { label: string; rewardText: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 18,
      }}
    >
      <span
        style={{
          fontFamily: PALATINO,
          fontSize: 16,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: '#9C948A',
          fontWeight: 500,
        }}
      >
        — {label} —
      </span>
      <span
        style={{
          fontFamily: PALATINO,
          fontSize: 17,
          fontStyle: 'italic',
          color: '#862D1A',
        }}
      >
        {rewardText}
      </span>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: PALATINO,
        fontSize: 13,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: '#9C948A',
        fontWeight: 500,
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  );
}

function RewardBlock({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 'auto',
        padding: '14px 18px',
        borderLeft: '3px solid #862D1A',
        backgroundColor: 'rgba(134, 45, 26, 0.06)',
        borderRadius: 4,
      }}
    >
      <pre
        style={{
          fontFamily: MONO,
          fontSize: 16,
          lineHeight: 1.5,
          color: '#1B1816',
          margin: 0,
          whiteSpace: 'pre',
        }}
      >
        {children}
      </pre>
    </div>
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

export const BACKGROUND_INTRO_FRAMES = SCENE_FRAMES;
export const BACKGROUND_INTRO_FPS = FPS;
