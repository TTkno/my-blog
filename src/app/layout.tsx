import "./globals.css"
import Link from "next/link"
import type { Metadata } from "next"

import { PageTransition } from "@/components/PageTransition"
import { ParticlesBackground } from "@/components/ParticlesBackground"
import { ReadingProgress } from "@/components/ReadingProgress"
import { site } from "@/site"
import { getAllPosts } from "@/lib/posts"
import { SearchPalette } from "@/components/SearchPalette"
import { BackToTop } from "@/components/BackToTop"
import { MobileSidebarDrawer } from "@/components/MobileSidebarDrawer"
import { MainWithSidebar } from "@/components/MainWithSidebar"
import { SidebarContent } from "@/components/SidebarContent"
import { ScrollToTopOnRouteChange } from "@/components/ScrollToTopOnRouteChange"
import "katex/dist/katex.min.css"

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${site.name} · CP Blog`,
    template: `%s | ${site.name}`,
  },
  description: site.subtitle,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: `${site.name} · CP Blog`,
    description: site.subtitle,
    siteName: site.name,
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} · CP Blog`,
    description: site.subtitle,
    images: ["/twitter-image"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const posts = getAllPosts()

  return (
    <html lang="zh-Hans" suppressHydrationWarning>
      <body
        className="min-h-screen antialiased"
        style={{ background: "rgb(var(--bg))", color: "rgb(var(--text))" }}
      >
        {/* ✅ 路由切换回到顶部（保留） */}
        <ScrollToTopOnRouteChange />

        {/* ✅ 氛围光更底层：不盖住粒子 */}
        <div className="pointer-events-none fixed inset-0 -z-20">
          <div
            className="absolute -top-24 left-1/2 h-72 w-[900px] -translate-x-1/2 rounded-full"
            style={{
              background: "rgb(var(--accent) / 0.10)",
              filter: "blur(60px)",
            }}
          />
          <div
            className="absolute top-40 left-1/2 h-72 w-[900px] -translate-x-1/2 rounded-full"
            style={{
              background: "rgb(var(--accent2) / 0.10)",
              filter: "blur(70px)",
            }}
          />
        </div>

        {/* ✅ 粒子在氛围光上面 */}
        <ParticlesBackground />

        {/* 顶部导航 */}
        <header className="sticky top-0 z-50 glass-header relative">
          <div className="app-container flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <MobileSidebarDrawer>
                <SidebarContent />
              </MobileSidebarDrawer>

              <Link href="/" className="font-semibold tracking-tight">
                {site.name}
                <span
                  className="ml-2 rounded-md border px-2 py-0.5 text-xs"
                  style={{
                    borderColor: "rgb(var(--border))",
                    background: "rgb(var(--surface2))",
                    color: "rgb(var(--accent))",
                  }}
                >
                  CP Blog
                </span>
              </Link>
            </div>

            <SearchPalette posts={posts} showButton />
          </div>

          <ReadingProgress />
        </header>

        {/* 主体：文章页不显示侧栏，由文章页渲染合并卡片 */}
        <main className="app-container py-10">
          <MainWithSidebar sidebar={<SidebarContent />}>
            <PageTransition>{children}</PageTransition>
          </MainWithSidebar>
        </main>

        <footer
          className="border-t py-10"
          style={{ borderColor: "rgb(var(--border))" }}
        >
          <div className="app-container text-sm muted">
            © {new Date().getFullYear()} {site.name} · Built with Next.js
          </div>
        </footer>

        {/* ✅ 全局回到顶部：保留 */}
        <BackToTop />
      </body>
    </html>
  )
}
