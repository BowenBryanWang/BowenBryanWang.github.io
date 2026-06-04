import { AbsoluteFill, interpolate, useCurrentFrame } from '../lib/remotion-shim';
import TrajectoryShowcase from './TrajectoryShowcase';

const PALATINO =
  '"Palatino Linotype", "Palatino", "Book Antiqua", "URW Palladio L", Georgia, serif';

function fadeIn(frame: number, start: number, end: number) {
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

// TRAJECTORIES order after xplat removal: [0]=pdf_cross_009, [1]=shopify_adv_005.
// E-commerce admin is index 1.
const SHOPIFY_TRAJ_IDX = 1;

export const TaskExample = () => {
  const frame = useCurrentFrame();
  const titleOp = fadeIn(frame, 0, 20);
  // Snap fade — at step frame (60) we want opacity 1, not 0.5. Without this
  // the showcase renders at half opacity over the cream paper and looks
  // muddy/gray.
  const showcaseOp = fadeIn(frame, 0, 30);

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
          left: 64,
          right: 64,
          top: 50,
          fontFamily: PALATINO,
          fontSize: 48,
          fontWeight: 500,
          color: '#1B1816',
          letterSpacing: '-0.005em',
          lineHeight: 1.16,
          opacity: titleOp,
        }}
      >
        Example of a{' '}
        <span style={{ color: '#862D1A', fontWeight: 700 }}>CUA-Gym</span>{' '}
        task.
      </div>

      {/* Showcase — directly reused from cua-gym-homepage. The component renders
          its tabs at the top and three modules below; we just embed it inside
          the 1920×1080 stage area below the title. */}
      <div
        style={{
          position: 'absolute',
          left: 32,
          right: 32,
          top: 130,
          bottom: 32,
          opacity: showcaseOp,
          overflow: 'hidden',
        }}
      >
        <TrajectoryShowcase defaultTrajIdx={SHOPIFY_TRAJ_IDX} />
      </div>
    </AbsoluteFill>
  );
};
