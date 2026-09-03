"use strict";

/*
=========================================================
 SIEGE OF CONSTANTINOPLE V2
 EFFECTS SYSTEM
=========================================================

 Handles:
 - Arrow projectiles
 - Cannonballs
 - Explosions
 - Particles
 - Damage numbers
 - Fire Rain
 - Screen shake
=========================================================
*/


/* ======================================================
   GLOBAL EFFECT LAYERS
====================================================== */

const projectileLayer =
    document.getElementById("projectileLayer");

const particleLayer =
    document.getElementById("particleLayer");

const damageLayer =
    document.getElementById("damageLayer");

const gameWorld =
    document.getElementById("gameWorld");


/* ======================================================
   UTILITY
====================================================== */

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}


function random(min, max) {
    return Math.random() * (max - min) + min;
}


/* ======================================================
   PROJECTILE BASE
====================================================== */

function createProjectile(className, x, y) {

    const projectile =
        document.createElement("div");

    projectile.className =
        `projectile ${className}`;

    projectile.style.left =
        `${x}px`;

    projectile.style.top =
        `${y}px`;

    projectileLayer.appendChild(projectile);

    return projectile;
}


/* ======================================================
   ARROW
====================================================== */

function shootArrow(startX, startY, targetX, targetY, damage, onHit) {

    const arrow =
        createProjectile(
            "arrow",
            startX,
            startY
        );

    const dx = targetX - startX;
    const dy = targetY - startY;

    const distance =
        Math.sqrt(dx * dx + dy * dy);

    const duration =
        clamp(distance * 2.2, 250, 700);

    const angle =
        Math.atan2(dy, dx) *
        180 /
        Math.PI;

    arrow.style.transform =
        `rotate(${angle}deg)`;


    const startTime =
        performance.now();


    function animate(currentTime) {

        const elapsed =
            currentTime - startTime;

        const progress =
            clamp(
                elapsed / duration,
                0,
                1
            );


        /*
        Slight arc so the arrow doesn't fly
        completely flat.
        */

        const arc =
            Math.sin(progress * Math.PI) *
            -35;


        const currentX =
            startX +
            dx * progress;

        const currentY =
            startY +
            dy * progress +
            arc;


        arrow.style.left =
            `${currentX}px`;

        arrow.style.top =
            `${currentY}px`;


        if (progress < 1) {

            requestAnimationFrame(animate);

        } else {

            arrow.remove();

            createHitEffect(
                targetX,
                targetY,
                "arrow"
            );

            showDamage(
                targetX,
                targetY,
                damage
            );

            if (typeof onHit === "function") {
                onHit();
            }
        }
    }


    requestAnimationFrame(animate);
}


/* ======================================================
   CANNONBALL
====================================================== */

function shootCannonball(
    startX,
    startY,
    targetX,
    targetY,
    damage,
    radius,
    onHit
) {

    const ball =
        createProjectile(
            "cannonball",
            startX,
            startY
        );


    const dx =
        targetX - startX;

    const dy =
        targetY - startY;

    const distance =
        Math.sqrt(dx * dx + dy * dy);


    const duration =
        clamp(
            distance * 2.8,
            400,
            1000
        );


    const startTime =
        performance.now();


    function animate(currentTime) {

        const elapsed =
            currentTime - startTime;

        const progress =
            clamp(
                elapsed / duration,
                0,
                1
            );


        /*
        Cannonball gets a proper ballistic arc.
        */

        const arc =
            Math.sin(progress * Math.PI) *
            -120;


        const currentX =
            startX +
            dx * progress;

        const currentY =
            startY +
            dy * progress +
            arc;


        ball.style.left =
            `${currentX}px`;

        ball.style.top =
            `${currentY}px`;


        if (progress < 1) {

            requestAnimationFrame(animate);

        } else {

            ball.remove();


            createExplosion(
                targetX,
                targetY,
                radius
            );


            showDamage(
                targetX,
                targetY,
                damage
            );


            screenShake();


            if (typeof onHit === "function") {
                onHit();
            }
        }
    }


    requestAnimationFrame(animate);
}


/* ======================================================
   HIT EFFECT
====================================================== */

function createHitEffect(x, y, type = "arrow") {

    const amount =
        type === "cannon"
            ? 16
            : 7;


    for (let i = 0; i < amount; i++) {

        createParticle(
            x,
            y,
            type === "cannon"
                ? 5
                : 3
        );
    }
}


/* ======================================================
   EXPLOSION
====================================================== */

function createExplosion(
    x,
    y,
    radius = 60
) {

    const explosion =
        document.createElement("div");

    explosion.className =
        "explosion";


    const size =
        clamp(
            radius * 0.7,
            30,
            100
        );


    explosion.style.width =
        `${size}px`;

    explosion.style.height =
        `${size}px`;

    explosion.style.left =
        `${x - size / 2}px`;

    explosion.style.top =
        `${y - size / 2}px`;


    projectileLayer.appendChild(
        explosion
    );


    for (let i = 0; i < 20; i++) {

        createParticle(
            x,
            y,
            random(3, 7)
        );
    }


    setTimeout(() => {

        explosion.remove();

    }, 500);
}


/* ======================================================
   PARTICLES
====================================================== */

function createParticle(
    x,
    y,
    size = 5
) {

    const particle =
        document.createElement("div");

    particle.className =
        "particle";


    const angle =
        random(0, Math.PI * 2);

    const distance =
        random(20, 70);


    const px =
        Math.cos(angle) *
        distance;

    const py =
        Math.sin(angle) *
        distance;


    particle.style.left =
        `${x}px`;

    particle.style.top =
        `${y}px`;


    particle.style.width =
        `${size}px`;

    particle.style.height =
        `${size}px`;


    particle.style.setProperty(
        "--px",
        `${px}px`
    );

    particle.style.setProperty(
        "--py",
        `${py}px`
    );


    particleLayer.appendChild(
        particle
    );


    setTimeout(() => {

        particle.remove();

    }, 700);
}


/* ======================================================
   DAMAGE NUMBER
====================================================== */

function showDamage(
    x,
    y,
    damage
) {

    const number =
        document.createElement("div");

    number.className =
        "damage-number";


    const rounded =
        Math.max(
            1,
            Math.round(damage)
        );


    number.textContent =
        `-${rounded}`;


    number.style.left =
        `${x}px`;

    number.style.top =
        `${y}px`;


    damageLayer.appendChild(
        number
    );


    setTimeout(() => {

        number.remove();

    }, 850);
}


/* ======================================================
   FIRE RAIN
====================================================== */

function fireRain(
    amount = 20,
    damage = 80
) {

    if (!gameWorld) return;


    const width =
        gameWorld.clientWidth;

    const height =
        gameWorld.clientHeight;


    for (let i = 0; i < amount; i++) {

        setTimeout(() => {

            const fireball =
                document.createElement("div");

            fireball.className =
                "fireball";


            const x =
                random(
                    width * 0.25,
                    width * 0.85
                );


            const y =
                random(
                    -150,
                    -30
                );


            fireball.style.left =
                `${x}px`;

            fireball.style.top =
                `${y}px`;


            projectileLayer.appendChild(
                fireball
            );


            setTimeout(() => {

                fireball.remove();

            }, 700);


        }, i * 50);

    }


    /*
    Actual damage is handled by game.js.
    This function is only responsible for
    visual effects.
    */

    screenShake();
}


/* ======================================================
   BUILDING ATTACK ANIMATION
====================================================== */

function animateArcherTower() {

    const tower =
        document.getElementById(
            "archerTower"
        );

    if (!tower) return;


    tower.classList.remove(
        "archer-attacking"
    );


    /*
    Force browser reflow so the animation
    can trigger again.
    */

    void tower.offsetWidth;


    tower.classList.add(
        "archer-attacking"
    );


    setTimeout(() => {

        tower.classList.remove(
            "archer-attacking"
        );

    }, 400);
}


function animateCannon() {

    const cannon =
        document.getElementById(
            "cannonTower"
        );

    if (!cannon) return;


    cannon.classList.remove(
        "cannon-firing"
    );


    void cannon.offsetWidth;


    cannon.classList.add(
        "cannon-firing"
    );


    setTimeout(() => {

        cannon.classList.remove(
            "cannon-firing"
        );

    }, 350);
}


/* ======================================================
   SCREEN SHAKE
====================================================== */

function screenShake() {

    if (!gameWorld) return;


    gameWorld.classList.remove(
        "shake"
    );


    void gameWorld.offsetWidth;


    gameWorld.classList.add(
        "shake"
    );


    setTimeout(() => {

        gameWorld.classList.remove(
            "shake"
        );

    }, 300);
}


/* ======================================================
   MUZZLE FLASH
====================================================== */

function muzzleFlash(x, y) {

    const flash =
        document.createElement("div");


    flash.style.position =
        "absolute";

    flash.style.left =
        `${x - 15}px`;

    flash.style.top =
        `${y - 15}px`;

    flash.style.width =
        "30px";

    flash.style.height =
        "30px";

    flash.style.borderRadius =
        "50%";


    flash.style.background =
        "radial-gradient(circle, white 0%, #ffd166 25%, #d85d2f 45%, transparent 70%)";


    flash.style.pointerEvents =
        "none";

    flash.style.zIndex =
        "500";


    particleLayer.appendChild(
        flash
    );


    setTimeout(() => {

        flash.remove();

    }, 120);
}


/* ======================================================
   DESTROY EFFECT
====================================================== */

function createDeathEffect(
    x,
    y,
    type = "normal"
) {

    const amount =
        type === "commander"
            ? 30
            : 12;


    for (let i = 0; i < amount; i++) {

        createParticle(
            x,
            y,
            random(3, 8)
        );
    }


    if (type === "commander") {

        createExplosion(
            x,
            y,
            90
        );

        screenShake();
    }
}


/* ======================================================
   DEBUG HELPER
====================================================== */

function clearEffects() {

    if (projectileLayer) {
        projectileLayer.innerHTML = "";
    }

    if (particleLayer) {
        particleLayer.innerHTML = "";
    }

    if (damageLayer) {
        damageLayer.innerHTML = "";
    }
}
