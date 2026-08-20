// =========================================
// 67 WORLD FEATURES
// Achievements, daily quests, boosters, map,
// collection, local records and audio settings.
// =========================================

(function () {
    const FEATURE_SAVE = "67_features_v1";
    const saved = JSON.parse(localStorage.getItem(FEATURE_SAVE) || "{}");

    const feature = {
        daily: saved.daily || { date: "", claimed: [] },
        boosters: saved.boosters || { double: 0, turbo: 0, magnet: 0 },
        records: saved.records || { run: 0, shooter: 0, match: 0 },
        zone: saved.zone || "base",
        sound: saved.sound !== false
    };

    function saveFeatures() {
        localStorage.setItem(FEATURE_SAVE, JSON.stringify(feature));
    }

    function today() {
        return new Date().toISOString().slice(0, 10);
    }

    function ensureDaily() {
        if (feature.daily.date !== today()) {
            feature.daily = { date: today(), claimed: [] };
            saveFeatures();
        }
    }

    const quests = [
        { id: "click100", title: "👆 Мастер кликов", text: "Сделать 100 кликов", goal: 100, reward: 500, get: () => game.totalClicks },
        { id: "earn5000", title: "💰 Копилка", text: "Заработать 5 000 67", goal: 5000, reward: 1000, get: () => game.totalEarned },
        { id: "flight500", title: "✈️ Пилот", text: "Пролететь 500 м за одну игру", goal: 500, reward: 1500, get: () => Math.floor(window.flight?.score || 0) }
    ];

    function renderDaily() {
        const box = document.getElementById("dailyQuests");
        if (!box) return;
        ensureDaily();
        box.innerHTML = quests.map(q => {
            const value = Math.min(q.goal, q.get());
            const done = value >= q.goal;
            const claimed = feature.daily.claimed.includes(q.id);
            return `<div class="quest-card ${done ? "done" : ""}">
                <div><b>${q.title}</b><span>${q.text}</span></div>
                <div class="quest-progress"><i style="width:${Math.min(100, value / q.goal * 100)}%"></i></div>
                <button ${!done || claimed ? "disabled" : ""} onclick="claimQuest('${q.id}')">
                    ${claimed ? "✓ Получено" : done ? "+" + q.reward + " 67" : value + "/" + q.goal}
                </button>
            </div>`;
        }).join("");
    }

    window.claimQuest = function (id) {
        ensureDaily();
        const q = quests.find(x => x.id === id);
        if (!q || feature.daily.claimed.includes(id) || q.get() < q.goal) return;
        feature.daily.claimed.push(id);
        game.coins += q.reward;
        game.totalEarned += q.reward;
        saveFeatures();
        saveGame();
        notify("🎁 Задание выполнено! +" + q.reward + " 67");
        updateGame();
    };

    const boosters = [
        { id: "double", name: "⚡ ×2 доход", desc: "Удваивает доход на 30 секунд", cost: 2500, seconds: 30 },
        { id: "turbo", name: "🚀 Турбо", desc: "Усиливает автоматический доход на 30 секунд", cost: 3500, seconds: 30 },
        { id: "magnet", name: "🧲 Магнит", desc: "Увеличивает награды мини-игр на 50%", cost: 5000, seconds: 30 }
    ];

    function buyBooster(id) {
        const b = boosters.find(x => x.id === id);
        if (!b || game.coins < b.cost) return notify("Не хватает 67!");
        game.coins -= b.cost;
        feature.boosters[id] = Math.max(feature.boosters[id], b.seconds);
        saveFeatures();
        updateGame();
        notify(b.name + " активирован!");
    }

    window.buyBooster = buyBooster;

    function tickBoosters() {
        Object.keys(feature.boosters).forEach(k => {
            if (feature.boosters[k] > 0) feature.boosters[k]--;
        });
        saveFeatures();
        renderBoosters();
    }

    function renderBoosters() {
        const box = document.getElementById("boosters");
        if (!box) return;
        box.innerHTML = boosters.map(b => `<div class="booster-card">
            <div><b>${b.name}</b><span>${b.desc}</span></div>
            <strong>${feature.boosters[b.id] > 0 ? feature.boosters[b.id] + "с" : b.cost + " 67"}</strong>
            <button onclick="buyBooster('${b.id}')" ${feature.boosters[b.id] > 0 ? "disabled" : ""}>${feature.boosters[b.id] > 0 ? "Активен" : "Купить"}</button>
        </div>`).join("");
    }

    function renderMap() {
        const box = document.getElementById("worldMap");
        if (!box) return;
        const zones = [
            ["base", "🏠", "База 67", true],
            ["airport", "✈️", "Аэропорт", true],
            ["forest", "🌲", "Лес 67", game.totalClicks >= 100],
            ["city", "🏙️", "Неон-сити", game.coins >= 5000],
            ["space", "🌌", "Космос", (localStorage.getItem("67_flight_best") || 0) >= 1000]
        ];
        box.innerHTML = zones.map(z => `<button class="zone ${feature.zone === z[0] ? "active" : ""} ${z[3] ? "" : "locked"}" onclick="selectZone('${z[0]}',${z[3]})">
            <span>${z[1]}</span><b>${z[2]}</b><small>${z[3] ? "Открыто" : "🔒 Заблокировано"}</small>
        </button>`).join("");
    }

    window.selectZone = function (id, unlocked) {
        if (!unlocked) return notify("🔒 Зона ещё не открыта!");
        feature.zone = id;
        saveFeatures();
        renderMap();
        notify("🗺️ Открыта зона: " + id);
    };

    function renderRecords() {
        const box = document.getElementById("records");
        if (!box) return;
        feature.records.run = Math.max(feature.records.run, Number(localStorage.getItem("67_flight_best") || 0));
        box.innerHTML = `<div>✈️ Полёт 67 <b>${feature.records.run} м</b></div><div>🏃 Забег 67 <b>${feature.records.run > 0 ? feature.records.run : 0} м</b></div><div>🎯 Shooter 67 <b>${feature.records.shooter}</b></div><div>🧩 Match 67 <b>${feature.records.match}</b></div>`;
    }

    function renderCollection() {
        const box = document.getElementById("collection");
        if (!box) return;
        const ids = ["classic", "neon", "cyber", "galaxy", "golden", "inferno", "ice", "ghost", "rainbow", "mecha"];
        box.innerHTML = ids.map((id, i) => {
            const owned = game.ownedSkins.includes(id);
            return `<div class="collection-item ${owned ? "owned" : ""}"><span>${owned ? "✓" : "?"}</span><b>${id.toUpperCase()}</b><small>${owned ? "Получен" : "Секрет"}</small></div>`;
        }).join("");
    }

    function initSettings() {
        const sound = document.getElementById("soundToggle");
        if (sound) {
            sound.checked = feature.sound;
            sound.onchange = () => { feature.sound = sound.checked; saveFeatures(); };
        }
    }

    window.addEventListener("67:render", () => {
        renderDaily(); renderBoosters(); renderMap(); renderRecords(); renderCollection();
    });

    setInterval(() => {
        tickBoosters();
        renderDaily();
        renderMap();
    }, 1000);

    setTimeout(() => {
        renderDaily(); renderBoosters(); renderMap(); renderRecords(); renderCollection(); initSettings();
    }, 0);

    window.get67Multiplier = function () {
        let m = 1;
        if (feature.boosters.double > 0) m *= 2;
        if (feature.boosters.turbo > 0) m *= 1.5;
        return m;
    };

    window.get67RewardMultiplier = function () {
        return feature.boosters.magnet > 0 ? 1.5 : 1;
    };
})();
