# 博客优化建议

基于当前代码与结构整理的**可执行优化建议**，按优先级与投入产出比排序。

---

## 已完成（1 / 2 / 3）

- **1. 方案 A 分页**：`/blog` 列表每页 10 篇，支持 `?page=` 与「上一页 / 下一页」。
- **2. 图片与资源**：`next.config.ts` 已配置 `images.formats: ["image/avif", "image/webp"]`；站外图可加 `remotePatterns`。
- **3. 无障碍**：已加「跳过主内容」链接（`#main`）与 `<main id="main" tabIndex={-1}>`，样式见 `globals.css` 内 `.skip-link`。

**后续自己优化**：见 **[docs/SELF_OPTIMIZATION_GUIDE.md](docs/SELF_OPTIMIZATION_GUIDE.md)**，内有分页/图片/无障碍/性能/SEO 的检查步骤、改哪里、怎么验证。

---

## 一、已修复

- **首页「下一页」死链**：原链接指向不存在的 `/page/2`，已改为「更多文章 →」跳转 `/blog`，并加上 `aria-label`。

---

## 二、高优先级（建议尽快做）

### 1. 分页或「加载更多」 ✅ 已做（方案 A）

- `/blog` 已分页，每页 10 篇；首页「更多文章 →」跳转 `/blog`。扩展方式见 `docs/SELF_OPTIMIZATION_GUIDE.md` 第三节。

### 2. 图片与资源优化 ✅ 已做

- `next.config.ts` 已设 `images.formats`；头像/OG 建议保持适中尺寸；站外图需时加 `remotePatterns`。详见自优化文档第四节。

### 3. 无障碍（a11y） ✅ 已做

- 已加跳过链接与 `main` 地标；其余（焦点、对比度等）见 `docs/SELF_OPTIMIZATION_GUIDE.md` 第五节。

---

## 三、中优先级（体验与可维护性）

### 4. 性能

- **首屏 JS**：`ParticlesBackground`、`PageTransition` 等已为 client 组件，可考虑：
  - 粒子用 `dynamic(..., { ssr: false })` 或放到底部，减少首屏阻塞。
  - 对非首屏必需的大组件（如部分动效）使用 `next/dynamic` 懒加载。
- **字体**：若未用 `next/font`，可引入 `next/font/google` 选 1～2 个字体并 preload，减少 FOUT、提升观感。
- **MDX/Shiki**：文章页已用 `rehype-pretty-code`，构建时高亮；若单篇文章很大，可再评估是否需流式或分段。

### 5. SEO 与分享

- **每篇文章**：`blog/[slug]/page.tsx` 已设 `generateMetadata`（title、description、OG、Twitter），保持每篇都有唯一 `description` 和合理 `keywords`（如 tags）。
- **首页**：layout 的 `metadata` 已统一，可再确认 `NEXT_PUBLIC_SITE_URL` 在正式环境正确，以便 OG 链接正确。
- **结构化数据**：可选在文章页加 JSON-LD（`Article`、`BlogPosting`），利于搜索引擎与社交预览。

### 6. RSS / 订阅

- **现状**：已有 `rss.xml`、`feed.json` 路由。
- **建议**：在首页或 header/footer 增加「订阅」或「RSS」链接，指向 `/rss.xml` 或 `/feed.json`，方便读者订阅。

### 7. 暗色模式

- **现状**：`globals.css` 已有 `html.dark` 的 CSS 变量，但未见切换逻辑。
- **建议**：在 header 或侧栏加「深色/浅色」切换，用 `next-themes` 或自写脚本切换 `html` 的 `class` 或 `data-theme`，并持久化到 `localStorage`。

---

## 四、低优先级（锦上添花）

### 8. 阅读体验

- **预估阅读时间**：文章页已有「X 分钟」，可在列表卡片上也显示（若接口/数据已有）。
- **上一篇/下一篇**：文章页已有同 collection 的上一篇/下一篇，可保持并确保链接有效。

### 9. 评论与互动

- 若要类似参考站的 Disqus，可接 Disqus / Giscus / Utterances 等，在 `blog/[slug]/page.tsx` 底部加评论组件（client），按需加载。

### 10. 安全与配置

- **环境变量**：敏感信息放 `.env.local`，不要提交；`NEXT_PUBLIC_*` 仅放前端需要的。
- **CSP / 安全头**：若部署到 Vercel，可在 `next.config.ts` 的 `headers` 中加简单 CSP 或 X-Frame-Options（按需）。

### 11. 代码与维护

- **重复逻辑**：首页与 `/blog` 列表的「卡片」结构略有不同，若希望完全统一，可抽成共用的 `PostCard` 或 `ArticlePreview`，通过 props 控制「居中/左对齐」等样式。
- **类型**：关键处已有 TypeScript，可保持 `PostMeta`、`TocItem` 等类型集中定义并在全站复用。
- **测试**：可为 `getAllPosts`、`getPostBySlug`、`extractToc` 等写单元测试，防止改坏。

---

## 五、清单速览

| 项           | 优先级 | 说明 |
|--------------|--------|------|
| 首页「下一页」死链 | ✅ 已修 | 改为「更多文章 →」链到 `/blog` |
| 分页/加载更多   | ✅ 已做 | `/blog` 每页 10 篇，上一页/下一页 |
| 图片与 next/image | ✅ 已做 | next.config 已设 formats，站外图可加 remotePatterns |
| 无障碍（跳过链接、main id） | ✅ 已做 | 跳过主内容 + main#main，详见自优化文档 |
| 粒子/动效懒加载 | 中     | 减少首屏 JS |
| 字体（next/font） | 中   | 减少 FOUT |
| RSS 入口      | 中     | 首页/header 放订阅链接 |
| 暗色模式      | 中     | 切换 + 持久化 |
| 评论（Disqus/Giscus） | 低 | 按需 |
| JSON-LD      | 低     | 文章页结构化数据 |

按需从高到低逐项实现即可；若你告诉我当前最想先做哪一块（例如分页、a11y、暗色），可以再给出对应文件级修改方案或代码片段。
