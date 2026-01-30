import { getAllPosts } from "@/lib/posts"
import { site } from "@/site"

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000"

export async function GET() {
  const posts = getAllPosts()
    .filter((p) => !(p.meta.draft && process.env.NODE_ENV === "production"))
    .slice(0, 200)

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: `${site.name} · CP Blog`,
    home_page_url: baseUrl,
    feed_url: `${baseUrl}/feed.json`,
    description: site.subtitle,
    items: posts.map((p) => ({
      id: `${baseUrl}/blog/${encodeURIComponent(p.slug)}`,
      url: `${baseUrl}/blog/${encodeURIComponent(p.slug)}`,
      title: p.meta.title ?? p.slug,
      summary: p.meta.description ?? "",
      date_published: new Date(p.meta.date).toISOString(),
      tags: p.meta.tags ?? [],
    })),
  }

  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
