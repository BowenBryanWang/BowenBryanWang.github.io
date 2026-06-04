'use client'

// Minimal compatibility shim that lets us drop Remotion-built scene
// components into the slide deck unchanged (only the `from 'remotion'`
// import has to be retargeted to this file).
//
// All animation primitives default to their FINAL state — slide mode is
// "the scene already finished playing, just hold the last frame".  For
// scenes that need a particular intermediate frame (e.g. before fade-out),
// wrap with <FrameContext.Provider value={...}>.

import {
  createContext,
  useContext,
  type CSSProperties,
  type ReactNode,
} from 'react'

// ─── Frame context ─────────────────────────────────────────────────────────
//
// Default = 1e9. Most `interpolate(frame, [a,b], [v0,v1])` with frame=∞ yields
// v1 (extrapolateRight defaults to 'extend' but clamped frames map to v1).
// For scenes that fade OUT at the end (e.g. opacity 1 → 0 on FADE_OUT_START..END),
// callers must pass a frame BEFORE FADE_OUT_START via FrameContext.
export const FrameContext = createContext<number>(1_000_000_000)

export function useCurrentFrame(): number {
  return useContext(FrameContext)
}

// ─── interpolate ───────────────────────────────────────────────────────────
type InterpOpts = {
  extrapolateLeft?: 'extend' | 'clamp' | 'identity' | 'wrap'
  extrapolateRight?: 'extend' | 'clamp' | 'identity' | 'wrap'
  easing?: (t: number) => number
}

export function interpolate(
  frame: number,
  inputRange: readonly number[],
  outputRange: readonly number[],
  opts: InterpOpts = {},
): number {
  const { extrapolateLeft = 'extend', extrapolateRight = 'extend', easing } = opts
  if (inputRange.length < 2 || inputRange.length !== outputRange.length) {
    return outputRange[0] ?? 0
  }

  // Left of first
  if (frame <= inputRange[0]) {
    if (extrapolateLeft === 'clamp') return outputRange[0]
    if (extrapolateLeft === 'identity') return frame
    // 'extend' — linear from first segment
    const seg = (frame - inputRange[0]) / (inputRange[1] - inputRange[0])
    return outputRange[0] + (outputRange[1] - outputRange[0]) * seg
  }

  // Inside ranges
  for (let i = 1; i < inputRange.length; i++) {
    if (frame <= inputRange[i]) {
      let t =
        (frame - inputRange[i - 1]) / (inputRange[i] - inputRange[i - 1])
      if (easing) t = easing(t)
      return outputRange[i - 1] + (outputRange[i] - outputRange[i - 1]) * t
    }
  }

  // Right of last
  if (extrapolateRight === 'clamp') return outputRange[outputRange.length - 1]
  if (extrapolateRight === 'identity') return frame
  const lastIdx = inputRange.length - 1
  const seg =
    (frame - inputRange[lastIdx - 1]) /
    (inputRange[lastIdx] - inputRange[lastIdx - 1])
  return (
    outputRange[lastIdx - 1] +
    (outputRange[lastIdx] - outputRange[lastIdx - 1]) * seg
  )
}

// ─── Easing curves (subset of Remotion's Easing) ───────────────────────────
const linearEase = (t: number) => t
const cubicEase = (t: number) => t * t * t
const inOutWrap = (fn: (t: number) => number) => (t: number) =>
  t < 0.5 ? fn(2 * t) / 2 : 1 - fn(2 - 2 * t) / 2

export const Easing = {
  linear: linearEase,
  cubic: cubicEase,
  inOut: inOutWrap,
  in: (fn: (t: number) => number) => fn,
  out: (fn: (t: number) => number) => (t: number) => 1 - fn(1 - t),
  bezier: () => linearEase,
}

// ─── AbsoluteFill ──────────────────────────────────────────────────────────
export function AbsoluteFill({
  children,
  style,
  ...rest
}: {
  children?: ReactNode
  style?: CSSProperties
  [k: string]: unknown
}) {
  return (
    <div
      {...(rest as Record<string, unknown>)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── Img (Remotion's <Img> component) ──────────────────────────────────────
export function Img({
  src,
  style,
  alt,
  ...rest
}: {
  src: string
  style?: CSSProperties
  alt?: string
  [k: string]: unknown
}) {
  /* eslint-disable-next-line @next/next/no-img-element */
  return (
    <img
      src={src}
      style={style}
      alt={alt ?? ''}
      {...(rest as Record<string, unknown>)}
    />
  )
}

// ─── staticFile ────────────────────────────────────────────────────────────
//
// Remotion's staticFile('results/env.png') normally resolves to the project's
// /public folder. We've flattened all assets into one folder, so just take
// the basename.
export function staticFile(path: string): string {
  const filename = path.split('/').pop() ?? ''
  return `/slides/cua-gym/figures/${filename}`
}

// ─── Audio / Series — no-ops for slide mode ────────────────────────────────
export function Audio(_props: Record<string, unknown>) {
  return null
}

interface SeriesProps {
  children?: ReactNode
}
interface SeriesType {
  (props: SeriesProps): JSX.Element
  Sequence: (props: SeriesProps) => JSX.Element
}
export const Series: SeriesType = (({ children }) => <>{children}</>) as SeriesType
const SeriesSequence = ({ children }: SeriesProps) => <>{children}</>
SeriesSequence.displayName = 'Series.Sequence'
Series.Sequence = SeriesSequence
