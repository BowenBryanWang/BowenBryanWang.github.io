import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from '../lib/remotion-shim';

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
//   0 – 330   hold static
// 330 – 360   scene fade out

export const ScalingResults = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(
    frame,
    [0, FADE_IN_FRAMES],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const fadeOut = interpolate(
    frame,
    [FADE_OUT_START, SCENE_FRAMES],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const sceneOp = Math.min(fadeIn, fadeOut);

  // Per-panel reveal so slide mode can stage (a) and (b) separately.
  const panelAOp = interpolate(frame, [40, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const panelBOp = interpolate(frame, [130, 180], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

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
          Both axes{' '}
          <span style={{ color: '#862D1A', fontStyle: 'italic', fontWeight: 600 }}>
            scale
          </span>{' '}
          — more data <em>and</em> more environments.
        </div>

        {/* Two figures, side by side — each panel fades in separately
            so right-arrow can stage (a) then (b). */}
        <div
          style={{
            position: 'absolute',
            left: 96,
            right: 96,
            top: 138,
            bottom: 80,
            display: 'grid',
            gridTemplateColumns: '1.05fr 1fr',
            gap: 52,
            minHeight: 0,
          }}
        >
          <div style={{ opacity: panelAOp, display: 'grid', minHeight: 0 }}>
          <FigurePanel
            kicker="(a) Data scaling"
            title="More RL tuples → higher OSWorld score"
            src="results/data_scale.png"
            takeaway={
              <>
                12K&nbsp;tuples consistently dominate 3K and 1.4K throughout
                training; the gap{' '}
                <Strong>opens after step 30</Strong> and never closes.
              </>
            }
            xAxisLabel="RL training step"
            yAxisLabel="OSWorld-Verified score"
            customLegend={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 22,
                  fontFamily: PALATINO,
                  fontSize: 17,
                  color: '#5C5651',
                }}
              >
                <LegendSwatch color="#B83D44" label="12K tuples" />
                <LegendSwatch color="#8E8049" label="3K tuples" />
                <LegendSwatch color="#3F5F88" label="1.4K tuples" />
              </div>
            }
          />
          </div>

          <div style={{ opacity: panelBOp, display: 'grid', minHeight: 0 }}>
          <FigurePanel
            kicker="(b) Environment scaling"
            title="More distinct envs → higher OSWorld score"
            src="results/env_scale.png"
            takeaway={
              <>
                Scaling from 10 envs → 80 envs lifts score{' '}
                <Strong>+1.0 pp</Strong> at fixed budget; adding more
                trajectories on the same 80 envs adds another{' '}
                <Strong>+1.9 pp</Strong>.
              </>
            }
            customAnnotation={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 14,
                  fontFamily: PALATINO,
                  fontSize: 17,
                  color: '#5C5651',
                }}
              >
                <PlusBadge>+1.0 pp envs</PlusBadge>
                <PlusBadge>+1.9 pp data</PlusBadge>
              </div>
            }
          />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

function FigurePanel({
  kicker,
  title,
  src,
  takeaway,
  customLegend,
  customAnnotation,
}: {
  kicker: string;
  title: string;
  src: string;
  takeaway: React.ReactNode;
  xAxisLabel?: string;
  yAxisLabel?: string;
  customLegend?: React.ReactNode;
  customAnnotation?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        minHeight: 0,
        gap: 10,
      }}
    >
      <div
        style={{
          fontFamily: PALATINO,
          fontSize: 15,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#9C948A',
          fontWeight: 500,
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          fontFamily: PALATINO,
          fontSize: 27,
          fontWeight: 500,
          color: '#1B1816',
          letterSpacing: '-0.005em',
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>

      {/* Figure plate */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          marginTop: 4,
          marginBottom: 4,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>

      {/* Legend / annotation */}
      {(customLegend || customAnnotation) && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {customLegend ?? customAnnotation}
        </div>
      )}

      {/* Takeaway sentence */}
      <div
        style={{
          fontFamily: PALATINO,
          fontSize: 21,
          color: '#1B1816',
          lineHeight: 1.32,
          marginTop: 4,
          maxWidth: '60ch',
          alignSelf: 'center',
          textAlign: 'center',
        }}
      >
        {takeaway}
      </div>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span
        style={{
          display: 'inline-block',
          width: 22,
          height: 4,
          borderRadius: 2,
          backgroundColor: color,
        }}
      />
      <span
        style={{
          fontFamily: MONO,
          fontSize: 16,
          color: '#1B1816',
          letterSpacing: '-0.005em',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function PlusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        borderRadius: 999,
        backgroundColor: 'rgba(31, 110, 63, 0.10)',
        color: '#1F6E3F',
        fontFamily: MONO,
        fontSize: 16,
        fontWeight: 600,
        letterSpacing: '-0.005em',
      }}
    >
      {children}
    </span>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{ color: '#862D1A', fontStyle: 'italic', fontWeight: 600 }}
    >
      {children}
    </span>
  );
}

export const SCALING_RESULTS_FRAMES = SCENE_FRAMES;
export const SCALING_RESULTS_FPS = FPS;
