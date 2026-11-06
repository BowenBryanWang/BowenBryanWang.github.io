import { type Metadata } from 'next'

import { SimpleLayout } from '@/components/SimpleLayout'
import { PublicationsTabs } from './PublicationsTabs'

export const metadata: Metadata = {
  title: 'Publications',
  description: 'Selected publications and technical reports by Bryan Wang.',
}

export default async function ArticlesIndex() {
  return (
    <SimpleLayout
      title="Publications"
      intro="I work on digital agents across evaluation, mid-training and post-training, with a focus on computer-use agents, large-scale agentic RL, and synthetic data. I believe strong agents come from scalable data built on reliable algorithms and infrastructure."
    >
      <PublicationsTabs />
    </SimpleLayout>
  )
}
