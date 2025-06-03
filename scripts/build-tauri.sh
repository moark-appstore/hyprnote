#!/bin/bash

# 加载 .env.local 文件
if [ -f .env.local ]; then
    echo "Loading environment variables from .env.local"
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# 执行 Turbo 构建命令
pnpm exec turbo -F @hypr/desktop tauri:build 