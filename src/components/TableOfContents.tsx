import Link from "next/link"

export type TocItem = {
  id: string
  text: string
  depth: number // 2/3/4...
}

export function TableOfContents({ items }: { items: TocItem[] }) {
  if (!items.length) return null

  return (
    <div className="card p-4">
      <div className="text-sm font-semibold">目录</div>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((it) => (
          <li key={it.id} className={it.depth >= 3 ? "ml-4" : ""}>
            <Link className="muted hover:opacity-80" href={`#${it.id}`}>
              {it.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
