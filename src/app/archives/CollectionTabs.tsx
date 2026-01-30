"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

type Collection = { key: string; name: string; count: number }
type Item = {
  slug: string
  title: string
  date: string
  collection: string
}

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

export function CollectionTabs({
  defaultKey,
  collections,
  items,
}: {
  defaultKey: string
  collections: Collection[]
  items: Item[]
}) {
  const [active, setActive] = useState(defaultKey)

  const filtered = useMemo(() => {
    if (active === "default") return items
    return items.filter((x) => x.collection === active)
  }, [active, items])

  const { map, years } = useMemo(() => groupByYear(filtered), [filtered])

  return (
    <div>
      {/* summary */}
      <div className="mb-4 text-sm muted">还行！目前共有 {filtered.length} 篇文章。继续努力。</div>
      {/* tabs */}
      <div className="flex flex-wrap gap-2">
        {collections.map((c) => {
          const isActive = c.key === active
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setActive(c.key)}
              className="rounded-full border px-3 py-1.5 text-sm transition hover:opacity-80"
              style={{
                borderColor: "rgb(var(--border))",
                background: isActive ? "rgb(var(--surface2))" : "transparent",
                color: isActive ? "rgb(var(--text))" : "rgb(var(--muted))",
              }}
            >
              {c.name} <span className="opacity-60">({c.count})</span>
            </button>
          )
        })}
      </div>

      {/* timeline */}
        {filtered.length === 0 ? (
        <p className="mt-8 text-sm muted">这个档案下还没有文章。</p>
      ) : (
        <div className="relative mt-8 pl-6 md:pl-12">
          {/* 竖线 */}
          <div
            className="absolute left-3 md:left-6 top-0 bottom-0 w-px"
            style={{ background: "rgba(0,0,0,0.06)" }}
          />

          {years.map((y) => (
            <section key={y} className="mb-8 md:mb-12 relative">
              {/* year marker dot */}
              <span className="absolute -left-3 md:-left-6 top-0 h-3 w-3 rounded-full" style={{ background: "rgba(0,0,0,0.2)" }} />

              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 md:mb-4">{y}</h2>

              <ul className="mt-2 space-y-4">
                {(map[y] ?? []).map((p) => {
                  const mmdd = (p.date || "").slice(5) || ""
                  return (
                    <li key={p.slug} className="relative">
                      {/* 节点 */}
                      <span
                        className="absolute -left-3 md:-left-6 top-3 h-2 w-2 rounded-full"
                        style={{ background: "rgba(0,0,0,0.12)" }}
                      />

                      <div className="flex items-center gap-2 md:gap-4">
                        <div className="w-10 md:w-14 text-xs md:text-sm muted">{mmdd}</div>

                        <Link className="hover:opacity-90 text-xs md:text-sm" href={`/blog/${p.slug}`}>
                          {p.title}
                        </Link>

                        <div
                          className="hidden sm:flex flex-1 border-b border-dashed"
                          style={{ borderColor: "rgba(0,0,0,0.06)" }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
