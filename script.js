// --- PARTICLE SYSTEM ---
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let particles = [];
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }
    draw() {
        ctx.fillStyle = 'rgba(0, 242, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < 60; i++) {
    particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
}
animate();

// --- CORE APP LOGIC ---
let xp = 0, tokens = 0, level = 1, xpNeeded = 100;
let minutes = 25, totalSeconds = 1500, timer = null, running = false;
let battleActive = false, bossHp = 3;

function updateUI() {
    // Safety checks to prevent crashes if elements are missing
    if(document.getElementById("xp")) document.getElementById("xp").textContent = xp;
    if(document.getElementById("xpNeeded")) document.getElementById("xpNeeded").textContent = xpNeeded;
    if(document.getElementById("level")) document.getElementById("level").textContent = level;
    if(document.getElementById("tokens")) document.getElementById("tokens").textContent = tokens;
    if(document.getElementById("xpFill")) document.getElementById("xpFill").style.width = `${(xp/xpNeeded)*100}%`;
    if(document.getElementById("bossHp")) document.getElementById("bossHp").style.width = `${(bossHp/3)*100}%`;
}

// Login Setup
const loginBtn = document.getElementById("loginBtn");
const loginScreen = document.getElementById("loginScreen");

if(loginBtn) {
    loginBtn.onclick = () => {
        const userInput = document.getElementById("usernameInput").value;
        if(userInput) {
            document.getElementById("profileName").textContent = userInput;
            loginScreen.style.display = "none";
            updateUI();
        } else {
            alert("Enter a Hero Name to begin!");
        }
    };
}

// Timer Logic
const startBtn = document.getElementById("startBtn");
const timerDisplay = document.getElementById("timer");

if(startBtn) {
    startBtn.onclick = () => {
        if (running) return;
        running = true;
        timer = setInterval(() => {
            totalSeconds--;
            let m = Math.floor(totalSeconds/60);
            let s = totalSeconds%60;
            timerDisplay.textContent = `${m}:${s<10?'0':''}${s}`;

            if(totalSeconds <= 0) {
                clearInterval(timer);
                handleFinish();
            }
        }, 1000);
    };
}

function handleFinish() {
    xp += 50; tokens += 5;
    if(battleActive) bossHp--;
    // Level up logic
    if(xp >= xpNeeded) { xp = 0; level++; xpNeeded *= 1.5; }
    running = false;
    totalSeconds = minutes * 60;
    updateUI();
}

// Basic Button Hooks
document.getElementById("upBtn").onclick = () => { minutes++; totalSeconds = minutes*60; document.getElementById("minutesDisplay").textContent = minutes; timerDisplay.textContent = `${minutes}:00`; };
document.getElementById("downBtn").onclick = () => { if(minutes > 1) minutes--; totalSeconds = minutes*60; document.getElementById("minutesDisplay").textContent = minutes; timerDisplay.textContent = `${minutes}:00`; };
document.getElementById("openShopBtn").onclick = () => document.getElementById("shopPage").classList.remove("hidden");
document.getElementById("backBtn").onclick = () => document.getElementById("shopPage").classList.add("hidden");
document.getElementById("battleBtn").onclick = () => { battleActive = true; document.getElementById("battleStatus").textContent = "BATTLE ACTIVE!"; };

updateUI();