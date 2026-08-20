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
        flight.coins.push({ x: width + 40, y: 60 + Math.random() * (height - 120), r: 11, taken: false });
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
    flight.obstacles.push({ x: width + obstacleWidth, width: obstacleWidth, top: center - gap / 2, bottom: center + gap / 2 });
}

function hitFlightObstacle() {
    const player = { x: flight.x - 20, y: flight.y - 13, width: 42, height: 26 };
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
        if (Math.sqrt(dx * dx + dy * dy) < 30) {
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
    drawFlightStars(w, h);
    drawFlightAtmosphere(w, h, colors);
    flight.obstacles.forEach(o => drawFlightGate(o, h, colors));
    flight.coins.forEach(c => drawFlightCoin(c));
    drawFlightPlayer(colors);
}

function drawFlightStars(w, h) {
    const ctx = flightCtx;
    for (let i = 0; i < 55; i++) {
        const x = (i * 83 + Math.floor(flight.distance * (2 + i % 3))) % w;
        const y = (i * 47 + i * i) % h;
        const size = i % 7 === 0 ? 2 : 1;
        ctx.fillStyle = i % 9 === 0 ? "rgba(150,210,255,.8)" : "rgba(255,255,255,.5)";
        ctx.fillRect(x, y, size, size);
    }
}

function drawFlightAtmosphere(w, h, colors) {
    const ctx = flightCtx;
    const glow = ctx.createRadialGradient(w * .55, h * .45, 10, w * .55, h * .45, Math.max(w, h) * .65);
    glow.addColorStop(0, colors[1] + "22");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = colors[0] + "18";
    ctx.lineWidth = 1;
    for (let y = 30; y < h; y += 48) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
}

function drawFlightGate(o, h, colors) {
    const ctx = flightCtx;
    const cap = 10;
    ctx.save();
    ctx.shadowColor = colors[1];
    ctx.shadowBlur = 20;
    const gate = ctx.createLinearGradient(o.x, 0, o.x + o.width, 0);
    gate.addColorStop(0, colors[1]);
    gate.addColorStop(.5, colors[0]);
    gate.addColorStop(1, colors[1]);
    ctx.fillStyle = gate;
    ctx.fillRect(o.x, 0, o.width, o.top);
    ctx.fillRect(o.x, o.bottom, o.width, h - o.bottom);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.fillRect(o.x + 5, 0, 3, Math.max(0, o.top - cap));
    ctx.fillRect(o.x + 5, o.bottom + cap, 3, Math.max(0, h - o.bottom - cap));
    ctx.fillStyle = colors[0];
    ctx.fillRect(o.x - 4, o.top - cap, o.width + 8, cap);
    ctx.fillRect(o.x - 4, o.bottom, o.width + 8, cap);
    ctx.restore();
}

function drawFlightCoin(c) {
    const ctx = flightCtx;
    const pulse = 1 + Math.sin(performance.now() / 180) * .08;
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(pulse, pulse);
    ctx.shadowColor = "#ffd34d";
    ctx.shadowBlur = 18;
    const g = ctx.createRadialGradient(-3, -4, 2, 0, 0, c.r + 3);
    g.addColorStop(0, "#fff6ad");
    g.addColorStop(.45, "#ffd34d");
    g.addColorStop(1, "#d88b00");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, c.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#fff0a0";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#6b4300";
    ctx.font = "900 10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("67", 0, 0);
    ctx.restore();
}

function drawFlightPlayer(colors) {
    const ctx = flightCtx;
    const tilt = Math.max(-0.42, Math.min(0.52, flight.velocity / 900));
    const bob = Math.sin(performance.now() / 110) * 1.5;
    ctx.save();
    ctx.translate(flight.x, flight.y + bob);
    ctx.rotate(tilt);
    ctx.imageSmoothingEnabled = true;

    // Engine glow + exhaust
    const exhaust = ctx.createLinearGradient(-62, 0, -20, 0);
    exhaust.addColorStop(0, "transparent");
    exhaust.addColorStop(.45, colors[0] + "88");
    exhaust.addColorStop(1, colors[0]);
    ctx.fillStyle = exhaust;
    ctx.shadowColor = colors[0];
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(-20, -5);
    ctx.lineTo(-68, 0);
    ctx.lineTo(-20, 5);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Rear fuselage
    const body = ctx.createLinearGradient(-28, -15, 30, 16);
    body.addColorStop(0, colors[0]);
    body.addColorStop(.45, colors[1]);
    body.addColorStop(1, colors[1] + "cc");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(-27, -12);
    ctx.quadraticCurveTo(-8, -20, 18, -13);
    ctx.quadraticCurveTo(34, -7, 36, 0);
    ctx.quadraticCurveTo(34, 7, 18, 13);
    ctx.quadraticCurveTo(-8, 20, -27, 12);
    ctx.closePath();
    ctx.fill();

    // Main wing
    ctx.fillStyle = colors[0];
    ctx.beginPath();
    ctx.moveTo(-5, -5);
    ctx.lineTo(-28, -31);
    ctx.lineTo(8, -18);
    ctx.lineTo(18, -5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-5, 5);
    ctx.lineTo(-28, 31);
    ctx.lineTo(8, 18);
    ctx.lineTo(18, 5);
    ctx.closePath();
    ctx.fill();

    // Nose
    ctx.fillStyle = "#f8fbff";
    ctx.beginPath();
    ctx.moveTo(15, -11);
    ctx.quadraticCurveTo(43, 0, 15, 11);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    const glass = ctx.createLinearGradient(5, -10, 20, 4);
    glass.addColorStop(0, "#e9fcff");
    glass.addColorStop(.45, colors[0]);
    glass.addColorStop(1, "#17244e");
    ctx.fillStyle = glass;
    ctx.beginPath();
    ctx.ellipse(7, -5, 12, 7, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.7)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Tail fin
    ctx.fillStyle = colors[1];
    ctx.beginPath();
    ctx.moveTo(-22, -7);
    ctx.lineTo(-35, -23);
    ctx.lineTo(-14, -14);
    ctx.closePath();
    ctx.fill();

    // 67 emblem
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("67", -5, 2);

    // Highlight
    ctx.strokeStyle = "rgba(255,255,255,.65)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -11);
    ctx.quadraticCurveTo(4, -16, 17, -9);
    ctx.stroke();
    ctx.restore();
}

window.addEventListener("resize", () => {
    if (flightScreen && flightScreen.classList.contains("open")) {
        resizeFlightCanvas();
        drawFlight();
    }
});

if (flightCanvas) flightCanvas.addEventListener("pointerdown", flapFlight);
const flightButton = document.getElementById("openFlight");
if (flightButton) flightButton.addEventListener("click", openFlight);
const closeFlightButton = document.getElementById("closeFlight");
if (closeFlightButton) closeFlightButton.addEventListener("click", closeFlight);
const restartFlightButton = document.getElementById("restartFlight");
if (restartFlightButton) restartFlightButton.addEventListener("click", startFlight);