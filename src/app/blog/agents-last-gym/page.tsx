import { type Metadata } from 'next'
import type { ReactNode } from 'react'

import { Container } from '@/components/Container'

import './_styles/merge.css'
import './_styles/algorithm.css'
import './_styles/ring.css'
import './_styles/domains.css'

import SectionTitle from './_components/SectionTitle'
import { Cite } from './_components/Cite'
import { Pending } from './_components/Placeholder'
import CopyBib from './_components/CopyBib'
import ExampleRing from './_components/ExampleRing'
import DomainGrid, { DomainGridCredits } from './_components/DomainGrid'
import SideToc, { type TocItem } from './_components/SideToc'
import SidenoteLayout from './_components/SidenoteLayout'

/** Brown bold for the post's key concepts and claims. */
function Key({ children }: { children: ReactNode }) {
  return <strong className="am-key">{children}</strong>
}

export const metadata: Metadata = {
  title: 'Agents’ Last Gym',
  // Unlisted draft: reachable by URL, not in the blog index or the sitemap.
  robots: { index: false },
  description:
    'Agents’ Last Gym is a large-scale suite of expert-level professional tasks, built through reverse synthesis from real, finished work: complete projects in Blender, FreeCAD, KiCad, QGIS, 3D Slicer, ParaView and other professional applications, each graded on the native project file it delivers.',
}

const POST = {
  title: 'Agents’ Last Gym',
  author: 'Bowen Wang',
  date: 'Nov 2026',
}

// Sections for the table of contents: one entry per <SectionTitle id=...>,
// plus the introduction above the first of them.
const TOC: TocItem[] = [
  { label: 'Introduction', href: '#introduction' },
  { label: 'Citation', href: '#citation' },
]

const BIBTEX = `@article{wang2026agentslastgym,
  author  = {Bowen Wang},
  title   = {Agents' Last Gym},
  journal = {bowenwang.me},
  year    = {2026},
  month   = nov,
  note    = {https://bowenwang.me/blog/agents-last-gym}
}`

function PostHero() {
  return (
    <header className="mb-8 mt-4">
      <h1 className="text-center text-[1.9rem] font-bold leading-[1.2] tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-[clamp(1.9rem,4.4vw,2.6rem)]">
        {POST.title}
      </h1>
      <div className="mt-6 text-center text-[17px] text-zinc-800 dark:text-zinc-200">
        {POST.author}
      </div>
      <div className="mt-2 text-center text-[16px] text-zinc-500 dark:text-zinc-400">
        {POST.date}
      </div>
    </header>
  )
}

export default function AgentsLastGymPost() {
  return (
    <Container className="mt-6 lg:mt-10">
      <article className="mx-auto max-w-3xl">
        <PostHero />

        {/* The ring sits in its own scope above the main one: it is as wide
            as the window, and the table of contents starts below it. */}
        <div className="am-scope">
          <figure id="fig-1">
            <ExampleRing />
          </figure>
        </div>

        <div className="am-scope scroll-mt-24" id="introduction">
          <SideToc items={TOC} />
          <SidenoteLayout />


          {/* ------------------------------------------------------------ */}
          {/* Introduction */}
          {/* ------------------------------------------------------------ */}
          <div className="am-prose">
            <p>
              Personal and daily-work tasks are no longer a challenge for
              agents driven by frontier models. They manage email, fill out
              forms, and edit documents and spreadsheets. The benchmarks built
              around this kind of work, navigating websites, operating desktop
              applications and running simulated office workflows{' '}
              <Cite
                k={['webarena2024', 'mind2web2023', 'osworld2024', 'theagentcompany2024']}
              />
              , were open problems only a few years ago. Frontier models now
              solve most of them, and training environments for such tasks can
              be generated at scale{' '}
              <Cite k={['cuagym2026', 'gymanything2026', 'opencua2025']} />.
            </p>
            <p>
              The work that professionals are paid for is a different matter.
              Consider retopologizing a sculpted character so that it deforms
              cleanly at every joint, carrying an electronic subsystem from a
              requirements sheet to a routed board that passes design-rule
              check, or rebuilding a researcher’s visualization of a
              simulation from raw data. Each of these is a project rather than
              an action. It takes a trained expert hours, it rests on a chain
              of interdependent decisions in specialized software, and its
              deliverable either passes the profession’s own checks or it does
              not. On such work, frontier agents{' '}
              <Key>remain far from reliable</Key>. On the hardest tier of
              Agents’ Last Exam the average full pass rate is below 1%{' '}
              <Cite k="sun2026ale" />. The best agent fully automates 2.5% of
              the real freelance projects in the Remote Labor Index{' '}
              <Cite k="rli2025" />, finishes 15 of 56 professional
              video-editing jobs on Timeline-Bench{' '}
              <Cite k="timelinebench2026" />, and scores 4.58% on functional
              circuit-board construction <Cite k="edabench2026" />.
            </p>
            <p>
              Closing this gap requires training tasks of the same caliber,
              and <Key>such tasks are scarce and costly to produce</Key>. This
              is not for lack of data. Repositories have been mined into large
              collections of verifiable software-engineering tasks{' '}
              <Cite k={['swegym2025', 'r2egym2025', 'swesmith2025']} />,
              computer-use pipelines synthesize tasks for hundreds of desktop
              applications <Cite k={['cuagym2026', 'gymanything2026']} />, and
              human demonstrations are collected and mined from tutorials and
              videos{' '}
              <Cite k={['opencua2025', 'agenttrek2025', 'videoagenttrek2025']} />
              . But synthesized tasks rarely reach beyond what their
              synthesizer can already do, so they cluster at the level of daily
              work, and expert-level tasks written by hand cost hours of a
              specialist’s time each. Agents’ Last Exam drew on more than 250
              industry experts to assemble about 1.5K tasks, held out for
              evaluation <Cite k="sun2026ale" />. Professional work now has its
              exam. It does not have a gym.
            </p>
            <p>
              We introduce <strong>Agents’ Last Gym</strong> (ALG), a
              large-scale suite of expert-level professional tasks built
              through <Key>reverse synthesis</Key> from real, finished work.
              Rather than imagining a task and then solving it, ALG starts from
              work that professionals have already completed, such as a
              studio’s production character, a released circuit board, a
              researcher’s published simulation or a film’s locked cut, and
              derives the task backward from it, keeping the finished work as
              the reference. The synthesizer never has to solve the task. It
              only has to take finished work apart, so the difficulty of the
              tasks is set by the work they come from and not by what the
              synthesizer can do.
            </p>
            <p>
              ALG spans <Pending>D</Pending> professional domains in{' '}
              <Pending>y</Pending> of the 13 industry clusters of Agents’ Last
              Exam. It covers engineering design, from mechanical CAD and CNC
              machining to electronic design, building information modelling
              and geospatial analysis; content production, from 3D modelling
              and animation to game development, film editing and music
              engraving; and science and medicine, from simulation and
              scientific visualization to medical image analysis and
              structural biology. Its tasks run in <Pending>A</Pending>{' '}
              professional applications, including Blender, FreeCAD, KiCad,
              QGIS, 3D Slicer, ParaView, PyMOL, Godot, Shotcut and MuseScore,
              and they read and write the native project formats of each.
            </p>
          </div>

          {/* Figure 2 sits between two blocks of prose and is wider than the
              text column on both sides. */}
          <figure id="fig-2" className="alg-wide">
            <DomainGrid />
            <DomainGridCredits />
          </figure>

          <div className="am-prose">
            <p>
              Breadth does not come at the expense of depth. Every task in ALG
              is <Key>a complete professional project</Key> rather than an
              isolated action. It corresponds to a real unit of work, demands
              hours of expert work and a chain of interdependent decisions,
              and must deliver a native project file that passes the domain’s
              own checks, from design-rule checks and re-renders to re-run
              simulations. Tasks are stated the way such work arrives in
              practice, as a bug report, a change order or a director’s notes,
              never as a list of steps.
            </p>
            <p>Our experiments show three things.</p>
            <ol>
              <li>
                <strong>The tasks are frontier-hard.</strong> Even the
                strongest frontier agents complete only <Pending>p</Pending>%
                of ALG tasks end to end, against <Pending>q</Pending>% on a
                control set of everyday office tasks built with the same
                pipeline.
              </li>
              <li>
                <strong>The tasks are as hard as the work they come from.</strong>{' '}
                They take experts a median of <Pending>h</Pending> hours, and{' '}
                <Pending>w</Pending>% of verified tasks defeat the model that
                built them.
              </li>
              <li>
                <strong>Training on them transfers.</strong> Training on ALG
                improves <Pending>model</Pending> by <Pending>a</Pending>{' '}
                points on Agents’ Last Exam and transfers to independent domain
                benchmarks, with gains that keep growing with data.
              </li>
            </ol>
          </div>

          {/* ------------------------------------------------------------ */}
          <SectionTitle label="Citation" id="citation" />
          <div className="am-prose">
            <CopyBib text={BIBTEX} />
          </div>
        </div>
      </article>
    </Container>
  )
}
