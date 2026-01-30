"use client"

import React, { useRef, useState } from "react"

function getTextFromPre(pre: HTMLPreElement | null) {
  if (!pre) return ""
  const code = pre.querySelector("code")
  return (code?.textContent ?? pre.textContent ?? "").trimEnd()
}

export function CodeBlock(props: React.ComponentProps<"pre">) {
  const ref = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      const text = getTextFromPre(ref.current)
      if (!text) return
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      // 某些浏览器权限/协议限制会失败；忽略即可
    }
  }

  return (
    <div className="code-wrap">
      <button className="code-copy" onClick={onCopy} type="button">
        {copied ? "Copied" : "Copy"}
      </button>

      <pre ref={ref} {...props} />
    </div>
  )
}
