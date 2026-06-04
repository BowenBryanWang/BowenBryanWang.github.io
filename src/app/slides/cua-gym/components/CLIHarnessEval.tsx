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

type Row = {
  group?: string;
  model: string;
  raw: string;
  audited: string;
  osworld2: string;
  highlight?: boolean;
};

const ROWS: Row[] = [
  { group: 'Proprietary CUA models', model: 'Claude Sonnet 4.6',
    raw: '72.6', audited: '—', osworld2: '28.0' },
  {                                  model: 'Claude Opus 4.7',
    raw: '78.0', audited: '—', osworld2: '—' },
  {                                  model: 'GPT-5.5',
    raw: '78.7', audited: '—', osworld2: '—' },
  { group: 'CLI agent harnesses',    model: 'Codex w/ GPT-5.5',
    raw: '54.0', audited: '71.8', osworld2: '36.8', highlight: true },
  {                                  model: 'Claude Code w/ Opus 4.7',
    raw: '49.9', audited: '68.5', osworld2: '24.6', highlight: true },
];

export const CLIHarnessEval = () => {
  const frame = useCurrentFrame();

  const titleOp = fadeIn(frame, 0, 30);
  const setupOp = fadeIn(frame, 60, 100);
  const tableOp = fadeIn(frame, 150, 200);
  const takeawayOp = fadeIn(frame, 280, 330);

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
          fontSize: 52,
          fontWeight: 500,
          color: '#1B1816',
          letterSpacing: '-0.005em',
          lineHeight: 1.16,
          opacity: titleOp,
        }}
      >
        Evaluating{' '}
        <span style={{ color: '#862D1A', fontWeight: 700 }}>
          CLI harness
        </span>{' '}
        in GUI benchmarks.
      </div>

      {/* Setup paragraph */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 170,
          fontFamily: PALATINO,
          fontSize: 24,
          lineHeight: 1.4,
          color: '#1B1816',
          letterSpacing: '-0.003em',
          opacity: setupOp,
          maxWidth: 1450,
        }}
      >
        We drop a general-purpose <Strong>CLI agent</Strong> (Codex, Claude Code)
        into the OSWorld VM and hand it the GUI benchmark task verbatim — no
        screenshots, no mouse, just a shell.{' '}
        <span style={{ color: '#5C5651' }}>
          How far can CLI alone go on a benchmark built for GUI agents?
        </span>
      </div>

      {/* Results table — centered */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 330,
          display: 'flex',
          justifyContent: 'center',
          opacity: tableOp,
        }}
      >
        <table
          style={{
            width: 1100,
            borderCollapse: 'collapse',
            fontFamily: PALATINO,
            fontSize: 26,
            color: '#1B1816',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid #1B1816' }}>
              <Th>Model</Th>
              <Th align="right">OSWorld-V. (audited*)</Th>
              <Th align="right">OSWorld-2.0</Th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <RowComp key={r.model} {...r} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footnote — sits below the table, above the bottom takeaway */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 200,
          textAlign: 'center',
          fontFamily: PALATINO,
          fontSize: 18,
          color: '#5C5651',
          letterSpacing: '-0.003em',
          opacity: tableOp,
        }}
      >
        <span style={{ color: '#862D1A' }}>*</span> Audited: score after a
        manual review of the trajectories, correcting OSWorld task
        annotations and false-negative grader judgments.
      </div>

      {/* Takeaway */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          bottom: 70,
          fontFamily: PALATINO,
          fontSize: 28,
          lineHeight: 1.4,
          color: '#1B1816',
          letterSpacing: '-0.005em',
          textAlign: 'center',
          opacity: takeawayOp,
        }}
      >
        General-purpose CLI agents reach{' '}
        <Strong>~70% on OSWorld-Verified</Strong> after audit — closing most
        of the gap to dedicated CUA frontier models, without ever touching
        the GUI.
      </div>
    </AbsoluteFill>
  );
};

function RowComp({ group, model, raw, audited, osworld2, highlight }: Row) {
  const hasAudited = audited && audited !== '—';
  return (
    <>
      {group && (
        <tr>
          <td
            colSpan={3}
            style={{
              paddingTop: 28,
              paddingBottom: 8,
              fontFamily: PALATINO,
              fontSize: 19,
              color: '#9C948A',
              letterSpacing: '-0.003em',
            }}
          >
            {group}
          </td>
        </tr>
      )}
      <tr
        style={{
          borderBottom: '1px solid #E0D8C5',
          backgroundColor: highlight ? 'rgba(134, 45, 26, 0.07)' : 'transparent',
        }}
      >
        <td
          style={{
            padding: '14px 16px',
            fontFamily: PALATINO,
            fontSize: 24,
            fontWeight: highlight ? 600 : 400,
            color: '#1B1816',
          }}
        >
          {highlight && (
            <span style={{ color: '#862D1A', marginRight: 10 }}>▸</span>
          )}
          <ModelName value={model} />
        </td>
        <td
          style={{
            padding: '14px 16px',
            textAlign: 'right',
            fontFamily: MONO,
            fontSize: 24,
            fontWeight: highlight ? 700 : 400,
            color: highlight ? '#862D1A' : '#1B1816',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {raw}
          {hasAudited && (
            <span
              style={{
                fontFamily: MONO,
                marginLeft: 8,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <span style={{ color: '#9C948A', fontWeight: 400 }}>(</span>
              <span
                style={{
                  color: highlight ? '#862D1A' : '#1B1816',
                  fontWeight: highlight ? 700 : 400,
                }}
              >
                {audited}
                <span style={{ color: '#862D1A' }}>*</span>
              </span>
              <span style={{ color: '#9C948A', fontWeight: 400 }}>)</span>
            </span>
          )}
        </td>
        <td
          style={{
            padding: '14px 16px',
            textAlign: 'right',
            fontFamily: MONO,
            fontSize: 24,
            fontWeight: highlight ? 700 : 400,
            color: highlight ? '#862D1A' : '#1B1816',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {osworld2}
        </td>
      </tr>
    </>
  );
}

function ModelName({ value }: { value: string }) {
  const idx = value.indexOf(' w/ ');
  if (idx === -1) return <span>{value}</span>;
  const name = value.slice(0, idx);
  const suffix = value.slice(idx + 4);
  return (
    <>
      <span>{name}</span>
      <span style={{ color: '#9C948A', fontWeight: 400, fontSize: 20 }}>
        {' '}w/ {suffix}
      </span>
    </>
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
        fontSize: 24,
        fontWeight: 600,
        color: '#1B1816',
        padding: '12px 16px 10px 16px',
        letterSpacing: '-0.005em',
      }}
    >
      {children}
    </th>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ color: '#862D1A', fontWeight: 600 }}>{children}</span>
  );
}
