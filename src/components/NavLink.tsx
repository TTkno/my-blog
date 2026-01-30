"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { CSSProperties } from "react"

function cn(...parts: Array<string | undefined | false | null>) {
  return parts.filter(Boolean).join(" ")
}

export function NavLink({
  href,
  children,
  exact,
  className,
  activeClassName,
  activeStyle,
}: {
  href: string
  children: React.ReactNode
  exact?: boolean
  className?: string
  activeClassName?: string
  activeStyle?: CSSProperties
}) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-xl px-3 py-2 transition",
        className,
        active ? activeClassName ?? "" : "opacity-80 hover:opacity-100"
      )}
      style={active ? activeStyle : undefined}
    >
      {children}
    </Link>
  )
}
