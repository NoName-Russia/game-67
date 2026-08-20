// =========================================
// FLIGHT 67 MINI-GAME
// =========================================

const flight = {
    active: false,
    distance: 0,
    score: 0,
    best: Number(localStorage.getItem("67_flight_best") || 0),
    x: 110,
    y: 180,
    velocity: 0,
    obstacles: [],
    coins: [],
    lastTime: 0,
    spawnTimer: 0,
    coinTimer: 0,
    animationId: null
};

const flightScreen = document.getElementById("flightScreen");
const flightCanvas = document.getElementById("flightCanvas");
const flightCtx = flightCanvas ? flightCanvas.getContext("2d") : null;

function openFlight() {
    if (!flightScreen) return;
    flightScreen.classList.add("open");
    resizeFlightCanvas();
    resetFlight();
}

function closeFlight() {
    if (!flightScreen) return;
    flight.active = false;
    cancelAnimationFrame(flight.animationId);
    flightScreen.classList.remove("open");
}

function resizeFlightCanvas() {
    if (!flightCanvas) return;
    const rect = flightCanvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    flightCanvas.width = Math.floor(rect.width * ratio);
    flightCanvas.height = Math.floor(rect.height * ratio);
    flightCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function resetFlight() {
    flight.active = false;
    flight.distance = 0;
    flight.score = 0;
    flight.x = 110;
    flight.y = Math.max(120, flightCanvas.clientHeight / 2);
    flight.velocity = 0;
    flight.obstacles = [];
    flight.coins = [];
    flight.spawnTimer = 0;
    flight.coinTimer = 0;
    updateFlightHud();
    drawFlight();
}

function startFlight() {
    resetFlight();
    flight.active = true;
    flight.lastTime = performance.now();
    flight.animationId = requestAnimationFrame(flightLoop);
}

function flapFlight() {
    if (!flight.active) {
        startFlight();
        return;
    }
    flight.velocity = -430;
}

function flightLoop(time) {
    if (!flight.active) return;

    const dt = Math.min((time - flight.lastTime) / 1000, 0.035);
    flight.lastTime = time;

    updateFlight(dt);
    drawFlight();
    flight.animationId = requestAnimationFrame(flightLoop);
}

function updateFlight(dt) {
    const speed = 210 + Math.min(flight.distance * 0.8, 230);
    const height = flightCanvas.clientHeight;
    const width = flightCanvas.clientWidth;

    flight.velocity += 1150 * dt;
    flight.y += flight.velocity * dt;
    flight.distance += speed * dt / 10;
    flight.score = Math.floor(flight.distance);

    flight.spawnTimer -= dt;
    flight.coinTimer -= dt;

    if (flight.spawnTimer <= 0) {
        spawnFlightObstacle(width, height);
        flight.spawnTimer = Math.max(0.72, 1.25 - flight.distance / 2500);
    }

    if (flight.coinTimer <= 0) {
        flight.coins.push({
            x: width + 40,
            y: 60 + Math.random() * (height - 120),
            r: 11,
            taken: false
        });
        flight.coinTimer = 0.75;
    }

    flight.obstacles.forEach(o => o.x -= speed * dt);
    flight.coins.forEach(c => c.x -= speed * dt);

    flight.obstacles = flight.obstacles.filter(o => o.x + o.width > -30);
    flight.coins = flight.coins.filter(c => c.x > -30 && !c.taken);

    if (flight.y < 20 || flight.y > height - 20 || hitFlightObstacle()) {
        endFlight();
        return;
    }

    collectFlightCoins();
    updateFlightHud();
}

function spawnFlightObstacle(width, height) {
    const gap = Math.max(125, 185 - flight.distance * 0.035);
    const center = 80 + Math.random() * (height - 160);
    const obstacleWidth = 48;

    flight.obstacles.push({
        x: width + obstacleWidth,
        width: obstacleWidth,
        top: center - gap / 2,
        bottom: center + gap / 2
    });
}

function hitFlightObstacle() {
    const player = { x: flight.x - 18, y: flight.y - 16, width: 36, height: 32 };

    return flight.obstacles.some(o => {
        const hitX = player.x + player.width > o.x && player.x < o.x + o.width;
        const hitTop = player.y < o.top;
        const hitBottom = player.y + player.height > o.bottom;
        return hitX && (hitTop || hitBottom);
    });
}

function collectFlightCoins() {
    flight.coins.forEach(c => {
        const dx = c.x - flight.x;
        const dy = c.y - flight.y;
        if (Math.sqrt(dx * dx + dy * dy) < 28) {
            c.taken = true;
            flight.score += 25;
        }
    });
}

function endFlight() {
    flight.active = false;
    cancelAnimationFrame(flight.animationId);

    if (flight.score > flight.best) {
        flight.best = flight.score;
        localStorage.setItem("67_flight_best", String(flight.best));
    }

    const reward = Math.max(50, Math.floor(flight.score * 2));
    game.coins += reward;
    game.totalEarned += reward;
    saveGame();
    updateGame();
    updateFlightHud();
    drawFlight();

    notify("✈️ Полёт окончен! +" + reward + " 67");
}

function updateFlightHud() {
    const score = document.getElementById("flightScore");
    const best = document.getElementById("flightBest");
    if (score) score.textContent = Math.floor(flight.score) + " м";
    if (best) best.textContent = Math.floor(flight.best) + " м";
}

function getFlightColors() {
    const colors = {
        classic: ["#b49aff", "#7c4dff"],
        neon: ["#ff8bec", "#ff28d7"],
        cyber: ["#8af2ff", "#18d9ff"],
        galaxy: ["#d0b2ff", "#693cff"],
        golden: ["#fff09a", "#ffbf1f"]
    };
    return colors[game.selectedSkin] || colors.classic;
}

function drawFlight() {
    if (!flightCtx || !flightCanvas) return;

    const w = flightCanvas.clientWidth;
    const h = flightCanvas.clientHeight;
    const colors = getFlightColors();

    const gradient = flightCtx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, "#110b2d");
    gradient.addColorStop(1, "#090714");
    flightCtx.fillStyle = gradient;
    flightCtx.fillRect(0, 0, w, h);

    flightCtx.fillStyle = "rgba(255,255,255,.65)";
    for (let i = 0; i < 35; i++) {
        const x = (i * 83 + Math.floor(flight.distance * 3)) % w;
        const y = (i * 47) % h;
        flightCtx.fillRect(x, y, 2, 2);
    }

    flight.obstacles.forEach(o => {
        flightCtx.fillStyle = colors[1];
        flightCtx.shadowColor = colors[1];
        flightCtx.shadowBlur = 14;
        flightCtx.fillRect(o.x, 0, o.width, o.top);
        flightCtx.fillRect(o.x, o.bottom, o.width, h - o.bottom);
        flightCtx.shadowBlur = 0;
    });

    flight.coins.forEach(c => {
        flightCtx.beginPath();
        flightCtx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        flightCtx.fillStyle = "#ffd34d";
        flightCtx.shadowColor = "#ffd34d";
        flightCtx.shadowBlur = 12;
        flightCtx.fill();
        flightCtx.shadowBlur = 0;
        flightCtx.fillStyle = "#5a3700";
        flightCtx.font = "bold 11px Arial";
        flightCtx.textAlign = "center";
        flightCtx.textBaseline = "middle";
        flightCtx.fillText("67", c.x, c.y);
    });

    drawFlightPlayer(colors);
}

function drawFlightPlayer(colors) {
    const ctx = flightCtx;
    ctx.save();
    ctx.translate(flight.x, flight.y);
    ctx.rotate(Math.max(-0.35, Math.min(0.45, flight.velocity / 1000)));
    ctx.shadowColor = colors[1];
    ctx.shadowBlur = 18;

    ctx.fillStyle = colors[1];
    ctx.beginPath();
    ctx.roundRect(-23, -16, 46, 32, 12);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffd7b5";
    ctx.beginPath();
    ctx.arc(8, -2, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("67", -4, 4);

    ctx.fillStyle = colors[0];
    ctx.beginPath();
    ctx.moveTo(-28, 5);
    ctx.lineTo(-46, 15);
    ctx.lineTo(-24, 15);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

window.addEventListener("resize", () => {
    if (flightScreen && flightScreen.classList.contains("open")) {
        resizeFlightCanvas();
        drawFlight();
    }
});

if (flightCanvas) {
    flightCanvas.addEventListener("pointerdown", flapFlight);
}

const flightButton = document.getElementById("openFlight");
if (flightButton) flightButton.addEventListener("click", openFlight);

const closeFlightButton = document.getElementById("closeFlight");
if (closeFlightButton) closeFlightButton.addEventListener("click", closeFlight);

const restartFlightButton = document.getElementById("restartFlight");
if (restartFlightButton) restartFlightButton.addEventListener("click", startFlight);
