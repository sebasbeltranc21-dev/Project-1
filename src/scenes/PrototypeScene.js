import Phaser from "phaser";
import Player from "../entities/Player.js";

export default class PrototypeScene extends Phaser.Scene {
  constructor() {
    super("PrototypeScene");
  }

  create() {
    this.worldWidth = 4200;
    this.spawnPoint = { x: 140, y: 560 };

    this.physics.world.setBounds(0, 0, this.worldWidth, 720);
    this.cameras.main.setBounds(0, 0, this.worldWidth, 720);
    this.cameras.main.setBackgroundColor("#7dd8ff");

    this.createBackground();
    this.createLevel();

    this.player = new Player(this, this.spawnPoint.x, this.spawnPoint.y);
    this.physics.add.collider(this.player, this.platforms);

    this.createHud();

    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setDeadzone(420, 180);

    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.start("MainMenuScene");
    });
  }

  update(time, delta) {
    this.player.update(delta);

    if (this.player.y > 820) {
      this.respawnPlayer();
    }

    this.updateHud();
  }

  createBackground() {
    this.add.rectangle(this.worldWidth / 2, 360, this.worldWidth, 720, 0x7dd8ff)
      .setScrollFactor(1);

    for (let x = 160; x < this.worldWidth; x += 520) {
      this.add.ellipse(x, 120 + (x % 130), 190, 58, 0xffffff, 0.55);
      this.add.ellipse(x + 85, 108 + (x % 130), 150, 48, 0xffffff, 0.55);
    }

    for (let x = 0; x < this.worldWidth; x += 360) {
      this.add.ellipse(x + 180, 615, 380, 210, 0x4d9f68, 1);
      this.add.ellipse(x + 40, 635, 220, 150, 0x67b977, 0.9);
      this.add.ellipse(x + 330, 635, 220, 150, 0x67b977, 0.9);
    }

    this.add.text(42, 30, "FASE 2 • MOVIMIENTO", {
      fontFamily: "Arial Black",
      fontSize: "26px",
      color: "#10213c"
    }).setScrollFactor(0);

    this.add.text(42, 66, "A/D o ←/→ • SHIFT correr • ESPACIO/W/↑ saltar", {
      fontFamily: "Arial",
      fontSize: "19px",
      color: "#214061"
    }).setScrollFactor(0);
  }

  createLevel() {
    this.platforms = this.physics.add.staticGroup();

    this.addPlatform(2100, 690, 4200, 60);
    this.addPlatform(380, 565, 280, 32);
    this.addPlatform(780, 485, 250, 32);
    this.addPlatform(1160, 405, 230, 32);
    this.addPlatform(1540, 505, 300, 32);
    this.addPlatform(1940, 425, 260, 32);
    this.addPlatform(2360, 535, 280, 32);
    this.addPlatform(2760, 430, 260, 32);
    this.addPlatform(3160, 345, 230, 32);
    this.addPlatform(3540, 480, 300, 32);

    const sign = this.add.text(3890, 590, "FIN DEL
PROTOTIPO", {
      fontFamily: "Arial Black",
      fontSize: "24px",
      color: "#ffffff",
      align: "center",
      stroke: "#214061",
      strokeThickness: 5
    }).setOrigin(0.5);

    sign.setDepth(3);
  }

  addPlatform(x, y, width, height) {
    const platform = this.add.rectangle(x, y, width, height, 0x674b35)
      .setStrokeStyle(3, 0x3a2a20);

    this.physics.add.existing(platform, true);
    this.platforms.add(platform);

    this.add.rectangle(x, y - height / 2 + 6, width, 12, 0x36a65d);
  }

  createHud() {
    this.hud = this.add.text(0, 0, "", {
      fontFamily: "Arial Black",
      fontSize: "20px",
      color: "#10213c",
      backgroundColor: "#ffffffaa",
      padding: { left: 14, right: 14, top: 9, bottom: 9 }
    }).setScrollFactor(0).setDepth(20);

    this.tip = this.add.text(1280, 28, "ESC • MENÚ", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#214061",
      backgroundColor: "#ffffff99",
      padding: 8
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(20);

    this.updateHud();
  }

  updateHud() {
    const speed = Math.round(Math.abs(this.player.body.velocity.x));
    const state = !this.player.body.blocked.down
      ? "SALTANDO"
      : speed > 25
        ? "CORRIENDO"
        : "LISTO";

    this.hud.setText("NOVA  •  " + state + "  •  " + speed + " px/s");
  }

  respawnPlayer() {
    this.player.setPosition(this.spawnPoint.x, this.spawnPoint.y);
    this.player.setVelocity(0, 0);
    this.cameras.main.flash(180, 255, 255, 255);
  }
}
