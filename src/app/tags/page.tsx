import Link from "next/link"
import { getAllPosts } from "@/lib/posts"
import { resolveTagToCanonical, getCanonicalDisplayName } from "@/lib/tagAliases"

export default function TagsPage() {
  const posts = getAllPosts()

  const counter = new Map<string, number>()
  for (const p of posts) {
    for (const raw of p.meta.tags ?? []) {
      const canonical = resolveTagToCanonical(raw)
      if (!canonical) continue
      counter.set(canonical, (counter.get(canonical) ?? 0) + 1)
    }
  }

  const list = Array.from(counter.entries())
    .map(([canonical, count]) => ({
      canonical,
      display: getCanonicalDisplayName(canonical),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.display.localeCompare(b.display))

  const counts = list.map((l) => l.count)
  const minCount = counts.length ? Math.min(...counts) : 0
  const maxCount = counts.length ? Math.max(...counts) : 0
  const range = maxCount - minCount || 1

  // 根据数量映射到 0..1，用于字号与颜色
  const ratio = (count: number) => (count - minCount) / range

  // 字号：数量少 -> 小，数量多 -> 大（约 0.75rem ~ 1.75rem）
  const fontSize = (count: number) => {
    const r = ratio(count)
    const rem = 0.75 + r * 1
    return `${rem}rem`
  }

  // 颜色深浅：数量少 -> 浅（opacity 低），数量多 -> 深（opacity 高），用主题色
  const opacity = (count: number) => {
    const r = ratio(count)
    return 0.45 + r * 0.55
  }

  return (
    <div className="card p-6 sm:p-8">
      <h1 className="text-xl font-semibold tracking-tight text-center" style={{ color: "rgb(var(--text))" }}>
        标签
      </h1>
      <p className="mt-2 text-center text-sm" style={{ color: "rgb(var(--muted))" }}>
        目前共有 {list.length} 个标签
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-3 items-baseline">
        {list.map(({ canonical, display, count }) => (
          <Link
            key={canonical}
            href={`/tags/${encodeURIComponent(canonical)}`}
            className="group relative inline-block px-1 transition-all duration-200 ease-out hover:!opacity-100 hover:scale-105 hover:brightness-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[rgb(var(--ring))]"
            title={`${count} 篇`}
            style={{
              fontSize: fontSize(count),
              color: "rgb(var(--text))",
              opacity: opacity(count),
            }}
          >
            <span className="relative">
              {display}
              <span
                className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-current transition-all duration-300 ease-out group-hover:w-full"
                aria-hidden
              />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}