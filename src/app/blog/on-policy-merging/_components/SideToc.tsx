'use client'

import { useEffect, useState } from 'react'

export interface TocItem {
  label: string
  href: string
}

/**
 * Table of contents. On wide screens (>= 1280px) a sticky column in the left
 * margin with the section in view marked; below that a collapsed "Contents"
 * disclosure at the top of the post. The active section is the last one whose
 * heading has passed a line a third of the way down the viewport, recomputed
 * at most once per animation frame while scrolling.
 */
export default function SideToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.href ?? '')

  useEffect(() => {
    const targets = items
      .map((it) => ({ href: it.href, el: document.getElementById(it.href.slice(1)) }))
      .filter((t): t is { href: string; el: HTMLElement } => t.el !== null)
    if (targets.length === 0) return

    let raf = 0
    const update = () => {
      raf = 0
      const line = window.innerHeight * 0.33
      let current = targets[0].href
      for (const t of targets) {
        if (t.el.getBoundingClientRect().top <= line) current = t.href
        else break
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [items])

  const list = (withState: boolean) => (
    <ul>
      {items.map((it) => (
        <li key={it.href} className={withState && it.href === active ? 'is-active' : undefined}>
          <a
            href={it.href}
            aria-current={withState && it.href === active ? 'location' : undefined}
          >
            {it.label}
          </a>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      <nav className="am-toc" aria-label="Contents">
        <div className="am-toc-inner">{list(true)}</div>
      </nav>
      <details className="am-toc-compact">
        <summary>Contents</summary>
        <nav aria-label="Contents">{list(false)}</nav>
      </details>
    </>
  )
}
