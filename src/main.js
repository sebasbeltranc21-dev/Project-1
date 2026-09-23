import Phaser from "phaser";
import BootScene from "./scenes/BootScene.js";
import MainMenuScene from "./scenes/MainMenuScene.js";
import WorldMapScene from "./scenes/WorldMapScene.js";
import Level1Scene from "./scenes/Level1Scene.js";
import Level2Scene from "./scenes/Level2Scene.js";

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: 1280,
  height: 720,
  backgroundColor: "#10152b",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1100 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
  },
  scene: [BootScene, MainMenuScene, WorldMapScene, Level1Scene, Level2Scene]
};

new Phaser.Game(config);
