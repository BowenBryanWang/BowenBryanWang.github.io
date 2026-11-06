'use client'

import { useEffect } from 'react'

/** Open every closed <details> around `el`; true if any was closed. */
function openAncestors(el: Element): boolean {
  let opened = false
  for (let d = el.closest('details'); d; d = d.parentElement?.closest('details') ?? null) {
    if (!d.open) {
      d.open = true
      opened = true
    }
  }
  return opened
}

function targetOf(hash: string): HTMLElement | null {
  if (hash.length < 2) return null
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)))
  } catch {
    return null
  }
}

/**
 * The appendices are collapsed <details>. When a link or the URL hash points
 * at an appendix or at anything inside one, open it (and any collapsed
 * ancestors) so the browser can scroll to the target. Renders nothing.
 */
export default function OpenOnHash() {
  useEffect(() => {
    const fromHash = () => {
      const el = targetOf(window.location.hash)
      if (el && openAncestors(el)) el.scrollIntoView()
    }
    // In-page link clicks: open before the browser scrolls, so the jump
    // lands right even when the hash does not change.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]')
      if (!a) return
      const el = targetOf(a.getAttribute('href') ?? '')
      if (el) openAncestors(el)
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    document.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener('hashchange', fromHash)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return null
}
