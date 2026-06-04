import {
  AbsoluteFill,
  interpolate,
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

// ─── Plot domain ──────────────────────────────────────────────────────────
const X_MIN = 0;
const X_MAX = 350;
const Y_MIN = 10;
const Y_MAX = 42;

// Plot box (in 1920x1080 stage coordinates)
const PLOT_X = 200;
const PLOT_Y = 230;
const PLOT_W = 1520;
const PLOT_H = 620;

const sx = (x: number) => PLOT_X + ((x - X_MIN) / (X_MAX - X_MIN)) * PLOT_W;
const sy = (y: number) =>
  PLOT_Y + (1 - (y - Y_MIN) / (Y_MAX - Y_MIN)) * PLOT_H;

// ─── Data ─────────────────────────────────────────────────────────────────
const SONNET = [
  { steps: 150, score: 13.9 },
  { steps: 300, score: 24.9 },
];
const OPUS = [
  { steps: 150, score: 22.5 },
  { steps: 300, score: 28.4 },
];
// Inline simple-icons paths (24×24 viewBox).
const ANTHROPIC_PATH =
  'M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z';
const OPENAI_PATH =
  'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z';

type CliPoint = {
  label: string;
  sub: string;
  steps: number;
  score: number;
  logo: 'anthropic' | 'openai';
  color: string;
};

const CLI_POINTS: CliPoint[] = [
  { label: 'Claude Code', sub: 'w/ Opus 4.7', steps: 36, score: 24.6,
    logo: 'anthropic', color: '#C15F3C' },
  { label: 'Codex',       sub: 'w/ GPT-5.5',  steps: 43, score: 36.8,
    logo: 'openai',    color: '#1B1816' },
];

const X_TICKS = [0, 50, 100, 150, 200, 250, 300, 350];
const Y_TICKS = [10, 15, 20, 25, 30, 35, 40];

export const ParetoFinding = () => {
  const frame = useCurrentFrame();

  const titleOp = fadeIn(frame, 0, 30);
  const plotOp = fadeIn(frame, 60, 110);
  const sonnetOp = fadeIn(frame, 130, 180);
  const cliOp = fadeIn(frame, 230, 280);
  const takeawayOp = fadeIn(frame, 330, 380);

  // Step 5: animate the X-axis semantic from "steps" → "Time (wall-clock
  // minutes)". CLI elapsed_s averages computed from blog cases.ts data;
  // visual-agent times are >2h assumptions (per-step ~60s screenshot+LLM).
  const timeMorph = fadeIn(frame, 460, 540);
  const takeaway2Op = fadeIn(frame, 540, 590);

  // Real CLI averages from public/cli-gui-viewer/local_results/*/traj.jsonl:
  //   Claude Code: mean 569 s (9.5 min)
  //   Codex:       mean 650 s (10.8 min)
  // Visual-agent points assumed at 2.5 – 5 h (random within plausible range).
  const T_MAX_MIN = 300; // x-axis goes 0 → 300 minutes (= 5 h)
  const sxTime = (minutes: number) =>
    PLOT_X + (minutes / T_MAX_MIN) * PLOT_W;

  const TARGET_X_SONNET_150 = sxTime(150); // 2.5 h
  const TARGET_X_SONNET_300 = sxTime(270); // 4.5 h
  const TARGET_X_OPUS_150 = sxTime(180);   // 3.0 h
  const TARGET_X_OPUS_300 = sxTime(300);   // 5.0 h (right edge)
  const TARGET_X_CLAUDE_CODE = sxTime(9.5);
  const TARGET_X_CODEX = sxTime(10.8);

  const morphPx = (origPx: number, targetPx: number) =>
    origPx + (targetPx - origPx) * timeMorph;

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
          fontSize: 56,
          fontWeight: 500,
          color: '#1B1816',
          letterSpacing: '-0.005em',
          lineHeight: 1.16,
          opacity: titleOp,
        }}
      >
        More <span style={{ color: '#862D1A', fontWeight: 700 }}>importantly</span>
        ...
      </div>

      {/* Scatter plot SVG */}
      <svg
        viewBox="0 0 1920 1080"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: plotOp,
        }}
      >
        {/* Pareto frontier shaded region — the bottom edge rises from
            left (low steps, lower achievable score) to right (more steps,
            higher achievable score), matching the intuition that more
            compute / more steps unlocks higher scores. CLI markers sit
            inside this band; visual-agent dots sit below it. */}
        <defs>
          <linearGradient id="pareto-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#862D1A" stopOpacity={0.16} />
            <stop offset="100%" stopColor="#862D1A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path
          d={`M ${PLOT_X} ${PLOT_Y}
              L ${PLOT_X + PLOT_W} ${PLOT_Y}
              L ${PLOT_X + PLOT_W} ${sy(36)}
              L ${PLOT_X} ${sy(20)}
              Z`}
          fill="url(#pareto-fade)"
        />

        {/* gridlines */}
        {Y_TICKS.map((y) => (
          <line
            key={`gy-${y}`}
            x1={PLOT_X}
            x2={PLOT_X + PLOT_W}
            y1={sy(y)}
            y2={sy(y)}
            stroke="#E0D8C5"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
        ))}

        {/* axes */}
        <line
          x1={PLOT_X}
          x2={PLOT_X + PLOT_W}
          y1={PLOT_Y + PLOT_H}
          y2={PLOT_Y + PLOT_H}
          stroke="#1B1816"
          strokeWidth={1.5}
        />
        <line
          x1={PLOT_X}
          x2={PLOT_X}
          y1={PLOT_Y}
          y2={PLOT_Y + PLOT_H}
          stroke="#1B1816"
          strokeWidth={1.5}
        />

        {/* X ticks (steps) — fade out as X axis morphs to Time */}
        <g opacity={1 - timeMorph}>
          {X_TICKS.map((x) => (
            <g key={`tx-${x}`}>
              <line
                x1={sx(x)}
                x2={sx(x)}
                y1={PLOT_Y + PLOT_H}
                y2={PLOT_Y + PLOT_H + 8}
                stroke="#1B1816"
                strokeWidth={1.2}
              />
              <text
                x={sx(x)}
                y={PLOT_Y + PLOT_H + 34}
                fontFamily={MONO}
                fontSize={18}
                fill="#5C5651"
                textAnchor="middle"
              >
                {x}
              </text>
            </g>
          ))}
        </g>

        {/* X ticks (Time) — fade in with timeMorph */}
        <g opacity={timeMorph}>
          {[0, 60, 120, 180, 240, 300].map((minutes) => (
            <g key={`tt-${minutes}`}>
              <line
                x1={sxTime(minutes)}
                x2={sxTime(minutes)}
                y1={PLOT_Y + PLOT_H}
                y2={PLOT_Y + PLOT_H + 8}
                stroke="#1B1816"
                strokeWidth={1.2}
              />
              <text
                x={sxTime(minutes)}
                y={PLOT_Y + PLOT_H + 34}
                fontFamily={MONO}
                fontSize={18}
                fill="#5C5651"
                textAnchor="middle"
              >
                {minutes === 0 ? '0' : `${minutes / 60}h`}
              </text>
            </g>
          ))}
        </g>

        {/* Y ticks + labels */}
        {Y_TICKS.map((y) => (
          <g key={`ty-${y}`}>
            <line
              x1={PLOT_X - 8}
              x2={PLOT_X}
              y1={sy(y)}
              y2={sy(y)}
              stroke="#1B1816"
              strokeWidth={1.2}
            />
            <text
              x={PLOT_X - 16}
              y={sy(y) + 6}
              fontFamily={MONO}
              fontSize={18}
              fill="#5C5651"
              textAnchor="end"
            >
              {y}%
            </text>
          </g>
        ))}

        {/* axis labels — crossfade from "steps" to "Time" at step 5 */}
        <text
          x={PLOT_X + PLOT_W / 2}
          y={PLOT_Y + PLOT_H + 70}
          fontFamily={PALATINO}
          fontSize={26}
          fill="#1B1816"
          textAnchor="middle"
          opacity={1 - timeMorph}
        >
          steps (CLI tool internal actions, or visual-agent rollout length)
        </text>
        <text
          x={PLOT_X + PLOT_W / 2}
          y={PLOT_Y + PLOT_H + 70}
          fontFamily={PALATINO}
          fontSize={32}
          fontWeight={700}
          fill="#862D1A"
          textAnchor="middle"
          opacity={timeMorph}
          letterSpacing="0.06em"
        >
          Time
        </text>
        <text
          x={PLOT_X - 90}
          y={PLOT_Y + PLOT_H / 2}
          fontFamily={PALATINO}
          fontSize={26}
          fill="#1B1816"
          textAnchor="middle"
          transform={`rotate(-90 ${PLOT_X - 90} ${PLOT_Y + PLOT_H / 2})`}
        >
          OSWorld-2.0 score (%)
        </text>

        {/* ─── Claude Sonnet 4.6 & Opus 4.7 trend lines ─── */}
        <g opacity={sonnetOp}>
          <TrendLine
            data={SONNET}
            color="#5C5651"
            label="Claude Sonnet 4.6"
            x0={morphPx(sx(SONNET[0].steps), TARGET_X_SONNET_150)}
            x1={morphPx(sx(SONNET[1].steps), TARGET_X_SONNET_300)}
          />
          <TrendLine
            data={OPUS}
            color="#3D4E80"
            label="Claude Opus 4.7"
            x0={morphPx(sx(OPUS[0].steps), TARGET_X_OPUS_150)}
            x1={morphPx(sx(OPUS[1].steps), TARGET_X_OPUS_300)}
          />
        </g>

        {/* ─── CLI harness points (highlighted, top-left) ─── */}
        <g opacity={cliOp}>
          {CLI_POINTS.map((p, idx) => {
            const target = idx === 0 ? TARGET_X_CLAUDE_CODE : TARGET_X_CODEX;
            const mx = morphPx(sx(p.steps), target);
            return (
            <g key={p.label}>
              <LogoMarker
                cx={mx}
                cy={sy(p.score)}
                logo={p.logo}
                color={p.color}
                size={56}
              />
              <text
                x={mx + 50}
                y={sy(p.score) - 10}
                fontFamily={PALATINO}
                fontSize={28}
                fontWeight={700}
                fill="#862D1A"
              >
                {p.label}
              </text>
              <text
                x={mx + 50}
                y={sy(p.score) + 18}
                fontFamily={PALATINO}
                fontSize={19}
                fill="#5C5651"
              >
                {p.sub}
              </text>
              <text
                x={mx + 50}
                y={sy(p.score) + 44}
                fontFamily={MONO}
                fontSize={17}
                fill="#5C5651"
              >
                {p.steps}&nbsp;steps · {p.score}%
              </text>
            </g>
            );
          })}
        </g>
      </svg>

      {/* Takeaway */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          bottom: 50,
          fontFamily: PALATINO,
          fontSize: 28,
          lineHeight: 1.4,
          color: '#1B1816',
          letterSpacing: '-0.005em',
          textAlign: 'center',
          opacity: takeawayOp * (1 - timeMorph),
        }}
      >
        CLI harnesses sit{' '}
        <Strong>at the top-left of the Pareto frontier</Strong>:
        higher OSWorld-2.0 score in an order of magnitude fewer steps than a
        visual CUA agent.
      </div>

      {/* Step-5 takeaway — appears once X-axis morphs to Time */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          bottom: 50,
          fontFamily: PALATINO,
          fontSize: 30,
          lineHeight: 1.4,
          color: '#1B1816',
          letterSpacing: '-0.005em',
          textAlign: 'center',
          opacity: takeaway2Op,
        }}
      >
        In <Strong>wall-clock time</Strong> the gap is even wider — CLI
        finishes in minutes while a visual agent grinds for hours per task.
      </div>
    </AbsoluteFill>
  );
};

function TrendLine({
  data,
  color,
  label,
  x0,
  x1,
}: {
  data: { steps: number; score: number }[];
  color: string;
  label: string;
  x0?: number;
  x1?: number;
}) {
  const [a, b] = data;
  const ax = x0 ?? sx(a.steps);
  const bx = x1 ?? sx(b.steps);
  const xs = [ax, bx];
  return (
    <g>
      <line
        x1={ax}
        y1={sy(a.score)}
        x2={bx}
        y2={sy(b.score)}
        stroke={color}
        strokeWidth={2.5}
        strokeDasharray="6 4"
      />
      {data.map((p, i) => (
        <g key={i}>
          <circle
            cx={xs[i]}
            cy={sy(p.score)}
            r={14}
            fill={color}
            stroke="#F7F4ED"
            strokeWidth={2}
          />
          <text
            x={xs[i] + 22}
            y={sy(p.score) + 7}
            fontFamily={MONO}
            fontSize={17}
            fill="#5C5651"
          >
            {p.score}%
          </text>
        </g>
      ))}
      <text
        x={bx + 22}
        y={sy(b.score) - 14}
        fontFamily={PALATINO}
        fontSize={22}
        fontWeight={700}
        fill={color}
      >
        {label}
      </text>
    </g>
  );
}

// Logo marker — real brand SVG path centered at (cx, cy), scaled to `size`.
// Uses simple-icons paths embedded inline.
function LogoMarker({
  cx,
  cy,
  logo,
  color,
  size,
}: {
  cx: number;
  cy: number;
  logo: 'anthropic' | 'openai';
  color: string;
  size: number;
}) {
  const path = logo === 'anthropic' ? ANTHROPIC_PATH : OPENAI_PATH;
  const scale = size / 24;
  return (
    <g
      transform={`translate(${cx - size / 2}, ${cy - size / 2}) scale(${scale})`}
    >
      {/* soft halo so the logo stays legible against gridlines */}
      <circle cx={12} cy={12} r={15} fill="#F7F4ED" />
      <path d={path} fill={color} />
    </g>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ color: '#862D1A', fontWeight: 600 }}>{children}</span>
  );
}
