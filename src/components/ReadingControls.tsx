"use client"

import { useState, useEffect, useMemo } from "react"

interface ReadingControlsProps {
  articleId: string
  content: string
}

export function ReadingControls({ articleId, content }: ReadingControlsProps) {
  // 使用useMemo计算阅读时间，避免useEffect中的setState
  const readingTime = useMemo(() => {
    const chineseCharCount = content.replace(/[^\u4e00-\u9fa5]/g, '').length
    const englishWordCount = content.split(/\s+/).filter(word => word.length > 0).length
    const totalWords = chineseCharCount + englishWordCount
    return Math.ceil(totalWords / 200) // 200字/分钟
  }, [content])

  // 使用useState的初始化函数，避免useEffect中的setState
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedFontSize = localStorage.getItem('reading-font-size')
      return savedFontSize ? Number(savedFontSize) : 16
    }
    return 16
  })

  const [isFocusMode, setIsFocusMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedFocusMode = localStorage.getItem('reading-focus-mode')
      return savedFocusMode === 'true'
    }
    return false
  })

  const [readingProgress, setReadingProgress] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedProgress = localStorage.getItem(`reading-progress-${articleId}`)
      return savedProgress ? Number(savedProgress) : 0
    }
    return 0
  })

  // 保存用户偏好到localStorage
  useEffect(() => {
    localStorage.setItem('reading-font-size', fontSize.toString())
    localStorage.setItem('reading-focus-mode', isFocusMode.toString())
  }, [fontSize, isFocusMode])

  // 保存阅读进度到localStorage
  useEffect(() => {
    localStorage.setItem(`reading-progress-${articleId}`, readingProgress.toString())
  }, [readingProgress, articleId])

  // 由于您已经要求删除这些功能，这里只保留基本结构
  return null
}