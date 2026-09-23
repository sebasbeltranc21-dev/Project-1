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
    this.selectIndex = Math.min(this.progress.unlockedLevel - 1, 1);
    this.cards = [];

    this.cameras.main.setBackgroundColor("#0e1630");

    this.add.rectangle(width / 2, height / 2, width, height, 0x0e1630);
    this.add.ellipse(180, 160, 360, 220, 0x244b72, 0.55);
    this.add.ellipse(1050, 570, 500, 260, 0x421f69, 0.4);

    this.add.text(width / 2, 68, "MAPA DE AVENTURA", {
      fontFamily: "Arial Black",
      fontSize: "46px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 7
    }).setOrigin(0.5);

    this.add.text(width / 2, 125, "MUNDO 1 • LAS TIERRAS DE NOVA", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#8fe7ff",
      fontStyle: "bold",
      letterSpacing: 2
    }).setOrigin(0.5);

    this.createPath();
    this.createLevelCard(330, 350, 1, "PRADERA NEON", "Nivel inicial", 0x36d399);
    this.createLevelCard(950, 350, 2, "CAVERNAS CRISTAL", "Nivel desbloqueable", 0x8f7bff);

    this.add.text(width / 2, 620, "A/D o ←/→ para elegir • ENTER para entrar • ESC para volver • M • AUDIO", {
      fontFamily: "Arial",
      fontSize: "19px",
      color: "#b8bfd8"
    }).setOrigin(0.5);

    this.input.keyboard.on("keydown-LEFT", () => this.moveSelection(-1));
    this.input.keyboard.on("keydown-A", () => this.moveSelection(-1));
    this.input.keyboard.on("keydown-RIGHT", () => this.moveSelection(1));
    this.input.keyboard.on("keydown-D", () => this.moveSelection(1));
    this.input.keyboard.on("keydown-ENTER", () => this.openSelected());
    this.input.keyboard.on("keydown-ESC", () => this.scene.start("MainMenuScene"));
    this.input.keyboard.on("keydown-M", () => {
      this.audio.setEnabled(!this.audio.enabled);
    });

    this.refreshCards();
  }

  createPath() {
    this.add.line(640, 350, 350, 0, 930, 0, 0xc9d1e8, 0.35)
      .setLineWidth(8)
      .setDepth(1);

    this.add.circle(330, 350, 40, 0x36d399).setStrokeStyle(4, 0xffffff);
    this.add.circle(950, 350, 40, 0x8f7bff).setStrokeStyle(4, 0xffffff);
  }

  createLevelCard(x, y, number, title, subtitle, accent) {
    const locked = number > this.progress.unlockedLevel;
    const card = this.add.rectangle(x, y, 470, 350, 0x182344, 0.98)
      .setStrokeStyle(5, accent)
      .setInteractive({ useHandCursor: !locked });

    const numberText = this.add.text(x - 175, y - 135, "NIVEL " + number, {
      fontFamily: "Arial Black",
      fontSize: "23px",
      color: "#ffffff"
    });

    const titleText = this.add.text(x, y - 60, title, {
      fontFamily: "Arial Black",
      fontSize: "32px",
      color: locked ? "#66708e" : "#ffffff",
      align: "center"
    }).setOrigin(0.5);

    const subtitleText = this.add.text(x, y + 5, subtitle, {
      fontFamily: "Arial",
      fontSize: "20px",
      color: locked ? "#525c78" : "#b8bfd8",
      align: "center"
    }).setOrigin(0.5);

    const statusText = this.add.text(x, y + 92, "", {
      fontFamily: "Arial Black",
      fontSize: "24px",
      color: "#ffd34e"
    }).setOrigin(0.5);

    const hintText = this.add.text(x, y + 135, locked ? "🔒 COMPLETA EL NIVEL ANTERIOR" : "ENTER / CLIC PARA JUGAR", {
      fontFamily: "Arial",
      fontSize: "16px",
      color: locked ? "#66708e" : "#36d399"
    }).setOrigin(0.5);

    card.on("pointerdown", () => {
      if (!this.cards.find((item) => item.number === number)?.locked) {
        this.selectIndex = number - 1;
        this.openSelected();
      }
    });

    card.on("pointerover", () => {
      const currentCard = this.cards.find((item) => item.number === number);
      if (currentCard && !currentCard.locked) {
        this.selectIndex = number - 1;
        this.refreshCards();
      }
    });

    this.cards.push({ card, numberText, titleText, subtitleText, statusText, hintText, number, accent, locked });
  }

  refreshCards() {
    const updatedProgress = getProgress();
    this.progress = updatedProgress;

    this.cards.forEach((item, index) => {
      const unlocked = item.number <= this.progress.unlockedLevel;
      item.locked = !unlocked;

      item.card.setAlpha(unlocked ? 1 : 0.82);
      item.card.setScale(index === this.selectIndex && unlocked ? 1.035 : 1);
      item.card.setStrokeStyle(5, item.accent);

      const completed = this.progress.completedLevels.includes(String(item.number));
      item.statusText.setText(completed ? "✓ COMPLETADO" : unlocked ? "● DISPONIBLE" : "🔒 BLOQUEADO");
      item.statusText.setColor(completed ? "#ffd34e" : unlocked ? "#36d399" : "#66708e");
      item.titleText.setColor(unlocked ? "#ffffff" : "#66708e");
      item.subtitleText.setColor(unlocked ? "#b8bfd8" : "#525c78");
      item.hintText.setText(
        unlocked ? "ENTER / CLIC PARA JUGAR" : "🔒 COMPLETA EL NIVEL ANTERIOR"
      );
      item.hintText.setColor(unlocked ? "#36d399" : "#66708e");
    });
  }

  moveSelection(direction) {
    const next = Phaser.Math.Clamp(this.selectIndex + direction, 0, 1);
    if (next === this.selectIndex) return;

    this.selectIndex = next;
    this.refreshCards();
  }

  openSelected() {
    const levelNumber = this.selectIndex + 1;
    if (levelNumber > this.progress.unlockedLevel) {
      this.showLockedMessage();
      return;
    }

    this.audio.unlock();
    this.scene.start(levelNumber === 1 ? "Level1Scene" : "Level2Scene");
  }

  showLockedMessage() {
    const message = this.add.text(this.scale.width / 2, 560, "Completa el Nivel 1 para desbloquearlo.", {
      fontFamily: "Arial Black",
      fontSize: "21px",
      color: "#ffffff",
      backgroundColor: "#e84d5bdd",
      padding: { left: 16, right: 16, top: 10, bottom: 10 }
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: message,
      alpha: 0,
      delay: 900,
      duration: 350,
      onComplete: () => message.destroy()
    });
  }
}
