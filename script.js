// --- BACKGROUND PARTICLES ---
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();
class P {
    constructor() { this.x = Math.random()*canvas.width; this.y = Math.random()*canvas.height; this.v = Math.random()*0.2; this.s = Math.random()*1; }
    draw() { ctx.fillStyle = 'rgba(0,242,255,0.15)'; ctx.beginPath(); ctx.arc(this.x, this.y, this.s, 0, Math.PI*2); ctx.fill(); this.y -= this.v; if(this.y < 0) this.y = canvas.height; }
}
for(let i=0; i<70; i++) particles.push(new P());
function anim() { ctx.clearRect(0,0,canvas.width,canvas.height); particles.forEach(p=>p.draw()); requestAnimationFrame(anim); }
anim();

// --- GAME STATE & STATS ---
let state = { xp: 0, tokens: 0, level: 1, xpNeeded: 100, mana: 50, maxMana: 100, hp: 3, maxHp: 3 };
let activeBuffs = { surge: false };
let minutes = 25, totalSeconds = 1500, maxSeconds = 1500, timer = null, running = false;
let battleState = { active: false, bossHp: 100, currentBoss: 'PROCRASTINATOR CRAB' };

// --- CORE UI FUNCTION ---
function updateHUD() {
    document.getElementById("xp").textContent = Math.floor(state.xp);
    document.getElementById("xpNeeded").textContent = state.xpNeeded;
    document.getElementById("level").textContent = state.level;
    document.getElementById("tokens").textContent = state.tokens;
    document.getElementById("xpFill").style.width = `${(state.xp/state.xpNeeded)*100}%`;
    document.getElementById("manaFill").style.width = `${(state.mana/state.maxMana)*100}%`;

    // Core HP Calculation
    let hearts = "";
    for(let i=0; i<state.maxHp; i++) {
        hearts += (i < state.hp) ? "❤️" : "🖤";
    }
    document.getElementById("hpDisplay").textContent = hearts;

    document.getElementById("bossHp").style.width = `${battleState.bossHp}%`;
    const bossCard = document.getElementById("bossCard");
    if(battleState.active) {
        bossCard.classList.remove("boss-inactive");
        bossCard.classList.add("boss-zone-card");
    } else {
        bossCard.classList.add("boss-inactive");
        bossCard.classList.remove("boss-zone-card");
    }
}

function setCircleProgress(percent) {
    const offset = 283 - (percent * 283);
    document.getElementById("timerPath").style.strokeDashoffset = offset;
}

// --- ANTI-CHEAT PUNISHMENT SYSTEM ---
document.addEventListener("visibilitychange", () => {
    if (document.hidden && running) {
        // Punish player for tabbing out
        state.hp--;
        state.xp = Math.max(0, state.xp - 50); // Floor XP at 0

        if (state.hp <= 0) {
            // Death State
            clearInterval(timer);
            running = false;
            totalSeconds = minutes * 60;
            setCircleProgress(1);
            state.hp = state.maxHp; // Reset HP for next try

            document.getElementById("pauseBtn").classList.add("hidden");
            document.getElementById("startBtn").classList.remove("hidden");
            document.getElementById("startBtn").textContent = "INITIATE FOCUS";

            updateHUD();
            alert("💀 CRITICAL FAILURE! 💀\nYou abandoned your post. Core HP depleted. Session terminated.");
        } else {
            updateHUD();
            alert(`⚠️ FOCUS BREACH! ⚠️\nYou left the tab!\nPenalty: -50 XP and -1 Core HP.`);
        }
    }
});

function useAbility(type) {
    if(!running) return alert("System Offline. Start Focus to use abilities.");
    if(type === 'surge' && state.mana >= 10) {
        state.mana -= 10; activeBuffs.surge = true; alert("SCHOLAR SURGE ACTIVE (+20% XP)");
    } else if(type === 'smite' && state.mana >= 30 && battleState.active) {
        state.mana -= 30; battleState.bossHp -= 20;
        if(battleState.bossHp <= 0) checkBossStatus();
        alert("CHRONOS SMITE! -20% Boss HP");
    } else {
        alert("Not enough Mana or Boss not active.");
    }
    updateHUD();
}
// --- NEW INVENTORY STATE ---
let inventory = {
    shields: 0,
    manaBatteries: 0
};

// --- PURCHASE FUNCTION ---
function buyItem(item) {
    if (item === 'battery') {
        if (state.tokens >= 10) {
            state.tokens -= 10;
            inventory.manaBatteries++;
            alert("🔋 MANA BATTERY PURCHASED! (Check Focus Abilities)");
        } else {
            alert("❌ NOT ENOUGH TOKENS!");
        }
    }
    else if (item === 'shield') {
        if (state.tokens >= 25) {
            state.tokens -= 25;
            inventory.shields++;
            alert("🛡️ SHIELD GENERATOR ONLINE! (Auto-restores 1 HP if hit)");
        } else {
            alert("❌ NOT ENOUGH TOKENS!");
        }
    }
    updateHUD();
}

// --- UPDATED HP CHECK (Auto-Shield) ---
// This replaces the old punishment check to include the shield logic
function checkCoreIntegrity() {
    if (document.hidden && running) {
        if (inventory.shields > 0) {
            inventory.shields--;
            alert("🛡️ SHIELD TRIGGERED! Your generator absorbed the distraction penalty.");
        } else {
            state.hp--;
            state.xp = Math.max(0, state.xp - 50);
            alert("⚠️ CORE BREACH! -1 HP. Buy Shields in the Armory to prevent this!");
        }

        if (state.hp <= 0) {
            failSession();
        }
        updateHUD();
    }
}

// Ensure the shop buttons in your HTML call buyItem('battery') or buyItem('shield')
// --- NEW: CALM CHIME SOUND GENERATOR ---
function playFinishSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine'; // Smooth, calm wave
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5 note
    osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.5); // E5 note

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 2);
}

// --- NEW: CONFETTI GENERATOR ---
function triggerConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['#00f2ff', '#39ff14', '#bc13fe', '#ffd700', '#ff3131'];

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');

        // Randomize appearance
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = confetti.style.width;

        // Randomize animation
        const duration = Math.random() * 3 + 2;
        confetti.style.animationDuration = duration + 's';
        confetti.style.opacity = Math.random();

        container.appendChild(confetti);

        // Cleanup memory
        setTimeout(() => confetti.remove(), duration * 1000);
    }
}

function handleFinish() {
    running = false;
    totalSeconds = minutes * 60;
    setCircleProgress(1);

    playFinishSound();
    triggerConfetti();

    document.getElementById("pauseBtn").classList.add("hidden");
    document.getElementById("startBtn").classList.remove("hidden");
    document.getElementById("startBtn").textContent = "INITIATE FOCUS";

    // --- BOOSTED TOKEN CALCULATION ---
    let baseXP = 50 + (minutes * 2); // Increased XP gain

    // Tokens now scale: (1 token per 5 mins) + (Level Bonus)
    // Example: 25 mins at LVL 5 = 5 tokens + 5 bonus = 10 tokens!
    let baseTokens = Math.floor(minutes / 5) + (state.level - 1);

    let manaGained = 25 + Math.floor(minutes / 5); // Faster mana regen

    if(activeBuffs.surge) baseXP *= 1.5; // Buffed surge to 50%
    activeBuffs.surge = false;

    if(battleState.active) {
        battleState.bossHp -= 50; // You now hit the boss harder
        checkBossStatus();
    }

    state.mana = Math.min(state.maxMana, state.mana + manaGained);
    state.xp += baseXP;
    state.tokens += baseTokens;

    while(state.xp >= state.xpNeeded) {
        state.xp -= state.xpNeeded;
        state.level++;
        state.xpNeeded = Math.floor(state.xpNeeded * 1.3); // Slower difficulty curve
        levelUpLoot();
    }
    updateHUD();
}

// --- MASSIVE BOSS REWARDS ---
function bossVictoryLoot() {
    // Defeating a boss now gives a huge payout
    let bossReward = 100 + (state.level * 10);
    state.tokens += bossReward;
    showReward("BOSS DEFEATED!", "💎", `You crushed ${battleState.currentBoss}! Gained ${bossReward} Tokens.`);
}

function levelUpLoot() {
    // Leveling up now gives more tokens
    let lvlReward = 20 + state.level;
    state.tokens += lvlReward;
    showReward("LEVEL UP!", "🏆", `You reached LVL ${state.level}! Gained ${lvlReward} Tokens.`);
}

function checkBossStatus() {
    if(battleState.bossHp <= 0) { battleState.active = false; battleState.bossHp = 100; bossVictoryLoot(); }
}


function bossVictoryLoot() {
    state.tokens += 50; showReward("BOSS DEFEATED!", "💎", `You crushed ${battleState.currentBoss}! Gained 50 Tokens.`);
}

function showReward(title, icon, message) {
    document.getElementById("rewardTitle").textContent = title;
    document.getElementById("lootIcon").textContent = icon;
    document.getElementById("rewardMessage").textContent = message;
    document.getElementById("rewardPopup").classList.remove("hidden");
}
function closeReward() { document.getElementById("rewardPopup").classList.add("hidden"); }

// --- CONTROLS ---
document.getElementById("loginBtn").onclick = () => {
    const user = document.getElementById("usernameInput").value;
    if(user) { document.getElementById("profileName").textContent = user; document.getElementById("loginScreen").classList.add("hidden"); updateHUD(); }
};

document.getElementById("startBtn").onclick = () => {
    if(running) return;
    running = true;

    // Set maxSeconds based on current totalSeconds for the visual circle
    if (totalSeconds === minutes * 60) maxSeconds = totalSeconds;

    // UI Button Swap
    document.getElementById("startBtn").classList.add("hidden");
    document.getElementById("pauseBtn").classList.remove("hidden");

    timer = setInterval(() => {
        totalSeconds--;
        let m = Math.floor(totalSeconds/60), s = totalSeconds%60;
        document.getElementById("timer").textContent = `${m}:${s<10?'0':''}${s}`;
        setCircleProgress(totalSeconds / maxSeconds);
        if(totalSeconds <= 0) { clearInterval(timer); handleFinish(); }
    }, 1000);
};

// Freeze Logic
document.getElementById("pauseBtn").onclick = () => {
    if(!running) return;
    clearInterval(timer);
    running = false;

    // UI Button Swap
    document.getElementById("pauseBtn").classList.add("hidden");
    document.getElementById("startBtn").classList.remove("hidden");
    document.getElementById("startBtn").textContent = "RESUME";
};

document.getElementById("upBtn").onclick = () => { if(running)return; minutes+=5; totalSeconds=minutes*60; document.getElementById("minutesDisplay").textContent=minutes; document.getElementById("timer").textContent=`${minutes}:00`; setCircleProgress(1); };
document.getElementById("downBtn").onclick = () => { if(running)return; if(minutes>5)minutes-=5; totalSeconds=minutes*60; document.getElementById("minutesDisplay").textContent=minutes; document.getElementById("timer").textContent=`${minutes}:00`; setCircleProgress(1); };

document.getElementById("battleBtn").onclick = () => { battleState.active = true; battleState.bossHp = 100; alert("BATTLE ENGAGED! Focus core to damage Boss."); updateHUD(); };
document.getElementById("openShopBtn").onclick = () => document.getElementById("shopPage").classList.remove("hidden");
document.getElementById("backBtn").onclick = () => document.getElementById("shopPage").classList.add("hidden");
// --- SHOP LOGIC ---
function toggleShop(show) {
    const shop = document.getElementById('shopPage');
    if (show) {
        shop.classList.remove('hidden');
    } else {
        shop.classList.add('hidden');
    }
}

// --- ITEM LOGIC ---
function buyItem(item) {
    if (item === 'battery' && state.tokens >= 10) {
        state.tokens -= 10;
        state.mana = Math.min(state.maxMana, state.mana + 50);
        alert("🔋 Mana Restored!");
    } else if (item === 'shield' && state.tokens >= 25) {
        state.tokens -= 25;
        inventory.shields++;
        alert("🛡️ Shield Equipped!");
    } else {
        alert("❌ Not enough tokens!");
    }
    updateHUD();
}
updateHUD();