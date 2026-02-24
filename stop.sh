#!/bin/bash

# 停止 Historical Agents MMO

echo "🛑 停止 Historical Agents MMO..."

if [ -f .server.pid ]; then
    kill $(cat .server.pid) 2>/dev/null
    rm .server.pid
    echo "✅ 服务端已停止"
fi

if [ -f .client.pid ]; then
    kill $(cat .client.pid) 2>/dev/null
    rm .client.pid
    echo "✅ Agent 已停止"
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "  Historical Agents MMO 已停止"
echo "═══════════════════════════════════════════════════"
