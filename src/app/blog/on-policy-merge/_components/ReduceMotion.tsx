'use client'

import { useEffect } from 'react'

// SMIL animations ignore CSS, so readers who ask for reduced motion get the
// finished frame: pause every animated SVG on the page at its end time.
export default function ReduceMotion() {
  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    document.querySelectorAll<SVGSVGElement>('svg[data-anim-end]').forEach((svg) => {
      svg.pauseAnimations()
      svg.setCurrentTime(Number(svg.dataset.animEnd ?? 0))
    })
  }, [])
  return null
}
