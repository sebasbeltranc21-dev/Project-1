import Phaser from "phaser";
import Player from "../entities/Player.js";
import Coin from "../entities/Coin.js";
import Checkpoint from "../entities/Checkpoint.js";
import Enemy from "../entities/Enemy.js";
import Hazard from "../entities/Hazard.js";

export default class Level1Scene extends Phaser.Scene {
  constructor() {
    super("Level1Scene");
  }

  create() {
    this.worldWidth = 5200;
    this.worldHeight = 1100;
    this.spawnPoint = { x: 150, y: 560 };
    this.respawnPoint = { ...this.spawnPoint };
    this.score = 0;
    this.coinsCollected = 0;
    this.lives = 3;
    this.levelFinished = false;
    this.gameOver = false;
    this.invulnerableUntil = 0;
    this.startTime = this.time.now;

    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, this.worldWidth, 720);
    this.cameras.main.setBackgroundColor("#7dd8ff");

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

    this.createGoal();
    this.createHud();

    this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);
    this.physics.add.overlap(
      this.player,
      this.checkpoints,
      this.touchCheckpoint,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleEnemyCollision,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.hazards,
      this.hitHazard,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.goal,
      this.finishLevel,
      undefined,
      this
    );

    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setDeadzone(420, 180);

    this.input.keyboard.on("keydown-ESC", this.returnToMenu, this);
    this.input.keyboard.on("keydown-ENTER", this.restartAfterFinish, this);
  }

  update(time, delta) {
    if (this.levelFinished || this.gameOver) return;

    this.player.update(delta);
    this.enemies.getChildren().forEach((enemy) => enemy.update());

    if (this.player.y > 820) {
      this.respawnPlayer();
    }

    this.updateHud(time);
  }

  createBackground() {
    this.add.rectangle(
      this.worldWidth / 2,
      360,
      this.worldWidth,
      720,
      0x7dd8ff
    );

    for (let x = 160; x < this.worldWidth; x += 520) {
      this.add.ellipse(x, 120 + (x % 130), 190, 58, 0xffffff, 0.55);
      this.add.ellipse(x + 85, 108 + (x % 130), 150, 48, 0xffffff, 0.55);
    }

    for (let x = 0; x < this.worldWidth; x += 360) {
      this.add.ellipse(x + 180, 615, 380, 210, 0x4d9f68, 1);
      this.add.ellipse(x + 40, 635, 220, 150, 0x67b977, 0.9);
      this.add.ellipse(x + 330, 635, 220, 150, 0x67b977, 0.9);
    }

    this.add.text(42, 28, "NOVA • NIVEL 1", {
      fontFamily: "Arial Black",
      fontSize: "26px",
      color: "#10213c"
    }).setScrollFactor(0).setDepth(20);

    this.add.text(42, 63, "A/D o ←/→ • SHIFT correr • ESPACIO/W/↑ saltar", {
      fontFamily: "Arial",
      fontSize: "17px",
      color: "#214061"
    }).setScrollFactor(0).setDepth(20);
  }

  createLevel() {
    this.platforms = this.physics.add.staticGroup();

    this.addPlatform(260, 690, 520, 60);
    this.addPlatform(820, 690, 360, 60);
    this.addPlatform(1340, 690, 420, 60);
    this.addPlatform(1900, 690, 430, 60);
    this.addPlatform(2490, 690, 420, 60);
    this.addPlatform(3080, 690, 420, 60);
    this.addPlatform(3670, 690, 460, 60);
    this.addPlatform(4310, 690, 460, 60);
    this.addPlatform(4920, 690, 560, 60);

    const elevated = [
      [480, 540, 240, 32],
      [900, 485, 230, 32],
      [1420, 525, 240, 32],
      [1780, 445, 220, 32],
      [2110, 520, 250, 32],
      [2600, 475, 230, 32],
      [3180, 390, 240, 32],
      [3760, 470, 240, 32],
      [4200, 390, 220, 32],
      [4680, 500, 240, 32]
    ];

    elevated.forEach(([x, y, width, height]) => {
      this.addPlatform(x, y, width, height);
    });

    for (const x of [1160, 2320, 2900, 3500, 4130, 4770]) {
      this.addSign(x, 612, "SALTA");
    }

    this.addSign(5080, 595, "META");
  }

  addPlatform(x, y, width, height) {
    const platform = this.add.rectangle(x, y, width, height, 0x674b35)
      .setStrokeStyle(3, 0x3a2a20);

    this.physics.add.existing(platform, true);
    this.platforms.add(platform);

    this.add.rectangle(
      x,
      y - height / 2 + 6,
      width,
      12,
      0x36a65d
    );
  }

  addSign(x, y, text) {
    this.add.text(x, y, text, {
      fontFamily: "Arial Black",
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#214061",
      padding: { left: 8, right: 8, top: 5, bottom: 5 }
    }).setOrigin(0.5).setDepth(3);
  }

  createCoins() {
    const positions = [
      [330, 600], [430, 600], [530, 600],
      [860, 600], [950, 430], [1040, 600],
      [1410, 600], [1510, 470], [1610, 600],
      [1780, 390], [1900, 600], [2050, 600],
      [2150, 465], [2260, 600], [2620, 420],
      [2730, 600], [2850, 600], [3210, 335],
      [3320, 600], [3420, 600], [3770, 420],
      [3880, 600], [3990, 600], [4230, 335],
      [4350, 600], [4450, 600], [4690, 450], [5050, 600]
    ];

    positions.forEach(([x, y]) => {
      this.coins.add(new Coin(this, x, y));
    });
  }

  createCheckpoints() {
    [
      [1100, 590],
      [3140, 590],
      [4140, 590]
    ].forEach(([x, y]) => {
      this.checkpoints.add(new Checkpoint(this, x, y));
    });
  }

  createEnemies() {
    const enemies = [
      [430, 620, 310, 485],
      [875, 420, 815, 975],
      [1400, 620, 1190, 1505],
      [1780, 380, 1690, 1870],
      [2140, 470, 2015, 2325],
      [2640, 420, 2510, 2690],
      [3220, 335, 3080, 3280],
      [3790, 415, 3660, 3870],
      [4220, 335, 4110, 4300],
      [4700, 450, 4575, 4780]
    ];

    enemies.forEach(([x, y, minX, maxX]) => {
      this.enemies.add(new Enemy(this, x, y, minX, maxX));
    });
  }

  createHazards() {
    [
      [1080, 640, 72],
      [2200, 640, 90],
      [2910, 640, 72],
      [3440, 640, 90],
      [4435, 640, 72],
      [4850, 640, 90]
    ].forEach(([x, y, width]) => {
      this.hazards.add(new Hazard(this, x, y, width));
    });
  }

  createGoal() {
    const goal = this.add.rectangle(5100, 610, 56, 150, 0xffffff, 0.18)
      .setStrokeStyle(4, 0xffd34e);

    this.physics.add.existing(goal);
    goal.body.allowGravity = false;
    goal.body.moves = false;
    goal.setDepth(2);

    this.goal = goal;

    this.add.text(5100, 520, "🚀", {
      fontSize: "54px"
    }).setOrigin(0.5).setDepth(3);

    this.add.text(5100, 575, "META", {
      fontFamily: "Arial Black",
      fontSize: "24px",
      color: "#ffffff",
      stroke: "#214061",
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(3);
  }

  createHud() {
    this.hud = this.add.text(28, 112, "", {
      fontFamily: "Arial Black",
      fontSize: "20px",
      color: "#10213c",
      backgroundColor: "#ffffffdd",
      padding: { left: 12, right: 12, top: 8, bottom: 8 }
    }).setScrollFactor(0).setDepth(20);

    this.message = this.add.text(640, 120, "", {
      fontFamily: "Arial Black",
      fontSize: "25px",
      color: "#ffffff",
      backgroundColor: "#214061dd",
      padding: { left: 14, right: 14, top: 10, bottom: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20);

    this.updateHud(this.time.now);
  }

  updateHud(now) {
    const elapsed = Math.floor((now - this.startTime) / 1000);
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const seconds = String(elapsed % 60).padStart(2, "0");

    this.hud.setText(
      "VIDAS: " + this.lives +
      "   •   🪙 " + this.coinsCollected +
      "   •   ⭐ " + this.score +
      "   •   ⏱ " + minutes + ":" + seconds
    );
  }

  collectCoin(player, coin) {
    if (!coin.active) return;

    coin.collect();
    this.coinsCollected += 1;
    this.score += 100;

    this.tweens.add({
      targets: this.player,
      scale: 1.12,
      duration: 80,
      yoyo: true
    });
  }

  touchCheckpoint(player, checkpoint) {
    if (!checkpoint.activate()) return;

    this.respawnPoint = {
      x: checkpoint.x,
      y: checkpoint.y - 75
    };
    this.score += 500;

    this.message.setText("CHECKPOINT ACTIVADO");
    this.tweens.add({
      targets: this.message,
      alpha: 0,
      delay: 1200,
      duration: 500,
      onComplete: () => {
        this.message.setAlpha(1);
        this.message.setText("");
      }
    });
  }

  handleEnemyCollision(player, enemy) {
    if (!enemy.active || enemy.isDefeated || this.time.now < this.invulnerableUntil) return;

    const falling = player.body.velocity.y > 0;
    const stomp = falling && player.body.bottom <= enemy.body.top + 16;

    if (stomp) {
      enemy.defeat();
      player.setVelocityY(-520);
      this.score += 250;
      this.showMessage("¡ENEMIGO DERROTADO!");
      return;
    }

    this.loseLife("¡CUIDADO!");
  }

  hitHazard() {
    if (this.time.now < this.invulnerableUntil || this.levelFinished || this.gameOver) return;
    this.loseLife("¡TRAMPA!");
  }

  loseLife(reason) {
    if (this.time.now < this.invulnerableUntil || this.levelFinished || this.gameOver) return;

    this.lives -= 1;
    this.invulnerableUntil = this.time.now + 1300;
    this.cameras.main.shake(180, 0.012);
    this.cameras.main.flash(180, 255, 80, 80);
    this.showMessage(reason + "  •  VIDAS: " + this.lives);

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

    this.add.rectangle(640, 360, 620, 330, 0x10152b, 0.95)
      .setScrollFactor(0)
      .setDepth(50)
      .setStrokeStyle(5, 0xe84d5b);

    this.add.text(640, 245, "GAME OVER", {
      fontFamily: "Arial Black",
      fontSize: "54px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

    this.add.text(
      640,
      330,
      "NOVA se quedó sin vidas.\nTu puntuación: " + this.score,
      {
        fontFamily: "Arial",
        fontSize: "26px",
        color: "#8fe7ff",
        align: "center",
        lineSpacing: 12
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(51);

    this.add.text(640, 445, "ENTER • REINTENTAR    |    ESC • MENÚ", {
      fontFamily: "Arial Black",
      fontSize: "19px",
      color: "#36d399"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);
  }

  finishLevel() {
    if (this.levelFinished || this.gameOver) return;

    this.levelFinished = true;
    this.player.setVelocity(0, 0);
    this.physics.pause();

    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    const timeBonus = Math.max(0, 1000 - elapsed * 10);
    const finalScore = this.score + timeBonus;

    this.add.rectangle(640, 360, 620, 350, 0x10152b, 0.94)
      .setScrollFactor(0)
      .setDepth(50)
      .setStrokeStyle(5, 0xffd34e);

    this.add.text(640, 240, "¡NIVEL COMPLETADO!", {
      fontFamily: "Arial Black",
      fontSize: "45px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

    this.add.text(640, 320,
      "Monedas: " + this.coinsCollected + "\n" +
      "Tiempo: " + elapsed + " s\n" +
      "Bonus: " + timeBonus + "\n" +
      "Puntuación: " + finalScore,
      {
        fontFamily: "Arial",
        fontSize: "25px",
        color: "#8fe7ff",
        align: "center",
        lineSpacing: 12
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(51);

    this.add.text(640, 455, "ENTER • JUGAR DE NUEVO    |    ESC • MENÚ", {
      fontFamily: "Arial Black",
      fontSize: "19px",
      color: "#36d399"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);
  }

  restartAfterFinish() {
    if (!this.levelFinished && !this.gameOver) return;
    this.scene.restart();
  }

  returnToMenu() {
    this.scene.start("MainMenuScene");
  }

  respawnPlayer() {
    this.player.setPosition(this.respawnPoint.x, this.respawnPoint.y);
    this.player.setVelocity(0, 0);
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
        if (this.player.active && !this.gameOver) {
          this.player.setAlpha(1);
        }
      }
    });
  }
}
