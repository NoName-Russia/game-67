const missions = [

    {
        id: "click10",
        title: "Начало пути",
        description: "Сделать 10 кликов",
        reward: 100,

        check() {
            return game.totalClicks >= 10;
        }
    },

    {
        id: "click100",
        title: "Кликер",
        description: "Сделать 100 кликов",
        reward: 1000,

        check() {
            return game.totalClicks >= 100;
        }
    },

    {
        id: "earn10000",
        title: "Богатство",
        description: "Заработать 10 000 67",
        reward: 5000,

        check() {
            return game.totalEarned >= 10000;
        }
    },

    {
        id: "level10",
        title: "Опытный",
        description: "Достичь 10 уровня",
        reward: 10000,

        check() {
            return game.level >= 10;
        }
    }

];


function checkMissions() {

    missions.forEach(mission => {

        if (
            game.completedMissions.includes(
                mission.id
            )
        ) {
            return;
        }


        if (mission.check()) {

            game.completedMissions.push(
                mission.id
            );

            game.coins +=
                mission.reward;

            notify(
                "🎯 Задание выполнено! +" +
                mission.reward +
                " 67"
            );

        }

    });

}


function renderMissions() {

    const container =
        document.getElementById("missions");

    container.innerHTML = "";

    missions.forEach(mission => {

        const completed =
            game.completedMissions.includes(
                mission.id
            );

        const element =
            document.createElement("div");

        element.className =
            completed
                ? "mission completed"
                : "mission";

        element.innerHTML = `

            <strong>
                ${completed ? "✅" : "🎯"}
                ${mission.title}
            </strong>

            <p>
                ${mission.description}
            </p>

            <span>
                Награда: ${mission.reward} 67
            </span>

        `;

        container.appendChild(element);

    });

}