/**
 * Event Engine - 事件引擎
 * 生成世界事件，驱动历史进程
 */

class EventEngine {
  constructor() {
    this.events = [];
    this.eventTemplates = this.initializeEventTemplates();
  }

  initializeEventTemplates() {
    return {
      // 自然灾害
      natural: [
        {
          id: 'flood',
          name: '洪水',
          description: '暴雨导致河水泛滥，农田被淹',
          effects: { food: -500, population: -1000 },
          probability: 0.05
        },
        {
          id: 'drought',
          name: '旱灾',
          description: '久旱不雨，庄稼枯萎',
          effects: { food: -300 },
          probability: 0.08
        },
        {
          id: 'earthquake',
          name: '地震',
          description: '地动山摇，城墙倒塌',
          effects: { population: -500, soldiers: -200 },
          probability: 0.03
        }
      ],
      
      // 政治事件
      political: [
        {
          id: 'rebellion',
          name: '民变',
          description: '百姓不堪重税，揭竿而起',
          effects: { soldiers: -300, reputation: -10 },
          probability: 0.06
        },
        {
          id: 'alliance_offer',
          name: '结盟提议',
          description: '某势力提出结盟',
          effects: { reputation: 5 },
          probability: 0.04
        },
        {
          id: 'betrayal',
          name: '背叛',
          description: '盟友背信弃义，突袭边境',
          effects: { soldiers: -500, reputation: -15 },
          probability: 0.04
        }
      ],
      
      // 机遇事件
      opportunity: [
        {
          id: 'merchant_arrival',
          name: '商队抵达',
          description: '西域商队带来珍稀货物',
          effects: { gold: 200 },
          probability: 0.1
        },
        {
          id: 'talent_discovered',
          name: '发现人才',
          description: '地方举荐贤才',
          effects: { reputation: 10 },
          probability: 0.07
        },
        {
          id: 'strategic_location',
          name: '战略要地',
          description: '发现易守难攻的险要之地',
          effects: { soldiers: 100 },
          probability: 0.05
        }
      ]
    };
  }

  generateRandom(world) {
    const allTemplates = [
      ...this.eventTemplates.natural,
      ...this.eventTemplates.political,
      ...this.eventTemplates.opportunity
    ];
    
    // 随机选择一个模板
    const roll = Math.random();
    let cumulative = 0;
    
    for (const template of allTemplates) {
      cumulative += template.probability;
      if (roll <= cumulative) {
        const event = {
          id: `${template.id}_${Date.now()}`,
          type: this.getEventType(template.id),
          ...template,
          tick: world.tick,
          timestamp: Date.now(),
          resolved: false
        };
        
        this.events.push(event);
        
        // 应用效果到世界
        this.applyEventEffects(event, world);
        
        return event;
      }
    }
    
    return null;
  }

  getEventType(eventId) {
    if (this.eventTemplates.natural.find(e => e.id === eventId)) return 'natural';
    if (this.eventTemplates.political.find(e => e.id === eventId)) return 'political';
    if (this.eventTemplates.opportunity.find(e => e.id === eventId)) return 'opportunity';
    return 'unknown';
  }

  applyEventEffects(event, world) {
    // 简化版：效果应用到所有节点
    for (const node of Object.values(world.nodes)) {
      for (const [resource, change] of Object.entries(event.effects)) {
        if (node.resources[resource] !== undefined) {
          node.resources[resource] = Math.max(0, node.resources[resource] + change);
        }
      }
    }
  }

  getRecent(limit = 50) {
    return this.events
      .slice(-limit)
      .reverse()
      .map(e => ({
        id: e.id,
        type: e.type,
        name: e.name,
        description: e.description,
        tick: e.tick,
        timestamp: e.timestamp
      }));
  }

  // 创建自定义事件（用于剧情推进）
  createCustomEvent(config) {
    const event = {
      id: `custom_${Date.now()}`,
      type: 'custom',
      ...config,
      tick: 0,
      timestamp: Date.now(),
      resolved: false
    };
    
    this.events.push(event);
    return event;
  }
}

module.exports = EventEngine;
