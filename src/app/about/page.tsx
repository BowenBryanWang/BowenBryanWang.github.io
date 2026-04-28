import { type Metadata } from 'next'
import Link from 'next/link'
import clsx from 'clsx'
import Image, { type ImageProps } from 'next/image'
import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import {
  GoogleScholarIcon,
  LinkedInIcon,
  TwitterIcon,
} from '@/components/SocialIcons'
import portraitImage from '@/images/portrait.jpg'
import Apple from '@/images/logos/apple.svg'

import logoAirbnb from '@/images/logos/airbnb.svg'
import logoFacebook from '@/images/logos/facebook.svg'
import HKU from '@/images/logos/hku.jpg'
import THU from '@/images/logos/thu.jpg'
import logoStarbucks from '@/images/logos/starbucks.svg'
import MoonShot from '@/images/logos/moonshot.jpeg'
import Qwen from '@/images/logos/qwen.png'
import image1 from '@/images/photos/image-1.jpg'
import image2 from '@/images/photos/image-2.jpg'
import image3 from '@/images/photos/image-3.jpg'
import image4 from '@/images/photos/image-4.jpg'
import image5 from '@/images/photos/image-5.jpg'
import { MyArticle, myarticles } from '@/lib/articles'
import { formatDate } from '@/lib/formatDate'
import { use } from 'react'
import MyTypewriter from './TypeWritter'

function SocialLink({
  className,
  href,
  children,
  icon: Icon,
}: {
  className?: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <li className={clsx(className, 'flex')}>
      <Link
        href={href}
        target="_blank"
        className="group flex items-center text-sm font-medium text-zinc-800 transition hover:text-amber-700 dark:text-zinc-200 dark:hover:text-amber-300"
      >
        <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-amber-700 dark:group-hover:fill-amber-300" />
        <span className="ml-4 whitespace-nowrap">{children}</span>
      </Link>
    </li>
  )
}

function MailIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M6 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6Zm.245 2.187a.75.75 0 0 0-.99 1.126l6.25 5.5a.75.75 0 0 0 .99 0l6.25-5.5a.75.75 0 0 0-.99-1.126L12 12.251 6.245 7.187Z"
      />
    </svg>
  )
}

function Newsletter() {
  return (
    <form
      action="/thank-you"
      className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40"
    >
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <MailIcon className="h-6 w-6 flex-none" />
        <span className="ml-3">Stay up to date</span>
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Get notified when I publish something new, and unsubscribe at any time.
      </p>
      <div className="mt-6 flex">
        <input
          type="email"
          placeholder="Email address"
          aria-label="Email address"
          required
          className="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/10 sm:text-sm"
        />
        <Button type="submit" className="ml-4 flex-none">
          Join
        </Button>
      </div>
    </form>
  )
}

interface Role {
  company: string
  title: string
  logo?: ImageProps['src']
  description?: string
  advisor?: React.ReactNode
  start: string | { label: string; dateTime: string }
  end: string | { label: string; dateTime: string }
}

interface TechnicalReport {
  year: string
  title: string
  authors: string
  url?: string
}

interface HonorAward {
  year: string
  title: React.ReactNode
}

interface TalkItem {
  year: string
  title: React.ReactNode
}

function Role({ role }: { role: Role }) {
  let startLabel =
    typeof role.start === 'string' ? role.start : role.start.label
  let startDate =
    typeof role.start === 'string' ? role.start : role.start.dateTime

  let endLabel = typeof role.end === 'string' ? role.end : role.end.label
  let endDate = typeof role.end === 'string' ? role.end : role.end.dateTime

  return (
    <li className="flex gap-4">
      <div className="relative mt-1 flex h-12 w-12 flex-none items-center justify-center">
        {role.logo ? (
          <Image
            src={role.logo}
            alt=""
            className="h-10 w-10 object-contain"
            unoptimized
          />
        ) : (
          <BriefcaseIcon className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
        )}
      </div>
      <dl className="flex flex-auto flex-wrap gap-x-2">
        <dt className="sr-only">Company</dt>
        <dd className="w-full flex-none text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {role.company}
        </dd>
        <dt className="sr-only">Role</dt>
        <dd className="text-xs text-zinc-500 dark:text-zinc-400">
          {role.title}
        </dd>
        {role.advisor && (
          <>
            <dt className="sr-only">Advisor</dt>
            <dd className="w-full flex-none text-xs text-zinc-500 dark:text-zinc-400">
              Advisor: {role.advisor}
            </dd>
          </>
        )}
        {role.description && (
          <>
            <dt className="sr-only">Description</dt>
            <dd className="w-full flex-none text-xs text-zinc-500 dark:text-zinc-400">
              {role.description}
            </dd>
          </>
        )}
        <dt className="sr-only">Date</dt>
        <dd
          className="ml-auto text-xs text-zinc-400 dark:text-zinc-500"
          aria-label={`${startLabel} until ${endLabel}`}
        >
          <time dateTime={startDate}>{startLabel}</time>{' '}
          <span aria-hidden="true">—</span>{' '}
          <time dateTime={endDate}>{endLabel}</time>
        </dd>
      </dl>
    </li>
  )
}

function Experiences() {
  let experiences: Array<Role> = [
    {
      company: 'Apple AI/ML',
      title: 'Research Scientist Intern',
      logo: Apple,
      advisor: (
        <a
          href="https://zhegan27.github.io/"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-zinc-300 underline-offset-2 dark:decoration-zinc-600"
        >
          Zhe Gan
        </a>
      ),
      description: 'Digital Agent Research',
      start: '2026.5',
      end: 'present',
    },
    {
      company: 'Qwen Team, Alibaba Group',
      title: 'Research Scientist Intern',
      logo: Qwen,
      advisor: (
        <>
          <a
            href="https://scholar.google.com/citations?user=3_zVvT0AAAAJ"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-zinc-300 underline-offset-2 dark:decoration-zinc-600"
          >
            Binyuan Hui
          </a>{' '}
          &amp;{' '}
          <a
            href="https://scholar.google.com/citations?user=xy6A44QAAAAJ"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-zinc-300 underline-offset-2 dark:decoration-zinc-600"
          >
            Junyang Lin
          </a>
        </>
      ),
      description: 'Post-training in CUA',
      start: '2025.12',
      end: '2026.4',
    },
    {
      company: 'Moonshot AI',
      title: 'Research Intern',
      logo: MoonShot,
      advisor: (
        <>
          <a
            href="https://www.haohu.tech/"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-zinc-300 underline-offset-2 dark:decoration-zinc-600"
          >
            Hao Hu
          </a>{' '}
          &amp;{' '}
          <a
            href="https://floodsung.github.io/"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-zinc-300 underline-offset-2 dark:decoration-zinc-600"
          >
            Flood Sung
          </a>
        </>
      ),
      description: 'Post-training in CUA',
      start: '2025.02',
      end: '2025.12',
    },
  ]

  return (
    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <BriefcaseIcon className="h-6 w-6 flex-none" />
        <span className="ml-3">Experiences</span>
      </h2>
      <ol className="mt-6 space-y-4">
        {experiences.map((role, roleIndex) => (
          <Role key={roleIndex} role={role} />
        ))}
      </ol>
    </div>
  )
}

function Education() {
  let Education: Array<Role> = [
    {
      company: 'The University of Hong Kong',
      title: 'Ph.D. Student',
      logo: HKU,
      start: '2024.09',
      end: {
        label: 'Present',
        dateTime: new Date().getFullYear().toString(),
      },
    },
    {
      company: 'Tsinghua University',
      title: 'B.E. in Computer Science',
      logo: THU,
      start: '2020',
      end: '2024',
    },
  ]

  return (
    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <BriefcaseIcon className="h-6 w-6 flex-none" />
        <span className="ml-3">Education</span>
      </h2>
      <ol className="mt-6 space-y-4">
        {Education.map((role, roleIndex) => (
          <Role key={roleIndex} role={role} />
        ))}
      </ol>
      {/* <Button href="#" variant="secondary" className="group mt-6 w-full">
        Download CV
        <ArrowDownIcon className="h-4 w-4 stroke-zinc-400 transition group-active:stroke-zinc-600 dark:group-hover:stroke-zinc-50 dark:group-active:stroke-zinc-50" />
      </Button> */}
    </div>
  )
}

function BriefcaseIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M2.75 9.75a3 3 0 0 1 3-3h12.5a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3H5.75a3 3 0 0 1-3-3v-8.5Z"
        className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-100/10 dark:stroke-zinc-500"
      />
      <path
        d="M3 14.25h6.249c.484 0 .952-.002 1.316.319l.777.682a.996.996 0 0 0 1.316 0l.777-.682c.364-.32.832-.319 1.316-.319H21M8.75 6.5V4.75a2 2 0 0 1 2-2h2.5a2 2 0 0 1 2 2V6.5"
        className="stroke-zinc-400 dark:stroke-zinc-500"
      />
    </svg>
  )
}

function ArrowDownIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.75 8.75 8 12.25m0 0 3.25-3.5M8 12.25v-8.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Article({ article }: { article: MyArticle }) {
  const hasAnyUrl = article.url.website || article.url.paper || article.url.code
  const primaryUrl = article.url.website || article.url.paper || article.url.code || '#'
  
  return (
    <Card className="md:col-span-3">
        <Card.Title>{article.title}</Card.Title>
        <Card.Authors author={article.author} />
        {/* <Card.Description>{article.description}</Card.Description> */}
        {article.link === "True" ? (
          <div className="relative z-10 mt-1 flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
            {article.publication}
            {hasAnyUrl && (
              <>
                {article.url.website && (
                  <a href={article.url.website} className="text-xs text-blue-400 underline hover:text-blue-500">
                    [Website]
                  </a>
                )}
                {article.url.paper && (
                  <a href={article.url.paper} className="text-xs text-blue-400 underline hover:text-blue-500">
                    [Paper]
                  </a>
                )}
                {article.url.code && (
                  <a href={article.url.code} className="text-xs text-blue-400 underline hover:text-blue-500">
                    [Code]
                  </a>
                )}
              </>
            )}
          </div>
        ) : null}

      </Card>
  )
}

function TechnicalReportItem({ report }: { report: TechnicalReport }) {
  return (
    <Card className="md:col-span-3">
      <Card.Title>{report.title}</Card.Title>
      <Card.Authors author={report.authors} />
      <div className="relative z-10 mt-1 flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
        <span className="text-sm font-semibold">{report.year}</span>
        <span>Technical Report</span>
        {report.url && (
          <a
            href={report.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-400 underline hover:text-blue-500"
          >
            [Paper]
          </a>
        )}
      </div>
    </Card>
  )
}

export const metadata: Metadata = {
  title: 'About',
  description: 'Bryan Wang',
}

export default async function About() {
  const selectedPublications = myarticles.filter(
    (article) =>
      article.title !== 'Kimi-VL Technical Report' &&
      article.title !==
        'Interaction Proxy Manager: Semantic Model Generation and Run-time Support for Reconstructing Ubiquitous User Interfaces of Mobile Services',
  )

  const technicalReports: TechnicalReport[] = [
    {
      year: '2026',
      title: 'Qwen3.5: Towards Native Multimodal Agents',
      authors: 'The Qwen Team, Alibaba Group.',
      url: 'https://qwen.ai/blog?id=qwen3.5',
    },
    {
      year: '2026',
      title: 'Kimi K2.5: Visual Agentic Intelligence',
      authors: 'The Kimi Team.',
      url: 'https://arxiv.org/abs/2602.02276',
    },
    {
      year: '2025',
      title: 'Kimi-VL Technical Report',
      authors:
        'Kimi Team: Angang Du, Bohong Yin, Bowei Xing, Bowen Qu, Bowen Wang, Cheng Chen, Chenlin Zhang, Chenzhuang Du, Chu Wei, Congcong Wang, Dehao Zhang, Dikang Du, Dongliang Wang, Enming Yuan, Enzhe Lu, Fang Li, Flood Sung, Guangda Wei, Guokun Lai, Han Zhu, Hao Ding, Hao Hu, Hao Yang, et al.',
      url: 'https://arxiv.org/abs/2504.07491',
    },
  ]

  const honorsAndAwards: HonorAward[] = [
    {
      year: '2025',
      title: (
        <>
          <strong>Workshop Best Paper Award</strong>,{' '}
          <em>COLM 2025 AIA workshop</em>
        </>
      ),
    },
    {
      year: '2025',
      title: (
        <>
          <strong>Research Postgraduate Student Innovation Award</strong>,{' '}
          <em>The University of Hong Kong</em>
        </>
      ),
    },
    {
      year: '2023',
      title: (
        <>
          <strong>Research and Innovation Scholarship</strong>,{' '}
          <em>Tsinghua University</em>
        </>
      ),
    },
    {
      year: '2022',
      title: (
        <>
          <strong>2-nd Prize, Challenge-Cup Competition Award</strong>,{' '}
          <em>Tsinghua University</em>
        </>
      ),
    },
  ]

  const talks: TalkItem[] = [
    {
      year: '2025',
      title: (
        <>
          <strong>Language Agents</strong>, <em>University of Tasmania</em>
        </>
      ),
    },
  ]

  return (
    <>
      <Container className="mt-8 sm:mt-16">
        <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-10 lg:grid-rows-[auto_1fr] lg:gap-y-12">
          <div className="lg:col-span-3 lg:pl-20">
            <div className="max-w-md px-2.5 lg:max-w-none">
              <Image
                src={portraitImage}
                alt=""
                sizes="(min-width: 1024px) 32rem, 20rem"
                className="aspect-square  rounded-2xl bg-zinc-100 object-cover transition-transform hover:rotate-[2deg] dark:bg-zinc-800"
              />
            </div>
          </div>
          <div className="lg:order-first lg:col-span-7 lg:row-span-2">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
              Bowen Wang
            </h1>
            <MyTypewriter
              text={[
                'Computer-Use Agent',
                'Agentic Models',
              ]}
            />
            <div className="mt-6 space-y-7 text-base text-zinc-600 dark:text-zinc-400">
              <div>
                I&apos;m a <p className="inline ordinal">2nd</p> year Ph.D.
                student at&nbsp;
                <a
                  href="https://www.hku.hk/"
                  className="inline underline decoration-amber-800 decoration-wavy underline-offset-4 dark:decoration-amber-300 hover:text-amber-700 dark:hover:text-amber-300"
                >
                  the University of Hong Kong
                </a>
                , with deep focus and passion on NLP and fundamental model-based agent. I&apos;m
                fortunate to get advised by&nbsp;
                <a
                  href="https://taoyds.github.io/"
                  className="inline underline decoration-amber-800 decoration-wavy underline-offset-4 dark:decoration-amber-300 hover:text-amber-700 dark:hover:text-amber-300"
                >
                  Prof. Tao Yu
                </a>&nbsp;
                and be a part of&nbsp;
                <a
                  href="https://www.xlang.ai/"
                  className="inline underline decoration-amber-800 decoration-wavy underline-offset-4 dark:decoration-amber-300 hover:text-amber-700 dark:hover:text-amber-300"
                >
                  the XLANG Lab
                </a>&nbsp;
                and&nbsp;
                <a
                  href="https://hkunlp.github.io/"
                  className="inline underline decoration-amber-800 decoration-wavy underline-offset-4 dark:decoration-amber-300 hover:text-amber-700 dark:hover:text-amber-300"
                >
                  HKU NLP Lab
                </a>
                . Previously I got
                my bachlor&apos;s degree of Computer Science and Technology at&nbsp;
                <a
                  href="https://www.tsinghua.edu.cn/"
                  className="inline underline decoration-amber-800 decoration-wavy underline-offset-4 dark:decoration-amber-300 hover:text-amber-700 dark:hover:text-amber-300"
                >
                  Tsinghua University
                </a>&nbsp;
              </div>
              <div>
                My research focuses on building universal digital agents. I
                have primarily worked on computer-use agents (CUA), developing
                open foundations through mid-training and post-training and
                building open-sourced CUA models. My current research interests
                lie in digital agentic models, particularly in post-training
                methodologies for creating generalizable and intelligent agents
                that can reliably operate across diverse digital environments
                including coding, computer-use, terminal-use and more.
              </div>
              <div>
                I have also participated in building open-source foundation
                models such as Qwen3.5 and Kimi K2.5, and I hope to make
                computer-use a core capability of frontier models. I believe
                universal digital agents (UDA) are a path toward AGI. If you
                would like to talk about research or life, feel free to reach
                out. I&apos;m open to opportunities.
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 lg:pl-20">
            <ul role="list">
              {/* <li className={clsx("mt-4", 'flex')}>
                <Link
                  href="https://scholar.google.com/citations?user=Y0JPOD0AAAAJ"
                  target="_blank"
                  className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
                >
                  <GoogleScholarIcon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500" />
                  <span className="ml-4">Google Scholar</span>
                </Link>
              </li>
              <li className={clsx("mt-4", 'flex')}>
                <Link
                  href="https://x.com/Saltyp0rridge24"
                  target="_blank"
                  className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
                >
                  <TwitterIcon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500" />
                  <span className="ml-4">X (Twitter)</span>
                </Link>
              </li> */}

              <SocialLink
                icon={GoogleScholarIcon}
                href="https://scholar.google.com/citations?user=Y0JPOD0AAAAJ"
                className="mt-4"
              >
                Google Scholar
              </SocialLink>
              <SocialLink
                href="https://x.com/Saltyp0rridge24"
                icon={TwitterIcon}
                className="mt-4"
              >
                X (Twitter)
              </SocialLink>
              <SocialLink
                href="https://www.linkedin.com/in/bowenwangnlp/"
                icon={LinkedInIcon}
                className="mt-4"
              >
                LinkedIn
              </SocialLink>

              <SocialLink
                href="mailto:bryanwang.nlp@connect.hku.hk"
                icon={MailIcon}
                className="mt-4 border-t border-zinc-100 pt-2 dark:border-zinc-700/40"
              >
                bryanwang.nlp@connect.hku.hk
              </SocialLink>
            </ul>
          </div>
        </div>
      </Container>
      <Container className="mt-16 md:mt-32">
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-5">
          <div className="col-span-2 space-y-6 lg:pr-8 xl:pr-12">
            {/* <Newsletter /> */}
            <Experiences />
            <Education />
          </div>
          <div className="col-span-3 flex flex-col gap-16">
            <section>
              <h2 className="border-b border-zinc-200 pb-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:border-zinc-700 dark:text-zinc-100">
                Selected Publications
              </h2>
              <div className="mt-8 flex flex-col gap-10">
                {selectedPublications.map((article, index) => (
                  <Article key={`${article.title}-${index}`} article={article} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="border-b border-zinc-200 pb-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:border-zinc-700 dark:text-zinc-100">
                Technical Reports
              </h2>
              <div className="mt-8 flex flex-col gap-10">
                {technicalReports.map((report, index) => (
                  <TechnicalReportItem
                    key={`${report.title}-${index}`}
                    report={report}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </Container>
      <Container className="mt-16 md:mt-24">
        <section>
          <h2 className="border-b border-zinc-200 pb-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:border-zinc-700 dark:text-zinc-100 sm:text-3xl">
            Honors &amp; Awards
          </h2>
          <ol className="mt-6 space-y-4 sm:space-y-5">
            {honorsAndAwards.map((item, index) => (
              <li
                key={`${item.year}-${index}`}
                className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-5"
              >
                <div className="w-full flex-none text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:w-16 sm:text-lg">
                  {item.year}
                </div>
                <div className="min-w-0 text-base leading-7 text-zinc-900 dark:text-zinc-100 sm:text-[1.05rem] sm:leading-7 sm:[&_strong]:font-semibold sm:[&_em]:font-normal sm:[&_em]:italic">
                  {item.title}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </Container>
      <Container className="mt-16 md:mt-20">
        <section>
          <h2 className="border-b border-zinc-200 pb-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:border-zinc-700 dark:text-zinc-100 sm:text-3xl">
            Talks
          </h2>
          <ol className="mt-6 space-y-4">
            {talks.map((item, index) => (
              <li
                key={`${item.year}-${index}`}
                className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-5"
              >
                <div className="w-full flex-none text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:w-16 sm:text-lg">
                  {item.year}
                </div>
                <div className="min-w-0 text-base leading-7 text-zinc-900 dark:text-zinc-100 sm:text-[1.05rem] sm:leading-7 sm:[&_strong]:font-semibold sm:[&_em]:font-normal sm:[&_em]:italic">
                  {item.title}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </Container>
    </>
  )
}
