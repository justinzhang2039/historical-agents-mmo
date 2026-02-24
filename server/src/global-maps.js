/**
 * Global Maps - 全球地图配置
 * 不同历史时期的世界地图
 */

const GlobalMaps = {
  // 石器时代 - 原始世界
  stone: {
    id: 'stone',
    name: '原始世界',
    description: '人类文明的摇篮，狩猎采集的乐园',
    regions: {
      'africa-savanna': {
        id: 'africa-savanna',
        name: '非洲大草原',
        description: '人类的起源地，丰富的野生动物',
        climate: 'savanna',
        resources: { food: 2000, animals: 1000, stone: 500 },
        connections: ['africa-forest', 'middle-east'],
        startingBonus: { population: 1.5 }
      },
      'africa-forest': {
        id: 'africa-forest',
        name: '刚果雨林',
        description: '茂密的热带雨林，丰富的植物资源',
        climate: 'tropical',
        resources: { food: 3000, wood: 2000, animals: 800 },
        connections: ['africa-savanna']
      },
      'middle-east': {
        id: 'middle-east',
        name: '新月沃土',
        description: '农业的发源地，人类文明摇篮',
        climate: 'arid',
        resources: { food: 1500, animals: 600, stone: 800 },
        connections: ['africa-savanna', 'anatolia', 'mesopotamia'],
        special: 'agriculture-birthplace'
      },
      'mesopotamia': {
        id: 'mesopotamia',
        name: '美索不达米亚',
        description: '两河流域，最早的城邦兴起',
        climate: 'arid',
        resources: { food: 1800, clay: 1000, stone: 600 },
        connections: ['middle-east', 'anatolia', 'iranian-plateau']
      },
      'anatolia': {
        id: 'anatolia',
        name: '安纳托利亚',
        description: '连接欧亚的桥梁，矿产资源丰富',
        climate: 'mediterranean',
        resources: { food: 1200, stone: 1500, copper: 300 },
        connections: ['middle-east', 'mesopotamia', 'balkans']
      },
      'balkans': {
        id: 'balkans',
        name: '巴尔干半岛',
        description: '欧洲东南门户，多样的地形',
        climate: 'mediterranean',
        resources: { food: 1000, stone: 1000, wood: 800 },
        connections: ['anatolia', 'europe-plain']
      },
      'europe-plain': {
        id: 'europe-plain',
        name: '欧洲大平原',
        description: '广袤的平原，适合狩猎和迁徙',
        climate: 'temperate',
        resources: { food: 1500, animals: 1200, wood: 1000 },
        connections: ['balkans', 'scandinavia', 'british-isles']
      },
      'scandinavia': {
        id: 'scandinavia',
        name: '斯堪的纳维亚',
        description: '北方森林，丰富的木材和毛皮',
        climate: 'cold',
        resources: { food: 800, wood: 2000, animals: 600, fur: 500 },
        connections: ['europe-plain']
      },
      'british-isles': {
        id: 'british-isles',
        name: '不列颠群岛',
        description: '岛屿文明，海洋资源',
        climate: 'temperate',
        resources: { food: 1000, animals: 800, stone: 600 },
        connections: ['europe-plain']
      },
      'iranian-plateau': {
        id: 'iranian-plateau',
        name: '伊朗高原',
        description: '连接东西方的要道',
        climate: 'arid',
        resources: { food: 1000, stone: 1000, copper: 200 },
        connections: ['mesopotamia', 'central-asia', 'indus-valley']
      },
      'central-asia': {
        id: 'central-asia',
        name: '中亚草原',
        description: '游牧民族的故乡，马匹驯化',
        climate: 'steppe',
        resources: { food: 1200, animals: 1500, horses: 1 },
        connections: ['iranian-plateau', 'siberia', 'china-north']
      },
      'indus-valley': {
        id: 'indus-valley',
        name: '印度河流域',
        description: '古代印度文明发源地',
        climate: 'arid',
        resources: { food: 1500, cotton: 500, animals: 800 },
        connections: ['iranian-plateau', 'india-ganges', 'tibet']
      },
      'india-ganges': {
        id: 'india-ganges',
        name: '恒河平原',
        description: '肥沃的农业区，人口密集',
        climate: 'tropical',
        resources: { food: 2500, animals: 1000, wood: 800 },
        connections: ['indus-valley', 'southeast-asia']
      },
      'tibet': {
        id: 'tibet',
        name: '青藏高原',
        description: '世界屋脊，神秘的高原',
        climate: 'alpine',
        resources: { food: 300, animals: 400, minerals: 500 },
        connections: ['indus-valley', 'china-west', 'southeast-asia']
      },
      'china-north': {
        id: 'china-north',
        name: '华北平原',
        description: '黄河流域，中华文明的摇篮',
        climate: 'temperate',
        resources: { food: 2000, animals: 1000, silk: 1 },
        connections: ['central-asia', 'china-south', 'mongolia'],
        special: 'chinese-civilization-birthplace'
      },
      'china-south': {
        id: 'china-south',
        name: '长江流域',
        description: '鱼米之乡，水稻种植',
        climate: 'subtropical',
        resources: { food: 2500, rice: 1000, tea: 1 },
        connections: ['china-north', 'southeast-asia']
      },
      'mongolia': {
        id: 'mongolia',
        name: '蒙古高原',
        description: '草原帝国，骑兵的摇篮',
        climate: 'steppe',
        resources: { food: 1000, animals: 2000, horses: 2 },
        connections: ['china-north', 'siberia', 'central-asia']
      },
      'siberia': {
        id: 'siberia',
        name: '西伯利亚',
        description: '广袤的森林，寒冷的土地',
        climate: 'cold',
        resources: { food: 500, wood: 3000, animals: 800, fur: 1000 },
        connections: ['scandinavia', 'mongolia', 'central-asia']
      },
      'southeast-asia': {
        id: 'southeast-asia',
        name: '东南亚',
        description: '热带群岛，香料贸易',
        climate: 'tropical',
        resources: { food: 2000, spices: 1, wood: 1500 },
        connections: ['india-ganges', 'china-south', 'tibet', 'australia']
      },
      'australia': {
        id: 'australia',
        name: '澳大利亚',
        description: '南方大陆，独特的生态系统',
        climate: 'arid',
        resources: { food: 800, animals: 1000, minerals: 800 },
        connections: ['southeast-asia']
      },
      'north-america': {
        id: 'north-america',
        name: '北美大平原',
        description: '野牛的故乡，原住民的家园',
        climate: 'temperate',
        resources: { food: 1500, animals: 1500, wood: 2000 },
        connections: []
      },
      'south-america': {
        id: 'south-america',
        name: '安第斯山脉',
        description: '印加文明的摇篮',
        climate: 'varied',
        resources: { food: 1000, gold: 500, silver: 500 },
        connections: []
      }
    },

    // 文明起点推荐
    startingLocations: [
      'africa-savanna',    // 人类起源
      'middle-east',       // 农业革命
      'china-north',       // 中华文明
      'mesopotamia'        // 最早城邦
    ]
  },

  // 古典时代 - 古代世界
  classical: {
    id: 'classical',
    name: '古代世界',
    description: '希腊罗马，秦汉帝国，文明百花齐放',
    regions: {
      // 继承石器时代并添加新内容
      'rome': {
        id: 'rome',
        name: '罗马',
        description: '永恒之城，地中海霸主',
        climate: 'mediterranean',
        resources: { food: 3000, iron: 1000, marble: 500, gold: 500 },
        connections: ['greek-city-states', 'carthage', 'gaul', 'egypt'],
        special: 'roman-empire-capital'
      },
      'greek-city-states': {
        id: 'greek-city-states',
        name: '希腊城邦',
        description: '民主的发源地，哲学艺术',
        climate: 'mediterranean',
        resources: { food: 2000, silver: 800, olive: 1, wine: 1 },
        connections: ['rome', 'anatolia', 'egypt'],
        special: 'democracy-birthplace'
      },
      'carthage': {
        id: 'carthage',
        name: '迦太基',
        description: '海上强国，贸易帝国',
        climate: 'mediterranean',
        resources: { food: 2500, gold: 1000, trade: 2 },
        connections: ['rome', 'egypt', 'iberia']
      },
      'egypt': {
        id: 'egypt',
        name: '埃及',
        description: '法老的国度，尼罗河的赠礼',
        climate: 'arid',
        resources: { food: 3000, gold: 1500, papyrus: 1 },
        connections: ['rome', 'greek-city-states', 'carthage', 'nubia'],
        special: 'ancient-civilization'
      },
      'persia': {
        id: 'persia',
        name: '波斯帝国',
        description: '万王之王，丝绸之路',
        climate: 'arid',
        resources: { food: 2500, gold: 1000, silk: 1 },
        connections: ['mesopotamia', 'iranian-plateau', 'anatolia', 'indus-valley'],
        special: 'achaemenid-empire'
      },
      'china-han': {
        id: 'china-han',
        name: '汉朝',
        description: '大汉帝国，丝绸之路起点',
        climate: 'temperate',
        resources: { food: 4000, silk: 2, iron: 1500, population: 2 },
        connections: ['mongolia', 'central-asia', 'china-south'],
        special: 'han-dynasty'
      },
      'india-maurya': {
        id: 'india-maurya',
        name: '孔雀王朝',
        description: '佛教传播，阿育王的帝国',
        climate: 'tropical',
        resources: { food: 3500, spices: 2, cotton: 1 },
        connections: ['indus-valley', 'india-ganges', 'southeast-asia'],
        special: 'maurya-empire'
      }
    },

    startingLocations: [
      'rome',
      'greek-city-states',
      'china-han',
      'persia',
      'egypt'
    ]
  },

  // 可以添加更多时期的地图...

  // 获取指定时期的地图
  getMap(eraId) {
    return this[eraId] || this.stone;
  },

  // 获取所有可用地图
  getAvailableMaps() {
    return [
      { id: 'stone', name: '原始世界', description: '人类文明的黎明' },
      { id: 'classical', name: '古代世界', description: '希腊罗马与秦汉' }
      // 可以添加更多...
    ];
  }
};

module.exports = GlobalMaps;
