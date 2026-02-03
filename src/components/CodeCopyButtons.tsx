"use client"

import { useEffect } from "react"

function getCodeText(pre: HTMLElement) {
  const code = pre.querySelector("code")
  if (!code) return pre.textContent ?? ""

  // 防止某些高亮库把“行号”作为真实 DOM 节点塞进来
  const clone = code.cloneNode(true) as HTMLElement
  clone.querySelectorAll(
    '[data-line-number], .line-number, .linenumber, .line-numbers, .code-line-number'
  ).forEach((el) => el.remove())

  return clone.textContent ?? ""
}

export function CodeCopyButtons({ scopeSelector = "article" }: { scopeSelector?: string }) {
  useEffect(() => {
    const root = document.querySelector(scopeSelector)
    if (!root) return

    const pres = Array.from(root.querySelectorAll("pre")) as HTMLElement[]
    for (const pre of pres) {
      // 避免重复注入
      if (pre.dataset.copyBound === "1") continue
      pre.dataset.copyBound = "1"

      // wrap：让按钮可以定位在右上角
      const wrap = document.createElement("div")
      wrap.className = "code-wrap"

      pre.parentNode?.insertBefore(wrap, pre)
      wrap.appendChild(pre)

      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = "code-copy"
      btn.setAttribute("aria-label", "复制代码")
      btn.innerText = "复制"

      btn.addEventListener("click", async () => {
        const text = getCodeText(pre)
        try {
          await navigator.clipboard.writeText(text)
          btn.innerText = "已复制"
          btn.setAttribute("data-copied", "1")
          window.setTimeout(() => {
            btn.innerText = "复制"
            btn.removeAttribute("data-copied")
          }, 1200)
        } catch {
          btn.innerText = "复制失败"
          window.setTimeout(() => {
            btn.innerText = "复制"
          }, 1200)
        }
      })

      wrap.appendChild(btn)
    }
  }, [scopeSelector])

  return null
}
