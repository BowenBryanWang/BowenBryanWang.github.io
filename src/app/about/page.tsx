import { type Metadata } from 'next'
import Link from 'next/link'
import clsx from 'clsx'
import Image, { type ImageProps } from 'next/image'
import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import {
  GitHubIcon,
  GoogleScholarIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
} from '@/components/SocialIcons'
import portraitImage from '@/images/portrait.jpg'

import logoAirbnb from '@/images/logos/airbnb.svg'
import logoFacebook from '@/images/logos/facebook.svg'
import HKU from '@/images/logos/hku.jpg'
import NUS from '@/images/logos/nus.jpg'
import THU from '@/images/logos/thu.jpg'
import logoStarbucks from '@/images/logos/starbucks.svg'
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
        className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
      >
        <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500" />
        <span className="ml-4">{children}</span>
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
  logo: ImageProps['src']
  start: string | { label: string; dateTime: string }
  end: string | { label: string; dateTime: string }
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
      <div className="relative mt-1 flex h-12 w-12 flex-none items-center justify-center rounded-full shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
        <Image src={role.logo} alt="" className="h-10 w-10" unoptimized />
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

function Resume() {
  let resume: Array<Role> = [
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
      company: 'National University of Singapore',
      title: 'Research Assistant',
      logo: NUS,
      start: '2023.06',
      end: '2023.09',
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
        {resume.map((role, roleIndex) => (
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
  return (
    <Card as="article">
      {article.link === "True" ? (
        <Card.Title href={`${article.url}`}>
          {article.title}
        </Card.Title>
      ) : (
        <Card.Title>
          {article.title}
        </Card.Title>
      )}
      <Card.Authors author={article.author as string}></Card.Authors>
      <Card.Description>{article.description}</Card.Description>
      {article.link === "True" ? (
        <Card.Cta>Read article</Card.Cta>
      ) : null}
    </Card>
  )
}

export const metadata: Metadata = {
  title: 'About',
  description: 'Bryan Wang',
}

export default async function About() {
  return (
    <>
      <Container className="mt-8 sm:mt-16">
        <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-6 lg:grid-rows-[auto_1fr] lg:gap-y-12">
          <div className="lg:col-span-2 lg:pl-20">
            <div className="max-w-md px-2.5 lg:max-w-none">
              <Image
                src={portraitImage}
                alt=""
                sizes="(min-width: 1024px) 32rem, 20rem"
                className="aspect-square  rounded-2xl bg-zinc-100 object-cover transition-transform hover:rotate-[2deg] dark:bg-zinc-800"
              />
            </div>
          </div>
          <div className="lg:order-first lg:col-span-4 lg:row-span-2">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
              Bowen Bryan Wang
            </h1>
            <MyTypewriter
              text={[
                'Natural Language Processing',
                'Multi-modal Large Language Models',
                'Autonomous Digital Agents',
              ]}
            />
            <div className="mt-6 space-y-7 text-base text-zinc-600 dark:text-zinc-400">
              <div>
                👋 Hi! I&apos;m a <p className="inline ordinal">1st</p> year Ph.D.
                student at
                <a
                  href="https://www.hku.hk/"
                  className="inline underline decoration-amber-800 decoration-wavy underline-offset-4 dark:decoration-amber-300"
                >
                  the University of Hong Kong
                </a>
                , with deep focus and passion on NLP and LLM-based Agent. I&apos;m
                fortunate to get advised by
                <a
                  href="https://taoyds.github.io/"
                  className="inline underline decoration-amber-800 decoration-wavy underline-offset-4 dark:decoration-amber-300"
                >
                  Prof. Tao Yu
                </a>
                and be a part of
                <a
                  href="https://www.xlang.ai/"
                  className="inline underline decoration-amber-800 decoration-wavy underline-offset-4 dark:decoration-amber-300"
                >
                  the XLANG Lab
                </a>
                and
                <a
                  href="https://hkunlp.github.io/"
                  className="inline underline decoration-amber-800 decoration-wavy underline-offset-4 dark:decoration-amber-300"
                >
                  HKU NLP Lab
                </a>
                . Previously I got
                my bachlor&apos;s degree of Computer Science and Technology at
                <a
                  href="https://www.tsinghua.edu.cn/"
                  className="inline underline decoration-amber-800 decoration-wavy underline-offset-4 dark:decoration-amber-300"
                >
                  Tsinghua University
                </a>
                focusing on Human-Computer Interaction
                (HCI), advised by Prof. Chun Yu and Prof. Yuanchun Shi.
              </div>
              <div>
                My long-term research goal is to build autonomous computer agents that can
                1) understand open-ended natural language (or even multi-modal) instructions;
                2) observe the wild OS environment with grounded knowledge;
                3) generate executable steps (e.g. atomic actions, system shortcuts, codes, etc.)
                iteratively to finalize the task.
              </div>
              <div>
                The ultimate vision of my research is to build fundamental large agent models that could be seamlessly integrated into the daily use just like ChatGPT, rather than prompt-based warpper of existing LLMs.
                To implement this goal, my research covers a various range of fundamental topics, starting from data collection, training, evaluation and more, which could be challenging but also exciting.
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 lg:pl-20">
            <ul role="list">
              <li className={clsx("mt-4", 'flex')}>
                <Link
                  href="https://scholar.google.com/citations?user=Y0JPOD0AAAAJ"
                  target="_blank"
                  className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
                >
                  <GoogleScholarIcon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500" />
                  <span className="ml-4">Google Scholar</span>
                </Link>
              </li>
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
                href="https://github.com/BowenBryanWang"
                icon={GitHubIcon}
                className="mt-4"
              >
                GitHub
              </SocialLink>
              <SocialLink
                href="https://www.linkedin.com/in/bowen-wang-927449275/"
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
                bryanwang [dot] nlp [at] connect.hku.hk
              </SocialLink>
            </ul>
          </div>
        </div>
      </Container>
      <Container className="mt-16 md:mt-32">
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-5">
          <div className="col-span-2 space-y-6 lg:pr-8 xl:pr-12">
            <Newsletter />
            <Resume />
          </div>
          <div className="col-span-3 flex flex-col gap-16">
            {myarticles.map((article) => (
              <Article key={article.url} article={article} />
            ))}
          </div>
        </div>
      </Container>
    </>
  )
}
