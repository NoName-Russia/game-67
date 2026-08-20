const SAVE_KEY = "67_clicker_save_v2";

function saveGame() {
    localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(game)
    );
}

function loadGame() {

    const saved = localStorage.getItem(SAVE_KEY);

    if (!saved) {
        return;
    }

    try {

        const data = JSON.parse(saved);

        Object.assign(game, data);

    } catch (error) {

        console.error(
            "Ошибка загрузки сохранения:",
            error
        );

    }
}