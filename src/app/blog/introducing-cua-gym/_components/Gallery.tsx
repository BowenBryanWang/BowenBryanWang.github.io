'use client';

import { useState, useRef, useEffect } from 'react';
import SectionTitle from './SectionTitle';
import { APP_GROUPS, ALL_APP_COUNT } from '../_lib/data';

const COLLAPSED_HEIGHT = 480;

const LAYOUT: Array<{ name: string; span: number; tint: string; ink: string }> = [
  { name: 'Communication & Social',  span: 7, tint: '#E2EAF1', ink: '#314A6B' },
  { name: 'Productivity & Documents', span: 5, tint: '#F0E0E5', ink: '#7A2440' },
  { name: 'Development & Cloud',     span: 5, tint: '#E2DEEC', ink: '#3F3470' },
  { name: 'Finance & Enterprise',    span: 7, tint: '#EBE2C8', ink: '#5C4811' },
  { name: 'E-commerce & Travel',     span: 4, tint: '#F2E0CC', ink: '#7A4A1A' },
  { name: 'Analytics & Marketing',   span: 4, tint: '#DCE9DE', ink: '#27593A' },
  { name: 'Other',                   span: 4, tint: '#E8DEC8', ink: '#5A4520' },
];

const SPAN_CLASS: Record<number, string> = {
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
  8: 'lg:col-span-8',
};

export default function Gallery() {
  const [expanded, setExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!innerRef.current) return;
    const update = () => setContentHeight(innerRef.current?.scrollHeight ?? null);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(innerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <section id="environments" className="pb-24">
      <div className="container-prose">
        <SectionTitle label={`CUA-Gym-Hub — ${ALL_APP_COUNT} mock applications`} />
        <div className="prose-research mb-10">
          <p>
            <strong>CUA-Gym-Hub</strong> is a suite of {ALL_APP_COUNT}{' '}
            self-contained mock applications, each implemented as a
            single-page React app backed by a unified state-injection /
            inspection / reset API. Targets are sampled from O*NET
            occupational taxonomies and the Anthropic Economic Index, biasing
            coverage toward applications used in real digital knowledge work.
            Click any thumbnail to open a live session.
          </p>
        </div>
      </div>

      <div className="font-system mx-auto w-full max-w-[78rem] px-4 sm:px-6">
        <div
          className="relative overflow-hidden transition-[max-height] duration-700 ease-out"
          style={{
            maxHeight: expanded
              ? contentHeight
                ? `${contentHeight + 80}px`
                : '20000px'
              : `${COLLAPSED_HEIGHT}px`,
          }}
        >
          <div
            ref={innerRef}
            className="grid grid-cols-1 lg:grid-cols-12 auto-rows-fr gap-3"
          >
            {LAYOUT.map((cfg) => {
              const group = APP_GROUPS.find((g) => g.name === cfg.name);
              if (!group) return null;
              return (
                <div key={cfg.name} className={SPAN_CLASS[cfg.span] ?? ''}>
                  <CategoryBlock
                    name={cfg.name}
                    slugs={group.slugs}
                    tint={cfg.tint}
                    ink={cfg.ink}
                  />
                </div>
              );
            })}
          </div>

          {!expanded && (
            <>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-44 z-10"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 55%, rgba(255,255,255,1) 100%)',
                }}
                aria-hidden="true"
              />
              <div className="absolute inset-x-0 bottom-6 flex justify-center z-20">
                <button
                  onClick={() => setExpanded(true)}
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-zinc-900 text-white text-[13px] font-medium tracking-wide hover:bg-amber-800 transition-colors shadow-[0_8px_24px_-12px_rgba(27,24,22,0.4)]"
                >
                  <span>Show all {ALL_APP_COUNT} environments</span>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                    <path d="M3 5 6.5 8.5 10 5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        {expanded && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setExpanded(false)}
              className="inline-flex items-center gap-2 px-4 py-2 text-[12px] text-zinc-500 hover:text-amber-700 transition-colors border border-zinc-200 hover:border-amber-700"
            >
              <span>Collapse</span>
              <svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M3 8.5 6.5 5 10 8.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryBlock({
  name,
  slugs,
  tint,
  ink,
}: {
  name: string;
  slugs: string[];
  tint: string;
  ink: string;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const hoveredRef = useRef(false);
  const SPEED_PX_PER_S = 22;

  useEffect(() => {
    let rafId: number | null = null;
    let last = performance.now();
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      const el = scrollRef.current;
      if (el && !hoveredRef.current) {
        el.scrollLeft += (SPEED_PX_PER_S * dt) / 1000;
        const half = el.scrollWidth / 2;
        if (half > 0 && el.scrollLeft >= half) {
          el.scrollLeft -= half;
        }
      }
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const half = el.scrollWidth / 2;
    if (half <= 0) return;
    if (el.scrollLeft >= half) el.scrollLeft -= half;
    else if (el.scrollLeft < 0) el.scrollLeft += half;
  };

  return (
    <div
      className="rounded-2xl p-4 h-full flex flex-col"
      style={{ backgroundColor: tint }}
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; }}
    >
      <div className="flex items-baseline justify-between mb-3 px-1">
        <h3 className="text-[13.5px] font-semibold tracking-tight" style={{ color: ink }}>
          {name}
        </h3>
        <span className="font-mono text-[10px] tracking-widest" style={{ color: ink, opacity: 0.55 }}>
          {slugs.length}
        </span>
      </div>

      <div className="relative flex-1">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-10 z-10"
          style={{ background: `linear-gradient(to right, ${tint} 0%, ${tint}00 100%)` }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-10 z-10"
          style={{ background: `linear-gradient(to left, ${tint} 0%, ${tint}00 100%)` }}
        />
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar"
          style={{ scrollBehavior: 'auto' }}
        >
          {[...slugs, ...slugs].map((slug, i) => (
            <AppCard key={`${slug}-${i}`} slug={slug} ink={ink} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AppCard({ slug, ink }: { slug: string; ink: string }) {
  const url = `https://cua-gym-${slug}.xlang.ai`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group flex-none snap-start w-[178px]"
    >
      <div className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white transition-all duration-300 group-hover:border-zinc-400 shadow-[0_1px_0_rgba(27,24,22,0.04)] group-hover:shadow-[0_14px_24px_-14px_rgba(27,24,22,0.5)]">
        <div className="aspect-[8/5] relative">
          <img
            src={`/thumbs/${slug}.webp`}
            alt={`${slug} preview`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.06]"
          />
        </div>
      </div>
      <div
        className="mt-2 px-1 text-[12.5px] font-medium truncate"
        style={{ color: ink }}
      >
        {slug}
      </div>
    </a>
  );
}
