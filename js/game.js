import { Player } from "./player.js";
import { City } from "./city.js";
import { Particles } from "./particles.js";
import { makeEnemy, TYPES } from "./entities.js";
import { wavePlan } from "./waves.js";

export class Game {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ui = ui;

    this.player = new Player();
    this.city = new City();
    this.particles = new Particles();

    this.enemies = [];
    this.projectiles = [];
    this.floaters = [];
    this.queue = [];

    this.active = false;

    this.wave = 1;
    this.score = 0;
    this.gold = 0;
    this.supplies = 60;

    this.spawnClock = 0;
    this.waveClock = 0;
    this.flash = 0;
    this.shake = 0;

    this.last = performance.now();

    this.costs = {
      archer: 35,
      cannon: 90,
      repair: 40,
      upgrade: 80,
      ability: 35
    };

    this.archers = 0;
    this.cannonShots = 0;

    this.aim = {
      x: innerWidth / 2,
      y: innerHeight / 2
    };

    this.resize();

    addEventListener("resize", () => this.resize());

    canvas.addEventListener("pointermove", (e) => {
      this.aim = {
        x: e.clientX,
        y: e.clientY
      };
    });

    canvas.addEventListener("pointerdown", (e) => {
      this.aim = {
        x: e.clientX,
        y: e.clientY
      };

      this.fire();
    });
  }

  resize() {
    this.width = innerWidth;
    this.height = innerHeight;

    const dpr = devicePixelRatio || 1;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;

    this.canvas.style.width = this.width + "px";
    this.canvas.style.height = this.height + "px";

    this.ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );
  }

  start() {
    this.ui.hideStart();

    this.resetState();

    this.active = true;

    this.nextWave(true);
  }

  reset() {
    this.ui.hideGameOver();
    this.ui.hideStart();

    this.resetState();

    this.active = true;

    this.nextWave(true);
  }

  resetState() {
    this.city = new City();
    this.player = new Player();
    this.particles = new Particles();

    this.enemies = [];
    this.projectiles = [];
    this.floaters = [];
    this.queue = [];

    this.wave = 0;
    this.score = 0;
    this.gold = 80;
    this.supplies = 60;

    this.archers = 0;
    this.cannonShots = 0;

    this.spawnClock = 0;
    this.waveClock = 0;
    this.flash = 0;
    this.shake = 0;

    this.costs = {
      archer: 35,
      cannon: 90,
      repair: 40,
      upgrade: 80,
      ability: 35
    };
  }

  nextWave(first = false) {
    this.wave++;

    this.queue = wavePlan(this.wave);

    this.waveClock = 0;
    this.spawnClock = 0;

    if (first) {
      this.ui.banner("THE SIEGE BEGINS");
    } else if (this.wave % 5 === 0) {
      this.ui.banner(`⚠ COMMANDER WAVE ${this.wave}`);
    } else {
      this.ui.banner(`WAVE ${this.wave}`);
    }
  }

  fire() {
    if (!this.active) return;

    this.player.shoot(
      this,
      this.aim.x,
      this.aim.y,
      performance.now()
    );
  }

  command(action) {
    if (!this.active) return;

    if (
      action === "archer" &&
      this.gold >= this.costs.archer
    ) {
      this.gold -= this.costs.archer;
      this.archers++;

      this.costs.archer = Math.floor(
        this.costs.archer * 1.35
      );

      this.ui.banner("ARCHER RECRUITED");
    }

    else if (
      action === "cannon" &&
      this.gold >= this.costs.cannon
    ) {
      this.gold -= this.costs.cannon;
      this.city.cannons++;

      this.costs.cannon = Math.floor(
        this.costs.cannon * 1.45
      );

      this.ui.banner("CANNON INSTALLED");
    }

    else if (
      action === "repair" &&
      this.gold >= this.costs.repair
    ) {
      this.gold -= this.costs.repair;

      this.city.repair(25);

      this.costs.repair = Math.floor(
        this.costs.repair * 1.3
      );

      this.ui.banner("WALLS REPAIRED");
    }

    else if (
      action === "upgrade" &&
      this.gold >= this.costs.upgrade
    ) {
      this.gold -= this.costs.upgrade;

      this.player.damage += 12;

      this.player.fireCooldown = Math.max(
        150,
        this.player.fireCooldown - 25
      );

      this.costs.upgrade = Math.floor(
        this.costs.upgrade * 1.5
      );

      this.ui.banner("WEAPONS UPGRADED");
    }

    else if (
      action === "ability" &&
      this.supplies >= this.costs.ability
    ) {
      this.supplies -= this.costs.ability;

      this.fireRain();

      this.ui.banner("FIRE RAIN");
    }

    else {
      this.ui.banner("NOT ENOUGH RESOURCES");
    }
  }

  fireRain() {
    for (const enemy of [...this.enemies]) {
      enemy.hp -= this.player.damage * 2.2;
      enemy.hit = 0.2;

      this.particles.burst(
        enemy.x,
        enemy.y,
        10,
        "fire"
      );

      if (enemy.hp <= 0) {
        const index = this.enemies.indexOf(enemy);

        if (index !== -1) {
          this.killEnemy(index);
        }
      }
    }

    this.shake = 10;
  }

  spawn(type) {
    this.enemies.push(
      makeEnemy(
        type,
        this,
        this.wave
      )
    );
  }

  update(dt) {
    if (!this.active) return;

    this.waveClock += dt;
    this.spawnClock += dt;

    // Spawn enemies
    if (
      this.queue.length &&
      this.spawnClock > 0.52
    ) {
      this.spawn(this.queue.shift());

      this.spawnClock = 0;
    }

    // Next wave
    if (
      !this.queue.length &&
      !this.enemies.length &&
      this.waveClock > 1
    ) {
      this.nextWave();
    }

    // Projectiles
    for (
      let i = this.projectiles.length - 1;
      i >= 0;
      i--
    ) {
      const projectile = this.projectiles[i];

      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      projectile.life -= dt;

      let hit = false;

      for (
        let j = this.enemies.length - 1;
        j >= 0;
        j--
      ) {
        const enemy = this.enemies[j];

        if (
          Math.hypot(
            projectile.x - enemy.x,
            projectile.y - enemy.y
          ) <
          enemy.radius + 5
        ) {
          enemy.hp -= projectile.damage;
          enemy.hit = 0.12;

          this.particles.burst(
            projectile.x,
            projectile.y,
            4,
            "spark"
          );

          this.projectiles.splice(i, 1);

          hit = true;

          if (enemy.hp <= 0) {
            this.killEnemy(j);
          }

          break;
        }
      }

      if (
        !hit &&
        projectile.life <= 0
      ) {
        this.projectiles.splice(i, 1);
      }
    }

    // Enemies
    for (
      let i = this.enemies.length - 1;
      i >= 0;
      i--
    ) {
      const enemy = this.enemies[i];

      enemy.hit = Math.max(
        0,
        enemy.hit - dt
      );

      enemy.attack = Math.max(
        0,
        enemy.attack - dt
      );

      const targetX = this.width / 2;
      const targetY = this.height * 0.70;

      const dx = targetX - enemy.x;
      const dy = targetY - enemy.y;

      const distance = Math.hypot(
        dx,
        dy
      );

      if (distance > 55) {
        enemy.x +=
          (dx / distance) *
          enemy.speed *
          dt;

        enemy.y +=
          (dy / distance) *
          enemy.speed *
          dt;
      }

      else if (enemy.attack <= 0) {
        this.city.damage(enemy.damage);

        enemy.attack = 1.1;

        this.shake = 5;

        this.particles.burst(
          targetX,
          targetY,
          8,
          "dust"
        );

        if (this.city.hp <= 0) {
          this.end(false);
          return;
        }
      }
    }

    this.autoDefenders(dt);

    this.particles.update(dt);

    // Floating rewards
    for (
      let i = this.floaters.length - 1;
      i >= 0;
      i--
    ) {
      const floater = this.floaters[i];

      floater.y -= 25 * dt;
      floater.life -= dt;

      if (floater.life <= 0) {
        this.floaters.splice(i, 1);
      }
    }

    this.shake = Math.max(
      0,
      this.shake - dt * 18
    );

    this.flash = Math.max(
      0,
      this.flash - dt * 2
    );

    this.ui.update(
      this.state()
    );
  }

  autoDefenders(dt) {
    // Archers
    if (
      this.archers > 0 &&
      this.enemies.length > 0 &&
      Math.random() <
        dt * this.archers * 0.65
    ) {
      const target =
        this.enemies[
          Math.floor(
            Math.random() *
            this.enemies.length
          )
        ];

      if (target) {
        target.hp -=
          this.player.damage * 0.65;

        target.hit = 0.08;

        this.particles.burst(
          target.x,
          target.y,
          3,
          "spark"
        );

        if (target.hp <= 0) {
          const index =
            this.enemies.indexOf(target);

          if (index !== -1) {
            this.killEnemy(index);
          }
        }
      }
    }

    // Cannons
    if (
      this.city.cannons > 0 &&
      this.enemies.length > 0 &&
      Math.random() <
        dt * this.city.cannons * 0.28
    ) {
      const target =
        this.enemies[
          Math.floor(
            Math.random() *
            this.enemies.length
          )
        ];

      if (target) {
        target.hp -=
          this.player.damage * 2.5;

        target.hit = 0.12;

        this.particles.burst(
          target.x,
          target.y,
          14,
          "fire"
        );

        this.shake = 5;

        if (target.hp <= 0) {
          const index =
            this.enemies.indexOf(target);

          if (index !== -1) {
            this.killEnemy(index);
          }
        }
      }
    }
  }

  killEnemy(index) {
    if (
      index < 0 ||
      index >= this.enemies.length
    ) {
      return;
    }

    const enemy = this.enemies[index];

    this.enemies.splice(
      index,
      1
    );

    const bonus =
      enemy.type === "commander"
        ? 250
        : 0;

    this.gold += enemy.reward;

    this.supplies +=
      enemy.type === "commander"
        ? 15
        : 1;

    this.score +=
      Math.round(enemy.reward * 10) +
      bonus;

    this.floaters.push({
      x: enemy.x,
      y: enemy.y,
      text: `+${enemy.reward}G`,
      life: 1
    });

    this.particles.burst(
      enemy.x,
      enemy.y,
      enemy.type === "commander"
        ? 35
        : 13,
      enemy.type === "commander"
        ? "fire"
        : "dust"
    );
  }

  end(survived) {
    this.active = false;

    this.ui.gameOver(
      this.state(),
      survived
    );
  }

  state() {
    const total =
      5 + Math.floor(
        this.wave * 1.8
      );

    const spawned =
      total - this.queue.length;

    return {
      cityHp: this.city.hp,
      maxHp: this.city.maxHp,

      wave: this.wave,

      waveProgress:
        Math.max(
          0,
          Math.min(
            1,
            spawned / Math.max(1, total)
          )
        ),

      gold: this.gold,
      supplies: this.supplies,
      score: this.score,

      costs: this.costs
    };
  }

  draw() {
    const c = this.ctx;
    const w = this.width;
    const h = this.height;

    c.save();

    if (this.shake) {
      c.translate(
        (Math.random() - 0.5) *
          this.shake,

        (Math.random() - 0.5) *
          this.shake
      );
    }

    // Sky
    const sky =
      c.createLinearGradient(
        0,
        0,
        0,
        h
      );

    sky.addColorStop(
      0,
      "#070d18"
    );

    sky.addColorStop(
      0.6,
      "#11151a"
    );

    sky.addColorStop(
      1,
      "#24150b"
    );

    c.fillStyle = sky;

    c.fillRect(
      0,
      0,
      w,
      h
    );

    // Stars
    for (let i = 0; i < 70; i++) {
      c.fillStyle = "#ffffff88";

      c.fillRect(
        (i * 137) % w,
        (i * 79) % (h * 0.5),
        1,
        1
      );
    }

    // Moon
    c.fillStyle = "#d5cfb8";

    c.beginPath();

    c.arc(
      w * 0.78,
      h * 0.17,
      35,
      0,
      Math.PI * 2
    );

    c.fill();

    // Ground
    c.fillStyle = "#1b1610";

    c.fillRect(
      0,
      h * 0.80,
      w,
      h * 0.20
    );

    // City
    this.city.draw(
      c,
      w,
      h
    );

    // Projectiles
    for (const projectile of this.projectiles) {
      c.save();

      c.translate(
        projectile.x,
        projectile.y
      );

      c.rotate(
        Math.atan2(
          projectile.vy,
          projectile.vx
        )
      );

      c.strokeStyle = "#e0c17b";
      c.lineWidth = 3;

      c.beginPath();

      c.moveTo(-12, 0);
      c.lineTo(10, 0);

      c.stroke();

      c.restore();
    }

    // Enemies
    for (const enemy of this.enemies) {
      this.drawEnemy(
        c,
        enemy
      );
    }

    // Particles
    this.particles.draw(c);

    // Floating text
    for (const floater of this.floaters) {
      c.globalAlpha =
        floater.life;

      c.fillStyle =
        "#e0c06b";

      c.font =
        "bold 14px Georgia";

      c.textAlign =
        "center";

      c.fillText(
        floater.text,
        floater.x,
        floater.y
      );
    }

    this.drawCrosshair(c);

    c.restore();
  }

  drawEnemy(c, enemy) {
    c.save();

    if (enemy.hit) {
      c.globalAlpha = 0.55;
    }

    const colors = {
      soldier: "#30353a",
      archer: "#394036",
      janissary: "#533c2b",
      cavalry: "#44343b",
      ram: "#43362a",
      commander: "#641d1d"
    };

    const color =
      colors[enemy.type] ||
      "#30353a";

    // Shadow
    c.fillStyle = "#0008";

    c.beginPath();

    c.ellipse(
      enemy.x,
      enemy.y + enemy.radius,
      enemy.radius,
      enemy.radius * 0.4,
      0,
      0,
      Math.PI * 2
    );

    c.fill();

    // Body
    c.fillStyle = color;

    c.beginPath();

    c.arc(
      enemy.x,
      enemy.y,
      enemy.radius,
      0,
      Math.PI * 2
    );

    c.fill();

    // Helmet
    c.fillStyle = "#77756d";

    c.beginPath();

    c.arc(
      enemy.x,
      enemy.y - enemy.radius * 0.25,
      enemy.radius * 0.7,
      Math.PI,
      0
    );

    c.fill();

    // Weapon
    c.strokeStyle = "#9d8761";
    c.lineWidth = 2;

    c.beginPath();

    c.moveTo(
      enemy.x,
      enemy.y + enemy.radius
    );

    c.lineTo(
      enemy.x +
        (enemy.side < 0 ? -1 : 1) *
        25,
      enemy.y - 28
    );

    c.stroke();

    // HP bar
    const barWidth =
      enemy.radius * 2.2;

    c.fillStyle = "#210b09";

    c.fillRect(
      enemy.x - barWidth / 2,
      enemy.y - enemy.radius - 9,
      barWidth,
      4
    );

    c.fillStyle =
      enemy.type === "commander"
        ? "#d18b3c"
        : "#a44237";

    c.fillRect(
      enemy.x - barWidth / 2,
      enemy.y - enemy.radius - 9,
      barWidth *
        Math.max(
          0,
          enemy.hp / enemy.maxHp
        ),
      4
    );

    // Commander label
    if (
      enemy.type === "commander"
    ) {
      c.fillStyle =
        "#dfbd64";

      c.font =
        "bold 11px Georgia";

      c.textAlign =
        "center";

      c.fillText(
        "COMMANDER",
        enemy.x,
        enemy.y -
          enemy.radius -
          15
      );
    }

    c.restore();
  }

  drawCrosshair(c) {
    if (!this.active) return;

    c.strokeStyle =
      "#ddc078aa";

    c.lineWidth = 1;

    c.beginPath();

    c.arc(
      this.aim.x,
      this.aim.y,
      11,
      0,
      Math.PI * 2
    );

    c.stroke();

    c.beginPath();

    c.moveTo(
      this.aim.x - 19,
      this.aim.y
    );

    c.lineTo(
      this.aim.x - 6,
      this.aim.y
    );

    c.moveTo(
      this.aim.x + 6,
      this.aim.y
    );

    c.lineTo(
      this.aim.x + 19,
      this.aim.y
    );

    c.moveTo(
      this.aim.x,
      this.aim.y - 19
    );

    c.lineTo(
      this.aim.x,
      this.aim.y - 6
    );

    c.moveTo(
      this.aim.x,
      this.aim.y + 6
    );

    c.lineTo(
      this.aim.x,
      this.aim.y + 19
    );

    c.stroke();
  }

  run() {
    const frame = (now) => {
      const dt = Math.min(
        0.033,
        (now - this.last) / 1000
      );

      this.last = now;

      this.update(dt);
      this.draw();

      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }
}
