"use client"

import { useEffect, useMemo, useState } from "react"
import type { TocItem } from "@/components/TableOfContents"

export function TableOfContentsClient({
  items,
  embedded,
}: {
  items: TocItem[]
  /** 嵌入合并卡片内时不单独包一层 card */
  embedded?: boolean
}) {
  const [active, setActive] = useState<string>("")

  const ids = useMemo(() => items.map((i) => i.id), [items])

  useEffect(() => {
    if (!ids.length) return

    const headings = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]

    if (!headings.length) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop
          )
        if (visible[0]) setActive((visible[0].target as HTMLElement).id)
      },
      {
        rootMargin: "-96px 0px -70% 0px",
        threshold: 0.01,
      }
    )

    headings.forEach((h) => io.observe(h))
    return () => io.disconnect()
  }, [ids])

  if (!items.length) return null

  const wrapperClassName = embedded ? "" : "card p-4"
  const titleClassName = embedded ? "text-xs font-semibold text-gray-900 mb-2" : "text-sm font-semibold mb-3"

  return (
    <div className={wrapperClassName}>
      <div className={titleClassName}>目录</div>
      <nav
        className="space-y-0.5 text-sm max-h-[50vh] overflow-y-auto"
        aria-label="文章目录"
      >
        <ul className="space-y-0.5">
          {items.map((it) => {
            const isActive = it.id === active
            const depthClass =
              it.depth === 2 ? "pl-0" : it.depth === 3 ? "pl-3" : "pl-5"
            return (
              <li key={it.id} className={depthClass}>
                <a
                  href={`#${it.id}`}
                  className={[
                    "block rounded-md px-2 py-1.5 text-left transition-colors border-l-2",
                    isActive
                      ? "text-gray-900 font-medium"
                      : "text-gray-600 hover:bg-black/5 hover:text-gray-800 border-transparent",
                  ].join(" ")}
                  style={
                    isActive
                      ? { borderLeftColor: "rgb(var(--accent))", background: "rgb(var(--accent) / 0.1)" }
                      : undefined
                  }
                  onClick={() => setActive(it.id)}
                >
                  <span className="line-clamp-1">{it.text}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
