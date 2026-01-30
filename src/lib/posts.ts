import fs from "fs"
import path from "path"
import matter from "gray-matter"

export type PostMeta = {
  title: string
  date: string
  updated?: string
  tags?: string[]
  description?: string
  collection?: string
  draft?: boolean
}

export type PostListItem = {
  slug: string
  meta: PostMeta
}

const POSTS_DIR = path.join(process.cwd(), "content", "posts")
const BAD = new Set(["", "undefined", "null", "nan"])

function normStr(v: unknown) {
  return String(v ?? "").trim()
}

function ensureDate(input: unknown): string {
  const s = normStr(input)
  return s || new Date().toISOString().slice(0, 10)
}

function normalizeCollection(input: unknown): string | undefined {
  const s = normStr(input)
  const k = s.toLowerCase()
  if (!s || BAD.has(k)) return undefined
  return s
}

function normalizeDraft(input: unknown): boolean {
  if (typeof input === "boolean") return input
  const s = normStr(input).toLowerCase()
  return s === "true" || s === "1" || s === "yes"
}

function normalizeTags(input: unknown): string[] {
  const normOne = (v: unknown) => {
    const s = normStr(v)
    const k = s.toLowerCase()
    if (BAD.has(k)) return ""
    return s
  }

  if (!input) return []
  if (Array.isArray(input)) return input.map(normOne).filter(Boolean)

  if (typeof input === "string") {
    return input
      .split(",")
      .map((s) => normOne(s))
      .filter(Boolean)
  }

  return []
}

/**
 * 从原始 frontmatter 数据规范化为标准 PostMeta
 * 统一处理：空值、日期默认、draft 字符串转换等
 */
function normalizePostMeta(
  data: Record<string, unknown>,
  fallbackSlug: string
): PostMeta {
  return {
    title: String(data.title ?? fallbackSlug),
    date: ensureDate(data.date),
    updated: data.updated ? ensureDate(data.updated) : undefined,
    tags: normalizeTags(data.tags),
    description: data.description ? String(data.description) : undefined,
    collection: normalizeCollection(data.collection),
    draft: normalizeDraft(data.draft),
  }
}

function readFrontmatter(raw: string): Record<string, unknown> {
  const parsed = matter(raw)
  // gray-matter 的 data 本质是 any，这里我们强制收紧为 unknown 字典
  return (parsed.data ?? {}) as Record<string, unknown>
}

export function getAllPosts(): PostListItem[] {
  if (!fs.existsSync(POSTS_DIR)) return []

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))

  const posts: PostListItem[] = files.map((filename) => {
    const slug = filename.replace(/\.mdx?$/, "")
    const fullPath = path.join(POSTS_DIR, filename)
    const raw = fs.readFileSync(fullPath, "utf8")
    const data = readFrontmatter(raw)

    const meta = normalizePostMeta(data, slug)

    return { slug, meta }
  })

  posts.sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1))
  return posts
}

export function getPostBySlug(slug: string): { meta: PostMeta; content: string } {
  const fullPathMdx = path.join(POSTS_DIR, `${slug}.mdx`)
  const fullPathMd = path.join(POSTS_DIR, `${slug}.md`)

  const fullPath = fs.existsSync(fullPathMdx)
    ? fullPathMdx
    : fs.existsSync(fullPathMd)
      ? fullPathMd
      : ""

  if (!fullPath) {
    throw new Error(`Post not found: ${path.join(POSTS_DIR, `${slug}.mdx`)}`)
  }

  const raw = fs.readFileSync(fullPath, "utf8")
  const parsed = matter(raw)
  const data = (parsed.data ?? {}) as Record<string, unknown>
  const content = parsed.content ?? ""

  const meta = normalizePostMeta(data, slug)

  return { meta, content }
}

export function getAllTags(): string[] {
  const all = getAllPosts()
  const seen = new Map<string, string>() // key(lower) -> display
  for (const p of all) {
    for (const t of p.meta.tags ?? []) {
      const raw = normStr(t)
      const key = raw.toLowerCase()
      if (!key || BAD.has(key)) continue
      if (!seen.has(key)) seen.set(key, raw)
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b))
}

// ✅ 上一篇/下一篇：默认同 collection 内
export function getPrevNextBySlug(
  slug: string,
  opts?: { collection?: string }
): { prev: PostListItem | null; next: PostListItem | null } {
  const all = getAllPosts()
  const cur = all.find((p) => p.slug === slug)
  if (!cur) return { prev: null, next: null }

  const curCol = (opts?.collection ?? cur.meta.collection ?? "").trim().toLowerCase()

  const pool = curCol
    ? all.filter(
        (p) => (p.meta.collection ?? "").trim().toLowerCase() === curCol
      )
    : all

  const i = pool.findIndex((p) => p.slug === slug)
  if (i === -1) return { prev: null, next: null }

  // pool: 新 -> 旧
  const newer = i - 1 >= 0 ? pool[i - 1] : null
  const older = i + 1 < pool.length ? pool[i + 1] : null

  // prev = 上一篇(更旧), next = 下一篇(更新)
  return { prev: older, next: newer }
}
