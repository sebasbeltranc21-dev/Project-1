import Phaser from "phaser";

export default class PrototypeScene extends Phaser.Scene {
  constructor() {
    super("PrototypeScene");
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#7dd8ff");

    this.add.rectangle(width / 2, 590, width, 260, 0x6bc47a);
    this.add.rectangle(width / 2, 665, width, 110, 0x3f8d57);

    this.add.text(40, 35, "PROTOTIPO • FASE 1", {
      fontFamily: "Arial Black",
      fontSize: "26px",
      color: "#10213c"
    });

    this.add.text(40, 78, "Motor cargado. Esta escena sera el primer nivel.", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#214061"
    });

    const platforms = [
      [640, 650, 1280, 140],
      [260, 505, 260, 35],
      [650, 425, 280, 35],
      [1040, 340, 240, 35]
    ];

    platforms.forEach(([x, y, w, h]) => {
      this.add.rectangle(x, y, w, h, 0x674b35).setStrokeStyle(3, 0x3a2a20);
      this.add.rectangle(x, y - h / 2 + 6, w, 12, 0x36a65d);
    });

    const player = this.add.rectangle(135, 555, 42, 58, 0xffd34e)
      .setStrokeStyle(4, 0x8c5c00);

    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);
    player.body.setAllowGravity(false);

    this.add.text(width / 2, 170, "SIGUIENTE: MOVIMIENTO + SALTO", {
      fontFamily: "Arial Black",
      fontSize: "34px",
      color: "#ffffff",
      stroke: "#214061",
      strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(width / 2, 220, "La base del escenario ya esta lista para la Fase 2.", {
      fontFamily: "Arial",
      fontSize: "21px",
      color: "#ffffff",
      stroke: "#214061",
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(width - 40, 40, "ESC • MENU", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#214061"
    }).setOrigin(1, 0);

    this.input.keyboard.once("keydown-ESC", () => this.scene.start("MainMenuScene"));
  }
}
