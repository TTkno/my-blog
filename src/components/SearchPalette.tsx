"use client"

import Link from "next/link"
import { useMemo, useEffect, useRef, useState, useCallback } from "react"
import type { KeyboardEvent as ReactKeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import type { PostListItem } from "@/lib/posts"

function isEditableTarget(el: EventTarget | null) {
  if (!el || !(el instanceof HTMLElement)) return false
  const tag = el.tagName.toLowerCase()
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    el.isContentEditable
  )
}

function norm(s: unknown) {
  return String(s ?? "").trim().toLowerCase()
}

function highlight(text: string, q: string) {
  const t = text ?? ""
  const s = q.trim()
  if (!s) return t
  const idx = t.toLowerCase().indexOf(s.toLowerCase())
  if (idx === -1) return t
  const a = t.slice(0, idx)
  const b = t.slice(idx, idx + s.length)
  const c = t.slice(idx + s.length)
  return (
    <>
      {a}
      <mark
        style={{
          background: "rgb(var(--accent) / 0.16)",
          color: "rgb(var(--text))",
          padding: "0 0.15em",
          borderRadius: "0.35em",
        }}
      >
        {b}
      </mark>
      {c}
    </>
  )
}

type PreviewData = {
  excerpt?: string
  title?: string
  date?: string
  tags?: string[]
}

export function SearchPalette({
  posts,
  showButton = true,
}: {
  posts: PostListItem[]
  showButton?: boolean
}) {
  const router = useRouter()

  // open：是否可交互（影响外部点击监听/滚动锁/键盘）
  const [open, setOpen] = useState(false)
  // mounted：是否渲染（用于关闭动画：先淡出再卸载）
  const [mounted, setMounted] = useState(false)

  const [q, setQ] = useState("")
  const [active, setActive] = useState(0)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const cacheRef = useRef<Record<string, PreviewData>>({})
  const panelRef = useRef<HTMLDivElement | null>(null)

  const closeTimerRef = useRef<number | null>(null)

  const hardReset = useCallback(() => {
    setQ("")
    setActive(0)
    setPreview(null)
    setLoadingPreview(false)
  }, [])

  const openPalette = useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setMounted(true)
    setOpen(true)
    setActive(0)
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  const closePalette = useCallback(() => {
    setOpen(false)

    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    // ✅ 关闭动画时长：200ms（和 CSS 一致）
    closeTimerRef.current = window.setTimeout(() => {
      setMounted(false)
      hardReset()
    }, 200)
  }, [hardReset])

  // Ctrl/Cmd+K 打开 / Esc 关闭
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      const mod = e.metaKey || e.ctrlKey

      if (isEditableTarget(e.target)) return

      if (mod && k === "k") {
        e.preventDefault()
        openPalette()
      }

      if (k === "escape") {
        if (open) closePalette()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, openPalette, closePalette])

  // ✅ 点击面板外关闭（pointer + capture，手机也稳）
  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: PointerEvent) => {
      const panel = panelRef.current
      const target = e.target
      if (!panel) return
      if (!(target instanceof Node)) return
      if (!panel.contains(target)) closePalette()
    }

    window.addEventListener("pointerdown", onPointerDown, true)
    return () => window.removeEventListener("pointerdown", onPointerDown, true)
  }, [open, closePalette])

  // ✅ 打开时锁住页面滚动
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return posts.slice(0, 20)

    return posts
      .filter((p) => {
        const title = norm(p.meta.title)
        const tags = norm((p.meta.tags ?? []).join(" "))
        const desc = norm(p.meta.description)
        return title.includes(s) || tags.includes(s) || desc.includes(s)
      })
      .slice(0, 40)
  }, [q, posts])

  const safeActive =
    filtered.length === 0 ? 0 : Math.min(active, filtered.length - 1)
  const activeItem = filtered[safeActive] || null

  // ✅ Tab 焦点陷阱：在弹窗内循环
  const onKeyDownPanel = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return
    const root = panelRef.current
    if (!root) return

    const focusables = Array.from(
      root.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(
      (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
    )

    if (focusables.length === 0) return

    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
      return
    }

    if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  // 右侧预览（缓存）
  useEffect(() => {
    if (!open) return

    if (!activeItem) {
      Promise.resolve().then(() => {
        setPreview(null)
        setLoadingPreview(false)
      })
      return
    }

    const slug = activeItem.slug
    const cached = cacheRef.current[slug]
    if (cached) {
      Promise.resolve().then(() => {
        setPreview(cached)
        setLoadingPreview(false)
      })
      return
    }

    let cancelled = false

    Promise.resolve().then(async () => {
      if (cancelled) return
      setLoadingPreview(true)

      try {
        const r = await fetch(
          `/api/post-preview?slug=${encodeURIComponent(slug)}`
        )
        const data = r.ok ? ((await r.json()) as PreviewData) : null
        if (cancelled) return

        const merged: PreviewData = {
          title: activeItem.meta.title,
          date: activeItem.meta.date,
          tags: activeItem.meta.tags ?? [],
          excerpt: data?.excerpt || activeItem.meta.description || "",
        }
        cacheRef.current[slug] = merged
        setPreview(merged)
      } catch {
        if (cancelled) return
        const fallback: PreviewData = {
          title: activeItem.meta.title,
          date: activeItem.meta.date,
          tags: activeItem.meta.tags ?? [],
          excerpt: activeItem.meta.description || "",
        }
        cacheRef.current[slug] = fallback
        setPreview(fallback)
      } finally {
        if (!cancelled) setLoadingPreview(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [open, activeItem])

  const go = useCallback(
    (slug: string) => {
      closePalette()
      router.push(`/blog/${slug}`)
    },
    [router, closePalette]
  )

  const onKeyDownInput = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((x) => Math.min(x + 1, Math.max(0, filtered.length - 1)))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((x) => Math.max(x - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const item = filtered[safeActive]
      if (item) go(item.slug)
    } else if (e.key === "Escape") {
      closePalette()
    }
  }

  // mounted=false：只渲染按钮（或啥都不渲染）
  if (!mounted) {
    return showButton ? (
      <button
        type="button"
        onClick={openPalette}
        className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm hover:opacity-80"
        style={{
          borderColor: "rgb(var(--border))",
          background: "rgb(var(--surface2))",
        }}
      >
        Search
        <span
          className="rounded-md border px-1.5 py-0.5 text-xs"
          style={{
            borderColor: "rgb(var(--border))",
            color: "rgb(var(--muted))",
            background: "rgb(var(--surface))",
          }}
        >
          Ctrl K
        </span>
      </button>
    ) : null
  }

  return (
    <>
      {showButton ? (
        <button
          type="button"
          onClick={openPalette}
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm hover:opacity-80"
          style={{
            borderColor: "rgb(var(--border))",
            background: "rgb(var(--surface2))",
          }}
        >
          Search
          <span
            className="rounded-md border px-1.5 py-0.5 text-xs"
            style={{
              borderColor: "rgb(var(--border))",
              color: "rgb(var(--muted))",
              background: "rgb(var(--surface))",
            }}
          >
            Ctrl K
          </span>
        </button>
      ) : null}

      {/* ✅ 背景透明 + 关闭时淡出 */}
      <div
        className={[
          "fixed inset-0 z-[100] flex items-start justify-center p-4",
          "transition-opacity duration-200",
          "ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        style={{ background: "transparent" }}
      >
        {/* ✅ Apple 风格：关闭缩回顶部（上移 + 缩小 + 淡出） */}
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          onKeyDown={onKeyDownPanel}
          className={[
            "w-full max-w-5xl overflow-hidden rounded-2xl border shadow-xl",
            "transition-[transform,opacity] duration-200",
            "ease-[cubic-bezier(0.16,1,0.3,1)]",
            open
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 -translate-y-10 scale-[0.90]",
          ].join(" ")}
          style={{
            borderColor: "rgb(var(--border))",
            background: "rgb(var(--surface))",
            transformOrigin: "top center",
            willChange: "transform, opacity",
          }}
        >
          <div className="p-4">
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setActive(0)
              }}
              onKeyDown={onKeyDownInput}
              placeholder="搜索：标题 / 标签 / 描述（Enter 打开，Esc 关闭）"
              className="ui-focus w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={{
                borderColor: "rgb(var(--border))",
                background: "rgb(var(--surface2))",
                color: "rgb(var(--text))",
              }}
            />

            <div className="mt-3 text-xs" style={{ color: "rgb(var(--muted))" }}>
              ↑↓ 选择 · Enter 打开 · Esc 关闭 · 或去{" "}
              <Link className="underline" href="/search" onClick={closePalette}>
                /search
              </Link>
            </div>
          </div>

          <div
            className="grid border-t md:grid-cols-[1fr_360px]"
            style={{ borderColor: "rgb(var(--border))" }}
          >
            {/* 左：结果 */}
            <div className="max-h-[60vh] overflow-auto p-2">
              {filtered.length === 0 ? (
                <div className="p-4 text-sm" style={{ color: "rgb(var(--muted))" }}>
                  没找到结果。换个关键词试试～
                </div>
              ) : (
                <ul className="space-y-1">
                  {filtered.map(({ slug, meta }, idx) => (
                    <li key={slug}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => go(slug)}
                        className="w-full rounded-xl px-3 py-2 text-left transition"
                        style={{
                          background:
                            idx === safeActive
                              ? "rgb(var(--surface2))"
                              : "transparent",
                        }}
                      >
                        <div className="text-sm font-semibold">
                          {highlight(meta.title ?? slug, q)}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                          <span style={{ color: "rgb(var(--muted))" }}>{meta.date}</span>

                          {(meta.tags ?? []).slice(0, 6).map((t) => (
                            <span
                              key={t}
                              className="rounded-full border px-2 py-0.5"
                              style={{
                                borderColor: "rgb(var(--border))",
                                color: "rgb(var(--muted))",
                              }}
                            >
                              #{t}
                            </span>
                          ))}
                        </div>

                        {meta.description ? (
                          <div className="mt-1 text-xs" style={{ color: "rgb(var(--muted))" }}>
                            {highlight(meta.description, q)}
                          </div>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 右：预览 */}
            <aside
              className="hidden max-h-[60vh] border-l p-4 md:block"
              style={{
                borderColor: "rgb(var(--border))",
                background: "rgb(var(--surface2))",
              }}
            >
              {!activeItem ? (
                <div className="text-sm" style={{ color: "rgb(var(--muted))" }}>
                  选择一篇文章以预览内容。
                </div>
              ) : (
                <div>
                  <div className="text-xs" style={{ color: "rgb(var(--muted))" }}>
                    预览
                  </div>

                  <div className="mt-2 text-lg font-semibold">{activeItem.meta.title}</div>
                  <div className="mt-1 text-xs" style={{ color: "rgb(var(--muted))" }}>
                    {activeItem.meta.date}
                  </div>

                  {(activeItem.meta.tags?.length ?? 0) > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(activeItem.meta.tags ?? []).slice(0, 8).map((t) => (
                        <span
                          key={t}
                          className="rounded-full border px-2 py-0.5 text-xs"
                          style={{
                            borderColor: "rgb(var(--border))",
                            color: "rgb(var(--muted))",
                            background: "rgb(var(--surface))",
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div
                    className="mt-4 rounded-xl border p-3 text-sm leading-relaxed"
                    style={{
                      borderColor: "rgb(var(--border))",
                      background: "rgb(var(--surface))",
                      color: "rgb(var(--text))",
                    }}
                  >
                    {loadingPreview ? (
                      <span style={{ color: "rgb(var(--muted))" }}>加载中…</span>
                    ) : (
                      <span>
                        {preview?.excerpt ||
                          activeItem.meta.description ||
                          "（暂无摘要）"}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => go(activeItem.slug)}
                    className="mt-4 w-full rounded-xl border px-3 py-2 text-sm hover:opacity-80"
                    style={{
                      borderColor: "rgb(var(--border))",
                      background: "rgb(var(--surface))",
                    }}
                  >
                    Enter 打开文章
                  </button>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
