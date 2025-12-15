#!/bin/bash
set -e

# 强制使用 npm 而不是 yarn
echo "Using npm to build..."
npm run build
