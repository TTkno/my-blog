"use client"

import { useEffect, useRef } from "react"

type RGB = readonly [number, number, number]

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  mix: number // 0~1 用来混合两种主题色
}

type PointerState = {
  x: number
  y: number
  active: boolean
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

function readCssRgbVar(name: string, fallback: RGB): RGB {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  // 期望格式： "16 185 129" 或 "16,185,129"
  const parts = raw
    .split(/[,\s]+/)
    .filter(Boolean)
    .map((x) => Number(x))

  if (parts.length >= 3 && parts.slice(0, 3).every((v) => Number.isFinite(v))) {
    return [parts[0], parts[1], parts[2]] as const
  }
  return fallback
}

function mixRgb(a: RGB, b: RGB, t: number): RGB {
  const k = clamp(t, 0, 1)
  const r = Math.round(a[0] * (1 - k) + b[0] * k)
  const g = Math.round(a[1] * (1 - k) + b[1] * k)
  const bl = Math.round(a[2] * (1 - k) + b[2] * k)
  return [r, g, bl] as const
}

function rgba(rgb: RGB, alpha: number) {
  const a = clamp(alpha, 0, 1)
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`
}

export function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (prefersReducedMotion()) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    let w = 0
    let h = 0

    // 从 CSS 变量读取主题色（你换配色不用改这个文件）
    const getTheme = () => {
      const accent = readCssRgbVar("--accent", [16, 185, 129] as const)
      const accent2 = readCssRgbVar("--accent2", [59, 130, 246] as const)
      return { accent, accent2 }
    }

    const pointer: PointerState = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.35,
      active: false,
    }

    const particles: Particle[] = []

    const resize = () => {
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      w = window.innerWidth
      h = window.innerHeight

      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // 按面积决定粒子数量（稀疏但精致）
      const target = clamp(Math.floor((w * h) / 18000), 55, 130)

      while (particles.length < target) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          // 初始速度稍大一点，保证肉眼可见在漂
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          r: 1.2 + Math.random() * 1.8,
          mix: Math.random(),
        })
      }
      if (particles.length > target) particles.splice(target)
    }

    const onResize = () => resize()

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.active = true
    }

    const onPointerLeave = () => {
      pointer.active = false
    }

    resize()
    window.addEventListener("resize", onResize)
    window.addEventListener("pointermove", onPointerMove, { passive: true })
    window.addEventListener("pointerleave", onPointerLeave)

    const tick = () => {
      const { accent, accent2 } = getTheme()
      ctx.clearRect(0, 0, w, h)

      // ===== 可调参数（你想更像 sam 的效果就调这里）=====
      const LINK_DIST = 150 // 线的最长距离
      const SPEED_LIMIT = 1.2

      // 鼠标吸引（带轻微旋涡）
      const ATTRACT_RADIUS = 240
      const ATTRACT_STRENGTH = 0.16
      const SWIRL = 0.08
      const SOFTEN = 22
      // ================================================

      // 更新粒子
      for (const p of particles) {
        // ✅ 鼠标吸引
        if (pointer.active) {
          const dx = pointer.x - p.x
          const dy = pointer.y - p.y
          const dist = Math.hypot(dx, dy)

          if (dist > 0.001 && dist < ATTRACT_RADIUS) {
            const t = 1 - dist / ATTRACT_RADIUS
            const inv = 1 / (dist + SOFTEN)

            const ux = dx * inv
            const uy = dy * inv

            const a = ATTRACT_STRENGTH * t * t

            // 吸引
            p.vx += ux * a
            p.vy += uy * a

            // 轻微旋涡（高级感）
            p.vx += -uy * (SWIRL * t)
            p.vy += ux * (SWIRL * t)
          }
        }

        // ✅ 轻微阻尼（不要太强）
        p.vx *= 0.998
        p.vy *= 0.998

        // ✅ 持续微扰动：保证一直漂
        p.vx += (Math.random() - 0.5) * 0.01
        p.vy += (Math.random() - 0.5) * 0.01

        // ✅ 防止完全停住
        const sp = Math.hypot(p.vx, p.vy)
        if (sp < 0.06) {
          const a = Math.random() * Math.PI * 2
          p.vx += Math.cos(a) * 0.08
          p.vy += Math.sin(a) * 0.08
        }

        // 限速
        p.vx = clamp(p.vx, -SPEED_LIMIT, SPEED_LIMIT)
        p.vy = clamp(p.vy, -SPEED_LIMIT, SPEED_LIMIT)

        p.x += p.vx
        p.y += p.vy

        // 穿越边界（更网页感）
        if (p.x < -20) p.x = w + 20
        if (p.x > w + 20) p.x = -20
        if (p.y < -20) p.y = h + 20
        if (p.y > h + 20) p.y = -20
      }

      ctx.globalCompositeOperation = "lighter"
      ctx.lineCap = "round"

      // 画连线（距离越近越明显）
      ctx.lineWidth = 1
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist > LINK_DIST) continue

          const t = 1 - dist / LINK_DIST

          // ✅ 更明显：提高基础亮度 + 衰减更缓
          const baseAlpha = 0.28
          const alpha = baseAlpha * Math.pow(t, 1.25)


          const col = mixRgb(accent, accent2, (a.mix + b.mix) * 0.5)
          ctx.strokeStyle = rgba(col, alpha)

          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      // 画点
      for (const p of particles) {
        const col = mixRgb(accent, accent2, p.mix)
        ctx.fillStyle = rgba(col, 0.6)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerleave", onPointerLeave)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
  <canvas
    ref={canvasRef}
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 z-[1]"
    style={{
      filter: "blur(0.15px)",
      opacity: 0.9,
    }}
  />
)

}
