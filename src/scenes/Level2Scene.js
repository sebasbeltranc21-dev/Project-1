import Phaser from "phaser";
import Player from "../entities/Player.js";
import Coin from "../entities/Coin.js";
import Checkpoint from "../entities/Checkpoint.js";
import Enemy from "../entities/Enemy.js";
import Hazard from "../entities/Hazard.js";
import PowerUp from "../entities/PowerUp.js";
import { completeLevel } from "../systems/Progress.js";

export default class Level2Scene extends Phaser.Scene {
  constructor() {
    super("Level2Scene");
  }

  create() {
    this.worldWidth = 4600;
    this.worldHeight = 1100;
    this.spawnPoint = { x: 160, y: 560 };
    this.respawnPoint = { ...this.spawnPoint };
    this.score = 0;
    this.coinsCollected = 0;
    this.lives = 3;
    this.levelFinished = false;
    this.gameOver = false;
    this.invulnerableUntil = 0;
    this.speedBoostUntil = 0;
    this.shieldUntil = 0;
    this.startTime = this.time.now;

    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, this.worldWidth, 720);
    this.cameras.main.setBackgroundColor("#14122c");

    this.createBackground();
    this.createLevel();

    this.player = new Player(this, this.spawnPoint.x, this.spawnPoint.y);
    this.physics.add.collider(this.player, this.platforms);

    this.coins = this.physics.add.group();
    this.createCoins();

    this.checkpoints = this.physics.add.group();
    this.createCheckpoints();

    this.enemies = this.physics.add.group();
    this.createEnemies();
    this.physics.add.collider(this.enemies, this.platforms);

    this.hazards = this.physics.add.staticGroup();
    this.createHazards();

    this.powerUps = this.physics.add.group();
    this.createPowerUps();

    this.createGoal();
    this.createHud();

    this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);
    this.physics.add.overlap(this.player, this.checkpoints, this.touchCheckpoint, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.handleEnemyCollision, undefined, this);
    this.physics.add.overlap(this.player, this.hazards, this.hitHazard, undefined, this);
    this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, undefined, this);
    this.physics.add.overlap(this.player, this.goal, this.finishLevel, undefined, this);

    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setDeadzone(420, 180);

    this.input.keyboard.on("keydown-ESC", this.returnToMap, this);
    this.input.keyboard.on("keydown-ENTER", this.continueAfterFinish, this);
    this.input.keyboard.on("keydown-R", this.restartLevel, this);
  }

  update(time, delta) {
    if (this.levelFinished || this.gameOver) return;

    this.updatePowerUpEffects(time);
    this.player.update(delta);
    this.enemies.getChildren().forEach((enemy) => enemy.update());

    if (this.player.y > 820) {
      this.loseLife("CAÍSTE");
    }

    this.updateHud(time);
  }

  createBackground() {
    this.add.rectangle(this.worldWidth / 2, 360, this.worldWidth, 720, 0x14122c);

    for (let x = 120; x < this.worldWidth; x += 300) {
      this.add.ellipse(x, 170 + ((x / 20) % 80), 70, 190, 0x33265f, 0.65);
      this.add.ellipse(x + 70, 130 + ((x / 30) % 110), 44, 130, 0x4b3882, 0.55);
    }

    for (let x = 120; x < this.worldWidth; x += 410) {
      this.add.polygon([
        x - 35, 170,
        x - 4, 85,
        x + 15, 170
      ], 0x66f0dc, 0.32);

      this.add.polygon([
        x + 60, 190,
        x + 90, 105,
        x + 110, 190
      ], 0x8f7bff, 0.26);
    }

    this.add.text(42, 28, "NOVA • NIVEL 2", {
      fontFamily: "Arial Black",
      fontSize: "26px",
      color: "#ffffff"
    }).setScrollFactor(0).setDepth(20);

    this.add.text(42, 63, "CAVERNAS CRISTAL • plataformas estrechas y enemigos", {
      fontFamily: "Arial",
      fontSize: "17px",
      color: "#b8bfd8"
    }).setScrollFactor(0).setDepth(20);
  }

  createLevel() {
    this.platforms = this.physics.add.staticGroup();

    const ground = [
      [250, 690, 500, 60],
      [830, 690, 330, 60],
      [1290, 690, 380, 60],
      [1810, 690, 360, 60],
      [2320, 690, 390, 60],
      [2860, 690, 360, 60],
      [3370, 690, 420, 60],
      [3900, 690, 420, 60],
      [4430, 690, 460, 60]
    ];
    ground.forEach(([x, y, w, h]) => this.addPlatform(x, y, w, h));

    const elevated = [
      [480, 520, 190, 30],
      [820, 470, 190, 30],
      [1280, 500, 190, 30],
      [1650, 430, 190, 30],
      [2050, 500, 180, 30],
      [2440, 420, 190, 30],
      [2940, 470, 190, 30],
      [3410, 390, 190, 30],
      [3910, 450, 180, 30],
      [4280, 360, 180, 30]
    ];
    elevated.forEach(([x, y, w, h]) => this.addPlatform(x, y, w, h));

    for (const x of [1110, 2150, 3200, 4200]) {
      this.addSign(x, 610, "SALTA");
    }
    this.addSign(4440, 595, "META");
  }

  addPlatform(x, y, width, height) {
    const platform = this.add.rectangle(x, y, width, height, 0x30294b)
      .setStrokeStyle(3, 0x554f78);

    this.physics.add.existing(platform, true);
    this.platforms.add(platform);

    this.add.rectangle(x, y - height / 2 + 5, width, 10, 0x66f0dc);
  }

  addSign(x, y, text) {
    this.add.text(x, y, text, {
      fontFamily: "Arial Black",
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#30294b",
      padding: { left: 8, right: 8, top: 5, bottom: 5 }
    }).setOrigin(0.5).setDepth(3);
  }

  createCoins() {
    [
      [300, 600], [400, 600], [500, 475],
      [850, 600], [850, 405], [1010, 600],
      [1320, 600], [1340, 435], [1580, 600],
      [1660, 365], [1890, 600], [2050, 440],
      [2150, 600], [2450, 355], [2560, 600],
      [2930, 410], [3050, 600], [3240, 600],
      [3420, 325], [3550, 600], [3950, 390],
      [4060, 600], [4300, 295], [4400, 600]
    ].forEach(([x, y]) => this.coins.add(new Coin(this, x, y)));
  }

  createCheckpoints() {
    [[1120, 590], [2720, 590], [3970, 590]].forEach(([x, y]) => {
      this.checkpoints.add(new Checkpoint(this, x, y));
    });
  }

  createEnemies() {
    [
      [410, 620, 290, 475],
      [880, 420, 770, 885],
      [1320, 620, 1175, 1435],
      [1690, 375, 1600, 1720],
      [2080, 450, 1995, 2115],
      [2490, 365, 2420, 2508],
      [2960, 415, 2868, 3010],
      [3460, 335, 3380, 3480],
      [3950, 395, 3860, 3975],
      [4320, 305, 4220, 4345]
    ].forEach(([x, y, minX, maxX]) => {
      this.enemies.add(new Enemy(this, x, y, minX, maxX));
    });
  }

  createHazards() {
    [
      [900, 640, 72],
      [1940, 640, 72],
      [2810, 640, 72],
      [3470, 640, 72],
      [4050, 640, 72]
    ].forEach(([x, y, width]) => this.hazards.add(new Hazard(this, x, y, width)));
  }

  createPowerUps() {
    [
      [430, 600, "speed"],
      [850, 405, "shield"],
      [1340, 455, "speed"],
      [2240, 600, "shield"],
      [3000, 600, "speed"],
      [3480, 335, "shield"],
      [3975, 390, "speed"],
      [4340, 305, "shield"]
    ].forEach(([x, y, type]) => this.powerUps.add(new PowerUp(this, x, y, type)));
  }

  createGoal() {
    const goal = this.add.rectangle(4500, 610, 58, 150, 0xffffff, 0.12)
      .setStrokeStyle(4, 0x66f0dc);

    this.physics.add.existing(goal);
    goal.body.allowGravity = false;
    goal.body.moves = false;
    this.goal = goal;

    this.add.text(4500, 520, "✦", {
      fontSize: "58px",
      color: "#66f0dc"
    }).setOrigin(0.5).setDepth(3);

    this.add.text(4500, 575, "META", {
      fontFamily: "Arial Black",
      fontSize: "24px",
      color: "#ffffff",
      stroke: "#30294b",
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(3);
  }

  createHud() {
    this.hud = this.add.text(28, 112, "", {
      fontFamily: "Arial Black",
      fontSize: "19px",
      color: "#ffffff",
      backgroundColor: "#30294bdd",
      padding: { left: 12, right: 12, top: 8, bottom: 8 }
    }).setScrollFactor(0).setDepth(20);

    this.message = this.add.text(640, 120, "", {
      fontFamily: "Arial Black",
      fontSize: "24px",
      color: "#ffffff",
      backgroundColor: "#30294bdd",
      padding: { left: 14, right: 14, top: 10, bottom: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20);

    this.updateHud(this.time.now);
  }

  updateHud(now) {
    const elapsed = Math.floor((now - this.startTime) / 1000);
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const seconds = String(elapsed % 60).padStart(2, "0");
    const active = [];

    if (this.speedBoostUntil > now) {
      active.push("⚡ " + Math.ceil((this.speedBoostUntil - now) / 1000) + "s");
    }
    if (this.shieldUntil > now) {
      active.push("🛡️ " + Math.ceil((this.shieldUntil - now) / 1000) + "s");
    }

    this.hud.setText(
      "VIDAS: " + this.lives +
      " • 🪙 " + this.coinsCollected +
      " • ⭐ " + this.score +
      " • ⏱ " + minutes + ":" + seconds +
      (active.length ? " • " + active.join("  ") : "")
    );
  }

  collectCoin(player, coin) {
    if (!coin.active || this.levelFinished || this.gameOver) return;
    coin.collect();
    this.coinsCollected += 1;
    this.score += 100;
  }

  touchCheckpoint(player, checkpoint) {
    if (!checkpoint.active || checkpoint.activated || this.levelFinished || this.gameOver) return;
    checkpoint.activate();
    this.respawnPoint = { x: checkpoint.x, y: checkpoint.y - 75 };
    this.score += 500;
    this.showMessage("CHECKPOINT ACTIVADO");
  }

  collectPowerUp(player, powerUp) {
    if (!powerUp.active || this.levelFinished || this.gameOver) return;
    const type = powerUp.type;
    powerUp.collect();

    if (type === "speed") {
      this.speedBoostUntil = this.time.now + 7000;
      this.player.setSpeedMultiplier(1.45);
      this.showMessage("⚡ IMPULSO");
    } else {
      this.shieldUntil = this.time.now + 8000;
      this.player.setShieldActive(true);
      this.showMessage("🛡️ ESCUDO");
    }
    this.score += 300;
  }

  updatePowerUpEffects(now) {
    if (this.speedBoostUntil > 0 && now >= this.speedBoostUntil) {
      this.speedBoostUntil = 0;
      this.player.setSpeedMultiplier(1);
    }

    if (this.shieldUntil > 0 && now >= this.shieldUntil) {
      this.shieldUntil = 0;
      this.player.setShieldActive(false);
    }
  }

  handleEnemyCollision(player, enemy) {
    if (!enemy.active || enemy.isDefeated || this.time.now < this.invulnerableUntil) return;

    const stomp = player.body.velocity.y > 0 && player.body.bottom <= enemy.body.top + 16;
    if (stomp) {
      enemy.defeat();
      player.setVelocityY(-520);
      this.score += 250;
      this.showMessage("¡ENEMIGO DERROTADO!");
      return;
    }

    if (this.player.shieldActive) {
      this.shieldUntil = 0;
      this.player.setShieldActive(false);
      enemy.defeat();
      player.setVelocityY(-380);
      this.score += 200;
      this.showMessage("🛡️ ESCUDO BLOQUEÓ EL GOLPE");
      return;
    }

    this.loseLife("¡CUIDADO!");
  }

  hitHazard() {
    if (this.time.now < this.invulnerableUntil || this.levelFinished || this.gameOver) return;

    if (this.player.shieldActive) {
      this.shieldUntil = 0;
      this.player.setShieldActive(false);
      this.player.setVelocityY(-320);
      this.showMessage("🛡️ ESCUDO BLOQUEÓ LA TRAMPA");
      return;
    }

    this.loseLife("¡TRAMPA!");
  }

  loseLife(reason) {
    if (this.time.now < this.invulnerableUntil || this.levelFinished || this.gameOver) return;

    this.lives -= 1;
    this.invulnerableUntil = this.time.now + 1300;
    this.speedBoostUntil = 0;
    this.shieldUntil = 0;
    this.player.clearPowerUps();
    this.cameras.main.shake(180, 0.012);
    this.cameras.main.flash(180, 255, 80, 80);
    this.showMessage(reason + " • VIDAS: " + this.lives);

    if (this.lives <= 0) {
      this.showGameOver();
      return;
    }

    this.respawnPlayer();
  }

  showMessage(text) {
    this.message.setText(text);
    this.message.setAlpha(1);
    this.tweens.killTweensOf(this.message);

    this.tweens.add({
      targets: this.message,
      alpha: 0,
      delay: 900,
      duration: 450,
      onComplete: () => {
        this.message.setAlpha(1);
        this.message.setText("");
      }
    });
  }

  showGameOver() {
    this.gameOver = true;
    this.player.setVelocity(0, 0);
    this.physics.pause();

    this.add.rectangle(640, 360, 620, 330, 0x10152b, 0.96)
      .setScrollFactor(0).setDepth(50)
      .setStrokeStyle(5, 0xe84d5b);

    this.add.text(640, 245, "GAME OVER", {
      fontFamily: "Arial Black",
      fontSize: "54px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

    this.add.text(640, 330, "NOVA se quedó sin vidas.
Puntuación: " + this.score, {
      fontFamily: "Arial",
      fontSize: "26px",
      color: "#8fe7ff",
      align: "center",
      lineSpacing: 12
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

    this.add.text(640, 445, "ENTER • REINTENTAR  |  ESC • MAPA", {
      fontFamily: "Arial Black",
      fontSize: "19px",
      color: "#36d399"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);
  }

  finishLevel() {
    if (this.levelFinished || this.gameOver) return;

    this.levelFinished = true;
    completeLevel(2);
    this.player.setVelocity(0, 0);
    this.physics.pause();

    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    const finalScore = this.score + Math.max(0, 1000 - elapsed * 10);

    this.add.rectangle(640, 360, 620, 350, 0x10152b, 0.95)
      .setScrollFactor(0).setDepth(50)
      .setStrokeStyle(5, 0x66f0dc);

    this.add.text(640, 245, "¡CAVERNA COMPLETADA!", {
      fontFamily: "Arial Black",
      fontSize: "43px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

    this.add.text(640, 330,
      "Monedas: " + this.coinsCollected + "
" +
      "Tiempo: " + elapsed + " s
" +
      "Puntuación: " + finalScore,
      {
        fontFamily: "Arial",
        fontSize: "25px",
        color: "#8fe7ff",
        align: "center",
        lineSpacing: 12
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(51);

    this.add.text(640, 455, "ENTER • MAPA    |    R • REPETIR    |    ESC • MENÚ", {
      fontFamily: "Arial Black",
      fontSize: "18px",
      color: "#36d399"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);
  }

  continueAfterFinish() {
    if (!this.levelFinished && !this.gameOver) return;
    if (this.levelFinished) this.scene.start("WorldMapScene");
    else this.scene.restart();
  }

  restartLevel() {
    if (!this.levelFinished && !this.gameOver) return;
    this.scene.restart();
  }

  returnToMap() {
    this.scene.start("WorldMapScene");
  }

  respawnPlayer() {
    this.player.setPosition(this.respawnPoint.x, this.respawnPoint.y);
    this.player.setVelocity(0, 0);
    this.player.clearPowerUps();
    this.player.setScale(1);
    this.player.setAlpha(1);
    this.cameras.main.flash(180, 255, 255, 255);

    this.tweens.killTweensOf(this.player);
    this.tweens.add({
      targets: this.player,
      alpha: 0.35,
      duration: 90,
      yoyo: true,
      repeat: 6,
      onComplete: () => {
        if (this.player.active && !this.gameOver) this.player.setAlpha(1);
      }
    });
  }
}
