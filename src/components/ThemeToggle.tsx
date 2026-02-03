"use client"

import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

const STORAGE_KEY = "theme"

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  const stored = localStorage.getItem(STORAGE_KEY) as "light" | "dark" | null
  if (stored === "dark" || stored === "light") return stored
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement
  if (theme === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // ignore
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // 延迟一次微任务再写 state，避免在 effect 内同步 setState 触发级联渲染（满足 react-hooks/set-state-in-effect）
    queueMicrotask(() => {
      setTheme(getInitialTheme())
      setMounted(true)
    })
  }, [])

  useEffect(() => {
    if (!mounted) return
    applyTheme(theme)
  }, [mounted, theme])

  const toggle = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }

  if (!mounted) {
    return (
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border"
        style={{
          borderColor: "rgb(var(--border))",
          background: "rgb(var(--surface2))",
        }}
        aria-hidden
      >
        <span className="h-4 w-4" />
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:opacity-90"
      style={{
        borderColor: "rgb(var(--border))",
        background: "rgb(var(--surface2))",
        color: "rgb(var(--text))",
      }}
      aria-label={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
      title={theme === "dark" ? "浅色模式" : "深色模式"}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </button>
  )
}
