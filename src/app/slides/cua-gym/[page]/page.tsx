// Dynamic route: /slides/cua-gym/page{N} — re-renders the same slide deck
// with the requested initial slide.

import SlidesPage from '../page'

// Static export needs to know which `page` values to pre-render.
// 12 slides currently; if SLIDES grows, bump this length.
export function generateStaticParams() {
  return Array.from({ length: 20 }, (_, i) => ({ page: `page${i + 1}` }))
}

export default function PageNRouter({ params }: { params: { page: string } }) {
  const match = params.page.match(/^page(\d+)$/)
  const initialSlideIdx = match ? Math.max(0, Number(match[1]) - 1) : 0

  return <SlidesPage initialSlideIdx={initialSlideIdx} />
}
