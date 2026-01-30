"use client"

import { useEffect, useState } from "react"

export function ReadingActions() {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let t: number | undefined
    if (copied) {
      t = window.setTimeout(() => setCopied(false), 1100)
    }
    return () => {
      if (t) window.clearTimeout(t)
    }
  }, [copied])

  const onCopy = async () => {
    const url = typeof window !== "undefined" ? window.location.href.split("#")[0] : ""
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // fallback
      try {
        const ta = document.createElement("textarea")
        ta.value = url
        ta.style.position = "fixed"
        ta.style.left = "-9999px"
        document.body.appendChild(ta)
        ta.select()
        document.execCommand("copy")
        document.body.removeChild(ta)
        setCopied(true)
      } catch {}
    }
  }

  return (
    <>
      {/* ✅ 桌面端：右下角“轻量 Copy link”，不再有“回到顶部” */}
      <div className="hidden md:block">
        <div
          className="fixed bottom-6 right-6 z-[60]"
          style={{ pointerEvents: "auto" }}
        >
          <button
            type="button"
            onClick={onCopy}
            className="reading-copy-btn"
            aria-label="Copy link"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>

      {/* ✅ 手机端：不悬浮（避免遮挡代码），直接不显示 */}
    </>
  )
}
