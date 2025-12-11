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
# 安装依赖（使用 npm）
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

1. 将代码推送到 GitHub/GitLab（**确保提交 `package-lock.json` 文件**）
2. 在 [Cloudflare Dashboard](https://dash.cloudflare.com) 中：
   - 进入 **Pages** → **Create a project**
   - 连接到你的 Git 仓库
3. 构建配置：
   - **构建命令**: `npm run build`
   - **构建输出目录**: `dist`（Cloudflare Pages preset 的输出目录）
   - **Node 版本**: 18 或更高
   - **包管理器**: npm（重要：确保使用 npm 而不是 yarn）
   - **环境变量**: 根据需要添加

**重要提示**：
- 如果 Cloudflare Pages 自动检测到 yarn，请在构建设置中**明确指定使用 npm**
- 确保 `package-lock.json` 文件已提交到 Git 仓库
- 如果存在 `yarn.lock`，可以删除它或确保 Cloudflare Pages 配置使用 npm

### 方法 2: 使用 Wrangler CLI

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署到 Cloudflare Pages
npm run build
wrangler pages deploy dist
```

项目已配置为使用 `cloudflare-pages` preset，会自动处理 Workers 集成。所有 Server API 路由将自动部署为 Cloudflare Workers。

## 故障排除

### 部署失败：lockfile 修改错误

如果遇到 `The lockfile would have been modified by this install` 错误：

1. **确保使用 npm**：在 Cloudflare Pages 设置中明确指定包管理器为 `npm`
2. **提交 lockfile**：确保 `package-lock.json` 已提交到 Git
3. **删除 yarn.lock**：如果存在 `yarn.lock`，可以删除它以避免冲突
4. **重新生成 lockfile**：本地运行 `npm install` 生成最新的 `package-lock.json`

### 部署失败：oxc-parser 原生绑定错误

如果遇到 `Cannot find native binding` 或 `oxc-parser` 相关错误：

1. **已修复**：项目已移除 `@nuxt/devtools` 依赖，避免原生绑定问题
2. **已移除 postinstall 脚本**：`nuxt prepare` 会在构建时自动执行，无需 postinstall
3. **devtools 已禁用**：在 `nuxt.config.ts` 中 devtools 已设置为 `enabled: false`

如果仍然遇到问题，确保：
- 使用 Node.js 18 或更高版本
- 构建命令设置为 `npm run build`
- 环境变量 `NODE_ENV=production` 已设置（构建脚本中已包含）

## API 路由

所有 API 路由位于 `server/api/` 目录：

- `GET /api/profile` - 获取个人信息
- `GET /api/skills` - 获取技能列表
- `GET /api/projects` - 获取作品集
- `GET /api/experience` - 获取工作经历

所有数据都是 Mock 数据，可以根据需要修改。