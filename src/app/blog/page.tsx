import { Suspense } from "react"
import { getAllPosts } from "@/lib/posts"
import { BlogListClient } from "./BlogListClient"

// ✅ 预生成所有博客文章页面参数
export function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default function BlogPage() {
  const posts = getAllPosts()
  return (
    <Suspense fallback={<div className="card p-6 muted text-sm">加载中…</div>}>
      <BlogListClient posts={posts} />
    </Suspense>
  )
}
