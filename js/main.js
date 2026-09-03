"use strict";

/*
=========================================================
 SIEGE OF CONSTANTINOPLE V2
 MAIN CONTROLLER
=========================================================
*/

document.addEventListener("DOMContentLoaded", () => {

    console.log(
        "⚔️ Siege of Constantinople V2 loaded."
    );


    /*
    =====================================================
    SAFETY CHECK
    =====================================================
    */

    const requiredSystems = [
        "Game",
        "Units",
        "Waves",
        "Effects"
    ];


    requiredSystems.forEach(system => {

        if (!window[system]) {

            console.error(
                `System missing: ${system}`
            );

        } else {

            console.log(
                `✓ ${system} loaded`
            );

        }

    });


    /*
    =====================================================
    GAME WORLD CLICK
    =====================================================
    */

    const world =
        document.getElementById(
            "gameWorld"
        );


    if (world) {

        world.addEventListener(
            "click",
            event => {

                if (
                    !window.Game ||
                    !window.Game.running ||
                    window.Game.paused
                ) {
                    return;
                }


                /*
                Ignore UI buttons.
                */

                if (
                    event.target.closest(
                        "button"
                    )
                ) {
                    return;
                }


                /*
                Manual crossbow shot.
                */

                fireManualArrow(
                    event.clientX,
                    event.clientY
                );

            }
        );

    }


    /*
    =====================================================
    KEYBOARD CONTROLS
    =====================================================
    */

    document.addEventListener(
        "keydown",
        event => {

            /*
            Don't trigger controls
            while typing.
            */

            if (
                event.target.tagName ===
                "INPUT"
            ) {
                return;
            }


            /*
            SPACE
            Start next wave
            */

            if (
                event.code ===
                "Space"
            ) {

                event.preventDefault();


                if (
                    window.Game &&
                    window.Game.running &&
                    !window.Game.paused
                ) {

                    window.Game.startWave();

                }

            }


            /*
            R
            Repair wall
            */

            if (
                event.key.toLowerCase() ===
                "r"
            ) {

                if (
                    window.Game &&
                    window.Game.running
                ) {

                    window.Game.repairCity();

                }

            }


            /*
            F
            Fire Rain
            */

            if (
                event.key.toLowerCase() ===
                "f"
            ) {

                if (
                    window.Game &&
                    window.Game.running
                ) {

                    window.Game.fireRain();

                }

            }


            /*
            U
            Upgrade
            */

            if (
                event.key.toLowerCase() ===
                "u"
            ) {

                if (
                    window.Game &&
                    window.Game.running
                ) {

                    window.Game.upgradeDefenses();

                }

            }

        }
    );


    /*
    =====================================================
    VISIBILITY CHANGE
    =====================================================

    When player minimizes browser/tab,
    automatically pause the game.
    */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.hidden &&
                window.Game &&
                window.Game.running &&
                !window.Game.paused
            ) {

                window.Game.togglePause();

            }

        }
    );


    /*
    =====================================================
    PREVENT ACCIDENTAL DOUBLE TAP
    =====================================================
    */

    let lastTouch = 0;


    document.addEventListener(
        "touchend",
        event => {

            const now =
                Date.now();


            if (
                now - lastTouch <
                250
            ) {

                event.preventDefault();

            }


            lastTouch = now;

        },
        {
            passive: false
        }
    );


    /*
    =====================================================
    MOBILE ORIENTATION MESSAGE
    =====================================================
    */

    function checkOrientation() {

        const portrait =
            window.innerHeight >
            window.innerWidth;


        let warning =
            document.getElementById(
                "orientationWarning"
            );


        if (
            portrait &&
            window.innerWidth < 800
        ) {

            if (!warning) {

                warning =
                    document.createElement(
                        "div"
                    );


                warning.id =
                    "orientationWarning";


                warning.innerHTML = `
                    <div class="orientation-box">
                        <div class="orientation-icon">
                            ⟳
                        </div>

                        <div>
                            ROTATE DEVICE
                        </div>

                        <small>
                            Landscape mode recommended
                        </small>
                    </div>
                `;


                warning.style.position =
                    "fixed";

                warning.style.inset =
                    "0";

                warning.style.zIndex =
                    "99999";

                warning.style.display =
                    "flex";

                warning.style.alignItems =
                    "center";

                warning.style.justifyContent =
                    "center";

                warning.style.background =
                    "rgba(0,0,0,.92)";

                warning.style.color =
                    "#e6d39a";

                warning.style.textAlign =
                    "center";


                document.body.appendChild(
                    warning
                );

            }

        } else {

            if (warning) {

                warning.remove();

            }

        }

    }


    window.addEventListener(
        "resize",
        checkOrientation
    );


    window.addEventListener(
        "orientationchange",
        checkOrientation
    );


    checkOrientation();


    /*
    =====================================================
    INITIAL SYSTEM STATUS
    =====================================================
    */

    setTimeout(() => {

        console.log(
            "🏰 Constantinople defense systems ready."
        );

        console.log(
            "⚔️ Controls:"
        );

        console.log(
            "SPACE = Start Wave"
        );

        console.log(
            "R = Repair"
        );

        console.log(
            "F = Fire Rain"
        );

        console.log(
            "U = Upgrade"
        );

        console.log(
            "P = Pause"
        );

    }, 500);

});


/*
=========================================================
 MANUAL CROSSBOW
=========================================================
*/

function fireManualArrow(
    mouseX,
    mouseY
) {

    if (
        !window.Game ||
        !window.Game.running ||
        window.Game.paused
    ) {
        return;
    }


    const battlefield =
        document.getElementById(
            "battlefield"
        );


    if (!battlefield) {
        return;
    }


    /*
    Find nearest enemy
    to clicked position.
    */

    const enemies =
        window.enemies || [];


    let target = null;

    let bestDistance =
        Infinity;


    enemies.forEach(
        enemy => {

            if (
                !enemy ||
                !enemy.alive ||
                !enemy.element
            ) {
                return;
            }


            const rect =
                enemy.element.getBoundingClientRect();


            const centerX =
                rect.left +
                rect.width / 2;


            const centerY =
                rect.top +
                rect.height / 2;


            const distance =
                Math.hypot(
                    mouseX - centerX,
                    mouseY - centerY
                );


            if (
                distance <
                bestDistance
            ) {

                bestDistance =
                    distance;

                target =
                    enemy;

            }

        }
    );


    /*
    No enemy nearby.
    */

    if (!target) {

        if (
            window.Effects
        ) {

            window.Effects.createParticles(
                battlefield,
                4
            );

        }

        return;

    }


    /*
    Manual arrow damage.
    */

    const damage =
        35 +
        (
            window.Game.upgradeLevel *
            5
        );


    /*
    Visual arrow.
    */

    if (
        window.Effects &&
        window.Effects.fireArrow
    ) {

        window.Effects.fireArrow(
            battlefield,
            target
        );

    }


    /*
    Damage enemy.
    */

    target.takeDamage(
        damage
    );


    /*
    Hit effect.
    */

    if (
        window.Effects &&
        window.Effects.hitEffect
    ) {

        window.Effects.hitEffect(
            target.element
        );

    }

}


/*
=========================================================
 EXPOSE MANUAL ATTACK
=========================================================
*/

window.fireManualArrow =
    fireManualArrow;
