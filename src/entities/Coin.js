import Phaser from "phaser";

export default class Coin extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    Coin.createTexture(scene);
    super(scene, x, y, "coin");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.allowGravity = false;
    this.body.immovable = true;
    this.body.moves = false;
    this.setDepth(5);

    scene.tweens.add({
      targets: this,
      y: y - 8,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    scene.tweens.add({
      targets: this,
      scaleX: 0.45,
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  collect() {
    if (!this.active) return;

    this.body.enable = false;
    this.setActive(false);
    this.setVisible(false);

    if (this.scene) {
      this.scene.tweens.killTweensOf(this);
    }
  }

  static createTexture(scene) {
    if (scene.textures.exists("coin")) return;

    const g = scene.add.graphics();
    g.lineStyle(4, 0x9b6500, 1);
    g.fillStyle(0xffd34e, 1);
    g.fillCircle(16, 16, 13);
    g.lineStyle(3, 0xfff2a1, 1);
    g.strokeCircle(16, 16, 8);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(11, 10, 3);
    g.generateTexture("coin", 32, 32);
    g.destroy();
  }
}
