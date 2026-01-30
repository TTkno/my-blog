"use client"

import { useState } from "react"
import Image from "next/image"
import { site } from "@/site"
import type { PostMeta } from "@/lib/posts"
import type { TocItem } from "@/components/TableOfContents"
import { TableOfContentsClient } from "@/components/TableOfContentsClient"

type Tab = "article" | "profile"

export function PostSidebarCard({
  postCount,
  tagCount,
  meta,
  toc,
  readMinutes,
}: {
  postCount: number
  tagCount: number
  meta: PostMeta
  toc: TocItem[]
  readMinutes: number
}) {
  const [tab, setTab] = useState<Tab>("article")

  return (
    <div
      className="sticky top-6 rounded-xl border shadow-sm overflow-hidden"
      style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--surface))" }}
    >
      {/* 切换标签 */}
      <div
        className="flex border-b text-sm"
        style={{ borderColor: "rgb(var(--border))" }}
      >
        <button
          type="button"
          onClick={() => setTab("article")}
          className={[
            "flex-1 py-2.5 px-3 font-medium transition",
            tab === "article"
              ? "text-gray-900 border-b-2"
              : "muted hover:text-gray-700",
          ].join(" ")}
          style={
            tab === "article"
              ? { borderBottomColor: "rgb(var(--accent))" }
              : undefined
          }
        >
          文章 · 目录
        </button>
        <button
          type="button"
          onClick={() => setTab("profile")}
          className={[
            "flex-1 py-2.5 px-3 font-medium transition",
            tab === "profile"
              ? "text-gray-900 border-b-2"
              : "muted hover:text-gray-700",
          ].join(" ")}
          style={
            tab === "profile"
              ? { borderBottomColor: "rgb(var(--accent))" }
              : undefined
          }
        >
          个人
        </button>
      </div>

      <div className="p-4 min-h-[200px]">
        {tab === "article" && (
          <div className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="muted">发布时间</span>
                <span className="font-medium text-gray-900">{meta.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="muted">阅读时间</span>
                <span className="font-medium text-gray-900">{readMinutes} 分钟</span>
              </div>
              {meta.updated && meta.updated !== meta.date && (
                <div className="flex justify-between">
                  <span className="muted">最后更新</span>
                  <span className="font-medium text-gray-900">{meta.updated}</span>
                </div>
              )}
              {meta.draft && (
                <div className="flex justify-between items-center">
                  <span className="muted">状态</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs">草稿</span>
                </div>
              )}
            </div>

            {meta.tags?.length ? (
              <div>
                <div className="text-xs muted mb-1.5">标签</div>
                <div className="flex flex-wrap gap-1.5">
                  {meta.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md text-xs border"
                      style={{
                        borderColor: "rgb(var(--border))",
                        background: "rgb(var(--surface2))",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {toc.length > 0 && (
              <div className="pt-3 border-t" style={{ borderColor: "rgb(var(--border))" }}>
                <TableOfContentsClient items={toc} embedded />
              </div>
            )}
          </div>
        )}

        {tab === "profile" && (
          <div className="space-y-4">
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
                <div className="font-semibold text-gray-900">{site.name}</div>
                <div className="mt-0.5 line-clamp-2 text-xs muted">{site.subtitle}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-gray-900">{postCount}</span>
              <span className="muted">文章</span>
              <span className="h-3 w-px" style={{ background: "rgb(var(--border))" }} />
              <span className="font-semibold text-gray-900">{tagCount}</span>
              <span className="muted">标签</span>
            </div>

            {(site.socials?.length ?? 0) > 0 && (
              <div>
                <div className="text-xs font-medium muted mb-1.5">Social</div>
                <div className="flex flex-wrap gap-1.5">
                  {site.socials!.map((s) => (
                    <a
                      key={s.href}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border px-2.5 py-1 text-xs hover:opacity-90"
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
            )}

            {(site.links?.length ?? 0) > 0 && (
              <div>
                <div className="text-xs font-medium muted mb-1.5">Links</div>
                <div className="flex flex-col gap-1">
                  {site.links!.map((s) => (
                    <a
                      key={s.href}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border px-2.5 py-1.5 text-xs hover:opacity-90"
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
            )}
          </div>
        )}
      </div>
    </div>
  )
}
