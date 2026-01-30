"use client"

import { useEffect, useState } from "react"

export function StickyHeader({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className="sticky top-0 z-50 relative"
      style={{
        background: `rgb(var(--surface) / ${scrolled ? "0.86" : "0.70"})`,
        borderBottom: `1px solid rgb(var(--border) / ${scrolled ? "0.95" : "0.60"})`,
        backdropFilter: "blur(14px)",
        boxShadow: scrolled ? "0 18px 48px rgb(2 6 23 / 0.10)" : "none",
        transition: "background 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
      }}
    >
      {children}
    </header>
  )
}
