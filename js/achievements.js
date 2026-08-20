const achievements = [

    {
        id: "first_click",
        title: "Первый клик",
        description: "Нажать на 67 один раз",
        icon: "👆",

        check() {
            return game.totalClicks >= 1;
        }
    },

    {
        id: "click100",
        title: "100 кликов",
        description: "Сделать 100 кликов",
        icon: "🔥",

        check() {
            return game.totalClicks >= 100;
        }
    },

    {
        id: "rich",
        title: "Богач",
        description: "Заработать 100 000 67",
        icon: "💰",

        check() {
            return game.totalEarned >= 100000;
        }
    },

    {
        id: "level10",
        title: "Уровень 10",
        description: "Достичь 10 уровня",
        icon: "⭐",

        check() {
            return game.level >= 10;
        }
    }

];


function checkAchievements() {

    achievements.forEach(achievement => {

        if (
            game.unlockedAchievements
                .includes(achievement.id)
        ) {
            return;
        }


        if (achievement.check()) {

            game.unlockedAchievements.push(
                achievement.id
            );

            notify(
                "🏆 " +
                achievement.title
            );

        }

    });

}


function renderAchievements() {

    const container =
        document.getElementById(
            "achievements"
        );

    container.innerHTML = "";

    achievements.forEach(achievement => {

        const unlocked =
            game.unlockedAchievements
                .includes(achievement.id);

        const element =
            document.createElement("div");

        element.className =
            unlocked
                ? "achievement unlocked"
                : "achievement";

        element.innerHTML = `

            <span class="achievement-icon">
                ${achievement.icon}
            </span>

            <div>
                <strong>
                    ${achievement.title}
                </strong>

                <p>
                    ${achievement.description}
                </p>
            </div>

            <span>
                ${unlocked ? "✅" : "🔒"}
            </span>

        `;

        container.appendChild(element);

    });

}