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
      intro="I research on digital agents on evaluation, foundation models, data, training etc."
    >
      <PublicationsTabs />
    </SimpleLayout>
  )
}
