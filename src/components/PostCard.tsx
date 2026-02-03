import Link from "next/link"
import type { PostListItem } from "@/lib/posts"

// 根据 tag 返回不同的颜色主题（文本 + 背景）
function getTagColor(tag: string): { text: string; bg: string; border: string } {
  const hash = tag
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colors = [
    { text: "rgb(59, 130, 246)", bg: "rgba(59, 130, 246, 0.10)", border: "rgba(59, 130, 246, 0.35)" }, // blue
    { text: "rgb(168, 85, 247)", bg: "rgba(168, 85, 247, 0.10)", border: "rgba(168, 85, 247, 0.35)" }, // purple
    { text: "rgb(244, 63, 94)", bg: "rgba(244, 63, 94, 0.10)", border: "rgba(244, 63, 94, 0.35)" }, // pink
    { text: "rgb(34, 197, 94)", bg: "rgba(34, 197, 94, 0.10)", border: "rgba(34, 197, 94, 0.35)" }, // green
    { text: "rgb(249, 115, 22)", bg: "rgba(249, 115, 22, 0.10)", border: "rgba(249, 115, 22, 0.35)" }, // orange
    { text: "rgb(8, 145, 178)", bg: "rgba(8, 145, 178, 0.10)", border: "rgba(8, 145, 178, 0.35)" }, // cyan
  ]
  return colors[hash % colors.length]
}

export function PostCard({ post }: { post: PostListItem }) {
  const { slug, meta } = post

  return (
    <Link
      href={`/blog/${slug}`}
      className="group block overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg"
      style={{
        borderColor: "rgb(var(--border))",
        background: "rgb(var(--surface))",
      }}
    >
      {/* 顶部装饰渐变线 */}
      <div
        className="h-1 w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, rgb(var(--accent)), rgb(var(--accent2)), transparent)`,
        }}
      />

      <div className="p-5">
        {/* 日期 + Collection Tag */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs muted">{meta.date}</span>
          {meta.collection && (
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                background: "rgb(var(--accent) / 0.12)",
                color: "rgb(var(--accent))",
                border: "1px solid rgb(var(--accent) / 0.18)",
              }}
            >
              {meta.collection}
            </span>
          )}
        </div>

        {/* 标题：悬停时变为主题色 */}
        <h3
          className="group-hover-accent mt-3 text-lg font-semibold tracking-tight transition-colors duration-200"
          style={{ color: "rgb(var(--text))" }}
        >
          {meta.title}
        </h3>

        {/* 描述：两行截断 */}
        {meta.description && (
          <p className="mt-2 line-clamp-2 text-sm muted">
            {meta.description}
          </p>
        )}

        {/* 标签：彩色方案 */}
        {(meta.tags?.length ?? 0) > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {(meta.tags ?? []).slice(0, 5).map((t) => {
              const color = getTagColor(t)
              return (
                <span
                  key={t}
                  className="rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-200"
                  style={{
                      color: color.text,
                      background: color.bg,
                      borderColor: color.border,
                    }}
                >
                  #{t}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* 底部微妙渐变 */}
      <div
        className="h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(var(--border)), transparent)",
        }}
      />
    </Link>
  )
}
