import { getAllPosts } from "@/lib/posts"
import { site } from "@/site"

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000"

function esc(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

function toRfc822(dateStr: string) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return new Date().toUTCString()
  return d.toUTCString()
}

export async function GET() {
  const posts = getAllPosts()
    .filter((p) => !(p.meta.draft && process.env.NODE_ENV === "production"))
    .slice(0, 200)

  const items = posts
    .map((p) => {
      const url = `${baseUrl}/blog/${encodeURIComponent(p.slug)}`
      const title = esc(p.meta.title ?? p.slug)
      const desc = esc(p.meta.description ?? site.subtitle ?? "")
      const pubDate = toRfc822(p.meta.date)

      const categories = (p.meta.tags ?? [])
        .map((t) => `<category>${esc(String(t))}</category>`)
        .join("")

      return `
<item>
  <title>${title}</title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  <pubDate>${pubDate}</pubDate>
  <description>${desc}</description>
  ${categories}
</item>`.trim()
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(`${site.name} · CP Blog`)}</title>
    <link>${baseUrl}</link>
    <description>${esc(site.subtitle ?? "")}</description>
    <language>zh-Hans</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
