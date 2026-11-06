import { type Metadata } from 'next'
import { Fragment } from 'react'

import { Container } from '@/components/Container'

export const metadata: Metadata = {
  title: 'Towards Universal Digital Agents',
  description:
    'Empirical evidence from OSWorld-Verified: coding agents like Codex and Claude Code can solve many “GUI” tasks through the command line and why we need universal digital agents.',
}

const POST = {
  title: 'Towards Universal Digital Agents',
  subtitle:
    'Empirical evidence from OSWorld-Verified: coding agents like Codex and Claude Code can solve many “GUI” tasks through the command line and why we need universal digital agents.',
  date: 'May 11, 2026',
}

export default function CliAgentsGuiBenchmarkPost() {
  return (
    <Container className="mt-6 lg:mt-10">
      <article className="mx-auto max-w-6xl">

        <PostHero />
        <IntroWriting />
        <ResultsTable />
      </article>
    </Container>
  )
}

function PostHero() {
  return (
    <header className="mt-4 mb-14">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-[2.75rem] sm:leading-[1.15]">
        {POST.title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
        {POST.subtitle}
      </p>
      <hr className="mt-10 border-zinc-200 dark:border-zinc-700/40" />
    </header>
  )
}

function IntroWriting() {
  return (
    <section className="mx-auto mb-12 max-w-3xl text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
      <p>
        Over the past year, we have witnessed a rapid leap in the capabilities
        of pure-vision computer-use agents. Frontier models such as Claude Opus
        4.7 and GPT-5.5 now achieve striking performance on CUA benchmarks,
        reaching 78.0% and 78.7% on OSWorld respectively, surpassing the
        reported human baseline. This progress provides an important foundation
        for building truly autonomous agents: systems such as OpenClaw, Claude
        Code, and Codex are increasingly expected not merely to assist users,
        but to act on their behalf and complete tasks end-to-end. In this
        vision, the graphical user interface is the final mile. At the same
        time, the past year has also seen rapid scaling along a second axis:
        CLI intelligence. Products such as Claude Code and Codex are already
        reshaping software engineering workflows, solving a substantial
        fraction of everyday programming and operational tasks through
        command-line interaction. Together, these two trends suggest a natural
        path toward general autonomous agents: vision-based GUI competence on
        one side, and increasingly capable CLI-based agency on the other.
      </p>
      <p className="mt-6">
        However, the debate around CLI versus GUI agents remains unresolved. It
        is still unclear which interface, if either, provides the more direct
        path toward AGI-like autonomous agents, or whether the two must
        ultimately be combined into a unified system. In this work, we approach
        this question through the lens of evaluation and benchmarking. By
        studying how CLI agents behave on tasks originally designed as GUI
        benchmarks, we aim to provide empirical evidence and analysis for
        understanding the relationship between these two forms of agency. This
        perspective may help clarify what each interface is actually testing,
        where their strengths differ, and how they might be integrated. It also
        motivates a broader framing: universal digital agents, systems that can
        fluidly operate across the command line, graphical interfaces,
        filesystems, applications, and web environments to accomplish user
        goals.
      </p>
      <p className="mt-6">
        Our experiment is intentionally simple, but the results may be
        surprising. We evaluate coding-agent harnesses, including Claude Code
        with Opus 4.7 and Codex with GPT-5.5, on OSWorld-Verified, a widely
        adopted benchmark for computer-use agents. Concretely, for each
        evaluation environment, we deploy the corresponding coding agent inside
        the environment and directly pass the benchmark task query to the agent
        for execution, without adding a specialized GUI-control policy. Further
        details of the evaluation protocol are provided in Appendix A. Table 1
        summarizes the resulting performance.
      </p>
    </section>
  )
}

function ResultsTable() {
  const rows = [
    {
      group: 'Proprietary CUA models',
      model: 'Claude Opus 4.7',
      rawScore: '78.0',
      auditedScore: '-',
      highlight: false,
    },
    {
      model: 'GPT-5.5',
      rawScore: '78.7',
      auditedScore: '-',
      highlight: false,
    },
    {
      group: 'CLI agent harnesses',
      model: 'Codex w/ GPT-5.5',
      rawScore: '54.0',
      auditedScore: '71.8',
      highlight: true,
    },
    {
      model: 'Claude Code w/ Opus 4.7',
      rawScore: '49.9',
      auditedScore: '68.5',
      highlight: true,
    },
  ]

  return (
    <section className="mx-auto mb-14 max-w-3xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-[15px] leading-none text-zinc-800 dark:text-zinc-100">
          <thead>
            <tr className="border-b border-zinc-900 text-[15px] font-normal dark:border-zinc-100">
              <th className="w-[52%] px-1 pb-4 text-left font-normal">
                Model
              </th>
              <th className="w-[24%] px-1 pb-4 text-right font-normal">
                OSWorld-V.
              </th>
              <th className="w-[24%] px-1 pb-4 text-right font-normal">
                Audited
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <Fragment key={row.model}>
                {row.group ? (
                  <tr key={`${row.group}-group`}>
                    <td
                      colSpan={3}
                      className="px-1 pb-3 pt-9 text-[15px] italic text-zinc-500 dark:text-zinc-400"
                    >
                      {row.group}
                    </td>
                  </tr>
                ) : null}
                <tr
                  key={row.model}
                  className="border-b border-zinc-300 dark:border-zinc-700"
                >
                  <td className="px-1 py-4">
                    <span className={row.highlight ? 'font-medium' : ''}>
                      <ModelName value={row.model} />
                    </span>
                  </td>
                  <td className="px-1 py-4 text-right tabular-nums">
                    <span className={row.highlight ? 'font-semibold' : ''}>
                      {row.rawScore}
                    </span>
                  </td>
                  <td className="px-1 py-4 text-right tabular-nums">
                    <span className={row.highlight ? 'font-semibold' : ''}>
                      {row.auditedScore}
                    </span>
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[13px] leading-6 text-zinc-600 dark:text-zinc-400">
        <span className="font-semibold text-zinc-700 dark:text-zinc-200">
          Table 1.
        </span>{' '}
        Main results on OSWorld-Verified. Audit details are provided in
        Appendix A.
      </p>
    </section>
  )
}

function ModelName({ value }: { value: string }) {
  const [name, suffix] = value.split(' w/ ')

  if (!suffix) return <>{value}</>

  return (
    <>
      {name}{' '}
      <span className="text-[12px] font-normal text-zinc-500 dark:text-zinc-400">
        w/ {suffix}
      </span>
    </>
  )
}
