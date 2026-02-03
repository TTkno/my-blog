"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { FadeIn, itemVariants, StaggerFadeIn } from "@/components/FadeIn"
import { site } from "@/site"
import type { PostListItem } from "@/lib/posts"

export function HomePageContent({ latest }: { latest: PostListItem[] }) {
  const reduced = useReducedMotion()

  return (
    <div className="grid gap-8">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Latest Posts</h1>
          <p className="mt-1 text-sm muted">
            {site.name} · {site.subtitle}
          </p>
        </div>
      </FadeIn>

      {reduced ? (
        <div className="space-y-8">
          {latest.map(({ slug, meta }) => (
            <HomeCard key={slug} slug={slug} meta={meta} />
          ))}
        </div>
      ) : (
        <StaggerFadeIn className="space-y-8" delay={0.05} staggerDelay={0.06}>
          {latest.map(({ slug, meta }) => (
            <motion.div key={slug} variants={itemVariants}>
              <HomeCard slug={slug} meta={meta} />
            </motion.div>
          ))}
        </StaggerFadeIn>
      )}

      <FadeIn delay={0.15}>
        <div className="pt-4">
          <nav className="flex items-center gap-3 text-sm muted" aria-label="文章导航">
            <Link href="/archives" className="hover:underline">
              更多文章 →
            </Link>
          </nav>
        </div>
      </FadeIn>
    </div>
  )
}

function HomeCard({
  slug,
  meta,
}: {
  slug: string
  meta: PostListItem["meta"]
}) {
  const isUpdated = meta.updated && meta.updated !== meta.date

  return (
    <Link
      href={`/blog/${slug}`}
      className="block group card-link outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
    >
      <article
        className="card overflow-hidden p-6 sm:p-8 md:p-10 transition-all duration-200 hover:shadow-lg"
        style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--surface))" }}
      >
        <h2
          className="text-xl sm:text-2xl font-bold tracking-tight text-center transition-colors duration-200 group-hover:text-accent"
          style={{ color: "rgb(var(--text))" }}
        >
          {meta.title}
        </h2>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm muted">
          <span>发表于 {meta.date}</span>
          {isUpdated && (
            <>
              <span aria-hidden>|</span>
              <span>更新于 {meta.updated}</span>
            </>
          )}
        </div>
        {meta.description && (
          <div className="mt-5 text-left text-sm sm:text-base muted leading-relaxed whitespace-pre-line line-clamp-6">
            {meta.description}
          </div>
        )}
        <div className="mt-6 flex justify-center">
          <span
            className="inline-block rounded border px-6 py-2.5 text-sm font-medium transition-all duration-200 group-hover:opacity-90"
            style={{
              borderColor: "rgb(var(--border))",
              background: "rgb(var(--surface))",
              color: "rgb(var(--text))",
            }}
          >
            阅读全文 »
          </span>
        </div>
      </article>
    </Link>
  )
}
