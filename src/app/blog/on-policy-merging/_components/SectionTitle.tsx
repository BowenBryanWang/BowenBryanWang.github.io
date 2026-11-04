interface Props {
  label: string
  id?: string
}

// Small-caps eyebrow over a thin rule, used as the separator between sections.
export default function SectionTitle({ label, id }: Props) {
  return (
    <div id={id} className="mb-7 flex scroll-mt-24 items-center gap-4">
      <span
        className="font-mono text-[11px] uppercase tracking-widest"
        style={{ color: 'var(--ink-faint)' }}
      >
        {label}
      </span>
      <span className="h-px flex-1" style={{ background: 'var(--rule)' }} />
    </div>
  )
}
