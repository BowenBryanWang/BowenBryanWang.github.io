'use client'

import { useState } from 'react'

/** BibTeX block with a copy-to-clipboard button. */
export default function CopyBib({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }
  return (
    <div className="am-bib-wrap">
      <button type="button" className="am-bib-copy" onClick={copy} aria-live="polite">
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="am-bib">{text}</pre>
    </div>
  )
}
