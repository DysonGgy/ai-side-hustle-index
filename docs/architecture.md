# 项目架构与代码说明

## 架构概览

纯前端静态站，数据驱动渲染。所有内容存储在 `data/` 目录的 JSON 文件中，页面加载时通过 `fetch()` 获取并动态渲染。

```
用户访问 → index.html 加载 → script.js 执行
                                    ↓
                          fetch 5个 JSON 文件
                                    ↓
                    渲染各 section（ticker、quiz、table、cards...）
```

## 页面结构 (index.html)

```
nav          — 导航栏（logo + 链接 + 搜索框）
<main>
  hero       — 首屏标题 + 滚动新闻条
  quiz       — 3题互动推荐（Start Here）
  compare    — 对比表格（Quick Compare）
  hustles    — 可折叠卡片列表 + 排序按钮
  tools      — AI工具目录 + 分类 tab
  stories    — 成功案例卡片
  videos     — 视频教程卡片
  newsletter — 邮件订阅 CTA
</main>
footer       — 免责声明 + 来源 + 版权 + 隐私
```

## 核心 JS 函数 (script.js)

| 函数 | 作用 |
|------|------|
| `renderTicker(news)` | 渲染首屏滚动新闻 |
| `setupQuiz(hustles)` | 初始化互动推荐 quiz |
| `updateQuizResults(hustles)` | 根据用户选择计算匹配分数 |
| `renderCompareTable(hustles)` | 渲染对比表格 |
| `renderHustles(hustles, sortBy)` | 渲染可折叠副业卡片 |
| `renderTools(tools, category)` | 渲染工具目录 |
| `renderCreators(creators)` | 渲染视频教程 |
| `renderSuccessStories(stories)` | 渲染成功案例 |
| `setupSortButtons(hustles)` | 排序按钮事件 |
| `setupToolTabs(tools)` | 工具分类 tab 切换 |
| `setupSearch()` | 搜索过滤 |
| `setupScrollAnimations()` | 滚动淡入动画 |

## 数据结构

### hustles.json（核心数据）

每个 hustle 包含：
- `name`, `tagline` — 名称和一句话描述
- `difficulty` (1-3) — 难度等级
- `timeToFirstDollar` — 首次收入时间
- `startupCost`, `incomeRange` — 成本和收入范围
- `incomeSource` — 数据来源引用
- `riskLevel` (low/medium/high) — 风险等级
- `trend` (hot/rising/stable) — 趋势标记
- `tags[]` — 用于 quiz 匹配的标签
- `tools[]` — 所需工具（name, url, price）
- `dayOne` — Day 1 行动指南
- `steps[]` — 分步时间线
- `risk`, `riskMitigation` — 风险和应对
- `caseStudy{}` — 真实案例（who, result, detail, source）
- `videoUrl`, `videoAuthor`, `videoViews` — 相关视频

### success-stories.json

每个故事包含：`company`, `founders`, `story`, `revenue`, `team`, `source`, `highlight`

## 交互机制

### 可折叠卡片
- 默认只显示摘要（名称、标签、关键指标）
- 点击 `.hustle-summary` 触发 `this.parentElement.classList.toggle('expanded')`
- `.hustle-details` 通过 CSS `display: none / flex` 控制显隐

### Quiz 推荐算法
- 3个维度：skill（技能）、time（时间）、goal（目标）
- 每个 hustle 根据 tags 匹配得分（0-9分）
- 取 top 3 展示

### 排序
- 4种排序：时间（fastest）、收入（highest）、成本（lowest）、难度（easiest）
- 通过 `parseTime()`, `parseIncome()`, `parseCost()` 解析字符串为数值

## CSS 关键设计

- 设计语言：Apple 风格（Inter 字体、大留白、圆角卡片）
- 颜色变量定义在 `:root`
- 响应式：移动端优先，关键断点 768px / 480px
- 动画：`.fade-in` + IntersectionObserver 实现滚动淡入
- Newsletter 区块：黑底白字，视觉突出

## 标题层级（SEO）

```
h1 — AI Side Hustles That Actually Work（唯一）
h2 — 各 section 标题（Find Your Match / All Options / Pick Your Hustle...）
h2 — Newsletter 标题
span — section eyebrow 标签（New to This? / Quick Compare...）
h4 — Footer 小标题
```
