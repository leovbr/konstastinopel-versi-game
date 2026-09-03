(function () {
    "use strict";

    // =====================================================
    // WAVE SYSTEM
    // =====================================================

    let currentWave = 0;
    let waveActive = false;

    let normalSpawned = 0;
    let totalNormalEnemies = 0;

    let spawnTimer = null;
    let commanderSpawned = false;

    let waveGeneration = 0;


    // =====================================================
    // WAVE CONFIG
    // =====================================================

    function getWaveConfig(wave) {

        const total =
            5 +
            Math.floor(wave * 1.8);

        const spawnDelay =
            Math.max(
                300,
                1100 -
                wave * 35
            );

        const hasCommander =
            wave % 5 === 0;

        return {

            totalEnemies:
                total,

            spawnDelay,

            hasCommander,

            commanderDelay:
                1800
        };
    }


    // =====================================================
    // ENEMY TYPE
    // =====================================================

    function getEnemyType(
        wave
    ) {

        const roll =
            Math.random();

        // ---------------------------------------------
        // EARLY GAME
        // ---------------------------------------------

        if (wave <= 2) {
            return "soldier";
        }


        // ---------------------------------------------
        // WAVE 3+
        // ---------------------------------------------

        if (wave === 3) {

            if (roll < 0.15) {
                return "archer";
            }

            return "soldier";
        }


        // ---------------------------------------------
        // WAVE 4+
        // ---------------------------------------------

        if (wave === 4) {

            if (roll < 0.10) {
                return "janissary";
            }

            if (roll < 0.25) {
                return "archer";
            }

            return "soldier";
        }


        // ---------------------------------------------
        // WAVE 5+
        // ---------------------------------------------

        if (roll < 0.12) {
            return "janissary";
        }

        if (roll < 0.30) {
            return "archer";
        }

        return "soldier";
    }


    // =====================================================
    // START WAVE
    // =====================================================

    function startWave() {

        if (waveActive) {
            return false;
        }

        if (
            window.Game &&
            window.Game.gameOver
        ) {
            return false;
        }

        if (
            window.Game &&
            window.Game.victory
        ) {
            return false;
        }


        // ---------------------------------------------
        // MAX WAVE
        // ---------------------------------------------

        const maxWaves =
            window.Game
                ? window.Game.maxWaves
                : 20;

        if (
            currentWave >=
            maxWaves
        ) {

            if (
                window.Game &&
                typeof window.Game.win === "function"
            ) {

                window.Game.win();
            }

            return false;
        }


        // ---------------------------------------------
        // NEW WAVE
        // ---------------------------------------------

        currentWave++;

        waveGeneration++;

        const generation =
            waveGeneration;

        const config =
            getWaveConfig(
                currentWave
            );

        waveActive = true;

        normalSpawned = 0;

        totalNormalEnemies =
            config.totalEnemies;

        commanderSpawned = false;


        // ---------------------------------------------
        // UI
        // ---------------------------------------------

        updateWaveUI();

        if (
            window.Game &&
            typeof window.Game.notify === "function"
        ) {

            if (config.hasCommander) {

                window.Game.notify(
                    `⚠ COMMANDER INCOMING — WAVE ${currentWave}`
                );

            } else {

                window.Game.notify(
                    `WAVE ${currentWave} — DEFEND THE WALLS`
                );
            }
        }


        // ---------------------------------------------
        // COMMANDER
        // ---------------------------------------------

        if (config.hasCommander) {

            setTimeout(() => {

                if (
                    generation !==
                    waveGeneration
                ) {
                    return;
                }

                if (!waveActive) {
                    return;
                }

                spawnCommander();

            }, config.commanderDelay);
        }


        // ---------------------------------------------
        // NORMAL ENEMIES
        // ---------------------------------------------

        clearInterval(
            spawnTimer
        );

        spawnTimer =
            setInterval(() => {

                if (
                    generation !==
                    waveGeneration
                ) {

                    clearInterval(
                        spawnTimer
                    );

                    return;
                }

                if (!waveActive) {

                    clearInterval(
                        spawnTimer
                    );

                    return;
                }

                if (
                    normalSpawned >=
                    totalNormalEnemies
                ) {

                    clearInterval(
                        spawnTimer
                    );

                    return;
                }

                spawnOneEnemy();

            }, config.spawnDelay);

        // First enemy immediately
        spawnOneEnemy();

        return true;
    }


    // =====================================================
    // SPAWN ONE
    // =====================================================

    function spawnOneEnemy() {

        if (
            normalSpawned >=
            totalNormalEnemies
        ) {
            return;
        }

        const type =
            getEnemyType(
                currentWave
            );

        if (
            window.Units &&
            typeof window.Units.spawnEnemy === "function"
        ) {

            window.Units.spawnEnemy(
                type,
                currentWave
            );
        }

        normalSpawned++;

        if (
            normalSpawned >=
            totalNormalEnemies
        ) {

            clearInterval(
                spawnTimer
            );
        }
    }


    // =====================================================
    // COMMANDER
    // =====================================================

    function spawnCommander() {

        if (commanderSpawned) {
            return;
        }

        commanderSpawned = true;

        if (
            window.Units &&
            typeof window.Units.spawnEnemy === "function"
        ) {

            const commander =
                window.Units.spawnEnemy(
                    "commander",
                    currentWave
                );

            if (commander) {

                commander.x =
                    98;

                commander.y =
                    60;

                commander.render();
            }
        }

        if (
            window.Effects &&
            typeof window.Effects.screenShake === "function"
        ) {

            window.Effects.screenShake(
                700
            );
        }

        if (
            window.Game &&
            typeof window.Game.notify === "function"
        ) {

            window.Game.notify(
                "☠ COMMANDER HAS ENTERED THE BATTLEFIELD"
            );
        }
    }


    // =====================================================
    // CHECK WAVE COMPLETE
    // =====================================================

    function checkWaveComplete() {

        if (!waveActive) {
            return;
        }

        if (
            normalSpawned <
            totalNormalEnemies
        ) {
            return;
        }

        const aliveEnemies =
            window.enemies
                ? window.enemies.filter(
                    enemy =>
                        enemy &&
                        enemy.alive
                )
                : [];

        if (
            aliveEnemies.length >
            0
        ) {
            return;
        }


        // ---------------------------------------------
        // COMPLETE
        // ---------------------------------------------

        waveActive = false;

        clearInterval(
            spawnTimer
        );

        spawnTimer = null;


        // ---------------------------------------------
        // BONUS
        // ---------------------------------------------

        const bonus =
            50 +
            currentWave * 15;

        if (
            window.Game &&
            typeof window.Game.addGold === "function"
        ) {

            window.Game.addGold(
                bonus
            );
        }


        // ---------------------------------------------
        // LAST WAVE
        // ---------------------------------------------

        const maxWaves =
            window.Game
                ? window.Game.maxWaves
                : 20;

        if (
            currentWave >=
            maxWaves
        ) {

            setTimeout(() => {

                if (
                    window.Game &&
                    typeof window.Game.win === "function"
                ) {

                    window.Game.win();
                }

            }, 1000);

            return;
        }


        // ---------------------------------------------
        // WAVE COMPLETE UI
        // ---------------------------------------------

        if (
            window.Game &&
            typeof window.Game.notify === "function"
        ) {

            window.Game.notify(
                `WAVE ${currentWave} CLEARED! +${bonus}G`
            );
        }

        updateWaveUI();
    }


    // =====================================================
    // DIFFICULTY
    // =====================================================

    function getDifficultyMultiplier(
        wave
    ) {

        return {

            hp:
                1 +
                Math.max(
                    0,
                    wave - 1
                ) * 0.08,

            damage:
                1 +
                Math.max(
                    0,
                    wave - 1
                ) * 0.06,

            speed:
                1 +
                Math.max(
                    0,
                    wave - 1
                ) * 0.01
        };
    }


    // =====================================================
    // UPDATE WAVE UI
    // =====================================================

    function updateWaveUI() {

        const waveDisplay =
            document.getElementById(
                "waveDisplay"
            );

        if (waveDisplay) {

            waveDisplay.textContent =
                currentWave;
        }

        const button =
            document.getElementById(
                "startWaveButton"
            );

        if (!button) {
            return;
        }

        if (waveActive) {

            button.textContent =
                "⚔ WAVE IN PROGRESS";

            button.disabled =
                true;

        } else if (
            currentWave >=
            (
                window.Game
                    ? window.Game.maxWaves
                    : 20
            )
        ) {

            button.textContent =
                "SIEGE COMPLETE";

            button.disabled =
                true;

        } else {

            button.textContent =
                currentWave === 0
                    ? "START WAVE"
                    : "NEXT WAVE";

            button.disabled =
                false;
        }
    }


    // =====================================================
    // RESET
    // =====================================================

    function reset() {

        waveGeneration++;

        clearInterval(
            spawnTimer
        );

        spawnTimer = null;

        currentWave = 0;

        waveActive = false;

        normalSpawned = 0;

        totalNormalEnemies = 0;

        commanderSpawned = false;

        updateWaveUI();
    }


    // =====================================================
    // GETTERS
    // =====================================================

    function getCurrentWave() {
        return currentWave;
    }

    function isWaveActive() {
        return waveActive;
    }


    // =====================================================
    // GLOBAL CHECK LOOP
    // =====================================================

    setInterval(
        checkWaveComplete,
        400
    );


    // =====================================================
    // EXPORT
    // =====================================================

    window.Waves = {

        get currentWave() {
            return currentWave;
        },

        get active() {
            return waveActive;
        },

        get normalSpawned() {
            return normalSpawned;
        },

        get totalNormalEnemies() {
            return totalNormalEnemies;
        },

        getWaveConfig,

        getEnemyType,

        getDifficultyMultiplier,

        startWave,

        spawnOneEnemy,

        spawnCommander,

        checkWaveComplete,

        updateWaveUI,

        reset,

        getCurrentWave,

        isWaveActive
    };

})();
