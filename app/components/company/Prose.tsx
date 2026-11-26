import Link from 'next/link'

export function Section({ id, title, children }: { id?: string; title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="co-section">
      <h2 className="co-h2">{title}</h2>
      {children}
    </section>
  )
}

export function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} className="co-h2">{children}</h2>
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="co-h3">{children}</h3>
}

export function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="co-bullets">
      {items.map((item, i) => <li key={i}><span>{item}</span></li>)}
    </ul>
  )
}

export function Note({ children }: { children: React.ReactNode }) {
  return <div className="co-note">{children}</div>
}

export function Rows({ children }: { children: React.ReactNode }) {
  return <ul className="co-rows">{children}</ul>
}

interface RowProps {
  title: React.ReactNode
  text?: React.ReactNode
  end?: React.ReactNode
  endNote?: React.ReactNode
  href?: string
  external?: boolean
}

export function Row({ title, text, end, endNote, href, external }: RowProps) {
  const main = (
    <div className="co-row-main">
      <p className="co-row-title">{title}</p>
      {text && <p className="co-row-text">{text}</p>}
    </div>
  )
  const tail = (end || endNote) && (
    <div className="co-row-end">
      {end}
      {endNote && <small>{endNote}</small>}
    </div>
  )

  if (!href) return <li className="co-row">{main}{tail}</li>

  return (
    <li className="co-row co-row--link">
      {external
        ? <a className="co-rowlink" href={href} target="_blank" rel="noopener noreferrer">{main}{tail}</a>
        : <Link className="co-rowlink" href={href}>{main}{tail}</Link>}
    </li>
  )
}
