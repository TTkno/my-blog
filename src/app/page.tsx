import Link from "next/link"
import { getAllPosts } from "@/lib/posts"
import { SidebarContent } from "@/components/SidebarContent"

export default function HomePage() {
  const posts = getAllPosts()
  const latest = posts.slice(0, 10)

  return (
    <div className="grid gap-8">
      {/* 在顶部显示侧边栏内容（导航 + 关于） */}
      <div className="md:hidden">
        <SidebarContent />
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Latest Posts</h1>
        <p className="mt-1 text-sm muted">Aphrodite 的竞程日记 · 记录解题与心得</p>
      </div>

      <div className="space-y-6">
        {latest.map(({ slug, meta }) => {
          const displayDate = meta.date
          const isUpdated = meta.updated && meta.updated !== meta.date

          return (
            <Link
              key={slug}
              href={`/blog/${slug}`}
              className="block group"
            >
              <article
                  className="rounded-lg border p-6 md:p-12 lg:p-16 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 max-w-5xl mx-auto relative overflow-hidden"
                  style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--surface))" }}
                >
                  {/* 装饰渐变背景 */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none" style={{ background: "linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent2)))" }} />

                  <h2 className="text-lg md:text-xl font-semibold text-center" style={{ color: "rgb(var(--text))" }}>
                    {meta.title}
                  </h2>

                  <div className="mt-3 md:mt-4 flex flex-wrap items-center justify-center gap-2 md:gap-4 text-xs md:text-sm muted">
                    <span>{displayDate}</span>
                    {isUpdated ? <span>• 更新: {meta.updated}</span> : null}
                    <span>•</span>
                    <span>{meta.tags?.length ? meta.tags.join(" ") : meta.collection}</span>
                  </div>

                  {meta.description && (
                    <p className="mt-4 md:mt-6 text-xs md:text-sm muted leading-relaxed max-w-4xl mx-auto line-clamp-6 text-center">
                      {meta.description}
                    </p>
                  )}

                  <div className="mt-6 md:mt-8 flex justify-center">
                    <div className="rounded-full border px-6 md:px-8 py-2 md:py-3 text-xs md:text-sm font-medium transition-all duration-200" style={{ borderColor: "rgb(var(--border))" }}>
                      阅读全文 »
                    </div>
                  </div>
              </article>
            </Link>
          )
        })}

        <div className="pt-4">
          <nav className="flex items-center gap-3 text-sm muted">
            <Link href="/page/2" className="hover:underline">下一页</Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
