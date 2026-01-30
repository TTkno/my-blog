"use client"

import { useEffect, useState } from "react"

export function MobileSidebarDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  // Esc 关闭（setState 在事件回调里，不会触发你之前那个 lint）
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <>
      {/* 手机端按钮：md 以上隐藏 */}
      <button
        type="button"
        className="md:hidden inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm hover:opacity-80"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        style={{
          borderColor: "rgb(var(--border))",
          background: "rgb(var(--surface2))",
        }}
      >
        ☰
      </button>

      {open ? (
        <div className="fixed inset-0 z-[120] md:hidden">
          {/* 背景遮罩（可更淡） */}
          <div
            className="absolute inset-0"
            onMouseDown={() => setOpen(false)}
            style={{
              background: "rgba(2, 6, 23, 0.18)",
              backdropFilter: "blur(2px)",
            }}
          />

          {/* 抽屉 */}
          <div
            className="absolute left-3 top-3 bottom-3 w-[88vw] max-w-[340px] rounded-2xl border p-4 shadow-xl"
            style={{
              borderColor: "rgb(var(--border))",
              background: "rgb(var(--surface))",
              animation: "drawerIn 180ms ease-out both",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Menu</div>
              <button
                type="button"
                className="rounded-xl border px-3 py-1.5 text-sm hover:opacity-80"
                onClick={() => setOpen(false)}
                style={{
                  borderColor: "rgb(var(--border))",
                  background: "rgb(var(--surface2))",
                }}
              >
                ✕
              </button>
            </div>

            <div className="mt-4" onClick={() => setOpen(false)}>
              {children}
            </div>
          </div>

          {/* 动画 keyframes（写在组件里，最省事） */}
          <style>{`
            @keyframes drawerIn {
              from { transform: translateX(-10px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      ) : null}
    </>
  )
}
