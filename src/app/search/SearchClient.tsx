"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import type { PostListItem } from "@/lib/posts"

export function SearchClient({ posts }: { posts: PostListItem[] }) {
  const [q, setQ] = useState("")

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return posts

    return posts.filter((p) => {
      const title = (p.meta.title ?? "").toLowerCase()
      const tags = (p.meta.tags ?? []).join(" ").toLowerCase()
      const desc = (p.meta.description ?? "").toLowerCase()
      return title.includes(s) || tags.includes(s) || desc.includes(s)
    })
  }, [q, posts])

  return (
    <div className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <h1 className="text-xl font-semibold">搜尋</h1>

      <input
        value={q}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
        placeholder="輸入關鍵字（標題 / tags / description）"
        className="mt-4 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500/50 dark:border-white/10 dark:bg-white/[0.03]"
      />

      <ul className="mt-6 space-y-3">
        {filtered.map(({ slug, meta }) => (
          <li
            key={slug}
            className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <Link className="underline" href={`/blog/${slug}`}>
              {meta.title}
            </Link>
            <div className="mt-1 text-xs opacity-60">{meta.date}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
