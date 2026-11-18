'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import DomainIcon from './DomainIcon'
import { EXAMPLES } from './examples'

const N = EXAMPLES.length
const STEP = 360 / N // degrees between neighbouring cards
const TAN = Math.tan((STEP / 2) * (Math.PI / 180))
const GAP = 0.13 // space between neighbouring cards, as a share of card width
const POP = 1.08 // scale of the card in front
const PAUSE_MS = 3200 // rest on each card before advancing on its own
const FRICTION = 0.94 // per 60 Hz frame, while coasting after a drag

/** `a` in degrees, normalized to [-180, 180). */
function wrap(a: number) {
  return (((a % 360) + 540) % 360) - 180
}

/** Smoothstep: 0 below `a`, 1 above `b`. */
function smooth(a: number, b: number, v: number) {
  const k = Math.max(0, Math.min(1, (v - a) / (b - a)))
  return k * k * (3 - 2 * k)
}

/**
 * The example tasks as a ring of cards in 3D, as wide as the window. The
 * ring rests with one card square to the reader, advances by one card every
 * few seconds, can be dragged with a mouse or a finger (it coasts, then
 * settles on the nearest card), stepped with the arrow buttons or keys, and
 * a click on another card brings it to the front.
 *
 * The whole ring fits in the window, so it reads as one closed ring. A mask
 * fades its two sides towards the window edges; nothing is cut.
 *
 * Each card carries its domain name and icon above it, in the same 3D
 * position as the card, so the names form a ring of their own that turns
 * with the cards. The name over the front card is enlarged and darker.
 *
 * The ring is not tilted: the camera sits above it (perspective-origin), so
 * the far side rises behind the front cards while every card stays upright.
 *
 * All motion is written straight to element styles inside one
 * requestAnimationFrame loop; React state holds only the index of the front
 * card, for the counter and for accessibility.
 */
export default function ExampleRing() {
  const stageRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = useState(0)

  // Mutable animation state, kept out of React.
  const s = useRef({
    angle: 0, // ring rotation in degrees; card i is in front at angle = -i * STEP
    vel: 0, // degrees per frame while coasting
    target: null as number | null, // angle being eased to, if any
    ease: 0.86, // per-frame retention while easing to the target
    radius: 800,
    width: 0, // stage (window) width
    cardW: 300,
    persp: 1300, // perspective distance, px
    full: true, // the whole ring fits in the window
    dragging: false,
    moved: 0,
    lastX: 0,
    lastT: 0,
    idleAt: 0, // time the ring last came to rest or was touched
    hover: false,
    visible: true,
    reduce: false,
    active: 0,
  })

  const goTo = useCallback((index: number) => {
    const st = s.current
    st.target = st.angle + wrap(-index * STEP - st.angle)
    st.ease = 0.86
    st.vel = 0
  }, [])

  const step = useCallback((dir: number) => {
    const st = s.current
    const base = st.target ?? st.angle
    st.target = -(Math.round(-base / STEP) + dir) * STEP
    st.ease = 0.86
    st.vel = 0
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    const ring = ringRef.current
    if (!stage || !ring) return
    const st = s.current
    st.idleAt = performance.now()

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    st.reduce = mq.matches
    const onMq = () => (st.reduce = mq.matches)
    mq.addEventListener('change', onMq)

    // The stage spans the window: its width and left offset are set here,
    // from the wrapper's position, so it never causes sideways scrolling.
    //
    // On anything wider than a phone the whole ring fits in the window, so
    // it reads as one closed ring. A ring of radius r seen from distance P
    // is r·P / sqrt(P² + 2·P·r) wide on each side; the card width follows the
    // window, and P is solved so that this equals the room there is. On
    // phones one card fills most of the width and the rest fades out.
    //
    // The stage height and the camera height are solved so that the far row
    // of cards sits just above the front card.
    const wrapper = stage.parentElement as HTMLElement
    const measure = (force = false) => {
      const sw = document.documentElement.clientWidth
      if (!sw || (!force && sw === st.width)) return
      st.width = sw
      stage.style.width = `${sw}px`
      stage.style.marginLeft = `${-wrapper.getBoundingClientRect().left}px`

      const full = sw >= 700
      let w: number
      let r: number
      let P: number
      if (full) {
        const room = sw / 2 - 36
        w = Math.max(180, Math.min(330, sw * 0.22))
        r = (w * (1 + GAP)) / 2 / TAN
        P = r > room ? (2 * r * room * room) / (r * r - room * room) : 1800
        P = Math.min(1800, P)
        if (P < 650) {
          // Too much distortion: keep the camera back and shrink the cards.
          P = 650
          r = (room * (room + Math.sqrt(room * room + P * P))) / P
          w = (2 * r * TAN) / (1 + GAP)
        }
      } else {
        w = sw * 0.62
        r = (w * (1 + GAP)) / 2 / TAN
        P = 1500
      }
      st.full = full
      st.cardW = w
      st.radius = r
      st.persp = P
      stage.dataset.full = full ? '1' : '0'
      stage.style.setProperty('--ring-w', `${w.toFixed(1)}px`)
      const card = cardRefs.current[0]
      if (!card) return
      const ch = card.offsetHeight
      const far = P / (P + 2 * r) // scale of the far side
      const top = 12
      const rowGap = 66 // room for the front card's domain name between the two rows
      const bottom = 34
      const anchor = top + ch * far + rowGap + ch * POP // y of the cards' bottom edge
      const farBottom = top + ch * far
      const oy = (farBottom - anchor * far) / (1 - far) // camera height
      stage.style.height = `${Math.round(anchor + bottom)}px`
      stage.style.perspective = `${P.toFixed(0)}px`
      stage.style.perspectiveOrigin = `50% ${oy.toFixed(1)}px`
      ring.style.top = `${anchor.toFixed(1)}px`
    }
    measure(true)
    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    const ro = new ResizeObserver(() => measure(true))
    ro.observe(wrapper)
    document.fonts?.ready.then(() => measure(true))

    const io = new IntersectionObserver(
      (entries) => {
        st.visible = entries[0]?.isIntersecting ?? true
      },
      { rootMargin: '120px' },
    )
    io.observe(stage)

    let raf = 0
    let prev = performance.now()
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(64, now - prev)
      prev = now
      if (!st.visible) return
      const f = dt / 16.667

      if (!st.dragging) {
        if (st.target !== null) {
          const d = st.target - st.angle
          st.angle += d * (1 - Math.pow(st.ease, f))
          if (Math.abs(d) < 0.03) {
            st.angle = st.target
            st.target = null
            st.idleAt = now
          }
        } else if (Math.abs(st.vel) > 0.02) {
          st.angle += st.vel * f
          st.vel *= Math.pow(FRICTION, f)
          if (Math.abs(st.vel) <= 0.02) {
            // Coasting is over: settle on the nearest card.
            st.vel = 0
            st.target = Math.round(st.angle / STEP) * STEP
            st.ease = 0.86
          }
        } else if (!st.reduce && !st.hover && now - st.idleAt > PAUSE_MS) {
          // Advance by one card, slowly.
          st.target = (Math.round(st.angle / STEP) - 1) * STEP
          st.ease = 0.93
        }
      }

      const r = st.radius
      const P = st.persp
      // Half-width of the ring on screen, or of the window if that is less.
      const reach = Math.min(
        st.width / 2,
        (r * P) / Math.sqrt(P * P + 2 * P * r),
      )
      // A card shows its outer face while that face is turned towards the
      // camera, which is up to cos d = r / (P + r), not up to 90 degrees.
      // Past that it is turned round, so the sides and the back of the ring
      // show the cards the right way round instead of mirrored.
      const turn = Math.acos(r / (P + r)) * (180 / Math.PI)
      ring.style.transform = `translateZ(${-r}px) rotateY(${st.angle}deg)`
      for (let i = 0; i < N; i++) {
        const el = cardRefs.current[i]
        if (!el) continue
        const d = wrap(i * STEP + st.angle) // signed distance from the front
        const ad = Math.abs(d)
        const rad = (d * Math.PI) / 180
        const depth = r * (1 - Math.cos(rad)) // behind the front card
        // Dim with depth, and a little more towards the two sides of the
        // ring (0 in the middle of the screen, 1 at its widest point). The
        // stage mask does the rest of the fading at the window edges.
        const ps = P / (P + depth)
        const x = Math.abs(r * Math.sin(rad) * ps)
        const side = smooth(0.5, 1, Math.min(1, x / reach))
        const op = (1 - 0.42 * (depth / (2 * r))) * (1 - 0.45 * side)
        // The front card is slightly enlarged.
        const k = Math.max(0, 1 - ad / STEP)
        const scale = 1 + (POP - 1) * k * k * (3 - 2 * k)
        el.style.visibility = 'visible'
        el.style.transform = `rotateY(${i * STEP}deg) translateZ(${r}px)${
          ad > turn ? ' rotateY(180deg)' : ''
        } scale(${scale.toFixed(4)})`
        el.style.opacity = op.toFixed(3)
        // The domain name shows over the front cards only, fading by the
        // third card from the front; the far row stays clean.
        el.style.setProperty(
          '--lab',
          (1 - smooth(STEP * 1.2, STEP * 2.6, ad)).toFixed(3),
        )
        el.dataset.front = ad < STEP / 2 ? '1' : '0'
      }

      const idx = ((Math.round(-st.angle / STEP) % N) + N) % N
      if (idx !== st.active) {
        st.active = idx
        setActive(idx)
      }
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      ro.disconnect()
      io.disconnect()
      mq.removeEventListener('change', onMq)
    }
  }, [])

  // Dragging. One pixel of drag moves the front card by about one pixel.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const st = s.current
    st.dragging = true
    st.moved = 0
    st.lastX = e.clientX
    st.lastT = performance.now()
    st.vel = 0
    st.target = null
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = s.current
    if (!st.dragging) return
    const dx = e.clientX - st.lastX
    const now = performance.now()
    const dA = (dx / st.radius) * (180 / Math.PI)
    st.angle += dA
    st.moved += Math.abs(dx)
    const dt = Math.max(1, now - st.lastT)
    st.vel = st.vel * 0.6 + (dA / dt) * 16.667 * 0.4
    st.lastX = e.clientX
    st.lastT = now
  }
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = s.current
    if (!st.dragging) return
    st.dragging = false
    st.idleAt = performance.now()
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    if (st.moved < 6) {
      // A click, not a drag: bring the clicked card to the front.
      st.vel = 0
      const card = (
        document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
      )?.closest<HTMLElement>('[data-ring-index]')
      if (card) goTo(Number(card.dataset.ringIndex))
      else st.target = Math.round(st.angle / STEP) * STEP
      return
    }
    if (performance.now() - st.lastT > 80) st.vel = 0
    st.vel = Math.max(-4, Math.min(4, st.vel))
    if (Math.abs(st.vel) <= 0.02) {
      st.target = Math.round(st.angle / STEP) * STEP
      st.ease = 0.86
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      step(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      step(-1)
    }
  }

  return (
    <div className="alg-ring">
      <div
        ref={stageRef}
        className="alg-ring-stage"
        role="group"
        aria-roledescription="carousel"
        aria-label="Example tasks from Agents’ Last Gym, one per domain"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={() => (s.current.hover = true)}
        onPointerLeave={() => (s.current.hover = false)}
      >
        <div ref={ringRef} className="alg-ring-wheel">
          {EXAMPLES.map((ex, i) => (
            <div
              key={ex.id}
              ref={(el) => {
                cardRefs.current[i] = el
              }}
              className="alg-card"
              data-ring-index={i}
              aria-hidden={i !== active}
            >
              {/* Domain of this card, above it and turning with it. */}
              <div className="alg-card-domain">
                <span>
                  <DomainIcon id={ex.id} />
                  {ex.label}
                </span>
              </div>
              <div className="alg-card-face">
                <div className="alg-card-shot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ex.image}
                    alt={`${ex.app}: ${ex.title}`}
                    width={ex.w}
                    height={ex.h}
                    draggable={false}
                    decoding="async"
                  />
                </div>
                <div className="alg-card-body">
                  <div className="alg-card-title">
                    {ex.cardTitle ?? ex.title}
                  </div>
                  <p className="alg-card-desc">{ex.short}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="alg-ring-bar">
        <button
          type="button"
          className="alg-ring-btn"
          onClick={() => step(-1)}
          aria-label="Previous example"
        >
          ←
        </button>
        <span className="alg-ring-count" aria-live="polite">
          {String(active + 1).padStart(2, '0')} / {N}
        </span>
        <button
          type="button"
          className="alg-ring-btn"
          onClick={() => step(1)}
          aria-label="Next example"
        >
          →
        </button>
      </div>
    </div>
  )
}
