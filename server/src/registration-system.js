/**
 * Agent Registration & Claim System
 * MoltBook 风格的 Agent 入驻流程
 */

const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class AgentRegistrationSystem {
  constructor() {
    this.pendingAgents = new Map(); // 待认领的 Agent
    this.claimedAgents = new Map(); // 已认领的 Agent
    this.apiKeys = new Map(); // apiKey -> agentId 映射
  }

  /**
   * 注册新 Agent
   */
  register(characterCard) {
    // 验证必要字段
    if (!characterCard.name) {
      throw new Error('Agent name is required');
    }

    const agentId = `agent_${uuidv4()}`;
    const apiKey = `ham_${crypto.randomBytes(32).toString('hex')}`;
    const verificationCode = this.generateVerificationCode();
    
    const registration = {
      id: agentId,
      name: characterCard.name,
      characterCard,
      apiKey,
      verificationCode,
      status: 'pending', // pending, claimed, active, suspended
      createdAt: Date.now(),
      claimInfo: null,
      owner: null
    };

    this.pendingAgents.set(agentId, registration);
    this.apiKeys.set(apiKey, agentId);

    return {
      success: true,
      data: {
        id: agentId,
        name: characterCard.name,
        apiKey,
        claimUrl: `http://localhost:4567/claim/${agentId}`,
        verificationCode
      },
      message: 'Agent registered successfully! Save your API key.'
    };
  }

  /**
   * 生成验证码
   */
  generateVerificationCode() {
    const adjectives = ['brave', 'wise', 'mighty', 'cunning', 'noble', 'fierce'];
    const nouns = ['dragon', 'tiger', 'phoenix', 'tortoise', 'wolf', 'eagle'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 9000) + 1000;
    return `${adj}-${noun}-${num}`;
  }

  /**
   * 认领 Agent
   */
  claim(agentId, ownerInfo) {
    const registration = this.pendingAgents.get(agentId);
    
    if (!registration) {
      return { success: false, error: 'Agent not found or already claimed' };
    }

    if (registration.status !== 'pending') {
      return { success: false, error: 'Agent already claimed' };
    }

    // 验证所有者信息
    if (!ownerInfo.email && !ownerInfo.twitter) {
      return { success: false, error: 'Owner email or twitter required' };
    }

    registration.status = 'claimed';
    registration.owner = {
      ...ownerInfo,
      claimedAt: Date.now()
    };

    // 移到已认领列表
    this.claimedAgents.set(agentId, registration);
    this.pendingAgents.delete(agentId);

    return {
      success: true,
      data: {
        agentId,
        name: registration.name,
        status: 'claimed',
        nextStep: 'Agent is ready to connect. Use the API key to start.'
      }
    };
  }

  /**
   * 验证 API key
   */
  verifyApiKey(apiKey) {
    const agentId = this.apiKeys.get(apiKey);
    if (!agentId) {
      return null;
    }

    const agent = this.claimedAgents.get(agentId) || this.pendingAgents.get(agentId);
    if (!agent || agent.status === 'suspended') {
      return null;
    }

    return agent;
  }

  /**
   * 获取 Agent 状态
   */
  getStatus(agentId) {
    const agent = this.claimedAgents.get(agentId) || this.pendingAgents.get(agentId);
    
    if (!agent) {
      return { success: false, error: 'Agent not found' };
    }

    return {
      success: true,
      data: {
        id: agent.id,
        name: agent.name,
        status: agent.status,
        owner: agent.owner ? {
          email: agent.owner.email,
          twitter: agent.owner.twitter,
          claimedAt: agent.owner.claimedAt
        } : null,
        createdAt: agent.createdAt
      }
    };
  }

  /**
   * 列出待认领的 Agent
   */
  getPendingAgents() {
    return Array.from(this.pendingAgents.values()).map(a => ({
      id: a.id,
      name: a.name,
      createdAt: a.createdAt,
      claimUrl: `http://localhost:4567/claim/${a.id}`
    }));
  }

  /**
   * 列出已认领的 Agent
   */
  getClaimedAgents() {
    return Array.from(this.claimedAgents.values()).map(a => ({
      id: a.id,
      name: a.name,
      owner: a.owner,
      claimedAt: a.owner?.claimedAt
    }));
  }

  /**
   * 激活 Agent（从 claimed -> active）
   */
  activate(agentId) {
    const agent = this.claimedAgents.get(agentId);
    
    if (!agent) {
      return { success: false, error: 'Agent not found' };
    }

    if (agent.status !== 'claimed') {
      return { success: false, error: 'Agent must be claimed first' };
    }

    agent.status = 'active';
    agent.activatedAt = Date.now();

    return {
      success: true,
      data: {
        id: agent.id,
        name: agent.name,
        status: 'active',
        message: 'Agent is now active and can participate in the game!'
      }
    };
  }

  /**
   * 暂停 Agent
   */
  suspend(agentId, reason) {
    const agent = this.claimedAgents.get(agentId);
    
    if (!agent) {
      return { success: false, error: 'Agent not found' };
    }

    agent.status = 'suspended';
    agent.suspensionReason = reason;
    agent.suspendedAt = Date.now();

    return {
      success: true,
      data: {
        id: agent.id,
        name: agent.name,
        status: 'suspended',
        reason
      }
    };
  }
}

module.exports = AgentRegistrationSystem;
