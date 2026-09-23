import Phaser from "phaser";
import { getProgress } from "../systems/Progress.js";
import AudioSystem from "../systems/AudioSystem.js";

export default class WorldMapScene extends Phaser.Scene {
  constructor() {
    super("WorldMapScene");
  }

  create() {
    const { width, height } = this.scale;
    this.progress = getProgress();
    this.audio = new AudioSystem(this);
    this.audio.startMusic();
    this.events.once("shutdown", () => this.audio.destroy());

    this.levelCount = 3;
    this.selectIndex = Phaser.Math.Clamp(this.progress.unlockedLevel - 1, 0, this.levelCount - 1);
    this.cards = [];

    this.cameras.main.setBackgroundColor("#0e1630");

    this.add.rectangle(width / 2, height / 2, width, height, 0x0e1630);
    this.add.ellipse(180, 160, 360, 220, 0x244b72, 0.55);
    this.add.ellipse(1110, 590, 520, 280, 0x421f69, 0.4);

    this.add.text(width / 2, 58, "MAPA DE AVENTURA", {
      fontFamily: "Arial Black",
      fontSize: "42px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 7
    }).setOrigin(0.5);

    this.add.text(width / 2, 108, "MUNDO 1 • LAS TIERRAS DE NOVA", {
      fontFamily: "Arial",
      fontSize: "19px",
      color: "#8fe7ff",
      fontStyle: "bold",
      letterSpacing: 2
    }).setOrigin(0.5);

    this.createPath();

    this.createLevelCard(220, 350, 1, "PRADERA NEON", "Nivel 1", 0x36d399);
    this.createLevelCard(640, 350, 2, "CAVERNAS CRISTAL", "Nivel 2", 0x8f7bff);
    this.createLevelCard(1060, 350, 3, "ARENA DEL NUCLEO", "Jefe final", 0xff5d72);

    this.add.text(width / 2, 620, "A/D o ←/→ elegir • ENTER entrar • ESC volver • M audio", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#b8bfd8"
    }).setOrigin(0.5);

    this.input.keyboard.on("keydown-LEFT", () => this.moveSelection(-1));
    this.input.keyboard.on("keydown-A", () => this.moveSelection(-1));
    this.input.keyboard.on("keydown-RIGHT", () => this.moveSelection(1));
    this.input.keyboard.on("keydown-D", () => this.moveSelection(1));
    this.input.keyboard.on("keydown-ENTER", () => this.openSelected());
    this.input.keyboard.on("keydown-ESC", () => this.scene.start("MainMenuScene"));
    this.input.keyboard.on("keydown-M", () => this.audio.setEnabled(!this.audio.enabled));

    this.refreshCards();
  }

  createPath() {
    this.add.line(430, 350, -210, 0, 210, 0, 0xc9d1e8, 0.35)
      .setLineWidth(8)
      .setDepth(1);

    this.add.line(850, 350, -210, 0, 210, 0, 0xc9d1e8, 0.35)
      .setLineWidth(8)
      .setDepth(1);

    [220, 640, 1060].forEach((x, index) => {
      const colors = [0x36d399, 0x8f7bff, 0xff5d72];
      this.add.circle(x, 350, 34, colors[index]).setStrokeStyle(4, 0xffffff);
    });
  }

  createLevelCard(x, y, number, title, subtitle, accent) {
    const locked = number > this.progress.unlockedLevel;
    const card = this.add.rectangle(x, y, 365, 340, 0x182344, 0.98)
      .setStrokeStyle(5, accent)
      .setInteractive({ useHandCursor: !locked });

    const numberText = this.add.text(x - 135, y - 130, "NIVEL " + number, {
      fontFamily: "Arial Black",
      fontSize: "20px",
      color: "#ffffff"
    });

    const titleText = this.add.text(x, y - 62, title, {
      fontFamily: "Arial Black",
      fontSize: "25px",
      color: locked ? "#66708e" : "#ffffff",
      align: "center",
      wordWrap: { width: 310 }
    }).setOrigin(0.5);

    const subtitleText = this.add.text(x, y + 5, subtitle, {
      fontFamily: "Arial",
      fontSize: "19px",
      color: locked ? "#525c78" : "#b8bfd8",
      align: "center"
    }).setOrigin(0.5);

    const statusText = this.add.text(x, y + 92, "", {
      fontFamily: "Arial Black",
      fontSize: "21px",
      color: "#ffd34e"
    }).setOrigin(0.5);

    const hintText = this.add.text(x, y + 132, locked ? "🔒 COMPLETA EL ANTERIOR" : "ENTER / CLIC PARA JUGAR", {
      fontFamily: "Arial",
      fontSize: "15px",
      color: locked ? "#66708e" : "#36d399"
    }).setOrigin(0.5);

    card.on("pointerdown", () => {
      const item = this.cards.find((entry) => entry.number === number);
      if (item && !item.locked) {
        this.selectIndex = number - 1;
        this.openSelected();
      }
    });

    card.on("pointerover", () => {
      const item = this.cards.find((entry) => entry.number === number);
      if (item && !item.locked) {
        this.selectIndex = number - 1;
        this.refreshCards();
      }
    });

    this.cards.push({
      card,
      numberText,
      titleText,
      subtitleText,
      statusText,
      hintText,
      number,
      accent,
      locked
    });
  }

  refreshCards() {
    this.progress = getProgress();

    this.cards.forEach((item, index) => {
      const unlocked = item.number <= this.progress.unlockedLevel;
      item.locked = !unlocked;

      item.card.setAlpha(unlocked ? 1 : 0.78);
      item.card.setScale(index === this.selectIndex && unlocked ? 1.035 : 1);
      item.card.setStrokeStyle(5, item.accent);

      const completed = this.progress.completedLevels.includes(String(item.number));

      item.statusText.setText(
        completed ? "✓ COMPLETADO" :
        unlocked ? "● DISPONIBLE" :
        "🔒 BLOQUEADO"
      );

      item.statusText.setColor(
        completed ? "#ffd34e" :
        unlocked ? "#36d399" :
        "#66708e"
      );

      item.titleText.setColor(unlocked ? "#ffffff" : "#66708e");
      item.subtitleText.setColor(unlocked ? "#b8bfd8" : "#525c78");
      item.hintText.setText(
        unlocked ? "ENTER / CLIC PARA JUGAR" : "🔒 COMPLETA EL ANTERIOR"
      );
      item.hintText.setColor(unlocked ? "#36d399" : "#66708e");
    });
  }

  moveSelection(direction) {
    const next = Phaser.Math.Clamp(
      this.selectIndex + direction,
      0,
      this.levelCount - 1
    );

    if (next === this.selectIndex) return;

    this.selectIndex = next;
    this.refreshCards();
  }

  openSelected() {
    const levelNumber = this.selectIndex + 1;

    if (levelNumber > this.progress.unlockedLevel) {
      this.showLockedMessage(levelNumber);
      return;
    }

    this.audio.unlock();

    const sceneKey = {
      1: "Level1Scene",
      2: "Level2Scene",
      3: "Level3Scene"
    }[levelNumber];

    this.scene.start(sceneKey);
  }

  showLockedMessage(levelNumber) {
    const previous = levelNumber - 1;
    const message = this.add.text(
      this.scale.width / 2,
      555,
      "Completa el Nivel " + previous + " para desbloquearlo.",
      {
        fontFamily: "Arial Black",
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "#e84d5bdd",
        padding: { left: 16, right: 16, top: 10, bottom: 10 }
      }
    ).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: message,
      alpha: 0,
      delay: 900,
      duration: 350,
      onComplete: () => message.destroy()
    });
  }
}
