/**
 * Diplomacy System - 外交系统
 * 结盟、贸易、谈判、关系管理
 */

class DiplomacySystem {
  constructor(world, agents) {
    this.world = world;
    this.agents = agents;
    
    // 外交关系存储
    this.relations = new Map(); // agentId -> { targetId: { type, level, since } }
    this.alliances = new Map(); // allianceId -> { name, members, founded, type }
    this.tradeAgreements = new Map(); // agreementId -> { from, to, terms, expiry }
    this.negotiations = new Map(); // negotiationId -> { participants, topic, status, proposals }
    
    // 关系类型
    this.RELATION_TYPES = {
      ALLY: 'ally',           // 盟友
      FRIENDLY: 'friendly',   // 友好
      NEUTRAL: 'neutral',     // 中立
      HOSTILE: 'hostile',     // 敌对
      WAR: 'war'              // 战争
    };
    
    // 关系等级 (-100 到 +100)
    this.RELATION_LEVELS = {
      SWORN_BROTHER: { min: 90, name: '结义兄弟' },
      CLOSE_ALLY: { min: 70, name: '亲密盟友' },
      FRIENDLY: { min: 30, name: '友好' },
      NEUTRAL: { min: -10, name: '中立' },
      SUSPICIOUS: { min: -30, name: '猜忌' },
      HOSTILE: { min: -60, name: '敌对' },
      MORTAL_ENEMY: { min: -100, name: '死敌' }
    };
  }

  /**
   * 获取或创建关系记录
   */
  getRelation(agentId, targetId) {
    if (!this.relations.has(agentId)) {
      this.relations.set(agentId, new Map());
    }
    
    const agentRelations = this.relations.get(agentId);
    
    if (!agentRelations.has(targetId)) {
      // 初始化中立关系
      agentRelations.set(targetId, {
        type: this.RELATION_TYPES.NEUTRAL,
        level: 0,
        since: Date.now(),
        history: []
      });
    }
    
    return agentRelations.get(targetId);
  }

  /**
   * 修改关系值
   */
  modifyRelation(agentId, targetId, delta, reason) {
    const relation = this.getRelation(agentId, targetId);
    const oldLevel = relation.level;
    
    relation.level = Math.max(-100, Math.min(100, relation.level + delta));
    relation.history.push({
      timestamp: Date.now(),
      delta,
      reason,
      tick: this.world.tick
    });
    
    // 更新关系类型
    this.updateRelationType(relation);
    
    // 双向关系（不对称，但互相影响）
    const reverseRelation = this.getRelation(targetId, agentId);
    reverseRelation.level = Math.max(-100, Math.min(100, 
      reverseRelation.level + delta * 0.5
    ));
    this.updateRelationType(reverseRelation);
    
    return {
      agentId,
      targetId,
      oldLevel,
      newLevel: relation.level,
      type: relation.type,
      reason
    };
  }

  /**
   * 根据关系值更新关系类型
   */
  updateRelationType(relation) {
    const level = relation.level;
    
    if (level >= 70) {
      relation.type = this.RELATION_TYPES.ALLY;
    } else if (level >= 30) {
      relation.type = this.RELATION_TYPES.FRIENDLY;
    } else if (level >= -10) {
      relation.type = this.RELATION_TYPES.NEUTRAL;
    } else if (level >= -50) {
      relation.type = this.RELATION_TYPES.HOSTILE;
    } else {
      relation.type = this.RELATION_TYPES.WAR;
    }
  }

  /**
   * 获取关系等级名称
   */
  getRelationLevelName(level) {
    for (const [key, value] of Object.entries(this.RELATION_LEVELS)) {
      if (level >= value.min) {
        return value.name;
      }
    }
    return '未知';
  }

  /**
   * 发起结盟提议
   */
  proposeAlliance(proposerId, targetId, terms = {}) {
    const proposer = this.agents.get(proposerId);
    const target = this.agents.get(targetId);
    
    if (!proposer || !target) {
      return { success: false, error: 'Agent not found' };
    }
    
    // 检查当前关系
    const relation = this.getRelation(proposerId, targetId);
    if (relation.type === this.RELATION_TYPES.WAR) {
      return { success: false, error: '处于战争状态，无法结盟' };
    }
    
    // 创建谈判
    const negotiation = {
      id: `negotiation_${Date.now()}`,
      type: 'alliance',
      proposer: proposerId,
      target: targetId,
      terms: {
        duration: terms.duration || 30, // 默认30 ticks
        mutualDefense: terms.mutualDefense !== false, // 默认共同防御
        tradeBonus: terms.tradeBonus || 10, // 贸易加成
        ...terms
      },
      status: 'pending', // pending, accepted, rejected, expired
      createdAt: Date.now(),
      tick: this.world.tick
    };
    
    this.negotiations.set(negotiation.id, negotiation);
    
    // AI 自动决策（简化版）
    if (target.personality !== 'player') {
      setTimeout(() => this.aiRespondToAlliance(negotiation), 5000);
    }
    
    return {
      success: true,
      negotiation: this.getNegotiationPublicInfo(negotiation)
    };
  }

  /**
   * AI 响应结盟提议
   */
  aiRespondToAlliance(negotiation) {
    const target = this.agents.get(negotiation.target);
    const proposer = this.agents.get(negotiation.proposer);
    
    if (!target || !proposer) return;
    
    const relation = this.getRelation(negotiation.target, negotiation.proposer);
    
    // 基于性格和关系决定
    let acceptChance = 0.5;
    
    // 关系越好越容易接受
    acceptChance += relation.level / 200;
    
    // 性格影响
    if (target.personality === 'aggressive') {
      acceptChance += 0.1; // 好战者喜欢盟友
    } else if (target.personality === 'cautious') {
      acceptChance -= 0.1; // 谨慎者更小心
    }
    
    // 势力对比
    if (proposer.resources.soldiers > target.resources.soldiers * 1.5) {
      acceptChance += 0.2; // 强者提议更容易被接受
    }
    
    if (Math.random() < acceptChance) {
      this.acceptAlliance(negotiation.id);
    } else {
      this.rejectAlliance(negotiation.id);
    }
  }

  /**
   * 接受结盟
   */
  acceptAlliance(negotiationId) {
    const negotiation = this.negotiations.get(negotiationId);
    if (!negotiation || negotiation.status !== 'pending') {
      return { success: false, error: 'Invalid negotiation' };
    }
    
    negotiation.status = 'accepted';
    
    // 创建正式联盟
    const alliance = {
      id: `alliance_${Date.now()}`,
      name: `${this.agents.get(negotiation.proposer).name}-${this.agents.get(negotiation.target).name}联盟`,
      members: [negotiation.proposer, negotiation.target],
      founded: Date.now(),
      tick: this.world.tick,
      terms: negotiation.terms,
      status: 'active'
    };
    
    this.alliances.set(alliance.id, alliance);
    
    // 大幅提升关系
    this.modifyRelation(negotiation.proposer, negotiation.target, 30, '结盟');
    this.modifyRelation(negotiation.target, negotiation.proposer, 30, '结盟');
    
    return {
      success: true,
      alliance: this.getAlliancePublicInfo(alliance)
    };
  }

  /**
   * 拒绝结盟
   */
  rejectAlliance(negotiationId) {
    const negotiation = this.negotiations.get(negotiationId);
    if (!negotiation) return { success: false, error: 'Invalid negotiation' };
    
    negotiation.status = 'rejected';
    
    // 轻微降低关系
    this.modifyRelation(negotiation.proposer, negotiation.target, -5, '拒绝结盟');
    
    return { success: true };
  }

  /**
   * 发起贸易
   */
  proposeTrade(fromId, toId, offer, request) {
    const from = this.agents.get(fromId);
    const to = this.agents.get(toId);
    
    if (!from || !to) {
      return { success: false, error: 'Agent not found' };
    }
    
    // 检查资源是否足够
    for (const [resource, amount] of Object.entries(offer)) {
      if ((from.resources[resource] || 0) < amount) {
        return { success: false, error: `资源不足: ${resource}` };
      }
    }
    
    const agreement = {
      id: `trade_${Date.now()}`,
      from: fromId,
      to: toId,
      offer,    // { gold: 100, food: 500 }
      request,  // { soldiers: 100 }
      status: 'pending',
      createdAt: Date.now(),
      tick: this.world.tick
    };
    
    this.tradeAgreements.set(agreement.id, agreement);
    
    // AI 自动响应
    if (to.personality !== 'player') {
      setTimeout(() => this.aiRespondToTrade(agreement), 3000);
    }
    
    return {
      success: true,
      agreement: this.getTradePublicInfo(agreement)
    };
  }

  /**
   * AI 响应贸易提议
   */
  aiRespondToTrade(agreement) {
    const to = this.agents.get(agreement.to);
    if (!to) return;
    
    // 检查是否有足够资源
    for (const [resource, amount] of Object.entries(agreement.request)) {
      if ((to.resources[resource] || 0) < amount) {
        this.rejectTrade(agreement.id);
        return;
      }
    }
    
    // 简单价值判断
    const offerValue = this.calculateTradeValue(agreement.offer);
    const requestValue = this.calculateTradeValue(agreement.request);
    
    if (offerValue >= requestValue * 0.8) {
      this.acceptTrade(agreement.id);
    } else {
      this.rejectTrade(agreement.id);
    }
  }

  /**
   * 计算贸易价值
   */
  calculateTradeValue(items) {
    const values = {
      gold: 1,
      food: 0.1,
      soldiers: 2,
      reputation: 5
    };
    
    let total = 0;
    for (const [resource, amount] of Object.entries(items)) {
      total += (values[resource] || 0) * amount;
    }
    return total;
  }

  /**
   * 接受贸易
   */
  acceptTrade(agreementId) {
    const agreement = this.tradeAgreements.get(agreementId);
    if (!agreement || agreement.status !== 'pending') {
      return { success: false, error: 'Invalid agreement' };
    }
    
    const from = this.agents.get(agreement.from);
    const to = this.agents.get(agreement.to);
    
    // 转移资源
    for (const [resource, amount] of Object.entries(agreement.offer)) {
      from.resources[resource] -= amount;
      to.resources[resource] = (to.resources[resource] || 0) + amount;
    }
    
    for (const [resource, amount] of Object.entries(agreement.request)) {
      to.resources[resource] -= amount;
      from.resources[resource] = (from.resources[resource] || 0) + amount;
    }
    
    agreement.status = 'completed';
    
    // 提升关系
    this.modifyRelation(agreement.from, agreement.to, 5, '贸易成功');
    this.modifyRelation(agreement.to, agreement.from, 5, '贸易成功');
    
    return { success: true, agreement };
  }

  /**
   * 拒绝贸易
   */
  rejectTrade(agreementId) {
    const agreement = this.tradeAgreements.get(agreementId);
    if (!agreement) return { success: false, error: 'Invalid agreement' };
    
    agreement.status = 'rejected';
    return { success: true };
  }

  /**
   * 宣战
   */
  declareWar(declarerId, targetId, reason = '') {
    const declarer = this.agents.get(declarerId);
    const target = this.agents.get(targetId);
    
    if (!declarer || !target) {
      return { success: false, error: 'Agent not found' };
    }
    
    // 设置为战争关系
    this.modifyRelation(declarerId, targetId, -50, `宣战: ${reason}`);
    this.modifyRelation(targetId, declarerId, -50, '被宣战');
    
    // 解除任何现有联盟
    for (const [allianceId, alliance] of this.alliances) {
      if (alliance.members.includes(declarerId) && alliance.members.includes(targetId)) {
        alliance.status = 'broken';
        alliance.brokenReason = '战争';
      }
    }
    
    return {
      success: true,
      war: {
        declarer: declarer.name,
        target: target.name,
        reason,
        tick: this.world.tick
      }
    };
  }

  /**
   * 获取 Agent 的所有关系
   */
  getAgentRelations(agentId) {
    if (!this.relations.has(agentId)) {
      return [];
    }
    
    const relations = [];
    for (const [targetId, relation] of this.relations.get(agentId)) {
      const target = this.agents.get(targetId);
      if (target) {
        relations.push({
          targetId,
          targetName: target.name,
          type: relation.type,
          level: relation.level,
          levelName: this.getRelationLevelName(relation.level),
          since: relation.since
        });
      }
    }
    
    return relations.sort((a, b) => b.level - a.level);
  }

  /**
   * 获取公开信息方法
   */
  getNegotiationPublicInfo(negotiation) {
    return {
      id: negotiation.id,
      type: negotiation.type,
      status: negotiation.status,
      proposer: this.agents.get(negotiation.proposer)?.name,
      target: this.agents.get(negotiation.target)?.name,
      terms: negotiation.terms
    };
  }

  getAlliancePublicInfo(alliance) {
    return {
      id: alliance.id,
      name: alliance.name,
      members: alliance.members.map(id => this.agents.get(id)?.name).filter(Boolean),
      founded: alliance.founded,
      status: alliance.status,
      terms: alliance.terms
    };
  }

  getTradePublicInfo(agreement) {
    return {
      id: agreement.id,
      from: this.agents.get(agreement.from)?.name,
      to: this.agents.get(agreement.to)?.name,
      offer: agreement.offer,
      request: agreement.request,
      status: agreement.status
    };
  }

  /**
   * 获取所有活跃联盟
   */
  getActiveAlliances() {
    return Array.from(this.alliances.values())
      .filter(a => a.status === 'active')
      .map(a => this.getAlliancePublicInfo(a));
  }

  /**
   * 获取待处理的谈判
   */
  getPendingNegotiations() {
    return Array.from(this.negotiations.values())
      .filter(n => n.status === 'pending')
      .map(n => this.getNegotiationPublicInfo(n));
  }
}

module.exports = DiplomacySystem;
