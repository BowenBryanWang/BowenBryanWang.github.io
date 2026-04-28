import { type Metadata } from 'next'
import Image from 'next/image'

import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import { MyArticle, myarticles } from '@/lib/articles'

interface TechnicalReport {
  year: string
  title: string
  authors: string
  url?: string
}

function Article({ article }: { article: MyArticle }) {
  const hasAnyUrl = article.url.website || article.url.paper || article.url.code
  const primaryUrl = article.url.website || article.url.paper || article.url.code || '#'
  
  return (
    <article className="flex flex-col md:flex-row gap-6 group">
      {/* Image on the left */}
      {article.image && (
        <div className="w-full md:w-64 flex-shrink-0">
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
      
      {/* Content on the right */}
      <div className="flex-1 min-w-0">
        <Card className="h-full">
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
      </div>
    </article >
  )
}

function TechnicalReportItem({ report }: { report: TechnicalReport }) {
  return (
    <Card className="h-full">
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
  title: 'Publications',
  description: 'Selected publications and technical reports by Bryan Wang.',
}

export default async function ArticlesIndex() {
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

  return (
    <SimpleLayout
      title="Publications"
      intro="I research on digital agents on evaluation, foundation models, data, training etc."
    >
      <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
        <section>
          <h2 className="border-b border-zinc-200 pb-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:border-zinc-700 dark:text-zinc-100">
            Publications
          </h2>
          <div className="mt-8 flex flex-col gap-10">
            {myarticles.map((article, index) => (
              <Article key={`${article.title}-${index}`} article={article} />
            ))}
          </div>
        </section>

        <section className="mt-16">
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
    </SimpleLayout>
  )
}
