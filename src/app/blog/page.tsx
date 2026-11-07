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
    slug: 'on-policy-merge',
    title: 'On-Policy Merge Stabilizes Multi-Task Reinforcement Learning',
    date: '2026-11-05',
    description:
      'One on-policy RL trainer per domain, merged during training at the point closest in KL to every trainer on its own fresh rollouts. Why the merge decouples domains and what that costs, how to make it take ten minutes on a 9B model, one-shot results on released 4B specialists, and the comparison with multi-task RL, merging after training and MOPD.',
  },
  {
    slug: 'multitask-rl-done-right',
    title: "Filtering Doesn't Change Your Mix. Fixing the Mix Does.",
    date: '2026-11-04',
    description:
      'Multi-task RL done right, part one. In multi-environment RL, zero-advantage filtering leaves environment weights intact; holding the post-filter mix multiplies them by one over the acceptance rate, and per-sequence normalization reweights environments by inverse length. A pre-registered plan with a ledger rule and a free log check.',
  },
  // hidden from the blog index
  // {
  //   slug: 'anticausal-masks',
  //   title: 'Every Loss Mask Is a Reward',
  //   date: '2026-11-03',
  //   description:
  //     'A pre-registered research plan: masking truncated or dropped rollouts in agentic RL pays them the mean reward. The identity, when it reverses the gradient, and the experiments that would confirm or kill it.',
  // },
  // hidden — draft not ready for public
  // {
  //   slug: 'cli-agents-gui-benchmark',
  //   title: 'Towards Universal Digital Agents',
  //   date: '2026-05-11',
  //   description:
  //     'Empirical evidence from OSWorld-Verified: coding agents like Codex and Claude Code can solve many “GUI” tasks through the command line and why we need universal digital agents.',
  // },
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
      intro="I share my thoughts, views and bitter lessons out of research papers here while building digital agents."
    >
      <div className="md:border-l md:border-rule md:pl-6 md:dark:border-zinc-700/40">
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
                <Link
                  href={`/blog/${post.slug}`}
                  className="relative z-10 mt-4 flex items-center text-sm font-medium text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
                >
                  Read article →
                </Link>
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
