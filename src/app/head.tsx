import { site } from "@/site"

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000"

export default function Head() {
  return (
    <>
      <link
        rel="alternate"
        type="application/rss+xml"
        title={`${site.name} RSS`}
        href={`${baseUrl}/rss.xml`}
      />
      <link
        rel="alternate"
        type="application/feed+json"
        title={`${site.name} JSON Feed`}
        href={`${baseUrl}/feed.json`}
      />
    </>
  )
}
