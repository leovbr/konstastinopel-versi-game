/* =========================================================
   SIEGE OF CONSTANTINOPLE
   UNITS & DEFENSE SYSTEM
   ========================================================= */

let enemyIdCounter = 0;


// =========================================================
// ENEMY
// =========================================================

class Enemy {

    constructor(type = "soldier", wave = 1) {

        this.id = ++enemyIdCounter;
        this.type = type;
        this.wave = wave;

        const stats = {

            soldier: {
                hp: 100,
                speed: 0.055,
                damage: 12,
                attackSpeed: 1200,
                range: 48,
                reward: 15
            },

            archer: {
                hp: 70,
                speed: 0.035,
                damage: 8,
                attackSpeed: 1500,
                range: 160,
                reward: 22
            },

            janissary: {
                hp: 180,
                speed: 0.045,
                damage: 20,
                attackSpeed: 1100,
                range: 55,
                reward: 35
            },

            commander: {
                hp: 650,
                speed: 0.025,
                damage: 35,
                attackSpeed: 1000,
                range: 70,
                reward: 150
            }
        };

        const base =
            stats[type] || stats.soldier;


        // Difficulty scaling
        let multiplier = {
            hp: 1,
            damage: 1,
            speed: 1
        };

        if (
            typeof getDifficultyMultiplier ===
            "function"
        ) {
            multiplier =
                getDifficultyMultiplier(wave);
        }


        this.maxHp =
            Math.round(
                base.hp *
                multiplier.hp
            );

        this.hp = this.maxHp;

        this.speed =
            base.speed *
            multiplier.speed;

        this.damage =
            Math.round(
                base.damage *
                multiplier.damage
            );

        this.attackSpeed =
            base.attackSpeed;

        this.range =
            base.range;

        this.reward =
            base.reward +
            Math.floor(wave * 2);


        // Position
        this.x =
            100 +
            Math.random() * 5;

        this.y =
            58 +
            Math.random() * 10;


        this.attackCooldown = 0;

        this.dead = false;

        this.element =
            this.createElement();


        this.updatePosition();
    }


    // =====================================================
    // CREATE DOM
    // =====================================================

    createElement() {

        const el =
            document.createElement("div");

        el.className =
            `enemy enemy-${this.type}`;

        el.dataset.id =
            this.id;

        el.innerHTML = `

            <div class="enemy-shadow"></div>

            <div class="enemy-body">

                <div class="enemy-head"></div>

                <div class="enemy-torso"></div>

                <div class="enemy-weapon"></div>

            </div>

            <div class="enemy-hp">

                <div class="enemy-hp-fill"></div>

            </div>

        `;


        const battlefield =
            document.getElementById(
                "battlefield"
            );

        if (battlefield) {
            battlefield.appendChild(el);
        }


        return el;
    }


    // =====================================================
    // UPDATE
    // =====================================================

    update(delta) {

        if (this.dead) {
            return;
        }


        this.attackCooldown -= delta;


        const castleX = 12;


        /*
            Musuh spawn dari kanan
            lalu bergerak ke kiri
        */

        if (this.x > castleX) {

            this.x -=
                this.speed *
                delta;

            this.updatePosition();

            return;
        }


        // Sudah sampai castle
        if (
            this.attackCooldown <= 0
        ) {

            this.attackCastle();

            this.attackCooldown =
                this.attackSpeed;
        }
    }


    // =====================================================
    // POSITION
    // =====================================================

    updatePosition() {

        if (!this.element) {
            return;
        }

        this.element.style.left =
            `${this.x}%`;

        this.element.style.bottom =
            `${this.y}%`;
    }


    // =====================================================
    // ATTACK CASTLE
    // =====================================================

    attackCastle() {

        if (
            typeof damageCastle ===
            "function"
        ) {

            damageCastle(
                this.damage
            );
        }


        // Visual attack
        if (this.element) {

            this.element.classList.add(
                "enemy-attacking"
            );

            setTimeout(() => {

                if (this.element) {

                    this.element.classList.remove(
                        "enemy-attacking"
                    );
                }

            }, 250);
        }
    }


    // =====================================================
    // TAKE DAMAGE
    // =====================================================

    takeDamage(amount) {

        if (this.dead) {
            return;
        }


        this.hp -= amount;


        // HP bar
        const fill =
            this.element?.querySelector(
                ".enemy-hp-fill"
            );

        if (fill) {

            const percentage =
                Math.max(
                    0,
                    (this.hp /
                        this.maxHp) *
                    100
                );

            fill.style.width =
                `${percentage}%`;
        }


        // Hit flash
        if (this.element) {

            this.element.classList.add(
                "enemy-hit"
            );

            setTimeout(() => {

                this.element?.classList.remove(
                    "enemy-hit"
                );

            }, 120);
        }


        // Damage number
        if (
            typeof showDamage ===
            "function"
        ) {

            showDamage(
                this.x,
                this.y + 10,
                amount
            );
        }


        // Death
        if (this.hp <= 0) {

            this.die();
        }
    }


    // =====================================================
    // DEATH
    // =====================================================

    die() {

        if (this.dead) {
            return;
        }

        this.dead = true;


        if (
            typeof createDeathEffect ===
            "function"
        ) {

            createDeathEffect(
                this.x,
                this.y
            );
        }


        if (
            typeof enemyKilled ===
            "function"
        ) {

            enemyKilled(
                this.reward,
                this
            );
        }


        if (this.element) {

            this.element.classList.add(
                "enemy-dead"
            );


            setTimeout(() => {

                this.element?.remove();

            }, 350);
        }
    }
}


// =========================================================
// DEFENSE BUILDING
// =========================================================

class DefenseBuilding {

    constructor(type) {

        this.type = type;

        const stats = {

            archer: {
                damage: 25,
                range: 280,
                attackSpeed: 850
            },

            cannon: {
                damage: 65,
                range: 340,
                attackSpeed: 2200
            }
        };


        const data =
            stats[type];


        this.damage =
            data.damage;

        this.range =
            data.range;

        this.attackSpeed =
            data.attackSpeed;

        this.cooldown = 0;

        this.level = 1;

        this.element =
            document.getElementById(
                type === "archer"
                    ? "archerTower"
                    : "cannonTower"
            );
    }


    // =====================================================
    // UPDATE
    // =====================================================

    update(delta) {

        if (!this.element) {
            return;
        }


        this.cooldown -= delta;


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


    // =====================================================
    // FIND TARGET
    // =====================================================

    findTarget() {

        if (
            typeof enemies ===
            "undefined"
        ) {

            return null;
        }


        let closest = null;

        let closestDistance =
            Infinity;


        for (
            const enemy of enemies
        ) {

            if (
                !enemy ||
                enemy.dead
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
                    closestDistance
            ) {

                closest =
                    enemy;

                closestDistance =
                    distance;
            }
        }


        return closest;
    }


    // =====================================================
    // DISTANCE
    // =====================================================

    getDistance(enemy) {

        /*
            Tower berada sekitar 15%
            dari battlefield.
        */

        const towerX =
            this.type === "archer"
                ? 16
                : 22;


        return Math.abs(
            enemy.x -
            towerX
        );
    }


    // =====================================================
    // ATTACK
    // =====================================================

    attack(enemy) {

        if (
            !enemy ||
            enemy.dead
        ) {
            return;
        }


        const startX =
            this.type === "archer"
                ? 17
                : 23;

        const startY =
            this.type === "archer"
                ? 78
                : 70;


        const targetX =
            enemy.x;

        const targetY =
            enemy.y + 8;


        // =================================================
        // ARCHER
        // =================================================

        if (
            this.type ===
            "archer"
        ) {

            if (
                typeof animateArcherTower ===
                "function"
            ) {

                animateArcherTower();
            }


            if (
                typeof shootArrow ===
                "function"
            ) {

                shootArrow(
                    startX,
                    startY,
                    targetX,
                    targetY,
                    this.damage,
                    () => {

                        if (
                            !enemy.dead
                        ) {

                            enemy.takeDamage(
                                this.damage
                            );
                        }
                    }
                );
            }
        }


        // =================================================
        // CANNON
        // =================================================

        if (
            this.type ===
            "cannon"
        ) {

            if (
                typeof animateCannon ===
                "function"
            ) {

                animateCannon();
            }


            if (
                typeof muzzleFlash ===
                "function"
            ) {

                muzzleFlash();
            }


            if (
                typeof shootCannonball ===
                "function"
            ) {

                shootCannonball(
                    startX,
                    startY,
                    targetX,
                    targetY,
                    this.damage,
                    85,
                    () => {

                        this.areaDamage(
                            enemy
                        );
                    }
                );
            }
        }
    }


    // =====================================================
    // CANNON AREA DAMAGE
    // =====================================================

    areaDamage(primaryTarget) {

        if (
            typeof enemies ===
            "undefined"
        ) {
            return;
        }


        const radius = 8.5;


        for (
            const enemy of enemies
        ) {

            if (
                !enemy ||
                enemy.dead
            ) {
                continue;
            }


            const distance =
                Math.abs(
                    enemy.x -
                    primaryTarget.x
                );


            if (
                distance <=
                radius
            ) {

                if (
                    enemy ===
                    primaryTarget
                ) {

                    enemy.takeDamage(
                        this.damage
                    );

                } else {

                    enemy.takeDamage(
                        Math.round(
                            this.damage *
                            0.55
                        )
                    );
                }
            }
        }
    }


    // =====================================================
    // UPGRADE
    // =====================================================

    upgrade() {

        this.level++;


        this.damage =
            Math.round(
                this.damage *
                1.25
            );


        this.range += 25;


        this.attackSpeed =
            Math.max(
                350,
                Math.round(
                    this.attackSpeed *
                    0.90
                )
            );


        // Level indicator
        const levelLabel =
            this.element?.querySelector(
                ".tower-level"
            );


        if (levelLabel) {

            levelLabel.textContent =
                `LV ${this.level}`;
        }


        // Upgrade effect
        if (
            typeof createParticle ===
            "function"
        ) {

            for (
                let i = 0;
                i < 10;
                i++
            ) {

                createParticle(
                    this.type ===
                        "archer"
                        ? 16
                        : 22,
                    this.type ===
                        "archer"
                        ? 70
                        : 65,
                    "✨"
                );
            }
        }
    }
}


// =========================================================
// DEFENSE OBJECTS
// =========================================================

class ArcherTower
    extends DefenseBuilding {

    constructor() {

        super("archer");
    }
}


class Cannon
    extends DefenseBuilding {

    constructor() {

        super("cannon");
    }
}


let archerTower = null;

let cannon = null;


// =========================================================
// INITIALIZE DEFENSE
// =========================================================

function initializeDefenses() {

    archerTower =
        new ArcherTower();

    cannon =
        new Cannon();

    console.log(
        "🏹 Archer Tower ready"
    );

    console.log(
        "💣 Cannon ready"
    );
}


// =========================================================
// UPDATE DEFENSES
// =========================================================

function updateDefenses(delta) {

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


// =========================================================
// BUILD ARCHER
// =========================================================

function buildArcherTower() {

    if (!archerTower) {

        archerTower =
            new ArcherTower();

        return true;
    }


    return false;
}


// =========================================================
// BUILD CANNON
// =========================================================

function buildCannon() {

    if (!cannon) {

        cannon =
            new Cannon();

        return true;
    }


    return false;
}


// =========================================================
// UPGRADE DEFENSE
// =========================================================

function upgradeDefense(type) {

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


// =========================================================
// GLOBAL ACCESS
// =========================================================

window.Enemy =
    Enemy;

window.ArcherTower =
    ArcherTower;

window.Cannon =
    Cannon;

window.initializeDefenses =
    initializeDefenses;

window.updateDefenses =
    updateDefenses;

window.buildArcherTower =
    buildArcherTower;

window.buildCannon =
    buildCannon;

window.upgradeDefense =
    upgradeDefense;
