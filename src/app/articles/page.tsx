import { type Metadata } from 'next'
import Image from 'next/image'

import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import { MyArticle, myarticles } from '@/lib/articles'
import { formatDate } from '@/lib/formatDate'

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

// export const metadata: Metadata = {
//   title: 'Articles',
//   description:
//     'All of my long-form thoughts on programming, leadership, product design, and more, collected in chronological order.',
// }

export default async function ArticlesIndex() {

  return (
    <SimpleLayout
      title="Publications"
      intro="I research on digital agents on evaluation, foundation models, data, training etc."
    >
      <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">

        <div className="flex max-w- flex-col space-y-16">
          {myarticles.map((article, index) => (
            <Article key={`${article.title}-${index}`} article={article} />
          ))}
        </div>
      </div>
    </SimpleLayout>
  )
}
