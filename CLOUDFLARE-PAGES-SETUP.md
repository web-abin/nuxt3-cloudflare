# Cloudflare Pages 部署配置指南

## ⚠️ 重要：必须手动配置构建命令

Cloudflare Pages 可能会自动检测并使用 `yarn run build`，**必须手动修改为 `npm run build`**。

## 详细配置步骤

### 1. 进入项目设置

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Pages** → 选择你的项目
3. 点击 **Settings** → **Builds & deployments**

### 2. 配置构建设置

在 **Build configuration** 部分：

#### ⚠️ 关键步骤：修改构建命令

**方法 1：使用构建脚本（推荐）**

1. **找到 "Build command" 字段**
2. **删除自动检测的值**（可能是 `yarn run build` 或空）
3. **手动输入**：`bash build.sh` 或 `/bin/bash build.sh`
4. 这会强制使用 npm，不依赖自动检测

**方法 2：直接使用 npm**

1. **找到 "Build command" 字段**
2. **删除自动检测的值**
3. **手动输入**：`npm run build`
4. **不要使用自动检测**，必须手动输入

#### 其他设置

- **Build output directory**: `dist`
- **Root directory**: `/`（留空或填写 `/`）
- **Node version**: `20`（或选择 20.x）
- **Package manager**: 如果可以选择，选择 `npm`

### 3. 保存并重新部署

1. 点击 **Save** 保存设置
2. 进入 **Deployments** 标签
3. 点击 **Retry deployment** 或创建新的部署

## 验证配置

部署后，检查构建日志应该显示：

```
Installing project dependencies: npm clean-install --progress=false
...
Executing user build command: npm run build
```

**不应该**看到：
```
Executing user build command: yarn run build
```

## 如果仍然使用 yarn

如果修改后仍然使用 yarn：

1. **清除构建缓存**：
   - Settings → Builds & deployments → **Clear build cache**

2. **检查是否有 yarn 相关文件**：
   - 确保 Git 仓库中没有 `yarn.lock`
   - 确保没有 `.yarnrc.yml` 或 `.yarnrc` 文件

3. **重新创建项目**（最后手段）：
   - 删除现有项目
   - 重新创建并连接相同的 Git 仓库
   - 在创建时手动输入构建命令 `npm run build`

## 常见问题

### Q: 为什么 Cloudflare Pages 仍然使用 yarn？

A: 可能的原因：
- 构建命令在 Dashboard 中被设置为 `yarn run build`
- 有缓存的配置
- 自动检测功能检测到了 yarn（即使没有 yarn.lock）

**解决方案**：在 Dashboard 中手动修改构建命令为 `npm run build`

### Q: 如何确认使用的是 npm？

A: 检查构建日志中的这一行：
```
Executing user build command: npm run build  ✅ 正确
Executing user build command: yarn run build  ❌ 错误
```
