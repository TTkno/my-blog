import Link from "next/link"
import { getAllPosts } from "@/lib/posts"
import { CollectionTabs } from "./CollectionTabs"

function normalizeKey(s: string) {
  return (s || "").trim().toLowerCase()
}

export default function ArchivesPage() {
  const posts = getAllPosts()

  // collection 去重 + 统计
  const colMap = new Map<string, { key: string; name: string; count: number }>()
  for (const p of posts) {
    const raw = (p.meta.collection || "default").trim() || "default"
    const key = normalizeKey(raw)
    const name = raw === "default" ? "All" : raw
    const prev = colMap.get(key)
    colMap.set(key, {
      key,
      name,
      count: (prev?.count ?? 0) + 1,
    })
  }

  // 排序：All 放最前，其他按文章数降序
  const collections = Array.from(colMap.values()).sort((a, b) => {
    if (a.key === "default") return -1
    if (b.key === "default") return 1
    return b.count - a.count
  })

  const defaultKey = collections[0]?.key ?? "default"

  // 传给客户端 tabs 的精简数据
  const items = posts.map((p) => ({
    slug: p.slug,
    title: p.meta.title,
    date: p.meta.date,
    collection: normalizeKey(p.meta.collection || "default"),
    collectionName: (p.meta.collection || "All").trim() || "All",
  }))

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Archives</h1>
        </div>

        <Link className="text-sm hover:opacity-80" href="/blog">
          ← Posts
        </Link>
      </div>

      <div className="mt-6">
        <CollectionTabs
          defaultKey={defaultKey}
          collections={collections}
          items={items}
        />
      </div>
    </div>
  )
}
