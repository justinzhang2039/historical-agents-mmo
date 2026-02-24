// 战斗系统 Dashboard 扩展
// 将此代码添加到 dashboard/index.html 的 script 标签中

// 战斗相关状态
let battles = [];
let battleHistory = [];

// 加载战斗数据
async function loadBattles() {
    try {
        const res = await fetch(`${API_URL}/api/battles`);
        const data = await res.json();
        if (data.success) {
            battles = data.data;
            renderBattles();
        }
        
        const historyRes = await fetch(`${API_URL}/api/battles/history?limit=10`);
        const historyData = await historyRes.json();
        if (historyData.success) {
            battleHistory = historyData.data;
            renderBattleHistory();
        }
    } catch (e) {
        console.error('Failed to load battles:', e);
    }
}

// 渲染进行中的战斗
function renderBattles() {
    const container = document.getElementById('battle-list');
    if (!container) return;
    
    if (battles.length === 0) {
        container.innerHTML = '<div class="loading">暂无进行中的战斗</div>';
        return;
    }
    
    container.innerHTML = battles.map(battle => `
        <div class="battle-card ${battle.status}">
            <div class="battle-header">
                <span class="battle-type">${getBattleTypeName(battle.type)}</span>
                <span class="battle-status">${battle.status === 'ongoing' ? '⚔️ 进行中' : '✓ 已结束'}</span>
            </div>
            <div class="battle-combatants">
                <div class="combatant attacker">
                    <div class="combatant-name">${battle.attacker.name}</div>
                    <div class="combatant-soldiers">${battle.attacker.soldiers} 人</div>
                </div>
                <div class="vs">VS</div>
                <div class="combatant defender">
                    <div class="combatant-name">${battle.defender.name}</div>
                    <div class="combatant-soldiers">${battle.defender.soldiers} 人</div>
                </div>
            </div>
            <div class="battle-location">📍 ${getLocationName(battle.location)}</div>
            ${battle.lastRound ? `
                <div class="last-round">
                    <div class="round-desc">${battle.lastRound.result.description}</div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// 渲染战斗历史
function renderBattleHistory() {
    const container = document.getElementById('battle-history');
    if (!container) return;
    
    if (battleHistory.length === 0) {
        container.innerHTML = '<div class="loading">暂无战斗记录</div>';
        return;
    }
    
    container.innerHTML = battleHistory.map(battle => `
        <div class="battle-history-item">
            <div class="history-result">
                <span class="winner">${battle.winner}</span>
                <span class="vs">战胜</span>
                <span class="loser">${battle.loser}</span>
            </div>
            <div class="history-meta">Tick ${battle.tick} · ${getBattleTypeName(battle.type)}</div>
        </div>
    `).join('');
}

// 发起战斗
async function initiateBattle(attackerId, defenderId, type = 'duel') {
    try {
        const res = await fetch(`${API_URL}/api/battles/challenge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attackerId, defenderId, type })
        });
        const data = await res.json();
        if (data.success) {
            alert(`战斗发起成功！${data.battle.attacker.name} vs ${data.battle.defender.name}`);
            loadBattles();
        } else {
            alert('发起战斗失败: ' + data.error);
        }
    } catch (e) {
        alert('发起战斗失败: ' + e.message);
    }
}

// 发起 PVE 战斗
async function initiatePVE(agentId, enemyType = 'bandits') {
    try {
        const res = await fetch(`${API_URL}/api/battles/pve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentId, enemyType })
        });
        const data = await res.json();
        if (data.success) {
            const result = data.result;
            let msg = `战斗结束！${result.winner} 获胜！`;
            if (result.rewards) {
                msg += `\n获得奖励: ${result.rewards.gold} 黄金, ${result.rewards.reputation} 声望`;
            }
            alert(msg);
            loadBattles();
        } else {
            alert('PVE 战斗失败: ' + data.error);
        }
    } catch (e) {
        alert('PVE 战斗失败: ' + e.message);
    }
}

// 获取战斗类型名称
function getBattleTypeName(type) {
    const names = {
        'duel': '单挑',
        'skirmish': '小规模冲突',
        'siege': '攻城战',
        'pve': '讨伐'
    };
    return names[type] || type;
}

// 添加战斗相关的样式
const battleStyles = `
    .battle-card {
        background: rgba(255, 107, 107, 0.1);
        border: 1px solid rgba(255, 107, 107, 0.3);
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 12px;
    }
    
    .battle-card.ongoing {
        border-color: #ffd700;
        background: rgba(255, 215, 0, 0.1);
        animation: pulse 2s infinite;
    }
    
    .battle-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 12px;
    }
    
    .battle-type {
        color: #888;
        text-transform: uppercase;
    }
    
    .battle-status {
        color: #ffd700;
        font-weight: 600;
    }
    
    .battle-combatants {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 15px 0;
    }
    
    .combatant {
        text-align: center;
        flex: 1;
    }
    
    .combatant-name {
        font-weight: 600;
        color: #fff;
        font-size: 14px;
    }
    
    .combatant-soldiers {
        font-size: 12px;
        color: #888;
        margin-top: 4px;
    }
    
    .vs {
        font-size: 18px;
        font-weight: 700;
        color: #ff6b6b;
        padding: 0 15px;
    }
    
    .battle-location {
        font-size: 12px;
        color: #666;
        text-align: center;
        margin-top: 10px;
    }
    
    .last-round {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .round-desc {
        font-size: 13px;
        color: #ccc;
        font-style: italic;
    }
    
    .battle-history-item {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 6px;
        padding: 10px;
        margin-bottom: 8px;
    }
    
    .history-result {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
    }
    
    .history-result .winner {
        color: #51cf66;
        font-weight: 600;
    }
    
    .history-result .loser {
        color: #ff6b6b;
    }
    
    .history-result .vs {
        color: #666;
        font-size: 12px;
        padding: 0;
    }
    
    .history-meta {
        font-size: 11px;
        color: #666;
        margin-top: 4px;
    }
    
    .battle-actions {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #2a2a4a;
    }
    
    .action-btn {
        width: 100%;
        padding: 10px;
        margin-bottom: 8px;
        background: rgba(255, 107, 107, 0.2);
        border: 1px solid rgba(255, 107, 107, 0.3);
        border-radius: 6px;
        color: #ff6b6b;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .action-btn:hover {
        background: rgba(255, 107, 107, 0.3);
    }
`;

// 将样式添加到页面
const styleSheet = document.createElement('style');
styleSheet.textContent = battleStyles;
document.head.appendChild(styleSheet);

// 定期加载战斗数据
setInterval(loadBattles, 5000);

// 初始加载
loadBattles();
