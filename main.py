
# script.js


let timerDisplay = document.getElementById("timer");
let startBtn = document.getElementById("startBtn");
let pauseBtn = document.getElementById("pauseBtn");
let resetBtn = document.getElementById("resetBtn");

let xpDisplay = document.getElementById("xp");
let streakDisplay = document.getElementById("streak");

let totalSeconds = 25 * 60;
let timer;
let running = false;

let xp = 0;
let streak = 1;

function updateTimer() {
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    timerDisplay.textContent = `${minutes}:${seconds}`;
}

function startTimer() {
    if (running) return;

    running = true;

    timer = setInterval(() => {
        totalSeconds--;

        updateTimer();

        if (totalSeconds <= 0) {
            clearInterval(timer);
            running = false;

            xp += 50;
            xpDisplay.textContent = xp;

            streakDisplay.textContent = streak + " Days";

            alert("Study session complete! +50 XP");

            totalSeconds = 25 * 60;
            updateTimer();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    running = false;
}

function resetTimer() {
    clearInterval(timer);
    running = false;
    totalSeconds = 25 * 60;
    updateTimer();
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

updateTimer();


