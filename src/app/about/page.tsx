import { site } from "@/site"

export default function AboutPage() {
  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold">關於</h1>
      <p className="mt-3 text-sm muted">
        你好，我是 {site.name}。這裡主要寫算競題解、模板、訓練記錄。
      </p>
    </div>
  )
}
