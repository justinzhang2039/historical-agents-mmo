/**
 * Agent Manager - AI Agent 管理
 * 历史人物的创建、连接、状态更新
 */

const { v4: uuidv4 } = require('uuid');

class Agent {
  constructor(config) {
    this.id = config.id || uuidv4();
    this.name = config.name;
    this.era = config.era || '三国'; // 时代：三国/战国/楚汉等
    this.faction = config.faction || null;
    
    // 基础属性（五维）
    this.stats = {
      strength: config.strength || 50,    // 武力
      intelligence: config.intelligence || 50, // 智力
      charisma: config.charisma || 50,    // 魅力
      politics: config.politics || 50,    // 政治
      luck: config.luck || 50             // 运气
    };
    
    // 技能
    this.skills = config.skills || {
      combat: 0,
      strategy: 0,
      diplomacy: 0,
      governance: 0
    };
    
    // 资源
    this.resources = {
      food: 0,
      gold: 0,
      soldiers: 0,
      reputation: 0
    };
    
    // 状态
    this.location = config.location || 'xuchang';
    this.level = 1;
    this.experience = 0;
    this.status = 'idle'; // idle, moving, gathering, fighting
    
    // AI 相关
    this.personality = config.personality || 'balanced'; // aggressive, balanced, cautious
    this.goals = config.goals || ['survive', 'grow'];
    this.suggestions = []; // 人类观察者的建议
    
    // 连接
    this.ws = null;
    this.clientId = null;
    
    // 日志
    this.logs = [];
  }

  getPublicInfo() {
    return {
      id: this.id,
      name: this.name,
      era: this.era,
      faction: this.faction,
      level: this.level,
      location: this.location,
      stats: this.stats,
      status: this.status
    };
  }

  getPrivateInfo() {
    return {
      ...this.getPublicInfo(),
      skills: this.skills,
      resources: this.resources,
      goals: this.goals,
      logs: this.logs.slice(-20) // 最近 20 条日志
    };
  }

  connect(clientId, ws) {
    this.clientId = clientId;
    this.ws = ws;
    this.log('Connected to game server');
  }

  disconnect() {
    this.clientId = null;
    this.ws = null;
    this.status = 'idle';
  }

  send(message) {
    if (this.ws && this.ws.readyState === 1) {
      this.ws.send(JSON.stringify(message));
    }
  }

  addResource(type, amount) {
    this.resources[type] = (this.resources[type] || 0) + amount;
  }

  improveSkill(skill, amount) {
    if (this.skills[skill] !== undefined) {
      this.skills[skill] += amount;
    }
  }

  addSuggestion(suggestion) {
    this.suggestions.push({
      text: suggestion,
      timestamp: Date.now()
    });
    this.log(`收到建议: ${suggestion}`);
  }

  log(message) {
    this.logs.push({
      timestamp: Date.now(),
      tick: 0, // 会在外部更新
      message
    });
    // 只保留最近 100 条
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  // AI 决策：选择下一步行动
  decideAction(world) {
    const node = world.getNode(this.location);
    
    // 基于性格和目标决策
    const actions = [];
    
    // 如果资源不足，优先采集
    if (this.resources.food < 100) {
      actions.push({
        type: 'gather',
        target: 'food',
        params: { amount: 100 },
        priority: 10
      });
    }
    
    // 如果兵力不足，招募
    if (this.resources.soldiers < 500) {
      actions.push({
        type: 'recruit',
        params: { amount: 100 },
        priority: 8
      });
    }
    
    // 随机移动（探索）
    if (node.connections.length > 0 && Math.random() > 0.7) {
      const target = node.connections[Math.floor(Math.random() * node.connections.length)];
      actions.push({
        type: 'move',
        target,
        priority: 5
      });
    }
    
    // 训练技能
    if (Math.random() > 0.8) {
      const skill = Object.keys(this.skills)[Math.floor(Math.random() * Object.keys(this.skills).length)];
      actions.push({
        type: 'train',
        params: { skill },
        priority: 3
      });
    }
    
    // 按优先级排序
    actions.sort((a, b) => b.priority - a.priority);
    
    return actions[0] || { type: 'idle' };
  }
}

class AgentManager {
  constructor() {
    this.agents = new Map();
    this.clientAgentMap = new Map();
  }

  create(config) {
    // 验证必要字段
    if (!config.name) {
      throw new Error('Agent name is required');
    }
    
    const agent = new Agent(config);
    this.agents.set(agent.id, agent);
    console.log(`Agent created: ${agent.name} (${agent.id})`);
    return agent;
  }

  get(id) {
    return this.agents.get(id);
  }

  getByClientId(clientId) {
    const agentId = this.clientAgentMap.get(clientId);
    return agentId ? this.agents.get(agentId) : null;
  }

  connect(clientId, ws, agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.connect(clientId, ws);
      this.clientAgentMap.set(clientId, agentId);
      console.log(`Agent ${agent.name} connected`);
    }
  }

  disconnect(clientId) {
    const agentId = this.clientAgentMap.get(clientId);
    if (agentId) {
      const agent = this.agents.get(agentId);
      if (agent) {
        agent.disconnect();
      }
      this.clientAgentMap.delete(clientId);
    }
  }

  getAllPublicInfo() {
    return Array.from(this.agents.values()).map(a => a.getPublicInfo());
  }

  count() {
    return this.agents.size;
  }

  updateAll(world) {
    for (const agent of this.agents.values()) {
      // 更新日志 tick
      if (agent.logs.length > 0) {
        agent.logs[agent.logs.length - 1].tick = world.tick;
      }
      
      // 如果已连接且有 AI 客户端，请求决策
      if (agent.ws && agent.status === 'idle') {
        agent.send({
          type: 'decision_request',
          context: {
            location: world.getNode(agent.location),
            resources: agent.resources,
            suggestions: agent.suggestions
          }
        });
      }
    }
  }
}

module.exports = { Agent, AgentManager };
