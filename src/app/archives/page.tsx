import type { Metadata } from "next"
import { getAllPosts } from "@/lib/posts"
import { ArchiveTimeline } from "./CollectionTabs"

export const metadata: Metadata = {
  title: "归档",
}

export default function ArchivesPage() {
  const posts = getAllPosts()
  const items = posts.map((p) => ({
    slug: p.slug,
    title: p.meta.title,
    date: p.meta.date,
  }))

  return (
    <div className="card p-6 sm:p-8">
      <h1 className="text-xl font-semibold tracking-tight" style={{ color: "rgb(var(--text))" }}>
        归档
      </h1>

      <div className="mt-6 max-w-2xl mx-auto">
        <ArchiveTimeline items={items} />
      </div>
    </div>
  )
}
