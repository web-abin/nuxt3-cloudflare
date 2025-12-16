# 修复 Cloudflare Pages 部署错误

## 问题

部署时出现错误：
```
Redirected configurations cannot include environments but the following have been found:
  - production
  - preview
```

## 原因

Cloudflare Pages 在部署时执行了 `npx wrangler deploy`，但生成的 `wrangler.json` 中包含环境配置，Cloudflare Pages 不支持这些配置。

## 解决方案

### 方案 1：移除部署命令（推荐）

Cloudflare Pages **会自动部署** `dist` 目录，不需要手动运行 wrangler deploy。

在 Cloudflare Pages Dashboard 中：

1. 进入 **Settings** → **Builds & deployments**
2. 找到 **Deploy command** 字段
3. **删除或留空**这个字段
4. Cloudflare Pages 会自动部署构建输出目录中的内容

### 方案 2：如果必须使用部署命令

如果 Cloudflare Pages 要求必须有部署命令，使用以下配置：

1. **获取正确的项目名称**：
   - 在 Cloudflare Pages Dashboard 中查看你的项目名称
   - 或者在项目 URL 中查看（例如：`https://YOUR_PROJECT_NAME.pages.dev`）

2. **修改部署命令**：
   - 进入 **Settings** → **Builds & deployments**
   - **Deploy command** 设置为：`npx wrangler pages deploy dist --project-name=YOUR_PROJECT_NAME`
   - 将 `YOUR_PROJECT_NAME` 替换为你在 Cloudflare Pages 中创建的实际项目名称

3. **检查 API Token 权限**：
   - 进入 https://dash.cloudflare.com/profile/api-tokens
   - 检查你的 API Token 是否有以下权限：
     - **Cloudflare Pages:Edit**
     - **Account:Read**
   - 如果没有，需要创建新的 token 或更新现有 token 的权限

4. **或者使用环境变量**：
   - 在 Cloudflare Pages 设置中添加环境变量：
     - `CLOUDFLARE_ACCOUNT_ID`: 你的 Account ID（从 Dashboard 获取）
     - `CLOUDFLARE_API_TOKEN`: 你的 API Token（确保有正确权限）

### 方案 3：使用正确的项目名称（推荐）

从错误日志可以看到，Nitro 自动生成了项目名：`web-abin-nuxt3-cloudflare`

1. 在 Cloudflare Pages Dashboard 中确认你的项目名称
2. 如果项目名称是 `web-abin-nuxt3-cloudflare`，部署命令应该是：
   ```
   npx wrangler pages deploy dist --project-name=web-abin-nuxt3-cloudflare
   ```
3. 如果项目名称不同，使用实际的项目名称

### 关键点

- 使用 `wrangler pages deploy` 而不是 `wrangler deploy`
- `pages deploy` 是专门用于 Cloudflare Pages 的命令
- 指定 `dist` 目录作为部署目录

### 验证

部署后，日志应该显示：
```
Executing user deploy command: npx wrangler pages deploy dist
```

## 当前配置

- ✅ 已删除 `wrangler.toml`（避免环境配置问题）
- ✅ 构建输出目录：`dist`
- ✅ 构建命令：`npm run build`
- ✅ **部署命令**：`npx wrangler pages deploy dist`
