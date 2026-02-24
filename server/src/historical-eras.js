/**
 * Historical Eras - 历史时期配置
 * 三国、战国、楚汉等多个历史时期
 */

const HistoricalEras = {
  // 三国时期（默认）
  sanguo: {
    id: 'sanguo',
    name: '三国',
    period: '220-280 AD',
    description: '魏蜀吴三分天下，英雄辈出的时代',
    
    nodes: {
      'xuchang': {
        id: 'xuchang',
        name: '许昌',
        description: '曹操根据地，中原腹地',
        type: 'capital',
        connections: ['luoyang', 'xuzhou'],
        resources: { food: 1000, population: 50000, soldiers: 10000 },
        controller: 'caocao_faction'
      },
      'luoyang': {
        id: 'luoyang',
        name: '洛阳',
        description: '东汉旧都，天下中心',
        type: 'city',
        connections: ['xuchang', 'changsan'],
        resources: { food: 800, population: 40000, soldiers: 8000 },
        controller: null
      },
      'xuzhou': {
        id: 'xuzhou',
        name: '徐州',
        description: '兵家必争之地',
        type: 'city',
        connections: ['xuchang', 'shouchun'],
        resources: { food: 600, population: 30000, soldiers: 6000 },
        controller: null
      },
      'shouchun': {
        id: 'shouchun',
        name: '寿春',
        description: '袁术旧地，淮南重镇',
        type: 'city',
        connections: ['xuzhou'],
        resources: { food: 500, population: 25000, soldiers: 5000 },
        controller: null
      },
      'changsan': {
        id: 'changsan',
        name: '长沙',
        description: '孙坚起家之地',
        type: 'city',
        connections: ['luoyang'],
        resources: { food: 700, population: 35000, soldiers: 7000 },
        controller: 'sunjian_faction'
      }
    },
    
    factions: {
      'caocao_faction': {
        id: 'caocao_faction',
        name: '曹魏势力',
        leader: '曹操',
        color: '#3498db',
        nodes: ['xuchang']
      },
      'sunjian_faction': {
        id: 'sunjian_faction',
        name: '孙氏势力',
        leader: '孙坚',
        color: '#e74c3c',
        nodes: ['changsan']
      },
      'liubei_faction': {
        id: 'liubei_faction',
        name: '刘备势力',
        leader: '刘备',
        color: '#27ae60',
        nodes: []
      }
    },
    
    characters: [
      { name: '曹操', stats: { strength: 65, intelligence: 95, charisma: 90, politics: 95, luck: 70 } },
      { name: '刘备', stats: { strength: 70, intelligence: 80, charisma: 95, politics: 85, luck: 90 } },
      { name: '孙权', stats: { strength: 60, intelligence: 85, charisma: 80, politics: 85, luck: 75 } },
      { name: '诸葛亮', stats: { strength: 40, intelligence: 100, charisma: 85, politics: 95, luck: 70 } },
      { name: '关羽', stats: { strength: 95, intelligence: 70, charisma: 85, politics: 60, luck: 60 } },
      { name: '张飞', stats: { strength: 98, intelligence: 50, charisma: 70, politics: 40, luck: 55 } }
    ]
  },

  // 战国时期
  zhanguo: {
    id: 'zhanguo',
    name: '战国',
    period: '475-221 BC',
    description: '七雄争霸，百家争鸣的大变革时代',
    
    nodes: {
      'xianyang': {
        id: 'xianyang',
        name: '咸阳',
        description: '秦国都城，虎狼之师的根基',
        type: 'capital',
        connections: ['handan', 'xinzheng'],
        resources: { food: 1200, population: 60000, soldiers: 15000 },
        controller: 'qin_faction'
      },
      'handan': {
        id: 'handan',
        name: '邯郸',
        description: '赵国都城，胡服骑射的发源地',
        type: 'capital',
        connections: ['xianyang', 'linzi'],
        resources: { food: 900, population: 45000, soldiers: 12000 },
        controller: 'zhao_faction'
      },
      'linzi': {
        id: 'linzi',
        name: '临淄',
        description: '齐国都城，富甲天下',
        type: 'capital',
        connections: ['handan', 'xinzheng'],
        resources: { food: 1100, population: 55000, soldiers: 13000 },
        controller: 'qi_faction'
      },
      'xinzheng': {
        id: 'xinzheng',
        name: '新郑',
        description: '韩国都城，兵器制造中心',
        type: 'city',
        connections: ['xianyang', 'linzi', 'daliang'],
        resources: { food: 600, population: 30000, soldiers: 8000 },
        controller: 'han_faction'
      },
      'daliang': {
        id: 'daliang',
        name: '大梁',
        description: '魏国都城，中原枢纽',
        type: 'city',
        connections: ['xinzheng', 'yanying'],
        resources: { food: 800, population: 40000, soldiers: 10000 },
        controller: 'wei_faction'
      },
      'yanying': {
        id: 'yanying',
        name: '郢都',
        description: '楚国都城，南方霸主',
        type: 'capital',
        connections: ['daliang'],
        resources: { food: 1000, population: 50000, soldiers: 14000 },
        controller: 'chu_faction'
      }
    },
    
    factions: {
      'qin_faction': {
        id: 'qin_faction',
        name: '秦国',
        leader: '嬴政',
        color: '#2c3e50',
        nodes: ['xianyang']
      },
      'zhao_faction': {
        id: 'zhao_faction',
        name: '赵国',
        leader: '赵武灵王',
        color: '#e74c3c',
        nodes: ['handan']
      },
      'qi_faction': {
        id: 'qi_faction',
        name: '齐国',
        leader: '齐威王',
        color: '#3498db',
        nodes: ['linzi']
      },
      'han_faction': {
        id: 'han_faction',
        name: '韩国',
        leader: '韩昭侯',
        color: '#9b59b6',
        nodes: ['xinzheng']
      },
      'wei_faction': {
        id: 'wei_faction',
        name: '魏国',
        leader: '魏惠王',
        color: '#f39c12',
        nodes: ['daliang']
      },
      'chu_faction': {
        id: 'chu_faction',
        name: '楚国',
        leader: '楚威王',
        color: '#27ae60',
        nodes: ['yanying']
      }
    },
    
    characters: [
      { name: '白起', stats: { strength: 85, intelligence: 90, charisma: 70, politics: 75, luck: 80 } },
      { name: '廉颇', stats: { strength: 90, intelligence: 75, charisma: 80, politics: 70, luck: 75 } },
      { name: '李牧', stats: { strength: 88, intelligence: 88, charisma: 85, politics: 80, luck: 70 } },
      { name: '王翦', stats: { strength: 85, intelligence: 92, charisma: 75, politics: 85, luck: 85 } },
      { name: '孙膑', stats: { strength: 50, intelligence: 98, charisma: 70, politics: 80, luck: 60 } },
      { name: '吴起', stats: { strength: 80, intelligence: 95, charisma: 85, politics: 90, luck: 65 } }
    ]
  },

  // 楚汉争霸
  chuhan: {
    id: 'chuhan',
    name: '楚汉',
    period: '206-202 BC',
    description: '项羽刘邦逐鹿中原，英雄末路的悲壮时代',
    
    nodes: {
      'pengcheng': {
        id: 'pengcheng',
        name: '彭城',
        description: '项羽西楚都城，兵家必争',
        type: 'capital',
        connections: ['xianyang', 'guanzhong'],
        resources: { food: 1000, population: 50000, soldiers: 12000 },
        controller: 'xiangyu_faction'
      },
      'guanzhong': {
        id: 'guanzhong',
        name: '关中',
        description: '刘邦汉军根基，四塞之地',
        type: 'capital',
        connections: ['pengcheng', 'xianyang'],
        resources: { food: 900, population: 45000, soldiers: 10000 },
        controller: 'liubang_faction'
      },
      'xianyang': {
        id: 'xianyang',
        name: '咸阳',
        description: '秦都旧址，天下中枢',
        type: 'city',
        connections: ['pengcheng', 'guanzhong', 'hanzhong'],
        resources: { food: 800, population: 40000, soldiers: 8000 },
        controller: null
      },
      'hanzhong': {
        id: 'hanzhong',
        name: '汉中',
        description: '刘邦封地，暗度陈仓的起点',
        type: 'city',
        connections: ['xianyang'],
        resources: { food: 600, population: 30000, soldiers: 6000 },
        controller: 'liubang_faction'
      },
      'xiapi': {
        id: 'xiapi',
        name: '下邳',
        description: '兵家要地，韩信成名之处',
        type: 'city',
        connections: ['pengcheng'],
        resources: { food: 500, population: 25000, soldiers: 5000 },
        controller: null
      }
    },
    
    factions: {
      'xiangyu_faction': {
        id: 'xiangyu_faction',
        name: '西楚',
        leader: '项羽',
        color: '#e74c3c',
        nodes: ['pengcheng']
      },
      'liubang_faction': {
        id: 'liubang_faction',
        name: '汉军',
        leader: '刘邦',
        color: '#3498db',
        nodes: ['guanzhong', 'hanzhong']
      }
    },
    
    characters: [
      { name: '项羽', stats: { strength: 100, intelligence: 70, charisma: 90, politics: 60, luck: 50 } },
      { name: '刘邦', stats: { strength: 60, intelligence: 85, charisma: 95, politics: 90, luck: 95 } },
      { name: '韩信', stats: { strength: 70, intelligence: 100, charisma: 80, politics: 85, luck: 60 } },
      { name: '张良', stats: { strength: 40, intelligence: 98, charisma: 85, politics: 95, luck: 75 } },
      { name: '萧何', stats: { strength: 45, intelligence: 90, charisma: 80, politics: 95, luck: 80 } },
      { name: '范增', stats: { strength: 50, intelligence: 95, charisma: 75, politics: 85, luck: 55 } }
    ]
  }
};

module.exports = HistoricalEras;
