// Old URL of the On-Policy Merge post; forwards readers (and any #anchor) to the new one.
const TARGET = '/blog/on-policy-merge'

export const metadata = {
  title: 'On-Policy Merge Stabilizes Multi-Task Reinforcement Learning',
  alternates: { canonical: TARGET },
  robots: { index: false },
}

export default function Moved() {
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${TARGET}`} />
      <script
        dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(TARGET)} + location.hash)` }}
      />
      <p style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        This post has moved to <a href={TARGET}>{TARGET}</a>.
      </p>
    </>
  )
}
