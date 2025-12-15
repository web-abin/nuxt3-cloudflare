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

### 修改部署命令

在 Cloudflare Pages Dashboard 中：

1. 进入 **Settings** → **Builds & deployments**
2. 找到 **Deploy command** 字段
3. **修改为**：`npx wrangler pages deploy dist --project-name=nuxt3-cloudflare`
4. 或者使用：`npx wrangler pages deploy dist`（让 Cloudflare Pages 自动处理项目名）

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
