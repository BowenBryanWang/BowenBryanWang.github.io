// Training-details slide — paper §3, animated re-creation of Figure 4
// (trajectory slicing) with CONCRETE example trajectories.
//
//   ┌── SLIDING WINDOW ────────────────────────────────────
//   │   [sys][.....32 turns: 22 dropped + 10 vivid + reward.....]
//   ├── TRAJECTORY SLICING ────────────────────────────────
//   │   slice 1   [sys][....19 turns: 10 collapsed + 9 vivid....]
//   │   slice 2   [sys][........27 turns: 20 collapsed + 7 vivid........]
//   │   slice N   [sys][..............32 turns: 30 collapsed + 2 vivid..............]
//
// Important detail: only the BLUE (user / screenshot) pills are collapsed in
// the prompt portion — green (assistant: thought + tool call) pills are NEVER
// faded, because only the image gets replaced by "<image collapsed>". The
// assistant's reasoning chain is kept verbatim throughout the trajectory.
//
// Steps:
//   0. title + full figure (sliding window vs trajectory slicing) shown
//      together for direct comparison
//   1. + three advantage notes (i. / ii. / iii.)

import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from '../lib/remotion-shim';

const PALATINO =
  '"Palatino Linotype", "Palatino", "Book Antiqua", "URW Palladio L", Georgia, serif';
const MONO = 'Menlo, Monaco, "JetBrains Mono", "Cascadia Code", monospace';

const INK = '#1B1816';
const OXBLOOD = '#862D1A';
const MUTED = '#8A857C';

// Figure 4 palette
const SYS = '#8A4E2F';
const USR = '#3C76B5';
const ASS = '#56A656';
const RWD = '#F4C84A';
const USR_FADE = '#D6E2EE';

// Pill geometry
const PILL_W = 32;
const PILL_H = 22;
const PILL_R = 11;
const PILL_GAP = 4;
const SLOT = PILL_W + PILL_GAP; // 36

const SYS_GAP = 12;
const REWARD_GAP = 4;

// Screen placement
const FIG_LEFT = 244;
const ROW_LABEL_X = FIG_LEFT - 14;
const FIG_RIGHT_EDGE = 1500;
const SECTION_TITLE_X = 96;

// Y rhythm
const SW_TITLE_Y = 168;
const SW_DIVIDER_Y = 190;
const SW_ROW_Y = 244;

const TS_TITLE_Y = 322;
const TS_DIVIDER_Y = 344;
const SLICE1_Y = 400;
const SLICE2_Y = 448;
const SLICEN_Y = 496;

// Concrete example data
const ROWS = {
  sw: { total: 32, collapsed: 22 },
  slice1: { total: 19, collapsed: 10 },
  slice2: { total: 27, collapsed: 20 },
  sliceN: { total: 32, collapsed: 30 },
};

function fadeIn(f: number, s: number, e: number) {
  return interpolate(f, [s, e], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

function turnX(i: number) {
  return FIG_LEFT + PILL_W + SYS_GAP + i * SLOT;
}
function rewardX(numTurns: number) {
  return turnX(numTurns - 1) + PILL_W + REWARD_GAP;
}

export const TrainingDetails = () => {
  const frame = useCurrentFrame();

  // Two-step animation — the whole figure pops in together so the comparison
  // reads as a single picture, then the prose appears.
  const figOp = fadeIn(frame, 0, 25);
  const advOp = fadeIn(frame, 60, 100);
  // Aliases — every figure element shares the same fade so they appear in
  // lockstep, and every prose point shares the prose fade.
  const titleOp = figOp;
  const swSectionOp = figOp;
  const swBracketOp = figOp;
  const tsHeaderOp = figOp;
  const slice1Op = figOp;
  const slice2Op = figOp;
  const sliceNOp = figOp;
  const annotOp = figOp;
  const adv1Op = advOp;
  const adv2Op = advOp;
  const adv3Op = advOp;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#F7F4ED',
        fontFamily: PALATINO,
        color: INK,
        overflow: 'hidden',
      }}
    >
      {/* background grid */}
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

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 56,
          fontFamily: PALATINO,
          fontSize: 50,
          fontWeight: 500,
          color: INK,
          letterSpacing: '-0.005em',
          lineHeight: 1.16,
          opacity: titleOp,
        }}
      >
        Training details — long-horizon scaffolding with{' '}
        <span style={{ color: OXBLOOD, fontWeight: 700 }}>trajectory slicing</span>.
      </div>

      {/* === Scaffold figure (SVG) ============================================ */}
      <svg
        viewBox="0 0 1920 1080"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        aria-hidden
      >
        {/* ── Section 1: Sliding window ─────────────────────────────────── */}
        <g opacity={swSectionOp}>
          <text
            x={SECTION_TITLE_X}
            y={SW_TITLE_Y}
            fontFamily={MONO}
            fontSize={22}
            fontWeight={700}
            fill={MUTED}
            letterSpacing={1.6}
          >
            Sliding window
          </text>
          <text
            x={SECTION_TITLE_X + 230}
            y={SW_TITLE_Y}
            fontFamily={PALATINO}
            fontSize={16}
            fontStyle="italic"
            fill="#A39A8E"
          >
            — drops every turn except the last 5
          </text>

          <line
            x1={SECTION_TITLE_X}
            y1={SW_DIVIDER_Y}
            x2={FIG_RIGHT_EDGE}
            y2={SW_DIVIDER_Y}
            stroke="#C7BEAF"
            strokeWidth={1}
          />

          <ScaffoldRow
            y={SW_ROW_Y}
            numTurns={ROWS.sw.total}
            collapsedCount={ROWS.sw.collapsed}
          />
        </g>

        <g opacity={swBracketOp}>
          <TopBracket
            x1={turnX(ROWS.sw.collapsed) - 2}
            x2={rewardX(ROWS.sw.total) + PILL_W + 2}
            y={SW_ROW_Y - PILL_H / 2 - 6}
            label="Last 5 turns — only what survives"
          />
        </g>

        {/* ── Section 2: Trajectory slicing ─────────────────────────────── */}
        <g opacity={tsHeaderOp}>
          <text
            x={SECTION_TITLE_X}
            y={TS_TITLE_Y}
            fontFamily={MONO}
            fontSize={22}
            fontWeight={700}
            fill={OXBLOOD}
            letterSpacing={1.6}
          >
            Trajectory slicing
          </text>
          <text
            x={SECTION_TITLE_X + 246}
            y={TS_TITLE_Y}
            fontFamily={PALATINO}
            fontSize={16}
            fontStyle="italic"
            fill="#7C7268"
          >
            — M training samples per rollout, same context budget
          </text>

          <line
            x1={SECTION_TITLE_X}
            y1={TS_DIVIDER_Y}
            x2={FIG_RIGHT_EDGE}
            y2={TS_DIVIDER_Y}
            stroke={OXBLOOD}
            strokeWidth={1.2}
            opacity={0.55}
          />
        </g>

        <g opacity={slice1Op}>
          <SliceLabel y={SLICE1_Y} text="slice 1" />
          <ScaffoldRow
            y={SLICE1_Y}
            numTurns={ROWS.slice1.total}
            collapsedCount={ROWS.slice1.collapsed}
          />
        </g>

        <g opacity={slice2Op}>
          <SliceLabel y={SLICE2_Y} text="slice 2" />
          <ScaffoldRow
            y={SLICE2_Y}
            numTurns={ROWS.slice2.total}
            collapsedCount={ROWS.slice2.collapsed}
          />
        </g>

        <g opacity={sliceNOp}>
          <SliceLabel y={SLICEN_Y} text="slice N" />
          <ScaffoldRow
            y={SLICEN_Y}
            numTurns={ROWS.sliceN.total}
            collapsedCount={ROWS.sliceN.collapsed}
          />
        </g>

        {/* ── Annotation: only screenshots are collapsed ──────────────── */}
        <g opacity={annotOp}>
          <path
            d={`M ${turnX(10) + PILL_W / 2} ${SLICEN_Y + PILL_H / 2 + 4} C ${turnX(10) + PILL_W / 2} ${SLICEN_Y + 50}, ${turnX(10) + 40} ${SLICEN_Y + 64}, ${turnX(10) + 120} ${SLICEN_Y + 68}`}
            fill="none"
            stroke={OXBLOOD}
            strokeWidth={1.3}
            strokeDasharray="4 3"
          />
          <text
            x={turnX(10) + 132}
            y={SLICEN_Y + 73}
            fontFamily={MONO}
            fontSize={14}
            fontWeight={700}
            fill={OXBLOOD}
            letterSpacing={0.6}
          >
            only the screenshot collapses → &quot;&lt;image collapsed&gt;&quot;
          </text>
          <text
            x={turnX(10) + 132}
            y={SLICEN_Y + 93}
            fontFamily={PALATINO}
            fontSize={14}
            fill="#5C5651"
            fontStyle="italic"
          >
            assistant thoughts &amp; tool calls (green) are kept verbatim — never collapsed, never masked.
          </text>
        </g>

        {/* ── Legend (top-right) ────────────────────────────────────────── */}
        <g
          opacity={swSectionOp}
          transform={`translate(${1920 - 280}, ${SW_ROW_Y - 56})`}
        >
          <LegendItem y={0} color={SYS} label="system" />
          <LegendItem y={26} color={USR} label="user (image + text)" />
          <LegendItem y={52} color={ASS} label="assistant (thought + tool call)" />
          <LegendItem y={78} color={RWD} label="reward" />
          <LegendItem
            y={104}
            color={USR_FADE}
            outline="#B7C5D6"
            label="collapsed screenshot"
          />
        </g>
      </svg>

      {/* ── Academic prose: i. / ii. / iii. ─────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 730,
          display: 'flex',
          gap: 56,
        }}
      >
        <Point num="i." opacity={adv1Op}>
          <Lead>Full supervision coverage.</Lead> Sliding window only updates
          the last <em>N</em> rounds — truncation discards precisely the late
          turns where success or failure is decided. Slicing emits{' '}
          <em>M</em> training samples per rollout, each anchored at a
          different starting point, so every assistant turn receives a
          gradient through the union of all slices.
        </Point>
        <Point num="ii." opacity={adv2Op}>
          <Lead>Only screenshots collapse, never thoughts.</Lead> The
          placeholder <Code>&lt;image collapsed&gt;</Code> swaps out a single
          field — the screenshot. User prompts and the assistant&apos;s entire
          chain-of-thought and tool calls remain verbatim, so the reasoning
          trace is intact as context for every later turn.
        </Point>
        <Point num="iii." opacity={adv3Op}>
          <Lead>Deterministic and cache-friendly.</Lead> Slicing buys the same
          context relief as summarization without the extra LM call, the
          quality variance, or the lost screenshot→pixel grounding. Adjacent
          slices share an identical prefix, so the KV cache is reusable when
          computing policy log-probabilities across slices.
        </Point>
      </div>
    </AbsoluteFill>
  );
};

// ─── ScaffoldRow ───────────────────────────────────────────────────────────
//
// Important: only USER (blue) pills get faded when in the collapsed range.
// ASSISTANT (green) pills are ALWAYS vivid — the assistant's thought + tool
// call is never collapsed.
function ScaffoldRow({
  y,
  numTurns,
  collapsedCount,
}: {
  y: number;
  numTurns: number;
  collapsedCount: number;
}) {
  const pills = [];
  pills.push(<Pill key="sys" x={FIG_LEFT} y={y} fill={SYS} />);
  for (let i = 0; i < numTurns; i++) {
    const isUser = i % 2 === 0;
    const inCollapsedRange = i < collapsedCount;
    const fadedScreenshot = inCollapsedRange && isUser;
    const fill = fadedScreenshot ? USR_FADE : isUser ? USR : ASS;
    pills.push(
      <Pill
        key={`t-${i}`}
        x={turnX(i)}
        y={y}
        fill={fill}
        muted={fadedScreenshot}
      />,
    );
  }
  pills.push(<Pill key="rwd" x={rewardX(numTurns)} y={y} fill={RWD} />);
  return <>{pills}</>;
}

// ─── SVG primitives ────────────────────────────────────────────────────────
function Pill({
  x,
  y,
  fill,
  muted,
}: {
  x: number;
  y: number;
  fill: string;
  muted?: boolean;
}) {
  return (
    <rect
      x={x}
      y={y - PILL_H / 2}
      width={PILL_W}
      height={PILL_H}
      rx={PILL_R}
      ry={PILL_R}
      fill={fill}
      stroke={muted ? 'rgba(0,0,0,0.10)' : 'transparent'}
      strokeWidth={muted ? 0.8 : 0}
    />
  );
}

function SliceLabel({ y, text }: { y: number; text: string }) {
  return (
    <text
      x={ROW_LABEL_X}
      y={y + 4}
      fontFamily={MONO}
      fontSize={16}
      fontWeight={600}
      fill="#3A3531"
      textAnchor="end"
    >
      {text}
    </text>
  );
}

function TopBracket({
  x1,
  x2,
  y,
  label,
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
}) {
  const TICK = 8;
  return (
    <>
      <path
        d={`M ${x1} ${y} v ${-TICK} H ${x2} v ${TICK}`}
        fill="none"
        stroke={OXBLOOD}
        strokeWidth={1.4}
      />
      <text
        x={(x1 + x2) / 2}
        y={y - TICK - 8}
        fontFamily={MONO}
        fontSize={13}
        fontWeight={700}
        fill={OXBLOOD}
        textAnchor="middle"
        letterSpacing={0.6}
      >
        {label}
      </text>
    </>
  );
}

function LegendItem({
  y,
  color,
  outline,
  label,
}: {
  y: number;
  color: string;
  outline?: string;
  label: string;
}) {
  return (
    <>
      <rect
        x={0}
        y={y - 9}
        width={26}
        height={18}
        rx={9}
        ry={9}
        fill={color}
        stroke={outline ?? 'transparent'}
        strokeWidth={outline ? 1 : 0}
      />
      <text
        x={36}
        y={y + 5}
        fontFamily={MONO}
        fontSize={13}
        fill="#5C5651"
      >
        {label}
      </text>
    </>
  );
}

// ─── Academic prose item ─────────────────────────────────────────────────
function Point({
  num,
  opacity,
  children,
}: {
  num: string;
  opacity: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        flex: 1,
        opacity,
        fontFamily: PALATINO,
        fontSize: 17,
        lineHeight: 1.5,
        color: '#3A3531',
      }}
    >
      <div
        style={{
          fontFamily: PALATINO,
          fontStyle: 'italic',
          fontSize: 42,
          fontWeight: 500,
          color: OXBLOOD,
          lineHeight: 1,
          marginBottom: 14,
          letterSpacing: '-0.01em',
        }}
      >
        {num}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Lead({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontWeight: 700, color: INK }}>{children}</span>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: '0.92em',
        backgroundColor: 'rgba(27,24,22,0.06)',
        padding: '1px 6px',
        borderRadius: 3,
      }}
    >
      {children}
    </span>
  );
}
