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
  getPostBySlug,
  getPrevNextBySlug,
  type PostMeta,
} from "@/lib/posts"
import { site } from "@/site"
import type { TocItem } from "@/components/TableOfContents"
import { TableOfContentsClient } from "@/components/TableOfContentsClient"

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
          [rehypePrettyCode, { theme: "github-light", keepBackground: false }],
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

  return (
    <>
      {/* 简洁阅读布局 - 合并目录和概要卡片 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 顶部标题栏 */}
        <div className="mb-8">
          <Link className="text-sm text-gray-600 hover:text-gray-800 mb-4 inline-block" href="/blog">
            ← 返回文章列表
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{meta.title}</h1>
        </div>

        {/* 主要内容区域 */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧合并卡片 - 桌面端显示 */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-6 bg-gray-50 rounded-lg border border-gray-200 p-6 shadow-sm">
              {/* 文章概要 */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">文章概要</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">发布时间</span>
                    <span className="text-gray-900">{meta.date}</span>
                  </div>
                  
                  {meta.updated && meta.updated !== meta.date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">最后更新</span>
                      <span className="text-gray-900">{meta.updated}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">阅读时间</span>
                    <span className="text-gray-900">{readMinutes}分钟</span>
                  </div>
                  
                  {meta.draft && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">状态</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">草稿</span>
                    </div>
                  )}
                </div>
                
                {/* 标签 */}
                {meta.tags?.length ? (
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">标签</div>
                    <div className="flex flex-wrap gap-1">
                      {meta.tags.map((t) => (
                        <span key={t} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              
              {/* 目录 */}
              {toc.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">目录</h2>
                  <TableOfContentsClient items={toc} />
                </div>
              )}
            </div>
          </aside>

          {/* 文章正文 */}
          <article className="flex-1 min-w-0">
            {/* 移动端信息栏 */}
            <div className="lg:hidden bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
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
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">草稿</span>
                  </>
                )}
              </div>
              
              {/* 移动端标签 */}
              {meta.tags?.length ? (
                <div className="flex flex-wrap gap-2">
                  {meta.tags.map((t) => (
                    <span key={t} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {/* 移动端目录 */}
            {toc.length > 0 && (
              <details className="lg:hidden bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
                <summary className="cursor-pointer font-medium text-gray-900">
                  目录
                </summary>
                <div className="mt-3">
                  <TableOfContentsClient items={toc} />
                </div>
              </details>
            )}

            <CodeCopyButtons scopeSelector="article" />
            
            <div
              className="prose prose-lg max-w-none
                prose-headings:text-gray-900
                prose-p:text-gray-700
                prose-p:leading-7
                prose-headings:font-bold
                prose-h2:mt-12 prose-h2:mb-6
                prose-h3:mt-8 prose-h3:mb-4
                prose-hr:my-12
                prose-img:rounded-lg prose-img:shadow-md
                prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:bg-gray-50
                prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded
                prose-pre:bg-gray-50 prose-pre:text-gray-800
                prose-table:border prose-table:border-gray-300
                prose-th:bg-gray-100 prose-th:font-semibold"
            >
              {rendered}
            </div>

            {/* 上一篇/下一篇导航 */}
            {(prev || next) ? (
              <div className="mt-12 grid gap-4 sm:grid-cols-2">
                {next ? (
                  <Link
                    href={`/blog/${next.slug}`}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-sm text-gray-600">下一篇</div>
                    <div className="mt-1 font-semibold text-gray-900">{next.meta.title}</div>
                    <div className="mt-1 text-sm text-gray-500">{next.meta.date}</div>
                  </Link>
                ) : (
                  <div />
                )}

                {prev ? (
                  <Link
                    href={`/blog/${prev.slug}`}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-right"
                  >
                    <div className="text-sm text-gray-600">上一篇</div>
                    <div className="mt-1 font-semibold text-gray-900">{prev.meta.title}</div>
                    <div className="mt-1 text-sm text-gray-500">{prev.meta.date}</div>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            ) : null}
          </article>
        </div>
      </div>
    </>
  )
}