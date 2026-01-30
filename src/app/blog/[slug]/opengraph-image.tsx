import { ImageResponse } from "next/og"
import { site } from "@/site"
import { getPostBySlug } from "@/lib/posts"

export const runtime = "nodejs"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

function chipStyle(bg: string, bd: string) {
  return {
    padding: "10px 14px",
    borderRadius: 999,
    background: bg,
    border: `1px solid ${bd}`,
    fontSize: 14,
    fontWeight: 700,
    whiteSpace: "nowrap" as const,
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let title = slug
  let date = ""
  let tags: string[] = []
  let desc = site.subtitle

  try {
    const { meta } = getPostBySlug(slug)
    title = meta.title || slug
    date = meta.date || ""
    tags = (meta.tags || []).slice(0, 5)
    desc = meta.description || desc
  } catch {
    // slug 不存在时也给个图，避免报错炸掉
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #ffffff 0%, #f4f7ff 45%, #f7fff9 100%)",
          color: "#0b1220",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
            <div style={chipStyle("rgba(16,185,129,0.12)", "rgba(16,185,129,0.25)")}>
              {site.name}
            </div>
            {date ? (
              <div style={chipStyle("rgba(15,23,42,0.06)", "rgba(15,23,42,0.12)")}>
                {date}
              </div>
            ) : null}
            {tags.map((t) => (
              <div key={t} style={chipStyle("rgba(59,130,246,0.10)", "rgba(59,130,246,0.22)")}>
                #{t}
              </div>
            ))}
          </div>

          <div style={{ fontSize: 56, fontWeight: 900, letterSpacing: -1, lineHeight: 1.1 }}>
            {title}
          </div>

          <div style={{ fontSize: 22, opacity: 0.7, lineHeight: 1.35 }}>
            {desc}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ fontSize: 16, opacity: 0.65 }}>
            /blog/{slug}
          </div>
          <div style={{ fontSize: 16, opacity: 0.65 }}>
            {process.env.NEXT_PUBLIC_SITE_URL || ""}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
