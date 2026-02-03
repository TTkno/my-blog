import Link from "next/link"
import { getAllPosts } from "@/lib/posts"
import { SidebarContent } from "@/components/SidebarContent"
import { site } from "@/site"

export default function HomePage() {
  const posts = getAllPosts()
  const latest = posts.slice(0, 10)

  return (
    <div className="grid gap-8">
      <div className="md:hidden">
        <SidebarContent />
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Latest Posts</h1>
        <p className="mt-1 text-sm muted">{site.name} · {site.subtitle}</p>
      </div>

      <div className="space-y-5">
        {latest.map(({ slug, meta }) => {
          const displayDate = meta.date
          const isUpdated = meta.updated && meta.updated !== meta.date

          return (
            <Link key={slug} href={`/blog/${slug}`} className="block group">
              <article
                className="card p-6 sm:p-8 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--surface))" }}
              >
                <h2 className="text-lg md:text-xl font-semibold text-center relative" style={{ color: "rgb(var(--text))" }}>
                  {meta.title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs md:text-sm muted">
                  <span>{displayDate}</span>
                  {isUpdated && <span>· 更新: {meta.updated}</span>}
                  <span>·</span>
                  <span>{meta.tags?.length ? meta.tags.join(" ") : meta.collection ?? "—"}</span>
                </div>
                {meta.description && (
                  <p className="mt-4 text-sm muted leading-relaxed max-w-3xl mx-auto line-clamp-4 text-center">
                    {meta.description}
                  </p>
                )}
                <div className="mt-5 flex justify-center">
                  <span className="rounded-full border px-5 py-2 text-sm font-medium transition-colors" style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--text))" }}>
                    阅读全文 »
                  </span>
                </div>
              </article>
            </Link>
          )
        })}

        <nav className="pt-4 text-sm muted" aria-label="文章导航">
          <Link href="/archives" className="hover:underline">更多文章 →</Link>
        </nav>
      </div>
    </div>
  )
}
