import Phaser from "phaser";

export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    PowerUp.createTextures(scene);
    super(scene, x, y, type === "speed" ? "power-speed" : "power-shield");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.type = type;
    this.body.allowGravity = false;
    this.body.immovable = true;
    this.body.moves = false;
    this.body.setCircle(18, 2, 2);
    this.setDepth(7);

    this.baseY = y;

    scene.tweens.add({
      targets: this,
      y: y - 9,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 2600,
      repeat: -1
    });
  }

  collect() {
    if (!this.active) return;

    this.body.enable = false;
    this.setActive(false);

    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scale: 1.45,
      alpha: 0,
      duration: 180,
      onComplete: () => this.destroy()
    });
  }

  static createTextures(scene) {
    if (scene.textures.exists("power-speed") && scene.textures.exists("power-shield")) {
      return;
    }

    const speed = scene.add.graphics();
    speed.fillStyle(0xff8a3d, 1);
    speed.fillCircle(20, 20, 18);
    speed.fillStyle(0xffffff, 1);
    speed.fillTriangle(10, 20, 24, 8, 21, 17);
    speed.fillTriangle(19, 31, 31, 18, 28, 27);
    speed.lineStyle(3, 0x6d3512, 1);
    speed.strokeCircle(20, 20, 17);
    speed.generateTexture("power-speed", 40, 40);
    speed.destroy();

    const shield = scene.add.graphics();
    shield.fillStyle(0x4b7bff, 1);
    shield.beginPath();
    shield.moveTo(20, 3);
    shield.lineTo(35, 9);
    shield.lineTo(33, 23);
    shield.lineTo(20, 37);
    shield.lineTo(7, 23);
    shield.lineTo(5, 9);
    shield.closePath();
    shield.fillPath();
    shield.fillStyle(0x8fe7ff, 1);
    shield.fillCircle(20, 17, 6);
    shield.lineStyle(3, 0x1f3c9b, 1);
    shield.strokeCircle(20, 20, 18);
    shield.generateTexture("power-shield", 40, 40);
    shield.destroy();
  }
}
