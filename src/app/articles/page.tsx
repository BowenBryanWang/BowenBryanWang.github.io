import { type Metadata } from 'next'

import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import { MyArticle, myarticles } from '@/lib/articles'
import { formatDate } from '@/lib/formatDate'

function Article({ article }: { article: MyArticle }) {
  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline">
      <Card className="md:col-span-3">
        {article.link === "True" ? (
          <Card.Title href={`${article.url}`}>
            {article.title}
          </Card.Title>
        ) : (
          <Card.Title href="#">{article.title}</Card.Title>
        )}
        <Card.Authors author={article.author} />
        <Card.Description>{article.description}</Card.Description>
        {article.link === "True" ? (
          <Card.Cta>Read article</Card.Cta>
        ) : null}

      </Card>
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
      title="I research on Agents from Benchmark, Evaluation, Pre-training, and Tuning etc."
      intro="On the journey to build autonomous agents, I believe that the roadmap should start from high-quality datasets, decent benchmarks and effective evaluation metrics to large-scale pre-training and fine-tuning techniques. More is coming soon..."
    >
      <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">

        <div className="flex max-w- flex-col space-y-16">
          {myarticles.map((article) => (
            <Article key={article.url} article={article} />
          ))}
        </div>
      </div>
    </SimpleLayout>
  )
}
