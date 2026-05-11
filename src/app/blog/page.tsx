import { type Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/Container'
import { SimpleLayout } from '@/components/SimpleLayout'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Notes on agents, RL, and what I am building.',
}

interface BlogPost {
  slug: string
  title: string
  date: string
  description: string
}

const posts: BlogPost[] = [
  {
    slug: 'cli-agents-gui-benchmark',
    title: 'Towards Universal Digital Agents',
    date: '2026-05-11',
    description:
      'Empirical evidence from OSWorld-Verified: coding agents like Codex and Claude Code can solve many “GUI” tasks through the command line and why we need universal digital agents.',
  },
  {
    slug: 'introducing-cua-gym',
    title: 'We Spent a Year Building Verifiable Training Tasks for GUI Agents. Here\'s What We Learned.',
    date: '2026-05-10',
    description:
      'RLVR has scaled in math and code. We tried to do the same for GUI agents: the problems we hit, the shortcuts that didn\'t work, and what actually did.',
  },
]

export default function BlogIndex() {
  return (
    <SimpleLayout
      title="Blog"
      intro="Long-form notes on agents, RL, and the systems I build."
    >
      <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
        <div className="flex max-w-3xl flex-col space-y-16">
          {posts.map((post) => (
            <article key={post.slug} className="md:grid md:grid-cols-4 md:items-baseline">
              <div className="md:col-span-3 group relative flex flex-col items-start">
                <h2 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-amber-700 dark:hover:text-amber-300"
                  >
                    {post.title}
                  </Link>
                </h2>
                <time
                  className="md:hidden relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500"
                  dateTime={post.date}
                >
                  {post.date}
                </time>
                <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {post.description}
                </p>
                <div className="relative z-10 mt-4 flex items-center text-sm font-medium text-amber-700 dark:text-amber-300">
                  Read article →
                </div>
              </div>
              <time
                className="mt-1 hidden md:block relative z-10 order-first mb-3 items-center text-sm text-zinc-400 dark:text-zinc-500"
                dateTime={post.date}
              >
                {post.date}
              </time>
            </article>
          ))}
        </div>
      </div>
    </SimpleLayout>
  )
}
