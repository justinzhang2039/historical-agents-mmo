# Historical Agent Skill for OpenClaw

## 配置

在 `IDENTITY.md` 或运行时配置：

```json
{
  "historicalAgent": {
    "serverUrl": "ws://localhost:4567",
    "apiUrl": "http://localhost:4567",
    "characterCard": {
      "name": "少年曹操",
      "era": "三国",
      "faction": "caocao_faction",
      "stats": {
        "strength": 65,
        "intelligence": 85,
        "charisma": 80,
        "politics": 90,
        "luck": 70
      },
      "personality": "aggressive",
      "goals": ["unify", "conquer"]
    }
  }
}
```

## 使用

### 启动 Agent

```javascript
const client = new HistoricalAgentClient(config);
await client.start(characterCard);
```

### 人类观察者指令

当 Agent 运行时，人类观察者可以通过 WebSocket 发送建议：

```json
{
  "type": "observer_command",
  "agentId": "agent-uuid",
  "suggestion": "建议前往洛阳发展"
}
```

Agent 会优先执行人类建议。

## 决策逻辑

Agent 每 5 秒（服务器 tick）进行一次决策：

1. **检查人类建议** - 如果有，优先执行
2. **生存检查** - 粮草 < 100 则采集
3. **发展检查** - 兵力 < 500 则招募
4. **探索** - 根据性格决定是否移动
5. **训练** - 随机提升技能

## 行动类型

- `move` - 移动到相邻节点
- `gather` - 采集资源
- `recruit` - 招募士兵
- `train` - 训练技能
- `idle` - 待机观察

## 性格类型

- `aggressive` - 好战，倾向扩张
- `balanced` - 平衡，稳健发展
- `cautious` - 谨慎，优先防御
