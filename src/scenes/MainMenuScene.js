import Phaser from "phaser";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x10152b)
      .setOrigin(0.5);

    this.add
      .text(width / 2, 155, "PROJECT 1", {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "76px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 235, "AVENTURA DE PLATAFORMAS", {
        fontFamily: "Arial, sans-serif",
        fontSize: "28px",
        color: "#8fe7ff",
        fontStyle: "bold",
        letterSpacing: 2
      })
      .setOrigin(0.5);

    const startButton = this.add
      .rectangle(width / 2, 390, 310, 90, 0x36d399, 1)
      .setStrokeStyle(4, 0xffffff)
      .setInteractive({ useHandCursor: true });

    const startLabel = this.add
      .text(width / 2, 390, "JUGAR", {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "38px",
        color: "#10152b"
      })
      .setOrigin(0.5);

    startButton.on("pointerover", () => {
      startButton.setFillStyle(0x57e6b2);
      startLabel.setScale(1.05);
    });

    startButton.on("pointerout", () => {
      startButton.setFillStyle(0x36d399);
      startLabel.setScale(1);
    });

    startButton.on("pointerdown", () => this.scene.start("PrototypeScene"));

    this.add
      .text(width / 2, 535, "ENTER o clic en JUGAR", {
        fontFamily: "Arial, sans-serif",
        fontSize: "22px",
        color: "#b8bfd8"
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 650, "Fase 1 • Motor y estructura base", {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        color: "#69718f"
      })
      .setOrigin(0.5);

    this.input.keyboard.once("keydown-ENTER", () => {
      this.scene.start("PrototypeScene");
    });
  }
}
