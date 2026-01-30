import Link from "next/link"
import { CSSProperties } from "react"
import { getAllPosts } from "@/lib/posts"

const BAD = new Set(["", "undefined", "null", "nan"])
const keyOf = (v: unknown) => {
  const s = String(v ?? "").trim()
  const k = s.toLowerCase()
  if (BAD.has(k)) return ""
  return k
}

export default function TagsPage() {
  const posts = getAllPosts()

  // key -> { display, count }
  const counter = new Map<string, { display: string; count: number }>()

  for (const p of posts) {
    for (const raw of p.meta.tags ?? []) {
      const key = keyOf(raw)
      if (!key) continue

      const display = String(raw).trim() || key
      const cur = counter.get(key)
      if (cur) cur.count += 1
      else counter.set(key, { display, count: 1 })
    }
  }

  const list = Array.from(counter.entries())
    .map(([key, v]) => ({ key, display: v.display, count: v.count }))
    .sort((a, b) => b.count - a.count || a.display.localeCompare(b.display))

  // compute size bucket for tag cloud and color depth
  const counts = list.map((l) => l.count)
  const min = Math.min(...(counts.length ? counts : [0]))
  const max = Math.max(...(counts.length ? counts : [0]))
  const bucket = (c: number) => {
    if (max === min) return "text-base"
    const t = Math.round(((c - min) / (max - min)) * 5) // 0..5
    switch (t) {
      case 0:
        return "text-xs"
      case 1:
        return "text-sm"
      case 2:
        return "text-base"
      case 3:
        return "text-lg"
      case 4:
        return "text-xl"
      default:
        return "text-2xl"
    }
  }

  return (
    <div className="card p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-center">categories</h1>
      <p className="mt-2 md:mt-3 text-center text-xs md:text-sm muted">目前共有 {list.length} 个标签</p>

      <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-6 items-baseline">
        {list.map(({ key, display, count }) => {
          const sizeClass = bucket(count)
          const alpha = ((): number => {
            if (max === min) return 0.95
            const ratio = (count - min) / (max - min)
            return +(0.06 + ratio * 0.84).toFixed(2)
          })()
          const hoverAlpha = ((): number => {
            if (max === min) return 0.95
            const ratio = (count - min) / (max - min)
            return +(Math.min(0.95, 0.06 + ratio * 0.9)).toFixed(2)
          })()

          const weight = count === max ? "font-semibold" : "font-normal"
          return (
            <Link
              key={key}
              href={`/tags/${encodeURIComponent(key)}`}
              className={`${sizeClass} ${weight} group relative inline-block px-1 transform transition-all duration-200 ease-out hover:scale-110 hover:opacity-100 cursor-pointer hover:text-[rgba(0,0,0,var(--alpha-hover))]`}
              title={`${count} 篇`}
              style={{
                ["--alpha"]: String(alpha),
                ["--alpha-hover"]: String(hoverAlpha),
                color: `rgba(0,0,0,var(--alpha))`,
                transition: "color 0.2s ease-out, transform 0.2s ease-out, opacity 0.2s ease-out",
              } as CSSProperties}
            >
              <span className="relative">
                {display}
                <span className="absolute bottom-0 left-1/2 w-0 h-px bg-current transform -translate-x-1/2 transition-all duration-300 ease-out group-hover:w-full"></span>
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}