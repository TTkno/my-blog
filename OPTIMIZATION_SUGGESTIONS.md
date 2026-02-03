# 博客优化建议

基于当前代码与结构整理的**可执行优化建议**，按优先级与投入产出比排序。

---

## 已完成（1 / 2 / 3）

- **1. 方案 A 分页**：`/blog` 列表每页 10 篇，支持 `?page=` 与「上一页 / 下一页」。
- **2. 图片与资源**：`next.config.ts` 已配置 `images.formats: ["image/avif", "image/webp"]`；站外图可加 `remotePatterns`。
- **3. 无障碍**：已加「跳过主内容」链接（`#main`）与 `<main id="main" tabIndex={-1}>`，样式见 `globals.css` 内 `.skip-link`。

**后续自己优化**：见 **[docs/SELF_OPTIMIZATION_GUIDE.md](docs/SELF_OPTIMIZATION_GUIDE.md)**，内有**文章模板**、头像与描述、分页、图片、无障碍、进入动画、性能、SEO 的检查步骤、改哪里、怎么验证。

---

## 当前优化建议（尚未做的可优先考虑）

| 项 | 优先级 | 说明 |
|----|--------|------|
| **JSON-LD** | 中 | 文章页加 `Article`/`BlogPosting` 结构化数据，利于 SEO 与分享预览。改：`blog/[slug]/page.tsx` 内加 `<script type="application/ld+json">`。 |
| **列表阅读时间** | 低 | 首页/博客列表卡片上显示「X 分钟」。改：`PostCard` 接收 `readMinutes`，列表处用 `Math.ceil(content.length/500)` 传入。 |
| **评论** | 低 | 按需接 Giscus / Utterances / Disqus，在文章页底部按需加载。 |
| **CSP / 安全头** | 低 | 部署时在 `next.config.ts` 的 `headers` 中按需加 CSP 或 X-Frame-Options。 |

**已完成**：分页、图片、无障碍、粒子懒加载、字体、进入动画、暗色模式（ThemeToggle + localStorage）、代码块/卡片样式优化。**已移除**：RSS 订阅入口（按需可再在 footer 加链接到 `/rss.xml`）。其余见自优化文档。

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
| 粒子/动效懒加载 | ✅ 已做 | `ParticlesBackgroundLazy` + `ssr: false` |
| 字体（next/font） | ✅ 已做 | Noto Sans SC + `font-sans` |
| 进入动画      | ✅ 已做 | 首页/列表/文章页 FadeIn、统一缓动、useReducedMotion |
| 暗色模式      | ✅ 已做 | ThemeToggle + localStorage + 主题脚本防闪 |
| RSS 入口      | 已移除 | 按需可在 footer 加链接到 `/rss.xml` |
| 评论（Disqus/Giscus） | 低 | 按需 |
| JSON-LD      | 中     | 文章页结构化数据 |
| 列表阅读时间  | 低     | 卡片上显示「X 分钟」 |

按需从高到低逐项实现即可；若你告诉我当前最想先做哪一块（例如分页、a11y、暗色），可以再给出对应文件级修改方案或代码片段。

---

## 其他优化建议（体验与维护）

| 项 | 优先级 | 改哪里 / 说明 |
|----|--------|----------------|
| **列表卡片阅读时间** | 低 | `PostCard` 增加 `readMinutes` prop；`HomePageContent`、`BlogListClient` 用 `getAllPosts()`/列表数据算 `Math.ceil(content.length/500)` 传入。 |
| **JSON-LD 结构化数据** | 中 | `blog/[slug]/page.tsx` 内加 `<script type="application/ld+json">`，包含 `@type: "BlogPosting"`、title、description、datePublished、author、url。利于搜索引擎与社交预览。 |
| **安全头** | 低 | `next.config.ts` → `headers`：可加 `X-Frame-Options: DENY`、`X-Content-Type-Options: nosniff`；需要时再配 CSP。 |
| **评论（按需）** | 低 | 文章页底部加 Giscus/Utterances 等，用 `next/dynamic` 按需加载，避免首屏阻塞。 |
| **打印样式** | 低 | `globals.css` 已有 `@media print` 隐藏 `.no-print`；可再为 `.prose` 调字号、行距、隐藏侧栏/导航，便于打印长文。 |
| **焦点可见性** | 低 | 确保可点击元素 `:focus-visible` 有清晰轮廓（如 `outline: 2px solid rgb(var(--ring))`），键盘用户可辨。 |
| **搜索高亮** | 低 | `/search` 结果页对匹配关键词做 `<mark>` 或高亮样式，提升可读性。 |
| **单元测试** | 低 | 为 `lib/posts.ts` 的 `getAllPosts`、`getPostBySlug`、`extractToc` 等写 Jest/Vitest 用例，防止改坏。 |

---

## UI 与鼠标悬停优化建议

### 已做（本次）

- **侧栏导航 (.nav-pill)**：悬停时背景 `surface2`、边框淡显；键盘聚焦 `:focus-visible` 使用 `--ring` 轮廓。
- **文章卡片标题**：悬停时标题颜色使用主题色 `rgb(var(--accent))`，与主题一致。
- **目录 (TOC)**：非当前项使用 `--muted` / `--text`，悬停用 `--surface2`，明暗主题均可用。

### 可继续做的

| 项 | 改哪里 | 说明 |
|----|--------|------|
| **链接/按钮统一 focus-visible** | 各组件 | 所有可点击元素加 `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--ring))]`，或全局在 `globals.css` 为 `a, button` 设 `:focus-visible` 轮廓。 |
| **卡片悬停缓动** | `globals.css` 或 `PostCard` | `.card` 已用 `transition`；可把 `duration-300` 统一为 200–250ms，或加 `ease-out` 使悬停更顺滑。 |
| **代码块复制按钮** | `globals.css` | 已支持 hover/focus 显示；可加「悬停代码块时按钮轻微放大」或「复制成功短动画」提升反馈。 |
| **标签 / Chip 悬停** | `PostCard`、`tags` 页 | 标签悬停时轻微加深背景或边框（如 `hover:opacity-90` 或 `hover` 下用 `rgb(var(--accent)/0.15)`）。 |
| **首页「更多文章」** | `page.tsx`、`HomePageContent` | 链接加下划线或颜色变化（如 `hover:text-[rgb(var(--accent))]`），与正文链接风格统一。 |
| **搜索/归档/关于页按钮** | `SearchPalette`、`archives`、`about` | 与侧栏 nav-pill 一致：悬停背景、focus-visible 轮廓。 |
| **减少重复 transition 声明** | 全站 | 在 `globals.css` 为 `.card`、`.nav-pill`、`.chip` 等统一定义 `transition`，组件少写重复类。 |

---

## 还有什么优化建议（补充清单）

按**投入产出比**排序，可按需逐项做。

### 高性价比（建议优先）

| 项 | 改哪里 | 说明 |
|----|--------|------|
| **JSON-LD 结构化数据** | `blog/[slug]/page.tsx` | 在正文前加 `<script type="application/ld+json">`，包含 `@type: "BlogPosting"`、title、description、datePublished、author、url。利于搜索引擎与社交预览。 |
| **安全头** | `next.config.ts` → `headers` | 加 `X-Frame-Options: DENY`、`X-Content-Type-Options: nosniff`，部署时一次配置即可。 |
| **全局 focus-visible** | `globals.css` | 为 `a[href], button` 统一设 `:focus-visible { outline: 2px solid rgb(var(--ring)); outline-offset: 2px; }`，键盘用户可辨。 |

### 体验与内容

| 项 | 改哪里 | 说明 |
|----|--------|------|
| **列表卡片阅读时间** | `PostCard` + 首页/博客列表 | `PostCard` 增加 `readMinutes` prop；列表处用 `Math.ceil(content.length/500)` 传入并展示「X 分钟」。 |
| **搜索关键词高亮** | `SearchClient.tsx` 或结果列表 | 对匹配的 title/description 中的关键词用 `<mark>` 或高亮样式包裹，提升可读性。 |
| **打印样式** | `globals.css` → `@media print` | 隐藏侧栏/导航/粒子，`.prose` 适当加大字号与行距，便于打印长文。 |
| **评论（按需）** | `blog/[slug]/page.tsx` | 底部加 Giscus/Utterances，用 `next/dynamic` 懒加载，避免首屏阻塞。 |

### 性能与工程

| 项 | 改哪里 | 说明 |
|----|--------|------|
| **Bundle 分析** | `package.json` + `next.config.ts` | 安装 `@next/bundle-analyzer`，构建时生成体积报告，便于发现大依赖。 |
| **首屏图片** | 头像/OG 等 | 首屏可见的 `next/image` 加 `priority`（ProfileCard 已有）；其余保持默认懒加载。 |
| **Lighthouse 自检** | 本地或 CI | 定期用 Lighthouse 跑 Performance / Accessibility，关注 LCP、CLS、焦点顺序。 |
| **单元测试** | `lib/posts.ts` 等 | 为 `getAllPosts`、`getPostBySlug`、`extractToc` 写 Jest/Vitest，防止改坏。 |

### 可选（锦上添花）

| 项 | 改哪里 | 说明 |
|----|--------|------|
| **PWA / manifest** | `public/manifest.json` + layout | 提供 `manifest.json` 和 `<link rel="manifest">`，支持「添加到主屏幕」。 |
| **theme-color** | `layout.tsx` → `<head>` | 加 `<meta name="theme-color" content="..." />` 随明暗主题切换，地址栏/状态栏与主题一致。 |
| **RSS 入口（按需）** | footer 或 header | 若需订阅，加「RSS」链接到 `/rss.xml` 或 `/feed.json`。 |
| **列表/首页卡片统一** | 抽 `PostCard` | 首页与 `/blog` 列表若结构一致，可统一用同一 `PostCard`，通过 props 控制布局。 |

### 验收建议

- 做完一项：`npm run build` 通过，本地点关键路径（首页、列表、文章、搜索）无报错。
- 改样式：在窄屏/宽屏各看一遍，明暗主题都过一眼。
- 部署前：确认生产环境 `NEXT_PUBLIC_SITE_URL` 正确，OG 与 sitemap 域名一致。
