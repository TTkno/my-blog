"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import type { PostListItem } from "@/lib/posts"

const PAGE_SIZE = 10
const easeOut = [0.22, 1, 0.36, 1] as const

export function BlogListClient({ posts }: { posts: PostListItem[] }) {
  const searchParams = useSearchParams()
  const reduced = useReducedMotion()
  const currentPage = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1)
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE))
  const page = Math.min(currentPage, totalPages)
  const start = (page - 1) * PAGE_SIZE
  const pagePosts = posts.slice(start, start + PAGE_SIZE)

  return (
    <div className="card p-6">
      <motion.div
        className="mb-6"
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: easeOut }}
      >
        <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
        <p className="mt-1 muted text-sm">题解 / 模板 / 日记</p>
      </motion.div>

      <ul className="space-y-4">
        {pagePosts.map(({ slug, meta }, i) => (
          <motion.li
            key={slug}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.28,
              ease: easeOut,
              delay: reduced ? 0 : i * 0.04,
            }}
          >
            <Link
              href={`/blog/${slug}`}
              className="block rounded-2xl border p-5 transition hover:opacity-90"
              style={{
                borderColor: "rgb(var(--border))",
                background: "rgb(var(--surface2) / 0.8)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold tracking-tight">
                    {meta.title}
                  </div>
                  <div className="mt-1 muted text-sm">{meta.date}</div>

                  {meta.tags?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {meta.tags.map((t) => (
                        <span key={t} className="chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <span style={{ color: "rgb(var(--accent))" }} className="text-sm">
                  Read →
                </span>
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>

      {/* 分页：上一页 / 下一页 */}
      {totalPages > 1 && (
        <nav
          className="mt-8 flex items-center justify-between gap-4 border-t pt-6"
          style={{ borderColor: "rgb(var(--border))" }}
          aria-label="文章列表分页"
        >
          <span className="text-sm muted">
            第 {page} / {totalPages} 页，共 {posts.length} 篇
          </span>
          <div className="flex items-center gap-3 text-sm">
            {page > 1 ? (
              <Link
                href={page === 2 ? "/blog" : `/blog?page=${page - 1}`}
                className="font-medium hover:underline"
                style={{ color: "rgb(var(--accent))" }}
              >
                ← 上一页
              </Link>
            ) : (
              <span className="muted">← 上一页</span>
            )}
            {page < totalPages ? (
              <Link
                href={`/blog?page=${page + 1}`}
                className="font-medium hover:underline"
                style={{ color: "rgb(var(--accent))" }}
              >
                下一页 →
              </Link>
            ) : (
              <span className="muted">下一页 →</span>
            )}
          </div>
        </nav>
      )}
    </div>
  )
}
