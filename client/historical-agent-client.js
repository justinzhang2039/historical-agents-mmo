/**
 * Historical Agent Client
 * OpenClaw Agent 客户端 - 连接历史世界 MMO
 * 
 * 使用方法:
 * 1. 将此文件保存为 skill
 * 2. 配置 agentId 和 serverUrl
 * 3. 启动后 Agent 自动连接游戏世界
 */

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

class HistoricalAgentClient {
  constructor(config = {}) {
    this.agentId = config.agentId;
    this.serverUrl = config.serverUrl || 'ws://localhost:4567';
    this.apiUrl = config.apiUrl || 'http://localhost:4567';
    
    this.ws = null;
    this.reconnectInterval = 5000;
    this.isRunning = false;
    
    // Agent 状态
    this.state = {
      location: null,
      resources: {},
      suggestions: [],
      lastAction: null
    };
    
    // 性格配置
    this.personality = config.personality || 'balanced';
    this.goals = config.goals || ['survive', 'grow'];
  }

  /**
   * 创建新 Agent（首次使用）
   */
  async createAgent(characterCard) {
    try {
      const response = await fetch(`${this.apiUrl}/api/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(characterCard)
      });
      
      const data = await response.json();
      if (data.success) {
        this.agentId = data.data.id;
        console.log(`Agent created: ${data.data.name} (${this.agentId})`);
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      console.error('Failed to create agent:', e.message);
      throw e;
    }
  }

  /**
   * 连接到游戏服务器
   */
  connect() {
    if (!this.agentId) {
      console.error('Agent ID required. Call createAgent() first.');
      return;
    }
    
    console.log(`Connecting to ${this.serverUrl} as agent ${this.agentId}...`);
    
    this.ws = new WebSocket(this.serverUrl);
    
    this.ws.on('open', () => {
      console.log('Connected to game server');
      
      // 发送连接消息
      this.send({
        type: 'agent_connect',
        agentId: this.agentId
      });
    });
    
    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        this.handleMessage(message);
      } catch (e) {
        console.error('Failed to parse message:', e.message);
      }
    });
    
    this.ws.on('close', () => {
      console.log('Disconnected from server, reconnecting...');
      setTimeout(() => this.connect(), this.reconnectInterval);
    });
    
    this.ws.on('error', (err) => {
      console.error('WebSocket error:', err.message);
    });
  }

  /**
   * 处理服务器消息
   */
  handleMessage(message) {
    switch (message.type) {
      case 'init':
        console.log('Game world initialized');
        this.state.location = message.data.world.nodes[this.state.location];
        break;
        
      case 'tick_update':
        // 世界 tick 更新
        this.state.location = message.data.world.nodes[this.state.location?.id];
        break;
        
      case 'decision_request':
        // 服务器请求决策
        const action = this.decideAction(message.data.context);
        this.executeAction(action);
        break;
        
      case 'action_result':
        console.log('Action result:', message.data.result.message);
        this.state.lastAction = message.data;
        break;
        
      case 'world_event':
        console.log('World event:', message.data.name, '-', message.data.description);
        this.handleEvent(message.data);
        break;
    }
  }

  /**
   * AI 决策核心
   */
  decideAction(context) {
    const { location, resources, suggestions } = context;
    
    // 优先处理人类建议
    if (suggestions && suggestions.length > 0) {
      const suggestion = suggestions[suggestions.length - 1];
      return this.parseSuggestion(suggestion.text);
    }
    
    // 基于性格和目标决策
    const actions = [];
    
    // 生存优先：如果资源不足
    if (resources.food < 100) {
      actions.push({
        type: 'gather',
        target: 'food',
        params: { amount: 200 },
        priority: 10,
        reason: '粮草不足，优先采集'
      });
    }
    
    // 发展军队
    if (resources.soldiers < 500 && resources.food >= 200) {
      actions.push({
        type: 'recruit',
        params: { amount: 200 },
        priority: 8,
        reason: '扩充兵力'
      });
    }
    
    // 探索：随机移动
    if (location && location.connections && location.connections.length > 0) {
      const target = location.connections[Math.floor(Math.random() * location.connections.length)];
      
      // 根据性格决定是否探索
      if (this.personality === 'aggressive' || Math.random() > 0.6) {
        actions.push({
          type: 'move',
          target,
          priority: 5,
          reason: `探索新地区: ${target}`
        });
      }
    }
    
    // 训练技能
    if (Math.random() > 0.7) {
      const skills = ['combat', 'strategy', 'diplomacy', 'governance'];
      const skill = skills[Math.floor(Math.random() * skills.length)];
      actions.push({
        type: 'train',
        params: { skill },
        priority: 3,
        reason: `提升${skill}技能`
      });
    }
    
    // 按优先级排序
    actions.sort((a, b) => b.priority - a.priority);
    
    return actions[0] || { type: 'idle', reason: '观察局势' };
  }

  /**
   * 解析人类建议
   */
  parseSuggestion(text) {
    // 简单的关键词匹配
    if (text.includes('移动') || text.includes('前往')) {
      const locations = ['许昌', '洛阳', '徐州', '寿春', '长沙'];
      const locationMap = {
        '许昌': 'xuchang', '洛阳': 'luoyang', '徐州': 'xuzhou',
        '寿春': 'shouchun', '长沙': 'changsan'
      };
      
      for (const loc of locations) {
        if (text.includes(loc)) {
          return {
            type: 'move',
            target: locationMap[loc],
            priority: 10,
            reason: `遵循建议: 前往${loc}`
          };
        }
      }
    }
    
    if (text.includes('采集') || text.includes('收集')) {
      return {
        type: 'gather',
        target: 'food',
        params: { amount: 200 },
        priority: 10,
        reason: '遵循建议: 采集资源'
      };
    }
    
    if (text.includes('招募') || text.includes('征兵')) {
      return {
        type: 'recruit',
        params: { amount: 200 },
        priority: 10,
        reason: '遵循建议: 招募士兵'
      };
    }
    
    // 默认：训练
    return {
      type: 'train',
      params: { skill: 'strategy' },
      priority: 5,
      reason: `遵循建议: ${text}`
    };
  }

  /**
   * 执行行动
   */
  executeAction(action) {
    console.log(`Executing: ${action.type} - ${action.reason}`);
    
    this.send({
      type: 'agent_action',
      action: {
        type: action.type,
        target: action.target,
        params: action.params
      }
    });
  }

  /**
   * 处理世界事件
   */
  handleEvent(event) {
    // 根据事件类型调整策略
    if (event.type === 'natural' && event.effects.food < 0) {
      console.log('灾害发生，优先采集粮草');
    }
    
    if (event.type === 'opportunity') {
      console.log('机遇出现，考虑行动');
    }
  }

  /**
   * 发送消息到服务器
   */
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * 启动 Agent
   */
  async start(characterCard = null) {
    if (characterCard) {
      await this.createAgent(characterCard);
    }
    
    this.connect();
    this.isRunning = true;
    
    console.log('Historical Agent started');
  }

  /**
   * 停止 Agent
   */
  stop() {
    this.isRunning = false;
    if (this.ws) {
      this.ws.close();
    }
    console.log('Historical Agent stopped');
  }
}

// 示例使用
if (require.main === module) {
  // 角色卡示例：少年曹操
  const caocaoCard = {
    name: '少年曹操',
    era: '三国',
    faction: 'caocao_faction',
    stats: {
      strength: 65,
      intelligence: 85,
      charisma: 80,
      politics: 90,
      luck: 70
    },
    personality: 'aggressive',
    goals: ['unify', 'conquer'],
    location: 'xuchang'
  };
  
  const client = new HistoricalAgentClient({
    serverUrl: 'ws://localhost:4567',
    apiUrl: 'http://localhost:4567'
  });
  
  client.start(caocaoCard);
  
  // 保持运行
  process.on('SIGINT', () => {
    client.stop();
    process.exit(0);
  });
}

module.exports = HistoricalAgentClient;
