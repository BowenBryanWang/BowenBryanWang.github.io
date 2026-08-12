import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from '../lib/remotion-shim';
import { InlineMath } from 'react-katex';

const PALATINO =
  '"Palatino Linotype", "Palatino", "Book Antiqua", "URW Palladio L", Georgia, serif';
const CODE_FONT =
  'Consolas, "Cascadia Code", "JetBrains Mono", "SF Mono", ui-monospace, Menlo, monospace';

// Dark panel palette — carried over from cua-gym.xlang.ai PipelineFigure
const C = {
  panel: '#2A2C32',
  panelDeep: '#22242A',
  panelHead: '#15161A',
  border: 'rgba(255,255,255,0.08)',
  ink: '#E8E2D5',
  inkSoft: '#A09A8E',
  amber: '#E8C273',
  cyan: '#7BB7C9',
  pink: '#E07A86',
  red: '#D85959',
  green: '#7DAB7B',
};
const TRAFFIC = { red: '#FF5F57', yellow: '#FEBC2E', green: '#28C840' };

// Python syntax-highlight palette (One Dark)
const PY = {
  kw: '#C678DD',
  fn: '#61AFEF',
  ident: '#E06C75',
  builtin: '#D19A66',
  punc: '#ABB2BF',
  text: '#ABB2BF',
};

const FPS = 60;
const SCENE_FRAMES = 300; // 5.0s
const FADE_OUT_FRAMES = 30;
const FADE_OUT_START = SCENE_FRAMES - FADE_OUT_FRAMES;

// Timeline (300f / 5.0s @ 60fps): all cards present from frame 0
// (no cascade reveal). Only scene fade-out animates.
//   0 – 270  hold (every component rendered, discriminator overlay = green ✓)
// 270 – 300  scene fade out

export const RewardScripter = ({
  titleOverride,
}: {
  titleOverride?: string
}) => {
  const frame = useCurrentFrame();

  // Slide mode: restore staggered reveal so right-arrow steps walk through
  // the pipeline (orchestrator → 3 columns → generator → discriminator).
  const titleOp = fadeIn(frame, 0, 30);
  const orchOp = fadeIn(frame, 60, 120);
  const orchScale = interpolate(frame, [60, 120], [0.96, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const colA1Op = fadeIn(frame, 130, 170);
  const colA2Op = fadeIn(frame, 170, 210);
  const colA3Op = fadeIn(frame, 210, 250);
  const colBOp = fadeIn(frame, 280, 330);
  const colCOp = fadeIn(frame, 360, 410);
  const genOp = fadeIn(frame, 440, 510);
  const discOp = fadeIn(frame, 540, 610);
  const barrierOp = fadeIn(frame, 570, 620);
  // Discriminator overlay flips red ✗ → green ✓ once disc card lands.
  const overlayProgress = interpolate(frame, [610, 660], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Slide step 8/9: main pipeline compresses to make room for Filter on the
  // right. mainRight grows from 96 (full width) → 720 (leaving room).
  const mainRight = interpolate(frame, [680, 740], [96, 720], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const filterOp = interpolate(frame, [690, 750], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rolloutsOp = interpolate(frame, [780, 840], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const dOutputOp = interpolate(frame, [840, 880], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Slide mode: never fade the scene out — slides are driven by step frames
  // that can exceed the video's original 300-frame scene window.
  const sceneOp = 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#F7F4ED',
        fontFamily: PALATINO,
        color: '#1B1816',
        overflow: 'hidden',
      }}
    >
      {/* Faint grid + sine — constant background */}
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

      <div style={{ position: 'absolute', inset: 0, opacity: sceneOp }}>
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
            opacity: titleOp,
          }}
        >
          {titleOverride ?? (
            <>
              We hand reward writing off to a{' '}
              <span style={{ color: '#862D1A', fontStyle: 'italic', fontWeight: 600 }}>
                coding agent
              </span>
              .
            </>
          )}
        </div>

        {/* Orchestrator dark window — narrows when the Filter card slides in
            from the right (step 8). */}
        <div
          style={{
            position: 'absolute',
            left: 96,
            right: mainRight,
            top: 200,
            bottom: 80,
            opacity: orchOp,
            transform: `scale(${orchScale})`,
            transformOrigin: 'center top',
          }}
        >
          <DarkCard head="Orchestrator" headColor={C.amber}>
            <div
              style={{
                padding: '22px 24px 14px 24px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1.2fr',
                columnGap: 32,
                fontSize: 21,
                color: C.ink,
              }}
            >
              {/* Col A — Loading commands, revealed top-to-bottom */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ opacity: colA1Op }}>
                  <Cmd>
                    Loading <InlineTag color={C.cyan}>Task</InlineTag>
                  </Cmd>
                </div>
                <div style={{ opacity: colA2Op }}>
                  <Cmd>
                    Loading <InlineTag color={C.amber}>Context</InlineTag>
                  </Cmd>
                </div>
                <div style={{ opacity: colA3Op }}>
                  <Cmd>
                    Label <InlineTag color={C.pink}>Properties</InlineTag>
                  </Cmd>
                  <ul
                    style={{
                      marginLeft: 26,
                      marginTop: 6,
                      fontSize: 18,
                      lineHeight: 1.55,
                      color: C.inkSoft,
                      listStyle: 'none',
                      padding: 0,
                    }}
                  >
                    <li>· difficulty</li>
                    <li>· domain</li>
                    <li>· involved apps</li>
                  </ul>
                </div>
              </div>

              {/* Col B — VM screenshots (appears after Col A) */}
              <div style={{ opacity: colBOp }}>
                <Cmd>Prepare VM environments</Cmd>
                <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <ScreenshotMini src="pipeline/asset_1.png" />
                  <ScreenshotMini src="pipeline/asset_1.png" />
                </div>
              </div>

              {/* Col C — Agent loop code (appears after Col B) */}
              <div style={{ opacity: colCOp }}>
                <Cmd>Spawn Agent Loop</Cmd>
                <AgentLoopCode />
              </div>
            </div>

            {/* Generator + Discriminator side by side, with INFO ISOLATION barrier */}
            <div
              style={{
                position: 'relative',
                padding: '4px 22px 22px 22px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 18,
              }}
            >
              <div style={{ opacity: genOp }}>
                <DarkSubCard title="Generator" titleColor="#E8946F">
                  <Prompt>
                    Loading <b>Task</b> and <b>Skills</b>
                  </Prompt>
                  <Prompt>
                    Build envs from <AmberTag>initial_setup.py</AmberTag> &amp;{' '}
                    <AmberTag>golden_patch.py</AmberTag>
                  </Prompt>
                  <div style={{ marginTop: 8, marginBottom: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <ScreenshotLabeled
                      src="pipeline/asset_2.png"
                      label="Initial Env"
                      labelColor={C.cyan}
                    />
                    <ScreenshotLabeled
                      src="pipeline/asset_3.png"
                      label="Golden Env"
                      labelColor={C.amber}
                    />
                  </div>
                  <Prompt muted>Revise &amp; retry if rejected</Prompt>
                </DarkSubCard>
              </div>

              <div style={{ opacity: discOp }}>
                <DarkSubCard title="Discriminator" titleColor={C.cyan}>
                  <Prompt>
                    Loading <b>Task</b> and <b>Reward Skills</b>
                  </Prompt>
                  <Prompt prompt="">Decompose rewarding criteria</Prompt>
                  <ul
                    style={{
                      marginLeft: 20,
                      marginTop: 6,
                      marginBottom: 8,
                      fontSize: 16,
                      lineHeight: 1.5,
                      color: C.inkSoft,
                      listStyle: 'none',
                      padding: 0,
                    }}
                  >
                    <li>· emails exist in Sent...</li>
                    <li>· reward email content match template...</li>
                    <li>· recipients match Notion DB...</li>
                  </ul>
                  <Prompt>
                    Draft <AmberTag>reward.py</AmberTag> &amp; verify in real envs.
                  </Prompt>
                  <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <ScreenshotLabeled
                      src="pipeline/asset_2.png"
                      overlay={overlayProgress > 0.5 ? null : 'x'}
                    />
                    <ScreenshotLabeled
                      src="pipeline/asset_3.png"
                      overlay={overlayProgress > 0.5 ? 'check' : null}
                    />
                  </div>
                  <Prompt muted>
                    If not <i>fulfilled</i> ⟶ feedback &amp; retry
                  </Prompt>
                </DarkSubCard>
              </div>

              {/* INFORMATION ISOLATION barrier between Gen and Disc */}
              <InfoIsolation opacity={barrierOp} />
            </div>
          </DarkCard>
        </div>

        {/* ─── FILTER MODULE — slides in from the right at step 8 ─────── */}
        <FilterCard
          filterOp={filterOp}
          rolloutsOp={rolloutsOp}
        />

        {/* ─── D = {(t, s, r)} — output below filter, step 9 ────────── */}
        <div
          style={{
            position: 'absolute',
            right: 96,
            bottom: 90,
            width: 580,
            textAlign: 'center',
            fontFamily: PALATINO,
            fontSize: 38,
            color: '#1B1816',
            opacity: dOutputOp,
          }}
        >
          <InlineMath math={String.raw`\mathcal{D} = \{(t,\, s,\, r)\}`} />
        </div>

      </div>
    </AbsoluteFill>
  );
};

// ─── Animation helper ───────────────────────────────────────────────────────
function fadeIn(frame: number, start: number, end: number) {
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

// ─── Filter card (ported from homepage PipelineFigure right column) ────────
const VOTING_ROWS = [
  { label: 'consistency',   score: 92 },
  { label: 'executability', score: 88 },
  { label: 'hack-risk',     score: 95 },
  { label: 'clarity',       score: 90 },
  { label: 'difficulty',    score: 76 },
];

function FilterCard({
  filterOp,
  rolloutsOp,
}: {
  filterOp: number;
  rolloutsOp: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        right: 96,
        top: 200,
        bottom: 200,
        width: 580,
        backgroundColor: '#F7F4ED',
        border: '1px solid #E0D8C5',
        borderRadius: 14,
        padding: '28px 32px',
        boxSizing: 'border-box',
        boxShadow:
          '0 1px 0 rgba(27,24,22,0.04), 0 24px 50px -30px rgba(27,24,22,0.25)',
        opacity: filterOp,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Header: pink dot + FILTER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: '#E07A86',
          }}
        />
        <span
          style={{
            fontFamily: CODE_FONT,
            fontSize: 18,
            letterSpacing: '0.32em',
            color: '#A09A8E',
            fontWeight: 500,
          }}
        >
          FILTER
        </span>
      </div>

      {/* > LLM MAJORITY VOTING */}
      <FilterSubHead>&gt; &nbsp;LLM MAJORITY VOTING</FilterSubHead>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {VOTING_ROWS.map((r) => (
          <ProgressRow key={r.label} label={r.label} score={r.score} />
        ))}
      </ul>

      {/* dashed separator */}
      <div
        style={{
          height: 1,
          borderTop: '1px dashed rgba(31,42,26,0.22)',
          margin: '4px 0 8px 0',
        }}
      />

      {/* > TEACHER MODEL ROLLOUTS — fades in at step 9 */}
      <div style={{ opacity: rolloutsOp, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <FilterSubHead>&gt; &nbsp;TEACHER MODEL ROLLOUTS</FilterSubHead>
        <Img
          src={staticFile('asset_4.png')}
          style={{ width: '100%', height: 100, objectFit: 'contain', display: 'block' }}
        />
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontFamily: PALATINO,
            fontSize: 20,
            color: '#3F3D33',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <RolloutBullet>
            Calculate{' '}
            <span style={{ fontSize: 22 }}>
              <InlineMath math={String.raw`\cos(t,\, r)`} />
            </span>
          </RolloutBullet>
          <RolloutBullet>
            Check{' '}
            <span style={{ fontSize: 22 }}>
              <InlineMath math={String.raw`\mathrm{reward}_{\mathrm{log}}`} />
            </span>
          </RolloutBullet>
          <RolloutBullet>
            Use VLM-as-a-judge to review{' '}
            <span style={{ fontSize: 22 }}>
              <InlineMath math={String.raw`s_n`} />
            </span>
          </RolloutBullet>
          <RolloutBullet>Alignment check</RolloutBullet>
        </ul>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: PALATINO,
            fontSize: 22,
            fontWeight: 700,
            color: '#1F6E3F',
            marginTop: 4,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="10" fill="#1F6E3F" />
            <path
              d="M6 11.5 L9.5 15 L16 8"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span>Pass</span>
        </div>
      </div>
    </div>
  );
}

function FilterSubHead({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: CODE_FONT,
        fontSize: 15,
        letterSpacing: '0.28em',
        color: '#5C5651',
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );
}

function ProgressRow({ label, score }: { label: string; score: number }) {
  return (
    <li>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          fontFamily: PALATINO,
          fontSize: 20,
          color: '#1B1816',
          marginBottom: 4,
        }}
      >
        <span>{label}</span>
        <span style={{ fontFamily: CODE_FONT, fontVariantNumeric: 'tabular-nums', color: '#5C5651' }}>
          {score}
        </span>
      </div>
      <div
        style={{
          height: 4,
          backgroundColor: '#E2DDD2',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: '100%',
            backgroundColor: '#E07A86',
            borderRadius: 2,
          }}
        />
      </div>
    </li>
  );
}

function RolloutBullet({ children }: { children: React.ReactNode }) {
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
      }}
    >
      <span style={{ color: '#A09A8E' }}>·</span>
      <span>{children}</span>
    </li>
  );
}

// ─── Dark card with mac traffic lights (Orchestrator outer) ────────────────
function DarkCard({
  head,
  headColor,
  children,
}: {
  head: string;
  headColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        height: '100%',
        backgroundColor: C.panel,
        borderRadius: 12,
        boxShadow: `inset 0 0 0 1px ${C.border}, 0 18px 36px -18px rgba(0,0,0,0.5)`,
        overflow: 'hidden',
        fontFamily: CODE_FONT,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          position: 'relative',
          padding: '12px 18px',
          background: 'linear-gradient(180deg, #2C2E34 0%, #232529 100%)',
          color: C.ink,
          borderBottom: `1px solid ${C.border}`,
          textAlign: 'center',
        }}
      >
        <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 6 }}>
          <Dot color={TRAFFIC.red} size={12} />
          <Dot color={TRAFFIC.yellow} size={12} />
          <Dot color={TRAFFIC.green} size={12} />
        </span>
        <span style={{ fontFamily: CODE_FONT, fontSize: 16, fontWeight: 600, color: headColor }}>
          {head}
        </span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

function DarkSubCard({
  title,
  titleColor,
  children,
}: {
  title: string;
  titleColor: string;
  children: React.ReactNode;
}) {
  // Convert the accent hex into rgba so we can tint the ring + background.
  return (
    <div
      style={{
        backgroundColor: '#2E3037',
        borderRadius: 10,
        boxShadow: `
          inset 0 0 0 1.5px ${titleColor}66,
          0 0 0 1px ${titleColor}33,
          0 14px 30px -16px ${titleColor}55,
          0 0 28px -10px ${titleColor}55
        `,
        fontFamily: CODE_FONT,
      }}
    >
      <div
        style={{
          position: 'relative',
          padding: '8px 12px',
          background: 'linear-gradient(180deg, #2A2C32 0%, #202126 100%)',
          color: C.ink,
          borderBottom: `1px solid ${C.border}`,
          textAlign: 'center',
        }}
      >
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 4 }}>
          <Dot color={TRAFFIC.red} size={9} />
          <Dot color={TRAFFIC.yellow} size={9} />
          <Dot color={TRAFFIC.green} size={9} />
        </span>
        <span style={{ fontFamily: CODE_FONT, fontSize: 14, fontWeight: 600, color: titleColor }}>
          {title}
        </span>
      </div>
      <div
        style={{
          padding: '12px 16px 14px 16px',
          fontSize: 18,
          color: C.ink,
          fontFamily: CODE_FONT,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Cmd({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontFamily: CODE_FONT }}>
      <span style={{ fontFamily: CODE_FONT, color: C.amber }}>$</span>
      <span style={{ color: C.ink }}>{children}</span>
    </div>
  );
}

function InlineTag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      style={{
        fontFamily: CODE_FONT,
        fontSize: 12,
        padding: '1px 6px',
        marginLeft: 4,
        borderRadius: 3,
        backgroundColor: `${color}26`,
        color,
        border: `1px solid ${color}55`,
        verticalAlign: 'baseline',
      }}
    >
      {children}
    </span>
  );
}

function AmberTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: CODE_FONT,
        fontSize: 13,
        padding: '1px 6px',
        borderRadius: 3,
        backgroundColor: 'rgba(232,195,115,0.14)',
        color: C.amber,
        border: '1px solid rgba(232,195,115,0.28)',
      }}
    >
      {children}
    </span>
  );
}

function Prompt({
  prompt = '>',
  muted,
  children,
}: {
  prompt?: string;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        color: muted ? C.inkSoft : C.ink,
        opacity: muted ? 0.85 : 1,
        lineHeight: 1.45,
      }}
    >
      {prompt ? (
        <span style={{ fontFamily: CODE_FONT, color: C.cyan, flex: 'none' }}>{prompt}</span>
      ) : (
        <span style={{ width: 8, flex: 'none' }} />
      )}
      <span>{children}</span>
    </div>
  );
}

// ─── Agent loop code (one-dark Python syntax highlight) ───────────────────
function AgentLoopCode() {
  const T = (c: string, t: React.ReactNode) => <span style={{ color: c }}>{t}</span>;
  return (
    <pre
      style={{
        fontFamily: CODE_FONT,
        fontSize: 16,
        lineHeight: 1.6,
        marginTop: 10,
        padding: 14,
        borderRadius: 6,
        backgroundColor: '#1B1D22',
        border: `1px solid ${C.border}`,
        color: PY.text,
        whiteSpace: 'pre',
      }}
    >
      {T(PY.kw, 'while')} {T(PY.kw, 'not')} {T(PY.ident, 'consensus')}{T(PY.punc, ':')}
{'\n    '}{T(PY.ident, 'g')} {T(PY.punc, '=')} {T(PY.fn, 'generator')}{T(PY.punc, '.')}{T(PY.fn, 'run')}{T(PY.punc, '()')}
{'\n    '}{T(PY.ident, 'reward')} {T(PY.punc, '=')} {T(PY.fn, 'discriminator')}{T(PY.punc, '.')}{T(PY.fn, 'run')}{T(PY.punc, '()')}
{'\n    '}{T(PY.kw, 'if')} {T(PY.kw, 'not')} {T(PY.fn, 'consensus')}{T(PY.punc, '.')}{T(PY.fn, 'check')}{T(PY.punc, '():')}
{'\n        '}{T(PY.builtin, 'retry')}
{'\n    '}{T(PY.kw, 'return')} {T(PY.punc, '(')}{T(PY.ident, 'task')}{T(PY.punc, ',')} {T(PY.ident, 'setup')}{T(PY.punc, ',')} {T(PY.ident, 'reward')}{T(PY.punc, ')')}
    </pre>
  );
}

// ─── Information isolation barrier between Generator and Discriminator ────
function InfoIsolation({ opacity }: { opacity: number }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        transform: 'translateX(-50%)',
        width: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: 2,
          height: '90%',
          borderLeft: '2px dashed #D85959',
          opacity: 0.7,
        }}
      />
      <div
        style={{
          position: 'absolute',
          fontFamily: CODE_FONT,
          fontSize: 11,
          color: '#D85959',
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          transform: 'rotate(-90deg)',
          whiteSpace: 'nowrap',
          backgroundColor: C.panel,
          padding: '3px 8px',
        }}
      >
        Information Isolation
      </div>
    </div>
  );
}

// ─── Screenshot helpers ───────────────────────────────────────────────────
function ScreenshotMini({ src }: { src: string }) {
  return (
    <div
      style={{
        aspectRatio: '4 / 3',
        backgroundColor: C.panelHead,
        border: `1px solid ${C.border}`,
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      <Img
        src={staticFile(src)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}

function ScreenshotLabeled({
  src,
  label,
  labelColor,
  overlay,
}: {
  src: string;
  label?: string;
  labelColor?: string;
  overlay?: 'x' | 'check' | null;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          aspectRatio: '16 / 9',
          backgroundColor: C.panelHead,
          border: `1px solid ${C.border}`,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <Img
          src={staticFile(src)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
      {label && (
        <div
          style={{
            position: 'absolute',
            bottom: -6,
            left: 6,
            padding: '1px 6px',
            fontFamily: CODE_FONT,
            fontSize: 11,
            backgroundColor: C.panelHead,
            color: labelColor ?? C.amber,
            border: `1px solid ${C.border}`,
            borderRadius: 3,
          }}
        >
          {label}
        </div>
      )}
      {overlay === 'x' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: C.red,
              textShadow: '0 1px 6px rgba(0,0,0,0.7)',
              lineHeight: 1,
            }}
          >
            ×
          </div>
        </div>
      )}
      {overlay === 'check' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <svg width="56" height="56" viewBox="0 0 28 28" fill="none">
            <path
              d="M5 14 L11 20 L23 7"
              stroke={C.green}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.7))' }}
            />
          </svg>
        </div>
      )}
    </div>
  );
}

function Dot({ color, size }: { color: string; size: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
      }}
    />
  );
}

export const REWARD_SCRIPTER_FRAMES = SCENE_FRAMES;
export const REWARD_SCRIPTER_FPS = FPS;
