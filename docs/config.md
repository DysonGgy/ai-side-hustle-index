# 项目配置文档

## 基本信息

- **项目名称**: AI Side Hustle Index
- **域名**: hustlewith.com
- **托管**: GitHub Pages
- **仓库**: https://github.com/DysonGgy/ai-side-hustle-index.git
- **技术栈**: 纯静态站（HTML + CSS + JS），无框架，无构建工具

## 账号与服务

| 服务 | 用途 | 备注 |
|------|------|------|
| GitHub Pages | 网站托管 | 自动部署，push 到 main 即生效 |
| Google AdSense | 广告变现 | Publisher ID: `ca-pub-6859622430337032` |
| Beehiiv | 邮件 Newsletter | 免费 Launch plan，2500 订阅者上限 |
| 自定义域名 | hustlewith.com | 通过 CNAME 文件配置 |

## 关键文件

```
ai-side-hustle-index/
├── index.html          # 主页面（单页应用）
├── styles.css          # 全部样式
├── script.js           # 全部逻辑（数据加载、渲染、交互）
├── CNAME               # GitHub Pages 自定义域名
├── robots.txt          # 搜索引擎爬虫配置
├── sitemap.xml         # 站点地图
├── ads.txt             # AdSense 验证
├── .mcp.json           # Beehiiv MCP 服务器配置
├── data/
│   ├── hustles.json    # 8个AI副业详细数据
│   ├── tools.json      # AI工具分类目录
│   ├── creators.json   # 视频教程列表
│   ├── news.json       # 滚动新闻条
│   └── success-stories.json  # 6个成功案例
└── node_modules/       # 仅本地开发用（不提交）
```

## 本地开发

```bash
# 启动本地服务器（Node.js 内联 HTTP 服务器）
node -e "const h=require('http'),f=require('fs'),p=require('path');h.createServer((q,r)=>{let u=q.url==='/'?'/index.html':q.url;let fp=p.join(__dirname,u);let ext=p.extname(fp);let ct={'html':'text/html','css':'text/css','js':'application/javascript','json':'application/json'}[ext.slice(1)]||'text/plain';f.readFile(fp,(e,d)=>{if(e){r.writeHead(404);r.end('Not found')}else{r.writeHead(200,{'Content-Type':ct});r.end(d)}})}).listen(8080)"
```

访问 http://localhost:8080

## Git 配置

- Git 路径: `C:\Program Files\Git\cmd\git.exe`
- 每次新会话需要: `$env:PATH = "C:\Program Files\Git\cmd;$env:PATH"`
- 分支: main（直接推送）

## SEO 配置

- Open Graph + Twitter Card meta 标签已配置
- JSON-LD 结构化数据（WebSite schema）
- Canonical URL: https://hustlewith.com/
- Favicon: 内联 SVG（勾选图标）
- og:image 指向 `https://hustlewith.com/og-image.png`（待创建）

## Newsletter (Beehiiv)

- 订阅页: https://hustlewith.beehiiv.com/subscribe
- 网站上的 "Subscribe Free" 按钮跳转到此页面
- MCP 配置: `.mcp.json` 中已添加 `https://mcp.beehiiv.com/mcp`
- **待解决**: Beehiiv 订阅页有弹窗+底层表单重复，需在后台关闭 popup
