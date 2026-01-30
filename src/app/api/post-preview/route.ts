import { NextResponse } from "next/server"
import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"

export const runtime = "nodejs"

const POSTS_DIR = path.join(process.cwd(), "content", "posts")

function stripMarkdown(input: string) {
  return (
    input
      // 去代码块
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/~~~[\s\S]*?~~~/g, " ")
      // 去图片/链接
      .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
      .replace(/\[[^\]]*\]\([^)]+\)/g, " ")
      // 去标题符号
      .replace(/^#{1,6}\s+/gm, "")
      // 去行内代码
      .replace(/`([^`]+)`/g, "$1")
      // 去 HTML 标签
      .replace(/<[^>]*>/g, " ")
      // 合并空白
      .replace(/\s+/g, " ")
      .trim()
  )
}

async function readPost(slug: string) {
  const mdx = path.join(POSTS_DIR, `${slug}.mdx`)
  const md = path.join(POSTS_DIR, `${slug}.md`)

  let file = ""
  try {
    await fs.access(mdx)
    file = mdx
  } catch {
    try {
      await fs.access(md)
      file = md
    } catch {
      file = ""
    }
  }

  if (!file) return null
  const raw = await fs.readFile(file, "utf8")
  const { data, content } = matter(raw)
  return { data, content }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = String(searchParams.get("slug") ?? "").trim()

  if (!slug || slug === "undefined" || slug.includes("/") || slug.includes("\\")) {
    return NextResponse.json({ excerpt: "" }, { status: 400 })
  }

  const post = await readPost(slug)
  if (!post) return NextResponse.json({ excerpt: "" }, { status: 404 })

  const text = stripMarkdown(post.content)
  const excerpt = text.slice(0, 280)

  return NextResponse.json({
    excerpt,
    title: String(post.data.title ?? slug),
    date: String(post.data.date ?? ""),
    tags: Array.isArray(post.data.tags) ? post.data.tags : [],
  })
}
