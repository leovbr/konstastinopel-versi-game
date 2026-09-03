/* =========================================================
   SIEGE OF CONSTANTINOPLE V2
   UNITS SYSTEM
   ========================================================= */

(function () {
    "use strict";

    // =====================================================
    // GLOBAL ARRAYS
    // =====================================================

    window.enemies = [];
    window.defenses = [];

    let enemyId = 0;
    let defenseId = 0;


    // =====================================================
    // HELPERS
    // =====================================================

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function getWorld() {
        return document.getElementById("gameWorld");
    }

    function getBattlefield() {
        return document.getElementById("battlefield");
    }

    function getDefenseLayer() {
        return document.getElementById("defenseLayer");
    }

    function worldWidth() {
        const world = getWorld();
        return world ? world.clientWidth : window.innerWidth;
    }

    function worldHeight() {
        const world = getWorld();
        return world ? world.clientHeight : window.innerHeight;
    }


    // =====================================================
    // ENEMY
    // =====================================================

    class Enemy {

        constructor(type, wave) {

            this.id = ++enemyId;

            this.type = type;
            this.wave = wave;

            this.alive = true;
            this.attacking = false;
            this.attackTimer = 0;

            // ---------------------------------------------
            // BASE STATS
            // ---------------------------------------------

            const stats = {

                soldier: {
                    hp: 100,
                    speed: 0.045,
                    damage: 12,
                    attackSpeed: 1200,
                    range: 4.5,
                    reward: 15,
                    score: 100
                },

                archer: {
                    hp: 70,
                    speed: 0.030,
                    damage: 8,
                    attackSpeed: 1500,
                    range: 16,
                    reward: 22,
                    score: 150
                },

                janissary: {
                    hp: 180,
                    speed: 0.038,
                    damage: 20,
                    attackSpeed: 1100,
                    range: 5.5,
                    reward: 35,
                    score: 250
                },

                commander: {
                    hp: 650,
                    speed: 0.022,
                    damage: 35,
                    attackSpeed: 1000,
                    range: 7,
                    reward: 150,
                    score: 1000
                }

            };

            const base = stats[type] || stats.soldier;

            // ---------------------------------------------
            // WAVE SCALING
            // ---------------------------------------------

            const hpMultiplier =
                1 + Math.max(0, wave - 1) * 0.08;

            const damageMultiplier =
                1 + Math.max(0, wave - 1) * 0.06;

            const speedMultiplier =
                1 + Math.max(0, wave - 1) * 0.01;

            this.maxHP = Math.round(base.hp * hpMultiplier);
            this.hp = this.maxHP;

            this.damage =
                Math.round(base.damage * damageMultiplier);

            this.speed =
                base.speed * speedMultiplier;

            this.attackSpeed = base.attackSpeed;
            this.range = base.range;

            this.reward = base.reward;
            this.score = base.score;

            // ---------------------------------------------
            // POSITION
            // ---------------------------------------------

            this.x = 96 + Math.random() * 5;
            this.y = 57 + Math.random() * 10;

            // ---------------------------------------------
            // DOM
            // ---------------------------------------------

            this.element = document.createElement("div");

            this.element.className =
                `enemy enemy-${this.type}`;

            this.element.dataset.enemyId = this.id;

            this.element.innerHTML = `
                <div class="enemy-body">
                    <div class="enemy-head"></div>
                    <div class="enemy-weapon"></div>
                </div>

                <div class="enemy-hp">
                    <div class="enemy-hp-fill"></div>
                </div>

                <div class="enemy-name">
                    ${this.type.toUpperCase()}
                </div>
            `;

            const battlefield = getBattlefield();

            if (battlefield) {
                battlefield.appendChild(this.element);
            }

            this.hpBar =
                this.element.querySelector(".enemy-hp-fill");

            this.render();
        }


        // =================================================
        // RENDER
        // =================================================

        render() {

            if (!this.element) return;

            this.element.style.left = `${this.x}%`;
            this.element.style.top = `${this.y}%`;

            if (this.hpBar) {

                const hpPercent =
                    clamp(
                        (this.hp / this.maxHP) * 100,
                        0,
                        100
                    );

                this.hpBar.style.width =
                    `${hpPercent}%`;
            }
        }


        // =================================================
        // UPDATE
        // =================================================

        update(deltaTime) {

            if (!this.alive) return;

            // ---------------------------------------------
            // CASTLE POSITION
            // ---------------------------------------------

            const castleX = 15;

            const distance =
                this.x - castleX;

            // ---------------------------------------------
            // ATTACK CASTLE
            // ---------------------------------------------

            if (distance <= this.range) {

                this.attackCastle(deltaTime);

                return;
            }

            // ---------------------------------------------
            // MOVE
            // ---------------------------------------------

            this.attacking = false;

            this.x -=
                this.speed * deltaTime;

            this.x = Math.max(
                castleX,
                this.x
            );

            this.render();
        }


        // =================================================
        // ATTACK CASTLE
        // =================================================

        attackCastle(deltaTime) {

            this.attacking = true;

            this.attackTimer += deltaTime;

            if (
                this.attackTimer >=
                this.attackSpeed
            ) {

                this.attackTimer = 0;

                if (
                    window.Game &&
                    typeof window.Game.damageCity === "function"
                ) {

                    window.Game.damageCity(
                        this.damage
                    );
                }

                if (
                    window.Effects &&
                    typeof window.Effects.buildingHit === "function"
                ) {

                    window.Effects.buildingHit(
                        this.x,
                        this.y
                    );
                }
            }

            this.render();
        }


        // =================================================
        // DAMAGE
        // =================================================

        takeDamage(amount) {

            if (!this.alive) return;

            amount = Math.max(
                0,
                Number(amount) || 0
            );

            this.hp -= amount;

            this.hp = Math.max(
                0,
                this.hp
            );

            this.render();

            // ---------------------------------------------
            // DAMAGE EFFECT
            // ---------------------------------------------

            if (
                window.Effects &&
                typeof window.Effects.showDamage === "function"
            ) {

                window.Effects.showDamage(
                    this.x,
                    this.y,
                    Math.round(amount)
                );
            }

            if (this.hp <= 0) {
                this.die();
            }
        }


        // =================================================
        // DEATH
        // =================================================

        die() {

            if (!this.alive) return;

            this.alive = false;

            // ---------------------------------------------
            // EFFECT
            // ---------------------------------------------

            if (
                window.Effects &&
                typeof window.Effects.enemyDeathEffect === "function"
            ) {

                window.Effects.enemyDeathEffect(
                    this.x,
                    this.y,
                    this.type
                );

            } else if (
                window.Effects &&
                typeof window.Effects.createDeathEffect === "function"
            ) {

                const px =
                    worldWidth() *
                    (this.x / 100);

                const py =
                    worldHeight() *
                    (this.y / 100);

                window.Effects.createDeathEffect(
                    px,
                    py,
                    this.type
                );
            }

            // ---------------------------------------------
            // GAME REWARD
            // ---------------------------------------------

            if (
                window.Game &&
                typeof window.Game.addGold === "function"
            ) {

                window.Game.addGold(
                    this.reward
                );
            }

            if (
                window.Game &&
                typeof window.Game.addKill === "function"
            ) {

                window.Game.addKill(
                    this.score
                );
            }

            // ---------------------------------------------
            // REMOVE DOM
            // ---------------------------------------------

            if (this.element) {

                this.element.classList.add(
                    "enemy-dead"
                );

                setTimeout(() => {

                    if (this.element) {
                        this.element.remove();
                    }

                }, 300);
            }

            // ---------------------------------------------
            // REMOVE FROM ARRAY
            // ---------------------------------------------

            setTimeout(() => {

                const index =
                    window.enemies.indexOf(this);

                if (index !== -1) {
                    window.enemies.splice(
                        index,
                        1
                    );
                }

            }, 350);
        }
    }


    // =====================================================
    // DEFENSE BUILDING
    // =====================================================

    class DefenseBuilding {

        constructor(type, options = {}) {

            this.id = ++defenseId;

            this.type = type;

            this.level = 1;

            this.cooldown = 0;

            this.built = true;

            // ---------------------------------------------
            // STATS
            // ---------------------------------------------

            if (type === "archer") {

                this.damage = 25;
                this.range = 30;
                this.attackSpeed = 850;

            } else {

                this.damage = 65;
                this.range = 36;
                this.attackSpeed = 2200;
            }

            // ---------------------------------------------
            // POSITION
            // ---------------------------------------------

            this.x =
                options.x !== undefined
                    ? options.x
                    : type === "archer"
                        ? 28
                        : 21;

            this.y =
                options.y !== undefined
                    ? options.y
                    : type === "archer"
                        ? 55
                        : 73;

            this.element =
                options.element || null;

            // ---------------------------------------------
            // CREATE DYNAMIC BUILDING
            // ---------------------------------------------

            if (!this.element) {
                this.createElement();
            }

            this.updateLevelUI();
        }


        // =================================================
        // CREATE ELEMENT
        // =================================================

        createElement() {

            const layer =
                getDefenseLayer();

            if (!layer) return;

            const wrapper =
                document.createElement("div");

            wrapper.className =
                `defense-building ${
                    this.type === "archer"
                        ? "archer-tower"
                        : "cannon-tower"
                } dynamic-defense`;

            wrapper.dataset.defenseId =
                this.id;

            if (this.type === "archer") {

                wrapper.innerHTML = `
                    <div class="tower-wood-base"></div>

                    <div class="archer-platform">
                        <div class="archer-character">
                            <div class="archer-head"></div>
                            <div class="archer-body"></div>
                            <div class="archer-bow"></div>
                            <div class="archer-arm"></div>
                        </div>
                    </div>

                    <div class="tower-ladder"></div>

                    <div class="building-level">
                        LV 1
                    </div>
                `;

            } else {

                wrapper.innerHTML = `
                    <div class="cannon-base">

                        <div class="cannon-wheel left"></div>
                        <div class="cannon-wheel right"></div>

                        <div class="cannon-body">
                            <div class="cannon-barrel"></div>
                            <div class="cannon-muzzle"></div>
                        </div>

                    </div>

                    <div class="building-level">
                        LV 1
                    </div>
                `;
            }

            layer.appendChild(wrapper);

            this.element = wrapper;

            this.positionElement();
        }


        // =================================================
        // POSITION ELEMENT
        // =================================================

        positionElement() {

            if (!this.element) return;

            this.element.style.left =
                `${this.x}%`;

            this.element.style.top =
                `${this.y}%`;
        }


        // =================================================
        // UPDATE
        // =================================================

        update(deltaTime) {

            if (!this.built) return;

            this.cooldown -= deltaTime;

            if (this.cooldown > 0) {
                return;
            }

            const target =
                this.findTarget();

            if (!target) {
                return;
            }

            this.attack(target);

            this.cooldown =
                this.attackSpeed;
        }


        // =================================================
        // FIND TARGET
        // =================================================

        findTarget() {

            let bestTarget = null;
            let bestDistance = Infinity;

            for (const enemy of window.enemies) {

                if (
                    !enemy ||
                    !enemy.alive
                ) {
                    continue;
                }

                const dx =
                    enemy.x - this.x;

                const dy =
                    enemy.y - this.y;

                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );

                if (
                    distance <= this.range &&
                    distance < bestDistance
                ) {

                    bestDistance =
                        distance;

                    bestTarget =
                        enemy;
                }
            }

            return bestTarget;
        }


        // =================================================
        // ATTACK
        // =================================================

        attack(target) {

            if (!target || !target.alive) {
                return;
            }

            // ---------------------------------------------
            // ARCHER
            // ---------------------------------------------

            if (this.type === "archer") {

                const damage =
                    this.damage;

                if (
                    window.Effects &&
                    typeof window.Effects.animateArcherTower === "function"
                ) {

                    window.Effects.animateArcherTower(
                        this.element
                    );
                }

                if (
                    window.Effects &&
                    typeof window.Effects.fireArrow === "function"
                ) {

                    window.Effects.fireArrow(
                        this.x,
                        this.y,
                        target.x,
                        target.y,
                        () => {

                            if (target.alive) {
                                target.takeDamage(
                                    damage
                                );
                            }
                        }
                    );

                } else {

                    target.takeDamage(
                        damage
                    );
                }

                return;
            }


            // ---------------------------------------------
            // CANNON
            // ---------------------------------------------

            if (this.type === "cannon") {

                const damage =
                    this.damage;

                if (
                    window.Effects &&
                    typeof window.Effects.animateCannon === "function"
                ) {

                    window.Effects.animateCannon(
                        this.element
                    );
                }

                if (
                    window.Effects &&
                    typeof window.Effects.fireCannonball === "function"
                ) {

                    window.Effects.fireCannonball(
                        this.x,
                        this.y,
                        target.x,
                        target.y,
                        () => {

                            this.areaDamage(
                                target,
                                damage
                            );
                        }
                    );

                } else {

                    this.areaDamage(
                        target,
                        damage
                    );
                }
            }
        }


        // =================================================
        // CANNON AREA DAMAGE
        // =================================================

        areaDamage(
            primaryTarget,
            damage
        ) {

            if (
                !primaryTarget ||
                !primaryTarget.alive
            ) {
                return;
            }

            const radius = 8;

            for (const enemy of window.enemies) {

                if (
                    !enemy ||
                    !enemy.alive
                ) {
                    continue;
                }

                const dx =
                    enemy.x -
                    primaryTarget.x;

                const dy =
                    enemy.y -
                    primaryTarget.y;

                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );

                if (distance <= radius) {

                    const multiplier =
                        enemy === primaryTarget
                            ? 1
                            : 0.55;

                    enemy.takeDamage(
                        Math.round(
                            damage *
                            multiplier
                        )
                    );
                }
            }

            if (
                window.Effects &&
                typeof window.Effects.createExplosion === "function"
            ) {

                window.Effects.createExplosion(
                    primaryTarget.x,
                    primaryTarget.y
                );
            }
        }


        // =================================================
        // UPGRADE
        // =================================================

        upgrade() {

            this.level++;

            this.damage =
                Math.round(
                    this.damage * 1.25
                );

            this.range += 2.5;

            this.attackSpeed =
                Math.max(
                    250,
                    this.attackSpeed * 0.9
                );

            this.updateLevelUI();

            // ---------------------------------------------
            // UPGRADE EFFECT
            // ---------------------------------------------

            if (
                window.Effects &&
                typeof window.Effects.createParticle === "function"
            ) {

                window.Effects.createParticle(
                    this.x,
                    this.y,
                    "upgrade"
                );
            }
        }


        // =================================================
        // LEVEL UI
        // =================================================

        updateLevelUI() {

            if (!this.element) return;

            const level =
                this.element.querySelector(
                    ".building-level"
                );

            if (level) {

                level.textContent =
                    `LV ${this.level}`;
            }
        }


        // =================================================
        // REMOVE
        // =================================================

        destroy() {

            this.built = false;

            if (this.element) {
                this.element.remove();
            }

            const index =
                window.defenses.indexOf(this);

            if (index !== -1) {
                window.defenses.splice(
                    index,
                    1
                );
            }
        }
    }


    // =====================================================
    // CREATE DEFAULT DEFENSES
    // =====================================================

    function createDefaultDefenses() {

        clearDefenses();

        const archerElement =
            document.getElementById(
                "archerTower"
            );

        const cannonElement =
            document.getElementById(
                "cannonTower"
            );


        // ---------------------------------------------
        // DEFAULT ARCHER
        // ---------------------------------------------

        const archer =
            new DefenseBuilding(
                "archer",
                {
                    element: archerElement,
                    x: 28,
                    y: 55
                }
            );


        // ---------------------------------------------
        // DEFAULT CANNON
        // ---------------------------------------------

        const cannon =
            new DefenseBuilding(
                "cannon",
                {
                    element: cannonElement,
                    x: 21,
                    y: 73
                }
            );


        window.defenses.push(
            archer,
            cannon
        );

        return window.defenses;
    }


    // =====================================================
    // BUY ARCHER
    // =====================================================

    function createArcher() {

        const archer =
            new DefenseBuilding(
                "archer",
                {
                    x:
                        27 +
                        (window.defenses.length % 3) * 6,

                    y:
                        48 +
                        (window.defenses.length % 2) * 8
                }
            );

        window.defenses.push(
            archer
        );

        return archer;
    }


    // =====================================================
    // BUY CANNON
    // =====================================================

    function createCannon() {

        const cannon =
            new DefenseBuilding(
                "cannon",
                {
                    x:
                        18 +
                        (window.defenses.length % 3) * 7,

                    y:
                        68 +
                        (window.defenses.length % 2) * 6
                }
            );

        window.defenses.push(
            cannon
        );

        return cannon;
    }


    // =====================================================
    // UPDATE ALL UNITS
    // =====================================================

    function updateUnits(deltaTime) {

        // ---------------------------------------------
        // DEFENSES
        // ---------------------------------------------

        for (const defense of window.defenses) {

            if (defense) {
                defense.update(
                    deltaTime
                );
            }
        }


        // ---------------------------------------------
        // ENEMIES
        // ---------------------------------------------

        for (const enemy of [...window.enemies]) {

            if (
                enemy &&
                enemy.alive
            ) {

                enemy.update(
                    deltaTime
                );
            }
        }
    }


    // =====================================================
    // CLEAR ENEMIES
    // =====================================================

    function clearEnemies() {

        for (const enemy of window.enemies) {

            if (enemy.element) {
                enemy.element.remove();
            }
        }

        window.enemies.length = 0;
    }


    // =====================================================
    // CLEAR DEFENSES
    // =====================================================

    function clearDefenses() {

        for (const defense of window.defenses) {

            if (
                defense.element &&
                defense.element.classList.contains(
                    "dynamic-defense"
                )
            ) {

                defense.element.remove();
            }
        }

        window.defenses.length = 0;


        // Restore static buildings if they exist
        const archer =
            document.getElementById(
                "archerTower"
            );

        const cannon =
            document.getElementById(
                "cannonTower"
            );

        if (archer) {
            archer.style.display =
                "block";
        }

        if (cannon) {
            cannon.style.display =
                "block";
        }
    }


    // =====================================================
    // CLEAR EVERYTHING
    // =====================================================

    function clearUnits() {

        clearEnemies();
        clearDefenses();
    }


    // =====================================================
    // SPAWN ENEMY
    // =====================================================

    function spawnEnemy(
        type,
        wave
    ) {

        const enemy =
            new Enemy(
                type,
                wave
            );

        window.enemies.push(
            enemy
        );

        return enemy;
    }


    // =====================================================
    // EXPORT API
    // =====================================================

    window.Enemy =
        Enemy;

    window.DefenseBuilding =
        DefenseBuilding;

    window.ArcherTower =
        DefenseBuilding;

    window.Cannon =
        DefenseBuilding;


    window.Units = {

        Enemy,

        DefenseBuilding,

        ArcherTower:
            DefenseBuilding,

        Cannon:
            DefenseBuilding,

        createDefaultDefenses,

        createArcher,

        createCannon,

        spawnEnemy,

        updateUnits,

        clearEnemies,

        clearDefenses,

        clearUnits,

        get enemies() {
            return window.enemies;
        },

        get defenses() {
            return window.defenses;
        }
    };

})();
