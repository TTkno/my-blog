"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ScrollToTopOnRouteChange() {
  const pathname = usePathname()

  useEffect(() => {
    // 尊重减少动画
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches

    window.scrollTo({ top: 0, left: 0, behavior: prefersReduced ? "auto" : "smooth" })
  }, [pathname])

  return null
}
