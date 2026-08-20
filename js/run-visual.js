/* RUN 67 visual renderer — intentionally uses the global miniState binding via a getter installed by minigames.js */
(function () {
    const overlay = document.getElementById('miniOverlay');
    const title = document.getElementById('miniTitle');
    if (!overlay || !title) return;

    function syncMode() {
        overlay.classList.toggle('run-mode', title.textContent.includes('Забег'));
    }

    new MutationObserver(syncMode).observe(title, {
        childList: true,
        characterData: true,
        subtree: true
    });
    syncMode();

    function state() {
        return typeof miniState !== 'undefined' ? miniState : null;
    }

    window.drawRun = function (ctx) {
        const s = state();
        if (!s || s.type !== 'run') return;

        const w = s.w;
        const h = s.h;
        const time = performance.now() / 1000;

        ctx.clearRect(0, 0, w, h);

        // SKY
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#080622');
        sky.addColorStop(0.38, '#24104b');
        sky.addColorStop(0.70, '#6b245e');
        sky.addColorStop(1, '#120a1b');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);

        // SUNSET GLOW
        const glow = ctx.createRadialGradient(w * .48, h * .48, 5, w * .48, h * .48, w * .65);
        glow.addColorStop(0, 'rgba(255,91,160,.24)');
        glow.addColorStop(.45, 'rgba(123,71,255,.10)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);

        // STARS
        for (let i = 0; i < 65; i++) {
            const x = (i * 97 + 31) % w;
            const y = (i * 43 + 19) % (h * .53);
            const r = i % 9 === 0 ? 1.7 : .8;
            ctx.fillStyle = i % 7 === 0 ? 'rgba(255,190,240,.9)' : 'rgba(255,255,255,.55)';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // MOON
        ctx.save();
        ctx.shadowColor = '#d6b8ff';
        ctx.shadowBlur = 28;
        ctx.fillStyle = '#f4eaff';
        ctx.beginPath();
        ctx.arc(w * .82, h * .17, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // DISTANT CITY
        const skylineY = h * .69;
        for (let i = 0; i < 28; i++) {
            const bw = 25 + (i * 19) % 48;
            const bh = 35 + (i * 31) % Math.max(40, Math.floor(h * .28));
            const x = ((i * 74 - s.distance * .20) % (w + 120)) - 60;
            ctx.fillStyle = i % 4 === 0 ? '#160d2d' : '#0b0a1c';
            ctx.fillRect(x, skylineY - bh, bw, bh);

            for (let yy = skylineY - bh + 12; yy < skylineY - 8; yy += 16) {
                if ((i + Math.floor(yy)) % 3 !== 0) {
                    ctx.fillStyle = 'rgba(255,202,89,.65)';
                    ctx.fillRect(x + 7, yy, 5, 3);
                    if (bw > 42) ctx.fillRect(x + bw - 14, yy, 5, 3);
                }
            }
        }

        // CITY LIGHTS
        for (let i = 0; i < 14; i++) {
            const x = ((i * 91 - s.distance * .55) % (w + 100)) - 50;
            ctx.fillStyle = i % 2 ? '#ff4fb8' : '#9d75ff';
            ctx.globalAlpha = .55;
            ctx.beginPath();
            ctx.arc(x, skylineY - 10 - (i % 3) * 9, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // ROAD
        const roadTop = h * .70;
        const road = ctx.createLinearGradient(0, roadTop, 0, h);
        road.addColorStop(0, '#30283a');
        road.addColorStop(.35, '#181521');
        road.addColorStop(1, '#07070c');
        ctx.fillStyle = road;
        ctx.fillRect(0, roadTop, w, h - roadTop);

        ctx.strokeStyle = 'rgba(255,120,211,.28)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, roadTop);
        ctx.lineTo(w, roadTop);
        ctx.stroke();

        // ROAD MARKINGS
        const dashOffset = (s.distance * 2.8) % 75;
        for (let x = -75 + dashOffset; x < w + 75; x += 75) {
            ctx.fillStyle = 'rgba(255,255,255,.42)';
            ctx.fillRect(x, h - 39, 34, 4);
        }

        // SIDE LIGHTS
        for (let i = 0; i < 9; i++) {
            const x = ((i * 155 - s.distance * .9) % (w + 180)) - 50;
            ctx.shadowColor = '#a56bff';
            ctx.shadowBlur = 16;
            ctx.fillStyle = '#b994ff';
            ctx.fillRect(x, roadTop - 43, 3, 43);
            ctx.fillStyle = '#ffe4fb';
            ctx.fillRect(x - 4, roadTop - 44, 11, 5);
            ctx.shadowBlur = 0;
        }

        // OBJECTS
        s.items.forEach(item => drawObject(ctx, item, time));

        // PARTICLES
        (s.particles || []).forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life / 18);
            ctx.fillStyle = '#ffd84d';
            ctx.shadowColor = '#ffd84d';
            ctx.shadowBlur = 8;
            ctx.fillRect(p.x - 2, p.y - 2, 5, 5);
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        drawRunner(ctx, s.player, time);
    };

    function drawObject(ctx, o, time) {
        ctx.save();
        ctx.translate(o.x, o.y);

        if (o.kind === 'coin') {
            const pulse = 1 + Math.sin(time * 8 + o.x * .03) * .08;
            ctx.translate(o.w / 2, o.h / 2);
            ctx.scale(pulse, 1);
            ctx.shadowColor = '#ffd34d';
            ctx.shadowBlur = 22;
            const g = ctx.createRadialGradient(-4, -5, 2, 0, 0, 15);
            g.addColorStop(0, '#fffbd0');
            g.addColorStop(.45, '#ffd34d');
            g.addColorStop(1, '#c87500');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(0, 0, 13, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#fff1a0';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#6b4300';
            ctx.font = '900 9px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('67', 0, 1);
            ctx.restore();
            return;
        }

        if (o.kind === 'spike') {
            ctx.shadowColor = '#ff3e91';
            ctx.shadowBlur = 18;
            const g = ctx.createLinearGradient(0, 0, 0, o.h);
            g.addColorStop(0, '#ffb0dc');
            g.addColorStop(.35, '#ff4f9d');
            g.addColorStop(1, '#a51662');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(0, o.h);
            ctx.lineTo(o.w * .18, o.h * .28);
            ctx.lineTo(o.w * .36, o.h);
            ctx.lineTo(o.w * .52, 0);
            ctx.lineTo(o.w * .70, o.h);
            ctx.lineTo(o.w, o.h);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(255,255,255,.65)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        } else if (o.kind === 'wall') {
            ctx.shadowColor = '#7f54ff';
            ctx.shadowBlur = 20;
            const g = ctx.createLinearGradient(0, 0, o.w, o.h);
            g.addColorStop(0, '#b694ff');
            g.addColorStop(.5, '#6540d2');
            g.addColorStop(1, '#26135d');
            ctx.fillStyle = g;
            roundRect(ctx, 0, 0, o.w, o.h, 9);
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255,255,255,.18)';
            ctx.fillRect(5, 5, 3, o.h - 10);
            ctx.strokeStyle = 'rgba(255,255,255,.30)';
            ctx.strokeRect(6, 6, o.w - 12, o.h - 12);
            ctx.fillStyle = '#e8dfff';
            ctx.font = '900 9px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('67', o.w / 2, o.h / 2 + 3);
        } else {
            ctx.shadowColor = '#ff684e';
            ctx.shadowBlur = 16;
            const g = ctx.createLinearGradient(0, 0, 0, o.h);
            g.addColorStop(0, '#ff9561');
            g.addColorStop(.5, '#d74b45');
            g.addColorStop(1, '#72243c');
            ctx.fillStyle = g;
            roundRect(ctx, 0, 0, o.w, o.h, 8);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(255,235,190,.7)';
            ctx.strokeRect(5, 5, o.w - 10, o.h - 10);
            ctx.fillStyle = 'rgba(255,255,255,.22)';
            ctx.fillRect(6, 6, o.w - 12, 3);
            ctx.fillStyle = '#ffd76d';
            ctx.font = '900 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('67', o.w / 2, o.h / 2 + 4);
        }
        ctx.restore();
    }

    function drawRunner(ctx, p, time) {
        if (!p) return;
        const phase = time * 12;
        const swing = Math.sin(phase);
        const bob = Math.abs(Math.sin(phase)) * 2;

        ctx.save();
        ctx.translate(p.x, p.y + bob);
        ctx.scale(1.18, 1.18);

        // SHADOW
        ctx.fillStyle = 'rgba(0,0,0,.50)';
        ctx.beginPath();
        ctx.ellipse(0, 31, 31, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // BACK LEG
        drawLimb(ctx, '#43209d', -6, 13, -17 + swing * 11, 28, -30 + swing * 11, 28, 8);
        // FRONT LEG
        drawLimb(ctx, '#7344e8', 6, 13, 17 - swing * 11, 28, 30 - swing * 11, 28, 8);

        drawShoe(ctx, -36 + swing * 11, 26);
        drawShoe(ctx, 22 - swing * 11, 25);

        // ARMS
        drawLimb(ctx, '#5d31c5', -14, -4, -28 - swing * 7, 4, -34 - swing * 7, 14, 7);
        drawLimb(ctx, '#9667ff', 14, -4, 28 + swing * 7, 4, 34 + swing * 7, 14, 7);

        // BODY
        const body = ctx.createLinearGradient(-19, -15, 19, 20);
        body.addColorStop(0, '#d2bdff');
        body.addColorStop(.38, '#8755ed');
        body.addColorStop(1, '#3d1d91');
        ctx.fillStyle = body;
        roundRect(ctx, -19, -15, 38, 34, 10);

        // JACKET DETAILS
        ctx.strokeStyle = 'rgba(255,255,255,.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(0, 14);
        ctx.moveTo(-13, -5);
        ctx.lineTo(-5, -1);
        ctx.moveTo(13, -5);
        ctx.lineTo(5, -1);
        ctx.stroke();

        // CHEST BADGE
        ctx.fillStyle = 'rgba(255,255,255,.18)';
        roundRect(ctx, -9, -2, 18, 12, 4);
        ctx.fillStyle = '#fff';
        ctx.font = '900 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('67', 0, 4);

        // NECK
        ctx.fillStyle = '#efb28f';
        ctx.fillRect(-5, -20, 10, 8);

        // HEAD
        ctx.fillStyle = '#f4c29f';
        ctx.beginPath();
        ctx.arc(0, -30, 16, 0, Math.PI * 2);
        ctx.fill();

        // EARS
        ctx.beginPath();
        ctx.arc(-15, -30, 4, 0, Math.PI * 2);
        ctx.arc(15, -30, 4, 0, Math.PI * 2);
        ctx.fill();

        // HAIR
        ctx.fillStyle = '#21182d';
        ctx.beginPath();
        ctx.moveTo(-15, -31);
        ctx.quadraticCurveTo(-16, -46, 0, -47);
        ctx.quadraticCurveTo(17, -46, 15, -29);
        ctx.lineTo(9, -34);
        ctx.lineTo(5, -40);
        ctx.lineTo(0, -34);
        ctx.lineTo(-5, -41);
        ctx.lineTo(-10, -33);
        ctx.closePath();
        ctx.fill();

        // FACE
        ctx.fillStyle = '#2a1b2b';
        ctx.beginPath();
        ctx.arc(-5, -29, 2.2, 0, Math.PI * 2);
        ctx.arc(5, -29, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#a55f55';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, -25, 4, 0, Math.PI);
        ctx.stroke();

        // HAIR HIGHLIGHT
        ctx.fillStyle = 'rgba(255,255,255,.20)';
        ctx.beginPath();
        ctx.arc(-6, -38, 4, 0, Math.PI * 2);
        ctx.fill();

        // BACKPACK
        ctx.fillStyle = '#39206e';
        roundRect(ctx, -24, -9, 8, 21, 3);
        ctx.fillStyle = '#b18cff';
        ctx.fillRect(-21, -5, 3, 11);

        ctx.restore();
    }

    function drawLimb(ctx, color, x1, y1, x2, y2, x3, y3, width) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.stroke();
    }

    function drawShoe(ctx, x, y) {
        const g = ctx.createLinearGradient(x, y, x + 17, y + 8);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(1, '#aaa4c2');
        ctx.fillStyle = g;
        roundRect(ctx, x, y, 17, 8, 3);
        ctx.fillStyle = '#6741d4';
        ctx.fillRect(x + 3, y + 5, 11, 2);
    }

    function roundRect(ctx, x, y, w, h, r) {
        const q = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + q, y);
        ctx.arcTo(x + w, y, x + w, y + h, q);
        ctx.arcTo(x + w, y + h, x, y + h, q);
        ctx.arcTo(x, y + h, x, y, q);
        ctx.arcTo(x, y, x + w, y, q);
        ctx.closePath();
        ctx.fill();
    }
})();