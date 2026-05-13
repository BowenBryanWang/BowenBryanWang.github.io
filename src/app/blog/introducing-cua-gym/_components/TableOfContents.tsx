type TocEntry = {
  label: string;
  href: string;
  sub?: { label: string; href: string }[];
};

const TOC: TocEntry[] = [
  {
    label: 'Motivation',
    href: '#motivation',
  },
  {
    label: 'Method',
    href: '#pipeline',
    sub: [
      { label: 'Pipeline Design', href: '#pipeline' },
      { label: 'Environment Synthesis', href: '#pipeline' },
    ],
  },
  {
    label: '110 Environments',
    href: '#environments',
  },
  {
    label: 'Results',
    href: '#results',
  },
  {
    label: 'Findings',
    href: '#findings',
    sub: [
      { label: 'More data, cleaner signal', href: '#findings' },
      { label: 'Environments vs. trajectories', href: '#findings' },
      { label: 'Emergent efficiency', href: '#findings' },
    ],
  },
  {
    label: 'Limitations & Future Work',
    href: '#future-work',
  },
  {
    label: 'Citation',
    href: '#cite',
  },
];

export default function TableOfContents() {
  // Split into two columns
  const mid = Math.ceil(TOC.length / 2);
  const left = TOC.slice(0, mid);
  const right = TOC.slice(mid);

  return (
    <nav className="mt-3 mb-0 rounded-xl border border-zinc-200/70 dark:border-zinc-700/40 px-6 py-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
        <TocColumn entries={left} />
        <TocColumn entries={right} />
      </div>
    </nav>
  );
}

function TocColumn({ entries }: { entries: TocEntry[] }) {
  return (
    <ul className="space-y-2">
      {entries.map((entry) => (
        <li key={entry.href + entry.label}>
          <a
            href={entry.href}
            className="text-[13.5px] text-ink hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
          >
            {entry.label}
          </a>
          {entry.sub && (
            <ul className="mt-1 space-y-1 pl-4">
              {entry.sub.map((s) => (
                <li key={s.href + s.label}>
                  <a
                    href={s.href}
                    className="text-[12.5px] text-ink-soft hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
