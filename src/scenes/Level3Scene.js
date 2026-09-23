import Phaser from "phaser";
import Player from "../entities/Player.js";
import Coin from "../entities/Coin.js";
import PowerUp from "../entities/PowerUp.js";
import Hazard from "../entities/Hazard.js";
import Boss from "../entities/Boss.js";
import AudioSystem from "../systems/AudioSystem.js";
import { completeLevel } from "../systems/Progress.js";
import { createPauseOverlay, createVignette, flashPlayer } from "../systems/Polish.js";

export default class Level3Scene extends Phaser.Scene {
  constructor() {
    super("Level3Scene");
  }

  create() {
    this.worldWidth = 3200;
    this.bossArena = { left: 300, right: 2900 };
    this.spawnPoint = { x: 560, y: 560 };
    this.respawnPoint = { ...this.spawnPoint };
    this.score = 0;
    this.coinsCollected = 0;
    this.lives = 3;
    this.levelFinished = false;
    this.gameOver = false;
    this.isPaused = false;
    this.bossDefeated = false;
    this.bossAttackTimer = 1400;
    this.invulnerableUntil = 0;
    this.speedBoostUntil = 0;
    this.shieldUntil = 0;
    this.startTime = this.time.now;
    this.audio = new AudioSystem(this);
    this.audio.startMusic();

    this.physics.world.setBounds(0, 0, this.worldWidth, 720);

    this.createBackground();
    this.createArena();

    this.player = new Player(this, this.spawnPoint.x, this.spawnPoint.y);
    this.physics.add.collider(this.player, this.platforms);

    this.coins = this.physics.add.group();
    this.createCoins();

    this.powerUps = this.physics.add.group();
    this.createPowerUps();

    this.hazards = this.physics.add.staticGroup();
    this.createHazards();

    this.bossProjectiles = this.physics.add.group();
    this.boss = new Boss(this, 2200, 560, 1850, 2580);

    this.createHud();
    this.pauseOverlay = createPauseOverlay(this, "P • CONTINUAR  •  ESC • MAPA  •  M • AUDIO");
    this.vignette = createVignette(this);
    this.events.once("shutdown", () => this.audio.destroy());

    this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);
    this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, undefined, this);
    this.physics.add.overlap(this.player, this.hazards, this.hitHazard, undefined, this);
    this.physics.add.overlap(this.player, this.boss, this.handleBossCollision, undefined, this);
    this.physics.add.overlap(this.player, this.bossProjectiles, this.hitByProjectile, undefined, this);

    this.cameras.main.setBounds(0, 0, this.worldWidth, 720);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(380, 180);

    this.input.keyboard.on("keydown-ESC", this.returnToMap, this);
    this.input.keyboard.on("keydown-P", this.togglePause, this);
    this.input.keyboard.on("keydown-M", this.toggleAudio, this);
    this.input.keyboard.on("keydown-R", this.restartLevel, this);
    this.input.keyboard.on("keydown-ENTER", this.continueAfterFinish, this);
  }

  update(time, delta) {
    if (this.levelFinished || this.gameOver || this.isPaused) return;

    this.updatePowerUpEffects(time);
    this.player.update(delta);
    this.boss.update();

    this.bossAttackTimer -= delta;
    if (this.bossAttackTimer <= 0 && !this.boss.defeated) {
      this.boss.attack(this.player);
      this.bossAttackTimer = this.boss.phase === 3 ? 700 : this.boss.phase === 2 ? 950 : 1250;
    }

    if (this.player.y > 820) {
      this.loseLife("CAÍSTE");
    }

    this.updateHud(time);
  }

  createBackground() {
    this.add.rectangle(1600, 360, 3200, 720, 0x130e27);
    this.add.rectangle(1600, 235, 3200, 170, 0x231a45, 0.75);

    for (let x = 200; x < 3200; x += 240) {
      this.add.ellipse(x, 140 + (x % 100), 110, 240, 0x432f79, 0.7);
      this.add.circle(x + 25, 135 + (x % 90), 10, 0x66f0dc, 0.8);
    }

    for (let x = 250; x < 3150; x += 320) {
      this.add.star(x, 300 + (x % 100), 5, 8, 20, 0xffd34e, 0.35);
    }

    this.add.text(42, 28, "NOVA • ARENA DEL NÚCLEO", {
      fontFamily: "Arial Black",
      fontSize: "26px",
      color: "#ffffff"
    }).setScrollFactor(0).setDepth(20);

    this.add.text(42, 63, "DERROTA A ASTRAX • P para pausar • M para audio", {
      fontFamily: "Arial",
      fontSize: "17px",
      color: "#b8bfd8"
    }).setScrollFactor(0).setDepth(20);
  }

  createArena() {
    this.platforms = this.physics.add.staticGroup();

    this.addPlatform(1600, 690, 3200, 60);
    this.addPlatform(860, 520, 300, 30);
    this.addPlatform(1430, 470, 260, 30);
    this.addPlatform(1950, 500, 300, 30);
    this.addPlatform(2520, 470, 260, 30);

    this.add.rectangle(110, 360, 70, 720, 0x211a3c);
    this.add.rectangle(3090, 360, 70, 720, 0x211a3c);

    this.add.text(1600, 165, "ASTRAX • GUARDIÁN DEL NÚCLEO", {
      fontFamily: "Arial Black",
      fontSize: "36px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 7
    }).setOrigin(0.5).setDepth(3);
  }

  addPlatform(x, y, width, height) {
    const platform = this.add.rectangle(x, y, width, height, 0x30294b)
      .setStrokeStyle(3, 0x554f78);

    this.physics.add.existing(platform, true);
    this.platforms.add(platform);

    this.add.rectangle(x, y - height / 2 + 5, width, 10, 0x8f7bff);
  }

  createCoins() {
    [
      [520, 600], [650, 600], [780, 600],
      [910, 430], [1430, 380], [1600, 380],
      [2050, 410], [2190, 600], [2530, 380],
      [2720, 600], [2860, 600]
    ].forEach(([x, y]) => this.coins.add(new Coin(this, x, y)));
  }

  createPowerUps() {
    [
      [700, 600, "speed"],
      [1600, 410, "shield"],
      [2360, 600, "speed"],
      [2700, 410, "shield"]
    ].forEach(([x, y, type]) => this.powerUps.add(new PowerUp(this, x, y, type)));
  }

  createHazards() {
    [
      [1120, 640, 72],
      [1450, 640, 72],
      [2500, 640, 72]
    ].forEach(([x, y, width]) => this.hazards.add(new Hazard(this, x, y, width)));
  }

  createHud() {
    this.hud = this.add.text(28, 112, "", {
      fontFamily: "Arial Black",
      fontSize: "20px",
      color: "#ffffff",
      backgroundColor: "#30294bdd",
      padding: { left: 12, right: 12, top: 8, bottom: 8 }
    }).setScrollFactor(0).setDepth(20);

    this.bossBarBg = this.add.rectangle(640, 32, 520, 24, 0x1b1634)
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(20);

    this.bossBar = this.add.rectangle(640, 32, 520, 24, 0xff5d72)
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(21);

    this.bossBarLabel = this.add.text(640, 44, "ASTRAX • 18 / 18", {
      fontFamily: "Arial Black",
      fontSize: "16px",
      color: "#ffffff"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(22);

    this.message = this.add.text(640, 118, "", {
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

    if (this.speedBoostUntil > now) active.push("⚡ " + Math.ceil((this.speedBoostUntil - now) / 1000) + "s");
    if (this.shieldUntil > now) active.push("🛡️ " + Math.ceil((this.shieldUntil - now) / 1000) + "s");

    this.hud.setText(
      "VIDAS: " + this.lives +
      " • 🪙 " + this.coinsCollected +
      " • ⭐ " + this.score +
      " • ⏱ " + minutes + ":" + seconds +
      (active.length ? " • " + active.join("  ") : "")
    );

    const ratio = Phaser.Math.Clamp(this.boss.health / this.boss.maxHealth, 0, 1);
    this.bossBar.setScale(ratio, 1);
    this.bossBarLabel.setText("ASTRAX • " + Math.max(0, this.boss.health) + " / " + this.boss.maxHealth);
  }

  collectCoin(player, coin) {
    if (!coin.active || this.levelFinished || this.gameOver) return;

    coin.collect();
    this.coinsCollected += 1;
    this.score += 100;
    this.audio.coin();
  }

  collectPowerUp(player, powerUp) {
    if (!powerUp.active || this.levelFinished || this.gameOver) return;

    const type = powerUp.type;
    powerUp.collect();
    this.score += 300;

    if (type === "speed") {
      this.speedBoostUntil = this.time.now + 7000;
      this.player.setSpeedMultiplier(1.45);
      this.audio.powerUp("speed");
      this.showBossMessage("⚡ IMPULSO ACTIVADO");
    } else {
      this.shieldUntil = this.time.now + 8000;
      this.player.setShieldActive(true);
      this.audio.powerUp("shield");
      this.showBossMessage("🛡️ ESCUDO ACTIVADO");
    }
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

  handleBossCollision(player, boss) {
    if (!boss.active || boss.defeated || this.levelFinished || this.gameOver) return;
    if (this.time.now < this.invulnerableUntil) return;

    const stomp = player.body.velocity.y > 0 && player.body.bottom <= boss.body.top + 45;

    if (stomp) {
      if (boss.hit()) {
        player.setVelocityY(-590);
        this.score += 400;
        this.showBossMessage("¡GOLPE AL NÚCLEO!");
      }
      return;
    }

    if (this.player.shieldActive) {
      this.shieldUntil = 0;
      this.player.setShieldActive(false);
      this.player.setVelocity(-280, -360);
      this.audio.bossHit();
      this.showBossMessage("🛡️ EL ESCUDO TE SALVÓ");
      return;
    }

    this.loseLife("¡ASTRAX TE ALCANZÓ!");
  }

  hitByProjectile(player, projectile) {
    if (!projectile.active || this.levelFinished || this.gameOver) return;

    projectile.destroy();

    if (this.time.now < this.invulnerableUntil) return;

    if (this.player.shieldActive) {
      this.shieldUntil = 0;
      this.player.setShieldActive(false);
      this.audio.bossHit();
      this.showBossMessage("🛡️ PROYECTIL BLOQUEADO");
      return;
    }

    this.loseLife("¡PROYECTIL!");
  }

  loseLife(reason) {
    if (this.time.now < this.invulnerableUntil || this.levelFinished || this.gameOver) return;

    this.lives -= 1;
    this.invulnerableUntil = this.time.now + 1400;
    this.speedBoostUntil = 0;
    this.shieldUntil = 0;
    this.player.clearPowerUps();
    this.audio.damage();
    this.cameras.main.shake(220, 0.015);
    this.cameras.main.flash(180, 255, 80, 80);
    this.showBossMessage(reason + " • VIDAS: " + this.lives);

    if (this.lives <= 0) {
      this.showGameOver();
      return;
    }

    this.respawnPlayer();
  }

  showBossMessage(text) {
    this.message.setText(text);
    this.message.setAlpha(1);
    this.tweens.killTweensOf(this.message);
    this.tweens.add({
      targets: this.message,
      alpha: 0,
      delay: 850,
      duration: 400,
      onComplete: () => {
        this.message.setAlpha(1);
        this.message.setText("");
      }
    });
  }

  showGameOver() {
    this.gameOver = true;
    this.audio.gameOver();
    this.audio.stopMusic();
    this.physics.pause();

    this.add.rectangle(640, 360, 640, 340, 0x10152b, 0.97)
      .setScrollFactor(0).setDepth(50)
      .setStrokeStyle(5, 0xe84d5b);

    this.add.text(640, 245, "ASTRAX TE DERROTÓ", {
      fontFamily: "Arial Black",
      fontSize: "48px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

    this.add.text(640, 335, "Puntuación: " + this.score, {
      fontFamily: "Arial",
      fontSize: "27px",
      color: "#8fe7ff"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

    this.add.text(640, 445, "ENTER • REINTENTAR  |  ESC • MAPA", {
      fontFamily: "Arial Black",
      fontSize: "19px",
      color: "#36d399"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);
  }

  finishBoss() {
    if (this.levelFinished || this.gameOver) return;

    this.bossDefeated = true;
    this.levelFinished = true;
    completeLevel(3);
    this.audio.stopMusic();
    this.audio.victory();

    this.add.rectangle(640, 360, 700, 400, 0x10152b, 0.97)
      .setScrollFactor(0).setDepth(50)
      .setStrokeStyle(5, 0xffd34e);

    this.add.text(640, 225, "¡NÚCLEO LIBERADO!", {
      fontFamily: "Arial Black",
      fontSize: "48px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

    this.add.text(640, 315, "ASTRAX ha caído.\nNOVA ha salvado el Mundo 1.", {
      fontFamily: "Arial",
      fontSize: "27px",
      color: "#8fe7ff",
      align: "center",
      lineSpacing: 14
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

    this.add.text(640, 405,
      "Monedas: " + this.coinsCollected + "\n" +
      "Puntuación: " + this.score,
      {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#b8bfd8",
        align: "center"
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(51);

    this.add.text(640, 490, "ENTER • MAPA    |    R • REPETIR", {
      fontFamily: "Arial Black",
      fontSize: "19px",
      color: "#36d399"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);
  }

  continueAfterFinish() {
    if (!this.levelFinished && !this.gameOver) return;

    if (this.levelFinished) {
      this.scene.start("WorldMapScene");
    } else {
      this.scene.restart();
    }
  }

  restartLevel() {
    if (!this.levelFinished && !this.gameOver) return;
    this.scene.restart();
  }

  returnToMap() {
    this.audio.stopMusic();
    this.scene.start("WorldMapScene");
  }

  togglePause() {
    if (this.levelFinished || this.gameOver) return;

    this.isPaused = !this.isPaused;
    this.pauseOverlay.setVisible(this.isPaused);
    this.vignette.setFillStyle(0x000000, this.isPaused ? 0.45 : 0);

    if (this.isPaused) {
      this.physics.pause();
      this.tweens.pauseAll();
      this.audio.stopMusic();
    } else {
      this.physics.resume();
      this.tweens.resumeAll();
      this.audio.startMusic();
    }
  }

  toggleAudio() {
    this.audio.setEnabled(!this.audio.enabled);
    this.showBossMessage(this.audio.enabled ? "🔊 AUDIO ACTIVADO" : "🔇 AUDIO DESACTIVADO");
  }

  respawnPlayer() {
    this.player.setPosition(this.respawnPoint.x, this.respawnPoint.y);
    this.player.setVelocity(0, 0);
    this.player.clearPowerUps();
    this.player.setScale(1);
    this.player.setAlpha(1);
    flashPlayer(this);
  }
}
