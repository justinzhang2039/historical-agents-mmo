/**
 * Combat System - 战斗系统
 * Agent 之间的战斗、PVE、战斗结算
 */

class CombatSystem {
  constructor(world) {
    this.world = world;
    this.battles = new Map(); // 进行中的战斗
    this.battleHistory = [];  // 战斗历史
  }

  /**
   * 发起战斗
   */
  initiateBattle(attacker, defender, type = 'duel') {
    // 检查是否在同一地点
    if (attacker.location !== defender.location) {
      return {
        success: false,
        error: '不在同一地点，无法战斗'
      };
    }

    // 检查是否已有战斗
    if (this.isInBattle(attacker.id) || this.isInBattle(defender.id)) {
      return {
        success: false,
        error: '一方已在战斗中'
      };
    }

    const battle = {
      id: `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type, // duel:单挑, skirmish:小规模冲突, siege:攻城
      attacker: {
        id: attacker.id,
        name: attacker.name,
        stats: { ...attacker.stats },
        soldiers: attacker.resources.soldiers || 0
      },
      defender: {
        id: defender.id,
        name: defender.name,
        stats: { ...defender.stats },
        soldiers: defender.resources.soldiers || 0
      },
      location: attacker.location,
      rounds: [],
      status: 'ongoing', // ongoing, finished
      startTime: Date.now(),
      tick: this.world.tick
    };

    this.battles.set(battle.id, battle);
    
    // 设置 Agent 状态
    attacker.status = 'fighting';
    defender.status = 'fighting';

    return {
      success: true,
      battle: this.getBattlePublicInfo(battle)
    };
  }

  /**
   * 执行战斗回合
   */
  executeRound(battleId) {
    const battle = this.battles.get(battleId);
    if (!battle || battle.status !== 'ongoing') {
      return null;
    }

    const round = {
      number: battle.rounds.length + 1,
      attackerAction: {},
      defenderAction: {},
      result: {}
    };

    // 计算战力（简化公式）
    const attackerPower = this.calculatePower(battle.attacker);
    const defenderPower = this.calculatePower(battle.defender);

    // 随机因素（运气）
    const attackerLuck = Math.random() * 0.2 + 0.9; // 0.9 - 1.1
    const defenderLuck = Math.random() * 0.2 + 0.9;

    const attackerFinal = attackerPower * attackerLuck;
    const defenderFinal = defenderPower * defenderLuck;

    // 决定胜负
    let winner, loser;
    if (attackerFinal > defenderFinal) {
      winner = battle.attacker;
      loser = battle.defender;
    } else {
      winner = battle.defender;
      loser = battle.attacker;
    }

    // 计算损失
    const powerDiff = Math.abs(attackerFinal - defenderFinal);
    const baseDamage = Math.floor(powerDiff / 10);
    
    // 士兵损失
    const attackerLoss = Math.floor(baseDamage * (0.5 + Math.random() * 0.5));
    const defenderLoss = Math.floor(baseDamage * (0.5 + Math.random() * 0.5));

    battle.attacker.soldiers = Math.max(0, battle.attacker.soldiers - attackerLoss);
    battle.defender.soldiers = Math.max(0, battle.defender.soldiers - defenderLoss);

    // 记录回合
    round.attackerAction = {
      power: Math.floor(attackerFinal),
      soldiersLost: attackerLoss,
      remainingSoldiers: battle.attacker.soldiers
    };
    
    round.defenderAction = {
      power: Math.floor(defenderFinal),
      soldiersLost: defenderLoss,
      remainingSoldiers: battle.defender.soldiers
    };

    round.result = {
      winner: winner.name,
      winnerId: winner.id,
      description: this.generateRoundDescription(battle, winner, loser, attackerLoss, defenderLoss)
    };

    battle.rounds.push(round);

    // 检查战斗是否结束（最多5回合，或一方士兵耗尽）
    if (battle.rounds.length >= 5 || 
        battle.attacker.soldiers <= 0 || 
        battle.defender.soldiers <= 0) {
      this.finishBattle(battle);
    }

    return round;
  }

  /**
   * 计算战斗力
   */
  calculatePower(combatant) {
    // 基础战力 = 武力*0.4 + 智力*0.3 + 运气*0.2 + 魅力*0.1
    const basePower = 
      combatant.stats.strength * 0.4 +
      combatant.stats.intelligence * 0.3 +
      combatant.stats.luck * 0.2 +
      combatant.stats.charisma * 0.1;

    // 士兵加成（每100士兵+10战力）
    const soldierBonus = (combatant.soldiers / 100) * 10;

    return basePower + soldierBonus;
  }

  /**
   * 生成回合描述
   */
  generateRoundDescription(battle, winner, loser, attackerLoss, defenderLoss) {
    const descriptions = [
      `${winner.name} 指挥有方，${loser.name} 阵脚大乱`,
      `${winner.name} 士气高涨，${loser.name} 损兵折将`,
      `双方激战，${winner.name} 略占上风`,
      `${loser.name} 中了${winner.name}的计谋，损失惨重`,
      `${winner.name} 勇猛冲锋，${loser.name} 难以抵挡`
    ];

    const baseDesc = descriptions[Math.floor(Math.random() * descriptions.length)];
    const lossDesc = `（攻方损失${attackerLoss}人，守方损失${defenderLoss}人）`;
    
    return baseDesc + lossDesc;
  }

  /**
   * 结束战斗
   */
  finishBattle(battle) {
    battle.status = 'finished';
    battle.endTime = Date.now();

    // 确定最终胜者
    const attackerPower = this.calculatePower(battle.attacker);
    const defenderPower = this.calculatePower(battle.defender);
    
    let winner, loser;
    if (attackerPower > defenderPower || battle.defender.soldiers <= 0) {
      winner = battle.attacker;
      loser = battle.defender;
    } else {
      winner = battle.defender;
      loser = battle.attacker;
    }

    battle.result = {
      winner: winner.name,
      winnerId: winner.id,
      loser: loser.name,
      loserId: loser.id,
      totalRounds: battle.rounds.length,
      attackerRemaining: battle.attacker.soldiers,
      defenderRemaining: battle.defender.soldiers,
      description: `${winner.name} 战胜了 ${loser.name}！`
    };

    // 保存到历史
    this.battleHistory.push({
      id: battle.id,
      type: battle.type,
      winner: winner.name,
      loser: loser.name,
      tick: battle.tick
    });

    // 清理进行中的战斗
    this.battles.delete(battle.id);

    return battle.result;
  }

  /**
   * PVE 战斗（打怪/打野）
   */
  initiatePVE(agent, enemyType = 'bandits') {
    const enemies = {
      bandits: { name: '山贼', strength: 30, soldiers: 100 },
      barbarians: { name: '蛮族', strength: 50, soldiers: 200 },
      rebels: { name: '叛军', strength: 40, soldiers: 150 }
    };

    const enemy = enemies[enemyType];
    if (!enemy) {
      return { success: false, error: '未知的敌人类型' };
    }

    const battle = {
      id: `pve_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'pve',
      attacker: {
        id: agent.id,
        name: agent.name,
        stats: { ...agent.stats },
        soldiers: agent.resources.soldiers || 0
      },
      defender: {
        id: `enemy_${enemyType}`,
        name: enemy.name,
        stats: { strength: enemy.strength, intelligence: 20, charisma: 10, politics: 10, luck: 30 },
        soldiers: enemy.soldiers
      },
      location: agent.location,
      rounds: [],
      status: 'ongoing',
      startTime: Date.now(),
      tick: this.world.tick
    };

    this.battles.set(battle.id, battle);
    agent.status = 'fighting';

    // PVE 立即执行所有回合
    while (battle.status === 'ongoing' && battle.rounds.length < 5) {
      this.executeRound(battle.id);
    }

    const result = this.finishBattle(battle);
    
    // 更新 Agent 状态
    agent.status = 'idle';
    
    // PVE 奖励
    if (result.winnerId === agent.id) {
      const rewards = {
        gold: Math.floor(Math.random() * 50) + 20,
        reputation: 10,
        experience: 50
      };
      result.rewards = rewards;
    }

    return {
      success: true,
      battle: this.getBattlePublicInfo(battle),
      result
    };
  }

  /**
   * 检查 Agent 是否在战斗中
   */
  isInBattle(agentId) {
    for (const battle of this.battles.values()) {
      if (battle.attacker.id === agentId || battle.defender.id === agentId) {
        return true;
      }
    }
    return false;
  }

  /**
   * 获取战斗公开信息
   */
  getBattlePublicInfo(battle) {
    return {
      id: battle.id,
      type: battle.type,
      status: battle.status,
      attacker: {
        name: battle.attacker.name,
        soldiers: battle.attacker.soldiers
      },
      defender: {
        name: battle.defender.name,
        soldiers: battle.defender.soldiers
      },
      location: battle.location,
      currentRound: battle.rounds.length,
      lastRound: battle.rounds[battle.rounds.length - 1] || null
    };
  }

  /**
   * 获取所有进行中的战斗
   */
  getOngoingBattles() {
    return Array.from(this.battles.values()).map(b => this.getBattlePublicInfo(b));
  }

  /**
   * 获取战斗历史
   */
  getBattleHistory(limit = 50) {
    return this.battleHistory.slice(-limit).reverse();
  }
}

module.exports = CombatSystem;
