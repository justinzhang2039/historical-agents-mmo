#!/bin/bash

# Historical Agents MMO - Mac 一键安装脚本
# 使用 Docker 运行，纯净模式（无残留）

set -e

echo "🏛️  Historical Agents MMO 安装器"
echo "================================"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ 未检测到 Docker"
    echo ""
    echo "请先安装 Docker Desktop:"
    echo "👉 https://www.docker.com/products/docker-desktop"
    echo ""
    echo "安装完成后重新运行此脚本"
    exit 1
fi

echo "✅ Docker 已安装"

# 检查 Docker 是否运行
if ! docker info &> /dev/null; then
    echo "❌ Docker 未运行"
    echo "请先启动 Docker Desktop"
    exit 1
fi

echo "✅ Docker 正在运行"
echo ""

# 拉取最新镜像
echo "📦 拉取最新镜像..."
docker pull justinzhang2039/historical-agents-mmo:latest

# 停止并删除旧容器（如果存在）
echo "🧹 清理旧容器..."
docker stop historical-agents-mmo 2>/dev/null || true
docker rm historical-agents-mmo 2>/dev/null || true

# 运行新容器
echo "🚀 启动游戏服务器..."
docker run -d \
    --name historical-agents-mmo \
    -p 4567:4567 \
    --rm \
    justinzhang2039/historical-agents-mmo:latest

echo ""
echo "✅ 游戏服务器已启动！"
echo ""
echo "🌐 访问地址:"
echo "   Dashboard: http://localhost:4567"
echo "   API:       http://localhost:4567/api"
echo ""
echo "📖 使用说明:"
echo "   - 按 Ctrl+C 停止服务器"
echo "   - 重新运行此脚本可重置环境"
echo ""
echo "🎮 开始游戏吧！"

# 自动打开浏览器
sleep 2
open http://localhost:4567
