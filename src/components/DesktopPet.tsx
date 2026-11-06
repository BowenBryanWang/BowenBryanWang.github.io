'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

const FRAME_W = 192
const FRAME_H = 208
const SPRITE_SRC = '/pets/desktop-sprite/spritesheet.webp'

type PetState =
  | 'idle'
  | 'running-right'
  | 'running-left'
  | 'waving'
  | 'jumping'
  | 'failed'
  | 'waiting'
  | 'running'
  | 'review'

type StateConfig = {
  row: number
  frames: number
  fps: number
  loop: boolean
}

const STATES: Record<PetState, StateConfig> = {
  idle: { row: 0, frames: 6, fps: 6, loop: true },
  'running-right': { row: 1, frames: 8, fps: 12, loop: true },
  'running-left': { row: 2, frames: 8, fps: 12, loop: true },
  waving: { row: 3, frames: 4, fps: 6, loop: false },
  jumping: { row: 4, frames: 5, fps: 10, loop: false },
  failed: { row: 5, frames: 8, fps: 8, loop: false },
  waiting: { row: 6, frames: 6, fps: 5, loop: true },
  running: { row: 7, frames: 6, fps: 12, loop: true },
  review: { row: 8, frames: 6, fps: 8, loop: false },
}

const ONE_SHOT_REPEATS: Partial<Record<PetState, number>> = {
  waving: 2,
  jumping: 1,
  failed: 1,
  review: 1,
}

const DISPLAY_SCALE = 0.5
const BOTTOM_PX = 16

/** The pet stays off blog pages and small screens so it never covers text. */
export function DesktopPet() {
  const pathname = usePathname()
  if (pathname?.startsWith('/blog')) return null
  return (
    <div className="hidden md:block">
      <PetSprite />
    </div>
  )
}

function PetSprite() {
  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<PetState>('idle')
  const [frame, setFrame] = useState(0)
  const [x, setX] = useState<number | null>(null)
  const frameRef = useRef(0)
  const directionRef = useRef<'left' | 'right'>('left')

  useEffect(() => {
    setMounted(true)
    const petWidth = FRAME_W * DISPLAY_SCALE
    const initial = Math.max(16, window.innerWidth - petWidth - 24)
    setX(initial)
  }, [])

  // Frame ticker
  useEffect(() => {
    const cfg = STATES[state]
    frameRef.current = 0
    setFrame(0)
    const tick = () => {
      frameRef.current += 1
      const next = frameRef.current % cfg.frames
      setFrame(next)
    }
    const id = window.setInterval(tick, 1000 / cfg.fps)
    return () => window.clearInterval(id)
  }, [state])

  const goIdle = useCallback(() => setState('idle'), [])

  // One-shot completion → return to idle
  useEffect(() => {
    const cfg = STATES[state]
    if (cfg.loop) return
    const repeats = ONE_SHOT_REPEATS[state] ?? 1
    const ms = (cfg.frames * repeats * 1000) / cfg.fps
    const t = window.setTimeout(goIdle, ms)
    return () => window.clearTimeout(t)
  }, [state, goIdle])

  // Random behaviour loop while idle
  useEffect(() => {
    if (state !== 'idle') return
    const delay = 3500 + Math.random() * 4500
    const t = window.setTimeout(() => {
      const choices: PetState[] = [
        'waving',
        'jumping',
        'waiting',
        'review',
        directionRef.current === 'right' ? 'running-right' : 'running-left',
      ]
      const pick = choices[Math.floor(Math.random() * choices.length)]
      if (pick === 'waiting') {
        // waiting loops — schedule a return to idle
        setState('waiting')
        window.setTimeout(goIdle, 2500 + Math.random() * 1500)
      } else {
        setState(pick)
      }
    }, delay)
    return () => window.clearTimeout(t)
  }, [state, goIdle])

  // Walking motion
  useEffect(() => {
    if (state !== 'running-right' && state !== 'running-left') return
    if (x == null) return
    directionRef.current = state === 'running-right' ? 'right' : 'left'
    const dx = state === 'running-right' ? 2 : -2
    const id = window.setInterval(() => {
      setX((prev) => {
        if (prev == null) return prev
        const maxX = window.innerWidth - FRAME_W * DISPLAY_SCALE - 16
        let next = prev + dx
        if (next < 16) {
          next = 16
          setState('running-right')
        } else if (next > maxX) {
          next = maxX
          setState('running-left')
        }
        return next
      })
    }, 30)
    const stopAt = 2200 + Math.random() * 1800
    const stopT = window.setTimeout(goIdle, stopAt)
    return () => {
      window.clearInterval(id)
      window.clearTimeout(stopT)
    }
  }, [state, x, goIdle])

  const handleClick = () => {
    const options: PetState[] = ['waving', 'jumping', 'review', 'failed']
    const next = options[Math.floor(Math.random() * options.length)]
    setState(next)
  }

  if (!mounted || x == null) return null

  const cfg = STATES[state]

  return (
    <div
      className="pointer-events-none fixed z-40 select-none"
      style={{
        left: `${x}px`,
        bottom: `${BOTTOM_PX}px`,
        width: `${FRAME_W * DISPLAY_SCALE}px`,
        height: `${FRAME_H * DISPLAY_SCALE}px`,
      }}
    >
      <button
        type="button"
        title="Hello! Click for a trick."
        onClick={handleClick}
        className="pointer-events-auto absolute inset-0 cursor-pointer bg-no-repeat"
        style={{
          backgroundImage: `url(${SPRITE_SRC})`,
          backgroundPosition: `-${frame * FRAME_W * DISPLAY_SCALE}px -${
            cfg.row * FRAME_H * DISPLAY_SCALE
          }px`,
          backgroundSize: `${1536 * DISPLAY_SCALE}px ${1872 * DISPLAY_SCALE}px`,
          imageRendering: 'pixelated',
        }}
      />
    </div>
  )
}
