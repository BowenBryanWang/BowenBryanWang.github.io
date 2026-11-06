'use client'

import { useState } from 'react'
import Image from 'next/image'
import clsx from 'clsx'

import { Card } from '@/components/Card'
import {
  MyArticle,
  myarticles,
  TechnicalReport,
  technicalReports,
} from '@/lib/articles'

type TabId = 'publications' | 'technical-reports'

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'publications', label: 'Publications' },
  { id: 'technical-reports', label: 'Technical Reports' },
]

function Article({ article }: { article: MyArticle }) {
  const hasAnyUrl =
    article.url.website ||
    article.url.paper ||
    article.url.slide ||
    article.url.code ||
    article.url.dataset ||
    article.url.environments ||
    article.url.blog

  return (
    <article className="group flex flex-col gap-6 md:flex-row">
      {article.image && (
        <div className="w-full flex-shrink-0 md:w-64">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover transition group-hover:scale-100"
            />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <Card className="h-full">
          <Card.Title>{article.title}</Card.Title>
          <Card.Authors author={article.author} />
          {article.link === 'True' ? (
            <div className="relative z-10 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              {article.publication}
              {hasAnyUrl && (
                <>
                  {article.url.website && (
                    <a
                      href={article.url.website}
                      className="text-xs text-blue-400 underline hover:text-blue-500"
                    >
                      [Website]
                    </a>
                  )}
                  {article.url.paper && (
                    <a
                      href={article.url.paper}
                      className="text-xs text-blue-400 underline hover:text-blue-500"
                    >
                      [Paper]
                    </a>
                  )}
                  {article.url.code && (
                    <a
                      href={article.url.code}
                      className="text-xs text-blue-400 underline hover:text-blue-500"
                    >
                      [Code]
                    </a>
                  )}
                  {article.url.dataset && (
                    <a
                      href={article.url.dataset}
                      className="text-xs text-blue-400 underline hover:text-blue-500"
                    >
                      [Dataset]
                    </a>
                  )}
                  {article.url.environments && (
                    <a
                      href={article.url.environments}
                      className="text-xs text-blue-400 underline hover:text-blue-500"
                    >
                      [Environments]
                    </a>
                  )}
                  {article.url.blog && (
                    <a
                      href={article.url.blog}
                      className="text-xs text-blue-400 underline hover:text-blue-500"
                    >
                      [Blog]
                    </a>
                  )}
                  {article.url.slide && (
                    <a
                      href={article.url.slide}
                      className="text-xs text-blue-400 underline hover:text-blue-500"
                    >
                      [Slide]
                    </a>
                  )}
                </>
              )}
            </div>
          ) : null}
        </Card>
      </div>
    </article>
  )
}

function TechnicalReportItem({ report }: { report: TechnicalReport }) {
  return (
    <Card className="h-full">
      <Card.Title>{report.title}</Card.Title>
      <Card.Authors author={report.authors} />
      <div className="relative z-10 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
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

export function PublicationsTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('publications')

  return (
    <div className="md:border-l md:border-rule md:pl-6 md:dark:border-zinc-700/40">
      <div
        role="tablist"
        aria-label="Publication categories"
        className="grid grid-cols-2 rounded-lg bg-paper-deep p-1 text-sm font-medium text-zinc-600 ring-1 ring-rule/60 dark:bg-zinc-800/70 dark:text-zinc-300 dark:ring-0 sm:inline-grid sm:min-w-[22rem]"
      >
        {tabs.map((tab) => {
          const selected = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center justify-center rounded-md px-3 py-2 transition',
                selected
                  ? 'bg-paper text-zinc-900 shadow-sm ring-1 ring-rule dark:bg-zinc-900 dark:text-zinc-100 dark:ring-0'
                  : 'hover:text-zinc-900 dark:hover:text-zinc-100',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'publications' ? (
        <section
          id="publications-panel"
          role="tabpanel"
          aria-labelledby="publications-tab"
          className="mt-8"
        >
          <h2 className="sr-only">Publications</h2>
          <div className="flex flex-col gap-10">
            {myarticles.map((article, index) => (
              <Article key={`${article.title}-${index}`} article={article} />
            ))}
          </div>
        </section>
      ) : (
        <section
          id="technical-reports-panel"
          role="tabpanel"
          aria-labelledby="technical-reports-tab"
          className="mt-8"
        >
          <h2 className="sr-only">Technical Reports</h2>
          <div className="flex flex-col gap-10">
            {technicalReports.map((report, index) => (
              <TechnicalReportItem
                key={`${report.title}-${index}`}
                report={report}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
