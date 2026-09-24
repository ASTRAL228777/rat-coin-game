// ============================================================
// ==================== МГНОВЕННАЯ БЛОКИРОВКА МУЛЬТИВКЛАДОК ===
// ============================================================
(function instantMultiTabBlock() {
const TAB_KEY = 'rat_active_tab';
const TAB_ID = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
const TAB_TIMEOUT = 4000;
try {
const raw = localStorage.getItem(TAB_KEY);
if (raw) {
const data = JSON.parse(raw);
const timeSince = Date.now() - data.timestamp;
if (data.id && data.id !== TAB_ID && timeSince < TAB_TIMEOUT) {
document.documentElement.innerHTML = `
<head><title>🐀 Rat Coin - Игра уже открыта</title></head>
<body style="margin:0;padding:0;background:linear-gradient(135deg,#0b0c10 0%,#1a0a1f 100%);color:#45f3ff;font-family:'Segoe UI',sans-serif;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;text-align:center;overflow:hidden;">
<div style="font-size:120px;margin-bottom:20px;"></div>
<h1 style="color:#ff007f;font-size:28px;margin-bottom:15px;text-shadow:0 0 20px #ff007f;"> ИГРА УЖЕ ОТКРЫТА</h1>
<h2 style="color:#45f3ff;font-size:20px;margin-bottom:20px;">в другой вкладке!</h2>
<p style="color:#66fcf1;font-size:15px;max-width:500px;line-height:1.7;margin-bottom:25px;padding:0 15px;">
 Играть одновременно в нескольких вкладках <b style="color:#ffd700;">НЕЛЬЗЯ</b>!<br>
Это приведёт к <b style="color:#ff6666;">потере прогресса</b>.
</p>
<button onclick="location.reload()" style="background:linear-gradient(135deg,#45f3ff,#66fcf1);color:#0b0c10;border:none;padding:14px 40px;border-radius:12px;font-size:16px;font-weight:bold;cursor:pointer;"> Проверить снова</button>
</body>
`;
throw new Error('MultiTab blocked');
}
}
localStorage.setItem(TAB_KEY, JSON.stringify({ id: TAB_ID, timestamp: Date.now() }));
} catch (e) { if (e.message === 'MultiTab blocked') throw e; }
window._ratTabId = TAB_ID;
window._ratIsActiveTab = function() {
try {
const raw = localStorage.getItem(TAB_KEY);
if (!raw) return false;
const data = JSON.parse(raw);
return data.id === TAB_ID;
} catch (e) { return false; }
};
setInterval(function() {
try {
const raw = localStorage.getItem(TAB_KEY);
if (raw) {
const data = JSON.parse(raw);
if (data.id === TAB_ID) {
localStorage.setItem(TAB_KEY, JSON.stringify({ id: TAB_ID, timestamp: Date.now() }));
} else if (Date.now() - data.timestamp < TAB_TIMEOUT) {
window.location.reload();
}
}
} catch (e) {}
}, 1000);
window.addEventListener('beforeunload', function() {
try {
const raw = localStorage.getItem(TAB_KEY);
if (raw) {
const data = JSON.parse(raw);
if (data.id === TAB_ID) localStorage.removeItem(TAB_KEY);
}
} catch (e) {}
});
})();

// ============================================================
// ==================== СИСТЕМА ВЕРСИЙ ========================
// ============================================================
const GAME_VERSION = '2.3.7';

// ============================================================
// ==================== СКРЫТЫЙ АНТИЧИТ =======================
// ============================================================
const AntiCheat = (function() {
const CONFIG = {
enabled: true,
checkInterval: 3000,
maxPossibleCPS: 25,
bufferPercent: 25,
minScoreForCheck: 1000,
suspicionThreshold: 150,
banThreshold: 300,
};
let timer = null;
let lastCheckTime = Date.now();
let suspicionLevel = 0;
let isSuspicious = false;
let cheatDetected = false;
let warningElement = null;

function getTotalClickPower() {
let base = parseInt(localStorage.getItem('rat_clickPower')) || 1;
let bonus = 0;
let accessory = localStorage.getItem('rat_accessory');
const bonuses = { hat: 5, glasses: 15, sword: 30, crown: 100 };
if (accessory && bonuses[accessory]) bonus = bonuses[accessory];
let hamsterBonus = 1.0;
let hamsterFood = parseFloat(localStorage.getItem('rat_hamsterFood')) || 0;
let hamsterLevel = parseInt(localStorage.getItem('rat_hamsterLevel')) || 0;
if (hamsterFood > 0) {
hamsterBonus = 1.0 + hamsterLevel * 0.1;
if (localStorage.getItem('rat_pepperBuffActive') === 'true') hamsterBonus *= 2;
if (localStorage.getItem('rat_hayBuffActive') === 'true') hamsterBonus *= 1.3;
}
let buffActive = localStorage.getItem('rat_buffActive') === 'true';
let buffMult = buffActive ? 2 : 1;
return Math.floor(base * (1 + bonus / 100) * hamsterBonus * buffMult);
}

function getAutoClickers() {
return parseInt(localStorage.getItem('rat_autoClickers')) || 0;
}

function calculateMaxPossibleIncome(timeSeconds) {
const clickPower = getTotalClickPower();
const maxClickIncome = CONFIG.maxPossibleCPS * clickPower * timeSeconds;
const passiveIncome = getAutoClickers() * timeSeconds;
let grainIncome = 0;
const grainActive = localStorage.getItem('rat_grainActive') === 'true';
const grainLevel = parseInt(localStorage.getItem('rat_grainLevel')) || 0;
const grainBase = parseInt(localStorage.getItem('rat_grainBase')) || 3;
const superGrainActive = localStorage.getItem('rat_superGrainActive') === 'true';
if (grainActive && grainLevel > 0) {
const grainPerSecond = 1 / 5;
let grainValue = grainBase * clickPower;
if (superGrainActive) grainValue = 25 * clickPower;
grainIncome = grainPerSecond * grainValue * timeSeconds;
}
let hamsterBonus = 1.0;
let hamsterFood = parseFloat(localStorage.getItem('rat_hamsterFood')) || 0;
let hamsterLevel = parseInt(localStorage.getItem('rat_hamsterLevel')) || 0;
if (hamsterFood > 0) hamsterBonus = 1.0 + hamsterLevel * 0.1;
let totalPossibleIncome = (maxClickIncome + passiveIncome + grainIncome) * hamsterBonus;
if (localStorage.getItem('rat_buffActive') === 'true') totalPossibleIncome *= 2;
const manipulatorLevel = parseInt(localStorage.getItem('rat_manipulatorLevel')) || 0;
const manipulatorIncome = (manipulatorLevel * clickPower * timeSeconds) / 5;
totalPossibleIncome += manipulatorIncome * hamsterBonus;
totalPossibleIncome *= (1 + CONFIG.bufferPercent / 100);
return Math.floor(totalPossibleIncome);
}

function showWarning(realGain, maxGain, ratio) {
if (warningElement) return;
warningElement = document.createElement('div');
warningElement.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:rgba(255,165,0,0.95);color:#0b0c10;padding:12px 20px;border-radius:10px;font-weight:bold;font-size:14px;z-index:9998;text-align:center;max-width:90%;font-family:sans-serif;';
warningElement.innerHTML = `⚠️ SUSPICIOUS: ${realGain} vs ${maxGain} (${ratio.toFixed(0)}%)`;
document.body.appendChild(warningElement);
}

function hideWarning() {
if (warningElement) { warningElement.remove(); warningElement = null; }
}

function triggerBan(realGain, maxGain, ratio) {
if (cheatDetected) return;
cheatDetected = true;
localStorage.setItem('rat_cheat_detected', 'true');
const banEl = document.createElement('div');
banEl.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(255,0,0,0.95);color:white;padding:30px 40px;border-radius:20px;font-weight:bold;font-size:24px;z-index:10000;text-align:center;max-width:90%;border:3px solid #ffd700;font-family:sans-serif;';
banEl.innerHTML = `<div style="font-size:60px;">🚫</div><div style="margin:15px 0;">CHEAT DETECTED!</div>`;
document.body.appendChild(banEl);
document.body.style.pointerEvents = 'none';
setTimeout(() => {
localStorage.clear();
localStorage.setItem('rat_game_version', GAME_VERSION);
location.reload();
}, 10000);
}

function checkBalance() {
if (!CONFIG.enabled || cheatDetected) return;
const score = parseInt(localStorage.getItem('rat_score')) || 0;
if (score < CONFIG.minScoreForCheck) return;
const now = Date.now();
const timeSinceLastCheck = (now - lastCheckTime) / 1000;
if (timeSinceLastCheck < 1) return;
const savedScore = parseInt(localStorage.getItem('rat_checked_score')) || 0;
const savedTime = parseInt(localStorage.getItem('rat_checked_time')) || 0;
const totalTimePlayed = parseInt(localStorage.getItem('rat_totalTimePlayed')) || 0;
if (savedScore === 0 && savedTime === 0) {
localStorage.setItem('rat_checked_score', score);
localStorage.setItem('rat_checked_time', totalTimePlayed);
lastCheckTime = now;
return;
}
const realGain = score - savedScore;
const timePassed = totalTimePlayed - savedTime;
if (timePassed < 1 || realGain < 0) { lastCheckTime = now; return; }
const maxPossibleGain = calculateMaxPossibleIncome(timePassed);
const ratio = (realGain / maxPossibleGain) * 100;
localStorage.setItem('rat_checked_score', score);
localStorage.setItem('rat_checked_time', totalTimePlayed);
lastCheckTime = now;
if (ratio > CONFIG.banThreshold) { triggerBan(realGain, maxPossibleGain, ratio); return; }
if (ratio > CONFIG.suspicionThreshold) {
suspicionLevel++;
isSuspicious = true;
showWarning(realGain, maxPossibleGain, ratio);
if (suspicionLevel >= 3) triggerBan(realGain, maxPossibleGain, ratio);
} else {
if (isSuspicious) { suspicionLevel = 0; isSuspicious = false; hideWarning(); }
}
}

return {
start: function() {
if (timer) return;
if (localStorage.getItem('rat_cheat_detected') === 'true') {
setTimeout(() => {
localStorage.removeItem('rat_cheat_detected');
location.reload();
}, 5000);
return;
}
timer = setInterval(checkBalance, CONFIG.checkInterval);
},
stop: function() {
if (timer) { clearInterval(timer); timer = null; }
hideWarning();
}
};
})();

Object.defineProperty(window, 'AntiCheat', {
get: function() { return undefined; },
set: function() {},
configurable: false,
enumerable: false
});

['disableAntiCheat', 'enableAntiCheat', 'resetBossCooldown', 'forceBossDefeat', 'addPlant', 'addPoop', 'addFertilizer'].forEach(cmd => {
Object.defineProperty(window, cmd, {
get: function() { console.warn(t('logCheatBlocked') + ' "' + cmd + '"'); return undefined; },
set: function() {},
configurable: false,
enumerable: false
});
});

// ============================================================
// ==================== ПЕРЕМЕННЫЕ ============================
// ============================================================
let score = parseInt(localStorage.getItem('rat_score')) || 0;
let clickPower = parseInt(localStorage.getItem('rat_clickPower')) || 1;
let autoClickers = parseInt(localStorage.getItem('rat_autoClickers')) || 0;
let clickLevel = parseInt(localStorage.getItem('rat_clickLevel')) || 0;
let autoLevel = parseInt(localStorage.getItem('rat_autoLevel')) || 0;
let grainLevel = parseInt(localStorage.getItem('rat_grainLevel')) || 0;
let grainBase = parseInt(localStorage.getItem('rat_grainBase')) || 3;
let grainActive = localStorage.getItem('rat_grainActive') === 'true';
let ownedAccessories = JSON.parse(localStorage.getItem('rat_ownedAccessories') || '[]');
let equippedAccessory = localStorage.getItem('rat_accessory') || null;
let grainPurchased = parseInt(localStorage.getItem('rat_grainPurchased')) || 0;
let superGrainPurchased = localStorage.getItem('rat_superGrainPurchased') === 'true';
let superGrainActive = localStorage.getItem('rat_superGrainActive') === 'true';
let mousePurchased = localStorage.getItem('rat_mousePurchased') === 'true';
let mouseActive = localStorage.getItem('rat_mouseActive') === 'true';
let hamsterPurchased = localStorage.getItem('rat_hamsterPurchased') === 'true';
let hamsterLevel = parseInt(localStorage.getItem('rat_hamsterLevel')) || 0;
let hamsterFood = parseFloat(localStorage.getItem('rat_hamsterFood')) || 0;
let hamsterMaxFood = 100;
let hamsterUpgradeCost = 5000;
const MAX_HAMSTER_LEVEL = 5;
let poopCount = parseInt(localStorage.getItem('rat_poopCount')) || 0;
let labPoopCount = parseInt(localStorage.getItem('rat_labPoopCount')) || 0;
let poopTimer = null;
let manipulatorPurchased = localStorage.getItem('rat_manipulatorPurchased') === 'true';
let manipulatorLevel = parseInt(localStorage.getItem('rat_manipulatorLevel')) || 0;
let advancedLogicPurchased = localStorage.getItem('rat_advancedLogicPurchased') === 'true';
let manipulatorSettings = JSON.parse(localStorage.getItem('rat_manipulatorSettings') || '[{"enabled":false,"action":"none","target":"","condition":"always","threshold":20,"interval":5,"plantTargets":["","",""]},{"enabled":false,"action":"none","target":"","condition":"always","threshold":20,"interval":5,"plantTargets":["","",""]},{"enabled":false,"action":"none","target":"","condition":"always","threshold":20,"interval":5,"plantTargets":["","",""]}]');
let manipulatorTimers = [null, null, null];
for (let i = 0; i < manipulatorSettings.length; i++) {
if (!manipulatorSettings[i]) {
manipulatorSettings[i] = { enabled: false, action: 'none', target: '', condition: 'always', threshold: 20, interval: 5, plantTargets: ['', '', ''] };
} else {
if (manipulatorSettings[i].condition === undefined) manipulatorSettings[i].condition = 'always';
if (manipulatorSettings[i].threshold === undefined) manipulatorSettings[i].threshold = 20;
if (manipulatorSettings[i].interval === undefined) manipulatorSettings[i].interval = 5;
if (manipulatorSettings[i].plantTargets === undefined) {
manipulatorSettings[i].plantTargets = ['', '', ''];
}
}
}
let combinerPurchased = localStorage.getItem('rat_combinerPurchased') === 'true';
let combinerLevel = parseInt(localStorage.getItem('rat_combinerLevel')) || 0;
let combinerSlots = [null, null, null];
let combinerRunning = JSON.parse(localStorage.getItem('rat_combinerRunning') || '[false,false,false]');
let combinerProgress = JSON.parse(localStorage.getItem('rat_combinerProgress') || '[0,0,0]');
let combinerTimer = [null, null, null];
let combinerRecipes = JSON.parse(localStorage.getItem('rat_combinerRecipes') || '[null,null,null]');
let extractorPurchased = localStorage.getItem('rat_extractorPurchased') === 'true';
let extractorQueue = JSON.parse(localStorage.getItem('rat_extractorQueue') || '[]');
let extractorProgress = JSON.parse(localStorage.getItem('rat_extractorProgress') || '[]');
let extractorTimer = null;
let bossMenuPurchased = localStorage.getItem('rat_bossMenuPurchased') === 'true';
let capybaraPurchased = localStorage.getItem('rat_capybaraPurchased') === 'true';
let capybaraCooldown = parseInt(localStorage.getItem('rat_capybaraCooldown')) || 0;
let capybaraDefeated = localStorage.getItem('rat_capybaraDefeated') === 'true';
let plantPurchased = localStorage.getItem('rat_plantPurchased') === 'true';
let plantLevel = parseInt(localStorage.getItem('rat_plantLevel')) || 0;
let plantUpgrade1 = localStorage.getItem('rat_plantUpgrade1') === 'true';
let plantUpgrade2 = localStorage.getItem('rat_plantUpgrade2') === 'true';
let plantTypeGrass = localStorage.getItem('rat_plantTypeGrass') === 'true';
let plantTypePepper = localStorage.getItem('rat_plantTypePepper') === 'true';
let plantTypeApple = localStorage.getItem('rat_plantTypeApple') === 'true';
let plantTypeCabbage = localStorage.getItem('rat_plantTypeCabbage') === 'true';
let plantData = JSON.parse(localStorage.getItem('rat_plantData') || '[]');
if (plantData.length === 0) {
plantData = [
{ stage: 'idle', progress: 0, type: null, fertilizer: false },
{ stage: 'idle', progress: 0, type: null, fertilizer: false },
{ stage: 'idle', progress: 0, type: null, fertilizer: false }
];
}
let plantInventory = JSON.parse(localStorage.getItem('rat_plantInventory') || '{"grass": 0, "pepper": 0, "apple": 0, "cabbage": 0}');
let labPurchased = localStorage.getItem('rat_labPurchased') === 'true';
let machineLevel = parseInt(localStorage.getItem('rat_machineLevel')) || 0;
let machineRunning = localStorage.getItem('rat_machineRunning') === 'true';
let machineProgress = parseFloat(localStorage.getItem('rat_machineProgress')) || 0;
let machineTimer = null;
let fertilizerCount = parseInt(localStorage.getItem('rat_fertilizerCount')) || 0;
if (capybaraCooldown > 600) {
capybaraCooldown = 600;
localStorage.setItem('rat_capybaraCooldown', capybaraCooldown);
}
let inventory = JSON.parse(localStorage.getItem('rat_inventory') || '{"food": 0, "gmo_apple": 0, "hay": 0, "gmo_apple_extract": 0, "rat_food_extract": 0, "hay_extract": 0}');
if (inventory.hay === undefined) inventory.hay = 0;
if (inventory.gmo_apple_extract === undefined) inventory.gmo_apple_extract = 0;
if (inventory.rat_food_extract === undefined) inventory.rat_food_extract = 0;
if (inventory.hay_extract === undefined) inventory.hay_extract = 0;
let buffActive = localStorage.getItem('rat_buffActive') === 'true';
let buffTimer = null;
let buffType = localStorage.getItem('rat_buffType') || null;
let buffEndTime = parseInt(localStorage.getItem('rat_buffEndTime')) || 0;
let pepperBuffActive = localStorage.getItem('rat_pepperBuffActive') === 'true';
let pepperBuffTimer = null;
let pepperBuffEndTime = parseInt(localStorage.getItem('rat_pepperBuffEndTime')) || 0;
let hayBuffActive = localStorage.getItem('rat_hayBuffActive') === 'true';
let hayBuffTimer = null;
let hayBuffEndTime = parseInt(localStorage.getItem('rat_hayBuffEndTime')) || 0;
let satietyActive = localStorage.getItem('rat_satietyActive') === 'true';
let satietyTimer = null;
let satietyEndTime = parseInt(localStorage.getItem('rat_satietyEndTime')) || 0;
let bossFightActive = false;
let bossHp = 100;
let bossMaxHp = 100;
let bossX = 50;
let bossDirection = 1;
let bossBullets = [];
let bossMoveInterval = null;
let bossShootInterval = null;
let bossCooldownInterval = null;
let bossFightInterval = null;
let canShoot = true;
let shootCooldown = 300;
let musicEnabled = localStorage.getItem('rat_musicEnabled') !== 'false';
let musicVideoId = '5QtxOr4iSBY';
const SUPER_GRAIN_BASE = 25;
const MAX_AUTO_LEVEL = 20;
const MAX_GRAIN_LEVEL = 7;
const GRAIN_LIFETIME = 7000;
const GRAIN_SPAWN_MIN = 4000;
const GRAIN_SPAWN_MAX = 6000;
const SUPER_GRAIN_SPAWN_MIN = 8000;
const SUPER_GRAIN_SPAWN_MAX = 12000;
const PEPPER_BUFF_DURATION = 30000;
const HAY_BUFF_DURATION = 180000;
let MAX_CLICK_LEVEL = superGrainPurchased ? 20 : 10;
let isBanned = false;
let lastClickTime = 0;
let clickIntervals = [];
const maxIntervalHistory = 10;
let grainSpawnTimeout = null;
let currentGrainElement = null;
let grainTimerInterval = null;
let grainLifeTimeout = null;
let isGrainActive = false;
let mouseElement = null;
let mouseMoveInterval = null;
let mouseCollectCooldown = false;
let hamsterMoveInterval = null;
let foodDepletionInterval = null;
let reloadTimerInterval = null;
let reloadTimerSeconds = 10;
let plantIntervals = [];
const ACCESSORY_BONUS = { hat: 5, glasses: 15, sword: 30, crown: 100 };
const ACCESSORY_PRICES = { hat: 1000, glasses: 5000, sword: 50000, crown: 10000000 };
const PLANT_TYPES = {
grass: { name: 'Трава', emoji: '', growTime: 180, cost: 10000, color: '#45f3ff' },
pepper: { name: 'Болгарский перец', emoji: '️', growTime: 300, cost: 25000, color: '#ff4444' },
apple: { name: 'Яблоко', emoji: '🍎', growTime: 480, cost: 40000, color: '#ff6b6b' },
cabbage: { name: 'Капуста', emoji: '🥬', growTime: 120, cost: 15000, color: '#45f3ff' }
};
const COMBINER_RECIPES = {
gmo_apple_extract: { name: 'Экстракт ГМО яблока', emoji: '🟢', ingredients: ['apple', 'fertilizer'], time: 300, result: 'gmo_apple_extract', resultType: 'extract' },
rat_food_extract: { name: 'Экстракт крысиного корма', emoji: '', ingredients: ['apple', 'grass', 'pepper'], time: 300, result: 'rat_food_extract', resultType: 'extract' },
hay_extract: { name: 'Экстракт сена', emoji: '🟡', ingredients: ['grass', 'grass'], time: 180, result: 'hay_extract', resultType: 'extract' }
};
const EXTRACTOR_RECIPES = {
gmo_apple_extract: { name: 'ГМО яблоко', emoji: '🍏', time: 60, result: 'gmo_apple', resultType: 'item' },
rat_food_extract: { name: 'Крысиный корм', emoji: '🍖', time: 60, result: 'food', resultType: 'item' },
hay_extract: { name: 'Сено', emoji: '🌾', time: 45, result: 'hay', resultType: 'item' }
};

// ============================================================
// ==================== DOM ЭЛЕМЕНТЫ ==========================
// ============================================================
const balanceEl = document.getElementById('balance');
const statsInfo = document.getElementById('statsInfo');
const ratContainer = document.getElementById('ratContainer');
const ratBody = document.getElementById('ratBody');
const trapBtn = document.getElementById('trapBtn');
const cheatWarning = document.getElementById('cheatWarning');
const shopModal = document.getElementById('shopModal');
const openShopBtn = document.getElementById('openShop');
const closeShopBtn = document.getElementById('closeShop');
const buyClickBtn = document.getElementById('buyClick');
const buyAutoBtn = document.getElementById('buyAuto');
const buyGrainBtn = document.getElementById('buyGrain');
const buySuperGrainBtn = document.getElementById('buySuperGrain');
const buyMouseShopBtn = document.getElementById('buyMouseShop');
const buyHamsterShopBtn = document.getElementById('buyHamsterShop');
const buyHamsterUpgradeBtn = document.getElementById('buyHamsterUpgrade');
const buyBossMenuBtn = document.getElementById('buyBossMenu');
const buyCapybaraBtn = document.getElementById('buyCapybara');
const buyPlantBtn = document.getElementById('buyPlant');
const buyPlantUpgrade1Btn = document.getElementById('buyPlantUpgrade1');
const buyPlantUpgrade2Btn = document.getElementById('buyPlantUpgrade2');
const buyPlantTypeGrassBtn = document.getElementById('buyPlantTypeGrass');
const buyPlantTypePepperBtn = document.getElementById('buyPlantTypePepper');
const buyPlantTypeAppleBtn = document.getElementById('buyPlantTypeApple');
const buyPlantTypeCabbageBtn = document.getElementById('buyPlantTypeCabbage');
const buyLabBtn = document.getElementById('buyLab');
const buyCombinerBtn = document.getElementById('buyCombiner');
const buyCombinerUpgradeBtn = document.getElementById('buyCombinerUpgrade');
const buyExtractorBtn = document.getElementById('buyExtractor');
const buyManipulatorBtn = document.getElementById('buyManipulator');
const advancedLogicShopItem = document.getElementById('advancedLogicShopItem');
const buyAdvancedLogicBtn = document.getElementById('buyAdvancedLogic');
const advancedLogicCostEl = document.getElementById('advancedLogicCost');
const clickCostEl = document.getElementById('clickCost');
const autoCostEl = document.getElementById('autoCost');
const clickLevelEl = document.getElementById('clickLevel');
const clickMaxLevelEl = document.getElementById('clickMaxLevel');
const autoLevelEl = document.getElementById('autoLevel');
const grainLevelEl = document.getElementById('grainLevel');
const grainBaseEl = document.getElementById('grainBase');
const grainCostEl = document.getElementById('grainCost');
const grainItem = document.getElementById('grainItem');
const superGrainItem = document.getElementById('superGrainItem');
const superGrainCostEl = document.getElementById('superGrainCost');
const mouseShopItem = document.getElementById('mouseShopItem');
const mouseShopCostEl = document.getElementById('mouseShopCost');
const hamsterShopItem = document.getElementById('hamsterShopItem');
const hamsterShopCostEl = document.getElementById('hamsterShopCost');
const hamsterUpgradeShopItem = document.getElementById('hamsterUpgradeShopItem');
const hamsterUpgradeCostEl = document.getElementById('hamsterUpgradeCost');
const hamsterUpgradeLevelEl = document.getElementById('hamsterUpgradeLevel');
const hamsterUpgradeCurrentBonusEl = document.getElementById('hamsterUpgradeCurrentBonus');
const bossMenuShopItem = document.getElementById('bossMenuShopItem');
const bossMenuCostEl = document.getElementById('bossMenuCost');
const capybaraShopItem = document.getElementById('capybaraShopItem');
const capybaraCostEl = document.getElementById('capybaraCost');
const labShopItem = document.getElementById('labShopItem');
const labShopCostEl = document.getElementById('labShopCost');
const combinerShopItem = document.getElementById('combinerShopItem');
const combinerShopCostEl = document.getElementById('combinerShopCost');
const combinerUpgradeShopItem = document.getElementById('combinerUpgradeShopItem');
const combinerUpgradeCostEl = document.getElementById('combinerUpgradeCost');
const combinerLevelEl = document.getElementById('combinerLevel');
const extractorShopItem = document.getElementById('extractorShopItem');
const extractorShopCostEl = document.getElementById('extractorShopCost');
const manipulatorShopItem = document.getElementById('manipulatorShopItem');
const manipulatorShopCostEl = document.getElementById('manipulatorShopCost');
const manipulatorLevelEl = document.getElementById('manipulatorLevel');
const plantShopItem = document.getElementById('plantShopItem');
const plantShopCostEl = document.getElementById('plantShopCost');
const plantUpgrade1ShopItem = document.getElementById('plantUpgrade1ShopItem');
const plantUpgrade1CostEl = document.getElementById('plantUpgrade1Cost');
const plantUpgrade2ShopItem = document.getElementById('plantUpgrade2ShopItem');
const plantUpgrade2CostEl = document.getElementById('plantUpgrade2Cost');
const plantTypeGrassItem = document.getElementById('plantTypeGrassItem');
const plantTypeGrassCostEl = document.getElementById('plantTypeGrassCost');
const plantTypePepperItem = document.getElementById('plantTypePepperItem');
const plantTypePepperCostEl = document.getElementById('plantTypePepperCost');
const plantTypeAppleItem = document.getElementById('plantTypeAppleItem');
const plantTypeAppleCostEl = document.getElementById('plantTypeAppleCost');
const plantTypeCabbageItem = document.getElementById('plantTypeCabbageItem');
const plantTypeCabbageCostEl = document.getElementById('plantTypeCabbageCost');
const grainToggle = document.getElementById('grainToggle');
const grainStatus = document.getElementById('grainStatus');
const grainLevelDisplay = document.getElementById('grainLevelDisplay');
const grainBox = document.getElementById('grainBox');
const superGrainToggle = document.getElementById('superGrainToggle');
const superGrainStatus = document.getElementById('superGrainStatus');
const superGrainInfo = document.getElementById('superGrainInfo');
const superGrainBox = document.getElementById('superGrainBox');
const superIndicator = document.getElementById('superIndicator');
const mouseToggle = document.getElementById('mouseToggle');
const mouseStatus = document.getElementById('mouseStatus');
const mouseInfo = document.getElementById('mouseInfo');
const mouseBox = document.getElementById('mouseBox');
const mouseIndicator = document.getElementById('mouseIndicator');
const manipulatorContainer = document.getElementById('manipulatorContainer');
const manipToggles = [
document.getElementById('manipToggle1'),
document.getElementById('manipToggle2'),
document.getElementById('manipToggle3')
];
const manipStatuses = [
document.getElementById('manipStatus1'),
document.getElementById('manipStatus2'),
document.getElementById('manipStatus3')
];
const manipSettingsBtns = [
document.getElementById('manipSettings1'),
document.getElementById('manipSettings2'),
document.getElementById('manipSettings3')
];
const manipLabels = [
document.getElementById('manipLabel1'),
document.getElementById('manipLabel2'),
document.getElementById('manipLabel3')
];
const manipBoxes = [
document.getElementById('manipBox1'),
document.getElementById('manipBox2'),
document.getElementById('manipBox3')
];
const clickItem = document.getElementById('clickItem');
const autoItem = document.getElementById('autoItem');
const clickArea = document.getElementById('clickArea');
const accessoryBonusDisplay = document.getElementById('accessoryBonusDisplay');
const resetBtn = document.getElementById('resetBtn');
const resetModal = document.getElementById('resetModal');
const codeDisplay = document.getElementById('codeDisplay');
const codeInput = document.getElementById('codeInput');
const confirmBox = document.getElementById('confirmBox');
const confirmResetBtn = document.getElementById('confirmResetBtn');
const cancelResetBtn = document.getElementById('cancelResetBtn');
const resetStatus = document.getElementById('resetStatus');
const reloadNotification = document.getElementById('reloadNotification');
const timerNumber = document.getElementById('timerNumber');
const reloadBtn = document.getElementById('reloadBtn');
const accHat = document.getElementById('accHat');
const accGlasses = document.getElementById('accGlasses');
const accSword = document.getElementById('accSword');
const accCrown = document.getElementById('accCrown');
const enclosure = document.getElementById('enclosure');
const enclosureStatus = document.getElementById('enclosureStatus');
const foodBarFill = document.getElementById('foodBarFill');
const foodBarText = document.getElementById('foodBarText');
const feedBtn = document.getElementById('feedBtn');
const poopBtn = document.getElementById('poopBtn');
const enclosureBonus = document.getElementById('enclosureBonus');
const enclosureSatiety = document.getElementById('enclosureSatiety');
const pepperIndicator = document.getElementById('pepperIndicator');
const hamsterElements = [
document.getElementById('hamster1'),
document.getElementById('hamster2'),
document.getElementById('hamster3'),
document.getElementById('hamster4'),
document.getElementById('hamster5')
];
const bossSkull = document.getElementById('bossSkull');
const bossMenu = document.getElementById('bossMenu');
const closeBossMenuBtn = document.getElementById('closeBossMenu');
const fightCapybaraBtn = document.getElementById('fightCapybaraBtn');
const capybaraStatus = document.getElementById('capybaraStatus');
const bossFightModal = document.getElementById('bossFightModal');
const closeFightBtn = document.getElementById('closeFightBtn');
const bossFightArea = document.getElementById('bossFightArea');
const bossEnemy = document.getElementById('bossEnemy');
const bossBulletsContainer = document.getElementById('bossBullets');
const playerProjectile = document.getElementById('playerProjectile');
const bossHpFill = document.getElementById('bossHpFill');
const bossHpText = document.getElementById('bossHpText');
const shootBtn = document.getElementById('shootBtn');
const retreatBtn = document.getElementById('retreatBtn');
const bossTimer = document.getElementById('bossTimer');
const inventoryModal = document.getElementById('inventoryModal');
const openInventoryBtn = document.getElementById('openInventory');
const closeInventoryBtn = document.getElementById('closeInventory');
const inventoryGrid = document.getElementById('inventoryGrid');
const inventoryEmpty = document.getElementById('inventoryEmpty');
const plantsContainer = document.getElementById('plantsContainer');
const plantsGrid = document.getElementById('plantsGrid');
const labModal = document.getElementById('labModal');
const openLabBtn = document.getElementById('openLab');
const closeLabBtn = document.getElementById('closeLab');
const machineStatus = document.getElementById('machineStatus');
const machineProgressDiv = document.getElementById('machineProgress');
const machineProgressFill = document.getElementById('machineProgressFill');
const machineProgressText = document.getElementById('machineProgressText');
const machineBtn = document.getElementById('machineBtn');
const machineUpgradeBtn = document.getElementById('machineUpgradeBtn');
const combinerModal = document.getElementById('combinerModal');
const openCombinerBtn = document.getElementById('openCombiner');
const closeCombinerBtn = document.getElementById('closeCombiner');
const combinerSlotsContainer = document.getElementById('combinerSlotsContainer');
const combinerInfo = document.getElementById('combinerInfo');
const extractorModal = document.getElementById('extractorModal');
const openExtractorBtn = document.getElementById('openExtractor');
const closeExtractorBtn = document.getElementById('closeExtractor');
const extractorQueueEl = document.getElementById('extractorQueue');
const extractorStatus = document.getElementById('extractorStatus');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettings');
const settingsContent = document.getElementById('settingsContent');
const buffIndicator = document.getElementById('buffIndicator');
const musicToggle = document.getElementById('musicToggle');
const langToggle = document.getElementById('langToggle');
const langModal = document.getElementById('langModal');
const closeLangBtn = document.getElementById('closeLang');
let hayIndicator = document.getElementById('hayIndicator');
if (!hayIndicator) {
hayIndicator = document.createElement('div');
hayIndicator.id = 'hayIndicator';
hayIndicator.style.cssText = 'display:none;color:#ffd700;font-size:11px;text-align:center;animation:buffPulse 0.5s ease-in-out infinite alternate;';
hayIndicator.textContent = '🌾 x1.3 БУСТ СВИНОК!';
const enclosureBottom = document.querySelector('.enclosure-bottom');
if (enclosureBottom) enclosureBottom.appendChild(hayIndicator);
}

// ============================================================
// ==================== ФУНКЦИИ ==============================
// ============================================================
function generateCode() { return String(Math.floor(1000 + Math.random() * 9000)); }
let currentCode = generateCode();
function getAccessoryBonus() { if (equippedAccessory && ACCESSORY_BONUS[equippedAccessory]) return ACCESSORY_BONUS[equippedAccessory]; return 0; }
function getHamsterBonus() { if (!hamsterPurchased || hamsterFood <= 0) return 1.0; let bonus = 1.0 + hamsterLevel * 0.1; if (pepperBuffActive) bonus *= 2; if (hayBuffActive) bonus *= 1.3; return bonus; }
function getTotalClickPower() { return Math.floor(clickPower * (1 + getAccessoryBonus() / 100) * getHamsterBonus() * (buffActive ? 2 : 1)); }
function getFeedCost() { return (bossMenuPurchased || capybaraPurchased) ? 1500 : 100; }
function getMachineTime() { const times = [300, 240, 210, 180, 150, 120]; return times[Math.min(machineLevel, 5)] || 300; }
function getMachineUpgradeCost() { return Math.round(20000 * (machineLevel + 1) * 1.2); }
function getCombinerSlots() { return combinerLevel === 0 ? 2 : 3; }
function getManipulatorCount() { return manipulatorLevel; }
function isAllLabPartsBought() { return labPurchased && plantPurchased && plantUpgrade1 && plantUpgrade2 && plantTypeGrass && plantTypePepper && plantTypeApple && plantTypeCabbage && combinerPurchased && extractorPurchased; }

function saveGame() {
if (window._ratIsActiveTab && !window._ratIsActiveTab()) return;
localStorage.setItem('rat_score', score);
localStorage.setItem('rat_clickPower', clickPower);
localStorage.setItem('rat_autoClickers', autoClickers);
localStorage.setItem('rat_clickLevel', clickLevel);
localStorage.setItem('rat_autoLevel', autoLevel);
localStorage.setItem('rat_grainLevel', grainLevel);
localStorage.setItem('rat_grainBase', grainBase);
localStorage.setItem('rat_grainActive', grainActive);
localStorage.setItem('rat_ownedAccessories', JSON.stringify(ownedAccessories));
localStorage.setItem('rat_accessory', equippedAccessory);
localStorage.setItem('rat_grainPurchased', grainPurchased);
localStorage.setItem('rat_superGrainPurchased', superGrainPurchased);
localStorage.setItem('rat_superGrainActive', superGrainActive);
localStorage.setItem('rat_mousePurchased', mousePurchased);
localStorage.setItem('rat_mouseActive', mouseActive);
localStorage.setItem('rat_hamsterPurchased', hamsterPurchased);
localStorage.setItem('rat_hamsterLevel', hamsterLevel);
localStorage.setItem('rat_hamsterFood', hamsterFood);
localStorage.setItem('rat_bossMenuPurchased', bossMenuPurchased);
localStorage.setItem('rat_capybaraPurchased', capybaraPurchased);
localStorage.setItem('rat_capybaraCooldown', capybaraCooldown);
localStorage.setItem('rat_capybaraDefeated', capybaraDefeated);
localStorage.setItem('rat_inventory', JSON.stringify(inventory));
localStorage.setItem('rat_plantPurchased', plantPurchased);
localStorage.setItem('rat_plantLevel', plantLevel);
localStorage.setItem('rat_plantUpgrade1', plantUpgrade1);
localStorage.setItem('rat_plantUpgrade2', plantUpgrade2);
localStorage.setItem('rat_plantTypeGrass', plantTypeGrass);
localStorage.setItem('rat_plantTypePepper', plantTypePepper);
localStorage.setItem('rat_plantTypeApple', plantTypeApple);
localStorage.setItem('rat_plantTypeCabbage', plantTypeCabbage);
localStorage.setItem('rat_plantInventory', JSON.stringify(plantInventory));
localStorage.setItem('rat_poopCount', poopCount);
localStorage.setItem('rat_labPoopCount', labPoopCount);
localStorage.setItem('rat_labPurchased', labPurchased);
localStorage.setItem('rat_machineLevel', machineLevel);
localStorage.setItem('rat_machineRunning', machineRunning);
localStorage.setItem('rat_machineProgress', machineProgress);
localStorage.setItem('rat_fertilizerCount', fertilizerCount);
localStorage.setItem('rat_combinerPurchased', combinerPurchased);
localStorage.setItem('rat_combinerLevel', combinerLevel);
localStorage.setItem('rat_combinerRunning', JSON.stringify(combinerRunning));
localStorage.setItem('rat_combinerProgress', JSON.stringify(combinerProgress));
localStorage.setItem('rat_combinerRecipes', JSON.stringify(combinerRecipes));
localStorage.setItem('rat_extractorPurchased', extractorPurchased);
localStorage.setItem('rat_extractorQueue', JSON.stringify(extractorQueue));
localStorage.setItem('rat_extractorProgress', JSON.stringify(extractorProgress));
localStorage.setItem('rat_manipulatorPurchased', manipulatorPurchased);
localStorage.setItem('rat_manipulatorLevel', manipulatorLevel);
localStorage.setItem('rat_advancedLogicPurchased', advancedLogicPurchased);
localStorage.setItem('rat_manipulatorSettings', JSON.stringify(manipulatorSettings));
localStorage.setItem('rat_buffActive', buffActive);
localStorage.setItem('rat_buffType', buffType || '');
localStorage.setItem('rat_buffEndTime', buffEndTime);
localStorage.setItem('rat_pepperBuffActive', pepperBuffActive);
localStorage.setItem('rat_pepperBuffEndTime', pepperBuffEndTime);
localStorage.setItem('rat_hayBuffActive', hayBuffActive);
localStorage.setItem('rat_hayBuffEndTime', hayBuffEndTime);
localStorage.setItem('rat_satietyActive', satietyActive);
localStorage.setItem('rat_satietyEndTime', satietyEndTime);
}

// ============================================================
// ==================== МЫШЬ ===================================
// ============================================================
function shouldSpawnSuper() { return superGrainPurchased && grainActive && superGrainActive; }
function createMouse() {
if (mouseElement) return;
mouseElement = document.createElement('div');
mouseElement.className = 'mouse-runner';
mouseElement.innerHTML = '🐁<div class="mouse-shadow"></div>';
const rect = clickArea.getBoundingClientRect();
mouseElement.style.left = (Math.random() * (rect.width - 60) + 10) + 'px';
mouseElement.style.top = (Math.random() * (rect.height - 60) + 10) + 'px';
clickArea.appendChild(mouseElement);
}
function removeMouse() {
if (mouseMoveInterval) { clearInterval(mouseMoveInterval); mouseMoveInterval = null; }
if (mouseElement) { mouseElement.remove(); mouseElement = null; }
}
function moveMouseToTarget() {
if (!mouseElement || !mouseActive || !currentGrainElement) return;
const grainRect = currentGrainElement.getBoundingClientRect();
const areaRect = clickArea.getBoundingClientRect();
const targetX = grainRect.left - areaRect.left + grainRect.width / 2 - 25;
const targetY = grainRect.top - areaRect.top + grainRect.height / 2 - 25;
const currentX = parseFloat(mouseElement.style.left) || 0;
const currentY = parseFloat(mouseElement.style.top) || 0;
const dx = targetX - currentX, dy = targetY - currentY;
const dist = Math.sqrt(dx * dx + dy * dy);
if (dist < 20) {
if (!mouseCollectCooldown && currentGrainElement) {
mouseCollectCooldown = true;
mouseElement.classList.add('collecting');
const isSuper = currentGrainElement.classList.contains('super');
let value = isSuper ? SUPER_GRAIN_BASE * getTotalClickPower() : grainBase * getTotalClickPower();
score += value;
saveGame();
updateUI();
const pop = document.createElement('div');
pop.className = 'grain-collect-pop mouse';
pop.innerText = '🐁 +' + value;
const rect = currentGrainElement.getBoundingClientRect();
const areaRect2 = clickArea.getBoundingClientRect();
pop.style.left = (rect.left - areaRect2.left + 20) + 'px';
pop.style.top = (rect.top - areaRect2.top - 10) + 'px';
clickArea.appendChild(pop);
setTimeout(() => pop.remove(), 700);
currentGrainElement.style.transform = 'scale(0.3)';
currentGrainElement.style.opacity = '0';
removeGrain();
setTimeout(() => { mouseElement.classList.remove('collecting'); mouseCollectCooldown = false; }, 400);
}
return;
}
const speed = Math.min(dist / 20, 8);
let newX = currentX + (dx / dist) * speed;
let newY = currentY + (dy / dist) * speed;
const areaRect2 = clickArea.getBoundingClientRect();
newX = Math.max(5, Math.min(areaRect2.width - 55, newX));
newY = Math.max(5, Math.min(areaRect2.height - 55, newY));
mouseElement.style.left = newX + 'px';
mouseElement.style.top = newY + 'px';
}
function toggleMouse(state) {
mouseActive = state;
if (mouseActive) {
if (mouseElement) { mouseElement.remove(); mouseElement = null; }
if (mouseMoveInterval) { clearInterval(mouseMoveInterval); mouseMoveInterval = null; }
createMouse();
mouseMoveInterval = setInterval(moveMouseToTarget, 50);
} else { removeMouse(); }
saveGame();
updateUI();
}

// ============================================================
// ==================== ЗЕРНО =================================
// ============================================================
function spawnGrain() {
if (isGrainActive) return;
if (!grainActive || grainLevel === 0) return;
if (shouldSpawnSuper()) spawnSuperGrainInternal();
else if (!superGrainActive || !superGrainPurchased) spawnNormalGrainInternal();
}
function spawnNormalGrainInternal() {
if (isGrainActive) return;
if (!grainActive || grainLevel === 0) return;
if (currentGrainElement) removeGrain();
isGrainActive = true;
const grainValue = grainBase * getTotalClickPower();
const grain = document.createElement('div');
grain.className = 'grain-object';
grain.innerHTML = `🌽<span class="grain-value">+${grainValue}</span><div class="timer-bar"><div class="fill" style="width:100%;"></div></div>`;
const rect = clickArea.getBoundingClientRect();
grain.style.left = (Math.random() * (rect.width - 100) + 20) + 'px';
grain.style.top = (Math.random() * (rect.height - 100) + 20) + 'px';
grain.addEventListener('click', e => { e.stopPropagation(); collectGrain(grainValue); });
clickArea.appendChild(grain);
currentGrainElement = grain;
let timeLeft = GRAIN_LIFETIME / 1000;
const fill = grain.querySelector('.fill');
grainTimerInterval = setInterval(() => {
timeLeft -= 0.1;
if (fill) fill.style.width = Math.max(0, (timeLeft / (GRAIN_LIFETIME / 1000)) * 100) + '%';
if (timeLeft <= 0) removeGrain();
}, 100);
grainLifeTimeout = setTimeout(removeGrain, GRAIN_LIFETIME);
}
function spawnSuperGrainInternal() {
if (isGrainActive) return;
if (!grainActive || !superGrainActive || !superGrainPurchased) return;
if (currentGrainElement) removeGrain();
isGrainActive = true;
const grainValue = SUPER_GRAIN_BASE * getTotalClickPower();
const grain = document.createElement('div');
grain.className = 'grain-object super';
grain.innerHTML = `🌽<span class="grain-value">⭐ +${grainValue}</span><div class="timer-bar"><div class="fill" style="width:100%;"></div></div>`;
const rect = clickArea.getBoundingClientRect();
grain.style.left = (Math.random() * (rect.width - 100) + 20) + 'px';
grain.style.top = (Math.random() * (rect.height - 100) + 20) + 'px';
grain.addEventListener('click', e => { e.stopPropagation(); collectGrain(grainValue); });
clickArea.appendChild(grain);
currentGrainElement = grain;
let timeLeft = GRAIN_LIFETIME / 1000;
const fill = grain.querySelector('.fill');
grainTimerInterval = setInterval(() => {
timeLeft -= 0.1;
if (fill) fill.style.width = Math.max(0, (timeLeft / (GRAIN_LIFETIME / 1000)) * 100) + '%';
if (timeLeft <= 0) removeGrain();
}, 100);
grainLifeTimeout = setTimeout(removeGrain, GRAIN_LIFETIME);
}
function collectGrain(value) {
if (!isGrainActive || !currentGrainElement) return;
score += value;
saveGame();
updateUI();
const isSuper = currentGrainElement.classList.contains('super');
const pop = document.createElement('div');
pop.className = 'grain-collect-pop' + (isSuper ? ' super' : '');
pop.innerText = (isSuper ? '⭐ +' : '🌽 +') + value;
const rect = currentGrainElement.getBoundingClientRect();
const areaRect = clickArea.getBoundingClientRect();
pop.style.left = (rect.left - areaRect.left + 20) + 'px';
pop.style.top = (rect.top - areaRect.top - 10) + 'px';
clickArea.appendChild(pop);
setTimeout(() => pop.remove(), 700);
currentGrainElement.style.transform = 'scale(0.3)';
currentGrainElement.style.opacity = '0';
removeGrain();
}
function removeGrain() {
isGrainActive = false;
if (grainTimerInterval) { clearInterval(grainTimerInterval); grainTimerInterval = null; }
if (grainLifeTimeout) { clearTimeout(grainLifeTimeout); grainLifeTimeout = null; }
if (currentGrainElement) { currentGrainElement.remove(); currentGrainElement = null; }
if (mouseActive && mouseIndicator) { mouseIndicator.textContent = '⏳...'; mouseIndicator.className = 'indicator-text'; }
if (grainActive && grainLevel > 0) {
const useSuper = shouldSpawnSuper();
const delay = useSuper ? SUPER_GRAIN_SPAWN_MIN + Math.random() * (SUPER_GRAIN_SPAWN_MAX - SUPER_GRAIN_SPAWN_MIN) : GRAIN_SPAWN_MIN + Math.random() * (GRAIN_SPAWN_MAX - GRAIN_SPAWN_MIN);
if (grainSpawnTimeout) clearTimeout(grainSpawnTimeout);
grainSpawnTimeout = setTimeout(spawnGrain, delay);
}
}
function toggleGrain(state) {
grainActive = state;
if (grainActive) {
if (grainSpawnTimeout) clearTimeout(grainSpawnTimeout);
const useSuper = shouldSpawnSuper();
const delay = useSuper ? SUPER_GRAIN_SPAWN_MIN + Math.random() * (SUPER_GRAIN_SPAWN_MAX - SUPER_GRAIN_SPAWN_MIN) : GRAIN_SPAWN_MIN + Math.random() * (GRAIN_SPAWN_MAX - GRAIN_SPAWN_MIN);
grainSpawnTimeout = setTimeout(spawnGrain, delay);
} else {
if (grainSpawnTimeout) { clearTimeout(grainSpawnTimeout); grainSpawnTimeout = null; }
removeGrain();
}
saveGame();
updateUI();
}
function toggleSuperGrain(state) {
superGrainActive = state;
if (!superGrainActive) {
removeGrain();
if (grainActive && grainLevel > 0) {
if (grainSpawnTimeout) clearTimeout(grainSpawnTimeout);
grainSpawnTimeout = setTimeout(spawnGrain, 5000);
}
} else if (grainActive) {
removeGrain();
if (grainSpawnTimeout) clearTimeout(grainSpawnTimeout);
const delay = SUPER_GRAIN_SPAWN_MIN + Math.random() * (SUPER_GRAIN_SPAWN_MAX - SUPER_GRAIN_SPAWN_MIN);
grainSpawnTimeout = setTimeout(spawnGrain, delay);
}
saveGame();
updateUI();
}

// ============================================================
// ==================== РАСТЕНИЯ ==============================
// ============================================================
function getPlantMaxTime(type, hasFertilizer = false) {
let base = type === 'grass' ? 180 : type === 'pepper' ? 300 : type === 'apple' ? 480 : 120;
if (hasFertilizer) base = base / 2;
return base;
}
function getPlantEmoji(type, stage) {
if (stage === 'idle') return '🪴';
if (stage === 'growing') {
if (type === 'grass') return '🌱';
if (type === 'pepper') return '🌶️';
if (type === 'apple') return '🍎';
if (type === 'cabbage') return '🥬';
return '🌱';
}
if (stage === 'ready') {
if (type === 'grass') return '🌿';
if (type === 'pepper') return '🌶️';
if (type === 'apple') return '';
if (type === 'cabbage') return '🥬';
return '🌿';
}
return '🪴';
}
function getPlantStatusText(stage, progress) {
if (stage === 'idle') return t('water');
if (stage === 'growing') return ` ${Math.round(progress)}%`;
if (stage === 'ready') return t('collectPlant');
return t('water');
}
function getPlantStatusClass(stage) {
if (stage === 'idle') return 'water';
if (stage === 'growing') return '';
if (stage === 'ready') return 'ready-status';
return '';
}
function getPlantName(type) {
if (type === 'grass') return t('grass');
if (type === 'pepper') return t('pepper');
if (type === 'apple') return t('apple');
if (type === 'cabbage') return t('cabbage');
return type;
}
function updatePlantsUI() {
const container = document.getElementById('plantsContainer');
const grid = document.getElementById('plantsGrid');
if (plantLevel === 0 || !plantPurchased) {
container.style.display = 'none';
container.classList.remove('visible');
return;
}
container.style.display = 'flex';
container.classList.add('visible');
grid.innerHTML = '';
for (let i = 0; i < plantLevel; i++) {
const data = plantData[i];
if (!data) continue;
const pot = document.createElement('div');
pot.className = 'plant-pot';
pot.dataset.index = i;
const typeLabel = document.createElement('div');
typeLabel.className = 'plant-type';
if (data.type) {
typeLabel.textContent = getPlantName(data.type);
typeLabel.style.color = PLANT_TYPES[data.type]?.color || '#888';
} else {
typeLabel.textContent = t('empty');
typeLabel.style.color = '#555';
}
const emoji = document.createElement('div');
emoji.className = 'plant-emoji';
if (data.stage === 'growing') emoji.classList.add('growing');
if (data.stage === 'ready') emoji.classList.add('ready');
emoji.textContent = getPlantEmoji(data.type, data.stage);
const status = document.createElement('div');
status.className = 'plant-status ' + getPlantStatusClass(data.stage);
status.textContent = getPlantStatusText(data.stage, data.progress);
const progressBar = document.createElement('div');
progressBar.className = 'plant-progress';
const fill = document.createElement('div');
fill.className = 'plant-progress-fill';
fill.style.width = (data.stage === 'growing' || data.stage === 'ready') ? Math.min(100, data.progress) + '%' : '0%';
progressBar.appendChild(fill);
pot.appendChild(typeLabel);
pot.appendChild(emoji);
pot.appendChild(status);
pot.appendChild(progressBar);
if (data.fertilizer && data.stage !== 'idle') {
const buffInd = document.createElement('div');
buffInd.className = 'plant-buff-indicator active';
buffInd.textContent = '🧪';
pot.appendChild(buffInd);
}
pot.addEventListener('click', function() { interactWithPlant(parseInt(this.dataset.index)); });
grid.appendChild(pot);
}
}
function interactWithPlant(index) {
const data = plantData[index];
if (!data) return;
if (!data.type) {
let availableTypes = [];
if (plantTypeGrass) availableTypes.push('grass');
if (plantTypePepper) availableTypes.push('pepper');
if (plantTypeApple) availableTypes.push('apple');
if (plantTypeCabbage) availableTypes.push('cabbage');
if (availableTypes.length === 0) return;
let choices = availableTypes.map((t2, i) => {
let info = PLANT_TYPES[t2];
return `${i+1}. ${info.emoji} ${getPlantName(t2)} (${Math.round(info.growTime/60)} ${t('min')})`;
}).join('\n');
let choice = prompt(t('selectPlant') + '\n' + choices, '1');
if (choice === null) return;
let idx = parseInt(choice) - 1;
if (idx >= 0 && idx < availableTypes.length) {
data.type = availableTypes[idx];
data.stage = 'growing';
data.progress = 0;
data.fertilizer = false;
savePlantData();
updatePlantsUI();
updateUI();
if (plantIntervals[index]) { clearInterval(plantIntervals[index]); plantIntervals[index] = null; }
startPlantGrowth(index);
}
return;
}
if (data.stage === 'idle') {
if (fertilizerCount > 0 && confirm(t('useFertilizerConfirm'))) {
fertilizerCount--;
data.fertilizer = true;
saveGame();
savePlantData();
}
data.stage = 'growing';
data.progress = 0;
savePlantData();
updatePlantsUI();
startPlantGrowth(index);
return;
}
if (data.stage === 'ready') {
const type = data.type;
if (!type) return;
if (plantInventory[type] === undefined) plantInventory[type] = 0;
plantInventory[type]++;
data.stage = 'idle';
data.progress = 0;
data.type = null;
data.fertilizer = false;
savePlantData();
saveGame();
updatePlantsUI();
updateUI();
return;
}
}
function startPlantGrowth(index) {
const data = plantData[index];
if (!data || !data.type) return;
if (plantIntervals[index]) { clearInterval(plantIntervals[index]); plantIntervals[index] = null; }
const maxTime = getPlantMaxTime(data.type, data.fertilizer);
if (maxTime <= 0) return;
plantIntervals[index] = setInterval(() => {
const d = plantData[index];
if (!d || d.stage !== 'growing') {
clearInterval(plantIntervals[index]);
plantIntervals[index] = null;
return;
}
d.progress += (100 / maxTime);
if (d.progress >= 100) {
d.progress = 100;
d.stage = 'ready';
clearInterval(plantIntervals[index]);
plantIntervals[index] = null;
savePlantData();
updatePlantsUI();
updateUI();
return;
}
savePlantData();
updatePlantsUI();
}, 1000);
}
function savePlantData() {
if (window._ratIsActiveTab && !window._ratIsActiveTab()) return;
localStorage.setItem('rat_plantData', JSON.stringify(plantData));
localStorage.setItem('rat_plantInventory', JSON.stringify(plantInventory));
}
function loadPlantData() {
const saved = localStorage.getItem('rat_plantData');
if (saved) {
try {
const parsed = JSON.parse(saved);
if (parsed.length === 3) { plantData = parsed; return; }
} catch(e) {}
}
plantData = [
{ stage: 'idle', progress: 0, type: null, fertilizer: false },
{ stage: 'idle', progress: 0, type: null, fertilizer: false },
{ stage: 'idle', progress: 0, type: null, fertilizer: false }
];
}

// ============================================================
// ==================== ЛАБОРАТОРИЯ ===========================
// ============================================================
function updateLabUI() {
if (!labPurchased) return;
const pEl = document.getElementById('poopCount');
if (pEl) pEl.textContent = labPoopCount;
const fEl = document.getElementById('fertilizerCount');
if (fEl) fEl.textContent = fertilizerCount;
if (machineRunning) {
machineStatus.textContent = t('working');
machineStatus.className = 'machine-status running';
machineProgressDiv.style.display = 'block';
machineBtn.disabled = true;
machineBtn.textContent = '⏳...';
} else if (machineProgress >= getMachineTime() && machineProgress > 0) {
machineStatus.textContent = t('done');
machineStatus.className = 'machine-status complete';
machineProgressDiv.style.display = 'block';
machineBtn.disabled = false;
machineBtn.textContent = t('collectFertilizer') + ' (+1)';
} else {
machineStatus.textContent = t('idle');
machineStatus.className = 'machine-status';
machineProgressDiv.style.display = 'none';
machineBtn.disabled = (labPoopCount < 7);
machineBtn.textContent = t('start') + ' (7 💩 → 1 🧪)';
}
const maxTime = getMachineTime();
let percent = Math.min(100, (machineProgress / maxTime) * 100);
machineProgressFill.style.width = percent + '%';
machineProgressText.textContent = Math.round(percent) + '%';
const timeDisplayEl = document.getElementById('machineTimeDisplay');
if (timeDisplayEl) timeDisplayEl.textContent = Math.floor(maxTime / 60);
const levelDisplayEl = document.getElementById('machineLevelDisplay');
if (levelDisplayEl) levelDisplayEl.textContent = machineLevel;
if (machineLevel >= 5) {
machineUpgradeBtn.disabled = true;
machineUpgradeBtn.textContent = '⭐ MAX';
} else {
const cost = getMachineUpgradeCost();
machineUpgradeBtn.disabled = (score < cost);
machineUpgradeBtn.textContent = `⬆️ ${t('upgrade')} (${cost})`;
}
}
function restartMachineTimer(maxTime) {
if (machineTimer) clearInterval(machineTimer);
if (maxTime <= 0) return;
machineTimer = setInterval(() => {
machineProgress++;
saveGame();
updateLabUI();
if (machineProgress >= maxTime) {
clearInterval(machineTimer);
machineTimer = null;
machineRunning = false;
machineProgress = maxTime;
saveGame();
updateLabUI();
}
}, 1000);
}
function startMachine() {
if (machineRunning) { alert(t('alertMachineRunning')); return; }
if (labPoopCount < 7) return;
labPoopCount -= 7;
machineRunning = true;
machineProgress = 0;
const maxTime = getMachineTime();
saveGame();
updateLabUI();
updateUI();
restartMachineTimer(maxTime);
}
function collectFertilizer() {
if (machineProgress < getMachineTime()) return;
fertilizerCount++;
machineProgress = 0;
machineRunning = false;
saveGame();
updateLabUI();
updateUI();
}
function upgradeMachine() {
if (machineLevel >= 5) return;
const cost = getMachineUpgradeCost();
if (score < cost) { alert(t('notEnough')); return; }
score -= cost;
machineLevel++;
saveGame();
updateUI();
updateLabUI();
}

// ============================================================
// ==================== КОМБИНАТОР ============================
// ============================================================
function checkRecipe(ingredients) {
let valid = ingredients.filter(i => i !== null);
if (valid.length === 0) return null;
for (let [recipeId, recipe] of Object.entries(COMBINER_RECIPES)) {
let recipeCopy = [...recipe.ingredients];
let matched = true;
let tempCopy = [...recipeCopy];
let tempValid = [...valid];
for (let item of tempValid) {
let index = tempCopy.indexOf(item);
if (index === -1) { matched = false; break; }
tempCopy.splice(index, 1);
}
if (matched && tempCopy.length === 0 && tempValid.length === recipe.ingredients.length) {
return recipeId;
}
}
return null;
}
function getRecipeName(recipeId) {
if (recipeId === 'gmo_apple_extract') return t('combinerRecipe1').split('=')[0].trim();
if (recipeId === 'rat_food_extract') return t('combinerRecipe2').split('=')[0].trim();
if (recipeId === 'hay_extract') return t('combinerRecipe3').split('=')[0].trim();
return recipeId;
}
function updateCombinerUI() {
if (!combinerPurchased) return;
const slots = getCombinerSlots();
combinerSlotsContainer.innerHTML = '';
for (let i = 0; i < slots; i++) {
const slot = document.createElement('div');
slot.className = 'combiner-slot';
slot.dataset.index = i;
const item = combinerSlots[i];
if (item) {
let displayName = '';
let emoji = '';
if (item === 'apple') { displayName = ''; emoji = '🍎'; }
else if (item === 'grass') { displayName = '🌿'; emoji = '🌿'; }
else if (item === 'pepper') { displayName = '🌶️'; emoji = '️'; }
else if (item === 'fertilizer') { displayName = '🧪'; emoji = '🧪'; }
slot.innerHTML = `<div class="slot-item"><div class="slot-emoji">${emoji}</div><div class="slot-name">${displayName}</div><div class="slot-remove" onclick="removeFromCombiner(${i})">✕</div></div>`;
} else {
slot.innerHTML = `<div class="slot-empty" onclick="selectForCombiner(${i})">${t('emptySlot')}</div>`;
}
combinerSlotsContainer.appendChild(slot);
}
const resultSlot = document.createElement('div');
resultSlot.className = 'combiner-result-slot';
const recipeId = checkRecipe(combinerSlots);
const isRunning = combinerRunning.some(r => r);
if (recipeId && !isRunning) {
const recipe = COMBINER_RECIPES[recipeId];
resultSlot.innerHTML = `<div class="result-item"><div class="result-arrow">➡️</div><div class="result-emoji">${recipe.emoji}</div><div class="result-name">${getRecipeName(recipeId)}</div><div class="result-time">⏱️ ${Math.round(recipe.time/60)} ${t('min')}</div><button class="craft-btn" onclick="startCraft('${recipeId}')">${t('craft')}</button></div>`;
} else if (isRunning) {
let progress = 0;
for (let i = 0; i < combinerRunning.length; i++) {
if (combinerRunning[i]) { progress = combinerProgress[i] || 0; break; }
}
resultSlot.innerHTML = `<div class="result-item"><div class="result-emoji">⚙️</div><div class="result-name">${t('crafting')}</div><div class="result-progress">${Math.round(progress)}%</div><div class="result-bar"><div class="result-fill" style="width:${progress}%"></div></div></div>`;
} else {
resultSlot.innerHTML = `<div class="result-item empty"><div class="result-emoji">❓</div><div class="result-name">${t('putIngredients')}</div></div>`;
}
combinerSlotsContainer.appendChild(resultSlot);
}
function selectForCombiner(index) {
let availableItems = [];
if (plantInventory.apple > 0) availableItems.push({ id: 'apple', name: '🍎', emoji: '', count: plantInventory.apple });
if (plantInventory.grass > 0) availableItems.push({ id: 'grass', name: '🌿', emoji: '🌿', count: plantInventory.grass });
if (plantInventory.pepper > 0) availableItems.push({ id: 'pepper', name: '🌶️', emoji: '️', count: plantInventory.pepper });
if (fertilizerCount > 0) availableItems.push({ id: 'fertilizer', name: '', emoji: '🧪', count: fertilizerCount });
if (availableItems.length === 0) return;
let choices = availableItems.map((item, i) => `${i+1}. ${item.emoji} (x${item.count})`).join('\n');
let choice = prompt(`${t('selectIngredient')}\n${choices}`, '1');
if (choice === null) return;
let idx = parseInt(choice) - 1;
if (idx >= 0 && idx < availableItems.length) {
const item = availableItems[idx];
let countInSlots = combinerSlots.filter(s => s === item.id).length;
let maxCount = item.id === 'fertilizer' ? fertilizerCount : plantInventory[item.id] || 0;
if (countInSlots >= maxCount) return;
combinerSlots[index] = item.id;
saveGame();
updateCombinerUI();
updateUI();
}
}
window.removeFromCombiner = function(index) {
combinerSlots[index] = null;
saveGame();
updateCombinerUI();
updateUI();
};
window.selectForCombiner = selectForCombiner;
window.startCraft = function(recipeId) {
if (combinerRunning.some(r => r)) return;
const recipe = COMBINER_RECIPES[recipeId];
if (!recipe) return;
const slotIngredients = combinerSlots.filter(s => s !== null);
let recipeCopy = [...recipe.ingredients];
let tempCopy = [...recipeCopy];
let tempValid = [...slotIngredients];
for (let item of tempValid) {
let index = tempCopy.indexOf(item);
if (index === -1) return;
tempCopy.splice(index, 1);
}
if (tempCopy.length !== 0) return;
for (let item of slotIngredients) {
if (item === 'fertilizer') fertilizerCount--;
else plantInventory[item]--;
}
let slotIndex = combinerRunning.indexOf(false);
if (slotIndex === -1) slotIndex = 0;
combinerRunning[slotIndex] = true;
combinerProgress[slotIndex] = 0;
combinerRecipes[slotIndex] = recipeId;
combinerSlots = [null, null, null];
saveGame();
updateCombinerUI();
updateUI();
if (combinerTimer[slotIndex]) clearInterval(combinerTimer[slotIndex]);
combinerTimer[slotIndex] = setInterval(() => {
combinerProgress[slotIndex] += (100 / recipe.time);
if (combinerProgress[slotIndex] >= 100) {
combinerProgress[slotIndex] = 100;
clearInterval(combinerTimer[slotIndex]);
combinerTimer[slotIndex] = null;
const result = recipe.result;
if (inventory[result] === undefined) inventory[result] = 0;
inventory[result]++;
saveGame();
updateInventoryUI();
updateUI();
combinerRunning[slotIndex] = false;
combinerProgress[slotIndex] = 0;
combinerRecipes[slotIndex] = null;
saveGame();
updateCombinerUI();
updateUI();
}
saveGame();
updateCombinerUI();
}, 1000);
};

// ============================================================
// ==================== ЭКСТРАКТОР ============================
// ============================================================
function updateExtractorUI() {
if (!extractorPurchased) return;
extractorQueueEl.innerHTML = '';
if (extractorQueue.length === 0) {
extractorQueueEl.innerHTML = '<div class="extractor-empty">' + t('queueEmpty') + '</div>';
extractorStatus.textContent = t('idle');
} else {
let text = '';
for (let i = 0; i < extractorQueue.length; i++) {
const item = extractorQueue[i];
const recipe = EXTRACTOR_RECIPES[item];
if (recipe) {
const progress = extractorProgress[i] || 0;
text += `${recipe.emoji} ${recipe.name} — ${Math.round(progress)}%\n`;
}
}
extractorQueueEl.innerHTML = '<pre>' + text + '</pre>';
extractorStatus.textContent = t('working');
}
if (extractorQueue.length > 0 && !extractorTimer) {
startExtractorProcessing();
}
}
function startExtractorProcessing() {
if (extractorTimer) { clearInterval(extractorTimer); extractorTimer = null; }
if (extractorQueue.length === 0) return;
const item = extractorQueue[0];
const recipe = EXTRACTOR_RECIPES[item];
if (!recipe) {
extractorQueue.shift();
extractorProgress.shift();
saveGame();
updateExtractorUI();
return;
}
extractorTimer = setInterval(() => {
if (extractorQueue.length === 0 || extractorProgress.length === 0) {
clearInterval(extractorTimer);
extractorTimer = null;
updateExtractorUI();
return;
}
extractorProgress[0] += (100 / recipe.time);
if (extractorProgress[0] >= 100) {
extractorProgress[0] = 100;
clearInterval(extractorTimer);
extractorTimer = null;
const finishedItem = extractorQueue.shift();
extractorProgress.shift();
if (finishedItem === 'rat_food_extract') { if (!inventory.food) inventory.food = 0; inventory.food++; }
else if (finishedItem === 'gmo_apple_extract') { if (!inventory.gmo_apple) inventory.gmo_apple = 0; inventory.gmo_apple++; }
else if (finishedItem === 'hay_extract') { if (!inventory.hay) inventory.hay = 0; inventory.hay++; }
saveGame();
updateExtractorUI();
updateUI();
if (extractorQueue.length > 0) startExtractorProcessing();
}
saveGame();
updateExtractorUI();
}, 1000);
}

// ============================================================
// ==================== МАНИПУЛЯТОРЫ ==========================
// ============================================================
function updateManipulatorUI() {
const count = getManipulatorCount();
if (count === 0 || !manipulatorPurchased) {
if (manipulatorContainer) manipulatorContainer.style.display = 'none';
updateAutomationIndicators();
return;
}
if (manipulatorContainer) manipulatorContainer.style.display = 'flex';
for (let i = 0; i < 3; i++) {
const box = manipBoxes[i];
const status = manipStatuses[i];
const label = manipLabels[i];
if (i < count) {
if (box) {
box.style.display = 'flex';
if (advancedLogicPurchased) box.classList.add('advanced');
else box.classList.remove('advanced');
}
if (status) status.style.display = 'block';
if (label) label.style.display = 'block';
const setting = manipulatorSettings[i] || { enabled: false, action: 'none', target: '', condition: 'always', threshold: 20, interval: 5 };
const toggle = document.getElementById('manipToggle' + (i+1));
if (toggle) {
if (setting.enabled) toggle.classList.add('active');
else toggle.classList.remove('active');
}
if (status) {
status.textContent = setting.enabled ? 'ON' : 'OFF';
status.className = setting.enabled ? 'manip-status on' : 'manip-status';
}
let actionText = '🤖';
if (setting.action === 'click_rat') actionText = ' ' + t('actionClickRat');
else if (setting.action === 'feed_hamsters') actionText = '🤖 ' + t('actionFeedHamsters');
else if (setting.action === 'craft') actionText = '🤖 ' + t('actionCraft');
else if (setting.action === 'grow_plants') actionText = '🤖 ' + t('actionGrowPlants');
else if (setting.action === 'make_fertilizer') actionText = '🤖 ' + t('actionMakeFertilizer');
if (advancedLogicPurchased && setting.interval) actionText += ' ⏱️' + setting.interval + 's';
if (label) label.textContent = actionText;
} else {
if (box) box.style.display = 'none';
if (status) status.style.display = 'none';
if (label) label.style.display = 'none';
}
}
updateAutomationIndicators();
}
function attachManipulatorHandlers() {
for (let i = 0; i < 3; i++) {
const toggle = document.getElementById('manipToggle' + (i+1));
if (toggle && !toggle.dataset.handlerAttached) {
toggle.dataset.handlerAttached = 'true';
toggle.addEventListener('click', function() {
const idx = i;
const s = manipulatorSettings[idx] || { enabled: false, action: 'none', target: '', condition: 'always', threshold: 20, interval: 5 };
s.enabled = !s.enabled;
manipulatorSettings[idx] = s;
localStorage.setItem('rat_manipulatorSettings', JSON.stringify(manipulatorSettings));
saveGame();
updateManipulatorUI();
updateUI();
restartManipulators();
});
}
const settingsBtn = document.getElementById('manipSettings' + (i+1));
if (settingsBtn && !settingsBtn.dataset.handlerAttached) {
settingsBtn.dataset.handlerAttached = 'true';
settingsBtn.addEventListener('click', function() { openManipulatorSettings(i); });
}
}
}
function getFeedableOptions() {
let options = [{ id: 'money', label: '💵 ' + t('cost') }];
if (plantInventory.grass > 0 || plantTypeGrass) options.push({ id: 'grass', label: t('grass') });
if (plantInventory.apple > 0 || plantTypeApple) options.push({ id: 'apple', label: t('apple') });
if (plantInventory.cabbage > 0 || plantTypeCabbage) options.push({ id: 'cabbage', label: t('cabbage') });
if (plantInventory.pepper > 0 || plantTypePepper) options.push({ id: 'pepper', label: t('pepper') });
if (inventory.hay > 0) options.push({ id: 'hay', label: t('hay') });
if (inventory.gmo_apple > 0) options.push({ id: 'gmo_apple', label: t('gmoApple') });
if (inventory.gmo_apple_extract > 0) options.push({ id: 'gmo_apple_extract', label: t('gmoAppleExtract') });
if (inventory.rat_food_extract > 0) options.push({ id: 'rat_food_extract', label: t('ratFoodExtract') });
if (inventory.hay_extract > 0) options.push({ id: 'hay_extract', label: t('hayExtract') });
return options;
}
function getPlantableOptions() {
let options = [{ id: '', label: '— ' + t('empty') + ' —' }];
if (plantTypeGrass) options.push({ id: 'grass', label: t('grass') });
if (plantTypePepper) options.push({ id: 'pepper', label: t('pepper') });
if (plantTypeApple) options.push({ id: 'apple', label: t('apple') });
if (plantTypeCabbage) options.push({ id: 'cabbage', label: t('cabbage') });
return options;
}
function openManipulatorSettings(index) {
const setting = manipulatorSettings[index] || { enabled: false, action: 'none', target: '', condition: 'always', threshold: 20, interval: 5, plantTargets: ['', '', ''] };
if (!setting.plantTargets) setting.plantTargets = ['', '', ''];
const showAdvanced = advancedLogicPurchased;
let feedOptions = '';
getFeedableOptions().forEach(opt => { feedOptions += `<option value="${opt.id}" ${setting.target === opt.id ? 'selected' : ''}>${opt.label}</option>`; });
let plantOptions1 = '', plantOptions2 = '', plantOptions3 = '';
getPlantableOptions().forEach(opt => {
plantOptions1 += `<option value="${opt.id}" ${setting.plantTargets[0] === opt.id ? 'selected' : ''}>${opt.label}</option>`;
plantOptions2 += `<option value="${opt.id}" ${setting.plantTargets[1] === opt.id ? 'selected' : ''}>${opt.label}</option>`;
plantOptions3 += `<option value="${opt.id}" ${setting.plantTargets[2] === opt.id ? 'selected' : ''}>${opt.label}</option>`;
});
let html = `<div class="settings-section"><h3>🤖 ${index + 1}</h3>${!showAdvanced ? `<div style="background:rgba(255,107,0,0.15);border:2px solid #ff6b00;border-radius:10px;padding:10px;margin-bottom:15px;text-align:center;"><div style="color:#ff6b00;font-weight:bold;font-size:14px;"> ${t('advancedLogic')}</div></div>` : `<div style="background:rgba(69,243,255,0.1);border:2px solid #45f3ff;border-radius:10px;padding:8px;margin-bottom:15px;text-align:center;"><div style="color:#45f3ff;font-weight:bold;font-size:13px;">✅ ${t('advancedLogic')}</div></div>`}<div class="settings-row"><label>${t('action')}:</label><select id="manipAction"><option value="none" ${setting.action === 'none' ? 'selected' : ''}>${t('actionIdle')}</option><option value="click_rat" ${setting.action === 'click_rat' ? 'selected' : ''}>${t('actionClickRat')}</option><option value="feed_hamsters" ${setting.action === 'feed_hamsters' ? 'selected' : ''}>${t('actionFeedHamsters')}</option><option value="craft" ${setting.action === 'craft' ? 'selected' : ''}>${t('actionCraft')}</option><option value="grow_plants" ${setting.action === 'grow_plants' ? 'selected' : ''}>${t('actionGrowPlants')}</option><option value="make_fertilizer" ${setting.action === 'make_fertilizer' ? 'selected' : ''}>${t('actionMakeFertilizer')}</option></select></div>${showAdvanced ? `<div class="settings-row" id="intervalRow" style="${setting.action !== 'none' ? '' : 'display:none;'}"><label>${t('interval')}:</label><select id="manipInterval"><option value="5" ${setting.interval === 5 ? 'selected' : ''}>${t('sec5')}</option><option value="10" ${setting.interval === 10 ? 'selected' : ''}>${t('sec10')}</option><option value="30" ${setting.interval === 30 ? 'selected' : ''}>${t('sec30')}</option><option value="60" ${setting.interval === 60 ? 'selected' : ''}>${t('sec60')}</option></select></div>` : ''}<div class="settings-row" id="feedRow" style="${setting.action === 'feed_hamsters' ? '' : 'display:none;'}"><label>${t('feedWith')}:</label><select id="feedTarget">${feedOptions}</select></div>${showAdvanced ? `<div class="settings-row" id="feedConditionRow" style="${setting.action === 'feed_hamsters' ? '' : 'display:none;'}"><label>${t('condition')}:</label><select id="feedCondition"><option value="always" ${setting.condition === 'always' ? 'selected' : ''}>${t('conditionAlways')}</option><option value="below" ${setting.condition === 'below' ? 'selected' : ''}>${t('conditionBelow')}</option><option value="above" ${setting.condition === 'above' ? 'selected' : ''}>${t('conditionAbove')}</option></select></div><div class="settings-row" id="feedThresholdRow" style="${setting.action === 'feed_hamsters' && setting.condition !== 'always' ? '' : 'display:none;'}"><label>${t('threshold')}:</label><input type="number" id="feedThreshold" min="1" max="100" value="${setting.threshold || 20}"></div>` : ''}<div id="growRow" style="${setting.action === 'grow_plants' ? '' : 'display:none;'}"><div class="settings-row"><label>${t('pot1')}:</label><select id="plantTarget1">${plantOptions1}</select></div><div class="settings-row"><label>${t('pot2')}:</label><select id="plantTarget2">${plantOptions2}</select></div><div class="settings-row"><label>${t('pot3')}:</label><select id="plantTarget3">${plantOptions3}</select></div></div>${showAdvanced ? `<div class="settings-row" id="growConditionRow" style="${setting.action === 'grow_plants' ? '' : 'display:none;'}"><label>${t('condition')}:</label><select id="growCondition"><option value="always" ${setting.condition === 'always' ? 'selected' : ''}>${t('conditionAlways')}</option><option value="below" ${setting.condition === 'below' ? 'selected' : ''}>${t('conditionBelow')}</option><option value="above" ${setting.condition === 'above' ? 'selected' : ''}>${t('conditionAbove')}</option></select></div><div class="settings-row" id="growThresholdRow" style="${setting.action === 'grow_plants' && setting.condition !== 'always' ? '' : 'display:none;'}"><label>${t('threshold')}:</label><input type="number" id="growThreshold" min="1" max="100" value="${setting.threshold || 2}"></div>` : ''}${showAdvanced ? `<div class="settings-row" id="fertConditionRow" style="${setting.action === 'make_fertilizer' ? '' : 'display:none;'}"><label>${t('condition')}:</label><select id="fertCondition"><option value="always" ${setting.condition === 'always' ? 'selected' : ''}>${t('conditionAlways')}</option><option value="below" ${setting.condition === 'below' ? 'selected' : ''}>${t('conditionBelow')}</option><option value="above" ${setting.condition === 'above' ? 'selected' : ''}>${t('conditionAbove')}</option></select></div><div class="settings-row" id="fertThresholdRow" style="${setting.action === 'make_fertilizer' && setting.condition !== 'always' ? '' : 'display:none;'}"><label>${t('threshold')}:</label><input type="number" id="fertThreshold" min="1" max="100" value="${setting.threshold || 2}"></div>` : ''}<div class="settings-row" id="craftRow" style="${setting.action === 'craft' ? '' : 'display:none;'}"><label>${t('whatToCraft')}:</label><select id="craftTarget"><option value="gmo_apple" ${setting.target === 'gmo_apple' ? 'selected' : ''}>${t('gmoApple')}</option><option value="rat_food" ${setting.target === 'rat_food' ? 'selected' : ''}>${t('ratFood')}</option><option value="hay" ${setting.target === 'hay' ? 'selected' : ''}>${t('hay')}</option></select></div><button class="settings-save-btn" onclick="saveManipulatorSettings(${index})">${t('save')}</button></div>`;
settingsContent.innerHTML = html;
settingsModal.classList.add('open');
settingsModal.style.display = 'flex';
const actionSelect = document.getElementById('manipAction');
actionSelect.addEventListener('change', function() {
const feedRow = document.getElementById('feedRow'), craftRow = document.getElementById('craftRow'), growRow = document.getElementById('growRow'), feedConditionRow = document.getElementById('feedConditionRow'), feedThresholdRow = document.getElementById('feedThresholdRow'), growConditionRow = document.getElementById('growConditionRow'), growThresholdRow = document.getElementById('growThresholdRow'), fertConditionRow = document.getElementById('fertConditionRow'), fertThresholdRow = document.getElementById('fertThresholdRow'), intervalRow = document.getElementById('intervalRow');
[feedRow, craftRow, growRow, feedConditionRow, feedThresholdRow, growConditionRow, growThresholdRow, fertConditionRow, fertThresholdRow, intervalRow].forEach(el => { if(el) el.style.display = 'none'; });
if (this.value !== 'none' && intervalRow) intervalRow.style.display = '';
if (this.value === 'craft' && craftRow) craftRow.style.display = '';
else if (this.value === 'feed_hamsters') { if (feedRow) feedRow.style.display = ''; if (feedConditionRow) feedConditionRow.style.display = ''; const cond = document.getElementById('feedCondition'); if (cond && cond.value !== 'always' && feedThresholdRow) feedThresholdRow.style.display = ''; }
else if (this.value === 'grow_plants') { if (growRow) growRow.style.display = ''; if (growConditionRow) growConditionRow.style.display = ''; const cond = document.getElementById('growCondition'); if (cond && cond.value !== 'always' && growThresholdRow) growThresholdRow.style.display = ''; }
else if (this.value === 'make_fertilizer') { if (fertConditionRow) fertConditionRow.style.display = ''; const cond = document.getElementById('fertCondition'); if (cond && cond.value !== 'always' && fertThresholdRow) fertThresholdRow.style.display = ''; }
});
const feedCondition = document.getElementById('feedCondition');
if (feedCondition) feedCondition.addEventListener('change', function() { const el = document.getElementById('feedThresholdRow'); if (el) el.style.display = this.value === 'always' ? 'none' : ''; });
const growCondition = document.getElementById('growCondition');
if (growCondition) growCondition.addEventListener('change', function() { const el = document.getElementById('growThresholdRow'); if (el) el.style.display = this.value === 'always' ? 'none' : ''; });
const fertCondition = document.getElementById('fertCondition');
if (fertCondition) fertCondition.addEventListener('change', function() { const el = document.getElementById('fertThresholdRow'); if (el) el.style.display = this.value === 'always' ? 'none' : ''; });
}
window.saveManipulatorSettings = function(index) {
const action = document.getElementById('manipAction').value;
let target = '', condition = 'always', threshold = 20, interval = 5, plantTargets = ['', '', ''];
if (action === 'craft') target = document.getElementById('craftTarget').value;
else if (action === 'feed_hamsters') { target = document.getElementById('feedTarget').value; const condEl = document.getElementById('feedCondition'); if (condEl) condition = condEl.value; const threshEl = document.getElementById('feedThreshold'); if (threshEl) threshold = Math.max(1, Math.min(100, parseInt(threshEl.value) || 20)); }
else if (action === 'grow_plants') { const t1 = document.getElementById('plantTarget1'), t2 = document.getElementById('plantTarget2'), t3 = document.getElementById('plantTarget3'); if (t1) plantTargets[0] = t1.value; if (t2) plantTargets[1] = t2.value; if (t3) plantTargets[2] = t3.value; const condEl = document.getElementById('growCondition'); if (condEl) condition = condEl.value; const threshEl = document.getElementById('growThreshold'); if (threshEl) threshold = Math.max(1, Math.min(100, parseInt(threshEl.value) || 2)); }
else if (action === 'make_fertilizer') { const condEl = document.getElementById('fertCondition'); if (condEl) condition = condEl.value; const threshEl = document.getElementById('fertThreshold'); if (threshEl) threshold = Math.max(1, Math.min(100, parseInt(threshEl.value) || 2)); }
if (advancedLogicPurchased) { const intEl = document.getElementById('manipInterval'); if (intEl) interval = parseInt(intEl.value) || 5; }
manipulatorSettings[index] = { enabled: manipulatorSettings[index]?.enabled || false, action, target, condition, threshold, interval, plantTargets };
localStorage.setItem('rat_manipulatorSettings', JSON.stringify(manipulatorSettings));
saveGame();
updateManipulatorUI();
updateUI();
settingsModal.classList.remove('open');
settingsModal.style.display = 'none';
restartManipulators();
};
function restartManipulators() {
for (let i = 0; i < manipulatorTimers.length; i++) { if (manipulatorTimers[i]) { clearInterval(manipulatorTimers[i]); manipulatorTimers[i] = null; } }
for (let i = 0; i < getManipulatorCount(); i++) { const setting = manipulatorSettings[i]; if (setting && setting.enabled && setting.action !== 'none') startManipulator(i); }
updateAutomationIndicators();
}
function startManipulator(index) {
if (manipulatorTimers[index]) { clearInterval(manipulatorTimers[index]); manipulatorTimers[index] = null; }
const setting = manipulatorSettings[index];
if (!setting || !setting.enabled || setting.action === 'none') return;
let intervalMs = 5000;
if (advancedLogicPurchased && setting.interval) intervalMs = setting.interval * 1000;
manipulatorTimers[index] = setInterval(() => { executeManipulatorAction(index); }, intervalMs);
}

// ============================================================
// ==================== БАФФЫ =================================
// ============================================================
function applyPepperBuff() {
pepperBuffActive = true;
pepperBuffEndTime = Date.now() + PEPPER_BUFF_DURATION;
localStorage.setItem('rat_pepperBuffActive', 'true');
localStorage.setItem('rat_pepperBuffEndTime', pepperBuffEndTime);
if (pepperIndicator) { pepperIndicator.classList.add('active'); pepperIndicator.style.display = 'block'; pepperIndicator.textContent = t('pepperBuff'); }
if (pepperBuffTimer) clearInterval(pepperBuffTimer);
pepperBuffTimer = setInterval(() => {
if (Date.now() >= pepperBuffEndTime) {
pepperBuffActive = false; pepperBuffEndTime = 0;
localStorage.setItem('rat_pepperBuffActive', 'false');
localStorage.setItem('rat_pepperBuffEndTime', 0);
if (pepperIndicator) { pepperIndicator.classList.remove('active'); pepperIndicator.style.display = 'none'; }
clearInterval(pepperBuffTimer); pepperBuffTimer = null;
saveGame(); updateUI();
}
}, 1000);
}
function applyHayBuff() {
hayBuffActive = true;
hayBuffEndTime = Date.now() + HAY_BUFF_DURATION;
localStorage.setItem('rat_hayBuffActive', 'true');
localStorage.setItem('rat_hayBuffEndTime', hayBuffEndTime);
if (hayIndicator) { hayIndicator.classList.add('active'); hayIndicator.style.display = 'block'; hayIndicator.textContent = t('hayBuff'); }
if (hayBuffTimer) clearInterval(hayBuffTimer);
hayBuffTimer = setInterval(() => {
if (Date.now() >= hayBuffEndTime) {
hayBuffActive = false; hayBuffEndTime = 0;
localStorage.setItem('rat_hayBuffActive', 'false');
localStorage.setItem('rat_hayBuffEndTime', 0);
if (hayIndicator) { hayIndicator.classList.remove('active'); hayIndicator.style.display = 'none'; }
clearInterval(hayBuffTimer); hayBuffTimer = null;
saveGame(); updateUI();
}
}, 1000);
}
function applySatietyBuff(duration) {
satietyActive = true;
satietyEndTime = Date.now() + duration;
localStorage.setItem('rat_satietyActive', 'true');
localStorage.setItem('rat_satietyEndTime', satietyEndTime);
enclosureSatiety.classList.add('active');
enclosureSatiety.style.display = 'block';
enclosureSatiety.textContent = t('satietyActive');
if (satietyTimer) clearInterval(satietyTimer);
satietyTimer = setInterval(() => {
if (Date.now() >= satietyEndTime) {
satietyActive = false; satietyEndTime = 0;
localStorage.setItem('rat_satietyActive', 'false');
localStorage.setItem('rat_satietyEndTime', 0);
enclosureSatiety.classList.remove('active');
enclosureSatiety.style.display = 'none';
clearInterval(satietyTimer); satietyTimer = null;
saveGame(); updateUI();
}
}, 1000);
}
function applyFoodEffect(itemId) {
if (itemId === 'grass') hamsterFood = hamsterMaxFood;
else if (itemId === 'pepper') { hamsterFood = hamsterMaxFood; applyPepperBuff(); }
else if (itemId === 'apple') { hamsterFood = hamsterMaxFood; applySatietyBuff(60000); }
else if (itemId === 'cabbage') { hamsterFood = Math.min(hamsterMaxFood, hamsterFood + hamsterMaxFood * 0.5); poopCount += 5; }
else if (itemId === 'hay') { hamsterFood = hamsterMaxFood; applyHayBuff(); }
else if (itemId === 'gmo_apple') { hamsterFood = hamsterMaxFood; applySatietyBuff(150000); }
else if (itemId === 'gmo_apple_extract') { hamsterFood = Math.min(hamsterMaxFood, hamsterFood + hamsterMaxFood * 0.5); applyPepperBuff(); }
else if (itemId === 'rat_food_extract') hamsterFood = hamsterMaxFood;
else if (itemId === 'hay_extract') { hamsterFood = hamsterMaxFood; applyHayBuff(); }
}

// ============================================================
// ==================== ДЕЙСТВИЯ МАНИПУЛЯТОРА =================
// ============================================================
function executeManipulatorAction(index) {
const setting = manipulatorSettings[index];
if (!setting || !setting.enabled) return;
switch (setting.action) {
case 'click_rat':
if (isBanned) return;
const totalPower = getTotalClickPower();
score += totalPower;
saveGame();
updateUI();
const pop = document.createElement('div');
pop.className = 'click-pop' + (buffActive ? ' buffed' : '');
pop.innerText = '+' + totalPower + ' 🤖';
const rect = clickArea.getBoundingClientRect();
pop.style.left = (rect.width / 2 - 30 + Math.random() * 60) + 'px';
pop.style.top = (rect.height / 2 - 50 + Math.random() * 40) + 'px';
clickArea.appendChild(pop);
setTimeout(() => pop.remove(), 500);
ratBody.style.transform = 'scale(0.9) rotate(-3deg)';
setTimeout(() => { ratBody.style.transform = ''; }, 100);
break;
case 'feed_hamsters':
if (!hamsterPurchased || hamsterFood >= hamsterMaxFood) return;
if (setting.condition === 'below' && hamsterFood >= (setting.threshold || 20)) return;
if (setting.condition === 'above' && hamsterFood <= (setting.threshold || 20)) return;
if (setting.target === 'money') {
let cost = getFeedCost();
if (score >= cost) { score -= cost; hamsterFood = Math.min(hamsterMaxFood, hamsterFood + 20); saveGame(); updateUI(); }
} else {
let item = setting.target, hasItem = false;
if (['hay', 'gmo_apple', 'gmo_apple_extract', 'rat_food_extract', 'hay_extract'].includes(item)) { if (inventory[item] > 0) { inventory[item]--; hasItem = true; } }
else if (['grass', 'pepper', 'apple', 'cabbage'].includes(item)) { if (plantInventory[item] > 0) { plantInventory[item]--; hasItem = true; } }
if (hasItem) { applyFoodEffect(item); saveGame(); updateUI(); updateInventoryUI(); }
}
break;
case 'craft':
if (combinerRunning.some(r => r)) return;
if (setting.target === 'gmo_apple') { if (plantInventory.apple < 1 || fertilizerCount < 1) return; combinerSlots = ['apple', 'fertilizer', null]; }
else if (setting.target === 'rat_food') { if (plantInventory.apple < 1 || plantInventory.grass < 1 || plantInventory.pepper < 1) return; combinerSlots = ['apple', 'grass', 'pepper']; }
else if (setting.target === 'hay') { if (plantInventory.grass < 2) return; combinerSlots = ['grass', 'grass', null]; }
else return;
let recipeId = checkRecipe(combinerSlots);
if (recipeId) startCraft(recipeId);
break;
case 'grow_plants':
if (!plantPurchased) return;
const targets = setting.plantTargets || ['', '', ''];
for (let i = 0; i < plantLevel; i++) {
const data = plantData[i];
if (!data) continue;
const targetType = targets[i];
if (data.stage === 'ready' && data.type) {
if (plantInventory[data.type] === undefined) plantInventory[data.type] = 0;
plantInventory[data.type]++;
data.stage = 'idle'; data.progress = 0; data.type = null; data.fertilizer = false;
savePlantData(); saveGame(); updatePlantsUI(); updateUI();
continue;
}
if (!targetType) continue;
const currentCount = plantInventory[targetType] || 0;
let shouldPlant = true;
if (setting.condition === 'below' && currentCount >= (setting.threshold || 2)) shouldPlant = false;
if (setting.condition === 'above' && currentCount <= (setting.threshold || 2)) shouldPlant = false;
if (!data.type && shouldPlant) { data.type = targetType; data.stage = 'growing'; data.progress = 0; data.fertilizer = false; savePlantData(); updatePlantsUI(); startPlantGrowth(i); }
}
break;
case 'make_fertilizer':
if (machineRunning) return;
if (setting.condition === 'below' && fertilizerCount >= (setting.threshold || 2)) return;
if (setting.condition === 'above' && fertilizerCount <= (setting.threshold || 2)) return;
if (labPoopCount >= 7) startMachine();
break;
}
}
function updateAutomationIndicators() {
let ratAutoActive = false, hamsterAutoActive = false, fertilizerAutoActive = false, combinerAutoActive = false, plantsAutoActive = false, manipNum = 0;
for (let i = 0; i < manipulatorLevel; i++) {
const setting = manipulatorSettings[i];
if (!setting || !setting.enabled || setting.action === 'none') continue;
if (setting.action === 'click_rat') { ratAutoActive = true; manipNum = i + 1; }
if (setting.action === 'feed_hamsters') hamsterAutoActive = true;
if (setting.action === 'make_fertilizer') fertilizerAutoActive = true;
if (setting.action === 'craft') combinerAutoActive = true;
if (setting.action === 'grow_plants') plantsAutoActive = true;
}
const ratInd = document.getElementById('ratAutoIndicator'), ratNum = document.getElementById('ratAutoManipNum');
if (ratInd) { if (ratAutoActive) { ratInd.style.display = 'inline-block'; if (ratNum) ratNum.textContent = manipNum; } else ratInd.style.display = 'none'; }
const hamsterBadge = document.getElementById('hamsterAutoBadge'); if (hamsterBadge) hamsterBadge.style.display = hamsterAutoActive ? 'inline-block' : 'none';
const fertBadge = document.getElementById('fertilizerAutoBadge'); if (fertBadge) { if (fertilizerAutoActive) { fertBadge.style.display = 'inline-block'; fertBadge.textContent = t('autoFertilizerBadge'); } else fertBadge.style.display = 'none'; }
const combBadge = document.getElementById('combinerAutoBadge'); if (combBadge) combBadge.style.display = combinerAutoActive ? 'inline-block' : 'none';
const plantsBadge = document.getElementById('plantsAutoBadge'); if (plantsBadge) plantsBadge.style.display = plantsAutoActive ? 'inline-block' : 'none';
}
function useFertilizer() {
if (fertilizerCount <= 0) return;
let availablePlants = [];
for (let i = 0; i < plantData.length; i++) { if (plantData[i].stage === 'idle' || (plantData[i].stage === 'growing' && !plantData[i].fertilizer && plantData[i].type)) availablePlants.push({ index: i }); }
if (availablePlants.length === 0) return;
if (availablePlants.length === 1) { fertilizerCount--; applyFertilizerToPlant(availablePlants[0].index); return; }
let idx = parseInt(prompt(t('selectPotForFertilizer') + ' #1-' + availablePlants.length, '1')) - 1;
if (idx >= 0 && idx < availablePlants.length) { fertilizerCount--; applyFertilizerToPlant(availablePlants[idx].index); }
}
function applyFertilizerToPlant(index) {
const data = plantData[index];
if (!data) return;
if (data.stage === 'idle') data.fertilizer = true;
else if (data.stage === 'growing' && !data.fertilizer) { data.fertilizer = true; if (plantIntervals[index]) { clearInterval(plantIntervals[index]); plantIntervals[index] = null; } startPlantGrowth(index); }
else return;
saveGame(); savePlantData(); updatePlantsUI(); updateUI();
if (labPurchased) updateLabUI();
}

// ============================================================
// ==================== БОССЫ =================================
// ============================================================
function updateBossStatus() {
const statusEl = document.getElementById('capybaraStatus'), fightBtn = document.getElementById('fightCapybaraBtn');
if (!capybaraPurchased) { statusEl.textContent = t('notBought'); statusEl.className = 'boss-status'; fightBtn.disabled = true; fightBtn.textContent = t('fightBtn'); return; }
fightBtn.textContent = t('fightBtn');
if (capybaraCooldown > 0) { let m = Math.floor(capybaraCooldown / 60), s = capybaraCooldown % 60; statusEl.textContent = `${t('cooldown')}: ${m}:${s.toString().padStart(2, '0')}`; statusEl.className = 'boss-status'; fightBtn.disabled = true; }
else if (capybaraDefeated) { statusEl.textContent = t('defeated'); statusEl.className = 'boss-status available'; fightBtn.disabled = true; }
else { statusEl.textContent = t('ready'); statusEl.className = 'boss-status available'; fightBtn.disabled = false; }
}
function startBossCooldownTimer() {
if (bossCooldownInterval) { clearInterval(bossCooldownInterval); bossCooldownInterval = null; }
if (capybaraCooldown <= 0) { if (capybaraDefeated) { capybaraDefeated = false; localStorage.setItem('rat_capybaraDefeated', 'false'); } updateBossStatus(); return; }
bossCooldownInterval = setInterval(() => {
if (capybaraCooldown > 0) { capybaraCooldown--; localStorage.setItem('rat_capybaraCooldown', capybaraCooldown); updateBossStatus(); }
else { clearInterval(bossCooldownInterval); bossCooldownInterval = null; if (capybaraDefeated) { capybaraDefeated = false; localStorage.setItem('rat_capybaraDefeated', 'false'); } updateBossStatus(); }
}, 1000);
}
function startBossFight() {
if (bossFightActive) return;
bossFightActive = true; bossHp = bossMaxHp; bossX = 50; bossDirection = 1;
bossFightModal.classList.add('open'); bossFightModal.style.display = 'flex';
shootBtn.disabled = false; bossTimer.textContent = '⚔️!'; bossTimer.className = 'boss-timer ready';
bossEnemy.style.left = bossX + '%'; updateBossHp();
bossMoveInterval = setInterval(() => { bossX += bossDirection * 1.5; if (bossX > 85 || bossX < 15) bossDirection *= -1; bossEnemy.style.left = bossX + '%'; }, 100);
bossShootInterval = setInterval(() => { if (!bossFightActive) return; const bullet = document.createElement('div'); bullet.className = 'boss-bullet'; bullet.textContent = ''; bullet.style.left = (bossX + Math.random() * 10 - 5) + '%'; bullet.style.top = '20%'; bossBulletsContainer.appendChild(bullet); setTimeout(() => bullet.remove(), 2000); }, 1000);
bossFightInterval = setInterval(() => { if (!bossFightActive) return; const bullets = bossBulletsContainer.querySelectorAll('.boss-bullet'); bullets.forEach(b => { const rect = b.getBoundingClientRect(), ratRect = ratContainer.getBoundingClientRect(); if (rect.left < ratRect.right && rect.right > ratRect.left && rect.top < ratRect.bottom && rect.bottom > ratRect.top) { b.remove(); bossHp -= 5; updateBossHp(); if (bossHp <= 0) bossDefeated(); } }); }, 100);
}
function stopBossFight() {
bossFightActive = false;
if (bossMoveInterval) { clearInterval(bossMoveInterval); bossMoveInterval = null; }
if (bossShootInterval) { clearInterval(bossShootInterval); bossShootInterval = null; }
if (bossFightInterval) { clearInterval(bossFightInterval); bossFightInterval = null; }
bossFightModal.classList.remove('open'); bossFightModal.style.display = 'none';
bossBulletsContainer.innerHTML = '';
}
function shootBoss() {
if (!bossFightActive || !canShoot) return;
canShoot = false; shootBtn.disabled = true;
playerProjectile.style.display = 'block'; playerProjectile.style.left = '50%'; playerProjectile.style.bottom = '10%'; playerProjectile.style.transform = 'translateX(-50%)'; playerProjectile.textContent = '💨';
setTimeout(() => { const projRect = playerProjectile.getBoundingClientRect(), bossRect = bossEnemy.getBoundingClientRect(); if (projRect.left < bossRect.right && projRect.right > bossRect.left && projRect.top < bossRect.bottom && projRect.bottom > bossRect.top) { bossHp -= 15; updateBossHp(); if (bossHp <= 0) bossDefeated(); } playerProjectile.style.display = 'none'; }, 600);
setTimeout(() => { canShoot = true; shootBtn.disabled = false; }, shootCooldown);
}
function updateBossHp() { const percent = Math.max(0, (bossHp / bossMaxHp) * 100); bossHpFill.style.width = percent + '%'; bossHpText.textContent = Math.round(bossHp) + '/' + bossMaxHp; }
function bossDefeated() {
stopBossFight(); capybaraDefeated = true; capybaraCooldown = 600;
localStorage.setItem('rat_capybaraCooldown', capybaraCooldown);
localStorage.setItem('rat_capybaraDefeated', 'true');
if (!inventory.food) inventory.food = 0;
inventory.food++;
saveGame(); updateUI(); startBossCooldownTimer();
}

// ============================================================
// ==================== ИНВЕНТАРЬ =============================
// ============================================================
function updateInventoryUI() {
inventoryGrid.innerHTML = '';
let hasItems = false;
const addItem = (icon, nameKey, count, dataItem) => {
hasItems = true;
const slot = document.createElement('div');
slot.className = 'inventory-slot';
slot.innerHTML = `<div class="item-icon">${icon}</div><div class="item-name">${t(nameKey)}</div><div class="item-count">x${count}</div><button class="use-btn" data-item="${dataItem}">${t('use')}</button>`;
inventoryGrid.appendChild(slot);
};
if (inventory.food > 0) addItem('🍖', 'ratFood', inventory.food, 'food');
if (inventory.gmo_apple > 0) addItem('🍏', 'gmoApple', inventory.gmo_apple, 'gmo_apple');
if (inventory.hay > 0) addItem('', 'hay', inventory.hay, 'hay');
if (inventory.gmo_apple_extract > 0) addItem('🟢', 'gmoAppleExtract', inventory.gmo_apple_extract, 'gmo_apple_extract');
if (inventory.rat_food_extract > 0) addItem('🔴', 'ratFoodExtract', inventory.rat_food_extract, 'rat_food_extract');
if (inventory.hay_extract > 0) addItem('🟡', 'hayExtract', inventory.hay_extract, 'hay_extract');
if (plantInventory.grass > 0) addItem('🌿', 'grass', plantInventory.grass, 'grass');
if (plantInventory.pepper > 0) addItem('🌶️', 'pepper', plantInventory.pepper, 'pepper');
if (plantInventory.apple > 0) addItem('🍎', 'apple', plantInventory.apple, 'apple');
if (plantInventory.cabbage > 0) addItem('🥬', 'cabbage', plantInventory.cabbage, 'cabbage');
if (fertilizerCount > 0) addItem('🧪', 'fertLabel', fertilizerCount, 'fertilizer');
inventoryEmpty.style.display = hasItems ? 'none' : 'block';
document.querySelectorAll('.use-btn').forEach(btn => {
btn.addEventListener('click', function() {
const item = this.dataset.item;
if (item === 'food') useFoodItem();
else if (item === 'gmo_apple') useGmoApple();
else if (item === 'hay') useHayItem();
else if (['grass', 'pepper', 'apple', 'cabbage'].includes(item)) usePlantItem(item);
else if (item === 'fertilizer') useFertilizer();
else if (['gmo_apple_extract', 'rat_food_extract', 'hay_extract'].includes(item)) useExtractItem(item);
});
});
}
function useExtractItem(extractId) {
if (!extractorPurchased) { alert(t('alertExtractNeedExtractor')); return; }
if (inventory[extractId] > 0) { inventory[extractId]--; extractorQueue.push(extractId); extractorProgress.push(0); saveGame(); updateInventoryUI(); updateExtractorUI(); updateUI(); alert(t('alertExtractSent')); }
}
function useFoodItem() {
if (inventory.food <= 0 || buffActive) return;
inventory.food--;
buffActive = true; buffType = 'food'; buffEndTime = Date.now() + 30000;
ratBody.classList.add('buffed');
buffIndicator.style.display = 'block'; buffIndicator.textContent = t('buffActive');
saveGame(); updateUI();
if (buffTimer) clearInterval(buffTimer);
buffTimer = setInterval(() => {
if (Date.now() >= buffEndTime) {
buffActive = false; buffType = null; buffEndTime = 0;
ratBody.classList.remove('buffed'); buffIndicator.style.display = 'none';
localStorage.setItem('rat_buffActive', 'false'); localStorage.setItem('rat_buffEndTime', 0);
clearInterval(buffTimer); buffTimer = null;
saveGame(); updateUI();
}
}, 1000);
updateInventoryUI();
}
function useGmoApple() {
if (inventory.gmo_apple <= 0 || satietyActive) return;
inventory.gmo_apple--;
applySatietyBuff(150000);
saveGame(); updateUI(); updateInventoryUI();
}
function useHayItem() {
if (inventory.hay <= 0 || !hamsterPurchased) return;
inventory.hay--;
hamsterFood = hamsterMaxFood;
applyHayBuff();
saveGame(); updateUI(); updateInventoryUI();
}
function usePlantItem(type) {
if (plantInventory[type] <= 0 || !hamsterPurchased) return;
plantInventory[type]--;
applyFoodEffect(type);
saveGame(); updateUI(); updateInventoryUI();
}

// ============================================================
// ==================== ХОМЯКИ =================================
// ============================================================
function startPoopProduction() {
if (poopTimer) clearInterval(poopTimer);
poopTimer = setInterval(() => {
if (hamsterPurchased && hamsterFood > 0) {
if (Math.random() * 100 < (10 + hamsterLevel * 2)) { poopCount++; saveGame(); updateUI(); }
}
}, 30000);
}
function startHamsterMovement() {
if (hamsterMoveInterval) clearInterval(hamsterMoveInterval);
hamsterMoveInterval = setInterval(() => {
let visibleCount = Math.min(hamsterLevel + 1, 5);
for (let i = 0; i < visibleCount; i++) {
if (Math.random() < 0.3) { hamsterElements[i].classList.add('moving'); setTimeout(() => hamsterElements[i].classList.remove('moving'), 800); }
}
}, 2000);
}
function startFoodDepletion() {
if (foodDepletionInterval) { clearInterval(foodDepletionInterval); foodDepletionInterval = null; }
if (!hamsterPurchased || hamsterFood <= 0 || satietyActive) return;
foodDepletionInterval = setInterval(() => {
if (satietyActive) return;
if (hamsterPurchased && hamsterFood > 0) { hamsterFood = Math.max(0, hamsterFood - (0.3 + (hamsterLevel * 0.12))); saveGame(); updateUI(); }
else if (hamsterFood <= 0) { if (foodDepletionInterval) { clearInterval(foodDepletionInterval); foodDepletionInterval = null; } updateUI(); }
}, 1000);
}
function stopFoodDepletion() { if (foodDepletionInterval) { clearInterval(foodDepletionInterval); foodDepletionInterval = null; } }
function feedHamsters() {
if (!hamsterPurchased || hamsterFood >= hamsterMaxFood) return;
let feedCost = getFeedCost();
if (score < feedCost) return;
score -= feedCost;
hamsterFood = Math.min(hamsterMaxFood, hamsterFood + 20);
saveGame(); updateUI();
if (hamsterFood > 0 && !foodDepletionInterval && !satietyActive) startFoodDepletion();
}

// ============================================================
// ==================== ОБНОВЛЕНИЕ UI =========================
// ============================================================
function updateUI() {
let totalPower = getTotalClickPower();
let currentMaxClick = superGrainPurchased ? 20 : 10;
let hamsterMult = getHamsterBonus();
let feedCost = getFeedCost();
balanceEl.innerText = score + " $RAT";
statsInfo.innerText = `${t('click')}: +${totalPower} | ${t('passive')}: ${autoClickers}${t('perSec')}`;
clickCostEl.innerText = 50 * (clickLevel + 1);
autoCostEl.innerText = 100 * (autoLevel + 1);
clickLevelEl.innerText = clickLevel;
clickMaxLevelEl.innerText = currentMaxClick;
autoLevelEl.innerText = autoLevel;
grainLevelEl.innerText = grainLevel;
grainBaseEl.innerText = grainBase;
grainCostEl.innerText = 1000 * (grainLevel + 1);
grainLevelDisplay.innerText = t('toggleLevel') + ' ' + grainLevel;
superGrainInfo.innerText = t('superGrainBase');
accessoryBonusDisplay.innerText = '+' + getAccessoryBonus() + '%';
buffIndicator.style.display = buffActive ? 'block' : 'none';
if (buffActive) buffIndicator.textContent = t('buffActive');
if (superGrainPurchased) {
if (grainActive && superGrainActive) { superIndicator.textContent = '✅!'; superIndicator.className = 'indicator-text active'; }
else { superIndicator.textContent = t('superIndicatorOff'); superIndicator.className = 'indicator-text'; }
}
if (mousePurchased) {
if (currentGrainElement && mouseActive) { mouseIndicator.textContent = '🎯!'; mouseIndicator.className = 'indicator-text active'; }
else if (mouseActive) { mouseIndicator.textContent = t('mouseIndicatorNoGrain'); mouseIndicator.className = 'indicator-text'; }
else { mouseIndicator.textContent = '❌'; mouseIndicator.className = 'indicator-text'; }
}
if (clickLevel >= currentMaxClick) { buyClickBtn.disabled = true; clickItem.classList.add('disabled'); buyClickBtn.textContent = t('max'); buyClickBtn.style.backgroundColor = '#555'; buyClickBtn.style.color = '#888'; }
else { buyClickBtn.disabled = false; clickItem.classList.remove('disabled'); buyClickBtn.textContent = t('buy'); buyClickBtn.style.backgroundColor = '#45f3ff'; buyClickBtn.style.color = '#0b0c10'; }
if (autoLevel >= MAX_AUTO_LEVEL) { buyAutoBtn.disabled = true; autoItem.classList.add('disabled'); buyAutoBtn.textContent = t('max'); buyAutoBtn.style.backgroundColor = '#555'; buyAutoBtn.style.color = '#888'; }
else { buyAutoBtn.disabled = false; autoItem.classList.remove('disabled'); buyAutoBtn.textContent = t('buy'); buyAutoBtn.style.backgroundColor = '#45f3ff'; buyAutoBtn.style.color = '#0b0c10'; }
if (clickLevel >= currentMaxClick && autoLevel >= 10) {
grainItem.style.display = 'flex';
if (grainPurchased === 0) { buyGrainBtn.disabled = false; grainItem.classList.remove('disabled'); grainCostEl.innerText = 1000; buyGrainBtn.textContent = t('buy'); buyGrainBtn.style.backgroundColor = '#ffd700'; buyGrainBtn.style.color = '#0b0c10'; }
else if (grainLevel >= MAX_GRAIN_LEVEL) { buyGrainBtn.disabled = true; grainItem.classList.add('disabled'); buyGrainBtn.textContent = t('max'); buyGrainBtn.style.backgroundColor = '#555'; buyGrainBtn.style.color = '#888'; }
else { buyGrainBtn.disabled = false; grainItem.classList.remove('disabled'); grainCostEl.innerText = 1000 * (grainLevel + 1); buyGrainBtn.textContent = t('upgrade'); buyGrainBtn.style.backgroundColor = '#45f3ff'; buyGrainBtn.style.color = '#0b0c10'; }
} else { grainItem.style.display = 'none'; grainItem.classList.remove('disabled'); }
if (grainLevel >= MAX_GRAIN_LEVEL) {
superGrainItem.style.display = 'flex';
if (superGrainPurchased) { buySuperGrainBtn.disabled = true; superGrainItem.classList.add('disabled'); superGrainCostEl.innerText = '—'; buySuperGrainBtn.textContent = t('bought'); buySuperGrainBtn.style.backgroundColor = '#555'; buySuperGrainBtn.style.color = '#888'; }
else { buySuperGrainBtn.disabled = false; superGrainItem.classList.remove('disabled'); buySuperGrainBtn.textContent = t('buy'); buySuperGrainBtn.style.backgroundColor = '#ff007f'; buySuperGrainBtn.style.color = 'white'; superGrainCostEl.innerText = '10000'; }
} else { superGrainItem.style.display = 'none'; superGrainItem.classList.remove('disabled'); }
if (superGrainPurchased) {
mouseShopItem.style.display = 'flex';
if (mousePurchased) { buyMouseShopBtn.disabled = true; mouseShopItem.classList.add('disabled'); mouseShopCostEl.innerText = '—'; buyMouseShopBtn.textContent = t('bought'); buyMouseShopBtn.style.backgroundColor = '#555'; buyMouseShopBtn.style.color = '#888'; }
else { buyMouseShopBtn.disabled = false; mouseShopItem.classList.remove('disabled'); buyMouseShopBtn.textContent = t('buy'); buyMouseShopBtn.style.backgroundColor = '#66fcf1'; buyMouseShopBtn.style.color = '#0b0c10'; mouseShopCostEl.innerText = '15000'; }
} else { mouseShopItem.style.display = 'none'; mouseShopItem.classList.remove('disabled'); }
if (mousePurchased) {
hamsterShopItem.style.display = 'flex';
if (hamsterPurchased) { buyHamsterShopBtn.disabled = true; hamsterShopItem.classList.add('disabled'); hamsterShopCostEl.innerText = '—'; buyHamsterShopBtn.textContent = t('bought'); buyHamsterShopBtn.style.backgroundColor = '#555'; buyHamsterShopBtn.style.color = '#888'; }
else { buyHamsterShopBtn.disabled = false; hamsterShopItem.classList.remove('disabled'); buyHamsterShopBtn.textContent = t('buy'); buyHamsterShopBtn.style.backgroundColor = '#ffd700'; buyHamsterShopBtn.style.color = '#0b0c10'; hamsterShopCostEl.innerText = '20000'; }
} else { hamsterShopItem.style.display = 'none'; hamsterShopItem.classList.remove('disabled'); }
if (hamsterPurchased) {
hamsterUpgradeShopItem.style.display = 'flex';
if (hamsterLevel >= MAX_HAMSTER_LEVEL) { buyHamsterUpgradeBtn.disabled = true; hamsterUpgradeShopItem.classList.add('disabled'); hamsterUpgradeCostEl.innerText = '—'; buyHamsterUpgradeBtn.textContent = t('max'); buyHamsterUpgradeBtn.style.backgroundColor = '#555'; buyHamsterUpgradeBtn.style.color = '#888'; }
else { buyHamsterUpgradeBtn.disabled = false; hamsterUpgradeShopItem.classList.remove('disabled'); buyHamsterUpgradeBtn.textContent = t('upgrade'); buyHamsterUpgradeBtn.style.backgroundColor = '#66fcf1'; buyHamsterUpgradeBtn.style.color = '#0b0c10'; hamsterUpgradeCostEl.innerText = hamsterUpgradeCost; }
hamsterUpgradeLevelEl.innerText = hamsterLevel + '/' + MAX_HAMSTER_LEVEL;
hamsterUpgradeCurrentBonusEl.innerText = 'x' + getHamsterBonus().toFixed(1);
} else { hamsterUpgradeShopItem.style.display = 'none'; hamsterUpgradeShopItem.classList.remove('disabled'); }
if (autoLevel >= 10) {
bossMenuShopItem.style.display = 'flex';
if (bossMenuPurchased) { buyBossMenuBtn.disabled = true; bossMenuShopItem.classList.add('disabled'); bossMenuCostEl.innerText = '—'; buyBossMenuBtn.textContent = t('bought'); buyBossMenuBtn.style.backgroundColor = '#555'; buyBossMenuBtn.style.color = '#888'; }
else { buyBossMenuBtn.disabled = false; bossMenuShopItem.classList.remove('disabled'); buyBossMenuBtn.textContent = t('buy'); buyBossMenuBtn.style.backgroundColor = '#ff0033'; buyBossMenuBtn.style.color = 'white'; bossMenuCostEl.innerText = '50000'; }
} else { bossMenuShopItem.style.display = 'none'; bossMenuShopItem.classList.remove('disabled'); }
if (bossMenuPurchased) {
capybaraShopItem.style.display = 'flex';
if (capybaraPurchased) { buyCapybaraBtn.disabled = true; capybaraShopItem.classList.add('disabled'); capybaraCostEl.innerText = '—'; buyCapybaraBtn.textContent = t('bought'); buyCapybaraBtn.style.backgroundColor = '#555'; buyCapybaraBtn.style.color = '#888'; }
else { buyCapybaraBtn.disabled = false; capybaraShopItem.classList.remove('disabled'); buyCapybaraBtn.textContent = t('buy'); buyCapybaraBtn.style.backgroundColor = '#8B6B3D'; buyCapybaraBtn.style.color = 'white'; capybaraCostEl.innerText = '100000'; }
} else { capybaraShopItem.style.display = 'none'; capybaraShopItem.classList.remove('disabled'); }
if (autoLevel >= 10 && mousePurchased && hamsterPurchased && hamsterLevel >= 1) {
plantShopItem.style.display = 'flex';
if (plantPurchased) { buyPlantBtn.disabled = true; plantShopItem.classList.add('disabled'); plantShopCostEl.innerText = '—'; buyPlantBtn.textContent = t('bought'); buyPlantBtn.style.backgroundColor = '#555'; buyPlantBtn.style.color = '#888'; }
else { buyPlantBtn.disabled = false; plantShopItem.classList.remove('disabled'); buyPlantBtn.textContent = t('buy'); buyPlantBtn.style.backgroundColor = '#45f3ff'; buyPlantBtn.style.color = '#0b0c10'; plantShopCostEl.innerText = '30000'; }
} else { plantShopItem.style.display = 'none'; plantShopItem.classList.remove('disabled'); }
if (plantPurchased && plantLevel === 1 && !plantUpgrade1) { plantUpgrade1ShopItem.style.display = 'flex'; buyPlantUpgrade1Btn.disabled = false; plantUpgrade1ShopItem.classList.remove('disabled'); plantUpgrade1CostEl.innerText = '50000'; buyPlantUpgrade1Btn.textContent = t('buy'); buyPlantUpgrade1Btn.style.backgroundColor = '#66fcf1'; buyPlantUpgrade1Btn.style.color = '#0b0c10'; }
else if (plantUpgrade1) { plantUpgrade1ShopItem.style.display = 'flex'; buyPlantUpgrade1Btn.disabled = true; plantUpgrade1ShopItem.classList.add('disabled'); plantUpgrade1CostEl.innerText = '—'; buyPlantUpgrade1Btn.textContent = t('bought'); buyPlantUpgrade1Btn.style.backgroundColor = '#555'; buyPlantUpgrade1Btn.style.color = '#888'; }
else { plantUpgrade1ShopItem.style.display = 'none'; plantUpgrade1ShopItem.classList.remove('disabled'); }
if (plantUpgrade1 && plantLevel === 2 && !plantUpgrade2) { plantUpgrade2ShopItem.style.display = 'flex'; buyPlantUpgrade2Btn.disabled = false; plantUpgrade2ShopItem.classList.remove('disabled'); plantUpgrade2CostEl.innerText = '70000'; buyPlantUpgrade2Btn.textContent = t('buy'); buyPlantUpgrade2Btn.style.backgroundColor = '#ffd700'; buyPlantUpgrade2Btn.style.color = '#0b0c10'; }
else if (plantUpgrade2) { plantUpgrade2ShopItem.style.display = 'flex'; buyPlantUpgrade2Btn.disabled = true; plantUpgrade2ShopItem.classList.add('disabled'); plantUpgrade2CostEl.innerText = '—'; buyPlantUpgrade2Btn.textContent = t('max'); buyPlantUpgrade2Btn.style.backgroundColor = '#555'; buyPlantUpgrade2Btn.style.color = '#888'; }
else { plantUpgrade2ShopItem.style.display = 'none'; plantUpgrade2ShopItem.classList.remove('disabled'); }
if (plantLevel >= 1) {
const types = [
{ id: 'grass', item: plantTypeGrassItem, btn: buyPlantTypeGrassBtn, cost: plantTypeGrassCostEl, purchased: plantTypeGrass, price: 10000, color: '#45f3ff', textColor: '#0b0c10' },
{ id: 'pepper', item: plantTypePepperItem, btn: buyPlantTypePepperBtn, cost: plantTypePepperCostEl, purchased: plantTypePepper, price: 25000, color: '#ff4444', textColor: 'white' },
{ id: 'apple', item: plantTypeAppleItem, btn: buyPlantTypeAppleBtn, cost: plantTypeAppleCostEl, purchased: plantTypeApple, price: 40000, color: '#ff6b6b', textColor: 'white' },
{ id: 'cabbage', item: plantTypeCabbageItem, btn: buyPlantTypeCabbageBtn, cost: plantTypeCabbageCostEl, purchased: plantTypeCabbage, price: 15000, color: '#45f3ff', textColor: '#0b0c10' }
];
types.forEach(t2 => {
if (!t2.purchased) { t2.item.style.display = 'flex'; t2.item.classList.remove('disabled'); t2.cost.innerText = t2.price; t2.btn.textContent = t('buy'); t2.btn.disabled = false; t2.btn.style.backgroundColor = t2.color; t2.btn.style.color = t2.textColor; }
else { t2.item.style.display = 'flex'; t2.item.classList.add('disabled'); t2.cost.innerText = '—'; t2.btn.textContent = t('bought'); t2.btn.disabled = true; t2.btn.style.backgroundColor = '#555'; t2.btn.style.color = '#888'; }
});
} else { plantTypeGrassItem.style.display = 'none'; plantTypePepperItem.style.display = 'none'; plantTypeAppleItem.style.display = 'none'; plantTypeCabbageItem.style.display = 'none'; }
const allPlantsBought = plantPurchased && plantUpgrade1 && plantUpgrade2 && plantTypeGrass && plantTypePepper && plantTypeApple && plantTypeCabbage;
if (allPlantsBought) {
labShopItem.style.display = 'flex';
if (labPurchased) { buyLabBtn.disabled = true; labShopItem.classList.add('disabled'); labShopCostEl.innerText = '—'; buyLabBtn.textContent = t('bought'); buyLabBtn.style.backgroundColor = '#555'; buyLabBtn.style.color = '#888'; }
else { buyLabBtn.disabled = false; labShopItem.classList.remove('disabled'); buyLabBtn.textContent = t('buy'); buyLabBtn.style.backgroundColor = '#9b59b6'; buyLabBtn.style.color = 'white'; labShopCostEl.innerText = '50000'; }
} else { labShopItem.style.display = 'none'; labShopItem.classList.remove('disabled'); }
if (labPurchased) {
combinerShopItem.style.display = 'flex';
if (combinerPurchased) { buyCombinerBtn.disabled = true; combinerShopItem.classList.add('disabled'); combinerShopCostEl.innerText = '—'; buyCombinerBtn.textContent = t('bought'); buyCombinerBtn.style.backgroundColor = '#555'; buyCombinerBtn.style.color = '#888'; }
else { buyCombinerBtn.disabled = false; combinerShopItem.classList.remove('disabled'); buyCombinerBtn.textContent = t('buy'); buyCombinerBtn.style.backgroundColor = '#ff6b00'; buyCombinerBtn.style.color = 'white'; combinerShopCostEl.innerText = '30000'; }
} else { combinerShopItem.style.display = 'none'; combinerShopItem.classList.remove('disabled'); }
if (combinerPurchased) {
combinerUpgradeShopItem.style.display = 'flex';
if (combinerLevel >= 1) { buyCombinerUpgradeBtn.disabled = true; combinerUpgradeShopItem.classList.add('disabled'); combinerUpgradeCostEl.innerText = '—'; buyCombinerUpgradeBtn.textContent = t('max'); buyCombinerUpgradeBtn.style.backgroundColor = '#555'; buyCombinerUpgradeBtn.style.color = '#888'; combinerLevelEl.innerText = t('combinerLevel2'); }
else { buyCombinerUpgradeBtn.disabled = false; combinerUpgradeShopItem.classList.remove('disabled'); buyCombinerUpgradeBtn.textContent = t('upgrade'); buyCombinerUpgradeBtn.style.backgroundColor = '#ff6b00'; buyCombinerUpgradeBtn.style.color = 'white'; combinerUpgradeCostEl.innerText = '60000'; combinerLevelEl.innerText = t('combinerLevel1'); }
} else { combinerUpgradeShopItem.style.display = 'none'; combinerUpgradeShopItem.classList.remove('disabled'); }
if (combinerPurchased) {
extractorShopItem.style.display = 'flex';
if (extractorPurchased) { buyExtractorBtn.disabled = true; extractorShopItem.classList.add('disabled'); extractorShopCostEl.innerText = '—'; buyExtractorBtn.textContent = t('bought'); buyExtractorBtn.style.backgroundColor = '#555'; buyExtractorBtn.style.color = '#888'; }
else { buyExtractorBtn.disabled = false; extractorShopItem.classList.remove('disabled'); buyExtractorBtn.textContent = t('buy'); buyExtractorBtn.style.backgroundColor = '#45f3ff'; buyExtractorBtn.style.color = '#0b0c10'; extractorShopCostEl.innerText = '20000'; }
} else { extractorShopItem.style.display = 'none'; extractorShopItem.classList.remove('disabled'); }
if (isAllLabPartsBought()) {
manipulatorShopItem.style.display = 'flex';
if (manipulatorLevel >= 3) { buyManipulatorBtn.disabled = true; manipulatorShopItem.classList.add('disabled'); manipulatorShopCostEl.innerText = '—'; buyManipulatorBtn.textContent = t('max'); buyManipulatorBtn.style.backgroundColor = '#555'; buyManipulatorBtn.style.color = '#888'; manipulatorLevelEl.innerText = '3/3 🤖'; }
else { buyManipulatorBtn.disabled = false; manipulatorShopItem.classList.remove('disabled'); buyManipulatorBtn.textContent = t('buy'); buyManipulatorBtn.style.backgroundColor = '#ffd700'; buyManipulatorBtn.style.color = '#0b0c10'; manipulatorShopCostEl.innerText = '10000'; manipulatorLevelEl.innerText = manipulatorLevel + '/3 🤖'; }
} else { manipulatorShopItem.style.display = 'none'; manipulatorShopItem.classList.remove('disabled'); }
if (advancedLogicShopItem) {
if (manipulatorLevel >= 1) {
advancedLogicShopItem.style.display = 'flex';
if (advancedLogicPurchased) { if (buyAdvancedLogicBtn) { buyAdvancedLogicBtn.disabled = true; advancedLogicShopItem.classList.add('disabled'); if (advancedLogicCostEl) advancedLogicCostEl.innerText = '—'; buyAdvancedLogicBtn.textContent = t('bought'); buyAdvancedLogicBtn.style.backgroundColor = '#555'; buyAdvancedLogicBtn.style.color = '#888'; } }
else { if (buyAdvancedLogicBtn) { buyAdvancedLogicBtn.disabled = false; advancedLogicShopItem.classList.remove('disabled'); buyAdvancedLogicBtn.textContent = t('buy'); buyAdvancedLogicBtn.style.backgroundColor = '#45f3ff'; buyAdvancedLogicBtn.style.color = '#0b0c10'; if (advancedLogicCostEl) advancedLogicCostEl.innerText = '20000'; } }
} else { advancedLogicShopItem.style.display = 'none'; advancedLogicShopItem.classList.remove('disabled'); }
}
updateManipulatorUI();
if (labPurchased) { openLabBtn.classList.add('visible'); openLabBtn.style.display = 'block'; }
else { openLabBtn.classList.remove('visible'); openLabBtn.style.display = 'none'; }
if (labPurchased && hamsterPurchased) { poopBtn.style.display = 'block'; poopBtn.classList.add('visible'); poopBtn.textContent = t('collectPoop') + ' (' + poopCount + ')'; poopBtn.disabled = (poopCount <= 0); }
else { poopBtn.style.display = 'none'; poopBtn.classList.remove('visible'); poopBtn.textContent = t('collectPoop') + ' (0)'; poopBtn.disabled = true; }
if (bossMenuPurchased) { bossSkull.style.display = 'flex'; bossSkull.classList.add('visible'); bossSkull.style.pointerEvents = 'auto'; bossSkull.style.zIndex = '50'; }
else { bossSkull.style.display = 'none'; bossSkull.classList.remove('visible'); }
updateBossStatus();
if (grainPurchased > 0) {
grainBox.classList.add('visible');
if (grainActive) { grainToggle.classList.add('active'); grainStatus.innerText = t('toggleOn'); }
else { grainToggle.classList.remove('active'); grainStatus.innerText = t('toggleOff'); }
} else { grainBox.classList.remove('visible'); }
if (superGrainPurchased) {
superGrainBox.style.display = 'flex';
if (superGrainActive) { superGrainToggle.classList.add('active'); superGrainStatus.innerText = t('toggleOn'); }
else { superGrainToggle.classList.remove('active'); superGrainStatus.innerText = t('toggleOff'); }
} else { superGrainBox.style.display = 'none'; }
if (mousePurchased) {
mouseBox.style.display = 'flex';
if (mouseActive) { mouseToggle.classList.add('active'); mouseStatus.innerText = t('toggleOn'); }
else { mouseToggle.classList.remove('active'); mouseStatus.innerText = t('toggleOff'); }
} else { mouseBox.style.display = 'none'; }
if (hamsterPurchased) {
enclosure.style.display = 'flex'; enclosure.classList.add('visible');
if (hamsterFood > 0 && !foodDepletionInterval && !satietyActive) startFoodDepletion();
if (satietyActive) { enclosureSatiety.classList.add('active'); enclosureSatiety.style.display = 'block'; enclosureSatiety.textContent = t('satietyActive'); }
if (pepperBuffActive && pepperIndicator) { pepperIndicator.classList.add('active'); pepperIndicator.style.display = 'block'; pepperIndicator.textContent = t('pepperBuff'); }
if (hayBuffActive && hayIndicator) { hayIndicator.classList.add('active'); hayIndicator.style.display = 'block'; hayIndicator.textContent = t('hayBuff'); }
if (hamsterFood > 0) { enclosureStatus.textContent = t('fed'); enclosureStatus.className = 'enclosure-status fed'; }
else { enclosureStatus.textContent = t('hungry'); enclosureStatus.className = 'enclosure-status'; if (foodDepletionInterval) stopFoodDepletion(); }
let percent = (hamsterFood / hamsterMaxFood) * 100;
foodBarFill.style.width = Math.min(100, percent) + '%';
foodBarText.innerText = Math.round(percent) + '%';
feedBtn.disabled = !(hamsterFood < hamsterMaxFood && score >= feedCost);
feedBtn.textContent = t('feed') + ' (' + feedCost + ')';
if (hamsterFood > 0) { enclosureBonus.textContent = t('bonusLabel') + ': x' + hamsterMult.toFixed(1); enclosureBonus.className = 'enclosure-bonus active'; }
else { enclosureBonus.textContent = t('bonusLabel') + ': x1.0 ' + t('feedToActivate'); enclosureBonus.className = 'enclosure-bonus'; }
let visibleCount = Math.min(hamsterLevel + 1, 5);
for (let i = 0; i < hamsterElements.length; i++) {
if (i < visibleCount) { hamsterElements[i].style.display = 'block'; hamsterElements[i].classList.add('visible'); }
else { hamsterElements[i].style.display = 'none'; hamsterElements[i].classList.remove('visible'); }
}
} else { enclosure.style.display = 'none'; enclosure.classList.remove('visible'); }
updatePlantsUI();
document.querySelectorAll('.accessory-item').forEach(item => {
const acc = item.dataset.accessory;
const btn = item.querySelector('.equip-btn');
const isOwned = ownedAccessories.includes(acc);
const isEquipped = equippedAccessory === acc;
if (isOwned) { btn.disabled = false; btn.innerText = isEquipped ? t('remove') : t('wear'); if (isEquipped) btn.classList.add('equipped'); else btn.classList.remove('equipped'); }
else { btn.disabled = false; btn.innerText = t('buy'); btn.classList.remove('equipped'); }
});
updateRatAccessories();
updateInventoryUI();
if (labPurchased) updateLabUI();
if (combinerPurchased) updateCombinerUI();
if (extractorPurchased) updateExtractorUI();
openCombinerBtn.style.display = combinerPurchased ? 'block' : 'none';
if (combinerPurchased) openCombinerBtn.classList.add('visible');
else openCombinerBtn.classList.remove('visible');
openExtractorBtn.style.display = extractorPurchased ? 'block' : 'none';
if (extractorPurchased) openExtractorBtn.classList.add('visible');
else openExtractorBtn.classList.remove('visible');
updateAutomationIndicators();
}
function updateRatAccessories() {
accHat.style.display = 'none'; accGlasses.style.display = 'none'; accSword.style.display = 'none'; accCrown.style.display = 'none';
if (equippedAccessory === 'hat') accHat.style.display = 'block';
else if (equippedAccessory === 'glasses') accGlasses.style.display = 'block';
else if (equippedAccessory === 'sword') accSword.style.display = 'block';
else if (equippedAccessory === 'crown') accCrown.style.display = 'block';
}

// ============================================================
// ==================== ВОССТАНОВЛЕНИЕ ========================
// ============================================================
function restartCombinerTimer(slotIndex) {
if (combinerTimer[slotIndex]) clearInterval(combinerTimer[slotIndex]);
const recipeId = combinerRecipes[slotIndex];
const recipe = recipeId ? COMBINER_RECIPES[recipeId] : null;
const timePerTick = recipe ? (100 / recipe.time) : (100 / 300);
combinerTimer[slotIndex] = setInterval(() => {
combinerProgress[slotIndex] += timePerTick;
if (combinerProgress[slotIndex] >= 100) {
combinerProgress[slotIndex] = 100;
clearInterval(combinerTimer[slotIndex]);
combinerTimer[slotIndex] = null;
const currentRecipeId = combinerRecipes[slotIndex];
const currentRecipe = currentRecipeId ? COMBINER_RECIPES[currentRecipeId] : null;
if (currentRecipe) {
const result = currentRecipe.result;
if (inventory[result] === undefined) inventory[result] = 0;
inventory[result]++;
saveGame();
updateInventoryUI();
}
combinerRunning[slotIndex] = false;
combinerProgress[slotIndex] = 0;
combinerRecipes[slotIndex] = null;
saveGame();
updateCombinerUI();
updateUI();
}
saveGame();
updateCombinerUI();
}, 1000);
}
function restoreGameState() {
console.log('🔄 Восстановление состояния игры...');
if (grainPurchased > 0 && grainActive) {
if (grainSpawnTimeout) clearTimeout(grainSpawnTimeout);
const useSuper = shouldSpawnSuper();
const delay = useSuper ? SUPER_GRAIN_SPAWN_MIN + Math.random() * (SUPER_GRAIN_SPAWN_MAX - SUPER_GRAIN_SPAWN_MIN) : GRAIN_SPAWN_MIN + Math.random() * (GRAIN_SPAWN_MAX - GRAIN_SPAWN_MIN);
grainSpawnTimeout = setTimeout(spawnGrain, delay);
console.log(' Зерно восстановлено');
}
if (mousePurchased && mouseActive) {
if (mouseElement) { mouseElement.remove(); mouseElement = null; }
createMouse();
if (mouseMoveInterval) clearInterval(mouseMoveInterval);
mouseMoveInterval = setInterval(moveMouseToTarget, 50);
console.log('🐁 Мышь восстановлена');
}
if (hamsterPurchased) {
startHamsterMovement();
startPoopProduction();
if (hamsterFood > 0 && !satietyActive) startFoodDepletion();
console.log('🐹 Хомяки восстановлены');
}
if (buffActive && buffEndTime > 0) {
const timeLeft = buffEndTime - Date.now();
if (timeLeft > 0) {
ratBody.classList.add('buffed');
buffIndicator.style.display = 'block';
buffIndicator.textContent = t('buffActive');
if (buffTimer) clearInterval(buffTimer);
buffTimer = setInterval(() => {
if (Date.now() >= buffEndTime) {
buffActive = false; buffEndTime = 0;
ratBody.classList.remove('buffed');
buffIndicator.style.display = 'none';
localStorage.setItem('rat_buffActive', 'false');
clearInterval(buffTimer); buffTimer = null;
saveGame(); updateUI();
}
}, 1000);
console.log('⚡ Бафф восстановлен');
} else { buffActive = false; buffEndTime = 0; }
}
if (pepperBuffActive && pepperBuffEndTime > 0) {
const timeLeft = pepperBuffEndTime - Date.now();
if (timeLeft > 0) {
if (pepperIndicator) { pepperIndicator.style.display = 'block'; pepperIndicator.textContent = t('pepperBuff'); }
if (pepperBuffTimer) clearInterval(pepperBuffTimer);
pepperBuffTimer = setInterval(() => {
if (Date.now() >= pepperBuffEndTime) {
pepperBuffActive = false; pepperBuffEndTime = 0;
if (pepperIndicator) pepperIndicator.style.display = 'none';
clearInterval(pepperBuffTimer); pepperBuffTimer = null;
saveGame(); updateUI();
}
}, 1000);
console.log('️ Перцовый бафф восстановлен');
} else { pepperBuffActive = false; pepperBuffEndTime = 0; }
}
if (hayBuffActive && hayBuffEndTime > 0) {
const timeLeft = hayBuffEndTime - Date.now();
if (timeLeft > 0) {
if (hayIndicator) { hayIndicator.style.display = 'block'; hayIndicator.textContent = t('hayBuff'); }
if (hayBuffTimer) clearInterval(hayBuffTimer);
hayBuffTimer = setInterval(() => {
if (Date.now() >= hayBuffEndTime) {
hayBuffActive = false; hayBuffEndTime = 0;
if (hayIndicator) hayIndicator.style.display = 'none';
clearInterval(hayBuffTimer); hayBuffTimer = null;
saveGame(); updateUI();
}
}, 1000);
console.log(' Сенной бафф восстановлен');
} else { hayBuffActive = false; hayBuffEndTime = 0; }
}
if (satietyActive && satietyEndTime > 0) {
const timeLeft = satietyEndTime - Date.now();
if (timeLeft > 0) {
enclosureSatiety.classList.add('active');
enclosureSatiety.style.display = 'block';
enclosureSatiety.textContent = t('satietyActive');
if (satietyTimer) clearInterval(satietyTimer);
satietyTimer = setInterval(() => {
if (Date.now() >= satietyEndTime) {
satietyActive = false; satietyEndTime = 0;
enclosureSatiety.classList.remove('active');
enclosureSatiety.style.display = 'none';
clearInterval(satietyTimer); satietyTimer = null;
saveGame(); updateUI();
}
}, 1000);
console.log('🍽️ Сытость восстановлена');
} else { satietyActive = false; satietyEndTime = 0; }
}
if (labPurchased && machineRunning) {
const maxTime = getMachineTime();
if (machineProgress >= maxTime) {
machineRunning = false;
updateLabUI();
saveGame();
console.log('️ Станок завершён');
} else {
restartMachineTimer(maxTime);
console.log('⚗️ Станок восстановлен, прогресс: ' + Math.round(machineProgress) + '/' + maxTime);
}
}
if (combinerPurchased) {
for (let i = 0; i < combinerRunning.length; i++) {
if (combinerRunning[i] && combinerProgress[i] < 100) {
restartCombinerTimer(i);
console.log('🧪 Комбинатор слот ' + i + ' восстановлен, прогресс: ' + Math.round(combinerProgress[i]) + '%');
}
else if (combinerRunning[i] && combinerProgress[i] >= 100) {
combinerRunning[i] = false;
combinerProgress[i] = 0;
combinerRecipes[i] = null;
}
}
saveGame();
}
if (extractorPurchased && extractorQueue.length > 0 && !extractorTimer) {
startExtractorProcessing();
console.log('️ Экстрактор восстановлен, очередь: ' + extractorQueue.length);
}
if (manipulatorPurchased && manipulatorLevel > 0) {
for (let i = 0; i < manipulatorLevel; i++) {
if (!manipulatorSettings[i]) {
manipulatorSettings[i] = { enabled: false, action: 'none', target: '', condition: 'always', threshold: 20, interval: 5, plantTargets: ['', '', ''] };
}
if (!manipulatorSettings[i].plantTargets) {
manipulatorSettings[i].plantTargets = ['', '', ''];
}
}
restartManipulators();
console.log(' Манипуляторы восстановлены');
}
if (plantPurchased) {
for (let i = 0; i < plantData.length; i++) {
if (plantData[i].stage === 'growing' && plantData[i].type) {
startPlantGrowth(i);
console.log('🌱 Растение ' + i + ' восстановлено, тип: ' + plantData[i].type + ', прогресс: ' + Math.round(plantData[i].progress) + '%');
}
}
}
updateUI();
console.log('✅ Восстановление завершено');
}

// ============================================================
// ==================== СБРОС =================================
// ============================================================
function resetAllProgress() {
score = 0; clickPower = 1; autoClickers = 0; clickLevel = 0; autoLevel = 0;
grainLevel = 0; grainBase = 3; grainActive = false;
ownedAccessories = []; equippedAccessory = null; grainPurchased = 0;
superGrainPurchased = false; superGrainActive = false;
mousePurchased = false; mouseActive = false;
hamsterPurchased = false; hamsterLevel = 0; hamsterFood = 0;
bossMenuPurchased = false; capybaraPurchased = false; capybaraCooldown = 0; capybaraDefeated = false;
inventory = { food: 0, gmo_apple: 0, hay: 0, gmo_apple_extract: 0, rat_food_extract: 0, hay_extract: 0 };
buffActive = false; buffType = null; buffEndTime = 0;
pepperBuffActive = false; pepperBuffEndTime = 0;
hayBuffActive = false; hayBuffEndTime = 0;
satietyActive = false; satietyEndTime = 0;
plantPurchased = false; plantLevel = 0; plantUpgrade1 = false; plantUpgrade2 = false;
plantTypeGrass = false; plantTypePepper = false; plantTypeApple = false; plantTypeCabbage = false;
plantInventory = { grass: 0, pepper: 0, apple: 0, cabbage: 0 };
plantData = [{ stage: 'idle', progress: 0, type: null, fertilizer: false }, { stage: 'idle', progress: 0, type: null, fertilizer: false }, { stage: 'idle', progress: 0, type: null, fertilizer: false }];
poopCount = 0; labPoopCount = 0; labPurchased = false;
machineLevel = 0; machineProgress = 0; machineRunning = false; fertilizerCount = 0;
combinerPurchased = false; combinerLevel = 0;
combinerSlots = [null, null, null]; combinerRunning = [false, false, false];
combinerProgress = [0, 0, 0]; combinerRecipes = [null, null, null];
extractorPurchased = false; extractorQueue = []; extractorProgress = [];
manipulatorPurchased = false; manipulatorLevel = 0; advancedLogicPurchased = false;
manipulatorSettings = [{ enabled: false, action: 'none', target: '', condition: 'always', threshold: 20, interval: 5, plantTargets: ['', '', ''] }, { enabled: false, action: 'none', target: '', condition: 'always', threshold: 20, interval: 5, plantTargets: ['', '', ''] }, { enabled: false, action: 'none', target: '', condition: 'always', threshold: 20, interval: 5, plantTargets: ['', '', ''] }];
MAX_CLICK_LEVEL = 10;
clearAllIntervals();
AntiCheat.stop();
localStorage.clear();
saveGame();
savePlantData();
updateUI();
currentCode = generateCode();
codeDisplay.textContent = currentCode;
codeInput.value = '';
confirmBox.classList.remove('show');
confirmResetBtn.disabled = true;
resetStatus.textContent = '✅';
resetStatus.style.color = '#45f3ff';
setTimeout(() => {
resetModal.classList.remove('open');
resetStatus.textContent = '';
showReloadNotification();
}, 500);
}
function clearAllIntervals() {
const intervals = [grainSpawnTimeout, grainTimerInterval, grainLifeTimeout, mouseMoveInterval, hamsterMoveInterval, foodDepletionInterval, reloadTimerInterval, poopTimer, machineTimer, bossMoveInterval, bossShootInterval, bossCooldownInterval, bossFightInterval, buffTimer, pepperBuffTimer, hayBuffTimer, satietyTimer, ...combinerTimer, extractorTimer, ...manipulatorTimers, ...plantIntervals];
intervals.forEach(interval => { if (interval) { clearInterval(interval); clearTimeout(interval); } });
for (let i = 0; i < combinerTimer.length; i++) { combinerTimer[i] = null; combinerRunning[i] = false; combinerProgress[i] = 0; combinerRecipes[i] = null; }
for (let i = 0; i < manipulatorTimers.length; i++) manipulatorTimers[i] = null;
for (let i = 0; i < plantIntervals.length; i++) plantIntervals[i] = null;
}
function showReloadNotification() {
reloadTimerSeconds = 10;
timerNumber.textContent = reloadTimerSeconds;
reloadBtn.disabled = true;
reloadBtn.textContent = '...';
reloadNotification.classList.add('open');
if (reloadTimerInterval) clearInterval(reloadTimerInterval);
reloadTimerInterval = setInterval(() => {
reloadTimerSeconds--;
timerNumber.textContent = reloadTimerSeconds;
if (reloadTimerSeconds <= 0) {
clearInterval(reloadTimerInterval);
reloadTimerInterval = null;
reloadBtn.disabled = false;
reloadBtn.textContent = t('reloadBtn');
}
}, 1000);
}
reloadBtn.addEventListener('click', function() { if (!this.disabled) location.reload(); });

// ============================================================
// ==================== ПЕРЕВОД ================================
// ============================================================
function translateAllElements() {
const shopTitleEl = document.getElementById('shopTitle'); if (shopTitleEl) shopTitleEl.textContent = t('shop');
const labTitleEl = document.getElementById('labTitle'); if (labTitleEl) labTitleEl.textContent = t('labTitle');
const combinerTitleEl = document.getElementById('combinerTitle'); if (combinerTitleEl) combinerTitleEl.textContent = t('combinerTitle');
const extractorTitleEl = document.getElementById('extractorTitle'); if (extractorTitleEl) extractorTitleEl.textContent = t('extractorTitle');
const inventoryTitleEl = document.getElementById('inventoryTitle'); if (inventoryTitleEl) inventoryTitleEl.textContent = t('inventory');
const settingsTitleEl = document.getElementById('settingsTitle'); if (settingsTitleEl) settingsTitleEl.textContent = t('manipSettings');
const bossMenuTitleEl = document.getElementById('bossMenuTitle'); if (bossMenuTitleEl) bossMenuTitleEl.textContent = t('bossesTitle');
const bossFightTitleEl = document.getElementById('bossFightTitle'); if (bossFightTitleEl) bossFightTitleEl.textContent = t('bossFightTitle');
const langTitleEl = document.getElementById('langTitle'); if (langTitleEl) langTitleEl.textContent = ' ' + t('language');
const resetTitleEl = document.getElementById('resetTitle'); if (resetTitleEl) resetTitleEl.textContent = t('resetTitle');
const resetWarningEl = document.getElementById('resetWarning'); if (resetWarningEl) resetWarningEl.textContent = t('resetWarning');
const resetEnterCodeEl = document.getElementById('resetEnterCode'); if (resetEnterCodeEl) resetEnterCodeEl.textContent = t('resetEnterCode');
const resetConfirmEl = document.getElementById('resetConfirm'); if (resetConfirmEl) resetConfirmEl.textContent = t('resetConfirm');
const resetNoBackEl = document.getElementById('resetNoBack'); if (resetNoBackEl) resetNoBackEl.textContent = t('resetNoBack');
if (confirmResetBtn) confirmResetBtn.textContent = t('resetBtn');
if (cancelResetBtn) cancelResetBtn.textContent = t('cancel');
const reloadTitleEl = document.getElementById('reloadTitle'); if (reloadTitleEl) reloadTitleEl.textContent = t('reloadTitle');
const reloadSuccessEl = document.getElementById('reloadSuccess'); if (reloadSuccessEl) reloadSuccessEl.textContent = t('reloadSuccess');
const reloadHintEl = document.getElementById('reloadHint'); if (reloadHintEl) reloadHintEl.textContent = t('reloadHint');
const timerLabelEl = document.getElementById('timerLabel'); if (timerLabelEl) timerLabelEl.textContent = t('seconds');
if (reloadBtn && reloadBtn.disabled) reloadBtn.textContent = '⏳...';
else if (reloadBtn) reloadBtn.textContent = t('reloadBtn');
const enclosureTitleEl = document.getElementById('enclosureTitle'); if (enclosureTitleEl) enclosureTitleEl.textContent = t('enclosure');
const foodBarLabelEl = document.getElementById('foodBarLabel'); if (foodBarLabelEl) foodBarLabelEl.textContent = t('satiety');
const plantsLabelEl = document.getElementById('plantsLabel');
if (plantsLabelEl && plantsLabelEl.childNodes[0]) { plantsLabelEl.childNodes[0].nodeValue = t('pots') + ' '; }
const fertBadgeEl = document.getElementById('fertilizerAutoBadge'); if (fertBadgeEl) fertBadgeEl.textContent = t('autoFertilizerBadge');
const ratAutoLabelEl = document.getElementById('ratAutoLabel'); if (ratAutoLabelEl) ratAutoLabelEl.textContent = t('autoClickBadge') + ':';
const mouseInfoEl = document.getElementById('mouseInfo'); if (mouseInfoEl) mouseInfoEl.textContent = t('autoCollect');
const grainLabelEl = document.getElementById('grainLabel'); if (grainLabelEl) grainLabelEl.textContent = t('grainToggle');
const superGrainLabelEl = document.getElementById('superGrainLabel'); if (superGrainLabelEl) superGrainLabelEl.textContent = t('superGrainToggle');
const mouseLabelEl = document.getElementById('mouseLabel'); if (mouseLabelEl) mouseLabelEl.textContent = t('mouseToggle');
const skullLabelEl = document.getElementById('skullLabel'); if (skullLabelEl) skullLabelEl.textContent = t('bossesTitle').replace('💀 ', '');
const capybaraNameEl = document.getElementById('capybaraName'); if (capybaraNameEl) capybaraNameEl.textContent = t('capybara');
const capybaraDescEl = document.getElementById('capybaraShortDesc'); if (capybaraDescEl) capybaraDescEl.textContent = t('capybaraDesc');
const fightBtnEl = document.getElementById('fightCapybaraBtn'); if (fightBtnEl) fightBtnEl.textContent = t('fightBtn');
const bossHPLabelEl = document.getElementById('bossHPLabel'); if (bossHPLabelEl) bossHPLabelEl.textContent = t('bossHP') + ':';
if (shootBtn) shootBtn.textContent = t('shoot');
if (retreatBtn) retreatBtn.textContent = t('retreat');
const poopStatEl = document.getElementById('poopStat');
if (poopStatEl) { const firstChild = poopStatEl.childNodes[0]; if (firstChild && firstChild.nodeType === 3) { firstChild.nodeValue = t('poopLabel') + ': '; } }
const fertStatEl = document.getElementById('fertStat');
if (fertStatEl) { const firstChild = fertStatEl.childNodes[0]; if (firstChild && firstChild.nodeType === 3) { firstChild.nodeValue = t('fertLabel') + ': '; } }
const machineNameEl = document.getElementById('machineNameLabel'); if (machineNameEl) machineNameEl.textContent = t('machineName');
const machineUpgradeInfoEl = document.getElementById('machineUpgradeInfo');
if (machineUpgradeInfoEl) { machineUpgradeInfoEl.innerHTML = `<span>${t('timeLabel')}: <span id="machineTimeDisplay">${Math.floor(getMachineTime() / 60)}</span> ${t('min')}</span><span> | </span><span>${t('levelLabel')}: <span id="machineLevelDisplay">${machineLevel}</span>/5</span>`; }
const openCombinerBtnEl = document.getElementById('openCombiner'); if (openCombinerBtnEl) openCombinerBtnEl.textContent = '🧪 ' + t('combiner');
const openExtractorBtnEl = document.getElementById('openExtractor'); if (openExtractorBtnEl) openExtractorBtnEl.textContent = '⚗️ ' + t('extractor');
const combinerInfoEl = document.getElementById('combinerInfo');
if (combinerInfoEl && !combinerInfoEl.textContent.includes('%')) { combinerInfoEl.textContent = t('putIngredients'); }
const extractorQueueEl = document.getElementById('extractorQueue');
if (extractorQueueEl && extractorQueue.length === 0) { extractorQueueEl.innerHTML = '<div class="extractor-empty">' + t('queueEmpty') + '</div>'; }
if (inventoryEmpty) inventoryEmpty.textContent = t('inventoryEmpty');
if (openLabBtn) openLabBtn.textContent = t('openLab');
if (openInventoryBtn) openInventoryBtn.textContent = t('openInv');
if (openShopBtn) openShopBtn.textContent = t('shopBtn');
const tabBoostsEl = document.getElementById('tabBtnBoosts'); if (tabBoostsEl) tabBoostsEl.textContent = t('tabBoosts');
const tabAccEl = document.getElementById('tabBtnAccessories'); if (tabAccEl) tabAccEl.textContent = t('tabAccessories');
const tabBossesEl = document.getElementById('tabBtnBosses'); if (tabBossesEl) tabBossesEl.textContent = t('tabBosses');
const clickTitleEl = document.getElementById('clickTitle'); if (clickTitleEl) clickTitleEl.textContent = t('clickBoost');
const clickDescEl = document.getElementById('clickDesc'); if (clickDescEl) clickDescEl.textContent = t('clickBoostDesc');
const autoTitleEl = document.getElementById('autoTitle'); if (autoTitleEl) autoTitleEl.textContent = t('autoBoost');
const autoDescEl = document.getElementById('autoDesc'); if (autoDescEl) autoDescEl.textContent = t('autoBoostDesc');
const autoHint1El = document.getElementById('autoHint1'); if (autoHint1El) autoHint1El.textContent = t('autoBoostHint1');
const autoHint2El = document.getElementById('autoHint2'); if (autoHint2El) autoHint2El.textContent = t('autoBoostHint2');
const grainTitleEl = document.getElementById('grainTitle'); if (grainTitleEl) grainTitleEl.textContent = t('grain');
const grainDescEl = document.getElementById('grainDesc');
if (grainDescEl) grainDescEl.innerHTML = t('grainDesc') + ': <span id="grainBase">' + grainBase + '</span> ' + t('grainTimesClick');
const grainHintEl = document.getElementById('grainHint'); if (grainHintEl) grainHintEl.textContent = t('grainHint');
const superGrainTitleEl = document.getElementById('superGrainTitle'); if (superGrainTitleEl) superGrainTitleEl.textContent = t('superGrain');
const superGrainDescEl = document.getElementById('superGrainDesc'); if (superGrainDescEl) superGrainDescEl.textContent = t('superGrainDesc');
const superGrainSpawnEl = document.getElementById('superGrainSpawn'); if (superGrainSpawnEl) superGrainSpawnEl.textContent = t('superGrainSpawn');
const superGrainOnceEl = document.getElementById('superGrainOnce'); if (superGrainOnceEl) superGrainOnceEl.textContent = t('superGrainOnce');
const superGrainHint1El = document.getElementById('superGrainHint1'); if (superGrainHint1El) superGrainHint1El.textContent = t('superGrainHint1');
const superGrainHint2El = document.getElementById('superGrainHint2'); if (superGrainHint2El) superGrainHint2El.textContent = t('superGrainHint2');
const superGrainHint3El = document.getElementById('superGrainHint3'); if (superGrainHint3El) superGrainHint3El.textContent = t('superGrainHint3');
const superGrainHint4El = document.getElementById('superGrainHint4'); if (superGrainHint4El) superGrainHint4El.textContent = t('superGrainHint4');
const mouseTitleEl = document.getElementById('mouseTitle'); if (mouseTitleEl) mouseTitleEl.textContent = t('mouse');
const mouseDescEl = document.getElementById('mouseDesc'); if (mouseDescEl) mouseDescEl.textContent = t('mouseDesc');
const mouseDesc2El = document.getElementById('mouseDesc2'); if (mouseDesc2El) mouseDesc2El.textContent = t('mouseDesc2');
const mouseOnceEl = document.getElementById('mouseOnce'); if (mouseOnceEl) mouseOnceEl.textContent = t('mouseOnce');
const mouseHintEl = document.getElementById('mouseHint'); if (mouseHintEl) mouseHintEl.textContent = t('mouseHint');
const hamstersTitleEl = document.getElementById('hamstersTitle'); if (hamstersTitleEl) hamstersTitleEl.textContent = t('hamsters');
const hamstersDescEl = document.getElementById('hamstersDesc'); if (hamstersDescEl) hamstersDescEl.textContent = t('hamstersDesc');
const hamstersOnceEl = document.getElementById('hamstersOnce'); if (hamstersOnceEl) hamstersOnceEl.textContent = t('hamstersOnce');
const hamstersHintEl = document.getElementById('hamstersHint'); if (hamstersHintEl) hamstersHintEl.textContent = t('hamstersHint');
const hamsterUpgradeTitleEl = document.getElementById('hamsterUpgradeTitle'); if (hamsterUpgradeTitleEl) hamsterUpgradeTitleEl.textContent = t('hamsterUpgrade');
const hamsterUpgradeDescEl = document.getElementById('hamsterUpgradeDesc'); if (hamsterUpgradeDescEl) hamsterUpgradeDescEl.textContent = t('hamsterUpgradeDesc');
const potFirstTitleEl = document.getElementById('potFirstTitle'); if (potFirstTitleEl) potFirstTitleEl.textContent = t('potFirst');
const potFirstDescEl = document.getElementById('potFirstDesc'); if (potFirstDescEl) potFirstDescEl.textContent = t('potFirstDesc');
const potFirstHintEl = document.getElementById('potFirstHint'); if (potFirstHintEl) potFirstHintEl.textContent = t('potFirstHint');
const potHintReqEl = document.getElementById('potHintReq'); if (potHintReqEl) potHintReqEl.textContent = t('potHintReq');
const potOnceEl = document.getElementById('potOnce'); if (potOnceEl) potOnceEl.textContent = t('potOnce');
const potHintEl = document.getElementById('potHint'); if (potHintEl) potHintEl.textContent = t('potHint');
const potUpgrade1TitleEl = document.getElementById('potUpgrade1Title'); if (potUpgrade1TitleEl) potUpgrade1TitleEl.textContent = t('potUpgrade1');
const potUpgrade1DescEl = document.getElementById('potUpgrade1Desc'); if (potUpgrade1DescEl) potUpgrade1DescEl.textContent = t('potUpgrade1Desc');
const potUpgrade1LevelEl = document.getElementById('potUpgrade1Level'); if (potUpgrade1LevelEl) potUpgrade1LevelEl.textContent = t('potUpgrade1Level');
const potUpgrade2TitleEl = document.getElementById('potUpgrade2Title'); if (potUpgrade2TitleEl) potUpgrade2TitleEl.textContent = t('potUpgrade2');
const potUpgrade2DescEl = document.getElementById('potUpgrade2Desc'); if (potUpgrade2DescEl) potUpgrade2DescEl.textContent = t('potUpgrade2Desc');
const potUpgrade2LevelEl = document.getElementById('potUpgrade2Level'); if (potUpgrade2LevelEl) potUpgrade2LevelEl.textContent = t('potUpgrade2Level');
const grassTitleEl = document.getElementById('grassTitle'); if (grassTitleEl) grassTitleEl.textContent = t('grass');
const grassDescEl = document.getElementById('grassDesc'); if (grassDescEl) grassDescEl.textContent = t('grassDesc');
const grassOnceEl = document.getElementById('grassOnce'); if (grassOnceEl) grassOnceEl.textContent = t('plantOnce');
const pepperTitleEl = document.getElementById('pepperTitle'); if (pepperTitleEl) pepperTitleEl.textContent = t('pepper');
const pepperDescEl = document.getElementById('pepperDesc'); if (pepperDescEl) pepperDescEl.textContent = t('pepperDesc');
const pepperOnceEl = document.getElementById('pepperOnce'); if (pepperOnceEl) pepperOnceEl.textContent = t('plantOnce');
const appleTitleEl = document.getElementById('appleTitle'); if (appleTitleEl) appleTitleEl.textContent = t('apple');
const appleDescEl = document.getElementById('appleDesc'); if (appleDescEl) appleDescEl.textContent = t('appleDesc');
const appleHintEl = document.getElementById('appleHint'); if (appleHintEl) appleHintEl.textContent = t('appleHint');
const appleOnceEl = document.getElementById('appleOnce'); if (appleOnceEl) appleOnceEl.textContent = t('plantOnce');
const cabbageTitleEl = document.getElementById('cabbageTitle'); if (cabbageTitleEl) cabbageTitleEl.textContent = t('cabbage');
const cabbageDescEl = document.getElementById('cabbageDesc'); if (cabbageDescEl) cabbageDescEl.textContent = t('cabbageDesc');
const cabbageOnceEl = document.getElementById('cabbageOnce'); if (cabbageOnceEl) cabbageOnceEl.textContent = t('plantOnce');
const labTitleShopEl = document.getElementById('labTitleShop'); if (labTitleShopEl) labTitleShopEl.textContent = t('lab');
const labDescEl = document.getElementById('labDesc'); if (labDescEl) labDescEl.textContent = t('labDesc');
const labOnceEl = document.getElementById('labOnce'); if (labOnceEl) labOnceEl.textContent = t('labOnce');
const labHint1El = document.getElementById('labHint1'); if (labHint1El) labHint1El.textContent = t('labHint1');
const labHint2El = document.getElementById('labHint2'); if (labHint2El) labHint2El.textContent = t('labHint2');
const combinerTitleShopEl = document.getElementById('combinerTitleShop'); if (combinerTitleShopEl) combinerTitleShopEl.textContent = t('combiner');
const combinerDescEl = document.getElementById('combinerDesc'); if (combinerDescEl) combinerDescEl.textContent = t('combinerDesc');
const combinerSlotsLabelEl = document.getElementById('combinerSlotsLabel'); if (combinerSlotsLabelEl) combinerSlotsLabelEl.textContent = t('combinerSlots');
const combinerRecipe1El = document.getElementById('combinerRecipe1'); if (combinerRecipe1El) combinerRecipe1El.textContent = t('combinerRecipe1');
const combinerRecipe2El = document.getElementById('combinerRecipe2'); if (combinerRecipe2El) combinerRecipe2El.textContent = t('combinerRecipe2');
const combinerRecipe3El = document.getElementById('combinerRecipe3'); if (combinerRecipe3El) combinerRecipe3El.textContent = t('combinerRecipe3');
const combinerOnceEl = document.getElementById('combinerOnce'); if (combinerOnceEl) combinerOnceEl.textContent = t('combinerOnce');
const combinerHintEl = document.getElementById('combinerHint'); if (combinerHintEl) combinerHintEl.textContent = t('combinerHint');
const combinerUpgradeTitleEl = document.getElementById('combinerUpgradeTitle'); if (combinerUpgradeTitleEl) combinerUpgradeTitleEl.textContent = t('combinerUpgrade');
const combinerUpgradeDescEl = document.getElementById('combinerUpgradeDesc'); if (combinerUpgradeDescEl) combinerUpgradeDescEl.textContent = t('combinerUpgradeDesc');
const combinerLevelEl2 = document.getElementById('combinerLevel');
if (combinerLevelEl2 && !combinerPurchased) combinerLevelEl2.textContent = t('combinerLevel1');
const extractorTitleShopEl = document.getElementById('extractorTitleShop'); if (extractorTitleShopEl) extractorTitleShopEl.textContent = t('extractor');
const extractorDescEl = document.getElementById('extractorDesc'); if (extractorDescEl) extractorDescEl.textContent = t('extractorDesc');
const extractorTimeEl = document.getElementById('extractorTime'); if (extractorTimeEl) extractorTimeEl.textContent = t('extractorTime');
const extractorRecipe1El = document.getElementById('extractorRecipe1'); if (extractorRecipe1El) extractorRecipe1El.textContent = t('extractorRecipe1');
const extractorRecipe2El = document.getElementById('extractorRecipe2'); if (extractorRecipe2El) extractorRecipe2El.textContent = t('extractorRecipe2');
const extractorRecipe3El = document.getElementById('extractorRecipe3'); if (extractorRecipe3El) extractorRecipe3El.textContent = t('extractorRecipe3');
const extractorNoUpgradeEl = document.getElementById('extractorNoUpgrade'); if (extractorNoUpgradeEl) extractorNoUpgradeEl.textContent = t('extractorNoUpgrade');
const manipulatorTitleEl = document.getElementById('manipulatorTitle'); if (manipulatorTitleEl) manipulatorTitleEl.textContent = t('manipulator');
const manipulatorDescEl = document.getElementById('manipulatorDesc'); if (manipulatorDescEl) manipulatorDescEl.textContent = t('manipulatorDesc');
const manipulatorHint1El = document.getElementById('manipulatorHint1'); if (manipulatorHint1El) manipulatorHint1El.textContent = t('manipulatorHint1');
const manipulatorHint2El = document.getElementById('manipulatorHint2'); if (manipulatorHint2El) manipulatorHint2El.textContent = t('manipulatorHint2');
const manipulatorHint3El = document.getElementById('manipulatorHint3'); if (manipulatorHint3El) manipulatorHint3El.textContent = t('manipulatorHint3');
const manipulatorHint4El = document.getElementById('manipulatorHint4'); if (manipulatorHint4El) manipulatorHint4El.textContent = t('manipulatorHint4');
const manipulatorHint5El = document.getElementById('manipulatorHint5'); if (manipulatorHint5El) manipulatorHint5El.textContent = t('manipulatorHint5');
const manipulatorHint6El = document.getElementById('manipulatorHint6'); if (manipulatorHint6El) manipulatorHint6El.textContent = t('manipulatorHint6');
const manipulatorHint7El = document.getElementById('manipulatorHint7'); if (manipulatorHint7El) manipulatorHint7El.textContent = t('manipulatorHint7');
const manipulatorHint8El = document.getElementById('manipulatorHint8'); if (manipulatorHint8El) manipulatorHint8El.textContent = t('manipulatorHint8');
const advLogicTitleEl = document.getElementById('advancedLogicTitle'); if (advLogicTitleEl) advLogicTitleEl.textContent = t('advancedLogic');
const advLogicDescEl = document.getElementById('advancedLogicDesc'); if (advLogicDescEl) advLogicDescEl.textContent = t('advancedLogicDesc');
const advLogicHint1El = document.getElementById('advancedLogicHint1'); if (advLogicHint1El) advLogicHint1El.textContent = t('advancedLogicHint1');
const advLogicHint2El = document.getElementById('advancedLogicHint2'); if (advLogicHint2El) advLogicHint2El.textContent = t('advancedLogicHint2');
const advLogicHint3El = document.getElementById('advancedLogicHint3'); if (advLogicHint3El) advLogicHint3El.textContent = t('advancedLogicHint3');
const advLogicHint4El = document.getElementById('advancedLogicHint4'); if (advLogicHint4El) advLogicHint4El.textContent = t('advancedLogicHint4');
const advLogicOnceEl = document.getElementById('advancedLogicOnce'); if (advLogicOnceEl) advLogicOnceEl.textContent = t('advancedLogicOnce');
const advLogicHint5El = document.getElementById('advancedLogicHint5'); if (advLogicHint5El) advLogicHint5El.textContent = t('advancedLogicHint5');
const hatTitleEl = document.getElementById('hatTitle'); if (hatTitleEl) hatTitleEl.textContent = t('hat');
const hatDescEl = document.getElementById('hatDesc'); if (hatDescEl) hatDescEl.textContent = t('hatDesc');
const glassesTitleEl = document.getElementById('glassesTitle'); if (glassesTitleEl) glassesTitleEl.textContent = t('glasses');
const glassesDescEl = document.getElementById('glassesDesc'); if (glassesDescEl) glassesDescEl.textContent = t('glassesDesc');
const swordTitleEl = document.getElementById('swordTitle'); if (swordTitleEl) swordTitleEl.textContent = t('sword');
const swordDescEl = document.getElementById('swordDesc'); if (swordDescEl) swordDescEl.textContent = t('swordDesc');
const crownTitleEl = document.getElementById('crownTitle'); if (crownTitleEl) crownTitleEl.textContent = t('crown');
const crownDescEl = document.getElementById('crownDesc'); if (crownDescEl) crownDescEl.textContent = t('crownDesc');
const activeBonusLabelEl = document.getElementById('activeBonusLabel'); if (activeBonusLabelEl) activeBonusLabelEl.textContent = '👑 ' + t('activeBonus') + ': ';
document.querySelectorAll('#bonusLabel1, #bonusLabel2, #bonusLabel3, #bonusLabel4').forEach(el => { el.textContent = t('bonus'); });
const bossMenuTitleShopEl = document.getElementById('bossMenuTitleShop'); if (bossMenuTitleShopEl) bossMenuTitleShopEl.textContent = t('bossMenu');
const bossMenuDescEl = document.getElementById('bossMenuDesc'); if (bossMenuDescEl) bossMenuDescEl.textContent = t('bossMenuDesc');
const bossMenuOnceEl = document.getElementById('bossMenuOnce'); if (bossMenuOnceEl) bossMenuOnceEl.textContent = t('bossMenuOnce');
const bossMenuHint1El = document.getElementById('bossMenuHint1'); if (bossMenuHint1El) bossMenuHint1El.textContent = t('bossMenuHint1');
const bossMenuHint2El = document.getElementById('bossMenuHint2'); if (bossMenuHint2El) bossMenuHint2El.textContent = t('bossMenuHint2');
const capybaraTitleShopEl = document.getElementById('capybaraTitleShop'); if (capybaraTitleShopEl) capybaraTitleShopEl.textContent = t('capybara');
const capybaraDescShopEl = document.getElementById('capybaraDesc'); if (capybaraDescShopEl) capybaraDescShopEl.textContent = t('capybaraDesc');
const capybaraRewardEl = document.getElementById('capybaraReward'); if (capybaraRewardEl) capybaraRewardEl.textContent = t('capybaraReward');
const capybaraOnceEl = document.getElementById('capybaraOnce'); if (capybaraOnceEl) capybaraOnceEl.textContent = t('capybaraOnce');
const capybaraHintEl = document.getElementById('capybaraHint'); if (capybaraHintEl) capybaraHintEl.textContent = t('capybaraHint');
const capybaraCooldownEl = document.getElementById('capybaraCooldown'); if (capybaraCooldownEl) capybaraCooldownEl.textContent = t('capybaraCooldown');
}

// ============================================================
// ==================== МУЗЫКА ================================
// ============================================================
function getYouTubeEmbedUrl(videoId, autoplay = 0) {
return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay}&loop=1&playlist=${videoId}&controls=0&disablekb=1&modestbranding=1&rel=0&mute=0`;
}
function toggleMusic() {
musicEnabled = !musicEnabled;
localStorage.setItem('rat_musicEnabled', musicEnabled);
const iframe = document.getElementById('youtubePlayer');
if (iframe) {
if (musicEnabled) { iframe.src = getYouTubeEmbedUrl(musicVideoId, 1); musicToggle.textContent = '🔊'; musicToggle.classList.remove('muted'); }
else { iframe.src = getYouTubeEmbedUrl(musicVideoId, 0); musicToggle.textContent = '🔇'; musicToggle.classList.add('muted'); }
}
}
function initMusic() {
const container = document.getElementById('youtubePlayerContainer');
if (!container) return;
container.innerHTML = `<iframe id="youtubePlayer" width="0" height="0" src="${getYouTubeEmbedUrl(musicVideoId, 1)}" frameborder="0" allow="autoplay; encrypted-media"></iframe>`;
musicEnabled = true;
localStorage.setItem('rat_musicEnabled', 'true');
if (musicToggle) {
musicToggle.textContent = '🔊';
musicToggle.classList.remove('muted');
musicToggle.addEventListener('click', toggleMusic);
}
}

// ============================================================
// ==================== ЯЗЫКИ =================================
// ============================================================
function updateLangUI() {
if (window.updateLangUIInternal) { window.updateLangUIInternal(); }
else {
document.querySelectorAll('.lang-item').forEach(item => {
if (item.dataset.lang === window.currentLang) item.classList.add('active');
else item.classList.remove('active');
});
}
}

// ============================================================
// ==================== ОБРАБОТЧИКИ ===========================
// ============================================================
resetBtn.addEventListener('click', function() {
currentCode = generateCode(); codeDisplay.textContent = currentCode; codeInput.value = '';
confirmBox.classList.remove('show'); confirmResetBtn.disabled = true; resetStatus.textContent = '';
resetModal.classList.add('open'); codeInput.focus();
});
cancelResetBtn.addEventListener('click', function() {
resetModal.classList.remove('open'); codeInput.value = '';
confirmBox.classList.remove('show'); confirmResetBtn.disabled = true; resetStatus.textContent = '';
});
codeInput.addEventListener('input', function() {
const entered = this.value.trim();
if (entered === currentCode) { confirmBox.classList.add('show'); confirmResetBtn.disabled = false; resetStatus.textContent = '✅'; resetStatus.style.color = '#45f3ff'; }
else { confirmBox.classList.remove('show'); confirmResetBtn.disabled = true; resetStatus.textContent = entered.length > 0 ? '❌' : ''; resetStatus.style.color = '#ff0033'; }
});
confirmResetBtn.addEventListener('click', function() { if (codeInput.value.trim() === currentCode) resetAllProgress(); });
resetModal.addEventListener('click', function(e) {
if (e.target === this) { resetModal.classList.remove('open'); codeInput.value = ''; confirmBox.classList.remove('show'); confirmResetBtn.disabled = true; resetStatus.textContent = ''; }
});
document.querySelectorAll('.shop-tab').forEach(tab => {
tab.addEventListener('click', function() {
document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
this.classList.add('active');
document.getElementById('tab-' + this.dataset.tab).classList.add('active');
});
});
document.querySelectorAll('.equip-btn').forEach(btn => {
btn.addEventListener('click', function() {
const accessory = this.closest('.accessory-item').dataset.accessory;
const isOwned = ownedAccessories.includes(accessory);
const price = ACCESSORY_PRICES[accessory];
if (!isOwned) { if (score >= price) { score -= price; ownedAccessories.push(accessory); saveGame(); updateUI(); } else alert(t('notEnough')); }
else { equippedAccessory = (equippedAccessory === accessory) ? null : accessory; saveGame(); updateUI(); }
});
});
ratContainer.addEventListener('click', (e) => {
if (isBanned) return;
const currentTime = performance.now();
if (lastClickTime !== 0) {
const interval = currentTime - lastClickTime;
if (interval < 35) { triggerAntiCheat("⚠️!"); lastClickTime = currentTime; return; }
clickIntervals.push(interval);
if (clickIntervals.length > maxIntervalHistory) clickIntervals.shift();
if (clickIntervals.length === maxIntervalHistory) {
const sum = clickIntervals.reduce((a, b) => a + b, 0);
const avgInterval = sum / clickIntervals.length;
if (clickIntervals.every(i => Math.abs(i - avgInterval) < 4)) { triggerAntiCheat("⚠️!"); lastClickTime = currentTime; return; }
}
}
lastClickTime = currentTime;
let totalPower = getTotalClickPower();
score += totalPower;
saveGame();
updateUI();
const pop = document.createElement('div');
pop.className = 'click-pop' + (buffActive ? ' buffed' : '');
pop.innerText = '+' + totalPower;
const rect = clickArea.getBoundingClientRect();
pop.style.left = (e.clientX - rect.left - 20) + 'px';
pop.style.top = (e.clientY - rect.top - 40) + 'px';
clickArea.appendChild(pop);
setTimeout(() => pop.remove(), 500);
});
function triggerAntiCheat(message) {
isBanned = true;
cheatWarning.innerText = t('cheatDetected');
ratContainer.style.display = 'none';
trapBtn.style.display = 'block';
cheatWarning.style.display = 'block';
clickIntervals = [];
setTimeout(() => {
isBanned = false;
ratContainer.style.display = 'block';
trapBtn.style.display = 'none';
cheatWarning.style.display = 'none';
}, 5000);
}
openShopBtn.addEventListener('click', () => shopModal.classList.add('open'));
closeShopBtn.addEventListener('click', () => shopModal.classList.remove('open'));
buyClickBtn.addEventListener('click', () => {
let currentMax = superGrainPurchased ? 20 : 10;
if (clickLevel >= currentMax) return;
let cost = 50 * (clickLevel + 1);
if (score >= cost) { score -= cost; clickLevel++; clickPower++; saveGame(); updateUI(); }
});
buyAutoBtn.addEventListener('click', () => {
if (autoLevel >= MAX_AUTO_LEVEL) return;
let cost = 100 * (autoLevel + 1);
if (score >= cost) { score -= cost; autoLevel++; autoClickers++; saveGame(); updateUI(); }
});
buyGrainBtn.addEventListener('click', () => {
if (grainPurchased === 0) { if (score >= 1000) { score -= 1000; grainPurchased = 1; grainLevel = 1; grainBase = 4; saveGame(); updateUI(); } return; }
if (grainLevel >= MAX_GRAIN_LEVEL) return;
let cost = 1000 * (grainLevel + 1);
if (score >= cost) { score -= cost; grainLevel++; grainBase++; grainPurchased++; saveGame(); updateUI(); }
});
buySuperGrainBtn.addEventListener('click', () => {
if (superGrainPurchased) return;
if (score >= 10000) { score -= 10000; superGrainPurchased = true; MAX_CLICK_LEVEL = 20; saveGame(); updateUI(); }
});
buyMouseShopBtn.addEventListener('click', () => {
if (mousePurchased) return;
if (score >= 15000) { score -= 15000; mousePurchased = true; mouseActive = false; saveGame(); updateUI(); }
});
buyHamsterShopBtn.addEventListener('click', () => {
if (hamsterPurchased) return;
if (score >= 20000) { score -= 20000; hamsterPurchased = true; hamsterFood = 50; hamsterUpgradeCost = 5000; saveGame(); updateUI(); startHamsterMovement(); startFoodDepletion(); startPoopProduction(); }
});
buyHamsterUpgradeBtn.addEventListener('click', () => {
if (!hamsterPurchased) return;
if (hamsterLevel >= MAX_HAMSTER_LEVEL) return;
if (score < hamsterUpgradeCost) return;
score -= hamsterUpgradeCost;
hamsterLevel++;
hamsterUpgradeCost = Math.round(hamsterUpgradeCost * 1.5);
hamsterFood = Math.min(hamsterMaxFood, hamsterFood + 15);
saveGame();
updateUI();
if (hamsterFood > 0 && !foodDepletionInterval) startFoodDepletion();
});
buyBossMenuBtn.addEventListener('click', () => {
if (bossMenuPurchased) return;
if (score >= 50000) { score -= 50000; bossMenuPurchased = true; saveGame(); updateUI(); }
});
buyCapybaraBtn.addEventListener('click', () => {
if (capybaraPurchased) return;
if (score >= 100000) { score -= 100000; capybaraPurchased = true; capybaraDefeated = false; capybaraCooldown = 0; saveGame(); updateUI(); startBossCooldownTimer(); }
});
buyPlantBtn.addEventListener('click', () => {
if (plantPurchased) return;
if (!hamsterPurchased || hamsterLevel < 1) return;
if (score >= 30000) { score -= 30000; plantPurchased = true; plantLevel = 1; savePlantData(); saveGame(); updateUI(); setTimeout(updatePlantsUI, 100); }
});
buyPlantUpgrade1Btn.addEventListener('click', () => {
if (plantUpgrade1) return;
if (!plantPurchased) return;
if (score >= 50000) { score -= 50000; plantUpgrade1 = true; plantLevel = 2; savePlantData(); saveGame(); updateUI(); setTimeout(updatePlantsUI, 100); }
});
buyPlantUpgrade2Btn.addEventListener('click', () => {
if (plantUpgrade2) return;
if (!plantUpgrade1) return;
if (score >= 70000) { score -= 70000; plantUpgrade2 = true; plantLevel = 3; savePlantData(); saveGame(); updateUI(); setTimeout(updatePlantsUI, 100); }
});
buyPlantTypeGrassBtn.addEventListener('click', () => { if (plantTypeGrass) return; if (score >= 10000) { score -= 10000; plantTypeGrass = true; saveGame(); updateUI(); } });
buyPlantTypePepperBtn.addEventListener('click', () => { if (plantTypePepper) return; if (score >= 25000) { score -= 25000; plantTypePepper = true; saveGame(); updateUI(); } });
buyPlantTypeAppleBtn.addEventListener('click', () => { if (plantTypeApple) return; if (score >= 40000) { score -= 40000; plantTypeApple = true; saveGame(); updateUI(); } });
buyPlantTypeCabbageBtn.addEventListener('click', () => { if (plantTypeCabbage) return; if (score >= 15000) { score -= 15000; plantTypeCabbage = true; saveGame(); updateUI(); } });
buyLabBtn.addEventListener('click', () => { if (labPurchased) return; if (score >= 50000) { score -= 50000; labPurchased = true; saveGame(); updateUI(); } });
buyCombinerBtn.addEventListener('click', () => {
if (combinerPurchased) return;
if (!labPurchased) return;
if (score >= 30000) { score -= 30000; combinerPurchased = true; combinerLevel = 0; combinerSlots = [null, null, null]; combinerRunning = [false, false, false]; combinerProgress = [0, 0, 0]; combinerRecipes = [null, null, null]; combinerTimer = [null, null, null]; saveGame(); updateUI(); }
});
buyCombinerUpgradeBtn.addEventListener('click', () => {
if (combinerLevel >= 1) return;
if (!combinerPurchased) return;
if (score >= 60000) { score -= 60000; combinerLevel = 1; combinerSlots = [null, null, null]; combinerProgress = [0, 0, 0]; combinerRecipes = [null, null, null]; saveGame(); updateUI(); }
});
buyExtractorBtn.addEventListener('click', () => {
if (extractorPurchased) return;
if (!combinerPurchased) return;
if (score >= 20000) {
score -= 20000; extractorPurchased = true;
extractorQueue = []; extractorProgress = [];
if (inventory.gmo_apple_extract > 0) { for (let i = 0; i < inventory.gmo_apple_extract; i++) { extractorQueue.push('gmo_apple_extract'); extractorProgress.push(0); } inventory.gmo_apple_extract = 0; }
if (inventory.rat_food_extract > 0) { for (let i = 0; i < inventory.rat_food_extract; i++) { extractorQueue.push('rat_food_extract'); extractorProgress.push(0); } inventory.rat_food_extract = 0; }
if (inventory.hay_extract > 0) { for (let i = 0; i < inventory.hay_extract; i++) { extractorQueue.push('hay_extract'); extractorProgress.push(0); } inventory.hay_extract = 0; }
saveGame(); updateUI(); updateExtractorUI();
}
});
buyManipulatorBtn.addEventListener('click', () => {
if (manipulatorLevel >= 3) return;
if (!isAllLabPartsBought()) return;
if (score >= 10000) { score -= 10000; manipulatorLevel++; manipulatorPurchased = true; while (manipulatorSettings.length < manipulatorLevel) { manipulatorSettings.push({ enabled: false, action: 'none', target: '', condition: 'always', threshold: 20, interval: 5, plantTargets: ['', '', ''] }); } saveGame(); updateUI(); restartManipulators(); }
});
if (buyAdvancedLogicBtn) {
buyAdvancedLogicBtn.addEventListener('click', () => {
if (advancedLogicPurchased) return;
if (manipulatorLevel < 1) return;
if (score >= 20000) { score -= 20000; advancedLogicPurchased = true; saveGame(); updateUI(); }
});
}
openLabBtn.addEventListener('click', function() { labModal.classList.add('open'); labModal.style.display = 'flex'; updateLabUI(); });
closeLabBtn.addEventListener('click', function() { labModal.classList.remove('open'); labModal.style.display = 'none'; });
labModal.addEventListener('click', function(e) { if (e.target === this) { this.style.display = 'none'; this.classList.remove('open'); } });
machineBtn.addEventListener('click', function() {
if (machineRunning) return;
if (machineProgress >= getMachineTime() && machineProgress > 0) collectFertilizer();
else startMachine();
});
machineUpgradeBtn.addEventListener('click', upgradeMachine);
openCombinerBtn.addEventListener('click', function() {
if (!combinerPurchased) return;
combinerModal.classList.add('open'); combinerModal.style.display = 'flex'; updateCombinerUI();
});
closeCombinerBtn.addEventListener('click', function() { combinerModal.classList.remove('open'); combinerModal.style.display = 'none'; });
combinerModal.addEventListener('click', function(e) { if (e.target === this) { this.style.display = 'none'; this.classList.remove('open'); } });
openExtractorBtn.addEventListener('click', function() {
if (!extractorPurchased) return;
extractorModal.classList.add('open'); extractorModal.style.display = 'flex'; updateExtractorUI();
});
closeExtractorBtn.addEventListener('click', function() { extractorModal.classList.remove('open'); extractorModal.style.display = 'none'; });
extractorModal.addEventListener('click', function(e) { if (e.target === this) { this.style.display = 'none'; this.classList.remove('open'); } });
closeSettingsBtn.addEventListener('click', function() { settingsModal.classList.remove('open'); settingsModal.style.display = 'none'; });
settingsModal.addEventListener('click', function(e) { if (e.target === this) { this.style.display = 'none'; this.classList.remove('open'); } });
poopBtn.addEventListener('click', function() {
if (poopCount <= 0) return;
labPoopCount += poopCount;
poopCount = 0;
saveGame();
updateUI();
const pCountEl = document.getElementById('poopCount');
if (pCountEl) pCountEl.textContent = labPoopCount;
if (labPurchased) updateLabUI();
});
bossSkull.addEventListener('click', function(e) {
e.stopPropagation(); e.preventDefault();
if (bossMenuPurchased) { bossMenu.style.display = 'block'; bossMenu.classList.add('open'); updateBossStatus(); }
});
document.getElementById('skullIcon').addEventListener('click', function(e) {
e.stopPropagation(); e.preventDefault();
if (bossMenuPurchased) { bossMenu.style.display = 'block'; bossMenu.classList.add('open'); updateBossStatus(); }
});
closeBossMenuBtn.addEventListener('click', function() { bossMenu.style.display = 'none'; bossMenu.classList.remove('open'); });
bossMenu.addEventListener('click', function(e) { if (e.target === this) { this.style.display = 'none'; this.classList.remove('open'); } });
fightCapybaraBtn.addEventListener('click', () => { if (!capybaraPurchased || capybaraCooldown > 0 || capybaraDefeated) return; startBossFight(); });
openInventoryBtn.addEventListener('click', function(e) {
e.stopPropagation(); e.preventDefault();
updateInventoryUI();
inventoryModal.style.display = 'flex';
inventoryModal.classList.add('open');
});
closeInventoryBtn.addEventListener('click', function() { inventoryModal.style.display = 'none'; inventoryModal.classList.remove('open'); });
inventoryModal.addEventListener('click', function(e) { if (e.target === this) { this.style.display = 'none'; this.classList.remove('open'); } });
feedBtn.addEventListener('click', feedHamsters);
grainToggle.addEventListener('click', function(e) { e.stopPropagation(); if (grainLevel === 0) return; toggleGrain(!grainActive); });
superGrainToggle.addEventListener('click', function(e) { e.stopPropagation(); if (!superGrainPurchased) return; toggleSuperGrain(!superGrainActive); });
mouseToggle.addEventListener('click', function(e) { e.stopPropagation(); if (!mousePurchased) return; toggleMouse(!mouseActive); });
if (langToggle) { langToggle.addEventListener('click', function() { langModal.classList.add('open'); langModal.style.display = 'flex'; updateLangUI(); }); }
if (closeLangBtn) { closeLangBtn.addEventListener('click', function() { langModal.classList.remove('open'); langModal.style.display = 'none'; }); }
if (langModal) { langModal.addEventListener('click', function(e) { if (e.target === this) { this.classList.remove('open'); this.style.display = 'none'; } }); }
document.querySelectorAll('.lang-item').forEach(item => {
item.addEventListener('click', function() {
const lang = this.dataset.lang;
if (window.setLanguage) {
window.setLanguage(lang);
updateLangUI();
translateAllElements();
updateUI();
if (labPurchased) updateLabUI();
if (combinerPurchased) updateCombinerUI();
if (extractorPurchased) updateExtractorUI();
if (manipulatorLevel > 0) updateManipulatorUI();
updatePlantsUI();
updateInventoryUI();
}
});
});
shootBtn.addEventListener('click', shootBoss);
retreatBtn.addEventListener('click', () => {
stopBossFight();
capybaraCooldown = 300;
localStorage.setItem('rat_capybaraCooldown', capybaraCooldown);
saveGame();
updateUI();
startBossCooldownTimer();
});
closeFightBtn.addEventListener('click', () => {
if (bossFightActive) { stopBossFight(); capybaraCooldown = 300; localStorage.setItem('rat_capybaraCooldown', capybaraCooldown); saveGame(); updateUI(); startBossCooldownTimer(); }
else stopBossFight();
});

// ============================================================
// ==================== ИНИЦИАЛИЗАЦИЯ =========================
// ============================================================
function checkGameVersion() {
const savedVersion = localStorage.getItem('rat_game_version');
if (savedVersion !== GAME_VERSION) { localStorage.setItem('rat_game_version', GAME_VERSION); }
}
initMusic();
checkGameVersion();
loadPlantData();
translateAllElements();
updateLangUI();
updateUI();
attachManipulatorHandlers();
if (hamsterPurchased) startPoopProduction();
setInterval(() => {
if (autoClickers > 0) { score += autoClickers; saveGame(); updateUI(); }
}, 1000);
startBossCooldownTimer();
setInterval(updateBossStatus, 1000);
setInterval(() => { if (plantPurchased && plantLevel > 0) updatePlantsUI(); }, 5000);
setInterval(() => { if (labPurchased) updateLabUI(); }, 1000);
setInterval(() => { if (combinerPurchased) updateCombinerUI(); }, 1000);
setInterval(() => { if (extractorPurchased) updateExtractorUI(); }, 1000);
setTimeout(() => AntiCheat.start(), 500);
setTimeout(restoreGameState, 200);
window.addEventListener('beforeunload', saveGame);
console.log(t('logGameVersion') + GAME_VERSION);
console.log(t('logLanguages'));
