/**
 * 中英文同义标签合并：同一组内的标签在统计与列表页视为同一个标签。
 * canonical 为 URL 与计数用的唯一键（建议小写英文）；aliases 为该组所有等价写法（含中文、英文等）。
 */

export type TagGroup = {
  /** 唯一键，用于 URL 与合并计数，建议小写英文 */
  canonical: string
  /** 等价标签列表，如 ["心得", "Experience", "experience"] */
  aliases: string[]
}

/** 同义标签分组：可在此增删，如 { canonical: "review", aliases: ["回顾", "Review"] } */
export const TAG_GROUPS: TagGroup[] = [
  { canonical: "experience", aliases: ["心得", "Experience", "experience"] },
  { canonical: "review", aliases: ["回顾", "Review", "review"] },
  { canonical: "diary", aliases: ["日记", "Diary", "diary"] },
  { canonical: "math", aliases: ["数学", "Math", "math"] },
  { canonical: "english", aliases: ["英语", "English", "english"] },
  { canonical: "vocab", aliases: ["词汇", "单词", "Vocab", "vocab", "Vocabulary", "vocabulary"] },
  { canonical: "calculus", aliases: ["微积分", "Calculus", "calculus"] },
]

const BAD = new Set(["", "undefined", "null", "nan"])

function normalize(s: string): string {
  return s.trim().toLowerCase()
}

function buildMaps(): {
  aliasToCanonical: Map<string, string>
  canonicalToDisplay: Map<string, string>
} {
  const aliasToCanonical = new Map<string, string>()
  const canonicalToDisplay = new Map<string, string>()

  for (const g of TAG_GROUPS) {
    const canon = g.canonical.toLowerCase()
    if (!canonicalToDisplay.has(canon)) {
      canonicalToDisplay.set(canon, g.aliases[0] ?? canon)
    }
    for (const a of g.aliases) {
      const key = normalize(a)
      if (key && !BAD.has(key)) aliasToCanonical.set(key, canon)
    }
  }

  return { aliasToCanonical, canonicalToDisplay }
}

const { aliasToCanonical, canonicalToDisplay } = buildMaps()

/**
 * 将任意标签（中文/英文等）解析为合并后的唯一键。
 * 若未配置同义，则返回该标签的 lowercase 形式。
 */
export function resolveTagToCanonical(raw: unknown): string {
  const s = String(raw ?? "").trim()
  const key = normalize(s)
  if (!key || BAD.has(key)) return ""
  return aliasToCanonical.get(key) ?? key
}

/**
 * 获取合并后标签的展示名（取该组第一个 alias，如「心得」）。
 */
export function getCanonicalDisplayName(canonical: string): string {
  const key = canonical.toLowerCase()
  return canonicalToDisplay.get(key) ?? canonical
}
