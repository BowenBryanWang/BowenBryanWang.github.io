'use client'

// Generic Google Slides–style deck wrapper.
//
//   <SlidesDeck slides={SLIDES} FrameContext={FrameContext} title="My Deck" />
//
// Default view is editor-like: numbered thumbnail rail on the left, big slide
// canvas in the middle, page number in the corner. Press F (or click ▶ Present)
// to enter fullscreen presentation mode. Arrow keys / Space / PageUp / PageDown
// navigate; Home/End jump to ends; Esc exits presentation.
//
// Decks pass their *own* FrameContext (the one their slide components import
// from their remotion-shim) so the wrapper can drive `useCurrentFrame()`.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Context,
  type ReactNode,
} from 'react'

const STAGE_W_DEFAULT = 1920
const STAGE_H_DEFAULT = 1080
const STEP_ANIM_MS = 380

const INK = '#1B1816'
const OXBLOOD = '#862D1A'
const RAIL_BG = '#FFFFFF'
const RAIL_BORDER = '#E5DED0'
const CANVAS_BG = '#FFFFFF'

const MONO = 'Consolas, "JetBrains Mono", "SF Mono", Menlo, monospace'
const SERIF =
  '"Palatino Linotype", "Palatino", "Book Antiqua", "URW Palladio L", Georgia, serif'

// ─── Types ────────────────────────────────────────────────────────────────
export type Slide<P extends object = Record<string, unknown>> = {
  Component: React.ComponentType<P>
  /** Each entry is one "step" in the slide — the source video frame to render
   *  when that step is active. Right-arrow advances steps within the slide. */
  frames: number[]
  props?: P
  label: string
}

export type SlidesDeckProps = {
  slides: Slide<never>[]
  /** The FrameContext exported by your remotion-shim — slide components read
   *  from this via useCurrentFrame(). */
  FrameContext: Context<number>
  title?: string
  subtitle?: string
  /** Canvas dimensions; defaults to 1920×1080. */
  stageWidth?: number
  stageHeight?: number
}

// ─── Utilities ────────────────────────────────────────────────────────────
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function SlidesDeck({
  slides,
  FrameContext,
  title = 'Slides',
  subtitle,
  stageWidth = STAGE_W_DEFAULT,
  stageHeight = STAGE_H_DEFAULT,
}: SlidesDeckProps) {
  const [slideIdx, setSlideIdx] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)
  const [frame, setFrame] = useState(slides[0].frames[0])
  const [present, setPresent] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // ── URL deep-link on mount ────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    let n: number | null = null
    const hash = window.location.hash.replace(/^#/, '')
    if (/^\d+$/.test(hash)) n = parseInt(hash, 10)
    if (n === null) {
      const m = window.location.pathname.match(/\/page(\d+)\/?$/)
      if (m) n = parseInt(m[1], 10)
    }
    if (n !== null && n >= 1 && n <= slides.length) {
      setSlideIdx(n - 1)
      setStepIdx(0)
      setFrame(slides[n - 1].frames[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Frame animation between steps ─────────────────────────────────────
  const lastTargetRef = useRef(slides[0].frames[0])
  const lastSlideIdxRef = useRef(slideIdx)
  const animRafRef = useRef<number | null>(null)
  useEffect(() => {
    const target = slides[slideIdx].frames[stepIdx]

    if (slideIdx !== lastSlideIdxRef.current) {
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current)
      lastSlideIdxRef.current = slideIdx
      lastTargetRef.current = target
      setFrame(target)
      return
    }

    const start = lastTargetRef.current
    lastTargetRef.current = target
    if (start === target) {
      setFrame(target)
      return
    }

    const startTime = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / STEP_ANIM_MS)
      setFrame(start + (target - start) * easeOutCubic(t))
      if (t < 1) animRafRef.current = requestAnimationFrame(tick)
    }
    animRafRef.current = requestAnimationFrame(tick)
    return () => {
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current)
    }
  }, [slideIdx, stepIdx, slides])

  // ── URL hash sync ─────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    const desired = `#${slideIdx + 1}`
    if (window.location.hash !== desired) {
      window.history.replaceState(null, '', desired)
    }
  }, [slideIdx])

  // ── Navigation ────────────────────────────────────────────────────────
  const slideIdxRef = useRef(slideIdx)
  const stepIdxRef = useRef(stepIdx)
  useEffect(() => {
    slideIdxRef.current = slideIdx
    stepIdxRef.current = stepIdx
  }, [slideIdx, stepIdx])

  const next = useCallback(() => {
    const si = slideIdxRef.current
    const st = stepIdxRef.current
    const cur = slides[si]
    if (st < cur.frames.length - 1) {
      setStepIdx(st + 1)
    } else if (si < slides.length - 1) {
      const newSi = si + 1
      setSlideIdx(newSi)
      setStepIdx(0)
      setFrame(slides[newSi].frames[0])
    }
  }, [slides])

  const prev = useCallback(() => {
    const si = slideIdxRef.current
    const st = stepIdxRef.current
    if (st > 0) {
      setStepIdx(st - 1)
    } else if (si > 0) {
      const newSi = si - 1
      const newStep = slides[newSi].frames.length - 1
      setSlideIdx(newSi)
      setStepIdx(newStep)
      setFrame(slides[newSi].frames[newStep])
    }
  }, [slides])

  const jumpTo = useCallback(
    (idx: number) => {
      setSlideIdx(idx)
      setStepIdx(0)
      setFrame(slides[idx].frames[0])
    },
    [slides],
  )

  const toggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else document.documentElement.requestFullscreen().catch(() => {})
  }, [])

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // ── Keyboard ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (
        e.key === 'ArrowRight' ||
        e.key === ' ' ||
        e.key === 'PageDown' ||
        e.key === 'l'
      ) {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'h') {
        e.preventDefault()
        prev()
      } else if (e.key === 'Home') {
        setSlideIdx(0)
        setStepIdx(0)
        setFrame(slides[0].frames[0])
      } else if (e.key === 'End') {
        const last = slides.length - 1
        const lastStep = slides[last].frames.length - 1
        setSlideIdx(last)
        setStepIdx(lastStep)
        setFrame(slides[last].frames[lastStep])
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        setPresent((p) => !p)
      } else if (e.key === 'Escape') {
        if (present) setPresent(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev, present, slides])

  // Body overflow lock in present mode.
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!present) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [present])

  const slide = slides[slideIdx]

  if (present) {
    return (
      <PresentationMode
        slide={slide}
        frame={frame}
        FrameContext={FrameContext}
        stageWidth={stageWidth}
        stageHeight={stageHeight}
        slideIdx={slideIdx}
        slideTotal={slides.length}
        stepIdx={stepIdx}
        stepCount={slide.frames.length}
        isFullscreen={isFullscreen}
        onPrev={prev}
        onNext={next}
        onExit={() => setPresent(false)}
        onToggleFullscreen={toggleFullscreen}
      />
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: CANVAS_BG,
        color: INK,
        fontFamily: SERIF,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <TopBar
        title={title}
        subtitle={subtitle}
        slideIdx={slideIdx}
        slideTotal={slides.length}
        stepIdx={stepIdx}
        stepCount={slide.frames.length}
        onPresent={() => setPresent(true)}
      />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <ThumbnailRail
          slides={slides}
          slideIdx={slideIdx}
          stageWidth={stageWidth}
          stageHeight={stageHeight}
          FrameContext={FrameContext}
          onJump={jumpTo}
        />
        <MainCanvas
          slide={slide}
          frame={frame}
          FrameContext={FrameContext}
          stageWidth={stageWidth}
          stageHeight={stageHeight}
          pageNumber={slideIdx + 1}
          pageTotal={slides.length}
          stepIdx={stepIdx}
          stepCount={slide.frames.length}
          onPrev={prev}
          onNext={next}
        />
      </div>
    </div>
  )
}

// ─── TopBar ───────────────────────────────────────────────────────────────
function TopBar({
  title,
  subtitle,
  slideIdx,
  slideTotal,
  stepIdx,
  stepCount,
  onPresent,
}: {
  title: string
  subtitle?: string
  slideIdx: number
  slideTotal: number
  stepIdx: number
  stepCount: number
  onPresent: () => void
}) {
  return (
    <div
      style={{
        padding: '12px 22px',
        backgroundColor: '#FFFFFF',
        borderBottom: `1px solid ${RAIL_BORDER}`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexShrink: 0,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 17,
            fontWeight: 700,
            color: INK,
            letterSpacing: '-0.005em',
            lineHeight: 1.15,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 12,
              color: '#8A857C',
              marginTop: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      <div
        style={{
          fontFamily: MONO,
          fontSize: 13,
          color: '#5C5651',
          letterSpacing: '0.04em',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span>
          {String(slideIdx + 1).padStart(2, '0')} /{' '}
          {String(slideTotal).padStart(2, '0')}
        </span>
        {stepCount > 1 && (
          <span style={{ color: '#A39C90' }}>
            · step {stepIdx + 1}/{stepCount}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onPresent}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          backgroundColor: OXBLOOD,
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontFamily: SERIF,
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: '-0.005em',
          boxShadow: '0 1px 2px rgba(134,45,26,0.25)',
        }}
        title="Present (F)"
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
          <path d="M3 1.5v9l8-4.5z" />
        </svg>
        Present
      </button>
    </div>
  )
}

// ─── Thumbnail rail ───────────────────────────────────────────────────────
function ThumbnailRail({
  slides,
  slideIdx,
  stageWidth,
  stageHeight,
  FrameContext,
  onJump,
}: {
  slides: Slide<never>[]
  slideIdx: number
  stageWidth: number
  stageHeight: number
  FrameContext: Context<number>
  onJump: (idx: number) => void
}) {
  const THUMB_W = 196
  const scale = THUMB_W / stageWidth
  const thumbH = stageHeight * scale

  const railRef = useRef<HTMLDivElement | null>(null)
  // Scroll the active thumb into view when slideIdx changes.
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const active = rail.querySelector<HTMLElement>(`[data-thumb-idx="${slideIdx}"]`)
    if (active) {
      const r = active.getBoundingClientRect()
      const rr = rail.getBoundingClientRect()
      if (r.top < rr.top + 20 || r.bottom > rr.bottom - 20) {
        active.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
  }, [slideIdx])

  return (
    <div
      ref={railRef}
      style={{
        width: 244,
        backgroundColor: RAIL_BG,
        borderRight: `1px solid ${RAIL_BORDER}`,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '12px 0 24px 0',
        flexShrink: 0,
      }}
    >
      {slides.map((s, i) => {
        const active = i === slideIdx
        // NOTE: This is intentionally a <div role="button"> rather than a
        // <button>. Some slide components (e.g. TrajectoryShowcase → PlayBtn)
        // render their own <button> internally; nesting <button> in <button>
        // is invalid HTML and breaks SSR hydration.
        return (
          <div
            key={i}
            role="button"
            tabIndex={0}
            data-thumb-idx={i}
            onClick={() => onJump(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onJump(i)
              }
            }}
            title={s.label}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              padding: '4px 14px 4px 6px',
              width: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              outline: 'none',
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: active ? OXBLOOD : '#8A857C',
                fontWeight: active ? 700 : 500,
                width: 22,
                textAlign: 'right',
                paddingTop: 4,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <div
              style={{
                width: THUMB_W,
                height: thumbH,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                borderRadius: 3,
                border: active ? `2px solid ${OXBLOOD}` : `1px solid ${RAIL_BORDER}`,
                boxShadow: active
                  ? '0 2px 8px rgba(134,45,26,0.20)'
                  : '0 1px 2px rgba(0,0,0,0.06)',
                flexShrink: 0,
                outline: 'none',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: stageWidth,
                  height: stageHeight,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  pointerEvents: 'none',
                }}
              >
                <FrameContext.Provider value={s.frames[s.frames.length - 1]}>
                  <SlideRenderer slide={s} />
                </FrameContext.Provider>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main canvas ──────────────────────────────────────────────────────────
function MainCanvas({
  slide,
  frame,
  FrameContext,
  stageWidth,
  stageHeight,
  pageNumber,
  pageTotal,
  stepIdx,
  stepCount,
  onPrev,
  onNext,
}: {
  slide: Slide<never>
  frame: number
  FrameContext: Context<number>
  stageWidth: number
  stageHeight: number
  pageNumber: number
  pageTotal: number
  stepIdx: number
  stepCount: number
  onPrev: () => void
  onNext: () => void
}) {
  const [scale, setScale] = useState(0.5)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const PAD = 56
    const update = () => {
      const w = Math.max(0, el.clientWidth - PAD * 2)
      const h = Math.max(0, el.clientHeight - PAD * 2)
      setScale(Math.max(0.1, Math.min(w / stageWidth, h / stageHeight)))
    }
    update()
    const obs = new ResizeObserver(update)
    obs.observe(el)
    return () => obs.disconnect()
  }, [stageWidth, stageHeight])

  const isFirst = pageNumber === 1 && stepIdx === 0
  const isLast = pageNumber === pageTotal && stepIdx === stepCount - 1

  return (
    <div
      ref={ref}
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: CANVAS_BG,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: stageWidth * scale,
          height: stageHeight * scale,
          backgroundColor: '#FFFFFF',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 10px 36px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.10)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: stageWidth,
            height: stageHeight,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <FrameContext.Provider value={frame}>
            <SlideRenderer slide={slide} />
          </FrameContext.Provider>
        </div>
      </div>

      {/* Bottom-right page number badge */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          right: 22,
          fontFamily: MONO,
          fontSize: 12,
          color: '#8A857C',
          letterSpacing: '0.08em',
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: '4px 10px',
          borderRadius: 4,
          border: `1px solid ${RAIL_BORDER}`,
        }}
      >
        {pageNumber} / {pageTotal}
      </div>

      {/* Edge nav buttons */}
      <EdgeNav side="left" onClick={onPrev} disabled={isFirst} />
      <EdgeNav side="right" onClick={onNext} disabled={isLast} />
    </div>
  )
}

function EdgeNav({
  side,
  onClick,
  disabled,
}: {
  side: 'left' | 'right'
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={side === 'left' ? 'Previous' : 'Next'}
      onClick={onClick}
      disabled={disabled}
      style={{
        position: 'absolute',
        top: '50%',
        [side]: 14,
        transform: 'translateY(-50%)',
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.92)',
        color: INK,
        border: `1px solid ${RAIL_BORDER}`,
        borderRadius: 999,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.3 : 0.9,
        boxShadow: '0 2px 6px rgba(0,0,0,0.10)',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path
          d={side === 'right' ? 'M3 7h9M8 3l4 4-4 4' : 'M11 7H2M6 3 2 7l4 4'}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

// ─── Presentation mode ────────────────────────────────────────────────────
function PresentationMode({
  slide,
  frame,
  FrameContext,
  stageWidth,
  stageHeight,
  slideIdx,
  slideTotal,
  stepIdx,
  stepCount,
  isFullscreen,
  onPrev,
  onNext,
  onExit,
  onToggleFullscreen,
}: {
  slide: Slide<never>
  frame: number
  FrameContext: Context<number>
  stageWidth: number
  stageHeight: number
  slideIdx: number
  slideTotal: number
  stepIdx: number
  stepCount: number
  isFullscreen: boolean
  onPrev: () => void
  onNext: () => void
  onExit: () => void
  onToggleFullscreen: () => void
}) {
  const [scale, setScale] = useState(1)
  const [hudOp, setHudOp] = useState(0.85)
  const hideTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const update = () => {
      setScale(
        Math.min(window.innerWidth / stageWidth, window.innerHeight / stageHeight),
      )
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [stageWidth, stageHeight])

  useEffect(() => {
    const reveal = () => {
      setHudOp(0.85)
      if (hideTimer.current) clearTimeout(hideTimer.current)
      hideTimer.current = setTimeout(() => setHudOp(0.18), 2200)
    }
    window.addEventListener('mousemove', reveal)
    return () => {
      window.removeEventListener('mousemove', reveal)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [])

  const isFirst = slideIdx === 0 && stepIdx === 0
  const isLast = slideIdx === slideTotal - 1 && stepIdx === stepCount - 1

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: stageWidth * scale,
          height: stageHeight * scale,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: stageWidth,
            height: stageHeight,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <FrameContext.Provider value={frame}>
            <SlideRenderer slide={slide} />
          </FrameContext.Provider>
        </div>
      </div>

      {/* HUD: page indicator + controls */}
      <div
        style={{
          position: 'fixed',
          top: 18,
          right: 18,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          opacity: hudOp,
          transition: 'opacity 400ms ease-out',
          zIndex: 10000,
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 14,
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: '0.1em',
            padding: '0 12px',
            height: 38,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(0,0,0,0.55)',
            borderRadius: 8,
          }}
        >
          <span>
            {String(slideIdx + 1).padStart(2, '0')} /{' '}
            {String(slideTotal).padStart(2, '0')}
          </span>
          {stepCount > 1 && (
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>
              · step {stepIdx + 1}/{stepCount}
            </span>
          )}
        </div>
        <HudBtn label="Previous" onClick={onPrev} disabled={isFirst}>
          <Arrow dir="left" />
        </HudBtn>
        <HudBtn label="Next" onClick={onNext} disabled={isLast}>
          <Arrow dir="right" />
        </HudBtn>
        <HudBtn
          label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          onClick={onToggleFullscreen}
        >
          <FullscreenIcon exit={isFullscreen} />
        </HudBtn>
        <HudBtn label="Exit presentation (Esc)" onClick={onExit}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M3 3l8 8M11 3l-8 8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </HudBtn>
      </div>
    </div>
  )
}

function HudBtn({
  children,
  onClick,
  disabled,
  label,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 38,
        height: 38,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        color: INK,
        border: 'none',
        borderRadius: 8,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      }}
    >
      {children}
    </button>
  )
}

function Arrow({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d={dir === 'right' ? 'M3 7h9M8 3l4 4-4 4' : 'M11 7H2M6 3 2 7l4 4'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FullscreenIcon({ exit }: { exit?: boolean }) {
  if (exit) {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        <path
          d="M7 1v6H1M11 1v6h6M7 17v-6H1M11 17v-6h6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M1 6V1h5M17 6V1h-5M1 12v5h5M17 12v5h-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Slide renderer (just calls the component) ────────────────────────────
function SlideRenderer({ slide }: { slide: Slide<never> }) {
  const C = slide.Component as React.ComponentType<Record<string, unknown>>
  return <C {...(slide.props ?? {})} />
}
