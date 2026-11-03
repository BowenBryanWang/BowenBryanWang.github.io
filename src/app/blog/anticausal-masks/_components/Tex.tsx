import katex from 'katex'

type Props = {
  children: string
  display?: boolean
  /** Punctuation to glue to the formula (",", ".", ")") so it cannot wrap
   *  onto the next line on its own. */
  tail?: string
}

// Server-side KaTeX rendering. Pass raw TeX as the single string child,
// e.g. <Tex>{String.raw`\nabla J`}</Tex>. Display mode wraps the output in
// a horizontally scrollable block so long equations do not overflow on phones.
export default function Tex({ children, display = false, tail }: Props) {
  const html = katex.renderToString(children, {
    displayMode: display,
    throwOnError: false,
    strict: 'ignore',
    trust: false,
  })
  if (display) {
    return (
      <div className="am-display" dangerouslySetInnerHTML={{ __html: html }} />
    )
  }
  if (tail) {
    return (
      <span style={{ whiteSpace: 'nowrap' }}>
        <span dangerouslySetInnerHTML={{ __html: html }} />
        {tail}
      </span>
    )
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}
