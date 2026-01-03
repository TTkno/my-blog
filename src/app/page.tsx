import Link from "next/link"

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Carmella's CP Blog</h1>
      <p className="mt-3 opacity-80">题解 / 模板 / 训练记录</p>

      <div className="mt-6">
        <Link className="underline" href="/blog">
          进入博客 →
        </Link>
      </div>
    </main>
  )
}
