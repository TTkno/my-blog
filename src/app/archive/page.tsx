import Link from "next/link"
import { getAllPosts } from "@/lib/posts"

export default function ArchivePage() {
  const posts = getAllPosts()

  const groups = new Map<string, typeof posts>()
  posts.forEach((p) => {
    const year = (p.meta.date ?? "").slice(0, 4) || "Unknown"
    groups.set(year, [...(groups.get(year) ?? []), p])
  })

  const years = Array.from(groups.keys()).sort((a, b) => (a < b ? 1 : -1))

  return (
    <div className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <h1 className="text-xl font-semibold">歸檔</h1>

      <div className="mt-6 space-y-8">
        {years.map((y) => (
          <section key={y}>
            <div className="text-sm font-semibold opacity-80">{y}</div>
            <ul className="mt-3 space-y-2">
              {(groups.get(y) ?? []).map(({ slug, meta }) => (
                <li key={slug} className="flex items-center justify-between gap-4">
                  <Link className="underline" href={`/blog/${slug}`}>
                    {meta.title}
                  </Link>
                  <span className="text-xs opacity-60">{meta.date}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
