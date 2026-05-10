import { PAPER } from '../_lib/data';

const ExternalArrow = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
    <path
      d="M2 7 7 2M3 2h4v4"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="square"
    />
  </svg>
);

export default function Hero() {
  return (
    <header className="relative pt-16 md:pt-24 pb-12">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" aria-hidden="true" />
      <div className="container-prose relative text-center">
        {/* Preprint label */}
        <div className="font-mono text-[11px] tracking-widest uppercase text-ink-faint">
          {PAPER.venue}
        </div>

        {/* Title */}
        <h1 className="display mt-5 text-[clamp(2.4rem,4.6vw,3.6rem)] leading-[1.08] text-ink tracking-tight">
          <span className="display-italic">{PAPER.title}</span>:{' '}
          <span className="display text-ink">{PAPER.subtitle}</span>
        </h1>

        {/* Authors — wrapped flex with affiliation marks */}
        <div className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[14.5px] text-ink leading-snug max-w-3xl mx-auto">
          {PAPER.authors.map((a, i) => (
            <span key={i} className="whitespace-nowrap">
              {a.name}
              <sup className="ml-0.5 font-mono text-[10px] text-ink-faint">
                {a.aff}
              </sup>
            </span>
          ))}
        </div>

        {/* Affiliations */}
        <div className="mt-4 flex flex-wrap justify-center items-baseline gap-x-4 gap-y-1 text-[13px] text-ink-soft italic font-display">
          {PAPER.affiliations.map((a, i) => (
            <span key={a.mark} className="flex items-baseline gap-1.5">
              {i > 0 && <span aria-hidden="true" className="text-ink-faint not-italic mr-2.5">·</span>}
              <sup className="font-mono not-italic text-[10px] text-ink-faint">{a.mark}</sup>
              <span>{a.name}</span>
            </span>
          ))}
        </div>

        {/* Action links */}
        <nav
          aria-label="Paper links"
          className="mt-10 flex flex-wrap justify-center items-center gap-x-1 gap-y-3 text-[13px]"
        >
          <ActionLink href={PAPER.links.paper}>Paper</ActionLink>
          <Sep />
          <ActionLink href={PAPER.links.arxiv} external>arXiv</ActionLink>
          <Sep />
          <ActionLink href={PAPER.links.code} external>Code</ActionLink>
          <Sep />
          <ActionLink href={PAPER.links.dataset} external>Dataset</ActionLink>
          <Sep />
          <ActionLink href="#environments">Environments</ActionLink>
          <Sep />
          <ActionLink href="#cite">BibTeX</ActionLink>
        </nav>
      </div>
    </header>
  );
}

function Sep() {
  return <span className="text-ink-faint" aria-hidden="true">/</span>;
}

function ActionLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const props = external ? { target: '_blank', rel: 'noreferrer' } : {};
  return (
    <a
      href={href}
      {...props}
      className="inline-flex items-center gap-1 px-2.5 py-1 text-ink hover:text-oxblood transition-colors marker-link"
    >
      {children}
      {external && <ExternalArrow />}
    </a>
  );
}
