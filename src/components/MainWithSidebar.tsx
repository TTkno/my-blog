"use client"

import { usePathname } from "next/navigation"

/** 文章详情页不显示全局侧栏，由页面自身渲染合并卡片。侧栏由 layout 以 props 传入，避免客户端打包 fs。 */
const isBlogPostPath = (path: string) => /^\/blog\/[^/]+$/.test(path)

export function MainWithSidebar({
  children,
  sidebar,
}: {
  children: React.ReactNode
  /** 由 layout 传入的 SidebarContent，服务端渲染 */
  sidebar: React.ReactNode
}) {
  const pathname = usePathname()
  const hideSidebar = pathname ? isBlogPostPath(pathname) : false

  if (hideSidebar) {
    return <section className="min-w-0">{children}</section>
  }

  return (
    <div className="grid gap-6 md:grid-cols-[320px_1fr]">
      <aside className="hidden md:block md:sticky md:top-28 md:h-fit md:self-start">
        {sidebar}
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  )
}
