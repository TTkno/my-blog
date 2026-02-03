"use client"

import { NavLink } from "@/components/NavLink"

const items = [
  { href: "/", label: "首页", exact: true },
  { href: "/tags", label: "标签" },
  { href: "/archives", label: "归档" },
  { href: "/about", label: "关于" },
]

export function SidebarNav() {
  return (
    <div className="card p-2.5">
      <nav className="flex flex-col gap-0.5">
        {items.map((it) => (
          <NavLink
            key={it.href}
            href={it.href}
            exact={it.exact}
            className="nav-pill"
            activeClassName="font-semibold"
            activeStyle={{
              background: "rgb(var(--surface2))",
              borderColor: "rgb(var(--border))",
              borderWidth: 1,
              borderStyle: "solid",
            }}
          >
            {it.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
