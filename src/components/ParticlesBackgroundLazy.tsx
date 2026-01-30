"use client"

import dynamic from "next/dynamic"

/** 粒子背景懒加载，不阻塞首屏；仅客户端渲染（dynamic + ssr:false 须在 Client Component 中使用） */
const ParticlesBackground = dynamic(
  () =>
    import("@/components/ParticlesBackground").then((m) => ({
      default: m.ParticlesBackground,
    })),
  { ssr: false }
)

export function ParticlesBackgroundLazy() {
  return <ParticlesBackground />
}
