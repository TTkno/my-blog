import Link from "next/link"
import { getAllPosts } from "@/lib/posts"

export default function BlogIndex() {
  const posts = getAllPosts()

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Blog</h1>

      <ul className="mt-6 space-y-4">
        {posts.map(({ slug, meta }) => (
          <li key={slug} className="rounded-lg border p-4">
            <Link className="text-xl font-semibold underline" href={`/blog/${slug}`}>
              {meta.title}
            </Link>
            <div className="mt-1 text-sm opacity-70">{meta.date}</div>
            {meta.tags?.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {meta.tags.map((t) => (
                  <span key={t} className="rounded-full border px-2 py-0.5 text-xs opacity-80">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </main>
  )
}