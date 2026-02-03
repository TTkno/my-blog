"use client"

import { useState } from "react"
import Image from "next/image"
import { site } from "@/site"
import { TableOfContentsClient } from "@/components/TableOfContentsClient"
import type { TocItem } from "@/components/TableOfContents"

type TabId = "intro" | "article"

export function ArticleSidebarCard({
  toc,
  postCount,
  tagCount,
}: {
  toc: TocItem[]
  postCount: number
  tagCount: number
}) {
  const [tab, setTab] = useState<TabId>("article")

  return (
    <div className="card overflow-hidden p-0" style={{ isolation: "isolate" }}>
      {/* Tab 切换：简约样式 */}
      <div
        className="flex border-b"
        style={{ borderColor: "rgb(var(--border))" }}
      >
        <button
          type="button"
          onClick={() => setTab("intro")}
          className="flex-1 py-2 text-sm font-medium transition-colors rounded-t-lg"
          style={{
            color: tab === "intro" ? "rgb(var(--accent))" : "rgb(var(--muted))",
            background: tab === "intro" ? "rgb(var(--surface2) / 0.5)" : "transparent",
            borderBottom: tab === "intro" ? "2px solid rgb(var(--accent))" : "2px solid transparent",
          }}
        >
          介绍
        </button>
        <button
          type="button"
          onClick={() => setTab("article")}
          className="flex-1 py-2 text-sm font-medium transition-colors rounded-t-lg"
          style={{
            color: tab === "article" ? "rgb(var(--accent))" : "rgb(var(--muted))",
            background: tab === "article" ? "rgb(var(--surface2) / 0.5)" : "transparent",
            borderBottom: tab === "article" ? "2px solid rgb(var(--accent))" : "2px solid transparent",
          }}
        >
          目录
        </button>
      </div>

      <div className="p-4">
        {tab === "intro" ? (
          <>
            <div className="flex items-center gap-3">
              <div
                className="shrink-0 overflow-hidden rounded-full border"
                style={{ borderColor: "rgb(var(--border))" }}
              >
                <Image
                  src={site.avatar || "/avatar.png"}
                  alt={site.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 object-cover object-center"
                />
              </div>
              <div className="min-w-0">
                <div className="truncate text-base font-semibold tracking-tight" style={{ color: "rgb(var(--text))" }}>
                  {site.name}
                </div>
                <div className="mt-0.5 line-clamp-2 text-xs" style={{ color: "rgb(var(--muted))" }}>{site.subtitle}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-center">
                <div className="text-lg font-semibold" style={{ color: "rgb(var(--text))" }}>{postCount}</div>
                <div className="mt-0.5 text-xs" style={{ color: "rgb(var(--muted))" }}>文章</div>
              </div>
              <div className="h-8 w-px" style={{ background: "rgb(var(--border))" }} />
              <div className="text-center">
                <div className="text-lg font-semibold" style={{ color: "rgb(var(--text))" }}>{tagCount}</div>
                <div className="mt-0.5 text-xs" style={{ color: "rgb(var(--muted))" }}>标签</div>
              </div>
            </div>
            {(site.socials?.length ?? 0) > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold tracking-wide" style={{ color: "rgb(var(--muted))" }}>Social</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {site.socials!.map((s) => (
                    <a
                      key={s.href}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border px-3 py-1.5 text-xs hover:opacity-90"
                      style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--surface2))" }}
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {(site.links?.length ?? 0) > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold tracking-wide" style={{ color: "rgb(var(--muted))" }}>Links</div>
                <div className="mt-2 flex flex-col gap-2">
                  {site.links!.map((s) => (
                    <a
                      key={s.href}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border px-3 py-2 text-sm hover:opacity-90"
                      style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--surface2))" }}
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {toc.length > 0 ? (
              <TableOfContentsClient items={toc} embedded hideTitle />
            ) : (
              <p className="text-sm" style={{ color: "rgb(var(--muted))" }}>本文无目录</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
