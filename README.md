# Nuxt3 交互式个人简历/作品集

一个包含 3D 效果、滚动动画和视觉震撼作品展示的交互式个人简历/作品集网站。

## 特性

- ✨ 3D 粒子背景效果（使用 Three.js）
- 🎨 流畅的滚动动画
- 📱 完全响应式设计
- 🚀 基于 Nuxt3 和 Cloudflare Pages/Workers
- 🎯 Server API 路由（Mock 数据）
- 💫 玻璃态（Glassmorphism）设计风格

## 技术栈

- **框架**: Nuxt 3
- **样式**: Tailwind CSS
- **3D 图形**: Three.js
- **部署**: Cloudflare Pages + Workers

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 部署到 Cloudflare Pages

### 方法 1: 通过 Cloudflare Dashboard

1. 将代码推送到 GitHub/GitLab
2. 在 [Cloudflare Dashboard](https://dash.cloudflare.com) 中：
   - 进入 **Pages** → **Create a project**
   - 连接到你的 Git 仓库
3. 构建配置：
   - **构建命令**: `npm run build`
   - **构建输出目录**: `.output/public`
   - **Node 版本**: 18 或更高
   - **环境变量**: 根据需要添加

### 方法 2: 使用 Wrangler CLI

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署到 Cloudflare Pages
npm run build
wrangler pages deploy .output/public
```

项目已配置为使用 `cloudflare-pages` preset，会自动处理 Workers 集成。所有 Server API 路由将自动部署为 Cloudflare Workers。

## API 路由

所有 API 路由位于 `server/api/` 目录：

- `GET /api/profile` - 获取个人信息
- `GET /api/skills` - 获取技能列表
- `GET /api/projects` - 获取作品集
- `GET /api/experience` - 获取工作经历

所有数据都是 Mock 数据，可以根据需要修改。
