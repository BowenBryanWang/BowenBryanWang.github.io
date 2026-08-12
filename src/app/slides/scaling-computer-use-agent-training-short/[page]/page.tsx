// Dynamic route: /slides/scaling-computer-use-agent-training-short/page{N}
// re-renders the same short deck with the requested initial slide.

import ShortDeck from '../ShortDeck'

export function generateStaticParams() {
  return Array.from({ length: 10 }, (_, i) => ({ page: `page${i + 1}` }))
}

export default function PageNRouter({ params }: { params: { page: string } }) {
  const match = params.page.match(/^page(\d+)$/)
  const initialSlideIdx = match ? Math.max(0, Number(match[1]) - 1) : 0

  return <ShortDeck initialSlideIdx={initialSlideIdx} />
}
