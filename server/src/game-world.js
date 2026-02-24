/**
 * Game World - 游戏世界管理
 * 支持多历史时期：三国、战国、楚汉
 */

const HistoricalEras = require('./historical-eras');

class GameWorld {
  constructor(eraId = 'sanguo') {
    this.tick = 0;
    this.era = null;
    this.nodes = {};
    this.resources = {};
    this.factions = {};
    this.loadEra(eraId);
  }

  loadEra(eraId) {
    const era = HistoricalEras[eraId];
    if (!era) {
      throw new Error(`Unknown era: ${eraId}`);
    }
    
    this.era = era;
    
    // 深拷贝地图数据
    this.nodes = JSON.parse(JSON.stringify(era.nodes));
    
    // 添加 agents 数组到每个节点
    for (const node of Object.values(this.nodes)) {
      node.agents = [];
    }
    
    this.resources = this.initializeResources();
    this.factions = JSON.parse(JSON.stringify(era.factions));
    
    console.log(`Loaded era: ${era.name} (${era.period})`);
  }

  switchEra(eraId) {
    this.loadEra(eraId);
    this.tick = 0;
  }

  getAvailableEras() {
    return Object.values(HistoricalEras).map(e => ({
      id: e.id,
      name: e.name,
      period: e.period,
      description: e.description
    }));
  }

  getCharacterTemplates() {
    return this.era.characters || [];
  }

  initializeResources() {
    return {
      food: { name: '粮草', unit: '石' },
      gold: { name: '黄金', unit: '两' },
      population: { name: '人口', unit: '人' },
      soldiers: { name: '兵力', unit: '人' },
      reputation: { name: '声望', unit: '点' }
    };
  }

  getState() {
    return {
      tick: this.tick,
      era: {
        id: this.era.id,
        name: this.era.name,
        period: this.era.period,
        description: this.era.description
      },
      nodes: this.nodes,
      factions: this.factions
    };
  }

  getNode(nodeId) {
    return this.nodes[nodeId];
  }

  executeAction(agent, action) {
    const { type, target, params } = action;
    
    switch (type) {
      case 'move':
        return this.executeMove(agent, target);
      case 'gather':
        return this.executeGather(agent, target, params);
      case 'trade':
        return this.executeTrade(agent, target, params);
      case 'recruit':
        return this.executeRecruit(agent, params);
      case 'train':
        return this.executeTrain(agent, params);
      default:
        return { success: false, error: 'Unknown action type' };
    }
  }

  executeMove(agent, targetNodeId) {
    const currentNode = this.nodes[agent.location];
    const targetNode = this.nodes[targetNodeId];
    
    if (!targetNode) {
      return { success: false, error: 'Target node not found' };
    }
    
    if (!currentNode.connections.includes(targetNodeId)) {
      return { success: false, error: 'No connection to target' };
    }
    
    // 从当前节点移除
    currentNode.agents = currentNode.agents.filter(id => id !== agent.id);
    
    // 添加到目标节点
    targetNode.agents.push(agent.id);
    agent.location = targetNodeId;
    
    return {
      success: true,
      message: `${agent.name} 移动到了 ${targetNode.name}`,
      from: currentNode.name,
      to: targetNode.name
    };
  }

  executeGather(agent, resourceType, params) {
    const node = this.nodes[agent.location];
    const amount = Math.min(
      params.amount || 100,
      node.resources[resourceType] || 0
    );
    
    if (amount <= 0) {
      return { success: false, error: 'Resource depleted' };
    }
    
    node.resources[resourceType] -= amount;
    agent.addResource(resourceType, amount);
    
    return {
      success: true,
      message: `${agent.name} 采集了 ${amount} ${resourceType}`,
      gained: amount
    };
  }

  executeTrade(agent, targetAgentId, params) {
    return {
      success: true,
      message: '交易完成（简化版）',
      trade: params
    };
  }

  executeRecruit(agent, params) {
    const node = this.nodes[agent.location];
    const cost = (params.amount || 100) * 0.1;
    
    if (node.resources.food < cost) {
      return { success: false, error: 'Insufficient food' };
    }
    
    node.resources.food -= cost;
    agent.addResource('soldiers', params.amount || 100);
    
    return {
      success: true,
      message: `${agent.name} 招募了 ${params.amount || 100} 士兵`,
      cost: `${cost} 石粮食`
    };
  }

  executeTrain(agent, params) {
    const skill = params.skill;
    const improvement = Math.random() * 2;
    
    agent.improveSkill(skill, improvement);
    
    return {
      success: true,
      message: `${agent.name} 训练了 ${skill}，提升 ${improvement.toFixed(1)}`,
      skill,
      improvement: improvement.toFixed(1)
    };
  }
}

module.exports = GameWorld;
