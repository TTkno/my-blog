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
  responseStrength: number // 0.5~1.2 分层深度：对光标吸引/连线的响应强度
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
    // 平滑后的指针位置（用于吸引与连线，避免光标抖动导致线条闪烁）
    let smoothX = pointer.x
    let smoothY = pointer.y
    const POINTER_LERP = 0.12 // 每帧向真实指针靠拢的比例，越小越平滑
    let lastPointerMoveAt = 0
    const POINTER_INACTIVE_MS = 150

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

      // 粒子数量：桌面偏密；移动端/窄屏减少数量（静态度），保证性能
      const isNarrow = w < 768
      const areaDiv = isNarrow ? 20000 : 14000
      const target = clamp(
        Math.floor((w * h) / areaDiv),
        isNarrow ? 40 : 80,
        isNarrow ? 100 : 180
      )

      while (particles.length < target) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: 0.9 + Math.random() * 0.6,
          mix: Math.random(),
          responseStrength: 0.5 + Math.random() * 0.7, // 分层：0.5~1.2，部分粒子对光标更敏感
        })
      }
      if (particles.length > target) particles.splice(target)
    }

    const onResize = () => resize()

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.active = true
      lastPointerMoveAt = Date.now()
    }

    const onPointerLeave = () => {
      pointer.active = false
      pointer.x = -9999
      pointer.y = -9999
    }

    resize()
    window.addEventListener("resize", onResize)
    window.addEventListener("pointermove", onPointerMove, { passive: true })
    window.addEventListener("pointerleave", onPointerLeave)

    const tick = () => {
      const { accent, accent2 } = getTheme()
      ctx.clearRect(0, 0, w, h)

      // ===== 点线 + 鼠标吸引（分层深度 + 静态度）=====
      const isNarrowOrTouch = w < 768
      const staticity = isNarrowOrTouch ? 0.65 : 1 // 移动端/窄屏减弱吸引，保证性能与省电
      const LINK_DIST = 180
      const MOUSE_LINK_DIST = 250
      const SPEED_LIMIT = 1.4

      const ORBIT_RADIUS_MIN = 40
      const ORBIT_RADIUS_MAX = 280
      const ORBIT_STRENGTH = 0.22 * staticity // 切线力：绕光标旋转
      const RADIAL_STRENGTH = 0.04 * staticity // 很弱的向心/离心，维持轨道带
      const SOFTEN = 20
      const PREFERRED_RADIUS = 120 // 粒子倾向停留的半径带
      // ================================================

      // 平滑指针：每帧向真实位置插值，减少抖动与线条闪烁
      if (pointer.active) {
        smoothX += (pointer.x - smoothX) * POINTER_LERP
        smoothY += (pointer.y - smoothY) * POINTER_LERP
      } else {
        smoothX += (pointer.x - smoothX) * 0.04
        smoothY += (pointer.y - smoothY) * 0.04
      }

      if (pointer.active) {
        const now = Date.now()
        if (now - lastPointerMoveAt > POINTER_INACTIVE_MS) pointer.active = false
        if (pointer.x < -50 || pointer.x > w + 50 || pointer.y < -50 || pointer.y > h + 50) pointer.active = false
      }

      const useX = pointer.active ? smoothX : pointer.x
      const useY = pointer.active ? smoothY : pointer.y

      // 更新粒子：轨道吸引（绕光标旋转 + 弱向心维持轨道带）
      for (const p of particles) {
        if (pointer.active) {
          const dx = p.x - useX
          const dy = p.y - useY
          const dist = Math.hypot(dx, dy)

          if (dist > 0.001 && dist < ORBIT_RADIUS_MAX) {
            const inv = 1 / (dist + SOFTEN)
            const rx = dx * inv
            const ry = dy * inv
            // 切线方向（逆时针）：垂直于 (dx,dy)，即 (-ry, rx) 已归一化
            const tx = -ry
            const ty = rx
            const resp = p.responseStrength

            // 在有效半径带内才施加轨道力，避免边缘乱飞
            const inBand = dist >= ORBIT_RADIUS_MIN && dist <= ORBIT_RADIUS_MAX
            const bandT = inBand
              ? 1 - 0.6 * Math.abs(dist - PREFERRED_RADIUS) / (ORBIT_RADIUS_MAX - PREFERRED_RADIUS)
              : 0
            const orbitEase = Math.max(0, Math.pow(bandT, 0.9))

            p.vx += tx * (ORBIT_STRENGTH * orbitEase * resp)
            p.vy += ty * (ORBIT_STRENGTH * orbitEase * resp)

            // 弱径向：太近则向外推、太远则向内拉，使粒子维持在偏好半径带附近
            const radialDir = dist < PREFERRED_RADIUS ? 1 : -1
            const radialEase =
              dist < PREFERRED_RADIUS
                ? 1 - dist / PREFERRED_RADIUS
                : Math.min(1, (dist - PREFERRED_RADIUS) / (ORBIT_RADIUS_MAX - PREFERRED_RADIUS))
            const radialMag = RADIAL_STRENGTH * radialEase * resp * radialDir
            p.vx += rx * radialMag
            p.vy += ry * radialMag
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

      // 画连线（粒子之间，距离越近越亮）
      ctx.lineWidth = 0.9
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist > LINK_DIST) continue

          const t = 1 - dist / LINK_DIST
          const baseAlpha = 0.36
          const alpha = baseAlpha * Math.pow(t, 1.15)
          const col = mixRgb(accent, accent2, (a.mix + b.mix) * 0.5)
          ctx.strokeStyle = rgba(col, alpha)
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      // 粒子到鼠标的连线：按角度扇区均匀选 1 条/扇区，射线呈星形，更干净
      const MOUSE_LINK_MIN = 48
      const MOUSE_LINK_SECTORS = 16
      const MOUSE_LINK_ALPHA = 0.11
      if (pointer.active && useX >= 0 && useX <= w && useY >= 0 && useY <= h) {
        const twoPi = Math.PI * 2
        const sectorWidth = twoPi / MOUSE_LINK_SECTORS
        const bestInSector: ({ p: Particle; dist: number } | null)[] = Array(MOUSE_LINK_SECTORS).fill(null)

        for (const p of particles) {
          const dx = p.x - useX
          const dy = p.y - useY
          const dist = Math.hypot(dx, dy)
          if (dist < MOUSE_LINK_MIN || dist > MOUSE_LINK_DIST) continue
          const angle = Math.atan2(dy, dx) + Math.PI
          const sector = Math.min(Math.floor(angle / sectorWidth), MOUSE_LINK_SECTORS - 1)
          const cur = bestInSector[sector]
          if (!cur || dist < cur.dist) bestInSector[sector] = { p, dist }
        }

        ctx.lineWidth = 0.7
        for (const item of bestInSector) {
          if (!item) continue
          const { p, dist } = item
          const t = 1 - dist / MOUSE_LINK_DIST
          const alpha = MOUSE_LINK_ALPHA * Math.pow(t, 1.35) * p.responseStrength
          const col = mixRgb(accent, accent2, p.mix)
          ctx.strokeStyle = rgba(col, alpha)
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(useX, useY)
          ctx.stroke()
        }
      }

      // 画点（小圆点，柔和）
      for (const p of particles) {
        const col = mixRgb(accent, accent2, p.mix)
        ctx.fillStyle = rgba(col, 0.55)
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
    <div
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{
          opacity: 0.85,
          filter: "blur(0.2px)",
        }}
      />
    </div>
  )

}
