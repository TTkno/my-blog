"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type Item = { slug: string; title: string; date: string }
type Grouped = Record<string, Item[]>

function groupByYear(posts: Item[]) {
  const map: Grouped = {}
  for (const p of posts) {
    const y = (p.date || "").slice(0, 4) || "Unknown"
    map[y] ??= []
    map[y].push(p)
  }
  const years = Object.keys(map).sort((a, b) => (a < b ? 1 : -1))
  for (const y of years) {
    map[y].sort((a, b) => (a.date < b.date ? 1 : -1))
  }
  return { map, years }
}

const DOT_TOP_OFFSET = 5 // 年份圆点中心相对 section 顶部的偏移（约 h-2.5 一半 + 一点）

export function ArchiveTimeline({ items }: { items: Item[] }) {
  const { map, years } = useMemo(() => groupByYear(items), [items])
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [progressHeight, setProgressHeight] = useState(0)

  const updateActiveAndProgress = useCallback(() => {
    const container = containerRef.current
    if (!container || years.length === 0) return

    const containerRect = container.getBoundingClientRect()
    const viewportMid = typeof window !== "undefined" ? window.innerHeight * 0.35 : 0

    let newActive = 0
    for (let i = 0; i < sectionRefs.current.length; i++) {
      const el = sectionRefs.current[i]
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (rect.top <= viewportMid) newActive = i
    }

    setActiveIndex(newActive)

    const activeEl = sectionRefs.current[newActive]
    if (activeEl) {
      const containerTop = containerRect.top
      const activeTop = activeEl.getBoundingClientRect().top
      const h = Math.max(0, activeTop - containerTop + DOT_TOP_OFFSET)
      setProgressHeight(h)
    }
  }, [years.length])

  useEffect(() => {
    const rafId = requestAnimationFrame(() => updateActiveAndProgress())
    window.addEventListener("scroll", updateActiveAndProgress, { passive: true })
    window.addEventListener("resize", updateActiveAndProgress)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("scroll", updateActiveAndProgress)
      window.removeEventListener("resize", updateActiveAndProgress)
    }
  }, [updateActiveAndProgress])

  if (items.length === 0) {
    return (
      <p className="mt-8 text-sm" style={{ color: "rgb(var(--muted))" }}>
        暂无文章
      </p>
    )
  }

  return (
    <div ref={containerRef} className="relative pl-6 md:pl-12">
      {/* 背景竖线 */}
      <div
        className="absolute left-3 md:left-6 top-0 bottom-0 w-px transition-[height] duration-150"
        style={{ background: "rgb(var(--border))" }}
        aria-hidden
      />
      {/* 跟随进度：从顶部到当前年份圆心的竖线 */}
      <div
        className="absolute left-3 md:left-6 top-0 w-px transition-[height] duration-150 ease-out"
        style={{
          height: progressHeight,
          background: "rgb(var(--accent))",
        }}
        aria-hidden
      />

      {years.map((y, i) => (
        <section
          key={y}
          ref={(el) => {
            sectionRefs.current[i] = el
          }}
          className="mb-8 md:mb-12 relative scroll-mt-24"
        >
          <span
            className="absolute -left-3 md:-left-6 top-0 h-2.5 w-2.5 rounded-full border-2 border-[rgb(var(--surface))] transition-colors duration-150"
            style={{
              background: i === activeIndex ? "rgb(var(--accent))" : "rgb(var(--border))",
            }}
            aria-hidden
          />

          <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-3 md:mb-4" style={{ color: "rgb(var(--text))" }}>
            {y}
          </h2>

          <ul className="mt-2 space-y-4" role="list">
            {(map[y] ?? []).map((p) => {
              const mmdd = (p.date || "").slice(5) || ""
              return (
                <li key={p.slug} className="relative">
                  <span
                    className="absolute -left-3 md:-left-6 top-3 h-1.5 w-1.5 rounded-full"
                    style={{ background: "rgb(var(--border))" }}
                  />

                  <div className="flex items-baseline gap-2 md:gap-4 min-w-0">
                    <span className="shrink-0 w-10 md:w-14 text-xs md:text-sm tabular-nums" style={{ color: "rgb(var(--muted))" }}>
                      {mmdd}
                    </span>
                    <Link
                      className="min-w-0 truncate text-sm md:text-base transition-colors hover:opacity-80"
                      href={`/blog/${p.slug}`}
                      style={{ color: "rgb(var(--text))" }}
                    >
                      {p.title}
                    </Link>
                    <span className="hidden sm:block flex-1 min-w-4 border-b border-dashed shrink-0" style={{ borderColor: "rgb(var(--border) / 0.5)" }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
