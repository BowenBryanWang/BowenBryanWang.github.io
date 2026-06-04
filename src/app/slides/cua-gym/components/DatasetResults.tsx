import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from '../lib/remotion-shim';

const PALATINO =
  '"Palatino Linotype", "Palatino", "Book Antiqua", "URW Palladio L", Georgia, serif';
const MONO = 'Menlo, Monaco, "JetBrains Mono", "Cascadia Code", monospace';

const FPS = 60;
const SCENE_FRAMES = 840; // 14.0s
const FADE_OUT_FRAMES = 30;
const FADE_OUT_START = SCENE_FRAMES - FADE_OUT_FRAMES;
const SLIDE_DUR = 30;     // 0.5s horizontal-slide transition

// Card windows (centered hold → outgoing slide):
//   Card 1 (donut)        :   0 – 150  (2.5s hold) → slide out 150 – 180
//   Card 2 (env)          : 180 – 330  (2.5s hold) → slide out 330 – 360
//   Card 3 (table+bullets): 360 – 810  (7.5s hold) → fade with scene
//   Scene fade            : 810 – 840
//
const CARD1_END = 150;
const CARD2_START = 180;
const CARD2_END = 330;
const CARD3_START = 360;

const BULLETS = [
  {
    text: 'All tasks ship with verifiable setups and rewards.',
    emphasis: 'verifiable setups and rewards',
  },
  {
    text: 'Mirrors the OSWorld evaluation environment — plug-and-play.',
    emphasis: 'plug-and-play',
  },
  {
    text: 'The largest and most diverse open CUA RLVR dataset to date.',
    emphasis: 'largest and most diverse',
  },
];

type Row = {
  name: string;
  platform: string;
  size: string;
  env: string;
  reward: string;
  open: string;
  ours?: boolean;
};

const COMPARISON: Row[] = [
  { name: 'GUI-Genesis',       platform: 'Mobile',        size: '969',    env: '1',   reward: 'Programmatic', open: 'No' },
  { name: 'WebArena-Infinity', platform: 'Web',           size: '1,260',  env: '10',  reward: 'Programmatic', open: 'Yes' },
  { name: 'InfiniteWeb',       platform: 'Web',           size: '600',    env: '—',   reward: 'Programmatic', open: 'No★' },
  { name: 'UltraCUA',          platform: 'Desktop',       size: '17,000', env: '9',   reward: 'Programmatic', open: 'No★' },
  { name: 'Gym-Anything',      platform: 'Desktop',       size: '7,277',  env: '193', reward: 'VLM',          open: 'Yes' },
  { name: 'CUA-Gym',           platform: 'Desktop + Web', size: '32,122', env: '110', reward: 'Programmatic', open: 'Yes', ours: true },
];

// slideEasing removed — cross-fade no longer uses easing curves.

export const DatasetResults = () => {
  const frame = useCurrentFrame();

  // Slide mode: cards just cross-fade in place (no horizontal slide).
  // Each card is fully visible during its hold window and fades to 0 outside.
  const c1Op = interpolate(
    frame,
    [CARD1_END, CARD1_END + SLIDE_DUR],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const c2InOp = interpolate(
    frame,
    [CARD2_START - SLIDE_DUR, CARD2_START],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const c2OutOp = interpolate(
    frame,
    [CARD2_END, CARD2_END + SLIDE_DUR],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const c2Op = frame < CARD2_START ? c2InOp : c2OutOp;
  const c3Op = interpolate(
    frame,
    [CARD3_START - SLIDE_DUR, CARD3_START],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // CUA-Gym row pulse fires ~0.5s after Card 3 centers, before bullets start
  const pulse = interpolate(
    frame,
    [CARD3_START + 30, CARD3_START + 60, CARD3_START + 90],
    [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

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
      {/* grid + sine — stays constant across all cards */}
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
        {/* Persistent main title — sits above the sliding cards */}
        <div
          style={{
            position: 'absolute',
            left: 96,
            right: 96,
            top: 40,
            fontFamily: PALATINO,
            fontSize: 44,
            lineHeight: 1.14,
            fontWeight: 500,
            color: '#1B1816',
            letterSpacing: '-0.005em',
            zIndex: 2,
          }}
        >
          The largest open CUA RLVR dataset, by{' '}
          <span style={{ color: '#862D1A', fontStyle: 'italic', fontWeight: 600 }}>
            every axis
          </span>
          .
        </div>

        {/* CARD 1 — donut chart (Task distribution) */}
        <Slide op={c1Op}>
          <FigureCard
            figureSrc="results/data_distribution.png"
            caption={
              <>
                <Big>32,122</Big> verifiable RLVR tuples, spanning{' '}
                <Em>every major occupational domain</Em> — productivity, creative,
                OS, multi-app, browsing, and beyond.
              </>
            }
          />
        </Slide>

        {/* CARD 2 — environment coverage (env figure) */}
        <Slide op={c2Op}>
          <FigureCard
            figureSrc="results/env.png"
            caption={
              <>
                All built on top of <Big>110 diverse environments</Big> —{' '}
                <Em>16 desktop applications + 94 mock web apps</Em>, every one a
                deterministic, resettable sandbox.
              </>
            }
          />
        </Slide>

        {/* CARD 3 — comparison table (top) + static centered bullets (lower) */}
        <Slide op={c3Op}>
          <TableCard pulse={pulse} />
        </Slide>
      </div>
    </AbsoluteFill>
  );
};

function Slide({
  op,
  children,
}: {
  op: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: op,
        willChange: 'opacity',
        pointerEvents: op > 0.5 ? 'auto' : 'none',
      }}
    >
      {children}
    </div>
  );
}

function FigureCard({
  figureSrc,
  caption,
}: {
  figureSrc: string;
  caption: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: '130px 96px 50px 96px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Img
          src={staticFile(figureSrc)}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>

      <div
        style={{
          fontFamily: PALATINO,
          fontSize: 30,
          lineHeight: 1.32,
          color: '#1B1816',
          letterSpacing: '-0.005em',
          marginTop: 24,
          textAlign: 'center',
          maxWidth: '70ch',
          alignSelf: 'center',
        }}
      >
        {caption}
      </div>
    </div>
  );
}

function TableCard({ pulse }: { pulse: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: '130px 96px 50px 96px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 60,
      }}
    >
      {/* Table */}
      <div style={{ flexShrink: 0 }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: PALATINO,
            fontSize: 22,
            color: '#1B1816',
            tableLayout: 'fixed',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid #1B1816' }}>
              <Th>Dataset</Th>
              <Th>Platform</Th>
              <Th align="right">Data size</Th>
              <Th align="right">Env. size</Th>
              <Th>Reward</Th>
              <Th align="center">Open</Th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON.map((r) => {
              const isOurs = r.ours;
              const bg = isOurs
                ? `rgba(134, 45, 26, ${0.07 + pulse * 0.18})`
                : 'transparent';
              const scale = isOurs ? 1 + pulse * 0.012 : 1;
              return (
                <tr
                  key={r.name}
                  style={{
                    borderBottom: '1px solid #E0D8C5',
                    backgroundColor: bg,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center',
                  }}
                >
                  <Td bold={isOurs} color={isOurs ? '#862D1A' : '#1B1816'}>
                    {isOurs && (
                      <span style={{ color: '#862D1A', marginRight: 10 }}>▸</span>
                    )}
                    {r.name}
                  </Td>
                  <Td color={isOurs ? '#1B1816' : '#5C5651'} bold={isOurs}>
                    {r.platform}
                  </Td>
                  <Td
                    align="right"
                    mono
                    bold={isOurs}
                    color={isOurs ? '#862D1A' : '#1B1816'}
                  >
                    {r.size}
                  </Td>
                  <Td
                    align="right"
                    mono
                    bold={isOurs}
                    color={isOurs ? '#862D1A' : '#1B1816'}
                  >
                    {r.env}
                  </Td>
                  <Td color={isOurs ? '#1B1816' : '#5C5651'} bold={isOurs}>
                    {r.reward}
                  </Td>
                  <Td
                    align="center"
                    bold={isOurs}
                    color={isOurs ? '#1B1816' : '#5C5651'}
                  >
                    {r.open}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bullets — static, centered horizontally below the table */}
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          width: 'fit-content',
          maxWidth: '90%',
          flexShrink: 0,
        }}
      >
        {BULLETS.map((b, i) => (
          <li
            key={i}
            style={{
              fontFamily: PALATINO,
              fontSize: 40,
              lineHeight: 1.32,
              color: '#1B1816',
              letterSpacing: '-0.003em',
              display: 'flex',
              alignItems: 'baseline',
              gap: 20,
            }}
          >
            <span
              style={{
                color: '#862D1A',
                fontWeight: 700,
                fontFamily: MONO,
                fontSize: 30,
                flexShrink: 0,
              }}
            >
              ▸
            </span>
            <span>{renderEmphasis(b.text, b.emphasis)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Wrap the emphasis phrase in oxblood — plain (no italic).
function renderEmphasis(text: string, emphasis: string) {
  const idx = text.indexOf(emphasis);
  if (idx === -1) {
    return text;
  }
  const before = text.slice(0, idx);
  const matched = text.slice(idx, idx + emphasis.length);
  const after = text.slice(idx + emphasis.length);
  return (
    <>
      {before}
      <span style={{ color: '#862D1A', fontWeight: 600 }}>{matched}</span>
      {after}
    </>
  );
}

function Big({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        color: '#862D1A',
        fontWeight: 700,
        fontFamily: MONO,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {children}
    </span>
  );
}

function Em({ children }: { children: React.ReactNode }) {
  return (
    <em style={{ color: '#1B1816', fontStyle: 'italic', fontWeight: 600 }}>
      {children}
    </em>
  );
}

function Th({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
}) {
  return (
    <th
      style={{
        textAlign: align,
        fontFamily: PALATINO,
        fontSize: 22,
        fontWeight: 600,
        color: '#1B1816',
        padding: '10px 12px 8px 12px',
        letterSpacing: '-0.005em',
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = 'left',
  mono,
  bold,
  color,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  mono?: boolean;
  bold?: boolean;
  color?: string;
}) {
  return (
    <td
      style={{
        textAlign: align,
        fontFamily: mono ? MONO : PALATINO,
        fontSize: mono ? 23 : 24,
        fontWeight: bold ? 700 : 400,
        color: color ?? '#1B1816',
        padding: '11px 12px',
        letterSpacing: mono ? '-0.005em' : '-0.003em',
        fontVariantNumeric: mono ? 'tabular-nums' : 'normal',
      }}
    >
      {children}
    </td>
  );
}

export const DATASET_RESULTS_FRAMES = SCENE_FRAMES;
export const DATASET_RESULTS_FPS = FPS;
