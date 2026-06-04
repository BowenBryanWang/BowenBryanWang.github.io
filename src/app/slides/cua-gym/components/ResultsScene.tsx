import { AbsoluteFill, interpolate, useCurrentFrame } from '../lib/remotion-shim';

const PALATINO =
  '"Palatino Linotype", "Palatino", "Book Antiqua", "URW Palladio L", Georgia, serif';
const MONO = 'Menlo, Monaco, "JetBrains Mono", "Cascadia Code", monospace';

const FPS = 60;
const SCENE_FRAMES = 360; // 6.0s
const FADE_IN_FRAMES = 24;
const FADE_OUT_FRAMES = 30;
const FADE_OUT_START = SCENE_FRAMES - FADE_OUT_FRAMES;

// Timeline (360f / 6.0s @ 60fps):
//   0 –  24   scene fade in
//   0 – 120   per-domain bars grow in, staggered (each row, both panels in parallel)
// 120 – 220   hold static
// 220 – 280   CUA-Gym table rows pulse
// 280 – 330   hold
// 330 – 360   scene fade out

type DomainRow = { domain: string; n: number; base: number; ours: number };

const PER_DOMAIN_A3B: DomainRow[] = [
  { domain: 'overall',     n: 369, base: 54.5, ours: 62.1 },
  { domain: 'writer',      n: 31,  base: 50.0, ours: 60.0 },
  { domain: 'calc',        n: 47,  base: 39.0, ours: 53.9 },
  { domain: 'impress',     n: 22,  base: 55.0, ours: 60.0 },
  { domain: 'gimp',        n: 26,  base: 33.0, ours: 40.0 },
  { domain: 'chrome',      n: 38,  base: 65.0, ours: 72.0 },
  { domain: 'multi_apps',  n: 24,  base: 30.0, ours: 51.5 },
  { domain: 'os',          n: 55,  base: 70.0, ours: 70.0 },
  { domain: 'vs_code',     n: 23,  base: 42.0, ours: 55.6 },
  { domain: 'thunderbird', n: 18,  base: 45.0, ours: 50.0 },
];

const PER_DOMAIN_A17B: DomainRow[] = [
  { domain: 'overall',     n: 360, base: 62.2, ours: 72.6 },
  { domain: 'writer',      n: 23,  base: 65.2, ours: 91.3 },
  { domain: 'calc',        n: 47,  base: 66.0, ours: 80.9 },
  { domain: 'impress',     n: 47,  base: 69.1, ours: 82.8 },
  { domain: 'gimp',        n: 26,  base: 50.0, ours: 61.5 },
  { domain: 'chrome',      n: 46,  base: 63.5, ours: 73.9 },
  { domain: 'multi_apps',  n: 93,  base: 45.9, ours: 54.7 },
  { domain: 'os',          n: 24,  base: 79.2, ours: 87.5 },
  { domain: 'vs_code',     n: 22,  base: 68.2, ours: 68.2 },
  { domain: 'thunderbird', n: 15,  base: 80.0, ours: 66.7 },
];

type ModelRow = {
  model: string;
  osworld: string;
  webarena: string;
  osworld2: string;
  scienceboard: string;
  spider2v: string;
  baseline?: boolean;
  highlight?: boolean;
};

const RESULTS = {
  proprietary: [
    { model: 'Claude Sonnet 4.6', osworld: '72.9', webarena: '65.6',
      osworld2: '27.8', scienceboard: '43.2', spider2v: '—' },
    { model: 'Claude Opus 4.7',   osworld: '78.0', webarena: '—',
      osworld2: '—',  scienceboard: '—',    spider2v: '—' },
    { model: 'GPT-5.5',           osworld: '78.7', webarena: '—',
      osworld2: '—',  scienceboard: '—',    spider2v: '—' },
  ] as ModelRow[],
  openSource: [
    { model: 'EvoCUA-32B',  osworld: '56.7', webarena: '—',
      osworld2: '—',  scienceboard: '—',    spider2v: '—' },
    { model: 'OpenCUA-72B', osworld: '45.0', webarena: '—',
      osworld2: '—',  scienceboard: '—',    spider2v: '—' },
    { model: 'Kimi-K2.6',   osworld: '73.1', webarena: '—',
      osworld2: '—',  scienceboard: '—',    spider2v: '—' },
  ] as ModelRow[],
  ours: [
    { model: 'Qwen3.5-35B-A3B',   osworld: '54.5', webarena: '40.8',
      osworld2: '—',    scienceboard: '—',     spider2v: '—',
      baseline: true },
    { model: 'Qwen3.5-397B-A17B', osworld: '62.2', webarena: '54.0',
      osworld2: '10.9', scienceboard: '23.7',  spider2v: '29.9',
      baseline: true },
    { model: 'CUA-Gym-A3B',       osworld: '62.1', webarena: '44.5',
      osworld2: '—',    scienceboard: '—',     spider2v: '—',
      highlight: true },
    { model: 'CUA-Gym-A17B',      osworld: '72.6', webarena: '56.0',
      osworld2: '24.0', scienceboard: '35.0',  spider2v: '45.0',
      highlight: true },
  ] as ModelRow[],
};

const SCALE_MAX = 100;
const ROW_STAGGER = 6;        // frames between successive domain rows
const ROW_GROW_DURATION = 44; // frames for one row to fully grow

export const ResultsScene = () => {
  const frame = useCurrentFrame();

  const pulse = interpolate(
    frame,
    [60, 90, 120],
    [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  // Slide mode: no scene fade-in (causes muddy look on arrival).
  const fadeIn = 1;
  const fadeOut = interpolate(
    frame,
    [FADE_OUT_START, SCENE_FRAMES],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const sceneOp = Math.min(fadeIn, fadeOut);

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

      <div style={{ position: 'absolute', inset: 0, opacity: sceneOp }}>
        {/* Title */}
        <div
          style={{
            position: 'absolute',
            left: 96,
            right: 96,
            top: 40,
            fontFamily: PALATINO,
            fontSize: 52,
            lineHeight: 1.14,
            fontWeight: 500,
            color: '#1B1816',
            letterSpacing: '-0.005em',
          }}
        >
          We{' '}
          <span style={{ color: '#862D1A', fontStyle: 'italic', fontWeight: 600 }}>
            GSPO-train
          </span>{' '}
          on Qwen3.5 — and it scales.
        </div>

        {/* Legend strip removed — was for the per-domain bars (also removed). */}

        {/* Body — single centered table (per-domain bars removed — data was off) */}
        <div
          style={{
            position: 'absolute',
            left: 96,
            right: 96,
            top: 168,
            bottom: 50,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            minHeight: 0,
          }}
        >
          <div
            style={{
              width: 'min(900px, 100%)',
              minWidth: 0,
              minHeight: 0,
              display: 'flex',
            }}
          >
            <ResultsTable pulse={pulse} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

function LegendSwatch({
  color,
  label,
  hatched,
}: {
  color?: string;
  label: string;
  hatched?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <span
        style={{
          display: 'inline-block',
          width: 18,
          height: 12,
          borderRadius: 2,
          backgroundColor: hatched ? undefined : color,
          backgroundImage: hatched
            ? 'repeating-linear-gradient(135deg, #C8B8A8 0 2px, #FBE5E5 2px 4px)'
            : undefined,
          border: hatched ? '0.5px solid #B83D44' : undefined,
        }}
      />
      <span>{label}</span>
    </div>
  );
}

function DomainPanel({
  title,
  rows,
  frame,
  startOffset,
}: {
  title: string;
  rows: DomainRow[];
  frame: number;
  startOffset: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 7,
        minWidth: 0,
        flex: 1,
        minHeight: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 19,
            fontWeight: 600,
            color: '#1B1816',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </span>
        <span style={{ flex: 1, height: 1, backgroundColor: '#E0D8C5' }} />
      </div>
      {rows.map((d, i) => {
        const start = startOffset + i * ROW_STAGGER;
        const end = start + ROW_GROW_DURATION;
        const grow = interpolate(frame, [start, end], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const eased = easeOutCubic(grow);
        return (
          <DomainBar
            key={d.domain}
            {...d}
            highlight={d.domain === 'overall'}
            grow={eased}
          />
        );
      })}
    </div>
  );
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function DomainBar({
  domain,
  n,
  base,
  ours,
  highlight,
  grow,
}: DomainRow & { highlight?: boolean; grow: number }) {
  const lift = ours - base;
  const basePct = (base / SCALE_MAX) * 100 * grow;
  const oursPct = (ours / SCALE_MAX) * 100 * grow;
  const liftPctFull = (Math.max(0, lift) / SCALE_MAX) * 100;
  const lossPctFull = (Math.max(0, -lift) / SCALE_MAX) * 100;

  // grow phase: 0 → 0.55 base only, 0.55 → 1.0 add lift/loss
  const basePhase = Math.min(1, grow / 0.55);
  const liftPhase = Math.max(0, (grow - 0.55) / 0.45);
  const basePctAnim = (base / SCALE_MAX) * 100 * basePhase;
  const liftPctAnim = liftPctFull * Math.min(1, liftPhase);
  const lossPctAnim = lossPctFull * Math.min(1, liftPhase);

  const oursLeftAnim = basePctAnim; // lift starts where base ends
  const numAlpha = Math.min(1, Math.max(0, (grow - 0.6) / 0.4));

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '8rem 3rem minmax(0, 1fr) 7.5rem',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* domain label */}
      <span
        style={{
          fontFamily: MONO,
          fontSize: 17,
          color: highlight ? '#1B1816' : '#5C5651',
          fontWeight: highlight ? 600 : 400,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {domain}
      </span>

      {/* n count */}
      <span
        style={{
          fontFamily: MONO,
          fontSize: 14,
          color: '#9C948A',
          fontVariantNumeric: 'tabular-nums',
          textAlign: 'right',
        }}
      >
        n={n}
      </span>

      {/* bar */}
      <div
        style={{
          position: 'relative',
          height: 20,
          borderRadius: 2,
          backgroundColor: 'rgba(27,24,22,0.05)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${basePctAnim}%`,
            borderRadius: 2,
            backgroundColor: highlight ? '#9C948A' : '#D6CDB6',
          }}
        />
        {lift >= 0 && liftPctAnim > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: `${(base / SCALE_MAX) * 100 * basePhase}%`,
              height: '100%',
              width: `${liftPctAnim}%`,
              borderRadius: 2,
              backgroundColor: '#862D1A',
            }}
          />
        )}
        {lift < 0 && lossPctAnim > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: `${(ours / SCALE_MAX) * 100 * basePhase}%`,
              height: '100%',
              width: `${lossPctAnim}%`,
              borderRadius: 2,
              border: '0.5px solid #B83D44',
              backgroundImage:
                'repeating-linear-gradient(135deg, #C8B8A8 0 2px, #FBE5E5 2px 4px)',
            }}
          />
        )}
      </div>

      {/* numbers */}
      <div
        style={{
          fontFamily: MONO,
          fontSize: 15,
          color: '#1B1816',
          lineHeight: 1.15,
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
          opacity: numAlpha,
        }}
      >
        <div>
          {base.toFixed(1)}→
          <span style={{ fontWeight: highlight ? 700 : 500 }}>{ours.toFixed(1)}</span>
        </div>
        <div
          style={{
            fontSize: 13,
            color: lift > 0 ? '#1F6E3F' : lift < 0 ? '#B83D44' : '#9C948A',
          }}
        >
          {lift >= 0 ? '+' : ''}
          {lift.toFixed(1)} pp
        </div>
      </div>
    </div>
  );
}

function ResultsTable({ pulse }: { pulse: number }) {
  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: PALATINO,
        fontSize: 20,
        color: '#1B1816',
        alignSelf: 'stretch',
      }}
    >
      <thead>
        <tr style={{ borderBottom: '1.5px solid #1B1816' }}>
          <Th>Model</Th>
          <Th align="right">OSWorld-V.</Th>
          <Th align="right">WebArena</Th>
          <Th align="right">OSWorld-2.0</Th>
          <Th align="right">ScienceBoard</Th>
          <Th align="right">Spider2V</Th>
        </tr>
      </thead>
      <tbody>
        <SubHead label="Proprietary models" />
        {RESULTS.proprietary.map((r) => (
          <Row key={r.model} {...r} />
        ))}
        <SubHead label="Open-source models" />
        {RESULTS.openSource.map((r) => (
          <Row key={r.model} {...r} />
        ))}
        <SubHead label="Ours" />
        {RESULTS.ours.map((r) => (
          <Row key={r.model} {...r} pulse={pulse} />
        ))}
      </tbody>
    </table>
  );
}

function SubHead({ label }: { label: string }) {
  return (
    <tr>
      <td
        colSpan={6}
        style={{
          paddingTop: 20,
          paddingBottom: 6,
          fontFamily: PALATINO,
          fontStyle: 'italic',
          fontSize: 17,
          color: '#9C948A',
          letterSpacing: '-0.003em',
        }}
      >
        {label}
      </td>
    </tr>
  );
}

function Row({
  model,
  osworld,
  webarena,
  osworld2,
  scienceboard,
  spider2v,
  baseline,
  highlight,
  pulse = 0,
}: ModelRow & { pulse?: number }) {
  const bg = highlight
    ? `rgba(134, 45, 26, ${0.06 + pulse * 0.18})`
    : 'transparent';
  return (
    <tr
      style={{
        borderBottom: '1px solid #E0D8C5',
        backgroundColor: bg,
      }}
    >
      <td
        style={{
          padding: '12px 10px',
          fontFamily: PALATINO,
          fontSize: 22,
          fontStyle: baseline ? 'italic' : 'normal',
          fontWeight: highlight ? 600 : 400,
          color: highlight ? '#1B1816' : baseline ? '#5C5651' : '#1B1816',
        }}
      >
        {highlight && <span style={{ color: '#862D1A', marginRight: 8 }}>▸</span>}
        {model}
      </td>
      <td
        style={{
          padding: '12px 10px',
          textAlign: 'right',
          fontFamily: MONO,
          fontSize: 20,
          fontWeight: highlight ? 700 : 400,
          color: highlight ? '#862D1A' : '#1B1816',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {osworld}
      </td>
      <td
        style={{
          padding: '12px 10px',
          textAlign: 'right',
          fontFamily: MONO,
          fontSize: 20,
          fontWeight: highlight ? 700 : 400,
          color: highlight ? '#862D1A' : '#1B1816',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {webarena}
      </td>
      <NumCell value={osworld2} highlight={highlight} />
      <NumCell value={scienceboard} highlight={highlight} />
      <NumCell value={spider2v} highlight={highlight} />
    </tr>
  );
}

function NumCell({
  value,
  highlight,
}: {
  value: string;
  highlight?: boolean;
}) {
  return (
    <td
      style={{
        padding: '12px 10px',
        textAlign: 'right',
        fontFamily: MONO,
        fontSize: 20,
        fontWeight: highlight ? 700 : 400,
        color: highlight ? '#862D1A' : '#1B1816',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </td>
  );
}

function Th({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <th
      style={{
        textAlign: align,
        fontFamily: PALATINO,
        fontSize: 20,
        fontWeight: 600,
        color: '#1B1816',
        padding: '10px 10px 8px 10px',
        letterSpacing: '-0.005em',
      }}
    >
      {children}
    </th>
  );
}

export const RESULTS_SCENE_FRAMES = SCENE_FRAMES;
export const RESULTS_SCENE_FPS = FPS;
