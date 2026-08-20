const skins = [

    {
        id: "classic",
        name: "Classic 67",
        rarity: "Обычный",
        price: 0,
        icon: "67"
    },

    {
        id: "neon",
        name: "Neon 67",
        rarity: "Редкий",
        price: 1000,
        icon: "💜"
    },

    {
        id: "cyber",
        name: "Cyber 67",
        rarity: "Эпический",
        price: 10000,
        icon: "🤖"
    },

    {
        id: "galaxy",
        name: "Galaxy 67",
        rarity: "Мифический",
        price: 100000,
        icon: "🌌"
    },

    {
        id: "golden",
        name: "Golden 67",
        rarity: "Легендарный",
        price: 1000000,
        icon: "👑"
    }

];


function renderSkins() {

    const container =
        document.getElementById("skins");

    container.innerHTML = "";

    skins.forEach(skin => {

        const owned =
            game.ownedSkins.includes(skin.id);

        const selected =
            game.selectedSkin === skin.id;

        const element =
            document.createElement("div");

        element.className = "skin";

        element.innerHTML = `

            <div class="skin-icon">
                ${skin.icon}
            </div>

            <div class="skin-info">

                <strong>
                    ${skin.name}
                </strong>

                <span>
                    ${skin.rarity}
                </span>

            </div>

            <button
                onclick="handleSkin('${skin.id}')"
            >

                ${
            selected
                ? "Выбран"
                : owned
                    ? "Выбрать"
                    : skin.price + " 67"
        }

            </button>

        `;

        container.appendChild(element);

    });
}


function handleSkin(id) {

    const skin =
        skins.find(
            skin => skin.id === id
        );

    if (!skin) {
        return;
    }


    if (game.ownedSkins.includes(id)) {

        game.selectedSkin = id;

        notify(
            "🎨 Выбран " +
            skin.name
        );

        updateGame();

        return;
    }


    if (game.coins < skin.price) {

        notify("Не хватает 67!");

        return;
    }


    game.coins -= skin.price;

    game.ownedSkins.push(id);

    game.selectedSkin = id;

    notify(
        "🎉 Получен скин " +
        skin.name
    );

    updateGame();
}