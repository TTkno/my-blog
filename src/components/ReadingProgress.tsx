"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function ReadingProgress() {
  const [p, setP] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const scrollTop = doc.scrollTop || document.body.scrollTop
      const height = doc.scrollHeight - doc.clientHeight
      const next = height > 0 ? Math.min(1, Math.max(0, scrollTop / height)) : 0
      setP(next)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [pathname])

  return (
    <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-[2px]"
      style={{ background: "rgb(var(--border))" }}
    >
      <div
        className="h-full origin-left"
        style={{
          transform: `scaleX(${p})`,
          background: "rgb(var(--accent))",
        }}
      />
    </div>
  )
}
