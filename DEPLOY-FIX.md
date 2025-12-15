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

### ⚠️ 重要：移除部署命令

在 Cloudflare Pages Dashboard 中：

1. 进入 **Settings** → **Builds & deployments**
2. 找到 **Deploy command** 字段（如果有）
3. **删除或留空**这个字段
4. Cloudflare Pages 会自动部署 `dist` 目录，**不需要**手动运行 `wrangler deploy`

### 验证

部署后，日志中**不应该**看到：
```
Executing user deploy command: npx wrangler deploy
```

Cloudflare Pages 应该自动部署 `dist` 目录，不需要额外的部署命令。

## 当前配置

- ✅ 已删除 `wrangler.toml`（避免环境配置问题）
- ✅ 构建输出目录：`dist`
- ✅ 构建命令：`npm run build`
- ⚠️ **部署命令**：应该为空或删除
