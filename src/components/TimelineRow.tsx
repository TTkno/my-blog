import Link from "next/link"

export function TimelineRow({
  href,
  mmdd,
  title,
}: {
  href: string
  mmdd: string
  title: string
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl px-2 py-1 ui-row ui-focus"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 text-sm muted">{mmdd}</div>

        <div className="min-w-0 flex-1">
          <div className="truncate">{title}</div>
        </div>

        <div
          className="ml-2 hidden flex-1 border-b border-dashed md:block"
          style={{ borderColor: "rgb(var(--border))" }}
        />
      </div>
    </Link>
  )
}
