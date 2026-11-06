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

export function Placeholder({ label, status, children }: BlockProps) {
  return (
    <div className="am-placeholder" role="note">
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
