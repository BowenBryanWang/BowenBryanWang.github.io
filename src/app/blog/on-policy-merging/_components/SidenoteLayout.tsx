'use client'

import { useEffect } from 'react'

const WIDE = '(min-width: 1280px)'
const GAP = 10 // px between stacked notes

/**
 * Progressive enhancement for the CSS sidenotes in Cite.tsx; renders nothing.
 *
 * 1. In the margin layout each note sits level with its line, so notes from
 *    citations close together would overlap. Nudge each one down (transform
 *    only, so layout is untouched) until it clears the one above.
 * 2. Remove the source space before a parenthetical citation's superscript
 *    (`merge <Cite />` would otherwise render as "merge ³").
 *
 * Runs on mount, on resize and whenever the article changes height (fonts,
 * KaTeX, opened <details>); never per scroll frame.
 */
export default function SidenoteLayout() {
  useEffect(() => {
    const scope = document.querySelector<HTMLElement>('.am-scope')
    if (!scope) return

    scope.querySelectorAll<HTMLElement>('.am-cite[data-cite]').forEach((el) => {
      const prev = el.previousSibling
      if (prev && prev.nodeType === Node.TEXT_NODE && prev.nodeValue) {
        prev.nodeValue = prev.nodeValue.replace(/\s+$/, '')
      }
    })

    const mq = window.matchMedia(WIDE)
    let raf = 0
    const layout = () => {
      raf = 0
      const notes = Array.from(scope.querySelectorAll<HTMLElement>('.am-sn-note'))
      if (!mq.matches) {
        notes.forEach((n) => {
          n.style.transform = ''
          delete n.dataset.shift
        })
        return
      }
      // Read everything first, then write, so there is one layout pass.
      const items = notes.map((n) => {
        const r = n.getBoundingClientRect()
        const cur = Number(n.dataset.shift ?? 0)
        // Notes inside a closed <details> are not painted, but Chrome still
        // lays them out, so test for the closed ancestor explicitly.
        const hidden = r.height === 0 || n.closest('details:not([open])') !== null
        return { n, top: r.top - cur, h: r.height, shift: 0, hidden }
      })
      let bottom = -Infinity
      for (const it of items) {
        if (it.hidden) continue
        const top = Math.max(it.top, bottom + GAP)
        it.shift = Math.round(top - it.top)
        bottom = top + it.h
      }
      for (const it of items) {
        it.n.dataset.shift = String(it.shift)
        it.n.style.transform = it.shift ? `translateY(${it.shift}px)` : ''
      }
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(layout)
    }

    schedule()
    const ro = new ResizeObserver(schedule)
    ro.observe(scope)
    mq.addEventListener('change', schedule)
    window.addEventListener('resize', schedule)
    document.fonts?.ready.then(schedule)
    return () => {
      ro.disconnect()
      mq.removeEventListener('change', schedule)
      window.removeEventListener('resize', schedule)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return null
}
