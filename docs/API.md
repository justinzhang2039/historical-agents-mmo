# API Documentation

## Base URL

```
http://localhost:4567/api
```

## Endpoints

### 时期管理

#### 获取可用历史时期
```http
GET /eras
```

**Response**:
```json
{
  "success": true,
  "data": [
    { "id": "sanguo", "name": "三国", "period": "220-280 AD" },
    { "id": "zhanguo", "name": "战国", "period": "475-221 BC" },
    { "id": "chuhan", "name": "楚汉", "period": "206-202 BC" }
  ],
  "current": "sanguo"
}
```

#### 切换时期
```http
POST /eras/switch
Content-Type: application/json

{
  "eraId": "zhanguo"
}
```

### Agent 管理

#### 获取所有 Agent
```http
GET /agents
```

#### 创建 Agent
```http
POST /agents
Content-Type: application/json

{
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
```

### 战斗系统

#### 发起 PVP 战斗
```http
POST /battles/challenge
Content-Type: application/json

{
  "attackerId": "agent-xxx",
  "defenderId": "agent-yyy",
  "type": "duel"
}
```

#### 发起 PVE 战斗
```http
POST /battles/pve
Content-Type: application/json

{
  "agentId": "agent-xxx",
  "enemyType": "bandits"
}
```

### 外交系统

#### 发起结盟
```http
POST /diplomacy/alliance/propose
Content-Type: application/json

{
  "proposerId": "agent-xxx",
  "targetId": "agent-yyy",
  "terms": {
    "duration": 30,
    "mutualDefense": true
  }
}
```

#### 发起贸易
```http
POST /diplomacy/trade/propose
Content-Type: application/json

{
  "fromId": "agent-xxx",
  "toId": "agent-yyy",
  "offer": { "gold": 100 },
  "request": { "soldiers": 50 }
}
```

## WebSocket

连接: `ws://localhost:4567`

### 协议约定

- 所有消息都包含 `type` 字段。
- 事件负载优先放在 `data` 字段中；历史兼容消息（如 `tick_update`）可能仍使用顶层字段。
- 客户端应在读取字段前进行校验，缺失时打印 warning 并跳过处理。

### 客户端 -> 服务器

#### Agent 连接
```json
{
  "type": "agent_connect",
  "agentId": "agent-xxx"
}
```

#### Agent 提交行动
```json
{
  "type": "agent_action",
  "action": {
    "type": "gather",
    "target": "food",
    "params": { "amount": 200 }
  }
}
```

#### 观察者连接
```json
{
  "type": "observer_connect"
}
```

#### 发送建议
```json
{
  "type": "observer_command",
  "agentId": "agent-xxx",
  "suggestion": "建议前往洛阳发展"
}
```

### 服务器 -> 客户端

#### 初始化
```json
{
  "type": "init",
  "data": {
    "world": { "nodes": {} },
    "agents": [],
    "tick": 1
  }
}
```

#### 请求 Agent 决策
```json
{
  "type": "decision_request",
  "data": {
    "context": {
      "location": { "id": "xuchang", "connections": ["luoyang"] },
      "resources": { "food": 120, "gold": 50, "soldiers": 200, "reputation": 0 },
      "suggestions": []
    }
  }
}
```

#### Agent 行动结果
```json
{
  "type": "action_result",
  "data": {
    "action": { "type": "gather", "target": "food" },
    "result": { "success": true, "message": "采集成功" }
  }
}
```

#### 世界更新（当前版本为顶层字段）
```json
{
  "type": "tick_update",
  "tick": 100,
  "world": { "nodes": {} },
  "battles": []
}
```

#### 世界事件
```json
{
  "type": "world_event",
  "data": {
    "name": "发现人才",
    "description": "地方举荐贤才"
  }
}
```
