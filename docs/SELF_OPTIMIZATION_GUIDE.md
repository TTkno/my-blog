# 自优化内容指导

本文档帮助你**自己动手**做后续优化：按步骤检查、改哪里、怎么验证。适合在完成 1/2/3 项优化后，按需做分页、图片、无障碍、性能等改进。

---

## 一、如何用这份文档

- **想做某类优化时**：在下面找到对应章节，按「检查 → 修改 → 验证」三步走。
- **不确定改哪**：先看「二、项目结构速览」，再按功能找对应文件。
- **改完记得**：本地 `npm run build` 与 `npm run dev` 跑一遍，必要时用「五、自检清单」过一遍。

---

## 二、项目结构速览

| 用途         | 路径/文件 |
|--------------|-----------|
| 首页         | `src/app/page.tsx` |
| 博客列表/分页 | `src/app/blog/page.tsx`、`src/app/blog/BlogListClient.tsx` |
| 文章详情     | `src/app/blog/[slug]/page.tsx` |
| 全局布局     | `src/app/layout.tsx` |
| 全局样式     | `src/app/globals.css` |
| 主题变量     | `globals.css` 内 `:root`、`html.dark` |
| 站点信息     | `src/site.ts` |
| 文章数据     | `src/lib/posts.ts`、`content/posts/*.mdx` |
| 图片配置     | `next.config.ts` → `images` |
| 无障碍       | `layout.tsx` 跳过链接、`<main id="main">`，`globals.css` 内 `.skip-link` |

---

## 三、头像与描述文字修改指导

### 3.1 头像

| 步骤 | 操作 |
|------|------|
| 1 | 准备一张方形图片（建议 256×256 或 512×512，格式 PNG/JPG，体积几百 KB 内）。 |
| 2 | 将图片命名为 **`avatar.png`**，放到项目根目录下的 **`public/`** 文件夹中（即 `public/avatar.png`）。 |
| 3 | 若改用其他文件名（如 `me.jpg`），需改 **`src/site.ts`** 里的 `avatar` 字段，例如：`avatar: "/me.jpg"`。 |

**会显示头像的地方**：侧栏个人卡片、文章页合并侧栏卡片的「个人」Tab。OG/社交分享图由 `opengraph-image` 等单独配置，若需与头像一致可在对应路由里引用同一路径。

### 3.2 站点名称与描述（副标题）

| 改什么 | 改哪里 | 说明 |
|--------|--------|------|
| 站点名称 | `src/site.ts` → **`name`** | 用于 header、footer、页面标题模板、OG 等。 |
| 站点描述/副标题 | `src/site.ts` → **`subtitle`** | 一句话介绍博客，会出现在侧栏简介、首页标题下方、layout 的 `metadata.description` 等。 |

**示例**（`src/site.ts`）：

```ts
export const site = {
  name: "你的名字或博客名",
  subtitle: "一句话描述：这里会写什么、给谁看",
  avatar: "/avatar.png",
  // socials、links 同理可改
}
```

### 3.3 首页标题下方那一行

首页大标题下的副标题（如「Aphrodite 的竞程日记 · 记录解题与心得」）已改为使用 **`site.name`** 和 **`site.subtitle`**，改完 `src/site.ts` 后刷新首页即可生效，无需再改 `page.tsx`。

### 3.4 验证

- 换头像后：刷新侧栏、文章页「个人」Tab，确认头像已更新；清除缓存再看 OG 预览（若已用同一图）。
- 改 name/subtitle 后：看 header、首页标题下、浏览器标签页标题、分享预览是否一致。

---

## 四、分页（方案 A 已实现，可自行扩展）

### 4.1 当前实现

- 首页：「更多文章 →」链到 `/blog`。
- `/blog`：`BlogListClient` 用 `?page=` 分页，每页 10 篇，上一页/下一页。

### 4.2 你想改的常见点

| 目标           | 改哪里 | 说明 |
|----------------|--------|------|
| 每页篇数       | `BlogListClient.tsx` 顶部 `PAGE_SIZE = 10` | 改成 15、20 等即可。 |
| 显示页码 1 2 3 | `BlogListClient.tsx` 底部「分页」区域 | 用 `Array.from({ length: totalPages })` 生成链接到 `/blog?page=N`。 |
| 首页也分页     | 新建 `src/app/page/[num]/page.tsx` | 用 `getAllPosts()` 按 `(num-1)*PAGE_SIZE` 切片，列表复用首页卡片组件。 |

### 4.3 验证

- 打开 `/blog`，看是否只显示 10 篇。
- 点「下一页」应到 `/blog?page=2`，再点「上一页」回 `/blog`。
- 文章总数不足一页时，不应出现分页栏。

---

## 五、图片与资源优化

### 5.1 已做配置

- `next.config.ts` 中 `images.formats: ["image/avif", "image/webp"]`，Next 会优先输出现代格式。

### 5.2 你自己可做的

| 目标           | 改哪里 | 说明 |
|----------------|--------|------|
| 头像/OG 尺寸   | `public/avatar.png` | 建议 256×256 或 512×512，体积控制在几百 KB 内。 |
| 站外图片       | `next.config.ts` → `images` | 若文章引用外站图，加 `remotePatterns`（Next 13.4+）或 `domains`。 |
| 图片懒加载     | 已用 `next/image` 时默认懒加载 | 无需额外配置。 |
| 字体优化       | `layout.tsx` | 用 `next/font/google` 引入 1～2 个字体，减少 FOUT。 |

### 5.3 验证

- 部署后看 Network：图片请求是否带 `avif`/`webp`。
- 用 Lighthouse 跑一次「Performance」和「Best Practices」。

---

## 六、无障碍（已做跳过链接 + main 地标）

### 6.1 当前实现

- 页面顶部有「跳过主内容」链接，获得焦点时显示，跳转到 `#main`。
- `<main id="main" tabIndex={-1}>`，便于键盘/读屏直接进入主内容。

### 6.2 你自己可做的

| 目标           | 改哪里 | 说明 |
|----------------|--------|------|
| 按钮/链接文案  | 各组件 | 确保可点击元素有清晰文字或 `aria-label`（如图标按钮）。 |
| 表单           | 若有 | 每个 input 配 `<label>` 或 `aria-label`，错误用 `aria-describedby`。 |
| 焦点顺序       | 弹窗/抽屉 | 打开时焦点移入，关闭时焦点回到触发按钮（焦点 trap 可选）。 |
| 颜色对比       | `globals.css` | 正文与背景对比度建议 ≥4.5:1，可用 DevTools 或 [contrast checker](https://webaim.org/resources/contrastchecker/) 检查。 |

### 6.3 验证

- 键盘：Tab 到「跳过主内容」→ Enter，应跳到主内容再继续 Tab。
- 读屏：打开 NVDA/VoiceOver，听「跳过主内容」与主内容朗读是否合理。
- Lighthouse：「Accessibility」项尽量无红色。

---

## 八、性能（可选）

### 8.1 已做

- **粒子懒加载**：`layout.tsx` 中 `ParticlesBackground` 已用 `next/dynamic(..., { ssr: false })` 懒加载，仅客户端渲染，不阻塞首屏。
- **字体**：已用 `next/font/google` 引入 `Noto_Sans_SC`，`display: "swap"` 减少 FOUT；`tailwind.config.ts` 中 `fontFamily.sans` 使用 `var(--font-sans)`，`body` 使用 `font-sans`。

### 8.2 你可继续做的

| 目标           | 改哪里 | 说明 |
|----------------|--------|------|
| 大组件懒加载   | 各页 | 对非首屏必需的大组件用 `next/dynamic` 懒加载。 |
| 换字体         | `layout.tsx` | 将 `Noto_Sans_SC` 换成其他 `next/font/google` 字体，或加 `next/font/local`。 |

### 8.3 验证

- Lighthouse Performance 分数、FCP/LCP。
- `npm run build` 看 bundle 体积，必要时用 `@next/bundle-analyzer` 分析。

---

## 七、进入动画（已统一缓动与进入效果）

### 7.1 当前实现

- **路由切换**：`PageTransition`（`src/components/PageTransition.tsx`）包住主内容，切换页面时淡入 + 轻微上移 + 去模糊，尊重 `prefers-reduced-motion`。
- **首页**：标题区与文章卡片使用 `FadeIn` / 交错进入（`HomePageContent` 客户端组件），每张卡片错开约 0.05s。
- **博客列表**：标题区淡入，列表项交错淡入上移（`BlogListClient`），缓动 `[0.22, 1, 0.36, 1]`。
- **文章页**：主内容区（标题 + 侧栏 + 正文）整体淡入上移（`FadeIn` 包裹）。

### 7.2 你想改的常见点

| 目标           | 改哪里 | 说明 |
|----------------|--------|------|
| 调快/调慢      | 各组件内 `transition.duration`、`delay` | 如 `PageTransition` 的 `duration: 0.22`，卡片 `delay: i * 0.05`。 |
| 关闭动画       | 系统「减少动态效果」或组件内 `useReducedMotion()` | 已对路由过渡、首页、列表做 `useReducedMotion` 判断，为 true 时不播进入动画。 |
| 换缓动         | `ease` 或 `ease: [0.22, 1, 0.36, 1]` | 当前统一为类似 easeOut 的贝塞尔，可按需改为 `easeOut`、`easeInOut` 等。 |

### 7.3 验证

- 刷新首页、/blog、文章页，看首屏进入是否顺滑。
- 系统开启「减少动态效果」后刷新，进入动画应不再播放或明显减弱。

---

## 九、SEO 与分享

### 9.1 已有

- 每篇文章有 `generateMetadata`（title、description、OG、Twitter）。
- `sitemap.ts`、`robots.ts`、RSS/feed 路由。

### 9.2 你自己可做的

| 目标           | 改哪里 | 说明 |
|----------------|--------|------|
| 每篇 description | 文章 frontmatter 或 `generateMetadata` | 确保每篇有唯一、简短的 `description`。 |
| 结构化数据     | `blog/[slug]/page.tsx` | 在页面内加 JSON-LD（`Article`/`BlogPosting`），用 `<script type="application/ld+json">`。 |
| RSS 入口       | `layout.tsx` 或首页/ footer | 增加「订阅」/「RSS」链接到 `/rss.xml` 或 `/feed.json`。 |

### 9.3 验证

- 用 [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) 或类似工具看 OG 是否正确。
- 搜索「site:你的域名」看收录与标题描述。

---

## 十、自检清单（改完可勾）

- [ ] `npm run build` 通过，无报错。
- [ ] `npm run dev` 本地点一遍首页、/blog、/blog?page=2、文章页。
- [ ] 键盘可 Tab 到「跳过主内容」并跳转到主内容。
- [ ] 新加/修改的链接没有 404（尤其分页、归档、标签）。
- [ ] 生产环境 `NEXT_PUBLIC_SITE_URL` 正确，OG 链接与 RSS 使用该域名。
- [ ] 若改样式：在窄屏与宽屏各看一眼前端是否错位或溢出。

---

## 十一、常见问题速查

| 现象           | 可能原因 | 建议 |
|----------------|----------|------|
| /blog 第二页空白 | `useSearchParams` 未包在 Suspense | 确保 `BlogListClient` 被 `<Suspense>` 包住。 |
| 图片 404       | 路径错误或未放 `public/` | 检查 `src`、`public` 下路径。 |
| 跳过链接看不见 | 未获得焦点 | 用 Tab 聚焦或检查 `.skip-link:focus` 样式。 |
| 暗色模式不生效 | 未切换 `html` class | 用脚本给 `document.documentElement` 加/删 `dark` class，并持久化到 localStorage。 |

---

按需从上面选一项做起，做完用「十、自检清单」过一遍即可。若你以后加了新功能（如评论、搜索高亮），也可以按「检查 → 修改 → 验证」自己补一小节到本文档。
