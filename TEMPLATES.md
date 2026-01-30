# Post Templates Guide

This document describes the post template system used in `npm run new:post`.

## Overview

The blog supports **4 post types**, each with a dedicated template structure optimized for different content:

| Type | Purpose | Default Collection | Use Case |
|------|---------|-------------------|----------|
| `solution` | Algorithm problem solution | `algo` | LeetCode, Codeforces individual problems |
| `contest` | Competitive programming contest recap | `algo` | Contest/competition summaries |
| `diary` | Training log/daily practice journal | `diary` | Regular training records |
| `note` | Concept notes & technique reference | `note` | Learning concepts, algorithms, data structures |

## Template Details

### 1. Solution Template

Used for **single problem solutions** with emphasis on problem statement, approach, and code.

```markdown
## 题目
**Contest:** 
**Problem:** 
**Link:** 

## 思路
- 

## 做法
1. 
2. 

## 时空复杂度
- 时间：O()
- 空间：O()

## 代码
\`\`\`cpp
// TODO
\`\`\`

## 总结
- 
```

**When to use:** Single algorithm problems, LeetCode solutions, codeforces Div2 problems

---

### 2. Contest Template

Used for **contest recaps** with multiple problems and overall statistics.

```markdown
## 比赛信息
**平台:** Codeforces / AtCoder / ...
**时间:** 
**排名:** 
**解题:** A / B / C / D ...

## 总体思路
- 

## 各题总结
### A. [题目](链接)
- 难度：
- 思路：
- 代码：

### B. [题目](链接)
- 难度：
- 思路：
- 代码：

## 收获与反思
- 
```

**When to use:** Weekly contests, monthly competitions, full contest summaries

**Fields:**
- **平台** (Platform): Codeforces, AtCoder, CodeChef, etc.
- **时间** (Time): Contest duration or date
- **排名** (Ranking): Final rank/percentile
- **解题** (Solved): Which problems were solved (A/B/C/D)

---

### 3. Diary Template

Used for **training logs** tracking daily progress.

```markdown
## 今日训练
- 平台：
- 通过：
- 未过：

## 遇到的问题
- 

## 今天学到的
- 

## 明天计划
- 
```

**When to use:** Daily training records, practice logs, progress journals

**Fields:**
- **今日训练** (Today's Training): Which platform/problems worked on
- **遇到的问题** (Issues): Bugs or problems encountered
- **今天学到的** (Learnings): Key insights or techniques discovered
- **明天计划** (Tomorrow's Plan): Next focus areas

---

### 4. Note Template

Used for **concept/technique notes** as reference material.

```markdown
## 概念
- 

## 关键性质
1. 
2. 

## 代码模板
\`\`\`cpp
// TODO
\`\`\`

## 应用场景
- 

## 参考资料
- 
```

**When to use:** Algorithm explanations, data structure notes, technique references

**Fields:**
- **概念** (Concept): Clear definition of the concept
- **关键性质** (Key Properties): Important characteristics
- **代码模板** (Code Template): Standard implementation
- **应用场景** (Use Cases): When and how to apply

---

## Creating a New Post

```bash
npm run new:post
```

### Interactive Prompts

```
标题 title：                                    # Post title (required)
类型（solution/contest/diary/note）[solution]：  # Post type (default: solution)
标签 tags（逗号分隔，可空）：                      # Tags comma-separated (optional)
简介 description（可空）：                         # Brief description (optional)
分类 collection（默认 {default}，可改）：        # Collection (auto-set based on type)
```

### Collection Defaults

- **solution** → `algo`
- **contest** → `algo`
- **diary** → `diary`
- **note** → `note`

### Post Metadata

All new posts include:

```yaml
---
title: "Your Title"
date: "2026-01-29"
tags: ["tag1", "tag2"]
description: "Brief description"
collection: "algo"
draft: true
---
```

⚠️ **Important:** `draft: true` is set by default. Remove or change to `draft: false` before publishing.

---

## Slug Generation

- Slugs are automatically generated from the title using:
  - Lowercase conversion
  - Whitespace → hyphens
  - Remove special characters
  - Collapse duplicate hyphens
  
- If slug already exists, a numeric suffix is added (`slug-2`, `slug-3`, etc.)

Example: `"Dynamic Programming in Graphs"` → `dynamic-programming-in-graphs`

---

## File Location & Naming

New posts are created in:

```
content/posts/{slug}.mdx
```

Example: `content/posts/dynamic-programming-in-graphs.mdx`

---

## Template Customization

To modify templates, edit `scripts/new-post.mjs`:

- **`tplSolution()`** - Solution template
- **`tplContest()`** - Contest template  
- **`tplDiary()`** - Diary template
- **`tplNote()`** - Note template

Each returns a string containing the markdown content to append after frontmatter.

---

## Examples

### Example: Solution Post

**Title:** Two Sum  
**Type:** solution  
**Tags:** array, hash-table  
**Collection:** algo

```markdown
---
title: "Two Sum"
date: "2026-01-29"
tags: ["array", "hash-table"]
collection: "algo"
draft: true
---

## 题目
**Contest:** LeetCode
**Problem:** 1. Two Sum
**Link:** https://leetcode.com/problems/two-sum/

## 思路
使用哈希表记录已见元素，O(n) 一遍遍历

## 做法
1. 创建空哈希表
2. 遍历数组，对每个数字查询 (target - num) 是否在表中
3. 不在则加入表，在则返回两个索引

## 时空复杂度
- 时间：O(n)
- 空间：O(n)

## 代码
\`\`\`cpp
vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for(int i = 0; i < nums.size(); i++) {
        int need = target - nums[i];
        if(seen.count(need)) return {seen[need], i};
        seen[nums[i]] = i;
    }
    return {};
}
\`\`\`
```

---

## Best Practices

1. **Use appropriate type:** Choose the template that best fits your content
2. **Set draft correctly:** Remember to remove `draft: true` before publishing
3. **Meaningful tags:** Use consistent, searchable tags across posts
4. **Collection organization:** Keep posts grouped in appropriate collections for navigation
5. **Complete sections:** Fill in all template sections even if briefly

---

**Last Updated:** 2026-01-29
