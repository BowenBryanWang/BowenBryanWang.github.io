interface Props {
  label: string;
}

// Minimal section label: small caps eyebrow over a thin rule.
// Used as a lightweight separator between text-heavy sections.
export default function SectionTitle({ label }: Props) {
  return (
    <div className="flex items-center gap-4 text-ink-faint mb-8">
      <span className="font-mono text-[11px] uppercase tracking-widest">
        {label}
      </span>
      <span className="flex-1 h-px bg-rule" />
    </div>
  );
}
