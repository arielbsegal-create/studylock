let username = localStorage.getItem("lastUser") || "";
let xp = 0, tokens = 0, level = 1, xpNeeded = 100;
let minutes = 25, totalSeconds = 1500, timer = null, running = false;
let unlockedThemes = ["default"], activeTheme = "default", battleActive = false, battleWins = 0;

const bots = [{name: "ProFocus", xp: 1500}, {name: "StudyMage", xp: 900}];

function updateUI() {
    document.getElementById("xp").textContent = xp;
    document.getElementById("xpNeeded").textContent = xpNeeded;
    document.getElementById("level").textContent = level;
    document.getElementById("tokens").textContent = tokens;
    document.getElementById("xpFill").style.width = (xp / xpNeeded) * 100 + "%";

    let players = [...bots, {name: "You", xp: xp + (level * 1000)}].sort((a,b) => b.xp - a.xp);
    document.getElementById("leaderboardList").innerHTML = players.map((p, i) => `<li>${i+1}. ${p.name}: ${p.xp}</li>`).join('');
}

function saveData() {
    if (!username) return;
    localStorage.setItem(username, JSON.stringify({xp, tokens, level, unlockedThemes, activeTheme}));
    localStorage.setItem("lastUser", username);
}

function loadData() {
    const saved = JSON.parse(localStorage.getItem(username));
    if (saved) {
        xp = saved.xp || 0; tokens = saved.tokens || 0; level = saved.level || 1;
        unlockedThemes = saved.unlockedThemes || ["default"]; activeTheme = saved.activeTheme || "default";
        document.body.style.background = activeTheme === "neon" ? "linear-gradient(135deg,#ff00cc,#3333ff)" : "#0f172a";
    }
    updateUI();
}

function updateTimerDisplay() {
    let m = Math.floor(totalSeconds / 60), s = totalSeconds % 60;
    document.getElementById("timer").textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
}

function handleFinish() {
    let gainXP = 50 + (minutes * 2), gainTokens = Math.floor(minutes / 5);
    if (battleActive) {
        battleWins++;
        document.getElementById("battleStatus").textContent = `BOSS HP: ${3-battleWins}/3`;
        if (battleWins >= 3) { gainXP += 200; gainTokens += 10; battleActive = false; document.getElementById("battleStatus").textContent = "BOSS DEFEATED!"; }
    }
    xp += gainXP; tokens += gainTokens;
    while(xp >= xpNeeded) { xp -= xpNeeded; level++; xpNeeded = Math.floor(xpNeeded * 1.3); }
    totalSeconds = minutes * 60; running = false;
    updateUI(); saveData(); updateTimerDisplay();
}

document.getElementById("loginBtn").onclick = () => {
    username = document.getElementById("usernameInput").value;
    if (!username) return;
    document.getElementById("profileName").textContent = username;
    document.getElementById("loginScreen").classList.add("hidden");
    loadData();
};

document.getElementById("startBtn").onclick = () => {
    if (running) return;
    running = true;
    timer = setInterval(() => {
        totalSeconds--; updateTimerDisplay();
        if (totalSeconds <= 0) { clearInterval(timer); handleFinish(); }
    }, 1000);
};

document.getElementById("pauseBtn").onclick = () => { clearInterval(timer); running = false; };
document.getElementById("resetBtn").onclick = () => { clearInterval(timer); running = false; totalSeconds = minutes * 60; updateTimerDisplay(); };
document.getElementById("upBtn").onclick = () => { minutes++; totalSeconds = minutes * 60; document.getElementById("minutesDisplay").textContent = minutes; updateTimerDisplay(); };
document.getElementById("downBtn").onclick = () => { if(minutes > 1) minutes--; totalSeconds = minutes * 60; document.getElementById("minutesDisplay").textContent = minutes; updateTimerDisplay(); };
document.getElementById("battleBtn").onclick = () => { battleActive = true; battleWins = 0; document.getElementById("battleStatus").textContent = "BATTLE ON! DO 3 SESSIONS"; };
document.getElementById("openShopBtn").onclick = () => document.getElementById("shopPage").classList.remove("hidden");
document.getElementById("backBtn").onclick = () => document.getElementById("shopPage").classList.add("hidden");

document.getElementById("buyThemeBtn").onclick = () => {
    if (unlockedThemes.includes("neon")) {
        activeTheme = activeTheme === "neon" ? "default" : "neon";
    } else if (tokens >= 20) {
        tokens -= 20; unlockedThemes.push("neon"); activeTheme = "neon";
    }
    document.body.style.background = activeTheme === "neon" ? "linear-gradient(135deg,#ff00cc,#3333ff)" : "#0f172a";
    updateUI(); saveData();
};

updateTimerDisplay();