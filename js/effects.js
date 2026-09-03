(function () {
    "use strict";

    const projectileLayer = document.getElementById("projectileLayer");
    const particleLayer = document.getElementById("particleLayer");
    const damageLayer = document.getElementById("damageLayer");
    const gameWorld = document.getElementById("gameWorld");

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function getWorldSize() {
        return {
            width: gameWorld
                ? gameWorld.clientWidth
                : window.innerWidth,

            height: gameWorld
                ? gameWorld.clientHeight
                : window.innerHeight
        };
    }

    function percentToPixels(x, y) {
        const size = getWorldSize();

        return {
            x: (x / 100) * size.width,
            y: (y / 100) * size.height
        };
    }

    // =====================================================
    // PROJECTILE
    // =====================================================

    function createProjectile(
        className,
        startX,
        startY,
        endX,
        endY,
        duration,
        callback
    ) {
        if (!projectileLayer) {
            if (callback) callback();
            return;
        }

        const start = percentToPixels(startX, startY);
        const end = percentToPixels(endX, endY);

        const projectile =
            document.createElement("div");

        projectile.className =
            `projectile ${className}`;

        projectile.style.left =
            `${start.x}px`;

        projectile.style.top =
            `${start.y}px`;

        const dx =
            end.x - start.x;

        const dy =
            end.y - start.y;

        const angle =
            Math.atan2(dy, dx) *
            180 /
            Math.PI;

        projectile.style.transform =
            `rotate(${angle}deg)`;

        projectileLayer.appendChild(
            projectile
        );

        const startTime =
            performance.now();

        function animate(now) {

            const progress =
                clamp(
                    (now - startTime) /
                    duration,
                    0,
                    1
                );

            const x =
                start.x +
                (end.x - start.x) *
                progress;

            const y =
                start.y +
                (end.y - start.y) *
                progress;

            projectile.style.left =
                `${x}px`;

            projectile.style.top =
                `${y}px`;

            if (progress < 1) {

                requestAnimationFrame(
                    animate
                );

            } else {

                projectile.remove();

                if (callback) {
                    callback();
                }
            }
        }

        requestAnimationFrame(
            animate
        );
    }

    function fireArrow(
        startX,
        startY,
        endX,
        endY,
        callback
    ) {
        createProjectile(
            "arrow-projectile",
            startX,
            startY,
            endX,
            endY,
            260,
            callback
        );
    }

    function fireCannonball(
        startX,
        startY,
        endX,
        endY,
        callback
    ) {
        createProjectile(
            "cannonball-projectile",
            startX,
            startY,
            endX,
            endY,
            420,
            callback
        );
    }

    // =====================================================
    // HIT EFFECT
    // =====================================================

    function createHitEffect(
        x,
        y
    ) {
        const pos =
            percentToPixels(x, y);

        const hit =
            document.createElement("div");

        hit.className =
            "hit-effect";

        hit.style.left =
            `${pos.x}px`;

        hit.style.top =
            `${pos.y}px`;

        if (particleLayer) {
            particleLayer.appendChild(
                hit
            );
        }

        setTimeout(() => {
            hit.remove();
        }, 350);
    }

    // =====================================================
    // EXPLOSION
    // =====================================================

    function createExplosion(
        x,
        y
    ) {
        const pos =
            percentToPixels(x, y);

        const explosion =
            document.createElement("div");

        explosion.className =
            "explosion";

        explosion.style.left =
            `${pos.x}px`;

        explosion.style.top =
            `${pos.y}px`;

        if (particleLayer) {
            particleLayer.appendChild(
                explosion
            );
        }

        for (let i = 0; i < 10; i++) {

            createParticle(
                x + random(-2, 2),
                y + random(-2, 2),
                "fire"
            );
        }

        setTimeout(() => {
            explosion.remove();
        }, 600);
    }

    // =====================================================
    // PARTICLES
    // =====================================================

    function createParticle(
        x,
        y,
        type = "normal"
    ) {
        if (!particleLayer) return;

        const pos =
            percentToPixels(x, y);

        const particle =
            document.createElement("div");

        particle.className =
            `particle particle-${type}`;

        particle.style.left =
            `${pos.x}px`;

        particle.style.top =
            `${pos.y}px`;

        particle.style.setProperty(
            "--px",
            `${random(-45, 45)}px`
        );

        particle.style.setProperty(
            "--py",
            `${random(-60, 20)}px`
        );

        particleLayer.appendChild(
            particle
        );

        setTimeout(() => {
            particle.remove();
        }, 900);
    }

    // =====================================================
    // DAMAGE NUMBER
    // =====================================================

    function showDamage(
        x,
        y,
        damage
    ) {
        if (!damageLayer) return;

        const pos =
            percentToPixels(x, y);

        const number =
            document.createElement("div");

        number.className =
            "damage-number";

        number.textContent =
            `-${Math.round(damage)}`;

        number.style.left =
            `${pos.x}px`;

        number.style.top =
            `${pos.y}px`;

        damageLayer.appendChild(
            number
        );

        createHitEffect(
            x,
            y
        );

        setTimeout(() => {
            number.remove();
        }, 750);
    }

    // =====================================================
    // FIRE RAIN
    // =====================================================

    function fireRain() {

        if (!gameWorld) return;

        for (let i = 0; i < 28; i++) {

            const x =
                random(5, 95);

            const y =
                random(5, 65);

            const pos =
                percentToPixels(x, y);

            const fire =
                document.createElement("div");

            fire.className =
                "fire-rain-particle";

            fire.style.left =
                `${pos.x}px`;

            fire.style.top =
                `${pos.y}px`;

            fire.style.animationDelay =
                `${random(0, 500)}ms`;

            if (particleLayer) {
                particleLayer.appendChild(
                    fire
                );
            }

            setTimeout(() => {
                fire.remove();
            }, 1500);
        }

        screenShake(650);
    }

    function fireRainEffect() {
        fireRain();
    }

    // =====================================================
    // TOWER ANIMATION
    // =====================================================

    function animateArcherTower(
        element
    ) {
        if (!element) return;

        element.classList.remove(
            "tower-attacking"
        );

        void element.offsetWidth;

        element.classList.add(
            "tower-attacking"
        );

        setTimeout(() => {
            element.classList.remove(
                "tower-attacking"
            );
        }, 500);
    }

    function animateCannon(
        element
    ) {
        if (!element) return;

        element.classList.remove(
            "cannon-firing"
        );

        void element.offsetWidth;

        element.classList.add(
            "cannon-firing"
        );

        const rect =
            element.getBoundingClientRect();

        const worldRect =
            gameWorld
                ? gameWorld.getBoundingClientRect()
                : { left: 0, top: 0 };

        muzzleFlash(
            rect.left -
                worldRect.left +
                rect.width * 0.55,

            rect.top -
                worldRect.top +
                rect.height * 0.35
        );

        setTimeout(() => {
            element.classList.remove(
                "cannon-firing"
            );
        }, 500);
    }

    // =====================================================
    // MUZZLE FLASH
    // =====================================================

    function muzzleFlash(
        x,
        y
    ) {
        if (!particleLayer) return;

        const flash =
            document.createElement("div");

        flash.className =
            "muzzle-flash";

        flash.style.left =
            `${x}px`;

        flash.style.top =
            `${y}px`;

        particleLayer.appendChild(
            flash
        );

        setTimeout(() => {
            flash.remove();
        }, 180);
    }

    // =====================================================
    // BUILDING HIT
    // =====================================================

    function buildingHit(
        x,
        y
    ) {
        createHitEffect(
            x,
            y
        );

        for (let i = 0; i < 5; i++) {

            createParticle(
                x + random(-1.5, 1.5),
                y + random(-1.5, 1.5),
                "smoke"
            );
        }

        screenShake(220);
    }

    // =====================================================
    // ENEMY DEATH
    // =====================================================

    function enemyDeathEffect(
        x,
        y,
        type
    ) {
        createExplosion(
            x,
            y
        );

        for (let i = 0; i < 7; i++) {

            createParticle(
                x + random(-2, 2),
                y + random(-2, 2),
                type === "commander"
                    ? "gold"
                    : "normal"
            );
        }

        if (type === "commander") {
            screenShake(500);
        }
    }

    // =====================================================
    // GOLD EFFECT
    // =====================================================

    function goldEffect(
        x,
        y,
        amount
    ) {
        if (!damageLayer) return;

        const pos =
            percentToPixels(x, y);

        const gold =
            document.createElement("div");

        gold.className =
            "gold-number";

        gold.textContent =
            `+${amount}G`;

        gold.style.left =
            `${pos.x}px`;

        gold.style.top =
            `${pos.y}px`;

        damageLayer.appendChild(
            gold
        );

        setTimeout(() => {
            gold.remove();
        }, 800);
    }

    // =====================================================
    // SELECT BUILDING
    // =====================================================

    function selectBuilding(
        element
    ) {
        document
            .querySelectorAll(
                ".defense-building"
            )
            .forEach(building => {
                building.classList.remove(
                    "selected"
                );
            });

        if (element) {
            element.classList.add(
                "selected"
            );
        }
    }

    // =====================================================
    // SCREEN SHAKE
    // =====================================================

    function screenShake(
        duration = 300
    ) {
        if (!gameWorld) return;

        gameWorld.classList.remove(
            "screen-shake"
        );

        void gameWorld.offsetWidth;

        gameWorld.classList.add(
            "screen-shake"
        );

        setTimeout(() => {
            gameWorld.classList.remove(
                "screen-shake"
            );
        }, duration);
    }

    // =====================================================
    // CLEAR
    // =====================================================

    function clearEffects() {

        [
            projectileLayer,
            particleLayer,
            damageLayer
        ].forEach(layer => {

            if (layer) {
                layer.innerHTML = "";
            }
        });

        if (gameWorld) {
            gameWorld.classList.remove(
                "screen-shake"
            );
        }
    }

    // =====================================================
    // EXPORT
    // =====================================================

    window.Effects = {

        createProjectile,

        fireArrow,
        fireCannonball,

        createHitEffect,
        createExplosion,

        createParticle,
        showDamage,

        fireRain,
        fireRainEffect,

        animateArcherTower,
        animateCannon,

        muzzleFlash,

        buildingHit,
        enemyDeathEffect,
        createDeathEffect:
            enemyDeathEffect,

        goldEffect,

        selectBuilding,

        screenShake,

        clearEffects
    };

})();
