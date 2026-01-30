import fs from "fs"
import path from "path"
import { createInterface } from "readline"

const POSTS_DIR = path.join(process.cwd(), "content", "posts")

function today() {
  return new Date().toISOString().slice(0, 10)
}

function slugify(input) {
  const s = String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-|\-$/g, "")
  if (s) return s
  const rand = Math.random().toString(36).slice(2, 7)
  return `${today()}-${rand}`
}

function parseTags(input) {
  if (!input) return []
  return String(input)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((t) => !["undefined", "null", "nan"].includes(t.toLowerCase()))
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function uniqueFilePath(baseSlug) {
  let slug = baseSlug
  let i = 2
  while (
    fs.existsSync(path.join(POSTS_DIR, `${slug}.mdx`)) ||
    fs.existsSync(path.join(POSTS_DIR, `${slug}.md`))
  ) {
    slug = `${baseSlug}-${i++}`
  }
  return { slug, filePath: path.join(POSTS_DIR, `${slug}.mdx`) }
}

function frontmatter({ title, date, tags, description, collection }) {
  const tagsArr = tags.length
    ? `["${tags.map((t) => t.replace(/"/g, '\\"')).join('","')}"]`
    : "[]"
  const desc = (description ?? "").replace(/"/g, '\\"')

  return (
    `---\n` +
    `title: "${title.replace(/"/g, '\\"')}"\n` +
    `date: "${date}"\n` +
    `tags: ${tagsArr}\n` +
    (desc ? `description: "${desc}"\n` : "") +
    (collection ? `collection: "${collection}"\n` : "") +
    `draft: true\n` + // ✅ 默认草稿
    `---\n`
  )
}

function tplSolution() {
  return `\n## 题目\n**Contest:** \n**Problem:** \n**Link:** \n\n## 思路\n\n\n## 做法\n1. \n2. \n\n## 时空复杂度\n- 时间：O()\n- 空间：O()\n\n## 代码\n\`\`\`cpp\n// TODO\n\`\`\`\n\n## 总结\n- \n`
}

function tplContest() {
  return `\n## 比赛信息\n**平台:** Codeforces / AtCoder / ...\n**时间:** \n**排名:** \n**解题:** A / B / C / D ...\n\n## 总体思路\n- \n\n## 各题总结\n### A. [题目](链接)\n- 难度：\n- 思路：\n- 代码：\n\n### B. [题目](链接)\n- 难度：\n- 思路：\n- 代码：\n\n## 收获与反思\n- \n`
}

function tplDiary() {
  return `\n## 今日训练\n- 平台：\n- 通过：\n- 未过：\n\n## 遇到的问题\n- \n\n## 今天学到的\n- \n\n## 明天计划\n- \n`
}

function tplNote() {
  return `\n## 概念\n\n\n## 关键性质\n1. \n2. \n\n## 代码模板\n\`\`\`cpp\n// TODO\n\`\`\`\n\n## 应用场景\n- \n\n## 参考资料\n- \n`
}

function chooseTemplate(kind) {
  switch (kind) {
    case "contest":
      return tplContest()
    case "diary":
      return tplDiary()
    case "note":
      return tplNote()
    case "solution":
    default:
      return tplSolution()
  }
}

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (ans) => {
      rl.close()
      resolve(ans)
    })
  })
}

async function main() {
  ensureDir(POSTS_DIR)

  const title = (await ask("标题 title：")).toString().trim() || "Untitled"
  const kindRaw = (await ask("类型（solution/contest/diary/note）[solution]："))
    .toString()
    .trim()
    .toLowerCase()
  const kind = ["solution", "contest", "diary", "note"].includes(kindRaw) ? kindRaw : "solution"

  const tagsInput = (await ask("标签 tags（逗号分隔，可空）：")).toString()
  const tags = parseTags(tagsInput)

  const desc = (await ask("简介 description（可空）：")).toString().trim()

  const collectionDefault = kind === "diary" ? "diary" : kind === "note" ? "note" : "algo"
  const collectionInput = (await ask(`分类 collection（默认 ${collectionDefault}，可改）：`))
    .toString()
    .trim()
  const collection = collectionInput || collectionDefault

  const baseSlug = slugify(title)
  const { slug, filePath } = uniqueFilePath(baseSlug)

  const fm = frontmatter({
    title,
    date: today(),
    tags,
    description: desc,
    collection,
  })

  const body = chooseTemplate(kind)
  fs.writeFileSync(filePath, fm + body, "utf8")

  console.log("\n✅ 已创建：")
  console.log("slug:", slug)
  console.log("file:", filePath)
  console.log("提示：默认是 draft:true，发布前删掉或改成 false\n")
}

main().catch((e) => {
  console.error("❌ 创建失败：", e)
  process.exit(1)
})
