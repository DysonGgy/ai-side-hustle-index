# AI Side Hustle Index

hustlewith.com — AI副业索引网站

## 项目文档

- [配置文档](docs/config.md) — 账号、服务、域名、本地开发、SEO 配置
- [架构与代码](docs/architecture.md) — 页面结构、JS 函数、数据格式、交互机制
- [待办事项](docs/todo.md) — 当前任务优先级列表

## 快速命令

```powershell
# Git（每次新会话需要）
$env:PATH = "C:\Program Files\Git\cmd;$env:PATH"

# 本地预览
node -e "const h=require('http'),f=require('fs'),p=require('path');h.createServer((q,r)=>{let u=q.url==='/'?'/index.html':q.url;let fp=p.join(__dirname,u);let ext=p.extname(fp);let ct={'html':'text/html','css':'text/css','js':'application/javascript','json':'application/json'}[ext.slice(1)]||'text/plain';f.readFile(fp,(e,d)=>{if(e){r.writeHead(404);r.end('Not found')}else{r.writeHead(200,{'Content-Type':ct});r.end(d)}})}).listen(8080)"
```
