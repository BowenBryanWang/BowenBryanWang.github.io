import { type Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/Container'

import './_styles/cua-gym.css'

import Abstract from './_components/Abstract'
import Pipeline from './_components/Pipeline'
import Gallery from './_components/Gallery'
import Results from './_components/Results'
import Findings from './_components/Findings'
import FutureWork from './_components/FutureWork'
import Citation from './_components/Citation'

export const metadata: Metadata = {
  title: 'We Spent a Year Building Verifiable Training Tasks for GUI Agents. Here\'s What We Learned.',
  description:
    'RLVR has scaled in math and code. We tried to do the same for GUI agents: the problems we hit, the shortcuts that didn\'t work, and what actually did.',
}

const POST = {
  title: 'We Spent a Year Building Verifiable Training Tasks for GUI Agents. Here\'s What We Learned.',
  subtitle:
    'RLVR has scaled in math and code. We tried to do the same for GUI agents: the problems we hit, the shortcuts that didn\'t work, and what actually did.',
  author: 'Bryan Wang',
  date: 'May 10, 2026',
  reading: '20 min read',
  links: {
    project: 'https://cua-gym.xlang.ai',
    code: 'https://github.com/BowenBryanWang/CUA-Gym-Websites',
    paper: '#',
  },
}

function PostHero() {
  return (
    <header className="mt-8 mb-14">
      <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
        Blog · {POST.date} · {POST.reading}
      </div>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-[2.75rem] sm:leading-[1.15]">
        We Spent a Year Building Verifiable Training Tasks for GUI Agents. Here&rsquo;s What We Learned.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
        {POST.subtitle}
      </p>
      <div className="mt-6 flex items-baseline gap-3 text-[13px]">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {POST.author}
        </span>
        <span className="text-zinc-400 dark:text-zinc-600">·</span>
        <a
          href={POST.links.project}
          target="_blank"
          rel="noreferrer"
          className="text-amber-700 underline decoration-amber-700/40 underline-offset-[3px] hover:decoration-amber-700 dark:text-amber-300 dark:decoration-amber-300/40"
        >
          ↗ Project page
        </a>
        <a
          href={POST.links.code}
          target="_blank"
          rel="noreferrer"
          className="text-amber-700 underline decoration-amber-700/40 underline-offset-[3px] hover:decoration-amber-700 dark:text-amber-300 dark:decoration-amber-300/40"
        >
          ↗ Code
        </a>
        <span className="text-zinc-400 dark:text-zinc-600">
          ↗ Paper <span className="italic">(coming soon)</span>
        </span>
      </div>
      <hr className="mt-10 border-zinc-200 dark:border-zinc-700/40" />
    </header>
  )
}

export default function IntroducingCUAGymPost() {
  return (
    <Container className="mt-12 lg:mt-20">
      <article className="mx-auto max-w-4xl">
        <div className="text-[12px]">
          <Link
            href="/blog"
            className="text-zinc-500 hover:text-amber-700 dark:text-zinc-400 dark:hover:text-amber-300"
          >
            ← All posts
          </Link>
        </div>

        <PostHero />

        {/* cua-gym homepage content body — Newsreader serif + cream
            accents kept, but bg made transparent so it reads as one
            seamless white blog post within the personal site. */}
        <div className="cua-gym-scope">
          <Abstract />
          <Pipeline />
          <Gallery />
          <Results />
          <Findings />
          <FutureWork />
          <Citation />
        </div>
      </article>
    </Container>
  )
}
