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

const PAPER = '#F7F4ED';
const INK = '#1B1816';
const MUTED = '#5C5651';
const RULE = '#E0D8C5';
const OXBLOOD = '#862D1A';
const GREEN = '#526E46';

const X_MIN = 0;
const X_MAX = 240;
const Y_MIN = 0;
const Y_MAX = 100;

const PLOT_X = 260;
const PLOT_Y = 245;
const PLOT_W = 1360;
const PLOT_H = 570;

const sx = (tokensK: number) =>
  PLOT_X + ((tokensK - X_MIN) / (X_MAX - X_MIN)) * PLOT_W;
const sy = (reward: number) =>
  PLOT_Y + (1 - (reward - Y_MIN) / (Y_MAX - Y_MIN)) * PLOT_H;

const ANTHROPIC_PATH =
  'M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z';
const OPENAI_PATH =
  'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z';

type GuiPoint = {
  effort: string;
  tokensK: number;
  reward: number;
};

type GuiSeries = {
  label: string;
  color: string;
  points: GuiPoint[];
  labelDx: number;
  labelDy: number;
  labelAnchor?: 'start' | 'end';
};

type CliPoint = {
  label: string;
  sourceModel: string;
  tokensK: number;
  reward: number;
  logo: 'anthropic' | 'openai';
  color: string;
};

const GUI_SERIES: GuiSeries[] = [
  {
    label: 'GPT-5.5',
    color: INK,
    labelDx: 18,
    labelDy: -42,
    labelAnchor: 'start',
    points: [
      { effort: 'high', tokensK: 25.4, reward: 39.28 },
      { effort: 'xhigh', tokensK: 37.1, reward: 49.49 },
    ],
  },
  {
    label: 'Claude Opus 4.8',
    color: '#F26D37',
    labelDx: -6,
    labelDy: -34,
    labelAnchor: 'end',
    points: [
      { effort: 'xhigh', tokensK: 165.4, reward: 49.73 },
      { effort: 'max', tokensK: 224.1, reward: 54.78 },
    ],
  },
  {
    label: 'Claude Opus 4.7',
    color: '#C9942E',
    labelDx: 30,
    labelDy: 46,
    labelAnchor: 'start',
    points: [
      { effort: 'xhigh', tokensK: 96.4, reward: 46.69 },
      { effort: 'max', tokensK: 150.5, reward: 48.91 },
    ],
  },
];

const CLI_POINTS: CliPoint[] = [
  {
    label: 'Codex',
    sourceModel: 'GPT-5.5',
    tokensK: 8,
    reward: 36.8,
    logo: 'openai',
    color: INK,
  },
  {
    label: 'Claude Code',
    sourceModel: 'Claude Opus 4.7',
    tokensK: 12,
    reward: 24.6,
    logo: 'anthropic',
    color: OXBLOOD,
  },
];

const SHIFT_CURVE: GuiSeries = {
  label: 'GUI agent curve',
  color: OXBLOOD,
  labelDx: 0,
  labelDy: 0,
  points: [
    { effort: 'xhigh', tokensK: 165.4, reward: 49.73 },
    { effort: 'max', tokensK: 224.1, reward: 54.78 },
  ],
};

const X_TICKS = [0, 60, 120, 180, 240];
const Y_TICKS = [0, 20, 40, 60, 80, 100];

export const ParetoFinding = ({
  titleOverride,
}: {
  titleOverride?: string
}) => {
  const frame = useCurrentFrame();
  const titleOp = fadeIn(frame, 0, 25);
  const plotOp = fadeIn(frame, 35, 75);
  const guiOp = fadeIn(frame, 105, 155);
  const cliOp = fadeIn(frame, 205, 255);
  const noteOp = fadeIn(frame, 270, 320);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PAPER,
        fontFamily: PALATINO,
        color: INK,
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, ${RULE} 1px, transparent 1px),
            linear-gradient(to bottom, ${RULE} 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
          opacity: 0.5,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 62,
          opacity: titleOp,
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 23,
            letterSpacing: '0.08em',
            color: OXBLOOD,
            textTransform: 'uppercase',
            fontWeight: 800,
          }}
        >
          OSWorld-2.0 result
        </div>
        <h1
          style={{
            margin: '16px 0 0',
            fontSize: 56,
            lineHeight: 1.08,
            fontWeight: 600,
            letterSpacing: '-0.005em',
          }}
        >
          {titleOverride ?? 'Reward scales with generated work.'}
        </h1>
      </div>

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
        <rect
          x={PLOT_X}
          y={PLOT_Y}
          width={PLOT_W}
          height={PLOT_H}
          fill="rgba(255,255,255,0.22)"
          stroke={RULE}
          strokeWidth={1.5}
        />

        {Y_TICKS.map((y) => (
          <line
            key={`gy-${y}`}
            x1={PLOT_X}
            x2={PLOT_X + PLOT_W}
            y1={sy(y)}
            y2={sy(y)}
            stroke={RULE}
            strokeWidth={1}
            strokeDasharray="4 6"
          />
        ))}

        {X_TICKS.map((x) => (
          <line
            key={`gx-${x}`}
            x1={sx(x)}
            x2={sx(x)}
            y1={PLOT_Y}
            y2={PLOT_Y + PLOT_H}
            stroke={RULE}
            strokeWidth={1}
            strokeDasharray="4 6"
          />
        ))}

        <line
          x1={PLOT_X}
          x2={PLOT_X + PLOT_W}
          y1={PLOT_Y + PLOT_H}
          y2={PLOT_Y + PLOT_H}
          stroke={INK}
          strokeWidth={2}
        />
        <line
          x1={PLOT_X}
          x2={PLOT_X}
          y1={PLOT_Y}
          y2={PLOT_Y + PLOT_H}
          stroke={INK}
          strokeWidth={2}
        />

        {X_TICKS.map((x) => (
          <g key={`tx-${x}`}>
            <line
              x1={sx(x)}
              x2={sx(x)}
              y1={PLOT_Y + PLOT_H}
              y2={PLOT_Y + PLOT_H + 9}
              stroke={INK}
              strokeWidth={1.3}
            />
            <text
              x={sx(x)}
              y={PLOT_Y + PLOT_H + 38}
              fontFamily={MONO}
              fontSize={19}
              fill={MUTED}
              textAnchor="middle"
            >
              {x === 0 ? '0' : `${x}k`}
            </text>
          </g>
        ))}

        {Y_TICKS.map((y) => (
          <g key={`ty-${y}`}>
            <line
              x1={PLOT_X - 9}
              x2={PLOT_X}
              y1={sy(y)}
              y2={sy(y)}
              stroke={INK}
              strokeWidth={1.3}
            />
            <text
              x={PLOT_X - 18}
              y={sy(y) + 7}
              fontFamily={MONO}
              fontSize={19}
              fill={MUTED}
              textAnchor="end"
            >
              {y}%
            </text>
          </g>
        ))}

        <text
          x={PLOT_X + PLOT_W / 2}
          y={PLOT_Y + PLOT_H + 84}
          fontFamily={PALATINO}
          fontSize={31}
          fontWeight={700}
          fill={INK}
          textAnchor="middle"
        >
          output tokens / task
        </text>
        <text
          x={PLOT_X - 105}
          y={PLOT_Y + PLOT_H / 2}
          fontFamily={PALATINO}
          fontSize={31}
          fontWeight={700}
          fill={INK}
          textAnchor="middle"
          transform={`rotate(-90 ${PLOT_X - 105} ${PLOT_Y + PLOT_H / 2})`}
        >
          mean reward
        </text>

        <g opacity={guiOp}>
          {GUI_SERIES.map((series) => (
            <GuiCurve key={series.label} series={series} />
          ))}
        </g>
        <g opacity={cliOp}>
          {CLI_POINTS.map((p, idx) => (
            <CliMarker key={p.label} point={p} labelAbove={idx === 0} />
          ))}
        </g>
      </svg>

      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          bottom: 46,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 40,
          opacity: noteOp,
        }}
      >
        <div
          style={{
            maxWidth: 980,
            fontSize: 28,
            lineHeight: 1.32,
            color: MUTED,
          }}
        >
          Thin curves show OSWorld-2.0 pure GUI agents under the 500-step
          limit. GPT-5.5 uses high to xhigh; Opus curves use xhigh to max.
          Large points keep the original Codex / Claude Code mean reward.
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 19,
            color: MUTED,
            textAlign: 'right',
            lineHeight: 1.45,
          }}
        >
          y-axis: mean reward
          <br />
          x-axis: output tokens / task
        </div>
      </div>
    </AbsoluteFill>
  );
};

function GuiCurve({ series }: { series: GuiSeries }) {
  const points = series.points;
  const path = points
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${sx(point.tokensK)} ${sy(point.reward)}`)
    .join(' ');
  const last = points[points.length - 1];
  const lastX = sx(last.tokensK);
  const lastY = sy(last.reward);
  const labelX = lastX + series.labelDx;
  const labelY = lastY + series.labelDy;
  const anchor = series.labelAnchor ?? 'start';

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={series.color}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.82}
      />
      {points.map((point) => (
        <g key={point.effort}>
          <circle
            cx={sx(point.tokensK)}
            cy={sy(point.reward)}
            r={11}
            fill={series.color}
            stroke={PAPER}
            strokeWidth={2.5}
          />
          <text
            x={sx(point.tokensK)}
            y={sy(point.reward) + 34}
            fontFamily={MONO}
            fontSize={13}
            fill={MUTED}
            textAnchor="middle"
          >
            {point.effort}
          </text>
        </g>
      ))}
      <text
        x={labelX}
        y={labelY}
        fontFamily={PALATINO}
        fontSize={24}
        fontWeight={700}
        fill={series.color}
        textAnchor={anchor}
      >
        {series.label}
      </text>
      <text
        x={labelX}
        y={labelY + 24}
        fontFamily={MONO}
        fontSize={15}
        fill={MUTED}
        textAnchor={anchor}
      >
        {last.tokensK.toFixed(1)}k · {last.reward.toFixed(1)}%
      </text>
    </g>
  );
}

function CliMarker({
  point,
  labelAbove,
}: {
  point: CliPoint;
  labelAbove: boolean;
}) {
  const x = sx(point.tokensK);
  const y = sy(point.reward);
  const labelY = labelAbove ? y - 32 : y + 44;

  return (
    <g>
      <line
        x1={x}
        x2={x}
        y1={y}
        y2={PLOT_Y + PLOT_H}
        stroke={point.color}
        strokeWidth={1.8}
        strokeDasharray="6 6"
        opacity={0.45}
      />
      <LogoMarker
        cx={x}
        cy={y}
        logo={point.logo}
        color={point.color}
        size={46}
      />
      <text
        x={x + 36}
        y={labelY}
        fontFamily={PALATINO}
        fontSize={24}
        fontWeight={700}
        fill={point.color}
      >
        {point.label}
      </text>
      <text
        x={x + 36}
        y={labelY + 24}
        fontFamily={MONO}
        fontSize={15}
        fill={MUTED}
      >
        {point.tokensK}k · {point.reward}%
      </text>
    </g>
  );
}

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
      <circle cx={12} cy={12} r={15.5} fill={PAPER} />
      <path d={path} fill={color} />
    </g>
  );
}

type ShiftStage = 'base' | 'up' | 'left';

export function TrainingShiftFinding() {
  const frame = useCurrentFrame();
  const titleOp = fadeIn(frame, 0, 25);
  const plotOp = fadeIn(frame, 30, 70);
  const baseOp = fadeIn(frame, 75, 115);
  const upOp = fadeIn(frame, 145, 190);
  const leftOp = fadeIn(frame, 230, 280);
  const cliOp = fadeIn(frame, 255, 305);
  const regionOp = fadeIn(frame, 250, 300);
  const upEnd = shiftedPoint(SHIFT_CURVE.points[1], 'up');
  const leftEnd = shiftedPoint(SHIFT_CURVE.points[1], 'left');

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PAPER,
        fontFamily: PALATINO,
        color: INK,
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, ${RULE} 1px, transparent 1px),
            linear-gradient(to bottom, ${RULE} 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
          opacity: 0.5,
        }}
      />

      <div style={{ position: 'absolute', left: 96, right: 96, top: 62, opacity: titleOp }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 23,
            letterSpacing: '0.08em',
            color: OXBLOOD,
            textTransform: 'uppercase',
            fontWeight: 800,
          }}
        >
          Research direction
        </div>
        <h1
          style={{
            margin: '16px 0 0',
            fontSize: 56,
            lineHeight: 1.08,
            fontWeight: 600,
            letterSpacing: '-0.005em',
          }}
        >
          Two shifts toward the upper-left frontier.
        </h1>
      </div>

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
        <rect
          x={PLOT_X}
          y={PLOT_Y}
          width={PLOT_W}
          height={PLOT_H}
          fill="rgba(255,255,255,0.22)"
          stroke={RULE}
          strokeWidth={1.5}
        />
        {Y_TICKS.map((y) => (
          <line
            key={`shift-gy-${y}`}
            x1={PLOT_X}
            x2={PLOT_X + PLOT_W}
            y1={sy(y)}
            y2={sy(y)}
            stroke={RULE}
            strokeWidth={1}
            strokeDasharray="4 6"
          />
        ))}
        {X_TICKS.map((x) => (
          <line
            key={`shift-gx-${x}`}
            x1={sx(x)}
            x2={sx(x)}
            y1={PLOT_Y}
            y2={PLOT_Y + PLOT_H}
            stroke={RULE}
            strokeWidth={1}
            strokeDasharray="4 6"
          />
        ))}
        <line
          x1={PLOT_X}
          x2={PLOT_X + PLOT_W}
          y1={PLOT_Y + PLOT_H}
          y2={PLOT_Y + PLOT_H}
          stroke={INK}
          strokeWidth={2}
        />
        <line
          x1={PLOT_X}
          x2={PLOT_X}
          y1={PLOT_Y}
          y2={PLOT_Y + PLOT_H}
          stroke={INK}
          strokeWidth={2}
        />
        {X_TICKS.map((x) => (
          <g key={`shift-tx-${x}`}>
            <line
              x1={sx(x)}
              x2={sx(x)}
              y1={PLOT_Y + PLOT_H}
              y2={PLOT_Y + PLOT_H + 9}
              stroke={INK}
              strokeWidth={1.3}
            />
            <text
              x={sx(x)}
              y={PLOT_Y + PLOT_H + 38}
              fontFamily={MONO}
              fontSize={19}
              fill={MUTED}
              textAnchor="middle"
            >
              {x === 0 ? '0' : `${x}k`}
            </text>
          </g>
        ))}
        {Y_TICKS.map((y) => (
          <g key={`shift-ty-${y}`}>
            <line
              x1={PLOT_X - 9}
              x2={PLOT_X}
              y1={sy(y)}
              y2={sy(y)}
              stroke={INK}
              strokeWidth={1.3}
            />
            <text
              x={PLOT_X - 18}
              y={sy(y) + 7}
              fontFamily={MONO}
              fontSize={19}
              fill={MUTED}
              textAnchor="end"
            >
              {y}%
            </text>
          </g>
        ))}
        <text
          x={PLOT_X + PLOT_W / 2}
          y={PLOT_Y + PLOT_H + 84}
          fontFamily={PALATINO}
          fontSize={31}
          fontWeight={700}
          fill={INK}
          textAnchor="middle"
        >
          output tokens / task
        </text>
        <text
          x={PLOT_X - 105}
          y={PLOT_Y + PLOT_H / 2}
          fontFamily={PALATINO}
          fontSize={31}
          fontWeight={700}
          fill={INK}
          textAnchor="middle"
          transform={`rotate(-90 ${PLOT_X - 105} ${PLOT_Y + PLOT_H / 2})`}
        >
          mean reward
        </text>

        <g opacity={regionOp}>
          <rect
            x={sx(34)}
            y={sy(88)}
            width={sx(76) - sx(34)}
            height={sy(62) - sy(88)}
            rx={14}
            fill="rgba(82, 110, 70, 0.12)"
            stroke={GREEN}
            strokeDasharray="8 7"
            strokeWidth={2}
          />
          <text
            x={sx(55)}
            y={sy(90)}
            fontFamily={PALATINO}
            fontSize={24}
            fontWeight={700}
            fill={GREEN}
            textAnchor="middle"
          >
            target region
          </text>
        </g>

        <g opacity={baseOp}>
          <ShiftCurve series={SHIFT_CURVE} stage="base" opacity={1} />
          <text x={sx(203)} y={sy(49)} fontFamily={PALATINO} fontSize={26} fontWeight={700} fill={OXBLOOD}>
            current
          </text>
        </g>

        <g opacity={upOp}>
          <ShiftCurve series={SHIFT_CURVE} stage="up" opacity={0.9} />
          <text x={sx(upEnd.tokensK) + 16} y={sy(upEnd.reward) - 8} fontFamily={PALATINO} fontSize={28} fontWeight={700} fill={MUTED}>
            CUA-Pro
          </text>
        </g>

        <g opacity={leftOp}>
          <ShiftCurve series={SHIFT_CURVE} stage="left" opacity={1} />
          <text x={sx(leftEnd.tokensK) + 12} y={sy(leftEnd.reward) - 30} fontFamily={PALATINO} fontSize={28} fontWeight={700} fill={MUTED}>
            UDA-Gym
          </text>
        </g>
        <g opacity={cliOp}>
          {CLI_POINTS.map((p, idx) => (
            <CliMarker key={`shift-${p.label}`} point={p} labelAbove={idx === 0} />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
}

function shiftedPoint(point: GuiPoint, stage: ShiftStage): GuiPoint {
  if (stage === 'up') {
    return {
      ...point,
      reward: Math.min(92, point.reward + 23),
    };
  }
  if (stage === 'left') {
    return {
      ...point,
      tokensK: Math.max(34, point.tokensK * 0.34),
      reward: Math.min(92, point.reward + 23),
    };
  }
  return point;
}

function ShiftCurve({
  series,
  stage,
  opacity,
}: {
  series: GuiSeries;
  stage: ShiftStage;
  opacity: number;
}) {
  const points = series.points.map((point) => shiftedPoint(point, stage));
  const color = stage === 'base' ? OXBLOOD : '#9E9689';
  const path = points
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${sx(point.tokensK)} ${sy(point.reward)}`)
    .join(' ');

  return (
    <g opacity={opacity}>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={stage === 'base' ? 4 : 3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={stage === 'base' ? undefined : '9 7'}
      />
      {points.map((point) => (
        <circle
          key={`${series.label}-${stage}-${point.effort}`}
          cx={sx(point.tokensK)}
          cy={sy(point.reward)}
          r={stage === 'base' ? 10 : 8}
          fill={color}
          stroke={PAPER}
          strokeWidth={2}
        />
      ))}
    </g>
  );
}
