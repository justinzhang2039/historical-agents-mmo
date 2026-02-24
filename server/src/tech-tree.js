/**
 * Civilization Tech Tree - 文明科技树系统
 * 从石器时代到未来科技的完整科技树
 */

const TechTree = {
  // 时代定义
  eras: {
    stone: {
      id: 'stone',
      name: '石器时代',
      period: '公元前 10000 - 公元前 3000',
      year: -10000,
      description: '人类文明的黎明，石器工具，狩猎采集',
      unlockCondition: '起始时代'
    },
    bronze: {
      id: 'bronze',
      name: '青铜时代',
      period: '公元前 3000 - 公元前 1200',
      year: -3000,
      description: '金属冶炼，城邦兴起，文字发明',
      unlockCondition: '研发青铜冶炼'
    },
    iron: {
      id: 'iron',
      name: '铁器时代',
      period: '公元前 1200 - 公元前 500',
      year: -1200,
      description: '铁器普及，帝国扩张，军事革新',
      unlockCondition: '研发铁器冶炼'
    },
    classical: {
      id: 'classical',
      name: '古典时代',
      period: '公元前 500 - 公元 500',
      year: -500,
      description: '希腊罗马，哲学艺术，法律制度',
      unlockCondition: '建立城邦 + 哲学思想'
    },
    medieval: {
      id: 'medieval',
      name: '中世纪',
      period: '500 - 1500',
      year: 500,
      description: '封建制度，骑士文化，宗教统治',
      unlockCondition: '封建制度 + 骑士训练'
    },
    renaissance: {
      id: 'renaissance',
      name: '文艺复兴',
      period: '1300 - 1600',
      year: 1300,
      description: '人文主义，科学革命，艺术繁荣',
      unlockCondition: '大学建立 + 艺术赞助'
    },
    industrial: {
      id: 'industrial',
      name: '工业时代',
      period: '1760 - 1840',
      year: 1760,
      description: '蒸汽机，工厂制度，城市化',
      unlockCondition: '蒸汽机 + 工厂建立'
    },
    modern: {
      id: 'modern',
      name: '现代',
      period: '1900 - 1945',
      year: 1900,
      description: '电力，内燃机，世界大战',
      unlockCondition: '电力 + 内燃机'
    },
    atomic: {
      id: 'atomic',
      name: '原子时代',
      period: '1945 - 1991',
      year: 1945,
      description: '核能，冷战，太空竞赛',
      unlockCondition: '核裂变 + 火箭技术'
    },
    information: {
      id: 'information',
      name: '信息时代',
      period: '1991 - 2020',
      year: 1991,
      description: '互联网，全球化，数字革命',
      unlockCondition: '计算机 + 互联网'
    },
    ai: {
      id: 'ai',
      name: 'AI 时代',
      period: '2020 - 2050',
      year: 2020,
      description: '人工智能，自动化，人机协作',
      unlockCondition: '深度学习 + 机器人'
    },
    space: {
      id: 'space',
      name: '太空时代',
      period: '2050 - 2100',
      year: 2050,
      description: '星际殖民，太空城市，资源开采',
      unlockCondition: '可控核聚变 + 星际航行'
    },
    stellar: {
      id: 'stellar',
      name: '星际时代',
      period: '2100+',
      year: 2100,
      description: '恒星际旅行，戴森球，文明跃迁',
      unlockCondition: '曲速引擎 + 戴森球'
    }
  },

  // 科技树
  technologies: {
    // 石器时代
    'fire-making': {
      id: 'fire-making',
      name: '取火',
      era: 'stone',
      cost: { research: 10 },
      effects: { foodProduction: 1.2, populationGrowth: 1.1 },
      prerequisites: [],
      description: '掌握火的使用，烹饪食物，驱赶野兽'
    },
    'stone-tools': {
      id: 'stone-tools',
      name: '石器制作',
      era: 'stone',
      cost: { research: 15 },
      effects: { resourceGathering: 1.3, combatStrength: 1.1 },
      prerequisites: [],
      description: '打制石器，提高狩猎和采集效率'
    },
    'language': {
      id: 'language',
      name: '语言',
      era: 'stone',
      cost: { research: 20 },
      effects: { coordination: 1.5, diplomacy: 1.2 },
      prerequisites: ['fire-making'],
      description: '口头交流，协作狩猎，知识传承'
    },

    // 青铜时代
    'bronze-smelting': {
      id: 'bronze-smelting',
      name: '青铜冶炼',
      era: 'bronze',
      cost: { research: 50, resources: { copper: 100, tin: 50 } },
      effects: { militaryTech: 1.5, toolQuality: 1.4 },
      prerequisites: ['stone-tools'],
      description: '铜锡合金，制造武器和工具'
    },
    'writing': {
      id: 'writing',
      name: '文字',
      era: 'bronze',
      cost: { research: 60 },
      effects: { researchSpeed: 1.3, administration: 1.5 },
      prerequisites: ['language'],
      description: '记录信息，法律条文，历史记载'
    },
    'wheel': {
      id: 'wheel',
      name: '轮子',
      era: 'bronze',
      cost: { research: 40 },
      effects: { tradeEfficiency: 1.4, mobility: 1.3 },
      prerequisites: ['bronze-smelting'],
      description: '运输工具，战车，提高机动性'
    },

    // 铁器时代
    'iron-smelting': {
      id: 'iron-smelting',
      name: '铁器冶炼',
      era: 'iron',
      cost: { research: 100, resources: { iron: 200 } },
      effects: { militaryTech: 2.0, agriculturalTools: 1.5 },
      prerequisites: ['bronze-smelting'],
      description: '更坚硬的金属，革命性的工具和武器'
    },
    'cavalry': {
      id: 'cavalry',
      name: '骑兵',
      era: 'iron',
      cost: { research: 80, resources: { horses: 50 } },
      effects: { combatMobility: 1.8, shockAttack: 1.5 },
      prerequisites: ['wheel', 'animal-domestication'],
      description: '骑马作战，快速机动，冲击力'
    },

    // 古典时代
    'philosophy': {
      id: 'philosophy',
      name: '哲学',
      era: 'classical',
      cost: { research: 150 },
      effects: { happiness: 1.3, researchSpeed: 1.2 },
      prerequisites: ['writing'],
      description: '理性思考，伦理道德，政治理论'
    },
    'democracy': {
      id: 'democracy',
      name: '民主制度',
      era: 'classical',
      cost: { research: 200 },
      effects: { stability: 1.4, innovation: 1.3 },
      prerequisites: ['philosophy', 'law'],
      description: '公民参与，权力制衡，社会稳定'
    },
    'engineering': {
      id: 'engineering',
      name: '工程学',
      era: 'classical',
      cost: { research: 180, resources: { stone: 500 } },
      effects: { constructionSpeed: 2.0, defense: 1.5 },
      prerequisites: ['mathematics', 'architecture'],
      description: '大型建筑，道路桥梁，军事工程'
    },

    // 中世纪
    'feudalism': {
      id: 'feudalism',
      name: '封建制度',
      era: 'medieval',
      cost: { research: 250 },
      effects: { militaryOrganization: 1.6, landManagement: 1.4 },
      prerequisites: ['nobility', 'manorialism'],
      description: '领主-封臣关系，土地分封，军事义务'
    },
    'knight-training': {
      id: 'knight-training',
      name: '骑士训练',
      era: 'medieval',
      cost: { research: 200, resources: { horses: 100, iron: 200 } },
      effects: { heavyCavalry: 2.0, morale: 1.4 },
      prerequisites: ['cavalry', 'feudalism'],
      description: '重装骑兵，骑士精神，军事贵族'
    },
    'university': {
      id: 'university',
      name: '大学',
      era: 'medieval',
      cost: { research: 300, resources: { gold: 1000 } },
      effects: { researchSpeed: 2.0, education: 1.5 },
      prerequisites: ['scholasticism', 'cathedral-schools'],
      description: '高等教育，知识传承，学术研究'
    },

    // 文艺复兴
    'printing-press': {
      id: 'printing-press',
      name: '印刷术',
      era: 'renaissance',
      cost: { research: 400 },
      effects: { researchSpeed: 3.0, culturalSpread: 2.0 },
      prerequisites: ['paper', 'moveable-type'],
      description: '知识传播，书籍普及，思想解放'
    },
    'scientific-method': {
      id: 'scientific-method',
      name: '科学方法',
      era: 'renaissance',
      cost: { research: 500 },
      effects: { researchEfficiency: 2.5, innovation: 2.0 },
      prerequisites: ['empiricism', 'mathematics'],
      description: '实验验证，理论推导，科学革命'
    },

    // 工业时代
    'steam-engine': {
      id: 'steam-engine',
      name: '蒸汽机',
      era: 'industrial',
      cost: { research: 800, resources: { coal: 1000, iron: 500 } },
      effects: { production: 3.0, transportation: 2.5 },
      prerequisites: ['thermodynamics', 'precision-engineering'],
      description: '动力革命，机械化生产，铁路运输'
    },
    'factory-system': {
      id: 'factory-system',
      name: '工厂制度',
      era: 'industrial',
      cost: { research: 600 },
      effects: { productionEfficiency: 2.5, urbanization: 2.0 },
      prerequisites: ['steam-engine', 'division-of-labor'],
      description: '集中生产，规模经济，工人阶级'
    },

    // 现代
    'electricity': {
      id: 'electricity',
      name: '电力',
      era: 'modern',
      cost: { research: 1200 },
      effects: { production: 4.0, qualityOfLife: 3.0 },
      prerequisites: ['electromagnetism', 'generator'],
      description: '第二次工业革命，照明，动力传输'
    },
    'combustion-engine': {
      id: 'combustion-engine',
      name: '内燃机',
      era: 'modern',
      cost: { research: 1000, resources: { oil: 500 } },
      effects: { transportation: 4.0, warfare: 2.5 },
      prerequisites: ['petroleum-refining', 'mechanics'],
      description: '汽车，飞机，坦克，机动化战争'
    },

    // 原子时代
    'nuclear-fission': {
      id: 'nuclear-fission',
      name: '核裂变',
      era: 'atomic',
      cost: { research: 2000, resources: { uranium: 100 } },
      effects: { energyProduction: 5.0, militaryPower: 10.0 },
      prerequisites: ['quantum-mechanics', 'particle-physics'],
      description: '核能发电，原子弹，战略威慑'
    },
    'rocket-technology': {
      id: 'rocket-technology',
      name: '火箭技术',
      era: 'atomic',
      cost: { research: 1800 },
      effects: { spaceAccess: 1.0, missileRange: 5.0 },
      prerequisites: ['jet-engine', 'ballistics'],
      description: '太空探索，洲际导弹，卫星通信'
    },

    // 信息时代
    'computer': {
      id: 'computer',
      name: '计算机',
      era: 'information',
      cost: { research: 2500 },
      effects: { researchSpeed: 5.0, automation: 4.0 },
      prerequisites: ['transistor', 'information-theory'],
      description: '电子计算，数据处理，自动化'
    },
    'internet': {
      id: 'internet',
      name: '互联网',
      era: 'information',
      cost: { research: 3000 },
      effects: { communication: 10.0, globalization: 5.0 },
      prerequisites: ['computer', 'networking'],
      description: '全球互联，信息革命，数字经济'
    },

    // AI 时代
    'deep-learning': {
      id: 'deep-learning',
      name: '深度学习',
      era: 'ai',
      cost: { research: 5000 },
      effects: { aiCapability: 5.0, automation: 8.0 },
      prerequisites: ['neural-networks', 'big-data', 'gpu-computing'],
      description: '人工智能突破，机器学习，神经网络'
    },
    'robotics': {
      id: 'robotics',
      name: '机器人',
      era: 'ai',
      cost: { research: 4000, resources: { rare-earth: 500 } },
      effects: { laborReplacement: 5.0, manufacturing: 4.0 },
      prerequisites: ['automation', 'materials-science'],
      description: '智能机器人，自动化生产，服务业革命'
    },

    // 太空时代
    'fusion-power': {
      id: 'fusion-power',
      name: '可控核聚变',
      era: 'space',
      cost: { research: 8000, resources: { helium3: 100 } },
      effects: { energyProduction: 20.0, spacePropulsion: 3.0 },
      prerequisites: ['nuclear-fission', 'plasma-physics', 'magnetic-confinement'],
      description: '无限清洁能源，星际航行动力'
    },
    'interplanetary-travel': {
      id: 'interplanetary-travel',
      name: '星际航行',
      era: 'space',
      cost: { research: 10000 },
      effects: { colonizationRange: 3.0, resourceAccess: 5.0 },
      prerequisites: ['fusion-power', 'life-support-systems', 'radiation-shielding'],
      description: '火星殖民，小行星采矿，太空城市'
    },

    // 星际时代
    'warp-drive': {
      id: 'warp-drive',
      name: '曲速引擎',
      era: 'stellar',
      cost: { research: 20000, resources: { exotic-matter: 1000 } },
      effects: { ftlTravel: 1.0, galacticAccess: 1.0 },
      prerequisites: ['alcubierre-theory', 'negative-energy', 'exotic-matter-production'],
      description: '超光速旅行，星际文明，银河探索'
    },
    'dyson-sphere': {
      id: 'dyson-sphere',
      name: '戴森球',
      era: 'stellar',
      cost: { research: 50000, resources: { all-resources: 1000000 } },
      effects: { energyProduction: 1000.0, civilizationLevel: 2.0 },
      prerequisites: ['mega-engineering', 'self-replicating-machines', 'stellar-mining'],
      description: '恒星能源利用，二级文明，宇宙尺度工程'
    }
  },

  // 获取时代的所有科技
  getTechnologiesByEra(eraId) {
    return Object.values(this.technologies).filter(t => t.era === eraId);
  },

  // 获取科技的前置科技
  getPrerequisites(techId) {
    const tech = this.technologies[techId];
    if (!tech) return [];
    return tech.prerequisites.map(id => this.technologies[id]).filter(Boolean);
  },

  // 检查科技是否可以研发
  canResearch(techId, researchedTechs) {
    const tech = this.technologies[techId];
    if (!tech) return false;
    if (researchedTechs.includes(techId)) return false;
    
    return tech.prerequisites.every(pre => researchedTechs.includes(pre));
  },

  // 获取可研发的科技列表
  getAvailableTechs(researchedTechs, currentEra) {
    return Object.values(this.technologies).filter(tech => {
      // 检查是否已研发
      if (researchedTechs.includes(tech.id)) return false;
      
      // 检查时代限制（可以研发当前时代及之前的科技）
      const eraOrder = Object.keys(this.eras);
      const currentEraIndex = eraOrder.indexOf(currentEra);
      const techEraIndex = eraOrder.indexOf(tech.era);
      if (techEraIndex > currentEraIndex) return false;
      
      // 检查前置科技
      return tech.prerequisites.every(pre => researchedTechs.includes(pre));
    });
  }
};

module.exports = TechTree;
