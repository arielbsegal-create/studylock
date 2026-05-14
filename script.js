// PARTICLE SYSTEM
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        if (this.y > canvas.height) this.y = 0;
    }
    draw() {
        ctx.fillStyle = 'rgba(0, 242, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < 50; i++) particles.push(new Particle());

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
}
animate();

// APP LOGIC
let xp = 0, tokens = 0, level = 1, xpNeeded = 100;
let minutes = 25, totalSeconds = 1500, timer = null, running = false;
let battleActive = false, bossHp = 3;

function updateUI() {
    document.getElementById("xp").textContent = Math.floor(xp);
    document.getElementById("xpNeeded").textContent = xpNeeded;
    document.getElementById("level").textContent = level;
    document.getElementById("tokens").textContent = tokens;
    document.getElementById("xpFill").style.width = `${(xp/xpNeeded)*100}%`;
    document.getElementById("bossHp").style.width = `${(bossHp/3)*100}%`;
}

document.getElementById("loginBtn").onclick = () => {
    const user = document.getElementById("usernameInput").value;
    if(user) {
        document.getElementById("profileName").textContent = user;
        document.getElementById("loginScreen").classList.add("hidden");
        updateUI();
    }
};

document.getElementById("startBtn").onclick = () => {
    if (running) return;
    running = true;
    timer = setInterval(() => {
        totalSeconds--;
        let m = Math.floor(totalSeconds/60), s = totalSeconds%60;
        document.getElementById("timer").textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
        if(totalSeconds <= 0) {
            clearInterval(timer);
            running = false;
            xp += 50; tokens += 5;
            if(battleActive) {
                bossHp--;
                if(bossHp <= 0) { xp += 200; tokens += 20; battleActive = false; document.getElementById("battleStatus").textContent = "BOSS DEFEATED!"; bossHp = 3; }
            }
            if(xp >= xpNeeded) { xp = 0; level++; xpNeeded = Math.floor(xpNeeded * 1.5); }
            totalSeconds = minutes * 60;
            updateUI();
        }
    }, 1000);
};

document.getElementById("upBtn").onclick = () => { minutes++; totalSeconds = minutes * 60; document.getElementById("minutesDisplay").textContent = minutes; document.getElementById("timer").textContent = `${minutes}:00`; };
document.getElementById("downBtn").onclick = () => { if(minutes > 1) minutes--; totalSeconds = minutes * 60; document.getElementById("minutesDisplay").textContent = minutes; document.getElementById("timer").textContent = `${minutes}:00`; };
document.getElementById("battleBtn").onclick = () => { battleActive = true; document.getElementById("battleStatus").textContent = "BATTLE ACTIVE!"; updateUI(); };
document.getElementById("openShopBtn").onclick = () => document.getElementById("shopPage").classList.remove("hidden");
document.getElementById("backBtn").onclick = () => document.getElementById("shopPage").classList.add("hidden");

updateUI();