(function () {
    "use strict";

    // =====================================================
    // GAME STATE
    // =====================================================

    const Game = {

        running: false,
        paused: false,
        gameOver: false,
        victory: false,

        cityHP: 1000,
        maxCityHP: 1000,

        gold: 500,
        supplies: 60,

        kills: 0,
        score: 0,

        upgradeLevel: 1,

        fireRainCooldown: 0,
        fireRainMaxCooldown: 12,

        maxWaves: 20,

        lastTime: 0,
        animationFrame: null,

        elements: {},


        // =================================================
        // INITIALIZE
        // =================================================

        init() {

            this.cacheElements();

            this.bindEvents();

            this.updateHUD();

            this.showScreen(
                "startScreen"
            );

            console.log(
                "⚔ Constantinople V2 initialized"
            );
        },


        // =================================================
        // CACHE DOM
        // =================================================

        cacheElements() {

            this.elements = {

                startScreen:
                    document.getElementById(
                        "startScreen"
                    ),

                gameScreen:
                    document.getElementById(
                        "gameScreen"
                    ),

                gameOverScreen:
                    document.getElementById(
                        "gameOverScreen"
                    ),

                victoryScreen:
                    document.getElementById(
                        "victoryScreen"
                    ),

                startButton:
                    document.getElementById(
                        "startButton"
                    ),

                restartButton:
                    document.getElementById(
                        "restartButton"
                    ),

                victoryRestartButton:
                    document.getElementById(
                        "victoryRestartButton"
                    ),

                startWaveButton:
                    document.getElementById(
                        "startWaveButton"
                    ),

                archerButton:
                    document.getElementById(
                        "archerButton"
                    ),

                cannonButton:
                    document.getElementById(
                        "cannonButton"
                    ),

                fireRainButton:
                    document.getElementById(
                        "fireRainButton"
                    ),

                upgradeButton:
                    document.getElementById(
                        "upgradeButton"
                    ),

                waveDisplay:
                    document.getElementById(
                        "waveDisplay"
                    ),

                goldDisplay:
                    document.getElementById(
                        "goldDisplay"
                    ),

                killDisplay:
                    document.getElementById(
                        "killDisplay"
                    ),

                scoreDisplay:
                    document.getElementById(
                        "scoreDisplay"
                    ),

                cityHpBar:
                    document.getElementById(
                        "cityHpBar"
                    ),

                cityHpText:
                    document.getElementById(
                        "cityHpText"
                    ),

                selectionTitle:
                    document.getElementById(
                        "selectionTitle"
                    ),

                selectionDescription:
                    document.getElementById(
                        "selectionDescription"
                    ),

                fireRainStatus:
                    document.getElementById(
                        "fireRainStatus"
                    ),

                upgradeCost:
                    document.getElementById(
                        "upgradeCost"
                    ),

                finalWave:
                    document.getElementById(
                        "finalWave"
                    ),

                finalKills:
                    document.getElementById(
                        "finalKills"
                    ),

                finalScore:
                    document.getElementById(
                        "finalScore"
                    ),

                victoryWave:
                    document.getElementById(
                        "victoryWave"
                    ),

                victoryKills:
                    document.getElementById(
                        "victoryKills"
                    ),

                victoryScore:
                    document.getElementById(
                        "victoryScore"
                    )
            };
        },


        // =================================================
        // EVENTS
        // =================================================

        bindEvents() {

            const e =
                this.elements;


            if (e.startButton) {

                e.startButton.onclick =
                    () => this.start();
            }


            if (e.restartButton) {

                e.restartButton.onclick =
                    () => this.restart();
            }


            if (
                e.victoryRestartButton
            ) {

                e.victoryRestartButton.onclick =
                    () => this.restart();
            }


            if (e.startWaveButton) {

                e.startWaveButton.onclick =
                    () => this.startWave();
            }


            if (e.archerButton) {

                e.archerButton.onclick =
                    () => this.buyArcher();
            }


            if (e.cannonButton) {

                e.cannonButton.onclick =
                    () => this.buyCannon();
            }


            if (e.fireRainButton) {

                e.fireRainButton.onclick =
                    () => this.fireRain();
            }


            if (e.upgradeButton) {

                e.upgradeButton.onclick =
                    () => this.upgradeDefenses();
            }
        },


        // =================================================
        // START
        // =================================================

        start() {

            if (this.running) {
                return;
            }

            this.running = true;
            this.paused = false;
            this.gameOver = false;
            this.victory = false;

            this.cityHP = this.maxCityHP;

            this.gold = 500;

            this.supplies = 60;

            this.kills = 0;

            this.score = 0;

            this.upgradeLevel = 1;

            this.fireRainCooldown = 0;


            // ---------------------------------------------
            // CLEAR OLD GAME
            // ---------------------------------------------

            if (
                window.Waves &&
                typeof window.Waves.reset === "function"
            ) {

                window.Waves.reset();
            }


            if (
                window.Units &&
                typeof window.Units.clearUnits === "function"
            ) {

                window.Units.clearUnits();
            }


            if (
                window.Units &&
                typeof window.Units.createDefaultDefenses === "function"
            ) {

                window.Units.createDefaultDefenses();
            }


            if (
                window.Effects &&
                typeof window.Effects.clearEffects === "function"
            ) {

                window.Effects.clearEffects();
            }


            // ---------------------------------------------
            // SHOW GAME
            // ---------------------------------------------

            this.showScreen(
                "gameScreen"
            );

            this.updateHUD();


            // ---------------------------------------------
            // START LOOP
            // ---------------------------------------------

            this.lastTime =
                performance.now();

            cancelAnimationFrame(
                this.animationFrame
            );

            this.loop(
                this.lastTime
            );


            // ---------------------------------------------
            // START FIRST WAVE
            // ---------------------------------------------

            setTimeout(() => {

                if (
                    this.running &&
                    !this.gameOver
                ) {

                    this.startWave();
                }

            }, 1000);
        },


        // =================================================
        // RESTART
        // =================================================

        restart() {

            cancelAnimationFrame(
                this.animationFrame
            );

            this.running = false;

            this.start();
        },


        // =================================================
        // GAME LOOP
        // =================================================

        loop(timestamp) {

            if (
                !this.running
            ) {
                return;
            }

            const delta =
                Math.min(
                    timestamp -
                    this.lastTime,
                    100
                );

            this.lastTime =
                timestamp;


            if (
                !this.paused &&
                !this.gameOver &&
                !this.victory
            ) {

                if (
                    window.Units &&
                    typeof window.Units.updateUnits === "function"
                ) {

                    window.Units.updateUnits(
                        delta
                    );
                }

                this.updateCooldowns(
                    delta
                );
            }


            this.animationFrame =
                requestAnimationFrame(
                    time =>
                        this.loop(time)
                );
        },


        // =================================================
        // COOLDOWNS
        // =================================================

        updateCooldowns(
            delta
        ) {

            if (
                this.fireRainCooldown > 0
            ) {

                this.fireRainCooldown -=
                    delta / 1000;

                if (
                    this.fireRainCooldown <
                    0
                ) {

                    this.fireRainCooldown =
                        0;
                }
            }

            this.updateHUD();
        },


        // =================================================
        // START WAVE
        // =================================================

        startWave() {

            if (
                !this.running ||
                this.gameOver ||
                this.victory
            ) {
                return;
            }

            if (
                !window.Waves ||
                typeof window.Waves.startWave !== "function"
            ) {
                return;
            }

            const started =
                window.Waves.startWave();

            if (started) {

                this.updateHUD();
            }
        },


        // =================================================
        // BUY ARCHER
        // =================================================

        buyArcher() {

            const cost = 150;

            if (this.gold < cost) {

                this.notify(
                    "NOT ENOUGH GOLD"
                );

                return;
            }

            if (
                !window.Units ||
                typeof window.Units.createArcher !== "function"
            ) {
                return;
            }

            const tower =
                window.Units.createArcher();

            if (!tower) {
                return;
            }

            this.gold -= cost;

            this.notify(
                "🏹 ARCHER TOWER BUILT"
            );

            this.updateHUD();
        },


        // =================================================
        // BUY CANNON
        // =================================================

        buyCannon() {

            const cost = 250;

            if (this.gold < cost) {

                this.notify(
                    "NOT ENOUGH GOLD"
                );

                return;
            }

            if (
                !window.Units ||
                typeof window.Units.createCannon !== "function"
            ) {
                return;
            }

            const cannon =
                window.Units.createCannon();

            if (!cannon) {
                return;
            }

            this.gold -= cost;

            this.notify(
                "💣 CANNON BUILT"
            );

            this.updateHUD();
        },


        // =================================================
        // FIRE RAIN
        // =================================================

        fireRain() {

            const cost = 35;

            if (
                this.fireRainCooldown >
                0
            ) {

                this.notify(
                    `FIRE RAIN RECHARGING ${this.fireRainCooldown.toFixed(1)}s`
                );

                return;
            }

            if (
                this.supplies <
                cost
            ) {

                this.notify(
                    "NOT ENOUGH SUPPLIES"
                );

                return;
            }


            this.supplies -= cost;

            this.fireRainCooldown =
                this.fireRainMaxCooldown;


            // ---------------------------------------------
            // VISUAL
            // ---------------------------------------------

            if (
                window.Effects &&
                typeof window.Effects.fireRainEffect === "function"
            ) {

                window.Effects.fireRainEffect();
            }


            // ---------------------------------------------
            // DAMAGE
            // ---------------------------------------------

            const damage =
                110 +
                this.upgradeLevel *
                15;

            const targets =
                window.enemies
                    ? [
                        ...window.enemies
                    ]
                    : [];

            targets.forEach(enemy => {

                if (
                    enemy &&
                    enemy.alive
                ) {

                    enemy.takeDamage(
                        damage
                    );
                }
            });


            this.notify(
                `🔥 FIRE RAIN — ${damage} DAMAGE`
            );

            this.updateHUD();
        },


        // =================================================
        // UPGRADE
        // =================================================

        upgradeDefenses() {

            const cost =
                100 *
                this.upgradeLevel;


            if (
                this.gold <
                cost
            ) {

                this.notify(
                    "NOT ENOUGH GOLD"
                );

                return;
            }


            if (
                !window.defenses ||
                window.defenses.length === 0
            ) {

                this.notify(
                    "NO DEFENSES AVAILABLE"
                );

                return;
            }


            this.gold -= cost;

            this.upgradeLevel++;


            window.defenses.forEach(
                defense => {

                    if (
                        defense &&
                        typeof defense.upgrade === "function"
                    ) {

                        defense.upgrade();
                    }
                }
            );


            this.notify(
                `⚡ DEFENSES UPGRADED — LEVEL ${this.upgradeLevel}`
            );

            this.updateHUD();
        },


        // =================================================
        // CITY DAMAGE
        // =================================================

        damageCity(
            amount
        ) {

            if (
                this.gameOver ||
                this.victory
            ) {
                return;
            }

            amount =
                Math.max(
                    0,
                    Number(amount) || 0
                );


            this.cityHP -=
                amount;

            this.cityHP =
                Math.max(
                    0,
                    this.cityHP
                );


            if (
                window.Effects &&
                typeof window.Effects.buildingHit === "function"
            ) {

                window.Effects.buildingHit(
                    13,
                    60
                );
            }


            if (
                window.Effects &&
                typeof window.Effects.screenShake === "function"
            ) {

                window.Effects.screenShake(
                    250
                );
            }


            this.updateHUD();


            if (
                this.cityHP <=
                0
            ) {

                this.lose();
            }
        },


        // =================================================
        // REPAIR
        // =================================================

        repairCity() {

            const cost = 75;
            const heal = 150;

            if (
                this.cityHP >=
                this.maxCityHP
            ) {

                this.notify(
                    "CITY HP IS FULL"
                );

                return;
            }

            if (
                this.gold <
                cost
            ) {

                this.notify(
                    "NOT ENOUGH GOLD"
                );

                return;
            }


            this.gold -= cost;

            this.cityHP =
                Math.min(
                    this.maxCityHP,
                    this.cityHP +
                    heal
                );


            this.notify(
                `🔧 WALLS REPAIRED +${heal} HP`
            );

            this.updateHUD();
        },


        // =================================================
        // GOLD
        // =================================================

        addGold(
            amount
        ) {

            amount =
                Math.max(
                    0,
                    Number(amount) || 0
                );

            this.gold += amount;

            this.updateHUD();
        },


        // =================================================
        // KILL
        // =================================================

        addKill(
            score
        ) {

            this.kills++;

            this.score +=
                Number(score) || 0;

            this.updateHUD();
        },


        // =================================================
        // HUD
        // =================================================

        updateHUD() {

            const e =
                this.elements;


            if (e.waveDisplay) {

                e.waveDisplay.textContent =
                    window.Waves
                        ? window.Waves.currentWave
                        : 0;
            }


            if (e.goldDisplay) {

                e.goldDisplay.textContent =
                    Math.floor(
                        this.gold
                    );
            }


            if (e.killDisplay) {

                e.killDisplay.textContent =
                    this.kills;
            }


            if (e.scoreDisplay) {

                e.scoreDisplay.textContent =
                    this.score;
            }


            if (e.cityHpBar) {

                const percent =
                    (
                        this.cityHP /
                        this.maxCityHP
                    ) * 100;

                e.cityHpBar.style.width =
                    `${Math.max(
                        0,
                        Math.min(
                            100,
                            percent
                        )
                    )}%`;
            }


            if (e.cityHpText) {

                e.cityHpText.textContent =
                    `${Math.ceil(
                        this.cityHP
                    )} / ${this.maxCityHP}`;
            }


            if (e.fireRainStatus) {

                if (
                    this.fireRainCooldown >
                    0
                ) {

                    e.fireRainStatus.textContent =
                        `${this.fireRainCooldown.toFixed(1)}s`;

                } else {

                    e.fireRainStatus.textContent =
                        "READY";
                }
            }


            if (e.upgradeCost) {

                e.upgradeCost.textContent =
                    `${100 * this.upgradeLevel}G`;
            }


            this.updateWaveButton();
        },


        // =================================================
        // WAVE BUTTON
        // =================================================

        updateWaveButton() {

            const button =
                this.elements.startWaveButton;

            if (!button) {
                return;
            }

            if (
                window.Waves &&
                window.Waves.active
            ) {

                button.textContent =
                    "⚔ WAVE IN PROGRESS";

                button.disabled =
                    true;

                return;
            }


            if (
                window.Waves &&
                window.Waves.currentWave >=
                this.maxWaves
            ) {

                button.textContent =
                    "SIEGE COMPLETE";

                button.disabled =
                    true;

                return;
            }


            button.disabled =
                false;

            button.textContent =
                window.Waves &&
                window.Waves.currentWave > 0
                    ? "NEXT WAVE"
                    : "START WAVE";
        },


        // =================================================
        // NOTIFICATION
        // =================================================

        notify(
            message
        ) {

            let notification =
                document.getElementById(
                    "gameNotification"
                );


            if (!notification) {

                notification =
                    document.createElement(
                        "div"
                    );

                notification.id =
                    "gameNotification";

                notification.className =
                    "game-notification";

                const world =
                    document.getElementById(
                        "gameWorld"
                    );

                if (world) {
                    world.appendChild(
                        notification
                    );
                }
            }


            notification.textContent =
                message;

            notification.classList.remove(
                "show"
            );

            void notification.offsetWidth;

            notification.classList.add(
                "show"
            );


            clearTimeout(
                this.notificationTimer
            );

            this.notificationTimer =
                setTimeout(() => {

                    notification.classList.remove(
                        "show"
                    );

                }, 1800);
        },


        // =================================================
        // SCREEN MANAGEMENT
        // =================================================

        showScreen(
            screenId
        ) {

            const screens = [
                "startScreen",
                "gameScreen",
                "gameOverScreen",
                "victoryScreen"
            ];


            screens.forEach(id => {

                const screen =
                    document.getElementById(
                        id
                    );

                if (!screen) {
                    return;
                }

                if (
                    id === screenId
                ) {

                    screen.classList.add(
                        "active"
                    );

                } else {

                    screen.classList.remove(
                        "active"
                    );
                }
            });
        },


        // =================================================
        // LOSE
        // =================================================

        lose() {

            if (
                this.gameOver
            ) {
                return;
            }

            this.gameOver =
                true;

            this.running =
                false;


            cancelAnimationFrame(
                this.animationFrame
            );


            const wave =
                window.Waves
                    ? window.Waves.currentWave
                    : 0;


            if (this.elements.finalWave) {

                this.elements.finalWave.textContent =
                    wave;
            }

            if (this.elements.finalKills) {

                this.elements.finalKills.textContent =
                    this.kills;
            }

            if (this.elements.finalScore) {

                this.elements.finalScore.textContent =
                    this.score;
            }


            this.showScreen(
                "gameOverScreen"
            );
        },


        // =================================================
        // VICTORY
        // =================================================

        win() {

            if (
                this.victory
            ) {
                return;
            }

            this.victory =
                true;

            this.running =
                false;


            cancelAnimationFrame(
                this.animationFrame
            );


            const wave =
                window.Waves
                    ? window.Waves.currentWave
                    : this.maxWaves;


            if (
                this.elements.victoryWave
            ) {

                this.elements.victoryWave.textContent =
                    wave;
            }

            if (
                this.elements.victoryKills
            ) {

                this.elements.victoryKills.textContent =
                    this.kills;
            }

            if (
                this.elements.victoryScore
            ) {

                this.elements.victoryScore.textContent =
                    this.score;
            }


            this.showScreen(
                "victoryScreen"
            );
        }
    };


    // =====================================================
    // EXPORT
    // =====================================================

    window.Game = Game;

})();
