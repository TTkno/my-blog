# Copilot Instructions - My Blog (Next.js + MDX)

## Project Overview
This is a competitive programming blog built with Next.js 16, featuring MDX post support with mathematical formulas (KaTeX), syntax highlighting (Shiki), and a full-text search interface. Posts are stored as MDX/MD files in `content/posts/` with YAML frontmatter.

## Architecture & Data Flow

### Post System
- **Source**: `content/posts/*.mdx` files with YAML frontmatter (title, date, tags, collection, draft status)
- **Parser**: [src/lib/posts.ts](src/lib/posts.ts) - reads files, extracts/normalizes metadata using `gray-matter`
- **Key Types**: `PostMeta` (normalized metadata), `PostListItem` (slug + meta)
- **Collections**: Posts support a `collection` field for grouping (e.g., "note", "contest") - used for prev/next navigation
- **Draft Support**: `draft: true/1/yes` hides posts in production (`NODE_ENV === "production"`)

### MDX Compilation
- **Engine**: [next-mdx-remote/rsc](https://github.com/hashicorp/next-mdx-remote) - Server Component rendering
- **Plugins**:
  - `remark-math` + `rehype-katex` → KaTeX formulas (`$...$` and `$$...$$`)
  - `rehype-pretty-code` + Shiki → syntax highlighting
  - `rehype-slug` → auto heading IDs
  - `rehype-autolink-headings` → heading anchor links
- **TOC Extraction**: [src/app/blog/[slug]/page.tsx](src/app/blog/[slug]/page.tsx) line ~80 - custom regex-based parser (skips code blocks, uses GithubSlugger for ID generation)

### Routing Structure
- **Pages**: `src/app/blog/[slug]/` (dynamic), `src/app/tags/[tag]/` (dynamic), `src/app/archive/[collection]/` (dynamic)
- **Static Generation**: `generateStaticParams()` in page components - pre-builds all post pages at build time
- **Collections Page**: [src/app/archives/page.tsx](src/app/archives/page.tsx) - uses tabs to filter by collection

## Critical Patterns

### Post Metadata Normalization
All post metadata is normalized in [src/lib/posts.ts](src/lib/posts.ts) before use:
- Empty/falsy values, "undefined", "null", "nan" → filtered out
- Date defaults to `Date.now()` if missing
- Tags: comma-separated string or array, normalized individually
- Draft: accepts boolean or string ("true"/"1"/"yes")
- Collection: case-insensitive lookup, undefined if empty

**Why**: Prevents inconsistent metadata in post listings/filters.

### Prev/Next Navigation
[getPrevNextBySlug()](src/lib/posts.ts#L120) groups posts by collection if one exists, otherwise searches all posts. Always ordered newest → oldest (reverse chronological). Used in [ReadingActions](src/components/ReadingActions.tsx) component.

### Client-Side Search
[SearchPalette](src/components/SearchPalette.tsx) uses `Ctrl+K` shortcut. Searches across title, description, and tags. Highlights matching text in results. Does NOT require external API - all data embedded via props.

### Configuration
[src/site.ts](src/site.ts) - single source of truth for site metadata (name, subtitle, socials, links). Imported in layout and metadata generation.

## Development Workflows

### Create a New Post
```bash
npm run new:post
```
Interactive CLI - prompts for title, tags, collection, description. Auto-generates slug and frontmatter.

### Build & Deployment
```bash
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Type-check + build (Next.js prebuilt outputs)
npm run lint             # ESLint check
npm run deploy           # Lint → Build → Vercel deploy
npm run deploy:fast      # Skip lint, go straight to build + deploy
npm run deploy:dry       # Lint + build without deploying
```

**Deploy Flow**: [scripts/deploy.mjs](scripts/deploy.mjs) chains `eslint`, `next build` (includes type-checking), then `vercel --prod`. Stops on any error.

## Key Files & What They Do
| File | Purpose |
|------|---------|
| [src/lib/posts.ts](src/lib/posts.ts) | Post file I/O, metadata parsing, sorting, filtering |
| [src/app/blog/[slug]/page.tsx](src/app/blog/[slug]/page.tsx) | Single post page: MDX compilation, TOC extraction, metadata |
| [src/components/SearchPalette.tsx](src/components/SearchPalette.tsx) | Cmd+K search UI - real-time filter across posts |
| [src/site.ts](src/site.ts) | Site config (name, socials, links) |
| [src/app/layout.tsx](src/app/layout.tsx) | Root layout - imports posts, renders sidebar + search |
| [content/posts/](content/posts/) | MDX post files (source of truth) |
| [scripts/new-post.mjs](scripts/new-post.mjs) | CLI to create new post with metadata |
| [scripts/deploy.mjs](scripts/deploy.mjs) | Deploy automation (lint → build → Vercel) |

## Common Tasks for Agents

### Adding a New Post Feature
1. Check [src/lib/posts.ts](src/lib/posts.ts) for metadata type - add field to `PostMeta`
2. Update normalization function (e.g., `normalizeXXX()`)
3. Update [scripts/new-post.mjs](scripts/new-post.mjs) frontmatter template if user-facing

### Modifying Post Display
1. Post page rendering: [src/app/blog/[slug]/page.tsx](src/app/blog/[slug]/page.tsx)
2. Post listing: [src/app/blog/page.tsx](src/app/blog/page.tsx) uses `getAllPosts()` → [PostCard](src/components/PostCard.tsx)
3. Search results: [SearchPalette](src/components/SearchPalette.tsx) filters + highlights

### Styling & Components
- **CSS**: Tailwind v4 + PostCSS, global styles in [src/app/globals.css](src/app/globals.css)
- **Animations**: Framer Motion for page transitions ([PageTransition](src/components/PageTransition.tsx), ParticlesBackground)
- **Typography**: Tailwind typography plugin handles prose styling

## Environment Variables
- `NEXT_PUBLIC_SITE_URL` - Site base URL (e.g., https://example.com), defaults to http://localhost:3000
- Deployment: Set in Vercel project settings

## Testing & Type Safety
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint (next.config enforces rules)
- **React Compiler**: Enabled in next.config - auto-memoization
- **No Tests**: Currently no test suite; rely on build-time type checking and lint

---

**Last Updated**: 2026-01-29
