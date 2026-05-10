'use client';
import { useState } from 'react';
import SectionTitle from './SectionTitle';
import { BIBTEX } from '../_lib/data';

export default function Citation() {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(BIBTEX);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <section id="cite" className="container-prose pb-20">
      <SectionTitle label="Citation" />

      <div className="prose-research mb-6">
        <p>If you find CUA-Gym useful, please cite:</p>
      </div>

      <div className="bg-paper-deep/50 border border-rule">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-rule">
          <span className="font-mono text-[10.5px] tracking-widest uppercase text-ink-faint">
            BibTeX
          </span>
          <button
            onClick={onCopy}
            className="font-mono text-[10.5px] tracking-widest uppercase text-ink-soft hover:text-oxblood transition-colors flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <CheckIcon /> Copied
              </>
            ) : (
              <>
                <CopyIcon /> Copy
              </>
            )}
          </button>
        </div>
        <pre className="font-mono text-[12.5px] leading-[1.7] p-4 overflow-x-auto whitespace-pre text-ink">
{BIBTEX}
        </pre>
      </div>
    </section>
  );
}

function CopyIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 7.5V1.5h6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
      <path d="M2 6 4.5 8.5 9 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}