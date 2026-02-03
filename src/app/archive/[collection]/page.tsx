import Link from "next/link"
import type { Metadata } from "next"
import { getAllPosts } from "@/lib/posts"

type Props = { params: Promise<{ collection: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params
  return { title: `归档：${decodeURIComponent(collection)}` }
}

export default async function ArchiveCollectionPage({ params }: Props) {
  const { collection } = await params
  const decoded = decodeURIComponent(collection)

  const posts = getAllPosts().filter(
    (p) => (p.meta.collection ?? "文章") === decoded
  )

  const groups = new Map<string, typeof posts>()
  posts.forEach((p) => {
    const year = (p.meta.date ?? "").slice(0, 4) || "Unknown"
    groups.set(year, [...(groups.get(year) ?? []), p])
  })
  const years = Array.from(groups.keys()).sort((a, b) => (a < b ? 1 : -1))

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "rgb(var(--text))" }}>
          {decoded}
        </h1>
        <Link className="text-sm transition-colors hover:opacity-80" href="/archives" style={{ color: "rgb(var(--muted))" }}>
          ← 全部归档
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-8 text-sm" style={{ color: "rgb(var(--muted))" }}>
          暂无文章
        </p>
      ) : (
        <div className="relative mt-8 pl-6 md:pl-12">
          <div className="absolute left-3 md:left-6 top-0 bottom-0 w-px" style={{ background: "rgb(var(--border))" }} />
          {years.map((y) => (
            <section key={y} className="mb-8 md:mb-12 relative">
              <span className="absolute -left-3 md:-left-6 top-0 h-2.5 w-2.5 rounded-full" style={{ background: "rgb(var(--accent))" }} />
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-3 md:mb-4" style={{ color: "rgb(var(--text))" }}>
                {y}
              </h2>
              <ul className="mt-2 space-y-4" role="list">
                {(groups.get(y) ?? []).map(({ slug, meta }) => (
                  <li key={slug} className="relative">
                    <span className="absolute -left-3 md:-left-6 top-3 h-1.5 w-1.5 rounded-full" style={{ background: "rgb(var(--border))" }} />
                    <div className="flex items-baseline gap-2 md:gap-4 min-w-0">
                      <span className="shrink-0 w-10 md:w-14 text-xs md:text-sm tabular-nums" style={{ color: "rgb(var(--muted))" }}>
                        {(meta.date ?? "").slice(5) || ""}
                      </span>
                      <Link className="min-w-0 truncate text-sm md:text-base transition-colors hover:opacity-80" href={`/blog/${slug}`} style={{ color: "rgb(var(--text))" }}>
                        {meta.title}
                      </Link>
                      <span className="hidden sm:block flex-1 min-w-4 border-b border-dashed shrink-0" style={{ borderColor: "rgb(var(--border) / 0.5)" }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
