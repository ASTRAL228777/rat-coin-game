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
                    <body style="
                        margin: 0; padding: 0;
                        background: linear-gradient(135deg, #0b0c10 0%, #1a0a1f 100%);
                        color: #45f3ff;
                        font-family: 'Segoe UI', sans-serif;
                        display: flex; flex-direction: column;
                        justify-content: center; align-items: center;
                        height: 100vh; text-align: center; overflow: hidden;
                    ">
                        <div style="font-size: 120px; margin-bottom: 20px; animation: bounce 1.5s ease-in-out infinite;">🐀</div>
                        <h1 style="
                            color: #ff007f; font-size: 28px; margin-bottom: 15px;
                            text-shadow: 0 0 20px #ff007f, 0 0 40px #ff007f;
                            animation: pulse 1.5s ease-in-out infinite;
                        ">🚫 ИГРА УЖЕ ОТКРЫТА</h1>
                        <h2 style="color: #45f3ff; font-size: 20px; margin-bottom: 20px; text-shadow: 0 0 15px #45f3ff;">
                            в другой вкладке!
                        </h2>
                        <p style="color: #66fcf1; font-size: 15px; max-width: 500px; line-height: 1.7; margin-bottom: 25px; padding: 0 15px;">
                            🎮 Играть одновременно в нескольких вкладках <b style="color:#ffd700;">НЕЛЬЗЯ</b>!<br>
                            Это приведёт к <b style="color:#ff6666;">потере прогресса</b>.<br><br>
                            Закройте <b>эту</b> вкладку и продолжите игру в той,<br>
                            где она была открыта <b style="color:#45f3ff;">первой</b>.
                        </p>
                        <div style="background: rgba(31, 40, 51, 0.8); padding: 15px 25px; border-radius: 12px; border: 2px solid #ffd700; margin-bottom: 20px; max-width: 500px;">
                            <p style="color: #ffd700; font-size: 13px; margin: 0; line-height: 1.6;">
                                ⚠️ <b>Если это ошибка:</b><br>
                                Закройте <b>ВСЕ</b> вкладки с игрой и откройте заново
                            </p>
                        </div>
                        <button onclick="location.reload()" style="
                            background: linear-gradient(135deg, #45f3ff, #66fcf1);
                            color: #0b0c10; border: none; padding: 14px 40px;
                            border-radius: 12px; font-size: 16px; font-weight: bold;
                            cursor: pointer; font-family: 'Segoe UI', sans-serif;
                            box-shadow: 0 0 30px rgba(69, 243, 255, 0.4);
                        ">🔄 Проверить снова</button>
                        <style>
                            @keyframes bounce {
                                0%, 100% { transform: translateY(0) rotate(-5deg); }
                                50% { transform: translateY(-20px) rotate(5deg); }
                            }
                            @keyframes pulse {
                                0%, 100% { text-shadow: 0 0 20px #ff007f, 0 0 40px #ff007f; }
                                50% { text-shadow: 0 0 40px #ff007f, 0 0 80px #ff007f; }
                            }
                        </style>
                    </body>
                `;
                throw new Error('MultiTab blocked');
            }
        }
        
        localStorage.setItem(TAB_KEY, JSON.stringify({
            id: TAB_ID,
            timestamp: Date.now()
        }));
        
    } catch (e) {
        if (e.message === 'MultiTab blocked') {
            throw e;
        }
        console.warn('MultiTab check error:', e);
    }
    
    window._ratTabId = TAB_ID;
    window._ratIsActiveTab = function() {
        try {
            const raw = localStorage.getItem(TAB_KEY);
            if (!raw) return false;
            const data = JSON.parse(raw);
            return data.id === TAB_ID;
        } catch (e) {
            return false;
        }
    };
    
    setInterval(function() {
        try {
            const raw = localStorage.getItem(TAB_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                if (data.id === TAB_ID) {
                    localStorage.setItem(TAB_KEY, JSON.stringify({
                        id: TAB_ID,
                        timestamp: Date.now()
                    }));
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
                if (data.id === TAB_ID) {
                    localStorage.removeItem(TAB_KEY);
                }
            }
        } catch (e) {}
    });
    
    window.addEventListener('pagehide', function() {
        try {
            const raw = localStorage.getItem(TAB_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                if (data.id === TAB_ID) {
                    localStorage.removeItem(TAB_KEY);
                }
            }
        } catch (e) {}
    });
    
})();

// ============================================================
// ==================== СИСТЕМА ВЕРСИЙ ========================
// ============================================================

const GAME_VERSION = '2.0.4';

const UPDATE_CHANGELOG = {
    '2.0.0': '🚀 Полный релиз! Комбинатор, манипуляторы, ГМО яблоки и многое другое!',
    '2.0.1': '🐛 Исправлен баг с какашками и кнопкой сбора',
    '2.0.2': '🔒 Добавлен умный античит! Защита от читерства!',
    '2.0.3': '🔐 Античит полностью скрыт от консоли! Улучшена защита!',
    '2.0.4': '🚫 Защита от мультивкладок! Прогресс больше не теряется!',
};

// ============================================================
// ==================== СКРЫТЫЙ АНТИЧИТ =======================
// ============================================================

const AntiCheat = (function() {
    
    const CONFIG = {
        enabled: true,
        checkInterval: 3000,
        lookbackSeconds: 5,
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
            if (localStorage.getItem('rat_pepperBuffActive') === 'true') {
                hamsterBonus *= 2;
            }
        }
        let buffActive = localStorage.getItem('rat_buffActive') === 'true';
        let buffMult = buffActive ? 2 : 1;
        return Math.floor(base * (1 + bonus / 100) * hamsterBonus * buffMult);
    }
    
    function getAutoClickers() {
        return parseInt(localStorage.getItem('rat_autoClickers')) || 0;
    }
    
    function getGrainData() {
        const grainActive = localStorage.getItem('rat_grainActive') === 'true';
        const grainLevel = parseInt(localStorage.getItem('rat_grainLevel')) || 0;
        const grainBase = parseInt(localStorage.getItem('rat_grainBase')) || 3;
        const superGrainPurchased = localStorage.getItem('rat_superGrainPurchased') === 'true';
        const superGrainActive = localStorage.getItem('rat_superGrainActive') === 'true';
        const mousePurchased = localStorage.getItem('rat_mousePurchased') === 'true';
        const mouseActive = localStorage.getItem('rat_mouseActive') === 'true';
        return { grainActive, grainLevel, grainBase, superGrainPurchased, superGrainActive, mousePurchased, mouseActive };
    }
    
    function calculateMaxPossibleIncome(timeSeconds) {
        const clickPower = getTotalClickPower();
        const maxClicksPerSecond = CONFIG.maxPossibleCPS;
        const maxClickIncome = maxClicksPerSecond * clickPower * timeSeconds;
        const passiveIncome = getAutoClickers() * timeSeconds;
        
        let grainIncome = 0;
        const grainData = getGrainData();
        if (grainData.grainActive && grainData.grainLevel > 0) {
            const grainPerSecond = 1 / 5;
            let grainValue = grainData.grainBase * clickPower;
            if (grainData.superGrainActive && grainData.superGrainPurchased) {
                grainValue = 25 * clickPower;
            }
            grainIncome = grainPerSecond * grainValue * timeSeconds;
        }
        
        let mouseIncome = 0;
        if (grainData.mouseActive && grainData.mousePurchased) {
            mouseIncome = grainIncome * 0.3;
        }
        
        let hamsterBonus = 1.0;
        let hamsterFood = parseFloat(localStorage.getItem('rat_hamsterFood')) || 0;
        let hamsterLevel = parseInt(localStorage.getItem('rat_hamsterLevel')) || 0;
        if (hamsterFood > 0) {
            hamsterBonus = 1.0 + hamsterLevel * 0.1;
        }
        
        let totalPossibleIncome = (maxClickIncome + passiveIncome + grainIncome + mouseIncome) * hamsterBonus;
        
        if (localStorage.getItem('rat_buffActive') === 'true') {
            totalPossibleIncome *= 2;
        }
        
        totalPossibleIncome *= (1 + CONFIG.bufferPercent / 100);
        return Math.floor(totalPossibleIncome);
    }
    
    function showWarning(realGain, maxGain, ratio) {
        if (warningElement) return;
        warningElement = document.createElement('div');
        warningElement.id = 'anticheatWarning';
        warningElement.style.cssText = `
            position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
            background: rgba(255, 165, 0, 0.95); color: #0b0c10;
            padding: 12px 20px; border-radius: 10px; font-weight: bold; font-size: 14px;
            z-index: 9998; box-shadow: 0 0 30px rgba(255, 165, 0, 0.3);
            animation: slideDown 0.5s ease-out; text-align: center; max-width: 90%;
            font-family: 'Segoe UI', sans-serif;
        `;
        warningElement.innerHTML = `
            ⚠️ ПОДОЗРЕНИЕ: Ваш доход (${realGain}) выше допустимого (${maxGain}) в ${ratio.toFixed(0)}%.
            <br><span style="font-size:12px;">Если это ошибка — просто продолжайте играть. (${3 - suspicionLevel} попытки до блокировки)</span>
            <br><span style="font-size:10px;color:#666;">🔒 Античит v${GAME_VERSION}</span>
        `;
        document.body.appendChild(warningElement);
    }
    
    function hideWarning() {
        if (warningElement) {
            warningElement.remove();
            warningElement = null;
        }
    }
    
    function triggerBan(realGain, maxGain, ratio) {
        if (cheatDetected) return;
        cheatDetected = true;
        localStorage.setItem('rat_cheat_detected', 'true');
        
        const banEl = document.createElement('div');
        banEl.id = 'anticheatBan';
        banEl.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.95); color: white;
            padding: 30px 40px; border-radius: 20px; font-weight: bold; font-size: 24px;
            z-index: 10000; box-shadow: 0 0 60px rgba(255, 0, 0, 0.5);
            text-align: center; max-width: 90%; animation: banBlink 0.5s ease-in-out 5;
            border: 3px solid #ffd700; font-family: 'Segoe UI', sans-serif;
        `;
        banEl.innerHTML = `
            <div style="font-size:60px;">🚫</div>
            <div style="margin:15px 0;">ОБНАРУЖЕНО ЧИТЕРСТВО!</div>
            <div style="font-size:16px;opacity:0.8;max-width:400px;">
                Ваш доход (${realGain}) превышает максимально возможный (${maxGain}) в ${ratio.toFixed(0)}%.
            </div>
            <div style="font-size:14px;opacity:0.6;margin-top:10px;">
                Прогресс будет сброшен через 10 секунд...
            </div>
            <div style="font-size:12px;opacity:0.4;margin-top:15px;border-top:1px solid rgba(255,255,255,0.2);padding-top:10px;">
                🔒 Античит v${GAME_VERSION}
            </div>
        `;
        document.body.appendChild(banEl);
        document.body.style.pointerEvents = 'none';
        
        setTimeout(() => {
            localStorage.clear();
            localStorage.setItem('rat_game_version', GAME_VERSION);
            location.reload();
        }, 10000);
    }
    
    function checkBalance() {
        if (!CONFIG.enabled) return;
        if (cheatDetected) return;
        
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
        if (timePassed < 1 || realGain < 0) {
            lastCheckTime = now;
            return;
        }
        
        const maxPossibleGain = calculateMaxPossibleIncome(timePassed);
        const ratio = (realGain / maxPossibleGain) * 100;
        
        localStorage.setItem('rat_checked_score', score);
        localStorage.setItem('rat_checked_time', totalTimePlayed);
        lastCheckTime = now;
        
        if (ratio > CONFIG.banThreshold) {
            triggerBan(realGain, maxPossibleGain, ratio);
            return;
        }
        
        if (ratio > CONFIG.suspicionThreshold) {
            suspicionLevel++;
            isSuspicious = true;
            showWarning(realGain, maxPossibleGain, ratio);
            if (suspicionLevel >= 3) {
                triggerBan(realGain, maxPossibleGain, ratio);
            }
        } else {
            if (isSuspicious) {
                suspicionLevel = 0;
                isSuspicious = false;
                hideWarning();
            }
        }
    }
    
    return {
        start: function() {
            if (timer) return;
            
            if (localStorage.getItem('rat_cheat_detected') === 'true') {
                setTimeout(() => {
                    const banEl = document.createElement('div');
                    banEl.style.cssText = `
                        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                        background: rgba(255, 0, 0, 0.9); color: white;
                        padding: 30px 40px; border-radius: 20px; font-weight: bold; font-size: 24px;
                        z-index: 10000; box-shadow: 0 0 60px rgba(255, 0, 0, 0.5);
                        text-align: center; max-width: 90%; border: 3px solid #ffd700;
                        font-family: 'Segoe UI', sans-serif;
                    `;
                    banEl.innerHTML = `
                        <div style="font-size:60px;">🚫</div>
                        <div style="margin:15px 0;">ВНИМАНИЕ!</div>
                        <div style="font-size:16px;opacity:0.8;max-width:400px;">
                            Ранее было обнаружено читерство. Прогресс сброшен.
                        </div>
                        <div style="font-size:14px;opacity:0.6;margin-top:10px;">
                            Игра будет перезагружена через 5 секунд...
                        </div>
                        <div style="font-size:12px;opacity:0.4;margin-top:15px;border-top:1px solid rgba(255,255,255,0.2);padding-top:10px;">
                            🔒 Античит v${GAME_VERSION} | Играйте честно!
                        </div>
                    `;
                    document.body.appendChild(banEl);
                    document.body.style.pointerEvents = 'none';
                    setTimeout(() => {
                        localStorage.removeItem('rat_cheat_detected');
                        location.reload();
                    }, 5000);
                }, 1000);
                return;
            }
            
            timer = setInterval(checkBalance, CONFIG.checkInterval);
        },
        stop: function() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
            hideWarning();
        }
    };
    
})();

// ============================================================
// ==================== ПЕРЕХВАТ КОНСОЛИ ======================
// ============================================================

Object.defineProperty(window, 'AntiCheat', {
    get: function() { return undefined; },
    set: function() {},
    configurable: false,
    enumerable: false
});

const blockedCommands = [
    'disableAntiCheat', 'enableAntiCheat', 'resetBossCooldown',
    'forceBossDefeat', 'addPlant', 'addPoop', 'addFertilizer'
];

blockedCommands.forEach(cmd => {
    Object.defineProperty(window, cmd, {
        get: function() { 
            console.warn(`🔒 Команда "${cmd}" заблокирована античитом!`);
            return undefined; 
        },
        set: function() {},
        configurable: false,
        enumerable: false
    });
});

// ============================================================
// ==================== ИНИЦИАЛИЗАЦИЯ =========================
// ============================================================

function checkGameVersion() {
    const savedVersion = localStorage.getItem('rat_game_version');
    if (savedVersion !== GAME_VERSION) {
        console.log(`🔄 Обновление игры! ${savedVersion || 'Новая установка'} → ${GAME_VERSION}`);
        localStorage.setItem('rat_game_version', GAME_VERSION);
        showUpdateNotification();
        if (savedVersion && savedVersion < '2.0.4') {
            localStorage.setItem('rat_cheat_detected', 'false');
            localStorage.removeItem('rat_checked_score');
            localStorage.removeItem('rat_checked_time');
        }
    }
}

function showUpdateNotification() {
    const changes = UPDATE_CHANGELOG[GAME_VERSION] || 'Новые функции и улучшения!';
    const notification = document.createElement('div');
    notification.id = 'updateNotification';
    notification.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        background: #1f2833; border: 2px solid #45f3ff; border-radius: 12px;
        padding: 15px 25px; color: #45f3ff; font-family: sans-serif; font-size: 16px;
        z-index: 9999; box-shadow: 0 0 40px rgba(69, 243, 255, 0.3);
        animation: slideDown 0.5s ease-out; text-align: center; max-width: 90%;
    `;
    notification.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:24px;">🎉</span>
            <div>
                <strong>Игра обновлена до версии ${GAME_VERSION}!</strong>
                <div style="font-size:13px;color:#66fcf1;margin-top:4px;">${changes}</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;color:#45f3ff;font-size:20px;cursor:pointer;">✕</button>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        const el = document.getElementById('updateNotification');
        if (el) {
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.5s';
            setTimeout(() => el.remove(), 500);
        }
    }, 10000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        0% { transform: translateX(-50%) translateY(-100px); opacity: 0; }
        100% { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes banBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
    }
`;
document.head.appendChild(style);

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
let hamsterBonus = 1.0;
let hamsterUpgradeCost = 5000;
const MAX_HAMSTER_LEVEL = 4;

let poopCount = parseInt(localStorage.getItem('rat_poopCount')) || 0;
let labPoopCount = parseInt(localStorage.getItem('rat_labPoopCount')) || 0;
let poopTimer = null;

let manipulatorPurchased = localStorage.getItem('rat_manipulatorPurchased') === 'true';
let manipulatorLevel = parseInt(localStorage.getItem('rat_manipulatorLevel')) || 0;
let manipulatorSettings = JSON.parse(localStorage.getItem('rat_manipulatorSettings') || '[{"enabled":false,"action":"none","target":""},{"enabled":false,"action":"none","target":""},{"enabled":false,"action":"none","target":""}]');
let manipulatorTimers = [null, null, null];

let combinerPurchased = localStorage.getItem('rat_combinerPurchased') === 'true';
let combinerLevel = parseInt(localStorage.getItem('rat_combinerLevel')) || 0;
let combinerSlots = [null, null, null];
let combinerRunning = [false, false, false];
let combinerProgress = [0, 0, 0];
let combinerTimer = [null, null, null];

let extracts = JSON.parse(localStorage.getItem('rat_extracts') || '{"gmo_apple": 0, "rat_food": 0}');

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
let machineRunning = false;
let machineProgress = parseFloat(localStorage.getItem('rat_machineProgress')) || 0;
let machineTimer = null;
let fertilizerCount = parseInt(localStorage.getItem('rat_fertilizerCount')) || 0;

if (capybaraCooldown > 600) {
    capybaraCooldown = 600;
    localStorage.setItem('rat_capybaraCooldown', capybaraCooldown);
}

let inventory = JSON.parse(localStorage.getItem('rat_inventory') || '{"food": 0, "gmo_apple": 0}');

let buffActive = localStorage.getItem('rat_buffActive') === 'true';
let buffTimer = null;
let buffType = localStorage.getItem('rat_buffType') || null;

let pepperBuffActive = localStorage.getItem('rat_pepperBuffActive') === 'true';
let pepperBuffTimer = null;

let satietyActive = localStorage.getItem('rat_satietyActive') === 'true';
let satietyTimer = null;

let bossFightActive = false;
let bossHp = 100;
let bossMaxHp = 100;
let bossX = 50;
let bossY = 15;
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

const ACCESSORY_BONUS = {
    hat: 5,
    glasses: 15,
    sword: 30,
    crown: 100
};

const ACCESSORY_PRICES = {
    hat: 1000,
    glasses: 5000,
    sword: 50000,
    crown: 10000000
};

const PLANT_TYPES = {
    grass: { name: 'Трава', emoji: '🌿', growTime: 180, cost: 10000, color: '#45f3ff', desc: 'Кормит свинок на 100%' },
    pepper: { name: 'Болгарский перец', emoji: '🌶️', growTime: 300, cost: 25000, color: '#ff4444', desc: 'Кормит на 100% + x2 буст свинкам на 20 сек' },
    apple: { name: 'Яблоко', emoji: '🍎', growTime: 480, cost: 40000, color: '#ff6b6b', desc: 'Кормит на 100% + насыщение 1 минуту' },
    cabbage: { name: 'Капуста', emoji: '🥬', growTime: 120, cost: 15000, color: '#45f3ff', desc: 'Насыщает на 50% + 💩 5 какашек' }
};

const COMBINER_RECIPES = {
    gmo_apple_extract: {
        name: 'Экстракт ГМО яблока',
        emoji: '🟢',
        ingredients: ['apple', 'fertilizer'],
        time: 300,
        result: 'gmo_apple_extract',
        resultType: 'extract'
    },
    rat_food_extract: {
        name: 'Экстракт крысиного корма',
        emoji: '🔴',
        ingredients: ['apple', 'grass', 'pepper'],
        time: 300,
        result: 'rat_food_extract',
        resultType: 'extract'
    }
};

const EXTRACTOR_RECIPES = {
    gmo_apple_extract: {
        name: 'ГМО яблоко',
        emoji: '🍏',
        time: 60,
        result: 'gmo_apple',
        resultType: 'item'
    },
    rat_food_extract: {
        name: 'Крысиный корм',
        emoji: '🍖',
        time: 60,
        result: 'food',
        resultType: 'item'
    }
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
const poopCountEl = document.getElementById('poopCount');
const fertilizerCountEl = document.getElementById('fertilizerCount');
const machineStatus = document.getElementById('machineStatus');
const machineProgressDiv = document.getElementById('machineProgress');
const machineProgressFill = document.getElementById('machineProgressFill');
const machineProgressText = document.getElementById('machineProgressText');
const machineBtn = document.getElementById('machineBtn');
const machineTimeDisplay = document.getElementById('machineTimeDisplay');
const machineLevelDisplay = document.getElementById('machineLevelDisplay');
const machineUpgradeBtn = document.getElementById('machineUpgradeBtn');

const combinerModal = document.getElementById('combinerModal');
const openCombinerBtn = document.getElementById('openCombiner');
const closeCombinerBtn = document.getElementById('closeCombiner');
const combinerSlotsContainer = document.getElementById('combinerSlots');
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

// ============================================================
// ==================== ФУНКЦИИ МУЗЫКИ =======================
// ============================================================

function getYouTubeEmbedUrl(videoId, autoplay = 0) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay}&loop=1&playlist=${videoId}&controls=0&disablekb=1&modestbranding=1&rel=0&mute=0`;
}

function toggleMusic() {
    musicEnabled = !musicEnabled;
    localStorage.setItem('rat_musicEnabled', musicEnabled);
    const iframe = document.getElementById('youtubePlayer');
    if (iframe) {
        if (musicEnabled) {
            iframe.src = getYouTubeEmbedUrl(musicVideoId, 1);
            musicToggle.textContent = '🔊';
            musicToggle.classList.remove('muted');
        } else {
            iframe.src = getYouTubeEmbedUrl(musicVideoId, 0);
            musicToggle.textContent = '🔇';
            musicToggle.classList.add('muted');
        }
    }
}

function initMusic() {
    const container = document.getElementById('youtubePlayerContainer');
    if (!container) return;
    container.innerHTML = `
        <iframe 
            id="youtubePlayer"
            width="0" 
            height="0" 
            src="${getYouTubeEmbedUrl(musicVideoId, 1)}"
            frameborder="0" 
            allow="autoplay; encrypted-media">
        </iframe>
    `;
    musicEnabled = true;
    localStorage.setItem('rat_musicEnabled', 'true');
    if (musicToggle) {
        musicToggle.textContent = '🔊';
        musicToggle.classList.remove('muted');
        musicToggle.addEventListener('click', toggleMusic);
    }
}

// ============================================================
// ==================== ОСНОВНЫЕ ФУНКЦИИ ======================
// ============================================================

function generateCode() {
    return String(Math.floor(1000 + Math.random() * 9000));
}

let currentCode = generateCode();

function getAccessoryBonus() {
    if (equippedAccessory && ACCESSORY_BONUS[equippedAccessory]) {
        return ACCESSORY_BONUS[equippedAccessory];
    }
    return 0;
}

function getHamsterBonus() {
    if (!hamsterPurchased) return 1.0;
    if (hamsterFood <= 0) return 1.0;
    let bonus = 1.0 + hamsterLevel * 0.1;
    if (pepperBuffActive) {
        bonus = bonus * 2;
    }
    return bonus;
}

function getTotalClickPower() {
    let base = clickPower;
    let bonus = getAccessoryBonus();
    let hamsterMult = getHamsterBonus();
    let buffMult = buffActive ? 2 : 1;
    let power = Math.floor(base * (1 + bonus / 100) * hamsterMult * buffMult);
    return power;
}

function getFeedCost() {
    if (bossMenuPurchased || capybaraPurchased) {
        return 1500;
    }
    return 100;
}

function getMachineTime() {
    const times = [300, 240, 210, 180, 150, 120];
    return times[Math.min(machineLevel, 5)] || 300;
}

function getMachineUpgradeCost() {
    return Math.round(20000 * (machineLevel + 1) * 1.2);
}

function getCombinerSlots() {
    return combinerLevel === 0 ? 2 : 3;
}

function getManipulatorCount() {
    return manipulatorLevel;
}

function isAllLabPartsBought() {
    return labPurchased && plantPurchased && plantUpgrade1 && plantUpgrade2 &&
           plantTypeGrass && plantTypePepper && plantTypeApple && plantTypeCabbage &&
           combinerPurchased && extractorPurchased;
}

function saveGame() {
    if (window._ratIsActiveTab && !window._ratIsActiveTab()) {
        return;
    }
    
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
    localStorage.setItem('rat_machineProgress', machineProgress);
    localStorage.setItem('rat_fertilizerCount', fertilizerCount);
    localStorage.setItem('rat_combinerPurchased', combinerPurchased);
    localStorage.setItem('rat_combinerLevel', combinerLevel);
    localStorage.setItem('rat_extractorPurchased', extractorPurchased);
    localStorage.setItem('rat_extractorQueue', JSON.stringify(extractorQueue));
    localStorage.setItem('rat_extractorProgress', JSON.stringify(extractorProgress));
    localStorage.setItem('rat_extracts', JSON.stringify(extracts));
    localStorage.setItem('rat_manipulatorPurchased', manipulatorPurchased);
    localStorage.setItem('rat_manipulatorLevel', manipulatorLevel);
    localStorage.setItem('rat_manipulatorSettings', JSON.stringify(manipulatorSettings));
    localStorage.setItem('rat_buffActive', buffActive);
    localStorage.setItem('rat_buffType', buffType || '');
    localStorage.setItem('rat_pepperBuffActive', pepperBuffActive);
    localStorage.setItem('rat_satietyActive', satietyActive);
}

function showReloadNotification() {
    reloadTimerSeconds = 10;
    timerNumber.textContent = reloadTimerSeconds;
    reloadBtn.disabled = true;
    reloadBtn.textContent = '⏳ Ожидайте...';
    reloadNotification.classList.add('open');
    if (reloadTimerInterval) clearInterval(reloadTimerInterval);
    reloadTimerInterval = setInterval(() => {
        reloadTimerSeconds--;
        timerNumber.textContent = reloadTimerSeconds;
        if (reloadTimerSeconds <= 0) {
            clearInterval(reloadTimerInterval);
            reloadTimerInterval = null;
            reloadBtn.disabled = false;
            reloadBtn.textContent = '🔄 Перезагрузить игру';
        }
    }, 1000);
}

function clearAllIntervals() {
    const intervals = [
        grainSpawnTimeout, grainTimerInterval, grainLifeTimeout,
        mouseMoveInterval, hamsterMoveInterval, foodDepletionInterval,
        reloadTimerInterval, poopTimer, machineTimer,
        bossMoveInterval, bossShootInterval, bossCooldownInterval, bossFightInterval,
        buffTimer, pepperBuffTimer, satietyTimer,
        ...combinerTimer,
        extractorTimer,
        ...manipulatorTimers,
        ...plantIntervals
    ];
    
    intervals.forEach(interval => {
        if (interval) {
            clearInterval(interval);
            clearTimeout(interval);
        }
    });
    
    for (let i = 0; i < combinerTimer.length; i++) {
        combinerTimer[i] = null;
        combinerRunning[i] = false;
        combinerProgress[i] = 0;
    }
    for (let i = 0; i < manipulatorTimers.length; i++) {
        manipulatorTimers[i] = null;
    }
    for (let i = 0; i < plantIntervals.length; i++) {
        plantIntervals[i] = null;
    }
    
    grainSpawnTimeout = null;
    grainTimerInterval = null;
    grainLifeTimeout = null;
    mouseMoveInterval = null;
    hamsterMoveInterval = null;
    foodDepletionInterval = null;
    reloadTimerInterval = null;
    poopTimer = null;
    machineTimer = null;
    bossMoveInterval = null;
    bossShootInterval = null;
    bossCooldownInterval = null;
    bossFightInterval = null;
    buffTimer = null;
    pepperBuffTimer = null;
    satietyTimer = null;
    extractorTimer = null;
}

function resetAllProgress() {
    score = 0;
    clickPower = 1;
    autoClickers = 0;
    clickLevel = 0;
    autoLevel = 0;
    grainLevel = 0;
    grainBase = 3;
    grainActive = false;
    ownedAccessories = [];
    equippedAccessory = null;
    grainPurchased = 0;
    superGrainPurchased = false;
    superGrainActive = false;
    mousePurchased = false;
    mouseActive = false;
    hamsterPurchased = false;
    hamsterLevel = 0;
    hamsterFood = 0;
    bossMenuPurchased = false;
    capybaraPurchased = false;
    capybaraCooldown = 0;
    capybaraDefeated = false;
    inventory = { food: 0, gmo_apple: 0 };
    buffActive = false;
    buffType = null;
    pepperBuffActive = false;
    satietyActive = false;
    plantPurchased = false;
    plantLevel = 0;
    plantUpgrade1 = false;
    plantUpgrade2 = false;
    plantTypeGrass = false;
    plantTypePepper = false;
    plantTypeApple = false;
    plantTypeCabbage = false;
    plantInventory = { grass: 0, pepper: 0, apple: 0, cabbage: 0 };
    plantData = [
        { stage: 'idle', progress: 0, type: null, fertilizer: false },
        { stage: 'idle', progress: 0, type: null, fertilizer: false },
        { stage: 'idle', progress: 0, type: null, fertilizer: false }
    ];
    poopCount = 0;
    labPoopCount = 0;
    labPurchased = false;
    machineLevel = 0;
    machineProgress = 0;
    machineRunning = false;
    fertilizerCount = 0;
    combinerPurchased = false;
    combinerLevel = 0;
    combinerSlots = [null, null, null];
    combinerRunning = [false, false, false];
    combinerProgress = [0, 0, 0];
    extractorPurchased = false;
    extractorQueue = [];
    extractorProgress = [];
    extracts = { gmo_apple: 0, rat_food: 0 };
    manipulatorPurchased = false;
    manipulatorLevel = 0;
    manipulatorSettings = [
        { enabled: false, action: 'none', target: '' },
        { enabled: false, action: 'none', target: '' },
        { enabled: false, action: 'none', target: '' }
    ];
    MAX_CLICK_LEVEL = 10;
    
    clearAllIntervals();
    AntiCheat.stop();
    
    localStorage.removeItem('rat_cheat_detected');
    localStorage.removeItem('rat_checked_score');
    localStorage.removeItem('rat_checked_time');
    localStorage.removeItem('rat_totalClicks');
    localStorage.removeItem('rat_totalTimePlayed');
    localStorage.removeItem('rat_buffActive');
    localStorage.removeItem('rat_buffType');
    localStorage.removeItem('rat_pepperBuffActive');
    localStorage.removeItem('rat_satietyActive');
    
    localStorage.clear();
    saveGame();
    savePlantData();
    updateUI();
    currentCode = generateCode();
    codeDisplay.textContent = currentCode;
    codeInput.value = '';
    confirmBox.classList.remove('show');
    confirmResetBtn.disabled = true;
    resetStatus.textContent = '✅ Прогресс сброшен!';
    resetStatus.style.color = '#45f3ff';
    setTimeout(() => {
        resetModal.classList.remove('open');
        resetStatus.textContent = '';
        showReloadNotification();
    }, 500);
}

reloadBtn.addEventListener('click', function() {
    if (!this.disabled) {
        location.reload();
    }
});

// ============================================================
// ==================== СИСТЕМА КАКАШЕК ======================
// ============================================================

function startPoopProduction() {
    if (poopTimer) clearInterval(poopTimer);
    poopTimer = setInterval(() => {
        if (hamsterPurchased && hamsterFood > 0) {
            let chance = 10 + hamsterLevel * 2;
            if (Math.random() * 100 < chance) {
                poopCount++;
                saveGame();
                updateUI();
            }
        }
    }, 30000);
}

// ============================================================
// ==================== СИСТЕМА РАСТЕНИЙ ======================
// ============================================================

function getPlantMaxTime(type, hasFertilizer = false) {
    let base = 0;
    if (type === 'grass') base = 180;
    else if (type === 'pepper') base = 300;
    else if (type === 'apple') base = 480;
    else if (type === 'cabbage') base = 120;
    else base = 180;
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
        if (type === 'apple') return '🍎';
        if (type === 'cabbage') return '🥬';
        return '🌿';
    }
    return '🪴';
}

function getPlantStatusText(stage, progress) {
    if (stage === 'idle') return '💧 Полить';
    if (stage === 'growing') {
        return `🌱 ${Math.round(progress)}%`;
    }
    if (stage === 'ready') return '✅ Собрать!';
    return '💧 Полить';
}

function getPlantStatusClass(stage) {
    if (stage === 'idle') return 'water';
    if (stage === 'growing') return '';
    if (stage === 'ready') return 'ready-status';
    return '';
}

function updatePlantsUI() {
    const container = document.getElementById('plantsContainer');
    const grid = document.getElementById('plantsGrid');
    const totalPlants = plantLevel;
    if (totalPlants === 0 || !plantPurchased) {
        container.style.display = 'none';
        container.classList.remove('visible');
        return;
    }
    container.style.display = 'flex';
    container.classList.add('visible');
    grid.innerHTML = '';
    for (let i = 0; i < totalPlants; i++) {
        const data = plantData[i];
        if (!data) continue;
        const pot = document.createElement('div');
        pot.className = 'plant-pot';
        pot.dataset.index = i;
        const typeLabel = document.createElement('div');
        typeLabel.className = 'plant-type';
        if (data.type) {
            typeLabel.textContent = PLANT_TYPES[data.type]?.name || 'Пусто';
            typeLabel.style.color = PLANT_TYPES[data.type]?.color || '#888';
        } else {
            typeLabel.textContent = 'Пусто';
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
        pot.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            interactWithPlant(index);
        });
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

        if (availableTypes.length === 0) {
            alert('🌱 У вас нет семян! Купите тип растения в магазине (вкладка "Бусты").');
            return;
        }

        let choices = availableTypes.map((t, i) => {
            let info = PLANT_TYPES[t];
            return `${i+1}. ${info.emoji} ${info.name} (${Math.round(info.growTime/60)} мин)`;
        }).join('\n');

        let choice = prompt(`Выберите тип растения для горшка ${index+1}:\n\n${choices}`, '1');
        if (choice === null) return;

        let idx = parseInt(choice) - 1;
        if (idx >= 0 && idx < availableTypes.length) {
            data.type = availableTypes[idx];
            data.stage = 'idle';
            data.progress = 0;
            data.fertilizer = false;
            savePlantData();
            updatePlantsUI();
            updateUI();
            alert(`🌱 Вы выбрали ${PLANT_TYPES[data.type].name}! Теперь полейте горшок.`);
        }
        return;
    }

    if (data.stage === 'idle') {
        if (fertilizerCount > 0 && confirm('🧪 Использовать удобрение для ускорения роста в 2 раза?')) {
            fertilizerCount--;
            data.fertilizer = true;
            saveGame();
            savePlantData();
            alert('🧪 Удобрение применено! Растение будет расти в 2 раза быстрее!');
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
        if (!type) {
            alert('❌ Ошибка: тип растения не определён!');
            return;
        }

        if (!PLANT_TYPES[type]) {
            alert('❌ Ошибка: неизвестный тип растения!');
            return;
        }

        if (plantInventory[type] === undefined) {
            plantInventory[type] = 0;
        }
        plantInventory[type] = plantInventory[type] + 1;

        data.stage = 'idle';
        data.progress = 0;
        data.type = null;
        data.fertilizer = false;

        savePlantData();
        saveGame();
        updatePlantsUI();
        updateUI();

        const info = PLANT_TYPES[type];
        alert(`🌿 ${info.name} собрана в инвентарь! (x${plantInventory[type]})`);
        return;
    }

    if (data.stage === 'growing') {
        alert('🌱 Растение ещё растёт! Подождите немного.');
        return;
    }
}

function startPlantGrowth(index) {
    const data = plantData[index];
    if (!data || !data.type) return;
    if (plantIntervals[index]) {
        clearInterval(plantIntervals[index]);
        plantIntervals[index] = null;
    }
    const maxTime = getPlantMaxTime(data.type, data.fertilizer);
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
            if (parsed.length === 3) {
                plantData = parsed;
                for (let i = 0; i < plantData.length; i++) {
                    if (plantData[i].stage === 'growing') {
                        startPlantGrowth(i);
                    }
                }
                return;
            }
        } catch(e) {}
    }
    plantData = [
        { stage: 'idle', progress: 0, type: null, fertilizer: false },
        { stage: 'idle', progress: 0, type: null, fertilizer: false },
        { stage: 'idle', progress: 0, type: null, fertilizer: false }
    ];
    const savedInv = localStorage.getItem('rat_plantInventory');
    if (savedInv) {
        try {
            const parsed = JSON.parse(savedInv);
            if (parsed.grass !== undefined) plantInventory = parsed;
        } catch(e) {}
    }
}

// ============================================================
// ==================== СИСТЕМА ЛАБОРАТОРИИ ===================
// ============================================================

function updateLabUI() {
    if (!labPurchased) return;
    poopCountEl.textContent = labPoopCount;
    fertilizerCountEl.textContent = fertilizerCount;

    if (machineRunning) {
        machineStatus.textContent = '⚙️ Работает...';
        machineStatus.className = 'machine-status running';
        machineProgressDiv.style.display = 'block';
        machineBtn.disabled = true;
        machineBtn.textContent = '⏳ Обработка...';
    } else if (machineProgress >= getMachineTime() && machineProgress > 0) {
        machineStatus.textContent = '✅ Готово! Нажмите для сбора';
        machineStatus.className = 'machine-status complete';
        machineProgressDiv.style.display = 'block';
        machineBtn.disabled = false;
        machineBtn.textContent = '🧪 Собрать удобрение';
    } else {
        machineStatus.textContent = '⏸️ Бездействует';
        machineStatus.className = 'machine-status';
        machineProgressDiv.style.display = 'none';
        machineBtn.disabled = (labPoopCount < 7);
        machineBtn.textContent = '🔧 Запустить (7 💩 → 1 🧪)';
    }

    const maxTime = getMachineTime();
    let percent = Math.min(100, (machineProgress / maxTime) * 100);
    machineProgressFill.style.width = percent + '%';
    machineProgressText.textContent = Math.round(percent) + '%';

    const timeMinutes = Math.floor(maxTime / 60);
    machineTimeDisplay.textContent = timeMinutes;
    machineLevelDisplay.textContent = machineLevel;

    if (machineLevel >= 5) {
        machineUpgradeBtn.disabled = true;
        machineUpgradeBtn.textContent = '⭐ MAX';
    } else {
        const cost = getMachineUpgradeCost();
        machineUpgradeBtn.disabled = (score < cost);
        machineUpgradeBtn.textContent = `⬆️ Улучшить (${cost})`;
    }
}

function startMachine() {
    if (machineRunning) {
        alert('⏳ Станок уже работает!');
        return;
    }

    if (labPoopCount < 7) {
        alert('💩 Нужно 7 какашек для запуска станка! Сейчас: ' + labPoopCount);
        return;
    }

    labPoopCount = labPoopCount - 7;
    machineRunning = true;
    machineProgress = 0;
    const maxTime = getMachineTime();

    saveGame();
    updateLabUI();
    updateUI();

    if (machineTimer) clearInterval(machineTimer);
    machineTimer = setInterval(() => {
        machineProgress++;
        saveGame();
        updateLabUI();
        if (machineProgress >= maxTime) {
            clearInterval(machineTimer);
            machineTimer = null;
            machineRunning = false;
            machineProgress = maxTime;
            fertilizerCount = fertilizerCount + 1;
            updateLabUI();
            saveGame();
            alert('🧪 Станок завершил работу!\n7 какашек → 1 удобрение!');
        }
    }, 1000);
}

function collectFertilizer() {
    if (machineProgress < getMachineTime()) return;
    fertilizerCount++;
    machineProgress = 0;
    machineRunning = false;
    saveGame();
    updateLabUI();
    alert('🧪 Удобрение получено!');
}

function upgradeMachine() {
    if (machineLevel >= 5) {
        alert('⭐ Максимальный уровень достигнут!');
        return;
    }
    const cost = getMachineUpgradeCost();
    if (score < cost) {
        alert(`Не хватает монет! Нужно ${cost} $RAT`);
        return;
    }
    score -= cost;
    machineLevel++;
    saveGame();
    updateUI();
    updateLabUI();
    alert(`⬆️ Станок улучшен до уровня ${machineLevel}!`);
}

// ============================================================
// ==================== СИСТЕМА КОМБИНАТОРА ===================
// ============================================================

function checkRecipe(ingredients) {
    let valid = ingredients.filter(i => i !== null);
    if (valid.length === 0) return null;

    for (let [recipeId, recipe] of Object.entries(COMBINER_RECIPES)) {
        let recipeCopy = [...recipe.ingredients];
        let matched = true;

        for (let item of valid) {
            let index = recipeCopy.indexOf(item);
            if (index === -1) {
                matched = false;
                break;
            }
            recipeCopy.splice(index, 1);
        }

        if (matched && recipeCopy.length === 0) {
            return recipeId;
        }
    }
    return null;
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

            if (item === 'apple') { displayName = 'Яблоко'; emoji = '🍎'; }
            else if (item === 'grass') { displayName = 'Трава'; emoji = '🌿'; }
            else if (item === 'pepper') { displayName = 'Перец'; emoji = '🌶️'; }
            else if (item === 'fertilizer') { displayName = 'Удобрение'; emoji = '🧪'; }

            slot.innerHTML = `
                <div class="slot-item">
                    <div class="slot-emoji">${emoji}</div>
                    <div class="slot-name">${displayName}</div>
                    <div class="slot-remove" onclick="removeFromCombiner(${i})">✕</div>
                </div>
            `;
        } else {
            slot.innerHTML = `
                <div class="slot-empty" onclick="selectForCombiner(${i})">
                    ➕ Пусто
                </div>
            `;
        }

        combinerSlotsContainer.appendChild(slot);
    }

    const resultSlot = document.createElement('div');
    resultSlot.className = 'combiner-result-slot';

    const recipeId = checkRecipe(combinerSlots);
    const isRunning = combinerRunning.some(r => r);

    if (recipeId && !isRunning) {
        const recipe = COMBINER_RECIPES[recipeId];
        resultSlot.innerHTML = `
            <div class="result-item">
                <div class="result-arrow">➡️</div>
                <div class="result-emoji">${recipe.emoji}</div>
                <div class="result-name">${recipe.name}</div>
                <div class="result-time">⏱️ ${Math.round(recipe.time/60)} мин</div>
                <button class="craft-btn" onclick="startCraft('${recipeId}')">🔧 СКРАФТИТЬ</button>
            </div>
        `;
    } else if (isRunning) {
        let progress = 0;
        for (let i = 0; i < combinerRunning.length; i++) {
            if (combinerRunning[i]) {
                progress = combinerProgress[i] || 0;
                break;
            }
        }
        resultSlot.innerHTML = `
            <div class="result-item">
                <div class="result-emoji">⚙️</div>
                <div class="result-name">Крафтится...</div>
                <div class="result-progress">${Math.round(progress)}%</div>
                <div class="result-bar"><div class="result-fill" style="width:${progress}%"></div></div>
            </div>
        `;
    } else {
        resultSlot.innerHTML = `
            <div class="result-item empty">
                <div class="result-emoji">❓</div>
                <div class="result-name">Положите ингредиенты</div>
            </div>
        `;
    }

    combinerSlotsContainer.appendChild(resultSlot);
}

function selectForCombiner(index) {
    let availableItems = [];
    if (plantInventory.apple > 0) availableItems.push({ id: 'apple', name: 'Яблоко', emoji: '🍎', count: plantInventory.apple });
    if (plantInventory.grass > 0) availableItems.push({ id: 'grass', name: 'Трава', emoji: '🌿', count: plantInventory.grass });
    if (plantInventory.pepper > 0) availableItems.push({ id: 'pepper', name: 'Перец', emoji: '🌶️', count: plantInventory.pepper });
    if (fertilizerCount > 0) availableItems.push({ id: 'fertilizer', name: 'Удобрение', emoji: '🧪', count: fertilizerCount });

    if (availableItems.length === 0) {
        alert('❌ У вас нет предметов для крафта!');
        return;
    }

    let choices = availableItems.map((item, i) => {
        return `${i+1}. ${item.emoji} ${item.name} (x${item.count})`;
    }).join('\n');

    let choice = prompt(`Выберите предмет для слота ${index+1}:\n\n${choices}`, '1');
    if (choice === null) return;

    let idx = parseInt(choice) - 1;
    if (idx >= 0 && idx < availableItems.length) {
        const item = availableItems[idx];

        let countInSlots = combinerSlots.filter(s => s === item.id).length;
        let maxCount = item.id === 'fertilizer' ? fertilizerCount : plantInventory[item.id] || 0;

        if (countInSlots >= maxCount) {
            alert(`❌ У вас нет столько ${item.name}!`);
            return;
        }

        combinerSlots[index] = item.id;
        saveGame();
        updateCombinerUI();
        updateUI();
    }
}

function removeFromCombiner(index) {
    combinerSlots[index] = null;
    saveGame();
    updateCombinerUI();
    updateUI();
}

function startCraft(recipeId) {
    if (combinerRunning.some(r => r)) {
        alert('⏳ Комбинатор уже работает!');
        return;
    }

    const recipe = COMBINER_RECIPES[recipeId];
    if (!recipe) return;

    const slotIngredients = combinerSlots.filter(s => s !== null);
    let recipeCopy = [...recipe.ingredients];
    for (let item of slotIngredients) {
        let index = recipeCopy.indexOf(item);
        if (index === -1) {
            alert('❌ Ошибка: ингредиенты не совпадают с рецептом!');
            return;
        }
        recipeCopy.splice(index, 1);
    }
    if (recipeCopy.length !== 0) {
        alert('❌ Ошибка: не все ингредиенты для рецепта!');
        return;
    }

    for (let item of slotIngredients) {
        if (item === 'fertilizer') {
            fertilizerCount--;
        } else {
            plantInventory[item]--;
        }
    }

    let slotIndex = combinerRunning.indexOf(false);
    if (slotIndex === -1) slotIndex = 0;

    combinerRunning[slotIndex] = true;
    combinerProgress[slotIndex] = 0;
    combinerSlots = [null, null, null];

    saveGame();
    updateCombinerUI();
    updateUI();

    if (combinerTimer[slotIndex]) {
        clearInterval(combinerTimer[slotIndex]);
        combinerTimer[slotIndex] = null;
    }

    combinerTimer[slotIndex] = setInterval(() => {
        combinerProgress[slotIndex] += (100 / recipe.time);
        if (combinerProgress[slotIndex] >= 100) {
            combinerProgress[slotIndex] = 100;
            clearInterval(combinerTimer[slotIndex]);
            combinerTimer[slotIndex] = null;

            const result = recipe.result;
            const resultType = recipe.resultType;

            if (resultType === 'extract') {
                if (extractorPurchased) {
                    extractorQueue.push(result);
                    extractorProgress.push(0);
                    saveGame();
                    updateCombinerUI();
                    updateUI();
                    updateExtractorUI();
                    alert('✅ ' + recipe.name + ' создан и отправлен в аппарат превращения!');
                } else {
                    if (extracts[result] === undefined) extracts[result] = 0;
                    extracts[result]++;
                    saveGame();
                    updateCombinerUI();
                    updateUI();
                    alert('⚠️ ' + recipe.name + ' создан! Нужен Аппарат превращения (20 000 $RAT в магазине).');
                }
            }

            combinerRunning[slotIndex] = false;
            combinerProgress[slotIndex] = 0;
            saveGame();
            updateCombinerUI();
            updateUI();
        }
        saveGame();
        updateCombinerUI();
    }, 1000);
}

// ============================================================
// ==================== СИСТЕМА ЭКСТРАКТОРА ===================
// ============================================================

function updateExtractorUI() {
    if (!extractorPurchased) return;

    extractorQueueEl.innerHTML = '';
    if (extractorQueue.length === 0) {
        extractorQueueEl.innerHTML = '<div class="extractor-empty">⏳ Очередь пуста</div>';
        extractorStatus.textContent = '⏸️ Бездействует';
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
        extractorStatus.textContent = '⚙️ Обработка...';
    }

    if (extractorQueue.length > 0 && !extractorTimer) {
        startExtractorProcessing();
    }
}

function startExtractorProcessing() {
    if (extractorTimer) {
        clearInterval(extractorTimer);
        extractorTimer = null;
    }

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

            const finishedRecipe = EXTRACTOR_RECIPES[finishedItem];
            if (finishedRecipe) {
                if (finishedItem === 'rat_food_extract') {
                    if (!inventory.food) inventory.food = 0;
                    inventory.food++;
                    alert('🍖 Крысиный корм готов!');
                } else if (finishedItem === 'gmo_apple_extract') {
                    if (!inventory.gmo_apple) inventory.gmo_apple = 0;
                    inventory.gmo_apple++;
                    alert('🍏 ГМО яблоко готово!');
                }
            }

            saveGame();
            updateExtractorUI();
            updateUI();

            if (extractorQueue.length > 0) {
                startExtractorProcessing();
            }
        }
        saveGame();
        updateExtractorUI();
    }, 1000);
}

// ============================================================
// ==================== СИСТЕМА МАНИПУЛЯТОРОВ =================
// ============================================================

function updateManipulatorUI() {
    const count = getManipulatorCount();

    if (count === 0 || !manipulatorPurchased) {
        if (manipulatorContainer) manipulatorContainer.style.display = 'none';
        return;
    }

    if (manipulatorContainer) manipulatorContainer.style.display = 'flex';

    for (let i = 0; i < 3; i++) {
        const box = manipBoxes[i];
        const toggle = manipToggles[i];
        const status = manipStatuses[i];
        const settingsBtn = manipSettingsBtns[i];
        const label = manipLabels[i];

        if (i < count) {
            if (box) box.style.display = 'flex';
            if (toggle) toggle.style.display = 'flex';
            if (status) status.style.display = 'block';
            if (settingsBtn) settingsBtn.style.display = 'block';
            if (label) label.style.display = 'block';

            const setting = manipulatorSettings[i] || { enabled: false, action: 'none', target: '' };

            if (toggle) {
                toggle.classList.toggle('active', setting.enabled);
                const newToggle = toggle.cloneNode(true);
                toggle.parentNode.replaceChild(newToggle, toggle);
                manipToggles[i] = newToggle;
                newToggle.addEventListener('click', function() {
                    const idx = parseInt(this.id.replace('manipToggle', '')) - 1;
                    const setting = manipulatorSettings[idx] || { enabled: false, action: 'none', target: '' };
                    setting.enabled = !setting.enabled;
                    manipulatorSettings[idx] = setting;
                    localStorage.setItem('rat_manipulatorSettings', JSON.stringify(manipulatorSettings));
                    saveGame();
                    updateManipulatorUI();
                    updateUI();
                    restartManipulators();
                });
            }

            if (status) {
                if (setting.enabled) {
                    status.textContent = 'Вкл';
                    status.className = 'manip-status on';
                } else {
                    status.textContent = 'Выкл';
                    status.className = 'manip-status';
                }
            }

            let actionText = '🤖 Бездействует';
            if (setting.action === 'feed_hamsters') {
                actionText = '🤖 Кормит свинок';
            } else if (setting.action === 'craft_gmo_apple') {
                actionText = '🤖 Крафтит 🍏 ГМО яблоко';
            } else if (setting.action === 'craft_rat_food') {
                actionText = '🤖 Крафтит 🔴 экстракт корма';
            } else if (setting.action === 'move_extracts') {
                actionText = '🤖 Перекладывает экстракты';
            } else if (setting.action === 'make_fertilizer') {
                actionText = '🤖 Делает удобрения';
            }
            if (label) label.textContent = actionText;

            if (settingsBtn) {
                const newSettingsBtn = settingsBtn.cloneNode(true);
                settingsBtn.parentNode.replaceChild(newSettingsBtn, settingsBtn);
                manipSettingsBtns[i] = newSettingsBtn;
                newSettingsBtn.addEventListener('click', function() {
                    const idx = parseInt(this.id.replace('manipSettings', '')) - 1;
                    openManipulatorSettings(idx);
                });
            }

        } else {
            if (box) box.style.display = 'none';
            if (toggle) toggle.style.display = 'none';
            if (status) status.style.display = 'none';
            if (settingsBtn) settingsBtn.style.display = 'none';
            if (label) label.style.display = 'none';
        }
    }
}

function openManipulatorSettings(index) {
    const setting = manipulatorSettings[index] || { enabled: false, action: 'none', target: '' };

    let html = `
        <div class="settings-section">
            <h3>🤖 Манипулятор ${index + 1}</h3>
            <div class="settings-row">
                <label>Действие:</label>
                <select id="manipAction">
                    <option value="none" ${setting.action === 'none' ? 'selected' : ''}>Бездействует</option>
                    <option value="feed_hamsters" ${setting.action === 'feed_hamsters' ? 'selected' : ''}>🍖 Кормить свинок</option>
                    <option value="craft" ${setting.action === 'craft' ? 'selected' : ''}>🔧 Крафтить</option>
                    <option value="move_extracts" ${setting.action === 'move_extracts' ? 'selected' : ''}>🔄 Перекладывать экстракты</option>
                    <option value="make_fertilizer" ${setting.action === 'make_fertilizer' ? 'selected' : ''}>🧪 Делать удобрения</option>
                </select>
            </div>
            <div class="settings-row" id="craftRow" style="${setting.action === 'craft' ? '' : 'display:none;'}">
                <label>Что крафтить:</label>
                <select id="craftTarget">
                    <option value="gmo_apple" ${setting.target === 'gmo_apple' ? 'selected' : ''}>🍏 ГМО яблоко (Яблоко + Удобрение)</option>
                    <option value="rat_food" ${setting.target === 'rat_food' ? 'selected' : ''}>🔴 Экстракт корма (Яблоко + Трава + Перец)</option>
                </select>
            </div>
            <div class="settings-row" id="feedRow" style="${setting.action === 'feed_hamsters' ? '' : 'display:none;'}">
                <label>Чем кормить:</label>
                <select id="feedTarget">
                    <option value="money" ${setting.target === 'money' ? 'selected' : ''}>💵 Деньги</option>
                    <option value="grass" ${setting.target === 'grass' ? 'selected' : ''}>🌿 Трава</option>
                    <option value="apple" ${setting.target === 'apple' ? 'selected' : ''}>🍎 Яблоко</option>
                    <option value="cabbage" ${setting.target === 'cabbage' ? 'selected' : ''}>🥬 Капуста</option>
                </select>
            </div>
            <button class="settings-save-btn" onclick="saveManipulatorSettings(${index})">💾 Сохранить</button>
        </div>
    `;

    settingsContent.innerHTML = html;
    settingsModal.classList.add('open');
    settingsModal.style.display = 'flex';

    document.getElementById('manipAction').addEventListener('change', function() {
        const craftRow = document.getElementById('craftRow');
        const feedRow = document.getElementById('feedRow');
        if (this.value === 'craft') {
            craftRow.style.display = '';
            feedRow.style.display = 'none';
        } else if (this.value === 'feed_hamsters') {
            craftRow.style.display = 'none';
            feedRow.style.display = '';
        } else {
            craftRow.style.display = 'none';
            feedRow.style.display = 'none';
        }
    });
}

function saveManipulatorSettings(index) {
    const action = document.getElementById('manipAction').value;
    let target = '';

    if (action === 'craft') {
        target = document.getElementById('craftTarget').value;
    } else if (action === 'feed_hamsters') {
        target = document.getElementById('feedTarget').value;
    }

    manipulatorSettings[index] = {
        enabled: manipulatorSettings[index]?.enabled || false,
        action: action,
        target: target
    };

    localStorage.setItem('rat_manipulatorSettings', JSON.stringify(manipulatorSettings));
    saveGame();
    updateManipulatorUI();
    updateUI();

    settingsModal.classList.remove('open');
    settingsModal.style.display = 'none';

    restartManipulators();
}

function restartManipulators() {
    for (let i = 0; i < manipulatorTimers.length; i++) {
        if (manipulatorTimers[i]) {
            clearInterval(manipulatorTimers[i]);
            manipulatorTimers[i] = null;
        }
    }

    for (let i = 0; i < getManipulatorCount(); i++) {
        const setting = manipulatorSettings[i];
        if (setting && setting.enabled && setting.action !== 'none') {
            startManipulator(i);
        }
    }
}

function startManipulator(index) {
    if (manipulatorTimers[index]) {
        clearInterval(manipulatorTimers[index]);
        manipulatorTimers[index] = null;
    }

    const setting = manipulatorSettings[index];
    if (!setting || !setting.enabled || setting.action === 'none') return;

    manipulatorTimers[index] = setInterval(() => {
        executeManipulatorAction(index);
    }, 5000);
}

function executeManipulatorAction(index) {
    const setting = manipulatorSettings[index];
    if (!setting || !setting.enabled) return;

    switch (setting.action) {
        case 'feed_hamsters':
            if (!hamsterPurchased) return;
            if (hamsterFood >= hamsterMaxFood) return;

            if (setting.target === 'money') {
                let cost = getFeedCost();
                if (score >= cost) {
                    score -= cost;
                    hamsterFood = Math.min(hamsterMaxFood, hamsterFood + 20);
                    saveGame();
                    updateUI();
                }
            } else {
                let item = setting.target;
                if (plantInventory[item] > 0) {
                    plantInventory[item]--;
                    hamsterFood = Math.min(hamsterMaxFood, hamsterFood + 20);
                    saveGame();
                    updateUI();
                }
            }
            break;

        case 'craft':
            if (combinerRunning.some(r => r)) return;
            
            if (setting.target === 'gmo_apple') {
                if (plantInventory.apple < 1 || fertilizerCount < 1) return;
                combinerSlots = ['apple', 'fertilizer', null];
            } else if (setting.target === 'rat_food') {
                if (plantInventory.apple < 1 || plantInventory.grass < 1 || plantInventory.pepper < 1) return;
                combinerSlots = ['apple', 'grass', 'pepper'];
            } else {
                return;
            }
            
            let recipeId = checkRecipe(combinerSlots);
            if (recipeId) {
                startCraft(recipeId);
            }
            break;

        case 'move_extracts':
            break;

        case 'make_fertilizer':
            if (machineRunning) return;
            if (labPoopCount >= 7) {
                startMachine();
            }
            break;
    }
}

// ============================================================
// ==================== ФУНКЦИЯ ПРИМЕНЕНИЯ УДОБРЕНИЯ =========
// ============================================================

function useFertilizer() {
    if (fertilizerCount <= 0) {
        alert('🧪 У вас нет удобрений! Сначала получите их в лаборатории.');
        return;
    }

    let availablePlants = [];
    for (let i = 0; i < plantData.length; i++) {
        if (plantData[i].stage === 'idle' || (plantData[i].stage === 'growing' && !plantData[i].fertilizer && plantData[i].type)) {
            availablePlants.push({
                index: i,
                type: plantData[i].type,
                progress: plantData[i].progress,
                stage: plantData[i].stage,
                name: plantData[i].type ? (PLANT_TYPES[plantData[i].type]?.name || 'Неизвестно') : 'Пустой горшок',
                emoji: plantData[i].type ? (PLANT_TYPES[plantData[i].type]?.emoji || '🪴') : '🪴'
            });
        }
    }

    if (availablePlants.length === 0) {
        alert('🌱 Нет горшков для применения удобрения!');
        return;
    }

    if (availablePlants.length === 1) {
        let plant = availablePlants[0];
        if (confirm('🧪 Применить удобрение к ' + plant.emoji + ' ' + plant.name + ' (горшок ' + (plant.index + 1) + ')?')) {
            fertilizerCount--;
            applyFertilizerToPlant(plant.index);
        }
        return;
    }

    let choices = availablePlants.map((p, i) => {
        let statusText = p.stage === 'idle' ? '💧 пустой' : '🌱 растёт (' + Math.round(p.progress) + '%)';
        return (i + 1) + '. ' + p.emoji + ' ' + p.name + ' (горшок ' + (p.index + 1) + ') — ' + statusText;
    }).join('\n');

    let choice = prompt('🧪 Выберите горшок для удобрения:\n\n' + choices, '1');
    if (choice === null) return;

    let idx = parseInt(choice) - 1;
    if (idx >= 0 && idx < availablePlants.length) {
        fertilizerCount--;
        applyFertilizerToPlant(availablePlants[idx].index);
    }
}

function applyFertilizerToPlant(index) {
    const data = plantData[index];
    if (!data) {
        alert('❌ Ошибка: растение не найдено!');
        return;
    }

    if (data.stage === 'idle') {
        data.fertilizer = true;
        alert('🧪 Удобрение применено! При посадке растения оно ускорит рост в 2 раза!');
    } else if (data.stage === 'growing' && !data.fertilizer) {
        data.fertilizer = true;
        if (plantIntervals[index]) {
            clearInterval(plantIntervals[index]);
            plantIntervals[index] = null;
        }
        startPlantGrowth(index);
        alert('🧪 Удобрение применено! Растение ускорено в 2 раза!');
    } else {
        alert('❌ На этом растении уже есть удобрение или оно не подходит!');
        return;
    }

    saveGame();
    savePlantData();
    updatePlantsUI();
    updateUI();
    if (labPurchased) updateLabUI();
}

// ============================================================
// ==================== ФУНКЦИЯ ОБНОВЛЕНИЯ СТАТУСА БОССА =====
// ============================================================

function updateBossStatus() {
    const statusEl = document.getElementById('capybaraStatus');
    const fightBtn = document.getElementById('fightCapybaraBtn');
    if (!capybaraPurchased) {
        statusEl.textContent = '🔒 Не куплен';
        statusEl.className = 'boss-status';
        fightBtn.disabled = true;
        return;
    }
    if (capybaraDefeated && capybaraCooldown <= 0) {
        capybaraDefeated = false;
        localStorage.setItem('rat_capybaraDefeated', 'false');
        saveGame();
    }
    if (capybaraCooldown > 0) {
        let minutes = Math.floor(capybaraCooldown / 60);
        let seconds = capybaraCooldown % 60;
        statusEl.textContent = `⏳ Перезарядка: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        statusEl.className = 'boss-status';
        fightBtn.disabled = true;
    } else if (capybaraDefeated) {
        statusEl.textContent = '✅ Побеждена! (ожидание)';
        statusEl.className = 'boss-status available';
        fightBtn.disabled = true;
    } else {
        statusEl.textContent = '⚔️ Готов к бою!';
        statusEl.className = 'boss-status available';
        fightBtn.disabled = false;
    }
}

function startBossCooldownTimer() {
    if (bossCooldownInterval) {
        clearInterval(bossCooldownInterval);
        bossCooldownInterval = null;
    }
    if (capybaraCooldown <= 0) {
        if (capybaraDefeated) {
            capybaraDefeated = false;
            localStorage.setItem('rat_capybaraDefeated', 'false');
            saveGame();
        }
        updateBossStatus();
        return;
    }
    bossCooldownInterval = setInterval(() => {
        if (capybaraCooldown > 0) {
            capybaraCooldown--;
            localStorage.setItem('rat_capybaraCooldown', capybaraCooldown);
            updateBossStatus();
        } else {
            clearInterval(bossCooldownInterval);
            bossCooldownInterval = null;
            if (capybaraDefeated) {
                capybaraDefeated = false;
                localStorage.setItem('rat_capybaraDefeated', 'false');
                saveGame();
            }
            updateBossStatus();
        }
    }, 1000);
}

// ============================================================
// ==================== БОССФАЙТ ===============================
// ============================================================

function startBossFight() {
    if (bossFightActive) return;
    bossFightActive = true;
    bossHp = bossMaxHp;
    bossX = 50;
    bossDirection = 1;
    bossBullets = [];
    bossFightModal.classList.add('open');
    bossFightModal.style.display = 'flex';
    shootBtn.disabled = false;
    bossTimer.textContent = '⚔️ БОЙ НАЧАЛСЯ!';
    bossTimer.className = 'boss-timer ready';
    
    bossEnemy.style.left = bossX + '%';
    bossEnemy.style.bottom = bossY + '%';
    updateBossHp();
    
    bossMoveInterval = setInterval(() => {
        bossX += bossDirection * 1.5;
        if (bossX > 85 || bossX < 15) bossDirection *= -1;
        bossEnemy.style.left = bossX + '%';
    }, 100);
    
    bossShootInterval = setInterval(() => {
        if (!bossFightActive) return;
        const bullet = document.createElement('div');
        bullet.className = 'boss-bullet';
        bullet.textContent = '💀';
        bullet.style.left = (bossX + Math.random() * 10 - 5) + '%';
        bullet.style.top = '20%';
        bossBulletsContainer.appendChild(bullet);
        setTimeout(() => bullet.remove(), 2000);
    }, 1000);
    
    bossFightInterval = setInterval(() => {
        if (!bossFightActive) return;
        const bullets = bossBulletsContainer.querySelectorAll('.boss-bullet');
        bullets.forEach(b => {
            const rect = b.getBoundingClientRect();
            const ratRect = ratContainer.getBoundingClientRect();
            if (rect.left < ratRect.right && rect.right > ratRect.left &&
                rect.top < ratRect.bottom && rect.bottom > ratRect.top) {
                b.remove();
                bossHp -= 5;
                updateBossHp();
                if (bossHp <= 0) {
                    bossDefeated();
                }
            }
        });
    }, 100);
}

function stopBossFight() {
    bossFightActive = false;
    if (bossMoveInterval) { clearInterval(bossMoveInterval); bossMoveInterval = null; }
    if (bossShootInterval) { clearInterval(bossShootInterval); bossShootInterval = null; }
    if (bossFightInterval) { clearInterval(bossFightInterval); bossFightInterval = null; }
    bossFightModal.classList.remove('open');
    bossFightModal.style.display = 'none';
    bossBulletsContainer.innerHTML = '';
}

function shootBoss() {
    if (!bossFightActive || !canShoot) return;
    canShoot = false;
    shootBtn.disabled = true;
    
    playerProjectile.style.display = 'block';
    playerProjectile.style.left = '50%';
    playerProjectile.style.bottom = '10%';
    playerProjectile.style.transform = 'translateX(-50%)';
    playerProjectile.textContent = '💨';
    
    setTimeout(() => {
        const projRect = playerProjectile.getBoundingClientRect();
        const bossRect = bossEnemy.getBoundingClientRect();
        if (projRect.left < bossRect.right && projRect.right > bossRect.left &&
            projRect.top < bossRect.bottom && projRect.bottom > bossRect.top) {
            bossHp -= 15;
            updateBossHp();
            if (bossHp <= 0) {
                bossDefeated();
            }
        }
        playerProjectile.style.display = 'none';
    }, 600);
    
    setTimeout(() => {
        canShoot = true;
        shootBtn.disabled = false;
    }, shootCooldown);
}

function updateBossHp() {
    const percent = Math.max(0, (bossHp / bossMaxHp) * 100);
    bossHpFill.style.width = percent + '%';
    bossHpText.textContent = Math.round(bossHp) + '/' + bossMaxHp;
}

function bossDefeated() {
    stopBossFight();
    capybaraDefeated = true;
    capybaraCooldown = 600;
    localStorage.setItem('rat_capybaraCooldown', capybaraCooldown);
    localStorage.setItem('rat_capybaraDefeated', 'true');
    if (!inventory.food) inventory.food = 0;
    inventory.food++;
    saveGame();
    updateUI();
    startBossCooldownTimer();
    alert('🎉 БОСС ПОБЕЖДЁН!\n🍖 Получен Корм для крысы! (x2 буст на 30 сек)');
}

shootBtn.addEventListener('click', shootBoss);
retreatBtn.addEventListener('click', () => {
    if (confirm('🏃 Вы уверены, что хотите отступить?')) {
        stopBossFight();
        capybaraCooldown = 300;
        localStorage.setItem('rat_capybaraCooldown', capybaraCooldown);
        saveGame();
        updateUI();
        startBossCooldownTimer();
        alert('⏳ Вы отступили! Перезарядка: 5 минут');
    }
});

closeFightBtn.addEventListener('click', () => {
    if (bossFightActive) {
        if (confirm('🏃 Вы уверены, что хотите выйти из боя?')) {
            stopBossFight();
            capybaraCooldown = 300;
            localStorage.setItem('rat_capybaraCooldown', capybaraCooldown);
            saveGame();
            updateUI();
            startBossCooldownTimer();
        }
    } else {
        stopBossFight();
    }
});

bossFightModal.addEventListener('click', function(e) {
    if (e.target === this && bossFightActive) {
        if (confirm('🏃 Вы уверены, что хотите выйти из боя?')) {
            stopBossFight();
            capybaraCooldown = 300;
            localStorage.setItem('rat_capybaraCooldown', capybaraCooldown);
            saveGame();
            updateUI();
            startBossCooldownTimer();
        }
    } else if (e.target === this) {
        this.style.display = 'none';
        this.classList.remove('open');
    }
});

// ============================================================
// ==================== ИНВЕНТАРЬ ==============================
// ============================================================

function updateInventoryUI() {
    inventoryGrid.innerHTML = '';
    let hasItems = false;
    if (inventory.food > 0) {
        hasItems = true;
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.innerHTML = `
            <div class="item-icon">🍖</div>
            <div class="item-name">Корм для крысы</div>
            <div class="item-count">x${inventory.food}</div>
            <button class="use-btn" data-item="food">Использовать</button>
        `;
        inventoryGrid.appendChild(slot);
    }
    if (inventory.gmo_apple > 0) {
        hasItems = true;
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.innerHTML = `
            <div class="item-icon">🍏</div>
            <div class="item-name">ГМО яблоко</div>
            <div class="item-count">x${inventory.gmo_apple}</div>
            <button class="use-btn" data-item="gmo_apple">Использовать</button>
        `;
        inventoryGrid.appendChild(slot);
    }
    if (plantInventory.grass > 0) {
        hasItems = true;
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.innerHTML = `
            <div class="item-icon">🌿</div>
            <div class="item-name">Трава</div>
            <div class="item-count">x${plantInventory.grass}</div>
            <button class="use-btn" data-item="grass">Использовать</button>
        `;
        inventoryGrid.appendChild(slot);
    }
    if (plantInventory.pepper > 0) {
        hasItems = true;
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.innerHTML = `
            <div class="item-icon">🌶️</div>
            <div class="item-name">Болгарский перец</div>
            <div class="item-count">x${plantInventory.pepper}</div>
            <button class="use-btn" data-item="pepper">Использовать</button>
        `;
        inventoryGrid.appendChild(slot);
    }
    if (plantInventory.apple > 0) {
        hasItems = true;
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.innerHTML = `
            <div class="item-icon">🍎</div>
            <div class="item-name">Яблоко</div>
            <div class="item-count">x${plantInventory.apple}</div>
            <button class="use-btn" data-item="apple">Использовать</button>
        `;
        inventoryGrid.appendChild(slot);
    }
    if (plantInventory.cabbage > 0) {
        hasItems = true;
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.innerHTML = `
            <div class="item-icon">🥬</div>
            <div class="item-name">Капуста</div>
            <div class="item-count">x${plantInventory.cabbage}</div>
            <button class="use-btn" data-item="cabbage">Использовать</button>
        `;
        inventoryGrid.appendChild(slot);
    }
    if (fertilizerCount > 0) {
        hasItems = true;
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.innerHTML = `
            <div class="item-icon">🧪</div>
            <div class="item-name">Удобрение</div>
            <div class="item-count">x${fertilizerCount}</div>
            <button class="use-btn" data-item="fertilizer">Использовать</button>
        `;
        inventoryGrid.appendChild(slot);
    }
    if (hasItems) {
        inventoryEmpty.style.display = 'none';
    } else {
        inventoryEmpty.style.display = 'block';
    }
    document.querySelectorAll('.use-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.dataset.item;
            if (item === 'food') useFoodItem();
            else if (item === 'gmo_apple') useGmoApple();
            else if (item === 'grass') usePlantItem('grass');
            else if (item === 'pepper') usePlantItem('pepper');
            else if (item === 'apple') usePlantItem('apple');
            else if (item === 'cabbage') usePlantItem('cabbage');
            else if (item === 'fertilizer') useFertilizer();
        });
    });
}

function useFoodItem() {
    if (inventory.food <= 0) return;
    if (buffActive) {
        alert('⚡ Буст уже активен!');
        return;
    }
    inventory.food--;
    buffActive = true;
    buffType = 'food';
    ratBody.classList.add('buffed');
    buffIndicator.style.display = 'block';
    saveGame();
    updateUI();
    if (buffTimer) clearInterval(buffTimer);
    buffTimer = setTimeout(() => {
        buffActive = false;
        buffType = null;
        ratBody.classList.remove('buffed');
        buffIndicator.style.display = 'none';
        localStorage.setItem('rat_buffActive', 'false');
        localStorage.setItem('rat_buffType', '');
        saveGame();
        updateUI();
    }, 30000);
    updateInventoryUI();
}

function useGmoApple() {
    if (inventory.gmo_apple <= 0) return;
    if (satietyActive) {
        alert('🍏 Насыщение уже активно!');
        return;
    }
    inventory.gmo_apple--;
    satietyActive = true;
    localStorage.setItem('rat_satietyActive', 'true');
    enclosureSatiety.classList.add('active');
    enclosureSatiety.style.display = 'block';
    enclosureSatiety.textContent = '🍏 ГМО насыщение: 2:30';
    if (satietyTimer) clearInterval(satietyTimer);
    satietyTimer = setTimeout(() => {
        satietyActive = false;
        localStorage.setItem('rat_satietyActive', 'false');
        enclosureSatiety.classList.remove('active');
        enclosureSatiety.style.display = 'none';
        saveGame();
        updateUI();
    }, 150000);
    saveGame();
    updateUI();
    updateInventoryUI();
    alert('🍏 ГМО яблоко использовано!\nСвинки не будут тратить голод 2 минуты 30 секунд!');
}

function usePlantItem(type) {
    if (plantInventory[type] <= 0) return;
    const info = PLANT_TYPES[type];
    if (!info) return;
    plantInventory[type]--;

    if (type === 'cabbage') {
        let addFood = hamsterMaxFood * 0.5;
        hamsterFood = Math.min(hamsterMaxFood, hamsterFood + addFood);
        poopCount += 5;
        saveGame();
        updateUI();
        alert(`🥬 Капуста использована! Свинки накормлены на 50% и дали 5 какашек! (💩 ${poopCount})`);
    } else {
        if (hamsterFood < hamsterMaxFood) {
            hamsterFood = hamsterMaxFood;
        }
        if (type === 'pepper') {
            pepperBuffActive = true;
            localStorage.setItem('rat_pepperBuffActive', 'true');
            if (pepperIndicator) {
                pepperIndicator.classList.add('active');
                pepperIndicator.style.display = 'block';
            }
            if (pepperBuffTimer) clearInterval(pepperBuffTimer);
            pepperBuffTimer = setTimeout(() => {
                pepperBuffActive = false;
                localStorage.setItem('rat_pepperBuffActive', 'false');
                if (pepperIndicator) {
                    pepperIndicator.classList.remove('active');
                    pepperIndicator.style.display = 'none';
                }
                saveGame();
                updateUI();
            }, 20000);
            alert('🌶️ Болгарский перец использован! Свинки дают x2 бонус на 20 секунд!');
        } else if (type === 'apple') {
            satietyActive = true;
            localStorage.setItem('rat_satietyActive', 'true');
            enclosureSatiety.classList.add('active');
            enclosureSatiety.style.display = 'block';
            if (satietyTimer) clearInterval(satietyTimer);
            satietyTimer = setTimeout(() => {
                satietyActive = false;
                localStorage.setItem('rat_satietyActive', 'false');
                enclosureSatiety.classList.remove('active');
                enclosureSatiety.style.display = 'none';
                saveGame();
                updateUI();
            }, 60000);
            alert('🍎 Яблоко использовано! Свинки не будут тратить голод 1 минуту!');
        } else {
            alert(`🌿 ${info.name} использована! Свинки накормлены!`);
        }
    }

    saveGame();
    updateUI();
    updateInventoryUI();
}

// ============================================================
// ==================== СИСТЕМА ВОЛЬЕРА =======================
// ============================================================

function startHamsterMovement() {
    if (hamsterMoveInterval) clearInterval(hamsterMoveInterval);
    hamsterMoveInterval = setInterval(() => {
        let visibleCount = Math.min(hamsterLevel + 1, 5);
        for (let i = 0; i < visibleCount; i++) {
            if (Math.random() < 0.3) {
                hamsterElements[i].classList.add('moving');
                setTimeout(() => {
                    hamsterElements[i].classList.remove('moving');
                }, 800);
            }
        }
    }, 2000);
}

function stopHamsterMovement() {
    if (hamsterMoveInterval) {
        clearInterval(hamsterMoveInterval);
        hamsterMoveInterval = null;
    }
}

function startFoodDepletion() {
    if (foodDepletionInterval) {
        clearInterval(foodDepletionInterval);
        foodDepletionInterval = null;
    }
    if (!hamsterPurchased) return;
    if (hamsterFood <= 0) return;
    if (satietyActive) return;
    foodDepletionInterval = setInterval(() => {
        if (satietyActive) return;
        if (hamsterPurchased && hamsterFood > 0) {
            let depletionRate = 0.3 + (hamsterLevel * 0.12);
            hamsterFood = Math.max(0, hamsterFood - depletionRate);
            saveGame();
            updateUI();
        } else if (hamsterFood <= 0) {
            stopFoodDepletion();
            updateUI();
        }
    }, 1000);
}

function stopFoodDepletion() {
    if (foodDepletionInterval) {
        clearInterval(foodDepletionInterval);
        foodDepletionInterval = null;
    }
}

function feedHamsters() {
    if (!hamsterPurchased) return;
    if (hamsterFood >= hamsterMaxFood) return;
    let feedCost = getFeedCost();
    if (score < feedCost) {
        alert(`Не хватает монет! Нужно ${feedCost} $RAT`);
        return;
    }
    score -= feedCost;
    hamsterFood = Math.min(hamsterMaxFood, hamsterFood + 20);
    saveGame();
    updateUI();
    if (hamsterFood > 0 && !foodDepletionInterval && !satietyActive) {
        startFoodDepletion();
    }
}

// ============================================================
// ==================== ФУНКЦИЯ ОБНОВЛЕНИЯ UI ================
// ============================================================

function updateUI() {
    let totalPower = getTotalClickPower();
    let currentMaxClick = superGrainPurchased ? 20 : 10;
    let hamsterMult = getHamsterBonus();
    let feedCost = getFeedCost();

    balanceEl.innerText = score + " $RAT";
    statsInfo.innerText = `Клик: +${totalPower} | Пассив: ${autoClickers}/сек`;
    clickCostEl.innerText = 50 * (clickLevel + 1);
    autoCostEl.innerText = 100 * (autoLevel + 1);
    clickLevelEl.innerText = clickLevel;
    clickMaxLevelEl.innerText = currentMaxClick;
    autoLevelEl.innerText = autoLevel;
    grainLevelEl.innerText = grainLevel;
    grainBaseEl.innerText = grainBase;
    grainCostEl.innerText = 1000 * (grainLevel + 1);
    grainLevelDisplay.innerText = 'Ур. ' + grainLevel;

    superGrainInfo.innerText = 'Базовое: ' + SUPER_GRAIN_BASE;

    let bonus = getAccessoryBonus();
    accessoryBonusDisplay.innerText = '+' + bonus + '%';

    if (buffActive) {
        buffIndicator.style.display = 'block';
    } else {
        buffIndicator.style.display = 'none';
    }

    if (superGrainPurchased) {
        if (grainActive && superGrainActive) {
            superIndicator.textContent = '✅ Супер режим!';
            superIndicator.className = 'indicator-text active';
        } else {
            superIndicator.textContent = '⚠️ Включите оба!';
            superIndicator.className = 'indicator-text';
        }
    }

    if (mousePurchased) {
        if (currentGrainElement && mouseActive) {
            mouseIndicator.textContent = '🎯 Цель найдена!';
            mouseIndicator.className = 'indicator-text active';
        } else if (mouseActive) {
            mouseIndicator.textContent = '⏳ Ожидание зерна...';
            mouseIndicator.className = 'indicator-text';
        } else {
            mouseIndicator.textContent = '❌ Выключена';
            mouseIndicator.className = 'indicator-text';
        }
    }

    if (clickLevel >= currentMaxClick) {
        buyClickBtn.disabled = true;
        clickItem.classList.add('disabled');
        buyClickBtn.textContent = 'MAX';
        buyClickBtn.style.backgroundColor = '#555';
        buyClickBtn.style.color = '#888';
    } else {
        buyClickBtn.disabled = false;
        clickItem.classList.remove('disabled');
        buyClickBtn.textContent = 'Купить';
        buyClickBtn.style.backgroundColor = '#45f3ff';
        buyClickBtn.style.color = '#0b0c10';
    }

    if (autoLevel >= MAX_AUTO_LEVEL) {
        buyAutoBtn.disabled = true;
        autoItem.classList.add('disabled');
        buyAutoBtn.textContent = 'MAX';
        buyAutoBtn.style.backgroundColor = '#555';
        buyAutoBtn.style.color = '#888';
    } else {
        buyAutoBtn.disabled = false;
        autoItem.classList.remove('disabled');
        buyAutoBtn.textContent = 'Купить';
        buyAutoBtn.style.backgroundColor = '#45f3ff';
        buyAutoBtn.style.color = '#0b0c10';
    }

    if (clickLevel >= currentMaxClick && autoLevel >= MAX_AUTO_LEVEL) {
        grainItem.style.display = 'flex';
        if (grainPurchased === 0) {
            buyGrainBtn.disabled = false;
            grainItem.classList.remove('disabled');
            grainCostEl.innerText = 1000;
            buyGrainBtn.textContent = 'Купить';
            buyGrainBtn.style.backgroundColor = '#ffd700';
            buyGrainBtn.style.color = '#0b0c10';
        } else if (grainLevel >= MAX_GRAIN_LEVEL) {
            buyGrainBtn.disabled = true;
            grainItem.classList.add('disabled');
            buyGrainBtn.textContent = 'MAX';
            buyGrainBtn.style.backgroundColor = '#555';
            buyGrainBtn.style.color = '#888';
        } else {
            buyGrainBtn.disabled = false;
            grainItem.classList.remove('disabled');
            grainCostEl.innerText = 1000 * (grainLevel + 1);
            buyGrainBtn.textContent = 'Улучшить';
            buyGrainBtn.style.backgroundColor = '#45f3ff';
            buyGrainBtn.style.color = '#0b0c10';
        }
    } else {
        grainItem.style.display = 'none';
        grainItem.classList.remove('disabled');
    }

    if (grainLevel >= MAX_GRAIN_LEVEL) {
        superGrainItem.style.display = 'flex';
        if (superGrainPurchased) {
            buySuperGrainBtn.disabled = true;
            superGrainItem.classList.add('disabled');
            superGrainCostEl.innerText = '—';
            buySuperGrainBtn.textContent = 'Куплено';
            buySuperGrainBtn.style.backgroundColor = '#555';
            buySuperGrainBtn.style.color = '#888';
        } else {
            buySuperGrainBtn.disabled = false;
            superGrainItem.classList.remove('disabled');
            buySuperGrainBtn.textContent = 'Купить';
            buySuperGrainBtn.style.backgroundColor = '#ff007f';
            buySuperGrainBtn.style.color = 'white';
            superGrainCostEl.innerText = '10000';
        }
    } else {
        superGrainItem.style.display = 'none';
        superGrainItem.classList.remove('disabled');
    }

    if (superGrainPurchased) {
        mouseShopItem.style.display = 'flex';
        if (mousePurchased) {
            buyMouseShopBtn.disabled = true;
            mouseShopItem.classList.add('disabled');
            mouseShopCostEl.innerText = '—';
            buyMouseShopBtn.textContent = 'Куплено';
            buyMouseShopBtn.style.backgroundColor = '#555';
            buyMouseShopBtn.style.color = '#888';
        } else {
            buyMouseShopBtn.disabled = false;
            mouseShopItem.classList.remove('disabled');
            buyMouseShopBtn.textContent = 'Купить';
            buyMouseShopBtn.style.backgroundColor = '#66fcf1';
            buyMouseShopBtn.style.color = '#0b0c10';
            mouseShopCostEl.innerText = '15000';
        }
    } else {
        mouseShopItem.style.display = 'none';
        mouseShopItem.classList.remove('disabled');
    }

    if (mousePurchased) {
        hamsterShopItem.style.display = 'flex';
        if (hamsterPurchased) {
            buyHamsterShopBtn.disabled = true;
            hamsterShopItem.classList.add('disabled');
            hamsterShopCostEl.innerText = '—';
            buyHamsterShopBtn.textContent = 'Куплено';
            buyHamsterShopBtn.style.backgroundColor = '#555';
            buyHamsterShopBtn.style.color = '#888';
        } else {
            buyHamsterShopBtn.disabled = false;
            hamsterShopItem.classList.remove('disabled');
            buyHamsterShopBtn.textContent = 'Купить';
            buyHamsterShopBtn.style.backgroundColor = '#ffd700';
            buyHamsterShopBtn.style.color = '#0b0c10';
            hamsterShopCostEl.innerText = '20000';
        }
    } else {
        hamsterShopItem.style.display = 'none';
        hamsterShopItem.classList.remove('disabled');
    }

    if (hamsterPurchased) {
        hamsterUpgradeShopItem.style.display = 'flex';
        if (hamsterLevel >= MAX_HAMSTER_LEVEL) {
            buyHamsterUpgradeBtn.disabled = true;
            hamsterUpgradeShopItem.classList.add('disabled');
            hamsterUpgradeCostEl.innerText = '—';
            buyHamsterUpgradeBtn.textContent = 'MAX';
            buyHamsterUpgradeBtn.style.backgroundColor = '#555';
            buyHamsterUpgradeBtn.style.color = '#888';
        } else {
            buyHamsterUpgradeBtn.disabled = false;
            hamsterUpgradeShopItem.classList.remove('disabled');
            buyHamsterUpgradeBtn.textContent = 'Улучшить';
            buyHamsterUpgradeBtn.style.backgroundColor = '#66fcf1';
            buyHamsterUpgradeBtn.style.color = '#0b0c10';
            hamsterUpgradeCostEl.innerText = hamsterUpgradeCost;
        }
        hamsterUpgradeLevelEl.innerText = hamsterLevel;
        hamsterUpgradeCurrentBonusEl.innerText = 'x' + getHamsterBonus().toFixed(1);
    } else {
        hamsterUpgradeShopItem.style.display = 'none';
        hamsterUpgradeShopItem.classList.remove('disabled');
    }

    if (hamsterLevel >= MAX_HAMSTER_LEVEL) {
        bossMenuShopItem.style.display = 'flex';
        if (bossMenuPurchased) {
            buyBossMenuBtn.disabled = true;
            bossMenuShopItem.classList.add('disabled');
            bossMenuCostEl.innerText = '—';
            buyBossMenuBtn.textContent = 'Куплено';
            buyBossMenuBtn.style.backgroundColor = '#555';
            buyBossMenuBtn.style.color = '#888';
        } else {
            buyBossMenuBtn.disabled = false;
            bossMenuShopItem.classList.remove('disabled');
            buyBossMenuBtn.textContent = 'Купить';
            buyBossMenuBtn.style.backgroundColor = '#ff0033';
            buyBossMenuBtn.style.color = 'white';
            bossMenuCostEl.innerText = '50000';
        }
    } else {
        bossMenuShopItem.style.display = 'none';
        bossMenuShopItem.classList.remove('disabled');
    }

    if (bossMenuPurchased) {
        capybaraShopItem.style.display = 'flex';
        if (capybaraPurchased) {
            buyCapybaraBtn.disabled = true;
            capybaraShopItem.classList.add('disabled');
            capybaraCostEl.innerText = '—';
            buyCapybaraBtn.textContent = 'Куплено';
            buyCapybaraBtn.style.backgroundColor = '#555';
            buyCapybaraBtn.style.color = '#888';
        } else {
            buyCapybaraBtn.disabled = false;
            capybaraShopItem.classList.remove('disabled');
            buyCapybaraBtn.textContent = 'Купить';
            buyCapybaraBtn.style.backgroundColor = '#8B6B3D';
            buyCapybaraBtn.style.color = 'white';
            capybaraCostEl.innerText = '100000';
        }
    } else {
        capybaraShopItem.style.display = 'none';
        capybaraShopItem.classList.remove('disabled');
    }

    if (hamsterLevel >= MAX_HAMSTER_LEVEL) {
        plantShopItem.style.display = 'flex';
        if (plantPurchased) {
            buyPlantBtn.disabled = true;
            plantShopItem.classList.add('disabled');
            plantShopCostEl.innerText = '—';
            buyPlantBtn.textContent = 'Куплено';
            buyPlantBtn.style.backgroundColor = '#555';
            buyPlantBtn.style.color = '#888';
        } else {
            buyPlantBtn.disabled = false;
            plantShopItem.classList.remove('disabled');
            buyPlantBtn.textContent = 'Купить';
            buyPlantBtn.style.backgroundColor = '#45f3ff';
            buyPlantBtn.style.color = '#0b0c10';
            plantShopCostEl.innerText = '30000';
        }
    } else {
        plantShopItem.style.display = 'none';
        plantShopItem.classList.remove('disabled');
    }

    if (plantPurchased && plantLevel === 1 && !plantUpgrade1) {
        plantUpgrade1ShopItem.style.display = 'flex';
        buyPlantUpgrade1Btn.disabled = false;
        plantUpgrade1ShopItem.classList.remove('disabled');
        plantUpgrade1CostEl.innerText = '50000';
        buyPlantUpgrade1Btn.textContent = 'Купить';
        buyPlantUpgrade1Btn.style.backgroundColor = '#66fcf1';
        buyPlantUpgrade1Btn.style.color = '#0b0c10';
    } else if (plantUpgrade1) {
        plantUpgrade1ShopItem.style.display = 'flex';
        buyPlantUpgrade1Btn.disabled = true;
        plantUpgrade1ShopItem.classList.add('disabled');
        plantUpgrade1CostEl.innerText = '—';
        buyPlantUpgrade1Btn.textContent = 'Куплено';
        buyPlantUpgrade1Btn.style.backgroundColor = '#555';
        buyPlantUpgrade1Btn.style.color = '#888';
    } else {
        plantUpgrade1ShopItem.style.display = 'none';
        plantUpgrade1ShopItem.classList.remove('disabled');
    }

    if (plantUpgrade1 && plantLevel === 2 && !plantUpgrade2) {
        plantUpgrade2ShopItem.style.display = 'flex';
        buyPlantUpgrade2Btn.disabled = false;
        plantUpgrade2ShopItem.classList.remove('disabled');
        plantUpgrade2CostEl.innerText = '70000';
        buyPlantUpgrade2Btn.textContent = 'Купить';
        buyPlantUpgrade2Btn.style.backgroundColor = '#ffd700';
        buyPlantUpgrade2Btn.style.color = '#0b0c10';
    } else if (plantUpgrade2) {
        plantUpgrade2ShopItem.style.display = 'flex';
        buyPlantUpgrade2Btn.disabled = true;
        plantUpgrade2ShopItem.classList.add('disabled');
        plantUpgrade2CostEl.innerText = '—';
        buyPlantUpgrade2Btn.textContent = 'MAX';
        buyPlantUpgrade2Btn.style.backgroundColor = '#555';
        buyPlantUpgrade2Btn.style.color = '#888';
    } else {
        plantUpgrade2ShopItem.style.display = 'none';
        plantUpgrade2ShopItem.classList.remove('disabled');
    }

    if (plantLevel >= 1) {
        if (!plantTypeGrass) {
            plantTypeGrassItem.style.display = 'flex';
            plantTypeGrassItem.classList.remove('disabled');
            plantTypeGrassCostEl.innerText = '10000';
            buyPlantTypeGrassBtn.textContent = 'Купить';
            buyPlantTypeGrassBtn.disabled = false;
            buyPlantTypeGrassBtn.style.backgroundColor = '#45f3ff';
            buyPlantTypeGrassBtn.style.color = '#0b0c10';
        } else {
            plantTypeGrassItem.style.display = 'flex';
            plantTypeGrassItem.classList.add('disabled');
            plantTypeGrassCostEl.innerText = '—';
            buyPlantTypeGrassBtn.textContent = 'Куплено';
            buyPlantTypeGrassBtn.disabled = true;
            buyPlantTypeGrassBtn.style.backgroundColor = '#555';
            buyPlantTypeGrassBtn.style.color = '#888';
        }
        if (!plantTypePepper) {
            plantTypePepperItem.style.display = 'flex';
            plantTypePepperItem.classList.remove('disabled');
            plantTypePepperCostEl.innerText = '25000';
            buyPlantTypePepperBtn.textContent = 'Купить';
            buyPlantTypePepperBtn.disabled = false;
            buyPlantTypePepperBtn.style.backgroundColor = '#ff4444';
            buyPlantTypePepperBtn.style.color = 'white';
        } else {
            plantTypePepperItem.style.display = 'flex';
            plantTypePepperItem.classList.add('disabled');
            plantTypePepperCostEl.innerText = '—';
            buyPlantTypePepperBtn.textContent = 'Куплено';
            buyPlantTypePepperBtn.disabled = true;
            buyPlantTypePepperBtn.style.backgroundColor = '#555';
            buyPlantTypePepperBtn.style.color = '#888';
        }
        if (!plantTypeApple) {
            plantTypeAppleItem.style.display = 'flex';
            plantTypeAppleItem.classList.remove('disabled');
            plantTypeAppleCostEl.innerText = '40000';
            buyPlantTypeAppleBtn.textContent = 'Купить';
            buyPlantTypeAppleBtn.disabled = false;
            buyPlantTypeAppleBtn.style.backgroundColor = '#ff6b6b';
            buyPlantTypeAppleBtn.style.color = 'white';
        } else {
            plantTypeAppleItem.style.display = 'flex';
            plantTypeAppleItem.classList.add('disabled');
            plantTypeAppleCostEl.innerText = '—';
            buyPlantTypeAppleBtn.textContent = 'Куплено';
            buyPlantTypeAppleBtn.disabled = true;
            buyPlantTypeAppleBtn.style.backgroundColor = '#555';
            buyPlantTypeAppleBtn.style.color = '#888';
        }
        if (!plantTypeCabbage) {
            plantTypeCabbageItem.style.display = 'flex';
            plantTypeCabbageItem.classList.remove('disabled');
            plantTypeCabbageCostEl.innerText = '15000';
            buyPlantTypeCabbageBtn.textContent = 'Купить';
            buyPlantTypeCabbageBtn.disabled = false;
            buyPlantTypeCabbageBtn.style.backgroundColor = '#45f3ff';
            buyPlantTypeCabbageBtn.style.color = '#0b0c10';
        } else {
            plantTypeCabbageItem.style.display = 'flex';
            plantTypeCabbageItem.classList.add('disabled');
            plantTypeCabbageCostEl.innerText = '—';
            buyPlantTypeCabbageBtn.textContent = 'Куплено';
            buyPlantTypeCabbageBtn.disabled = true;
            buyPlantTypeCabbageBtn.style.backgroundColor = '#555';
            buyPlantTypeCabbageBtn.style.color = '#888';
        }
    } else {
        plantTypeGrassItem.style.display = 'none';
        plantTypePepperItem.style.display = 'none';
        plantTypeAppleItem.style.display = 'none';
        plantTypeCabbageItem.style.display = 'none';
    }

    const allPlantsBought = plantPurchased && plantUpgrade1 && plantUpgrade2 && 
                           plantTypeGrass && plantTypePepper && plantTypeApple && plantTypeCabbage;

    if (allPlantsBought) {
        labShopItem.style.display = 'flex';
        if (labPurchased) {
            buyLabBtn.disabled = true;
            labShopItem.classList.add('disabled');
            labShopCostEl.innerText = '—';
            buyLabBtn.textContent = 'Куплено';
            buyLabBtn.style.backgroundColor = '#555';
            buyLabBtn.style.color = '#888';
        } else {
            buyLabBtn.disabled = false;
            labShopItem.classList.remove('disabled');
            buyLabBtn.textContent = 'Купить';
            buyLabBtn.style.backgroundColor = '#9b59b6';
            buyLabBtn.style.color = 'white';
            labShopCostEl.innerText = '50000';
        }
    } else {
        labShopItem.style.display = 'none';
        labShopItem.classList.remove('disabled');
    }

    if (labPurchased) {
        combinerShopItem.style.display = 'flex';
        if (combinerPurchased) {
            buyCombinerBtn.disabled = true;
            combinerShopItem.classList.add('disabled');
            combinerShopCostEl.innerText = '—';
            buyCombinerBtn.textContent = 'Куплено';
            buyCombinerBtn.style.backgroundColor = '#555';
            buyCombinerBtn.style.color = '#888';
        } else {
            buyCombinerBtn.disabled = false;
            combinerShopItem.classList.remove('disabled');
            buyCombinerBtn.textContent = 'Купить';
            buyCombinerBtn.style.backgroundColor = '#ff6b00';
            buyCombinerBtn.style.color = 'white';
            combinerShopCostEl.innerText = '30000';
        }
    } else {
        combinerShopItem.style.display = 'none';
        combinerShopItem.classList.remove('disabled');
    }

    if (combinerPurchased) {
        combinerUpgradeShopItem.style.display = 'flex';
        if (combinerLevel >= 1) {
            buyCombinerUpgradeBtn.disabled = true;
            combinerUpgradeShopItem.classList.add('disabled');
            combinerUpgradeCostEl.innerText = '—';
            buyCombinerUpgradeBtn.textContent = 'MAX';
            buyCombinerUpgradeBtn.style.backgroundColor = '#555';
            buyCombinerUpgradeBtn.style.color = '#888';
            combinerLevelEl.innerText = 'Уровень 2 (3 слота)';
        } else {
            buyCombinerUpgradeBtn.disabled = false;
            combinerUpgradeShopItem.classList.remove('disabled');
            buyCombinerUpgradeBtn.textContent = 'Улучшить';
            buyCombinerUpgradeBtn.style.backgroundColor = '#ff6b00';
            buyCombinerUpgradeBtn.style.color = 'white';
            combinerUpgradeCostEl.innerText = '60000';
            combinerLevelEl.innerText = 'Уровень 1 (2 слота)';
        }
    } else {
        combinerUpgradeShopItem.style.display = 'none';
        combinerUpgradeShopItem.classList.remove('disabled');
    }

    if (combinerPurchased) {
        extractorShopItem.style.display = 'flex';
        if (extractorPurchased) {
            buyExtractorBtn.disabled = true;
            extractorShopItem.classList.add('disabled');
            extractorShopCostEl.innerText = '—';
            buyExtractorBtn.textContent = 'Куплено';
            buyExtractorBtn.style.backgroundColor = '#555';
            buyExtractorBtn.style.color = '#888';
        } else {
            buyExtractorBtn.disabled = false;
            extractorShopItem.classList.remove('disabled');
            buyExtractorBtn.textContent = 'Купить';
            buyExtractorBtn.style.backgroundColor = '#45f3ff';
            buyExtractorBtn.style.color = '#0b0c10';
            extractorShopCostEl.innerText = '20000';
        }
    } else {
        extractorShopItem.style.display = 'none';
        extractorShopItem.classList.remove('disabled');
    }

    if (isAllLabPartsBought()) {
        manipulatorShopItem.style.display = 'flex';
        if (manipulatorLevel >= 3) {
            buyManipulatorBtn.disabled = true;
            manipulatorShopItem.classList.add('disabled');
            manipulatorShopCostEl.innerText = '—';
            buyManipulatorBtn.textContent = 'MAX';
            buyManipulatorBtn.style.backgroundColor = '#555';
            buyManipulatorBtn.style.color = '#888';
            manipulatorLevelEl.innerText = '3/3 🤖';
        } else {
            buyManipulatorBtn.disabled = false;
            manipulatorShopItem.classList.remove('disabled');
            buyManipulatorBtn.textContent = 'Купить манипулятор';
            buyManipulatorBtn.style.backgroundColor = '#ffd700';
            buyManipulatorBtn.style.color = '#0b0c10';
            manipulatorShopCostEl.innerText = '10000';
            manipulatorLevelEl.innerText = manipulatorLevel + '/3 🤖';
        }
    } else {
        manipulatorShopItem.style.display = 'none';
        manipulatorShopItem.classList.remove('disabled');
    }

    updateManipulatorUI();

    if (labPurchased) {
        openLabBtn.classList.add('visible');
        openLabBtn.style.display = 'block';
    } else {
        openLabBtn.classList.remove('visible');
        openLabBtn.style.display = 'none';
    }

    if (labPurchased && hamsterPurchased) {
        poopBtn.style.display = 'block';
        poopBtn.classList.add('visible');
        poopBtn.textContent = '💩 Собрать (' + poopCount + ')';
        poopBtn.disabled = (poopCount <= 0);
    } else {
        poopBtn.style.display = 'none';
        poopBtn.classList.remove('visible');
        poopBtn.textContent = '💩 Собрать (0)';
        poopBtn.disabled = true;
    }

    if (bossMenuPurchased) {
        bossSkull.style.display = 'flex';
        bossSkull.classList.add('visible');
        bossSkull.style.pointerEvents = 'auto';
        bossSkull.style.zIndex = '50';
    } else {
        bossSkull.style.display = 'none';
        bossSkull.classList.remove('visible');
    }

    updateBossStatus();

    if (grainPurchased > 0) {
        grainBox.classList.add('visible');
        if (grainActive) {
            grainToggle.classList.add('active');
            grainStatus.innerText = 'Вкл';
        } else {
            grainToggle.classList.remove('active');
            grainStatus.innerText = 'Выкл';
        }
    } else {
        grainBox.classList.remove('visible');
        if (grainActive) {
            toggleGrain(false);
        }
    }

    if (superGrainPurchased) {
        superGrainBox.style.display = 'flex';
        if (superGrainActive) {
            superGrainToggle.classList.add('active');
            superGrainStatus.innerText = 'Вкл';
        } else {
            superGrainToggle.classList.remove('active');
            superGrainStatus.innerText = 'Выкл';
        }
    } else {
        superGrainBox.style.display = 'none';
        if (superGrainActive) {
            toggleSuperGrain(false);
        }
    }

    if (mousePurchased) {
        mouseBox.style.display = 'flex';
        if (mouseActive) {
            mouseToggle.classList.add('active');
            mouseStatus.innerText = 'Вкл';
        } else {
            mouseToggle.classList.remove('active');
            mouseStatus.innerText = 'Выкл';
        }
    } else {
        mouseBox.style.display = 'none';
        if (mouseActive) {
            toggleMouse(false);
        }
    }

    if (hamsterPurchased) {
        enclosure.style.display = 'flex';
        enclosure.classList.add('visible');
        if (hamsterFood > 0 && !foodDepletionInterval && !satietyActive) {
            startFoodDepletion();
        }
        if (satietyActive) {
            enclosureSatiety.classList.add('active');
            enclosureSatiety.style.display = 'block';
            enclosureSatiety.textContent = inventory.gmo_apple > 0 ? '🍏 ГМО насыщение: 2:30' : '🍽️ Насыщение: активно';
        }
        if (pepperBuffActive && pepperIndicator) {
            pepperIndicator.classList.add('active');
            pepperIndicator.style.display = 'block';
        }
        if (hamsterFood > 0) {
            enclosureStatus.textContent = '✅ Сытые';
            enclosureStatus.className = 'enclosure-status fed';
        } else {
            enclosureStatus.textContent = '🔴 Голодные!';
            enclosureStatus.className = 'enclosure-status';
            if (foodDepletionInterval) {
                stopFoodDepletion();
            }
        }
        let percent = (hamsterFood / hamsterMaxFood) * 100;
        foodBarFill.style.width = Math.min(100, percent) + '%';
        foodBarText.innerText = Math.round(percent) + '%';
        if (hamsterFood < hamsterMaxFood && score >= feedCost) {
            feedBtn.disabled = false;
            feedBtn.textContent = '🍖 Покормить (' + feedCost + ')';
        } else {
            feedBtn.disabled = true;
            feedBtn.textContent = '🍖 Покормить (' + feedCost + ')';
        }
        if (hamsterFood > 0) {
            enclosureBonus.textContent = '🐹 Бонус: x' + hamsterMult.toFixed(1);
            enclosureBonus.className = 'enclosure-bonus active';
        } else {
            enclosureBonus.textContent = '🐹 Бонус: x1.0 (покормите!)';
            enclosureBonus.className = 'enclosure-bonus';
        }
        let visibleCount = Math.min(hamsterLevel + 1, 5);
        for (let i = 0; i < hamsterElements.length; i++) {
            if (i < visibleCount) {
                hamsterElements[i].style.display = 'block';
                hamsterElements[i].classList.add('visible');
            } else {
                hamsterElements[i].style.display = 'none';
                hamsterElements[i].classList.remove('visible');
            }
        }
    } else {
        enclosure.style.display = 'none';
        enclosure.classList.remove('visible');
    }

    updatePlantsUI();

    document.querySelectorAll('.accessory-item').forEach(item => {
        const acc = item.dataset.accessory;
        const btn = item.querySelector('.equip-btn');
        const isOwned = ownedAccessories.includes(acc);
        const isEquipped = equippedAccessory === acc;
        if (isOwned) {
            btn.disabled = false;
            btn.innerText = isEquipped ? 'Снять' : 'Надеть';
            if (isEquipped) {
                btn.classList.add('equipped');
            } else {
                btn.classList.remove('equipped');
            }
        } else {
            btn.disabled = false;
            btn.innerText = 'Купить';
            btn.classList.remove('equipped');
        }
    });

    updateRatAccessories();
    updateInventoryUI();
    if (labPurchased) updateLabUI();
    if (combinerPurchased) updateCombinerUI();
    if (extractorPurchased) updateExtractorUI();

    if (combinerPurchased) {
        openCombinerBtn.style.display = 'block';
        openCombinerBtn.classList.add('visible');
    } else {
        openCombinerBtn.style.display = 'none';
        openCombinerBtn.classList.remove('visible');
    }

    if (extractorPurchased) {
        openExtractorBtn.style.display = 'block';
        openExtractorBtn.classList.add('visible');
    } else {
        openExtractorBtn.style.display = 'none';
        openExtractorBtn.classList.remove('visible');
    }
}

function updateRatAccessories() {
    accHat.style.display = 'none';
    accGlasses.style.display = 'none';
    accSword.style.display = 'none';
    accCrown.style.display = 'none';
    if (equippedAccessory === 'hat') accHat.style.display = 'block';
    else if (equippedAccessory === 'glasses') accGlasses.style.display = 'block';
    else if (equippedAccessory === 'sword') accSword.style.display = 'block';
    else if (equippedAccessory === 'crown') accCrown.style.display = 'block';
}

function shouldSpawnSuper() {
    return superGrainPurchased && grainActive && superGrainActive;
}

// ============================================================
// ==================== МЫШЬ-СОБИРАТОР ========================
// ============================================================

function createMouse() {
    if (mouseElement) return;
    mouseElement = document.createElement('div');
    mouseElement.className = 'mouse-runner';
    mouseElement.innerHTML = `
                🐁
                <div class="mouse-shadow"></div>
            `;
    const rect = clickArea.getBoundingClientRect();
    mouseElement.style.left = (Math.random() * (rect.width - 60) + 10) + 'px';
    mouseElement.style.top = (Math.random() * (rect.height - 60) + 10) + 'px';
    clickArea.appendChild(mouseElement);
}

function removeMouse() {
    if (mouseMoveInterval) {
        clearInterval(mouseMoveInterval);
        mouseMoveInterval = null;
    }
    if (mouseElement) {
        mouseElement.remove();
        mouseElement = null;
    }
}

function moveMouseToTarget() {
    if (!mouseElement || !mouseActive) return;
    if (!currentGrainElement) return;
    const grainRect = currentGrainElement.getBoundingClientRect();
    const areaRect = clickArea.getBoundingClientRect();
    const targetX = grainRect.left - areaRect.left + grainRect.width / 2 - 25;
    const targetY = grainRect.top - areaRect.top + grainRect.height / 2 - 25;
    const currentX = parseFloat(mouseElement.style.left) || 0;
    const currentY = parseFloat(mouseElement.style.top) || 0;
    const dx = targetX - currentX;
    const dy = targetY - currentY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 20) {
        if (!mouseCollectCooldown && currentGrainElement) {
            mouseCollectCooldown = true;
            mouseElement.classList.add('collecting');
            const isSuper = currentGrainElement.classList.contains('super');
            let value = 0;
            if (isSuper) {
                value = SUPER_GRAIN_BASE * getTotalClickPower();
            } else {
                value = grainBase * getTotalClickPower();
            }
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
            if (currentGrainElement) {
                currentGrainElement.style.transform = 'scale(0.3)';
                currentGrainElement.style.opacity = '0';
                removeGrain();
            }
            setTimeout(() => {
                mouseElement.classList.remove('collecting');
                mouseCollectCooldown = false;
            }, 400);
        }
        return;
    }
    const speed = Math.min(dist / 20, 8);
    const moveX = (dx / dist) * speed;
    const moveY = (dy / dist) * speed;
    let newX = currentX + moveX;
    let newY = currentY + moveY;
    const areaRect2 = clickArea.getBoundingClientRect();
    newX = Math.max(5, Math.min(areaRect2.width - 55, newX));
    newY = Math.max(5, Math.min(areaRect2.height - 55, newY));
    mouseElement.style.left = newX + 'px';
    mouseElement.style.top = newY + 'px';
    if (currentGrainElement) {
        mouseIndicator.textContent = '🎯 Цель найдена!';
        mouseIndicator.className = 'indicator-text active';
    }
}

function toggleMouse(state) {
    mouseActive = state;
    if (mouseActive) {
        createMouse();
        if (mouseMoveInterval) clearInterval(mouseMoveInterval);
        mouseMoveInterval = setInterval(() => {
            moveMouseToTarget();
        }, 50);
    } else {
        removeMouse();
    }
    saveGame();
    updateUI();
}

// ============================================================
// ==================== ЗЕРНО =================================
// ============================================================

function spawnGrain() {
    if (isGrainActive) return;
    if (!grainActive || grainLevel === 0) return;
    const useSuper = shouldSpawnSuper();
    if (useSuper) {
        spawnSuperGrainInternal();
    } else if (!superGrainActive || !superGrainPurchased) {
        spawnNormalGrainInternal();
    }
}

function spawnNormalGrainInternal() {
    if (isGrainActive) return;
    if (!grainActive || grainLevel === 0) return;
    if (currentGrainElement) {
        removeGrain();
    }
    isGrainActive = true;
    const totalPower = getTotalClickPower();
    const grainValue = grainBase * totalPower;
    const grain = document.createElement('div');
    grain.className = 'grain-object';
    grain.innerHTML = `
                🌽
                <span class="grain-value">+${grainValue}</span>
                <div class="timer-bar"><div class="fill" style="width:100%;"></div></div>
            `;
    const rect = clickArea.getBoundingClientRect();
    const size = 60;
    grain.style.left = (Math.random() * (rect.width - size - 40) + 20) + 'px';
    grain.style.top = (Math.random() * (rect.height - size - 40) + 20) + 'px';
    grain.addEventListener('click', function(e) {
        e.stopPropagation();
        collectGrain(grainValue);
    });
    clickArea.appendChild(grain);
    currentGrainElement = grain;
    if (mouseActive) {
        mouseIndicator.textContent = '🎯 Цель найдена!';
        mouseIndicator.className = 'indicator-text active';
    }
    let timeLeft = GRAIN_LIFETIME / 1000;
    const fill = grain.querySelector('.fill');
    grainTimerInterval = setInterval(() => {
        timeLeft -= 0.1;
        const percent = (timeLeft / (GRAIN_LIFETIME / 1000)) * 100;
        if (fill) fill.style.width = Math.max(0, percent) + '%';
        if (timeLeft <= 0) {
            removeGrain();
        }
    }, 100);
    grainLifeTimeout = setTimeout(() => {
        removeGrain();
    }, GRAIN_LIFETIME);
}

function spawnSuperGrainInternal() {
    if (isGrainActive) return;
    if (!grainActive || !superGrainActive || !superGrainPurchased) return;
    if (currentGrainElement) {
        removeGrain();
    }
    isGrainActive = true;
    const totalPower = getTotalClickPower();
    const grainValue = SUPER_GRAIN_BASE * totalPower;
    const grain = document.createElement('div');
    grain.className = 'grain-object super';
    grain.innerHTML = `
                🌽
                <span class="grain-value">⭐ +${grainValue}</span>
                <div class="timer-bar"><div class="fill" style="width:100%;"></div></div>
            `;
    const rect = clickArea.getBoundingClientRect();
    const size = 60;
    grain.style.left = (Math.random() * (rect.width - size - 40) + 20) + 'px';
    grain.style.top = (Math.random() * (rect.height - size - 40) + 20) + 'px';
    grain.addEventListener('click', function(e) {
        e.stopPropagation();
        collectGrain(grainValue);
    });
    clickArea.appendChild(grain);
    currentGrainElement = grain;
    if (mouseActive) {
        mouseIndicator.textContent = '🎯 Цель найдена!';
        mouseIndicator.className = 'indicator-text active';
    }
    let timeLeft = GRAIN_LIFETIME / 1000;
    const fill = grain.querySelector('.fill');
    grainTimerInterval = setInterval(() => {
        timeLeft -= 0.1;
        const percent = (timeLeft / (GRAIN_LIFETIME / 1000)) * 100;
        if (fill) fill.style.width = Math.max(0, percent) + '%';
        if (timeLeft <= 0) {
            removeGrain();
        }
    }, 100);
    grainLifeTimeout = setTimeout(() => {
        removeGrain();
    }, GRAIN_LIFETIME);
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
    if (grainTimerInterval) {
        clearInterval(grainTimerInterval);
        grainTimerInterval = null;
    }
    if (grainLifeTimeout) {
        clearTimeout(grainLifeTimeout);
        grainLifeTimeout = null;
    }
    if (currentGrainElement) {
        currentGrainElement.remove();
        currentGrainElement = null;
    }
    if (mouseActive) {
        mouseIndicator.textContent = '⏳ Ожидание зерна...';
        mouseIndicator.className = 'indicator-text';
    }
    if (grainActive && grainLevel > 0) {
        const useSuper = shouldSpawnSuper();
        let delay;
        if (useSuper) {
            delay = SUPER_GRAIN_SPAWN_MIN + Math.random() * (SUPER_GRAIN_SPAWN_MAX - SUPER_GRAIN_SPAWN_MIN);
        } else {
            delay = GRAIN_SPAWN_MIN + Math.random() * (GRAIN_SPAWN_MAX - GRAIN_SPAWN_MIN);
        }
        if (grainSpawnTimeout) clearTimeout(grainSpawnTimeout);
        grainSpawnTimeout = setTimeout(() => {
            spawnGrain();
        }, delay);
    }
}

function toggleGrain(state) {
    grainActive = state;
    if (grainActive) {
        if (grainSpawnTimeout) clearTimeout(grainSpawnTimeout);
        const useSuper = shouldSpawnSuper();
        let delay;
        if (useSuper) {
            delay = SUPER_GRAIN_SPAWN_MIN + Math.random() * (SUPER_GRAIN_SPAWN_MAX - SUPER_GRAIN_SPAWN_MIN);
        } else {
            delay = GRAIN_SPAWN_MIN + Math.random() * (GRAIN_SPAWN_MAX - GRAIN_SPAWN_MIN);
        }
        grainSpawnTimeout = setTimeout(() => {
            spawnGrain();
        }, delay);
    } else {
        if (grainSpawnTimeout) {
            clearTimeout(grainSpawnTimeout);
            grainSpawnTimeout = null;
        }
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
            const delay = GRAIN_SPAWN_MIN + Math.random() * (GRAIN_SPAWN_MAX - GRAIN_SPAWN_MIN);
            grainSpawnTimeout = setTimeout(() => {
                spawnGrain();
            }, delay);
        }
    } else if (superGrainActive && grainActive) {
        removeGrain();
        if (grainSpawnTimeout) clearTimeout(grainSpawnTimeout);
        const delay = SUPER_GRAIN_SPAWN_MIN + Math.random() * (SUPER_GRAIN_SPAWN_MAX - SUPER_GRAIN_SPAWN_MIN);
        grainSpawnTimeout = setTimeout(() => {
            spawnGrain();
        }, delay);
    }
    saveGame();
    updateUI();
}

// ============================================================
// ==================== СБРОС =================================
// ============================================================

resetBtn.addEventListener('click', function() {
    currentCode = generateCode();
    codeDisplay.textContent = currentCode;
    codeInput.value = '';
    confirmBox.classList.remove('show');
    confirmResetBtn.disabled = true;
    resetStatus.textContent = '';
    resetModal.classList.add('open');
    codeInput.focus();
});

cancelResetBtn.addEventListener('click', function() {
    resetModal.classList.remove('open');
    codeInput.value = '';
    confirmBox.classList.remove('show');
    confirmResetBtn.disabled = true;
    resetStatus.textContent = '';
});

codeInput.addEventListener('input', function() {
    const entered = this.value.trim();
    if (entered === currentCode) {
        confirmBox.classList.add('show');
        confirmResetBtn.disabled = false;
        resetStatus.textContent = '✅ Код верный! Нажмите "СБРОСИТЬ" для подтверждения.';
        resetStatus.style.color = '#45f3ff';
    } else {
        confirmBox.classList.remove('show');
        confirmResetBtn.disabled = true;
        if (entered.length > 0) {
            resetStatus.textContent = '❌ Неверный код!';
            resetStatus.style.color = '#ff0033';
        } else {
            resetStatus.textContent = '';
        }
    }
});

confirmResetBtn.addEventListener('click', function() {
    if (codeInput.value.trim() === currentCode) {
        resetAllProgress();
    }
});

resetModal.addEventListener('click', function(e) {
    if (e.target === this) {
        resetModal.classList.remove('open');
        codeInput.value = '';
        confirmBox.classList.remove('show');
        confirmResetBtn.disabled = true;
        resetStatus.textContent = '';
    }
});

// ============================================================
// ==================== ОБРАБОТЧИКИ ===========================
// ============================================================

initMusic();

checkGameVersion();

updateUI();

if (hamsterPurchased) {
    startPoopProduction();
}

setTimeout(() => {
    AntiCheat.start();
}, 500);

// ============================================================
// ==================== МАГАЗИН ===============================
// ============================================================

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
        if (!isOwned) {
            if (score >= price) {
                score -= price;
                ownedAccessories.push(accessory);
                saveGame();
                updateUI();
            } else {
                alert("Не хватает монет! Нужно " + price + " $RAT");
            }
        } else {
            if (equippedAccessory === accessory) {
                equippedAccessory = null;
            } else {
                equippedAccessory = accessory;
            }
            saveGame();
            updateUI();
        }
    });
});

ratContainer.addEventListener('click', (e) => {
    if (isBanned) return;
    const currentTime = performance.now();
    if (lastClickTime !== 0) {
        const interval = currentTime - lastClickTime;
        if (interval < 35) {
            triggerAntiCheat("⚠️ СЛИШКОМ БЫСТРО! КАПКАН ЗАКРЫЛСЯ НА 5 СЕК ⚠️");
            lastClickTime = currentTime;
            return;
        }
        clickIntervals.push(interval);
        if (clickIntervals.length > maxIntervalHistory) { clickIntervals.shift(); }
        if (clickIntervals.length === maxIntervalHistory) {
            const sum = clickIntervals.reduce((a, b) => a + b, 0);
            const avgInterval = sum / clickIntervals.length;
            const isPerfectRhythm = clickIntervals.every(intv => Math.abs(intv - avgInterval) < 4);
            if (isPerfectRhythm) {
                triggerAntiCheat("⚠️ ОБНАРУЖЕН ИДЕАЛЬНЫЙ РИТМ! БАН НА 5 СЕК ⚠️");
                lastClickTime = currentTime;
                return;
            }
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
    cheatWarning.innerText = message;
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

// ===== ПОКУПКИ =====
buyClickBtn.addEventListener('click', () => {
    let currentMax = superGrainPurchased ? 20 : 10;
    if (clickLevel >= currentMax) {
        alert("Максимальный уровень достигнут!");
        return;
    }
    let cost = 50 * (clickLevel + 1);
    if (score >= cost) {
        score -= cost;
        clickLevel++;
        clickPower++;
        saveGame();
        updateUI();
    } else {
        alert("Не хватает монет!");
    }
});

buyAutoBtn.addEventListener('click', () => {
    if (autoLevel >= MAX_AUTO_LEVEL) {
        alert("Максимальный уровень достигнут!");
        return;
    }
    let cost = 100 * (autoLevel + 1);
    if (score >= cost) {
        score -= cost;
        autoLevel++;
        autoClickers++;
        saveGame();
        updateUI();
    } else {
        alert("Не хватает монет!");
    }
});

buyGrainBtn.addEventListener('click', () => {
    if (grainPurchased === 0) {
        let cost = 1000;
        if (score >= cost) {
            score -= cost;
            grainPurchased = 1;
            grainLevel = 1;
            grainBase = 4;
            saveGame();
            updateUI();
            alert('🌽 Зерно куплено! Теперь вы можете улучшать его!');
        } else {
            alert("Не хватает монет! Нужно 1000 $RAT");
        }
        return;
    }
    if (grainLevel >= MAX_GRAIN_LEVEL) {
        alert("Максимальный уровень достигнут!");
        return;
    }
    let cost = 1000 * (grainLevel + 1);
    if (score >= cost) {
        score -= cost;
        grainLevel++;
        grainBase++;
        grainPurchased++;
        saveGame();
        updateUI();
    } else {
        alert("Не хватает монет!");
    }
});

buySuperGrainBtn.addEventListener('click', () => {
    if (superGrainPurchased) {
        alert("Супер зерно уже куплено!");
        return;
    }
    if (score >= 10000) {
        score -= 10000;
        superGrainPurchased = true;
        MAX_CLICK_LEVEL = 20;
        saveGame();
        updateUI();
        alert("⭐ Супер зерно куплено!\n\n🌾 Лимит 'Больше зерна' увеличен до 20!\n📱 Теперь доступен тумблер супер-зерна!\n🐁 В магазине появилась Мышь-собиратор за 15 000 $RAT!");
    } else {
        alert("Не хватает монет! Нужно 10 000 $RAT");
    }
});

buyMouseShopBtn.addEventListener('click', () => {
    if (mousePurchased) {
        alert("Мышь-собиратор уже куплена!");
        return;
    }
    if (score >= 15000) {
        score -= 15000;
        mousePurchased = true;
        saveGame();
        updateUI();
        alert("🐁 Мышь-собиратор куплена!\n\nТеперь она будет автоматически собирать зерно!\n📱 Включите тумблер мыши справа!");
    } else {
        alert("Не хватает монет! Нужно 15 000 $RAT");
    }
});

buyHamsterShopBtn.addEventListener('click', () => {
    if (hamsterPurchased) {
        alert("Вольер уже куплен!");
        return;
    }
    if (score >= 20000) {
        score -= 20000;
        hamsterPurchased = true;
        hamsterFood = 50;
        hamsterUpgradeCost = 5000;
        saveGame();
        updateUI();
        startHamsterMovement();
        startFoodDepletion();
        startPoopProduction();
        alert("🐹 Вольер с морскими свинками куплен!\n\nОни дают бонус к силе клика!\n🍖 Кормите их чтобы активировать бонус!\n⬆️ Улучшайте свинок в магазине для увеличения бонуса до x1.5!\n💩 Они производят какашки, которые можно переработать в удобрения!");
    } else {
        alert("Не хватает монет! Нужно 20 000 $RAT");
    }
});

buyHamsterUpgradeBtn.addEventListener('click', () => {
    if (!hamsterPurchased) {
        alert("Сначала купите вольер с морскими свинками!");
        return;
    }
    if (hamsterLevel >= MAX_HAMSTER_LEVEL) {
        alert("Максимальный уровень достигнут!");
        return;
    }
    if (score < hamsterUpgradeCost) {
        alert("Не хватает монет! Нужно " + hamsterUpgradeCost + " $RAT");
        return;
    }
    score -= hamsterUpgradeCost;
    hamsterLevel++;
    hamsterUpgradeCost = Math.round(hamsterUpgradeCost * 1.5);
    hamsterFood = Math.min(hamsterMaxFood, hamsterFood + 15);
    saveGame();
    updateUI();
    if (hamsterFood > 0 && !foodDepletionInterval) {
        startFoodDepletion();
    }
    alert("⬆️ Морские свинки улучшены!\n\nТекущий бонус: x" + getHamsterBonus().toFixed(1));
});

buyBossMenuBtn.addEventListener('click', () => {
    if (bossMenuPurchased) {
        alert("Меню боссов уже куплено!");
        return;
    }
    if (score >= 50000) {
        score -= 50000;
        bossMenuPurchased = true;
        saveGame();
        updateUI();
        alert("💀 Меню боссов куплено!\n\nТеперь доступен череп под тумблерами!\n🦫 В магазине появилась Капибара за 100 000 $RAT!");
    } else {
        alert("Не хватает монет! Нужно 50 000 $RAT");
    }
});

buyCapybaraBtn.addEventListener('click', () => {
    if (capybaraPurchased) {
        alert("Капибара уже куплена!");
        return;
    }
    if (score >= 100000) {
        score -= 100000;
        capybaraPurchased = true;
        capybaraDefeated = false;
        capybaraCooldown = 0;
        localStorage.setItem('rat_capybaraCooldown', 0);
        localStorage.setItem('rat_capybaraDefeated', 'false');
        saveGame();
        updateUI();
        startBossCooldownTimer();
        alert("🦫 Капибара куплена!\n\nТеперь вы можете сражаться с ней в меню боссов!\n⚔️ За победу вы получите Корм для крысы!");
    } else {
        alert("Не хватает монет! Нужно 100 000 $RAT");
    }
});

buyPlantBtn.addEventListener('click', () => {
    if (plantPurchased) {
        alert("Горшок уже куплен!");
        return;
    }
    if (score >= 30000) {
        score -= 30000;
        plantPurchased = true;
        plantLevel = 1;
        plantData[0].stage = 'idle';
        plantData[0].progress = 0;
        plantData[0].type = null;
        plantData[0].fertilizer = false;
        savePlantData();
        saveGame();
        updateUI();
        setTimeout(() => updatePlantsUI(), 100);
        alert("🌱 Первый горшок куплен!\n\nПоявился слева внизу!\n💧 В магазине теперь можно купить типы растений (Трава, Перец, Яблоко, Капуста)!");
    } else {
        alert("Не хватает монет! Нужно 30 000 $RAT");
    }
});

buyPlantUpgrade1Btn.addEventListener('click', () => {
    if (plantUpgrade1) {
        alert("Улучшение уже куплено!");
        return;
    }
    if (!plantPurchased) {
        alert("Сначала купите первый горшок!");
        return;
    }
    if (score >= 50000) {
        score -= 50000;
        plantUpgrade1 = true;
        plantLevel = 2;
        plantData[1].stage = 'idle';
        plantData[1].progress = 0;
        plantData[1].type = null;
        plantData[1].fertilizer = false;
        savePlantData();
        saveGame();
        updateUI();
        setTimeout(() => updatePlantsUI(), 100);
        alert("⬆️ Улучшение горшков I куплено!\n\nТеперь у вас 2 горшка!");
    } else {
        alert("Не хватает монет! Нужно 50 000 $RAT");
    }
});

buyPlantUpgrade2Btn.addEventListener('click', () => {
    if (plantUpgrade2) {
        alert("Улучшение уже куплено!");
        return;
    }
    if (!plantUpgrade1) {
        alert("Сначала купите первое улучшение горшков!");
        return;
    }
    if (score >= 70000) {
        score -= 70000;
        plantUpgrade2 = true;
        plantLevel = 3;
        plantData[2].stage = 'idle';
        plantData[2].progress = 0;
        plantData[2].type = null;
        plantData[2].fertilizer = false;
        savePlantData();
        saveGame();
        updateUI();
        setTimeout(() => updatePlantsUI(), 100);
        alert("⬆️ Улучшение горшков II куплено!\n\nТеперь у вас 3 горшка!\n🌱 МАКСИМУМ ДОСТИГНУТ!");
    } else {
        alert("Не хватает монет! Нужно 70 000 $RAT");
    }
});

buyPlantTypeGrassBtn.addEventListener('click', () => {
    if (plantTypeGrass) {
        alert("Трава уже куплена!");
        return;
    }
    if (score >= 10000) {
        score -= 10000;
        plantTypeGrass = true;
        saveGame();
        updateUI();
        alert("🌿 Трава куплена! Теперь вы можете посадить её в горшок!");
    } else {
        alert("Не хватает монет! Нужно 10 000 $RAT");
    }
});

buyPlantTypePepperBtn.addEventListener('click', () => {
    if (plantTypePepper) {
        alert("Болгарский перец уже куплен!");
        return;
    }
    if (score >= 25000) {
        score -= 25000;
        plantTypePepper = true;
        saveGame();
        updateUI();
        alert("🌶️ Болгарский перец куплен! Теперь вы можете посадить его в горшок!");
    } else {
        alert("Не хватает монет! Нужно 25 000 $RAT");
    }
});

buyPlantTypeAppleBtn.addEventListener('click', () => {
    if (plantTypeApple) {
        alert("Яблоко уже куплено!");
        return;
    }
    if (score >= 40000) {
        score -= 40000;
        plantTypeApple = true;
        saveGame();
        updateUI();
        alert("🍎 Яблоко куплено! Теперь вы можете посадить его в горшок!");
    } else {
        alert("Не хватает монет! Нужно 40 000 $RAT");
    }
});

buyPlantTypeCabbageBtn.addEventListener('click', () => {
    if (plantTypeCabbage) {
        alert("Капуста уже куплена!");
        return;
    }
    if (score >= 15000) {
        score -= 15000;
        plantTypeCabbage = true;
        saveGame();
        updateUI();
        alert("🥬 Капуста куплена! Теперь вы можете посадить её в горшок!");
    } else {
        alert("Не хватает монет! Нужно 15 000 $RAT");
    }
});

buyLabBtn.addEventListener('click', () => {
    if (labPurchased) {
        alert("Лаборатория уже куплена!");
        return;
    }
    if (score >= 50000) {
        score -= 50000;
        labPurchased = true;
        saveGame();
        updateUI();
        alert("🧪 Лаборатория куплена!\n\nТеперь доступна кнопка 'ЛАБОРАТОРИЯ'!\n⚙️ Внутри доступен станок удобрений!");
    } else {
        alert("Не хватает монет! Нужно 50 000 $RAT");
    }
});

buyCombinerBtn.addEventListener('click', () => {
    if (combinerPurchased) {
        alert("Комбинатор уже куплен!");
        return;
    }
    if (!labPurchased) {
        alert("Сначала купите лабораторию!");
        return;
    }
    if (score >= 30000) {
        score -= 30000;
        combinerPurchased = true;
        combinerLevel = 0;
        combinerSlots = [null, null, null];
        combinerRunning = [false, false, false];
        combinerProgress = [0, 0, 0];
        combinerTimer = [null, null, null];
        saveGame();
        updateUI();
        alert("🧪 Комбинатор куплен!\n\nТеперь доступен раздел 'Комбинатор' в лаборатории!\n📦 2 слота для крафта!\n🔬 Улучшение до 3 слотов за 60 000 $RAT!");
    } else {
        alert("Не хватает монет! Нужно 30 000 $RAT");
    }
});

buyCombinerUpgradeBtn.addEventListener('click', () => {
    if (combinerLevel >= 1) {
        alert("Максимальный уровень достигнут!");
        return;
    }
    if (!combinerPurchased) {
        alert("Сначала купите комбинатор!");
        return;
    }
    if (score >= 60000) {
        score -= 60000;
        combinerLevel = 1;
        combinerSlots = [null, null, null];
        combinerProgress = [0, 0, 0];
        saveGame();
        updateUI();
        alert("⬆️ Комбинатор улучшен!\n\nТеперь доступно 3 слота для крафта!");
    } else {
        alert("Не хватает монет! Нужно 60 000 $RAT");
    }
});

buyExtractorBtn.addEventListener('click', () => {
    if (extractorPurchased) {
        alert("Аппарат уже куплен!");
        return;
    }
    if (!combinerPurchased) {
        alert("Сначала купите комбинатор!");
        return;
    }
    if (score >= 20000) {
        score -= 20000;
        extractorPurchased = true;
        extractorQueue = [];
        extractorProgress = [];
        saveGame();
        updateUI();
        alert("⚗️ Аппарат превращения куплен!\n\nТеперь экстракты будут автоматически превращаться в готовые предметы!\n⏱️ 1 минута на превращение!");
    } else {
        alert("Не хватает монет! Нужно 20 000 $RAT");
    }
});

buyManipulatorBtn.addEventListener('click', () => {
    if (manipulatorLevel >= 3) {
        alert("Максимальное количество манипуляторов достигнуто!");
        return;
    }
    if (!isAllLabPartsBought()) {
        alert("❌ Сначала купите все части лаборатории!\n\nНужно:\n🧪 Лаборатория\n🌱 Горшок + улучшения\n🌿 Трава, Перец, Яблоко, Капуста\n🧪 Комбинатор\n⚗️ Аппарат превращения");
        return;
    }
    if (score >= 10000) {
        score -= 10000;
        manipulatorLevel++;
        manipulatorPurchased = true;
        while (manipulatorSettings.length < manipulatorLevel) {
            manipulatorSettings.push({ enabled: false, action: 'none', target: '' });
        }
        saveGame();
        updateUI();
        restartManipulators();
        alert("🤖 Манипулятор куплен!\n\nТеперь доступен новый тумблер справа!\n⚙️ Настройте его через кнопку ⚙️");
    } else {
        alert("Не хватает монет! Нужно 10 000 $RAT");
    }
});

// ============================================================
// ==================== ЛАБОРАТОРИЯ ===========================
// ============================================================

openLabBtn.addEventListener('click', function() {
    labModal.classList.add('open');
    labModal.style.display = 'flex';
    updateLabUI();
});

closeLabBtn.addEventListener('click', function() {
    labModal.classList.remove('open');
    labModal.style.display = 'none';
});

labModal.addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
        this.classList.remove('open');
    }
});

machineBtn.addEventListener('click', function() {
    if (machineRunning) return;
    if (machineProgress >= getMachineTime() && machineProgress > 0) {
        collectFertilizer();
    } else {
        startMachine();
    }
});

machineUpgradeBtn.addEventListener('click', upgradeMachine);

// ============================================================
// ==================== КОМБИНАТОР ============================
// ============================================================

openCombinerBtn.addEventListener('click', function() {
    if (!combinerPurchased) {
        alert('🧪 Сначала купите комбинатор в магазине (раздел "Бусты")!');
        return;
    }
    combinerModal.classList.add('open');
    combinerModal.style.display = 'flex';
    updateCombinerUI();
});

closeCombinerBtn.addEventListener('click', function() {
    combinerModal.classList.remove('open');
    combinerModal.style.display = 'none';
});

combinerModal.addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
        this.classList.remove('open');
    }
});

// ============================================================
// ==================== АППАРАТ ПРЕВРАЩЕНИЯ ==================
// ============================================================

openExtractorBtn.addEventListener('click', function() {
    if (!extractorPurchased) {
        alert('⚗️ Сначала купите аппарат превращения в магазине (раздел "Бусты")!');
        return;
    }
    extractorModal.classList.add('open');
    extractorModal.style.display = 'flex';
    updateExtractorUI();
});

closeExtractorBtn.addEventListener('click', function() {
    extractorModal.classList.remove('open');
    extractorModal.style.display = 'none';
});

extractorModal.addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
        this.classList.remove('open');
    }
});

// ============================================================
// ==================== НАСТРОЙКИ МАНИПУЛЯТОРА ===============
// ============================================================

closeSettingsBtn.addEventListener('click', function() {
    settingsModal.classList.remove('open');
    settingsModal.style.display = 'none';
});

settingsModal.addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
        this.classList.remove('open');
    }
});

// ============================================================
// ==================== КАКАШКИ ===============================
// ============================================================

poopBtn.addEventListener('click', function() {
    if (poopCount <= 0) {
        alert('💩 Нет какашек для сбора!');
        return;
    }

    let collected = poopCount;
    labPoopCount = labPoopCount + collected;
    poopCount = 0;

    saveGame();
    updateUI();
    if (labPurchased) updateLabUI();

    alert('💩 ' + collected + ' какашек отправлены в лабораторию!\n🔄 Запустите станок (7 💩 → 1 🧪)');
});

// ============================================================
// ==================== МЕНЮ БОССОВ ===========================
// ============================================================

bossSkull.addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();
    if (bossMenuPurchased) {
        bossMenu.style.display = 'block';
        bossMenu.classList.add('open');
        updateBossStatus();
    } else {
        alert('Сначала купите Меню боссов в магазине за 50 000 $RAT!');
    }
});

document.getElementById('skullIcon').addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();
    if (bossMenuPurchased) {
        bossMenu.style.display = 'block';
        bossMenu.classList.add('open');
        updateBossStatus();
    } else {
        alert('Сначала купите Меню боссов в магазине за 50 000 $RAT!');
    }
});

closeBossMenuBtn.addEventListener('click', function() {
    bossMenu.style.display = 'none';
    bossMenu.classList.remove('open');
});

bossMenu.addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
        this.classList.remove('open');
    }
});

fightCapybaraBtn.addEventListener('click', () => {
    if (!capybaraPurchased) return;
    if (capybaraCooldown > 0) return;
    if (capybaraDefeated) return;
    startBossFight();
});

// ============================================================
// ==================== ИНВЕНТАРЬ ==============================
// ============================================================

openInventoryBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();
    updateInventoryUI();
    inventoryModal.style.display = 'flex';
    inventoryModal.classList.add('open');
});

closeInventoryBtn.addEventListener('click', function() {
    inventoryModal.style.display = 'none';
    inventoryModal.classList.remove('open');
});

inventoryModal.addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
        this.classList.remove('open');
    }
});

feedBtn.addEventListener('click', feedHamsters);

grainToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    if (grainLevel === 0) {
        alert("Сначала купите улучшение Зерно в магазине!");
        return;
    }
    toggleGrain(!grainActive);
});

superGrainToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!superGrainPurchased) {
        alert("Сначала купите Супер зерно в магазине!");
        return;
    }
    toggleSuperGrain(!superGrainActive);
});

mouseToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!mousePurchased) {
        alert("Сначала купите Мышь-собиратор в магазине!");
        return;
    }
    toggleMouse(!mouseActive);
});

// ============================================================
// ==================== ПАССИВНЫЙ ДОХОД =======================
// ============================================================

setInterval(() => {
    if (autoClickers > 0) {
        score += autoClickers;
        saveGame();
        updateUI();
    }
}, 1000);

loadPlantData();
startBossCooldownTimer();

setInterval(() => {
    updateBossStatus();
}, 1000);

setInterval(() => {
    if (plantPurchased && plantLevel > 0) {
        updatePlantsUI();
    }
}, 5000);

setInterval(() => {
    if (labPurchased) {
        updateLabUI();
    }
}, 1000);

setInterval(() => {
    if (combinerPurchased) {
        updateCombinerUI();
    }
}, 1000);

setInterval(() => {
    if (extractorPurchased) {
        updateExtractorUI();
    }
}, 1000);

window.addEventListener('beforeunload', function() {
    saveGame();
});

console.log('💀 Игра загружена!');
console.log('💀 Версия:', GAME_VERSION);
console.log('💀 Мультивкладки ЗАБЛОКИРОВАНЫ');
console.log('💀 Античит АКТИВЕН и защищён');
console.log('🔊 Музыка включена:', musicEnabled);
console.log('🎵 ID видео:', musicVideoId);
