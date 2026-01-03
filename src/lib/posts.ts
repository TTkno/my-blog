import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

const POSTS_DIR = path.join(process.cwd(), "content", "posts")

export type PostMeta = {
  title: string
  date: string
  tags?: string[]
}

export type PostListItem = {
  slug: string
  meta: PostMeta
}

/**
 * 读取所有文章（content/posts/*.mdx），返回：slug + meta，并按 date 倒序排序
 */
export function getAllPosts(): PostListItem[] {
  if (!fs.existsSync(POSTS_DIR)) return []

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"))

  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "")
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8")
      const { data } = matter(raw)
      return { slug, meta: data as PostMeta }
    })
    .sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1))
}

/**
 * 根据 slug 读取单篇文章
 */
export function getPostBySlug(slug: string): { meta: PostMeta; content: string } {
  const fullPath = path.join(POSTS_DIR, `${slug}.mdx`)

  if (!fs.existsSync(fullPath)) {
    // 给一个更友好的报错，方便你定位是哪篇文章/文件名错了
    throw new Error(`Post not found: ${fullPath}`)
  }

  const raw = fs.readFileSync(fullPath, "utf8")
  const { data, content } = matter(raw)
  return { meta: data as PostMeta, content }
}
