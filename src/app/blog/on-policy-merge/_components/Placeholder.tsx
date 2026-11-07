import type { ReactNode } from 'react'

// Visible stand-ins for results and figures that are not in yet. Every
// placeholder says exactly what goes there, so the author can search the
// page for "Placeholder" and fill them in one by one.

interface BlockProps {
  /** What this slot is, e.g. "Figure 1" or "Table 3". */
  label: string
  /** One line on the status, e.g. "author to draw" or "pending main runs". */
  status: string
  children?: ReactNode
}

/** Anchors for every "Figure N" / "Table N" a placeholder stands in for. */
function anchorsOf(label: ReactNode) {
  if (typeof label !== 'string') return null
  const ids = Array.from(label.matchAll(/(Figure|Table) ([A-Z]?\d+)/g)).map(
    (m) => `${m[1] === 'Figure' ? 'fig' : 'table'}-${m[2].toLowerCase()}`,
  )
  return ids.map((id) => <span key={id} id={id} className="am-anchor" />)
}

export function Placeholder({ label, status, children }: BlockProps) {
  return (
    <div className="am-placeholder" role="note">
      {anchorsOf(label)}
      <div className="am-placeholder-label">
        Placeholder · {label} · {status}
      </div>
      {children ? <div className="am-placeholder-body">{children}</div> : null}
    </div>
  )
}

// Inline marker for a single missing number or phrase inside prose or a
// table cell.
export function Pending({ children }: { children?: ReactNode }) {
  return <span className="am-pending">{children ?? 'pending'}</span>
}
