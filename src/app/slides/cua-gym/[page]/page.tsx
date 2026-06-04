// Dynamic route: /slides/cua-gym/page{N} — re-renders the same slide deck
// component, which reads window.location.pathname on mount to pick the
// initial slide.

import SlidesPage from '../page'

// Static export needs to know which `page` values to pre-render.
// 12 slides currently; if SLIDES grows, bump this length.
export function generateStaticParams() {
  return Array.from({ length: 20 }, (_, i) => ({ page: `page${i + 1}` }))
}

export default function PageNRouter() {
  return <SlidesPage />
}
