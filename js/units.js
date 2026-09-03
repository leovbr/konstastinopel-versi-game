"use strict";

/*
=========================================================
 SIEGE OF CONSTANTINOPLE V2
 UNIT SYSTEM
=========================================================

 ENEMIES:
 - Soldier
 - Archer
 - Janissary
 - Commander

 DEFENSE:
 - Archer Tower
 - Cannon

 Defense buildings automatically attack enemies.
=========================================================
*/


/* ======================================================
   ENEMY ID
====================================================== */

let enemyIdCounter = 0;


/* ======================================================
   ENEMY CLASS
====================================================== */

class Enemy {

    constructor(type, x = 0) {

        this.id =
            ++enemyIdCounter;

        this.type =
            type;

        this.x =
            x;

        this.y =
            0;

        this.hp =
            100;

        this.maxHp =
            100;

        this.speed =
            0.05;

        this.damage =
            10;

        this.attackSpeed =
            1200;

        this.range =
            45;

        this.reward =
            15;

        this.attackTimer =
            0;

        this.alive =
            true;

        this.element =
            null;


        this.setupStats();

        this.createElement();

        this.updatePosition();
    }


    /* ==================================================
       STATS
    ================================================== */

    setupStats() {

        switch (this.type) {

            case "soldier":

                this.maxHp =
                    100;

                this.hp =
                    this.maxHp;

                this.speed =
                    0.055;

                this.damage =
                    12;

                this.attackSpeed =
                    1200;

                this.range =
                    48;

                this.reward =
                    15;

                break;


            case "archer":

                this.maxHp =
                    70;

                this.hp =
                    this.maxHp;

                this.speed =
                    0.035;

                this.damage =
                    8;

                this.attackSpeed =
                    1500;

                this.range =
                    160;

                this.reward =
                    22;

                break;


            case "janissary":

                this.maxHp =
                    180;

                this.hp =
                    this.maxHp;

                this.speed =
                    0.045;

                this.damage =
                    20;

                this.attackSpeed =
                    1100;

                this.range =
                    55;

                this.reward =
                    35;

                break;


            case "commander":

                this.maxHp =
                    650;

                this.hp =
                    this.maxHp;

                this.speed =
                    0.025;

                this.damage =
                    35;

                this.attackSpeed =
                    1000;

                this.range =
                    70;

                this.reward =
                    150;

                break;
        }
    }


    /* ==================================================
       CREATE VISUAL
    ================================================== */

    createElement() {

        this.element =
            document.createElement("div");


        this.element.className =
            `enemy ${this.type}`;


        if (this.type === "archer") {

            this.element.classList.add(
                "archer-enemy"
            );

        }


        if (this.type === "janissary") {

            this.element.classList.add(
                "janissary"
            );

        }


        if (this.type === "commander") {

            this.element.classList.add(
                "commander"
            );

        }


        this.element.innerHTML = `

            <div class="enemy-hp">
                <div class="enemy-hp-inner"></div>
            </div>

            <div class="enemy-head"></div>

            <div class="enemy-body"></div>

            <div class="enemy-weapon"></div>

        `;


        document
            .getElementById("battlefield")
            .appendChild(this.element);


        this.element.classList.add(
            "walking"
        );
    }


    /* ==================================================
       POSITION
    ================================================== */

    updatePosition() {

        if (!this.element) return;


        this.element.style.left =
            `${this.x}px`;


        this.element.style.bottom =
            `${this.y + 25}%`;
    }


    /* ==================================================
       MOVEMENT
    ================================================== */

    move(delta) {

        if (!this.alive) return;


        /*
        Stop when enemy reaches castle.
        */

        const castleX =
            window.innerWidth * 0.12;


        if (this.x > castleX) {

            this.x -=
                this.speed * delta;

            this.updatePosition();

        } else {

            this.attackCastle(delta);
        }
    }


    /* ==================================================
       ATTACK CASTLE
    ================================================== */

    attackCastle(delta) {

        this.attackTimer +=
            delta;


        if (
            this.attackTimer >=
            this.attackSpeed
        ) {

            this.attackTimer = 0;


            if (
                typeof damageCastle ===
                "function"
            ) {

                damageCastle(
                    this.damage
                );
            }
        }
    }


    /* ==================================================
       TAKE DAMAGE
    ================================================== */

    takeDamage(amount) {

        if (!this.alive) return;


        this.hp -=
            amount;


        this.updateHpBar();


        this.flash();


        if (this.hp <= 0) {

            this.die();
        }
    }


    /* ==================================================
       HP BAR
    ================================================== */

    updateHpBar() {

        const bar =
            this.element.querySelector(
                ".enemy-hp-inner"
            );


        if (!bar) return;


        const percentage =
            Math.max(
                0,
                this.hp /
                this.maxHp *
                100
            );


        bar.style.width =
            `${percentage}%`;
    }


    /* ==================================================
       HIT FLASH
    ================================================== */

    flash() {

        if (!this.element) return;


        this.element.style.filter =
            "brightness(2)";


        setTimeout(() => {

            if (
                this.element
            ) {

                this.element.style.filter =
                    "";
            }

        }, 80);
    }


    /* ==================================================
       DEATH
    ================================================== */

    die() {

        if (!this.alive) return;


        this.alive =
            false;


        const rect =
            this.element.getBoundingClientRect();


        const worldRect =
            document
                .getElementById("gameWorld")
                .getBoundingClientRect();


        const x =
            rect.left -
            worldRect.left +
            rect.width / 2;


        const y =
            rect.top -
            worldRect.top +
            rect.height / 2;


        createDeathEffect(
            x,
            y,
            this.type
        );


        if (
            typeof rewardKill ===
            "function"
        ) {

            rewardKill(
                this.reward
            );
        }


        this.element.style.transition =
            "transform .35s, opacity .35s";


        this.element.style.transform +=
            " rotate(80deg) scale(.4)";


        this.element.style.opacity =
            "0";


        setTimeout(() => {

            if (this.element) {

                this.element.remove();
            }

        }, 400);


        if (
            typeof enemyKilled ===
            "function"
        ) {

            enemyKilled(this);
        }
    }
}


/* ======================================================
   DEFENSE BASE
====================================================== */

class DefenseBuilding {

    constructor(type) {

        this.type =
            type;

        this.level =
            1;

        this.damage =
            20;

        this.range =
            250;

        this.attackSpeed =
            1000;

        this.cooldown =
            0;

        this.element =
            null;

        this.setupStats();
    }


    setupStats() {

        if (
            this.type ===
            "archer"
        ) {

            this.damage =
                25;

            this.range =
                280;

            this.attackSpeed =
                850;
        }


        if (
            this.type ===
            "cannon"
        ) {

            this.damage =
                65;

            this.range =
                340;

            this.attackSpeed =
                2200;
        }
    }


    update(delta) {

        this.cooldown -=
            delta;


        if (
            this.cooldown <= 0
        ) {

            const target =
                this.findTarget();


            if (target) {

                this.attack(
                    target
                );

                this.cooldown =
                    this.attackSpeed;
            }
        }
    }


    /* ==================================================
       TARGETING
    ================================================== */

    findTarget() {

        if (
            typeof enemies ===
            "undefined"
        ) {

            return null;
        }


        let best =
            null;

        let bestDistance =
            Infinity;


        for (
            const enemy of enemies
        ) {

            if (
                !enemy ||
                !enemy.alive
            ) {

                continue;
            }


            const distance =
                this.getDistance(
                    enemy
                );


            if (
                distance <=
                this.range &&
                distance <
                bestDistance
            ) {

                best =
                    enemy;

                bestDistance =
                    distance;
            }
        }


        return best;
    }


    /* ==================================================
       DISTANCE
    ================================================== */

    getDistance(enemy) {

        if (!this.element)
            return Infinity;


        const buildingRect =
            this.element
                .getBoundingClientRect();


        const enemyRect =
            enemy.element
                .getBoundingClientRect();


        const buildingX =
            buildingRect.left +
            buildingRect.width / 2;


        const buildingY =
            buildingRect.top +
            buildingRect.height / 2;


        const enemyX =
            enemyRect.left +
            enemyRect.width / 2;


        const enemyY =
            enemyRect.top +
            enemyRect.height / 2;


        const dx =
            enemyX -
            buildingX;


        const dy =
            enemyY -
            buildingY;


        return Math.sqrt(
            dx * dx +
            dy * dy
        );
    }


    /* ==================================================
       ATTACK
    ================================================== */

    attack(enemy) {

        if (
            !enemy ||
            !enemy.alive
        ) {

            return;
        }


        const buildingRect =
            this.element
                .getBoundingClientRect();


        const enemyRect =
            enemy.element
                .getBoundingClientRect();


        const worldRect =
            document
                .getElementById("gameWorld")
                .getBoundingClientRect();


        const startX =
            buildingRect.left -
            worldRect.left +
            buildingRect.width / 2;


        const startY =
            buildingRect.top -
            worldRect.top +
            buildingRect.height / 2;


        const targetX =
            enemyRect.left -
            worldRect.left +
            enemyRect.width / 2;


        const targetY =
            enemyRect.top -
            worldRect.top +
            enemyRect.height / 2;


        if (
            this.type ===
            "archer"
        ) {

            animateArcherTower();


            shootArrow(
                startX,
                startY,
                targetX,
                targetY,
                this.damage,
                () => {

                    if (
                        enemy.alive
                    ) {

                        enemy.takeDamage(
                            this.damage
                        );
                    }
                }
            );
        }


        if (
            this.type ===
            "cannon"
        ) {

            animateCannon();


            muzzleFlash(
                startX,
                startY
            );


            shootCannonball(
                startX,
                startY,
                targetX,
                targetY,
                this.damage,
                80,
                () => {

                    this.areaDamage(
                        enemy
                    );
                }
            );
        }
    }


    /* ==================================================
       CANNON AREA DAMAGE
    ================================================== */

    areaDamage(
        primaryTarget
    ) {

        if (
            typeof enemies ===
            "undefined"
        ) {

            return;
        }


        const radius =
            85;


        for (
            const enemy of enemies
        ) {

            if (
                !enemy ||
                !enemy.alive
            ) {

                continue;
            }


            const distance =
                this.getDistance(
                    enemy
                );


            if (
                distance <=
                radius
            ) {

                const falloff =
                    enemy ===
                    primaryTarget
                        ? 1
                        : .55;


                enemy.takeDamage(
                    this.damage *
                    falloff
                );
            }
        }
    }


    /* ==================================================
       UPGRADE
    ================================================== */

    upgrade() {

        this.level++;


        this.damage *=
            1.25;


        this.range +=
            25;


        this.attackSpeed *=
            .9;


        const levelText =
            this.element
                ?.querySelector(
                    ".building-level"
                );


        if (levelText) {

            levelText.textContent =
                `LV ${this.level}`;
        }
    }
}


/* ======================================================
   ARCHER TOWER
====================================================== */

class ArcherTower
    extends DefenseBuilding {

    constructor() {

        super("archer");


        this.element =
            document.getElementById(
                "archerTower"
            );
    }
}


/* ======================================================
   CANNON
====================================================== */

class Cannon
    extends DefenseBuilding {

    constructor() {

        super("cannon");


        this.element =
            document.getElementById(
                "cannonTower"
            );
    }
}


/* ======================================================
   GLOBAL DEFENSE INSTANCES
====================================================== */

let archerTower =
    null;

let cannon =
    null;


/* ======================================================
   INITIALIZE DEFENSE
====================================================== */

function initializeDefenses() {

    archerTower =
        new ArcherTower();


    cannon =
        new Cannon();
}


/* ======================================================
   UPDATE DEFENSES
====================================================== */

function updateDefenses(
    delta
) {

    if (archerTower) {

        archerTower.update(
            delta
        );
    }


    if (cannon) {

        cannon.update(
            delta
        );
    }
}


/* ======================================================
   BUILD DEFENSE
====================================================== */

function buildArcherTower() {

    if (
        archerTower
    ) {

        return false;
    }


    archerTower =
        new ArcherTower();


    return true;
}


function buildCannon() {

    if (
        cannon
    ) {

        return false;
    }


    cannon =
        new Cannon();


    return true;
}


/* ======================================================
   UPGRADE SELECTED DEFENSE
====================================================== */

function upgradeDefense(
    type
) {

    if (
        type ===
        "archer" &&
        archerTower
    ) {

        archerTower.upgrade();

        return;
    }


    if (
        type ===
        "cannon" &&
        cannon
    ) {

        cannon.upgrade();
    }
}
