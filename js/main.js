(function () {
    "use strict";

    // =====================================================
    // MAIN CONTROLLER
    // =====================================================

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            console.log(
                "⚔ Constantinople Siege V2 loading..."
            );


            // ---------------------------------------------
            // START GAME
            // ---------------------------------------------

            if (
                window.Game &&
                typeof window.Game.init === "function"
            ) {

                window.Game.init();

            } else {

                console.error(
                    "Game system not found."
                );

                return;
            }


            // ---------------------------------------------
            // MANUAL ATTACK
            // ---------------------------------------------

            setupManualAttack();


            // ---------------------------------------------
            // KEYBOARD
            // ---------------------------------------------

            setupKeyboard();


            // ---------------------------------------------
            // VISIBILITY
            // ---------------------------------------------

            setupVisibility();


            // ---------------------------------------------
            // ORIENTATION
            // ---------------------------------------------

            setupOrientation();


            console.log(
                "⚔ Constantinople Siege V2 ready."
            );
        }
    );


    // =====================================================
    // MANUAL ATTACK
    // =====================================================

    function setupManualAttack() {

        const world =
            document.getElementById(
                "gameWorld"
            );

        if (!world) {
            return;
        }


        world.addEventListener(
            "pointerdown",
            event => {

                if (
                    !window.Game ||
                    !window.Game.running ||
                    window.Game.paused ||
                    window.Game.gameOver ||
                    window.Game.victory
                ) {
                    return;
                }


                // -----------------------------------------
                // IGNORE UI ELEMENTS
                // -----------------------------------------

                if (
                    event.target.closest(
                        "button"
                    )
                ) {
                    return;
                }


                // -----------------------------------------
                // POSITION
                // -----------------------------------------

                const rect =
                    world.getBoundingClientRect();

                const x =
                    (
                        event.clientX -
                        rect.left
                    ) /
                    rect.width *
                    100;

                const y =
                    (
                        event.clientY -
                        rect.top
                    ) /
                    rect.height *
                    100;


                fireManualArrow(
                    x,
                    y
                );
            }
        );
    }


    // =====================================================
    // MANUAL ARROW
    // =====================================================

    function fireManualArrow(
        targetX,
        targetY
    ) {

        let nearest = null;

        let nearestDistance =
            Infinity;


        if (
            !window.enemies
        ) {
            return;
        }


        // ---------------------------------------------
        // FIND ENEMY NEAR CLICK
        // ---------------------------------------------

        for (
            const enemy of
            window.enemies
        ) {

            if (
                !enemy ||
                !enemy.alive
            ) {
                continue;
            }


            const dx =
                enemy.x -
                targetX;

            const dy =
                enemy.y -
                targetY;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance <
                nearestDistance
            ) {

                nearestDistance =
                    distance;

                nearest =
                    enemy;
            }
        }


        // ---------------------------------------------
        // NO TARGET
        // ---------------------------------------------

        if (!nearest) {

            if (
                window.Effects &&
                typeof window.Effects.createHitEffect === "function"
            ) {

                window.Effects.createHitEffect(
                    targetX,
                    targetY
                );
            }

            return;
        }


        // ---------------------------------------------
        // MAX CLICK RANGE
        // ---------------------------------------------

        if (
            nearestDistance >
            18
        ) {
            return;
        }


        // ---------------------------------------------
        // DAMAGE
        // ---------------------------------------------

        const damage =
            35 +
            window.Game.upgradeLevel *
            5;


        if (
            window.Effects &&
            typeof window.Effects.fireArrow === "function"
        ) {

            window.Effects.fireArrow(
                25,
                50,
                nearest.x,
                nearest.y,
                () => {

                    if (
                        nearest &&
                        nearest.alive
                    ) {

                        nearest.takeDamage(
                            damage
                        );
                    }
                }
            );

        } else {

            nearest.takeDamage(
                damage
            );
        }
    }


    // =====================================================
    // KEYBOARD
    // =====================================================

    function setupKeyboard() {

        document.addEventListener(
            "keydown",
            event => {

                if (
                    !window.Game
                ) {
                    return;
                }


                // -----------------------------------------
                // SPACE = NEXT WAVE
                // -----------------------------------------

                if (
                    event.code ===
                    "Space"
                ) {

                    event.preventDefault();

                    window.Game.startWave();

                    return;
                }


                // -----------------------------------------
                // R = REPAIR
                // -----------------------------------------

                if (
                    event.key.toLowerCase() ===
                    "r"
                ) {

                    window.Game.repairCity();

                    return;
                }


                // -----------------------------------------
                // F = FIRE RAIN
                // -----------------------------------------

                if (
                    event.key.toLowerCase() ===
                    "f"
                ) {

                    window.Game.fireRain();

                    return;
                }


                // -----------------------------------------
                // U = UPGRADE
                // -----------------------------------------

                if (
                    event.key.toLowerCase() ===
                    "u"
                ) {

                    window.Game.upgradeDefenses();

                    return;
                }


                // -----------------------------------------
                // P = PAUSE
                // -----------------------------------------

                if (
                    event.key.toLowerCase() ===
                    "p"
                ) {

                    togglePause();

                    return;
                }
            }
        );
    }


    // =====================================================
    // PAUSE
    // =====================================================

    function togglePause() {

        if (
            !window.Game ||
            !window.Game.running
        ) {
            return;
        }

        window.Game.paused =
            !window.Game.paused;


        if (
            window.Game.paused
        ) {

            window.Game.notify(
                "⏸ GAME PAUSED"
            );

        } else {

            window.Game.notify(
                "▶ GAME RESUMED"
            );
        }
    }


    // =====================================================
    // VISIBILITY
    // =====================================================

    function setupVisibility() {

        document.addEventListener(
            "visibilitychange",
            () => {

                if (
                    document.hidden &&
                    window.Game &&
                    window.Game.running
                ) {

                    window.Game.paused =
                        true;

                }
            }
        );
    }


    // =====================================================
    // ORIENTATION
    // =====================================================

    function setupOrientation() {

        const warning =
            document.getElementById(
                "orientationWarning"
            );


        function updateOrientation() {

            if (!warning) {
                return;
            }


            const portrait =
                window.innerHeight >
                window.innerWidth;


            if (
                portrait &&
                window.innerWidth < 700
            ) {

                warning.classList.add(
                    "show"
                );

            } else {

                warning.classList.remove(
                    "show"
                );
            }
        }


        window.addEventListener(
            "resize",
            updateOrientation
        );

        window.addEventListener(
            "orientationchange",
            updateOrientation
        );

        updateOrientation();
    }

})();
