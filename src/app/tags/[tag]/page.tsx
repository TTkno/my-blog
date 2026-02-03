import Link from "next/link"
import { getAllPosts } from "@/lib/posts"
import { resolveTagToCanonical, getCanonicalDisplayName } from "@/lib/tagAliases"

export default async function TagTimelinePage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params
  const slug = decodeURIComponent(tag ?? "").trim()
  const canonical = resolveTagToCanonical(slug) || slug.toLowerCase() || ""

  const all = getAllPosts()
  const posts = canonical
    ? all
        .filter((p) =>
          (p.meta.tags ?? []).some((t) => resolveTagToCanonical(t) === canonical)
        )
        .slice()
        .sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1))
    : []

  const display = getCanonicalDisplayName(canonical) || slug || "?"

  // year -> posts
  const map = new Map<string, typeof posts>()
  for (const p of posts) {
    const year = (p.meta.date ?? "").slice(0, 4) || "Unknown"
    map.set(year, [...(map.get(year) ?? []), p])
  }
  const years = Array.from(map.keys()).sort((a, b) => (a < b ? 1 : -1))

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Tag：{display || "?"}</h1>
          <p className="mt-1 text-sm muted">{posts.length} 篇文章</p>
        </div>
        <Link className="text-sm hover:opacity-80" href="/tags">
          ← Back
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-8 text-sm muted">
          这个标签下还没有文章（或标签大小写/空格不一致）。
        </p>
      ) : (
        <div className="relative mt-8 pl-10">
          <div
            className="absolute left-4 top-0 bottom-0 w-px"
            style={{ background: "rgb(var(--border))" }}
          />

          {years.map((y) => (
            <section key={y} className="mb-10">
              <h2 className="text-4xl font-semibold tracking-tight">{y}</h2>

              <ul className="mt-5 space-y-6">
                {(map.get(y) ?? []).map(({ slug, meta }) => {
                  const mmdd = (meta.date ?? "").slice(5)
                  return (
                    <li key={slug} className="relative">
                      <span
                        className="absolute -left-[1.1rem] top-2 h-2 w-2 rounded-full"
                        style={{ background: "rgb(var(--border))" }}
                      />

                      <div className="flex items-center gap-4">
                        <div className="w-14 text-sm muted">{mmdd}</div>
                        <Link className="hover:opacity-80" href={`/blog/${slug}`}>
                          {meta.title}
                        </Link>
                        <div
                          className="flex-1 border-b border-dashed"
                          style={{ borderColor: "rgb(var(--border))" }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
