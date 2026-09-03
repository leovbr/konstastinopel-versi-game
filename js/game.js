"use strict";

/*
=========================================================
 SIEGE OF CONSTANTINOPLE V2
 GAME ENGINE
=========================================================
*/

window.Game = {

    /* =================================================
       GAME STATE
    ================================================= */

    running: false,
    paused: false,
    gameOver: false,
    victory: false,

    cityHP: 100,
    maxCityHP: 100,

    gold: 120,
    supplies: 60,

    kills: 0,
    score: 0,

    lastTime: 0,

    animationFrame: null,

    fireRainCooldown: 0,

    upgradeLevel: 1,

    maxWaves: 20,


    /* =================================================
       INITIALIZE
    ================================================= */

    init() {

        this.cacheElements();

        this.bindButtons();

        this.updateHUD();

    },


    /* =================================================
       CACHE DOM
    ================================================= */

    cacheElements() {

        this.startScreen =
            document.getElementById(
                "startScreen"
            );

        this.gameScreen =
            document.getElementById(
                "gameScreen"
            );

        this.gameOverScreen =
            document.getElementById(
                "gameOverScreen"
            );

        this.victoryScreen =
            document.getElementById(
                "victoryScreen"
            );


        this.waveDisplay =
            document.getElementById(
                "waveDisplay"
            );

        this.goldDisplay =
            document.getElementById(
                "goldDisplay"
            );

        this.cityHPDisplay =
            document.getElementById(
                "cityHP"
            );

        this.killsDisplay =
            document.getElementById(
                "killsDisplay"
            );

        this.scoreDisplay =
            document.getElementById(
                "scoreDisplay"
            );

        this.suppliesDisplay =
            document.getElementById(
                "suppliesDisplay"
            );


        this.world =
            document.getElementById(
                "gameWorld"
            );

        this.battlefield =
            document.getElementById(
                "battlefield"
            );


        this.waveButton =
            document.getElementById(
                "startWaveBtn"
            );

        this.archerButton =
            document.getElementById(
                "buyArcherBtn"
            );

        this.cannonButton =
            document.getElementById(
                "buyCannonBtn"
            );

        this.fireRainButton =
            document.getElementById(
                "fireRainBtn"
            );

        this.upgradeButton =
            document.getElementById(
                "upgradeBtn"
            );

    },


    /* =================================================
       BUTTONS
    ================================================= */

    bindButtons() {

        /*
        START GAME
        */

        const startBtn =
            document.getElementById(
                "startGameBtn"
            );

        if (startBtn) {

            startBtn.addEventListener(
                "click",
                () => {

                    this.start();

                }
            );

        }


        /*
        START WAVE
        */

        if (this.waveButton) {

            this.waveButton.addEventListener(
                "click",
                () => {

                    this.startWave();

                }
            );

        }


        /*
        ARCHER
        */

        if (this.archerButton) {

            this.archerButton.addEventListener(
                "click",
                () => {

                    this.buyArcher();

                }
            );

        }


        /*
        CANNON
        */

        if (this.cannonButton) {

            this.cannonButton.addEventListener(
                "click",
                () => {

                    this.buyCannon();

                }
            );

        }


        /*
        FIRE RAIN
        */

        if (this.fireRainButton) {

            this.fireRainButton.addEventListener(
                "click",
                () => {

                    this.fireRain();

                }
            );

        }


        /*
        UPGRADE
        */

        if (this.upgradeButton) {

            this.upgradeButton.addEventListener(
                "click",
                () => {

                    this.upgradeDefenses();

                }
            );

        }


        /*
        RESTART
        */

        const restartBtn =
            document.getElementById(
                "restartBtn"
            );

        if (restartBtn) {

            restartBtn.addEventListener(
                "click",
                () => {

                    location.reload();

                }
            );

        }


        /*
        VICTORY RESTART
        */

        const victoryBtn =
            document.getElementById(
                "victoryRestartBtn"
            );

        if (victoryBtn) {

            victoryBtn.addEventListener(
                "click",
                () => {

                    location.reload();

                }
            );

        }


        /*
        PAUSE WITH P
        */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key.toLowerCase() ===
                    "p"
                ) {

                    this.togglePause();

                }

            }
        );

    },


    /* =================================================
       START GAME
    ================================================= */

    start() {

        if (this.running) {
            return;
        }


        this.running = true;

        this.paused = false;

        this.gameOver = false;

        this.victory = false;


        /*
        Hide start screen.
        */

        if (this.startScreen) {

            this.startScreen.classList.add(
                "hidden"
            );

        }


        /*
        Show game.
        */

        if (this.gameScreen) {

            this.gameScreen.classList.remove(
                "hidden"
            );

        }


        /*
        Reset systems.
        */

        this.cityHP =
            this.maxCityHP;

        this.gold = 120;

        this.supplies = 60;

        this.kills = 0;

        this.score = 0;

        this.upgradeLevel = 1;


        if (
            window.Waves
        ) {

            window.Waves.reset();

        }


        if (
            window.Units
        ) {

            window.Units.clearUnits();

            window.Units.createDefaultDefenses();

        }


        if (
            window.Effects
        ) {

            window.Effects.clearEffects();

        }


        this.updateHUD();


        /*
        Start game loop.
        */

        this.lastTime =
            performance.now();


        this.animationFrame =
            requestAnimationFrame(
                this.loop.bind(this)
            );


        /*
        First wave.
        */

        setTimeout(() => {

            if (
                this.running &&
                !this.paused
            ) {

                this.startWave();

            }

        }, 1000);

    },


    /* =================================================
       MAIN LOOP
    ================================================= */

    loop(timestamp) {

        if (!this.running) {
            return;
        }


        const delta =
            Math.min(
                (timestamp -
                    this.lastTime) /
                    1000,
                .05
            );


        this.lastTime =
            timestamp;


        if (!this.paused) {

            /*
            Update waves.
            */

            if (
                window.Waves
            ) {

                window.Waves.update(
                    delta
                );

            }


            /*
            Update enemies.
            */

            if (
                window.Units
            ) {

                window.Units.updateUnits(
                    delta
                );

            }


            /*
            Fire Rain cooldown.
            */

            if (
                this.fireRainCooldown > 0
            ) {

                this.fireRainCooldown -=
                    delta;

                if (
                    this.fireRainCooldown < 0
                ) {

                    this.fireRainCooldown = 0;

                }

            }

        }


        this.animationFrame =
            requestAnimationFrame(
                this.loop.bind(this)
            );

    },


    /* =================================================
       START WAVE
    ================================================= */

    startWave() {

        if (!this.running) {
            return;
        }


        if (this.paused) {
            return;
        }


        if (
            window.Waves &&
            window.Waves.active
        ) {

            this.notify(
                "Wave masih berlangsung!",
                "warning"
            );

            return;

        }


        /*
        Victory check.
        */

        if (
            window.Waves &&
            window.Waves.currentWave >=
            this.maxWaves
        ) {

            this.win();

            return;

        }


        if (
            window.Waves
        ) {

            window.Waves.startWave();

        }


        this.updateWaveButton();

    },


    /* =================================================
       BUY ARCHER
    ================================================= */

    buyArcher() {

        const cost = 150;


        if (
            this.gold < cost
        ) {

            this.notify(
                "Gold tidak cukup!",
                "danger"
            );

            return;

        }


        this.gold -= cost;


        /*
        Spawn tower.
        */

        if (
            window.Units &&
            window.Units.ArcherTower
        ) {

            const tower =
                new window.Units.ArcherTower();

            window.defenses.push(
                tower
            );

        }


        this.updateHUD();


        this.notify(
            "Archer Tower dibangun!",
            "success"
        );


        if (
            window.Effects
        ) {

            window.Effects.goldEffect(
                -cost
            );

        }

    },


    /* =================================================
       BUY CANNON
    ================================================= */

    buyCannon() {

        const cost = 250;


        if (
            this.gold < cost
        ) {

            this.notify(
                "Gold tidak cukup!",
                "danger"
            );

            return;

        }


        this.gold -= cost;


        if (
            window.Units &&
            window.Units.Cannon
        ) {

            const cannon =
                new window.Units.Cannon();

            window.defenses.push(
                cannon
            );

        }


        this.updateHUD();


        this.notify(
            "Cannon berhasil dibangun!",
            "success"
        );


        if (
            window.Effects
        ) {

            window.Effects.goldEffect(
                -cost
            );

        }

    },


    /* =================================================
       DAMAGE CITY
    ================================================= */

    damageCity(amount) {

        if (
            this.gameOver ||
            this.victory
        ) {
            return;
        }


        amount =
            Math.max(
                0,
                amount
            );


        this.cityHP -= amount;


        this.cityHP =
            Math.max(
                0,
                this.cityHP
            );


        this.updateHUD();


        /*
        Hit effect.
        */

        if (
            window.Effects
        ) {

            window.Effects.buildingHit();

            window.Effects.screenShake(
                Math.min(
                    10,
                    amount / 2
                ),
                220
            );

        }


        /*
        GAME OVER
        */

        if (
            this.cityHP <= 0
        ) {

            this.lose();

        }

    },


    /* =================================================
       REPAIR CITY
    ================================================= */

    repairCity() {

        const cost = 75;

        const heal = 20;


        if (
            this.gold < cost
        ) {

            this.notify(
                "Gold tidak cukup!",
                "danger"
            );

            return;

        }


        if (
            this.cityHP >=
            this.maxCityHP
        ) {

            this.notify(
                "Tembok masih penuh!",
                "warning"
            );

            return;

        }


        this.gold -= cost;


        this.cityHP += heal;


        this.cityHP =
            Math.min(
                this.maxCityHP,
                this.cityHP
            );


        this.updateHUD();


        this.notify(
            `City repaired +${heal} HP`,
            "success"
        );

    },


    /* =================================================
       ADD GOLD
    ================================================= */

    addGold(amount) {

        this.gold +=
            Math.floor(
                amount
            );


        this.gold =
            Math.max(
                0,
                this.gold
            );


        this.updateHUD();

    },


    /* =================================================
       ADD KILL
    ================================================= */

    addKill(
        score = 0
    ) {

        this.kills++;

        this.score +=
            Math.floor(
                score
            );


        this.updateHUD();

    },


    /* =================================================
       FIRE RAIN
    ================================================= */

    fireRain() {

        const supplyCost = 35;


        if (
            this.fireRainCooldown > 0
        ) {

            this.notify(
                "Fire Rain sedang cooldown!",
                "warning"
            );

            return;

        }


        if (
            this.supplies <
            supplyCost
        ) {

            this.notify(
                "Supplies tidak cukup!",
                "danger"
            );

            return;

        }


        this.supplies -=
            supplyCost;


        this.fireRainCooldown =
            12;


        /*
        Visual effect.
        */

        if (
            window.Effects
        ) {

            window.Effects.fireRainEffect();

        }


        /*
        Damage every enemy.
        */

        const enemies =
            window.enemies || [];


        enemies.forEach(
            enemy => {

                if (
                    !enemy.alive
                ) {
                    return;
                }


                const damage =
                    110 +
                    this.upgradeLevel *
                    15;


                enemy.takeDamage(
                    damage
                );

            }
        );


        this.updateHUD();


        this.notify(
            "🔥 FIRE RAIN!",
            "success"
        );

    },


    /* =================================================
       UPGRADE DEFENSES
    ================================================= */

    upgradeDefenses() {

        const cost =
            100 +
            this.upgradeLevel *
            75;


        if (
            this.gold <
            cost
        ) {

            this.notify(
                `Butuh ${cost} gold!`,
                "danger"
            );

            return;

        }


        this.gold -= cost;


        this.upgradeLevel++;


        /*
        Upgrade every defense.
        */

        const defenses =
            window.defenses || [];


        defenses.forEach(
            defense => {

                if (
                    defense &&
                    typeof defense.upgrade ===
                    "function"
                ) {

                    defense.upgrade();

                }

            }
        );


        this.updateHUD();


        this.notify(
            `Defense upgraded to Lv.${this.upgradeLevel}`,
            "success"
        );


        if (
            window.Effects
        ) {

            window.Effects.createParticles(
                this.battlefield,
                15
            );

        }

    },


    /* =================================================
       TOGGLE PAUSE
    ================================================= */

    togglePause() {

        if (
            !this.running ||
            this.gameOver ||
            this.victory
        ) {
            return;
        }


        this.paused =
            !this.paused;


        if (
            this.paused
        ) {

            this.notify(
                "GAME PAUSED",
                "warning"
            );

        } else {

            this.notify(
                "GAME RESUMED",
                "success"
            );


            this.lastTime =
                performance.now();

        }

    },


    /* =================================================
       GAME OVER
    ================================================= */

    lose() {

        if (
            this.gameOver
        ) {
            return;
        }


        this.gameOver = true;

        this.running = false;

        this.paused = false;


        if (
            this.animationFrame
        ) {

            cancelAnimationFrame(
                this.animationFrame
            );

        }


        /*
        Hide game.
        */

        if (
            this.gameScreen
        ) {

            this.gameScreen.classList.add(
                "hidden"
            );

        }


        /*
        Show game over.
        */

        if (
            this.gameOverScreen
        ) {

            this.gameOverScreen.classList.remove(
                "hidden"
            );

        }


        /*
        Update result stats.
        */

        this.updateResultScreen(
            this.gameOverScreen
        );


        if (
            window.Effects
        ) {

            window.Effects.screenShake(
                15,
                600
            );

        }

    },


    /* =================================================
       VICTORY
    ================================================= */

    win() {

        if (
            this.victory
        ) {
            return;
        }


        this.victory = true;

        this.running = false;

        this.paused = false;


        if (
            this.animationFrame
        ) {

            cancelAnimationFrame(
                this.animationFrame
            );

        }


        if (
            this.gameScreen
        ) {

            this.gameScreen.classList.add(
                "hidden"
            );

        }


        if (
            this.victoryScreen
        ) {

            this.victoryScreen.classList.remove(
                "hidden"
            );

        }


        this.updateResultScreen(
            this.victoryScreen
        );


        /*
        Victory bonus.
        */

        this.score += 5000;

        this.updateHUD();

    },


    /* =================================================
       RESULT SCREEN
    ================================================= */

    updateResultScreen(
        screen
    ) {

        if (!screen) {
            return;
        }


        const wave =
            screen.querySelector(
                ".result-wave"
            );

        const kills =
            screen.querySelector(
                ".result-kills"
            );

        const score =
            screen.querySelector(
                ".result-score"
            );


        if (wave) {

            wave.textContent =
                window.Waves
                    ? window.Waves.currentWave
                    : 0;

        }


        if (kills) {

            kills.textContent =
                this.kills;

        }


        if (score) {

            score.textContent =
                this.score;

        }

    },


    /* =================================================
       UPDATE WAVE BUTTON
    ================================================= */

    updateWaveButton() {

        if (!this.waveButton) {
            return;
        }


        if (
            window.Waves &&
            window.Waves.active
        ) {

            this.waveButton.textContent =
                "WAVE IN PROGRESS";

            this.waveButton.disabled =
                true;

        } else {

            this.waveButton.disabled =
                false;


            const next =
                window.Waves
                    ? window.Waves.currentWave + 1
                    : 1;


            if (
                next >
                this.maxWaves
            ) {

                this.waveButton.textContent =
                    "VICTORY";

            } else {

                this.waveButton.textContent =
                    `START WAVE ${next}`;

            }

        }

    },


    /* =================================================
       UPDATE HUD
    ================================================= */

    updateHUD() {

        if (this.waveDisplay) {

            this.waveDisplay.textContent =
                window.Waves
                    ? window.Waves.currentWave
                    : 0;

        }


        if (this.goldDisplay) {

            this.goldDisplay.textContent =
                this.gold;

        }


        if (this.cityHPDisplay) {

            this.cityHPDisplay.textContent =
                `${Math.ceil(
                    this.cityHP
                )}/${this.maxCityHP}`;

        }


        if (this.killsDisplay) {

            this.killsDisplay.textContent =
                this.kills;

        }


        if (this.scoreDisplay) {

            this.scoreDisplay.textContent =
                this.score;

        }


        if (this.suppliesDisplay) {

            this.suppliesDisplay.textContent =
                this.supplies;

        }


        this.updateWaveButton();

    },


    /* =================================================
       NOTIFICATION
    ================================================= */

    notify(
        text,
        type = "normal"
    ) {

        const world =
            this.world ||
            document.body;


        const notification =
            document.createElement(
                "div"
            );


        notification.className =
            `game-notification ${type}`;


        notification.textContent =
            text;


        notification.style.position =
            "absolute";

        notification.style.left =
            "50%";

        notification.style.top =
            "72%";

        notification.style.transform =
            "translateX(-50%)";

        notification.style.zIndex =
            "1000";

        notification.style.pointerEvents =
            "none";

        notification.style.padding =
            "9px 18px";

        notification.style.border =
            "1px solid rgba(255,255,255,.2)";

        notification.style.background =
            "rgba(0,0,0,.75)";

        notification.style.color =
            "#eee";

        notification.style.fontSize =
            "12px";

        notification.style.letterSpacing =
            "1px";


        world.appendChild(
            notification
        );


        notification.animate(
            [
                {
                    opacity: 0,
                    transform:
                        "translate(-50%,15px)"
                },
                {
                    opacity: 1,
                    transform:
                        "translate(-50%,0)"
                },
                {
                    opacity: 0,
                    transform:
                        "translate(-50%,-15px)"
                }
            ],
            {
                duration: 1500,
                easing: "ease-out"
            }
        );


        setTimeout(() => {

            notification.remove();

        }, 1600);

    }

};


/* =====================================================
   GLOBAL REPAIR FUNCTION
===================================================== */

window.repairCity = function () {

    if (
        window.Game
    ) {

        window.Game.repairCity();

    }

};


/* =====================================================
   AUTO INITIALIZE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        window.Game.init();

    }
);
