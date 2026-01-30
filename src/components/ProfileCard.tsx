import Image from "next/image"
import { site } from "@/site"

export function ProfileCard({
  postCount,
  tagCount,
}: {
  postCount: number
  tagCount: number
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-4">
        {/* ✅ 圆形头像：不用 fill，避免被全局 img 样式干扰 */}
        <div
          className="shrink-0 overflow-hidden rounded-full border"
          style={{ borderColor: "rgb(var(--border))" }}
        >
          <Image
            src={site.avatar || "/avatar.png"}
            alt={site.name}
            width={64}
            height={64}
            priority
            className="h-16 w-16 object-cover object-center"
          />
        </div>

        <div className="min-w-0">
          <div className="truncate text-lg font-semibold tracking-tight">
            {site.name}
          </div>
          <div className="mt-1 line-clamp-2 text-sm muted">{site.subtitle}</div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-center">
          <div className="text-xl font-semibold">{postCount}</div>
          <div className="mt-1 text-xs muted">文章</div>
        </div>

        <div className="h-10 w-px" style={{ background: "rgb(var(--border))" }} />

        <div className="text-center">
          <div className="text-xl font-semibold">{tagCount}</div>
          <div className="mt-1 text-xs muted">标签</div>
        </div>
      </div>

      {(site.socials?.length ?? 0) > 0 ? (
        <div className="mt-6">
          <div className="text-xs font-semibold tracking-wide muted">Social</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {site.socials!.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border px-3 py-1.5 text-xs hover:opacity-90"
                style={{
                  borderColor: "rgb(var(--border))",
                  background: "rgb(var(--surface2))",
                }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {(site.links?.length ?? 0) > 0 ? (
        <div className="mt-6">
          <div className="text-xs font-semibold tracking-wide muted">Links</div>
          <div className="mt-3 flex flex-col gap-2">
            {site.links!.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border px-4 py-3 text-sm hover:opacity-90"
                style={{
                  borderColor: "rgb(var(--border))",
                  background: "rgb(var(--surface2))",
                }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
