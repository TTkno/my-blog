"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"

const easeOut = [0.22, 1, 0.36, 1] as const

type FadeInProps = {
  children: ReactNode
  /** 延迟（秒） */
  delay?: number
  /** 是否禁用 Y 位移，仅淡入 */
  noY?: boolean
  /** 子元素作为列表时，是否交错动画（按 index 增加 delay） */
  stagger?: boolean
  staggerDelay?: number
}

export function FadeIn({
  children,
  delay = 0,
  noY = false,
  // stagger / staggerDelay 保留在 FadeInProps 中供 API 兼容，本组件未使用
}: FadeInProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <>{children}</>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: noY ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.28,
        ease: easeOut,
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}

/** 用于包裹多个子元素并交错进入 */
export function StaggerFadeIn({
  children,
  delay = 0,
  staggerDelay = 0.05,
  className,
}: {
  children: ReactNode
  delay?: number
  staggerDelay?: number
  className?: string
}) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

/** 单条子项变体，与 StaggerFadeIn 配合：子元素用 motion.div variants={itemVariants} */
export const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  },
}
