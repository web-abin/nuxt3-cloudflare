#!/bin/bash
set -e

# 强制使用 npm 而不是 yarn
echo "=========================================="
echo "Forcing npm build (not yarn)"
echo "=========================================="

# 确保使用 npm
which npm || (echo "npm not found" && exit 1)

# 运行构建
npm run build
