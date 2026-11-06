interface Props {
  label: string
  id?: string
}

// Section heading: a bold serif title with a faint "#" anchor hanging in the left margin.
export default function SectionTitle({ label, id }: Props) {
  return (
    <h2 id={id} className="am-h2 scroll-mt-24">
      {id ? (
        <a href={`#${id}`} className="am-h2-anchor" aria-label={`Link to section: ${label}`}>
          #
        </a>
      ) : null}
      {label}
    </h2>
  )
}
