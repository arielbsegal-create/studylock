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

function handleFinish() {
    running = false; totalSeconds = minutes * 60; setCircleProgress(1);

    // Reset Buttons
    document.getElementById("pauseBtn").classList.add("hidden");
    document.getElementById("startBtn").classList.remove("hidden");
    document.getElementById("startBtn").textContent = "INITIATE FOCUS";

    document.body.classList.add("shake-event");
    setTimeout(() => document.body.classList.remove("shake-event"), 300);

    let baseXP = 50 + (minutes * 1.5);
    let baseTokens = Math.floor(minutes / 5);
    let manaGained = 20 + Math.floor(minutes / 10);

    if(activeBuffs.surge) baseXP *= 1.2; activeBuffs.surge = false;
    if(battleState.active) { battleState.bossHp -= 34; checkBossStatus(); }

    state.mana = Math.min(state.maxMana, state.mana + manaGained);
    state.xp += baseXP; state.tokens += baseTokens;

    while(state.xp >= state.xpNeeded) {
        state.xp -= state.xpNeeded; state.level++; state.xpNeeded = Math.floor(state.xpNeeded * 1.4);
        levelUpLoot();
    }
    updateHUD();
}

function checkBossStatus() {
    if(battleState.bossHp <= 0) { battleState.active = false; battleState.bossHp = 100; bossVictoryLoot(); }
}

function levelUpLoot() {
    state.tokens += 10; showReward("LEVEL UP!", "🏆", `You reached LVL ${state.level}! Gained 10 Tokens.`);
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

updateHUD();