import type { MetadataRoute } from "next"
import { getAllPosts } from "@/lib/posts"

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000"

const BAD = new Set(["", "undefined", "null", "nan"])

function safeDate(input: unknown): Date {
  const s = String(input ?? "").trim()
  // 允许 YYYY-MM-DD 这种格式；无效就回退到当前时间
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? new Date() : d
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()

  // 静态页面
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/tags`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/archives`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/search`, changeFrequency: "monthly", priority: 0.4 },
  ]

  // 文章页
  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${baseUrl}/blog/${encodeURIComponent(p.slug)}`,
    lastModified: safeDate(p.meta.date),
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  // 标签页（去重 + 清洗）
  const tagMap = new Map<string, string>()
  for (const p of posts) {
    for (const t of p.meta.tags ?? []) {
      const raw = String(t ?? "").trim()
      const key = raw.toLowerCase()
      if (BAD.has(key)) continue
      if (!tagMap.has(key)) tagMap.set(key, raw)
    }
  }

  const tagRoutes: MetadataRoute.Sitemap = Array.from(tagMap.values()).map(
    (t) => ({
      url: `${baseUrl}/tags/${encodeURIComponent(t)}`,
      changeFrequency: "weekly",
      priority: 0.6,
    })
  )

  return [...staticRoutes, ...postRoutes, ...tagRoutes]
}
