loadGame();


// =========================================
// LEVEL SYSTEM
// =========================================

function calculateLevel() {
    return Math.floor(game.experience / 100) + 1;
}


function addExperience(amount) {
    game.experience += amount;

    const newLevel = calculateLevel();

    if (newLevel > game.level) {
        game.level = newLevel;

        notify(
            "🎉 Новый уровень: " +
            game.level
        );
    }
}


// =========================================
// CHARACTER ANIMATION
// =========================================

function animateCharacter() {
    const character = document.getElementById("character");

    if (!character) {
        return;
    }

    character.classList.remove("clicking");
    void character.offsetWidth;
    character.classList.add("clicking");

    setTimeout(() => {
        character.classList.remove("clicking");
    }, 200);
}


// =========================================
// CHARACTER SKIN
// =========================================

function updateCharacterSkin() {
    const character = document.getElementById("character");

    if (!character) {
        return;
    }

    const skinClasses = [
        "classic",
        "neon",
        "cyber",
        "galaxy",
        "golden"
    ];

    character.classList.remove(...skinClasses);
    character.classList.add(game.selectedSkin || "classic");
}


// =========================================
// MAIN CLICK
// =========================================

function click67() {
    const earned = game.clickPower * game.multiplier;

    game.coins += earned;
    game.totalEarned += earned;
    game.totalClicks++;

    animateCharacter();
    addExperience(1);
    checkMissions();
    checkAchievements();
    updateGame();
}


// =========================================
// AUTO INCOME
// =========================================

function autoIncome() {
    if (game.autoPower <= 0) {
        return;
    }

    const earned = game.autoPower * game.multiplier;

    game.coins += earned;
    game.totalEarned += earned;

    addExperience(game.autoPower);
    checkMissions();
    checkAchievements();
    updateGame();
}


// =========================================
// UPDATE GAME
// =========================================

function updateGame() {
    document.getElementById("coins").textContent = formatNumber(game.coins);
    document.getElementById("level").textContent = game.level;
    document.getElementById("perSecond").textContent = game.autoPower;
    document.getElementById("clickPower").textContent =
        game.clickPower * game.multiplier;

    document.getElementById("clickCost").textContent =
        formatNumber(getClickCost());

    document.getElementById("autoCost").textContent =
        formatNumber(getAutoCost());

    document.getElementById("multiplierCost").textContent =
        formatNumber(getMultiplierCost());

    updateCharacterSkin();
    renderSkins();
    renderMissions();
    renderAchievements();
    saveGame();
}


// =========================================
// NUMBER FORMAT
// =========================================

function formatNumber(number) {
    if (number < 1000) {
        return Math.floor(number);
    }

    if (number < 1000000) {
        return (number / 1000).toFixed(1) + "K";
    }

    if (number < 1000000000) {
        return (number / 1000000).toFixed(1) + "M";
    }

    return (number / 1000000000).toFixed(1) + "B";
}


// =========================================
// NOTIFICATION
// =========================================

function notify(message) {
    const element = document.getElementById("notification");

    if (!element) {
        return;
    }

    element.textContent = message;
    element.classList.add("show");

    clearTimeout(notify.timer);

    notify.timer = setTimeout(() => {
        element.classList.remove("show");
    }, 1800);
}


// =========================================
// DAILY REWARD
// =========================================

function claimDailyReward() {
    const today = new Date().toISOString().slice(0, 10);

    if (game.lastDailyReward === today) {
        notify("🎁 Ты уже получил бонус сегодня!");
        return;
    }

    const reward = 500 + game.level * 100;

    game.coins += reward;
    game.totalEarned += reward;
    game.lastDailyReward = today;

    notify("🎁 Получено +" + reward + " 67!");
    updateGame();
}


// =========================================
// CLICK BUTTON
// =========================================

document.getElementById("clickButton").addEventListener("click", click67);


// =========================================
// SHOP BUTTONS
// =========================================

document.getElementById("buyClick").addEventListener("click", buyClickUpgrade);
document.getElementById("buyAuto").addEventListener("click", buyAutoUpgrade);
document.getElementById("buyMultiplier").addEventListener("click", buyMultiplierUpgrade);


// =========================================
// DAILY REWARD BUTTON
// =========================================

document.getElementById("dailyReward").addEventListener("click", claimDailyReward);


// =========================================
// RESET GAME
// =========================================

document.getElementById("resetGame").addEventListener("click", () => {
    if (!confirm("Удалить весь прогресс?")) {
        return;
    }

    localStorage.removeItem(SAVE_KEY);
    location.reload();
});


// =========================================
// AUTO INCOME TIMER
// =========================================

setInterval(autoIncome, 1000);


// =========================================
// START GAME
// =========================================

updateGame();