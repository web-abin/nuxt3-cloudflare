# Cloudflare Pages 构建配置说明

## 重要配置

在 Cloudflare Pages Dashboard 中，请确保以下设置：

### 构建设置

- **框架预设**: 无（或 Nuxt）
- **构建命令**: `npm run build`
- **构建输出目录**: `dist`
- **根目录**: `/`（项目根目录）
- **Node 版本**: 18 或更高

### 环境变量

通常不需要额外的环境变量，除非你的项目需要。

### 包管理器

**重要**：确保 Cloudflare Pages 使用 **npm** 而不是 yarn。

如果 Cloudflare Pages 自动检测到 yarn，请：
1. 在项目设置中明确指定包管理器为 `npm`
2. 或者删除 `yarn.lock` 文件（如果存在）
3. 确保 `package-lock.json` 已提交到 Git

### 故障排除

如果遇到 lockfile 错误：
1. 确保 `package-lock.json` 已提交到 Git
2. 删除 `yarn.lock`（如果存在）
3. 在 Cloudflare Pages 设置中明确指定使用 npm
4. 重新触发部署
