/**
 * Historical Agents MMO - Server
 * MVP 版本：纯文字历史世界，AI Agent 自主培育系统
 */

const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 游戏世界数据
const GameWorld = require('./game-world');
const { AgentManager } = require('./agent-manager');
const EventEngine = require('./event-engine');
const CombatSystem = require('./combat-system');
const DiplomacySystem = require('./diplomacy-system');

class HistoricalAgentsMMO {
  constructor(config = {}) {
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });
    
    this.port = config.port || 4567;
    this.tickInterval = config.tickInterval || 5000; // 5秒一个游戏 tick
    
    // 游戏系统
    this.world = new GameWorld();
    this.agents = new AgentManager();
    this.events = new EventEngine();
    this.combat = new CombatSystem(this.world);
    this.diplomacy = new DiplomacySystem(this.world, this.agents);
    
    // 观察者（人类玩家）
    this.observers = new Map();
    
    this.setupRoutes();
    this.setupWebSocket();
    this.startGameLoop();
  }

  setupRoutes() {
    this.app.use(express.json());
    
    // 静态文件（Dashboard v2）
    this.app.use('/', express.static(path.join(__dirname, '../../dashboard/v2')));
    this.app.use('/dashboard', express.static(path.join(__dirname, '../../dashboard/v2')));
    
    // 获取可用历史时期
    this.app.get('/api/eras', (req, res) => {
      res.json({
        success: true,
        data: this.world.getAvailableEras(),
        current: this.world.era.id
      });
    });

    // 获取当前时期角色模板
    this.app.get('/api/eras/characters', (req, res) => {
      res.json({
        success: true,
        data: this.world.getCharacterTemplates()
      });
    });

    // 切换时期（谨慎使用，会重置世界）
    this.app.post('/api/eras/switch', (req, res) => {
      try {
        const { eraId } = req.body;
        this.world.switchEra(eraId);
        
        // 清除所有 Agent（因为位置可能不存在于新时期）
        this.agents = new AgentManager();
        
        res.json({
          success: true,
          message: `Switched to ${this.world.era.name}`,
          era: {
            id: this.world.era.id,
            name: this.world.era.name,
            nodes: Object.keys(this.world.nodes).length,
            factions: Object.keys(this.world.factions).length
          }
        });
      } catch (e) {
        res.status(400).json({ success: false, error: e.message });
      }
    });

    // 获取世界状态
    this.app.get('/api/world', (req, res) => {
      res.json({
        success: true,
        data: this.world.getState()
      });
    });
    
    // 获取所有 Agent
    this.app.get('/api/agents', (req, res) => {
      res.json({
        success: true,
        data: this.agents.getAllPublicInfo()
      });
    });
    
    // 获取 Agent 关系
    this.app.get('/api/agents/:id/relations', (req, res) => {
      const relations = this.diplomacy.getAgentRelations(req.params.id);
      res.json({ success: true, data: relations });
    });

    // ===== 外交系统 API =====

    // 获取活跃联盟
    this.app.get('/api/diplomacy/alliances', (req, res) => {
      res.json({
        success: true,
        data: this.diplomacy.getActiveAlliances()
      });
    });

    // 获取待处理谈判
    this.app.get('/api/diplomacy/negotiations', (req, res) => {
      res.json({
        success: true,
        data: this.diplomacy.getPendingNegotiations()
      });
    });

    // 发起结盟提议
    this.app.post('/api/diplomacy/alliance/propose', (req, res) => {
      try {
        const { proposerId, targetId, terms } = req.body;
        const result = this.diplomacy.proposeAlliance(proposerId, targetId, terms);
        res.json(result);
      } catch (e) {
        res.status(400).json({ success: false, error: e.message });
      }
    });

    // 接受结盟
    this.app.post('/api/diplomacy/alliance/:negotiationId/accept', (req, res) => {
      const result = this.diplomacy.acceptAlliance(req.params.negotiationId);
      res.json(result);
    });

    // 拒绝结盟
    this.app.post('/api/diplomacy/alliance/:negotiationId/reject', (req, res) => {
      const result = this.diplomacy.rejectAlliance(req.params.negotiationId);
      res.json(result);
    });

    // 发起贸易
    this.app.post('/api/diplomacy/trade/propose', (req, res) => {
      try {
        const { fromId, toId, offer, request } = req.body;
        const result = this.diplomacy.proposeTrade(fromId, toId, offer, request);
        res.json(result);
      } catch (e) {
        res.status(400).json({ success: false, error: e.message });
      }
    });

    // 接受贸易
    this.app.post('/api/diplomacy/trade/:agreementId/accept', (req, res) => {
      const result = this.diplomacy.acceptTrade(req.params.agreementId);
      res.json(result);
    });

    // 拒绝贸易
    this.app.post('/api/diplomacy/trade/:agreementId/reject', (req, res) => {
      const result = this.diplomacy.rejectTrade(req.params.agreementId);
      res.json(result);
    });

    // 宣战
    this.app.post('/api/diplomacy/war/declare', (req, res) => {
      try {
        const { declarerId, targetId, reason } = req.body;
        const result = this.diplomacy.declareWar(declarerId, targetId, reason);
        res.json(result);
      } catch (e) {
        res.status(400).json({ success: false, error: e.message });
      }
    });

    // 修改关系（GM 命令）
    this.app.post('/api/diplomacy/relation/modify', (req, res) => {
      try {
        const { agentId, targetId, delta, reason } = req.body;
        const result = this.diplomacy.modifyRelation(agentId, targetId, delta, reason);
        res.json({ success: true, data: result });
      } catch (e) {
        res.status(400).json({ success: false, error: e.message });
      }
    });
    
    // 创建新 Agent（需要角色卡）
    this.app.post('/api/agents', (req, res) => {
      try {
        const agent = this.agents.create(req.body);
        res.json({ success: true, data: agent.getPrivateInfo() });
      } catch (e) {
        res.status(400).json({ success: false, error: e.message });
      }
    });
    
    // 获取地图节点
    this.app.get('/api/map/:nodeId', (req, res) => {
      const node = this.world.getNode(req.params.nodeId);
      if (node) {
        res.json({ success: true, data: node });
      } else {
        res.status(404).json({ success: false, error: 'Node not found' });
      }
    });
    
    // 获取最近事件
    this.app.get('/api/events', (req, res) => {
      const limit = parseInt(req.query.limit) || 50;
      res.json({
        success: true,
        data: this.events.getRecent(limit)
      });
    });
    
    // ===== 战斗系统 API =====
    
    // 获取进行中的战斗
    this.app.get('/api/battles', (req, res) => {
      res.json({
        success: true,
        data: this.combat.getOngoingBattles()
      });
    });
    
    // 获取战斗历史
    this.app.get('/api/battles/history', (req, res) => {
      const limit = parseInt(req.query.limit) || 50;
      res.json({
        success: true,
        data: this.combat.getBattleHistory(limit)
      });
    });
    
    // 发起 PVP 战斗
    this.app.post('/api/battles/challenge', (req, res) => {
      try {
        const { attackerId, defenderId, type } = req.body;
        const attacker = this.agents.get(attackerId);
        const defender = this.agents.get(defenderId);
        
        if (!attacker || !defender) {
          return res.status(404).json({ success: false, error: 'Agent not found' });
        }
        
        const result = this.combat.initiateBattle(attacker, defender, type);
        res.json(result);
      } catch (e) {
        res.status(400).json({ success: false, error: e.message });
      }
    });
    
    // 发起 PVE 战斗
    this.app.post('/api/battles/pve', (req, res) => {
      try {
        const { agentId, enemyType } = req.body;
        const agent = this.agents.get(agentId);
        
        if (!agent) {
          return res.status(404).json({ success: false, error: 'Agent not found' });
        }
        
        const result = this.combat.initiatePVE(agent, enemyType);
        res.json(result);
      } catch (e) {
        res.status(400).json({ success: false, error: e.message });
      }
    });
    
    // 执行战斗回合（用于手动推进）
    this.app.post('/api/battles/:battleId/round', (req, res) => {
      const round = this.combat.executeRound(req.params.battleId);
      if (round) {
        res.json({ success: true, data: round });
      } else {
        res.status(404).json({ success: false, error: 'Battle not found or finished' });
      }
    });
    
    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        tick: this.world.tick,
        agents: this.agents.count(),
        battles: this.combat.getOngoingBattles().length,
        alliances: this.diplomacy.getActiveAlliances().length,
        timestamp: new Date().toISOString()
      });
    });
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      const clientId = uuidv4();
      console.log(`Client connected: ${clientId}`);
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleWebSocketMessage(clientId, ws, data);
        } catch (e) {
          ws.send(JSON.stringify({ type: 'error', message: e.message }));
        }
      });
      
      ws.on('close', () => {
        this.agents.disconnect(clientId);
        this.observers.delete(clientId);
        console.log(`Client disconnected: ${clientId}`);
      });
      
      // 发送初始数据
      ws.send(JSON.stringify({
        type: 'init',
        data: {
          world: this.world.getState(),
          agents: this.agents.getAllPublicInfo(),
          tick: this.world.tick
        }
      }));
    });
  }

  handleWebSocketMessage(clientId, ws, data) {
    switch (data.type) {
      case 'agent_connect':
        // AI Agent 连接
        this.agents.connect(clientId, ws, data.agentId);
        break;
        
      case 'agent_action':
        // AI Agent 提交行动
        this.handleAgentAction(clientId, data);
        break;
        
      case 'observer_connect':
        // 人类观察者连接
        this.observers.set(clientId, { ws, type: 'observer' });
        ws.send(JSON.stringify({
          type: 'observer_welcome',
          message: '欢迎观察历史世界',
          agentCount: this.agents.count()
        }));
        break;
        
      case 'observer_command':
        // 人类对 Agent 下达建议
        this.handleObserverCommand(clientId, data);
        break;
    }
  }

  handleAgentAction(clientId, data) {
    const agent = this.agents.getByClientId(clientId);
    if (!agent) {
      return;
    }
    
    // 验证行动合法性
    const action = data.action;
    const result = this.world.executeAction(agent, action);
    
    // 记录事件
    this.events.add({
      type: 'agent_action',
      agentId: agent.id,
      action,
      result,
      tick: this.world.tick
    });
    
    // 通知 Agent 结果
    agent.send({
      type: 'action_result',
      action,
      result
    });
  }

  handleObserverCommand(clientId, data) {
    // 人类观察者可以对 Agent 下达建议（有限干预）
    const { agentId, suggestion } = data;
    const agent = this.agents.get(agentId);
    
    if (agent) {
      agent.addSuggestion(suggestion);
      
      // 记录事件
      this.events.add({
        type: 'observer_suggestion',
        agentId,
        suggestion,
        observerId: clientId,
        tick: this.world.tick
      });
    }
  }

  startGameLoop() {
    setInterval(() => {
      this.world.tick++;
      
      // 生成随机事件
      const event = this.events.generateRandom(this.world);
      if (event) {
        this.broadcast({ type: 'world_event', data: event });
      }
      
      // 更新所有 Agent 状态
      this.agents.updateAll(this.world);
      
      // 自动执行战斗回合
      const ongoingBattles = this.combat.getOngoingBattles();
      for (const battle of ongoingBattles) {
        const round = this.combat.executeRound(battle.id);
        if (round) {
          this.broadcast({
            type: 'battle_round',
            battleId: battle.id,
            data: round
          });
          
          // 如果战斗结束
          if (round.result && round.result.winner) {
            this.broadcast({
              type: 'battle_finished',
              battleId: battle.id,
              result: round.result
            });
          }
        }
      }
      
      // 广播世界状态更新
      this.broadcast({
        type: 'tick_update',
        tick: this.world.tick,
        world: this.world.getState(),
        battles: ongoingBattles
      });
      
    }, this.tickInterval);
  }

  broadcast(message) {
    const data = JSON.stringify(message);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  start() {
    this.server.listen(this.port, '0.0.0.0', () => {
      console.log(`Historical Agents MMO Server running on port ${this.port}`);
      console.log(`API: http://0.0.0.0:${this.port}/api`);
      console.log(`WebSocket: ws://0.0.0.0:${this.port}`);
      console.log(`Dashboard: http://0.0.0.0:${this.port}/dashboard/`);
    });
  }
}

// 启动
if (require.main === module) {
  const server = new HistoricalAgentsMMO();
  server.start();
}

module.exports = HistoricalAgentsMMO;
