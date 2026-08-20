function getClickCost() {

    return Math.floor(
        25 *
        Math.pow(1.7, game.clickUpgradeLevel)
    );
}


function getAutoCost() {

    return Math.floor(
        100 *
        Math.pow(1.8, game.autoUpgradeLevel)
    );
}


function getMultiplierCost() {

    return Math.floor(
        500 *
        Math.pow(2.2, game.multiplierUpgradeLevel)
    );
}


function buyClickUpgrade() {

    const cost = getClickCost();

    if (game.coins < cost) {
        notify("Не хватает 67!");
        return;
    }

    game.coins -= cost;

    game.clickUpgradeLevel++;

    game.clickPower++;

    notify("⚡ Сила клика увеличена!");

    updateGame();
}


function buyAutoUpgrade() {

    const cost = getAutoCost();

    if (game.coins < cost) {
        notify("Не хватает 67!");
        return;
    }

    game.coins -= cost;

    game.autoUpgradeLevel++;

    game.autoPower++;

    notify("🤖 Автокликер улучшен!");

    updateGame();
}


function buyMultiplierUpgrade() {

    const cost = getMultiplierCost();

    if (game.coins < cost) {
        notify("Не хватает 67!");
        return;
    }

    game.coins -= cost;

    game.multiplierUpgradeLevel++;

    game.multiplier++;

    notify("🔥 Множитель увеличен!");

    updateGame();
}