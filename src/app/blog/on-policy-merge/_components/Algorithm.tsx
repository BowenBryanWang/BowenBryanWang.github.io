// Paper-style pseudocode box: numbered lines, indentation, right-aligned comments.
// Server component; line numbers come from a CSS counter (see _styles/algorithm.css).

import type { CSSProperties, ReactNode } from 'react'

export function Algorithm({
  number,
  title,
  input,
  children,
}: {
  number: number
  title: ReactNode
  input?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="am-algo" role="figure" aria-label={`Algorithm ${number}`}>
      <div className="am-algo-head">
        <strong>Algorithm {number}</strong> {title}
      </div>
      {input ? (
        <div className="am-algo-io">
          <span className="am-algo-kw">Input:</span> {input}
        </div>
      ) : null}
      <ol className="am-algo-body">{children}</ol>
    </div>
  )
}

/** One line of pseudocode. `indent` is the nesting depth; `note` is the ▷ comment. */
export function Line({ indent = 0, note, children }: { indent?: number; note?: ReactNode; children: ReactNode }) {
  return (
    <li style={{ '--ind': indent } as CSSProperties}>
      <span className="am-algo-code">{children}</span>
      {note ? <span className="am-algo-note">▷ {note}</span> : null}
    </li>
  )
}

/** A pseudocode keyword (for, if, repeat, …). */
export function K({ children }: { children: ReactNode }) {
  return <span className="am-algo-kw">{children}</span>
}
