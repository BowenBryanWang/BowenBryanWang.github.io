import { type Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/Container'

import './_styles/cua-gym.css'

import TLDRBox from './_components/TLDRBox'
import TableOfContents from './_components/TableOfContents'
import Abstract from './_components/Abstract'
import Pipeline from './_components/Pipeline'
import Gallery from './_components/Gallery'
import Results from './_components/Results'
import Findings from './_components/Findings'
import FutureWork from './_components/FutureWork'
import Citation from './_components/Citation'

export const metadata: Metadata = {
  title:
    "We Spent a Year Building Verifiable Training Tasks for GUI Agents. Here's What We Learned.",
  description:
    "RLVR has scaled in math and code. We tried to do the same for GUI agents: the problems we hit, the shortcuts that didn't work, and what actually did.",
}

const POST = {
  title:
    "We Spent a Year Building Verifiable Training Tasks for GUI Agents. Here's What We Learned.",
  subtitle:
    "RLVR has scaled in math and code. We tried to do the same for GUI agents: the problems we hit, the shortcuts that didn't work, and what actually did.",
  author: 'Bowen Wang',
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
    <header className="mb-8 mt-8">
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
        Blog · {POST.date} · {POST.reading}
      </div>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-[2.75rem] sm:leading-[1.15]">
        We Spent a Year Building Verifiable Training Tasks for GUI Agents.
        Here&rsquo;s What We Learned.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
        {POST.subtitle}
      </p>
      <div className="mt-6 text-[13px]">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {POST.author}
        </span>
      </div>
      <hr className="mt-6 border-zinc-200 dark:border-zinc-700/40" />
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

        {/* CUA-Gym content body keeps its layout and accents, while typography
            inherits the global personal-site font stack. */}
        <div className="cua-gym-scope">
          <div className="container-prose">
            <TLDRBox />
            <TableOfContents />
          </div>
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
