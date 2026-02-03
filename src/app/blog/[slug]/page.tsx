import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { CodeCopyButtons } from "@/components/CodeCopyButtons"
import { compileMDX } from "next-mdx-remote/rsc"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import GithubSlugger from "github-slugger"
import {
  getAllPosts,
  getAllTags,
  getPostBySlug,
  getPrevNextBySlug,
  type PostMeta,
} from "@/lib/posts"
import { site } from "@/site"
import type { TocItem } from "@/components/TableOfContents"
import { TableOfContentsClient } from "@/components/TableOfContentsClient"
import { SidebarNav } from "@/components/SidebarNav"
import { ArticleSidebarCard } from "@/components/ArticleSidebarCard"

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000"

function toISODate(dateStr?: string) {
  const d = new Date(String(dateStr ?? ""))
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  if (!slug || slug === "undefined") {
    return { robots: { index: false, follow: false } }
  }

  try {
    const { meta } = getPostBySlug(slug)

    // 生产环境草稿：不让收录
    if (meta.draft && process.env.NODE_ENV === "production") {
      return { robots: { index: false, follow: false } }
    }

    const title = `${meta.title} | ${site.name}`
    const desc = meta.description || site.subtitle
    const url = `${baseUrl}/blog/${encodeURIComponent(slug)}`

    return {
      title,
      description: desc,
      keywords: meta.tags,
      alternates: { canonical: url },
      openGraph: {
        title,
        description: desc,
        url,
        type: "article",
        publishedTime: toISODate(meta.date),
        tags: meta.tags,
      },
      twitter: {
        card: "summary",
        title,
        description: desc,
      },
    }
  } catch {
    return { robots: { index: false, follow: false } }
  }
}

function extractToc(mdx: string): TocItem[] {
  const lines = mdx.split("\n")
  let inFence = false
  let fenceMark: "```" | "~~~" | null = null

  const slugger = new GithubSlugger()
  const items: TocItem[] = []

  for (const line of lines) {
    const t = line.trim()
    if (t === "---") continue

    if (t.startsWith("```") || t.startsWith("~~~")) {
      const mark = t.startsWith("```") ? "```" : "~~~"
      if (!inFence) {
        inFence = true
        fenceMark = mark
      } else if (fenceMark === mark) {
        inFence = false
        fenceMark = null
      }
      continue
    }
    if (inFence) continue

    const m = /^(#{2,4})\s+(.*)$/.exec(t)
    if (!m) continue

    const depth = m[1].length
    const text = m[2].replace(/\s+#.*$/, "").replace(/`/g, "").trim()
    if (!text) continue

    const id = slugger.slug(text)
    items.push({ id, text, depth })
  }

  return items
}

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!slug || slug === "undefined") notFound()

  const { meta, content } = getPostBySlug(slug)

  // ✅ 生产环境：草稿不允许访问
  if (meta.draft && process.env.NODE_ENV === "production") notFound()

  // ✅ 同 collection 内跳转（collection 不存在就按全站）
  const { prev, next } = getPrevNextBySlug(slug, { collection: meta.collection })

  const toc = extractToc(content)
  const readMinutes = Math.max(1, Math.ceil(content.length / 500))

  const { content: rendered } = await compileMDX<PostMeta>({
    source: content,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [
          rehypeKatex,
          [rehypePrettyCode, { theme: "dark-plus", keepBackground: false }],
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              properties: { className: ["heading-anchor"] },
              content: { type: "text", value: "#" },
            },
          ],
        ],
      },
    },
  })

  const canonicalUrl = `${baseUrl}/blog/${encodeURIComponent(slug)}`
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: meta.title,
    description: meta.description || site.subtitle,
    datePublished: toISODate(meta.date),
    dateModified: toISODate(meta.updated ?? meta.date),
    author: { "@type": "Person", name: site.name },
    url: canonicalUrl,
    ...(meta.tags?.length ? { keywords: meta.tags.join(", ") } : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 阅读布局：左侧导航 + 介绍/文章概要合并卡片，右侧正文 */}
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 lg:gap-12">
          {/* 左侧：导航 + 介绍/文章概要可切换卡片，留足间距避免重叠 */}
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start space-y-5">
            <SidebarNav />
            <ArticleSidebarCard
              toc={toc}
              postCount={getAllPosts().length}
              tagCount={getAllTags().length}
            />
          </aside>

          <div className="min-w-0">
            {/* 顶部标题栏 */}
            <div className="mb-6 sm:mb-8">
              <Link className="text-sm muted hover:opacity-90 mb-3 inline-block" href="/" style={{ color: "rgb(var(--muted))" }}>
                ← 返回首页
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "rgb(var(--text))" }}>{meta.title}</h1>
            </div>

            {/* 文章正文 */}
            <article className="min-w-0">
            {/* 移动端信息栏 */}
            <div className="lg:hidden card p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4 text-sm mb-3 muted" style={{ color: "rgb(var(--muted))" }}>
                <span>{meta.date}</span>
                {meta.updated && meta.updated !== meta.date && (
                  <>
                    <span>·</span>
                    <span>更新: {meta.updated}</span>
                  </>
                )}
                <span>·</span>
                <span>{readMinutes}分钟阅读</span>
                {meta.draft && (
                  <>
                    <span>·</span>
                    <span className="px-2 py-1 rounded text-xs" style={{ background: "rgb(var(--surface2))", color: "rgb(var(--accent))", border: "1px solid rgb(var(--border))" }}>草稿</span>
                  </>
                )}
              </div>
              
              {/* 移动端标签 */}
              {meta.tags?.length ? (
                <div className="flex flex-wrap gap-2">
                  {meta.tags.map((t) => (
                    <span key={t} className="px-2 py-1 rounded text-xs" style={{ background: "rgb(var(--surface2))", color: "rgb(var(--text))", border: "1px solid rgb(var(--border))" }}>
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {/* 移动端目录 */}
            {toc.length > 0 && (
              <details className="lg:hidden card p-4 mb-6">
                <summary className="cursor-pointer font-medium" style={{ color: "rgb(var(--text))" }}>
                  目录
                </summary>
                <div className="mt-3">
                  <TableOfContentsClient items={toc} />
                </div>
              </details>
            )}

            <CodeCopyButtons scopeSelector="article" />

            {/* 正文阅读区：独立背景 + 内边距，与页面背景区分 */}
            <div className="article-content">
              <div
                className="prose prose-lg max-w-none
                  prose-p:leading-7
                  prose-headings:font-bold
                  prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:mt-6 prose-h3:mb-3
                  prose-hr:my-8
                  prose-img:rounded-lg prose-img:shadow-md
                  prose-blockquote:border-l-4"
              >
                {rendered}
              </div>
            </div>

            {/* 文章底部：标签（居中）+ 分隔线 + 上一篇（左对齐） */}
            <footer className="mt-12 pt-8">
              {meta.tags?.length ? (
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-6">
                  {meta.tags.map((t) => (
                    <Link
                      key={t}
                      href={`/tags/${encodeURIComponent(t)}`}
                      className="text-sm transition-colors hover:opacity-80 underline underline-offset-2 decoration-[rgb(var(--border))] hover:decoration-[rgb(var(--text))]"
                      style={{ color: "rgb(var(--muted))" }}
                    >
                      {t}
                    </Link>
                  ))}
                </div>
              ) : null}
              <div
                className="w-full h-px mb-6"
                style={{ background: "rgb(var(--border))" }}
              />
              {(prev || next) ? (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {prev ? (
                    <Link
                      href={`/blog/${prev.slug}`}
                      className="text-sm transition-colors hover:opacity-80 inline-flex items-center gap-1"
                      style={{ color: "rgb(var(--muted))" }}
                    >
                      <span aria-hidden>←</span>
                      {prev.meta.title}
                    </Link>
                  ) : (
                    <span />
                  )}
                  {next ? (
                    <Link
                      href={`/blog/${next.slug}`}
                      className="text-sm transition-colors hover:opacity-80 inline-flex items-center gap-1"
                      style={{ color: "rgb(var(--muted))" }}
                    >
                      {next.meta.title}
                      <span aria-hidden>→</span>
                    </Link>
                  ) : (
                    <span />
                  )}
                </div>
              ) : null}
            </footer>
            </article>
          </div>
        </div>
      </div>
    </>
  )
}