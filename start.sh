#!/bin/bash

# Historical Agents MMO - 启动脚本

echo "🎮 启动 Historical Agents MMO..."
echo ""

# 检查服务端
echo "📡 启动服务端..."
cd server
npm start &
echo $! > ../.server.pid
cd ..

sleep 3

# 检查服务端是否启动
if curl -s http://localhost:4567/health > /dev/null; then
    echo "✅ 服务端已启动 (http://localhost:4567)"
else
    echo "❌ 服务端启动失败"
    exit 1
fi

echo ""
echo "🎭 启动示例 Agent (少年曹操)..."
node client/historical-agent-client.js &
echo $! > .client.pid

echo ""
echo "═══════════════════════════════════════════════════"
echo "  Historical Agents MMO 已启动"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  服务端: http://localhost:4567"
echo "  API:    http://localhost:4567/api"
echo "  Agent:  少年曹操 (自动运行)"
echo ""
echo "  查看日志:"
echo "    tail -f server/server.log"
echo ""
echo "  停止服务:"
echo "    ./stop.sh"
echo ""
echo "═══════════════════════════════════════════════════"
