import { ImageResponse } from "next/og"
import { site } from "@/site"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const runtime = "nodejs"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = `${site.name} · ${site.subtitle}`

export default async function Image() {
  let avatarSrc: string | null = null
  try {
    const buf = await readFile(join(process.cwd(), "public", "avatar.png"))
    avatarSrc = `data:image/png;base64,${buf.toString("base64")}`
  } catch {}

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
          background: "linear-gradient(135deg, #ffffff 0%, #f3f6ff 45%, #f7fff9 100%)",
          color: "#0b1220",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarSrc} width={72} height={72} style={{ borderRadius: 18 }} alt="" />
          ) : null}

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.5 }}>
              {site.name}
            </div>
            <div style={{ fontSize: 18, opacity: 0.75, marginTop: 6 }}>
              {site.subtitle}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.25)",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              CP Blog
            </div>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                background: "rgba(59,130,246,0.10)",
                border: "1px solid rgba(59,130,246,0.22)",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Algo · Notes
            </div>
          </div>

          <div style={{ fontSize: 14, opacity: 0.6 }}>
            {process.env.NEXT_PUBLIC_SITE_URL || ""}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
