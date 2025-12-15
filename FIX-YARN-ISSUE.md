# 解决 Cloudflare Pages 使用 yarn 的问题

## ⚠️ 问题
即使你在 Dashboard 中设置了 `npm run build`，Cloudflare Pages 仍然使用 `yarn run build`。

## 🔧 解决方案（按顺序尝试）

### 方案 1：使用构建脚本（最可靠）

1. **在 Cloudflare Pages Dashboard 中**：
   - Settings → Builds & deployments
   - **Build command**: 输入 `/bin/bash build.sh`
   - 保存

2. **提交 build.sh 到 Git**：
   ```bash
   git add build.sh
   git commit -m "add build.sh to force npm"
   git push
   ```

3. **清除缓存并重新部署**

### 方案 2：完全删除并重新创建项目

如果方案 1 不行：

1. **删除现有 Cloudflare Pages 项目**
2. **重新创建项目**：
   - 连接相同的 Git 仓库
   - **在创建时**（不是之后）：
     - Build command: `npm run build`
     - Build output directory: `dist`
     - Node version: `20`
   - 创建项目

### 方案 3：检查 Dashboard 设置

确保以下设置：

1. **Settings → Builds & deployments**：
   - **Build command**: `npm run build`（不是 `yarn run build`）
   - **Framework preset**: 选择 "None" 或留空（不要使用自动检测）
   - **Build output directory**: `dist`
   - **Root directory**: `/` 或留空
   - **Node version**: `20`

2. **清除缓存**：
   - Settings → Builds & deployments → **Clear build cache**

3. **保存设置**（重要！）

### 方案 4：使用环境变量

在 Cloudflare Pages 设置中添加环境变量：
- `NPM_CONFIG_USER_AGENT`: `npm`
- `CI`: `true`

## 🔍 验证

部署后，检查构建日志：

**✅ 正确**：
```
Executing user build command: /bin/bash build.sh
```
或
```
Executing user build command: npm run build
```

**❌ 错误**：
```
Executing user build command: yarn run build
```

## 📝 检查清单

- [ ] `build.sh` 已提交到 Git
- [ ] Dashboard 中 Build command 设置为 `/bin/bash build.sh` 或 `npm run build`
- [ ] 已清除构建缓存
- [ ] 没有 `yarn.lock` 文件
- [ ] 没有 `.yarnrc.yml` 文件
- [ ] `package-lock.json` 已提交
- [ ] Framework preset 设置为 "None"（不使用自动检测）

## 🆘 如果还是不行

1. **截图 Dashboard 设置**，确认 Build command 确实保存为 `npm run build`
2. **检查是否有多个部署配置**（生产/预览环境）
3. **联系 Cloudflare 支持**，说明自动检测覆盖了手动设置
