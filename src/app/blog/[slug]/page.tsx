import { compileMDX } from "next-mdx-remote/rsc"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypePrettyCode from "rehype-pretty-code"

import { getAllPosts, getPostBySlug, type PostMeta } from "@/lib/posts"

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const { meta, content } = getPostBySlug(params.slug)

  const { content: rendered } = await compileMDX({
    source: content,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [
          rehypeKatex,
          [rehypePrettyCode, { theme: "github-dark" }],
        ],
      },
    },
  })

  return (
    <article className="prose prose-zinc dark:prose-invert mx-auto max-w-3xl px-4 py-10">
      <h1>{meta.title}</h1>
      <div className="text-sm opacity-70">{meta.date}</div>
      {rendered}
    </article>
  )
}