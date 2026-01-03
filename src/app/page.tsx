import Link from "next/link"
import { getAllPosts } from "@/lib/posts"

export default function BlogIndex() {
  const posts = getAllPosts()

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Blog</h1>

      <ul className="mt-6 space-y-3">
        {posts.map(({ slug, meta }) => (
          <li key={slug}>
            {/* ✅ 一定要用 slug */}
            <Link className="underline" href={`/blog/${slug}`}>
              {meta.title}
            </Link>

            {/* ✅ 这行是为了你调试：看看 slug 到底是不是 hello */}
            <div className="text-xs opacity-60">slug: {slug}</div>

            <div className="text-sm opacity-70">{meta.date}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}
