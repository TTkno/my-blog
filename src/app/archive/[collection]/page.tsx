import Link from "next/link"
import { getAllPosts } from "@/lib/posts"

export default async function ArchiveCollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>
}) {
  const { collection } = await params
  const decoded = decodeURIComponent(collection)

  const posts = getAllPosts().filter(
    (p) => (p.meta.collection ?? "文章") === decoded
  )

  // 按年份分组
  const groups = new Map<string, typeof posts>()
  posts.forEach((p) => {
    const year = (p.meta.date ?? "").slice(0, 4) || "Unknown"
    groups.set(year, [...(groups.get(year) ?? []), p])
  })
  const years = Array.from(groups.keys()).sort((a, b) => (a < b ? 1 : -1))

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h1 className="text-xl font-semibold">归档：{decoded}</h1>

      <div className="mt-6 space-y-8">
        {years.map((y) => (
          <section key={y}>
            <div className="text-sm font-semibold text-zinc-300">{y}</div>
            <ul className="mt-3 space-y-2">
              {(groups.get(y) ?? []).map(({ slug, meta }) => (
                <li key={slug} className="flex items-center justify-between gap-4">
                  <Link className="underline" href={`/blog/${slug}`}>
                    {meta.title}
                  </Link>
                  <span className="text-xs text-zinc-500">{meta.date}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
