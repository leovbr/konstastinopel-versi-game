/* =========================================================
   SIEGE OF CONSTANTINOPLE
   WAVE SYSTEM
   ========================================================= */

let currentWave = 0;
let waveActive = false;
let waveEnemiesLeft = 0;
let waveSpawned = 0;
let waveTimer = null;

// =========================================================
// WAVE DIFFICULTY
// =========================================================

function getWaveConfig(wave) {

    // Jumlah musuh dasar
    const totalEnemies =
        5 + Math.floor(wave * 1.8);

    // Jeda spawn makin cepat seiring wave
    const spawnDelay =
        Math.max(350, 1100 - wave * 35);

    // Setiap 5 wave ada Commander
    const commander =
        wave >= 5 && wave % 5 === 0;

    return {
        totalEnemies,
        spawnDelay,
        commander
    };
}


// =========================================================
// RANDOM ENEMY TYPE
// =========================================================

function getEnemyType(wave) {

    const roll = Math.random();

    /*
        WAVE 1-2
        Mayoritas Soldier
    */

    if (wave < 3) {
        return "soldier";
    }


    /*
        WAVE 3+
        Archer mulai muncul
    */

    if (wave < 4) {

        if (roll < 0.15) {
            return "archer";
        }

        return "soldier";
    }


    /*
        WAVE 4+
        Janissary mulai muncul
    */

    if (wave < 5) {

        if (roll < 0.10) {
            return "janissary";
        }

        if (roll < 0.25) {
            return "archer";
        }

        return "soldier";
    }


    /*
        WAVE 5+
        Semua tipe normal
    */

    if (roll < 0.10) {
        return "janissary";
    }

    if (roll < 0.28) {
        return "archer";
    }

    return "soldier";
}


// =========================================================
// SPAWN ENEMY
// =========================================================

function spawnEnemy(type, wave) {

    if (typeof Enemy === "undefined") {
        console.error("Enemy class belum tersedia!");
        return null;
    }

    const enemy = new Enemy(type, wave);

    // Posisi spawn dari sisi kanan battlefield
    enemy.x = 100 + Math.random() * 8;

    // Sedikit variasi posisi vertikal
    enemy.y =
        58 +
        Math.random() * 10;

    // Tambahkan ke array global
    if (typeof enemies !== "undefined") {
        enemies.push(enemy);
    }

    return enemy;
}


// =========================================================
// SPAWN COMMANDER
// =========================================================

function spawnCommander(wave) {

    const commander = spawnEnemy(
        "commander",
        wave
    );

    if (commander) {

        console.log(
            `⚔️ COMMANDER muncul di Wave ${wave}!`
        );

        // Efek kemunculan
        if (typeof createParticle === "function") {

            for (let i = 0; i < 18; i++) {

                createParticle(
                    88 + Math.random() * 8,
                    55 + Math.random() * 10,
                    "🔥"
                );
            }
        }
    }

    return commander;
}


// =========================================================
// START WAVE
// =========================================================

function startWave() {

    if (waveActive) {
        return;
    }

    currentWave++;

    waveActive = true;

    waveSpawned = 0;

    const config =
        getWaveConfig(currentWave);

    waveEnemiesLeft =
        config.totalEnemies;

    console.log(
        `🌊 WAVE ${currentWave} DIMULAI`
    );

    // Update HUD
    updateWaveUI();

    // Commander wave
    if (config.commander) {

        // Commander muncul setelah beberapa musuh
        setTimeout(() => {

            spawnCommander(
                currentWave
            );

        }, 1800);
    }


    // Spawn musuh satu per satu
    waveTimer = setInterval(() => {

        if (
            waveSpawned >=
            config.totalEnemies
        ) {

            clearInterval(waveTimer);

            waveTimer = null;

            return;
        }

        const type =
            getEnemyType(
                currentWave
            );

        spawnEnemy(
            type,
            currentWave
        );

        waveSpawned++;

    }, config.spawnDelay);
}


// =========================================================
// WAVE COMPLETE
// =========================================================

function checkWaveComplete() {

    if (!waveActive) {
        return;
    }

    const aliveEnemies =
        typeof enemies !== "undefined"
            ? enemies.length
            : 0;

    /*
        Wave selesai jika:
        - Semua musuh sudah spawn
        - Tidak ada musuh hidup
    */

    if (
        waveSpawned >=
            getWaveConfig(currentWave).totalEnemies
        &&
        aliveEnemies === 0
    ) {

        waveActive = false;

        waveEnemiesLeft = 0;

        console.log(
            `🏆 WAVE ${currentWave} SELESAI`
        );

        updateWaveUI();

        // Bonus gold
        if (typeof gold !== "undefined") {

            gold +=
                50 +
                currentWave * 10;
        }

        updateGoldUI();

        // Bonus kecil antar wave
        showWaveComplete();
    }
}


// =========================================================
// WAVE COMPLETE MESSAGE
// =========================================================

function showWaveComplete() {

    const message =
        document.createElement("div");

    message.className =
        "wave-complete-message";

    message.innerHTML = `
        <div class="wave-complete-title">
            WAVE ${currentWave} CLEARED
        </div>

        <div class="wave-complete-sub">
            Constantinople survives...
        </div>

        <div class="wave-complete-bonus">
            +${50 + currentWave * 10} GOLD
        </div>
    `;

    document.body.appendChild(message);


    setTimeout(() => {

        message.classList.add("show");

    }, 50);


    setTimeout(() => {

        message.classList.remove("show");

        setTimeout(() => {
            message.remove();
        }, 500);

    }, 2200);
}


// =========================================================
// UPDATE WAVE HUD
// =========================================================

function updateWaveUI() {

    const waveElement =
        document.getElementById("waveValue");

    if (waveElement) {

        waveElement.textContent =
            currentWave;
    }
}


// =========================================================
// DIFFICULTY INFORMATION
// =========================================================

function getDifficultyText(wave) {

    if (wave <= 2) {
        return "EASY";
    }

    if (wave <= 4) {
        return "NORMAL";
    }

    if (wave <= 7) {
        return "HARD";
    }

    if (wave <= 10) {
        return "VERY HARD";
    }

    if (wave <= 15) {
        return "NIGHTMARE";
    }

    return "HELL";
}


// =========================================================
// WAVE DIFFICULTY MULTIPLIER
// =========================================================

function getDifficultyMultiplier(wave) {

    /*
        Setiap wave:
        HP +8%
        Damage +6%
        Speed +1%
    */

    return {
        hp:
            1 +
            (wave - 1) * 0.08,

        damage:
            1 +
            (wave - 1) * 0.06,

        speed:
            1 +
            (wave - 1) * 0.01
    };
}


// =========================================================
// RESET WAVES
// =========================================================

function resetWaves() {

    if (waveTimer) {

        clearInterval(
            waveTimer
        );

        waveTimer = null;
    }

    currentWave = 0;

    waveActive = false;

    waveEnemiesLeft = 0;

    waveSpawned = 0;

    updateWaveUI();
}


// =========================================================
// NEXT WAVE COUNTDOWN
// =========================================================

function waveCountdown(seconds = 3) {

    let count = seconds;

    const countdown =
        document.createElement("div");

    countdown.className =
        "wave-countdown";

    document.body.appendChild(
        countdown
    );


    const timer =
        setInterval(() => {

            if (count <= 0) {

                clearInterval(timer);

                countdown.remove();

                startWave();

                return;
            }

            countdown.innerHTML = `
                <div>INCOMING WAVE</div>
                <strong>${count}</strong>
            `;

            count--;

        }, 1000);
}


// =========================================================
// AUTO CHECK WAVE
// =========================================================

setInterval(() => {

    checkWaveComplete();

}, 500);


// =========================================================
// EXPORT / GLOBAL ACCESS
// =========================================================

window.currentWave =
    currentWave;

window.startWave =
    startWave;

window.waveCountdown =
    waveCountdown;

window.getWaveConfig =
    getWaveConfig;

window.getEnemyType =
    getEnemyType;

window.getDifficultyMultiplier =
    getDifficultyMultiplier;

window.getDifficultyText =
    getDifficultyText;

window.resetWaves =
    resetWaves;
